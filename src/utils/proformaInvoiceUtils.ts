import * as XLSX from 'xlsx';
import type { ProjectMaster } from '../data/projectData';
import type {
  ProformaInvoiceRecord,
  PILineItem,
  PIApprovalStage,
  StakeholderEmails,
} from '../types/proformaInvoice';

export const DEFAULT_STAKEHOLDER_EMAILS: StakeholderEmails = {
  pmEmail: 'pm.ops@kumgangkind.com',
  salesDirectorEmail: 'sales.director@kumgangkind.com',
  managingDirectorEmail: 'md.exec@kumgangkind.com',
};

export const DEFAULT_BANK_DETAILS = {
  beneficiaryName: 'KUMKANG KIND CO., LTD.',
  bankName: 'Hana Bank / Korea Eximbank',
  accountNumber: 'KR76-020-0012-9844-01',
  swiftCode: 'HNBNKRSE',
};

export const DEFAULT_TERMS = [
  '1. Payment Terms: 30% Advance on signing, 70% against Shipping Documents / Letter of Credit before vessel loading.',
  '2. Delivery Term: CIF / FOB as per agreed contract terms and agreed manufacturing schedule.',
  '3. Validity: This Proforma Invoice is valid for 30 calendar days from the date of issuance.',
  '4. Title of Goods: Goods remain property of Kumgang Kind Co., Ltd. until full settlement of payment.',
  '5. Technical Assistance: Field supervisor support as per contract agreement and site requirement date.'
];

export function generateSecureActionToken(piId: string, stage: PIApprovalStage, email: string): string {
  const salt = Math.random().toString(36).substring(2, 8);
  const userSegment = (email || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  return `TOKEN-${piId}-${stage}-${userSegment}-${salt}-${Date.now().toString(36)}`.toUpperCase();
}

export function validateSecureActionToken(
  token: string,
  pi: ProformaInvoiceRecord
): { valid: boolean; stage?: PIApprovalStage; reason?: string } {
  if (!token || !token.startsWith('TOKEN-')) {
    return { valid: false, reason: 'Malformed action token structure.' };
  }
  const parts = token.split('-');
  if (parts.length < 5) {
    return { valid: false, reason: 'Invalid token parameter structure.' };
  }
  const tokenPiId = parts[1];
  if (tokenPiId !== pi.id) {
    return { valid: false, reason: 'Token does not match target Proforma Invoice ID.' };
  }
  const matchingStep = pi.approvalHistory.find(s => s.token === token);
  if (matchingStep) {
    if (matchingStep.status === 'APPROVED' || matchingStep.status === 'REJECTED') {
      return { valid: false, reason: 'Action token has already been consumed.' };
    }
  }
  return { valid: true, stage: pi.currentStage };
}

export function generatePIDataFromProject(
  project: ProjectMaster,
  sequenceIndex = 1,
  creatorName = 'Administrator',
  stakeholderEmails: StakeholderEmails = DEFAULT_STAKEHOLDER_EMAILS
): ProformaInvoiceRecord {
  const dateNow = new Date().toISOString().slice(0, 10);
  const cleanId = (project.projectId || 'PRJ').replace(/[^a-zA-Z0-9]/g, '');
  const yearStr = new Date().getFullYear();
  const piNumber = `PI-${cleanId}-${yearStr}-${String(sequenceIndex).padStart(2, '0')}`;

  const qty = project.contractQtyM2 || project.poQty || project.actualDesignQtyM2 || 0;
  const rate = project.pricePerM2USD || project.poRate || project.rate || (qty > 0 && project.totalAmountUSD ? Math.round((project.totalAmountUSD / qty) * 100) / 100 : 0);
  const total = project.totalAmountUSD || project.actualTotalAmount || Math.round(qty * rate * 100) / 100;
  const advance = project.advanceUSD ?? (total > 0 ? Math.round(total * 0.3 * 100) / 100 : 0);
  const balance = project.balanceUSD ?? Math.max(0, Math.round((total - (advance || 0)) * 100) / 100);

  const primaryLineItem: PILineItem = {
    id: `ITEM-1`,
    itemDescription: `${project.materialDescription || 'Kumgang Aluform System'} - Complete Engineering & Supply (${project.project || project.projectId})`,
    materialType: project.materialDescription || 'Aluform',
    scopeCategory: 'Main Contract Supply',
    quantity: qty,
    unit: 'm²',
    unitPriceUSD: rate,
    amountUSD: total,
  };

  const lineItems: PILineItem[] = [primaryLineItem];

  const nowTimestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return {
    id: `PI-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    piNumber,
    projectId: project.projectId,
    clientName: project.customer || 'NA',
    projectName: project.project || project.projectId,
    vendorCompany: project.vendorCompany || 'KKI',
    currency: 'USD',
    documentDate: dateNow,
    dueDate: project.deliveryRequest || project.eta || dateNow,

    poNumber: project.poNumber || 'NA',
    poDate: project.poDate || 'NA',
    incoterm: project.incoterm || 'CIF Nhava Sheva',
    paymentTerm: project.paymentTerm || project.poPaymentTerm || '30% Advance, 70% against BL/LC',
    billToAddress: project.billToAddress || 'NA',
    billToPinCode: project.billToPinCode || 'NA',
    shipToAddress: project.shipToAddress || 'NA',
    shipToPinCode: project.shipToPinCode || 'NA',

    clientContactName: project.clientContactName || 'NA',
    clientContactEmail: project.clientContactEmail || 'NA',
    clientContactPhone: project.clientContactPhone || 'NA',

    lineItems,
    subtotalUSD: total,
    taxApplicability: project.gstComplianceStatus ? 'Standard GST / Export' : 'Not Applicable',
    taxRatePercent: project.gstRate ?? null,
    taxAmountUSD: project.gstAmount ?? null,
    totalAmountUSD: total + (project.gstAmount || 0),
    advanceUSD: advance,
    balanceUSD: balance,

    bankDetails: DEFAULT_BANK_DETAILS,
    termsAndConditions: DEFAULT_TERMS,
    notes: project.remark || 'Standard Kumgang International Export Proforma Invoice',

    currentVersion: 1,
    versions: [],
    status: 'DRAFT',
    currentStage: 'DRAFT',
    approvalHistory: [],

    pmReviewer: {
      name: 'Project Manager (Operations)',
      email: stakeholderEmails.pmEmail || 'Email Not Configured',
    },
    salesDirectorReviewer: {
      name: 'Sales Director (Commercial)',
      email: stakeholderEmails.salesDirectorEmail || 'Email Not Configured',
    },
    managingDirectorReviewer: {
      name: 'Managing Director (Executive Approval)',
      email: stakeholderEmails.managingDirectorEmail || 'Email Not Configured',
    },

    createdAt: nowTimestamp,
    createdBy: creatorName,
    updatedAt: nowTimestamp,
    updatedBy: creatorName,
  };
}

export function exportPIExcel(pi: ProformaInvoiceRecord) {
  const wb = XLSX.utils.book_new();

  const data: (string | number)[][] = [
    ['KUMKANG KIND CO., LTD. — PROFORMA INVOICE'],
    ['Official Enterprise Financial Document · Commercial Department'],
    [],
    ['PI Number:', pi.piNumber, '', 'Date of Issue:', pi.documentDate],
    ['Project ID:', pi.projectId, '', 'Due Date:', pi.dueDate || 'NA'],
    ['Status:', pi.status, '', 'Current Stage:', pi.currentStage],
    ['Version:', `v${pi.currentVersion}`, '', 'Currency:', pi.currency],
    [],
    ['VENDOR / ISSUER:', '', 'CLIENT / BUYER:'],
    ['Company:', `Kumgang Kind Co., Ltd. (${pi.vendorCompany})`, 'Customer:', pi.clientName],
    ['Bank Name:', pi.bankDetails.bankName, 'Project Name:', pi.projectName],
    ['Account No:', pi.bankDetails.accountNumber, 'PO Number:', pi.poNumber],
    ['SWIFT Code:', pi.bankDetails.swiftCode, 'PO Date:', pi.poDate],
    ['Incoterm:', pi.incoterm, 'Payment Term:', pi.paymentTerm],
    ['Bill To:', pi.billToAddress || 'NA', 'Ship To:', pi.shipToAddress || 'NA'],
    [],
    ['LINE ITEMS SPECIFICATION'],
    ['#', 'Item Description', 'Material Type', 'Scope', 'Quantity', 'Unit', 'Unit Price (USD)', 'Total Amount (USD)'],
  ];

  pi.lineItems.forEach((item, index) => {
    data.push([
      index + 1,
      item.itemDescription,
      item.materialType,
      item.scopeCategory,
      item.quantity,
      item.unit,
      item.unitPriceUSD,
      item.amountUSD,
    ]);
  });

  data.push(
    [],
    ['', '', '', '', '', '', 'Subtotal (USD):', pi.subtotalUSD],
    ['', '', '', '', '', '', 'Tax / Statutory:', pi.taxAmountUSD || 0],
    ['', '', '', '', '', '', 'Grand Total (USD):', pi.totalAmountUSD],
    ['', '', '', '', '', '', 'Advance Required (USD):', pi.advanceUSD || 0],
    ['', '', '', '', '', '', 'Balance Payable (USD):', pi.balanceUSD || 0],
    [],
    ['TERMS & CONDITIONS'],
    ...pi.termsAndConditions.map((term, i) => [`${i + 1}`, term]),
    [],
    ['APPROVAL CHAIN WORKFLOW AUDIT'],
    ['Stage', 'Reviewer Role', 'Reviewer Name', 'Reviewer Email', 'Status', 'Action Date', 'Comments / Reason']
  );

  if (pi.approvalHistory.length === 0) {
    data.push(['No formal reviews recorded yet (PI in initial status).']);
  } else {
    pi.approvalHistory.forEach(step => {
      data.push([
        step.stageLabel || step.stage,
        step.reviewerRole,
        step.reviewerName,
        step.reviewerEmail,
        step.status,
        step.reviewedAt || step.submittedAt,
        step.comment || step.reason || 'None',
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 8 },
    { wch: 16 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Proforma Invoice');
  XLSX.writeFile(wb, `${pi.piNumber}_v${pi.currentVersion}.xlsx`);
}

export function exportPIPDF(pi: ProformaInvoiceRecord) {
  const printWindow = window.open('', '_blank', 'width=950,height=1050');
  if (!printWindow) {
    alert('Please allow popups to view or print the Proforma Invoice PDF.');
    return;
  }

  const statusBadgeColor =
    pi.status === 'APPROVED'
      ? '#059669'
      : pi.status === 'REJECTED'
      ? '#dc2626'
      : pi.status === 'ON_HOLD'
      ? '#d97706'
      : '#2563eb';

  const approvalHistoryRows = pi.approvalHistory.map((step) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
      <td style="padding: 6px 8px; font-weight: bold;">${step.stageLabel || step.stage}</td>
      <td style="padding: 6px 8px;">${step.reviewerRole} (${step.reviewerName})</td>
      <td style="padding: 6px 8px; font-family: monospace;">${step.reviewerEmail}</td>
      <td style="padding: 6px 8px; font-weight: bold; color: ${step.status === 'APPROVED' ? '#059669' : step.status === 'REJECTED' ? '#dc2626' : '#d97706'};">${step.status}</td>
      <td style="padding: 6px 8px;">${step.reviewedAt || step.submittedAt}</td>
      <td style="padding: 6px 8px; font-style: italic;">${step.comment || step.reason || '—'}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${pi.piNumber} - Proforma Invoice</title>
      <style>
        @page { size: A4; margin: 12mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background: #fff;
          font-size: 12px;
          line-height: 1.4;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #090909;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .logo-title {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #090909;
        }
        .logo-sub {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }
        .pi-badge {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 8px;
          text-align: right;
        }
        .badge-status {
          display: inline-block;
          font-weight: 800;
          font-size: 11px;
          color: #fff;
          background: ${statusBadgeColor};
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          background: #fafafa;
        }
        .card-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        th {
          background: #0f172a;
          color: #fff;
          text-align: left;
          padding: 8px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 11px;
        }
        .totals-table td {
          padding: 4px 8px;
        }
        .sig-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #cbd5e1;
        }
        .sig-box {
          border: 1px dashed #94a3b8;
          border-radius: 6px;
          padding: 10px;
          text-align: center;
          background: #f8fafc;
        }
        .stamp-approved {
          display: inline-block;
          border: 2px solid #059669;
          color: #059669;
          font-weight: 900;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          transform: rotate(-3deg);
          font-size: 11px;
          margin-top: 6px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 12px; text-align: right;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
      </div>

      <div class="header-bar">
        <div>
          <div class="logo-title">KUMKANG KIND CO., LTD.</div>
          <div class="logo-sub">Formwork & Industrial Construction Systems · Global Export Division</div>
        </div>
        <div class="pi-badge">
          <div style="font-size: 16px; font-weight: 800; font-family: monospace;">${pi.piNumber}</div>
          <div style="font-size: 11px; color: #64748b;">Version v${pi.currentVersion} · Issue Date: ${pi.documentDate}</div>
          <div class="badge-status">${pi.status}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">Buyer / Customer Details</div>
          <div><strong>Customer:</strong> ${pi.clientName}</div>
          <div><strong>Project Name:</strong> ${pi.projectName} (${pi.projectId})</div>
          <div><strong>Bill To Address:</strong> ${pi.billToAddress}</div>
          <div><strong>Ship To Address:</strong> ${pi.shipToAddress}</div>
          <div><strong>PO Reference:</strong> ${pi.poNumber} (${pi.poDate})</div>
        </div>

        <div class="card">
          <div class="card-title">Commercial & Remittance Details</div>
          <div><strong>Vendor Entity:</strong> Kumgang Kind (${pi.vendorCompany})</div>
          <div><strong>Incoterm:</strong> ${pi.incoterm}</div>
          <div><strong>Payment Term:</strong> ${pi.paymentTerm}</div>
          <div><strong>Beneficiary Bank:</strong> ${pi.bankDetails.bankName}</div>
          <div><strong>Account No:</strong> <span style="font-family: monospace; font-weight: bold;">${pi.bankDetails.accountNumber}</span></div>
          <div><strong>SWIFT Code:</strong> <span style="font-family: monospace; font-weight: bold;">${pi.bankDetails.swiftCode}</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Item Description & Specification</th>
            <th>Type</th>
            <th style="text-align: right;">Quantity</th>
            <th>Unit</th>
            <th style="text-align: right;">Unit Price (USD)</th>
            <th style="text-align: right;">Total Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${pi.lineItems.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td style="font-weight: 600;">${item.itemDescription}</td>
              <td>${item.materialType}</td>
              <td style="text-align: right; font-family: monospace;">${item.quantity.toLocaleString()}</td>
              <td>${item.unit}</td>
              <td style="text-align: right; font-family: monospace;">$${item.unitPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; font-family: monospace; font-weight: bold;">$${item.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <table class="totals-table" style="width: 340px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
          <tr>
            <td style="font-weight: 600;">Subtotal Amount:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">$${pi.subtotalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Tax / Export Statutory:</td>
            <td style="text-align: right; font-family: monospace;">$${(pi.taxAmountUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr style="background: #f1f5f9; border-top: 2px solid #0f172a;">
            <td style="font-size: 13px; font-weight: 800;">Grand Total (USD):</td>
            <td style="text-align: right; font-size: 13px; font-family: monospace; font-weight: 800; color: #0284c7;">$${pi.totalAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #059669; font-weight: bold;">Advance Required:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: #059669;">$${(pi.advanceUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="color: #d97706; font-weight: bold;">Balance Payable:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: #d97706;">$${(pi.balanceUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <div class="card" style="margin-bottom: 16px;">
        <div class="card-title">Commercial Terms & Standard Conditions</div>
        <div style="font-size: 10px; color: #475569;">
          ${pi.termsAndConditions.map(t => `<p style="margin: 2px 0;">${t}</p>`).join('')}
        </div>
      </div>

      ${pi.approvalHistory.length > 0 ? `
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-title">Multi-Level Approval Chain Audit Log</div>
          <table>
            <thead>
              <tr style="background: #334155;">
                <th>Stage</th>
                <th>Reviewer</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date / Time</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${approvalHistoryRows}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="sig-grid">
        <div class="sig-box">
          <div style="font-size: 10px; font-weight: bold; color: #64748b;">STAGE 1: PROJECT MANAGER</div>
          <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">${pi.pmReviewer.name}</div>
          <div style="font-size: 9px; color: #64748b; font-family: monospace;">${pi.pmReviewer.email}</div>
          ${pi.approvalHistory.some(h => h.stage === 'PM_REVIEW' && h.status === 'APPROVED') ? '<div class="stamp-approved">✓ VERIFIED & APPROVED</div>' : '<div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">Pending Review</div>'}
        </div>

        <div class="sig-box">
          <div style="font-size: 10px; font-weight: bold; color: #64748b;">STAGE 2: SALES DIRECTOR</div>
          <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">${pi.salesDirectorReviewer.name}</div>
          <div style="font-size: 9px; color: #64748b; font-family: monospace;">${pi.salesDirectorReviewer.email}</div>
          ${pi.approvalHistory.some(h => h.stage === 'SALES_DIRECTOR_REVIEW' && h.status === 'APPROVED') ? '<div class="stamp-approved">✓ VERIFIED & APPROVED</div>' : '<div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">Pending Review</div>'}
        </div>

        <div class="sig-box">
          <div style="font-size: 10px; font-weight: bold; color: #64748b;">STAGE 3: MANAGING DIRECTOR</div>
          <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">${pi.managingDirectorReviewer.name}</div>
          <div style="font-size: 9px; color: #64748b; font-family: monospace;">${pi.managingDirectorReviewer.email}</div>
          ${pi.approvalHistory.some(h => h.stage === 'MANAGING_DIRECTOR_REVIEW' && h.status === 'APPROVED') ? '<div class="stamp-approved">✓ EXECUTIVE APPROVAL</div>' : '<div style="margin-top: 8px; font-size: 10px; color: #94a3b8;">Pending Review</div>'}
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
