import type { ProjectMaster, ShipmentRecord, DesignSchedule } from '../data/projectData';
import type { AppNotification } from '../types/notification';
import type { ProformaInvoiceRecord } from '../types/proformaInvoice';

// Helper date parser
function parseDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const s = dateStr.trim().toLowerCase();
  if (['done', 'pending', 'n/a', 'waiting cfm', 'no information', 'signed'].includes(s)) return null;
  try {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return new Date(dateStr);
      } else if (parts[2].length === 4) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
}

export function deriveProjectNotifications(
  projects: ProjectMaster[],
  shipments: ShipmentRecord[],
  designSchedules: DesignSchedule[],
  proformaInvoices: ProformaInvoiceRecord[] = []
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const now = new Date();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

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

      // 1b. 7-Day Payment Reminder (Lookahead Window)
      if (project.dueDays !== null && project.dueDays !== undefined && project.dueDays <= 7 && project.dueDays >= 0) {
        notifications.push({
          id: `NOTIF-PAY-7D-${project.projectId}`,
          type: 'PAYMENT_DUE_SOON',
          projectId: project.projectId,
          projectName: project.project,
          title: `Payment Due Within 7 Days`,
          message: `Upcoming payment milestone for ${project.project} (${project.projectId}): $${project.balanceUSD.toLocaleString()} due in ${project.dueDays} day(s).`,
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

    // 3. Shipment In Transit / Delivery Reminders & 7-Day Arrival Lookahead
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

    // 3b. 7-Day Shipment Arrival Reminder
    const etaStr = projectShipment?.eta || project.eta;
    const etaDate = parseDateString(etaStr);
    if (etaDate) {
      const diffMs = etaDate.getTime() - now.getTime();
      if (diffMs >= 0 && diffMs <= sevenDaysMs) {
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `NOTIF-SHIP-7D-${project.projectId}`,
          type: 'SHIPMENT_ARRIVING_SOON',
          projectId: project.projectId,
          projectName: project.project,
          title: `Shipment Arriving in ${diffDays} Day(s)`,
          message: `Shipment for project ${project.project} (${project.projectId}) is scheduled for port/site arrival on ${etaStr}.`,
          timestamp: new Date().toISOString(),
          read: false,
          dismissed: false,
          recipientRoles: ['Admin', 'ProjectManager', 'Client'],
        });
      }
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

    // 5. Factory Visit Reminders
    if (project.factoryVisitPlannedDate && project.factoryVisitPlannedDate.trim() !== '') {
      notifications.push({
        id: `NOTIF-FV-${project.projectId}`,
        type: 'FACTORY_VISIT',
        projectId: project.projectId,
        projectName: project.project,
        title: `Factory Visit Scheduled (${project.factoryVisitType || 'Inspection'})`,
        message: `Planned ${project.factoryVisitType || 'Mock Up'} factory visit for ${project.project} on ${project.factoryVisitPlannedDate} (${project.factoryVisitPersons || 1} visitor(s)).`,
        timestamp: new Date().toISOString(),
        read: false,
        dismissed: false,
        recipientRoles: ['Admin', 'ProjectManager', 'Client'],
      });
    }
  });

  // 6. Global Holiday & Festival Schedule Notifications
  notifications.push({
    id: `NOTIF-HOLIDAY-2025-01`,
    type: 'HOLIDAY',
    title: 'Upcoming Factory Maintenance & Public Holiday',
    message: 'Kumkang manufacturing facilities and logistics offices will operate on maintenance schedule during upcoming public holidays.',
    timestamp: new Date().toISOString(),
    read: false,
    dismissed: false,
    recipientRoles: ['Admin', 'ProjectManager', 'Client'],
  });

  notifications.push({
    id: `NOTIF-FESTIVAL-2025-01`,
    type: 'FESTIVAL',
    title: 'Annual Harvest Festival & Holiday Notice',
    message: 'Production and shipping dispatches are pre-scheduled around upcoming seasonal festival holidays. Planners have adjusted lead times accordingly.',
    timestamp: new Date().toISOString(),
    read: false,
    dismissed: false,
    recipientRoles: ['Admin', 'ProjectManager', 'Client'],
  });

  // 7. Proforma Invoice Multi-Level Approval Notifications
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
