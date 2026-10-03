import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, PauseCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { ProformaInvoiceRecord, PIApprovalAction } from '../../types/proformaInvoice';
import { validateSecureActionToken } from '../../utils/proformaInvoiceUtils';

interface ReviewActionModalProps {
  pi: ProformaInvoiceRecord;
  defaultAction?: PIApprovalAction;
  token?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewActionModal({ pi, defaultAction = 'APPROVE', token, onClose, onSuccess }: ReviewActionModalProps) {
  const { processPIApprovalAction, stakeholderEmails } = useData();
  const { t } = useLanguage();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [action, setAction] = useState<PIApprovalAction>(defaultAction);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tokenValidation = token ? validateSecureActionToken(token, pi) : null;

  useEffect(() => {
    if (tokenValidation && !tokenValidation.valid) {
      setErrorMsg(tokenValidation.reason || 'Invalid or expired action token');
    }
  }, [tokenValidation]);

  // Reviewer role and email based on current stage
  const currentStageName = pi.currentStage === 'PM_REVIEW'
    ? t('projectManager')
    : pi.currentStage === 'SALES_DIRECTOR_REVIEW'
    ? t('salesDirector')
    : t('managingDirector');

  const currentReviewerEmail = pi.currentStage === 'PM_REVIEW'
    ? stakeholderEmails.pmEmail
    : pi.currentStage === 'SALES_DIRECTOR_REVIEW'
    ? stakeholderEmails.salesDirectorEmail
    : stakeholderEmails.managingDirectorEmail;

  const [reviewerName, setReviewerName] = useState(
    pi.currentStage === 'PM_REVIEW'
      ? 'PM Reviewer'
      : pi.currentStage === 'SALES_DIRECTOR_REVIEW'
      ? 'Sales Director'
      : 'Managing Director'
  );

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if ((action === 'REJECT' || action === 'PUT_ON_HOLD') && !reason.trim()) {
      setErrorMsg(t('reasonRequired'));
      return;
    }

    const res = processPIApprovalAction(
      pi.id,
      action,
      reviewerName.trim(),
      currentStageName,
      comment.trim(),
      reason.trim()
    );

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to process approval action');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#141416] border-[#2E2E32] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#26262A] bg-[#18181B]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${
              action === 'APPROVE'
                ? 'bg-emerald-500/20 text-emerald-400'
                : action === 'REJECT'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {action === 'APPROVE' && <CheckCircle size={18} />}
              {action === 'REJECT' && <XCircle size={18} />}
              {action === 'PUT_ON_HOLD' && <PauseCircle size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {action === 'APPROVE' ? t('approve') : action === 'REJECT' ? t('reject') : t('putOnHold')} — {pi.piNumber}
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('currentStage')}: <strong className="text-indigo-400">{currentStageName}</strong> (v{pi.currentVersion})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {token && tokenValidation?.valid && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>Direct Email Action: Verified Cryptographic Token Authenticated</span>
            </div>
          )}

          {/* Action selection tabs */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Select Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setAction('APPROVE'); setErrorMsg(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  action === 'APPROVE'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : isDark
                    ? 'bg-[#1C1C1F] border-[#303035] text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckCircle size={14} />
                <span>{t('approve')}</span>
              </button>

              <button
                type="button"
                onClick={() => { setAction('REJECT'); setErrorMsg(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  action === 'REJECT'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                    : isDark
                    ? 'bg-[#1C1C1F] border-[#303035] text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <XCircle size={14} />
                <span>{t('reject')}</span>
              </button>

              <button
                type="button"
                onClick={() => { setAction('PUT_ON_HOLD'); setErrorMsg(null); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  action === 'PUT_ON_HOLD'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : isDark
                    ? 'bg-[#1C1C1F] border-[#303035] text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <PauseCircle size={14} />
                <span>{t('putOnHold')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('assignedReviewer')}
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-hidden ${
                  isDark ? 'bg-[#1C1C1F] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Reviewer Email
              </label>
              <input
                type="text"
                readOnly
                value={currentReviewerEmail || 'Email Not Configured'}
                className={`w-full px-3 py-2 rounded-lg text-xs border bg-opacity-50 cursor-not-allowed ${
                  isDark ? 'bg-[#18181B] border-[#2E2E32] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              />
            </div>
          </div>

          {(action === 'REJECT' || action === 'PUT_ON_HOLD') && (
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 text-rose-400`}>
                {action === 'REJECT' ? t('rejectionReason') : t('holdReason')} *
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={action === 'REJECT' ? 'e.g., Pricing mismatch with signed shell plan' : 'e.g., Awaiting updated advance wire advice from client'}
                className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                  isDark
                    ? 'bg-[#1C1C1F] border-rose-900/60 focus:border-rose-500 text-white placeholder-slate-600'
                    : 'bg-white border-rose-300 focus:border-rose-600 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          )}

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('approvalComment')} {action === 'APPROVE' && <span className="text-[11px] font-normal text-slate-400">({t('optionalComment')})</span>}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter remarks or approval notes..."
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                isDark
                  ? 'bg-[#1C1C1F] border-[#303035] focus:border-indigo-500 text-white placeholder-slate-600'
                  : 'bg-white border-slate-300 focus:border-indigo-600 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/20">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isDark ? 'bg-[#222226] text-slate-300 hover:bg-[#2C2C32]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition-all cursor-pointer ${
                action === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : action === 'REJECT'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {t('confirmAction')} ({action === 'APPROVE' ? t('approve') : action === 'REJECT' ? t('reject') : t('putOnHold')})
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
