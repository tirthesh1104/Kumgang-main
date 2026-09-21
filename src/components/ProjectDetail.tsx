import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { StatusBadge, PaymentBadge } from './ui/StatusBadge';
import { ProgressBar, PlannedActualBar } from './ui/ProgressBar';
import { ProjectJourney, buildProjectStages } from './projects/ProjectJourney';
import { exportProjectPDF } from '../utils/pdfExport';
import { EditProjectModal } from './EditProjectModal';
import { useState } from 'react';
import {
  ArrowLeft, AlertTriangle, ChevronDown, ChevronUp, FileText, Printer, X, Edit3
} from 'lucide-react';

function FieldRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <div>
      <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{label}</p>
      <p className={`font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{display}</p>
    </div>
  );
}

function SectionCard({ title, label, children }: { title: string; label?: string; children: React.ReactNode }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(true);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl shadow-card border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
    >
      <div
        className="flex items-center justify-between p-5 pb-0 cursor-pointer"
        onClick={() => setOpen(o => !o)}
        role="button"
        aria-expanded={open}
      >
        <div>
          {label && <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{label}</p>}
          <h3 className={`text-base font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{title}</h3>
        </div>
        {open ? <ChevronUp size={16} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} /> : <ChevronDown size={16} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />}
      </div>
      {open && <div className="p-5">{children}</div>}
    </motion.div>
  );
}

function RiskTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-[#34191B] text-[#F08A8A] border border-[#5A292B] px-1.5 py-0.5 rounded">
      Financial Risk
    </span>
  );
}

// Export Preview Modal Component
function ExportPreviewModal({
  project,
  onClose
}: {
  project: any;
  onClose: () => void;
}) {
  const { liveDateTime, theme } = useApp();
  const isDark = theme === 'dark';
  const {
    getShipmentForProject,
    getDesignForProject,
    getProductionForProject,
    getPaymentsForProject,
  } = useData();

  const shipment = getShipmentForProject(project.projectId);
  const designElements = getDesignForProject(project.projectId);
  const productionParts = getProductionForProject(project.projectId);
  const paymentBreakdown = getPaymentsForProject(project.projectId);
  const stages = buildProjectStages(project);

  const progressPercent = project.designProgressPercent != null
    ? Math.min(project.designProgressPercent, 100)
    : (project.contractStatus === 'Signed' ? 50 : 100);

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 z-50 overflow-y-auto ${
      isDark ? 'bg-black/75' : 'bg-slate-900/50'
    }`}>
      <div className={`border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Modal Action Top Bar */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${
          isDark ? 'bg-[#090909] text-white border-[#1E1E20]' : 'bg-[#0B2239] text-white border-slate-800'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <FileText size={18} className={isDark ? 'text-[#C9A86A]' : 'text-sky-400'} />
              <h3 className="font-extrabold text-base tracking-wide text-white">KUMKANG PROJECT REPORT PREVIEW</h3>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
              Confidential Executive Summary • Ref: <span className={`font-mono ${isDark ? 'text-[#C9A86A]' : 'text-sky-300'}`}>{project.projectId}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportProjectPDF(project, shipment)}
              className={`flex items-center gap-2 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                isDark
                  ? 'bg-[#C9A86A] hover:bg-[#D7B97C] text-[#111111]'
                  : 'bg-[#1688D4] hover:bg-[#1272B2] text-white'
              }`}
            >
              <Printer size={14} /> EXPORT TO PDF
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-[#85858B] hover:text-white hover:bg-[#18181B]' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body Preview */}
        <div className={`flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 ${
          isDark ? 'bg-[#0A0A0A]' : 'bg-slate-100'
        }`}>
          <div className={`border rounded-xl p-6 lg:p-8 shadow-sm space-y-6 max-w-3xl mx-auto ${
            isDark ? 'bg-[#151517] border-[#262629] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Report Header */}
            <div className={`flex items-center justify-between border-b-2 pb-4 ${
              isDark ? 'border-[#C9A86A]' : 'border-[#1688D4]'
            }`}>
              <div>
                <h2 className={`text-xl font-extrabold uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>KUMKANG KIND EAST AFRICA</h2>
                <p className={`text-xs font-semibold ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Project Specification & Executive Summary Report</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full inline-block border ${
                  isDark ? 'bg-[#2A2419] text-[#E8D6AE] border-[#55462C]' : 'bg-sky-50 text-[#1688D4] border-sky-200'
                }`}>
                  REF: {project.projectId}
                </span>
                <p className={`text-[10px] font-medium mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-400'}`}>{liveDateTime}</p>
              </div>
            </div>

            {/* Section 1: Project Identity */}
            <div className={`border rounded-xl p-4 space-y-2 ${
              isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>{project.project}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                    isDark ? 'bg-[#18181B] text-[#F5F5F3] border-[#303035]' : 'bg-white text-slate-700 border-slate-300'
                  }`}>
                    {project.projectId}
                  </span>
                  <StatusBadge status={project.contractStatus} />
                </div>
              </div>
              <p className={`text-xs font-semibold ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                Customer: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{project.customer}</strong> {project.block ? `• Block: ${project.block}` : ''} • Country: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{project.country}</strong>
              </p>
            </div>

            {/* Section 2: Progress Bar */}
            <div className={`space-y-1.5 border-b pb-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className={`uppercase tracking-wider text-[10px] ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Overall Design & Execution Progress</span>
                <span className={`font-extrabold ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>{progressPercent}%</span>
              </div>
              <div className={`w-full rounded-full h-3 overflow-hidden border ${
                isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-200 border-slate-300'
              }`}>
                <div className={`h-full rounded-full ${isDark ? 'bg-[#C9A86A]' : 'bg-[#1688D4]'}`} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Section 3: Project Lifecycle Journey */}
            <div className={`space-y-2 border-b pb-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Project Lifecycle Journey</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {stages.map(st => (
                  <div key={st.id} className={`border rounded-lg p-2 text-center ${
                    isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] font-bold block truncate ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{st.label}</span>
                    <span className={`text-[9px] font-extrabold uppercase inline-block mt-0.5 px-1.5 py-0.2 rounded ${
                      st.status === 'completed'
                        ? (isDark ? 'bg-[#163127] text-[#70D0A8]' : 'bg-emerald-100 text-emerald-700')
                        : st.status === 'active'
                        ? (isDark ? 'bg-[#2A2419] text-[#E8D6AE]' : 'bg-sky-100 text-sky-700')
                        : st.status === 'delayed'
                        ? (isDark ? 'bg-[#322917] text-[#E5C47A]' : 'bg-amber-100 text-amber-700')
                        : (isDark ? 'bg-[#18181B] text-[#85858B]' : 'bg-slate-200 text-slate-500')
                    }`}>
                      {st.status === 'completed' ? 'Done' : st.status === 'active' ? 'Active' : st.status === 'delayed' ? 'Delayed' : 'Pending'}
                    </span>
                    {(st.actualDate || st.plannedDate) && (
                      <span className={`text-[8px] block mt-1 truncate ${isDark ? 'text-[#85858B]' : 'text-slate-400'}`}>{st.actualDate || st.plannedDate}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Financial & Technical Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className={`border rounded-xl p-4 space-y-2 ${
                isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Commercial & Financial Details</h4>
                <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Contract Value:</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.totalAmountUSD ? `$${project.totalAmountUSD.toLocaleString()}` : '—'}</span>
                </div>
                <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Advance Collected:</span>
                  <span className={`font-bold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>{project.advanceUSD ? `$${project.advanceUSD.toLocaleString()}` : '$0'}</span>
                </div>
                <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Outstanding Balance:</span>
                  <span className={`font-bold ${isDark ? 'text-[#E5C47A]' : 'text-amber-600'}`}>{project.balanceUSD ? `$${project.balanceUSD.toLocaleString()}` : '$0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Payment Term / Status:</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.paymentTerm || '—'} ({project.paymentStatus || '—'})</span>
                </div>
              </div>

              <div className={`border rounded-xl p-4 space-y-2 ${
                isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Technical Specifications & Scope</h4>
                <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Contract Qty (m²):</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.contractQtyM2 ? `${project.contractQtyM2.toLocaleString()} m²` : '—'}</span>
                </div>
                <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Contract Weight (Tons):</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.contractWeightTons ? `${project.contractWeightTons} T` : '—'}</span>
                </div>
                <div className={`flex justify-between border-b pb-1 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Actual Design Qty (m²):</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.actualDesignQtyM2 ? `${project.actualDesignQtyM2.toLocaleString()} m²` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Incoterm:</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.incoterm || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section 5: Schedule & Dates */}
            <div className={`space-y-2 border-b pb-4 text-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Project Schedule & Key Dates</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Contract Date</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.contractDate || '—'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Shell Plan Confirm</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.shellPlanConfirmation || '—'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>MD Completion</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.mdCompletion || '—'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Delivery Request</span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.deliveryRequest || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section 6: Design Elements Table */}
            {designElements.length > 0 && (
              <div className={`space-y-2 text-xs border-b pb-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Design Elements Monitoring</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${isDark ? 'bg-[#111113] text-[#85858B] border-[#262629]' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <th className="p-2 font-bold">Element</th>
                        <th className="p-2 font-bold">Planned Date</th>
                        <th className="p-2 font-bold">Actual Date</th>
                        <th className="p-2 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {designElements.map(d => (
                        <tr key={d.designId} className={`border-b ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                          <td className={`p-2 font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{d.element}</td>
                          <td className={`p-2 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.plannedDate || '—'}</td>
                          <td className={`p-2 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.actualDate || '—'}</td>
                          <td className={`p-2 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{d.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 7: Production Parts Table */}
            {productionParts.length > 0 && (
              <div className={`space-y-2 text-xs border-b pb-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Production Monitoring</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${isDark ? 'bg-[#111113] text-[#85858B] border-[#262629]' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <th className="p-2 font-bold">Part / Block</th>
                        <th className="p-2 font-bold">Order Qty</th>
                        <th className="p-2 font-bold">Finished Qty</th>
                        <th className="p-2 font-bold">Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productionParts.map((p, i) => (
                        <tr key={i} className={`border-b ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                          <td className={`p-2 font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.part}</td>
                          <td className={`p-2 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.orderQtyM2 ? `${p.orderQtyM2} m²` : p.orderQtyKg ? `${p.orderQtyKg} kg` : '—'}</td>
                          <td className={`p-2 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.finishedQtyM2 ? `${p.finishedQtyM2} m²` : p.finishedQtyKg ? `${p.finishedQtyKg} kg` : '—'}</td>
                          <td className={`p-2 font-bold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>{Math.round(p.completionPercent || 0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 8: Shipment */}
            {shipment && (
              <div className={`border rounded-xl p-4 text-xs space-y-1.5 ${
                isDark ? 'bg-[#17272E] border-[#294651]' : 'bg-sky-50 border-sky-200'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#89C9DF]' : 'text-sky-800'}`}>Live Shipment Status & Logistics</h4>
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                  <div><span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Status:</span> <strong>{shipment.status}</strong></div>
                  <div><span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>ETD:</span> <strong>{shipment.etd || '—'}</strong></div>
                  <div><span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>ETA:</span> <strong>{shipment.eta || '—'}</strong></div>
                  <div><span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Timeline:</span> <strong>{shipment.deliveryTimeline || '—'}</strong></div>
                  <div><span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Block:</span> <strong>{shipment.block || '—'}</strong></div>
                </div>
              </div>
            )}

            {/* Section 9: Payments Breakdown */}
            {paymentBreakdown.length > 0 && (
              <div className={`space-y-2 text-xs border-b pb-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Payment Schedule Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${isDark ? 'bg-[#111113] text-[#85858B] border-[#262629]' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <th className="p-2 font-bold">Description</th>
                        <th className="p-2 font-bold">Amount (USD)</th>
                        <th className="p-2 font-bold">Advance Paid</th>
                        <th className="p-2 font-bold">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentBreakdown.map((p, i) => (
                        <tr key={i} className={`border-b ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                          <td className={`p-2 font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.description || 'Installment'}</td>
                          <td className={`p-2 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.amountUSD ? `$${p.amountUSD.toLocaleString()}` : '—'}</td>
                          <td className={`p-2 font-semibold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>{p.advancePaidUSD ? `$${p.advancePaidUSD.toLocaleString()}` : '—'}</td>
                          <td className={`p-2 font-semibold ${isDark ? 'text-[#E5C47A]' : 'text-amber-600'}`}>{p.balanceUSD ? `$${p.balanceUSD.toLocaleString()}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Remarks */}
            {project.remark && (
              <div className={`border rounded-xl p-3 text-xs font-medium ${
                isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <strong className="block mb-0.5">Remarks:</strong> {project.remark}
              </div>
            )}

            <div className={`text-center text-[10px] border-t pt-4 ${isDark ? 'text-[#85858B] border-[#262629]' : 'text-slate-400 border-slate-200'}`}>
              Generated automatically by Kumkang Project Monitor • Confidential Report
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-b-2xl border-t ${
          isDark ? 'bg-[#090909] border-[#1E1E20]' : 'bg-[#0B2239] border-slate-800 text-white'
        }`}>
          <button
            onClick={onClose}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              isDark ? 'text-[#B4B4B8] hover:text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Close Preview
          </button>
          <button
            onClick={() => exportProjectPDF(project, shipment)}
            className={`flex items-center gap-2 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ${
              isDark
                ? 'bg-[#C9A86A] hover:bg-[#D7B97C] text-[#111111]'
                : 'bg-[#1688D4] hover:bg-[#1272B2] text-white'
            }`}
          >
            <Printer size={15} /> EXPORT TO PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetail() {
  const { selectedProjectId, selectedFolder, navigate, theme } = useApp();
  const isDark = theme === 'dark';
  const {
    getProjectById, getDesignForProject, getProductionForProject,
    getShipmentForProject, getPaymentsForProject
  } = useData();

  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const project = selectedProjectId ? getProjectById(selectedProjectId) : undefined;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#85858B]">
        <AlertTriangle size={32} className="mb-3" />
        <p className="font-medium">Project not found.</p>
        <button onClick={() => navigate('projects')} className="mt-4 btn-primary">
          Back to Projects
        </button>
      </div>
    );
  }

  const design = getDesignForProject(project.projectId);
  const productionList = getProductionForProject(project.projectId);
  const shipment = getShipmentForProject(project.projectId);
  const payments = getPaymentsForProject(project.projectId);
  const stages = buildProjectStages(project);

  const hasBalance = (project.balanceUSD || 0) > 0;
  const notFullyPaid = project.paymentStatus && !project.paymentStatus.toLowerCase().includes('100%');
  const needsAttention = hasBalance && notFullyPaid;
  const progressPercent = project.designProgressPercent != null ? Math.round(project.designProgressPercent) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`space-y-5 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}
    >
      {/* Action Bar Header with Back Navigation & EDIT / EXPORT Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {selectedFolder ? (
            <button
              onClick={() => navigate('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isDark ? 'bg-[#18181B] text-[#D5D5D8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft size={14} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} /> Back to {selectedFolder} Folder
            </button>
          ) : null}
          <button
            onClick={() => navigate('projects')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isDark ? 'bg-[#18181B] text-[#D5D5D8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft size={14} className={isDark ? 'text-[#85858B]' : 'text-slate-500'} /> Back to Projects List
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isDark ? 'bg-[#C9A86A] text-[#111111] hover:bg-[#D7B97C]' : 'bg-[#1688D4] text-white hover:bg-[#0284C7]'
            }`}
          >
            <Edit3 size={15} />
            EDIT PROJECT
          </button>

          <button
            onClick={() => setIsExportPreviewOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
              isDark ? 'bg-[#2A2419] text-[#E8D6AE] border-[#55462C] hover:bg-[#342C1F]' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <FileText size={15} />
            EXPORT
          </button>
        </div>
      </div>

      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border shadow-2xs ${
          needsAttention 
            ? (isDark ? 'bg-[#34191B] border-[#5A292B]' : 'bg-red-50 border-red-200') 
            : (isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200')
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border font-mono ${
                needsAttention 
                  ? (isDark ? 'text-[#F08A8A] bg-[#18181B] border-[#5A292B]' : 'text-red-700 bg-red-100 border-red-300')
                  : (isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-800 bg-slate-100 border-slate-300')
              }`}>
                {project.projectId}
              </span>
              <StatusBadge status={project.contractStatus} />
              <PaymentBadge status={project.paymentStatus} />
              {needsAttention && (
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${
                  isDark ? 'text-[#F08A8A] bg-[#34191B] border-[#5A292B]' : 'text-red-700 bg-red-100 border-red-300'
                }`}>
                  <AlertTriangle size={11} />
                  Balance Due: ${project.balanceUSD?.toLocaleString()}
                </span>
              )}
            </div>
            <h1 className={`text-2xl font-extrabold ${
              needsAttention 
                ? (isDark ? 'text-[#FFFFFF]' : 'text-red-900') 
                : (isDark ? 'text-[#FFFFFF]' : 'text-slate-900')
            }`}>{project.project}</h1>
            <p className={`mt-1 font-semibold text-sm ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
              {project.customer}{project.block ? ` · Block ${project.block}` : ''} • {project.country}
            </p>
          </div>
          {progressPercent != null && (
            <div className="text-right">
              <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${needsAttention ? 'text-red-500' : 'text-slate-400'}`}>Design Progress</p>
              <p className={`text-4xl font-extrabold ${needsAttention ? (isDark ? 'text-[#F08A8A]' : 'text-red-600') : (isDark ? 'text-[#FFFFFF]' : 'text-slate-900')}`}>{progressPercent}%</p>
              <div className="mt-2 w-32">
                <ProgressBar value={progressPercent} color={needsAttention ? 'orange' : 'forest'} size="lg" />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1">
          <SectionCard title="Project Journey" label="Lifecycle">
            <ProjectJourney stages={stages} />
          </SectionCard>
        </div>

        <div className="xl:col-span-2 space-y-5">

          {/* Project Overview */}
          <SectionCard title="Project Overview" label="Contract & Quantities">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-5">
              <FieldRow label="Contract Date" value={project.contractDate} />
              <FieldRow label="Country" value={project.country} />
              <FieldRow label="Delivery Request" value={project.deliveryRequest} />
              <FieldRow label="ETD" value={project.etd} />
              <FieldRow label="ETA" value={project.eta} />
              <FieldRow label="Loading Date" value={project.loadingDate} />
              <FieldRow label="Production Start" value={project.productionStart} />
              <FieldRow label="Production Complete" value={project.productionComplete} />
              <FieldRow label="Shell Plan Confirmation" value={project.shellPlanConfirmation} />
            </div>
            
            {(project.contractQtyM2 || project.actualDesignQtyM2) && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5">
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Contract Qty</p>
                    <p className={`text-base font-extrabold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.contractQtyM2?.toLocaleString() ?? '—'} m²</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Actual Design Qty</p>
                    <p className={`text-base font-extrabold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.actualDesignQtyM2?.toLocaleString() ?? '—'} m²</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Contract Wt</p>
                    <p className={`text-base font-extrabold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.contractWeightTons?.toLocaleString() ?? '—'} t</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Actual Design Wt</p>
                    <p className={`text-base font-extrabold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.actualDesignWeightTons?.toLocaleString() ?? '—'} t</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {(project.contractQtyM2 || project.actualDesignQtyM2) && (
                    <PlannedActualBar label="Quantity (m²)" planned={project.contractQtyM2 || 0} actual={project.actualDesignQtyM2 || 0} unit=" m²" />
                  )}
                  {(project.contractWeightTons || project.actualDesignWeightTons) && (
                    <PlannedActualBar label="Weight (tons)" planned={project.contractWeightTons || 0} actual={project.actualDesignWeightTons || 0} unit=" t" />
                  )}
                </div>
              </>
            )}
            
            {project.remark && (
              <p className={`mt-4 text-sm italic border-t pt-3 ${isDark ? 'text-[#85858B] border-[#262629]' : 'text-slate-600 border-slate-200'}`}>
                Remark: {project.remark}
              </p>
            )}
          </SectionCard>

          {/* Design */}
          {design.length > 0 && (
            <SectionCard title="Design Elements" label="Design Monitoring">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Design schedule table">
                  <thead>
                    <tr className={`border-b text-xs uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
                      <th className="text-left py-2 pr-4 font-semibold">Element</th>
                      <th className="text-left py-2 pr-4 font-semibold">Planned</th>
                      <th className="text-left py-2 pr-4 font-semibold">Actual</th>
                      <th className="text-left py-2 pr-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#262629]' : 'divide-slate-200'}`}>
                    {design.map(d => (
                      <tr key={d.designId} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                        <td className={`py-2.5 pr-4 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{d.element}</td>
                        <td className={`py-2.5 pr-4 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.plannedDate ?? '—'}</td>
                        <td className={`py-2.5 pr-4 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.actualDate ?? '—'}</td>
                        <td className="py-2.5 pr-4"><StatusBadge status={d.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Production */}
          {productionList.length > 0 && (
            <SectionCard title="Production Parts" label="Production Monitoring">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Production table">
                  <thead>
                    <tr className={`border-b text-xs uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
                      <th className="text-left py-2 pr-4 font-semibold">Part / Block</th>
                      <th className="text-left py-2 pr-4 font-semibold">Order Qty</th>
                      <th className="text-left py-2 pr-4 font-semibold">Finished Qty</th>
                      <th className="text-left py-2 pr-4 font-semibold">Completion</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#262629]' : 'divide-slate-200'}`}>
                    {productionList.map((prod, i) => (
                      <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                        <td className={`py-2.5 pr-4 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{prod.part}</td>
                        <td className={`py-2.5 pr-4 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                          {prod.orderQtyM2 ? `${prod.orderQtyM2} m²` : prod.orderQtyKg ? `${prod.orderQtyKg} kg` : '—'}
                        </td>
                        <td className={`py-2.5 pr-4 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                          {prod.finishedQtyM2 ? `${prod.finishedQtyM2} m²` : prod.finishedQtyKg ? `${prod.finishedQtyKg} kg` : '—'}
                        </td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold w-8 ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>{Math.round(prod.completionPercent || 0)}%</span>
                            <div className="w-16"><ProgressBar value={prod.completionPercent || 0} color="forest" size="sm" /></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Shipment */}
          {shipment ? (
            <SectionCard title="Shipment Details" label="Shipment Monitoring">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-5">
                <FieldRow label="ETD" value={shipment.etd} />
                <FieldRow label="ETA" value={shipment.eta} />
                <FieldRow label="FWD" value={shipment.fwd} />
                <FieldRow label="Status" value={shipment.status} />
                <FieldRow label="Delivery Timeline" value={shipment.deliveryTimeline} />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-3">
                {['Prepared', 'ETD', 'ETA', 'Delivered'].map((step, i, arr) => {
                  const doneMap: Record<string, boolean> = {
                    'Prepared': true, // Assume prepared if record exists
                    'ETD': !!shipment.etd,
                    'ETA': !!shipment.eta,
                    'Delivered': shipment.status === 'Delivered',
                  };
                  const done = doneMap[step];
                  return (
                    <span key={step} className="flex items-center flex-shrink-0 gap-2">
                      <div className={`flex flex-col items-center gap-1 ${done ? (isDark ? 'text-[#70D0A8]' : 'text-emerald-700') : (isDark ? 'text-[#85858B]' : 'text-slate-400')}`}>
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold
                          ${done 
                            ? (isDark ? 'border-[#3FB984] bg-[#163127] text-[#70D0A8]' : 'border-emerald-500 bg-emerald-50 text-emerald-700') 
                            : (isDark ? 'border-[#303035] bg-[#111113] text-[#85858B]' : 'border-slate-300 bg-slate-100 text-slate-500')}`}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span className="text-[10px] font-medium">{step}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`h-0.5 w-8 ${done ? (isDark ? 'bg-[#3FB984]' : 'bg-emerald-500') : (isDark ? 'bg-[#303035]' : 'bg-slate-200')}`} />
                      )}
                    </span>
                  );
                })}
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Shipment Details" label="Shipment Monitoring">
              <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>No active shipment records mapped for this project.</p>
            </SectionCard>
          )}

          {/* Payment */}
          {(project.totalAmountUSD || payments.length > 0) ? (
            <SectionCard title="Commercial & Payments" label="Financial Monitoring">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-5">
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Contract Amount</p>
                  <p className={`text-lg font-extrabold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.totalAmountUSD ? `$${project.totalAmountUSD.toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Advance Paid</p>
                  <p className={`text-lg font-extrabold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>{project.advanceUSD ? `$${project.advanceUSD.toLocaleString()}` : '—'}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Balance Due</p>
                  <p className={`text-lg font-extrabold ${project.balanceUSD && project.balanceUSD > 0 ? (isDark ? 'text-[#E5C47A]' : 'text-amber-700') : (isDark ? 'text-[#70D0A8]' : 'text-emerald-700')}`}>
                    {project.balanceUSD ? `$${project.balanceUSD.toLocaleString()}` : '$0'}
                  </p>
                </div>
              </div>
              <PaymentBadge status={project.paymentStatus} />
              
              {payments.length > 0 && (
                <div className={`mt-6 border-t pt-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <p className={`text-sm font-extrabold mb-3 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>Payment Schedule Breakdown</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b text-xs uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
                          <th className="text-left py-2 pr-4 font-semibold">Description</th>
                          <th className="text-left py-2 pr-4 font-semibold">Value</th>
                          <th className="text-left py-2 pr-4 font-semibold">Advance</th>
                          <th className="text-left py-2 pr-4 font-semibold">Balance</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-[#262629]' : 'divide-slate-200'}`}>
                        {payments.map((pay, i) => (
                          <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                            <td className={`py-2.5 pr-4 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{pay.description || 'Installment'}</td>
                            <td className={`py-2.5 pr-4 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{pay.amountUSD ? `$${pay.amountUSD.toLocaleString()}` : '—'}</td>
                            <td className={`py-2.5 pr-4 font-semibold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>{pay.advancePaidUSD ? `$${pay.advancePaidUSD.toLocaleString()}` : '—'}</td>
                            <td className={`py-2.5 pr-4 font-semibold ${isDark ? 'text-[#E5C47A]' : 'text-amber-700'}`}>{pay.balanceUSD ? `$${pay.balanceUSD.toLocaleString()}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </SectionCard>
          ) : (
            <SectionCard title="Commercial & Payments" label="Financial Monitoring">
              <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>No payment data available for this project.</p>
            </SectionCard>
          )}

          {/* Derived Risk (replacing old ML data) */}
          {needsAttention && (
            <SectionCard title="Risk Intelligence" label="DERIVED Insight">
              <div className="flex items-center gap-2 mb-4">
                <RiskTag />
                <span className="text-xs text-[#85858B]">
                  Based on objective project finance data.
                </span>
              </div>
              <div className="flex items-start gap-4 p-4 bg-[#34191B] border border-[#5A292B] rounded-lg">
                <AlertTriangle size={24} className="text-[#F08A8A]" />
                <div>
                  <h4 className="font-bold text-[#F08A8A] mb-1">Financial Exposure Detected</h4>
                  <p className="text-sm text-[#B4B4B8]">
                    This project has an outstanding balance of <strong>${project.balanceUSD?.toLocaleString()}</strong> but its payment status is recorded as <strong>{project.paymentStatus || 'incomplete'}</strong>.
                  </p>
                  <p className="text-sm text-[#B4B4B8] mt-2">
                    Action required: Review collection schedule or pause future shipment dispatches until payment clears.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}
          
          {project.contractStatus === 'Cancelled' && (
            <SectionCard title="Cancellation Insight" label="DERIVED Insight">
              <div className="flex items-start gap-4 p-4 bg-[#34191B] border border-[#5A292B] rounded-lg">
                <AlertTriangle size={24} className="text-[#F08A8A]" />
                <div>
                  <h4 className="font-bold text-[#F08A8A] mb-1">Project Terminated</h4>
                  <p className="text-sm text-[#B4B4B8]">
                    This project contract has been officially cancelled. Delivery and production schedules are suspended.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <EditProjectModal
          projectId={project.projectId}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Export Preview Modal */}
      {isExportPreviewOpen && (
        <ExportPreviewModal
          project={project}
          onClose={() => setIsExportPreviewOpen(false)}
        />
      )}
    </motion.div>
  );
}
