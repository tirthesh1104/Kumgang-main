export type UserRole = 'Admin' | 'ProjectManager' | 'Developer' | 'Client';

export type AccountStatus = 'Active' | 'Inactive' | 'Suspended' | 'Expired';

export interface ClientPermissions {
  viewAssignedProject: boolean;
  viewProjectProgress: boolean;
  viewChecklist: boolean;
  viewManufacturingSchedule: boolean;
  viewProductionSchedule: boolean;
  viewShipmentVesselSchedule: boolean;
  viewFuturePlans: boolean;
  viewApprovedReports: boolean;
  downloadApprovedReports: boolean;
  editProjectData: boolean;
  viewInternalNotes: boolean;
  viewOtherClients: boolean;
  accessAdministration: boolean;
}

export const DEFAULT_CLIENT_PERMISSIONS: ClientPermissions = {
  viewAssignedProject: true,
  viewProjectProgress: true,
  viewChecklist: true,
  viewManufacturingSchedule: true,
  viewProductionSchedule: true,
  viewShipmentVesselSchedule: true,
  viewFuturePlans: true,
  viewApprovedReports: true,
  downloadApprovedReports: true,
  editProjectData: false,
  viewInternalNotes: false,
  viewOtherClients: false,
  accessAdministration: false,
};

export interface AccessHistoryRecord {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string;
  details: string;
  clientId?: string;
  projectId?: string;
  previousValue?: string;
  newValue?: string;
}

export interface ClientRecord {
  internalId: string; // Secure internal UUID
  clientId: string;   // Public ID e.g. KKI-CL-0001
  companyName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  country: string;
  companyAddress: string;
  username: string;
  passwordHash: string; // Hashed password
  requirePasswordChange: boolean;
  twoFactorEnabled: boolean;
  assignedCountry: string;
  assignedFolder: string;
  assignedProjects: string[]; // List of projectIds (e.g. ['IND-001'])
  allowMultipleProjects: boolean;
  permissions: ClientPermissions;
  accountStatus: AccountStatus;
  accessStartDate: string;
  accessExpiryDate: string;
  accountNotes: string;
  createdAt: string;
  lastLoginAt?: string | null;
  accessHistory: AccessHistoryRecord[];
}

export interface ActiveUserSession {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
  clientId?: string; // Set if role is Client
  permissions?: ClientPermissions;
  assignedProjects?: string[];
  token: string;
  loginTime: string;
}
