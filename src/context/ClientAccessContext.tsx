import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ActiveUserSession,
  ClientPermissions,
  ClientRecord,
  UserRole,
  AccountStatus,
  AccessHistoryRecord
} from '../types/clientAccess';
import { DEFAULT_CLIENT_PERMISSIONS } from '../types/clientAccess';
import {
  generateNextClientId,
  generateInternalUUID,
  hashPassword,
  verifyPassword,
  verifyServerAuthorization,
  type AuthorizationRequest,
  type AuthorizationResult
} from '../utils/securityServer';

const STORAGE_CLIENTS_KEY = 'kumkang_client_register_v1';
const STORAGE_SESSION_KEY = 'kumkang_active_session_v1';
const STORAGE_CLIENT_LOGS_KEY = 'kumkang_client_audit_logs_v1';

export interface RegisterClientInput {
  companyName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  country: string;
  companyAddress: string;
  password: string;
  requirePasswordChange: boolean;
  twoFactorEnabled: boolean;
  assignedCountry: string;
  assignedFolder: string;
  assignedProjects: string[];
  allowMultipleProjects: boolean;
  permissions: ClientPermissions;
  accountStatus: AccountStatus;
  accessStartDate: string;
  accessExpiryDate: string;
  accountNotes: string;
}

interface ClientAccessContextType {
  clients: ClientRecord[];
  activeSession: ActiveUserSession;
  clientAuditLogs: AccessHistoryRecord[];
  
  // Role & Session Handlers
  switchRole: (role: UserRole, clientToSimulate?: ClientRecord) => void;
  loginClient: (usernameOrClientId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Client CRUD & Management
  registerClient: (input: RegisterClientInput) => Promise<{ success: boolean; client?: ClientRecord; error?: string }>;
  updateClient: (internalId: string, changes: Partial<ClientRecord>) => Promise<{ success: boolean; error?: string }>;
  updateClientPermissions: (internalId: string, permissions: ClientPermissions) => Promise<{ success: boolean; error?: string }>;
  updateClientStatus: (internalId: string, status: AccountStatus) => Promise<{ success: boolean; error?: string }>;
  resetClientPassword: (internalId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  getClientByInternalId: (internalId: string) => ClientRecord | undefined;
  getClientByPublicId: (clientId: string) => ClientRecord | undefined;

  // Security Authorization Verification Gateway
  authorizeAction: (req: Omit<AuthorizationRequest, 'session'>) => AuthorizationResult;
}

const ClientAccessContext = createContext<ClientAccessContextType | null>(null);

function formatTimestamp(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
}

const DEFAULT_ADMIN_SESSION: ActiveUserSession = {
  userId: 'ADMIN-001',
  username: 'admin',
  displayName: 'Prakash Shinde (Admin)',
  role: 'Admin',
  token: 'admin-token-session-live',
  loginTime: formatTimestamp(),
};

export function ClientAccessProvider({ children }: { children: React.ReactNode }) {
  // Initialize clients register from localStorage (or empty array if none)
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLIENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse client register from localStorage', e);
    }
    return [];
  });

  // Active Session (Default: Admin)
  const [activeSession, setActiveSession] = useState<ActiveUserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.userId && parsed.role) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ADMIN_SESSION;
  });

  // Client Security Audit Logs
  const [clientAuditLogs, setClientAuditLogs] = useState<AccessHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLIENT_LOGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Persist clients when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving clients to localStorage', e);
    }
  }, [clients]);

  // Persist active session when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(activeSession));
    } catch (e) {
      console.error('Error saving active session to localStorage', e);
    }
  }, [activeSession]);

  // Persist audit logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLIENT_LOGS_KEY, JSON.stringify(clientAuditLogs));
    } catch (e) {
      console.error('Error saving client audit logs', e);
    }
  }, [clientAuditLogs]);

  const addAuditRecord = useCallback((
    action: string,
    details: string,
    clientId?: string,
    projectId?: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const record: AccessHistoryRecord = {
      id: `SEC-LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: formatTimestamp(),
      userId: activeSession.username || activeSession.userId,
      userRole: activeSession.role,
      action,
      details,
      clientId,
      projectId,
      previousValue,
      newValue,
    };
    setClientAuditLogs(prev => [record, ...prev]);

    // Also attach to client's individual access history if client specified
    if (clientId) {
      setClients(prev =>
        prev.map(c => {
          if (c.clientId === clientId || c.internalId === clientId) {
            return {
              ...c,
              accessHistory: [record, ...(c.accessHistory || [])]
            };
          }
          return c;
        })
      );
    }
  }, [activeSession]);

  // Register a New Client
  const registerClient = useCallback(async (input: RegisterClientInput) => {
    if (!input.companyName || !input.contactPerson || !input.email) {
      return { success: false, error: 'Company Name, Contact Person, and Email are required fields.' };
    }

    const publicClientId = generateNextClientId(clients);
    const internalUuid = generateInternalUUID();
    const hashedPassword = await hashPassword(input.password || 'Temp1234!');

    const newClient: ClientRecord = {
      internalId: internalUuid,
      clientId: publicClientId,
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      email: input.email,
      mobile: input.mobile || '',
      country: input.country || '',
      companyAddress: input.companyAddress || '',
      username: publicClientId, // Login Username defaults to Client ID
      passwordHash: hashedPassword,
      requirePasswordChange: input.requirePasswordChange ?? true,
      twoFactorEnabled: input.twoFactorEnabled ?? false,
      assignedCountry: input.assignedCountry || '',
      assignedFolder: input.assignedFolder || '',
      assignedProjects: input.assignedProjects || [],
      allowMultipleProjects: input.allowMultipleProjects ?? true,
      permissions: input.permissions || DEFAULT_CLIENT_PERMISSIONS,
      accountStatus: input.accountStatus || 'Active',
      accessStartDate: input.accessStartDate || new Date().toISOString().split('T')[0],
      accessExpiryDate: input.accessExpiryDate || 'No Expiry',
      accountNotes: input.accountNotes || '',
      createdAt: formatTimestamp(),
      accessHistory: [],
    };

    setClients(prev => [newClient, ...prev]);

    addAuditRecord(
      'REGISTER_CLIENT',
      `Registered new Client ${publicClientId} (${input.companyName}) with ${input.assignedProjects.length} assigned project(s).`,
      publicClientId,
      input.assignedProjects[0]
    );

    return { success: true, client: newClient };
  }, [clients, addAuditRecord]);

  // Update Existing Client
  const updateClient = useCallback(async (internalId: string, changes: Partial<ClientRecord>) => {
    const existing = clients.find(c => c.internalId === internalId);
    if (!existing) return { success: false, error: 'Client record not found.' };

    setClients(prev =>
      prev.map(c => (c.internalId === internalId ? { ...c, ...changes } : c))
    );

    addAuditRecord(
      'UPDATE_CLIENT',
      `Updated details for Client ${existing.clientId} (${existing.companyName}).`,
      existing.clientId
    );

    return { success: true };
  }, [clients, addAuditRecord]);

  // Update Client Permissions
  const updateClientPermissions = useCallback(async (internalId: string, permissions: ClientPermissions) => {
    const existing = clients.find(c => c.internalId === internalId);
    if (!existing) return { success: false, error: 'Client record not found.' };

    setClients(prev =>
      prev.map(c => (c.internalId === internalId ? { ...c, permissions } : c))
    );

    addAuditRecord(
      'UPDATE_PERMISSIONS',
      `Updated access permissions for Client ${existing.clientId} (${existing.companyName}).`,
      existing.clientId
    );

    return { success: true };
  }, [clients, addAuditRecord]);

  // Update Account Status (Active, Suspended, etc.)
  const updateClientStatus = useCallback(async (internalId: string, status: AccountStatus) => {
    const existing = clients.find(c => c.internalId === internalId);
    if (!existing) return { success: false, error: 'Client record not found.' };

    const oldStatus = existing.accountStatus;
    setClients(prev =>
      prev.map(c => (c.internalId === internalId ? { ...c, accountStatus: status } : c))
    );

    addAuditRecord(
      'STATUS_CHANGE',
      `Changed Client ${existing.clientId} status from ${oldStatus} to ${status}.`,
      existing.clientId,
      undefined,
      oldStatus,
      status
    );

    return { success: true };
  }, [clients, addAuditRecord]);

  // Reset Client Password
  const resetClientPassword = useCallback(async (internalId: string, newPassword: string) => {
    const existing = clients.find(c => c.internalId === internalId);
    if (!existing) return { success: false, error: 'Client record not found.' };

    const newHash = await hashPassword(newPassword);

    setClients(prev =>
      prev.map(c => (c.internalId === internalId ? { ...c, passwordHash: newHash, requirePasswordChange: true } : c))
    );

    addAuditRecord(
      'RESET_PASSWORD',
      `Reset password for Client ${existing.clientId} (${existing.companyName}).`,
      existing.clientId
    );

    return { success: true };
  }, [clients, addAuditRecord]);

  // Client Authenticated Login
  const loginClient = useCallback(async (usernameOrClientId: string, password: string) => {
    const query = usernameOrClientId.trim().toLowerCase();
    const client = clients.find(
      c => c.clientId.toLowerCase() === query || c.username.toLowerCase() === query || c.email.toLowerCase() === query
    );

    if (!client) {
      addAuditRecord('LOGIN_FAILED', `Failed login attempt for username '${usernameOrClientId}' (Account not found).`);
      return { success: false, error: 'Invalid Client ID / Username or Password.' };
    }

    if (client.accountStatus !== 'Active') {
      addAuditRecord(
        'LOGIN_BLOCKED',
        `Blocked login attempt for Client ${client.clientId} (Account status is ${client.accountStatus}).`,
        client.clientId
      );
      return {
        success: false,
        error: `Account is currently ${client.accountStatus.toUpperCase()}. Please contact administration.`
      };
    }

    const isValid = await verifyPassword(password, client.passwordHash);
    if (!isValid) {
      addAuditRecord(
        'LOGIN_FAILED',
        `Failed password verification for Client ${client.clientId}.`,
        client.clientId
      );
      return { success: false, error: 'Invalid Client ID / Username or Password.' };
    }

    // Success -> Create Session for Client
    const clientSession: ActiveUserSession = {
      userId: client.internalId,
      username: client.username,
      displayName: `${client.companyName} (${client.contactPerson})`,
      role: 'Client',
      clientId: client.clientId,
      permissions: client.permissions,
      assignedProjects: client.assignedProjects,
      token: `client-token-${Date.now()}-${generateInternalUUID()}`,
      loginTime: formatTimestamp(),
    };

    setActiveSession(clientSession);

    // Update lastLoginAt
    setClients(prev =>
      prev.map(c => (c.internalId === client.internalId ? { ...c, lastLoginAt: formatTimestamp() } : c))
    );

    addAuditRecord(
      'CLIENT_LOGIN',
      `Client ${client.clientId} (${client.companyName}) logged in successfully.`,
      client.clientId
    );

    return { success: true };
  }, [clients, addAuditRecord]);

  // Switch Role / Mode (Admin, ProjectManager, Developer, Client)
  const switchRole = useCallback((role: UserRole, clientToSimulate?: ClientRecord) => {
    if (role === 'Admin') {
      setActiveSession(DEFAULT_ADMIN_SESSION);
      addAuditRecord('ROLE_SWITCH', 'Switched user role to Administrator.');
    } else if (role === 'ProjectManager') {
      setActiveSession({
        userId: 'PM-001',
        username: 'project_manager',
        displayName: 'Project Manager (KKI)',
        role: 'ProjectManager',
        token: 'pm-token-live',
        loginTime: formatTimestamp(),
      });
      addAuditRecord('ROLE_SWITCH', 'Switched user role to Project Manager.');
    } else if (role === 'Developer') {
      setActiveSession({
        userId: 'DEV-001',
        username: 'dev_tech',
        displayName: 'Technical Developer',
        role: 'Developer',
        token: 'dev-token-live',
        loginTime: formatTimestamp(),
      });
      addAuditRecord('ROLE_SWITCH', 'Switched user role to Developer.');
    } else if (role === 'Client' && clientToSimulate) {
      setActiveSession({
        userId: clientToSimulate.internalId,
        username: clientToSimulate.username,
        displayName: `${clientToSimulate.companyName} (${clientToSimulate.contactPerson})`,
        role: 'Client',
        clientId: clientToSimulate.clientId,
        permissions: clientToSimulate.permissions,
        assignedProjects: clientToSimulate.assignedProjects,
        token: `sim-client-token-${Date.now()}`,
        loginTime: formatTimestamp(),
      });
      addAuditRecord(
        'ROLE_SWITCH',
        `Switched user role to Client mode simulating ${clientToSimulate.clientId} (${clientToSimulate.companyName}).`,
        clientToSimulate.clientId
      );
    }
  }, [addAuditRecord]);

  // Logout
  const logout = useCallback(() => {
    addAuditRecord('LOGOUT', `User ${activeSession.displayName} logged out.`);
    setActiveSession(DEFAULT_ADMIN_SESSION);
  }, [activeSession, addAuditRecord]);

  // Security Verification Gateway
  const authorizeAction = useCallback((req: Omit<AuthorizationRequest, 'session'>): AuthorizationResult => {
    return verifyServerAuthorization({ ...req, session: activeSession });
  }, [activeSession]);

  const getClientByInternalId = useCallback((id: string) => {
    return clients.find(c => c.internalId === id);
  }, [clients]);

  const getClientByPublicId = useCallback((id: string) => {
    return clients.find(c => c.clientId === id);
  }, [clients]);

  const value = useMemo(() => ({
    clients,
    activeSession,
    clientAuditLogs,
    switchRole,
    loginClient,
    logout,
    registerClient,
    updateClient,
    updateClientPermissions,
    updateClientStatus,
    resetClientPassword,
    getClientByInternalId,
    getClientByPublicId,
    authorizeAction,
  }), [
    clients,
    activeSession,
    clientAuditLogs,
    switchRole,
    loginClient,
    logout,
    registerClient,
    updateClient,
    updateClientPermissions,
    updateClientStatus,
    resetClientPassword,
    getClientByInternalId,
    getClientByPublicId,
    authorizeAction,
  ]);

  return <ClientAccessContext.Provider value={value}>{children}</ClientAccessContext.Provider>;
}

export function useClientAccess() {
  const ctx = useContext(ClientAccessContext);
  if (!ctx) throw new Error('useClientAccess must be used within ClientAccessProvider');
  return ctx;
}
