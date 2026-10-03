import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FileCheck, FileText, Paintbrush, CalendarCheck, Factory,
  PackageCheck, Truck, Wrench, ArrowRight
} from 'lucide-react';
import { calculatePhase1StageCounts } from '../utils/stageUtils';

export function DashboardProjectStages() {
  const { navigate, theme } = useApp();
  const { projects, designSchedules, productionRecords, shipments } = useData();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  const stageCounts = useMemo(() => {
    return calculatePhase1StageCounts(projects, designSchedules, productionRecords, shipments);
  }, [projects, designSchedules, productionRecords, shipments]);

  const stages = [
    {
      id: 'po-approval',
      title: '1. PO Approval Stage',
      count: stageCounts.poApprovedCount,
      subtitle: `${stageCounts.poApprovedCount} POs Approved`,
      icon: FileCheck,
      color: isDark ? 'text-[#38BDF8]' : 'text-[#0284C7]',
      bgColor: isDark ? 'bg-[#101F30] border-[#1E3B5C]' : 'bg-sky-50 border-sky-200',
      actionPage: 'projects' as const,
    },
    {
      id: 'loi-received',
      title: '2. LOI Received',
      count: stageCounts.loiProjects.length,
      subtitle: stageCounts.loiProjects.length > 0 ? `${stageCounts.loiProjects.length} LOIs On Record` : 'NA',
      icon: FileText,
      color: isDark ? 'text-[#C9A86A]' : 'text-amber-600',
      bgColor: isDark ? 'bg-[#241E14] border-[#443823]' : 'bg-amber-50 border-amber-200',
      actionPage: 'projects' as const,
    },
    {
      id: 'under-design',
      title: '3. Under Design',
      count: stageCounts.underDesignProjects.length,
      subtitle: `${stageCounts.underDesignProjects.length} Projects In Design`,
      icon: Paintbrush,
      color: isDark ? 'text-[#BBA8E8]' : 'text-purple-600',
      bgColor: isDark ? 'bg-[#1E172A] border-[#3B2D54]' : 'bg-purple-50 border-purple-200',
      actionPage: 'design' as const,
    },
    {
      id: 'shell-plan-approved',
      title: '4. Latest Approved Shell Plan',
      count: stageCounts.shellApprovedProjects.length,
      subtitle: `${stageCounts.shellApprovedProjects.length} Shell Plans Confirmed`,
      icon: CalendarCheck,
      color: isDark ? 'text-[#70D0A8]' : 'text-emerald-600',
      bgColor: isDark ? 'bg-[#12221B] border-[#244636]' : 'bg-emerald-50 border-emerald-200',
      actionPage: 'projects' as const,
    },
    {
      id: 'under-production',
      title: '5. Under Production',
      count: stageCounts.underProdProjects.length,
      subtitle: `${stageCounts.underProdProjects.length} Active In Factory`,
      icon: Factory,
      color: isDark ? 'text-[#4BA7A7]' : 'text-teal-600',
      bgColor: isDark ? 'bg-[#112020] border-[#224040]' : 'bg-teal-50 border-teal-200',
      actionPage: 'production' as const,
    },
    {
      id: 'prod-completed-awaiting-dispatch',
      title: '6. Prod Completed Awaiting Dispatch',
      count: stageCounts.awaitingDispatchProjects.length,
      subtitle: `${stageCounts.awaitingDispatchProjects.length} Ready for Loading`,
      icon: PackageCheck,
      color: isDark ? 'text-[#E5C47A]' : 'text-yellow-600',
      bgColor: isDark ? 'bg-[#242114] border-[#443D23]' : 'bg-yellow-50 border-yellow-200',
      actionPage: 'production' as const,
    },
    {
      id: 'dispatch-completed',
      title: '7. Dispatch Completed',
      count: stageCounts.dispatchDoneProjects.length,
      subtitle: `${stageCounts.dispatchDoneProjects.length} Shipped / Delivered`,
      icon: Truck,
      color: isDark ? 'text-[#56A9C7]' : 'text-cyan-600',
      bgColor: isDark ? 'bg-[#101F26] border-[#1D3B48]' : 'bg-cyan-50 border-cyan-200',
      actionPage: 'shipment' as const,
    },
    {
      id: 'ongoing-site-support',
      title: '8. Ongoing Support at Site',
      count: stageCounts.siteSupportProjects.length,
      subtitle: `${stageCounts.siteSupportProjects.length} Site Supervision Active`,
      icon: Wrench,
      color: isDark ? 'text-[#3FB984]' : 'text-emerald-700',
      bgColor: isDark ? 'bg-[#0E241A] border-[#1B4633]' : 'bg-emerald-100/60 border-emerald-300',
      actionPage: 'projects' as const,
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
          {t('stagePipeline')}
        </h2>
        <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          Live operational classification across all 8 canonical project execution stages.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stages.map((stage, idx) => {
          const IconComp = stage.icon;
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate(stage.actionPage)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md ${stage.bgColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg border ${
                  isDark ? 'bg-[#151517] border-white/10' : 'bg-white border-black/10'
                } ${stage.color}`}>
                  <IconComp size={18} />
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border opacity-60 group-hover:opacity-100 transition-opacity ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-700'
                }`}>
                  <ArrowRight size={12} />
                </div>
              </div>

              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider block truncate ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                  {stage.title}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                    {stage.count}
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                    Projects
                  </span>
                </div>
                <p className={`text-[11px] font-medium mt-0.5 truncate ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  {stage.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
