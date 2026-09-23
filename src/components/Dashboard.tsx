import { useApp } from '../context/AppContext';
import { ProjectManagerCard } from './ProjectManagerCard';
import { SyncExcelButton } from './ui/SyncExcelButton';
import { ScopeWiseSummary } from './ScopeWiseSummary';
import { PortfolioOverviewMetrics } from './PortfolioOverviewMetrics';
import { BarChart3 } from 'lucide-react';

function SkylineIllustration({ isDark }: { isDark: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute right-48 lg:right-64 -bottom-1 h-full w-72 lg:w-96 select-none opacity-45 dark:opacity-15 hidden md:block"
      viewBox="0 0 360 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMaxYMax meet"
    >
      <defs>
        <linearGradient id="skylineGrad1" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor={isDark ? "#38BDF8" : "#38BDF8"} stopOpacity="0.45" />
          <stop offset="1" stopColor={isDark ? "#1E293B" : "#BAE6FD"} stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="skylineGrad2" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor={isDark ? "#60A5FA" : "#60A5FA"} stopOpacity="0.35" />
          <stop offset="1" stopColor={isDark ? "#1E293B" : "#DBEAFE"} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Background towers */}
      <rect x="20" y="42" width="34" height="98" rx="3" fill="url(#skylineGrad2)" />
      <rect x="68" y="18" width="46" height="122" rx="4" fill="url(#skylineGrad1)" />
      <rect x="128" y="48" width="38" height="92" rx="3" fill="url(#skylineGrad2)" />
      <rect x="180" y="12" width="52" height="128" rx="4" fill="url(#skylineGrad1)" />
      <rect x="246" y="32" width="44" height="108" rx="3" fill="url(#skylineGrad2)" />
      <rect x="304" y="52" width="38" height="88" rx="3" fill="url(#skylineGrad1)" />
      {/* Architectural window & grid lines */}
      <line x1="78" y1="30" x2="104" y2="30" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="78" y1="45" x2="104" y2="45" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="78" y1="60" x2="104" y2="60" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="192" y1="24" x2="222" y2="24" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="192" y1="39" x2="222" y2="39" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="192" y1="54" x2="222" y2="54" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="192" y1="69" x2="222" y2="69" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

export function Dashboard() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* 1. Page Header Banner */}
      <div className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs flex flex-wrap items-center justify-between gap-4 ${
        isDark
          ? 'bg-gradient-to-r from-[#111A24] via-[#141820] to-[#121922] border-[#223040]'
          : 'bg-gradient-to-r from-[#EBF5FB] via-[#F1F7FD] to-[#EDF6FD] border-[#D6E6F5]'
      }`}>
        {/* Subtle Decorative Skyline Graphic */}
        <SkylineIllustration isDark={isDark} />

        {/* Left: Icon & Titles */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${
            isDark 
              ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8]' 
              : 'bg-white border-[#BAE6FD] text-[#0284C7]'
          }`}>
            <BarChart3 size={24} className="stroke-[2.2]" />
          </div>

          <div>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
              Project Summary
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              Operational portfolio and live project status across all scopes.
            </p>
          </div>
        </div>

        {/* Right: Sync Excel Button Card */}
        <div className="relative z-10">
          <SyncExcelButton variant="banner" />
        </div>
      </div>

      {/* 2. Project Manager Row */}
      <ProjectManagerCard />

      {/* 3. Scope Section */}
      <ScopeWiseSummary />

      {/* 4. Portfolio Overview & Key Metrics */}
      <PortfolioOverviewMetrics />
    </div>
  );
}
