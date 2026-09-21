import {
  projectMasterData, shipmentData, getDesignForProject,
  getProductionForProject, getPaymentsForProject
} from '../data/projectData';
import { buildProjectStages } from '../components/projects/ProjectJourney';

export function exportProjectPDF(project: typeof projectMasterData[0], shipmentOverride?: typeof shipmentData[0]) {
  const shipment = shipmentOverride || shipmentData.find(s => s.projectId === project.projectId);
  const designElements = getDesignForProject(project.projectId);
  const productionParts = getProductionForProject(project.projectId);
  const paymentBreakdown = getPaymentsForProject(project.projectId);
  const stages = buildProjectStages(project);

  const progressPercent = project.designProgressPercent != null
    ? Math.min(project.designProgressPercent, 100)
    : (project.contractStatus === 'Signed' ? 50 : 100);

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to export the PDF report.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${project.projectId} - Executive Project Report</title>
      <style>
        @page {
          size: A4;
          margin: 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 15px;
          line-height: 1.4;
          font-size: 12px;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #090909;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .brand-title {
          font-size: 18px;
          font-weight: 800;
          color: #090909;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .brand-sub {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
        }
        .report-badge {
          background-color: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }
        .section-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #475569;
          margin-top: 14px;
          margin-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 3px;
        }
        .progress-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 12px;
        }
        .progress-bar-bg {
          background: #e2e8f0;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 4px;
        }
        .progress-bar-fill {
          background: #0284c7;
          height: 100%;
          border-radius: 4px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px;
        }
        .row-item {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          border-bottom: 1px dotted #e2e8f0;
        }
        .row-label {
          color: #64748b;
          font-weight: 500;
        }
        .row-val {
          font-weight: 700;
          color: #0f172a;
        }
        .text-green { color: #047857; }
        .text-amber { color: #b45309; }
        .text-blue { color: #0369a1; }
        .remarks-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          padding: 10px;
          color: #92400e;
          font-size: 11px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 11px;
        }
        th {
          background-color: #f1f5f9;
          color: #475569;
          text-align: left;
          padding: 6px 8px;
          font-weight: 700;
          border-bottom: 1px solid #cbd5e1;
        }
        td {
          padding: 6px 8px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }
        .journey-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px;
          text-align: center;
          margin-bottom: 12px;
        }
        .journey-step {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 6px 4px;
        }
        .journey-label {
          font-weight: 700;
          font-size: 10px;
          color: #090909;
        }
        .journey-status {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .status-done { color: #047857; }
        .status-active { color: #0284c7; }
        .status-pending { color: #94a3b8; }
        .status-delayed { color: #b45309; }
        .footer {
          margin-top: 20px;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
          text-align: center;
          font-size: 9px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; text-align: right;">
        <button onclick="window.print()" style="background: #090909; color: white; border: none; padding: 8px 18px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="header-bar">
        <div>
          <div class="brand-title">Kumkang Kind East Africa</div>
          <div class="brand-sub">Project Specification & Executive Summary Report</div>
        </div>
        <div class="report-badge">
          REF: ${project.projectId}
        </div>
      </div>

      <!-- Project Overview Header -->
      <div class="card" style="margin-bottom: 12px; background: #f0f9ff; border-color: #bae6fd;">
        <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${project.project}</div>
        <div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">
          Customer: ${project.customer} ${project.block ? `• Block: ${project.block}` : ''} • Country: ${project.country}
        </div>
        <div style="margin-top: 6px; display: flex; gap: 8px;">
          <span style="background: #090909; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-family: monospace;">${project.projectId}</span>
          <span style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 8px; border-radius: 12px; font-weight: bold;">${project.contractStatus}</span>
        </div>
      </div>

      <!-- Overall Progress -->
      <div class="section-title">Design & Execution Progress</div>
      <div class="progress-box">
        <div style="display: flex; justify-content: space-between; font-weight: 700;">
          <span>Overall Design & Execution Progress</span>
          <span class="text-blue">${progressPercent}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <!-- Project Lifecycle Journey -->
      <div class="section-title">Project Lifecycle Journey</div>
      <div class="journey-grid">
        ${stages.map(st => `
          <div class="journey-step">
            <div class="journey-label">${st.label}</div>
            <div class="journey-status ${st.status === 'completed' ? 'status-done' : st.status === 'active' ? 'status-active' : st.status === 'delayed' ? 'status-delayed' : 'status-pending'}">
              ${st.status === 'completed' ? 'Done' : st.status === 'active' ? 'Active' : st.status === 'delayed' ? 'Delayed' : 'Pending'}
            </div>
            ${st.actualDate || st.plannedDate ? `<div style="font-size: 8px; color: #64748b; margin-top: 2px;">${st.actualDate || st.plannedDate}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Financial & Technical Grid -->
      <div class="grid-2">
        <div class="card">
          <div class="section-title" style="margin-top: 0;">Commercial & Financial Details</div>
          <div class="row-item">
            <span class="row-label">Contract Value:</span>
            <span class="row-val">${project.totalAmountUSD ? `$${project.totalAmountUSD.toLocaleString()}` : '—'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Advance Collected:</span>
            <span class="row-val text-green">${project.advanceUSD ? `$${project.advanceUSD.toLocaleString()}` : '$0'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Outstanding Balance:</span>
            <span class="row-val text-amber">${project.balanceUSD ? `$${project.balanceUSD.toLocaleString()}` : '$0'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Payment Term / Status:</span>
            <span class="row-val">${project.paymentTerm || '—'} (${project.paymentStatus || '—'})</span>
          </div>
        </div>

        <div class="card">
          <div class="section-title" style="margin-top: 0;">Technical Specifications & Scope</div>
          <div class="row-item">
            <span class="row-label">Contract Qty (m²):</span>
            <span class="row-val">${project.contractQtyM2 ? `${project.contractQtyM2.toLocaleString()} m²` : '—'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Contract Weight (Tons):</span>
            <span class="row-val">${project.contractWeightTons ? `${project.contractWeightTons} T` : '—'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Actual Design Qty (m²):</span>
            <span class="row-val">${project.actualDesignQtyM2 ? `${project.actualDesignQtyM2.toLocaleString()} m²` : '—'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Incoterm:</span>
            <span class="row-val">${project.incoterm || '—'}</span>
          </div>
        </div>
      </div>

      <!-- Schedule & Milestones -->
      <div class="section-title">Project Schedule & Key Dates</div>
      <div class="grid-4">
        <div class="card" style="text-align: center;">
          <div class="row-label" style="font-size: 9px;">Contract Date</div>
          <div class="row-val">${project.contractDate || '—'}</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="row-label" style="font-size: 9px;">Shell Plan Confirm</div>
          <div class="row-val">${project.shellPlanConfirmation || '—'}</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="row-label" style="font-size: 9px;">MD Completion</div>
          <div class="row-val">${project.mdCompletion || '—'}</div>
        </div>
        <div class="card" style="text-align: center;">
          <div class="row-label" style="font-size: 9px;">Delivery Request</div>
          <div class="row-val">${project.deliveryRequest || '—'}</div>
        </div>
      </div>

      <!-- Design Elements Table (if available) -->
      ${designElements.length > 0 ? `
        <div class="section-title">Design Elements Monitoring</div>
        <table>
          <thead>
            <tr>
              <th>Element</th>
              <th>Planned Date</th>
              <th>Actual Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${designElements.map(d => `
              <tr>
                <td><strong>${d.element}</strong></td>
                <td>${d.plannedDate || '—'}</td>
                <td>${d.actualDate || '—'}</td>
                <td>${d.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <!-- Production Parts Table (if available) -->
      ${productionParts.length > 0 ? `
        <div class="section-title">Production Parts Monitoring</div>
        <table>
          <thead>
            <tr>
              <th>Part / Block</th>
              <th>Order Qty</th>
              <th>Finished Qty</th>
              <th>Completion %</th>
            </tr>
          </thead>
          <tbody>
            ${productionParts.map(p => `
              <tr>
                <td><strong>${p.part}</strong></td>
                <td>${p.orderQtyM2 ? `${p.orderQtyM2} m²` : p.orderQtyKg ? `${p.orderQtyKg} kg` : '—'}</td>
                <td>${p.finishedQtyM2 ? `${p.finishedQtyM2} m²` : p.finishedQtyKg ? `${p.finishedQtyKg} kg` : '—'}</td>
                <td><strong>${Math.round(p.completionPercent || 0)}%</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <!-- Live Shipment Tracking -->
      ${shipment ? `
        <div class="section-title">Live Shipment Status & Logistics</div>
        <div class="card" style="background: #f0f9ff; border-color: #bae6fd;">
          <div class="row-item">
            <span class="row-label">Shipment Status:</span>
            <span class="row-val text-blue">${shipment.status}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Delivery Timeline:</span>
            <span class="row-val">${shipment.deliveryTimeline || 'N/A'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Block / Package:</span>
            <span class="row-val">${shipment.block || 'N/A'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Estimated Departure (ETD):</span>
            <span class="row-val">${shipment.etd || 'N/A'}</span>
          </div>
          <div class="row-item">
            <span class="row-label">Estimated Arrival (ETA):</span>
            <span class="row-val">${shipment.eta || 'N/A'}</span>
          </div>
        </div>
      ` : ''}

      <!-- Payment Breakdown Table (if available) -->
      ${paymentBreakdown.length > 0 ? `
        <div class="section-title">Payment Schedule Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (USD)</th>
              <th>Advance Paid (USD)</th>
              <th>Balance Due (USD)</th>
            </tr>
          </thead>
          <tbody>
            ${paymentBreakdown.map(p => `
              <tr>
                <td><strong>${p.description || 'Installment'}</strong></td>
                <td>${p.amountUSD ? `$${p.amountUSD.toLocaleString()}` : '—'}</td>
                <td style="color: #047857;">${p.advancePaidUSD ? `$${p.advancePaidUSD.toLocaleString()}` : '—'}</td>
                <td style="color: #b45309;">${p.balanceUSD ? `$${p.balanceUSD.toLocaleString()}` : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <!-- Remarks -->
      ${project.remark ? `
        <div class="section-title">Remarks & Executive Notes</div>
        <div class="remarks-box">
          <strong>Notes:</strong> ${project.remark}
        </div>
      ` : ''}

      <div class="footer">
        Generated automatically by Kumkang Project Monitor • Confidential Report • ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function exportPortfolioAnalysisPDF(
  projects: typeof projectMasterData,
  kpis: {
    totalProjects: number;
    signedProjects: number;
    totalContractValueUSD: number;
    totalAdvanceUSD: number;
    totalBalanceUSD: number;
    collectionRate: number;
  },
  attentionProjects: typeof projectMasterData
) {
  const printWindow = window.open('', '_blank', 'width=950,height=1000');
  if (!printWindow) {
    alert('Please allow popups to export the Portfolio Analysis report.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const countryCounts = projects.reduce((acc, p) => {
    const c = p.country || 'Other';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Kumkang Portfolio Analysis Report</title>
      <style>
        @page { size: A4; margin: 12mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 15px;
          line-height: 1.4;
          font-size: 11px;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #090909;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .brand-title {
          font-size: 18px;
          font-weight: 800;
          color: #090909;
          text-transform: uppercase;
        }
        .brand-sub { font-size: 10px; color: #64748b; font-weight: 600; }
        .report-badge {
          background-color: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #090909;
          margin-top: 16px;
          margin-bottom: 6px;
          border-bottom: 1.5px solid #cbd5e1;
          padding-bottom: 4px;
        }
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px;
          text-align: center;
        }
        .kpi-val { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px; }
        .kpi-lbl { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          font-size: 10px;
        }
        th {
          background-color: #f1f5f9;
          color: #475569;
          text-align: left;
          padding: 6px 8px;
          font-weight: 700;
          border-bottom: 1px solid #cbd5e1;
        }
        td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        .summary-box {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-left: 4px solid #0284c7;
          padding: 10px 14px;
          border-radius: 6px;
          margin-bottom: 12px;
          font-size: 11px;
          line-height: 1.5;
          color: #0f172a;
        }
        .footer {
          margin-top: 24px;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
          text-align: center;
          font-size: 9px;
          color: #94a3b8;
        }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; text-align: right;">
        <button onclick="window.print()" style="background: #090909; color: white; border: none; padding: 8px 18px; font-weight: bold; border-radius: 6px; cursor: pointer;">
          🖨️ Print / Save Analysis PDF
        </button>
      </div>

      <div class="header-bar">
        <div>
          <div class="brand-title">KUMKANG PORTFOLIO ANALYSIS REPORT</div>
          <div class="brand-sub">Comprehensive Executive Project Performance Analysis</div>
        </div>
        <div class="report-badge">
          Generated: ${dateStr}
        </div>
      </div>

      <div class="summary-box">
        <strong>Executive Portfolio Summary:</strong><br/>
        Monitoring ${kpis.totalProjects} total projects across ${Object.keys(countryCounts).length} country regions. 
        Currently ${kpis.signedProjects} contracts are in active execution with a total contract value of $${kpis.totalContractValueUSD.toLocaleString()}. 
        Advance collections stand at $${kpis.totalAdvanceUSD.toLocaleString()} (${kpis.collectionRate}% collection rate), leaving an outstanding balance of $${kpis.totalBalanceUSD.toLocaleString()}.
        ${attentionProjects.length > 0 ? `Management action is required on ${attentionProjects.length} attention-flagged projects.` : 'All monitored projects are operating within expected parameters.'}
      </div>

      <div class="section-title">Key Performance Indicators</div>
      <div class="grid-4">
        <div class="kpi-card">
          <div class="kpi-lbl">Total Contracts</div>
          <div class="kpi-val">${kpis.totalProjects}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-lbl">Signed / Active</div>
          <div class="kpi-val" style="color: #0284c7;">${kpis.signedProjects}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-lbl">Total Contract Value</div>
          <div class="kpi-val">$${(kpis.totalContractValueUSD / 1000000).toFixed(1)}M</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-lbl">Outstanding Balance</div>
          <div class="kpi-val" style="color: #b45309;">$${(kpis.totalBalanceUSD / 1000000).toFixed(1)}M</div>
        </div>
      </div>

      <div class="section-title">Attention Required Projects (${attentionProjects.length})</div>
      <table>
        <thead>
          <tr>
            <th>Project ID</th>
            <th>Project Name</th>
            <th>Country</th>
            <th>Contract Value</th>
            <th>Balance Due</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          ${attentionProjects.map(p => `
            <tr>
              <td><strong>${p.projectId}</strong></td>
              <td>${p.project}</td>
              <td>${p.country}</td>
              <td>${p.totalAmountUSD ? `$${p.totalAmountUSD.toLocaleString()}` : '—'}</td>
              <td style="color: #b45309; font-weight: bold;">${p.balanceUSD ? `$${p.balanceUSD.toLocaleString()}` : '$0'}</td>
              <td>${p.paymentStatus || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-title">Country Portfolio Summary</div>
      <table>
        <thead>
          <tr>
            <th>Country</th>
            <th>Project Count</th>
            <th>Total Value (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(countryCounts).map(([c, count]) => {
            const countryProjects = projects.filter(p => p.country === c);
            const val = countryProjects.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);
            return `
              <tr>
                <td><strong>${c}</strong></td>
                <td>${count} projects</td>
                <td>$${val.toLocaleString()}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        Generated automatically by Kumkang Project Control Center • Confidential Management Document
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

