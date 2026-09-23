import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  DollarSign,
  Package,
  ChevronDown,
  ChevronRight,
  PieChart,
  BarChart3,
  LayoutGrid,
  Coins,
} from 'lucide-react';
import {
  type POStatus,
  type ScopeMetrics,
  calculateScopeMetrics,
  getProjectPOStatus,
  getProjectScope,
} from '../utils/scopeUtils';
import { ScopeDetailModal } from './ScopeDetailModal';

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState<number>(() => value);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const end = value;
    const duration = 350;
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    const handle = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(handle);
  }, [value]);

  if (value === 0) return <>0</>;
  return <>{displayValue.toLocaleString()}</>;
}

function MiniBarVisual({ color }: { color: string }) {
  return (
    <div className="absolute right-4 bottom-4 flex items-end gap-1 opacity-50 dark:opacity-25 pointer-events-none group-hover:scale-105 transition-transform duration-300">
      <div className="w-1.5 h-2 rounded-xs" style={{ backgroundColor: color }} />
      <div className="w-1.5 h-3.5 rounded-xs" style={{ backgroundColor: color }} />
      <div className="w-1.5 h-5 rounded-xs" style={{ backgroundColor: color }} />
      <div className="w-1.5 h-6.5 rounded-xs" style={{ backgroundColor: color }} />
    </div>
  );
}

function MiniWaveVisual({ color }: { color: string }) {
  return (
    <svg
      className="absolute -bottom-1 -right-1 w-28 h-14 pointer-events-none opacity-45 dark:opacity-20 transition-transform duration-300 group-hover:scale-105"
      viewBox="0 0 110 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 55 C30 28 65 50 110 12 L110 55 Z"
        fill={color}
        fillOpacity="0.14"
      />
      <path
        d="M0 55 C30 28 65 50 110 12"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
    </svg>
  );
}

export function PortfolioOverviewMetrics() {
  const { theme, navigate } = useApp();
  const isDark = theme === 'dark';
  const { projects } = useData();

  // Scope filter: 'All Scopes' | 'KKI' | 'KKV' | ...
  const [selectedScope, setSelectedScope] = useState<string>('All Scopes');

  // Time filter: 'This Year' | 'All Time' | '2025' | '2024'
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Year');

  // Modal inspection state
  const [activeModalScope, setActiveModalScope] = useState<string | null>(null);
  const [activeModalFilter, setActiveModalFilter] = useState<'All' | POStatus>('All');

  // Calculate scope-wise metrics for individual scopes
  const scopeMetrics = useMemo(() => {
    return calculateScopeMetrics(projects);
  }, [projects]);

  // Available unique scopes
  const availableScopes = useMemo(() => {
    return Object.keys(scopeMetrics).sort();
  }, [scopeMetrics]);

  // Aggregated scope metrics for "All Scopes"
  const aggregatedAllScopesMetrics = useMemo((): ScopeMetrics => {
    const allMetric: ScopeMetrics = {
      scope: 'All Scopes',
      totalProjects: projects.length,
      statuses: {
        'Signed PO': { count: 0, areaM2: 0, amount: 0 },
        'Not Signed PO': { count: 0, areaM2: 0, amount: 0 },
        'Under Review PO': { count: 0, areaM2: 0, amount: 0 },
        'Upcoming PO': { count: 0, areaM2: 0, amount: 0 },
      },
      projects: [...projects],
    };

    projects.forEach(p => {
      const poStatus = getProjectPOStatus(p);
      const area = p.actualDesignQtyM2 || p.contractQtyM2 || p.poQty || 0;
      const amt = p.totalAmountUSD || p.actualTotalAmount || 0;
      allMetric.statuses[poStatus].count += 1;
      allMetric.statuses[poStatus].areaM2 += area;
      allMetric.statuses[poStatus].amount += amt;
    });

    return allMetric;
  }, [projects]);

  // Projects filtered by selectedScope
  const scopeFilteredProjects = useMemo(() => {
    if (selectedScope === 'All Scopes') {
      return projects;
    }
    return projects.filter(p => getProjectScope(p) === selectedScope);
  }, [projects, selectedScope]);

  // Projects filtered by both selectedScope and selectedPeriod
  const periodAndScopeFilteredProjects = useMemo(() => {
    return scopeFilteredProjects.filter(p => {
      if (selectedPeriod === 'All Time') return true;
      const dateStr = p.poDate || p.contractDate || '';
      if (selectedPeriod === 'This Year') {
        // Current year is 2026 (or ongoing projects without date)
        return dateStr.includes('2026') || !dateStr;
      }
      return dateStr.includes(selectedPeriod);
    });
  }, [scopeFilteredProjects, selectedPeriod]);

  // Portfolio Overview PO Status Counts (respects selectedScope)
  const poCounts = useMemo(() => {
    const counts: Record<POStatus, number> = {
      'Signed PO': 0,
      'Under Review PO': 0,
      'Upcoming PO': 0,
      'Not Signed PO': 0,
    };
    scopeFilteredProjects.forEach(p => {
      const status = getProjectPOStatus(p);
      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });
    return counts;
  }, [scopeFilteredProjects]);

  // Key Metrics calculations (respects selectedScope and selectedPeriod)
  const metrics = useMemo(() => {
    let totalArea = 0;
    let totalContractValue = 0;
    let totalOutstanding = 0;
    let totalPOQty = 0;

    periodAndScopeFilteredProjects.forEach(p => {
      const area = p.actualDesignQtyM2 || p.contractQtyM2 || p.poQty || 0;
      const val = p.totalAmountUSD || p.actualTotalAmount || 0;
      const bal = p.balanceUSD || 0;
      const qty = p.poQty || p.contractQtyM2 || 0;

      totalArea += area;
      totalContractValue += val;
      totalOutstanding += bal;
      totalPOQty += qty;
    });

    return {
      totalArea,
      totalContractValue,
      totalOutstanding,
      totalPOQty,
    };
  }, [periodAndScopeFilteredProjects]);

  // Formatter helpers
  const formatCompactCurrency = (amount: number) => {
    const isKKI = selectedScope === 'KKI';
    if (isKKI) {
      if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
      if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} L`;
      if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)} K`;
      return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
    return `$${Math.round(amount).toLocaleString('en-US')}`;
  };

  // Click handler for PO status cards to open the detail modal filtered by that status
  const handleCardClick = (status: POStatus) => {
    setActiveModalScope(selectedScope);
    setActiveModalFilter(status);
  };

  // Status card visual styles matching reference image
  const poCardConfigs: {
    status: POStatus;
    displayName: string;
    description: string;
    icon: typeof CheckCircle2;
    cardBg: string;
    iconContainer: string;
    arrowContainer: string;
    numColor: string;
    descColor: string;
    barColor: string;
  }[] = [
    {
      status: 'Signed PO',
      displayName: 'Signed PO',
      description: 'Active project execution',
      icon: CheckCircle2,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#12221B] via-[#151517] to-[#12221B] border-[#244636] hover:border-[#70D0A8]/40' 
        : 'bg-gradient-to-br from-[#F4FAF6] via-white to-[#F0FDF4] border-[#D1F2DF] hover:border-emerald-300',
      iconContainer: isDark 
        ? 'bg-[#163127] border-[#28523F] text-[#70D0A8]' 
        : 'bg-emerald-100 border-[#A7F3D0] text-[#059669]',
      arrowContainer: isDark 
        ? 'bg-[#163127] border-[#28523F] text-[#70D0A8] group-hover:bg-[#1E4335]' 
        : 'bg-emerald-100/70 border-emerald-200/60 text-emerald-700 group-hover:bg-emerald-200',
      numColor: isDark ? 'text-white' : 'text-[#0B2239]',
      descColor: isDark ? 'text-[#85858B]' : 'text-slate-400',
      barColor: isDark ? '#70D0A8' : '#10B981',
    },
    {
      status: 'Under Review PO',
      displayName: 'Under Review',
      description: 'Projects under review',
      icon: Clock,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#101F30] via-[#151517] to-[#101F30] border-[#1E3B5C] hover:border-[#38BDF8]/40' 
        : 'bg-gradient-to-br from-[#F2F8FD] via-white to-[#F0F7FD] border-[#D4E8F8] hover:border-sky-300',
      iconContainer: isDark 
        ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8]' 
        : 'bg-sky-100 border-[#BAE6FD] text-[#0284C7]',
      arrowContainer: isDark 
        ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8] group-hover:bg-[#183250]' 
        : 'bg-sky-100/70 border-sky-200/60 text-sky-700 group-hover:bg-sky-200',
      numColor: isDark ? 'text-white' : 'text-[#0B2239]',
      descColor: isDark ? 'text-[#85858B]' : 'text-slate-400',
      barColor: isDark ? '#38BDF8' : '#0284C7',
    },
    {
      status: 'Upcoming PO',
      displayName: 'Upcoming PO',
      description: 'Upcoming pipeline contracts',
      icon: Calendar,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#241E14] via-[#151517] to-[#241E14] border-[#443823] hover:border-[#C9A86A]/40' 
        : 'bg-gradient-to-br from-[#FEF9F0] via-white to-[#FFFBEB] border-[#FDE8BA] hover:border-amber-300',
      iconContainer: isDark 
        ? 'bg-[#2A2419] border-[#55462C] text-[#C9A86A]' 
        : 'bg-amber-100 border-[#FDE293] text-[#D97706]',
      arrowContainer: isDark 
        ? 'bg-[#2A2419] border-[#55462C] text-[#C9A86A] group-hover:bg-[#382E1E]' 
        : 'bg-amber-100/70 border-amber-200/60 text-amber-700 group-hover:bg-amber-200',
      numColor: isDark ? 'text-white' : 'text-[#0B2239]',
      descColor: isDark ? 'text-[#85858B]' : 'text-slate-400',
      barColor: isDark ? '#C9A86A' : '#D97706',
    },
    {
      status: 'Not Signed PO',
      displayName: 'Not Signed PO',
      description: 'Critical issues',
      icon: AlertTriangle,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#291416] via-[#151517] to-[#291416] border-[#4D2326] hover:border-[#F87171]/40' 
        : 'bg-gradient-to-br from-[#FEF2F2] via-white to-[#FFF1F2] border-[#FECDD3] hover:border-rose-300',
      iconContainer: isDark 
        ? 'bg-[#34191B] border-[#5A292B] text-[#F08A8A]' 
        : 'bg-rose-100 border-rose-200 text-rose-600',
      arrowContainer: isDark 
        ? 'bg-[#34191B] border-[#5A292B] text-[#F08A8A] group-hover:bg-[#471E21]' 
        : 'bg-rose-100/70 border-rose-200/60 text-rose-700 group-hover:bg-rose-200',
      numColor: isDark ? 'text-[#F08A8A]' : 'text-rose-600',
      descColor: isDark ? 'text-rose-400 font-semibold' : 'text-rose-600 font-semibold',
      barColor: isDark ? '#F08A8A' : '#E11D48',
    },
  ];

  // Key metric card visual styles matching reference image
  const metricConfigs = [
    {
      id: 'area',
      title: 'Total Area',
      value: `${Math.round(metrics.totalArea).toLocaleString()} m²`,
      description: 'Verified design area total',
      icon: LayoutGrid,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#1E1729] via-[#151517] to-[#1E1729] border-[#382B4E] hover:border-[#9A82D4]/40' 
        : 'bg-gradient-to-br from-[#FAF5FF] via-white to-[#F5EEFB] border-[#E9D5FF] hover:border-purple-300',
      iconContainer: isDark 
        ? 'bg-[#251F32] border-[#3E3454] text-[#BBA8E8]' 
        : 'bg-purple-100 border-[#DDD6FE] text-[#7C3AED]',
      arrowContainer: isDark 
        ? 'bg-[#251F32] border-[#3E3454] text-[#BBA8E8] group-hover:bg-[#342A47]' 
        : 'bg-purple-100/70 border-purple-200/60 text-purple-700 group-hover:bg-purple-200',
      numColor: isDark ? 'text-white' : 'text-[#0B2239]',
      descColor: isDark ? 'text-[#85858B]' : 'text-slate-400',
      visualType: 'wave' as const,
      visualColor: isDark ? '#BBA8E8' : '#8B5CF6',
      onClick: () => {
        setActiveModalScope(selectedScope);
        setActiveModalFilter('All');
      },
    },
    {
      id: 'value',
      title: 'Total Contract Value',
      value: formatCompactCurrency(metrics.totalContractValue),
      description: 'Signed contracts total',
      icon: DollarSign,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#12221B] via-[#151517] to-[#12221B] border-[#244636] hover:border-[#70D0A8]/40' 
        : 'bg-gradient-to-br from-[#F4FAF6] via-white to-[#F0FDF4] border-[#D1F2DF] hover:border-emerald-300',
      iconContainer: isDark 
        ? 'bg-[#163127] border-[#28523F] text-[#70D0A8]' 
        : 'bg-emerald-100 border-[#A7F3D0] text-[#059669]',
      arrowContainer: isDark 
        ? 'bg-[#163127] border-[#28523F] text-[#70D0A8] group-hover:bg-[#1E4335]' 
        : 'bg-emerald-100/70 border-emerald-200/60 text-emerald-700 group-hover:bg-emerald-200',
      numColor: isDark ? 'text-white' : 'text-[#0B2239]',
      descColor: isDark ? 'text-[#85858B]' : 'text-slate-400',
      visualType: 'wave' as const,
      visualColor: isDark ? '#70D0A8' : '#059669',
      onClick: () => navigate('payments'),
    },
    {
      id: 'balance',
      title: 'Outstanding Amount',
      value: formatCompactCurrency(metrics.totalOutstanding),
      description: 'Total balance due',
      icon: Coins,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#291416] via-[#151517] to-[#291416] border-[#4D2326] hover:border-[#F87171]/40' 
        : 'bg-gradient-to-br from-[#FEF2F2] via-white to-[#FFF1F2] border-[#FECDD3] hover:border-rose-300',
      iconContainer: isDark 
        ? 'bg-[#34191B] border-[#5A292B] text-[#F08A8A]' 
        : 'bg-rose-100 border-rose-200 text-rose-600',
      arrowContainer: isDark 
        ? 'bg-[#34191B] border-[#5A292B] text-[#F08A8A] group-hover:bg-[#471E21]' 
        : 'bg-rose-100/70 border-rose-200/60 text-rose-700 group-hover:bg-rose-200',
      numColor: isDark ? 'text-[#F08A8A]' : 'text-rose-600',
      descColor: isDark ? 'text-rose-400 font-semibold' : 'text-rose-600 font-semibold',
      visualType: 'wave' as const,
      visualColor: isDark ? '#F08A8A' : '#E11D48',
      onClick: () => navigate('delays'),
    },
    {
      id: 'qty',
      title: 'Total PO Quantity',
      value: Math.round(metrics.totalPOQty).toLocaleString(),
      description: 'Total parts / sets',
      icon: Package,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#101F30] via-[#151517] to-[#101F30] border-[#1E3B5C] hover:border-[#38BDF8]/40' 
        : 'bg-gradient-to-br from-[#F2F8FD] via-white to-[#F0F7FD] border-[#D4E8F8] hover:border-sky-300',
      iconContainer: isDark 
        ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8]' 
        : 'bg-sky-100 border-[#BAE6FD] text-[#0284C7]',
      arrowContainer: isDark 
        ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8] group-hover:bg-[#183250]' 
        : 'bg-sky-100/70 border-sky-200/60 text-sky-700 group-hover:bg-sky-200',
      numColor: isDark ? 'text-white' : 'text-[#0B2239]',
      descColor: isDark ? 'text-[#85858B]' : 'text-slate-400',
      visualType: 'bar' as const,
      visualColor: isDark ? '#38BDF8' : '#0284C7',
      onClick: () => navigate('production'),
    },
  ];

  // Resolve scopeData for the detail modal
  const modalScopeData: ScopeMetrics = useMemo(() => {
    if (!activeModalScope || activeModalScope === 'All Scopes') {
      return aggregatedAllScopesMetrics;
    }
    return scopeMetrics[activeModalScope] || aggregatedAllScopesMetrics;
  }, [activeModalScope, aggregatedAllScopesMetrics, scopeMetrics]);

  return (
    <div className="space-y-6 pt-1">
      {/* ============================================================== */}
      {/* SECTION 1 — PORTFOLIO OVERVIEW                                 */}
      {/* ============================================================== */}
      <section className="space-y-4">
        {/* Section Heading & Scope Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <PieChart size={17} className={isDark ? 'text-[#38BDF8]' : 'text-[#0284C7]'} />
              <h2 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                Portfolio Overview
              </h2>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
              Key status across all projects (click to filter).
            </p>
          </div>

          {/* Scope Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedScope}
              onChange={e => setSelectedScope(e.target.value)}
              className={`appearance-none text-xs font-semibold pl-3 pr-8 py-1.5 rounded-xl border transition-colors cursor-pointer focus:outline-none shadow-2xs ${
                isDark
                  ? 'bg-[#151517] border-[#262629] text-white hover:border-[#38383E]'
                  : 'bg-white border-[#CBD5E1] text-[#0B2239] hover:border-slate-400'
              }`}
              aria-label="Filter by scope"
            >
              <option value="All Scopes">All Scopes</option>
              {availableScopes.map(scope => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className={`pointer-events-none absolute right-2.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}
            />
          </div>
        </div>

        {/* Four PO Status Cards in a Single Responsive Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {poCardConfigs.map((item, idx) => {
            const count = poCounts[item.status] || 0;
            const IconComponent = item.icon;

            return (
              <motion.div
                key={item.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.22, ease: 'easeOut' }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(item.status)}
                className={`group relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md overflow-hidden ${item.cardBg}`}
              >
                {/* Decorative Mini Bar Visual */}
                <MiniBarVisual color={item.barColor} />

                {/* Top Row: Icon Circle (Left) and Circle Arrow (Right) */}
                <div className="flex items-center justify-between relative z-10">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs ${item.iconContainer}`}>
                    <IconComponent size={18} />
                  </div>

                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 transition-all duration-200 group-hover:translate-x-0.5 shadow-2xs ${item.arrowContainer}`}>
                    <ChevronRight size={14} className="stroke-[2.2]" />
                  </div>
                </div>

                {/* Bottom Row: Title, Large Number & Subtitle */}
                <div className="mt-4 relative z-10">
                  <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                    {item.displayName}
                  </span>
                  <div className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${item.numColor}`}>
                    <AnimatedNumber value={count} />
                  </div>
                  <p className={`text-xs mt-0.5 ${item.descColor}`}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2 — KEY METRICS                                        */}
      {/* ============================================================== */}
      <section className="space-y-4">
        {/* Section Heading & Period Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={17} className={isDark ? 'text-[#BBA8E8]' : 'text-[#8B5CF6]'} />
              <h2 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                Key Metrics
              </h2>
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
              Overall portfolio metrics across all scopes.
            </p>
          </div>

          {/* Time/Period Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className={`appearance-none text-xs font-semibold pl-3 pr-8 py-1.5 rounded-xl border transition-colors cursor-pointer focus:outline-none shadow-2xs ${
                isDark
                  ? 'bg-[#151517] border-[#262629] text-white hover:border-[#38383E]'
                  : 'bg-white border-[#CBD5E1] text-[#0B2239] hover:border-slate-400'
              }`}
              aria-label="Filter by period"
            >
              <option value="This Year">This Year</option>
              <option value="All Time">All Time</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <ChevronDown
              size={13}
              className={`pointer-events-none absolute right-2.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}
            />
          </div>
        </div>

        {/* Four Key Metric Cards in a Single Responsive Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricConfigs.map((m, idx) => {
            const IconComponent = m.icon;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 + 0.08, duration: 0.22, ease: 'easeOut' }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={m.onClick}
                className={`group relative p-5 sm:p-6 rounded-2xl border transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-md overflow-hidden ${m.cardBg}`}
              >
                {/* Decorative Visual (Wave or Mini-Bar) */}
                {m.visualType === 'wave' ? (
                  <MiniWaveVisual color={m.visualColor} />
                ) : (
                  <MiniBarVisual color={m.visualColor} />
                )}

                {/* Top Row: Icon Container (Left) and Circle Arrow (Right) */}
                <div className="flex items-center justify-between relative z-10">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs ${m.iconContainer}`}>
                    <IconComponent size={18} />
                  </div>

                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 transition-all duration-200 group-hover:translate-x-0.5 shadow-2xs ${m.arrowContainer}`}>
                    <ChevronRight size={14} className="stroke-[2.2]" />
                  </div>
                </div>

                {/* Bottom Row: Title, Large Value & Subtitle */}
                <div className="mt-4 relative z-10">
                  <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                    {m.title}
                  </span>
                  <div className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${m.numColor}`}>
                    {m.value}
                  </div>
                  <p className={`text-xs mt-0.5 ${m.descColor}`}>
                    {m.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Scope / Filtered Project Details Modal */}
      {activeModalScope && (
        <ScopeDetailModal
          isOpen={!!activeModalScope}
          scope={activeModalScope}
          scopeData={modalScopeData}
          initialFilter={activeModalFilter}
          onClose={() => setActiveModalScope(null)}
        />
      )}
    </div>
  );
}
