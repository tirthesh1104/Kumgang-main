export type PIApprovalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_PM'
  | 'PENDING_SALES_DIRECTOR'
  | 'PENDING_MANAGING_DIRECTOR'
  | 'APPROVED'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'RECALLED';

export type PIApprovalStage =
  | 'DRAFT'
  | 'PM_REVIEW'
  | 'SALES_DIRECTOR_REVIEW'
  | 'MANAGING_DIRECTOR_REVIEW'
  | 'COMPLETED';

export type PIApprovalAction =
  | 'APPROVE'
  | 'REJECT'
  | 'PUT_ON_HOLD'
  | 'RECALL'
  | 'EDIT_RESUBMIT';

export interface PIApprovalStepRecord {
  id: string;
  stage: PIApprovalStage;
  stageLabel: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_HOLD' | 'RECALLED' | 'SKIPPED';
  action?: PIApprovalAction;
  comment?: string;
  reason?: string;
  submittedAt: string;
  reviewedAt?: string;
  token: string;
}

export interface PILineItem {
  id: string;
  itemDescription: string;
  materialType: string;
  scopeCategory: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  amountUSD: number;
}

export interface PIVersionRecord {
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  snapshotData: {
    piNumber: string;
    projectId: string;
    clientName: string;
    projectName: string;
    totalAmountUSD: number;
    taxAmountUSD: number | null;
    advanceRequiredUSD: number | null;
    balanceUSD: number | null;
    lineItems: PILineItem[];
    termsAndConditions: string[];
    notes?: string;
  };
  approvalHistory: PIApprovalStepRecord[];
  status: PIApprovalStatus;
}

export interface StakeholderEmails {
  pmEmail: string;
  salesDirectorEmail: string;
  managingDirectorEmail: string;
}

export interface ProformaInvoiceRecord {
  id: string;
  piNumber: string;
  projectId: string;
  clientName: string;
  projectName: string;
  vendorCompany: string;
  currency: string;
  documentDate: string;
  dueDate: string;

  // Commercial & PO References
  poNumber: string;
  poDate: string;
  incoterm: string;
  paymentTerm: string;
  billToAddress: string;
  billToPinCode?: string;
  shipToAddress: string;
  shipToPinCode?: string;

  // Contact info
  clientContactName?: string;
  clientContactEmail?: string;
  clientContactPhone?: string;

  // Line Items & Financials
  lineItems: PILineItem[];
  subtotalUSD: number;
  taxApplicability: string;
  taxRatePercent: number | null;
  taxAmountUSD: number | null;
  totalAmountUSD: number;
  advanceUSD: number | null;
  balanceUSD: number | null;
  
  // Banking & Terms
  bankDetails: {
    beneficiaryName: string;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
  };
  termsAndConditions: string[];
  notes?: string;

  // Multi-Level Workflow State
  currentVersion: number;
  versions: PIVersionRecord[];
  status: PIApprovalStatus;
  currentStage: PIApprovalStage;
  approvalHistory: PIApprovalStepRecord[];

  // Configured Reviewers
  pmReviewer: { name: string; email: string };
  salesDirectorReviewer: { name: string; email: string };
  managingDirectorReviewer: { name: string; email: string };

  // Email Delivery Tracking (Resend / Live & Simulation)
  emailDeliveryLogs?: PIDeliveryLog[];

  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PIDeliveryLog {
  id: string;
  piId: string;
  piNumber: string;
  stage: PIApprovalStage;
  recipientEmail: string;
  recipientRole: string;
  status: 'SENT' | 'FAILED' | 'DEMO_SIMULATED';
  providerMessageId?: string;
  error?: string;
  sentAt: string;
  actionToken: string;
}
