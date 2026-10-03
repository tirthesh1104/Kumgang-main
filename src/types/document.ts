export type DocumentCategory = 'commercial' | 'site' | 'design';

export type CommercialDocType =
  | 'sales-quotation-draft'
  | 'sales-quotation-final'
  | 'loi-draft'
  | 'loi-final'
  | 'po-draft'
  | 'po-final';

export type SiteDocType =
  | 'shipping-documents'
  | 'site-completion-reports'
  | 'as-reports'
  | 'factory-visit-letters'
  | 'other-documents';

export type DesignDocType =
  | 'excel-bom'
  | 'dwg'
  | 'setting-dwg'
  | 'md-dwg';

export type DocumentType = CommercialDocType | SiteDocType | DesignDocType;

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  fileDataUrl?: string; // base64 DataURL or Object URL
  documentDate: string | null;
  uploadedBy: string;
  uploadedAt: string;
  status: 'current' | 'previous' | 'archived';
  notes?: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  category: DocumentCategory;
  docType: DocumentType;
  title: string;
  isMultiFile: boolean;
  currentVersionId: string;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'archived';
}

export const CATEGORY_NAMES: Record<DocumentCategory, string> = {
  commercial: 'Commercial Documents',
  site: 'Project / Site Documents',
  design: 'Design Documents',
};

export const DOC_TYPE_NAMES: Record<DocumentType, { name: string; category: DocumentCategory; isMulti: boolean }> = {
  'sales-quotation-draft': { name: 'Sales Quotation (Draft)', category: 'commercial', isMulti: false },
  'sales-quotation-final': { name: 'Sales Quotation (Final)', category: 'commercial', isMulti: false },
  'loi-draft': { name: 'LOI (Draft)', category: 'commercial', isMulti: false },
  'loi-final': { name: 'LOI (Final)', category: 'commercial', isMulti: false },
  'po-draft': { name: 'PO (Draft)', category: 'commercial', isMulti: false },
  'po-final': { name: 'PO (Final)', category: 'commercial', isMulti: false },
  'shipping-documents': { name: 'Shipping Documents', category: 'site', isMulti: true },
  'site-completion-reports': { name: 'Site Completion Reports', category: 'site', isMulti: true },
  'as-reports': { name: 'AS Reports', category: 'site', isMulti: true },
  'factory-visit-letters': { name: 'Factory Visit Official Letters', category: 'site', isMulti: true },
  'other-documents': { name: 'Other Documents', category: 'site', isMulti: true },
  'excel-bom': { name: 'Excel BOM', category: 'design', isMulti: false },
  'dwg': { name: 'DWG', category: 'design', isMulti: false },
  'setting-dwg': { name: 'Setting DWG', category: 'design', isMulti: false },
  'md-dwg': { name: 'MD DWG', category: 'design', isMulti: false },
};
