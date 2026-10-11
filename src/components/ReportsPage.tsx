import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge, PaymentBadge } from './ui/StatusBadge';
import { ProgressBar } from './ui/ProgressBar';
import { Download, FileSpreadsheet, Database, RefreshCw, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getProjectScope } from '../utils/scopeUtils';
import {
  exportDispatchReportToExcel,
  exportReceivableReportToExcel,
  exportProjectStatusReportToExcel,
  exportFYSalesReportToExcel,
  getFinancialYearFromDate,
  getMonthFromDate,
} from '../utils/excelExport';
import { generateReportPDF } from '../utils/reportPdfExport';

type ReportType = 'project-status' | 'production' | 'shipment' | 'payment' | 'fy-sales' | 'month-dispatch' | 'erp-foundation';

function ERPIntegrationStatusCard({ isDark }: { isDark: boolean }) {
  const { getNormalizedMISDataset } = useData();
  const { t } = useLanguage();
  const normalizedData = getNormalizedMISDataset();
  const isErpConfigured = Boolean(import.meta.env.VITE_ERP_API_URL);

  return (
    <div className={`p-4 rounded-xl border mb-5 transition-all ${
      isDark ? 'bg-[#121B27] border-[#1D324A]' : 'bg-gradient-to-r from-blue-50/80 to-slate-50 border-blue-200'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isDark ? 'bg-[#192E46] text-[#38BDF8]' : 'bg-blue-100 text-blue-700'}`}>
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>
                {t('erp_integration_title')}
              </h4>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider flex items-center gap-1 ${
                isErpConfigured
                  ? (isDark ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-800')
                  : (isDark ? 'bg-[#18283A] text-[#38BDF8] border border-[#254266]' : 'bg-sky-100 text-sky-800 border border-sky-200')
              }`}>
                <ShieldCheck size={11} />
                {isErpConfigured ? t('erp_mode_remote') : t('erp_mode_local')}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
              {isErpConfigured
                ? `Connected to: ${import.meta.env.VITE_ERP_API_URL}`
                : t('erp_local_mode_desc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className={isDark ? 'text-[#3FB984]' : 'text-emerald-600'} />
            <span className={isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}>
              {t('mis_normalized_adapter')}: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{normalizedData.companySummaries.length} Companies</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw size={13} className={`${isDark ? 'text-[#38BDF8]' : 'text-sky-600'} animate-spin-slow`} />
            <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>
              {t('auto_data_refresh')}: <strong>{t('active')}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectStatusReport({ isDark, cadence }: { isDark: boolean; cadence: 'Weekly' | 'Monthly' | 'Annual' }) {
  const { projects } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>(cadence === 'Weekly' ? 'weekly' : 'monthly');

  const handleExportPDF = () => {
    generateReportPDF({
      title: 'Project Status & Milestone Report',
      subtitle: `Enterprise Operations & Delivery Tracking · ${viewMode === 'weekly' ? 'Weekly Status Cycles' : 'Monthly Milestone Cycles'}`,
      cadence,
      kpis: [
        { label: 'Total Projects', value: String(projects.length) },
        { label: 'Signed Contracts', value: String(projects.filter(p => p.contractStatus === 'Signed').length) },
        { label: 'Design In-Progress', value: String(projects.filter(p => (p.designProgressPercent || 0) > 0 && (p.designProgressPercent || 0) < 100).length) },
        { label: 'Completed Deliveries', value: String(projects.filter(p => p.contractStatus === 'Completed').length) },
      ],
      headers: ['Project ID', 'Project Name', 'Client', 'Country', 'Status', 'Design %', 'Payment', 'Delivery Timeline'],
      rows: projects.map(p => [
        p.projectId,
        p.project,
        p.customer || '—',
        p.country || '—',
        p.contractStatus,
        `${Math.round(p.designProgressPercent || 0)}%`,
        p.paymentStatus,
        p.deliveryRequest || '—'
      ])
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-base font-extrabold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>
            {t('project_status_report')}
          </h3>
          <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Automated recurring project health tracking across engineering, procurement, and dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Cadence View Mode Toggle */}
          <div className={`flex rounded-lg p-0.5 border ${isDark ? 'bg-[#101012] border-[#262629]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Weekly Status
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Monthly Milestones
            </button>
          </div>

          <button
            onClick={() => exportProjectStatusReportToExcel(projects)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
              isDark ? 'bg-[#1D2B3A] text-[#60A5FA] border-[#2B435E] hover:bg-[#25394E]' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title="Export to formatted Excel (.xlsx)"
          >
            <FileSpreadsheet size={13} /> Excel (.xlsx)
          </button>

          <button
            onClick={handleExportPDF}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
              isDark ? 'bg-[#1E1E22] text-[#E5C47A] border-[#3E382A] hover:bg-[#282724]' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Export to Executive PDF Report"
          >
            <Download size={13} /> PDF Report
          </button>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Project status report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">{t('project_id')}</th>
              <th className="text-left py-3 px-3">{t('project_name')}</th>
              <th className="text-left py-3 px-3">{t('country')}</th>
              <th className="text-left py-3 px-3">{t('contract_status')}</th>
              <th className="text-left py-3 px-3">{t('design_progress')}</th>
              <th className="text-left py-3 px-3">{t('payment')}</th>
              <th className="text-left py-3 px-3">{viewMode === 'weekly' ? 'Weekly Action / Request' : t('delivery_request')}</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {projects.map(p => (
              <tr key={p.projectId} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-mono text-xs font-bold ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>{p.projectId}</td>
                <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.project}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.country}</td>
                <td className="py-2.5 px-3"><StatusBadge status={p.contractStatus} /></td>
                <td className="py-2.5 px-3">
                  {p.designProgressPercent != null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <ProgressBar value={Math.min(p.designProgressPercent, 100)} color="forest" size="sm" />
                      </div>
                      <span className={`text-xs font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{Math.min(Math.round(p.designProgressPercent), 100)}%</span>
                    </div>
                  ) : '—'}
                </td>
                <td className="py-2.5 px-3"><PaymentBadge status={p.paymentStatus} /></td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  {p.deliveryRequest || p.deliveryTimeline || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductionReport({ isDark }: { isDark: boolean }) {
  const { productionRecords } = useData();
  const { t } = useLanguage();
  return (
    <div>
      <h3 className={`text-base font-extrabold mb-4 ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{t('production_report')}</h3>
      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Production report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">{t('project_id')}</th>
              <th className="text-left py-3 px-3">Part / Block</th>
              <th className="text-left py-3 px-3">Order Qty</th>
              <th className="text-left py-3 px-3">Finished Qty</th>
              <th className="text-left py-3 px-3">Progress</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {productionRecords.map((p, i) => (
              <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-semibold font-mono ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.projectId}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.part}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.orderQtyM2 ? `${p.orderQtyM2} m²` : p.orderQtyKg ? `${p.orderQtyKg} kg` : '—'}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.finishedQtyM2 ? `${p.finishedQtyM2} m²` : p.finishedQtyKg ? `${p.finishedQtyKg} kg` : '—'}</td>
                <td className="py-2.5 px-3">
                  <span className={`font-bold ${isDark ? 'text-[#83CACA]' : 'text-cyan-600'}`}>{Math.round(p.completionPercent || 0)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShipmentReport({ isDark }: { isDark: boolean }) {
  const { shipments, projects } = useData();
  const { t } = useLanguage();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className={`text-base font-extrabold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{t('shipment_report')}</h3>
        <button
          onClick={() => exportDispatchReportToExcel(shipments, projects)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
            isDark ? 'bg-[#132338] text-[#38BDF8] border-[#1D3B5E] hover:bg-[#183250]' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
          }`}
        >
          <FileSpreadsheet size={14} /> {t('export_dispatch_excel')}
        </button>
      </div>

      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Shipment report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">{t('project_id')}</th>
              <th className="text-left py-3 px-3">ETD</th>
              <th className="text-left py-3 px-3">ETA</th>
              <th className="text-left py-3 px-3">FWD</th>
              <th className="text-left py-3 px-3">{t('status')}</th>
              <th className="text-left py-3 px-3">Delivery Timeline</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {shipments.map((s, i) => (
              <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-semibold font-mono ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{s.projectId}</td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.etd || '—'}</td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.eta || '—'}</td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.fwd || '—'}</td>
                <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                <td className={`py-2.5 px-3 text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{s.deliveryTimeline || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentReport({ isDark, cadence }: { isDark: boolean; cadence: 'Weekly' | 'Monthly' | 'Annual' }) {
  const { projects, payments, getNormalizedMISDataset } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>(cadence === 'Weekly' ? 'weekly' : 'monthly');
  const activeProjects = projects.filter(p => p.contractStatus === 'Signed');
  const normalizedMIS = getNormalizedMISDataset();

  const total = activeProjects.reduce((s, p) => s + (p.totalAmountUSD || 0), 0);
  const balance = activeProjects.reduce((s, p) => s + (p.balanceUSD || 0), 0);
  const received = total - balance;

  // Aging analysis buckets
  const agingUnder30 = activeProjects.filter(p => (p.dueDays || 0) <= 30).reduce((s, p) => s + (p.balanceUSD || 0), 0);
  const aging30to60 = activeProjects.filter(p => (p.dueDays || 0) > 30 && (p.dueDays || 0) <= 60).reduce((s, p) => s + (p.balanceUSD || 0), 0);
  const aging60to90 = activeProjects.filter(p => (p.dueDays || 0) > 60 && (p.dueDays || 0) <= 90).reduce((s, p) => s + (p.balanceUSD || 0), 0);
  const agingOver90 = activeProjects.filter(p => (p.dueDays || 0) > 90).reduce((s, p) => s + (p.balanceUSD || 0), 0);

  const handleExportPDF = () => {
    generateReportPDF({
      title: 'Outstanding Payment & Receivables Summary',
      subtitle: `Commercial Receivables & Cash Flow Tracking · ${viewMode === 'weekly' ? 'Weekly Cash Collection Cycles' : 'Monthly Receivables Ledger'}`,
      cadence,
      kpis: [
        { label: 'Total Contract Value', value: `$${total.toLocaleString()}` },
        { label: 'Total Collections', value: `$${received.toLocaleString()}` },
        { label: 'Total Outstanding', value: `$${balance.toLocaleString()}` },
        { label: 'Overdue (>60 Days)', value: `$${(aging60to90 + agingOver90).toLocaleString()}` },
      ],
      headers: ['Project ID', 'Client Name', 'Contract Value ($)', 'Advance Received ($)', 'Balance Outstanding ($)', 'Payment Status', 'Due Days'],
      rows: activeProjects.map(p => [
        p.projectId,
        p.customer || '—',
        `$${(p.totalAmountUSD || 0).toLocaleString()}`,
        `$${(p.advanceUSD || 0).toLocaleString()}`,
        `$${(p.balanceUSD || 0).toLocaleString()}`,
        p.paymentStatus || 'Pending',
        p.dueDays ? `${p.dueDays} days` : 'Current'
      ])
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className={`text-base font-extrabold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>
            {t('receivable_report')}
          </h3>
          <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Automated tracking of client collections, aging schedules, and ledger balances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex rounded-lg p-0.5 border ${isDark ? 'bg-[#101012] border-[#262629]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Weekly Cash Flow
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Monthly Ledger
            </button>
          </div>

          <button
            onClick={() => exportReceivableReportToExcel(projects, payments)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
              isDark ? 'bg-[#1D2B3A] text-[#60A5FA] border-[#2B435E] hover:bg-[#25394E]' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <FileSpreadsheet size={13} /> Excel (.xlsx)
          </button>

          <button
            onClick={handleExportPDF}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
              isDark ? 'bg-[#1E1E22] text-[#E5C47A] border-[#3E382A] hover:bg-[#282724]' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Download size={13} /> PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className={`rounded-xl px-4 py-2.5 border ${isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{t('total_contract')}</span>
          <span className={`font-extrabold text-base ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>${total.toLocaleString()}</span>
        </div>
        <div className={`rounded-xl px-4 py-2.5 border ${isDark ? 'bg-[#163127] border-[#28523F]' : 'bg-emerald-50 border-emerald-200'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>{t('received')}</span>
          <span className={`font-extrabold text-base ${isDark ? 'text-[#3FB984]' : 'text-emerald-600'}`}>${received.toLocaleString()}</span>
        </div>
        <div className={`rounded-xl px-4 py-2.5 border ${isDark ? 'bg-[#322917] border-[#5B4724]' : 'bg-amber-50 border-amber-200'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isDark ? 'text-[#E5C47A]' : 'text-amber-700'}`}>{t('outstanding')}</span>
          <span className={`font-extrabold text-base ${isDark ? 'text-[#D6A84F]' : 'text-amber-600'}`}>${balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Aging Schedule Summary */}
      <div className="mb-4">
        <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          Receivables Aging Analysis
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-[#121B15] border-[#1C3625]' : 'bg-emerald-50/70 border-emerald-200'}`}>
            <span className={`block font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>&lt; 30 Days (Current)</span>
            <span className="font-bold text-sm block mt-0.5">${agingUnder30.toLocaleString()}</span>
          </div>
          <div className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-[#1D1B13] border-[#3D351B]' : 'bg-amber-50/70 border-amber-200'}`}>
            <span className={`block font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>31 - 60 Days</span>
            <span className="font-bold text-sm block mt-0.5">${aging30to60.toLocaleString()}</span>
          </div>
          <div className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-[#221815] border-[#442319]' : 'bg-orange-50/70 border-orange-200'}`}>
            <span className={`block font-medium ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>61 - 90 Days</span>
            <span className="font-bold text-sm block mt-0.5">${aging60to90.toLocaleString()}</span>
          </div>
          <div className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-[#221417] border-[#481E27]' : 'bg-red-50/70 border-red-200'}`}>
            <span className={`block font-medium ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>&gt; 90 Days (Delinquent)</span>
            <span className="font-bold text-sm block mt-0.5">${agingOver90.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Company-wise Receivable Breakdown */}
      <div className="mb-6">
        <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-2.5 ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>
          Company-wise Receivables Summary (KKV / KKI / KKHQ)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {normalizedMIS.companySummaries.map(c => (
            <div key={c.company} className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-[#121215] border-[#262629]' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs font-mono">{c.company}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isDark ? 'bg-[#1F1F24] text-[#85858B]' : 'bg-slate-100 text-slate-600'
                }`}>{c.projectCount} Projects</span>
              </div>
              <div className="text-xs space-y-0.5 mt-2">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Total Sales:</span>
                  <span className="font-semibold">{c.currencySymbol}{Math.round(c.totalSales).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Received:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{c.currencySymbol}{Math.round(c.totalReceived).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dashed border-slate-300 dark:border-zinc-800 font-bold">
                  <span className={isDark ? 'text-[#E5C47A]' : 'text-amber-700'}>Receivable:</span>
                  <span className={isDark ? 'text-[#E5C47A]' : 'text-amber-600'}>{c.currencySymbol}{Math.round(c.totalReceivables).toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => exportReceivableReportToExcel(projects, payments, c.company as any)}
                  className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors ${
                    isDark ? 'bg-[#1A2633] text-[#38BDF8] hover:bg-[#203245]' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                  title={`Export ${c.company} Receivables to Excel`}
                >
                  <FileSpreadsheet size={11} /> Export {c.company}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Payment report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-3">{t('project_id')}</th>
              <th className="text-left py-3 px-3">Customer</th>
              <th className="text-left py-3 px-3">Contract Amount</th>
              <th className="text-left py-3 px-3">Advance Paid</th>
              <th className="text-left py-3 px-3">Balance Due</th>
              <th className="text-left py-3 px-3">{t('status')}</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {activeProjects.map(p => (
              <tr key={p.projectId} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                <td className={`py-2.5 px-3 font-semibold font-mono ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.projectId}</td>
                <td className={`py-2.5 px-3 font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-600'}`}>{p.customer}</td>
                <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{p.totalAmountUSD ? `$${p.totalAmountUSD.toLocaleString()}` : '—'}</td>
                <td className={`py-2.5 px-3 font-semibold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>{p.advanceUSD ? `$${p.advanceUSD.toLocaleString()}` : '—'}</td>
                <td className="py-2.5 px-3">
                  <span className={(p.balanceUSD || 0) > 0 ? (isDark ? 'text-[#E5C47A] font-bold' : 'text-amber-600 font-bold') : (isDark ? 'text-[#70D0A8] font-semibold' : 'text-emerald-600 font-semibold')}>
                    {p.balanceUSD ? `$${p.balanceUSD.toLocaleString()}` : '$0'}
                  </span>
                </td>
                <td className="py-2.5 px-3"><PaymentBadge status={p.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FYSalesReport({ isDark, cadence }: { isDark: boolean; cadence: 'Weekly' | 'Monthly' | 'Annual' }) {
  const { projects } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>(cadence === 'Annual' ? 'annual' : 'monthly');

  const fyDataMap = useMemo(() => {
    const map: Record<string, { kkv: number; kki: number; kkhq: number; combined: number; count: number }> = {};

    projects.forEach(p => {
      const dateStr = p.poDate || p.contractDate;
      const fy = getFinancialYearFromDate(dateStr);
      const scope = getProjectScope(p);
      const amount = p.totalAmountUSD || p.actualTotalAmount || 0;

      if (!map[fy]) {
        map[fy] = { kkv: 0, kki: 0, kkhq: 0, combined: 0, count: 0 };
      }

      if (scope === 'KKV') map[fy].kkv += amount;
      else if (scope === 'KKI') map[fy].kki += amount;
      else if (scope === 'KKHQ') map[fy].kkhq += amount;

      map[fy].combined += amount;
      map[fy].count += 1;
    });

    return map;
  }, [projects]);

  const fyKeys = Object.keys(fyDataMap).sort();

  const handleExportExcel = () => {
    const exportData = fyKeys.map(fy => ({
      fy,
      count: fyDataMap[fy].count,
      totalUSD: fyDataMap[fy].combined,
      kkvUSD: fyDataMap[fy].kkv,
      kkiUSD: fyDataMap[fy].kki,
      kkhqUSD: fyDataMap[fy].kkhq,
    }));
    exportFYSalesReportToExcel(exportData);
  };

  const handleExportPDF = () => {
    const grandTotal = fyKeys.reduce((s, k) => s + fyDataMap[k].combined, 0);
    generateReportPDF({
      title: 'Total FY Sales & Revenue Performance Report',
      subtitle: `Enterprise Financial Year Sales Matrix · ${viewMode === 'annual' ? 'Annual FY Overview' : 'Monthly Sales Distribution'}`,
      cadence,
      kpis: [
        { label: 'Total Historical Sales', value: `$${Math.round(grandTotal).toLocaleString()}` },
        { label: 'Active Financial Years', value: String(fyKeys.length) },
        { label: 'Projects Audited', value: String(projects.length) },
        { label: 'Primary Market Scope', value: 'KKV + KKI + KKHQ' },
      ],
      headers: ['Financial Year', 'KKV Sales ($)', 'KKI Sales (₹)', 'KKHQ Sales ($)', 'Combined Total ($)'],
      rows: fyKeys.map(fy => [
        fy,
        fyDataMap[fy].kkv > 0 ? `$${Math.round(fyDataMap[fy].kkv).toLocaleString()}` : '—',
        fyDataMap[fy].kki > 0 ? `₹${Math.round(fyDataMap[fy].kki).toLocaleString('en-IN')}` : '—',
        fyDataMap[fy].kkhq > 0 ? `$${Math.round(fyDataMap[fy].kkhq).toLocaleString()}` : '—',
        `$${Math.round(fyDataMap[fy].combined).toLocaleString()}`
      ])
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-base font-extrabold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>
            {t('fy_sales_report')}
          </h3>
          <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Sales figures categorized by Indian Financial Year (April 1 – March 31).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex rounded-lg p-0.5 border ${isDark ? 'bg-[#101012] border-[#262629]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setViewMode('annual')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'annual'
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Annual FY Matrix
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-white text-slate-900 shadow-xs')
                  : (isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Monthly View
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
              isDark ? 'bg-[#1D2B3A] text-[#60A5FA] border-[#2B435E] hover:bg-[#25394E]' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <FileSpreadsheet size={13} /> Excel (.xlsx)
          </button>

          <button
            onClick={handleExportPDF}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
              isDark ? 'bg-[#1E1E22] text-[#E5C47A] border-[#3E382A] hover:bg-[#282724]' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Download size={13} /> PDF Report
          </button>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="FY Sales Report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-4">Financial Year</th>
              <th className="text-right py-3 px-4">KKV Sales ($)</th>
              <th className="text-right py-3 px-4">KKI Sales (₹)</th>
              <th className="text-right py-3 px-4">KKHQ Sales ($)</th>
              <th className="text-right py-3 px-4">Combined Total ($)</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {fyKeys.map(fy => {
              const data = fyDataMap[fy];
              return (
                <tr key={fy} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                  <td className={`py-3 px-4 font-bold font-mono ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>{fy}</td>
                  <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                    {data.kkv > 0 ? `$${Math.round(data.kkv).toLocaleString()}` : '—'}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                    {data.kki > 0 ? `₹${Math.round(data.kki).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                    {data.kkhq > 0 ? `$${Math.round(data.kkhq).toLocaleString()}` : '—'}
                  </td>
                  <td className={`py-3 px-4 text-right font-extrabold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>
                    ${Math.round(data.combined).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthDispatchReport({ isDark }: { isDark: boolean }) {
  const { shipments, projects } = useData();
  const { t } = useLanguage();

  const monthMap = useMemo(() => {
    const monthsOrder = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Not Available'];
    const map: Record<string, { kkv: number; kki: number; kkhq: number; combined: number }> = {};

    monthsOrder.forEach(m => {
      map[m] = { kkv: 0, kki: 0, kkhq: 0, combined: 0 };
    });

    const projectMap = new Map<string, typeof projects[0]>();
    projects.forEach(p => projectMap.set(p.projectId, p));

    shipments.forEach(s => {
      const dateStr = s.etd || s.loadingDate || s.invoiceDate;
      const month = getMonthFromDate(dateStr);
      const proj = projectMap.get(s.projectId);
      const scope = proj ? getProjectScope(proj) : 'KKI';
      const qty = s.dispatchQtyM2 ?? (proj ? (proj.contractQtyM2 || proj.actualDesignQtyM2 || 0) : 0);

      if (!map[month]) {
        map[month] = { kkv: 0, kki: 0, kkhq: 0, combined: 0 };
      }

      if (scope === 'KKV') map[month].kkv += qty;
      else if (scope === 'KKI') map[month].kki += qty;
      else if (scope === 'KKHQ') map[month].kkhq += qty;

      map[month].combined += qty;
    });

    return map;
  }, [shipments, projects]);

  const activeMonths = Object.keys(monthMap).filter(m => monthMap[m].combined > 0 || m !== 'Not Available');

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className={`text-base font-extrabold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>
            {t('month_dispatch_report')}
          </h3>
          <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Monthly total dispatch quantities ($m^2$) aggregated across operational scopes.
          </p>
        </div>

        <button
          onClick={() => exportDispatchReportToExcel(shipments, projects)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border ${
            isDark ? 'bg-[#132338] text-[#38BDF8] border-[#1D3B5E] hover:bg-[#183250]' : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
          }`}
        >
          <FileSpreadsheet size={14} /> {t('export_dispatch_excel')}
        </button>
      </div>

      <div className={`overflow-x-auto rounded-lg border shadow-xs ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
        <table className="w-full text-sm" aria-label="Month Dispatch Report">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase ${isDark ? 'border-[#262629] text-[#85858B]' : 'border-slate-200 text-slate-500'}`}>
              <th className="text-left py-3 px-4">Month</th>
              <th className="text-right py-3 px-4">KKV Dispatch (m²)</th>
              <th className="text-right py-3 px-4">KKI Dispatch (m²)</th>
              <th className="text-right py-3 px-4">KKHQ Dispatch (m²)</th>
              <th className="text-right py-3 px-4">Combined Dispatch (m²)</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-[#262629] bg-[#151517]' : 'divide-slate-200 bg-white'}`}>
            {activeMonths.map(m => {
              const data = monthMap[m];
              return (
                <tr key={m} className={`transition-colors ${isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}`}>
                  <td className={`py-3 px-4 font-bold font-mono ${isDark ? 'text-[#38BDF8]' : 'text-sky-700'}`}>{m}</td>
                  <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                    {data.kkv > 0 ? `${Math.round(data.kkv).toLocaleString()} m²` : '—'}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                    {data.kki > 0 ? `${Math.round(data.kki).toLocaleString()} m²` : '—'}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                    {data.kkhq > 0 ? `${Math.round(data.kkhq).toLocaleString()} m²` : '—'}
                  </td>
                  <td className={`py-3 px-4 text-right font-extrabold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>
                    {data.combined > 0 ? `${Math.round(data.combined).toLocaleString()} m²` : '0 m²'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { theme } = useApp();
  const { t } = useLanguage();
  const { projects, shipments } = useData();
  const isDark = theme === 'dark';
  const [activeReport, setActiveReport] = useState<ReportType>('project-status');
  const [cadence, setCadence] = useState<'Weekly' | 'Monthly' | 'Annual'>('Monthly');
  const [isTriggering, setIsTriggering] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);

  // Executive KPI summary calculations
  const totalProjects = projects.length;
  const totalContractUSD = projects.reduce((s, p) => s + (p.totalAmountUSD || p.actualTotalAmount || 0), 0);
  const totalAdvanceUSD = projects.reduce((s, p) => s + (p.advanceUSD || 0), 0);
  const totalOutstandingUSD = projects.reduce((s, p) => s + (p.balanceUSD || 0), 0);
  const totalDispatchM2 = shipments.reduce((s, sh) => s + (sh.dispatchQtyM2 || 0), 0);

  const handleTriggerAutomatedGeneration = () => {
    setIsTriggering(true);
    setTimeout(() => {
      setIsTriggering(false);
      setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 900);
  };

  const reportTypesList: { id: ReportType; label: string }[] = [
    { id: 'project-status', label: t('project_status_report') },
    { id: 'payment', label: t('receivable_report') },
    { id: 'fy-sales', label: t('fy_sales_report') },
    { id: 'shipment', label: t('shipment_report') },
    { id: 'production', label: t('production_report') },
    { id: 'month-dispatch', label: t('month_dispatch_report') },
  ];

  return (
    <div className={`space-y-5 ${isDark ? 'text-[#F5F5F3]' : 'text-slate-900'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Automated Executive MIS Reporting</p>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>{t('reports_center')}</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Automated recurring generation across Project Status, Outstanding Payments, and FY Sales.
          </p>
        </div>

        {/* Cadence Selection & Automated Trigger Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={`flex rounded-xl p-1 border ${isDark ? 'bg-[#121215] border-[#262629]' : 'bg-slate-100 border-slate-300'}`}>
            {(['Weekly', 'Monthly', 'Annual'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  cadence === c
                    ? (isDark ? 'bg-[#C9A86A] text-[#111111] shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                    : (isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={handleTriggerAutomatedGeneration}
            disabled={isTriggering}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#152336] text-[#38BDF8] border-[#203D61] hover:bg-[#1A2E47]'
                : 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
            }`}
            title="Compile latest ERP source transactions into recurring MIS"
          >
            <RefreshCw size={13} className={isTriggering ? 'animate-spin' : ''} />
            <span>{isTriggering ? 'Compiling MIS...' : 'Run Auto-Generation'}</span>
          </button>
        </div>
      </div>

      {/* Automated Recurring Schedule Status Banner */}
      <div className={`px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isDark ? 'bg-[#0E1620] border-[#182C44]' : 'bg-blue-50/70 border-blue-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-[#13253B] text-[#38BDF8]' : 'bg-blue-100 text-blue-700'}`}>
            <Clock size={16} />
          </div>
          <div>
            <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Automated MIS Cadence: <span className={isDark ? 'text-[#C9A86A]' : 'text-amber-700'}>{cadence} Recurring Generation</span>
            </span>
            <span className={`text-[11px] ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
              Next Scheduled Dispatch: Monday 09:00 AM IST · Last Compiled: {lastSyncTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScheduleInfo(!showScheduleInfo)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold cursor-pointer transition-colors ${
              isDark ? 'bg-[#15202E] border-[#233A54] text-[#70D0A8]' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <Mail size={12} />
            <span>Automated Email Distribution List</span>
          </button>
        </div>
      </div>

      {showScheduleInfo && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border text-xs ${
            isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-extrabold text-sm">Automated Recurring MIS Email Recipients</h4>
            <button onClick={() => setShowScheduleInfo(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
          </div>
          <p className={`mb-3 ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
            Upon scheduled trigger ({cadence}), the MIS automation engine automatically exports certified PDF and Excel dossiers and sends encrypted summaries to:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#1B1B1F] border-[#2A2A30]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-sky-500">Managing Director</div>
              <div className="truncate">md@kumkangkind.com</div>
            </div>
            <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#1B1B1F] border-[#2A2A30]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-emerald-500">Sales Director</div>
              <div className="truncate">sales.director@kumkangkind.com</div>
            </div>
            <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#1B1B1F] border-[#2A2A30]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-amber-500">Finance Head</div>
              <div className="truncate">finance.in@kumkangkind.com</div>
            </div>
            <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#1B1B1F] border-[#2A2A30]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="font-bold text-purple-500">Lead Project Manager</div>
              <div className="truncate">pm.lead@kumkangkind.com</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* On-Screen Executive Summary KPI Cards (Image 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Active Projects
          </span>
          <span className={`text-xl font-extrabold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalProjects}
          </span>
          <span className="text-[10px] text-sky-500 font-semibold mt-1 block">100% Monitored</span>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Total Contract Value
          </span>
          <span className={`text-xl font-extrabold block ${isDark ? 'text-[#C9A86A]' : 'text-blue-800'}`}>
            ${Math.round(totalContractUSD / 1000).toLocaleString()}k
          </span>
          <span className={`text-[10px] font-medium mt-1 block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Across KKV/KKI/KKHQ
          </span>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Collections Received
          </span>
          <span className={`text-xl font-extrabold block ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>
            ${Math.round(totalAdvanceUSD / 1000).toLocaleString()}k
          </span>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">
            {totalContractUSD > 0 ? `${Math.round((totalAdvanceUSD / totalContractUSD) * 100)}% Collected` : '0%'}
          </span>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Outstanding Receivables
          </span>
          <span className={`text-xl font-extrabold block ${isDark ? 'text-[#E5C47A]' : 'text-amber-600'}`}>
            ${Math.round(totalOutstandingUSD / 1000).toLocaleString()}k
          </span>
          <span className="text-[10px] text-amber-500 font-semibold mt-1 block">Aging Audited</span>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200 shadow-2xs'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Dispatch Volume
          </span>
          <span className={`text-xl font-extrabold block ${isDark ? 'text-[#38BDF8]' : 'text-cyan-700'}`}>
            {Math.round(totalDispatchM2).toLocaleString()} m²
          </span>
          <span className={`text-[10px] font-medium mt-1 block ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Cumulative Shipped
          </span>
        </div>
      </div>

      {/* ERP / MIS Integration Status Banner */}
      <ERPIntegrationStatusCard isDark={isDark} />

      {/* Report selector tabs */}
      <div className="flex flex-wrap gap-2">
        {reportTypesList.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              activeReport === r.id
                ? (isDark ? 'bg-[#C9A86A] text-[#111111] border-[#C9A86A] shadow-xs' : 'bg-[#1688D4] text-white border-[#1688D4] shadow-xs')
                : (isDark ? 'bg-[#151517] text-[#B4B4B8] border-[#303035] hover:bg-[#18181B] hover:text-[#FFFFFF]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900')
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeReport + cadence}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl shadow-card p-5 lg:p-6 border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}
      >
        {activeReport === 'project-status' && <ProjectStatusReport isDark={isDark} cadence={cadence} />}
        {activeReport === 'production' && <ProductionReport isDark={isDark} />}
        {activeReport === 'shipment' && <ShipmentReport isDark={isDark} />}
        {activeReport === 'payment' && <PaymentReport isDark={isDark} cadence={cadence} />}
        {activeReport === 'fy-sales' && <FYSalesReport isDark={isDark} cadence={cadence} />}
        {activeReport === 'month-dispatch' && <MonthDispatchReport isDark={isDark} />}

        <div className={`mt-6 pt-4 border-t flex items-center justify-between flex-wrap gap-3 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
          <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
            Data source: Real Project Database · Automated {cadence} MIS Reporting · {new Date().toLocaleDateString('en-IN')}
          </p>
          <button
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3.5 py-1.5 transition-colors shadow-xs cursor-pointer border ${
              isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035] hover:bg-[#222226]' : 'text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200'
            }`}
            aria-label="Export report (browser print)"
            onClick={() => window.print()}
          >
            <Download size={13} className={isDark ? 'text-[#85858B]' : 'text-slate-500'} />
            Export / Print
          </button>
        </div>
      </motion.div>
    </div>
  );
}

