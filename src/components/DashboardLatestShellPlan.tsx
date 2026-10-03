import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { isShellPlanApproved } from '../utils/stageUtils';

export function DashboardLatestShellPlan() {
  const { navigate, theme } = useApp();
  const { projects } = useData();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const approvedProjects = useMemo(() => {
    return projects.filter(p => isShellPlanApproved(p));
  }, [projects]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 transition-all shadow-2xs ${
        isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            <CalendarCheck size={18} />
          </div>
          <div>
            <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
              {t('shellPlanTitle')}
            </h2>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
              {t('shellPlanSubtitle')}
            </p>
          </div>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          isDark ? 'bg-[#14291F] text-[#70D0A8] border-[#204E38]' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {approvedProjects.length} {t('confirmedPlans')}
        </span>
      </div>

      {approvedProjects.length === 0 ? (
        <div className={`p-6 text-center text-xs font-medium rounded-xl border border-dashed ${
          isDark ? 'border-[#303035] text-[#85858B]' : 'border-slate-300 text-slate-500'
        }`}>
          {t('noApprovedShellPlan')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {approvedProjects.slice(0, 6).map(p => (
            <div
              key={p.projectId}
              onClick={() => navigate('project-detail', p.projectId)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#111113] border-[#262629] hover:bg-[#1B1B1F] hover:border-[#38BDF8]/40' 
                  : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-sky-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    isDark ? 'bg-[#18181B] text-[#C9A86A] border-[#303035]' : 'bg-white text-sky-700 border-slate-300'
                  }`}>
                    {p.projectId}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={11} /> {t('approved')}
                  </span>
                </div>

                <h3 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {p.project}
                </h3>
                <p className={`text-xs font-medium truncate ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  {p.customer}
                </p>
              </div>

              <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-[#262629]' : 'border-slate-200'
              }`}>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-[#85858B]' : 'text-slate-400'}`}>
                    {t('shellPlanDate')}
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>
                    {p.shellPlanConfirmation || t('notAvailable')}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-[#85858B]' : 'text-slate-400'}`}>
                    {t('deliveryRequestDate')}
                  </span>
                  <span className={`font-medium text-[11px] truncate max-w-[120px] inline-block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {p.deliveryRequest || t('notAvailable')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
