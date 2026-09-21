import type {
  ActiveUserSession,
  ClientPermissions,
  ClientRecord
} from '../types/clientAccess';

// Password Hashing via Web Crypto API (SHA-256 + Salt)
export async function hashPassword(password: string): Promise<string> {
  const salt = 'KKI_SECURE_SALT_2026_v1!';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify plaintext password against stored hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === storedHash;
}

// Generate Secure Random Password
export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-=';
  const all = uppercase + lowercase + numbers + symbols;

  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = 4; i < 12; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Generate Sequential Public Client ID (e.g. KKI-CL-0001)
export function generateNextClientId(existingClients: ClientRecord[]): string {
  let maxSeq = 0;
  existingClients.forEach(c => {
    const match = c.clientId.match(/^KKI-CL-(\d+)$/i);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });
  const nextSeq = maxSeq + 1;
  return `KKI-CL-${String(nextSeq).padStart(4, '0')}`;
}

// Generate Internal Secure UUID
export function generateInternalUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'uuid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}

// Server-Side Authorization Verification Service
export interface AuthorizationRequest {
  session: ActiveUserSession | null;
  targetProjectId?: string;
  requiredPermission?: keyof ClientPermissions;
  actionType:
    | 'view_project'
    | 'edit_project'
    | 'view_internal_notes'
    | 'view_other_clients'
    | 'admin_access'
    | 'developer_ops'
    | 'download_report';
}

export interface AuthorizationResult {
  allowed: boolean;
  statusCode: number;
  message: string;
  reason?: string;
}

export function verifyServerAuthorization(req: AuthorizationRequest): AuthorizationResult {
  const { session, targetProjectId, requiredPermission, actionType } = req;

  // 1. Is user authenticated?
  if (!session || !session.token) {
    return {
      allowed: false,
      statusCode: 401,
      message: 'ACCESS DENIED: Unauthenticated request. Authentication required.',
      reason: 'No active session or invalid token found.'
    };
  }

  const { role, permissions, assignedProjects } = session;

  // 2. Role Check & Special Access Rules
  if (role === 'Admin') {
    return { allowed: true, statusCode: 200, message: 'Authorized: Admin privileges granted.' };
  }

  if (role === 'ProjectManager') {
    if (actionType === 'developer_ops') {
      return {
        allowed: false,
        statusCode: 403,
        message: 'ACCESS DENIED: Project Managers do not have Developer access.',
        reason: 'Developer operations are restricted to technical Developer accounts.'
      };
    }
    return { allowed: true, statusCode: 200, message: 'Authorized: Project Manager access.' };
  }

  if (role === 'Developer') {
    // Developer access is restricted to technical operations by default unless explicit business permission is granted
    if (actionType === 'developer_ops') {
      return { allowed: true, statusCode: 200, message: 'Authorized: Developer technical operations.' };
    }
    if (actionType === 'edit_project' || actionType === 'admin_access') {
      if (permissions && permissions.editProjectData) {
        return { allowed: true, statusCode: 200, message: 'Authorized: Developer with explicit business edit permission.' };
      }
      return {
        allowed: false,
        statusCode: 403,
        message: 'ACCESS DENIED: Developer account lacks explicit business data editing permission.',
        reason: 'Technical Developer role cannot mutate business data without explicit authorization.'
      };
    }
    return { allowed: true, statusCode: 200, message: 'Authorized: Developer read access.' };
  }

  // 3. Client Role Access Verification
  if (role === 'Client') {
    // Client must never access Admin area, Developer Ops, Internal Notes, or Other Clients
    if (actionType === 'admin_access' || actionType === 'developer_ops') {
      return {
        allowed: false,
        statusCode: 403,
        message: 'ACCESS DENIED: Client accounts cannot access Administration or Developer areas.',
        reason: 'Forbidden endpoint for Client role.'
      };
    }

    if (actionType === 'view_other_clients') {
      if (!permissions?.viewOtherClients) {
        return {
          allowed: false,
          statusCode: 403,
          message: 'ACCESS DENIED: Client is not authorized to view other client accounts.',
          reason: 'Permission viewOtherClients is disabled.'
        };
      }
    }

    if (actionType === 'view_internal_notes') {
      if (!permissions?.viewInternalNotes) {
        return {
          allowed: false,
          statusCode: 403,
          message: 'ACCESS DENIED: Internal notes are hidden for client accounts.',
          reason: 'Permission viewInternalNotes is disabled.'
        };
      }
    }

    if (actionType === 'edit_project') {
      if (!permissions?.editProjectData) {
        return {
          allowed: false,
          statusCode: 403,
          message: 'ACCESS DENIED: Clients are strictly read-only. Data modification is forbidden.',
          reason: 'Permission editProjectData is disabled by security policy.'
        };
      }
    }

    // 4. Verify Project Assignment
    if (targetProjectId) {
      const isAssigned = (assignedProjects || []).includes(targetProjectId);
      if (!isAssigned) {
        return {
          allowed: false,
          statusCode: 403,
          message: `ACCESS DENIED: Project ${targetProjectId} is not assigned to your account.`,
          reason: `Client is authorized only for assigned projects: [${(assignedProjects || []).join(', ')}].`
        };
      }
    }

    // 5. Verify Specific Permission Check
    if (requiredPermission && permissions) {
      if (!permissions[requiredPermission]) {
        return {
          allowed: false,
          statusCode: 403,
          message: `ACCESS DENIED: Required permission '${requiredPermission}' is not granted for your client account.`,
          reason: `Permission '${requiredPermission}' is set to false.`
        };
      }
    }

    return { allowed: true, statusCode: 200, message: 'Authorized: Client access verified.' };
  }

  return { allowed: false, statusCode: 403, message: 'ACCESS DENIED: Invalid user role.' };
}
