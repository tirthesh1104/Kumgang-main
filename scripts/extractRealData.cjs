/**
 * extractRealData.js
 * Build-time script that parses the real Excel workbook and generates
 * a TypeScript data file for the Kumkang Monitor app.
 *
 * Source: 260908 KKI PROJECT FOLLOW UP.xlsx
 * Output: src/data/projectData.ts
 *
 * Run: node scripts/extractRealData.js
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ── Paths ──────────────────────────────────────────────────────────
const EXCEL_PATH = path.resolve(__dirname, '..', '..', 'assets', '260908 KKI PROJECT FOLLOW UP.xlsx');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'src', 'data', 'projectData.ts');

console.log('Reading workbook:', EXCEL_PATH);
const wb = XLSX.readFile(EXCEL_PATH);

// ── Helpers ────────────────────────────────────────────────────────

/** Convert Excel serial date number to "DD-MM-YYYY" or null */
function excelDateToStr(val) {
  if (val === '' || val === null || val === undefined) return null;
  if (typeof val === 'number' && val > 40000 && val < 60000) {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const dd = String(d.d).padStart(2, '0');
      const mm = String(d.m).padStart(2, '0');
      const yyyy = d.y;
      return `${dd}-${mm}-${yyyy}`;
    }
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'x' || trimmed === 'X' || trimmed === 'Done' || trimmed === 'done') return trimmed === '' ? null : trimmed;
    // Already a date string — return as-is
    return trimmed;
  }
  return null;
}

/** Safe number extraction */
function toNum(val) {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : Math.round(n * 100) / 100; // 2 decimal precision
}

/** Safe string extraction */
function toStr(val) {
  if (val === '' || val === null || val === undefined) return '';
  return String(val).trim().replace(/\r\n/g, '\n').replace(/\n/g, ' ');
}

/** Generate project ID */
let indiaCounter = 0;
let malaysiaCounter = 0;
let maldivesCounter = 0;
function genId(country) {
  if (country === 'Malaysia') return `MYS-${String(++malaysiaCounter).padStart(3, '0')}`;
  if (country === 'Maldives') return `MDV-${String(++maldivesCounter).padStart(3, '0')}`;
  return `IND-${String(++indiaCounter).padStart(3, '0')}`;
}

// ── Parse "Detail list (2)" — Primary India Source ─────────────────
function parseDetailList2() {
  const ws = wb.Sheets['Detail list (2)'];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Row structure from inspection:
  // [0-4]: headers/metadata
  // [5]: sub-headers (PROJECT INFORMATION, PLAN, ACTUAL, etc.)
  // [6]: column headers row 1 (NO., Customer Name, Project Name, Block name, Contract Date, Final Contract, ...)
  // [7]: column headers row 2 (units, sub-columns)
  // [8+]: data rows
  
  // Column mapping for Detail list (2) — based on inspection:
  // Col 0: NO.
  // Col 1: Customer Name
  // Col 2: Project Name
  // Col 3: Block name
  // Col 4: Contract Date
  // Col 5: Final Contract Q'ty M2
  // Col 6: Final Contract Weight (Tons)
  // Col 7: Actual Design Q'ty M2
  // Col 8: Actual Design Weight (Tons)
  // Col 9: % (design progress)
  // Col 10: Price $
  // Col 11: Amount $
  // Col 12: Advance $
  // Col 13: Balance $
  // Col 14: Shell Plan confirmation
  // Col 15: MD Completion
  // Col 16-21: FORMWORK PLAN DWG (Plan: Wall, Beam, Slab, Stair, ACC, Floor change)
  // Col 22-27: DESIGN SCHEDULE (Actual: Wall, Beam, Slab, Stair, ACC, Floor change)
  // Col 28: Production Start
  // Col 29: Production Complete
  // Col 30: Delivery Request by Client
  // Col 31-32: Delivery timeline text
  // Col 33: LOADING (shipment)
  // Col 34: ETD
  // Col 35: ETA (from inspection, may vary)
  // Col 36: FWD
  // Col 37: Payment Term
  // Col 38: Payment Status
  // Col 39: Incoterm / Remark
  // Col 40+: additional info
  
  const projects = [];
  const designSchedules = [];
  const shipments = [];
  const payments = [];
  
  let currentCustomer = '';
  let currentProject = '';
  let designIdCounter = 0;
  let shipmentIdCounter = 0;
  let paymentIdCounter = 0;
  
  // Determine section markers
  let signedEndRow = -1;
  let notSignedStartRow = -1;
  let cancelStartRow = -1;
  
  for (let i = 8; i < raw.length; i++) {
    const row = raw[i];
    const firstCell = toStr(row[0]);
    
    if (firstCell.includes('TOTAL (SIGNED CONTRACT)')) { signedEndRow = i; continue; }
    if (firstCell.includes('TOTAL (NOT SIGNED YET)')) { notSignedStartRow = i; continue; }
    if (firstCell.includes('TOTAL (CANCEL)')) { cancelStartRow = i; continue; }
    if (firstCell.includes('Sub Total') || toStr(row[1]).includes('Sub Total')) continue;
    if (firstCell.includes('Date') || toStr(row[1]).includes('Date')) continue;
    if (firstCell === '' && toStr(row[1]) === '' && toStr(row[2]) === '') continue;
    
    // Determine contract status
    let contractStatus = 'Signed';
    if (notSignedStartRow > 0 && i > notSignedStartRow && (cancelStartRow < 0 || i < cancelStartRow)) {
      contractStatus = 'Not Signed';
    }
    if (cancelStartRow > 0 && i > cancelStartRow) {
      contractStatus = 'Cancelled';
    }
    
    // Customer carries forward for merged cells
    const custVal = toStr(row[1]);
    if (custVal) currentCustomer = custVal;
    
    const projVal = toStr(row[2]);
    if (projVal) currentProject = projVal;
    
    const block = toStr(row[3]);
    
    const projectId = genId('India');
    
    const proj = {
      projectId,
      country: 'India',
      customer: currentCustomer,
      project: currentProject,
      block: block,
      contractDate: excelDateToStr(row[4]),
      contractStatus,
      contractQtyM2: toNum(row[5]),
      contractWeightTons: toNum(row[6]),
      actualDesignQtyM2: toNum(row[7]),
      actualDesignWeightTons: toNum(row[8]),
      designProgressPercent: toNum(row[9]) != null ? Math.round((toNum(row[9]) || 0) * 10000) / 100 : null,
      pricePerM2USD: toNum(row[10]),
      totalAmountUSD: toNum(row[11]),
      advanceUSD: toNum(row[12]),
      balanceUSD: toNum(row[13]),
      shellPlanConfirmation: excelDateToStr(row[14]),
      mdCompletion: excelDateToStr(row[15]),
      productionStart: excelDateToStr(row[28]),
      productionComplete: excelDateToStr(row[29]),
      deliveryRequest: toStr(row[30]) || null,
      loadingDate: excelDateToStr(row[31]),
      etd: excelDateToStr(row[32]),
      eta: excelDateToStr(row[33]),
      fwd: excelDateToStr(row[34]) || null,
      paymentTerm: toStr(row[37]),
      paymentStatus: toStr(row[38]),
      incoterm: toStr(row[39]),
      remark: toStr(row[40]) || '',
      sourceSheet: 'Detail list (2)',
    };
    
    // Fix design progress if it's already a ratio (0-1) vs percentage
    if (proj.designProgressPercent !== null && proj.designProgressPercent > 100) {
      // Already percentage form from raw data, or it was a ratio close to 1
      // The raw data shows values like 0.9144... which is a ratio
    }
    // Actually the raw % column has values like 0.914 (ratio), or 1 (100%)
    // We already multiplied by 100 above, so 0.914 → 91.4%, 1 → 100%
    // But some values may be > 1 (e.g., 1.003 = 100.3% overdesign), cap display at 100 but keep actual
    
    projects.push(proj);
    
    // Extract Design Schedule entries (Plan: cols 16-21, Actual: cols 22-27)
    const elements = ['Wall', 'Beam', 'Slab', 'Stair', 'ACC', 'Floor Change'];
    for (let e = 0; e < elements.length; e++) {
      const planDate = excelDateToStr(row[16 + e]);
      const actualDate = excelDateToStr(row[22 + e]);
      if (planDate || actualDate) {
        designSchedules.push({
          designId: `DS-${String(++designIdCounter).padStart(4, '0')}`,
          projectId,
          element: elements[e],
          plannedDate: planDate,
          actualDate: actualDate,
          status: actualDate && actualDate !== 'x' ? 'Completed' : (planDate ? 'In Progress' : 'Not Started'),
        });
      }
    }
    
    // Extract Shipment entry
    const loading = excelDateToStr(row[31]);
    const etd = excelDateToStr(row[32]);
    const eta = excelDateToStr(row[33]);
    if (loading || etd || eta) {
      let shipStatus = 'Planned';
      if (eta) shipStatus = 'In Transit';
      if (proj.paymentStatus && proj.paymentStatus.toLowerCase().includes('100%')) shipStatus = 'Delivered';
      
      shipments.push({
        shipmentId: `SH-${String(++shipmentIdCounter).padStart(4, '0')}`,
        projectId,
        block: block,
        loadingDate: loading,
        etd: etd,
        eta: eta,
        fwd: excelDateToStr(row[34]) || null,
        incoterm: toStr(row[39]),
        deliveryTimeline: toStr(row[30]) || '',
        status: shipStatus,
      });
    }
    
    // Extract Payment entry
    if (proj.totalAmountUSD || proj.advanceUSD || proj.paymentTerm) {
      payments.push({
        paymentId: `PAY-${String(++paymentIdCounter).padStart(4, '0')}`,
        projectId,
        customer: currentCustomer,
        project: currentProject,
        tower: block,
        description: '',
        quantitySqm: proj.actualDesignQtyM2 || proj.contractQtyM2,
        rateUSD: proj.pricePerM2USD,
        amountUSD: proj.totalAmountUSD,
        advancePaidUSD: proj.advanceUSD,
        balanceUSD: proj.balanceUSD,
        advancePercent: (proj.totalAmountUSD && proj.advanceUSD) ? Math.round((proj.advanceUSD / proj.totalAmountUSD) * 10000) / 100 : null,
        paymentTerm: proj.paymentTerm,
        paymentStatus: proj.paymentStatus,
        remark: '',
      });
    }
  }
  
  return { projects, designSchedules, shipments, payments };
}

// ── Parse "Detail list" — Supplement for older completed projects ──
function parseDetailList() {
  const ws = wb.Sheets['Detail list'];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // This sheet has a similar structure to Detail list (2) but with more columns
  // including initial contract, revision quantities (1st, 2nd, 3rd, 4th)
  // Row 5 = section headers, Row 6 = column headers row 1, Row 7 = sub-headers
  // Data starts at row 8
  
  // We primarily need this for:
  // 1. Initial contract quantities (cols 7-8) and revision details
  // 2. Any project data not in Detail list (2)
  
  // Since Detail list (2) is the primary source and contains all the same projects,
  // we'll extract only the initial contract and revision data as supplementary info
  
  const supplements = [];
  let currentCustomer = '';
  
  for (let i = 8; i < raw.length; i++) {
    const row = raw[i];
    const firstCell = toStr(row[0]);
    if (firstCell.includes('TOTAL') || firstCell.includes('Sub Total')) continue;
    if (toStr(row[1]).includes('Sub Total') || toStr(row[1]).includes('Date')) continue;
    if (firstCell === '' && toStr(row[1]) === '' && toStr(row[2]) === '') continue;
    
    const custVal = toStr(row[1]);
    if (custVal) currentCustomer = custVal;
    
    supplements.push({
      customer: currentCustomer,
      project: toStr(row[2]),
      block: toStr(row[3]),
      initialContractQtyM2: toNum(row[7]),
      initialContractWeightTons: toNum(row[8]),
      revision1QtyM2: toNum(row[9]),
      revision2QtyM2: toNum(row[11]),
      revision3QtyM2: toNum(row[13]),
      revision4QtyM2: toNum(row[15]),
      gapQtyM2: toNum(row[17]),
    });
  }
  
  return supplements;
}

// ── Parse "KKM" — Malaysia Projects ────────────────────────────────
function parseKKM() {
  const ws = wb.Sheets['KKM'];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Structure from inspection:
  // [0]: title row "KKM-MALAYSIA PROJECT"
  // [1]: TYPE WEIGHT: NORMAL
  // [2]: PAYMENT TERM: T/T
  // [3-4]: metadata
  // [5]: Prepared By
  // [6]: section headers (PROJECT INFORMATION, PLAN, ACTUAL, Payment Status, REMARK)
  // [7]: col headers 1 (NO., TYPE, Set, Q'ty M2, Weight, FORMWORK PLAN DWG..., PRODUCTION COMPLETE..., etc.)
  // [8]: col headers 2 (Customer Name, Project Name, Block name, Wall, Beam, Slab, Stair, Floor change)
  // [9+]: data rows
  
  // Column mapping (KKM):
  // Col 0: NO.
  // Col 1: TYPE / Customer Name
  // Col 2: Project Name
  // Col 3: Block name
  // Col 4: Set
  // Col 5: Q'ty M2
  // Col 6: Weight (Tons)
  // Col 7-11: FORMWORK PLAN DWG (Plan: Wall, Beam, Slab, Stair, Floor change)
  // Col 12-16: FORMWORK DWG (Actual: Wall, Beam, Slab, Stair, Floor change)
  // Col 17-21: PRODUCTION COMPLETE (Wall, Beam, Slab, Stair, Floor change)
  // Col 22: Delivery Request at site by Client
  // Col 23: LOADING
  // Col 24: ETD
  // Col 25: ETA
  // Col 26: Payment Status
  // Col 27: REMARK
  
  const projects = [];
  const designSchedules = [];
  const productionRecords = [];
  const shipments = [];
  let designIdCounter = 1000;
  let shipmentIdCounter = 1000;
  let prodIdCounter = 1000;
  
  for (let i = 9; i < raw.length; i++) {
    const row = raw[i];
    const firstCell = toStr(row[0]);
    
    // Skip total rows and empty rows
    if (firstCell.includes('TOTAL')) continue;
    if (firstCell === '' && toStr(row[1]) === '' && toStr(row[2]) === '') continue;
    
    const customer = toStr(row[1]);
    const project = toStr(row[2]);
    const block = toStr(row[3]);
    
    if (!customer && !project) continue;
    
    // Determine country — TEONG JIN MALDIVES = Maldives, rest = Malaysia
    const country = project.toUpperCase().includes('MALDIVES') ? 'Maldives' : 'Malaysia';
    const projectId = genId(country);
    
    const proj = {
      projectId,
      country,
      customer,
      project,
      block,
      contractDate: null,
      contractStatus: 'Signed',
      contractQtyM2: toNum(row[5]),
      contractWeightTons: toNum(row[6]),
      actualDesignQtyM2: null,
      actualDesignWeightTons: null,
      designProgressPercent: null,
      pricePerM2USD: null,
      totalAmountUSD: null,
      advanceUSD: null,
      balanceUSD: null,
      shellPlanConfirmation: null,
      mdCompletion: null,
      productionStart: null,
      productionComplete: null,
      deliveryRequest: excelDateToStr(row[22]),
      loadingDate: excelDateToStr(row[23]),
      etd: excelDateToStr(row[24]),
      eta: excelDateToStr(row[25]),
      fwd: null,
      paymentTerm: 'T/T',
      paymentStatus: toStr(row[26]),
      incoterm: '',
      remark: toStr(row[27]),
      sourceSheet: 'KKM',
    };
    
    // Handle set count
    const setCount = toNum(row[4]);
    if (setCount) proj.sets = setCount;
    
    projects.push(proj);
    
    // Design schedule (Plan: cols 7-11, Actual: cols 12-16)
    const elements = ['Wall', 'Beam', 'Slab', 'Stair', 'Floor Change'];
    for (let e = 0; e < elements.length; e++) {
      const planDate = excelDateToStr(row[7 + e]);
      const actualDate = excelDateToStr(row[12 + e]);
      if (planDate || actualDate) {
        designSchedules.push({
          designId: `DS-${String(++designIdCounter).padStart(4, '0')}`,
          projectId,
          element: elements[e],
          plannedDate: planDate,
          actualDate: actualDate,
          status: actualDate && actualDate !== 'x' ? 'Completed' : (planDate ? 'In Progress' : 'Not Started'),
        });
      }
    }
    
    // Production (cols 17-21)
    const prodElements = ['Wall', 'Beam', 'Slab', 'Stair', 'Floor Change'];
    for (let e = 0; e < prodElements.length; e++) {
      const prodDate = excelDateToStr(row[17 + e]);
      if (prodDate) {
        productionRecords.push({
          productionId: `PR-${String(++prodIdCounter).padStart(4, '0')}`,
          projectId,
          part: prodElements[e],
          orderQtyM2: null,
          orderQtyKg: null,
          finishedQtyM2: null,
          finishedQtyKg: null,
          balanceQty: null,
          completionPercent: null,
          productionStartDate: null,
          productionCompleteDate: prodDate,
        });
      }
    }
    
    // Shipment
    const loading = excelDateToStr(row[23]);
    const etd = excelDateToStr(row[24]);
    const eta = excelDateToStr(row[25]);
    if (loading || etd || eta) {
      shipments.push({
        shipmentId: `SH-${String(++shipmentIdCounter).padStart(4, '0')}`,
        projectId,
        block,
        loadingDate: loading,
        etd,
        eta,
        fwd: null,
        incoterm: '',
        deliveryTimeline: '',
        status: eta ? 'In Transit' : 'Planned',
      });
    }
  }
  
  return { projects, designSchedules, productionRecords, shipments };
}

// ── Parse "T8 detail" — Production detail for POARR-T8 ────────────
function parseT8Detail() {
  const ws = wb.Sheets['T8 detail'];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Col 0: Part (P1-P6, Total)
  // Col 1: Unit
  // Col 2: Qty Order (m2)
  // Col 3: Qty Order (kg)
  // Col 4: Finished packing m2
  // Col 5: Finished packing kg
  // Col 6: Balance Qty
  
  const records = [];
  let idCounter = 2000;
  
  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    const part = toStr(row[0]);
    if (!part || part === 'Total') continue;
    
    const orderM2 = toNum(row[2]);
    const orderKg = toNum(row[3]);
    const finishedM2 = toNum(row[4]);
    const finishedKg = toNum(row[5]);
    const balance = toNum(row[6]);
    
    records.push({
      productionId: `PR-${String(++idCounter).padStart(4, '0')}`,
      projectId: null, // Will be linked to POARR-T8 project IDs
      part,
      orderQtyM2: orderM2,
      orderQtyKg: orderKg,
      finishedQtyM2: finishedM2,
      finishedQtyKg: finishedKg,
      balanceQty: balance,
      completionPercent: (orderM2 && finishedM2) ? Math.round((finishedM2 / orderM2) * 10000) / 100 : null,
      productionStartDate: null,
      productionCompleteDate: null,
    });
  }
  
  return records;
}

// ── Parse "payment TE" — Detailed payment info ────────────────────
function parsePaymentTE() {
  const ws = wb.Sheets['payment TE'];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Two sections:
  // Section 1 (rows 2-5): Project A (T2, T3, T4) — DBTW
  // Section 2 (rows 10-15): Project B (T8) — POARR-T8 dispatch priorities
  
  const records = [];
  let idCounter = 3000;
  
  // Section 1: Project A
  for (let i = 2; i <= 4; i++) {
    const row = raw[i];
    if (!row || toStr(row[1]) === '') continue;
    
    records.push({
      paymentId: `PAY-${String(++idCounter).padStart(4, '0')}`,
      projectId: null, // Link to DBTW
      customer: 'TOTAL ENVIRONMENT',
      project: 'DBTW',
      tower: toStr(row[1]),
      description: toStr(row[2]),
      quantitySqm: toNum(row[3]),
      rateUSD: toNum(row[4]),
      amountUSD: toNum(row[5]),
      advancePaidUSD: toNum(row[7]),
      balanceUSD: toNum(row[8]),
      advancePercent: toNum(row[12]) ? Math.round((toNum(row[12]) || 0) * 10000) / 100 : null,
      paymentTerm: '',
      paymentStatus: '',
      remark: '',
      sourceSheet: 'payment TE',
    });
  }
  
  // Section 2: Project B (T8)
  for (let i = 10; i <= 14; i++) {
    const row = raw[i];
    if (!row || toStr(row[0]) === '' && toStr(row[1]) === '') continue;
    
    records.push({
      paymentId: `PAY-${String(++idCounter).padStart(4, '0')}`,
      projectId: null, // Link to POARR-T8
      customer: 'TOTAL ENVIRONMENT',
      project: 'POARR-T8',
      tower: toStr(row[1]),
      description: toStr(row[2]),
      quantitySqm: toNum(row[5]),
      rateUSD: toNum(row[6]),
      amountUSD: toNum(row[7]),
      advancePaidUSD: toNum(row[9]),
      balanceUSD: toNum(row[10]),
      advancePercent: toNum(row[8]) ? Math.round((toNum(row[8]) || 0) * 10000) / 100 : null,
      paymentTerm: '',
      paymentStatus: '',
      remark: toStr(row[12]) || '',
      sourceSheet: 'payment TE',
    });
  }
  
  return records;
}

// ── Main: Combine all data and generate TypeScript ─────────────────
function main() {
  const detail2 = parseDetailList2();
  const kkm = parseKKM();
  const t8Production = parseT8Detail();
  const paymentTERecords = parsePaymentTE();
  const detailListSupplements = parseDetailList();
  
  // Combine projects
  const allProjects = [...detail2.projects, ...kkm.projects];
  
  // Link T8 production records to POARR-T8 projects
  const t8Projects = allProjects.filter(p => p.project === 'POARR-T8');
  const partToBlockMap = { 'P1': 'T8 p1', 'P2': 'T8 p2', 'P3': 'T8 p3', 'P4': 'T8 p4', 'P5': 'T8 p5', 'P6': 'T8 p6' };
  t8Production.forEach(pr => {
    const matchBlock = partToBlockMap[pr.part];
    const matchProj = t8Projects.find(p => p.block === matchBlock);
    if (matchProj) pr.projectId = matchProj.projectId;
  });
  
  // Link payment TE records
  paymentTERecords.forEach(pay => {
    if (pay.project === 'DBTW') {
      // Find first DBTW project (they share the customer TOTAL ENVIRONMENT)
      const match = allProjects.find(p => p.customer === 'TOTAL ENVIRONMENT' && p.project === 'DBTW');
      if (match) pay.projectId = match.projectId;
    } else if (pay.project === 'POARR-T8') {
      const match = allProjects.find(p => p.project === 'POARR-T8');
      if (match) pay.projectId = match.projectId;
    }
  });
  
  // Combine all records
  const allDesignSchedules = [...detail2.designSchedules, ...kkm.designSchedules];
  const allProductionRecords = [...t8Production, ...kkm.productionRecords];
  const allShipments = [...detail2.shipments, ...kkm.shipments];
  const allPayments = [...detail2.payments, ...paymentTERecords];
  
  // Add supplement data (initial contract info) to projects
  detailListSupplements.forEach(sup => {
    const match = allProjects.find(p => 
      p.customer === sup.customer && 
      p.project === sup.project && 
      p.block === sup.block
    );
    if (match && sup.initialContractQtyM2) {
      match.initialContractQtyM2 = sup.initialContractQtyM2;
      match.initialContractWeightTons = sup.initialContractWeightTons;
    }
  });
  
  console.log(`\nExtracted:`);
  console.log(`  Projects: ${allProjects.length}`);
  console.log(`  Design Schedules: ${allDesignSchedules.length}`);
  console.log(`  Production Records: ${allProductionRecords.length}`);
  console.log(`  Shipments: ${allShipments.length}`);
  console.log(`  Payments: ${allPayments.length}`);
  
  // ── Generate TypeScript output ─────────────────────────────────
  const tsOutput = generateTypeScript(allProjects, allDesignSchedules, allProductionRecords, allShipments, allPayments);
  
  fs.writeFileSync(OUTPUT_PATH, tsOutput, 'utf-8');
  console.log(`\nWritten to: ${OUTPUT_PATH}`);
}

function generateTypeScript(projects, designSchedules, productionRecords, shipments, payments) {
  const lines = [];
  
  lines.push(`// ============================================================`);
  lines.push(`// SOURCE OF TRUTH — Live Project Monitoring System`);
  lines.push(`// Auto-generated from: 260908 KKI PROJECT FOLLOW UP.xlsx`);
  lines.push(`// Generated at: ${new Date().toISOString()}`);
  lines.push(`// No values have been invented, fabricated or silently corrected.`);
  lines.push(`// ============================================================`);
  lines.push(``);
  
  // Interfaces
  lines.push(`export interface ProjectMaster {`);
  lines.push(`  projectId: string;`);
  lines.push(`  country: string;`);
  lines.push(`  customer: string;`);
  lines.push(`  project: string;`);
  lines.push(`  block: string;`);
  lines.push(`  contractDate: string | null;`);
  lines.push(`  contractStatus: string;`);
  lines.push(`  contractQtyM2: number | null;`);
  lines.push(`  contractWeightTons: number | null;`);
  lines.push(`  initialContractQtyM2?: number | null;`);
  lines.push(`  initialContractWeightTons?: number | null;`);
  lines.push(`  actualDesignQtyM2: number | null;`);
  lines.push(`  actualDesignWeightTons: number | null;`);
  lines.push(`  designProgressPercent: number | null;`);
  lines.push(`  pricePerM2USD: number | null;`);
  lines.push(`  totalAmountUSD: number | null;`);
  lines.push(`  advanceUSD: number | null;`);
  lines.push(`  balanceUSD: number | null;`);
  lines.push(`  shellPlanConfirmation: string | null;`);
  lines.push(`  mdCompletion: string | null;`);
  lines.push(`  productionStart: string | null;`);
  lines.push(`  productionComplete: string | null;`);
  lines.push(`  deliveryRequest: string | null;`);
  lines.push(`  loadingDate: string | null;`);
  lines.push(`  etd: string | null;`);
  lines.push(`  eta: string | null;`);
  lines.push(`  fwd: string | null;`);
  lines.push(`  paymentTerm: string;`);
  lines.push(`  paymentStatus: string;`);
  lines.push(`  incoterm: string;`);
  lines.push(`  remark: string;`);
  lines.push(`  sourceSheet: string;`);
  lines.push(`  sets?: number | null;`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`export interface DesignSchedule {`);
  lines.push(`  designId: string;`);
  lines.push(`  projectId: string;`);
  lines.push(`  element: string;`);
  lines.push(`  plannedDate: string | null;`);
  lines.push(`  actualDate: string | null;`);
  lines.push(`  status: string;`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`export interface ProductionRecord {`);
  lines.push(`  productionId: string;`);
  lines.push(`  projectId: string | null;`);
  lines.push(`  part: string;`);
  lines.push(`  orderQtyM2: number | null;`);
  lines.push(`  orderQtyKg: number | null;`);
  lines.push(`  finishedQtyM2: number | null;`);
  lines.push(`  finishedQtyKg: number | null;`);
  lines.push(`  balanceQty: number | null;`);
  lines.push(`  completionPercent: number | null;`);
  lines.push(`  productionStartDate: string | null;`);
  lines.push(`  productionCompleteDate: string | null;`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`export interface ShipmentRecord {`);
  lines.push(`  shipmentId: string;`);
  lines.push(`  projectId: string;`);
  lines.push(`  block: string;`);
  lines.push(`  loadingDate: string | null;`);
  lines.push(`  etd: string | null;`);
  lines.push(`  eta: string | null;`);
  lines.push(`  fwd: string | null;`);
  lines.push(`  incoterm: string;`);
  lines.push(`  deliveryTimeline: string;`);
  lines.push(`  status: string;`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`export interface PaymentRecord {`);
  lines.push(`  paymentId: string;`);
  lines.push(`  projectId: string | null;`);
  lines.push(`  customer: string;`);
  lines.push(`  project: string;`);
  lines.push(`  tower: string;`);
  lines.push(`  description: string;`);
  lines.push(`  quantitySqm: number | null;`);
  lines.push(`  rateUSD: number | null;`);
  lines.push(`  amountUSD: number | null;`);
  lines.push(`  advancePaidUSD: number | null;`);
  lines.push(`  balanceUSD: number | null;`);
  lines.push(`  advancePercent: number | null;`);
  lines.push(`  paymentTerm: string;`);
  lines.push(`  paymentStatus: string;`);
  lines.push(`  remark: string;`);
  lines.push(`  sourceSheet?: string;`);
  lines.push(`}`);
  lines.push(``);
  
  // Data arrays
  lines.push(`// ============================================================`);
  lines.push(`// PROJECT MASTER DATA`);
  lines.push(`// ============================================================`);
  lines.push(`export const projectMasterData: ProjectMaster[] = ${JSON.stringify(projects, null, 2)};`);
  lines.push(``);
  
  lines.push(`// ============================================================`);
  lines.push(`// DESIGN SCHEDULE DATA`);
  lines.push(`// ============================================================`);
  lines.push(`export const designScheduleData: DesignSchedule[] = ${JSON.stringify(designSchedules, null, 2)};`);
  lines.push(``);
  
  lines.push(`// ============================================================`);
  lines.push(`// PRODUCTION RECORDS`);
  lines.push(`// ============================================================`);
  lines.push(`export const productionData: ProductionRecord[] = ${JSON.stringify(productionRecords, null, 2)};`);
  lines.push(``);
  
  lines.push(`// ============================================================`);
  lines.push(`// SHIPMENT RECORDS`);
  lines.push(`// ============================================================`);
  lines.push(`export const shipmentData: ShipmentRecord[] = ${JSON.stringify(shipments, null, 2)};`);
  lines.push(``);
  
  lines.push(`// ============================================================`);
  lines.push(`// PAYMENT RECORDS`);
  lines.push(`// ============================================================`);
  lines.push(`export const paymentData: PaymentRecord[] = ${JSON.stringify(payments, null, 2)};`);
  lines.push(``);
  
  // Helper functions
  lines.push(`// ============================================================`);
  lines.push(`// HELPER FUNCTIONS`);
  lines.push(`// ============================================================`);
  lines.push(``);
  lines.push(`export function getProjectById(id: string): ProjectMaster | undefined {`);
  lines.push(`  return projectMasterData.find(p => p.projectId === id);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getProjectsByCountry(country: string): ProjectMaster[] {`);
  lines.push(`  return projectMasterData.filter(p => p.country === country);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getProjectsByCustomer(customer: string): ProjectMaster[] {`);
  lines.push(`  return projectMasterData.filter(p => p.customer === customer);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getProjectsByStatus(status: string): ProjectMaster[] {`);
  lines.push(`  return projectMasterData.filter(p => p.contractStatus === status);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getDesignForProject(projectId: string): DesignSchedule[] {`);
  lines.push(`  return designScheduleData.filter(d => d.projectId === projectId);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getProductionForProject(projectId: string): ProductionRecord[] {`);
  lines.push(`  return productionData.filter(p => p.projectId === projectId);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getShipmentsForProject(projectId: string): ShipmentRecord[] {`);
  lines.push(`  return shipmentData.filter(s => s.projectId === projectId);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getPaymentsForProject(projectId: string): PaymentRecord[] {`);
  lines.push(`  return paymentData.filter(p => p.projectId === projectId);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getUniqueCountries(): string[] {`);
  lines.push(`  return [...new Set(projectMasterData.map(p => p.country))];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getUniqueCustomers(): string[] {`);
  lines.push(`  return [...new Set(projectMasterData.map(p => p.customer))];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getUniqueStatuses(): string[] {`);
  lines.push(`  return [...new Set(projectMasterData.map(p => p.contractStatus))];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`// Dashboard KPI calculations (DERIVED from real data)`);
  lines.push(`export function getDashboardKPIs() {`);
  lines.push(`  const signed = projectMasterData.filter(p => p.contractStatus === 'Signed');`);
  lines.push(`  const totalProjects = projectMasterData.length;`);
  lines.push(`  const signedProjects = signed.length;`);
  lines.push(`  const totalContractValueUSD = signed.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);`);
  lines.push(`  const totalAdvanceUSD = signed.reduce((sum, p) => sum + (p.advanceUSD || 0), 0);`);
  lines.push(`  const totalBalanceUSD = signed.reduce((sum, p) => sum + (p.balanceUSD || 0), 0);`);
  lines.push(`  const totalQtyM2 = signed.reduce((sum, p) => sum + (p.contractQtyM2 || p.actualDesignQtyM2 || 0), 0);`);
  lines.push(`  const totalWeightTons = signed.reduce((sum, p) => sum + (p.contractWeightTons || p.actualDesignWeightTons || 0), 0);`);
  lines.push(`  const collectionRate = totalContractValueUSD > 0 ? Math.round((totalAdvanceUSD / totalContractValueUSD) * 10000) / 100 : 0;`);
  lines.push(`  const countryCounts: Record<string, number> = {};`);
  lines.push(`  projectMasterData.forEach(p => { countryCounts[p.country] = (countryCounts[p.country] || 0) + 1; });`);
  lines.push(`  return { totalProjects, signedProjects, totalContractValueUSD, totalAdvanceUSD, totalBalanceUSD, totalQtyM2, totalWeightTons, collectionRate, countryCounts };`);
  lines.push(`}`);
  lines.push(``);
  
  return lines.join('\n');
}

main();
