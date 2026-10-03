import { HardDrive, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

interface GoogleDriveButtonProps {
  variant?: 'banner' | 'secondary' | 'compact';
}

export function GoogleDriveButton({ variant = 'secondary' }: GoogleDriveButtonProps) {
  const { showNotification } = useApp();
  const { t } = useLanguage();

  // Read Google Drive URL from environment ONLY (no generic fallbacks)
  const envUrl = (import.meta.env.VITE_GOOGLE_DRIVE_URL as string | undefined)?.trim();
  const isConfigured = !!(envUrl && envUrl.startsWith('http'));

  const handleClick = () => {
    if (isConfigured && envUrl) {
      window.open(envUrl, '_blank', 'noopener,noreferrer');
    } else {
      showNotification('Google Drive repository link is Not Supported or not configured.');
    }
  };

  if (variant === 'banner') {
    return (
      <button
        onClick={handleClick}
        className="cursor-pointer px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all border shadow-2xs dark:bg-[#18181B] dark:text-[#F5F5F3] dark:border-[#303035] dark:hover:bg-[#222226] bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
        title="Open Google Drive Repository"
      >
        <HardDrive size={15} className="text-[#0284C7] dark:text-[#38BDF8]" />
        <span>{t('googleDriveLabel')}</span>
        <ExternalLink size={12} className="opacity-70" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all border shadow-2xs dark:bg-[#18181B] dark:text-[#F5F5F3] dark:border-[#303035] dark:hover:bg-[#222226] bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
      title="Open Google Drive Repository"
    >
      <HardDrive size={14} className="text-[#0284C7] dark:text-[#38BDF8]" />
      <span className="hidden sm:inline">{t('googleDriveLabel')}</span>
      <ExternalLink size={12} className="opacity-70" />
    </button>
  );
}



