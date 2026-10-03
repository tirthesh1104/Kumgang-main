import * as XLSX from 'xlsx';
import type { ProjectMaster, ShipmentRecord, PaymentRecord } from '../data/projectData';
import { getProjectScope } from './scopeUtils';

/**
 * Determine Financial Year (FY) from a date string (April 1 to March 31).
 * E.g., 15-05-2025 -> FY 2025-26
 * E.g., 10-02-2026 -> FY 2025-26
 */
export function getFinancialYearFromDate(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') return 'Not Available';
  
  // Try to parse year, month from common formats: YYYY-MM-DD, DD-MM-YYYY, YYYY/MM/DD, etc.
  const cleanStr = dateStr.trim();
  let year: number | null = null;
  let month: number | null = null;

  // Match ISO YYYY-MM-DD
  const isoMatch = cleanStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
  } else {
    // Match DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      month = parseInt(dmyMatch[2], 10);
      year = parseInt(dmyMatch[3], 10);
    } else {
      // Fallback: check 4-digit year in string
      const yMatch = cleanStr.match(/(20\d{2})/);
      if (yMatch) {
        year = parseInt(yMatch[1], 10);
        // Default month to 4 (April) if unspecified
        month = 4;
      }
    }
  }

  if (!year || isNaN(year)) return 'Not Available';

  // If month is Jan(1), Feb(2), or Mar(3), FY belongs to (year-1)-(year)
  // E.g., Feb 2026 -> FY 2025-26
  if (month && month >= 1 && month <= 3) {
    const prevYear = year - 1;
    const shortNextYear = String(year).slice(-2);
    return `FY ${prevYear}-${shortNextYear}`;
  } else {
    // April to December -> FY year-(year+1)
    // E.g., May 2025 -> FY 2025-26
    const nextYear = year + 1;
    const shortNextYear = String(nextYear).slice(-2);
    return `FY ${year}-${shortNextYear}`;
  }
}

/**
 * Get Month Name from date string.
 * E.g., 15-05-2025 -> May
 */
export function getMonthFromDate(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') return 'Not Available';

  const cleanStr = dateStr.trim();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const isoMatch = cleanStr.match(/^(\d{4})[-/](\d{1,2})/);
  if (isoMatch) {
    const m = parseInt(isoMatch[2], 10);
    if (m >= 1 && m <= 12) return months[m - 1];
  }

  const dmyMatch = cleanStr.match(/^\d{1,2}[-/](\d{1,2})[-/]/);
  if (dmyMatch) {
    const m = parseInt(dmyMatch[1], 10);
    if (m >= 1 && m <= 12) return months[m - 1];
  }

  // Try text month names
  for (const mName of months) {
    if (cleanStr.toLowerCase().includes(mName.toLowerCase())) return mName;
  }

  return 'Not Available';
}

/**
 * Export Dispatch Report data to native Excel file (.xlsx)
 */
export function exportDispatchReportToExcel(shipments: ShipmentRecord[], projects: ProjectMaster[]) {
  const projectMap = new Map<string, ProjectMaster>();
  projects.forEach(p => projectMap.set(p.projectId, p));

  const exportRows = shipments.map(s => {
    const project = projectMap.get(s.projectId);
    const dateStr = s.etd || s.loadingDate || s.invoiceDate || null;
    const companyScope = project ? getProjectScope(project) : 'Not Available';

    return {
      'Shipment ID': s.shipmentId || 'Not Available',
      'Project ID': s.projectId || 'Not Available',
      'Project Name': project?.project || s.block || 'Not Available',
      'Client Name': project?.customer || 'Not Available',
      'Company Scope': companyScope,
      'Dispatch Date': dateStr || 'Not Available',
      'Financial Year': getFinancialYearFromDate(dateStr),
      'Month': getMonthFromDate(dateStr),
      'Dispatch Qty (m²)': s.dispatchQtyM2 ?? (project ? (project.contractQtyM2 || project.actualDesignQtyM2 || 'Not Available') : 'Not Available'),
      'Invoice Number': s.invoiceNumber || 'Not Available',
      'Invoice Date': s.invoiceDate || 'Not Available',
      'Unit Price ($)': s.unitPrice ?? 'Not Available',
      'Invoice Amount ($)': s.invoiceAmount ?? 'Not Available',
      'Container Total': s.containerTotal ?? 'Not Available',
      'Container Size': s.containerSize || 'Not Available',
      'BCS Qty (m²)': s.bcsQty ?? 'Not Available',
      'ACS Qty (m²)': s.acsQty ?? 'Not Available',
      'KGBH Qty (m²)': s.kgbhQty ?? 'Not Available',
      'KSBH Qty (m²)': s.ksbhQty ?? 'Not Available',
      'Aluform Qty (m²)': s.aluformQty ?? 'Not Available',
      'Shipment Status': s.status || 'Not Available',
      'Incoterm': s.incoterm || 'Not Available',
      'Delivery Timeline': s.deliveryTimeline || 'Not Available',
      'Vessel Name': s.vesselName || 'Not Available',
      'Bill of Lading': s.billOfLading || 'Not Available',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dispatch Report');

  // Format column widths
  const colWidths = Object.keys(exportRows[0] || {}).map(key => ({
    wch: Math.max(key.length + 3, 15)
  }));
  worksheet['!cols'] = colWidths;

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Kumkang_Dispatch_Report_${timestamp}.xlsx`);
}

/**
 * Export Receivable Report data to native Excel file (.xlsx)
 */
export function exportReceivableReportToExcel(projects: ProjectMaster[], _payments?: PaymentRecord[]) {
  const exportRows = projects.map(p => {
    const scope = getProjectScope(p);
    const contractVal = p.totalAmountUSD || p.actualTotalAmount || 0;
    const advanceVal = p.advanceUSD || 0;
    const balanceVal = p.balanceUSD ?? Math.max(0, contractVal - advanceVal);
    const paymentPct = contractVal > 0 ? Math.round((advanceVal / contractVal) * 100) : 0;

    return {
      'Project ID': p.projectId || 'Not Available',
      'Project Name': p.project || 'Not Available',
      'Client Name': p.customer || 'Not Available',
      'Company Scope': scope,
      'Vendor Company': p.vendorCompany || scope,
      'PO Number': p.poNumber || 'Not Available',
      'PO Date': p.poDate || p.contractDate || 'Not Available',
      'Contract Amount': contractVal ? Number(contractVal) : 'Not Available',
      'Actual Total Amount': p.actualTotalAmount ?? 'Not Available',
      'Actual Total Receivable': p.actualTotalReceivable ?? advanceVal ?? 'Not Available',
      'Actual Balance Amount': balanceVal ?? 'Not Available',
      'Payment Status': p.paymentStatus || 'Not Available',
      'Payment Received %': `${paymentPct}%`,
      'Last PI Raised Date': p.lastPiRaisedDate || 'Not Available',
      'Due Days': p.dueDays ?? 'Not Available',
      'PO Payment Terms': p.poPaymentTerm || p.paymentTerm || 'Not Available',
      'BG Amount': p.bgAmount ?? 'Not Available',
      'BG %': p.bgPercent ? `${p.bgPercent}%` : 'Not Available',
      'LC Amount': p.lcAmount ?? 'Not Available',
      'LC %': p.lcPercent ? `${p.lcPercent}%` : 'Not Available',
      'BG Expiry Date': p.bgExpiryDate || 'Not Available',
      'LC Expiry Date': p.lcExpiryDate || 'Not Available',
      'Contract Status': p.contractStatus || 'Not Available',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Receivable Report');

  const colWidths = Object.keys(exportRows[0] || {}).map(key => ({
    wch: Math.max(key.length + 3, 16)
  }));
  worksheet['!cols'] = colWidths;

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Kumkang_Receivable_Report_${timestamp}.xlsx`);
}
