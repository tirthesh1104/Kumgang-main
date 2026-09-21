import { useState } from 'react';
import { FileSpreadsheet, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ExcelImportModal } from '../ExcelImportModal';
import { useApp } from '../../context/AppContext';

interface SyncExcelButtonProps {
  variant?: 'primary' | 'secondary' | 'sidebar';
  className?: string;
  label?: string;
}

export function SyncExcelButton({ variant = 'primary', className = '', label = 'Excel File' }: SyncExcelButtonProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');

  const handleSyncSuccess = () => {
    setSyncState('synced');
    setTimeout(() => {
      setSyncState('idle');
    }, 1800);
  };

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
