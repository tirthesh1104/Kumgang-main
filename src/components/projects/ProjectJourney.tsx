import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2, Circle, AlertTriangle
} from 'lucide-react';

type StageStatus = 'completed' | 'active' | 'pending' | 'delayed' | 'not-started';

interface JourneyStage {
  id: string;
  label: string;
  status: StageStatus;
  plannedDate?: string | null;
  actualDate?: string | null;
  progress?: number | null;
  delay?: number | null;
  remark?: string;
}

interface ProjectJourneyProps {
  stages: JourneyStage[];
}

const darkStageStatusConfig: Record<StageStatus, { color: string; bg: string; ring: string; iconColor: string }> = {
  completed: {
    color: 'text-[#70D0A8]',
    bg: 'bg-[#163127]',
    ring: 'ring-2 ring-[#28523F]',
    iconColor: 'text-[#70D0A8]',
  },
  active: {
    color: 'text-[#BBA8E8]',
    bg: 'bg-[#251F32]',
    ring: 'ring-2 ring-[#42375A]',
    iconColor: 'text-[#BBA8E8]',
  },
  delayed: {
    color: 'text-[#F08A8A]',
    bg: 'bg-[#34191B]',
    ring: 'ring-2 ring-[#5A292B]',
    iconColor: 'text-[#F08A8A]',
  },
  pending: {
    color: 'text-[#85858B]',
    bg: 'bg-[#18181B]',
    ring: 'ring-1 ring-[#262629]',
    iconColor: 'text-[#85858B]',
  },
  'not-started': {
    color: 'text-[#65656B]',
    bg: 'bg-[#111113]',
    ring: 'ring-1 ring-[#202023]',
    iconColor: 'text-[#65656B]',
  },
};

const lightStageStatusConfig: Record<StageStatus, { color: string; bg: string; ring: string; iconColor: string }> = {
  completed: {
    color: 'text-[#137333]',
    bg: 'bg-[#E6F4EA]',
    ring: 'ring-2 ring-[#CEEAD6]',
    iconColor: 'text-[#137333]',
  },
  active: {
    color: 'text-[#6D28D9]',
    bg: 'bg-[#F3E8FF]',
    ring: 'ring-2 ring-[#E9D5FF]',
    iconColor: 'text-[#6D28D9]',
  },
  delayed: {
    color: 'text-[#C5221F]',
    bg: 'bg-[#FCE8E6]',
    ring: 'ring-2 ring-[#FAD2CF]',
    iconColor: 'text-[#C5221F]',
  },
  pending: {
    color: 'text-[#64748B]',
    bg: 'bg-[#F1F5F9]',
    ring: 'ring-1 ring-[#CBD5E1]',
    iconColor: 'text-[#64748B]',
  },
  'not-started': {
    color: 'text-[#94A3B8]',
    bg: 'bg-[#F8FAFC]',
    ring: 'ring-1 ring-[#E2E8F0]',
    iconColor: 'text-[#94A3B8]',
  },
};

function StageNode({ stage, index, isLast }: { stage: JourneyStage; index: number; isLast: boolean }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const cfgMap = isDark ? darkStageStatusConfig : lightStageStatusConfig;
  const cfg = cfgMap[stage.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.ring}`}>
          {stage.status === 'completed' ? (
            <CheckCircle2 size={18} className={cfg.iconColor} />
          ) : stage.status === 'delayed' ? (
            <AlertTriangle size={16} className={cfg.iconColor} />
          ) : stage.status === 'active' ? (
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isDark ? 'bg-[#9A82D4]' : 'bg-[#7C3AED]'}`} />
          ) : (
            <Circle size={14} className={cfg.iconColor} />
          )}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 mt-1 mb-1 ${isDark ? 'bg-[#262629]' : 'bg-[#E2E8F0]'}`} style={{ minHeight: 24 }} />}
      </div>

      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-sm font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>{stage.label}</span>
          {stage.status === 'completed' && (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
              isDark ? 'text-[#70D0A8] bg-[#163127] border-[#28523F]' : 'text-[#137333] bg-[#E6F4EA] border-[#CEEAD6]'
            }`}>Done</span>
          )}
          {stage.status === 'active' && (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
              isDark ? 'text-[#BBA8E8] bg-[#251F32] border-[#42375A]' : 'text-[#6D28D9] bg-[#F3E8FF] border-[#E9D5FF]'
            }`}>In Progress</span>
          )}
          {stage.status === 'delayed' && (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
              isDark ? 'text-[#F08A8A] bg-[#34191B] border-[#5A292B]' : 'text-[#C5221F] bg-[#FCE8E6] border-[#FAD2CF]'
            }`}>
              Delayed
            </span>
          )}
          {(stage.status === 'pending' || stage.status === 'not-started') && (
            <span className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>Pending</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          {stage.plannedDate && (
            <div>
              <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>Planned: </span>
              <span className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>{stage.plannedDate}</span>
            </div>
          )}
          {stage.actualDate ? (
            <div>
              <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>Actual: </span>
              <span className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>{stage.actualDate}</span>
            </div>
          ) : (stage.status !== 'not-started' && stage.status !== 'pending') ? (
            <div>
              <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>Actual: </span>
              <span className={`font-medium ${isDark ? 'text-[#65656B]' : 'text-[#94A3B8]'}`}>—</span>
            </div>
          ) : null}
          {stage.progress != null && stage.status !== 'not-started' && (
            <div>
              <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>Progress: </span>
              <span className={`font-semibold ${
                stage.status === 'delayed' 
                  ? (isDark ? 'text-[#F08A8A]' : 'text-[#C5221F]') 
                  : (isDark ? 'text-[#70D0A8]' : 'text-[#137333]')
              }`}>
                {stage.progress}%
              </span>
            </div>
          )}
          {stage.remark && (
            <div className={`col-span-2 italic mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>{stage.remark}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectJourney({ stages }: ProjectJourneyProps) {
  return (
    <div className="space-y-0">
      {stages.map((stage, i) => (
        <StageNode key={stage.id} stage={stage} index={i} isLast={i === stages.length - 1} />
      ))}
    </div>
  );
}


// Build stages from project data
import type { ProjectMaster } from '../../data/projectData';
import {
  getDesignForProject, getProductionForProject, getShipmentForProject, getPaymentsForProject
} from '../../data/projectData';

export function buildProjectStages(project: ProjectMaster): JourneyStage[] {
  const design = getDesignForProject(project.projectId);
  const productionList = getProductionForProject(project.projectId);
  const shipment = getShipmentForProject(project.projectId);
  const payments = getPaymentsForProject(project.projectId);

  // Design status
  const designItems = design.length;
  const designDone = design.filter(d => d.status === 'Completed').length;
  let designStatus: StageStatus = 'not-started';
  if (designItems > 0) {
    if (designDone === designItems) designStatus = 'completed';
    else designStatus = 'active';
  } else if (project.shellPlanConfirmation) {
    designStatus = 'active'; // Some design activity exists
  }
  const progressPercent = project.designProgressPercent != null ? Math.round(project.designProgressPercent) : null;

  // Production status
  let prodStatus: StageStatus = 'not-started';
  if (project.productionComplete) prodStatus = 'completed';
  else if (project.productionStart) prodStatus = 'active';
  else if (productionList.length > 0) {
    const isCompleted = productionList.every(p => p.completionPercent === 100);
    const inProgress = productionList.some(p => (p.completionPercent || 0) > 0);
    if (isCompleted) prodStatus = 'completed';
    else if (inProgress) prodStatus = 'active';
    else prodStatus = 'pending';
  } else if (designStatus === 'completed') prodStatus = 'pending';

  const totalProdItems = productionList.length;
  const avgProdProgress = totalProdItems > 0 
    ? Math.round(productionList.reduce((sum, p) => sum + Math.min(p.completionPercent || 0, 100), 0) / totalProdItems) 
    : null;

  // Loading
  let loadingStatus: StageStatus = 'not-started';
  if (project.loadingDate) loadingStatus = 'completed';
  else if (prodStatus === 'completed') loadingStatus = 'pending';

  // Shipment
  let shipStatus: StageStatus = 'not-started';
  if (shipment) {
    if (shipment.status === 'Delivered') shipStatus = 'completed';
    else if (shipment.status === 'In Transit') shipStatus = 'active';
    else shipStatus = 'pending';
  }

  // Delivery
  let deliveryStatus: StageStatus = 'not-started';
  if (shipStatus === 'completed' || project.paymentStatus?.toLowerCase().includes('100%')) deliveryStatus = 'completed';
  else if (shipStatus === 'active') deliveryStatus = 'pending';

  // Payment
  let payStatus: StageStatus = 'not-started';
  const is100Paid = project.paymentStatus?.toLowerCase().includes('100%');
  const hasBalance = (project.balanceUSD || 0) > 0;
  
  if (is100Paid) payStatus = 'completed';
  else if (hasBalance) payStatus = 'delayed'; // Outstanding balance
  else if (payments.length > 0 || project.advanceUSD) payStatus = 'active';
  else payStatus = 'pending';

  return [
    {
      id: 'contract',
      label: 'Contract',
      status: project.contractStatus === 'Signed' ? 'completed' : 'pending',
      actualDate: project.contractDate,
      remark: project.block ? `Block ${project.block}` : undefined,
    },
    {
      id: 'design',
      label: 'Design',
      status: designStatus,
      progress: progressPercent,
      actualDate: project.shellPlanConfirmation ? `Shell Plan: ${project.shellPlanConfirmation}` : undefined,
      remark: designDone === designItems && designItems > 0 ? 'All activities completed' : undefined,
    },
    {
      id: 'production',
      label: 'Production',
      status: prodStatus,
      plannedDate: project.productionStart ? `Start: ${project.productionStart}` : undefined,
      actualDate: project.productionComplete,
      progress: avgProdProgress,
    },
    {
      id: 'loading',
      label: 'Loading',
      status: loadingStatus,
      actualDate: project.loadingDate ?? undefined,
    },
    {
      id: 'shipment',
      label: 'Shipment',
      status: shipStatus,
      plannedDate: shipment?.etd || project.etd,
      actualDate: shipment?.eta || project.eta,
    },
    {
      id: 'delivery',
      label: 'Delivery',
      status: deliveryStatus,
      plannedDate: project.deliveryRequest,
      remark: shipment?.deliveryTimeline || undefined,
    },
    {
      id: 'payment',
      label: 'Payment',
      status: payStatus,
      remark: project.paymentStatus || undefined,
    },
  ];
}
