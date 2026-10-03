import type { ProjectMaster, ShipmentRecord, DesignSchedule } from '../data/projectData';
import type { AppNotification } from '../types/notification';
import type { ProformaInvoiceRecord } from '../types/proformaInvoice';

export function deriveProjectNotifications(
  projects: ProjectMaster[],
  shipments: ShipmentRecord[],
  designSchedules: DesignSchedule[],
  proformaInvoices: ProformaInvoiceRecord[] = []
): AppNotification[] {
  const notifications: AppNotification[] = [];

  projects.forEach(project => {
    // 1. Payment Overdue / Outstanding Balance Reminders
    if (project.contractStatus === 'Signed' && project.balanceUSD && project.balanceUSD > 0) {
      if (project.dueDays && project.dueDays > 0) {
        notifications.push({
          id: `NOTIF-PAY-${project.projectId}`,
          type: 'PAYMENT_DUE',
          projectId: project.projectId,
          projectName: project.project,
          title: `Payment Overdue (${project.dueDays} Days)`,
          message: `Project ${project.projectId} has an outstanding balance of $${project.balanceUSD.toLocaleString()} overdue by ${project.dueDays} days.`,
          timestamp: new Date().toISOString(),
          read: false,
          dismissed: false,
          recipientRoles: ['Admin', 'ProjectManager'],
        });
      }
    }

    // 2. Milestone / Approval Pending Reminders
    if (project.contractStatus === 'Signed' && (!project.shellPlanConfirmation || project.shellPlanConfirmation.toLowerCase().includes('pending'))) {
      notifications.push({
        id: `NOTIF-APP-${project.projectId}`,
        type: 'APPROVAL_REQUIRED',
        projectId: project.projectId,
        projectName: project.project,
        title: 'Shell Plan Approval Pending',
        message: `Latest approved shell plan confirmation is still pending for ${project.project} (${project.projectId}).`,
        timestamp: new Date().toISOString(),
        read: false,
        dismissed: false,
        recipientRoles: ['Admin', 'ProjectManager'],
      });
    }

    // 3. Shipment In Transit / Delivery Reminders
    const projectShipment = shipments.find(s => s.projectId === project.projectId);
    if (projectShipment && projectShipment.status === 'In Transit') {
      notifications.push({
        id: `NOTIF-SHIP-${project.projectId}`,
        type: 'SHIPMENT_PENDING',
        projectId: project.projectId,
        projectName: project.project,
        title: 'Shipment In Transit',
        message: `Container ${projectShipment.containerNumber || ''} for ${project.project} is currently in transit. ETD: ${projectShipment.etd || 'N/A'}, ETA: ${projectShipment.eta || 'N/A'}.`,
        timestamp: new Date().toISOString(),
        read: false,
        dismissed: false,
        recipientRoles: ['Admin', 'ProjectManager', 'Client'],
      });
    }

    // 4. Design Delayed Reminders
    const delayedDesigns = designSchedules.filter(d => d.projectId === project.projectId && d.status === 'Delayed');
    if (delayedDesigns.length > 0) {
      notifications.push({
        id: `NOTIF-DES-${project.projectId}`,
        type: 'DESIGN_DELAYED',
        projectId: project.projectId,
        projectName: project.project,
        title: 'Design Schedule Delayed',
        message: `${delayedDesigns.length} design drawing items are currently delayed for ${project.project}.`,
        timestamp: new Date().toISOString(),
        read: false,
        dismissed: false,
        recipientRoles: ['Admin', 'ProjectManager'],
      });
    }
  });

  // 5. Proforma Invoice Multi-Level Approval Notifications
  proformaInvoices.forEach(pi => {
    if (pi.status === 'PENDING_PM') {
      notifications.push({
        id: `NOTIF-PI-${pi.id}-PM`,
        type: 'APPROVAL_REQUIRED',
        projectId: pi.projectId,
        projectName: pi.projectName,
        title: `PI Approval: Project Manager Review Required`,
        message: `Proforma Invoice ${pi.piNumber} ($${pi.totalAmountUSD.toLocaleString()}) for ${pi.projectName} is awaiting Project Manager verification.`,
        timestamp: pi.updatedAt,
        read: false,
        dismissed: false,
        recipientRoles: ['Admin', 'ProjectManager'],
      });
    } else if (pi.status === 'PENDING_SALES_DIRECTOR') {
      notifications.push({
        id: `NOTIF-PI-${pi.id}-SD`,
        type: 'APPROVAL_REQUIRED',
        projectId: pi.projectId,
        projectName: pi.projectName,
        title: `PI Approval: Sales Director Review Required`,
        message: `Proforma Invoice ${pi.piNumber} has passed Stage 1 (PM) and is awaiting Sales Director approval.`,
        timestamp: pi.updatedAt,
        read: false,
        dismissed: false,
        recipientRoles: ['Admin', 'ProjectManager'],
      });
    } else if (pi.status === 'PENDING_MANAGING_DIRECTOR') {
      notifications.push({
        id: `NOTIF-PI-${pi.id}-MD`,
        type: 'APPROVAL_REQUIRED',
        projectId: pi.projectId,
        projectName: pi.projectName,
        title: `PI Approval: Managing Director Approval Required`,
        message: `Proforma Invoice ${pi.piNumber} has passed Stage 2 (Sales Director) and is awaiting final Executive Managing Director approval.`,
        timestamp: pi.updatedAt,
        read: false,
        dismissed: false,
        recipientRoles: ['Admin'],
      });
    } else if (pi.status === 'APPROVED') {
      notifications.push({
        id: `NOTIF-PI-${pi.id}-APPROVED`,
        type: 'APPROVAL_REQUIRED',
        projectId: pi.projectId,
        projectName: pi.projectName,
        title: `PI Approved: ${pi.piNumber}`,
        message: `Proforma Invoice ${pi.piNumber} ($${pi.totalAmountUSD.toLocaleString()}) is fully approved by all review levels.`,
        timestamp: pi.updatedAt,
        read: false,
        dismissed: false,
        recipientRoles: ['Admin', 'ProjectManager', 'Client'],
      });
    }
  });

  return notifications;
}
