import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../data/projectData';
import { PaymentBadge } from './ui/StatusBadge';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

function PaymentBar({ received, total, isDark }: { received: number; total: number; isDark: boolean }) {
  const pct = total > 0 ? (received / total) * 100 : 0;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1">
        <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Received</span>
        <span className={`font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden border ${
        isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-100 border-slate-200'
      }`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct >= 100 
              ? (isDark ? 'bg-[#3FB984]' : 'bg-emerald-500') 
              : pct >= 50 
              ? (isDark ? 'bg-[#D6A84F]' : 'bg-amber-500') 
              : (isDark ? 'bg-[#E05A5A]' : 'bg-red-500')
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
        <span>${received.toLocaleString()} received</span>
        <span>${total.toLocaleString()} total</span>
      </div>
    </div>
  );
}

export function PaymentsPage() {
  const { navigate, theme } = useApp();
  const { projects, payments, getTotalOutstandingBalance } = useData();
  const isDark = theme === 'dark';

  const totalOutstanding = getTotalOutstandingBalance();
  const activeProjects = projects.filter(p => p.contractStatus === 'Signed');
  const totalContract = activeProjects.reduce((s, p) => s + (p.totalAmountUSD || 0), 0);
  const safeTotalReceived = totalContract - totalOutstanding;
  const fullPaid = activeProjects.filter(p => p.paymentStatus && p.paymentStatus.toLowerCase().includes('100%')).length;

  return (
    <div className={`space-y-6 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div>
        <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Payment Monitoring</p>
        <h2 className={`text-xl font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Payment Overview</h2>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          Monitoring financial status across {activeProjects.length} signed projects.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contract Value', value: formatCurrency(totalContract), desc: 'Derived: sum of all signed contracts', color: isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]', variant: 'default' },
          { label: 'Total Received', value: formatCurrency(safeTotalReceived), desc: 'Derived: sum received', color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600', variant: 'highlight' },
          { label: 'Outstanding Balance', value: formatCurrency(totalOutstanding), desc: 'Derived: total balance due', color: isDark ? 'text-[#D6A84F]' : 'text-amber-600', variant: 'attention' },
          { label: 'Fully Settled', value: `${fullPaid} / ${activeProjects.length}`, desc: 'Projects fully paid', color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600', variant: 'highlight' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`p-5 rounded-xl border ${
              item.variant === 'highlight' 
                ? (isDark ? 'bg-[#163127] border-[#28523F]' : 'bg-emerald-50 border-emerald-200') 
                : item.variant === 'attention' 
                ? (isDark ? 'bg-[#322917] border-[#5B4724]' : 'bg-amber-50 border-amber-200') 
                : (isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200')
            }`}
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Project Financial Overviews */}
      {activeProjects.map((project, i) => {
        const hasBalance = (project.balanceUSD || 0) > 0;
        const projectPayments = payments.filter(pay => pay.projectId === project.projectId);
        const amountReceived = (project.totalAmountUSD || 0) - (project.balanceUSD || 0);

        if (!project.totalAmountUSD && projectPayments.length === 0) return null;

        return (
          <motion.div
            key={project.projectId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl p-5 cursor-pointer group transition-all border ${
              isDark 
                ? 'bg-[#151517] border-[#262629] hover:bg-[#1B1B1F]' 
                : 'bg-white border-slate-200 hover:bg-slate-50'
            } ${hasBalance && project.paymentStatus && !project.paymentStatus.toLowerCase().includes('100%') 
                ? (isDark ? 'border-l-4 border-l-[#D6A84F]' : 'border-l-4 border-l-amber-500') 
                : (isDark ? 'border-l-4 border-l-[#3FB984]' : 'border-l-4 border-l-emerald-500')
            }`}
            onClick={() => navigate('project-detail', project.projectId)}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                    isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-slate-100 border-slate-300'
                  }`}>
                    {project.projectId}
                  </span>
                </div>
                <h3 className={`font-bold transition-colors ${
                  isDark ? 'text-[#FFFFFF] group-hover:text-[#C9A86A]' : 'text-[#0B2239] group-hover:text-[#1688D4]'
                }`}>{project.project}</h3>
                <p className={`text-sm ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{project.customer}</p>
              </div>
              <PaymentBadge status={project.paymentStatus} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Contract Amount</p>
                <p className={`text-base font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{project.totalAmountUSD ? `$${project.totalAmountUSD.toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Advance Paid</p>
                <p className={`text-base font-bold ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>{project.advanceUSD ? `$${project.advanceUSD.toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Est. Received</p>
                <p className={`text-base font-bold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>{project.totalAmountUSD ? `$${amountReceived.toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Balance Due</p>
                <p className={`text-base font-bold ${
                  hasBalance 
                    ? (isDark ? 'text-[#E5C47A]' : 'text-amber-600') 
                    : (isDark ? 'text-[#70D0A8]' : 'text-emerald-600')
                }`}>
                  {project.balanceUSD ? `$${project.balanceUSD.toLocaleString()}` : '$0'}
                </p>
              </div>
            </div>

            {project.totalAmountUSD && (
              <PaymentBar received={amountReceived} total={project.totalAmountUSD} isDark={isDark} />
            )}

            {projectPayments.length > 0 && (
              <div className={`mt-4 pt-3 border-t ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                <p className={`text-xs font-bold mb-2 ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>Detailed Tranches / Installments</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {projectPayments.map((pay, idx) => (
                    <div key={idx} className={`rounded p-2 text-xs border ${
                      isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <p className={`font-medium truncate ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{pay.description || 'Installment'}</p>
                      <div className="flex justify-between mt-1">
                        <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Value:</span>
                        <span className={`font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{pay.amountUSD ? `$${pay.amountUSD.toLocaleString()}` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Balance:</span>
                        <span className={`font-semibold ${isDark ? 'text-[#E5C47A]' : 'text-amber-600'}`}>{pay.balanceUSD ? `$${pay.balanceUSD.toLocaleString()}` : '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasBalance && project.paymentStatus && !project.paymentStatus.toLowerCase().includes('100%') && (
              <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-[#E5C47A]' : 'text-amber-600'}`}>
                <AlertTriangle size={12} />
                Outstanding: ${project.balanceUSD?.toLocaleString()}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
