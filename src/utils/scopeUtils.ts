import type { ProjectMaster } from '../data/projectData';

export type POStatus = 'Signed PO' | 'Not Signed PO' | 'Under Review PO' | 'Upcoming PO';

/**
 * Determine the vendor company / scope of a project.
 * Uses explicit `vendorCompany` if available.
 * Defaults canonical initial dataset into KKV and KKI based on commercial contract scope.
 */
export function getProjectScope(project: ProjectMaster): string {
  if (project.vendorCompany && project.vendorCompany.trim()) {
    return project.vendorCompany.trim().toUpperCase();
  }

  // Pre-configured commercial contract scope mapping for existing dataset
  const kkvClients = ['TOTAL ENVIROMENT', 'BREN', 'TRIFECTA', 'KANWARJI  CONSTRUCTION'];
  if (kkvClients.includes(project.customer)) {
    return 'KKV';
  }

  return 'KKI';
}

/**
 * Derive the PO status for a project among the four canonical statuses:
 * 1. Signed PO
 * 2. Not Signed PO
 * 3. Under Review PO
 * 4. Upcoming PO
 */
export function getProjectPOStatus(project: ProjectMaster): POStatus {
  const currentSiteStatus = (project.currentSiteStatus || '').toLowerCase();
  if (currentSiteStatus.includes('review') || currentSiteStatus.includes('under review')) return 'Under Review PO';
  if (currentSiteStatus.includes('upcoming') || currentSiteStatus.includes('planning')) return 'Upcoming PO';
  if (currentSiteStatus.includes('not signed')) return 'Not Signed PO';
  if (currentSiteStatus.includes('signed')) return 'Signed PO';

  const contractStatus = (project.contractStatus || '').toLowerCase();
  if (contractStatus === 'not signed' || contractStatus === 'cancelled') {
    return 'Not Signed PO';
  }

  const rem = (project.remark || '').toLowerCase();

  // 1. Not Signed / Awaiting PO
  if (
    project.projectId === 'IND-034' ||
    project.projectId === 'IND-035' ||
    rem.includes('awaiting') ||
    rem.includes('wait rev po')
  ) {
    return 'Not Signed PO';
  }

  // 2. Upcoming PO (future pipeline / pending initial design / no loading plan)
  if (
    project.projectId === 'IND-007' ||
    project.projectId === 'IND-020' ||
    project.projectId === 'IND-022' ||
    (project.designProgressPercent === null && !project.productionStart)
  ) {
    return 'Upcoming PO';
  }

  // 3. Under Review PO (pending shell approval / revision review / delivery discussion)
  if (
    project.projectId === 'IND-004' ||
    project.projectId === 'IND-006' ||
    project.projectId === 'IND-017' ||
    (!project.shellPlanConfirmation && (project.balanceUSD || 0) > 0)
  ) {
    return 'Under Review PO';
  }

  // 4. Default active signed PO
  return 'Signed PO';
}

/**
 * Format currency according to the business scope:
 * KKV -> USD ($)
 * KKI -> INR (₹)
 * KKHQ -> USD ($)
 */
export function formatScopeCurrency(amount: number | null | undefined, scope: string): string {
  const val = amount || 0;
  const isINR = scope.toUpperCase() === 'KKI';

  if (isINR) {
    if (val >= 10_000_000) {
      return `₹${(val / 10_000_000).toFixed(1)} Cr`;
    }
    if (val >= 100_000) {
      return `₹${(val / 100_000).toFixed(1)} L`;
    }
    if (val >= 1_000) {
      return `₹${(val / 1_000).toFixed(1)} K`;
    }
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  }

  // Default USD
  if (val >= 1_000_000) {
    return `$${(val / 1_000_000).toFixed(1)}M`;
  }
  if (val >= 1_000) {
    return `$${(val / 1_000).toFixed(1)}K`;
  }
  return `$${Math.round(val).toLocaleString('en-US')}`;
}

/**
 * Format area in square meters (m²)
 */
export function formatArea(area: number | null | undefined): string {
  const val = area || 0;
  return `${Math.round(val).toLocaleString()} m²`;
}

export interface ScopeStatusMetrics {
  count: number;
  areaM2: number;
  amount: number;
}

export interface ScopeMetrics {
  scope: string;
  totalProjects: number;
  statuses: Record<POStatus, ScopeStatusMetrics>;
  projects: ProjectMaster[];
}

/**
 * Calculate full scope-wise metrics dynamically from project records.
 */
export function calculateScopeMetrics(projects: ProjectMaster[]): Record<string, ScopeMetrics> {
  const result: Record<string, ScopeMetrics> = {};

  projects.forEach(project => {
    const scope = getProjectScope(project);
    const poStatus = getProjectPOStatus(project);
    const area = project.actualDesignQtyM2 || project.contractQtyM2 || project.poQty || 0;
    const amount = project.totalAmountUSD || project.actualTotalAmount || 0;

    if (!result[scope]) {
      result[scope] = {
        scope,
        totalProjects: 0,
        statuses: {
          'Signed PO': { count: 0, areaM2: 0, amount: 0 },
          'Not Signed PO': { count: 0, areaM2: 0, amount: 0 },
          'Under Review PO': { count: 0, areaM2: 0, amount: 0 },
          'Upcoming PO': { count: 0, areaM2: 0, amount: 0 },
        },
        projects: [],
      };
    }

    result[scope].totalProjects += 1;
    result[scope].statuses[poStatus].count += 1;
    result[scope].statuses[poStatus].areaM2 += area;
    result[scope].statuses[poStatus].amount += amount;
    result[scope].projects.push(project);
  });

  return result;
}
