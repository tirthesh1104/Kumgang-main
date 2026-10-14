import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  // `false` until stored-session validation completes. While false, no
  // dashboard may render — the Login Portal is the screen shown.
  isSessionReady: boolean;
  
  // Role & Session Handlers
  switchRole: (role: UserRole, clientToSimulate?: any) => void;
  loginClient: (usernameOrClientId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  recordStaffLogin: (identifier: string, role: 'Admin' | 'ProjectManager') => void;
  logout: () => void;

  // Client CRUD & Management
  registerClient: (input: RegisterClientInput) => Promise<{ success: boolean; client?: ClientRecord; error?: string }>;
  updateClient: (internalId: string, changes: Partial<ClientRecord>) => Promise<{ success: boolean; error?: string }>;
  updateClientPermissions: (internalId: string, permissions: ClientPermissions) => Promise<{ success: boolean; error?: string }>;
  updateClientStatus: (internalId: string, status: AccountStatus) => Promise<{ success: boolean; error?: string }>;
  resetClientPassword: (internalId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  getClientByInternalId: (internalId: string) => ClientRecord | undefined;
  getClientByPublicId: (clientId: string) => ClientRecord | undefined;

  // Portal View Control
  isPortalOpen: boolean;
  setIsPortalOpen: (open: boolean) => void;
  portalSource: 'landing' | 'dashboard';
  openPortalFromDashboard: () => void;

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

const DEFAULT_GUEST_SESSION: ActiveUserSession = {
  userId: 'anonymous',
  username: 'guest',
  displayName: 'Guest (Unauthenticated)',
  role: 'None',
  permissions: DEFAULT_CLIENT_PERMISSIONS,
  assignedProjects: [],
  token: '',
  loginTime: '',
};

// A stored session is NEVER trusted on shape alone: the token must be present
// and non-empty, otherwise the visitor stays unauthenticated on the portal.
function isValidStoredSession(parsed: any): parsed is ActiveUserSession {
  if (!parsed || typeof parsed !== 'object') return false;
  if (!parsed.userId || !parsed.role) return false;
  if (parsed.role === 'None') return false;
  if (!['Admin', 'ProjectManager', 'Developer', 'Client'].includes(parsed.role)) return false;
  if (typeof parsed.token !== 'string' || parsed.token.trim() === '') return false;
  if (parsed.role === 'Client') {
    if (!parsed.clientId) return false;
    if (!Array.isArray(parsed.assignedProjects)) return false;
  }
  return true;
}

// Reads the persisted client register without touching React state — used by
// the one-time session validator so a Client session is only restored when its
// account still exists and is Active.
function loadPersistedClients(): ClientRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as ClientRecord[];
    }
  } catch {
    // corrupted register → treat as empty; session stays unauthenticated
  }
  return [];
}

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

  // Active Session (Default: Unauthenticated — portal shows first until a real login)
  const [activeSession, setActiveSession] = useState<ActiveUserSession>(DEFAULT_GUEST_SESSION);
  // `false` until stored-session validation completes — AppLayout gates on this
  // so no dashboard ever flickers before authentication is checked.
  const [isSessionReady, setIsSessionReady] = useState(false);

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

  // Portal Landing Page Open State — default OPEN: the Login Portal is the first
  // screen. Only a validated session (restored or fresh login) may close it.
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(true);

  // Portal source: 'landing' (initial / after logout) | 'dashboard' (opened from topbar)
  const [portalSource, setPortalSource] = useState<'landing' | 'dashboard'>('landing');

  // Skip saving the guest session after logout (so refresh stays on landing page).
  // Initialized `true` so the very first render (guest session) never writes a
  // session token for an unauthenticated visitor.
  const skipSaveRef = useRef(true);

  // Persist clients when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving clients to localStorage', e);
    }
  }, [clients]);

  // Persist active session whenever it changes (unless intentionally skipped).
  // The guest/unauthenticated session is never persisted.
  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (activeSession.role === 'None' || !activeSession.token) return;
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(activeSession));
    } catch (e) {
      console.error('Error saving active session to localStorage', e);
    }
  }, [activeSession]);

  // Validate any stored session exactly once on load. A stored role alone is
  // NEVER proof of authentication: the token must be present and non-empty,
  // and a Client session must reference its clientId + assigned projects.
  // Valid sessions are restored (portal closes, dashboard opens); anything
  // else is discarded and the Login Portal stays as the first screen.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isValidStoredSession(parsed)) {
          if (parsed.role === 'Client') {
            const storedClients = loadPersistedClients();
            const match = storedClients.find(c => c.clientId === parsed.clientId);
            if (match && match.accountStatus === 'Active') {
              setActiveSession({
                ...parsed,
                assignedProjects: match.assignedProjects,
                permissions: match.permissions,
                displayName: `${match.companyName} (${match.contactPerson || 'Authorized Client'})`,
              });
              setIsPortalOpen(false);
              setPortalSource('landing');
            } else {
              try { localStorage.removeItem(STORAGE_SESSION_KEY); } catch { /* ignore */ }
              setIsPortalOpen(true);
              setPortalSource('landing');
            }
          } else {
            setActiveSession(parsed);
            setIsPortalOpen(false);
            setPortalSource('landing');
          }
        } else {
          try { localStorage.removeItem(STORAGE_SESSION_KEY); } catch { /* ignore */ }
          setIsPortalOpen(true);
          setPortalSource('landing');
        }
      } else {
        setIsPortalOpen(true);
        setPortalSource('landing');
      }
    } catch {
      try { localStorage.removeItem(STORAGE_SESSION_KEY); } catch { /* ignore */ }
      setIsPortalOpen(true);
      setPortalSource('landing');
    } finally {
      setIsSessionReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Central role gate for every credential-management mutation below. Each write
  // passes through the authorization policy in securityServer.ts, so enforcement
  // does not depend on which UI controls happen to be visible for a role.
  // NOTE: this app uses simulated/local auth (localStorage sessions, no backend);
  // this is the application-level gate, not a network boundary.
  const authorizeCredentialAction = useCallback((
    actionType: Extract<AuthorizationRequest['actionType'], 'credential_manage' | 'credential_admin'>
  ): AuthorizationResult => verifyServerAuthorization({ session: activeSession, actionType }),
  [activeSession]);

  // Register a New Client
  const registerClient = useCallback(async (input: RegisterClientInput) => {
    const authz = authorizeCredentialAction('credential_manage');
    if (!authz.allowed) {
      addAuditRecord('AUTHZ_DENIED', `Blocked client registration attempt: ${authz.message}`);
      return { success: false, error: authz.message };
    }

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
  }, [clients, addAuditRecord, authorizeCredentialAction]);

  // Update Existing Client
  const updateClient = useCallback(async (internalId: string, changes: Partial<ClientRecord>) => {
    const authz = authorizeCredentialAction('credential_manage');
    if (!authz.allowed) {
      addAuditRecord('AUTHZ_DENIED', `Blocked client record update: ${authz.message}`);
      return { success: false, error: authz.message };
    }

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
  }, [clients, addAuditRecord, authorizeCredentialAction]);

  // Update Client Permissions
  const updateClientPermissions = useCallback(async (internalId: string, permissions: ClientPermissions) => {
    const authz = authorizeCredentialAction('credential_admin');
    if (!authz.allowed) {
      addAuditRecord('AUTHZ_DENIED', `Blocked client permission change: ${authz.message}`);
      return { success: false, error: authz.message };
    }

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
  }, [clients, addAuditRecord, authorizeCredentialAction]);

  // Update Account Status (Active, Suspended, etc.)
  const updateClientStatus = useCallback(async (internalId: string, status: AccountStatus) => {
    const authz = authorizeCredentialAction('credential_admin');
    if (!authz.allowed) {
      addAuditRecord('AUTHZ_DENIED', `Blocked account status change to ${status}: ${authz.message}`);
      return { success: false, error: authz.message };
    }

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
  }, [clients, addAuditRecord, authorizeCredentialAction]);

  // Reset Client Password
  const resetClientPassword = useCallback(async (internalId: string, newPassword: string) => {
    const authz = authorizeCredentialAction('credential_manage');
    if (!authz.allowed) {
      addAuditRecord('AUTHZ_DENIED', `Blocked password reset: ${authz.message}`);
      return { success: false, error: authz.message };
    }

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
  }, [clients, addAuditRecord, authorizeCredentialAction]);

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
    // Close the portal so the authorized Client dashboard opens.
    setIsPortalOpen(false);
    setPortalSource('landing');

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

  // Record a genuine successful Staff / Project-Manager (Plant Operations) login.
  // Uses the identifier the user actually entered (Employee No. / Supervisor ID / Email)
  // so the Developer "Access Records" section reflects real, stored authentication events.
  const recordStaffLogin = useCallback((identifier: string, role: 'Admin' | 'ProjectManager') => {
    const record: AccessHistoryRecord = {
      id: `SEC-LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: formatTimestamp(),
      userId: identifier,
      userRole: role,
      action: 'LOGIN_SUCCESS',
      details: role === 'Admin'
        ? `Staff login successful for ${identifier}.`
        : `Plant Operations / Project Manager login successful for ${identifier}.`,
    };
    setClientAuditLogs(prev => [record, ...prev]);
  }, []);

  // Switch Role / Mode (Admin, ProjectManager, Developer, Client)
  // SIMULATED evaluation login for Staff / PM / Developer (no backend
  // credential verification — documented limitation). Always closes the portal
  // and opens the authorized dashboard for the chosen role.
  const switchRole = useCallback((role: UserRole, clientToSimulate?: ClientRecord) => {
    if (role === 'None') {
      skipSaveRef.current = true;
      try {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      } catch {
        // ignore
      }
      setActiveSession(DEFAULT_GUEST_SESSION);
      setPortalSource('landing');
      setIsPortalOpen(true);
      return;
    }
    setPortalSource('landing');
    setIsPortalOpen(false);
    if (role === 'Admin') {
      setActiveSession({
        userId: 'USR-001',
        username: 'admin',
        displayName: 'KKI Administrator',
        role: 'Admin',
        permissions: DEFAULT_CLIENT_PERMISSIONS,
        assignedProjects: [],
        token: `admin-session-token-${Date.now()}`,
        loginTime: formatTimestamp(),
      });
      addAuditRecord('ROLE_SWITCH', 'Switched user role to Administrator.');
    } else if (role === 'ProjectManager') {
      setActiveSession({
        userId: 'PM-001',
        username: 'project_manager',
        displayName: 'Project Manager (KKI)',
        role: 'ProjectManager',
        permissions: DEFAULT_CLIENT_PERMISSIONS,
        assignedProjects: [],
        token: `pm-session-token-${Date.now()}`,
        loginTime: formatTimestamp(),
      });
      addAuditRecord('ROLE_SWITCH', 'Switched user role to Project Manager.');
    } else if (role === 'Developer') {
      setActiveSession({
        userId: 'DEV-001',
        username: 'dev_tech',
        displayName: 'Technical Developer',
        role: 'Developer',
        permissions: DEFAULT_CLIENT_PERMISSIONS,
        assignedProjects: [],
        token: `dev-session-token-${Date.now()}`,
        loginTime: formatTimestamp(),
      });
      addAuditRecord('ROLE_SWITCH', 'Switched user role to Developer.');
    } else if (role === 'Client' && clientToSimulate) {
      const assigned = clientToSimulate.assignedProjects && clientToSimulate.assignedProjects.length > 0
        ? clientToSimulate.assignedProjects
        : [(clientToSimulate as any).projectId].filter(Boolean);

      const clientSession: ActiveUserSession = {
        userId: clientToSimulate.internalId || (clientToSimulate as any).userId || `CLI-${Date.now()}`,
        username: clientToSimulate.username || 'client',
        displayName: clientToSimulate.companyName
          ? `${clientToSimulate.companyName} (${clientToSimulate.contactPerson || 'Authorized Client'})`
          : ((clientToSimulate as any).displayName || 'Authorized Client'),
        role: 'Client',
        clientId: clientToSimulate.clientId || (clientToSimulate as any).userId,
        permissions: clientToSimulate.permissions || DEFAULT_CLIENT_PERMISSIONS,
        assignedProjects: assigned,
        token: `client-session-token-${Date.now()}`,
        loginTime: formatTimestamp(),
      };

      setActiveSession(clientSession);
      try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(clientSession));
      } catch {
        // ignore
      }

      addAuditRecord(
        'ROLE_SWITCH',
        `Switched user role to Client mode for ${clientSession.displayName}.`,
        clientSession.clientId
      );
    }
  }, [addAuditRecord]);

  // Logout - strictly clears the session and returns to the unauthenticated
  // landing state. Business data (clients, audit logs) is preserved.
  const logout = useCallback(() => {
    addAuditRecord('LOGOUT', `User ${activeSession.displayName} logged out.`);
    skipSaveRef.current = true;
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }
    setActiveSession(DEFAULT_GUEST_SESSION);
    setPortalSource('landing');
    setIsPortalOpen(true);
  }, [activeSession, addAuditRecord]);

  // Open the portal from the dashboard topbar (keep the existing session, allow close)
  const openPortalFromDashboard = useCallback(() => {
    setPortalSource('dashboard');
    setIsPortalOpen(true);
  }, []);

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
    isSessionReady,
    isPortalOpen,
    setIsPortalOpen,
    portalSource,
    openPortalFromDashboard,
    switchRole,
    loginClient,
    recordStaffLogin,
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
    isSessionReady,
    isPortalOpen,
    portalSource,
    openPortalFromDashboard,
    switchRole,
    loginClient,
    recordStaffLogin,
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
