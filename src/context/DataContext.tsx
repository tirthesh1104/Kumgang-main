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
  auditLogs: AuditLogEntry[];
  
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

  commitExcelImport: (
    updatedProjectsMap: Map<string, Partial<ProjectMaster>>,
    newProjectsList: ProjectMaster[],
    fileInfo: { filename: string; recordCount: number },
    user?: string
  ) => { success: boolean; updatedCount: number; newCount: number };

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
  // Initialize projects from localStorage or default static projectMasterData
  const [projects, setProjects] = useState<ProjectMaster[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
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

  const resetToInitialData = useCallback(() => {
    setProjects(projectMasterData);
    setDesignSchedules(designScheduleData);
    setProductionRecords(productionData);
    setShipments(shipmentData);
    setPayments(paymentData);

    localStorage.removeItem(STORAGE_PROJECTS_KEY);
    localStorage.removeItem(STORAGE_DESIGN_KEY);
    localStorage.removeItem(STORAGE_PRODUCTION_KEY);
    localStorage.removeItem(STORAGE_SHIPMENTS_KEY);
    localStorage.removeItem(STORAGE_PAYMENTS_KEY);

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
    auditLogs,
    getProjectById,
    getProjectsByCountry,
    getProjectsByCustomer,
    getProjectsByStatus,
    getDesignForProject,
    getProductionForProject,
    getShipmentsForProject,
    getShipmentForProject,
    getPaymentsForProject,
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
    commitExcelImport,
    resetToInitialData,
    clearAuditLogs,
  }), [
    projects,
    designSchedules,
    productionRecords,
    shipments,
    payments,
    auditLogs,
    getProjectById,
    getProjectsByCountry,
    getProjectsByCustomer,
    getProjectsByStatus,
    getDesignForProject,
    getProductionForProject,
    getShipmentsForProject,
    getShipmentForProject,
    getPaymentsForProject,
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
    commitExcelImport,
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
