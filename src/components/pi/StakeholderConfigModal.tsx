import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, ShieldCheck, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

interface StakeholderConfigModalProps {
  onClose: () => void;
}

export function StakeholderConfigModal({ onClose }: StakeholderConfigModalProps) {
  const { stakeholderEmails, updateStakeholderEmails } = useData();
  const { t } = useLanguage();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [pmEmail, setPmEmail] = useState(stakeholderEmails.pmEmail || '');
  const [salesEmail, setSalesEmail] = useState(stakeholderEmails.salesDirectorEmail || '');
  const [mdEmail, setMdEmail] = useState(stakeholderEmails.managingDirectorEmail || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    updateStakeholderEmails({
      pmEmail: pmEmail.trim(),
      salesDirectorEmail: salesEmail.trim(),
      managingDirectorEmail: mdEmail.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
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
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">{t('stakeholderEmailConfig')}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('approvalChain')} (PM → Sales Director → MD)
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
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              1. {t('projectManager')} (Stage 1 Reviewer)
            </label>
            <div className="relative">
              <input
                type="email"
                value={pmEmail}
                onChange={(e) => setPmEmail(e.target.value)}
                placeholder="pm@kumkang.com"
                className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                  isDark
                    ? 'bg-[#1C1C1F] border-[#303035] focus:border-indigo-500 text-white placeholder-slate-600'
                    : 'bg-white border-slate-300 focus:border-indigo-600 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            {!pmEmail && (
              <span className="text-[11px] text-amber-500 font-medium mt-1 inline-block">
                ⚠ {t('emailNotConfigured')}
              </span>
            )}
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              2. {t('salesDirector')} (Stage 2 Reviewer)
            </label>
            <div className="relative">
              <input
                type="email"
                value={salesEmail}
                onChange={(e) => setSalesEmail(e.target.value)}
                placeholder="sales.director@kumkang.com"
                className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                  isDark
                    ? 'bg-[#1C1C1F] border-[#303035] focus:border-indigo-500 text-white placeholder-slate-600'
                    : 'bg-white border-slate-300 focus:border-indigo-600 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            {!salesEmail && (
              <span className="text-[11px] text-amber-500 font-medium mt-1 inline-block">
                ⚠ {t('emailNotConfigured')}
              </span>
            )}
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              3. {t('managingDirector')} (Stage 3 Final Reviewer)
            </label>
            <div className="relative">
              <input
                type="email"
                value={mdEmail}
                onChange={(e) => setMdEmail(e.target.value)}
                placeholder="md@kumkang.com"
                className={`w-full px-3.5 py-2.5 rounded-lg text-sm border focus:outline-hidden transition-all ${
                  isDark
                    ? 'bg-[#1C1C1F] border-[#303035] focus:border-indigo-500 text-white placeholder-slate-600'
                    : 'bg-white border-slate-300 focus:border-indigo-600 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            {!mdEmail && (
              <span className="text-[11px] text-amber-500 font-medium mt-1 inline-block">
                ⚠ {t('emailNotConfigured')}
              </span>
            )}
          </div>

          <div className={`p-3 rounded-lg flex items-start gap-2.5 text-xs ${
            isDark ? 'bg-indigo-950/30 border border-indigo-900/50 text-indigo-300' : 'bg-indigo-50 border border-indigo-200 text-indigo-800'
          }`}>
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <span>
              {t('localEmailSimulationMode')}: In demo mode, email action notifications simulate stakeholder inboxes with secure action links.
            </span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <Check size={16} />
              <span>{t('stakeholderEmailConfig')} updated successfully!</span>
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
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
