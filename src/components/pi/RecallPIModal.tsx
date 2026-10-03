import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Undo2, AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { ProformaInvoiceRecord } from '../../types/proformaInvoice';

interface RecallPIModalProps {
  pi: ProformaInvoiceRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecallPIModal({ pi, onClose, onSuccess }: RecallPIModalProps) {
  const { recallPIRequest } = useData();
  const { t } = useLanguage();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [recallReason, setRecallReason] = useState('');
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!recallReason.trim()) {
      setErrorMsg(t('recallReasonRequired'));
      return;
    }

    const res = recallPIRequest(pi.id, 'Project Manager', recallReason.trim(), comment.trim());
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to recall request');
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
            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
              <Undo2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">{t('recallRequest')} — {pi.piNumber}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('currentStage')}: {pi.currentStage} ({pi.status})
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

          <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
            isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              Recalling this request removes it from active reviewer queues and marks it as RECALLED. You may subsequently edit or resubmit it.
            </span>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 text-amber-400`}>
              {t('recallReason')} *
            </label>
            <input
              type="text"
              required
              value={recallReason}
              onChange={(e) => setRecallReason(e.target.value)}
              placeholder="e.g., Client requested commercial hold before MD review"
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                isDark
                  ? 'bg-[#1C1C1F] border-[#303035] focus:border-amber-500 text-white placeholder-slate-600'
                  : 'bg-white border-slate-300 focus:border-amber-600 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('optionalComment')}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Additional internal recall notes..."
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
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all cursor-pointer"
            >
              {t('confirmRecall')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
