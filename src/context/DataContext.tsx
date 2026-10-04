import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  projectMasterData,
  designScheduleData,
  productionData,
  shipmentData,
  paymentData,
  type ProjectMaster,
  type DesignSchedule,
  type ProductionRecord,
  type ShipmentRecord,
  type PaymentRecord,
} from '../data/projectData';
import type { ProjectDocument, DocumentVersion } from '../types/document';
import type { DesignAreaElement, SitePhotoRecord, WeeklyProgressRecord, ProjectSiteExecutionInfo } from '../types/phase3';
import type { AppNotification } from '../types/notification';
import type {
  ProformaInvoiceRecord,
  PIApprovalStatus,
  PIApprovalStage,
  PIApprovalAction,
  PIApprovalStepRecord,
  PIVersionRecord,
  PILineItem,
  StakeholderEmails,
} from '../types/proformaInvoice';
import { generatePIDataFromProject, generateSecureActionToken } from '../utils/proformaInvoiceUtils';
import { deriveProjectNotifications } from '../utils/notificationEngine';
import { buildNormalizedMISDataset, type NormalizedMISDataset } from '../services/erpIntegration';
import { dispatchPIStageEmail, createPIDeliveryLog } from '../services/emailService';
import { validateProjectMaster } from '../utils/dataValidation';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  method: 'Manual' | 'Excel Import';
  projectId?: string;
  fileName?: string;
  summary: string;
  changes?: { field: string; oldValue: string | number | null; newValue: string | number | null }[];
}

interface DataContextType {
  projects: ProjectMaster[];
  designSchedules: DesignSchedule[];
  productionRecords: ProductionRecord[];
  shipments: ShipmentRecord[];
  payments: PaymentRecord[];
  documents: ProjectDocument[];
  designAreaElements: DesignAreaElement[];
  sitePhotos: SitePhotoRecord[];
  weeklyProgress: WeeklyProgressRecord[];
  siteExecutionInfos: Record<string, ProjectSiteExecutionInfo>;
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  proformaInvoices: ProformaInvoiceRecord[];
  stakeholderEmails: StakeholderEmails;
  
  // Dynamic Derived Queries & Helpers
  getProjectById: (id: string) => ProjectMaster | undefined;
  getProjectsByCountry: (country: string) => ProjectMaster[];
  getProjectsByCustomer: (customer: string) => ProjectMaster[];
  getProjectsByStatus: (status: string) => ProjectMaster[];
  getDesignForProject: (projectId: string) => DesignSchedule[];
  getProductionForProject: (projectId: string) => ProductionRecord[];
  getShipmentsForProject: (projectId: string) => ShipmentRecord[];
  getShipmentForProject: (projectId: string) => ShipmentRecord | undefined;
  getPaymentsForProject: (projectId: string) => PaymentRecord[];
  getDocumentsForProject: (projectId: string) => ProjectDocument[];
  getDesignAreaElementsForProject: (projectId: string) => DesignAreaElement[];
  getSitePhotosForProject: (projectId: string) => SitePhotoRecord[];
  getWeeklyProgressForProject: (projectId: string) => WeeklyProgressRecord[];
  getSiteExecutionInfoForProject: (projectId: string) => ProjectSiteExecutionInfo | undefined;
  getPIsForProject: (projectId: string) => ProformaInvoiceRecord[];
  getPIById: (piId: string) => ProformaInvoiceRecord | undefined;
  getLastApprovedPIDate: (projectId: string) => string | null;
  getNormalizedMISDataset: () => NormalizedMISDataset;
  getNotificationsForUser: (role: string, assignedProjects?: string[]) => AppNotification[];
  getUniqueCountries: () => string[];
  getUniqueCustomers: () => string[];
  getUniqueStatuses: () => string[];

  // Dynamic Derived KPI Metrics
  getDashboardKPIs: () => {
    totalProjects: number;
    signedProjects: number;
    totalContractValueUSD: number;
    totalAdvanceUSD: number;
    totalBalanceUSD: number;
    totalQtyM2: number;
    totalWeightTons: number;
    collectionRate: number;
    countryCounts: Record<string, number>;
  };
  getAttentionProjects: () => ProjectMaster[];
  getDelayedProjects: () => ProjectMaster[];
  getTotalOutstandingBalance: () => number;

  // Mutation Handlers
  updateProjectManual: (
    projectId: string,
    updatedFields: Partial<ProjectMaster>,
    user?: string
  ) => { success: boolean; errors?: string[] };
  
  addProjectManual: (
    newProject: ProjectMaster,
    user?: string
  ) => { success: boolean; errors?: string[] };

  updateDesignSchedule: (
    designId: string,
    updatedFields: Partial<DesignSchedule>,
    user?: string
  ) => { success: boolean; errors?: string[] };

  updateProductionRecord: (
    productionId: string,
    updatedFields: Partial<ProductionRecord>,
    user?: string
  ) => { success: boolean; errors?: string[] };

  addProductionEntry: (
    entry: ProductionRecord,
    user?: string
  ) => { success: boolean; errors?: string[] };

  updateShipmentRecord: (
    shipmentId: string,
    updatedFields: Partial<ShipmentRecord>,
    user?: string
  ) => { success: boolean; errors?: string[] };

  recordNewPayment: (
    newPayment: PaymentRecord,
    user?: string
  ) => { success: boolean; errors?: string[] };

  updatePaymentRow: (
    paymentId: string,
    updatedFields: Partial<PaymentRecord>,
    user?: string
  ) => { success: boolean; errors?: string[] };

  deletePaymentRow: (
    paymentId: string,
    user?: string
  ) => { success: boolean; errors?: string[] };

  commitExcelImport: (
    updatedProjectsMap: Map<string, Partial<ProjectMaster>>,
    newProjectsList: ProjectMaster[],
    fileInfo: { filename: string; recordCount: number },
    user?: string
  ) => { success: boolean; updatedCount: number; newCount: number };

  // Phase 2 Document Management
  addProjectDocument: (newDoc: ProjectDocument, user?: string) => { success: boolean; error?: string };
  addDocumentVersion: (documentId: string, newVersion: DocumentVersion, user?: string) => { success: boolean; error?: string };
  archiveDocument: (documentId: string, user?: string) => { success: boolean; error?: string };

  // Phase 3 Enhancements
  saveDesignAreaElement: (item: DesignAreaElement, user?: string) => { success: boolean };
  addSitePhoto: (photo: SitePhotoRecord, user?: string) => { success: boolean };
  addWeeklyProgress: (record: WeeklyProgressRecord, user?: string) => { success: boolean };
  updateSiteExecutionInfo: (projectId: string, info: Partial<ProjectSiteExecutionInfo>, user?: string) => void;
  // Phase 4 Notifications & MIS Adapters
  markNotificationAsRead: (id: string, user?: string) => void;
  dismissNotification: (id: string, user?: string) => void;
  markAllNotificationsAsRead: (user?: string) => void;

  // Phase 5 Proforma Invoice & Multi-Level Email Approval
  updateStakeholderEmails: (emails: Partial<StakeholderEmails>, user?: string) => void;
  createProformaInvoice: (projectId: string, user?: string) => { success: boolean; pi?: ProformaInvoiceRecord; error?: string };
  submitPIForApproval: (piId: string, user?: string, comment?: string) => { success: boolean; error?: string };
  processPIApprovalAction: (
    piId: string,
    action: PIApprovalAction,
    user: string,
    role: string,
    comment?: string,
    reason?: string
  ) => { success: boolean; error?: string };
  editAndResubmitPI: (
    piId: string,
    modifications: {
      lineItems?: PILineItem[];
      unitPriceUSD?: number;
      taxRatePercent?: number | null;
      paymentTerm?: string;
    },
    user: string,
    changeReason: string
  ) => { success: boolean; error?: string; newVersion?: number };
  recallPIRequest: (piId: string, user: string, recallReason: string, comment?: string) => { success: boolean; error?: string };
  retryPIApprovalEmail: (piId: string) => Promise<{ success: boolean; error?: string; status?: string }>;

  resetToInitialData: () => void;
  clearAuditLogs: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_PROJECTS_KEY = 'kumkang_projects_data_v1';
const STORAGE_AUDIT_LOGS_KEY = 'kumkang_audit_logs_v1';
const STORAGE_DESIGN_KEY = 'kumkang_design_schedules_v1';
const STORAGE_PRODUCTION_KEY = 'kumkang_production_records_v1';
const STORAGE_SHIPMENTS_KEY = 'kumkang_shipment_records_v1';
const STORAGE_PAYMENTS_KEY = 'kumkang_payment_records_v1';
const STORAGE_DOCUMENTS_KEY = 'kumkang_project_documents_v1';
const STORAGE_DESIGN_ELEMENTS_KEY = 'kumkang_design_elements_v1';
const STORAGE_SITE_PHOTOS_KEY = 'kumkang_site_photos_v1';
const STORAGE_WEEKLY_PROGRESS_KEY = 'kumkang_weekly_progress_v1';
const STORAGE_SITE_EXEC_KEY = 'kumkang_site_execution_info_v1';
const STORAGE_PI_KEY = 'kumkang_proforma_invoices_v1';
const STORAGE_STAKEHOLDERS_KEY = 'kumkang_pi_stakeholder_emails_v1';

const DEFAULT_STAKEHOLDER_EMAILS: StakeholderEmails = {
  pmEmail: 'pm.ops@kumgangkind.com',
  salesDirectorEmail: 'sales.director@kumgangkind.com',
  managingDirectorEmail: 'md.exec@kumgangkind.com',
};

function formatLogTimestamp(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectMaster[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasKKHQ = parsed.some(p => p.projectId && p.projectId.startsWith('KKHQ'));
          if (!hasKKHQ) {
            const kkhqSeeds = projectMasterData.filter(p => p.projectId && p.projectId.startsWith('KKHQ'));
            return [...parsed, ...kkhqSeeds];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved projects from localStorage:', e);
    }
    return projectMasterData;
  });

  const [designSchedules, setDesignSchedules] = useState<DesignSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DESIGN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse design schedules from localStorage:', e);
    }
    return designScheduleData;
  });

  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse production records from localStorage:', e);
    }
    return productionData;
  });

  const [shipments, setShipments] = useState<ShipmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SHIPMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse shipment records from localStorage:', e);
    }
    return shipmentData;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PAYMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse payment records from localStorage:', e);
    }
    return paymentData;
  });

  // Initialize Project Documents
  const [documents, setDocuments] = useState<ProjectDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DOCUMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse documents from localStorage:', e);
    }
    return [];
  });

  // Phase 3 States
  const [designAreaElements, setDesignAreaElements] = useState<DesignAreaElement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DESIGN_ELEMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse design elements from localStorage:', e);
    }
    return [];
  });

  const [sitePhotos, setSitePhotos] = useState<SitePhotoRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SITE_PHOTOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse site photos from localStorage:', e);
    }
    return [];
  });

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WEEKLY_PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse weekly progress from localStorage:', e);
    }
    return [];
  });

  const [siteExecutionInfos, setSiteExecutionInfos] = useState<Record<string, ProjectSiteExecutionInfo>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SITE_EXEC_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse site execution info from localStorage:', e);
    }
    return {};
  });

  // Phase 5 Proforma Invoices & Stakeholder Emails State
  const [stakeholderEmails, setStakeholderEmails] = useState<StakeholderEmails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAKEHOLDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_STAKEHOLDER_EMAILS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse stakeholder emails from localStorage:', e);
    }
    return DEFAULT_STAKEHOLDER_EMAILS;
  });

  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PI_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse proforma invoices from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STAKEHOLDERS_KEY, JSON.stringify(stakeholderEmails));
    } catch (e) {
      console.error('Error saving stakeholder emails to localStorage:', e);
    }
  }, [stakeholderEmails]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PI_KEY, JSON.stringify(proformaInvoices));
    } catch (e) {
      console.error('Error saving proforma invoices to localStorage:', e);
    }
  }, [proformaInvoices]);

  // Phase 4 Notifications State
  const [notificationState, setNotificationState] = useState<{ readIds: string[]; dismissedIds: string[] }>(() => {
    try {
      const saved = localStorage.getItem('kumkang_notification_state_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.readIds) && Array.isArray(parsed.dismissedIds)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse notification state from localStorage:', e);
    }
    return { readIds: [], dismissedIds: [] };
  });

  useEffect(() => {
    try {
      localStorage.setItem('kumkang_notification_state_v1', JSON.stringify(notificationState));
    } catch (e) {
      console.error('Error saving notification state to localStorage:', e);
    }
  }, [notificationState]);

  const rawNotifications = useMemo(() => {
    return deriveProjectNotifications(projects, shipments, designSchedules, proformaInvoices);
  }, [projects, shipments, designSchedules, proformaInvoices]);

  const notifications = useMemo(() => {
    return rawNotifications
      .filter(n => !notificationState.dismissedIds.includes(n.id))
      .map(n => ({
        ...n,
        read: notificationState.readIds.includes(n.id),
      }));
  }, [rawNotifications, notificationState]);

  // Initialize Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUDIT_LOGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse audit logs from localStorage:', e);
    }
    return [];
  });

  // Persist state when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to localStorage:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DESIGN_KEY, JSON.stringify(designSchedules));
    } catch (e) {
      console.error('Error saving design schedules to localStorage:', e);
    }
  }, [designSchedules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCTION_KEY, JSON.stringify(productionRecords));
    } catch (e) {
      console.error('Error saving production records to localStorage:', e);
    }
  }, [productionRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SHIPMENTS_KEY, JSON.stringify(shipments));
    } catch (e) {
      console.error('Error saving shipments to localStorage:', e);
    }
  }, [shipments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
    } catch (e) {
      console.error('Error saving payments to localStorage:', e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(documents));
    } catch (e) {
      console.error('Error saving documents to localStorage:', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DESIGN_ELEMENTS_KEY, JSON.stringify(designAreaElements));
    } catch (e) {
      console.error('Error saving design area elements to localStorage:', e);
    }
  }, [designAreaElements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SITE_PHOTOS_KEY, JSON.stringify(sitePhotos));
    } catch (e) {
      console.error('Error saving site photos to localStorage:', e);
    }
  }, [sitePhotos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WEEKLY_PROGRESS_KEY, JSON.stringify(weeklyProgress));
    } catch (e) {
      console.error('Error saving weekly progress to localStorage:', e);
    }
  }, [weeklyProgress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SITE_EXEC_KEY, JSON.stringify(siteExecutionInfos));
    } catch (e) {
      console.error('Error saving site execution info to localStorage:', e);
    }
  }, [siteExecutionInfos]);

  // Persist audit logs whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUDIT_LOGS_KEY, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Error saving audit logs to localStorage:', e);
    }
  }, [auditLogs]);

  // Helper getters
  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.projectId === id);
  }, [projects]);

  const getProjectsByCountry = useCallback((country: string) => {
    return projects.filter(p => p.country.toLowerCase() === country.toLowerCase());
  }, [projects]);

  const getProjectsByCustomer = useCallback((customer: string) => {
    return projects.filter(p => p.customer.toLowerCase() === customer.toLowerCase());
  }, [projects]);

  const getProjectsByStatus = useCallback((status: string) => {
    return projects.filter(p => p.contractStatus === status);
  }, [projects]);

  const getDesignForProject = useCallback((projectId: string) => {
    return designSchedules.filter(d => d.projectId === projectId);
  }, [designSchedules]);

  const getProductionForProject = useCallback((projectId: string) => {
    return productionRecords.filter(p => p.projectId === projectId);
  }, [productionRecords]);

  const getShipmentsForProject = useCallback((projectId: string) => {
    return shipments.filter(s => s.projectId === projectId);
  }, [shipments]);

  const getShipmentForProject = useCallback((projectId: string) => {
    return shipments.find(s => s.projectId === projectId);
  }, [shipments]);

  const getPaymentsForProject = useCallback((projectId: string) => {
    return payments.filter(p => p.projectId === projectId);
  }, [payments]);

  const getDocumentsForProject = useCallback((projectId: string) => {
    return documents.filter(d => d.projectId === projectId && d.status !== 'archived');
  }, [documents]);

  const getDesignAreaElementsForProject = useCallback((projectId: string) => {
    return designAreaElements.filter(d => d.projectId === projectId);
  }, [designAreaElements]);

  const getSitePhotosForProject = useCallback((projectId: string) => {
    return sitePhotos.filter(p => p.projectId === projectId);
  }, [sitePhotos]);

  const getWeeklyProgressForProject = useCallback((projectId: string) => {
    return weeklyProgress.filter(w => w.projectId === projectId);
  }, [weeklyProgress]);

  const getSiteExecutionInfoForProject = useCallback((projectId: string) => {
    return siteExecutionInfos[projectId];
  }, [siteExecutionInfos]);

  const getNormalizedMISDataset = useCallback(() => {
    return buildNormalizedMISDataset(projects, shipments, payments);
  }, [projects, shipments, payments]);

  const getNotificationsForUser = useCallback((role: string, assignedProjects?: string[]) => {
    return notifications.filter(n => {
      // Role match check
      if (n.recipientRoles && n.recipientRoles.length > 0) {
        const roleMatch = n.recipientRoles.some(r => r.toLowerCase() === role.toLowerCase());
        if (!roleMatch) return false;
      }
      // Client isolation check
      if (role.toLowerCase() === 'client') {
        if (!n.projectId) return false;
        if (assignedProjects && !assignedProjects.includes(n.projectId)) return false;
      }
      return true;
    });
  }, [notifications]);

  const markNotificationAsRead = useCallback((id: string, user = 'User') => {
    setNotificationState(prev => {
      if (prev.readIds.includes(id)) return prev;
      return { ...prev, readIds: [...prev.readIds, id] };
    });
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      summary: `Marked notification "${id}" as read`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const dismissNotification = useCallback((id: string, user = 'User') => {
    setNotificationState(prev => {
      if (prev.dismissedIds.includes(id)) return prev;
      return { ...prev, dismissedIds: [...prev.dismissedIds, id] };
    });
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      summary: `Dismissed notification "${id}"`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const markAllNotificationsAsRead = useCallback((user = 'User') => {
    const allIds = notifications.map(n => n.id);
    setNotificationState(prev => ({
      ...prev,
      readIds: Array.from(new Set([...prev.readIds, ...allIds])),
    }));
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      summary: `Marked all active notifications as read`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [notifications]);

  const getUniqueCountries = useCallback(() => {
    return [...new Set(projects.map(p => p.country).filter(Boolean))];
  }, [projects]);

  const getUniqueCustomers = useCallback(() => {
    return [...new Set(projects.map(p => p.customer).filter(Boolean))];
  }, [projects]);

  const getUniqueStatuses = useCallback(() => {
    return [...new Set(projects.map(p => p.contractStatus).filter(Boolean))];
  }, [projects]);

  // Derived Dynamic Dashboard KPIs
  const getDashboardKPIs = useCallback(() => {
    const signed = projects.filter(p => p.contractStatus === 'Signed');
    const totalProjects = projects.length;
    const signedProjects = signed.length;
    const totalContractValueUSD = signed.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);
    const totalAdvanceUSD = signed.reduce((sum, p) => sum + (p.advanceUSD || 0), 0);
    const totalBalanceUSD = signed.reduce((sum, p) => sum + (p.balanceUSD || 0), 0);
    const totalQtyM2 = signed.reduce((sum, p) => sum + (p.contractQtyM2 || p.actualDesignQtyM2 || 0), 0);
    const totalWeightTons = signed.reduce((sum, p) => sum + (p.contractWeightTons || p.actualDesignWeightTons || 0), 0);
    const collectionRate = totalContractValueUSD > 0 ? Math.round((totalAdvanceUSD / totalContractValueUSD) * 10000) / 100 : 0;
    const countryCounts: Record<string, number> = {};
    projects.forEach(p => {
      const c = p.country || 'Other';
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    return {
      totalProjects,
      signedProjects,
      totalContractValueUSD,
      totalAdvanceUSD,
      totalBalanceUSD,
      totalQtyM2,
      totalWeightTons,
      collectionRate,
      countryCounts,
    };
  }, [projects]);

  const getAttentionProjects = useCallback(() => {
    return projects.filter(p => {
      if (p.contractStatus !== 'Signed') return false;
      const hasBalance = (p.balanceUSD || 0) > 0;
      const partialPayment = p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%') && p.paymentStatus !== '';
      return hasBalance || partialPayment;
    });
  }, [projects]);

  const getDelayedProjects = useCallback(() => {
    return projects.filter(p => {
      if (p.contractStatus !== 'Signed') return false;
      const hasBalance = (p.balanceUSD || 0) > 0;
      const notFullyPaid = p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%');
      return hasBalance && notFullyPaid;
    });
  }, [projects]);

  const getTotalOutstandingBalance = useCallback(() => {
    return projects
      .filter(p => p.contractStatus === 'Signed')
      .reduce((sum, p) => sum + (p.balanceUSD || 0), 0);
  }, [projects]);

  // MANUAL UPDATE MUTATION
  const updateProjectManual = useCallback((
    projectId: string,
    updatedFields: Partial<ProjectMaster>,
    user = 'Administrator'
  ) => {
    const existingIndex = projects.findIndex(p => p.projectId === projectId);
    if (existingIndex === -1) {
      return { success: false, errors: [`Project ${projectId} not found.`] };
    }

    const currentProject = projects[existingIndex];
    const mergedData: ProjectMaster = { ...currentProject, ...updatedFields };

    // Automatic calculation of derived balanceUSD if totalAmountUSD or advanceUSD changed
    const newTotal = mergedData.totalAmountUSD;
    const newAdvance = mergedData.advanceUSD;
    if (newTotal !== null && newTotal !== undefined) {
      const advanceVal = newAdvance || 0;
      mergedData.balanceUSD = Math.max(0, Math.round((newTotal - advanceVal) * 100) / 100);
    }

    // Validate merged object
    const valResult = validateProjectMaster(mergedData);
    if (!valResult.isValid) {
      return { success: false, errors: valResult.errors.map(e => `${e.field}: ${e.message}`) };
    }

    // Detect changed fields for audit log
    const changedFields: { field: string; oldValue: any; newValue: any }[] = [];
    (Object.keys(updatedFields) as (keyof ProjectMaster)[]).forEach(key => {
      const oldVal = currentProject[key];
      const newVal = updatedFields[key];
      if (oldVal !== newVal && newVal !== undefined) {
        changedFields.push({
          field: String(key),
          oldValue: oldVal ?? '—',
          newValue: newVal ?? '—',
        });
      }
    });

    if (changedFields.length === 0) {
      return { success: true };
    }

    const updatedProjects = [...projects];
    updatedProjects[existingIndex] = mergedData;
    setProjects(updatedProjects);

    // Create Audit Log
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId,
      summary: `Updated ${changedFields.length} field(s) on ${projectId} (${currentProject.project})`,
      changes: changedFields,
    };

    setAuditLogs(prev => [newLog, ...prev]);
    return { success: true };
  }, [projects]);

  // MANUAL ADD PROJECT MUTATION
  const addProjectManual = useCallback((
    newProject: ProjectMaster,
    user = 'Administrator'
  ) => {
    if (projects.some(p => p.projectId === newProject.projectId)) {
      return { success: false, errors: [`Project ID ${newProject.projectId} already exists.`] };
    }

    const valResult = validateProjectMaster(newProject);
    if (!valResult.isValid) {
      return { success: false, errors: valResult.errors.map(e => `${e.field}: ${e.message}`) };
    }

    // Calculate balanceUSD
    if (newProject.totalAmountUSD != null) {
      newProject.balanceUSD = Math.max(0, Math.round((newProject.totalAmountUSD - (newProject.advanceUSD || 0)) * 100) / 100);
    }

    setProjects(prev => [newProject, ...prev]);

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: newProject.projectId,
      summary: `Added new project ${newProject.projectId} (${newProject.project})`,
    };

    setAuditLogs(prev => [newLog, ...prev]);
    return { success: true };
  }, [projects]);

  // QUICK EDIT DESIGN SCHEDULE
  const updateDesignSchedule = useCallback((
    designId: string,
    updatedFields: Partial<DesignSchedule>,
    user = 'Project Manager'
  ) => {
    const idx = designSchedules.findIndex(d => d.designId === designId);
    if (idx === -1) return { success: false, errors: [`Design record ${designId} not found.`] };

    const current = designSchedules[idx];
    const updated = { ...current, ...updatedFields };

    const nextList = [...designSchedules];
    nextList[idx] = updated;
    setDesignSchedules(nextList);

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: updated.projectId,
      summary: `Quick Edit Design element "${updated.element}" (${designId}): Status -> ${updated.status}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, [designSchedules]);

  // QUICK EDIT PRODUCTION RECORD
  const updateProductionRecord = useCallback((
    productionId: string,
    updatedFields: Partial<ProductionRecord>,
    user = 'Project Manager'
  ) => {
    const idx = productionRecords.findIndex(p => p.productionId === productionId);
    if (idx === -1) return { success: false, errors: [`Production record ${productionId} not found.`] };

    const current = productionRecords[idx];
    const updated = { ...current, ...updatedFields };

    if (updated.orderQtyM2 && updated.finishedQtyM2 !== null && updated.finishedQtyM2 !== undefined) {
      updated.completionPercent = Math.min(100, Math.max(0, Math.round((updated.finishedQtyM2 / updated.orderQtyM2) * 100)));
      updated.balanceQty = Math.max(0, updated.orderQtyM2 - updated.finishedQtyM2);
    }

    const nextList = [...productionRecords];
    nextList[idx] = updated;
    setProductionRecords(nextList);

    if (updated.projectId && (updatedFields.productionStartDate || updatedFields.productionCompleteDate)) {
      updateProjectManual(updated.projectId, {
        ...(updatedFields.productionStartDate ? { productionStart: updatedFields.productionStartDate } : {}),
        ...(updatedFields.productionCompleteDate ? { productionComplete: updatedFields.productionCompleteDate } : {}),
      }, user);
    }

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: updated.projectId || undefined,
      summary: `Quick Edit Production record ${updated.part} (${productionId}): Progress -> ${updated.completionPercent ?? 0}%`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, [productionRecords, updateProjectManual]);

  // ADD PRODUCTION ENTRY
  const addProductionEntry = useCallback((
    entry: ProductionRecord,
    user = 'Project Manager'
  ) => {
    setProductionRecords(prev => [entry, ...prev]);

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: entry.projectId || undefined,
      summary: `Added new Production entry for ${entry.part} (${entry.projectId})`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  // QUICK EDIT SHIPMENT RECORD
  const updateShipmentRecord = useCallback((
    shipmentId: string,
    updatedFields: Partial<ShipmentRecord>,
    user = 'Project Manager'
  ) => {
    const idx = shipments.findIndex(s => s.shipmentId === shipmentId);
    if (idx === -1) return { success: false, errors: [`Shipment record ${shipmentId} not found.`] };

    const current = shipments[idx];
    const updated = { ...current, ...updatedFields };

    const nextList = [...shipments];
    nextList[idx] = updated;
    setShipments(nextList);

    if (updated.projectId) {
      updateProjectManual(updated.projectId, {
        ...(updatedFields.etd !== undefined ? { etd: updatedFields.etd } : {}),
        ...(updatedFields.eta !== undefined ? { eta: updatedFields.eta } : {}),
        ...(updatedFields.fwd !== undefined ? { fwd: updatedFields.fwd } : {}),
        ...(updatedFields.loadingDate !== undefined ? { loadingDate: updatedFields.loadingDate } : {}),
      }, user);
    }

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: updated.projectId,
      summary: `Quick Edit Shipment ${shipmentId} (${updated.projectId}): Status -> ${updated.status}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, [shipments, updateProjectManual]);

  // RECORD NEW PAYMENT
  const recordNewPayment = useCallback((
    newPayment: PaymentRecord,
    user = 'Project Manager'
  ) => {
    setPayments(prev => [newPayment, ...prev]);

    if (newPayment.projectId && newPayment.amountUSD) {
      const proj = projects.find(p => p.projectId === newPayment.projectId);
      if (proj) {
        const currentAdv = proj.advanceUSD || 0;
        const newAdv = currentAdv + newPayment.amountUSD;
        updateProjectManual(newPayment.projectId, {
          advanceUSD: newAdv,
        }, user);
      }
    }

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: newPayment.projectId || undefined,
      summary: `Recorded new Payment of $${newPayment.amountUSD?.toLocaleString()} for ${newPayment.projectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, [projects, updateProjectManual]);

  // EXCEL IMPORT COMMIT MUTATION
  const commitExcelImport = useCallback((
    updatedProjectsMap: Map<string, Partial<ProjectMaster>>,
    newProjectsList: ProjectMaster[],
    fileInfo: { filename: string; recordCount: number },
    user = 'Administrator'
  ) => {
    let updatedCount = 0;
    let newCount = 0;

    setProjects(prev => {
      const nextProjects = [...prev];

      // Update existing records
      updatedProjectsMap.forEach((incomingChanges, projectId) => {
        const idx = nextProjects.findIndex(p => p.projectId === projectId);
        if (idx !== -1) {
          const merged = { ...nextProjects[idx], ...incomingChanges };
          if (merged.totalAmountUSD != null) {
            merged.balanceUSD = Math.max(0, Math.round((merged.totalAmountUSD - (merged.advanceUSD || 0)) * 100) / 100);
          }
          nextProjects[idx] = merged;
          updatedCount++;
        }
      });

      // Add new records
      newProjectsList.forEach(newP => {
        if (!nextProjects.some(p => p.projectId === newP.projectId)) {
          if (newP.totalAmountUSD != null) {
            newP.balanceUSD = Math.max(0, Math.round((newP.totalAmountUSD - (newP.advanceUSD || 0)) * 100) / 100);
          }
          nextProjects.push(newP);
          newCount++;
        }
      });

      return nextProjects;
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Excel Import',
      fileName: fileInfo.filename,
      summary: `Imported Excel file "${fileInfo.filename}" — Updated: ${updatedCount}, New: ${newCount}, Total Processed: ${fileInfo.recordCount}`,
    };

    setAuditLogs(prev => [newLog, ...prev]);
    return { success: true, updatedCount, newCount };
  }, []);

  // DOCUMENT MUTATIONS
  const addProjectDocument = useCallback((newDoc: ProjectDocument, user = 'Administrator') => {
    setDocuments(prev => [newDoc, ...prev]);

    const activeVersion = newDoc.versions.find(v => v.id === newDoc.currentVersionId) || newDoc.versions[0];
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: newDoc.projectId,
      fileName: activeVersion?.fileName,
      summary: `Uploaded document "${newDoc.title}" (${activeVersion?.fileName || 'file'}) for project ${newDoc.projectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  const addDocumentVersion = useCallback((documentId: string, newVersion: DocumentVersion, user = 'Administrator') => {
    let targetProjectId = '';
    let docTitle = '';

    setDocuments(prev => {
      const idx = prev.findIndex(d => d.id === documentId);
      if (idx === -1) return prev;

      const doc = prev[idx];
      targetProjectId = doc.projectId;
      docTitle = doc.title;

      const updatedVersions: DocumentVersion[] = doc.versions.map(v => ({
        ...v,
        status: 'previous',
      }));

      updatedVersions.unshift({
        ...newVersion,
        status: 'current',
      });

      const updatedDoc: ProjectDocument = {
        ...doc,
        currentVersionId: newVersion.id,
        versions: updatedVersions,
        updatedAt: new Date().toISOString(),
      };

      const next = [...prev];
      next[idx] = updatedDoc;
      return next;
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: targetProjectId,
      fileName: newVersion.fileName,
      summary: `Uploaded new version (v${newVersion.versionNumber}) for "${docTitle}" on ${targetProjectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  const archiveDocument = useCallback((documentId: string, user = 'Administrator') => {
    let targetProjectId = '';
    let docTitle = '';

    setDocuments(prev => {
      const idx = prev.findIndex(d => d.id === documentId);
      if (idx === -1) return prev;

      targetProjectId = prev[idx].projectId;
      docTitle = prev[idx].title;

      const updatedDoc: ProjectDocument = {
        ...prev[idx],
        status: 'archived',
        updatedAt: new Date().toISOString(),
      };

      const next = [...prev];
      next[idx] = updatedDoc;
      return next;
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: targetProjectId,
      summary: `Archived document "${docTitle}" on project ${targetProjectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  // Phase 3 Mutation Handlers
  const saveDesignAreaElement = useCallback((item: DesignAreaElement, user = 'Administrator') => {
    setDesignAreaElements(prev => {
      const idx = prev.findIndex(d => d.id === item.id || (d.projectId === item.projectId && d.tower === item.tower && d.floor === item.floor));
      let lastChanges = item.lastChanges || [];
      if (idx !== -1) {
        const oldItem = prev[idx];
        const changes: { field: string; oldValue: number | string | null; newValue: number | string | null; updatedAt: string; updatedBy: string }[] = [];
        
        const oldMod = oldItem.modificationArea ?? oldItem.modificationAreaM2 ?? null;
        const newMod = item.modificationArea ?? item.modificationAreaM2 ?? null;
        if (oldMod !== newMod) {
          changes.push({ field: 'Modification Area', oldValue: oldMod, newValue: newMod, updatedAt: new Date().toISOString(), updatedBy: user });
        }

        const oldReuse = oldItem.reuseArea ?? oldItem.reuseAreaM2 ?? null;
        const newReuse = item.reuseArea ?? item.reuseAreaM2 ?? null;
        if (oldReuse !== newReuse) {
          changes.push({ field: 'Reuse Area', oldValue: oldReuse, newValue: newReuse, updatedAt: new Date().toISOString(), updatedBy: user });
        }

        const oldSupply = oldItem.newSupplyArea ?? oldItem.newSupplyAreaM2 ?? null;
        const newSupply = item.newSupplyArea ?? item.newSupplyAreaM2 ?? null;
        if (oldSupply !== newSupply) {
          changes.push({ field: 'New Supply Area', oldValue: oldSupply, newValue: newSupply, updatedAt: new Date().toISOString(), updatedBy: user });
        }

        lastChanges = [...changes, ...(oldItem.lastChanges || [])];
        const updatedItem: DesignAreaElement = {
          ...item,
          id: oldItem.id,
          lastChanges,
          lastUpdated: new Date().toISOString(),
          updatedBy: user,
        };
        const next = [...prev];
        next[idx] = updatedItem;
        return next;
      } else {
        const newItem: DesignAreaElement = {
          ...item,
          id: item.id || `DAE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          lastUpdated: new Date().toISOString(),
          updatedBy: user,
          lastChanges: [],
        };
        return [...prev, newItem];
      }
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: item.projectId,
      summary: `Updated Design Area Element for ${item.projectId} (${item.tower}, ${item.floor})`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  const addSitePhoto = useCallback((photo: SitePhotoRecord, user = 'Administrator') => {
    setSitePhotos(prev => [photo, ...prev]);

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: photo.projectId,
      fileName: photo.fileName,
      summary: `Uploaded Site Photo "${photo.fileName}" for project ${photo.projectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  const addWeeklyProgress = useCallback((record: WeeklyProgressRecord, user = 'Administrator') => {
    setWeeklyProgress(prev => [record, ...prev]);

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: record.projectId,
      summary: `Added Weekly Site Progress record for ${record.projectId} (${record.weekDate}): ${record.progressStatus || record.status || ''}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  const updateSiteExecutionInfo = useCallback((projectId: string, info: Partial<ProjectSiteExecutionInfo>, user = 'Administrator') => {
    setSiteExecutionInfos(prev => {
      const existing = prev[projectId] || {
        projectId,
        supervisorName: '',
        supervisorContact: '',
        supervisorAllocationDate: null,
        supportDuration: '',
        siteStatus: 'Ongoing',
        remarks: '',
        updatedAt: new Date().toISOString(),
        updatedBy: user,
      };
      const updated: ProjectSiteExecutionInfo = {
        ...existing,
        ...info,
        projectId,
        updatedAt: new Date().toISOString(),
        updatedBy: user,
      };
      return {
        ...prev,
        [projectId]: updated,
      };
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId,
      summary: `Updated Site Execution Info for project ${projectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  }, []);

  // Phase 5 Proforma Invoice & Multi-Level Email Approval Handlers
  const getPIsForProject = useCallback((projectId: string): ProformaInvoiceRecord[] => {
    return proformaInvoices.filter(pi => pi.projectId === projectId);
  }, [proformaInvoices]);

  const getPIById = useCallback((piId: string): ProformaInvoiceRecord | undefined => {
    return proformaInvoices.find(pi => pi.id === piId);
  }, [proformaInvoices]);

  const getLastApprovedPIDate = useCallback((projectId: string): string | null => {
    const approvedPIs = proformaInvoices.filter(pi => pi.projectId === projectId && pi.status === 'APPROVED');
    if (approvedPIs.length === 0) return null;
    approvedPIs.sort((a, b) => {
      const dateA = new Date(a.documentDate || a.updatedAt).getTime();
      const dateB = new Date(b.documentDate || b.updatedAt).getTime();
      return dateB - dateA;
    });
    return approvedPIs[0].documentDate || approvedPIs[0].updatedAt.split('T')[0];
  }, [proformaInvoices]);

  const updatePaymentRow = useCallback((paymentId: string, updatedFields: Partial<PaymentRecord>, user = 'Project Manager') => {
    let targetProjectId = '';
    setPayments(prev => {
      const idx = prev.findIndex(p => p.paymentId === paymentId);
      if (idx === -1) return prev;
      targetProjectId = prev[idx].projectId || '';
      const merged = { ...prev[idx], ...updatedFields };
      const next = [...prev];
      next[idx] = merged;
      return next;
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: targetProjectId || undefined,
      summary: `Updated payment row ${paymentId} for project ${targetProjectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    return { success: true };
  }, []);

  const deletePaymentRow = useCallback((paymentId: string, user = 'Project Manager') => {
    let targetProjectId = '';
    setPayments(prev => {
      const target = prev.find(p => p.paymentId === paymentId);
      if (target) targetProjectId = target.projectId || '';
      return prev.filter(p => p.paymentId !== paymentId);
    });

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId: targetProjectId || undefined,
      summary: `Deleted payment row ${paymentId} for project ${targetProjectId}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    return { success: true };
  }, []);

  const updateStakeholderEmails = useCallback((emails: Partial<StakeholderEmails>, user = 'Administrator') => {
    setStakeholderEmails(prev => {
      const updated = { ...prev, ...emails };
      return updated;
    });
    const log: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      summary: `Updated PI workflow stakeholder email configuration`,
    };
    setAuditLogs(prev => [log, ...prev]);
  }, []);

  const createProformaInvoice = useCallback((projectId: string, user = 'Project Manager') => {
    const project = projects.find(p => p.projectId === projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    const existingCount = proformaInvoices.filter(pi => pi.projectId === projectId).length;
    const newPI = generatePIDataFromProject(project, existingCount + 1, user, stakeholderEmails);

    const dateNow = new Date().toISOString().slice(0, 10);
    setProjects(prev => prev.map(p => {
      if (p.projectId !== projectId) return p;
      return {
        ...p,
        lastPiRaisedDate: dateNow,
      };
    }));

    setProformaInvoices(prev => [newPI, ...prev]);

    const log: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user,
      method: 'Manual',
      projectId,
      summary: `Created Proforma Invoice ${newPI.piNumber} (Draft) for project ${project.project}`,
    };
    setAuditLogs(prev => [log, ...prev]);

    return { success: true, pi: newPI };
  }, [projects, proformaInvoices, stakeholderEmails]);

  const submitPIForApproval = useCallback((piId: string, user = 'Project Manager', comment?: string) => {
    let targetProject: string | undefined;
    let targetPINumber = '';
    let submittedPI: ProformaInvoiceRecord | undefined;
    let stageToken = '';

    setProformaInvoices(prev => {
      return prev.map(pi => {
        if (pi.id !== piId) return pi;
        targetProject = pi.projectId;
        targetPINumber = pi.piNumber;

        stageToken = generateSecureActionToken(pi.id, 'PM_REVIEW', stakeholderEmails.pmEmail || '');
        const updatedHistory = [...pi.approvalHistory];
        const step: PIApprovalStepRecord = {
          id: `STEP-${Date.now()}-1`,
          stage: 'PM_REVIEW',
          stageLabel: 'Project Manager Review',
          reviewerName: pi.pmReviewer?.name || 'Project Manager',
          reviewerRole: 'Project Manager',
          reviewerEmail: stakeholderEmails.pmEmail || 'Email Not Configured',
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
          comment: comment || '',
          token: stageToken,
        };
        updatedHistory.push(step);

        const newPI: ProformaInvoiceRecord = {
          ...pi,
          status: 'PENDING_PM' as PIApprovalStatus,
          currentStage: 'PM_REVIEW' as PIApprovalStage,
          approvalHistory: updatedHistory,
          updatedAt: new Date().toISOString(),
          updatedBy: user,
        };
        submittedPI = newPI;
        return newPI;
      });
    });

    if (targetPINumber && submittedPI) {
      const log: AuditLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: formatLogTimestamp(),
        user,
        method: 'Manual',
        projectId: targetProject,
        summary: `Submitted Proforma Invoice ${targetPINumber} for PM approval`,
      };
      setAuditLogs(prev => [log, ...prev]);

      // External Email Dispatch (Resend Serverless API with safe simulation fallback)
      dispatchPIStageEmail(submittedPI, 'PM_REVIEW', stakeholderEmails, stageToken, user).then(res => {
        const deliveryLog = createPIDeliveryLog(submittedPI!, 'PM_REVIEW', res, stageToken);
        setProformaInvoices(current => current.map(p => {
          if (p.id !== piId) return p;
          return {
            ...p,
            emailDeliveryLogs: [deliveryLog, ...(p.emailDeliveryLogs || [])],
          };
        }));

        const emailAudit: AuditLogEntry = {
          id: `LOG-${Date.now()}`,
          timestamp: formatLogTimestamp(),
          user: 'System',
          method: 'Manual',
          projectId: targetProject,
          summary: `PI ${targetPINumber} Stage 1 email dispatch: ${res.status} to ${res.recipientEmail} (${res.recipientRole})${res.providerMessageId ? ' [ID: ' + res.providerMessageId + ']' : ''}${res.error ? ' [Note: ' + res.error + ']' : ''}`,
        };
        setAuditLogs(prev => [emailAudit, ...prev]);
      });

      return { success: true };
    }

    return { success: false, error: 'Proforma Invoice not found' };
  }, [stakeholderEmails]);

  const processPIApprovalAction = useCallback((
    piId: string,
    action: PIApprovalAction,
    user: string,
    role: string,
    comment?: string,
    reason?: string
  ) => {
    let targetPI: ProformaInvoiceRecord | undefined;
    let nextStagePI: ProformaInvoiceRecord | undefined;
    let nextStage: PIApprovalStage | undefined;
    let nextStageToken = '';
    let previousStatus = '';
    let newStatus = '';
    let currentStageStr = '';

    setProformaInvoices(prev => {
      return prev.map(pi => {
        if (pi.id !== piId) return pi;
        targetPI = pi;
        previousStatus = pi.status;
        currentStageStr = pi.currentStage;

        const history = [...pi.approvalHistory];
        const now = new Date().toISOString();

        if (action === 'REJECT') {
          // Reject stops workflow at current stage
          if (history.length > 0) {
            const lastIdx = history.length - 1;
            history[lastIdx] = {
              ...history[lastIdx],
              status: 'REJECTED',
              action: 'REJECT',
              reviewerName: user,
              reviewedAt: now,
              reason: reason || comment || 'Rejected',
              comment: comment || '',
            };
          }
          newStatus = 'REJECTED';
          return {
            ...pi,
            status: 'REJECTED' as PIApprovalStatus,
            approvalHistory: history,
            updatedAt: now,
            updatedBy: user,
          };
        }

        if (action === 'PUT_ON_HOLD') {
          if (history.length > 0) {
            const lastIdx = history.length - 1;
            history[lastIdx] = {
              ...history[lastIdx],
              status: 'ON_HOLD',
              action: 'PUT_ON_HOLD',
              reviewerName: user,
              reviewedAt: now,
              reason: reason || comment || 'Put on hold',
              comment: comment || '',
            };
          }
          newStatus = 'ON_HOLD';
          return {
            ...pi,
            status: 'ON_HOLD' as PIApprovalStatus,
            approvalHistory: history,
            updatedAt: now,
            updatedBy: user,
          };
        }

        if (action === 'APPROVE') {
          if (pi.currentStage === 'PM_REVIEW') {
            if (history.length > 0) {
              const lastIdx = history.length - 1;
              history[lastIdx] = {
                ...history[lastIdx],
                status: 'APPROVED',
                action: 'APPROVE',
                reviewerName: user,
                reviewedAt: now,
                comment: comment || '',
              };
            }
            // Add Sales Director Review step
            nextStageToken = generateSecureActionToken(pi.id, 'SALES_DIRECTOR_REVIEW', stakeholderEmails.salesDirectorEmail || '');
            history.push({
              id: `STEP-${Date.now()}-2`,
              stage: 'SALES_DIRECTOR_REVIEW',
              stageLabel: 'Sales Director Review',
              reviewerName: pi.salesDirectorReviewer?.name || 'Sales Director',
              reviewerRole: 'Sales Director',
              reviewerEmail: stakeholderEmails.salesDirectorEmail || 'Email Not Configured',
              status: 'PENDING',
              submittedAt: now,
              token: nextStageToken,
            });

            newStatus = 'PENDING_SALES_DIRECTOR';
            nextStage = 'SALES_DIRECTOR_REVIEW';
            const updated: ProformaInvoiceRecord = {
              ...pi,
              status: 'PENDING_SALES_DIRECTOR' as PIApprovalStatus,
              currentStage: 'SALES_DIRECTOR_REVIEW' as PIApprovalStage,
              approvalHistory: history,
              updatedAt: now,
              updatedBy: user,
            };
            nextStagePI = updated;
            return updated;
          } else if (pi.currentStage === 'SALES_DIRECTOR_REVIEW') {
            if (history.length > 0) {
              const lastIdx = history.length - 1;
              history[lastIdx] = {
                ...history[lastIdx],
                status: 'APPROVED',
                action: 'APPROVE',
                reviewerName: user,
                reviewedAt: now,
                comment: comment || '',
              };
            }
            // Add Managing Director Review step
            nextStageToken = generateSecureActionToken(pi.id, 'MANAGING_DIRECTOR_REVIEW', stakeholderEmails.managingDirectorEmail || '');
            history.push({
              id: `STEP-${Date.now()}-3`,
              stage: 'MANAGING_DIRECTOR_REVIEW',
              stageLabel: 'Managing Director Review',
              reviewerName: pi.managingDirectorReviewer?.name || 'Managing Director',
              reviewerRole: 'Managing Director',
              reviewerEmail: stakeholderEmails.managingDirectorEmail || 'Email Not Configured',
              status: 'PENDING',
              submittedAt: now,
              token: nextStageToken,
            });

            newStatus = 'PENDING_MANAGING_DIRECTOR';
            nextStage = 'MANAGING_DIRECTOR_REVIEW';
            const updated: ProformaInvoiceRecord = {
              ...pi,
              status: 'PENDING_MANAGING_DIRECTOR' as PIApprovalStatus,
              currentStage: 'MANAGING_DIRECTOR_REVIEW' as PIApprovalStage,
              approvalHistory: history,
              updatedAt: now,
              updatedBy: user,
            };
            nextStagePI = updated;
            return updated;
          } else if (pi.currentStage === 'MANAGING_DIRECTOR_REVIEW') {
            if (history.length > 0) {
              const lastIdx = history.length - 1;
              history[lastIdx] = {
                ...history[lastIdx],
                status: 'APPROVED',
                action: 'APPROVE',
                reviewerName: user,
                reviewedAt: now,
                comment: comment || '',
              };
            }
            newStatus = 'APPROVED';
            return {
              ...pi,
              status: 'APPROVED' as PIApprovalStatus,
              currentStage: 'COMPLETED' as PIApprovalStage,
              approvalHistory: history,
              updatedAt: now,
              updatedBy: user,
            };
          }
        }

        return pi;
      });
    });

    if (targetPI) {
      const log: AuditLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: formatLogTimestamp(),
        user,
        method: 'Manual',
        projectId: (targetPI as ProformaInvoiceRecord).projectId,
        summary: `PI ${(targetPI as ProformaInvoiceRecord).piNumber} action: ${action} by ${user} (${role}) at stage ${currentStageStr} (${previousStatus} -> ${newStatus})${comment ? ' - ' + comment : ''}`,
      };
      setAuditLogs(prev => [log, ...prev]);

      // If moved to next approval stage, dispatch the stage email
      if (nextStage && nextStagePI && nextStageToken) {
        dispatchPIStageEmail(nextStagePI, nextStage, stakeholderEmails, nextStageToken, user).then(res => {
          const deliveryLog = createPIDeliveryLog(nextStagePI!, nextStage!, res, nextStageToken);
          setProformaInvoices(current => current.map(p => {
            if (p.id !== piId) return p;
            return {
              ...p,
              emailDeliveryLogs: [deliveryLog, ...(p.emailDeliveryLogs || [])],
            };
          }));

          const emailAudit: AuditLogEntry = {
            id: `LOG-${Date.now()}`,
            timestamp: formatLogTimestamp(),
            user: 'System',
            method: 'Manual',
            projectId: (targetPI as ProformaInvoiceRecord).projectId,
            summary: `PI ${(targetPI as ProformaInvoiceRecord).piNumber} ${nextStage} email dispatch: ${res.status} to ${res.recipientEmail} (${res.recipientRole})${res.providerMessageId ? ' [ID: ' + res.providerMessageId + ']' : ''}${res.error ? ' [Note: ' + res.error + ']' : ''}`,
          };
          setAuditLogs(prev => [emailAudit, ...prev]);
        });
      }

      return { success: true };
    }

    return { success: false, error: 'Proforma Invoice not found' };
  }, [stakeholderEmails]);

  const editAndResubmitPI = useCallback((
    piId: string,
    modifications: {
      lineItems?: PILineItem[];
      unitPriceUSD?: number;
      taxRatePercent?: number | null;
      paymentTerm?: string;
    },
    user: string,
    changeReason: string
  ) => {
    let resultPI: ProformaInvoiceRecord | undefined;
    let err: string | undefined;

    setProformaInvoices(prev => {
      const existing = prev.find(p => p.id === piId);
      if (!existing) {
        err = 'Proforma Invoice not found';
        return prev;
      }
      if (existing.status === 'APPROVED') {
        err = 'Approved Proforma Invoices are immutable and cannot be edited';
        return prev;
      }

      const now = new Date().toISOString();
      const newVersionNum = existing.currentVersion + 1;
      const historyEntry: PIVersionRecord = {
        versionNumber: existing.currentVersion,
        createdAt: now,
        createdBy: user,
        snapshotData: {
          piNumber: existing.piNumber,
          projectId: existing.projectId,
          clientName: existing.clientName,
          projectName: existing.projectName,
          totalAmountUSD: existing.totalAmountUSD,
          taxAmountUSD: existing.taxAmountUSD,
          advanceRequiredUSD: existing.advanceUSD,
          balanceUSD: existing.balanceUSD,
          lineItems: existing.lineItems,
          termsAndConditions: existing.termsAndConditions,
          notes: existing.notes,
        },
        approvalHistory: [...existing.approvalHistory],
        status: existing.status,
      };

      const updatedLineItems = modifications.lineItems ? modifications.lineItems : existing.lineItems.map(item => {
        if (modifications.unitPriceUSD !== undefined) {
          const amount = item.quantity * modifications.unitPriceUSD;
          return { ...item, unitPriceUSD: modifications.unitPriceUSD, amountUSD: amount };
        }
        return item;
      });

      const subtotal = updatedLineItems.reduce((acc, item) => acc + (item.amountUSD || 0), 0);
      const taxRate = modifications.taxRatePercent !== undefined ? modifications.taxRatePercent : existing.taxRatePercent;
      const taxAmount = taxRate ? (subtotal * taxRate) / 100 : null;
      const totalAmount = subtotal + (taxAmount || 0);

      const resetHistory: PIApprovalStepRecord[] = [
        {
          id: `STEP-${Date.now()}-1`,
          stage: 'PM_REVIEW',
          stageLabel: 'Project Manager Review',
          reviewerName: existing.pmReviewer?.name || 'Project Manager',
          reviewerRole: 'Project Manager',
          reviewerEmail: stakeholderEmails.pmEmail || 'Email Not Configured',
          status: 'PENDING',
          submittedAt: now,
          token: generateSecureActionToken(existing.id, 'PM_REVIEW', stakeholderEmails.pmEmail || ''),
          comment: `Resubmitted v${newVersionNum}: ${changeReason}`,
        }
      ];

      const updatedPI: ProformaInvoiceRecord = {
        ...existing,
        currentVersion: newVersionNum,
        lineItems: updatedLineItems,
        subtotalUSD: subtotal,
        taxRatePercent: taxRate,
        taxAmountUSD: taxAmount,
        totalAmountUSD: totalAmount,
        paymentTerm: modifications.paymentTerm !== undefined ? modifications.paymentTerm : existing.paymentTerm,
        status: 'PENDING_PM',
        currentStage: 'PM_REVIEW',
        approvalHistory: resetHistory,
        versions: [...existing.versions, historyEntry],
        updatedAt: now,
        updatedBy: user,
      };

      resultPI = updatedPI;
      return prev.map(p => p.id === piId ? updatedPI : p);
    });

    if (err) {
      return { success: false, error: err };
    }

    if (resultPI) {
      const log: AuditLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: formatLogTimestamp(),
        user,
        method: 'Manual',
        projectId: (resultPI as ProformaInvoiceRecord).projectId,
        summary: `Edited and resubmitted PI ${(resultPI as ProformaInvoiceRecord).piNumber} as Version ${(resultPI as ProformaInvoiceRecord).currentVersion}. Reason: ${changeReason}`,
      };
      setAuditLogs(prev => [log, ...prev]);
      return { success: true, newVersion: (resultPI as ProformaInvoiceRecord).currentVersion };
    }

    return { success: false, error: 'Failed to update PI' };
  }, [stakeholderEmails]);

  const recallPIRequest = useCallback((piId: string, user: string, recallReason: string, comment?: string) => {
    let targetPI: ProformaInvoiceRecord | undefined;

    setProformaInvoices(prev => {
      return prev.map(pi => {
        if (pi.id !== piId) return pi;
        targetPI = pi;
        const now = new Date().toISOString();
        const history = [...pi.approvalHistory];
        if (history.length > 0) {
          const lastIdx = history.length - 1;
          history[lastIdx] = {
            ...history[lastIdx],
            status: 'RECALLED',
            action: 'RECALL',
            reviewerName: user,
            reviewedAt: now,
            reason: recallReason,
            comment: comment || '',
          };
        }
        return {
          ...pi,
          status: 'RECALLED' as PIApprovalStatus,
          approvalHistory: history,
          updatedAt: now,
          updatedBy: user,
        };
      });
    });

    if (targetPI) {
      const log: AuditLogEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: formatLogTimestamp(),
        user,
        method: 'Manual',
        projectId: (targetPI as ProformaInvoiceRecord).projectId,
        summary: `Recalled PI ${(targetPI as ProformaInvoiceRecord).piNumber}. Reason: ${recallReason}${comment ? ' - Comment: ' + comment : ''}`,
      };
      setAuditLogs(prev => [log, ...prev]);
      return { success: true };
    }
    return { success: true };
  }, []);

  const retryPIApprovalEmail = useCallback(async (piId: string) => {
    const pi = proformaInvoices.find(p => p.id === piId);
    if (!pi) return { success: false, error: 'PI not found' };
    if (pi.status === 'APPROVED' || pi.status === 'DRAFT') {
      return { success: false, error: 'Email delivery retry only applicable for active pending approval stages' };
    }

    const currentStep = pi.approvalHistory[pi.approvalHistory.length - 1];
    const token = currentStep?.token || generateSecureActionToken(pi.id, pi.currentStage, '');
    const res = await dispatchPIStageEmail(pi, pi.currentStage, stakeholderEmails, token, 'Administrator');
    const deliveryLog = createPIDeliveryLog(pi, pi.currentStage, res, token);

    setProformaInvoices(prev => prev.map(p => {
      if (p.id !== piId) return p;
      return {
        ...p,
        emailDeliveryLogs: [deliveryLog, ...(p.emailDeliveryLogs || [])],
      };
    }));

    const log: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user: 'Administrator',
      method: 'Manual',
      projectId: pi.projectId,
      summary: `Manual retry of PI ${pi.piNumber} stage email (${pi.currentStage}): ${res.status} to ${res.recipientEmail}`,
    };
    setAuditLogs(prev => [log, ...prev]);

    return { success: res.success, status: res.status, error: res.error };
  }, [proformaInvoices, stakeholderEmails]);

  const resetToInitialData = useCallback(() => {
    setProjects(projectMasterData);
    setDesignSchedules(designScheduleData);
    setProductionRecords(productionData);
    setShipments(shipmentData);
    setPayments(paymentData);
    setDocuments([]);
    setDesignAreaElements([]);
    setSitePhotos([]);
    setWeeklyProgress([]);
    setSiteExecutionInfos({});

    localStorage.removeItem(STORAGE_PROJECTS_KEY);
    localStorage.removeItem(STORAGE_DESIGN_KEY);
    localStorage.removeItem(STORAGE_PRODUCTION_KEY);
    localStorage.removeItem(STORAGE_SHIPMENTS_KEY);
    localStorage.removeItem(STORAGE_PAYMENTS_KEY);
    localStorage.removeItem(STORAGE_DOCUMENTS_KEY);
    localStorage.removeItem(STORAGE_DESIGN_ELEMENTS_KEY);
    localStorage.removeItem(STORAGE_SITE_PHOTOS_KEY);
    localStorage.removeItem(STORAGE_WEEKLY_PROGRESS_KEY);
    localStorage.removeItem(STORAGE_SITE_EXEC_KEY);
    localStorage.removeItem(STORAGE_PI_KEY);
    localStorage.removeItem(STORAGE_STAKEHOLDERS_KEY);
    setProformaInvoices([]);
    setStakeholderEmails(DEFAULT_STAKEHOLDER_EMAILS);

    const resetLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: formatLogTimestamp(),
      user: 'Administrator',
      method: 'Manual',
      summary: 'Reset project data to original excel baseline',
    };
    setAuditLogs(prev => [resetLog, ...prev]);
  }, []);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    localStorage.removeItem(STORAGE_AUDIT_LOGS_KEY);
  }, []);

  const value = useMemo(() => ({
    projects,
    designSchedules,
    productionRecords,
    shipments,
    payments,
    documents,
    designAreaElements,
    sitePhotos,
    weeklyProgress,
    siteExecutionInfos,
    auditLogs,
    notifications,
    proformaInvoices,
    stakeholderEmails,
    getProjectById,
    getProjectsByCountry,
    getProjectsByCustomer,
    getProjectsByStatus,
    getDesignForProject,
    getProductionForProject,
    getShipmentsForProject,
    getShipmentForProject,
    getPaymentsForProject,
    getDocumentsForProject,
    getDesignAreaElementsForProject,
    getSitePhotosForProject,
    getWeeklyProgressForProject,
    getSiteExecutionInfoForProject,
    getPIsForProject,
    getPIById,
    getLastApprovedPIDate,
    getNormalizedMISDataset,
    getNotificationsForUser,
    getUniqueCountries,
    getUniqueCustomers,
    getUniqueStatuses,
    getDashboardKPIs,
    getAttentionProjects,
    getDelayedProjects,
    getTotalOutstandingBalance,
    updateProjectManual,
    addProjectManual,
    updateDesignSchedule,
    updateProductionRecord,
    addProductionEntry,
    updateShipmentRecord,
    recordNewPayment,
    updatePaymentRow,
    deletePaymentRow,
    commitExcelImport,
    addProjectDocument,
    addDocumentVersion,
    archiveDocument,
    saveDesignAreaElement,
    addSitePhoto,
    addWeeklyProgress,
    updateSiteExecutionInfo,
    updateStakeholderEmails,
    createProformaInvoice,
    submitPIForApproval,
    processPIApprovalAction,
    editAndResubmitPI,
    recallPIRequest,
    retryPIApprovalEmail,
    markNotificationAsRead,
    dismissNotification,
    markAllNotificationsAsRead,
    resetToInitialData,
    clearAuditLogs,
  }), [
    projects,
    designSchedules,
    productionRecords,
    shipments,
    payments,
    documents,
    designAreaElements,
    sitePhotos,
    weeklyProgress,
    siteExecutionInfos,
    auditLogs,
    notifications,
    proformaInvoices,
    stakeholderEmails,
    getProjectById,
    getProjectsByCountry,
    getProjectsByCustomer,
    getProjectsByStatus,
    getDesignForProject,
    getProductionForProject,
    getShipmentsForProject,
    getShipmentForProject,
    getPaymentsForProject,
    getDocumentsForProject,
    getDesignAreaElementsForProject,
    getSitePhotosForProject,
    getWeeklyProgressForProject,
    getSiteExecutionInfoForProject,
    getPIsForProject,
    getPIById,
    getLastApprovedPIDate,
    getNormalizedMISDataset,
    getNotificationsForUser,
    getUniqueCountries,
    getUniqueCustomers,
    getUniqueStatuses,
    getDashboardKPIs,
    getAttentionProjects,
    getDelayedProjects,
    getTotalOutstandingBalance,
    updateProjectManual,
    addProjectManual,
    updateDesignSchedule,
    updateProductionRecord,
    addProductionEntry,
    updateShipmentRecord,
    recordNewPayment,
    updatePaymentRow,
    deletePaymentRow,
    commitExcelImport,
    addProjectDocument,
    addDocumentVersion,
    archiveDocument,
    saveDesignAreaElement,
    addSitePhoto,
    addWeeklyProgress,
    updateSiteExecutionInfo,
    updateStakeholderEmails,
    createProformaInvoice,
    submitPIForApproval,
    processPIApprovalAction,
    editAndResubmitPI,
    recallPIRequest,
    retryPIApprovalEmail,
    markNotificationAsRead,
    dismissNotification,
    markAllNotificationsAsRead,
    resetToInitialData,
    clearAuditLogs,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
