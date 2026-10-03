export interface DesignAreaElement {
  id: string;
  projectId: string;
  tower: string;
  floor: string;
  modificationAreaM2?: number | null;
  reuseAreaM2?: number | null;
  newSupplyAreaM2?: number | null;
  modificationArea?: number | null;
  reuseArea?: number | null;
  newSupplyArea?: number | null;
  lastUpdated: string;
  updatedBy: string;
  lastChanges?: {
    field: string;
    oldValue: number | string | null;
    newValue: number | string | null;
    updatedAt: string;
    updatedBy: string;
  }[];
}

export interface SitePhotoRecord {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  imageDataUrl?: string;
  dataUrl?: string;
  siteDate?: string | null;
  recordDate?: string;
  siteRequirementDate?: string;
  siteStatus?: string;
  materialScope?: string;
  remarks?: string;
  status?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WeeklyProgressRecord {
  id: string;
  projectId: string;
  weekDate: string;
  progressPercent?: number;
  progressStatus?: string;
  status?: string;
  remarks?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface ProjectSiteExecutionInfo {
  projectId: string;
  supervisorName: string;
  supervisorContact: string;
  supervisorAllocationDate?: string | null;
  allocationDate?: string | null;
  supportDuration: string;
  siteRequirementDate?: string | null;
  siteStatus?: string;
  currentSiteStatus?: string;
  remarks?: string;
  siteRemarks?: string;
  materialScope?: string;
  updatedAt?: string;
  updatedBy?: string;
}
