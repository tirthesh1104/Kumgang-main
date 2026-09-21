import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { StatusBadge, PaymentBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { ArrowRight, AlertTriangle, Clock, Globe } from 'lucide-react';

export function ProjectList({
  filterStatus,
  filterPayment,
  filterDelay,
  filterCountry,
  searchQuery,
  viewMode = 'table',
}: {
  filterStatus?: string;
  filterPayment?: string;
  filterDelay?: string;
  filterCountry?: string;
  searchQuery?: string;
  viewMode?: 'grid' | 'table';
}) {
  const { navigate, theme } = useApp();
  const isDark = theme === 'dark';
  const { projects: allProjects, shipments } = useData();

  let projects = [...allProjects];
  if (filterStatus && filterStatus !== 'all') {
    projects = projects.filter(p => p.contractStatus.toLowerCase() === filterStatus.toLowerCase());
  }
  if (filterPayment && filterPayment !== 'all') {
    projects = projects.filter(p => p.paymentStatus && p.paymentStatus.toLowerCase().includes(filterPayment.toLowerCase()));
  }
  if (filterCountry && filterCountry !== 'all') {
    projects = projects.filter(p => p.country.toLowerCase() === filterCountry.toLowerCase());
  }
  if (filterDelay === 'delayed') {
    projects = projects.filter(p => (p.balanceUSD || 0) > 0 && p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%'));
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    projects = projects.filter(
      p =>
        p.projectId.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.project.toLowerCase().includes(q) ||
        (p.block && p.block.toLowerCase().includes(q)) ||
        p.contractStatus.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
    );
  }

  if (projects.length === 0) {
    return (
      <div className={`text-center py-16 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
        <p className="font-medium mt-2 text-sm">No projects match the current search or filters.</p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <div className={`overflow-x-auto rounded-xl border shadow-2xs ${
        isDark ? 'bg-[#151517] border-[#262629]' : 'bg-[#FFFFFF] border-[#DCE5EE]'
      }`}>
        <table className="w-full text-left border-collapse text-xs" aria-label="Project Status Report Table">
          <thead>
            <tr className={`font-extrabold uppercase tracking-wider text-[11px] border-b ${
              isDark ? 'bg-[#090909] text-[#FFFFFF] border-[#262629]' : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]'
            }`}>
              <th className="py-3 px-3.5">Project ID</th>
              <th className="py-3 px-3.5">Customer / Project</th>
              <th className="py-3 px-3.5">Country</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5">Design Progress</th>
              <th className="py-3 px-3.5">Financial & Payment</th>
              <th className="py-3 px-3.5">Logistics & Timeline</th>
              <th className="py-3 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-medium ${
            isDark ? 'divide-[#202023] text-[#F5F5F3]' : 'divide-[#E2E8F0] text-[#0F172A]'
          }`}>
            {projects.map((project, i) => {
              const shipment = shipments.find(s => s.projectId === project.projectId);
              const progress = project.designProgressPercent != null ? Math.min(project.designProgressPercent, 100) : null;
              const hasBalance = (project.balanceUSD || 0) > 0;
              const notFullyPaid = project.paymentStatus && !project.paymentStatus.toLowerCase().includes('100%');
              const needsAttention = hasBalance && notFullyPaid;

              return (
                <tr
                  key={project.projectId}
                  onClick={() => navigate('project-detail', project.projectId)}
                  className={`transition-colors cursor-pointer ${
                    isDark 
                      ? `hover:bg-[#1B1B1F] ${needsAttention ? 'bg-[#34191B]/20' : i % 2 === 1 ? 'bg-[#111113]/60' : ''}` 
                      : `hover:bg-[#F1F5F9] ${needsAttention ? 'bg-[#FEF2F2]/60' : i % 2 === 1 ? 'bg-[#F8FAFC]' : ''}`
                  }`}
                >
                  <td className={`py-3 px-3.5 font-mono font-extrabold text-xs ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>
                    {project.projectId}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className={`font-extrabold block ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>{project.customer}</span>
                    <span className={`text-[11px] font-medium ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>{project.project}{project.block ? ` (${project.block})` : ''}</span>
                  </td>
                  <td className={`py-3 px-3.5 font-semibold ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>{project.country}</td>
                  <td className="py-3 px-3.5"><StatusBadge status={project.contractStatus} /></td>
                  <td className="py-3 px-3.5">
                    {progress != null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <ProgressBar value={progress} color={needsAttention ? 'orange' : 'forest'} size="sm" />
                        </div>
                        <span className={`text-xs font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>{Math.round(progress)}%</span>
                      </div>
                    ) : (
                      <span className={`font-mono ${isDark ? 'text-[#65656B]' : 'text-[#94A3B8]'}`}>—</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <PaymentBadge status={project.paymentStatus} />
                        {project.totalAmountUSD != null && (
                          <span className={`text-[11px] font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>${project.totalAmountUSD.toLocaleString()}</span>
                        )}
                      </div>
                      {hasBalance && (
                        <span className={`text-[10px] font-bold block ${isDark ? 'text-[#E5C47A]' : 'text-[#B06000]'}`}>Due: ${project.balanceUSD?.toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  <td className={`py-3 px-3.5 text-xs leading-tight ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                    {project.deliveryRequest ? (
                      <span className={`font-semibold block ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>{project.deliveryRequest}</span>
                    ) : null}
                    {shipment ? (
                      <span className={`text-[11px] font-medium block ${isDark ? 'text-[#83CACA]' : 'text-[#0F766E]'}`}>Shipment: {shipment.status}</span>
                    ) : null}
                    {!project.deliveryRequest && !shipment && (
                      <span className={`font-mono ${isDark ? 'text-[#65656B]' : 'text-[#94A3B8]'}`}>—</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('project-detail', project.projectId); }}
                      className={`text-xs font-extrabold hover:underline flex items-center gap-1 ml-auto ${
                        isDark ? 'text-[#C9A86A] hover:text-[#D7B97C]' : 'text-[#1688D4] hover:text-[#0284C7]'
                      }`}
                    >
                      View <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {projects.map((project, i) => {
        const shipment = shipments.find(s => s.projectId === project.projectId);
        const hasBalance = (project.balanceUSD || 0) > 0;
        const notFullyPaid = project.paymentStatus && !project.paymentStatus.toLowerCase().includes('100%');
        const needsAttention = hasBalance && notFullyPaid;
        const progress = project.designProgressPercent != null ? Math.min(project.designProgressPercent, 100) : null;

        return (
          <motion.div
            key={project.projectId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            onClick={() => navigate('project-detail', project.projectId)}
            className={[
              'rounded-xl border shadow-card transition-all duration-200 cursor-pointer p-5 group relative overflow-hidden',
              isDark 
                ? 'bg-[#151517] border-[#262629] hover:border-[#303035] hover:bg-[#1B1B1F]' 
                : 'bg-[#FFFFFF] border-[#DCE5EE] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]',
              needsAttention ? (isDark ? 'border-l-4 border-l-[#E05A5A] bg-[#34191B]/20' : 'border-l-4 border-l-[#EF4444] bg-[#FEF2F2]/60') : '',
              project.contractStatus === 'Cancelled' ? (isDark ? 'opacity-60 bg-[#111113]' : 'opacity-60 bg-[#F1F5F9]') : '',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                    isDark ? 'text-[#C9A86A] bg-[#18181B] border-[#303035]' : 'text-[#1688D4] bg-[#F1F5F9] border-[#CBD5E1]'
                  }`}>
                    {project.projectId}
                  </span>
                  <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    isDark ? 'text-[#D9DCE0] bg-[#18181B] border-[#303035]' : 'text-[#334155] bg-[#F8FAFC] border-[#CBD5E1]'
                  }`}>
                    <Globe size={11} className={isDark ? 'text-[#BFC3C8]' : 'text-[#64748B]'} />
                    {project.country}
                  </span>
                  {needsAttention && (
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                      isDark ? 'text-[#F08A8A] bg-[#34191B] border-[#5A292B]' : 'text-[#DC2626] bg-[#FEF2F2] border-[#FCA5A5]'
                    }`}>
                      <AlertTriangle size={11} />
                      Balance Due
                    </span>
                  )}
                </div>
                <h3 className={`font-extrabold text-base leading-tight transition-colors ${
                  isDark ? 'text-[#FFFFFF] group-hover:text-[#C9A86A]' : 'text-[#0F172A] group-hover:text-[#1688D4]'
                }`}>{project.project}</h3>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
                  {project.customer}{project.block ? ` · ${project.block}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <StatusBadge status={project.contractStatus} />
                <PaymentBadge status={project.paymentStatus} />
              </div>
            </div>

            {progress != null && (
              <div className={`mb-4 p-3 rounded-lg border ${isDark ? 'bg-[#111113] border-[#202023]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>Design Progress <span className={`text-[10px] font-normal ${isDark ? 'text-[#65656B]' : 'text-[#94A3B8]'}`}>(DERIVED)</span></span>
                  <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} color={needsAttention ? 'orange' : 'forest'} size="md" />
              </div>
            )}

            <div className={`flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium border-t pt-3 mt-2 ${
              isDark ? 'text-[#85858B] border-[#202023]' : 'text-[#64748B] border-[#E2E8F0]'
            }`}>
              {project.totalAmountUSD != null && (
                <span>Value: <strong className={isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}>${project.totalAmountUSD.toLocaleString()}</strong></span>
              )}
              {project.deliveryRequest && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'} />
                  Delivery: {project.deliveryRequest}
                </span>
              )}
              {shipment && (
                <span>Shipment: <strong className={isDark ? 'text-[#83CACA]' : 'text-[#0F766E]'}>{shipment.status}</strong></span>
              )}
              {project.remark && (
                <span className={`italic truncate max-w-[200px] ${isDark ? 'text-[#65656B]' : 'text-[#94A3B8]'}`}>{project.remark}</span>
              )}
            </div>

            <div className={`mt-3 flex items-center text-xs font-bold group-hover:translate-x-1 transition-transform ${
              isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'
            }`}>
              Open Project Workspace
              <ArrowRight size={13} className="ml-1" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

