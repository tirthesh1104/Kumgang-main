import * as XLSX from 'xlsx';
import type { ProjectMaster } from '../data/projectData';
import { validateProjectMaster } from './dataValidation';

export interface ExcelDiffItem {
  projectId: string;
  projectName: string;
  field: string;
  fieldLabel: string;
  existingValue: string | number | null;
  newValue: string | number | null;
  status: 'Updated' | 'New' | 'Unchanged' | 'Error';
}

export interface ExcelConflictItem {
  projectId: string;
  field: string;
  valueSheetA: string | number | null;
  valueSheetB: string | number | null;
}

export interface ExcelParseResult {
  fileName: string;
  sheets: string[];
  selectedSheet: string;
  totalRowsProcessed: number;
  updatedCount: number;
  newCount: number;
  unchangedCount: number;
  errorCount: number;
  diffItems: ExcelDiffItem[];
  conflicts: ExcelConflictItem[];
  newProjects: ProjectMaster[];
  updatedProjectsMap: Map<string, Partial<ProjectMaster>>;
  invalidRows: { rowNumber: number; reason: string }[];
}

function normalizeHeader(header: string): string {
  return String(header)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function parseNumeric(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const cleaned = String(val).replace(/[\$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Maps Excel row key-value pairs into a standardized ProjectMaster object
 */
function mapRowToProjectMaster(row: Record<string, any>, sheetName: string): Partial<ProjectMaster> {
  const normKeys: Record<string, any> = {};
  Object.keys(row).forEach(k => {
    normKeys[normalizeHeader(k)] = row[k];
  });

  const getVal = (...possibleHeaders: string[]) => {
    for (const h of possibleHeaders) {
      const norm = normalizeHeader(h);
      if (normKeys[norm] !== undefined && normKeys[norm] !== null && normKeys[norm] !== '') {
        return normKeys[norm];
      }
    }
    return null;
  };

  const projectId = parseString(getVal('projectId', 'project id', 'id', 'ref', 'projectref'));
  const country = parseString(getVal('country', 'location', 'nation')) || 'India';
  const customer = parseString(getVal('customer', 'client', 'buyer'));
  const project = parseString(getVal('project', 'project name', 'name', 'title'));
  const block = parseString(getVal('block', 'tower', 'unit', 'phase'));
  const contractDate = parseString(getVal('contract date', 'contractdate', 'date'));
  const contractStatus = parseString(getVal('contract status', 'contractstatus', 'status')) || 'Signed';
  const contractQtyM2 = parseNumeric(getVal('contract qty m2', 'contractqtym2', 'qty m2', 'quantity m2'));
  const contractWeightTons = parseNumeric(getVal('contract weight tons', 'contractweighttons', 'weight tons', 'weight'));
  const actualDesignQtyM2 = parseNumeric(getVal('actual design qty m2', 'actualdesignqtym2', 'design qty'));
  const actualDesignWeightTons = parseNumeric(getVal('actual design weight tons', 'actualdesignweighttons', 'design weight'));
  const designProgressPercent = parseNumeric(getVal('design progress percent', 'designprogresspercent', 'progress %', 'progress'));
  const pricePerM2USD = parseNumeric(getVal('price per m2 usd', 'priceperm2usd', 'rate usd', 'price usd'));
  const totalAmountUSD = parseNumeric(getVal('total amount usd', 'totalamountusd', 'contract value usd', 'amount usd', 'total usd'));
  const advanceUSD = parseNumeric(getVal('advance usd', 'advanceusd', 'advance paid usd', 'advance paid'));
  const balanceUSD = parseNumeric(getVal('balance usd', 'balanceusd', 'balance due usd', 'balance'));
  const shellPlanConfirmation = parseString(getVal('shell plan confirmation', 'shellplanconfirmation', 'shell plan'));
  const mdCompletion = parseString(getVal('md completion', 'mdcompletion', 'md date'));
  const productionStart = parseString(getVal('production start', 'productionstart'));
  const productionComplete = parseString(getVal('production complete', 'productioncomplete'));
  const deliveryRequest = parseString(getVal('delivery request', 'deliveryrequest'));
  const loadingDate = parseString(getVal('loading date', 'loadingdate'));
  const etd = parseString(getVal('etd'));
  const eta = parseString(getVal('eta'));
  const fwd = parseString(getVal('fwd'));
  const paymentTerm = parseString(getVal('payment term', 'paymentterm', 'terms'));
  const paymentStatus = parseString(getVal('payment status', 'paymentstatus'));
  const incoterm = parseString(getVal('incoterm', 'incoterms'));
  const remark = parseString(getVal('remark', 'remarks', 'notes'));

  return {
    projectId,
    country,
    customer,
    project,
    block,
    contractDate: contractDate || null,
    contractStatus,
    contractQtyM2,
    contractWeightTons,
    actualDesignQtyM2,
    actualDesignWeightTons,
    designProgressPercent,
    pricePerM2USD,
    totalAmountUSD,
    advanceUSD,
    balanceUSD,
    shellPlanConfirmation: shellPlanConfirmation || null,
    mdCompletion: mdCompletion || null,
    productionStart: productionStart || null,
    productionComplete: productionComplete || null,
    deliveryRequest: deliveryRequest || null,
    loadingDate: loadingDate || null,
    etd: etd || null,
    eta: eta || null,
    fwd: fwd || null,
    paymentTerm,
    paymentStatus,
    incoterm,
    remark,
    sourceSheet: sheetName,
  };
}

const READABLE_LABELS: Record<string, string> = {
  project: 'Project Name',
  customer: 'Customer',
  country: 'Country',
  block: 'Block/Tower',
  contractStatus: 'Status',
  contractQtyM2: 'Contract Qty (m²)',
  contractWeightTons: 'Contract Weight (Tons)',
  actualDesignQtyM2: 'Actual Design Qty (m²)',
  actualDesignWeightTons: 'Actual Design Weight (Tons)',
  designProgressPercent: 'Design Progress (%)',
  pricePerM2USD: 'Price/m² (USD)',
  totalAmountUSD: 'Total Amount (USD)',
  advanceUSD: 'Advance Paid (USD)',
  balanceUSD: 'Balance Due (USD)',
  shellPlanConfirmation: 'Shell Plan Confirm Date',
  mdCompletion: 'MD Completion Date',
  productionStart: 'Production Start Date',
  productionComplete: 'Production Complete Date',
  loadingDate: 'Loading Date',
  etd: 'ETD',
  eta: 'ETA',
  paymentTerm: 'Payment Terms',
  paymentStatus: 'Payment Status',
  remark: 'Remarks',
};

/**
 * Parses an uploaded Excel file and builds a change preview against existing projects
 */
export async function parseAndPreviewExcel(
  file: File,
  existingProjects: ProjectMaster[]
): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    throw new Error('The uploaded Excel workbook contains no sheets.');
  }

  // Select preferred sheet or first available
  const preferredSheet = sheetNames.find(s =>
    s.toLowerCase().includes('detail list') ||
    s.toLowerCase().includes('project master') ||
    s.toLowerCase().includes('master')
  ) || sheetNames[0];

  const worksheet = workbook.Sheets[preferredSheet];
  const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const invalidRows: { rowNumber: number; reason: string }[] = [];
  const updatedProjectsMap = new Map<string, Partial<ProjectMaster>>();
  const newProjects: ProjectMaster[] = [];
  const diffItems: ExcelDiffItem[] = [];
  const conflicts: ExcelConflictItem[] = [];

  let updatedCount = 0;
  let newCount = 0;
  let unchangedCount = 0;

  const existingMap = new Map(existingProjects.map(p => [p.projectId, p]));

  jsonData.forEach((row, idx) => {
    const rowNum = idx + 2; // Accounting for 1-based index + header row
    const mapped = mapRowToProjectMaster(row, preferredSheet);

    if (!mapped.projectId) {
      invalidRows.push({ rowNumber: rowNum, reason: 'Missing Project ID' });
      return;
    }

    const valResult = validateProjectMaster(mapped);
    if (!valResult.isValid) {
      invalidRows.push({ rowNumber: rowNum, reason: valResult.errors.map(e => e.message).join('; ') });
      return;
    }

    const existingP = existingMap.get(mapped.projectId);

    if (existingP) {
      // Compare fields to detect changes
      const changes: Partial<ProjectMaster> = {};
      let hasChange = false;

      (Object.keys(mapped) as (keyof ProjectMaster)[]).forEach(key => {
        if (key === 'sourceSheet') return;
        const incomingVal = mapped[key];
        const currentVal = existingP[key];

        // Skip if incoming is null/empty and current already has a value (don't overwrite with blanks unless explicit)
        if ((incomingVal === null || incomingVal === '' || incomingVal === undefined) && (currentVal !== null && currentVal !== '')) {
          return;
        }

        if (incomingVal !== undefined && incomingVal !== currentVal) {
          (changes as any)[key] = incomingVal;
          hasChange = true;

          diffItems.push({
            projectId: existingP.projectId,
            projectName: existingP.project || existingP.projectId,
            field: String(key),
            fieldLabel: READABLE_LABELS[String(key)] || String(key),
            existingValue: currentVal ?? '—',
            newValue: incomingVal ?? '—',
            status: 'Updated',
          });
        }
      });

      if (hasChange) {
        updatedProjectsMap.set(mapped.projectId, changes);
        updatedCount++;
      } else {
        unchangedCount++;
      }
    } else {
      // New project
      const fullNewProject: ProjectMaster = {
        projectId: mapped.projectId,
        country: mapped.country || 'India',
        customer: mapped.customer || 'New Client',
        project: mapped.project || mapped.projectId,
        block: mapped.block || '',
        contractDate: mapped.contractDate || null,
        contractStatus: mapped.contractStatus || 'Signed',
        contractQtyM2: mapped.contractQtyM2 || null,
        contractWeightTons: mapped.contractWeightTons || null,
        actualDesignQtyM2: mapped.actualDesignQtyM2 || null,
        actualDesignWeightTons: mapped.actualDesignWeightTons || null,
        designProgressPercent: mapped.designProgressPercent || null,
        pricePerM2USD: mapped.pricePerM2USD || null,
        totalAmountUSD: mapped.totalAmountUSD || null,
        advanceUSD: mapped.advanceUSD || null,
        balanceUSD: mapped.balanceUSD || null,
        shellPlanConfirmation: mapped.shellPlanConfirmation || null,
        mdCompletion: mapped.mdCompletion || null,
        productionStart: mapped.productionStart || null,
        productionComplete: mapped.productionComplete || null,
        deliveryRequest: mapped.deliveryRequest || null,
        loadingDate: mapped.loadingDate || null,
        etd: mapped.etd || null,
        eta: mapped.eta || null,
        fwd: mapped.fwd || null,
        paymentTerm: mapped.paymentTerm || '',
        paymentStatus: mapped.paymentStatus || '',
        incoterm: mapped.incoterm || '',
        remark: mapped.remark || '',
        sourceSheet: preferredSheet,
      };

      newProjects.push(fullNewProject);
      newCount++;

      diffItems.push({
        projectId: fullNewProject.projectId,
        projectName: fullNewProject.project,
        field: 'newProject',
        fieldLabel: 'New Project Record',
        existingValue: 'Does not exist',
        newValue: `${fullNewProject.project} (${fullNewProject.customer})`,
        status: 'New',
      });
    }
  });

  return {
    fileName: file.name,
    sheets: sheetNames,
    selectedSheet: preferredSheet,
    totalRowsProcessed: jsonData.length,
    updatedCount,
    newCount,
    unchangedCount,
    errorCount: invalidRows.length,
    diffItems,
    conflicts,
    newProjects,
    updatedProjectsMap,
    invalidRows,
  };
}
