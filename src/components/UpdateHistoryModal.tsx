import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import {
  History, X, RotateCcw, Trash2, FileSpreadsheet,
  Edit3, Calendar, User, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

interface UpdateHistoryModalProps {
  onClose: () => void;
}

export function UpdateHistoryModal({ onClose }: UpdateHistoryModalProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { auditLogs, resetToInitialData, clearAuditLogs } = useData();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterDate, setFilterDate] = useState('All');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const filteredLogs = auditLogs.filter(log => {
    if (filterUser !== 'All' && !log.user.toLowerCase().includes(filterUser.toLowerCase())) return false;
    if (filterMethod !== 'All' && log.method !== filterMethod) return false;
    
    if (filterDate !== 'All') {
      const logDate = new Date(log.timestamp.replace('Sept', 'Sep'));
      const now = new Date();
      if (filterDate === 'Today') {
        if (logDate.toDateString() !== now.toDateString()) return false;
      } else if (filterDate === 'Last 7 Days') {
        const diff = now.getTime() - logDate.getTime();
        if (diff > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (filterDate === 'This Month') {
        if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  const handleReset = () => {
    resetToInitialData();
    setShowConfirmReset(false);
  };

  const handleResetFilters = () => {
    setFilterUser('All');
    setFilterMethod('All');
    setFilterDate('All');
    setExpandedLogId(null);
  };

  const allUsers = ['All', ...new Set(auditLogs.map(l => l.user))];

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 z-50 overflow-y-auto ${
      isDark ? 'bg-black/75' : 'bg-slate-900/50'
    }`}>
      <div className={`border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${
          isDark ? 'bg-[#090909] text-white border-[#202023]' : 'bg-[#0B2239] text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-[#2A2419] text-[#C9A86A] border-[#55462C]' : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
            }`}>
              <History size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white">DATA UPDATE & SYNCHRONIZATION HISTORY</h3>
              <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-300'}`}>
                Audit log of all manual edits and Excel import operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-[#85858B] hover:text-white hover:bg-[#1B1B1F]' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Close history modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Bar */}
        <div className={`p-4 border-b flex flex-wrap items-center gap-4 text-xs font-medium ${
          isDark ? 'bg-[#0A0A0A] border-[#262629]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <label className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>User Role:</label>
            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className={`px-2 py-1.5 rounded border outline-none ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Action Category:</label>
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className={`px-2 py-1.5 rounded border outline-none ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="All">All</option>
              <option value="Manual">Manual</option>
              <option value="Excel Import">Excel Import</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Date Range:</label>
            <select
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className={`px-2 py-1.5 rounded border outline-none ${
                isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
          <button
            onClick={handleResetFilters}
            className={`px-3 py-1.5 rounded border transition-colors cursor-pointer ml-auto ${
              isDark ? 'bg-[#18181B] text-[#D5D5D8] border-[#303035] hover:bg-[#202025]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Reset Filters
          </button>
        </div>

        {/* Action Top Bar */}
        <div className={`border-b px-6 py-3 flex items-center justify-between text-xs ${
          isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className={`font-bold ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
            {filteredLogs.length} Logged Action{filteredLogs.length !== 1 ? 's' : ''} shown
          </span>
          <div className="flex items-center gap-3">
            {auditLogs.length > 0 && (
              <button
                onClick={clearAuditLogs}
                className={`font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark ? 'text-[#85858B] hover:text-[#F08A8A]' : 'text-slate-500 hover:text-red-600'
                }`}
              >
                <Trash2 size={13} /> Clear History
              </button>
            )}
            <button
              onClick={() => setShowConfirmReset(true)}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors border cursor-pointer ${
                isDark
                  ? 'text-[#E5C47A] hover:text-white bg-[#322917] hover:bg-[#2A2419] border-[#5B4724]'
                  : 'text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-300'
              }`}
            >
              <RotateCcw size={13} /> Reset Data to Original Baseline
            </button>
          </div>
        </div>

        {/* Reset Confirmation Banner */}
        {showConfirmReset && (
          <div className={`p-4 border-b text-xs font-semibold flex items-center justify-between ${
            isDark
              ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className={isDark ? 'text-[#D6A84F]' : 'text-amber-600'} />
              <span>Are you sure? This will revert all manual and Excel updates back to the original Excel baseline dataset.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className={`px-3 py-1 rounded font-bold cursor-pointer ${
                  isDark ? 'bg-[#18181B] border border-[#303035] text-[#D5D5D8]' : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className={`px-3 py-1 rounded font-bold cursor-pointer ${
                  isDark ? 'bg-[#5B4724] text-[#E5C47A] hover:bg-[#322917]' : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {/* Logs List */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-3 ${
          isDark ? 'bg-[#0A0A0A]' : 'bg-slate-50'
        }`}>
          {filteredLogs.length === 0 ? (
            <div className={`text-center py-12 text-xs font-medium space-y-2 ${isDark ? 'text-[#65656B]' : 'text-slate-400'}`}>
              <History size={32} className={`mx-auto ${isDark ? 'text-[#4D4D52]' : 'text-slate-300'}`} />
              <p className={isDark ? 'text-[#85858B]' : 'text-slate-600'}>No data updates logged or found for these filters.</p>
              <p className={`text-[11px] ${isDark ? 'text-[#65656B]' : 'text-slate-400'}`}>
                Manual project edits and Excel imports will be logged here for administrative auditing.
              </p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const isExcel = log.method === 'Excel Import';
              return (
                <div key={log.id} className={`border rounded-xl overflow-hidden shadow-2xs ${
                  isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
                }`}>
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${
                        isExcel
                          ? (isDark ? 'bg-[#17272E] text-[#89C9DF] border-[#294651]' : 'bg-sky-50 text-sky-600 border-sky-200')
                          : (isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-emerald-50 text-emerald-600 border-emerald-200')
                      }`}>
                        {isExcel ? <FileSpreadsheet size={16} /> : <Edit3 size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            isExcel
                              ? (isDark ? 'bg-[#17272E] text-[#89C9DF]' : 'bg-sky-100 text-sky-700')
                              : (isDark ? 'bg-[#163127] text-[#70D0A8]' : 'bg-emerald-100 text-emerald-700')
                          }`}>
                            {log.method}
                          </span>
                          <span className={`font-bold text-xs ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>
                            {log.summary}
                          </span>
                        </div>
                        <div className={`flex items-center gap-3 text-[11px] mt-1 font-medium ${
                          isDark ? 'text-[#85858B]' : 'text-slate-500'
                        }`}>
                          <span className="flex items-center gap-1"><Calendar size={11} /> {log.timestamp}</span>
                          <span className="flex items-center gap-1"><User size={11} /> {log.user}</span>
                        </div>
                      </div>
                    </div>

                    {log.changes && log.changes.length > 0 && (
                      <button className={isDark ? 'text-[#85858B] hover:text-white' : 'text-slate-400 hover:text-slate-700'}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>

                  {/* Expanded Field Changes */}
                  {isExpanded && log.changes && log.changes.length > 0 && (
                    <div className={`border-t p-3 text-xs ${
                      isDark ? 'border-[#202023] bg-[#111113]' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <p className={`font-bold text-[10px] uppercase tracking-wider mb-2 ${
                        isDark ? 'text-[#B4B4B8]' : 'text-slate-500'
                      }`}>
                        Detailed Field Diffs:
                      </p>
                      <div className="space-y-1 font-mono text-[11px]">
                        {log.changes.map((ch, i) => (
                          <div key={i} className={`flex items-center gap-2 p-2 rounded border ${
                            isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
                          }`}>
                            <span className={`font-bold w-32 truncate ${isDark ? 'text-[#C9A86A]' : 'text-amber-700'}`}>
                              {ch.field}:
                            </span>
                            <span className={`line-through ${isDark ? 'text-[#F08A8A]' : 'text-red-600'}`}>
                              {String(ch.oldValue)}
                            </span>
                            <span className={isDark ? 'text-[#65656B]' : 'text-slate-400'}>→</span>
                            <span className={`font-bold ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>
                              {String(ch.newValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end px-6 py-4 rounded-b-2xl border-t ${
          isDark ? 'bg-[#090909] border-[#202023]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              isDark ? 'bg-[#1688D4] hover:bg-[#1272B2] text-white' : 'bg-[#1688D4] hover:bg-[#1272B2] text-white shadow-sm'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

