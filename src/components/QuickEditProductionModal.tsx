import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useClientAccess } from '../context/ClientAccessContext';
import { useLanguage } from '../context/LanguageContext';
import type { ProductionRecord } from '../data/projectData';
import { validateDateChronology } from '../utils/dataValidation';
import { X, Check, Edit3, AlertTriangle, Info, Plus } from 'lucide-react';

interface QuickEditProductionModalProps {
  prodItem?: ProductionRecord | null;
  projectId?: string;
  onClose: () => void;
}

export function QuickEditProductionModal({ prodItem, projectId, onClose }: QuickEditProductionModalProps) {
  const { theme } = useApp();
  const { updateProductionRecord, addProductionEntry } = useData();
  const { activeSession } = useClientAccess();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const isClient = activeSession.role === 'Client';
  const isNew = !prodItem;

  const targetProjectId = prodItem?.projectId || projectId || '';

  const [part, setPart] = useState(prodItem?.part || '');
  const [orderQtyM2, setOrderQtyM2] = useState<number | string>(prodItem?.orderQtyM2 ?? '');
  const [finishedQtyM2, setFinishedQtyM2] = useState<number | string>(prodItem?.finishedQtyM2 ?? '');
  const [completionPercent, setCompletionPercent] = useState<number | string>(prodItem?.completionPercent ?? 0);
  const [productionDate, setProductionDate] = useState(prodItem?.productionDate || '');
  const [productionStartDate, setProductionStartDate] = useState(prodItem?.productionStartDate || '');
  const [productionCompleteDate, setProductionCompleteDate] = useState(prodItem?.productionCompleteDate || '');
  const [productionStatus, setProductionStatus] = useState(prodItem?.productionStatus || 'In Production');
  const [remarks, setRemarks] = useState(prodItem?.remarks || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFinishedChange = (val: string) => {
    setFinishedQtyM2(val);
    const fin = parseFloat(val);
    const ord = typeof orderQtyM2 === 'number' ? orderQtyM2 : parseFloat(orderQtyM2 as string);
    if (!isNaN(fin) && !isNaN(ord) && ord > 0) {
      const pct = Math.min(100, Math.max(0, Math.round((fin / ord) * 100)));
      setCompletionPercent(pct);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClient) {
      setErrorMsg(t('clientReadOnlyWarning'));
      return;
    }

    if (!part || part.trim() === '') {
      setErrorMsg('Part / Block name is required.');
      return;
    }

    // Chronology validation
    const valResult = validateDateChronology({
      productionStart: productionStartDate,
      productionComplete: productionCompleteDate,
    });

    if (valResult.errors.length > 0) {
      setErrorMsg(valResult.errors.join(' '));
      return;
    }

    setWarnings(valResult.warnings);

    const ordNum = typeof orderQtyM2 === 'number' ? orderQtyM2 : parseFloat(orderQtyM2 as string);
    const finNum = typeof finishedQtyM2 === 'number' ? finishedQtyM2 : parseFloat(finishedQtyM2 as string);
    const pctNum = typeof completionPercent === 'number' ? completionPercent : parseFloat(completionPercent as string);

    if (isNew) {
      const newRecord: ProductionRecord = {
        productionId: `PROD-${Date.now()}`,
        projectId: targetProjectId,
        part: part.trim(),
        orderQtyM2: isNaN(ordNum) ? null : ordNum,
        orderQtyKg: null,
        finishedQtyM2: isNaN(finNum) ? null : finNum,
        finishedQtyKg: null,
        balanceQty: isNaN(ordNum) || isNaN(finNum) ? null : Math.max(0, ordNum - finNum),
        completionPercent: isNaN(pctNum) ? 0 : Math.min(100, Math.max(0, pctNum)),
        productionDate: productionDate || null,
        productionStartDate: productionStartDate || null,
        productionCompleteDate: productionCompleteDate || null,
        productionStatus,
        remarks,
      };

      const res = addProductionEntry(newRecord, activeSession.displayName || 'Project Manager');
      if (res.success) onClose();
      else if (res.errors) setErrorMsg(res.errors.join(', '));
    } else {
      const res = updateProductionRecord(prodItem.productionId, {
        part: part.trim(),
        orderQtyM2: isNaN(ordNum) ? null : ordNum,
        finishedQtyM2: isNaN(finNum) ? null : finNum,
        completionPercent: isNaN(pctNum) ? 0 : Math.min(100, Math.max(0, pctNum)),
        productionDate: productionDate || null,
        productionStartDate: productionStartDate || null,
        productionCompleteDate: productionCompleteDate || null,
        productionStatus,
        remarks,
      }, activeSession.displayName || 'Project Manager');

      if (res.success) onClose();
      else if (res.errors) setErrorMsg(res.errors.join(', '));
    }
  };

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto ${
      isDark ? 'bg-black/80' : 'bg-slate-900/50'
    }`}>
      <div className={`border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'bg-[#090909] border-[#202023]' : 'bg-[#0B2239] text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
            }`}>
              {isNew ? <Plus size={18} /> : <Edit3 size={18} />}
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white uppercase">
                {isNew ? t('recordDailyProduction') : t('quickEditProductionEntry')}
              </h3>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
                Project ID: {targetProjectId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-[#85858B] hover:text-white hover:bg-[#1B1B1F]' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {isClient && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <Info size={16} /> {t('clientReadOnlyWarning')}
            </div>
          )}

          {errorMsg && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              isDark ? 'bg-[#34191B] border-[#5A292B] text-[#F08A8A]' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}

          {warnings.length > 0 && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
              isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <AlertTriangle size={16} /> {warnings.join(' ')}
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              {t('partBlock')}
            </label>
            <input
              type="text"
              disabled={isClient}
              placeholder="e.g. Wall Formwork P1 / Slab Panel Set"
              value={part}
              onChange={e => setPart(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border font-semibold ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                {t('orderQty')} (m²)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isClient}
                placeholder="1000"
                value={orderQtyM2}
                onChange={e => setOrderQtyM2(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                {t('finishedQty')} (m²)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isClient}
                placeholder="750"
                value={finishedQtyM2}
                onChange={e => handleFinishedChange(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                {t('completionPercent')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                disabled={isClient}
                value={completionPercent}
                onChange={e => setCompletionPercent(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-bold ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-[#70D0A8]' : 'bg-white border-slate-300 text-emerald-600'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                {t('productionDate')}
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. 15-06-2025"
                value={productionDate}
                onChange={e => setProductionDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                {t('productionStartDate')}
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. 01-06-2025"
                value={productionStartDate}
                onChange={e => setProductionStartDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-[#85858B]' : 'text-slate-600'
              }`}>
                {t('productionCompleteDate')}
              </label>
              <input
                type="text"
                disabled={isClient}
                placeholder="e.g. 30-06-2025"
                value={productionCompleteDate}
                onChange={e => setProductionCompleteDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white focus:border-[#1688D4]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              {t('productionStatus')}
            </label>
            <select
              disabled={isClient}
              value={productionStatus}
              onChange={e => setProductionStatus(e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Production">In Production</option>
              <option value="Quality Inspection">Quality Inspection</option>
              <option value="Packing Completed">Packing Completed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-[#85858B]' : 'text-slate-600'
            }`}>
              {t('additionalRemarks')}
            </label>
            <textarea
              rows={2}
              disabled={isClient}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Daily factory output details, batch notes, or raw material status..."
              className={`w-full px-3 py-2 text-sm rounded-lg border font-medium ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/10">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                isDark ? 'bg-[#18181B] text-[#85858B] hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isClient}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                isClient
                  ? 'bg-slate-500 opacity-50 cursor-not-allowed text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              <Check size={14} /> {t('saveProductionRecord')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
