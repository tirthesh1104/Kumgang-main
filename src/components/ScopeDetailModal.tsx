import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  X, CheckCircle2, Clock, AlertTriangle, FileText,
  Search, Download, Building2, ChevronLeft, ChevronRight,
  Calendar, Layers, DollarSign, ChevronsUpDown, ChevronUp, ChevronDown
} from 'lucide-react';
import {
  type POStatus,
  type ScopeMetrics,
  formatScopeCurrency,
  formatArea,
  getProjectPOStatus,
} from '../utils/scopeUtils';

interface ScopeDetailModalProps {
  isOpen: boolean;
  scope: string;
  scopeData: ScopeMetrics | null;
  onClose: () => void;
  initialFilter?: 'All' | POStatus;
}

type SortField = 'projectId' | 'poDate' | 'area' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState<number>(() => value);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
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

function MiniAscendingBars({ colorClass }: { colorClass: string }) {
  return (
    <div className="flex items-end gap-1 opacity-25 shrink-0 select-none pb-0.5" aria-hidden="true">
      <div className={`w-1.5 h-3 rounded-full ${colorClass}`} />
      <div className={`w-1.5 h-5 rounded-full ${colorClass}`} />
      <div className={`w-1.5 h-7 rounded-full ${colorClass}`} />
      <div className={`w-1.5 h-9 rounded-full ${colorClass}`} />
    </div>
  );
}

function TablePOStatusBadge({ status }: { status: POStatus }) {
  if (status === 'Signed PO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/90 dark:bg-[#132A20] dark:text-[#70D0A8] dark:border-[#244E3B]">
        <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{status}</span>
      </span>
    );
  }
  if (status === 'Not Signed PO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/90 dark:bg-[#132338] dark:text-[#7DB3FC] dark:border-[#1D3B5E]">
        <FileText size={12} className="text-sky-600 dark:text-sky-400 shrink-0" />
        <span>{status}</span>
      </span>
    );
  }
  if (status === 'Under Review PO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/90 dark:bg-[#2D2211] dark:text-[#FBBF24] dark:border-[#55401C]">
        <Clock size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{status}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/90 dark:bg-[#341618] dark:text-[#F87171] dark:border-[#5E2529]">
      <AlertTriangle size={12} className="text-rose-600 dark:text-rose-400 shrink-0" />
      <span>{status}</span>
    </span>
  );
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = 'left',
}: {
  label: string;
  field?: SortField;
  currentField: SortField | null;
  direction: SortDirection;
  onSort?: (field: SortField) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const isSorted = field && currentField === field;
  const isClickable = !!field && !!onSort;

  return (
    <th
      onClick={() => isClickable && onSort(field)}
      className={`py-3 px-3.5 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap select-none ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${isClickable ? 'cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors group' : ''}`}
    >
      <div className={`inline-flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        <span>{label}</span>
        {isClickable && (
          <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
            {isSorted ? (
              direction === 'asc' ? (
                <ChevronUp size={12} className="text-sky-600 dark:text-sky-400 stroke-[2.5]" />
              ) : (
                <ChevronDown size={12} className="text-sky-600 dark:text-sky-400 stroke-[2.5]" />
              )
            ) : (
              <ChevronsUpDown size={12} className="opacity-60 group-hover:opacity-100" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}

export function ScopeDetailModal({ isOpen, scope, scopeData, onClose, initialFilter = 'All' }: ScopeDetailModalProps) {
  const { navigate, theme } = useApp();
  const isDark = theme === 'dark';

  const [activeFilter, setActiveFilter] = useState<'All' | POStatus>(() => initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    if (isOpen) {
      setActiveFilter(initialFilter);
      setSearchQuery('');
      setCurrentPage(1);
      setSortField(null);
      setSortDirection('asc');
    }
  }, [isOpen, initialFilter]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live formatted timestamp
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const liveDateTime = `${day} ${month} ${year}, ${hours}:${minutes}`;

  const allProjects = useMemo(() => scopeData?.projects || [], [scopeData]);

  // 1. Filter projects by active tab & search query
  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      const poStatus = getProjectPOStatus(project);
      if (activeFilter !== 'All' && poStatus !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const id = (project.projectId || '').toLowerCase();
        const name = (project.project || '').toLowerCase();
        const client = (project.customer || '').toLowerCase();
        const poNum = (project.poNumber || `PO-${project.projectId}`).toLowerCase();
        const location = (project.siteLocationRegion || project.country || '').toLowerCase();
        return id.includes(q) || name.includes(q) || client.includes(q) || poNum.includes(q) || location.includes(q);
      }
      return true;
    });
  }, [allProjects, activeFilter, searchQuery]);

  // 2. Sort projects if sortField is set
  const sortedProjects = useMemo(() => {
    if (!sortField) return filteredProjects;

    return [...filteredProjects].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortField === 'projectId') {
        aVal = a.projectId || '';
        bVal = b.projectId || '';
        return sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
      if (sortField === 'poDate') {
        aVal = a.poDate || a.contractDate || '';
        bVal = b.poDate || b.contractDate || '';
        return sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
      if (sortField === 'area') {
        aVal = a.actualDesignQtyM2 || a.contractQtyM2 || a.poQty || 0;
        bVal = b.actualDesignQtyM2 || b.contractQtyM2 || b.poQty || 0;
        return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }
      if (sortField === 'amount') {
        aVal = a.totalAmountUSD || a.actualTotalAmount || 0;
        bVal = b.totalAmountUSD || b.actualTotalAmount || 0;
        return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }
      if (sortField === 'status') {
        aVal = getProjectPOStatus(a);
        bVal = getProjectPOStatus(b);
        return sortDirection === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
      return 0;
    });
  }, [filteredProjects, sortField, sortDirection]);

  // 3. Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / rowsPerPage));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedProjects.slice(start, start + rowsPerPage);
  }, [sortedProjects, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Animation & Transition state for smooth layout shifts
  const [displayedProjects, setDisplayedProjects] = useState(paginatedProjects);
  const [displayPage, setDisplayPage] = useState(currentPage);
  const [displayedTotal, setDisplayedTotal] = useState(sortedProjects.length);
  const [rowAnimationState, setRowAnimationState] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [tableHeight, setTableHeight] = useState<number | 'auto'>('auto');

  const tableCardRef = useRef<HTMLDivElement>(null);
  const tableInnerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sync displayedProjects initially or whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayedProjects(paginatedProjects);
      setDisplayPage(currentPage);
      setDisplayedTotal(sortedProjects.length);
      setRowAnimationState('idle');
      setTableHeight('auto');
      isInitialMount.current = true;
    }
  }, [isOpen]);

  // Handle smooth animated layout shift when activeFilter, searchQuery, or currentPage changes
  useEffect(() => {
    if (!isOpen) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      setDisplayedProjects(paginatedProjects);
      setDisplayPage(currentPage);
      setDisplayedTotal(sortedProjects.length);
      return;
    }

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);

    if (prefersReducedMotion) {
      setDisplayedProjects(paginatedProjects);
      setDisplayPage(currentPage);
      setDisplayedTotal(sortedProjects.length);
      setRowAnimationState('idle');
      setTableHeight('auto');
      return;
    }

    if (tableCardRef.current) {
      const curHeight = tableCardRef.current.offsetHeight;
      if (curHeight > 0) {
        setTableHeight(curHeight);
      }
    }
    setRowAnimationState('exiting');

    transitionTimeoutRef.current = setTimeout(() => {
      setDisplayedProjects(paginatedProjects);
      setDisplayPage(currentPage);
      setDisplayedTotal(sortedProjects.length);
      setRowAnimationState('entering');

      requestAnimationFrame(() => {
        if (tableInnerRef.current) {
          const newH = tableInnerRef.current.scrollHeight + 2;
          if (newH > 0) {
            setTableHeight(newH);
          }
        }
      });

      finishTimeoutRef.current = setTimeout(() => {
        setRowAnimationState('idle');
        setTableHeight('auto');
      }, 340);
    }, 130);

    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, [activeFilter, searchQuery, currentPage, rowsPerPage, sortField, sortDirection, paginatedProjects, sortedProjects.length, isOpen, prefersReducedMotion]);

  const handleDownloadCSV = () => {
    const headers = ['Project ID', 'Project Name', 'Client', 'PO Number', 'PO Date', 'Area (m²)', `Amount (${scope === 'KKI' ? 'INR' : 'USD'})`, 'PO Status', 'Site Location'];
    const rows = sortedProjects.map(p => [
      p.projectId,
      `"${(p.project || '').replace(/"/g, '""')}"`,
      `"${(p.customer || '').replace(/"/g, '""')}"`,
      p.poNumber || `PO-${p.projectId}`,
      p.poDate || p.contractDate || '',
      p.actualDesignQtyM2 || p.contractQtyM2 || 0,
      p.totalAmountUSD || p.actualTotalAmount || 0,
      getProjectPOStatus(p),
      `"${(p.siteLocationRegion || p.country || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${scope}_Project_Details_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !scopeData) return null;

  const statuses = scopeData.statuses;

  const statusCardsConfig: {
    status: POStatus;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accentColor: string;
    iconBg: string;
    subIconBg: string;
    accentPill: string;
    amountColor: string;
    barClass: string;
    activeBorder: string;
    activeBg: string;
    activeShadow: string;
  }[] = [
    {
      status: 'Signed PO',
      icon: CheckCircle2,
      accentColor: 'text-[#16A36A] dark:text-[#70D0A8]',
      iconBg: isDark ? 'bg-[#163127] border-[#28523F]' : 'bg-[#E6F4EA] border-[#CEEAD6]',
      subIconBg: isDark ? 'bg-[#163127]' : 'bg-[#E6F4EA]',
      accentPill: 'bg-[#16A36A] dark:bg-[#70D0A8]',
      amountColor: 'text-[#16A36A] dark:text-[#70D0A8]',
      barClass: 'bg-[#16A36A] dark:bg-[#70D0A8]',
      activeBorder: isDark ? 'border-[#70D0A8]' : 'border-[#16A36A]',
      activeBg: isDark ? 'bg-[#163127]/25' : 'bg-[#F0FDF4]',
      activeShadow: 'shadow-md shadow-emerald-500/10',
    },
    {
      status: 'Not Signed PO',
      icon: FileText,
      accentColor: 'text-[#0284C7] dark:text-[#7DB3FC]',
      iconBg: isDark ? 'bg-[#1D2B44] border-[#2B436D]' : 'bg-[#E0F2FE] border-[#BAE6FD]',
      subIconBg: isDark ? 'bg-[#1D2B44]' : 'bg-[#E0F2FE]',
      accentPill: 'bg-[#0284C7] dark:bg-[#7DB3FC]',
      amountColor: 'text-[#0284C7] dark:text-[#7DB3FC]',
      barClass: 'bg-[#0284C7] dark:bg-[#7DB3FC]',
      activeBorder: isDark ? 'border-[#7DB3FC]' : 'border-[#0284C7]',
      activeBg: isDark ? 'bg-[#1D2B44]/25' : 'bg-[#F0F9FF]',
      activeShadow: 'shadow-md shadow-sky-500/10',
    },
    {
      status: 'Under Review PO',
      icon: Clock,
      accentColor: 'text-[#D97706] dark:text-[#FBBF24]',
      iconBg: isDark ? 'bg-[#322917] border-[#5B4724]' : 'bg-[#FEF7E0] border-[#FDE293]',
      subIconBg: isDark ? 'bg-[#322917]' : 'bg-[#FEF7E0]',
      accentPill: 'bg-[#D97706] dark:bg-[#FBBF24]',
      amountColor: 'text-[#D97706] dark:text-[#FBBF24]',
      barClass: 'bg-[#D97706] dark:bg-[#FBBF24]',
      activeBorder: isDark ? 'border-[#FBBF24]' : 'border-[#F59E0B]',
      activeBg: isDark ? 'bg-[#322917]/25' : 'bg-[#FFFBEB]',
      activeShadow: 'shadow-md shadow-amber-500/10',
    },
    {
      status: 'Upcoming PO',
      icon: AlertTriangle,
      accentColor: 'text-[#E11D48] dark:text-[#F87171]',
      iconBg: isDark ? 'bg-[#34191B] border-[#5A292B]' : 'bg-[#FEE2E2] border-[#FECACA]',
      subIconBg: isDark ? 'bg-[#34191B]' : 'bg-[#FEE2E2]',
      accentPill: 'bg-[#E11D48] dark:bg-[#F87171]',
      amountColor: 'text-[#E11D48] dark:text-[#F87171]',
      barClass: 'bg-[#E11D48] dark:bg-[#F87171]',
      activeBorder: isDark ? 'border-[#F87171]' : 'border-[#E11D48]',
      activeBg: isDark ? 'bg-[#34191B]/25' : 'bg-[#FFF1F2]',
      activeShadow: 'shadow-md shadow-rose-500/10',
    },
  ];

  const filterTabs: {
    key: 'All' | POStatus;
    label: string;
    dotColor?: string;
    activeStyle: string;
  }[] = [
    {
      key: 'All',
      label: 'All',
      activeStyle: isDark
        ? 'bg-white text-slate-900 border-white shadow-xs font-semibold'
        : 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold',
    },
    {
      key: 'Signed PO',
      label: 'Signed PO',
      dotColor: 'bg-emerald-500',
      activeStyle: isDark
        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500 shadow-xs font-semibold'
        : 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-xs font-semibold',
    },
    {
      key: 'Not Signed PO',
      label: 'Not Signed PO',
      dotColor: 'bg-sky-500',
      activeStyle: isDark
        ? 'bg-sky-950/60 text-sky-300 border-sky-500 shadow-xs font-semibold'
        : 'bg-sky-50 text-sky-800 border-sky-400 shadow-xs font-semibold',
    },
    {
      key: 'Under Review PO',
      label: 'Under Review PO',
      dotColor: 'bg-amber-500',
      activeStyle: isDark
        ? 'bg-amber-950/60 text-amber-200 border-amber-500 shadow-xs font-semibold'
        : 'bg-[#FEF6E7] text-[#92400E] border-[#FCD34D] shadow-xs font-semibold',
    },
    {
      key: 'Upcoming PO',
      label: 'Upcoming PO',
      dotColor: 'bg-rose-500',
      activeStyle: isDark
        ? 'bg-rose-950/60 text-rose-300 border-rose-500 shadow-xs font-semibold'
        : 'bg-rose-50 text-rose-800 border-rose-400 shadow-xs font-semibold',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain scroll-smooth flex items-start justify-center p-3 sm:p-5 pt-6 sm:pt-10 md:pt-12 pb-8">
        {/* Subtle Backdrop Dim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-6xl max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain scroll-smooth rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col z-10 ${
            isDark
              ? 'bg-[#121214] border-[#262629] text-[#F5F5F3]'
              : 'bg-[#F9FBFC] border-slate-200/90 text-[#0F172A] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(224,242,254,0.5),rgba(249,251,252,0))]'
          }`}
        >
          {/* 1. Modal Top Bar */}
          <div className={`p-5 sm:p-6 border-b flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md ${
            isDark ? 'bg-[#121214]/95 border-[#262629]' : 'bg-white/95 border-slate-200/80'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${
                isDark ? 'bg-sky-950/50 border-sky-800 text-sky-400' : 'bg-sky-100/70 border-sky-200/60 text-sky-600'
              }`}>
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Project Details</span>
                </h2>
                <p className="text-sm mt-0.5 font-normal text-slate-500 dark:text-slate-400">
                  Complete project information for {scope} scope
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${
                isDark ? 'bg-[#18181B] border-[#303035] text-slate-300' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <Calendar size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span>Last Updated: <strong className="text-slate-800 dark:text-slate-100 font-bold">{liveDateTime}</strong></span>
              </div>

              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-[#18181B] hover:bg-[#26262B] text-slate-400 hover:text-white border-[#303035]'
                    : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6 flex-1">
            {/* 2. Four PO Status Cards in a single horizontal row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statusCardsConfig.map((item, idx) => {
                const metric = statuses[item.status];
                const IconComponent = item.icon;
                const isCardActive = activeFilter === item.status;

                return (
                  <motion.div
                    key={item.status}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      setActiveFilter(prev => prev === item.status ? 'All' : item.status);
                      setCurrentPage(1);
                    }}
                    className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 ease-out cursor-pointer select-none flex flex-col justify-between overflow-hidden ${
                      isCardActive
                        ? `${item.activeBorder} ${item.activeBg} ${item.activeShadow}`
                        : isDark
                        ? 'bg-[#18181B] border-[#27272A] hover:border-[#38383E] hover:bg-[#1E1E22]'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Left vertical accent indicator */}
                    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-opacity ${
                      item.accentPill
                    } ${isCardActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />

                    {/* Top Row: Icon + Status Name + Big Count */}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.iconBg}`}>
                        <IconComponent size={19} className={item.accentColor} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                          {item.status}
                        </span>
                        <div className="flex items-baseline mt-0.5">
                          <span className="text-2xl sm:text-[28px] leading-tight font-extrabold text-slate-900 dark:text-white">
                            <AnimatedNumber value={metric.count} />
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 ml-1.5">
                            Projects
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-3.5 border-t border-slate-100 dark:border-[#262629]" />

                    {/* Bottom Row: Area, Amount & Watermark Mini Bars */}
                    <div className="flex items-end justify-between">
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${item.subIconBg}`}>
                              <Layers size={10} className={item.accentColor} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              TOTAL AREA
                            </span>
                          </div>
                          <p className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
                            {formatArea(metric.areaM2)}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${item.subIconBg}`}>
                              <DollarSign size={10} className={item.accentColor} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              TOTAL AMOUNT
                            </span>
                          </div>
                          <p className={`text-[14px] sm:text-[15px] font-bold mt-0.5 font-mono ${item.amountColor}`}>
                            {formatScopeCurrency(metric.amount, scope)}
                          </p>
                        </div>
                      </div>

                      {/* Watermark Mini Bars in Bottom Right */}
                      <MiniAscendingBars colorClass={item.barClass} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 3. Toolbar & Status Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Filter tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {filterTabs.map(tab => {
                  const count = tab.key === 'All' ? allProjects.length : statuses[tab.key]?.count || 0;
                  const isActive = activeFilter === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveFilter(tab.key);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? tab.activeStyle
                          : isDark
                          ? 'bg-[#18181B] text-slate-300 border-[#2D2D32] hover:bg-[#202024] hover:text-white'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {tab.dotColor && (
                        <span className={`w-2 h-2 rounded-full ${tab.dotColor} shrink-0`} />
                      )}
                      <span>{tab.label} ({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Download Button */}
              <div className="flex items-center gap-2.5 flex-1 sm:flex-initial justify-end">
                <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
                  <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search projects..."
                    className={`w-full pl-9 pr-7 py-1.5 text-xs sm:text-sm rounded-lg border outline-none font-medium transition-colors ${
                      isDark
                        ? 'bg-[#18181B] border-[#2D2D32] text-white placeholder-slate-500 focus:border-sky-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  onClick={handleDownloadCSV}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs flex-shrink-0 ${
                    isDark
                      ? 'bg-[#18181B] text-slate-200 border-[#2D2D32] hover:bg-[#202024]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Download CSV"
                >
                  <Download size={13} className="text-sky-600 dark:text-sky-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* 4. Detailed Project Table */}
            <motion.div
              ref={tableCardRef}
              animate={{
                height: tableHeight,
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.32,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={`border rounded-2xl shadow-2xs overflow-hidden ${
                isDark ? 'border-[#262629] bg-[#151517]' : 'border-slate-200/90 bg-white'
              }`}
            >
              <div ref={tableInnerRef}>
                <div className="overflow-x-auto min-w-full overscroll-contain scroll-smooth">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className={`border-b font-semibold uppercase tracking-wider text-[11px] ${
                        isDark ? 'bg-[#1B1B1F] text-slate-400 border-[#262629]' : 'bg-slate-50/70 text-slate-500 border-slate-200/80'
                      }`}>
                        <SortHeader
                          label="Project ID"
                          field="projectId"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <th className="py-3 px-3.5">Project Name</th>
                        <th className="py-3 px-3.5">Client</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">PO Number</th>
                        <SortHeader
                          label="PO Date"
                          field="poDate"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <SortHeader
                          label="Area (m²)"
                          field="area"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                          align="right"
                        />
                        <SortHeader
                          label={`Amount (${scope === 'KKI' ? 'INR' : 'USD'})`}
                          field="amount"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                          align="right"
                        />
                        <SortHeader
                          label="Status"
                          field="status"
                          currentField={sortField}
                          direction={sortDirection}
                          onSort={handleSort}
                        />
                        <th className="py-3 px-3.5">Site Location</th>
                        <th className="py-3 px-3 text-center whitespace-nowrap w-10"></th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#202024]' : 'divide-slate-100'}`}>
                      {displayedProjects.length === 0 ? (
                        <motion.tr
                          key="no-projects"
                          initial={rowAnimationState === 'entering' ? { opacity: 0, y: 4 } : false}
                          animate={
                            rowAnimationState === 'exiting'
                              ? { opacity: 0, y: -4, transition: { duration: 0.13, ease: 'easeOut' } }
                              : { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } }
                          }
                        >
                          <td colSpan={10} className="py-14 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                            No projects found matching the selected filters.
                          </td>
                        </motion.tr>
                      ) : (
                        displayedProjects.map(project => {
                          const poStatus = getProjectPOStatus(project);
                          const area = project.actualDesignQtyM2 || project.contractQtyM2 || project.poQty || 0;
                          const amt = project.totalAmountUSD || project.actualTotalAmount || 0;
                          const poNum = project.poNumber || `PO-${project.projectId}`;
                          const poDate = project.poDate || project.contractDate || '-';
                          const siteLocation = project.siteLocationRegion || project.country || '-';

                          return (
                            <motion.tr
                              key={project.projectId}
                              initial={rowAnimationState === 'entering' ? { opacity: 0, y: 4 } : false}
                              animate={
                                rowAnimationState === 'exiting'
                                  ? { opacity: 0, y: -4, transition: { duration: 0.13, ease: 'easeOut' } }
                                  : { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } }
                              }
                              onClick={() => {
                                onClose();
                                navigate('project-detail', project.projectId);
                              }}
                              className={`transition-colors duration-150 cursor-pointer group ${
                                isDark ? 'hover:bg-[#1C1C20]' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <td className="py-3.5 px-3.5 font-mono text-[13px] font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 whitespace-nowrap">
                                {project.projectId}
                              </td>
                              <td className="py-3.5 px-3.5 font-semibold text-[13px] text-slate-900 dark:text-slate-100 max-w-[200px] truncate" title={project.project}>
                                <span className="block truncate">{project.project}</span>
                                {project.block ? (
                                  <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {project.block}
                                  </span>
                                ) : null}
                              </td>
                              <td className="py-3.5 px-3.5 text-[12px] font-medium tracking-wide uppercase text-slate-600 dark:text-slate-300 max-w-[160px] truncate" title={project.customer}>
                                {project.customer}
                              </td>
                              <td className="py-3.5 px-3.5 font-mono text-[12px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {poNum}
                              </td>
                              <td className="py-3.5 px-3.5 font-mono text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {poDate}
                              </td>
                              <td className="py-3.5 px-3.5 text-right font-mono text-[13px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {area > 0 ? area.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '-'}
                              </td>
                              <td className="py-3.5 px-3.5 text-right font-mono text-[13px] font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                {amt > 0 ? formatScopeCurrency(amt, scope) : '-'}
                              </td>
                              <td className="py-3.5 px-3.5 whitespace-nowrap">
                                <TablePOStatusBadge status={poStatus} />
                              </td>
                              <td className="py-3.5 px-3.5 text-[13px] text-slate-600 dark:text-slate-400 max-w-[140px] truncate" title={siteLocation}>
                                {siteLocation}
                              </td>
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                <span className="inline-flex items-center text-sky-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all">
                                  <ChevronRight size={16} />
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 5. Pagination controls */}
                <div className={`py-3 px-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                  isDark ? 'border-[#262629] bg-[#18181B] text-slate-400' : 'border-slate-100 bg-white text-slate-600'
                }`}>
                  <div>
                    Showing {displayedTotal === 0 ? 0 : (displayPage - 1) * rowsPerPage + 1} –{' '}
                    {Math.min(displayPage * rowsPerPage, displayedTotal)} of {displayedTotal} projects
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isDark ? 'border-[#303035] bg-[#121214] hover:bg-[#202024]' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                        const isCurrent = pageNum === displayPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isCurrent
                                ? 'bg-sky-600 text-white shadow-xs'
                                : isDark
                                ? 'border border-[#303035] bg-[#121214] text-slate-300 hover:bg-[#202024]'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isDark ? 'border-[#303035] bg-[#121214] hover:bg-[#202024]' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                        aria-label="Next page"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Rows per page selector */}
                    <div className="relative inline-flex items-center">
                      <select
                        value={rowsPerPage}
                        onChange={e => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className={`appearance-none text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-[#18181B] border-[#303035] text-slate-300 hover:border-[#404045]'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                        aria-label="Rows per page"
                      >
                        <option value={10}>10 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                      </select>
                      <ChevronDown
                        size={12}
                        className={`pointer-events-none absolute right-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
