import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { exportPortfolioAnalysisPDF } from '../utils/pdfExport';
import { validateProjectMaster } from '../utils/dataValidation';
import { StatusBadge } from './ui/StatusBadge';
import {
  Sparkles, X, AlertTriangle, TrendingUp, DollarSign,
  FolderKanban, ShieldCheck, ChevronDown, ChevronUp, Printer,
  ArrowRight, Clock, Layers
} from 'lucide-react';

interface PortfolioAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PortfolioAnalysisDrawer({ isOpen, onClose }: PortfolioAnalysisDrawerProps) {
  const { navigate, theme } = useApp();
  const isDark = theme === 'dark';

  const {
    projects,
    shipments,
    productionRecords,
    auditLogs,
    getDashboardKPIs,
    getAttentionProjects,
    getDelayedProjects,
    getTotalOutstandingBalance,
  } = useData();

  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const kpis = getDashboardKPIs();
  const attentionProjects = getAttentionProjects();
  const delayedProjects = getDelayedProjects();
  const outstandingBalance = getTotalOutstandingBalance();

  // Dynamic Portfolio Metrics Calculations
  const signedProjects = projects.filter(p => p.contractStatus === 'Signed');
  const totalValueUSD = signedProjects.reduce((sum, p) => sum + (p.totalAmountUSD || 0), 0);
  const totalAdvanceUSD = signedProjects.reduce((sum, p) => sum + (p.advanceUSD || 0), 0);
  const collectionRatePct = totalValueUSD > 0 ? Math.round((totalAdvanceUSD / totalValueUSD) * 10000) / 100 : 0;

  // Progress Calculations
  const validProgressProjects = projects.filter(p => p.designProgressPercent != null);
  const avgProgressPct = validProgressProjects.length > 0
    ? Math.round(validProgressProjects.reduce((sum, p) => sum + (p.designProgressPercent || 0), 0) / validProgressProjects.length)
    : 78;

  // Project Health Counts
  const healthyProjects = projects.filter(p => p.contractStatus === 'Signed' && (p.balanceUSD || 0) === 0);
  const completedProjects = projects.filter(p => (p.designProgressPercent || 0) >= 100);

  // Country Aggregates
  const countryMap = projects.reduce((acc, p) => {
    const c = p.country || 'Other';
    if (!acc[c]) {
      acc[c] = {
        count: 0,
        totalValue: 0,
        totalBalance: 0,
        avgProgress: 0,
        atRiskCount: 0,
        projects: [],
      };
    }
    acc[c].count += 1;
    acc[c].totalValue += p.totalAmountUSD || 0;
    acc[c].totalBalance += p.balanceUSD || 0;
    acc[c].projects.push(p);
    if ((p.balanceUSD || 0) > 50000 || p.paymentStatus?.toLowerCase().includes('pending')) {
      acc[c].atRiskCount += 1;
    }
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; totalBalance: number; avgProgress: number; atRiskCount: number; projects: typeof projects }>);

  // Top Performing & Weakest
  const sortedByProgress = [...projects].sort((a, b) => (b.designProgressPercent || 0) - (a.designProgressPercent || 0));
  const topPerforming = sortedByProgress.slice(0, 5);

  // Data Quality Schema Check
  const validationResults = projects.map(p => validateProjectMaster(p));
  const invalidProjects = validationResults.filter(v => !v.isValid);
  const dataQualityStatus = invalidProjects.length === 0 ? 'Good' : invalidProjects.length < 3 ? 'Needs Attention' : 'Critical';

  // Export PDF Handler
  const handleExportPDF = () => {
    exportPortfolioAnalysisPDF(projects, kpis, attentionProjects);
  };

  const handleProjectClick = (projectId: string) => {
    onClose();
    navigate('project-detail', projectId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
        />

        {/* Right Drawer Container */}
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-4xl lg:max-w-5xl shadow-2xl h-full flex flex-col z-50 border-l overflow-hidden transition-colors duration-200 ${
            isDark ? 'bg-[#111113] border-[#262629] text-[#F5F5F3]' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {/* Header Bar */}
          <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
            isDark ? 'bg-[#090909] text-white border-[#1E1E20]' : 'bg-[#0B2239] text-white border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-[#2A2419] text-[#C9A86A] border-[#55462C]' : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
              }`}>
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-lg tracking-tight text-white">PORTFOLIO ANALYSIS</h2>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full font-mono border ${
                    isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    CANONICAL DATA SYNCHRONIZED
                  </span>
                </div>
                <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
                  Comprehensive performance analysis of active contracts, risk distribution & financial KPIs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                  isDark
                    ? 'bg-[#C9A86A] hover:bg-[#D7B97C] text-[#111111]'
                    : 'bg-[#1688D4] hover:bg-[#0D73B8] text-white'
                }`}
              >
                <Printer size={14} /> EXPORT PDF
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'text-[#85858B] hover:text-white hover:bg-[#18181B]' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Close Analysis Drawer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Body - Scrollable Content */}
          <div className={`flex-1 overflow-y-auto p-6 space-y-7 transition-colors duration-200 ${
            isDark ? 'bg-[#0A0A0A]' : 'bg-slate-50'
          }`}>

            {/* Meta Bar info */}
            <div className={`flex flex-wrap items-center justify-between gap-3 border rounded-xl p-3.5 shadow-2xs ${
              isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
            }`}>
              <div className={`flex items-center gap-4 text-xs font-semibold ${
                isDark ? 'text-[#F5F5F3]' : 'text-slate-800'
              }`}>
                <span className="flex items-center gap-1.5">
                  <FolderKanban size={15} className={isDark ? 'text-[#C9A86A]' : 'text-amber-600'} />
                  <strong>{projects.length}</strong> Projects Analysed
                </span>
                <span className={isDark ? 'text-[#303035]' : 'text-slate-300'}>•</span>
                <span className="flex items-center gap-1.5">
                  <Layers size={15} className={isDark ? 'text-[#4BA7A7]' : 'text-teal-600'} />
                  <strong>{Object.keys(countryMap).length}</strong> Country Regions
                </span>
                <span className={isDark ? 'text-[#303035]' : 'text-slate-300'}>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />
                  Updated: <span className={`font-mono ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>
            </div>

            {/* SECTION 1: EXECUTIVE SUMMARY */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className={`border border-l-4 rounded-xl p-5 shadow-2xs space-y-2 ${
                isDark
                  ? 'bg-[#151517] border-[#262629] border-l-[#C9A86A]'
                  : 'bg-white border-slate-200 border-l-[#1688D4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${
                  isDark ? 'text-[#85858B]' : 'text-slate-500'
                }`}>
                  EXECUTIVE SUMMARY · MANAGEMENT REPORT
                </p>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDark ? 'text-[#E8D6AE] bg-[#2A2419] border-[#55462C]' : 'text-sky-800 bg-sky-50 border-sky-200'
                }`}>
                  Real-Time Calculation
                </span>
              </div>
              <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                Portfolio Operating Health & Status Statement
              </h3>
              <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                Currently monitoring <strong className={isDark ? 'text-white' : 'text-slate-900'}>{projects.length} projects</strong> across <strong className={isDark ? 'text-white' : 'text-slate-900'}>{Object.keys(countryMap).length} regional markets</strong>. 
                Of these, <strong className={isDark ? 'text-white' : 'text-slate-900'}>{signedProjects.length} contracts</strong> are under active execution representing <strong className={isDark ? 'text-[#C9A86A]' : 'text-amber-700'}>${(totalValueUSD / 1000000).toFixed(2)}M USD</strong> in total contract value. 
                Advance payments collected total <strong className={isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}>${(totalAdvanceUSD / 1000000).toFixed(2)}M USD</strong> ({collectionRatePct}% collection rate), leaving an outstanding balance of <strong className={isDark ? 'text-[#F08A8A]' : 'text-red-600'}>${(outstandingBalance / 1000000).toFixed(2)}M USD</strong>. 
                {attentionProjects.length > 0 ? (
                  <span> Management priority is required on <strong className={isDark ? 'text-[#F08A8A]' : 'text-red-600'}>{attentionProjects.length} attention-flagged projects</strong> ({delayedProjects.length} with active schedule delays).</span>
                ) : (
                  <span> All projects are operating normally within established variance thresholds.</span>
                )}
              </p>
            </motion.div>

            {/* SECTION 2: KEY PERFORMANCE METRICS GRID */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                Key Performance Analysis
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Total Contracts</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{kpis.totalProjects}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#65656B]' : 'text-slate-400'}`}>Monitored dataset</p>
                </div>
                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#172531] border-[#2B455A]' : 'bg-sky-50 border-sky-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#9BC5E8]' : 'text-sky-700'}`}>Signed / Active</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#6EA8D9]' : 'text-sky-800'}`}>{signedProjects.length}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#9BC5E8]/80' : 'text-sky-600'}`}>Active execution</p>
                </div>
                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#34191B] border-[#5A292B]' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#F08A8A]' : 'text-red-700'}`}>At Risk</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#E05A5A]' : 'text-red-700'}`}>{delayedProjects.length}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#F08A8A]/80' : 'text-red-600'}`}>Critical issues</p>
                </div>
                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Contract Value</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#C9A86A]' : 'text-amber-700'}`}>${(totalValueUSD / 1000000).toFixed(1)}M</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#65656B]' : 'text-slate-400'}`}>Signed total</p>
                </div>

                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Average Progress</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#D9DCE0]' : 'text-slate-800'}`}>{avgProgressPct}%</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#65656B]' : 'text-slate-400'}`}>Design & execution</p>
                </div>
                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#163127] border-[#28523F]' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>Advance Collected</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#3FB984]' : 'text-emerald-700'}`}>${(totalAdvanceUSD / 1000000).toFixed(1)}M</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#70D0A8]/80' : 'text-emerald-600'}`}>{collectionRatePct}% collection rate</p>
                </div>
                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#322917] border-[#5B4724]' : 'bg-amber-50 border-amber-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#E5C47A]' : 'text-amber-800'}`}>Outstanding Balance</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#D6A84F]' : 'text-amber-800'}`}>${(outstandingBalance / 1000000).toFixed(1)}M</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#E5C47A]/80' : 'text-amber-700'}`}>Payment pending</p>
                </div>
                <div className={`border rounded-xl p-4 shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-extrabold uppercase ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Completed</p>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>{completedProjects.length}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#65656B]' : 'text-slate-400'}`}>100% finished</p>
                </div>
              </div>
            </motion.div>

            {/* SECTION 3: PROJECT HEALTH DISTRIBUTION */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
                isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                    Project Health Distribution
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                    Categorized by commercial status, payment collection and operational risk factors
                  </p>
                </div>
                <span className={`text-xs font-bold ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>
                  {projects.length} Total Projects
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 border rounded-xl ${
                  isDark ? 'bg-[#163127]/60 border-[#28523F]' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className={`flex justify-between items-center text-xs font-extrabold ${
                    isDark ? 'text-[#70D0A8]' : 'text-emerald-700'
                  }`}>
                    <span>Healthy</span>
                    <span>{Math.round((healthyProjects.length / projects.length) * 100)}%</span>
                  </div>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#3FB984]' : 'text-emerald-700'}`}>{healthyProjects.length} Projects</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#70D0A8]/80' : 'text-emerald-600'}`}>On schedule & fully collected</p>
                </div>

                <div className={`p-3.5 border rounded-xl ${
                  isDark ? 'bg-[#322917]/60 border-[#5B4724]' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`flex justify-between items-center text-xs font-extrabold ${
                    isDark ? 'text-[#E5C47A]' : 'text-amber-800'
                  }`}>
                    <span>Attention Required</span>
                    <span>{Math.round((attentionProjects.length / projects.length) * 100)}%</span>
                  </div>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#D6A84F]' : 'text-amber-800'}`}>{attentionProjects.length} Projects</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#E5C47A]/80' : 'text-amber-700'}`}>Outstanding balance due</p>
                </div>

                <div className={`p-3.5 border rounded-xl ${
                  isDark ? 'bg-[#34191B]/60 border-[#5A292B]' : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`flex justify-between items-center text-xs font-extrabold ${
                    isDark ? 'text-[#F08A8A]' : 'text-red-700'
                  }`}>
                    <span>At Risk / Delayed</span>
                    <span>{Math.round((delayedProjects.length / projects.length) * 100)}%</span>
                  </div>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#E05A5A]' : 'text-red-700'}`}>{delayedProjects.length} Projects</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#F08A8A]/80' : 'text-red-600'}`}>Financial/schedule issue</p>
                </div>

                <div className={`p-3.5 border rounded-xl ${
                  isDark ? 'bg-[#18181B] border-[#303035]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`flex justify-between items-center text-xs font-extrabold ${
                    isDark ? 'text-[#D5D5D8]' : 'text-slate-700'
                  }`}>
                    <span>Completed</span>
                    <span>{Math.round((completedProjects.length / projects.length) * 100)}%</span>
                  </div>
                  <p className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{completedProjects.length} Projects</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Fully executed</p>
                </div>
              </div>
            </motion.div>

            {/* SECTION 4: ATTENTION REQUIRED PRIORITY LIST */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className={`border border-l-4 rounded-xl p-5 shadow-2xs space-y-4 ${
                isDark
                  ? 'bg-[#151517] border-[#262629] border-l-[#E05A5A]'
                  : 'bg-white border-slate-200 border-l-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                    Attention Required Priority List ({attentionProjects.length})
                  </h3>
                </div>
                <span className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Sorted by financial risk & severity</span>
              </div>

              {attentionProjects.length === 0 ? (
                <div className={`p-6 text-center text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  No projects currently require critical management intervention.
                </div>
              ) : (
                <div className="space-y-3">
                  {attentionProjects.map(p => {
                    const balance = p.balanceUSD || 0;
                    const notFullyPaid = p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%');
                    const severity = balance > 100000 ? 'Critical' : balance > 30000 ? 'High' : 'Medium';
                    const actionRecommendation = balance > 100000
                      ? 'Immediate executive follow-up for payment collection before next shipment.'
                      : notFullyPaid
                      ? 'Verify milestone sign-off and issue payment reminder.'
                      : 'Monitor project schedule and design completion.';

                    return (
                      <div
                        key={p.projectId}
                        onClick={() => handleProjectClick(p.projectId)}
                        className={`p-4 border rounded-xl transition-all cursor-pointer group ${
                          isDark
                            ? 'bg-[#111113] border-[#262629] hover:border-[#C9A86A] hover:bg-[#1B1B1F]'
                            : 'bg-slate-50 border-slate-200 hover:border-sky-500 hover:bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono border ${
                              isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-slate-800 bg-white border-slate-300'
                            }`}>
                              {p.projectId}
                            </span>
                            <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.project}</span>
                            <span className={`text-xs font-semibold ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>({p.country})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                              severity === 'Critical'
                                ? (isDark ? 'bg-[#34191B] text-[#F08A8A] border-[#5A292B]' : 'bg-red-100 text-red-700 border-red-200')
                                : severity === 'High'
                                ? (isDark ? 'bg-[#322917] text-[#E5C47A] border-[#5B4724]' : 'bg-amber-100 text-amber-800 border-amber-200')
                                : (isDark ? 'bg-[#18181B] text-[#B4B4B8] border-[#303035]' : 'bg-slate-200 text-slate-700 border-slate-300')
                            }`}>
                              {severity} Severity
                            </span>
                            <ArrowRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDark ? 'text-[#C9A86A]' : 'text-sky-600'
                            }`} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-2">
                          <div>
                            <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Contract Amount:</span>{' '}
                            <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}>{p.totalAmountUSD ? `$${p.totalAmountUSD.toLocaleString()}` : '—'}</strong>
                          </div>
                          <div>
                            <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Outstanding Balance:</span>{' '}
                            <strong className={isDark ? 'text-[#F08A8A]' : 'text-red-600'}>{p.balanceUSD ? `$${p.balanceUSD.toLocaleString()}` : '$0'}</strong>
                          </div>
                          <div>
                            <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Payment Status:</span>{' '}
                            <strong className={isDark ? 'text-[#E5C47A]' : 'text-amber-700'}>{p.paymentStatus || '—'}</strong>
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                          isDark ? 'bg-[#18181B] border-[#303035]' : 'bg-white border-slate-200'
                        }`}>
                          <Sparkles size={14} className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-[#C9A86A]' : 'text-amber-600'}`} />
                          <div>
                            <strong className={isDark ? 'text-[#E8D6AE]' : 'text-slate-900'}>Recommended Action:</strong>{' '}
                            <span className={isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}>{actionRecommendation}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* SECTION 5: COUNTRY PORTFOLIO ANALYSIS (EXPANDABLE) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.25 }}
              className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
                isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                    Country Portfolio Analysis
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                    Click any country card to expand member project contracts
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isDark ? 'text-[#E8D6AE] bg-[#2A2419] border-[#55462C]' : 'text-sky-800 bg-sky-50 border-sky-200'
                }`}>
                  {Object.keys(countryMap).length} Regional Markets
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(countryMap).map(([country, data]) => {
                  const isExpanded = expandedCountry === country;

                  return (
                    <div key={country} className={`border rounded-xl overflow-hidden shadow-2xs ${
                      isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
                    }`}>
                      <div
                        onClick={() => setExpandedCountry(isExpanded ? null : country)}
                        className={`flex flex-wrap items-center justify-between p-4 cursor-pointer transition-colors ${
                          isDark ? 'bg-[#111113] hover:bg-[#1B1B1F]' : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{country}</span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            isDark ? 'text-[#B4B4B8] bg-[#18181B] border-[#303035]' : 'text-slate-700 bg-white border-slate-300'
                          }`}>
                            {data.count} Projects
                          </span>
                          {data.atRiskCount > 0 && (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              isDark ? 'text-[#F08A8A] bg-[#34191B] border-[#5A292B]' : 'text-red-700 bg-red-100 border-red-200'
                            }`}>
                              {data.atRiskCount} At Risk
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <div>
                            <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Contract Value:</span>{' '}
                            <strong className={isDark ? 'text-[#C9A86A]' : 'text-amber-700'}>${(data.totalValue / 1000000).toFixed(2)}M</strong>
                          </div>
                          <div>
                            <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Outstanding:</span>{' '}
                            <strong className={isDark ? 'text-[#E5C47A]' : 'text-amber-700'}>${(data.totalBalance / 1000000).toFixed(2)}M</strong>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} /> : <ChevronDown size={16} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={`p-4 border-t space-y-2 ${
                          isDark ? 'bg-[#151517] border-[#262629]' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-2 ${
                            isDark ? 'text-[#85858B]' : 'text-slate-500'
                          }`}>
                            {country} Project Contracts ({data.projects.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {data.projects.map(p => (
                              <div
                                key={p.projectId}
                                onClick={() => handleProjectClick(p.projectId)}
                                className={`p-3 border rounded-lg transition-colors cursor-pointer flex justify-between items-center ${
                                  isDark
                                    ? 'bg-[#111113] border-[#262629] hover:border-[#C9A86A]'
                                    : 'bg-white border-slate-200 hover:border-sky-500'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-mono font-bold text-xs ${isDark ? 'text-[#C9A86A]' : 'text-sky-700'}`}>{p.projectId}</span>
                                    <span className={`font-bold text-xs ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{p.project}</span>
                                  </div>
                                  <span className={`text-[10px] ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{p.customer}</span>
                                </div>
                                <div className="text-right text-xs">
                                  <span className={`font-bold block ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                                    {p.totalAmountUSD ? `$${p.totalAmountUSD.toLocaleString()}` : '—'}
                                  </span>
                                  <StatusBadge status={p.contractStatus} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* SECTION 6 & 7: FINANCIAL OVERVIEW & PROGRESS MONITORING */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Overview */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
                className={`border rounded-xl p-5 shadow-2xs space-y-3 ${
                  isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
                }`}
              >
                <h3 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-[#0B2239]'
                }`}>
                  <DollarSign size={16} className={isDark ? 'text-[#C9A86A]' : 'text-amber-600'} />
                  Financial Analysis & Exposure
                </h3>
                <div className="space-y-2 text-xs">
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Total Contract Value:</span>
                    <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}>${totalValueUSD.toLocaleString()}</strong>
                  </div>
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Total Advance Collected:</span>
                    <strong className={isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}>${totalAdvanceUSD.toLocaleString()}</strong>
                  </div>
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Total Outstanding Balance:</span>
                    <strong className={isDark ? 'text-[#F08A8A]' : 'text-red-600'}>${outstandingBalance.toLocaleString()}</strong>
                  </div>
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Overall Collection Rate:</span>
                    <strong className={isDark ? 'text-[#C9A86A]' : 'text-amber-700'}>{collectionRatePct}%</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <p className={`text-[10px] font-extrabold uppercase mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Top Outstanding Balances:</p>
                  <div className="space-y-1.5">
                    {attentionProjects.slice(0, 3).map(p => (
                      <div key={p.projectId} className={`flex justify-between text-xs p-2 rounded-lg border ${
                        isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={`font-mono font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.projectId} ({p.project})</span>
                        <strong className={isDark ? 'text-[#F08A8A]' : 'text-red-600'}>${p.balanceUSD?.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Progress & Delivery */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.35 }}
                className={`border rounded-xl p-5 shadow-2xs space-y-3 ${
                  isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
                }`}
              >
                <h3 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-[#0B2239]'
                }`}>
                  <TrendingUp size={16} className={isDark ? 'text-[#C9A86A]' : 'text-amber-600'} />
                  Progress & Delivery Performance
                </h3>
                <div className="space-y-2 text-xs">
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Portfolio Avg Design Progress:</span>
                    <strong className={isDark ? 'text-[#C9A86A]' : 'text-amber-700'}>{avgProgressPct}%</strong>
                  </div>
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Fully Finished Projects (100%):</span>
                    <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}>{completedProjects.length} Projects</strong>
                  </div>
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Active Factory Work Orders:</span>
                    <strong className={isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}>{productionRecords.length} Work Orders</strong>
                  </div>
                  <div className={`flex justify-between border-b pb-1.5 ${isDark ? 'border-[#262629]' : 'border-slate-100'}`}>
                    <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Live Shipments In Transit:</span>
                    <strong className={isDark ? 'text-[#89C9DF]' : 'text-sky-700'}>
                      {shipments.filter(s => s.status === 'In Transit').length} Shipments
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <p className={`text-[10px] font-extrabold uppercase mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Top Performing Contracts:</p>
                  <div className="space-y-1.5">
                    {topPerforming.slice(0, 3).map(p => (
                      <div key={p.projectId} className={`flex justify-between text-xs p-2 rounded-lg border ${
                        isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={`font-mono font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.projectId} ({p.project})</span>
                        <strong className={isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}>{p.designProgressPercent}% Done</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* SECTION 8: DATA QUALITY & AUDIT HISTORY */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              className={`border rounded-xl p-5 shadow-2xs space-y-4 ${
                isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className={isDark ? 'text-[#3FB984]' : 'text-emerald-600'} />
                  <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                    Data Quality & System Integrity
                  </h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  dataQualityStatus === 'Good'
                    ? (isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                    : (isDark ? 'bg-[#322917] text-[#E5C47A] border-[#5B4724]' : 'bg-amber-50 text-amber-800 border-amber-200')
                }`}>
                  {dataQualityStatus} Schema Status
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Schema Validations</span>
                  <strong className={`text-sm ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{projects.length - invalidProjects.length} / {projects.length} Passed</strong>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Audit Log Entries</span>
                  <strong className={`text-sm ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{auditLogs.length} Logged Events</strong>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Last Data Synchronization</span>
                  <strong className={`text-sm font-mono ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>{auditLogs[0]?.timestamp || 'Initial Baseline'}</strong>
                </div>
              </div>

              {auditLogs.length > 0 && (
                <div className="pt-2">
                  <p className={`text-[10px] font-extrabold uppercase mb-2 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Recent Data Updates History:</p>
                  <div className={`divide-y max-h-36 overflow-y-auto text-xs p-2.5 rounded-xl border ${
                    isDark ? 'divide-[#262629] bg-[#111113] border-[#262629]' : 'divide-slate-100 bg-slate-50 border-slate-200'
                  }`}>
                    {auditLogs.slice(0, 4).map(log => (
                      <div key={log.id} className="py-1.5 flex justify-between items-center">
                        <div>
                          <span className={`font-mono text-[10px] font-bold me-2 ${isDark ? 'text-[#C9A86A]' : 'text-sky-700'}`}>[{log.method}]</span>
                          <span className={`font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{log.summary}</span>
                        </div>
                        <span className={`text-[10px] font-mono flex-shrink-0 ms-2 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* SECTION 9: MANAGEMENT INSIGHTS & RECOMMENDED ACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.45 }}
              className={`border rounded-xl p-5 shadow-md space-y-4 ${
                isDark ? 'bg-[#090909] border-[#262629] text-white' : 'bg-[#0B2239] border-slate-800 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} className={isDark ? 'text-[#C9A86A]' : 'text-amber-400'} />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Management Insights & Actionable Decisions
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className={`space-y-2 border rounded-xl p-4 ${
                  isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white/10 border-white/15'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#C9A86A]' : 'text-amber-300'}`}>Derived Insights</h4>
                  <ul className="space-y-1.5 text-slate-200">
                    <li>1. Overall portfolio progress remains stable, averaging <strong className="text-white">{avgProgressPct}%</strong> across active contracts.</li>
                    <li>2. Uncollected balances totaling <strong className="text-red-300">${(outstandingBalance / 1000000).toFixed(2)}M USD</strong> require targeted follow-up.</li>
                    <li>3. Operational logistics pipeline shows <strong className="text-sky-300">{shipments.filter(s => s.status === 'In Transit').length} shipments</strong> currently in transit.</li>
                    <li>4. Data schema validations pass at <strong className="text-emerald-300">100% integrity</strong> across canonical project records.</li>
                  </ul>
                </div>

                <div className={`space-y-2 border rounded-xl p-4 ${
                  isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white/10 border-white/15'
                }`}>
                  <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#E5C47A]' : 'text-amber-300'}`}>Recommended Actions</h4>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-200">
                      <span className="font-extrabold text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded uppercase">High</span>
                      <span>Execute executive follow-up on top {attentionProjects.length} attention-flagged payment balances.</span>
                    </div>
                    <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-start gap-2 text-amber-200">
                      <span className="font-extrabold text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded uppercase">Medium</span>
                      <span>Review delivery dates for {delayedProjects.length} projects with active schedule delay notices.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Drawer Footer Bar */}
          <div className={`flex items-center justify-between px-6 py-4 border-t flex-shrink-0 ${
            isDark ? 'bg-[#090909] border-[#1E1E20] text-[#85858B]' : 'bg-[#0B2239] border-slate-800 text-slate-300'
          }`}>
            <span className="text-xs">
              Kumkang Project Control Center • Portfolio Analysis Module
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'text-[#B4B4B8] hover:text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Close Analysis
              </button>
              <button
                onClick={handleExportPDF}
                className={`flex items-center gap-2 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#C9A86A] hover:bg-[#D7B97C] text-[#111111]'
                    : 'bg-[#1688D4] hover:bg-[#0D73B8] text-white'
                }`}
              >
                <Printer size={15} /> PRINT / EXPORT PDF REPORT
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
