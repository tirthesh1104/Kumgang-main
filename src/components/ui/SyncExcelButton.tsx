import { useState } from 'react';
import { FileSpreadsheet, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ExcelImportModal } from '../ExcelImportModal';
import { useApp } from '../../context/AppContext';

interface SyncExcelButtonProps {
  variant?: 'primary' | 'secondary' | 'sidebar' | 'banner';
  className?: string;
  label?: string;
  subtitle?: string;
}

export function SyncExcelButton({ variant = 'primary', className = '', label = 'Excel File', subtitle }: SyncExcelButtonProps) {
  const { theme, liveDateTime } = useApp();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');

  const handleSyncSuccess = () => {
    setSyncState('synced');
    setTimeout(() => {
      setSyncState('idle');
    }, 1800);
  };

  if (variant === 'banner') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={syncState === 'syncing'}
          className={`border font-semibold rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center gap-3 transition-all duration-200 cursor-pointer shrink-0 shadow-2xs hover:shadow-xs select-none group text-left ${
            isDark
              ? 'bg-[#163127]/60 hover:bg-[#163127] border-[#28523F] text-white'
              : 'bg-white/95 hover:bg-emerald-50/50 border-[#BBF7D0] hover:border-[#86EFAC] text-[#0F172A]'
          } ${className}`}
          title="Upload Excel workbook to synchronize data"
          aria-label="Sync Excel"
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
            isDark 
              ? 'bg-[#163127] border-[#28523F] text-[#70D0A8]' 
              : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
          }`}>
            {syncState === 'syncing' ? (
              <RefreshCw size={18} className="animate-spin text-current" />
            ) : syncState === 'synced' ? (
              <CheckCircle2 size={18} className="text-emerald-500 animate-in zoom-in-75 duration-200" />
            ) : (
              <FileSpreadsheet size={19} className="btn-icon-excel text-[#059669] dark:text-[#70D0A8]" />
            )}
          </div>
          <div>
            <div className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
              <span>Sync Excel</span>
              {syncState === 'synced' && <span className="text-[10px] text-emerald-500 font-bold">• Synced</span>}
            </div>
            <div className={`text-[10px] sm:text-[11px] font-medium ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
              {subtitle || `Last synced: ${liveDateTime || '23 Sept 2026, 15:02'}`}
            </div>
          </div>
        </button>

        {isModalOpen && (
          <ExcelImportModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSyncSuccess}
          />
        )}
      </>
    );
  }

  const buttonStyle = variant === 'sidebar'
    ? "w-full py-2 px-3.5 bg-[#107C41] hover:bg-[#0E6C38] text-white text-xs font-bold rounded-lg transition-all duration-150 ease-out active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-md cursor-pointer text-center flex items-center justify-center gap-2 group select-none disabled:opacity-50 border border-[#0B5C30]"
    : variant === 'secondary'
    ? isDark
      ? "flex items-center gap-2 text-xs font-extrabold text-[#E8D6AE] bg-[#2A2419] border border-[#55462C] hover:bg-[#342C1E] px-3.5 py-2 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-2xs cursor-pointer select-none group disabled:opacity-50"
      : "flex items-center gap-2 text-xs font-extrabold text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#DCFCE7] hover:border-[#86EFAC] px-3.5 py-2 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-2xs cursor-pointer select-none group disabled:opacity-50"
    : isDark
    ? "flex items-center gap-2 text-xs font-extrabold text-[#111111] bg-[#C9A86A] hover:bg-[#D7B97C] border border-[#B89355] rounded-xl px-4 py-2.5 shadow-2xs hover:shadow-md transition-all duration-150 ease-out active:scale-[0.98] hover:-translate-y-[1px] cursor-pointer flex-shrink-0 select-none group disabled:opacity-50"
    : "flex items-center gap-2 text-xs font-extrabold text-white bg-[#107C41] hover:bg-[#0E6C38] border border-[#0B5C30] rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-150 ease-out active:scale-[0.98] hover:-translate-y-[1px] cursor-pointer flex-shrink-0 select-none group disabled:opacity-50";

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={syncState === 'syncing'}
        className={`${buttonStyle} ${className}`}
        title="Upload Excel workbook to synchronize data"
        aria-label={label}
      >
        {syncState === 'syncing' ? (
          <>
            <RefreshCw size={15} className="animate-spin text-current flex-shrink-0" />
            <span>Syncing...</span>
          </>
        ) : syncState === 'synced' ? (
          <>
            <CheckCircle2 size={15} className="text-emerald-300 animate-in zoom-in-75 duration-200 flex-shrink-0" />
            <span className="font-extrabold">Excel Synced</span>
          </>
        ) : (
          <>
            <FileSpreadsheet size={16} className="btn-icon-excel flex-shrink-0 text-emerald-400 dark:text-emerald-300 group-hover:scale-110 transition-transform" />
            <span>{label}</span>
          </>
        )}
      </button>

      {isModalOpen && (
        <ExcelImportModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSyncSuccess}
        />
      )}
    </>
  );
}
