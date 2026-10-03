import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from './ui/StatusBadge';
import { QuickEditShipmentModal } from './QuickEditShipmentModal';
import type { ShipmentRecord } from '../data/projectData';
import { Edit3, Download, FileText } from 'lucide-react';
import { exportDispatchReportToExcel } from '../utils/excelExport';

function ShipmentJourneyBar({ shipment, isDark }: { shipment: ShipmentRecord; isDark: boolean }) {
  const steps = [
    { key: 'Prepared', value: true },
    { key: 'ETD', value: !!shipment.etd },
    { key: 'ETA', value: !!shipment.eta },
    { key: 'Delivered', value: shipment.status === 'Delivered' },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-3">
      {steps.map((step, i) => {
        const done = step.value;
        return (
          <React.Fragment key={step.key}>
            <div className={`flex flex-col items-center gap-1 flex-shrink-0 min-w-[60px] ${
              done ? (isDark ? 'text-[#70D0A8]' : 'text-emerald-600') : (isDark ? 'text-[#85858B]' : 'text-slate-400')
            }`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                done 
                  ? (isDark ? 'border-[#3FB984] bg-[#163127] text-[#70D0A8]' : 'border-emerald-500 bg-emerald-50 text-emerald-700')
                  : (isDark ? 'border-[#303035] bg-[#111113] text-[#85858B]' : 'border-slate-300 bg-slate-100 text-slate-500')
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight">{step.key}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[16px] ${
                done ? (isDark ? 'bg-[#3FB984]' : 'bg-emerald-500') : (isDark ? 'bg-[#303035]' : 'bg-slate-200')
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function ShipmentPage() {
  const { theme } = useApp();
  const { projects, shipments } = useData();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const [editingShipment, setEditingShipment] = useState<ShipmentRecord | null>(null);

  const inTransitCount = shipments.filter(s => s.status === 'In Transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const pendingCount = shipments.filter(s => s.status === 'Planned').length;

  // Calculate Overall Total Dispatch Qty (m²)
  const totalDispatchQty = shipments.reduce((sum, s) => sum + (s.dispatchQtyM2 || 0), 0);

  // Group Financial Year-wise Dispatch Qty
  const fyDispatchMap: Record<string, number> = {};
  shipments.forEach(s => {
    const dateStr = s.etd || s.loadingDate;
    let fy = 'F.Y. 2025-26';
    if (dateStr) {
      if (dateStr.includes('2024') || dateStr.includes('24')) fy = 'F.Y. 2024-25';
      else if (dateStr.includes('2026') || dateStr.includes('26')) fy = 'F.Y. 2026-27';
    }
    const qty = s.dispatchQtyM2 || 0;
    fyDispatchMap[fy] = (fyDispatchMap[fy] || 0) + qty;
  });

  const exportShipmentsPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      alert('Please allow popups to export PDF report.');
      return;
    }

    const rowsHtml = shipments.map((s) => `
      <tr>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.projectId}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.invoiceNumber || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.invoiceDate || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.unitPrice ? `$${s.unitPrice}` : '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.dispatchQtyM2 ? `${s.dispatchQtyM2} m²` : '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.invoiceAmount ? `$${s.invoiceAmount.toLocaleString()}` : '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.containerSize || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.containerTotal || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.netWeightKg ? `${s.netWeightKg} kg` : '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.grossWeightKg ? `${s.grossWeightKg} kg` : '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.pcs || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.bcsQty || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.acsQty || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.kgbhQty || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.ksbhQty || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.aluformQty || '—'}</td>
        <td style="padding:5px;border:1px solid #cbd5e1;">${s.status || 'Planned'}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipment & Dispatch Tracking Report</title>
        <style>
          body { font-family: sans-serif; font-size: 10px; color: #0f172a; padding: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #0b2239; color: white; padding: 6px; border: 1px solid #0b2239; text-align: left; }
        </style>
      </head>
      <body>
        <h2>KUMKANG SHIPMENT & DISPATCH TRACKING REPORT</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Inv No</th>
              <th>Inv Date</th>
              <th>Unit Price</th>
              <th>Qty (m²)</th>
              <th>Inv Amt</th>
              <th>Cont Size</th>
              <th>Cont Total</th>
              <th>Net Wt (KG)</th>
              <th>Gross Wt (KG)</th>
              <th>PCS</th>
              <th>BCS</th>
              <th>ACS</th>
              <th>KGBH</th>
              <th>KSBH</th>
              <th>Aluform</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={`space-y-6 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('shipmentMonitoring')}</p>
          <h2 className={`text-xl font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{t('shipmentTracking')}</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            {shipments.length} {t('shipmentRecordsLinked')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDispatchReportToExcel(shipments, projects)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs border ${
              isDark
                ? 'bg-[#132338] text-[#38BDF8] border-[#1D3B5E] hover:bg-[#183250]'
                : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
            }`}
            title={t('exportExcel')}
          >
            <Download size={14} /> {t('exportExcel')}
          </button>
          <button
            onClick={exportShipmentsPDF}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs border ${
              isDark
                ? 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/50'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            title={t('exportPdf')}
          >
            <FileText size={14} /> {t('exportPdf')}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: t('totalShipments'), value: shipments.length, color: isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]' },
          { label: t('delivered'), value: deliveredCount, color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600' },
          { label: t('inTransit'), value: inTransitCount, color: isDark ? 'text-[#89C9DF]' : 'text-sky-600' },
          { label: t('plannedPending'), value: pendingCount, color: isDark ? 'text-[#E5C47A]' : 'text-amber-600' },
          { label: t('totalDispatchQty'), value: totalDispatchQty > 0 ? `${totalDispatchQty.toLocaleString()} m²` : '—', color: isDark ? 'text-[#C9A86A]' : 'text-indigo-600' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-xl shadow-card p-4 border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* F.Y.-wise Dispatch Qty Section */}
      {Object.keys(fyDispatchMap).length > 0 && (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#C9A86A]' : 'text-sky-700'}`}>
            {t('fyDispatchSummary')}
          </h4>
          <div className="flex flex-wrap gap-4 text-xs font-medium">
            {Object.entries(fyDispatchMap).map(([fy, qty]) => (
              <div key={fy} className={`px-3 py-1.5 rounded-lg border ${isDark ? 'bg-[#18181B] border-[#303035]' : 'bg-slate-50 border-slate-200'}`}>
                <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>{fy}: </span>
                <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{qty > 0 ? `${qty.toLocaleString()} m²` : '0 m²'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per shipment */}
      {shipments.map((shipment, i) => {
        const project = projects.find(p => p.projectId === shipment.projectId);
        const isTransit = shipment.status === 'In Transit';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl shadow-card p-5 border ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
            } ${isTransit ? (isDark ? 'border-l-4 border-l-[#56A9C7]' : 'border-l-4 border-l-[#1688D4]') : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                    isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-slate-100 border-slate-300'
                  }`}>
                    {shipment.projectId}
                  </span>
                  {shipment.invoiceNumber && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isDark ? 'bg-[#2A2419] text-[#E8D6AE] border-[#55462C]' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      Inv: {shipment.invoiceNumber}
                    </span>
                  )}
                </div>
                <h3 className={`font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{project?.project ?? shipment.projectId}</h3>
                <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{project?.customer ?? '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingShipment(shipment)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
                    isDark
                      ? 'bg-[#18181B] text-[#89C9DF] border-[#303035] hover:bg-[#202025]'
                      : 'bg-slate-100 text-sky-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Edit3 size={13} /> {t('editLogistics')}
                </button>
                <StatusBadge status={shipment.status} />
              </div>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-sm mb-4 border-y py-3 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('fwdForwarder')}</p>
                <p className={`font-mono font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.fwd ?? '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('etdOrigin')}</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.etd ?? '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('etaDestination')}</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.eta ?? '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('containerSizeTotal')}</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                  {shipment.containerSize || '—'} {shipment.containerTotal ? `(${shipment.containerTotal} units)` : ''}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('netWeightKg')}</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.netWeightKg ? `${shipment.netWeightKg.toLocaleString()} kg` : '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('grossWeightKg')}</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.grossWeightKg ? `${shipment.grossWeightKg.toLocaleString()} kg` : '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('pcs')}</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{shipment.pcs ? shipment.pcs.toLocaleString() : '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('invoiceAmount')}</p>
                <p className={`font-semibold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>
                  {shipment.invoiceAmount ? `$${shipment.invoiceAmount.toLocaleString()}` : '—'}
                </p>
              </div>
            </div>

            {/* Material Quantities Breakdown if available */}
            {(shipment.bcsQty || shipment.acsQty || shipment.kgbhQty || shipment.ksbhQty || shipment.aluformQty) && (
              <div className={`p-3 rounded-lg mb-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs border ${
                isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div><span className="text-slate-400 block">{t('bcsQty')}:</span> <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}>{shipment.bcsQty ?? '—'}</strong></div>
                <div><span className="text-slate-400 block">{t('acsQty')}:</span> <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}>{shipment.acsQty ?? '—'}</strong></div>
                <div><span className="text-slate-400 block">{t('kgbhQty')}:</span> <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}>{shipment.kgbhQty ?? '—'}</strong></div>
                <div><span className="text-slate-400 block">{t('ksbhQty')}:</span> <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}>{shipment.ksbhQty ?? '—'}</strong></div>
                <div><span className="text-slate-400 block">{t('aluformQty')}:</span> <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}>{shipment.aluformQty ?? '—'}</strong></div>
              </div>
            )}

            <ShipmentJourneyBar shipment={shipment} isDark={isDark} />
          </motion.div>
        );
      })}

      {/* Projects with no shipment */}
      {projects
        .filter(p => p.contractStatus === 'Signed' && !shipments.some(s => s.projectId === p.projectId))
        .map(project => (
          <div key={project.projectId} className={`p-5 border border-dashed rounded-xl ${
            isDark ? 'bg-[#151517] border-[#303035]' : 'bg-white border-slate-300'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-slate-100 border-slate-300'
              }`}>{project.projectId}</span>
              <StatusBadge status={project.contractStatus} />
            </div>
            <p className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.project}</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('noShipmentRecords')}</p>
          </div>
        ))}

      {editingShipment && (
        <QuickEditShipmentModal
          shipment={editingShipment}
          onClose={() => setEditingShipment(null)}
        />
      )}
    </div>
  );
}
