import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, RefreshCw, FileSpreadsheet, CheckCircle2, 
  History, HardDrive, Cpu, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { getProjectScope } from '../utils/scopeUtils';
import { SyncExcelButton } from './ui/SyncExcelButton';
import { UpdateHistoryModal } from './UpdateHistoryModal';

export function DataPipelinePage() {
  const { theme, liveDateTime, lastUpdated } = useApp();
  const { projects, auditLogs, shipments } = useData();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isDark = theme === 'dark';

  const kkvCount = projects.filter(p => getProjectScope(p) === 'KKV').length;
  const kkiCount = projects.filter(p => getProjectScope(p) === 'KKI').length;
  const otherCount = projects.length - kkvCount - kkiCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 sm:p-7 rounded-2xl border transition-all ${
          isDark 
            ? 'bg-[#151517] border-[#262629] shadow-sm' 
            : 'bg-white border-[#DCE5EE] shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border font-mono ${
                isDark ? 'text-[#38BDF8] bg-[#0E2838] border-[#164E63]' : 'text-[#0284C7] bg-[#E0F2FE] border-[#BAE6FD]'
              }`}>
                <Database size={13} />
                CANONICAL PIPELINE
              </span>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                isDark ? 'text-[#3FB984] bg-[#14291F] border-[#204E38]' : 'text-[#16A36A] bg-[#DCFCE7] border-[#BBF7D0]'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE SYNC ACTIVE
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Live Data Pipeline
            </h1>
            <p className={`mt-1.5 text-sm font-medium max-w-2xl leading-relaxed ${isDark ? 'text-[#85858B]' : 'text-[#475569]'}`}>
              Synchronize canonical project data directly from the master Excel workbook. Parse, validate schemas, calculate derived progress milestones, and maintain real-time audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                isDark 
                  ? 'bg-[#1B1B1F] border-[#303035] text-[#F5F5F3] hover:bg-[#26262B]' 
                  : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <History size={14} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
            <SyncExcelButton variant="primary" label="Upload & Sync Excel" />
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>TOTAL SYNCED PROJECTS</span>
            <HardDrive size={15} className={isDark ? 'text-[#38BDF8]' : 'text-[#0284C7]'} />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            {projects.length}
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
            Active records in memory
          </p>
        </div>

        <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>CANONICAL SCOPES</span>
            <Layers size={15} className={isDark ? 'text-[#C9A86A]' : 'text-[#D97706]'} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              {kkvCount + kkiCount}
            </span>
            <span className={`text-xs font-bold ${isDark ? 'text-[#B4B4B8]' : 'text-[#64748B]'}`}>
              (KKV: {kkvCount} · KKI: {kkiCount}{otherCount > 0 ? ` · Other: ${otherCount}` : ''})
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
            Validated scope categories
          </p>
        </div>

        <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>SHIPMENTS TRACKED</span>
            <Cpu size={15} className={isDark ? 'text-[#3FB984]' : 'text-[#16A36A]'} />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            {shipments.length}
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
            Logistics & transit records
          </p>
        </div>

        <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>PIPELINE HEARTBEAT</span>
            <RefreshCw size={14} className={isDark ? 'text-[#38BDF8]' : 'text-[#0284C7]'} />
          </div>
          <div className={`text-xs font-bold truncate ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>
            {liveDateTime || lastUpdated}
          </div>
          <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${isDark ? 'text-[#3FB984]' : 'text-[#16A36A]'}`}>
            <CheckCircle2 size={11} /> Ready for live ingestion
          </p>
        </div>
      </div>

      {/* Main Excel Ingestion Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]'
      }`}>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDark ? 'bg-[#0E2A1E] text-emerald-400 border-[#1E4D38]' : 'bg-[#EBF7F0] text-[#107C41] border-[#B7E5C7]'
            }`}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Master Excel Synchronization
              </h2>
              <p className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
                Supports canonical Kumkang project workbook (.xlsx, .xls)
              </p>
            </div>
          </div>

          <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
            When you import a workbook, the system parses Project ID, Scope, Customer, Delivery Request dates, PO Status, Area, and Financial figures. Data is validated on the fly and merged into live application state without page reloads.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <SyncExcelButton variant="primary" label="Select Excel File to Synchronize" />
            <button
              onClick={() => setIsHistoryOpen(true)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                isDark ? 'bg-[#18181B] border-[#303035] text-[#B4B4B8] hover:text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <History size={14} />
              <span>Review Past Ingestions</span>
            </button>
          </div>
        </div>

        {/* Schema Information Table */}
        <div className={`mt-8 pt-6 border-t ${isDark ? 'border-[#262629]' : 'border-[#E2E8F0]'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
            Expected Canonical Columns
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {['SCOPE', 'PROJECT ID', 'PROJECT NAME', 'CLIENT / CUSTOMER', 'PO STATUS', 'TOTAL AMOUNT (USD)'].map(col => (
              <div 
                key={col} 
                className={`p-2.5 rounded-lg border font-mono text-[11px] font-semibold text-center ${
                  isDark ? 'bg-[#111113] border-[#222226] text-[#A0A0A5]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
                }`}
              >
                {col}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Modal */}
      {isHistoryOpen && <UpdateHistoryModal onClose={() => setIsHistoryOpen(false)} />}
    </div>
  );
}
