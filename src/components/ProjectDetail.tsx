import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge, PaymentBadge } from './ui/StatusBadge';
import { ProgressBar, PlannedActualBar } from './ui/ProgressBar';
import { ProjectJourney, buildProjectStages } from './projects/ProjectJourney';
import { exportProjectPDF } from '../utils/pdfExport';
import { addWeeksToDate } from '../data/projectData';
import { EditProjectModal } from './EditProjectModal';
import { QuickEditDesignModal } from './QuickEditDesignModal';
import { ProjectDocumentsSection } from './documents/ProjectDocumentsSection';
import { DesignAreaSection } from './phase3/DesignAreaSection';
import { SiteExecutionSection } from './phase3/SiteExecutionSection';
import { useState } from 'react';
import {
  ArrowLeft, AlertTriangle, ChevronDown, ChevronUp, FileText, Printer, X, Edit3,
  Plus, Trash2, Edit2, Save, Upload, Paperclip, DollarSign
} from 'lucide-react';

function PaymentMatrixTable({ projectId, totalContractUSD }: { projectId: string; totalContractUSD: number }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { getPaymentsForProject, recordNewPayment, updatePaymentRow, deletePaymentRow, getLastApprovedPIDate, getProjectById } = useData();
  const payments = getPaymentsForProject(projectId);
  const project = getProjectById(projectId);
  const dynamicLastPi = getLastApprovedPIDate(projectId) || project?.lastPiRaisedDate || '—';

  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const exchangeRate = 83.5;
  const currSymbol = currency === 'USD' ? '$' : '₹';
  const mult = currency === 'USD' ? 1 : exchangeRate;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleStartEdit = (pay: any) => {
    setEditingId(pay.paymentId);
    setEditForm({
      stageWise: pay.stageWise || pay.description || '',
      amountUSD: pay.amountUSD || 0,
      advancePaidUSD: pay.advancePaidUSD || 0,
      dueDays: pay.dueDays ?? project?.dueDays ?? 30,
      remark: pay.remark || '',
      documentName: pay.documentName || '',
      documentUrl: pay.documentUrl || '',
    });
  };

  const handleSaveEdit = (paymentId: string) => {
    const amt = parseFloat(editForm.amountUSD) || 0;
    const paid = parseFloat(editForm.advancePaidUSD) || 0;
    const bal = amt - paid;
    const balPct = amt > 0 ? (bal / amt) * 100 : 0;
    updatePaymentRow(paymentId, {
      stageWise: editForm.stageWise,
      description: editForm.stageWise,
      amountUSD: amt,
      advancePaidUSD: paid,
      balanceUSD: bal,
      dueDays: parseInt(editForm.dueDays, 10) || 0,
      remark: editForm.remark,
      documentName: editForm.documentName,
      documentUrl: editForm.documentUrl,
      balancePercent: balPct,
    });
    setEditingId(null);
  };

  const handleAddRow = () => {
    const newId = `PAY-${Date.now().toString().slice(-6)}`;
    const newStage = `Stage ${payments.length + 1}`;
    recordNewPayment({
      paymentId: newId,
      projectId,
      customer: project?.customer || '',
      project: project?.project || '',
      tower: project?.block || '',
      description: newStage,
      stageWise: newStage,
      amountUSD: 10000,
      advancePaidUSD: 0,
      balanceUSD: 10000,
      dueDays: 30,
      lastPiDate: dynamicLastPi !== '—' ? dynamicLastPi : undefined,
      remark: 'New Payment Milestone',
    });
  };

  const handleDelete = (paymentId: string) => {
    deletePaymentRow(paymentId);
  };

  const handleFileUpload = (paymentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updatePaymentRow(paymentId, {
        documentName: file.name,
        documentUrl: url,
      });
    }
  };

  // Totals
  const contractVal = totalContractUSD || payments.reduce((acc, p) => acc + (p.amountUSD || 0), 0) || 1;
  const totalScheduledUSD = payments.reduce((acc, p) => acc + (p.amountUSD || 0), 0);
  const totalReceivedUSD = payments.reduce((acc, p) => acc + (p.advancePaidUSD || 0), 0);
  const totalBalanceUSD = totalScheduledUSD - totalReceivedUSD;
  const overallReceivedPct = totalScheduledUSD > 0 ? (totalReceivedUSD / totalScheduledUSD) * 100 : 0;
  const overallBalancePct = totalScheduledUSD > 0 ? (totalBalanceUSD / totalScheduledUSD) * 100 : 0;

  return (
    <div className="space-y-3 mt-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h4 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
            <DollarSign size={16} className="text-emerald-500" /> 12-Column Payment Receivable Matrix
          </h4>
          <p className={`text-[11px] ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Comprehensive stage-wise financial tracking, PI alignment, due days & document uploads
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className={`p-1 rounded-lg border flex items-center gap-1 text-xs font-bold ${
            isDark ? 'bg-[#18181B] border-[#303035]' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded transition-all ${currency === 'USD' ? 'bg-[#1688D4] text-white shadow-xs' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-0.5 rounded transition-all ${currency === 'INR' ? 'bg-[#1688D4] text-white shadow-xs' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}
            >
              INR (₹)
            </button>
          </div>

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              isDark ? 'bg-[#27272A] hover:bg-[#3F3F46] text-[#F5F5F3] border border-[#303035]' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            <Plus size={14} /> Add Payment Row
          </button>
        </div>
      </div>

      {/* 12-Column Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/30 shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className={`uppercase font-bold text-[10px] tracking-wider border-b ${
              isDark ? 'bg-[#18181B] text-[#A1A1AA] border-[#27272A]' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <th className="p-2.5 w-12 text-center">Sr.</th>
              <th className="p-2.5 min-w-[160px]">Payment Terms / Stage Wise</th>
              <th className="p-2.5 text-right">Amount ({currSymbol})</th>
              <th className="p-2.5 text-right">%</th>
              <th className="p-2.5 text-center">Last PI Date</th>
              <th className="p-2.5 text-center">Due Days</th>
              <th className="p-2.5 text-right">Received Amt ({currSymbol})</th>
              <th className="p-2.5 text-right">Recv %</th>
              <th className="p-2.5 text-right">Balance Amt ({currSymbol})</th>
              <th className="p-2.5 text-right">Bal %</th>
              <th className="p-2.5 min-w-[130px]">Remark</th>
              <th className="p-2.5 text-center min-w-[120px]">Document / Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#27272A]' : 'divide-slate-200'}`}>
            {payments.map((pay, idx) => {
              const isEditing = editingId === pay.paymentId;
              const amtUSD = isEditing ? (parseFloat(editForm.amountUSD) || 0) : (pay.amountUSD || 0);
              const paidUSD = isEditing ? (parseFloat(editForm.advancePaidUSD) || 0) : (pay.advancePaidUSD || 0);
              const balUSD = amtUSD - paidUSD;
              
              const stagePct = contractVal > 0 ? ((amtUSD / contractVal) * 100).toFixed(1) : '0.0';
              const recvPct = amtUSD > 0 ? ((paidUSD / amtUSD) * 100).toFixed(1) : '0.0';
              const balPct = amtUSD > 0 ? ((balUSD / amtUSD) * 100).toFixed(1) : '0.0';
              const piDate = pay.lastPiDate || dynamicLastPi;

              return (
                <tr key={pay.paymentId || idx} className={`transition-colors font-medium ${
                  isDark ? 'hover:bg-[#1C1C1F]' : 'hover:bg-slate-50'
                }`}>
                  {/* Col 1: Sr */}
                  <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>

                  {/* Col 2: Payment Terms / Stage Wise */}
                  <td className="p-2.5 font-semibold">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.stageWise}
                        onChange={e => setEditForm({ ...editForm, stageWise: e.target.value })}
                        className={`w-full p-1 border rounded text-xs outline-none ${
                          isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-300'
                        }`}
                      />
                    ) : (
                      <span className={isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}>
                        {pay.stageWise || pay.description || `Stage ${idx + 1}`}
                      </span>
                    )}
                  </td>

                  {/* Col 3: Amount */}
                  <td className="p-2.5 text-right font-bold font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.amountUSD}
                        onChange={e => setEditForm({ ...editForm, amountUSD: e.target.value })}
                        className={`w-24 p-1 text-right border rounded text-xs outline-none ${
                          isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-300'
                        }`}
                      />
                    ) : (
                      <span className={isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}>
                        {currSymbol}{(amtUSD * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </td>

                  {/* Col 4: % */}
                  <td className="p-2.5 text-right font-mono text-slate-400">{stagePct}%</td>

                  {/* Col 5: Last PI Date */}
                  <td className="p-2.5 text-center font-mono">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-amber-900/30 text-amber-300 border border-amber-800/40">
                      {piDate}
                    </span>
                  </td>

                  {/* Col 6: Due Days */}
                  <td className="p-2.5 text-center font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.dueDays}
                        onChange={e => setEditForm({ ...editForm, dueDays: e.target.value })}
                        className={`w-14 p-1 text-center border rounded text-xs outline-none ${
                          isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-300'
                        }`}
                      />
                    ) : (
                      <span className={isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}>
                        {pay.dueDays ?? project?.dueDays ?? 30} Days
                      </span>
                    )}
                  </td>

                  {/* Col 7: Received Amount */}
                  <td className="p-2.5 text-right font-bold font-mono text-emerald-400">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.advancePaidUSD}
                        onChange={e => setEditForm({ ...editForm, advancePaidUSD: e.target.value })}
                        className={`w-24 p-1 text-right border rounded text-xs outline-none ${
                          isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-300'
                        }`}
                      />
                    ) : (
                      <span>{currSymbol}{(paidUSD * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    )}
                  </td>

                  {/* Col 8: Received % */}
                  <td className="p-2.5 text-right font-mono text-emerald-500 font-bold">{recvPct}%</td>

                  {/* Col 9: Balance Amount */}
                  <td className="p-2.5 text-right font-bold font-mono text-amber-400">
                    {currSymbol}{(balUSD * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>

                  {/* Col 10: Balance % */}
                  <td className="p-2.5 text-right font-mono text-amber-500 font-bold">{balPct}%</td>

                  {/* Col 11: Remark */}
                  <td className="p-2.5 text-slate-400">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.remark}
                        onChange={e => setEditForm({ ...editForm, remark: e.target.value })}
                        className={`w-full p-1 border rounded text-xs outline-none ${
                          isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-300'
                        }`}
                      />
                    ) : (
                      <span>{pay.remark || '—'}</span>
                    )}
                  </td>

                  {/* Col 12: Documents Upload & Actions */}
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Document Attachment */}
                      {pay.documentUrl ? (
                        <a
                          href={pay.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={pay.documentName || 'Download Document'}
                          className="p-1 rounded bg-sky-900/40 text-sky-300 hover:bg-sky-800/60 border border-sky-700/50"
                        >
                          <Paperclip size={13} />
                        </a>
                      ) : (
                        <label className="p-1 rounded bg-slate-800/50 text-slate-400 hover:bg-slate-700/60 cursor-pointer border border-slate-700/50">
                          <Upload size={13} />
                          <input
                            type="file"
                            className="hidden"
                            onChange={e => handleFileUpload(pay.paymentId, e)}
                          />
                        </label>
                      )}

                      {/* Edit / Save Action */}
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(pay.paymentId)}
                          className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-600 cursor-pointer"
                        >
                          <Save size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(pay)}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDelete(pay.paymentId)}
                        className="p-1 rounded bg-red-950/60 text-red-400 hover:bg-red-900/80 border border-red-900/40 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Summary Row */}
          <tfoot>
            <tr className={`font-bold font-mono border-t-2 text-xs ${
              isDark ? 'bg-[#141416] text-[#FFFFFF] border-[#303035]' : 'bg-slate-100 text-slate-900 border-slate-300'
            }`}>
              <td colSpan={2} className="p-2.5 text-center uppercase tracking-wider text-[11px]">
                Total Milestone Summary
              </td>
              <td className="p-2.5 text-right font-bold text-sky-400">
                {currSymbol}{(totalScheduledUSD * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
              <td className="p-2.5 text-right text-slate-400">100.0%</td>
              <td colSpan={2} className="p-2.5 text-center text-slate-400">—</td>
              <td className="p-2.5 text-right font-bold text-emerald-400">
                {currSymbol}{(totalReceivedUSD * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
              <td className="p-2.5 text-right text-emerald-400">{overallReceivedPct.toFixed(1)}%</td>
              <td className="p-2.5 text-right font-bold text-amber-400">
                {currSymbol}{(totalBalanceUSD * mult).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
              <td className="p-2.5 text-right text-amber-400">{overallBalancePct.toFixed(1)}%</td>
              <td colSpan={2} className="p-2.5 text-center text-slate-400 font-sans text-[11px]">
                Auto-calculated totals
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

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
  const { t } = useLanguage();
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
              <h3 className="font-extrabold text-base tracking-wide text-white">{t('projectReportPreview')}</h3>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
              {t('confidentialSummary')} • Ref: <span className={`font-mono ${isDark ? 'text-[#C9A86A]' : 'text-sky-300'}`}>{project.projectId}</span>
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
              <Printer size={14} /> {t('exportToPdf')}
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
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const {
    getProjectById, getDesignForProject, getProductionForProject,
    getShipmentForProject, getPaymentsForProject, getLastApprovedPIDate
  } = useData();

  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<any>(null);

  const project = selectedProjectId ? getProjectById(selectedProjectId) : undefined;
  const dynamicLastPiDate = project ? getLastApprovedPIDate(project.projectId) : null;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#85858B]">
        <AlertTriangle size={32} className="mb-3" />
        <p className="font-medium">Project not found.</p>
        <button onClick={() => navigate('projects')} className="mt-4 btn-primary">
          {t('backToProjectsList')}
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
  const progressPercent = project.designProgressPercent != null ? Math.min(Math.round(project.designProgressPercent), 100) : null;

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
              <ArrowLeft size={14} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} /> {t('backToFolder')} {selectedFolder}
            </button>
          ) : null}
          <button
            onClick={() => navigate('projects')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isDark ? 'bg-[#18181B] text-[#D5D5D8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft size={14} className={isDark ? 'text-[#85858B]' : 'text-slate-500'} /> {t('backToProjectsList')}
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
            {t('editProject')}
          </button>

          <button
            onClick={() => setIsExportPreviewOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
              isDark ? 'bg-[#2A2419] text-[#E8D6AE] border-[#55462C] hover:bg-[#342C1F]' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <FileText size={15} />
            {t('export')}
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
          {progressPercent != null ? (
            <div className="text-right">
              <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${needsAttention ? 'text-red-500' : (isDark ? 'text-[#85858B]' : 'text-slate-400')}`}>Design Progress</p>
              <p className={`text-4xl font-extrabold ${needsAttention ? (isDark ? 'text-[#F08A8A]' : 'text-red-600') : (isDark ? 'text-[#FFFFFF]' : 'text-slate-900')}`}>{progressPercent}%</p>
              <div className="mt-2 w-32">
                <ProgressBar value={progressPercent} color={needsAttention ? 'orange' : 'forest'} size="lg" />
              </div>
            </div>
          ) : (
            <div className="text-right">
              <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-400'}`}>Design Progress</p>
              <p className={`text-xs font-semibold ${isDark ? 'text-[#65656B]' : 'text-slate-400'}`}>Progress not available</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1">
          <SectionCard title={t('projectJourney')} label={t('lifecycle')}>
            <ProjectJourney stages={stages} />
          </SectionCard>
        </div>

        <div className="xl:col-span-2 space-y-5">

          {/* Project Information */}
          <SectionCard title={t('projectInformation')} label={t('coreDetails')}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-5">
              <FieldRow label="Project ID" value={project.projectId} />
              <FieldRow label="Vendor Company Name" value={project.vendorCompany || (['TOTAL ENVIROMENT', 'BREN', 'TRIFECTA', 'KANWARJI  CONSTRUCTION'].includes(project.customer) ? 'KKV' : 'KKI')} />
              <FieldRow label="Description of Material" value={project.materialDescription || 'Aluform'} />
              <FieldRow label="Client Name" value={project.customer} />
              <FieldRow label="Project Name" value={project.project} />
              <FieldRow label="PO Number" value={project.poNumber} />
              <FieldRow label="PO Date" value={project.poDate} />
              <FieldRow label="Bill To Address" value={project.billToAddress} />
              <FieldRow label="Bill To PIN Code" value={project.billToPinCode} />
              <FieldRow label="Ship To Address" value={project.shipToAddress} />
              <FieldRow label="Ship To PIN Code" value={project.shipToPinCode} />
              <FieldRow label="Client Contact Name" value={project.clientContactName} />
              <FieldRow label="Client Contact Phone" value={project.clientContactPhone} />
              <FieldRow label="Client Contact Email" value={project.clientContactEmail} />
              <FieldRow label="PO Quantity" value={project.poQty ? `${project.poQty} m²` : null} />
              <FieldRow label="Rate (USD)" value={project.rate ? `$${project.rate}` : (project.pricePerM2USD ? `$${project.pricePerM2USD}` : null)} />
              <FieldRow label="Scope of Technical Support" value={project.scopeOfTechnicalSupport} />
              <FieldRow label="Current Site Status" value={project.currentSiteStatus} />
              <FieldRow label="Site Location / Region" value={project.siteLocationRegion || project.country} />
              <FieldRow label="Unloading Scope" value={project.remark?.toLowerCase().includes('client') ? 'Client Scope' : 'KKI Scope'} />
            </div>
          </SectionCard>

          {/* Project Overview */}
          <SectionCard title={t('projectOverview')} label={t('contractAndQuantities')}>
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

          {/* Schedule & Milestone Dates */}
          <SectionCard title={t('scheduleMilestoneDates')} label={t('milestoneTracking')}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-5">
              <FieldRow label="Shell Plan Confirmation Date" value={project.shellPlanConfirmation} />
              <FieldRow label="Payment Received Date (Shell Plan)" value={project.paymentReceivedShellPlanDate} />
              <FieldRow label="Shell Confirm + 13 Weeks" value={addWeeksToDate(project.shellPlanConfirmation, 13)} />
              <FieldRow label="Payment Received + 13 Weeks" value={addWeeksToDate(project.paymentReceivedShellPlanDate, 13)} />
              <FieldRow label="MD Completion Date (Mfg. Dwg)" value={project.mdCompletion} />
              <FieldRow label="Production Start Date" value={project.productionStart} />
              <FieldRow label="Production Completion Date" value={project.productionComplete} />
              <FieldRow label="Loading Date" value={project.loadingDate} />
              <FieldRow label="ETD Date" value={project.etd} />
              <FieldRow label="ETA Date" value={project.eta} />
              <FieldRow label="ETA Location / Port" value={project.etaLocation || project.country} />
              <FieldRow label="Incoterms" value={project.incoterm} />
              <FieldRow label="Delivery Timeline" value={project.deliveryTimeline} />
              <FieldRow label="Actual Total Weeks" value={project.actualTotalWeeks ? `${project.actualTotalWeeks} Weeks` : null} />
              <FieldRow label="Current Project Status" value={project.currentSiteStatus || project.contractStatus} />
            </div>

            {/* Factory Visit Sub-Block */}
            <div className={`border rounded-xl p-4 text-xs space-y-2 ${
              isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#C9A86A]' : 'text-slate-700'}`}>
                {t('factoryVisitDetails')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                <FieldRow label="Visit Type" value={project.factoryVisitType || 'NA'} />
                <FieldRow label="Total Visit Persons" value={project.factoryVisitPersons} />
                <FieldRow label="Planned Date" value={project.factoryVisitPlannedDate} />
                <FieldRow label="Completed Date" value={project.factoryVisitCompletedDate} />
              </div>
            </div>
          </SectionCard>

          {/* Design Elements & Area Breakdown */}
          <SectionCard title={t('designElementsAreaBreakdown')} label={t('areaSpecifications')}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-5">
              <FieldRow label="Typical Floor Area" value={project.typicalFloorArea ? `${project.typicalFloorArea.toLocaleString()} ${project.typicalFloorAreaUom || 'Sqm'}` : null} />
              <FieldRow label="Basement Floor Area" value={project.basementFloorArea ? `${project.basementFloorArea.toLocaleString()} ${project.basementFloorAreaUom || 'Sqm'}` : null} />
              <FieldRow label="Change Floor Area" value={project.changeFloorArea ? `${project.changeFloorArea.toLocaleString()} ${project.changeFloorAreaUom || 'Sqm'}` : null} />
              <FieldRow label="Plumbing Groove Area" value={project.plumbingGrooveArea ? `${project.plumbingGrooveArea.toLocaleString()} ${project.plumbingGrooveAreaUom || 'Sqm'}` : null} />
              <FieldRow label="Elevation Groove Area" value={project.elevationGrooveArea ? `${project.elevationGrooveArea.toLocaleString()} ${project.elevationGrooveAreaUom || 'Sqm'}` : null} />
              <FieldRow label="Total Payable Area" value={project.totalPayableArea ? `${project.totalPayableArea.toLocaleString()} ${project.totalPayableAreaUom || 'Sqm'}` : (project.actualDesignQtyM2 ? `${project.actualDesignQtyM2.toLocaleString()} Sqm` : null)} />
              <FieldRow label="Area Approved Date" value={project.areaApprovedDate} />
            </div>

            {design.length > 0 && (
              <div className="overflow-x-auto border-t pt-3">
                <table className="w-full text-sm" aria-label="Design schedule table">
                  <thead>
                    <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
                      <th className="text-left py-2.5 px-3">ID</th>
                      <th className="text-left py-2.5 px-3">Element</th>
                      <th className="text-left py-2.5 px-3">Planned</th>
                      <th className="text-left py-2.5 px-3">Actual</th>
                      <th className="text-left py-2.5 px-3">Status</th>
                      <th className="text-right py-2.5 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#262629]' : 'divide-slate-200'}`}>
                    {design.map(d => (
                      <tr key={d.designId} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                        <td className={`py-2.5 px-3 text-xs font-mono font-semibold ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{d.designId}</td>
                        <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{d.element}</td>
                        <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.plannedDate ?? '—'}</td>
                        <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.actualDate ?? '—'}</td>
                        <td className="py-2.5 px-3"><StatusBadge status={d.status} /></td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setEditingDesign(d)}
                            className={`px-2.5 py-1 text-xs rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer transition-colors border ${
                              isDark
                                ? 'bg-[#18181B] text-[#1688D4] border-[#262629] hover:bg-[#202025]'
                                : 'bg-slate-100 text-[#1688D4] border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Production */}
          {productionList.length > 0 && (
            <SectionCard title={t('productionParts')} label={t('productionMonitoring')}>
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

          {/* Shipment Details */}
          <SectionCard title={t('shipmentTrackingLogistics')} label={t('shipmentMonitoring')}>
            {shipment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <FieldRow label="Overall Total Dispatch Qty" value={shipment.dispatchQtyM2 ? `${shipment.dispatchQtyM2.toLocaleString()} m²` : (project.actualDesignQtyM2 ? `${project.actualDesignQtyM2.toLocaleString()} m²` : null)} />
                  <FieldRow label="ETD" value={shipment.etd} />
                  <FieldRow label="ETA" value={shipment.eta} />
                  <FieldRow label="Status" value={shipment.status} />
                  <FieldRow label="Delivery Timeline" value={shipment.deliveryTimeline} />
                  <FieldRow label="Incoterms" value={shipment.incoterm || project.incoterm} />
                </div>

                {/* Material-Wise Quantities */}
                <div className={`border rounded-xl p-4 text-xs space-y-2 ${
                  isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#7DB3FC]' : 'text-sky-800'}`}>
                    Material-Wise Separate Quantities
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    <FieldRow label="BCS Qty" value={shipment.bcsQty ? `${shipment.bcsQty} m²` : '—'} />
                    <FieldRow label="ACS Qty" value={shipment.acsQty ? `${shipment.acsQty} m²` : '—'} />
                    <FieldRow label="KGBH Qty" value={shipment.kgbhQty ? `${shipment.kgbhQty} m²` : '—'} />
                    <FieldRow label="KSBH Qty" value={shipment.ksbhQty ? `${shipment.ksbhQty} m²` : '—'} />
                    <FieldRow label="Aluform Qty" value={shipment.aluformQty ? `${shipment.aluformQty} m²` : '—'} />
                  </div>
                </div>

                {/* Invoice & Container Details */}
                <div className={`border rounded-xl p-4 text-xs space-y-2 ${
                  isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#70D0A8]' : 'text-emerald-800'}`}>
                    Invoice & Container Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                    <FieldRow label="Invoice Number" value={shipment.invoiceNumber || `INV-${project.projectId}`} />
                    <FieldRow label="Invoice Date" value={shipment.invoiceDate || project.poDate} />
                    <FieldRow label="Unit Price" value={shipment.unitPrice ? `$${shipment.unitPrice}` : (project.pricePerM2USD ? `$${project.pricePerM2USD}` : null)} />
                    <FieldRow label="Invoice Amount" value={shipment.invoiceAmount ? `$${shipment.invoiceAmount.toLocaleString()}` : (project.totalAmountUSD ? `$${project.totalAmountUSD.toLocaleString()}` : null)} />
                    <FieldRow label="Container Total" value={shipment.containerTotal || 1} />
                    <FieldRow label="Container Size" value={shipment.containerSize || '40 High Cube'} />
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-3">
                  {['Prepared', 'ETD', 'ETA', 'Delivered'].map((step, i, arr) => {
                    const doneMap: Record<string, boolean> = {
                      'Prepared': true,
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
              </div>
            ) : (
              <div className="space-y-4">
                <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Standard shipment tracking defaults enabled for project {project.projectId}.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FieldRow label="Overall Total Dispatch Qty" value={project.actualDesignQtyM2 ? `${project.actualDesignQtyM2.toLocaleString()} m²` : null} />
                  <FieldRow label="ETD Date" value={project.etd} />
                  <FieldRow label="ETA Date" value={project.eta} />
                  <FieldRow label="ETA Location" value={project.etaLocation || project.country} />
                  <FieldRow label="Incoterms" value={project.incoterm} />
                  <FieldRow label="Delivery Timeline" value={project.deliveryRequest || project.contractDate} />
                </div>
                <div className={`border rounded-xl p-4 text-xs space-y-2 ${
                  isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#70D0A8]' : 'text-emerald-800'}`}>
                    Invoice & Container Overview
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                    <FieldRow label="Invoice Number" value={`INV-${project.projectId}`} />
                    <FieldRow label="Invoice Date" value={project.poDate || project.contractDate} />
                    <FieldRow label="Unit Price" value={project.pricePerM2USD ? `$${project.pricePerM2USD}` : null} />
                    <FieldRow label="Invoice Amount" value={project.totalAmountUSD ? `$${project.totalAmountUSD.toLocaleString()}` : null} />
                    <FieldRow label="Container Total" value={1} />
                    <FieldRow label="Container Size" value="40 High Cube" />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Payment */}
          {(project.totalAmountUSD || payments.length > 0) ? (
            <SectionCard title={t('commercialPayments')} label={t('financialMonitoring')}>
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
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                <FieldRow label="PO Rate" value={project.poRate ? `$${project.poRate}` : (project.pricePerM2USD ? `$${project.pricePerM2USD}` : null)} />
                <FieldRow label="Actual Total Amount" value={project.actualTotalAmount ? `$${project.actualTotalAmount.toLocaleString()}` : null} />
                <FieldRow label="Actual Total Receivable" value={project.actualTotalReceivable ? `$${project.actualTotalReceivable.toLocaleString()}` : null} />
                <FieldRow label="Actual Balance Amount" value={project.actualBalanceAmount ? `$${project.actualBalanceAmount.toLocaleString()}` : null} />
                <FieldRow label="Current Payment Amt" value={project.paymentStatusAmount ? `$${project.paymentStatusAmount.toLocaleString()}` : null} />
                <FieldRow label="Current Payment %" value={project.paymentStatusPercent ? `${project.paymentStatusPercent}%` : null} />
                <FieldRow label="Last PI Raised Date" value={dynamicLastPiDate ? `${dynamicLastPiDate} (Approved PI)` : (project.lastPiRaisedDate || '—')} />
                <FieldRow label="Due Days" value={project.dueDays} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <FieldRow label="Payment Terms" value={project.paymentTerm} />
                <FieldRow label="PO Payment Terms" value={project.poPaymentTerm} />
              </div>

              <div className={`border rounded-xl p-4 text-xs space-y-2 mt-5 ${
                isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#C9A86A]' : 'text-amber-800'}`}>
                  Bank Guarantee (BG) & Letter of Credit (LC)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <FieldRow label="BG Amount" value={project.bgAmount ? `$${project.bgAmount.toLocaleString()}` : null} />
                  <FieldRow label="BG %" value={project.bgPercent ? `${project.bgPercent}%` : null} />
                  <FieldRow label="BG Open Date" value={project.bgOpenDate} />
                  <FieldRow label="BG Expiry Date" value={project.bgExpiryDate} />
                  
                  <FieldRow label="LC Amount" value={project.lcAmount ? `$${project.lcAmount.toLocaleString()}` : null} />
                  <FieldRow label="LC %" value={project.lcPercent ? `${project.lcPercent}%` : null} />
                  <FieldRow label="LC Open Date" value={project.lcOpenDate} />
                  <FieldRow label="LC Expiry Date" value={project.lcExpiryDate} />
                </div>
              </div>
              
              <PaymentMatrixTable projectId={project.projectId} totalContractUSD={project.totalAmountUSD || 0} />
            </SectionCard>
          ) : (
            <SectionCard title={t('commercialPayments')} label={t('financialMonitoring')}>
              <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>No payment data available for this project.</p>
              <PaymentMatrixTable projectId={project.projectId} totalContractUSD={project.totalAmountUSD || 0} />
            </SectionCard>
          )}

          {/* PO Terms & Special Compliance */}
          <SectionCard title={t('poComplianceSpecialTerms')} label="Force Majeure, Packing & POD">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-4">
              <FieldRow label="Force Majeure App" value={project.forceMajeureApplies || 'NA'} />
              <FieldRow label="Force Majeure Reason" value={project.forceMajeureReason} />
              <FieldRow label="Force Majeure Remarks" value={project.forceMajeureRemarks} />
              <FieldRow label="Packing Status" value={project.packingStatus} />
              <FieldRow label="Packing Date" value={project.packingDate} />
              <FieldRow label="Packing Responsibility" value={project.packingResponsibility} />
              <FieldRow label="Invoice Verification" value={project.invoiceVerificationStatus || 'Verified'} />
              <FieldRow label="Invoice Ref No." value={project.invoiceReference || `INV-${project.projectId}`} />
              <FieldRow label="POD Reference" value={project.podReference} />
            </div>
            {project.transitDamageInfo && (
              <p className={`text-xs italic border-t pt-2 ${isDark ? 'text-[#85858B] border-[#262629]' : 'text-slate-600 border-slate-200'}`}>
                Transit & Damage Note: {project.transitDamageInfo}
              </p>
            )}
          </SectionCard>

          {/* Logistics, RTO & Vehicle Inspection */}
          <SectionCard title={t('logisticsRtoCompliance')} label={t('transportSafetyRules')}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <FieldRow label="Vehicle Number" value={project.vehicleNumber} />
              <FieldRow label="Transporter" value={project.transporterDetails} />
              <FieldRow label="Driver Name" value={project.driverDetails} />
              <FieldRow label="Driver Contact" value={project.driverContact} />
              <FieldRow label="Speed Limit Compliance" value={project.speedLimitCompliance || 'Compliant (Below Limit)'} />
              <FieldRow label="Parking Bay" value={project.designatedParkingLocation} />
              <FieldRow label="Unattended Rule" value={project.unattendedVehicleRestrictionStatus || 'Restricted'} />
              <FieldRow label="Inspection Status" value={project.overallVehicleInspectionStatus || 'Pass (7-Point Inspection)'} />
            </div>

            {/* RTO Documents Summary */}
            <div className={`border rounded-xl p-3 text-xs space-y-2 mb-3 ${
              isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#70D0A8]' : 'text-emerald-800'}`}>
                RTO Documents Checklist Summary (8.5)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <FieldRow label="PUC" value={project.rtoPucStatus || 'Valid'} />
                <FieldRow label="Fitness Cert" value={project.rtoFitnessStatus || 'Valid'} />
                <FieldRow label="Insurance" value={project.rtoInsuranceStatus || 'Valid'} />
                <FieldRow label="RC Book" value={project.rtoRcBookStatus || 'Valid'} />
                <FieldRow label="Driver License" value={project.rtoDriverLicenseStatus || 'Valid'} />
              </div>
            </div>

            {/* 7-Point Safety Inspection Summary */}
            <div className={`border rounded-xl p-3 text-xs space-y-2 ${
              isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#C9A86A]' : 'text-amber-800'}`}>
                7-Point Vehicle Safety Checklist (8.8)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div><span className="text-[#85858B]">Lights:</span> {project.vInspLights || 'Pass'}</div>
                <div><span className="text-[#85858B]">Horn:</span> {project.vInspHorn || 'Pass'}</div>
                <div><span className="text-[#85858B]">Wiper:</span> {project.vInspWiper || 'Pass'}</div>
                <div><span className="text-[#85858B]">Brakes:</span> {project.vInspBrakes || 'Pass'}</div>
                <div><span className="text-[#85858B]">Indicators:</span> {project.vInspIndicators || 'Pass'}</div>
                <div><span className="text-[#85858B]">Condition:</span> {project.vInspGeneralCondition || 'Pass'}</div>
                <div><span className="text-[#85858B]">Guard:</span> {project.vInspSafetyProtection || 'Pass'}</div>
              </div>
            </div>
          </SectionCard>

          {/* HSE & Safety Tracking */}
          <SectionCard title={t('hseSafetyMonitoring')} label={t('incidentAccidentLogs')}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FieldRow label="HSE Violation Status" value={project.hseViolationStatus || 'No Incident / No Violation'} />
              <FieldRow label="Accident Record" value={project.accidentStatus || 'No Accident Reported'} />
              <FieldRow label="Incident Date" value={project.hseIncidentDate} />
              <FieldRow label="Description" value={project.hseDescription} />
              <FieldRow label="CAPA Action" value={project.hseCorrectiveAction} />
              <FieldRow label="Closure Status" value={project.hseClosureStatus || 'NA'} />
            </div>
          </SectionCard>

          {/* Statutory Tax & GST Compliance */}
          <SectionCard title={t('statutoryTaxGst')} label={t('tdsGstReturns')}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <FieldRow label="TDS Applicability" value={project.tdsApplicability || 'Applicable'} />
              <FieldRow label="TDS Rate" value={project.tdsPercentage ? `${project.tdsPercentage}%` : null} />
              <FieldRow label="TDS Amount" value={project.tdsAmount ? `$${project.tdsAmount}` : null} />
              <FieldRow label="TDS Status" value={project.tdsStatus || 'Deposited'} />
              <FieldRow label="GST Compliance" value={project.gstComplianceStatus || 'Compliant'} />
              <FieldRow label="GSTIN Ref" value={project.gstRegistrationDetails || 'Verified'} />
              <FieldRow label="GST Rate" value={project.gstRate ? `${project.gstRate}%` : null} />
              <FieldRow label="GST Amount" value={project.gstAmount ? `$${project.gstAmount}` : null} />
            </div>

            <div className={`border rounded-xl p-3 text-xs space-y-2 ${
              isDark ? 'bg-[#18181B] border-[#27272A]' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#89C9DF]' : 'text-sky-800'}`}>
                Statutory Tax Returns (GSTR-1 & GSTR-3B)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <FieldRow label="GSTR-1 Status" value={project.gstr1Status || 'Filed'} />
                <FieldRow label="GSTR-1 ARN" value={project.gstr1ArnReference} />
                <FieldRow label="GSTR-3B Status" value={project.gstr3bStatus || 'Filed & Tax Paid'} />
                <FieldRow label="GSTR-3B ARN" value={project.gstr3bArnReference} />
              </div>
            </div>
          </SectionCard>

          {/* Phase 2: Project Documents & File Management */}
          <ProjectDocumentsSection projectId={project.projectId} />

          {/* Phase 3: Design Elements Breakdown */}
          <DesignAreaSection projectId={project.projectId} />

          {/* Phase 3: Site Execution, Photos & Progress */}
          <SiteExecutionSection projectId={project.projectId} />

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

      {/* Quick Edit Design Modal */}
      {editingDesign && (
        <QuickEditDesignModal
          designItem={editingDesign}
          onClose={() => setEditingDesign(null)}
        />
      )}
    </motion.div>
  );
}
