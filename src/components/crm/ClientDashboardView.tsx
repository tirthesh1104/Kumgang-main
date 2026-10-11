import { useState } from 'react';
import {
  Lock, LogOut, Download, FileText,
  Calendar, Layers, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { ProjectJourney } from '../projects/ProjectJourney';
import type { ProjectMaster } from '../../data/projectData';
import {
  getClientDocumentsForProject,
  downloadClientDocument,
  type ClientDocumentInfo
} from '../../utils/clientDocumentUtils';

export function ClientDashboardView() {
  const { theme, showNotification } = useApp();
  const { activeSession, logout, authorizeAction } = useClientAccess();
  const { projects } = useData() as { projects: ProjectMaster[] };
  const isDark = theme === 'dark';

  const clientPermissions = activeSession.permissions;
  const assignedProjectIds = activeSession.assignedProjects || [];

  // Filter projects to ONLY those assigned to this client (strict isolation, no fallback)
  const clientProjects = projects.filter((p: ProjectMaster) => assignedProjectIds.includes(p.projectId));
  const effectiveProjects = clientProjects;

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    effectiveProjects[0]?.projectId || ''
  );

  // Active Tab inside Client Dashboard
  const [activeTab, setActiveTab] = useState<'what_client_sees' | 'journey_timeline' | 'downloads'>(
    'what_client_sees'
  );

  const activeProject = effectiveProjects.find((p: ProjectMaster) => p.projectId === selectedProjectId) || effectiveProjects[0];

  // If no assigned projects found for this client session, render secure empty state
  if (!activeProject || effectiveProjects.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border bg-white dark:bg-[#141C26] border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
          <Lock size={26} />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
          No Projects Assigned
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Your client account (<strong>{activeSession.displayName}</strong>) is securely authenticated, but does not currently have any active projects linked to it.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          To link your Project Access ID, please contact your Kumkang Kind Project Manager.
        </p>
        <button
          onClick={logout}
          className="mt-6 px-6 py-2.5 rounded-xl bg-[#0E4E8A] hover:bg-[#0B3D6D] text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
        >
          <LogOut size={14} /> Exit Client Portal
        </button>
      </div>
    );
  }

  // Download files list for the active project
  const documents: ClientDocumentInfo[] = getClientDocumentsForProject(activeProject);

  const handleDownload = (doc: ClientDocumentInfo) => {
    if (!doc.isAvailable) {
      showNotification(`DOCUMENT UNAVAILABLE: ${doc.title} has not been officially released by engineering.`);
      return;
    }
    if (clientPermissions?.downloadApprovedReports === false) {
      showNotification('ACCESS RESTRICTED: PDF downloads are restricted for your account.');
      return;
    }
    showNotification(`Preparing download: ${doc.title}...`);
    downloadClientDocument(doc, activeProject);
  };

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

  // Helper to determine current stage text
  const getCurrentStage = (p: ProjectMaster): string => {
    if (p.loadingDate) return 'Shipment / Dispatched';
    if (p.productionStart) return 'Production';
    if (p.shellPlanConfirmation) return 'Production Preparation';
    if (p.contractStatus === 'Signed') return 'Client Approval / Engineering';
    return 'Proposal / Contract Phase';
  };

  // Helper for progress percentage
  const getProgress = (p: ProjectMaster): number => {
    if (p.designProgressPercent != null && p.designProgressPercent > 0) {
      return p.designProgressPercent;
    }
    if (p.contractStatus === 'Signed') return 65;
    return 30;
  };

  // Helper for target delivery
  const getTargetDelivery = (p: ProjectMaster): string => {
    return p.deliveryRequest || p.eta || p.productionComplete || '15 Nov 2026';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Client Access Security Banner */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-sm ${
        isDark ? 'bg-[#141C26] border-[#22354A] text-[#89C9DF]' : 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 text-sky-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
            <Lock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">CLIENT ACCESS DASHBOARD</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                AUTHORIZED CLIENT PORTAL
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {activeSession.displayName || 'Authorized Client'}
            </h2>
            <p className="text-xs opacity-80 text-slate-600 dark:text-slate-300">
              Assigned Project: <strong className="text-slate-900 dark:text-white">{activeProject.project} ({activeProject.projectId})</strong> · Encrypted Operational Isolation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <LogOut size={14} /> Exit Client View
          </button>
        </div>
      </div>

      {/* Project Selector if multiple assigned */}
      {effectiveProjects.length > 1 && (
        <div className={`p-3 rounded-xl border flex flex-wrap items-center gap-2 ${
          isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Select Project:</span>
          {effectiveProjects.map((p: ProjectMaster) => {
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
      )}

      {/* Client View Navigation Tabs */}
      <div className={`flex items-center gap-2 border-b pb-1 ${
        isDark ? 'border-[#262629]' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('what_client_sees')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'what_client_sees'
              ? (isDark ? 'border-[#38BDF8] text-[#38BDF8] bg-[#182230]' : 'border-[#1688D4] text-[#1688D4] bg-sky-50')
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          High-Level Metrics & Status (Standard View)
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'downloads'
              ? (isDark ? 'border-[#38BDF8] text-[#38BDF8] bg-[#182230]' : 'border-[#1688D4] text-[#1688D4] bg-sky-50')
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Download size={14} />
          Client Downloads Center ({documents.length} Files)
        </button>

        <button
          onClick={() => setActiveTab('journey_timeline')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'journey_timeline'
              ? (isDark ? 'border-[#38BDF8] text-[#38BDF8] bg-[#182230]' : 'border-[#1688D4] text-[#1688D4] bg-sky-50')
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={14} />
          8-Stage Project Journey Timeline
        </button>
      </div>

      {/* TAB 1: WHAT CLIENT WILL SEE (matching image 5 exactly) */}
      {activeTab === 'what_client_sees' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border space-y-6 shadow-sm ${
            isDark ? 'bg-[#13161F] border-[#252B3B]' : 'bg-white border-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  REQUIREMENT 4: CLIENT-FACING DASHBOARD
                </span>
              </div>
              <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                WHAT CLIENT WILL SEE
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The high-level fields and verified operational progress indicators displayed on the client side
              </p>
            </div>

            {/* Top Field Badges / Chips matching image 5 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Project Name', val: activeProject.project },
                { label: 'Client', val: activeProject.customer || 'Client' },
                { label: 'Current Stage', val: getCurrentStage(activeProject) },
                { label: 'Progress', val: `${getProgress(activeProject)}%` },
                { label: 'Target Delivery', val: getTargetDelivery(activeProject) },
              ].map((chip, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isDark
                      ? 'bg-[#1A1F2C] border-[#2E364A]'
                      : 'bg-[#E2E8F0]/70 border-slate-300'
                  }`}
                >
                  <span className={`text-[11px] font-bold block mb-1 ${
                    isDark ? 'text-sky-400' : 'text-[#0284C7]'
                  }`}>
                    {chip.label}
                  </span>
                  <span className={`text-xs font-extrabold leading-tight break-words [overflow-wrap:anywhere] block ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {chip.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Client-Facing High Level Table matching image 5 */}
            <div className={`overflow-x-auto rounded-xl border shadow-sm ${
              isDark ? 'border-[#262629]' : 'border-slate-200'
            }`}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0E4E8A] text-white font-extrabold uppercase text-[11px]">
                    <th className="py-3 px-4 text-left">Project</th>
                    <th className="py-3 px-4 text-left">Client</th>
                    <th className="py-3 px-4 text-left">Current Stage</th>
                    <th className="py-3 px-4 text-center">Progress</th>
                    <th className="py-3 px-4 text-left">Target Delivery</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-[#252B3B] bg-[#161B26]' : 'divide-slate-200 bg-white'
                }`}>
                  {effectiveProjects.map((proj) => {
                    const stage = getCurrentStage(proj);
                    const progress = getProgress(proj);
                    const targetDelivery = getTargetDelivery(proj);

                    return (
                      <tr
                        key={proj.projectId}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-[#1E2433]' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{proj.project}</span>
                            <span className="font-mono text-[10px] text-slate-400">({proj.projectId})</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                          {proj.customer || 'Developer'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-500/10 text-sky-500 dark:text-sky-300 border border-sky-500/20">
                            {stage}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-extrabold font-mono text-slate-900 dark:text-white">{progress}%</span>
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">
                          {targetDelivery}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* DOWNLOADABLES SECTION matching image 5 */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                    Downloadables
                  </h4>
                  <p className="text-xs text-slate-400">
                    Official certified PDF documents released for {activeProject.project}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <ShieldCheck size={14} /> Certified Release
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {documents.map(doc => (
                  <div
                    key={doc.type}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md ${
                      isDark ? 'bg-[#181C26] border-[#2A3142]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center mb-3">
                        <FileText size={18} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-slate-400 block">
                          {doc.revision}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          doc.isAvailable
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {doc.availabilityStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono mt-1">
                        {doc.fileSize} · {doc.approvedDate}
                      </span>
                    </div>

                    {doc.isAvailable ? (
                      <button
                        onClick={() => handleDownload(doc)}
                        className="mt-4 w-full py-2 px-3 rounded-lg bg-[#0E4E8A] hover:bg-[#0B3D6D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Download size={13} /> Download PDF
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Document not yet released by Kumkang Kind engineering"
                        className="mt-4 w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200 dark:border-slate-700/60"
                      >
                        <Lock size={12} /> Pending Release
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOWNLOADS CENTER FULL */}
      {activeTab === 'downloads' && (
        <div className={`p-6 rounded-2xl border space-y-6 shadow-sm ${
          isDark ? 'bg-[#13161F] border-[#252B3B]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Client Downloads Center
              </h3>
              <p className="text-xs text-slate-400">
                Official certified engineering & logistics files available for download
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified by Kumkang Kind Management
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {documents.map(doc => (
              <div
                key={doc.type}
                className="py-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      File: <span className="font-mono text-slate-300">{doc.filename}</span> · {doc.revision} · Released on {doc.approvedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    doc.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {doc.availabilityStatus}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{doc.fileSize}</span>
                  {doc.isAvailable ? (
                    <button
                      onClick={() => handleDownload(doc)}
                      className="px-4 py-2 rounded-xl bg-[#0E4E8A] hover:bg-[#0B3D6D] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Download size={14} /> Download Document
                    </button>
                  ) : (
                    <button
                      disabled
                      title="Document not yet released by Kumkang Kind engineering"
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold flex items-center gap-2 cursor-not-allowed border border-slate-200 dark:border-slate-700/60"
                    >
                      <Lock size={13} /> Pending Release
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 8-STAGE JOURNEY TIMELINE */}
      {activeTab === 'journey_timeline' && (
        <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${
          isDark ? 'bg-[#13161F] border-[#252B3B]' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              8-Stage Project Journey Timeline
            </h3>
            <p className="text-xs text-slate-400">
              Live status across all 8 execution phases for {activeProject.project}
            </p>
          </div>

          <ProjectJourney project={activeProject} />
        </div>
      )}
    </div>
  );
}
