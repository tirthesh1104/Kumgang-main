import React, { useState } from 'react';
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

// Stage 3D Illustration Component
function StageIllustration({
  stageId,
  stageNumber,
  isActive
}: {
  stageId: string;
  stageNumber: number;
  isActive?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  // Map stage IDs to high-quality 3D illustrated assets
  const illustrationSrc = `/illustrations/${stageId}.png`;

  if (imageError) {
    // Fallback if image fails to load
    return (
      <div className={`w-24 h-24 mx-auto rounded-2xl flex flex-col items-center justify-center p-2 transition-transform duration-300 hover:scale-105 ${
        isActive ? 'bg-purple-500/10 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
      }`}>
        {stageId === 'contract' && <FileText size={32} />}
        {stageId === 'design' && <Layers size={32} />}
        {stageId === 'production' && <HardHat size={32} />}
        {stageId === 'loading' && <PackageCheck size={32} />}
        {stageId === 'shipment' && <Ship size={32} />}
        {stageId === 'delivery' && <Truck size={32} />}
        {stageId === 'payment' && <Wallet size={32} />}
      </div>
    );
  }

  return (
    <div className="w-28 h-28 mx-auto flex items-end justify-center relative select-none">
      <img
        src={illustrationSrc}
        alt={`Stage ${stageNumber}`}
        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:scale-105"
        onError={() => setImageError(true)}
        loading="eager"
      />
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

  // Overall progress calculation
  const overallProgress = project?.designProgressPercent != null
    ? Math.min(Math.round(project.designProgressPercent), 100)
    : (activeStage?.progressPercent != null ? activeStage.progressPercent : 72);

  const targetDeliveryDate = project?.deliveryRequest || project?.eta || '15 Nov 2026';
  const projectName = project?.project || 'Westlands Towers';
  const blockName = project?.block ? `Block ${project.block}` : (project?.projectId || 'BLD4');

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

      {/* 2. 7-Stage Horizontal Timeline Container */}
      <div className="py-6 overflow-x-auto scrollbar-thin">
        <div className="min-w-[940px] pt-4 pb-2">
          <div className="grid grid-cols-7 gap-3 sm:gap-4 relative">
            {/* Connected Progress Line behind step circles */}
            {/* The line sits right behind the circular milestone markers (row top ~ 124px) */}
            <div className="absolute top-[124px] left-[7.14%] right-[7.14%] h-[3px] -z-0">
              {/* Base background line */}
              <div className="absolute inset-0 bg-[#E2E8F0] dark:bg-slate-800 rounded-full" />
              {/* Progress active gradient fill */}
              <div
                className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #10B981 80%, #7C3AED 100%)'
                }}
              />
            </div>

            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              // Color badge definition matching Screenshot 2
              let badgeText = isKo ? '대기' : 'PENDING';
              let badgeClass = 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8]';

              if (stage.status === 'completed' || isPast) {
                badgeText = isKo ? '완료' : 'DONE';
                badgeClass = 'bg-[#DCFCE7] text-[#15803D] dark:bg-[#143E2B] dark:text-[#4ADE80]';
              } else if (stage.status === 'active' || isCurrent) {
                badgeText = isKo ? '진행 중' : 'IN PROGRESS';
                badgeClass = 'bg-[#F3E8FF] text-[#7E22CE] dark:bg-[#3B1E54] dark:text-[#C084FC]';
              }

              return (
                <div
                  key={stage.id || idx}
                  className="flex flex-col items-center text-center relative px-1 group"
                >
                  {/* Stage 3D Illustration Graphic */}
                  <div className="h-28 flex items-end justify-center mb-1 relative z-10">
                    <StageIllustration
                      stageId={stage.id}
                      stageNumber={stage.stageNumber}
                      isActive={isCurrent}
                    />
                  </div>

                  {/* Circular Milestone Marker along the connector line */}
                  <div className="h-7 flex items-center justify-center my-1 z-10 relative">
                    {stage.status === 'completed' || isPast ? (
                      <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs ring-4 ring-[#10B981]/20">
                        <Check size={13} strokeWidth={3.5} />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center ring-4 ring-[#7C3AED]/25 shadow-xs">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#94A3B8] text-white flex items-center justify-center ring-4 ring-[#94A3B8]/20 shadow-xs" />
                    )}
                  </div>

                  {/* Stage Title and Number */}
                  <div className="mt-2 w-full flex flex-col items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {stage.label}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0B1A30] dark:text-white mt-0.5 leading-tight">
                      {stage.title || stage.label.replace(/^\d+\.\s*/, '')}
                    </h3>

                    {/* Status Badge */}
                    <div className="mt-1.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>

                    {/* Dates & Micro Details */}
                    <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-snug space-y-0.5 min-h-[38px] flex flex-col items-center justify-center">
                      {stage.id === 'contract' && (
                        <>
                          <div>
                            <span className="font-semibold text-slate-500">Actual: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage.actualDate || project?.contractDate || '18-02-2026'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {stage.subnote || blockName}
                          </div>
                        </>
                      )}

                      {stage.id === 'design' && (
                        <>
                          <div>
                            <span className="font-semibold text-slate-500">Actual: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage.actualDate || project?.shellPlanConfirmation || project?.mdCompletion || '30-01-2026'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {stage.subnote || 'Shell Plan'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {stage.subtitle || 'All activities completed'}
                          </div>
                        </>
                      )}

                      {stage.id === 'production' && (
                        <>
                          <div>
                            <span className="font-semibold text-slate-500">Planned Start: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage.plannedDate || project?.productionStart || '29-06-2026'}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Actual: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage.actualDate || project?.productionComplete || '27-07-2026'}
                            </span>
                          </div>
                        </>
                      )}

                      {stage.id === 'loading' && (
                        <div>
                          <span className="font-semibold text-slate-500">Actual: </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {stage.actualDate || project?.loadingDate || '15-05-2026'}
                          </span>
                        </div>
                      )}

                      {stage.id === 'shipment' && (
                        <>
                          <div>
                            <span className="font-semibold text-slate-500">Planned: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage.plannedDate || project?.etd || '10-08-2026'}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Actual: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {stage.actualDate || project?.eta || '28-07-2026'}
                            </span>
                          </div>
                        </>
                      )}

                      {stage.id === 'delivery' && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 px-1 leading-snug">
                          {stage.plannedDate
                            ? `Planned: ${stage.plannedDate}`
                            : (project?.deliveryTimeline || 'Planned: Material should reach at ICD bangalore on 105th Day from the date of shell plan approval.')}
                        </div>
                      )}

                      {stage.id === 'payment' && (
                        <div>
                          <span className="font-semibold text-slate-500">Actual: </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {stage.actualDate || (project?.balanceUSD === 0 ? 'Settled' : '—')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Active Stage Progress Bar (e.g. Shipment 72% in Screenshot 2) */}
                    {isCurrent && stage.progressPercent != null && (
                      <div className="w-full max-w-[110px] mt-2 flex flex-col items-center">
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] transition-all duration-500"
                            style={{ width: `${stage.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-[#7C3AED] dark:text-[#C084FC] mt-1">
                          {stage.progressPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
