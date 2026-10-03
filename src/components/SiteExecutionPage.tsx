import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { SiteExecutionSection } from './phase3/SiteExecutionSection';
import { Building2 } from 'lucide-react';

export function SiteExecutionPage() {
  const { theme } = useApp();
  const { projects } = useData();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length > 0 ? projects[0].projectId : ''
  );

  const selectedProject = projects.find(p => p.projectId === selectedProjectId);

  return (
    <div className={`space-y-6 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div>
        <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('operationsLabel')}</p>
        <h2 className={`text-xl font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{t('siteExecutionTitle')}</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          {t('supervisorAllocationDesc')}
        </p>
      </div>

      {/* Project Selection Dropdown */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Building2 className={isDark ? 'text-cyan-400' : 'text-cyan-600'} size={18} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
            {t('selectActiveProject')}
          </span>
        </div>

        <select
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          className={`px-3 py-2 text-xs font-semibold rounded-lg border outline-none ${
            isDark ? 'bg-[#111113] border-[#303035] text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
          }`}
        >
          {projects.map(p => (
            <option key={p.projectId} value={p.projectId}>
              {p.projectId} — {p.project} ({p.customer})
            </option>
          ))}
        </select>
      </div>

      {selectedProject ? (
        <SiteExecutionSection projectId={selectedProjectId} />
      ) : (
        <div className={`p-8 text-center border rounded-xl ${isDark ? 'bg-[#151517] border-[#262629] text-gray-400' : 'bg-white border-slate-200 text-slate-500'}`}>
          {t('noProjectSelected')}
        </div>
      )}
    </div>
  );
}
