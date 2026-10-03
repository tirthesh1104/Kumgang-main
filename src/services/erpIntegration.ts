import type { ProjectMaster, ShipmentRecord, PaymentRecord } from '../data/projectData';

export interface CompanySalesBreakdown {
  company: 'KKV' | 'KKI' | 'KKHQ';
  signedCount: number;
  totalContractUSD: number;
  advanceUSD: number;
  balanceUSD: number;
}

export interface MonthDispatchSummary {
  monthKey: string; // 'Apr', 'May', 'Jun', etc.
  monthName: string;
  dispatchM2: number;
  shipmentCount: number;
}

export interface CompanyReceivableBreakdown {
  company: 'KKV' | 'KKI' | 'KKHQ';
  totalReceivableUSD: number;
  paidAmountUSD: number;
  outstandingBalanceUSD: number;
  overdueProjectCount: number;
}

export interface CompanySummary {
  company: 'KKV' | 'KKI' | 'KKHQ';
  currencySymbol: string;
  projectCount: number;
  totalSales: number;
  totalReceived: number;
  totalReceivables: number;
}

export interface NormalizedMISDataset {
  timestamp: string;
  isExternalApiConnected: boolean;
  erpEndpointUrl: string | null;
  totalProjects: number;
  signedProjects: number;
  totalContractValueUSD: number;
  totalAdvanceUSD: number;
  totalBalanceUSD: number;
  companySummaries: CompanySummary[];
  salesBreakdown: CompanySalesBreakdown[];
  dispatchSummary: MonthDispatchSummary[];
  receivablesBreakdown: CompanyReceivableBreakdown[];
}

export function buildNormalizedMISDataset(
  projects: ProjectMaster[],
  shipments: ShipmentRecord[],
  _payments: PaymentRecord[]
): NormalizedMISDataset {
  const erpEndpointUrl = import.meta.env.VITE_ERP_API_URL || null;
  const isExternalApiConnected = Boolean(erpEndpointUrl);

  const signedProjects = projects.filter(p => p.contractStatus === 'Signed');
  const totalContractValueUSD = signedProjects.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);
  const totalAdvanceUSD = signedProjects.reduce((sum, p) => sum + (p.advanceUSD || 0), 0);
  const totalBalanceUSD = signedProjects.reduce((sum, p) => sum + (p.balanceUSD || 0), 0);

  const companies: ('KKV' | 'KKI' | 'KKHQ')[] = ['KKV', 'KKI', 'KKHQ'];

  // Company Summaries
  const companySummaries: CompanySummary[] = companies.map(comp => {
    const compProjects = signedProjects.filter(p => {
      const v = (p.vendorCompany || '').toUpperCase();
      if (comp === 'KKV') return v.includes('KKV') || p.country === 'Vietnam';
      if (comp === 'KKHQ') return v.includes('KKHQ') || p.country === 'Korea' || p.country === 'South Korea';
      return v.includes('KKI') || (!v.includes('KKV') && !v.includes('KKHQ') && p.country === 'India');
    });

    const totalSales = compProjects.reduce((sum, p) => sum + (p.totalAmountUSD || p.actualTotalAmount || 0), 0);
    const totalReceived = compProjects.reduce((sum, p) => sum + (p.advanceUSD || p.paymentStatusAmount || 0), 0);
    const totalReceivables = compProjects.reduce((sum, p) => sum + (p.balanceUSD || 0), 0);

    return {
      company: comp,
      currencySymbol: comp === 'KKI' ? '₹' : '$',
      projectCount: compProjects.length,
      totalSales,
      totalReceived,
      totalReceivables,
    };
  });

  // 1. Sales breakdown by Company (KKV, KKI, KKHQ)
  const salesBreakdown: CompanySalesBreakdown[] = companies.map(company => {
    const compProjects = signedProjects.filter(p => (p.vendorCompany || 'KKI').toUpperCase() === company);
    return {
      company,
      signedCount: compProjects.length,
      totalContractUSD: compProjects.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0),
      advanceUSD: compProjects.reduce((sum, p) => sum + (p.advanceUSD || 0), 0),
      balanceUSD: compProjects.reduce((sum, p) => sum + (p.balanceUSD || 0), 0),
    };
  });

  // 2. Month-wise Dispatch Summary (Apr to Mar)
  const months = [
    { key: 'Apr', name: 'April' },
    { key: 'May', name: 'May' },
    { key: 'Jun', name: 'June' },
    { key: 'Jul', name: 'July' },
    { key: 'Aug', name: 'August' },
    { key: 'Sep', name: 'September' },
    { key: 'Oct', name: 'October' },
    { key: 'Nov', name: 'November' },
    { key: 'Dec', name: 'December' },
    { key: 'Jan', name: 'January' },
    { key: 'Feb', name: 'February' },
    { key: 'Mar', name: 'March' },
  ];

  const dispatchSummary: MonthDispatchSummary[] = months.map(m => {
    const matchingShipments = shipments.filter(s => {
      const dateStr = s.etd || s.loadingDate || '';
      return dateStr.toLowerCase().includes(m.key.toLowerCase());
    });
    const dispatchM2 = matchingShipments.reduce((sum, s) => sum + (s.dispatchQtyM2 || 0), 0);
    return {
      monthKey: m.key,
      monthName: m.name,
      dispatchM2,
      shipmentCount: matchingShipments.length,
    };
  });

  // 3. Receivables Breakdown by Company (KKV, KKI, KKHQ)
  const receivablesBreakdown: CompanyReceivableBreakdown[] = companies.map(company => {
    const compProjects = signedProjects.filter(p => (p.vendorCompany || 'KKI').toUpperCase() === company);
    const totalReceivable = compProjects.reduce((sum, p) => sum + (p.actualTotalReceivable || p.totalAmountUSD || 0), 0);
    const paidAmount = compProjects.reduce((sum, p) => sum + (p.paymentStatusAmount || p.advanceUSD || 0), 0);
    const balanceUSD = compProjects.reduce((sum, p) => sum + (p.balanceUSD || 0), 0);
    const overdueCount = compProjects.filter(p => (p.dueDays || 0) > 0 || p.paymentStatus === 'Overdue').length;

    return {
      company,
      totalReceivableUSD: totalReceivable,
      paidAmountUSD: paidAmount,
      outstandingBalanceUSD: balanceUSD,
      overdueProjectCount: overdueCount,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    isExternalApiConnected,
    erpEndpointUrl,
    totalProjects: projects.length,
    signedProjects: signedProjects.length,
    totalContractValueUSD,
    totalAdvanceUSD,
    totalBalanceUSD,
    companySummaries,
    salesBreakdown,
    dispatchSummary,
    receivablesBreakdown,
  };
}
