import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { useLanguage } from '../../context/LanguageContext';
import type { WeeklyProgressRecord } from '../../types/phase3';
import { SitePhotosSection } from './SitePhotosSection';
import { UserCheck, Activity, Plus, Save } from 'lucide-react';

interface SiteExecutionSectionProps {
  projectId: string;
}

export function SiteExecutionSection({ projectId }: SiteExecutionSectionProps) {
  const { theme } = useApp();
  const { activeSession } = useClientAccess();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const {
    getProjectById,
    getWeeklyProgressForProject,
    addWeeklyProgress,
    getSiteExecutionInfoForProject,
    updateSiteExecutionInfo,
  } = useData();

  const project = getProjectById(projectId);
  const weeklyRecords = getWeeklyProgressForProject(projectId);
  const execInfo = getSiteExecutionInfoForProject(projectId);

  const canEdit = activeSession.role === 'Admin' || activeSession.role === 'ProjectManager' || (activeSession.role as string) === 'ADMIN' || (activeSession.role as string) === 'PROJECT_MANAGER';
  const username = activeSession.displayName || 'User';

  // Supervisor & Execution form state
  const [supervisorName, setSupervisorName] = useState(execInfo?.supervisorName || project?.supervisorName || '');
  const [supervisorContact, setSupervisorContact] = useState(execInfo?.supervisorContact || project?.supervisorContact || '');
  const [supervisorAllocationDate, setSupervisorAllocationDate] = useState(execInfo?.supervisorAllocationDate || project?.supervisorAllocationDate || '');
  const [supportDuration, setSupportDuration] = useState(execInfo?.supportDuration || project?.supportDuration || '');
  const [siteStatus, setSiteStatus] = useState<string>(execInfo?.siteStatus || execInfo?.currentSiteStatus || 'Ongoing');
  const [isSaving, setIsSaving] = useState(false);

  // Weekly Progress form state
  const [isAddingWeekly, setIsAddingWeekly] = useState(false);
  const [weekDate, setWeekDate] = useState(new Date().toISOString().split('T')[0]);
  const [progressStatus, setProgressStatus] = useState('');
  const [weeklyRemarks, setWeeklyRemarks] = useState('');

  const handleSaveSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateSiteExecutionInfo(
      projectId,
      {
        supervisorName,
        supervisorContact,
        supervisorAllocationDate: supervisorAllocationDate || null,
        supportDuration,
        siteStatus,
      },
      username
    );

    setTimeout(() => setIsSaving(false), 300);
  };

  const handleAddWeekly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressStatus.trim()) return;

    const record: WeeklyProgressRecord = {
      id: `WPR-${Date.now()}`,
      projectId,
      weekDate,
      progressStatus: progressStatus.trim(),
      remarks: weeklyRemarks.trim() || undefined,
      updatedBy: username,
      updatedAt: new Date().toISOString(),
    };

    addWeeklyProgress(record, username);
    setProgressStatus('');
    setWeeklyRemarks('');
    setIsAddingWeekly(false);
  };

  return (
    <div className="space-y-6">
      {/* Supervisor Details & Support Duration Card */}
      <div className={`rounded-xl border p-5 shadow-card ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className={isDark ? 'text-cyan-400' : 'text-cyan-600'} size={18} />
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('supervisorDetailsAllocation')}
          </h3>
        </div>

        <form onSubmit={handleSaveSupervisor} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('supervisorName')}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              placeholder="e.g. John Doe"
              value={supervisorName}
              onChange={e => setSupervisorName(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('supervisorContactDetails')}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              placeholder="e.g. +91 9876543210"
              value={supervisorContact}
              onChange={e => setSupervisorContact(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('allocationDate')}
            </label>
            <input
              type="date"
              disabled={!canEdit}
              value={supervisorAllocationDate}
              onChange={e => setSupervisorAllocationDate(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('supportDuration')}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              placeholder="e.g. 4 Weeks"
              value={supportDuration}
              onChange={e => setSupportDuration(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              {t('siteExecutionStatus')}
            </label>
            <select
              disabled={!canEdit}
              value={siteStatus}
              onChange={e => setSiteStatus(e.target.value as 'Ongoing' | 'Completed')}
              className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
              } outline-none disabled:opacity-60`}
            >
              <option value="Ongoing">{t('ongoing')}</option>
              <option value="Completed">{t('completed')}</option>
            </select>
          </div>

          {canEdit && (
            <div className="col-span-1 sm:col-span-2 md:col-span-5 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Save size={13} /> {isSaving ? t('saving') : t('saveSupervisorDetails')}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Weekly Site Progress Status Card */}
      <div className={`rounded-xl border p-5 shadow-card ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className={isDark ? 'text-emerald-400' : 'text-emerald-600'} size={18} />
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('weeklySiteProgressStatus')}
              </h3>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
              {t('weeklyProgressDesc')}
            </p>
          </div>

          {canEdit && !isAddingWeekly && (
            <button
              onClick={() => setIsAddingWeekly(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus size={14} /> {t('addWeeklyProgress')}
            </button>
          )}
        </div>

        {/* Add Weekly Form */}
        {isAddingWeekly && canEdit && (
          <form onSubmit={handleAddWeekly} className={`p-4 rounded-lg border mb-4 ${isDark ? 'bg-[#1A1A1E] border-[#303035]' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {t('newWeeklyProgressEntry')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('weekDate')} *</label>
                <input
                  type="date"
                  required
                  value={weekDate}
                  onChange={e => setWeekDate(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  } outline-none`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('progressStatusLabel')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 75% Floor 4 Assembly Complete"
                  value={progressStatus}
                  onChange={e => setProgressStatus(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  } outline-none`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>{t('remarksLabel')}</label>
                <input
                  type="text"
                  placeholder="e.g. Minor adjustments required on corner panels"
                  value={weeklyRemarks}
                  onChange={e => setWeeklyRemarks(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border ${
                    isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  } outline-none`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setIsAddingWeekly(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded ${isDark ? 'bg-[#262629] text-gray-300' : 'bg-slate-200 text-slate-700'}`}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {t('saveRecord')}
              </button>
            </div>
          </form>
        )}

        {/* Tabulated Weekly Progress Records */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-semibold ${isDark ? 'border-[#262629] text-[#85858B] bg-[#111113]' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                <th className="py-2.5 px-3">{t('weekDate')}</th>
                <th className="py-2.5 px-3">{t('progressStatusLabel')}</th>
                <th className="py-2.5 px-3">{t('remarksLabel')}</th>
                <th className="py-2.5 px-3">{t('updatedBy')}</th>
                <th className="py-2.5 px-3">{t('timestamp')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-[#262629] text-white' : 'divide-slate-200 text-slate-800'}`}>
              {weeklyRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    {t('noWeeklyRecords')}
                  </td>
                </tr>
              ) : (
                weeklyRecords.map(w => (
                  <tr key={w.id} className={isDark ? 'hover:bg-[#1A1A1E]' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap">{w.weekDate}</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-400">{w.progressStatus}</td>
                    <td className="py-2.5 px-3">{w.remarks || '—'}</td>
                    <td className="py-2.5 px-3">{w.updatedBy}</td>
                    <td className={`py-2.5 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(w.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reuse Phase 3 Site Photos Section */}
      <SitePhotosSection projectId={projectId} />
    </div>
  );
}
