import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Edit3, AlertTriangle, History } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { ProformaInvoiceRecord } from '../../types/proformaInvoice';

interface EditPIModalProps {
  pi: ProformaInvoiceRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditPIModal({ pi, onClose, onSuccess }: EditPIModalProps) {
  const { editAndResubmitPI } = useData();
  const { t } = useLanguage();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [changeReason, setChangeReason] = useState('');
  const [supplyPrice, setSupplyPrice] = useState(pi.lineItems[0]?.unitPriceUSD || 0);
  const [taxRate, setTaxRate] = useState(pi.taxRatePercent || 0);
  const [paymentTerms, setPaymentTerms] = useState(pi.paymentTerm || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (pi.status === 'APPROVED') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className={`p-6 rounded-xl border max-w-md w-full text-center space-y-4 ${
          isDark ? 'bg-[#18181C] border-[#2A2A2E] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-bold text-base">{t('editRequestBlocked')}</h3>
          <p className="text-xs text-slate-400">
            {t('approvedHistoricalImmutable')}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      setErrorMsg('Please specify a reason for editing this Proforma Invoice');
      return;
    }

    // Recompute line items based on revised supplyPrice
    const updatedLineItems = pi.lineItems.map(item => {
      const amount = item.quantity * supplyPrice;
      return {
        ...item,
        unitPriceUSD: supplyPrice,
        amountUSD: amount,
      };
    });

    const res = editAndResubmitPI(
      pi.id,
      {
        lineItems: updatedLineItems,
        unitPriceUSD: supplyPrice,
        taxRatePercent: taxRate,
        paymentTerm: paymentTerms,
      },
      'Project Manager',
      changeReason.trim()
    );

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to edit Proforma Invoice');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#141416] border-[#2E2E32] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#26262A] bg-[#18181B]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">{t('editRequest')} — {pi.piNumber}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('currentVersion')}: v{pi.currentVersion} → New Version: <strong className="text-indigo-400">v{pi.currentVersion + 1}</strong>
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
            isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            <History size={16} className="shrink-0 mt-0.5" />
            <span>
              Editing will preserve the current v{pi.currentVersion} snapshot in version history and resubmit v{pi.currentVersion + 1} to Stage 1 ({t('projectManager')}) for a clean approval chain.
            </span>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 text-indigo-400`}>
              {t('changeReason')} *
            </label>
            <input
              type="text"
              required
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g., Scope adjusted per client revision request"
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                isDark
                  ? 'bg-[#1C1C1F] border-[#303035] focus:border-indigo-500 text-white placeholder-slate-600'
                  : 'bg-white border-slate-300 focus:border-indigo-600 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('supplyPricePerM2')} ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={supplyPrice}
                onChange={(e) => setSupplyPrice(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2 rounded-lg text-sm border focus:outline-hidden ${
                  isDark ? 'bg-[#1C1C1F] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('taxRate')} (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className={`w-full px-3.5 py-2 rounded-lg text-sm border focus:outline-hidden ${
                  isDark ? 'bg-[#1C1C1F] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('paymentTerms')}
            </label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-lg text-sm border focus:outline-hidden ${
                isDark ? 'bg-[#1C1C1F] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
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
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
            >
              {t('submitEditNewVersion')} (v{pi.currentVersion + 1})
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
