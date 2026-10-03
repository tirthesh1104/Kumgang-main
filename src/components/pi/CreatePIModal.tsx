import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

interface CreatePIModalProps {
  onClose: () => void;
  onCreated?: (piId: string) => void;
}

export function CreatePIModal({ onClose, onCreated }: CreatePIModalProps) {
  const { projects, createProformaInvoice } = useData();
  const { t } = useLanguage();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.projectId || '');
  const [creatorName, setCreatorName] = useState<string>('Project Manager');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.projectId === selectedProjectId);

  const handleCreate = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setErrorMsg('Please select a project');
      return;
    }

    const res = createProformaInvoice(selectedProjectId, creatorName);
    if (res.success && res.pi) {
      if (onCreated) onCreated(res.pi.id);
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create Proforma Invoice');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`w-full max-w-2xl rounded-xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-[#141416] border-[#2E2E32] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#26262A] bg-[#18181B]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">{t('generatePI')}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('pullFromLiveProjectData')}
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

        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('selectProject')} *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                isDark
                  ? 'bg-[#1C1C1F] border-[#303035] focus:border-indigo-500 text-white'
                  : 'bg-white border-slate-300 focus:border-indigo-600 text-slate-900'
              }`}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectId} — {p.project} ({p.customer || 'NA'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('createdBy')}
            </label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-lg text-sm border focus:outline-hidden transition-all ${
                isDark
                  ? 'bg-[#1C1C1F] border-[#303035] focus:border-indigo-500 text-white'
                  : 'bg-white border-slate-300 focus:border-indigo-600 text-slate-900'
              }`}
            />
          </div>

          {/* Real Live Data Preview */}
          {selectedProject && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#18181C] border-[#2E2E34]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-500/20">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {t('piDataSnapshot')} (Live Data)
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  Currency: USD
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('client')}</span>
                  <span className="font-semibold">{selectedProject.customer || 'NA'}</span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('country')}</span>
                  <span className="font-semibold">{selectedProject.country || 'NA'}</span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('scope')}</span>
                  <span className="font-semibold">{selectedProject.materialDescription || 'Aluform'}</span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('contractQty')} (m²)</span>
                  <span className="font-semibold">{selectedProject.contractQtyM2 ? selectedProject.contractQtyM2.toLocaleString() : 'NA'}</span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('supplyPricePerM2')}</span>
                  <span className="font-semibold">{selectedProject.pricePerM2USD ? `$${selectedProject.pricePerM2USD}` : 'NA'}</span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('totalPOValue')}</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedProject.totalAmountUSD ? `$${selectedProject.totalAmountUSD.toLocaleString()}` : 'NA'}
                  </span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('paymentReceived')}</span>
                  <span className="font-semibold text-indigo-400">
                    {selectedProject.advanceUSD ? `$${selectedProject.advanceUSD.toLocaleString()}` : '$0'}
                  </span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('paymentBalance')}</span>
                  <span className="font-semibold text-amber-400">
                    {selectedProject.balanceUSD ? `$${selectedProject.balanceUSD.toLocaleString()}` : 'NA'}
                  </span>
                </div>
                <div>
                  <span className={`block text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('currentStage')}</span>
                  <span className="font-semibold text-blue-400">{selectedProject.contractStatus || 'NA'}</span>
                </div>
              </div>
            </div>
          )}

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
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>{t('generatePI')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
