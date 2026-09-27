import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { StatusBadge } from './ui/StatusBadge';
import { ProgressBar } from './ui/ProgressBar';
import { QuickEditProductionModal } from './QuickEditProductionModal';
import type { ProductionRecord } from '../data/projectData';
import { Edit3, Plus } from 'lucide-react';

export function ProductionPage() {
  const { theme } = useApp();
  const { projects, productionRecords } = useData();
  const isDark = theme === 'dark';

  const [editingProd, setEditingProd] = useState<ProductionRecord | null>(null);
  const [addingProjectId, setAddingProjectId] = useState<string | null>(null);

  const completedCount = productionRecords.filter(p => p.completionPercent === 100).length;
  const inProgressCount = productionRecords.filter(p => (p.completionPercent || 0) > 0 && (p.completionPercent || 0) < 100).length;

  return (
    <div className={`space-y-6 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Production Monitoring</p>
          <h2 className={`text-xl font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Production Status</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            {productionRecords.length} production parts across the portfolio.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Parts', value: productionRecords.length, color: isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]' },
          { label: 'Completed Parts', value: completedCount, color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600' },
          { label: 'In Progress Parts', value: inProgressCount, color: isDark ? 'text-[#83CACA]' : 'text-cyan-600' },
          { label: 'Not Started', value: productionRecords.length - completedCount - inProgressCount, color: isDark ? 'text-[#85858B]' : 'text-slate-400' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-xl shadow-card p-4 border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Group production records by project */}
      {projects.map(project => {
        const prodItems = productionRecords.filter(p => p.projectId === project.projectId);
        if (prodItems.length === 0) return null;

        const isFullyCompleted = prodItems.every(p => p.completionPercent === 100);
        const isInProgress = prodItems.some(p => (p.completionPercent || 0) > 0);
        let projectStatus = 'Not Started';
        if (isFullyCompleted) projectStatus = 'Completed';
        else if (isInProgress) projectStatus = 'In Progress';

        return (
          <motion.div
            key={project.projectId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl shadow-card p-5 border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                    isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-slate-100 border-slate-300'
                  }`}>{project.projectId}</span>
                  <StatusBadge status={project.contractStatus} />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{project.project}</h3>
                <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{project.customer} {project.block ? `· Block ${project.block}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAddingProjectId(project.projectId)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
                    isDark
                      ? 'bg-[#163127] text-[#70D0A8] border-[#28523F] hover:bg-[#1E4235]'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Plus size={13} /> Record Output
                </button>
                <div className="text-right">
                  <p className={`text-[10px] uppercase tracking-wide mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Production Status</p>
                  <StatusBadge status={projectStatus} />
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5 text-sm border-t pt-4 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Production Start</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.productionStart || '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Production Complete</p>
                <p className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{project.productionComplete || '—'}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b text-xs uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
                    <th className="text-left py-2 pr-4 font-semibold">Part / Block</th>
                    <th className="text-left py-2 pr-4 font-semibold">Order Qty</th>
                    <th className="text-left py-2 pr-4 font-semibold">Finished Qty</th>
                    <th className="text-left py-2 pr-4 font-semibold">Completion</th>
                    <th className="text-right py-2 pr-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#262629]' : 'divide-slate-200'}`}>
                  {prodItems.map((prod, i) => (
                    <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                      <td className={`py-2.5 pr-4 font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{prod.part}</td>
                      <td className={`py-2.5 pr-4 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{prod.orderQtyM2 ? `${prod.orderQtyM2} m²` : prod.orderQtyKg ? `${prod.orderQtyKg} kg` : '—'}</td>
                      <td className={`py-2.5 pr-4 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{prod.finishedQtyM2 ? `${prod.finishedQtyM2} m²` : prod.finishedQtyKg ? `${prod.finishedQtyKg} kg` : '—'}</td>
                      <td className="py-2.5 pr-4 min-w-[140px]">
                        <ProgressBar value={prod.completionPercent || 0} color="forest" size="sm" />
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <button
                          onClick={() => setEditingProd(prod)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer transition-colors border ${
                            isDark
                              ? 'bg-[#18181B] text-[#70D0A8] border-[#262629] hover:bg-[#202025]'
                              : 'bg-slate-100 text-emerald-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      })}

      {/* Projects with no production data */}
      {projects
        .filter(p => p.contractStatus === 'Signed' && !productionRecords.some(prod => prod.projectId === p.projectId))
        .map(project => (
          <div key={project.projectId} className={`p-5 border border-dashed rounded-xl flex items-center justify-between gap-4 ${
            isDark ? 'bg-[#151517] border-[#303035]' : 'bg-white border-slate-300'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                  isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-slate-100 border-slate-300'
                }`}>{project.projectId}</span>
                <StatusBadge status={project.contractStatus} />
              </div>
              <p className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{project.project}</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>No production records mapped.</p>
            </div>
            <button
              onClick={() => setAddingProjectId(project.projectId)}
              className={`px-3.5 py-2 text-xs rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border ${
                isDark
                  ? 'bg-[#163127] text-[#70D0A8] border-[#28523F] hover:bg-[#1E4235]'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Plus size={14} /> Add Production Record
            </button>
          </div>
        ))}

      {(editingProd || addingProjectId) && (
        <QuickEditProductionModal
          prodItem={editingProd}
          projectId={addingProjectId || undefined}
          onClose={() => {
            setEditingProd(null);
            setAddingProjectId(null);
          }}
        />
      )}
    </div>
  );
}
