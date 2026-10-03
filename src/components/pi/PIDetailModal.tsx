import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, FileText, Download, Printer, CheckCircle2, 
  XCircle, PauseCircle, Clock, Undo2, Mail, RefreshCw,
  ShieldCheck, History 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import type { ProformaInvoiceRecord } from '../../types/proformaInvoice';
import { exportPIExcel, exportPIPDF } from '../../utils/proformaInvoiceUtils';

interface PIDetailModalProps {
  pi: ProformaInvoiceRecord;
  onClose: () => void;
}

export function PIDetailModal({ pi: initialPi, onClose }: PIDetailModalProps) {
  const { t } = useLanguage();
  const { theme } = useApp();
  const { proformaInvoices, retryPIApprovalEmail } = useData();
  const isDark = theme === 'dark';

  // Keep pi updated if retry or state updates
  const pi = proformaInvoices.find(p => p.id === initialPi.id) || initialPi;

  const [activeTab, setActiveTab] = useState<'document' | 'approvalChain' | 'versionHistory'>('document');
  const [isRetrying, setIsRetrying] = useState(false);

  const latestDelivery = (pi.emailDeliveryLogs && pi.emailDeliveryLogs.length > 0)
    ? pi.emailDeliveryLogs[pi.emailDeliveryLogs.length - 1]
    : null;

  const handleRetryEmail = async () => {
    setIsRetrying(true);
    try {
      await retryPIApprovalEmail(pi.id);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 size={12} /> {t('approved')}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
            <XCircle size={12} /> {t('rejected')}
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
            <PauseCircle size={12} /> {t('onHold')}
          </span>
        );
      case 'RECALLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1">
            <Undo2 size={12} /> {t('recalled')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center gap-1">
            <Clock size={12} /> {status}
          </span>
        );
    }
  };

  const getDeliveryBadge = () => {
    if (!latestDelivery) return null;
    if (latestDelivery.status === 'SENT') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <Mail size={11} /> {t('deliverySent')}
        </span>
      );
    }
    if (latestDelivery.status === 'FAILED') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <XCircle size={11} /> {t('deliveryFailed')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
        <Mail size={11} /> {t('deliverySimulated')}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#121214] border-[#2A2A2E] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header Controls */}
        <div className={`flex flex-wrap items-center justify-between px-6 py-4 border-b gap-3 ${
          isDark ? 'border-[#222226] bg-[#161618]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{pi.piNumber}</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  v{pi.currentVersion}
                </span>
                {getStatusBadge(pi.status)}
                {getDeliveryBadge()}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {pi.projectName} ({pi.projectId}) • {t('created')}: {pi.createdAt.split(',')[0]} by {pi.createdBy}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pi.status.startsWith('PENDING_') && (
              <button
                onClick={handleRetryEmail}
                disabled={isRetrying}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Retry external email dispatch for this approval stage"
              >
                <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
                <span>{isRetrying ? t('retryingEmail') : t('retryEmail')}</span>
              </button>
            )}
            <button
              onClick={() => exportPIExcel(pi)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Export formatted Excel sheet"
            >
              <Download size={14} />
              <span>{t('exportPIExcelFile')}</span>
            </button>
            <button
              onClick={() => exportPIPDF(pi)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Print or save as PDF"
            >
              <Printer size={14} />
              <span>{t('exportPDF')}</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'hover:bg-[#2A2A2E] text-slate-400' : 'hover:bg-slate-200 text-slate-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center px-6 border-b text-xs font-semibold ${
          isDark ? 'border-[#222226] bg-[#141416]' : 'border-slate-200 bg-white'
        }`}>
          <button
            onClick={() => setActiveTab('document')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'document'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>{t('proformaInvoice')}</span>
          </button>
          <button
            onClick={() => setActiveTab('approvalChain')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'approvalChain'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={14} />
            <span>{t('approvalChain')}</span>
          </button>
          <button
            onClick={() => setActiveTab('versionHistory')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'versionHistory'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={14} />
            <span>{t('versionHistory')} ({pi.versions.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'document' && (
            <div className={`p-6 rounded-xl border space-y-6 ${
              isDark ? 'bg-[#161619] border-[#26262A]' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Kumgang Kind Corporate Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-700/30 gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-indigo-400">KUMKANG KIND CO., LTD.</h2>
                  <p className="text-xs text-slate-400">Aluminum Formwork & Engineering Solutions</p>
                  <p className="text-xs text-slate-400">Head Office: Seoul, South Korea</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">PROFORMA INVOICE</span>
                  <span className="text-base font-bold text-white">{pi.piNumber}</span>
                  <span className="text-xs text-slate-400 block">Date: {pi.documentDate || pi.createdAt.split(',')[0]}</span>
                </div>
              </div>

              {/* Client & Project Commercial Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-[#1C1C20] border-[#303036]' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">Billed To (Client):</h4>
                  <p className="font-bold text-sm text-white">{pi.clientName}</p>
                  <p className="text-slate-300">Project: {pi.projectName} ({pi.projectId})</p>
                  <p className="text-slate-400">Vendor Entity: Kumgang Kind ({pi.vendorCompany})</p>
                </div>
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-[#1C1C20] border-[#303036]' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">Commercial Overview:</h4>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Scope:</span>
                      <span className="font-semibold text-white">{pi.lineItems[0]?.scopeCategory || 'Aluform Supply'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Contract Area:</span>
                      <span className="font-semibold text-white">{(pi.lineItems[0]?.quantity || 0).toLocaleString()} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supply Price:</span>
                      <span className="font-semibold text-white">${pi.lineItems[0]?.unitPriceUSD || 0}/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Terms:</span>
                      <span className="font-semibold text-white">{pi.paymentTerm || '30% Advance, 70% against BL/LC'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Invoice Line Items:</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-700/40">
                  <table className="w-full text-xs text-left">
                    <thead className={`uppercase text-[11px] font-bold ${
                      isDark ? 'bg-[#202024] text-slate-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">{t('itemDescription')}</th>
                        <th className="py-2.5 px-3 text-right">{t('quantity')}</th>
                        <th className="py-2.5 px-3 text-center">{t('unit')}</th>
                        <th className="py-2.5 px-3 text-right">{t('unitPrice')}</th>
                        <th className="py-2.5 px-3 text-right">{t('amount')}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#2A2A2E]' : 'divide-slate-200'}`}>
                      {pi.lineItems.map((item, idx) => (
                        <tr key={item.id} className={isDark ? 'hover:bg-[#1E1E22]' : 'hover:bg-slate-100'}>
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-white">{item.itemDescription}</td>
                          <td className="py-2 px-3 text-right font-mono">{item.quantity.toLocaleString()}</td>
                          <td className="py-2 px-3 text-center text-slate-400">{item.unit}</td>
                          <td className="py-2 px-3 text-right font-mono">${item.unitPriceUSD.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400 font-mono">
                            ${item.amountUSD.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end">
                <div className={`w-72 p-4 rounded-xl border space-y-2 text-xs ${
                  isDark ? 'bg-[#1C1C20] border-[#303036]' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex justify-between text-slate-300">
                    <span>{t('subtotal')}:</span>
                    <span className="font-mono font-semibold text-white">${pi.subtotalUSD.toLocaleString()}</span>
                  </div>
                  {pi.taxRatePercent ? (
                    <div className="flex justify-between text-slate-300">
                      <span>{t('taxRate')} ({pi.taxRatePercent}%):</span>
                      <span className="font-mono text-white">${(pi.taxAmountUSD || 0).toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-700/50 text-emerald-400">
                    <span>{t('totalAmount')}:</span>
                    <span className="font-mono">${pi.totalAmountUSD.toLocaleString()} {pi.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvalChain' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h4 className="font-bold text-sm text-indigo-400">{t('approvalChain')} (Sequential 3-Stage Workflow)</h4>
                <span className="text-xs text-slate-400">Current Stage: <strong>{pi.currentStage}</strong></span>
              </div>

              <div className="space-y-3">
                {pi.approvalHistory.length === 0 ? (
                  <div className={`p-8 text-center rounded-xl border ${
                    isDark ? 'border-[#26262A] text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <p className="text-xs">No approval steps executed yet. Proforma Invoice is in DRAFT status.</p>
                  </div>
                ) : (
                  pi.approvalHistory.map((step, idx) => {
                    return (
                      <div
                        key={step.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          step.status === 'APPROVED'
                            ? isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
                            : step.status === 'REJECTED'
                            ? isDark ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50 border-rose-200'
                            : step.status === 'ON_HOLD'
                            ? isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'
                            : step.status === 'PENDING'
                            ? isDark ? 'bg-indigo-950/20 border-indigo-800/40' : 'bg-indigo-50 border-indigo-200'
                            : isDark ? 'bg-[#18181B] border-[#2A2A2E] opacity-60' : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{idx + 1}. {step.stageLabel}</span>
                            <span className="text-xs text-slate-400">({step.reviewerEmail || t('emailNotConfigured')})</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                            {step.submittedAt && (
                              <div>Submitted: {new Date(step.submittedAt).toLocaleString()}</div>
                            )}
                            {step.reviewedAt && (
                              <div>Reviewed: {new Date(step.reviewedAt).toLocaleString()} by {step.reviewerName}</div>
                            )}
                            {step.reason && (
                              <div className="text-rose-400 font-semibold">Reason: {step.reason}</div>
                            )}
                            {step.comment && (
                              <div className="italic text-slate-300">Comment: "{step.comment}"</div>
                            )}
                          </div>
                        </div>

                        <div>
                          {getStatusBadge(step.status)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Email Delivery Logs & Transmissions */}
              <div className="pt-4 border-t border-slate-700/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-indigo-400" />
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                      {t('emailDeliveryLogs')}
                    </h5>
                  </div>
                  {latestDelivery && (
                    <span className="text-[11px] text-slate-400">
                      Latest: {new Date(latestDelivery.sentAt).toLocaleTimeString()} ({latestDelivery.recipientRole})
                    </span>
                  )}
                </div>

                {(!pi.emailDeliveryLogs || pi.emailDeliveryLogs.length === 0) ? (
                  <div className={`p-4 text-center rounded-xl border text-xs ${
                    isDark ? 'border-[#26262A] text-slate-500' : 'border-slate-200 text-slate-400'
                  }`}>
                    No external email delivery attempts recorded for this Proforma Invoice.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                    <table className="w-full text-xs text-left">
                      <thead className={`uppercase text-[10px] font-bold ${
                        isDark ? 'bg-[#1C1C20] text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <tr>
                          <th className="py-2.5 px-3">Stage</th>
                          <th className="py-2.5 px-3">Recipient</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Provider ID / Note</th>
                          <th className="py-2.5 px-3">Action Token</th>
                          <th className="py-2.5 px-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-[11px] ${isDark ? 'divide-[#26262A]' : 'divide-slate-200'}`}>
                        {pi.emailDeliveryLogs.map((log) => (
                          <tr key={log.id} className={isDark ? 'hover:bg-[#1E1E22]' : 'hover:bg-slate-50'}>
                            <td className="py-2 px-3 font-semibold text-indigo-400">{log.stage}</td>
                            <td className="py-2 px-3 font-mono text-slate-300">{log.recipientEmail}</td>
                            <td className="py-2 px-3">
                              {log.status === 'SENT' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  SENT
                                </span>
                              )}
                              {log.status === 'DEMO_SIMULATED' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                  SIMULATED
                                </span>
                              )}
                              {log.status === 'FAILED' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  FAILED
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-400 max-w-xs truncate">
                              {log.providerMessageId ? `id: ${log.providerMessageId}` : (log.error || 'Demo fallback mode')}
                            </td>
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-500 max-w-[120px] truncate" title={log.actionToken}>
                              {log.actionToken || '—'}
                            </td>
                            <td className="py-2 px-3 text-slate-400">
                              {new Date(log.sentAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 italic">
                  {t('resendApiKeyNotice')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'versionHistory' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-indigo-400">{t('versionHistory')}</h4>
              {pi.versions.length === 0 ? (
                <div className={`p-8 text-center rounded-xl border ${
                  isDark ? 'border-[#26262A] text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <p className="text-xs">{t('noHistoricalVersions')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pi.versions.map((hist) => (
                    <div
                      key={hist.versionNumber}
                      className={`p-4 rounded-xl border text-xs space-y-1 ${
                        isDark ? 'bg-[#161619] border-[#28282C]' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-400">Version {hist.versionNumber} Snapshot</span>
                        <span className="text-slate-400">{new Date(hist.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300">Modified By: <strong>{hist.createdBy}</strong></p>
                      <p className="text-slate-400">Total at snapshot: ${hist.snapshotData?.totalAmountUSD?.toLocaleString()}</p>
                      <p className="text-slate-400">Status at snapshot: {hist.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex justify-end ${
          isDark ? 'border-[#222226] bg-[#161618]' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'bg-[#222226] text-slate-300 hover:bg-[#2C2C32]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
