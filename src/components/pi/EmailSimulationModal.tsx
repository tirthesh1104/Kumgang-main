import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, ShieldAlert, CheckCircle2, XCircle, PauseCircle, KeyRound, ExternalLink } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { ProformaInvoiceRecord, PIApprovalAction } from '../../types/proformaInvoice';
import { generateSecureActionToken } from '../../utils/proformaInvoiceUtils';

interface EmailSimulationModalProps {
  pi: ProformaInvoiceRecord;
  onClose: () => void;
  onTriggerAction: (action: PIApprovalAction) => void;
}

export function EmailSimulationModal({ pi, onClose, onTriggerAction }: EmailSimulationModalProps) {
  const { stakeholderEmails } = useData();
  const { t } = useLanguage();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const stage = pi.currentStage;
  const reviewerEmail = stage === 'PM_REVIEW'
    ? stakeholderEmails.pmEmail
    : stage === 'SALES_DIRECTOR_REVIEW'
    ? stakeholderEmails.salesDirectorEmail
    : stakeholderEmails.managingDirectorEmail;

  const stageLabel = stage === 'PM_REVIEW'
    ? t('projectManager')
    : stage === 'SALES_DIRECTOR_REVIEW'
    ? t('salesDirector')
    : t('managingDirector');

  const secureToken = generateSecureActionToken(pi.id, stage, reviewerEmail || 'unconfigured@kumkang.com');

  const handleCopyLink = (action: string) => {
    const simUrl = `https://portal.kumkangkind.com/action?pi=${pi.id}&stage=${stage}&action=${action}&token=${secureToken}`;
    navigator.clipboard?.writeText(simUrl);
    setCopiedLink(action);
    setTimeout(() => setCopiedLink(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#141416] border-[#2E2E32] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#26262A] bg-[#18181B]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                {t('emailSimulationTitle')}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {t('localEmailSimulationMode')}
                </span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('approvalChain')}: {stageLabel} Stage Review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-[#2A2A2E] text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Disclaimer Banner */}
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <div>
            <strong>DEMO / LOCAL SIMULATION MODE:</strong> No external SMTP server is connected. This interactive view demonstrates the exact email dispatched to the stakeholder inbox, complete with cryptographic token verification and one-click action links.
          </div>
        </div>

        {/* Simulated Email Envelope */}
        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
            isDark ? 'bg-[#18181C] border-[#2A2A2E]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">TO:</span>
              <span className="font-bold text-indigo-400">
                {reviewerEmail ? `${stageLabel} <${reviewerEmail}>` : `⚠ ${t('emailNotConfigured')}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">FROM:</span>
              <span className="text-slate-300">Kumgang Kind ERP Notification System &lt;noreply@kumgangkind.com&gt;</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SUBJECT:</span>
              <span className="font-bold text-white">
                [APPROVAL REQUIRED] Proforma Invoice {pi.piNumber} (v{pi.currentVersion}) - {pi.projectName}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
              <span className="text-slate-400 flex items-center gap-1">
                <KeyRound size={12} /> SECURE TOKEN:
              </span>
              <span className="text-[11px] text-emerald-400 truncate max-w-xs">{secureToken}</span>
            </div>
          </div>

          {/* Email Body Content */}
          <div className={`p-5 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#161619] border-[#2A2A2E]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div>
                <h4 className="font-bold text-sm text-indigo-400">Kumgang Kind Commercial Dept.</h4>
                <p className="text-xs text-slate-400">Formal Approval Request Notice</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Stage: {stageLabel}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              Dear {stageLabel},<br />
              A new Proforma Invoice <strong>{pi.piNumber} (v{pi.currentVersion})</strong> has been generated for project <strong>{pi.projectName} ({pi.projectId})</strong> and is awaiting your review and authorization.
            </p>

            <div className={`p-3 rounded-lg border grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs ${
              isDark ? 'bg-[#1C1C20] border-[#303036]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('client')}</span>
                <span className="font-semibold">{pi.clientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('contractQty')}</span>
                <span className="font-semibold">{(pi.lineItems[0]?.quantity || 0).toLocaleString()} m²</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('totalAmount')}</span>
                <span className="font-bold text-emerald-400">${pi.totalAmountUSD.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t('submissionDate')}</span>
                <span className="font-semibold">{pi.createdAt.split(',')[0]}</span>
              </div>
            </div>

            {/* Direct Email Action Links Box */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-indigo-300">
                Direct Email Action Links (Click to Execute Reviewer Action):
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Approve Button */}
                <button
                  onClick={() => {
                    onClose();
                    onTriggerAction('APPROVE');
                  }}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>{t('approveAction')}</span>
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => {
                    onClose();
                    onTriggerAction('REJECT');
                  }}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle size={15} />
                  <span>{t('rejectAction')}</span>
                </button>

                {/* Hold Button */}
                <button
                  onClick={() => {
                    onClose();
                    onTriggerAction('PUT_ON_HOLD');
                  }}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <PauseCircle size={15} />
                  <span>{t('holdAction')}</span>
                </button>
              </div>

              {/* Copy Direct Simulation Link row */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
                <span>Copy Action URL:</span>
                {(['APPROVE', 'REJECT', 'PUT_ON_HOLD'] as const).map(act => (
                  <button
                    key={act}
                    onClick={() => handleCopyLink(act)}
                    className="px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ExternalLink size={10} />
                    {act} {copiedLink === act && '✓'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-700/30">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
