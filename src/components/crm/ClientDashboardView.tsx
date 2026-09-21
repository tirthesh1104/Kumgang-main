import { useState } from 'react';
import {
  CheckCircle2, Lock, LogOut, Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { StatusBadge } from '../ui/StatusBadge';
import type { ProjectMaster } from '../../data/projectData';

export function ClientDashboardView() {
  const { theme, showNotification } = useApp();
  const { activeSession, logout, authorizeAction } = useClientAccess();
  const { projects } = useData() as { projects: ProjectMaster[] };
  const isDark = theme === 'dark';

  const clientPermissions = activeSession.permissions;
  const assignedProjectIds = activeSession.assignedProjects || [];

  // Filter projects to ONLY those assigned to this client
  const clientProjects = projects.filter((p: ProjectMaster) => assignedProjectIds.includes(p.projectId));

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    clientProjects[0]?.projectId || ''
  );

  const activeProject = clientProjects.find((p: ProjectMaster) => p.projectId === selectedProjectId) || clientProjects[0];

  // Active Tab inside Client Dashboard
  const [activeTab, setActiveTab] = useState<
    'overview' | 'progress' | 'checklist' | 'manufacturing' | 'production' | 'shipment' | 'future' | 'reports'
  >('overview');

  // Authorization Check Helper
  const handleSelectProject = (projectId: string) => {
    const authResult = authorizeAction({
      actionType: 'view_project',
      targetProjectId: projectId,
      requiredPermission: 'viewAssignedProject',
    });

    if (!authResult.allowed) {
      showNotification(`ACCESS DENIED: ${authResult.message}`);
      return;
    }

    setSelectedProjectId(projectId);
  };

  return (
    <div className="space-y-6">
      {/* Client Access Security Header Banner */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
        isDark ? 'bg-[#17272E] border-[#294651] text-[#89C9DF]' : 'bg-sky-50 border-sky-200 text-sky-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
            <Lock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">CLIENT ACCESS DASHBOARD</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                LIMITED ACCESS ROLE
              </span>
            </div>
            <h2 className="text-base font-extrabold">{activeSession.displayName}</h2>
            <p className="text-xs opacity-80">
              Assigned Projects: <strong>{clientProjects.length} Project(s)</strong> | Security Audit Verified
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 text-xs font-extrabold rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 shadow-md"
        >
          <LogOut size={14} /> Exit Client View
        </button>
      </div>

      {/* Project Selector Bar if client has multiple assigned projects */}
      {clientProjects.length > 1 && (
        <div className={`p-4 rounded-xl border flex flex-wrap items-center gap-3 ${
          isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Project:</span>
          <div className="flex flex-wrap gap-2">
            {clientProjects.map((p: ProjectMaster) => {
              const selected = p.projectId === activeProject?.projectId;
              return (
                <button
                  key={p.projectId}
                  onClick={() => handleSelectProject(p.projectId)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    selected
                      ? (isDark ? 'bg-[#C9A86A] text-[#111111] border-[#C9A86A]' : 'bg-[#1688D4] text-white border-[#1688D4]')
                      : (isDark ? 'bg-[#18181B] border-[#303035] text-slate-300 hover:bg-[#222226]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100')
                  }`}
                >
                  {p.projectId} — {p.project}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Client Navigation Tabs */}
      <div className={`px-4 border-b flex flex-wrap gap-2 pt-2 ${
        isDark ? 'border-[#262629] bg-[#121214]' : 'border-[#E2E8F0] bg-white'
      }`}>
        {[
          { id: 'overview', label: 'My Projects Overview', perm: 'viewAssignedProject' },
          { id: 'progress', label: 'Project Progress', perm: 'viewProjectProgress' },
          { id: 'checklist', label: 'Checklist', perm: 'viewChecklist' },
          { id: 'manufacturing', label: 'Manufacturing Schedule', perm: 'viewManufacturingSchedule' },
          { id: 'production', label: 'Production Schedule', perm: 'viewProductionSchedule' },
          { id: 'shipment', label: 'Shipment / Vessel Schedule', perm: 'viewShipmentVesselSchedule' },
          { id: 'future', label: 'Future Plans', perm: 'viewFuturePlans' },
          { id: 'reports', label: 'Approved Reports', perm: 'viewApprovedReports' },
        ].map(tab => {
          const allowed = !clientPermissions || (clientPermissions as any)[tab.perm] !== false;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!allowed) {
                  showNotification(`ACCESS DENIED: Permission ${tab.perm} is disabled for your client account.`);
                  return;
                }
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                active
                  ? (isDark ? 'border-[#C9A86A] text-[#C9A86A] bg-[#18181B]' : 'border-[#1688D4] text-[#1688D4] bg-sky-50')
                  : allowed
                  ? (isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900')
                  : 'border-transparent text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              {tab.label} {!allowed && '🔒'}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeProject ? (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className={`p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-[#C9A86A]">{activeProject.projectId}</span>
                    <StatusBadge status={activeProject.contractStatus} />
                  </div>
                  <h3 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeProject.project} ({activeProject.customer})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Location: {activeProject.country} {activeProject.block ? `• Block: ${activeProject.block}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#18181B] border-[#2A2A2E]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block font-medium">Contract Status</span>
                  <span className="font-bold text-sm">{activeProject.contractStatus}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#18181B] border-[#2A2A2E]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block font-medium">Design Progress</span>
                  <span className="font-bold text-sm">{activeProject.designProgressPercent != null ? `${activeProject.designProgressPercent}%` : 'In Progress'}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#18181B] border-[#2A2A2E]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block font-medium">Production Complete</span>
                  <span className="font-bold text-sm">{activeProject.productionComplete || 'Scheduled'}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#18181B] border-[#2A2A2E]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block font-medium">Estimated ETD</span>
                  <span className="font-bold text-sm">{activeProject.etd || 'Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROGRESS */}
          {activeTab === 'progress' && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <h3 className="font-extrabold text-base">Project Progress Tracker</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>Design Engineering Progress</span>
                    <span>{activeProject.designProgressPercent || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-700/30 rounded-full overflow-hidden">
                    <div className="bg-[#1688D4] h-full rounded-full" style={{ width: `${Math.min(100, activeProject.designProgressPercent || 0)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>Shell Plan Confirmation</span>
                    <span>{activeProject.shellPlanConfirmation || 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className={`p-6 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <h3 className="font-extrabold text-base">Milestone Checklist</h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Contract Signed & Verified</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} className={activeProject.shellPlanConfirmation ? 'text-emerald-500' : 'text-slate-500'} />
                  <span>Shell Plan Confirmation: {activeProject.shellPlanConfirmation || 'Pending'}</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} className={activeProject.mdCompletion ? 'text-emerald-500' : 'text-slate-500'} />
                  <span>MD Drawing Completion: {activeProject.mdCompletion || 'In Progress'}</span>
                </li>
              </ul>
            </div>
          )}

          {/* TAB 4: MANUFACTURING SCHEDULE */}
          {activeTab === 'manufacturing' && (
            <div className={`p-6 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <h3 className="font-extrabold text-base">Manufacturing Schedule</h3>
              <p className="text-xs text-slate-400">Production Start: {activeProject.productionStart || 'Scheduled'}</p>
              <p className="text-xs text-slate-400">Production Complete Target: {activeProject.productionComplete || 'Scheduled'}</p>
            </div>
          )}

          {/* TAB 5: PRODUCTION SCHEDULE */}
          {activeTab === 'production' && (
            <div className={`p-6 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <h3 className="font-extrabold text-base">Production Status</h3>
              <p className="text-xs font-semibold">Total Contract Area: {activeProject.contractQtyM2 || '—'} m²</p>
              <p className="text-xs font-semibold">Actual Design Area: {activeProject.actualDesignQtyM2 || '—'} m²</p>
            </div>
          )}

          {/* TAB 6: SHIPMENT / VESSEL SCHEDULE */}
          {activeTab === 'shipment' && (
            <div className={`p-6 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <h3 className="font-extrabold text-base">Shipment & Vessel Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg border">
                  <span className="text-slate-400 block">Loading Date</span>
                  <span className="font-bold">{activeProject.loadingDate || 'Pending'}</span>
                </div>
                <div className="p-3 rounded-lg border">
                  <span className="text-slate-400 block">ETD</span>
                  <span className="font-bold">{activeProject.etd || 'Pending'}</span>
                </div>
                <div className="p-3 rounded-lg border">
                  <span className="text-slate-400 block">ETA</span>
                  <span className="font-bold">{activeProject.eta || 'Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FUTURE PLANS */}
          {activeTab === 'future' && (
            <div className={`p-6 rounded-2xl border space-y-3 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <h3 className="font-extrabold text-base">Future Operational Milestones</h3>
              <p className="text-xs text-slate-400">Forwarding Target: {activeProject.fwd || 'To be updated'}</p>
            </div>
          )}

          {/* TAB 8: APPROVED REPORTS */}
          {activeTab === 'reports' && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
            }`}>
              <h3 className="font-extrabold text-base">Approved Project Reports</h3>
              <div className="p-4 rounded-xl border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold block">Official Project Progress Brief ({activeProject.projectId})</span>
                  <span className="text-slate-400 text-[10px]">Verified & Approved by Kumkang Management</span>
                </div>
                {clientPermissions?.downloadApprovedReports !== false && (
                  <button
                    onClick={() => showNotification(`Downloading official report for ${activeProject.projectId}...`)}
                    className="px-3 py-1.5 rounded-lg bg-[#1688D4] text-white font-bold flex items-center gap-1"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 italic">No assigned project data available for your client account.</div>
      )}
    </div>
  );
}
