export type NotificationType =
  | 'PAYMENT_DUE'
  | 'MILESTONE_OVERDUE'
  | 'DESIGN_DELAYED'
  | 'SHIPMENT_PENDING'
  | 'APPROVAL_REQUIRED'
  | 'SITE_PROGRESS_UPDATE'
  | 'SYSTEM_ALERT';

export interface AppNotification {
  id: string;
  type: NotificationType;
  projectId?: string;
  projectName?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  dismissed: boolean;
  recipientRoles?: ('Admin' | 'ProjectManager' | 'Client' | 'Developer')[];
}
