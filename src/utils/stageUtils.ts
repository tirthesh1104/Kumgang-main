import type { ProjectMaster, DesignSchedule, ProductionRecord, ShipmentRecord } from '../data/projectData';

export type StageId =
  | 'po-approval'
  | 'loi-received'
  | 'under-design'
  | 'shell-plan-approved'
  | 'under-production'
  | 'prod-completed-awaiting-dispatch'
  | 'dispatch-completed'
  | 'site-support';

export interface StageInfo {
  id: StageId;
  title: string;
  shortTitle: string;
  count: number;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  targetPage: 'projects' | 'design' | 'production' | 'shipment' | 'delays';
  targetFilter?: string;
}

/**
 * Classify a project's PO Approval Stage (Draft, Under Review, Approval Pending, Approved, Rejected, Not Available)
 */
export function getPOApprovalStage(project: ProjectMaster): 'Approved' | 'Under Review' | 'Approval Pending' | 'Draft' | 'Rejected' | 'Not Available' {
  const status = (project.contractStatus || '').toLowerCase();
  const siteStatus = (project.currentSiteStatus || '').toLowerCase();
  const remark = (project.remark || '').toLowerCase();

  if (status === 'signed' || siteStatus.includes('signed') || project.poNumber) {
    return 'Approved';
  }
  if (status.includes('review') || siteStatus.includes('review')) {
    return 'Under Review';
  }
  if (remark.includes('awaiting') || remark.includes('pending') || status.includes('pending')) {
    return 'Approval Pending';
  }
  if (status === 'not signed' || status.includes('draft')) {
    return 'Draft';
  }
  if (status === 'cancelled' || status.includes('reject')) {
    return 'Rejected';
  }
  return 'Not Available';
}

/**
 * Check if LOI Received for project
 */
export function isLOIReceived(project: ProjectMaster): boolean {
  const siteStatus = (project.currentSiteStatus || '').toLowerCase();
  const remark = (project.remark || '').toLowerCase();
  const status = (project.contractStatus || '').toLowerCase();

  return siteStatus.includes('loi') || remark.includes('loi') || status.includes('loi');
}

/**
 * Check if project is Under Design
 */
export function isUnderDesign(project: ProjectMaster, designSchedules: DesignSchedule[]): boolean {
  if (project.designProgressPercent !== null && project.designProgressPercent !== undefined) {
    if (project.designProgressPercent > 0 && project.designProgressPercent < 100) {
      return true;
    }
  }
  const projectDesigns = designSchedules.filter(d => d.projectId === project.projectId);
  if (projectDesigns.length > 0) {
    return projectDesigns.some(d => d.status === 'In Progress' || d.status === 'Pending');
  }
  return false;
}

/**
 * Check if project has Approved Shell Plan
 */
export function isShellPlanApproved(project: ProjectMaster): boolean {
  return !!(project.shellPlanConfirmation && project.shellPlanConfirmation.trim() !== '' && !project.shellPlanConfirmation.toLowerCase().includes('pending'));
}

/**
 * Check if project is Under Production
 */
export function isUnderProduction(project: ProjectMaster, productionRecords: ProductionRecord[]): boolean {
  if (project.productionStart && !project.productionComplete) {
    return true;
  }
  const projectProds = productionRecords.filter(p => p.projectId === project.projectId);
  if (projectProds.length > 0) {
    return projectProds.some(p => (p.completionPercent || 0) > 0 && (p.completionPercent || 0) < 100);
  }
  return false;
}

/**
 * Check if Production Completed Awaiting Final Dispatch
 */
export function isProdCompletedAwaitingDispatch(
  project: ProjectMaster,
  productionRecords: ProductionRecord[],
  shipments: ShipmentRecord[]
): boolean {
  // Check if production is complete
  let prodDone = false;
  if (project.productionComplete) {
    prodDone = true;
  } else {
    const projectProds = productionRecords.filter(p => p.projectId === project.projectId);
    if (projectProds.length > 0) {
      prodDone = projectProds.every(p => (p.completionPercent || 0) >= 100);
    }
  }

  if (!prodDone) return false;

  // Check if dispatch is NOT fully delivered
  const projectShipments = shipments.filter(s => s.projectId === project.projectId);
  if (projectShipments.length === 0) return true; // Production done, no shipments yet = awaiting dispatch

  const fullyDelivered = projectShipments.every(s => s.status === 'Delivered');
  return !fullyDelivered;
}

/**
 * Check if Dispatch Completed
 */
export function isDispatchCompleted(project: ProjectMaster, shipments: ShipmentRecord[]): boolean {
  const projectShipments = shipments.filter(s => s.projectId === project.projectId);
  if (projectShipments.length === 0) return false;
  return projectShipments.some(s => s.status === 'Delivered' || s.status === 'In Transit');
}

/**
 * Check if Ongoing Support at Site
 */
export function isOngoingSiteSupport(project: ProjectMaster): boolean {
  const techSupport = (project.scopeOfTechnicalSupport || '').trim();
  const siteStatus = (project.currentSiteStatus || '').toLowerCase();

  return (
    (techSupport !== '' && !techSupport.toLowerCase().includes('na')) ||
    siteStatus.includes('site') ||
    siteStatus.includes('erection') ||
    siteStatus.includes('support')
  );
}

/**
 * Calculate Stage counts for all 8 Phase 1 stages
 */
export function calculatePhase1StageCounts(
  projects: ProjectMaster[],
  designSchedules: DesignSchedule[],
  productionRecords: ProductionRecord[],
  shipments: ShipmentRecord[]
) {
  const loiProjects = projects.filter(p => isLOIReceived(p));
  const underDesignProjects = projects.filter(p => isUnderDesign(p, designSchedules));
  const shellApprovedProjects = projects.filter(p => isShellPlanApproved(p));
  const underProdProjects = projects.filter(p => isUnderProduction(p, productionRecords));
  const awaitingDispatchProjects = projects.filter(p => isProdCompletedAwaitingDispatch(p, productionRecords, shipments));
  const dispatchDoneProjects = projects.filter(p => isDispatchCompleted(p, shipments));
  const siteSupportProjects = projects.filter(p => isOngoingSiteSupport(p));

  const poApprovedCount = projects.filter(p => getPOApprovalStage(p) === 'Approved').length;

  return {
    poApprovedCount,
    loiProjects,
    underDesignProjects,
    shellApprovedProjects,
    underProdProjects,
    awaitingDispatchProjects,
    dispatchDoneProjects,
    siteSupportProjects,
  };
}
