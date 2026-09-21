import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { StatusBadge } from './ui/StatusBadge';

export function DesignPage() {
  const { navigate, theme } = useApp();
  const { projects, designSchedules } = useData();
  const isDark = theme === 'dark';

  const completedCount = designSchedules.filter(d => d.status === 'Completed').length;
  const inProgressCount = designSchedules.filter(d => d.status === 'In Progress').length;
  const totalCount = designSchedules.length;

  return (
    <div className={`space-y-6 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div>
        <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Design Monitoring</p>
        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Design Elements</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          {totalCount} design activities across {new Set(designSchedules.map(d => d.projectId)).size} projects.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Elements', value: totalCount, color: isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]' },
          { label: 'Completed', value: completedCount, color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600' },
          { label: 'In Progress', value: inProgressCount, color: isDark ? 'text-[#BBA8E8]' : 'text-indigo-600' },
          { label: 'Pending', value: totalCount - completedCount - inProgressCount, color: isDark ? 'text-[#85858B]' : 'text-slate-400' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-xl shadow-card p-4 border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`text-3xl font-extrabold ${item.color}`}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Per-project breakdown */}
      {projects.map(project => {
        const activities = designSchedules.filter(d => d.projectId === project.projectId);
        if (activities.length === 0) return null;

        return (
          <motion.div
            key={project.projectId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl shadow-card overflow-hidden border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
          >
            <div 
              className={`p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer group border-b transition-colors ${
                isDark ? 'bg-[#111113] border-[#262629] hover:bg-[#1B1B1F]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => navigate('project-detail', project.projectId)}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                    isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-white border-slate-300'
                  }`}>{project.projectId}</span>
                </div>
                <h3 className={`font-extrabold text-base transition-colors ${
                  isDark ? 'text-[#FFFFFF] group-hover:text-[#C9A86A]' : 'text-[#0B2239] group-hover:text-[#1688D4]'
                }`}>{project.project}</h3>
                <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{project.customer}</p>
              </div>
              <StatusBadge status={project.contractStatus} />
            </div>

            <div className="p-4 sm:p-5 overflow-x-auto">
              <table className="w-full text-sm" aria-label={`Design schedule for ${project.project}`}>
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
                    <th className="text-left py-2.5 px-3">ID</th>
                    <th className="text-left py-2.5 px-3">Element</th>
                    <th className="text-left py-2.5 px-3">Planned</th>
                    <th className="text-left py-2.5 px-3">Actual</th>
                    <th className="text-left py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
                  {activities.map(d => (
                    <tr key={d.designId} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                      <td className={`py-2.5 px-3 text-xs font-mono font-semibold ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{d.designId}</td>
                      <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{d.element}</td>
                      <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.plannedDate ?? '—'}</td>
                      <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{d.actualDate ?? '—'}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
