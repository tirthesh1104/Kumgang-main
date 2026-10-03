import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Settings, Search, 
  CheckCircle2, XCircle, PauseCircle, Clock, Undo2, 
  Mail, Download, Printer, Edit3, 
  History, Eye, ShieldCheck, Send
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import type { ProformaInvoiceRecord, PIApprovalAction, PIApprovalStage } from '../../types/proformaInvoice';
import { exportPIExcel, exportPIPDF } from '../../utils/proformaInvoiceUtils';
import { CreatePIModal } from './CreatePIModal';
import { PIDetailModal } from './PIDetailModal';
import { ReviewActionModal } from './ReviewActionModal';
import { EmailSimulationModal } from './EmailSimulationModal';
import { StakeholderConfigModal } from './StakeholderConfigModal';
import { EditPIModal } from './EditPIModal';
import { RecallPIModal } from './RecallPIModal';

export function ProformaInvoicePage() {
  const { 
    proformaInvoices, 
    stakeholderEmails, 
    submitPIForApproval 
  } = useData();
  const { t } = useLanguage();
  const { theme } = useApp();
  const { activeSession } = useClientAccess();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedPIDetail, setSelectedPIDetail] = useState<ProformaInvoiceRecord | null>(null);
  const [selectedPIReview, setSelectedPIReview] = useState<{ pi: ProformaInvoiceRecord; action: PIApprovalAction; token?: string } | null>(null);
  const [selectedPIEmailSim, setSelectedPIEmailSim] = useState<ProformaInvoiceRecord | null>(null);
  const [selectedPIEdit, setSelectedPIEdit] = useState<ProformaInvoiceRecord | null>(null);
  const [selectedPIRecall, setSelectedPIRecall] = useState<ProformaInvoiceRecord | null>(null);

  // Auto-detect direct approval action links from external emails (?piActionToken=...&action=...)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const token = params.get('piActionToken');
      const actionParam = params.get('action') as PIApprovalAction | null;

      if (token && proformaInvoices.length > 0) {
        const tokenParts = token.split('-');
        const piId = tokenParts[1];
        const targetPI = proformaInvoices.find(p => p.id === piId || p.piNumber === piId);

        if (targetPI) {
          const validAction = (actionParam === 'APPROVE' || actionParam === 'REJECT' || actionParam === 'PUT_ON_HOLD')
            ? actionParam
            : 'APPROVE';

          setSelectedPIReview({
            pi: targetPI,
            action: validAction,
            token: token
          });

          // Clear query params cleanly without page reload
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    } catch (e) {
      console.error('Failed to parse direct action token from URL:', e);
    }
  }, [proformaInvoices]);

  // Security / Project Isolation
  const accessiblePIs = useMemo(() => {
    if (activeSession.role === 'Client') {
      const allowed = activeSession.assignedProjects || [];
      return proformaInvoices.filter(pi => allowed.includes(pi.projectId));
    }
    return proformaInvoices;
  }, [proformaInvoices, activeSession]);

  // KPIs
  const stats = useMemo(() => {
    const total = accessiblePIs.length;
    const pendingPM = accessiblePIs.filter(pi => pi.status === 'PENDING_PM').length;
    const pendingSales = accessiblePIs.filter(pi => pi.status === 'PENDING_SALES_DIRECTOR').length;
    const pendingMD = accessiblePIs.filter(pi => pi.status === 'PENDING_MANAGING_DIRECTOR').length;
    const totalPending = pendingPM + pendingSales + pendingMD;
    const approved = accessiblePIs.filter(pi => pi.status === 'APPROVED').length;
    const rejectedOrHold = accessiblePIs.filter(pi => pi.status === 'REJECTED' || pi.status === 'ON_HOLD' || pi.status === 'RECALLED').length;
    return { total, pendingPM, pendingSales, pendingMD, totalPending, approved, rejectedOrHold };
  }, [accessiblePIs]);

  // Filtered PIs based on tab, search, and status
  const displayedPIs = useMemo(() => {
    return accessiblePIs.filter(pi => {
      // Tab matching
      if (activeTab === 'pending') {
        const isPending = pi.status === 'PENDING_PM' ||
          pi.status === 'PENDING_SALES_DIRECTOR' ||
          pi.status === 'PENDING_MANAGING_DIRECTOR' ||
          pi.status === 'ON_HOLD';
        if (!isPending) return false;
      } else if (activeTab === 'approved') {
        if (pi.status !== 'APPROVED') return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && pi.status !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesNumber = pi.piNumber.toLowerCase().includes(query);
        const matchesProject = pi.projectName.toLowerCase().includes(query) || pi.projectId.toLowerCase().includes(query);
        const matchesClient = pi.clientName.toLowerCase().includes(query);
        if (!matchesNumber && !matchesProject && !matchesClient) return false;
      }

      return true;
    });
  }, [accessiblePIs, activeTab, statusFilter, searchTerm]);

  // Aggregate approval history across all PIs
  const allApprovalHistory = useMemo(() => {
    const list: {
      piNumber: string;
      projectName: string;
      stage: string;
      reviewer: string;
      action?: string;
      status: string;
      reviewedDateTime?: string;
      comment?: string;
      reason?: string;
    }[] = [];

    accessiblePIs.forEach(pi => {
      pi.approvalHistory.forEach(step => {
        if (step.reviewedAt || step.action) {
          list.push({
            piNumber: pi.piNumber,
            projectName: pi.projectName,
            stage: step.stageLabel || step.stage,
            reviewer: step.reviewerName,
            action: step.action,
            status: step.status,
            reviewedDateTime: step.reviewedAt,
            comment: step.comment,
            reason: step.reason,
          });
        }
      });
    });

    return list.sort((a, b) => {
      const dateA = a.reviewedDateTime ? new Date(a.reviewedDateTime).getTime() : 0;
      const dateB = b.reviewedDateTime ? new Date(b.reviewedDateTime).getTime() : 0;
      return dateB - dateA;
    });
  }, [accessiblePIs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 size={12} /> {t('approved')}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
            <XCircle size={12} /> {t('rejected')}
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
            <PauseCircle size={12} /> {t('onHold')}
          </span>
        );
      case 'RECALLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1">
            <Undo2 size={12} /> {t('recalled')}
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40 flex items-center gap-1">
            <Edit3 size={12} /> {t('draft')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center gap-1">
            <Clock size={12} /> {status}
          </span>
        );
    }
  };

  const isClient = activeSession.role === 'Client';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <FileText className="text-indigo-500" size={24} />
            <span>{t('piApprovalsWorkflow')}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('approvalChain')}: {t('projectManager')} → {t('salesDirector')} → {t('managingDirector')}
          </p>
        </div>

        {!isClient && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsConfigOpen(true)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#18181B] border-[#2E2E32] text-slate-300 hover:bg-[#222226]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Configure Stakeholder Email Addresses"
            >
              <Settings size={15} />
              <span>{t('stakeholderEmailConfig')}</span>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>{t('generatePI')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Demo / Local Simulation Notice Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        isDark
          ? 'bg-indigo-950/20 border-indigo-800/40 text-indigo-300'
          : 'bg-indigo-50 border-indigo-200 text-indigo-800'
      }`}>
        <ShieldCheck size={20} className="shrink-0 mt-0.5 text-indigo-400" />
        <div className="text-xs leading-relaxed">
          <strong className="block font-bold mb-0.5 uppercase tracking-wider text-indigo-400">
            {t('localEmailSimulationMode')}
          </strong>
          Proforma Invoices are generated automatically from live project parameters. Email approval notifications simulate stakeholder delivery via signed action tokens, allowing instant testing of PM, Sales Director, and MD approval stages without external mail servers.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total PIs */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#141416] border-[#222226]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('totalPIs')}
            </span>
            <FileText size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-mono">{stats.total}</p>
          <span className="text-[11px] text-slate-400">All generated records</span>
        </div>

        {/* Pending Approvals */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#141416] border-[#222226]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('pendingApprovals')}
            </span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-mono text-amber-400">{stats.totalPending}</p>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>PM: {stats.pendingPM}</span> •
            <span>Sales: {stats.pendingSales}</span> •
            <span>MD: {stats.pendingMD}</span>
          </div>
        </div>

        {/* Approved Items */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#141416] border-[#222226]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('approvedItems')}
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-mono text-emerald-400">{stats.approved}</p>
          <span className="text-[11px] text-slate-400">Final authorization completed</span>
        </div>

        {/* On Hold / Rejected */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-[#141416] border-[#222226]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('onHold')} / {t('rejected')}
            </span>
            <PauseCircle size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-mono text-rose-400">{stats.rejectedOrHold}</p>
          <span className="text-[11px] text-slate-400">Awaiting creator action</span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className={`p-4 rounded-xl border space-y-4 ${
        isDark ? 'bg-[#141416] border-[#222226]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-700/20">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-[#1E1E22]' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock size={14} />
              <span>{t('pendingApprovals')} ({stats.totalPending})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-[#1E1E22]' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText size={14} />
              <span>{t('allPIs')} ({stats.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-[#1E1E22]' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>{t('approvedItems')} ({stats.approved})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-[#1E1E22]' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History size={14} />
              <span>{t('approvalHistory')}</span>
            </button>
          </div>

          {/* Search & Filter */}
          {activeTab !== 'history' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchPI')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-8 pr-3 py-1.5 rounded-lg text-xs border focus:outline-hidden ${
                    isDark
                      ? 'bg-[#18181C] border-[#2E2E32] text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>

              {activeTab === 'all' && (
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs border focus:outline-hidden ${
                      isDark
                        ? 'bg-[#18181C] border-[#2E2E32] text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_PM">Pending PM</option>
                    <option value="PENDING_SALES_DIRECTOR">Pending Sales Dir</option>
                    <option value="PENDING_MANAGING_DIRECTOR">Pending MD</option>
                    <option value="APPROVED">Approved</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="RECALLED">Recalled</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab 1, 2, 3: PI List */}
        {activeTab !== 'history' && (
          <div className="space-y-4">
            {displayedPIs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <FileText size={32} className="mx-auto opacity-40" />
                <p className="text-sm font-semibold">{t('noPIsFound')}</p>
                <p className="text-xs">
                  {accessiblePIs.length === 0
                    ? 'Click "Generate Proforma Invoice" to create your first PI from live project data.'
                    : 'No Proforma Invoices match the selected filters.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {displayedPIs.map((pi) => {
                  const canSubmit = pi.status === 'DRAFT' || pi.status === 'RECALLED' || pi.status === 'REJECTED';
                  const canReview = !isClient && (pi.status === 'PENDING_PM' || pi.status === 'PENDING_SALES_DIRECTOR' || pi.status === 'PENDING_MANAGING_DIRECTOR' || pi.status === 'ON_HOLD');
                  const canRecall = !isClient && (pi.status === 'PENDING_PM' || pi.status === 'PENDING_SALES_DIRECTOR' || pi.status === 'PENDING_MANAGING_DIRECTOR' || pi.status === 'ON_HOLD');
                  const canEdit = !isClient && pi.status !== 'APPROVED';

                  const stages: { stage: PIApprovalStage; label: string; email: string }[] = [
                    { stage: 'PM_REVIEW', label: 'Project Mgr', email: stakeholderEmails.pmEmail },
                    { stage: 'SALES_DIRECTOR_REVIEW', label: 'Sales Dir', email: stakeholderEmails.salesDirectorEmail },
                    { stage: 'MANAGING_DIRECTOR_REVIEW', label: 'Managing Dir', email: stakeholderEmails.managingDirectorEmail },
                  ];

                  return (
                    <motion.div
                      key={pi.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-xl border transition-all ${
                        isDark ? 'bg-[#18181C] border-[#2A2A2E]' : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Top Bar: PI Number, Date, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/20">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-base text-white">{pi.piNumber}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            v{pi.currentVersion}
                          </span>
                          {getStatusBadge(pi.status)}
                          {pi.emailDeliveryLogs && pi.emailDeliveryLogs.length > 0 && (() => {
                            const latest = pi.emailDeliveryLogs[pi.emailDeliveryLogs.length - 1];
                            if (latest.status === 'SENT') {
                              return (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1" title={`Email delivered via Resend (${latest.recipientEmail})`}>
                                  <Mail size={10} /> {t('deliverySent')}
                                </span>
                              );
                            }
                            if (latest.status === 'FAILED') {
                              return (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1" title={`Delivery failed: ${latest.error}`}>
                                  <XCircle size={10} /> {t('deliveryFailed')}
                                </span>
                              );
                            }
                            return (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1" title="Email simulated / awaiting provider configuration">
                                <Mail size={10} /> {t('deliverySimulated')}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">{t('documentDate')}:</span>
                          <span className="font-semibold">{pi.documentDate || pi.createdAt.split(',')[0]}</span>
                        </div>
                      </div>

                      {/* Middle: Project Info & Commercial Values */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-400 block">{t('project')}</span>
                          <span className="font-semibold text-white truncate block">{pi.projectName}</span>
                          <span className="text-[10px] text-slate-500">{pi.projectId}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">{t('client')}</span>
                          <span className="font-semibold text-white truncate block">{pi.clientName}</span>
                          <span className="text-[10px] text-slate-500">Kumgang {pi.vendorCompany}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">{t('contractQty')} / Price</span>
                          <span className="font-semibold text-white block">
                            {(pi.lineItems[0]?.quantity || 0).toLocaleString()} m²
                          </span>
                          <span className="text-[10px] text-slate-500">${pi.lineItems[0]?.unitPriceUSD || 0}/m²</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">{t('totalAmount')}</span>
                          <span className="font-bold text-sm text-emerald-400 font-mono block">
                            ${pi.totalAmountUSD.toLocaleString()} {pi.currency}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Adv: {pi.advanceUSD ? '$' + pi.advanceUSD.toLocaleString() : '$0'} • Bal: {pi.balanceUSD ? '$' + pi.balanceUSD.toLocaleString() : '$0'}
                          </span>
                        </div>
                      </div>

                      {/* Stage Progress Pipeline Visualizer */}
                      <div className={`p-3 rounded-lg border my-2 ${
                        isDark ? 'bg-[#141416] border-[#242428]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                            {t('stageProgress')}:
                          </span>
                          <span className="text-[11px] text-indigo-400 font-medium">
                            {t('currentStage')}: <strong>{pi.currentStage}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {stages.map((stg, idx) => {
                            const stepRecord = pi.approvalHistory.find(s => s.stage === stg.stage);
                            const isCurrent = pi.currentStage === stg.stage;
                            const isApproved = stepRecord?.status === 'APPROVED';
                            const isRejected = stepRecord?.status === 'REJECTED';
                            const isHold = stepRecord?.status === 'ON_HOLD';

                            return (
                              <div
                                key={stg.stage}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                  isApproved
                                    ? isDark ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : isRejected
                                    ? isDark ? 'bg-rose-950/30 border-rose-800/50 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-800'
                                    : isHold
                                    ? isDark ? 'bg-amber-950/30 border-amber-800/50 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-800'
                                    : isCurrent
                                    ? isDark ? 'bg-indigo-950/30 border-indigo-800/60 text-indigo-300' : 'bg-indigo-50 border-indigo-300 text-indigo-800'
                                    : isDark ? 'bg-[#18181C] border-[#2A2A2E] text-slate-500 opacity-60' : 'bg-white border-slate-200 text-slate-400 opacity-60'
                                }`}
                              >
                                <div className="truncate">
                                  <span className="font-bold block text-[11px]">
                                    {idx + 1}. {stg.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate block">
                                    {stg.email ? stg.email.split('@')[0] : 'No Email'}
                                  </span>
                                </div>
                                <div className="shrink-0 ml-1">
                                  {isApproved && <CheckCircle2 size={14} className="text-emerald-400" />}
                                  {isRejected && <XCircle size={14} className="text-rose-400" />}
                                  {isHold && <PauseCircle size={14} className="text-amber-400" />}
                                  {!isApproved && !isRejected && !isHold && isCurrent && (
                                    <Clock size={14} className="text-indigo-400 animate-pulse" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Actions Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-700/20">
                        {/* Document Exports */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedPIDetail(pi)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>{t('view')}</span>
                          </button>

                          <button
                            onClick={() => exportPIExcel(pi)}
                            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              isDark ? 'bg-[#202024] border-[#303036] text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Export Excel (.xlsx)"
                          >
                            <Download size={14} />
                          </button>

                          <button
                            onClick={() => exportPIPDF(pi)}
                            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              isDark ? 'bg-[#202024] border-[#303036] text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Print / PDF"
                          >
                            <Printer size={14} />
                          </button>

                          {/* Email simulation modal trigger */}
                          <button
                            onClick={() => setSelectedPIEmailSim(pi)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Open simulated email inbox with one-click approval links"
                          >
                            <Mail size={13} />
                            <span>{t('emailSimulationTitle')}</span>
                          </button>
                        </div>

                        {/* Workflow Action Buttons */}
                        {!isClient && (
                          <div className="flex items-center gap-2">
                            {/* Submit for Approval */}
                            {canSubmit && (
                              <button
                                onClick={() => submitPIForApproval(pi.id, 'Project Manager')}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <Send size={13} />
                                <span>{t('submitForApproval')}</span>
                              </button>
                            )}

                            {/* Review Action (Approve / Reject / Hold) */}
                            {canReview && (
                              <button
                                onClick={() => setSelectedPIReview({ pi, action: 'APPROVE' })}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                <span>{t('reviewAction')}</span>
                              </button>
                            )}

                            {/* Recall Request */}
                            {canRecall && (
                              <button
                                onClick={() => setSelectedPIRecall(pi)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                  isDark ? 'bg-[#202024] border-[#303036] text-amber-400 hover:bg-amber-500/10' : 'bg-slate-100 border-slate-200 text-amber-700 hover:bg-amber-50'
                                }`}
                                title="Recall this request from active approval queue"
                              >
                                <Undo2 size={13} />
                                <span>{t('recallRequest')}</span>
                              </button>
                            )}

                            {/* Edit Request */}
                            {canEdit && (
                              <button
                                onClick={() => setSelectedPIEdit(pi)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                  isDark ? 'bg-[#202024] border-[#303036] text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Edit specifications and create new version"
                              >
                                <Edit3 size={13} />
                                <span>{t('editRequest')}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Full Approval History Audit Table */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              {t('approvalHistory')} Audit Trail:
            </h4>

            {allApprovalHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No approval actions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                <table className="w-full text-xs text-left">
                  <thead className={`uppercase text-[11px] font-bold ${
                    isDark ? 'bg-[#1C1C20] text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">{t('piNumber')}</th>
                      <th className="py-3 px-4">{t('project')}</th>
                      <th className="py-3 px-4">{t('currentStage')}</th>
                      <th className="py-3 px-4">{t('assignedReviewer')}</th>
                      <th className="py-3 px-4">{t('status')}</th>
                      <th className="py-3 px-4">Date/Time</th>
                      <th className="py-3 px-4">Reason / Comment</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#26262A]' : 'divide-slate-200'}`}>
                    {allApprovalHistory.map((item, idx) => (
                      <tr key={idx} className={isDark ? 'hover:bg-[#1E1E22]' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-4 font-bold text-white">{item.piNumber}</td>
                        <td className="py-2.5 px-4 text-slate-300">{item.projectName}</td>
                        <td className="py-2.5 px-4 font-semibold text-indigo-400">{item.stage}</td>
                        <td className="py-2.5 px-4 text-slate-300">{item.reviewer || 'NA'}</td>
                        <td className="py-2.5 px-4">{getStatusBadge(item.status)}</td>
                        <td className="py-2.5 px-4 text-slate-400">
                          {item.reviewedDateTime ? new Date(item.reviewedDateTime).toLocaleString() : 'NA'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">
                          {item.reason && <span className="text-rose-400 font-semibold block">[{item.reason}]</span>}
                          {item.comment || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreatePIModal
            onClose={() => setIsCreateOpen(false)}
            onCreated={(newId) => {
              const created = proformaInvoices.find(p => p.id === newId);
              if (created) setSelectedPIDetail(created);
            }}
          />
        )}

        {isConfigOpen && (
          <StakeholderConfigModal
            onClose={() => setIsConfigOpen(false)}
          />
        )}

        {selectedPIDetail && (
          <PIDetailModal
            pi={selectedPIDetail}
            onClose={() => setSelectedPIDetail(null)}
          />
        )}

        {selectedPIReview && (
          <ReviewActionModal
            pi={selectedPIReview.pi}
            defaultAction={selectedPIReview.action}
            token={selectedPIReview.token}
            onClose={() => setSelectedPIReview(null)}
            onSuccess={() => setSelectedPIReview(null)}
          />
        )}

        {selectedPIEmailSim && (
          <EmailSimulationModal
            pi={selectedPIEmailSim}
            onClose={() => setSelectedPIEmailSim(null)}
            onTriggerAction={(action) => {
              setSelectedPIReview({ pi: selectedPIEmailSim, action });
            }}
          />
        )}

        {selectedPIEdit && (
          <EditPIModal
            pi={selectedPIEdit}
            onClose={() => setSelectedPIEdit(null)}
          />
        )}

        {selectedPIRecall && (
          <RecallPIModal
            pi={selectedPIRecall}
            onClose={() => setSelectedPIRecall(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
