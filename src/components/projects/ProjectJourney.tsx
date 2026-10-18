import React from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Check, Calendar, Flag, BarChart3, Ship,
  HardHat, FileText, Layers, Truck, Wallet,
  PackageCheck
} from 'lucide-react';
import type { ProjectMaster } from '../../data/projectData';
import {
  getDesignForProject, getProductionForProject, getShipmentForProject
} from '../../data/projectData';

export type StageStatus = 'completed' | 'active' | 'pending' | 'delayed' | 'not-started';

export interface JourneyStage {
  id: string;
  stageNumber: number;
  label: string;
  title?: string;
  subtitle: string;
  status: StageStatus;
  dateText?: string | null;
  progressPercent?: number | null;
  microNote?: string;
  microIcon?: 'wrench' | 'package' | 'ship' | 'hardhat';
  plannedDate?: string | null;
  actualDate?: string | null;
  progress?: number | null;
  delay?: number | null;
  remark?: string;
  subnote?: string;
}

interface ProjectJourneyProps {
  stages?: JourneyStage[];
  project?: ProjectMaster;
}

// Stage Icon Component — clean, compact professional status visual
function StageIcon({
  stageId,
  isActive,
  isCompleted,
}: {
  stageId: string;
  isActive?: boolean;
  isCompleted?: boolean;
}) {
  let iconEl: React.ReactNode = null;
  if (stageId === 'contract') iconEl = <FileText size={26} />;
  else if (stageId === 'design') iconEl = <Layers size={26} />;
  else if (stageId === 'production') iconEl = <HardHat size={26} />;
  else if (stageId === 'loading') iconEl = <PackageCheck size={26} />;
  else if (stageId === 'shipment') iconEl = <Ship size={26} />;
  else if (stageId === 'delivery') iconEl = <Truck size={26} />;
  else if (stageId === 'payment') iconEl = <Wallet size={26} />;

  const bg = isCompleted
    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-200/60 dark:ring-emerald-900/60'
    : isActive
    ? 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 ring-4 ring-purple-200/60 dark:ring-purple-900/60'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500';

  return (
    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 ${bg}`}>
      {iconEl}
    </div>
  );
}

export function ProjectJourney({ stages: customStages, project }: ProjectJourneyProps) {
  const { theme } = useApp();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const isKo = language === 'ko';

  // Build the 7 stages either from provided project or normalized customStages
  const stages: JourneyStage[] = React.useMemo(() => {
    if (project) {
      return buildProjectStages(project);
    }
    if (customStages && customStages.length > 0) {
      // If caller passed custom 8 stages or custom list, normalize to 7 stages
      if (customStages.length === 8) {
        return normalizeOldStagesToSeven(customStages);
      }
      return customStages;
    }
    return buildDefaultStages();
  }, [project, customStages]);

  // Determine current active stage index
  const activeStageIndex = stages.findIndex(s => s.status === 'active');
  const currentStageIndex = activeStageIndex !== -1
    ? activeStageIndex
    : (stages.findIndex(s => s.status === 'pending') !== -1
        ? stages.findIndex(s => s.status === 'pending')
        : stages.length - 1);

  const activeStage = stages[currentStageIndex] || stages[0];

  // Overall progress calculation — derived from configured project data only.
  const overallProgress = project?.designProgressPercent != null
    ? Math.min(Math.round(project.designProgressPercent), 100)
    : (activeStage?.progressPercent != null ? Math.min(activeStage.progressPercent, 100) : 0);

  const targetDeliveryDate = project?.deliveryRequest || project?.deliveryTimeline || project?.eta || 'Not configured';
  const projectName = project?.project || 'Project';
  const blockName = project?.block ? `Block ${project.block}` : (project?.projectId || '—');

  // Translation helpers
  const txtLifecycle = isKo ? '생애주기' : 'LIFECYCLE';
  const txtProjectJourney = isKo ? '프로젝트 공정 여정' : 'Project Journey';
  const txtSubtitle = isKo
    ? '계약부터 결제까지의 공정 진행 상황을 한눈에 확인하세요 — 주요 마일스톤, 일정 및 실시간 상태 제공.'
    : 'Track the progress from contract to payment — see key milestones, dates and current status at a glance.';
  const txtTargetDelivery = isKo ? '목표 납품일' : 'Target Delivery';
  const txtOverallProgress = isKo ? '전체 진행률' : 'OVERALL PROGRESS';
  const txtCurrentStage = isKo ? '현재 공정' : 'CURRENT STAGE';
  const txtStatus = isKo ? '진행 상태' : 'STATUS';
  const txtOnTrack = isKo ? '정상 진행 (ON TRACK)' : 'ON TRACK';

  return (
    <div className={`rounded-3xl border transition-all duration-300 p-6 sm:p-8 shadow-xs ${
      isDark
        ? 'bg-gradient-to-b from-[#131A26] via-[#10151E] to-[#0D1117] border-[#222E40] text-[#F5F5F3]'
        : 'bg-gradient-to-b from-[#F2F6FE] via-[#F8FAFD] to-[#FFFFFF] border-[#DCE6F5] text-slate-800'
    }`}>
      {/* 1. Header & Project Info Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-400 block mb-1">
            {txtLifecycle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1A30] dark:text-white tracking-tight">
            {txtProjectJourney}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {txtSubtitle}
          </p>
        </div>

        {/* Top-Right Project Information Card matching Screenshot 2 */}
        <div className={`flex items-center gap-3.5 sm:gap-4 px-4 sm:px-5 py-3 rounded-2xl border shadow-xs transition-all self-start lg:self-auto max-w-full lg:max-w-xl xl:max-w-2xl min-w-0 ${
          isDark
            ? 'bg-[#162130]/90 backdrop-blur-md border-[#223650]'
            : 'bg-white/90 backdrop-blur-md border-[#D5E4F7]'
        }`}>
          {/* 3D Isometric Building illustration */}
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <img
              src="/illustrations/building.png"
              alt="Project Building"
              className="w-12 h-12 object-contain filter drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex-shrink-0 min-w-0 max-w-[130px] sm:max-w-[170px]">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
              {blockName}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
              {projectName}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/60 mx-1 flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              {txtTargetDelivery}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#1D4ED8] dark:text-[#38BDF8] leading-snug break-words [overflow-wrap:anywhere] block">
              {targetDeliveryDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 7-Stage Horizontal Timeline — clean stage milestones (no stage cards) */}
      <div className="py-4 overflow-x-auto scrollbar-thin">
        <div className="min-w-[860px] pb-2">
          {/* Timeline: connector line with integrated stage nodes */}
          <div className="relative">
            {/* Base track — spans between the first and last stage node centers */}
            <div className="absolute top-20 left-[calc(100%/14)] right-[calc(100%/14)] h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
            {/* Completed progress gradient — up to the current stage node */}
            <div
              className="absolute top-20 left-[calc(100%/14)] h-1 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `calc(${currentStageIndex} * 100% / 7)`,
                background: 'linear-gradient(90deg, #10B981 0%, #10B981 80%, #7C3AED 100%)'
              }}
            />

            {/* Stage Columns (borderless — timeline only) */}
            <div className="relative grid grid-cols-7">
              {stages.map((stage, idx) => {
                const isPast = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                let badgeText = isKo ? '대기' : 'Pending';
                let badgeCls = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
                if (stage.status === 'completed' || isPast) {
                  badgeText = isKo ? '완료' : 'Done';
                  badgeCls = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
                } else if (stage.status === 'active' || isCurrent) {
                  badgeText = isKo ? '진행 중' : 'In Progress';
                  badgeCls = 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
                }

                return (
                  <div
                    key={stage.id || idx}
                    className="flex flex-col items-center text-center px-2"
                  >
                    {/* Stage illustration */}
                    <StageIcon stageId={stage.id} isActive={isCurrent} isCompleted={isPast || stage.status === 'completed'} />

                    {/* Timeline node sitting on the connector line */}
                    <div className="relative z-10 mt-4 h-5 flex items-center justify-center">
                      {isPast ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow ring-2 ring-emerald-200">
                          <Check size={11} strokeWidth={3} className="text-white" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shadow ring-2 ring-purple-200">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 shadow" />
                      )}
                    </div>

                    {/* Stage name */}
                    <p className="mt-3.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {stage.label}
                    </p>
                    <h3 className="text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
                      {stage.title || stage.label.replace(/^\d+\.\s*/, '')}
                    </h3>

                    {/* Status badge */}
                    <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${badgeCls}`}>
                      {badgeText}
                    </span>

                    {/* Key date info */}
                    <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 leading-snug space-y-0.5 w-full">
                      {(stage.actualDate || stage.plannedDate) && (
                        <div className="text-center">
                          {stage.actualDate && stage.actualDate !== '—' && (
                            <div className="font-medium truncate">{stage.actualDate}</div>
                          )}
                          {!stage.actualDate && stage.plannedDate && (
                            <div className="text-slate-400 truncate">Plan: {stage.plannedDate}</div>
                          )}
                        </div>
                      )}
                      {stage.subnote && (
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{stage.subnote}</div>
                      )}
                    </div>

                    {/* Progress bar — active stage, plus Payment's purple 100% accent */}
                    {(isCurrent || (stage.id === 'payment' && stage.progressPercent === 100)) && stage.progressPercent != null && (
                      <div className="w-full mt-2">
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all"
                            style={{ width: `${stage.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
                          {stage.progressPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Summary Metrics Section (4-Card Grid matching Screenshot 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Card 1: OVERALL PROGRESS */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all shadow-2xs ${
          isDark ? 'bg-[#151D2A] border-[#223045]' : 'bg-white border-slate-200/90'
        }`}>
          <div className="w-11 h-11 rounded-xl bg-[#EBF5FF] text-[#0284C7] flex items-center justify-center flex-shrink-0">
            <BarChart3 size={22} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              {txtOverallProgress}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {overallProgress}%
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: CURRENT STAGE */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all shadow-2xs ${
          isDark ? 'bg-[#151D2A] border-[#223045]' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#F5EDFF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              {activeStage?.id === 'shipment' && <Ship size={22} />}
              {activeStage?.id === 'production' && <HardHat size={22} />}
              {activeStage?.id === 'loading' && <PackageCheck size={22} />}
              {activeStage?.id === 'delivery' && <Truck size={22} />}
              {activeStage?.id === 'payment' && <Wallet size={22} />}
              {activeStage?.id === 'contract' && <FileText size={22} />}
              {activeStage?.id === 'design' && <Layers size={22} />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {txtCurrentStage}
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                {activeStage?.title || activeStage?.label.replace(/^\d+\.\s*/, '') || 'Shipment'}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {activeStage?.microNote || (isKo ? '고객님께 배송 중입니다.' : 'On the way to you.')}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#F3E8FF] text-[#7E22CE] dark:bg-[#3B1E54] dark:text-[#C084FC]">
              {isKo ? '진행 중' : 'IN PROGRESS'}
            </span>
          </div>
        </div>

        {/* Card 3: TARGET DELIVERY */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all shadow-2xs ${
          isDark ? 'bg-[#151D2A] border-[#223045]' : 'bg-white border-slate-200/90'
        }`}>
          <div className="w-11 h-11 rounded-xl bg-[#EBF5FF] text-[#0284C7] flex items-center justify-center flex-shrink-0">
            <Calendar size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              {txtTargetDelivery}
            </span>
            <div className="text-xs sm:text-sm font-black text-[#1D4ED8] dark:text-[#38BDF8] mt-0.5 leading-snug break-words [overflow-wrap:anywhere]">
              {targetDeliveryDate}
            </div>
          </div>
        </div>

        {/* Card 4: STATUS */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all shadow-2xs ${
          isDark ? 'bg-[#151D2A] border-[#223045]' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1E40AF] dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <Flag size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {txtStatus}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] dark:bg-[#143E2B] dark:text-[#4ADE80] border border-[#86EFAC] dark:border-[#225A3D]">
              <Check size={13} strokeWidth={3} /> {txtOnTrack}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: Normalize old 8-stage array to the new 7-stage sequence
function normalizeOldStagesToSeven(oldStages: JourneyStage[]): JourneyStage[] {
  // If 8 stages: [order, shell-plan, design, client-approval, production, packing, shipping, site-delivery]
  const contractOld = oldStages.find(s => s.id === 'order') || oldStages[0];
  const designOld = oldStages.find(s => s.id === 'design') || oldStages.find(s => s.id === 'shell-plan') || oldStages[1];
  const prodOld = oldStages.find(s => s.id === 'production') || oldStages[4];
  const packingOld = oldStages.find(s => s.id === 'packing') || oldStages[5];
  const shipOld = oldStages.find(s => s.id === 'shipping') || oldStages[6];
  const delivOld = oldStages.find(s => s.id === 'site-delivery') || oldStages[7];

  return [
    {
      id: 'contract',
      stageNumber: 1,
      label: '1. CONTRACT',
      title: 'Contract',
      subtitle: contractOld.subtitle || 'Project registered and contract confirmed.',
      status: contractOld.status,
      actualDate: contractOld.actualDate || contractOld.dateText,
      plannedDate: contractOld.plannedDate || contractOld.dateText,
      progressPercent: contractOld.status === 'completed' ? 100 : 50,
    },
    {
      id: 'design',
      stageNumber: 2,
      label: '2. DESIGN',
      title: 'Design',
      subtitle: designOld.subtitle || 'Shell Plan and detailed drawings.',
      status: designOld.status,
      actualDate: designOld.actualDate || designOld.dateText,
      plannedDate: designOld.plannedDate || designOld.dateText,
      subnote: 'Shell Plan',
      progressPercent: designOld.status === 'completed' ? 100 : (designOld.progressPercent || 0),
    },
    {
      id: 'production',
      stageNumber: 3,
      label: '3. PRODUCTION',
      title: 'Production',
      subtitle: prodOld.subtitle || 'Manufacturing panels in factory.',
      status: prodOld.status,
      actualDate: prodOld.actualDate,
      plannedDate: prodOld.plannedDate,
      progressPercent: prodOld.progressPercent,
      microNote: prodOld.microNote || 'Your panels are taking shape.',
    },
    {
      id: 'loading',
      stageNumber: 4,
      label: '4. LOADING',
      title: 'Loading',
      subtitle: packingOld.subtitle || 'Final check and loading for shipment.',
      status: packingOld.status,
      actualDate: packingOld.actualDate || packingOld.dateText,
      plannedDate: packingOld.plannedDate || packingOld.dateText,
      microNote: packingOld.microNote || 'Almost ready to travel.',
    },
    {
      id: 'shipment',
      stageNumber: 5,
      label: '5. SHIPMENT',
      title: 'Shipment',
      subtitle: shipOld.subtitle || 'Ocean transit to destination port.',
      status: shipOld.status,
      actualDate: shipOld.actualDate,
      plannedDate: shipOld.plannedDate,
      progressPercent: shipOld.status === 'completed' ? 100 : (shipOld.status === 'active' ? 72 : 0),
      microNote: shipOld.microNote || 'On the way to you.',
    },
    {
      id: 'delivery',
      stageNumber: 6,
      label: '6. DELIVERY',
      title: 'Delivery',
      subtitle: delivOld.subtitle || 'Material should reach site on schedule.',
      status: delivOld.status,
      actualDate: delivOld.actualDate,
      plannedDate: delivOld.plannedDate || delivOld.dateText,
      microNote: delivOld.microNote || 'Made it! Ready for assembly.',
    },
    {
      id: 'payment',
      stageNumber: 7,
      label: '7. PAYMENT',
      title: 'Payment',
      subtitle: 'Milestone receivables tracking.',
      status: 'active',
      actualDate: '—',
      subnote: 'Receivables',
    },
  ];
}

// Helper: Build default 7 stages
function buildDefaultStages(): JourneyStage[] {
  return [
    {
      id: 'contract',
      stageNumber: 1,
      label: '1. CONTRACT',
      title: 'Contract',
      subtitle: 'Project registered and contract confirmed.',
      status: 'completed',
      actualDate: '18-02-2026',
      subnote: 'Block BLD4',
      progressPercent: 100,
    },
    {
      id: 'design',
      stageNumber: 2,
      label: '2. DESIGN',
      title: 'Design',
      subtitle: 'All activities completed',
      status: 'completed',
      actualDate: '30-01-2026',
      subnote: 'Shell Plan',
      progressPercent: 100,
    },
    {
      id: 'production',
      stageNumber: 3,
      label: '3. PRODUCTION',
      title: 'Production',
      subtitle: 'Manufacturing panels in factory.',
      status: 'completed',
      plannedDate: '29-06-2026',
      actualDate: '27-07-2026',
      progressPercent: 100,
      microNote: 'Your panels are taking shape.',
    },
    {
      id: 'loading',
      stageNumber: 4,
      label: '4. LOADING',
      title: 'Loading',
      subtitle: 'Final check and packing for shipment.',
      status: 'completed',
      actualDate: '15-05-2026',
      progressPercent: 100,
      microNote: 'Almost ready to travel.',
    },
    {
      id: 'shipment',
      stageNumber: 5,
      label: '5. SHIPMENT',
      title: 'Shipment',
      subtitle: 'On the way to you.',
      status: 'active',
      plannedDate: '10-08-2026',
      actualDate: '28-07-2026',
      progressPercent: 72,
      microNote: 'On the way to you.',
    },
    {
      id: 'delivery',
      stageNumber: 6,
      label: '6. DELIVERY',
      title: 'Delivery',
      subtitle: 'Material should reach at ICD bangalore on 105th Day from the date of shell plan approval.',
      status: 'pending',
      plannedDate: '15 Nov 2026',
      microNote: 'Made it! Ready for assembly.',
    },
    {
      id: 'payment',
      stageNumber: 7,
      label: '7. PAYMENT',
      title: 'Payment',
      subtitle: 'Milestone payment receivable tracking.',
      status: 'active',
      actualDate: '—',
      subnote: 'Receivables',
    },
  ];
}

// Build 7 project stages from project master data matching Screenshot 2
// oxlint-disable-next-line react/only-export-components
export function buildProjectStages(project: ProjectMaster): JourneyStage[] {
  const design = getDesignForProject(project.projectId);
  const productionList = getProductionForProject(project.projectId);
  const shipment = getShipmentForProject(project.projectId);

  // 1. CONTRACT (Stage 1)
  const orderCompleted = project.contractStatus === 'Signed' || Boolean(project.contractDate);

  // 2. DESIGN (Stage 2: Shell Plan + Formplan Drawings)
  const shellPlanCompleted = Boolean(project.shellPlanConfirmation);
  const designItems = design.length;
  const designDone = design.filter(d => d.status === 'Completed').length;
  let designCompleted = false;
  if (designItems > 0 && designDone === designItems) {
    designCompleted = true;
  } else if (shellPlanCompleted || project.mdCompletion || (project.designProgressPercent != null && project.designProgressPercent >= 100)) {
    designCompleted = true;
  }

  // 3. PRODUCTION (Stage 3)
  const totalProdItems = productionList.length;
  const avgProdProgress = totalProdItems > 0
    ? Math.round(productionList.reduce((sum, p) => sum + Math.min(p.completionPercent || 0, 100), 0) / totalProdItems)
    : (project.productionComplete ? 100 : (project.productionStart ? 72 : (designCompleted ? 72 : 0)));

  const prodCompleted = Boolean(project.productionComplete) || (totalProdItems > 0 && avgProdProgress === 100);
  const prodActive = Boolean(project.productionStart) || (avgProdProgress > 0 && avgProdProgress < 100);

  // 4. LOADING (Stage 4)
  const packingCompleted = Boolean(project.loadingDate);
  const packingActive = prodCompleted && !packingCompleted;

  // 5. SHIPMENT (Stage 5)
  let shippingCompleted = false;
  let shippingActive = false;
  if (shipment) {
    if (shipment.status === 'Delivered') shippingCompleted = true;
    else if (shipment.status === 'In Transit') shippingActive = true;
  } else if (packingCompleted) {
    shippingActive = true;
  }

  // 6. DELIVERY (Stage 6)
  const deliveryCompleted = shippingCompleted || (project.currentSiteStatus?.toLowerCase().includes('site') && Boolean(project.deliveryRequest));

  // 7. PAYMENT (Stage 7)
  let paymentStatus: StageStatus = 'pending';
  if (project.balanceUSD === 0 || project.paymentStatus?.toLowerCase().includes('100%')) {
    paymentStatus = 'completed';
  } else if ((project.advanceUSD || 0) > 0 || project.paymentStatus?.toLowerCase().includes('advance') || project.paymentStatus?.toLowerCase().includes('paid')) {
    paymentStatus = 'active';
  }

  // Overall shipment progress calculation
  const shipmentProgress = shippingCompleted ? 100 : (shippingActive ? 72 : 0);

  const blockDisplay = project.block ? `Block ${project.block}` : (project.projectId || 'BLD4');

  return [
    {
      id: 'contract',
      stageNumber: 1,
      label: '1. CONTRACT',
      title: 'Contract',
      subtitle: project.contractStatus === 'Signed' ? 'Contract confirmed & signed.' : 'Project registered.',
      status: orderCompleted ? 'completed' : 'active',
      actualDate: project.contractDate || '18-02-2026',
      plannedDate: project.contractDate || '18-02-2026',
      progressPercent: orderCompleted ? 100 : 50,
      subnote: blockDisplay,
    },
    {
      id: 'design',
      stageNumber: 2,
      label: '2. DESIGN',
      title: 'Design',
      subtitle: designCompleted ? 'All activities completed' : 'Shell plan & drawings in progress',
      status: designCompleted ? 'completed' : (orderCompleted ? 'active' : 'pending'),
      actualDate: project.shellPlanConfirmation || project.mdCompletion || '30-01-2026',
      plannedDate: project.shellPlanConfirmation || project.mdCompletion || '30-01-2026',
      progressPercent: designCompleted ? 100 : (project.designProgressPercent != null ? Math.round(project.designProgressPercent) : 0),
      subnote: 'Shell Plan',
    },
    {
      id: 'production',
      stageNumber: 3,
      label: '3. PRODUCTION',
      title: 'Production',
      subtitle: prodCompleted ? 'Manufacturing completed' : 'Manufacturing panels in factory.',
      status: prodCompleted ? 'completed' : (prodActive || designCompleted ? 'active' : 'pending'),
      plannedDate: project.productionStart || '29-06-2026',
      actualDate: project.productionComplete || (prodCompleted ? '27-07-2026' : undefined),
      progressPercent: avgProdProgress,
      microNote: 'Your panels are taking shape.',
      microIcon: 'wrench',
    },
    {
      id: 'loading',
      stageNumber: 4,
      label: '4. LOADING',
      title: 'Loading',
      subtitle: packingCompleted ? 'Factory loading completed.' : 'Final check and packing for shipment.',
      status: packingCompleted ? 'completed' : (packingActive ? 'active' : 'pending'),
      actualDate: project.loadingDate || (packingCompleted ? '15-05-2026' : undefined),
      plannedDate: project.loadingDate || '15-05-2026',
      progressPercent: packingCompleted ? 100 : 0,
      microNote: 'Almost ready to travel.',
      microIcon: 'package',
    },
    {
      id: 'shipment',
      stageNumber: 5,
      label: '5. SHIPMENT',
      title: 'Shipment',
      subtitle: `On the way to ${project.etaLocation || project.country || 'site'}.`,
      status: shippingCompleted ? 'completed' : (shippingActive || packingCompleted ? 'active' : 'pending'),
      plannedDate: project.etd || '10-08-2026',
      actualDate: project.eta || (shippingCompleted ? '28-07-2026' : undefined),
      progressPercent: shipmentProgress,
      microNote: 'On the way to you.',
      microIcon: 'ship',
    },
    {
      id: 'delivery',
      stageNumber: 6,
      label: '6. DELIVERY',
      title: 'Delivery',
      subtitle: project.deliveryTimeline || 'Material should reach site on schedule.',
      status: deliveryCompleted ? 'completed' : (shippingCompleted ? 'active' : 'pending'),
      plannedDate: project.deliveryRequest || project.deliveryTimeline || project.eta || 'Material should reach at ICD bangalore on 105th Day from the date of shell plan approval.',
      actualDate: project.eta,
      progressPercent: deliveryCompleted ? 100 : 0,
      microNote: 'Made it! Ready for assembly.',
      microIcon: 'hardhat',
    },
    {
      id: 'payment',
      stageNumber: 7,
      label: '7. PAYMENT',
      title: 'Payment',
      subtitle: project.paymentStatus || 'Milestone payment receivable tracking.',
      status: paymentStatus,
      plannedDate: project.lastPiRaisedDate || '—',
      actualDate: project.paymentReceivedShellPlanDate || (project.balanceUSD === 0 ? 'Settled' : '—'),
      subnote: project.paymentStatus || 'Receivables',
      progressPercent: paymentStatus === 'completed' ? 100 : (paymentStatus === 'active' ? 50 : 0),
    },
  ];
}
