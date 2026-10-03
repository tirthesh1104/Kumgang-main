import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { getProjectScope, formatScopeCurrency } from '../utils/scopeUtils';

export interface PriorityActionItem {
  id: string;
  projectId: string;
  projectName: string;
  customer: string;
  priorityLabel: string;
  category: 'Payment' | 'Design' | 'Shipment' | 'Production' | 'Approval';
  currentStatus: string;
  relevantDate: string;
  assignedPerson: string;
  urgency: 'high' | 'medium' | 'normal';
}

export function DashboardKeyPriorities() {
  const { navigate, theme, projectManager } = useApp();
  const { projects } = useData();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const priorityItems = useMemo(() => {
    const items: PriorityActionItem[] = [];

    projects.forEach(p => {
      const scope = getProjectScope(p);
      const assigned = projectManager.name || 'Prakash Shinde';
      const bal = p.balanceUSD || 0;

      // 1. Payment Attention Required
      if (p.contractStatus === 'Signed' && bal > 0 && p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%')) {
        const roundedDue = p.dueDays != null && !isNaN(Number(p.dueDays)) ? Math.round(Number(p.dueDays)) : null;
        const dueText = roundedDue && roundedDue > 0 ? `${roundedDue} Days Due` : (p.lastPiRaisedDate || 'Not Available');

        items.push({
          id: `pri-pay-${p.projectId}`,
          projectId: p.projectId,
          projectName: p.project || p.projectId,
          customer: p.customer || 'Not Available',
          priorityLabel: `Outstanding Collection: ${formatScopeCurrency(bal, scope)}`,
          category: 'Payment',
          currentStatus: p.paymentStatus || 'Payment Pending',
          relevantDate: dueText,
          assignedPerson: assigned,
          urgency: bal > 500000 ? 'high' : 'medium',
        });
      }

      // 2. Shell Plan Confirmation Pending
      if (p.contractStatus === 'Signed' && (!p.shellPlanConfirmation || p.shellPlanConfirmation.toLowerCase().includes('pending'))) {
        items.push({
          id: `pri-shell-${p.projectId}`,
          projectId: p.projectId,
          projectName: p.project || p.projectId,
          customer: p.customer || 'Not Available',
          priorityLabel: 'Shell Plan Confirmation Awaiting Action',
          category: 'Approval',
          currentStatus: 'Pending Shell Approval',
          relevantDate: p.contractDate || 'Not Available',
          assignedPerson: assigned,
          urgency: 'medium',
        });
      }

      // 3. ETA / Active Shipment Tracking Action
      if (p.eta || p.etd) {
        items.push({
          id: `pri-ship-${p.projectId}`,
          projectId: p.projectId,
          projectName: p.project || p.projectId,
          customer: p.customer || 'Not Available',
          priorityLabel: `Active Shipment Tracking (ETA: ${p.eta || 'NA'})`,
          category: 'Shipment',
          currentStatus: p.fwd ? `FWD: ${p.fwd}` : 'In Transit',
          relevantDate: p.eta || p.etd || 'Not Available',
          assignedPerson: assigned,
          urgency: 'normal',
        });
      }

      // 4. Design Schedule Incomplete
      if (p.designProgressPercent !== null && p.designProgressPercent !== undefined && p.designProgressPercent > 0 && p.designProgressPercent < 100) {
        items.push({
          id: `pri-des-${p.projectId}`,
          projectId: p.projectId,
          projectName: p.project || p.projectId,
          customer: p.customer || 'Not Available',
          priorityLabel: `Design Progress at ${Math.round(p.designProgressPercent)}%`,
          category: 'Design',
          currentStatus: 'Under Design Review',
          relevantDate: p.mdCompletion || 'Not Available',
          assignedPerson: assigned,
          urgency: 'normal',
        });
      }
    });

    // Sort by urgency: high -> medium -> normal
    const urgencyWeight = { high: 3, medium: 2, normal: 1 };
    return items.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);
  }, [projects, projectManager]);

  if (priorityItems.length === 0) {
    return null;
  }

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
            isDark ? 'bg-[#321B1D] text-[#F87171] border-[#5E2529]' : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
              {t('keyActionPriorities')}
            </h2>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
              High-priority operational actions derived from live project milestones and balances.
            </p>
          </div>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          isDark ? 'bg-[#1F1914] text-[#C9A86A] border-[#3D311B]' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {priorityItems.length} {t('actionItemsTotal')}
        </span>
      </div>

      {/* Priority Cards List */}
      <div className="space-y-2.5">
        {priorityItems.slice(0, 5).map((item) => (
          <div
            key={item.id}
            onClick={() => navigate('project-detail', item.projectId)}
            className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.urgency === 'high'
                ? isDark
                  ? 'bg-[#1D1416]/60 border-[#4D2024] hover:bg-[#25181B]'
                  : 'bg-rose-50/50 border-rose-200/80 hover:bg-rose-50'
                : isDark
                ? 'bg-[#18181B] border-[#29292E] hover:bg-[#202024]'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono shrink-0 border ${
                item.category === 'Payment'
                  ? (isDark ? 'bg-[#322414] text-[#D6A84F] border-[#593E1B]' : 'bg-amber-100 text-amber-800 border-amber-300')
                  : item.category === 'Approval'
                  ? (isDark ? 'bg-[#1D2B3A] text-[#60A5FA] border-[#2B435E]' : 'bg-blue-100 text-blue-800 border-blue-300')
                  : item.category === 'Shipment'
                  ? (isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-100 text-emerald-800 border-emerald-300')
                  : (isDark ? 'bg-[#251B38] text-[#BBA8E8] border-[#443166]' : 'bg-purple-100 text-purple-800 border-purple-300')
              }`}>
                {item.category}
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>
                    {item.projectId}
                  </span>
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {item.projectName}
                  </span>
                  <span className={`text-[11px] font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                    • {item.customer}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 font-semibold ${isDark ? 'text-[#E2E8F0]' : 'text-slate-800'}`}>
                  {item.priorityLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/40 dark:border-slate-800/40">
              <div className="text-left sm:text-right">
                <span className={`text-[11px] font-bold block ${
                  item.urgency === 'high'
                    ? (isDark ? 'text-[#F87171]' : 'text-rose-600')
                    : (isDark ? 'text-[#B4B4B8]' : 'text-slate-600')
                }`}>
                  {item.currentStatus}
                </span>
                <span className={`text-[10px] font-medium block ${isDark ? 'text-[#85858B]' : 'text-slate-400'}`}>
                  Date: {item.relevantDate} • PM: {item.assignedPerson}
                </span>
              </div>

              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-transform group-hover:translate-x-0.5 ${
                isDark ? 'bg-[#222226] border-[#35353C] text-[#C9A86A]' : 'bg-white border-slate-300 text-sky-600'
              }`}>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
