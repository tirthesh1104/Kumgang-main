import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { parseAndPreviewExcel, type ExcelParseResult } from '../utils/excelParser';
import {
  FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, X,
  RefreshCw, Filter
} from 'lucide-react';

interface ExcelImportModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExcelImportModal({ onClose, onSuccess }: ExcelImportModalProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { projects, commitExcelImport } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'updated' | 'new' | 'errors'>('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [commitResult, setCommitResult] = useState<{ updated: number; newCount: number } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMsg('Please upload a valid Excel file (.xlsx or .xls).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await parseAndPreviewExcel(file, projects);
      setParseResult(result);
      setStep('preview');
    } catch (err: any) {
      console.error('Error parsing Excel:', err);
      setErrorMsg(err.message || 'Failed to parse Excel workbook. Please check file format.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCommit = () => {
    if (!parseResult) return;

    setLoading(true);
    try {
      const res = commitExcelImport(
        parseResult.updatedProjectsMap,
        parseResult.newProjects,
        { filename: parseResult.fileName, recordCount: parseResult.totalRowsProcessed },
        'Administrator'
      );

      setCommitResult({ updated: res.updatedCount, newCount: res.newCount });
      setStep('result');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Commit failed:', err);
      setErrorMsg('Failed to commit updates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiffs = parseResult?.diffItems.filter(item => {
    const matchesSearch =
      item.projectId.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.projectName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.fieldLabel.toLowerCase().includes(filterSearch.toLowerCase());

    if (activeTab === 'updated') return matchesSearch && item.status === 'Updated';
    if (activeTab === 'new') return matchesSearch && item.status === 'New';
    return matchesSearch;
  }) || [];

  return (
    <div className={`fixed inset-0 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6 z-50 overflow-y-auto ${isDark ? 'bg-black/80' : 'bg-slate-900/50'}`}>
      <div className={`border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#151517] border-[#303035] text-[#F5F5F3]' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-b ${
          isDark ? 'bg-[#090909] text-white border-[#1E1E20]' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark ? 'bg-[#C9A86A]/10 text-[#C9A86A] border-[#C9A86A]/20' : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
            }`}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white">EXCEL DATA UPDATE & SYNCHRONIZATION</h3>
              <p className="text-xs text-slate-400 font-medium">
                Import updated Excel workbook to synchronize canonical project data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isDark ? 'bg-[#0A0A0A]' : 'bg-slate-50'}`}>

          {/* Excel Synchronization Journey Stepper */}
          <div className={`border rounded-xl p-3 shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
              <div className={`py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                step === 'upload' 
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-[#1688D4] text-white')
                  : (isDark ? 'bg-[#111113] text-[#85858B]' : 'bg-slate-100 text-slate-500')
              }`}>
                <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-mono">1</span>
                <span>UPLOAD</span>
              </div>
              <div className={`py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                step === 'preview' 
                  ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-[#1688D4] text-white')
                  : (isDark ? 'bg-[#111113] text-[#85858B]' : 'bg-slate-100 text-slate-500')
              }`}>
                <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-mono">2</span>
                <span>PREVIEW</span>
              </div>
              <div className={`py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                loading && step === 'preview' 
                  ? (isDark ? 'bg-[#D6A84F] text-[#111111] animate-pulse' : 'bg-amber-500 text-white animate-pulse')
                  : (isDark ? 'bg-[#111113] text-[#85858B]' : 'bg-slate-100 text-slate-500')
              }`}>
                <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-mono">3</span>
                <span>RECALCULATE</span>
              </div>
              <div className={`py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                step === 'result' 
                  ? (isDark ? 'bg-[#3FB984] text-[#111111]' : 'bg-emerald-600 text-white')
                  : (isDark ? 'bg-[#111113] text-[#85858B]' : 'bg-slate-100 text-slate-500')
              }`}>
                <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-mono">4</span>
                <span>SYNCED</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-[#34191B] border border-[#5A292B] rounded-xl flex items-start gap-3 text-[#F08A8A] text-xs font-semibold">
              <AlertTriangle size={16} className="text-[#E05A5A] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">{errorMsg}</div>
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className={`border rounded-2xl p-6 lg:p-8 text-center space-y-4 shadow-xs ${
                isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
              }`}>
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-8 lg:p-12 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 group ${
                    isDark 
                      ? 'border-[#303035] hover:border-[#C9A86A] bg-[#111113] hover:bg-[#18181B]'
                      : 'border-slate-300 hover:border-[#1688D4] bg-slate-50 hover:bg-sky-50/50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs ${
                    isDark ? 'bg-[#2A2419] text-[#C9A86A] border border-[#55462C]' : 'bg-sky-100 text-[#1688D4] border border-sky-200'
                  }`}>
                    <Upload size={28} />
                  </div>
                  <div>
                    <p className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Click to upload or drag & drop Excel workbook
                    </p>
                    <p className={`text-xs font-medium mt-1 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                      Supports <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>.xlsx</span> and <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>.xls</span> files (e.g. <em>260908 KKI PROJECT FOLLOW UP.xlsx</em>)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {loading && (
                  <div className={`flex items-center justify-center gap-2 text-xs font-extrabold ${
                    isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'
                  }`}>
                    <RefreshCw size={14} className="animate-spin" />
                    Parsing workbook sheets and validating schema...
                  </div>
                )}
              </div>

              <div className={`border rounded-xl p-4 text-xs space-y-1 ${
                isDark ? 'bg-[#111113] border-[#262629] text-[#B4B4B8]' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-[10px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Import Pipeline Process</h4>
                <p>1. <strong>Validation</strong>: Validates headers, data types, numbers, and dates before applying any change.</p>
                <p>2. <strong>Preview</strong>: Displays a field-by-field diff comparison table for administrative review.</p>
                <p>3. <strong>Canonical Update</strong>: Updates existing projects by Project ID and registers new projects without duplicates.</p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CHANGE PREVIEW */}
          {step === 'preview' && parseResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className={`border rounded-xl p-3.5 shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Processed</p>
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{parseResult.totalRowsProcessed}</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Rows detected</p>
                </div>
                <div className={`border rounded-xl p-3.5 shadow-2xs ${isDark ? 'bg-[#172531] border-[#2B455A]' : 'bg-sky-50 border-sky-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#9BC5E8]' : 'text-sky-700'}`}>Updates</p>
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-[#6EA8D9]' : 'text-sky-800'}`}>{parseResult.updatedCount}</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-[#9BC5E8]' : 'text-sky-600'}`}>Modified projects</p>
                </div>
                <div className={`border rounded-xl p-3.5 shadow-2xs ${isDark ? 'bg-[#163127] border-[#28523F]' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>New</p>
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-[#3FB984]' : 'text-emerald-800'}`}>{parseResult.newCount}</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-[#70D0A8]' : 'text-emerald-600'}`}>New records</p>
                </div>
                <div className={`border rounded-xl p-3.5 shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Unchanged</p>
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>{parseResult.unchangedCount}</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Identical records</p>
                </div>
                <div className={`border rounded-xl p-3.5 shadow-2xs ${
                  parseResult.errorCount > 0 
                    ? (isDark ? 'bg-[#322917] border-[#5B4724]' : 'bg-amber-50 border-amber-200') 
                    : (isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200')
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    parseResult.errorCount > 0 ? (isDark ? 'text-[#E5C47A]' : 'text-amber-800') : (isDark ? 'text-[#85858B]' : 'text-slate-500')
                  }`}>Errors</p>
                  <p className={`text-2xl font-extrabold ${
                    parseResult.errorCount > 0 ? (isDark ? 'text-[#D6A84F]' : 'text-amber-900') : (isDark ? 'text-[#85858B]' : 'text-slate-700')
                  }`}>{parseResult.errorCount}</p>
                  <p className={`text-[10px] font-medium ${
                    parseResult.errorCount > 0 ? (isDark ? 'text-[#E5C47A]' : 'text-amber-700') : (isDark ? 'text-[#85858B]' : 'text-slate-500')
                  }`}>Invalid rows</p>
                </div>
              </div>

              {/* Sheet & Filter Bar */}
              <div className={`flex flex-wrap items-center justify-between gap-3 border rounded-xl p-3 shadow-2xs ${
                isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>Active Sheet:</span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                    isDark ? 'bg-[#2A2419] text-[#E8D6AE] border-[#55462C]' : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}>
                    {parseResult.selectedSheet}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>({parseResult.fileName})</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'all' 
                        ? (isDark ? 'bg-[#C9A86A] text-[#111111]' : 'bg-[#1688D4] text-white')
                        : (isDark ? 'bg-[#18181B] text-[#B4B4B8] hover:bg-[#222226]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                    }`}
                  >
                    All Changes ({parseResult.diffItems.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('updated')}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'updated' 
                        ? (isDark ? 'bg-[#6EA8D9] text-[#111111]' : 'bg-sky-600 text-white')
                        : (isDark ? 'bg-[#172531] text-[#9BC5E8] hover:bg-[#2B455A]' : 'bg-sky-100 text-sky-800 hover:bg-sky-200')
                    }`}
                  >
                    Updated ({parseResult.diffItems.filter(i => i.status === 'Updated').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('new')}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'new' 
                        ? (isDark ? 'bg-[#3FB984] text-[#111111]' : 'bg-emerald-600 text-white')
                        : (isDark ? 'bg-[#163127] text-[#70D0A8] hover:bg-[#28523F]' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200')
                    }`}
                  >
                    New ({parseResult.newCount})
                  </button>
                  {parseResult.errorCount > 0 && (
                    <button
                      onClick={() => setActiveTab('errors')}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                        activeTab === 'errors' 
                          ? (isDark ? 'bg-[#D6A84F] text-[#111111]' : 'bg-amber-600 text-white')
                          : (isDark ? 'bg-[#322917] text-[#E5C47A] hover:bg-[#5B4724]' : 'bg-amber-100 text-amber-800 hover:bg-amber-200')
                      }`}
                    >
                      Errors ({parseResult.errorCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Diffs Table or Errors List */}
              {activeTab === 'errors' ? (
                <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <div className={`p-4 font-extrabold text-xs border-b ${
                    isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    Invalid Rows Excluded From Import ({parseResult.invalidRows.length})
                  </div>
                  <div className={`divide-y max-h-60 overflow-y-auto text-xs ${isDark ? 'divide-[#262629]' : 'divide-slate-200'}`}>
                    {parseResult.invalidRows.map((inv, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Row {inv.rowNumber}</span>
                        <span className={`font-medium ${isDark ? 'text-[#E5C47A]' : 'text-amber-800'}`}>{inv.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`border rounded-xl overflow-hidden shadow-2xs ${isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'}`}>
                  <div className={`p-3 border-b flex items-center gap-2 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
                    <Filter size={14} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />
                    <input
                      type="text"
                      placeholder="Search preview by Project ID, Client or Field..."
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                      className={`text-xs w-full max-w-sm border rounded-lg px-3 py-1.5 outline-none transition-all ${
                        isDark 
                          ? 'border-[#303035] bg-[#111113] text-[#F5F5F3] placeholder-[#66666C] focus:border-[#C9A86A]'
                          : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#1688D4]'
                      }`}
                    />
                  </div>

                  {filteredDiffs.length === 0 ? (
                    <div className={`p-8 text-center text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                      No matching record differences found. The uploaded Excel workbook data matches current project data.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className={`font-bold border-b uppercase ${
                            isDark ? 'bg-[#111113] text-[#85858B] border-[#262629]' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            <th className="p-2.5">Project ID</th>
                            <th className="p-2.5">Project Name</th>
                            <th className="p-2.5">Field Changed</th>
                            <th className="p-2.5">Current Value</th>
                            <th className="p-2.5">New Excel Value</th>
                            <th className="p-2.5">Type</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-[#262629]' : 'divide-slate-200'}`}>
                          {filteredDiffs.map((diff, i) => (
                            <tr key={i} className={isDark ? 'hover:bg-[#1B1B1F]' : 'hover:bg-slate-50'}>
                              <td className={`p-2.5 font-mono font-bold ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>{diff.projectId}</td>
                              <td className={`p-2.5 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{diff.projectName}</td>
                              <td className={`p-2.5 font-medium ${isDark ? 'text-[#9BC5E8]' : 'text-sky-700'}`}>{diff.fieldLabel}</td>
                              <td className={`p-2.5 line-through px-2 py-1 rounded ${
                                isDark ? 'text-[#F08A8A] bg-[#34191B]' : 'text-red-700 bg-red-50'
                              }`}>{String(diff.existingValue)}</td>
                              <td className={`p-2.5 font-bold px-2 py-1 rounded ${
                                isDark ? 'text-[#70D0A8] bg-[#163127]' : 'text-emerald-700 bg-emerald-50'
                              }`}>{String(diff.newValue)}</td>
                              <td className="p-2.5">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                  diff.status === 'New' 
                                    ? (isDark ? 'bg-[#163127] text-[#70D0A8]' : 'bg-emerald-100 text-emerald-800') 
                                    : (isDark ? 'bg-[#172531] text-[#9BC5E8]' : 'bg-sky-100 text-sky-800')
                                }`}>
                                  {diff.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Administrative Notice */}
              <div className={`border rounded-xl p-4 flex items-start gap-3 text-xs ${
                isDark ? 'bg-[#322917] border-[#5B4724] text-[#E5C47A]' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-[#D6A84F]' : 'text-amber-600'}`} />
                <div>
                  <h4 className="font-extrabold">Confirmation Required</h4>
                  <p className="mt-0.5 leading-relaxed">
                    Clicking <strong>"Confirm & Commit Import"</strong> will update the canonical project dataset and immediately recalculate dependent metrics across all dashboards and reports.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULT */}
          {step === 'result' && commitResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-center py-6"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm border ${
                isDark ? 'bg-[#163127] border-[#28523F] text-[#70D0A8]' : 'bg-emerald-100 border-emerald-300 text-emerald-700'
              }`}>
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h3 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Excel Import Completed</h3>
                <p className={`text-sm font-medium max-w-md mx-auto ${isDark ? 'text-[#85858B]' : 'text-slate-600'}`}>
                  Canonical project data updated and derived KPIs recalculated in real time.
                </p>
              </div>

              <div className={`grid grid-cols-2 max-w-sm mx-auto gap-4 border rounded-2xl p-4 shadow-2xs ${
                isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-slate-200'
              }`}>
                <div className={`p-3 border rounded-xl ${isDark ? 'bg-[#172531] border-[#2B455A]' : 'bg-sky-50 border-sky-200'}`}>
                  <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-[#9BC5E8]' : 'text-sky-700'}`}>Updated</p>
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-[#6EA8D9]' : 'text-sky-800'}`}>{commitResult.updated}</p>
                </div>
                <div className={`p-3 border rounded-xl ${isDark ? 'bg-[#163127] border-[#28523F]' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-[#70D0A8]' : 'text-emerald-700'}`}>New Projects</p>
                  <p className={`text-2xl font-extrabold ${isDark ? 'text-[#3FB984]' : 'text-emerald-800'}`}>{commitResult.newCount}</p>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-b-2xl border-t ${
          isDark ? 'bg-[#090909] border-[#1E1E20]' : 'bg-slate-900 border-slate-800'
        }`}>
          {step === 'preview' ? (
            <>
              <button
                onClick={() => setStep('upload')}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Back to Upload
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCommit}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  CONFIRM & COMMIT IMPORT
                </button>
              </div>
            </>
          ) : step === 'result' ? (
            <button
              onClick={onClose}
              className="ml-auto btn-primary"
            >
              Close & View Dashboard
            </button>
          ) : (
            <button
              onClick={onClose}
              className="ml-auto text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
