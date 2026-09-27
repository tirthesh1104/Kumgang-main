import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { StatusBadge } from './ui/StatusBadge';
import { QuickEditDelayModal } from './QuickEditDelayModal';
import type { ProjectMaster } from '../data/projectData';
import { AlertTriangle, ArrowRight, Info, Edit3 } from 'lucide-react';

function RiskTag({ isDark }: { isDark: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
      isDark ? 'bg-[#34191B] text-[#F08A8A] border-[#5A292B]' : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      Financial Risk
    </span>
  );
}

export function DelaysPage() {
  const { navigate, theme } = useApp();
  const { projects, productionRecords, getAttentionProjects } = useData();
  const isDark = theme === 'dark';

  const [editingProjectDelay, setEditingProjectDelay] = useState<ProjectMaster | null>(null);

  const attentionProjects = getAttentionProjects();
  const productionDelays = productionRecords.filter(p => (p.completionPercent || 0) > 0 && (p.completionPercent || 0) < 100);
  const paymentDelays = projects.filter(p => p.contractStatus === 'Signed' && (p.balanceUSD || 0) > 0 && p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%'));

  return (
    <div className={`space-y-6 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div>
        <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Delay & Risk Center</p>
        <h2 className={`text-xl font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Delays & Risk Overview</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          Identifying financial risks, outstanding balances, and production bottlenecks.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Projects at Risk', value: attentionProjects.length, color: isDark ? 'text-[#F08A8A]' : 'text-red-600', bg: isDark ? 'bg-[#34191B] border-[#5A292B]' : 'bg-red-50 border-red-200' },
          { label: 'Production In Progress', value: productionDelays.length, color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600', bg: isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200' },
          { label: 'Payment Outstanding', value: paymentDelays.length, color: isDark ? 'text-[#E5C47A]' : 'text-amber-600', bg: isDark ? 'bg-[#322917] border-[#5B4724]' : 'bg-amber-50 border-amber-200' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`p-4 rounded-xl border ${item.bg}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Attention required */}
      {attentionProjects.length > 0 && (
        <div className={`rounded-xl p-5 shadow-card border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className={isDark ? 'text-[#E05A5A]' : 'text-red-500'} />
            <h3 className={`font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Attention Required</h3>
            <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
              isDark ? 'text-[#111111] bg-[#E05A5A]' : 'text-white bg-red-600'
            }`}>
              {attentionProjects.length}
            </span>
          </div>
          <div className="space-y-3">
            {attentionProjects.map(project => {
              const issues: string[] = [];
              if ((project.balanceUSD || 0) > 0) issues.push(`Outstanding balance of $${project.balanceUSD?.toLocaleString()} (source: Master Sheet)`);
              if (project.paymentStatus && !project.paymentStatus.toLowerCase().includes('100%')) issues.push(`Payment status: ${project.paymentStatus}`);
              if (project.delayReason) issues.push(`Reason: ${project.delayReason} (Owner: ${project.actionOwner || 'Unassigned'})`);

              return (
                <div
                  key={project.projectId}
                  className={`border rounded-lg p-4 transition-colors group ${
                    isDark 
                      ? 'border-[#5A292B] bg-[#34191B]/50 hover:border-[#E05A5A]' 
                      : 'border-red-200 bg-red-50/50 hover:border-red-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('project-detail', project.projectId)}>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                        isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-white border-slate-300'
                      }`}>
                        {project.projectId}
                      </span>
                      <span className={`font-semibold ${isDark ? 'text-[#FFFFFF]' : 'text-slate-900'}`}>{project.project}</span>
                      <StatusBadge status={project.contractStatus} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProjectDelay(project)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
                          isDark
                            ? 'bg-[#18181B] text-[#F08A8A] border-[#5A292B] hover:bg-[#202025]'
                            : 'bg-white text-red-700 border-red-300 hover:bg-red-100'
                        }`}
                      >
                        <Edit3 size={12} /> Update Risk Plan
                      </button>
                      <button
                        onClick={() => navigate('project-detail', project.projectId)}
                        className="p-1 cursor-pointer"
                        title="View Project Details"
                      >
                        <ArrowRight size={14} className={`${isDark ? 'text-[#F08A8A]' : 'text-red-600'} opacity-75 hover:opacity-100`} />
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {issues.map((issue, i) => (
                      <li key={i} className={`text-xs ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>· {issue}</li>
                    ))}
                  </ul>
                  <div className={`mt-2 flex flex-wrap gap-1.5 pt-2 border-t ${isDark ? 'border-[#5A292B]' : 'border-red-200'}`}>
                    <RiskTag isDark={isDark} />
                    {project.delayReasonCode && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isDark ? 'bg-[#18181B] border-[#303035] text-[#D5D5D8]' : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        Category: {project.delayReasonCode}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Production bottlenecks */}
      {productionDelays.length > 0 && (
        <div className={`rounded-xl p-5 shadow-card border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>
            <AlertTriangle size={14} className={isDark ? 'text-[#D6A84F]' : 'text-amber-500'} />
            Incomplete Production Parts
          </h3>
          <p className={`text-xs mb-4 flex items-start gap-1.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            These parts are currently in production and have not reached 100% completion.
          </p>
          <div className="space-y-2">
            {productionDelays.map((p, i) => {
              const project = projects.find(pm => pm.projectId === p.projectId);
              return (
                <div key={i} className={`flex flex-wrap items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                  <span className={`text-xs font-bold font-mono ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{p.projectId}</span>
                  <span className={`text-sm font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.part}</span>
                  <span className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{project?.project}</span>
                  <span className={`text-xs font-semibold ml-auto ${isDark ? 'text-[#D6A84F]' : 'text-amber-600'}`}>{p.completionPercent}% complete</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editingProjectDelay && (
        <QuickEditDelayModal
          project={editingProjectDelay}
          onClose={() => setEditingProjectDelay(null)}
        />
      )}
    </div>
  );
}
