import { Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AnalyseSummaryButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function AnalyseSummaryButton({ onClick, isLoading = false }: AnalyseSummaryButtonProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`
          flex items-center gap-2.5 px-5 py-3 rounded-xl font-extrabold text-xs tracking-wide
          ${isDark
            ? 'bg-[#C9A86A] hover:bg-[#D7B97C] text-[#111111] border border-[#55462C]'
            : 'bg-[#1688D4] hover:bg-[#0D73B8] text-white border border-[#1688D4]'
          }
          shadow-lg hover:shadow-xl hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-0
          transition-all duration-150 ease-out cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          group
        `}
        aria-label="Analyse Summary - Open Portfolio Analysis Panel"
      >
        {isLoading ? (
          <RefreshCw size={16} className={`animate-spin ${isDark ? 'text-[#111111]' : 'text-white'}`} />
        ) : (
          <Sparkles size={16} className={`${isDark ? 'text-[#111111]' : 'text-white'} group-hover:rotate-12 transition-transform duration-200`} />
        )}
        <span>{isLoading ? 'Analysing...' : 'Analyse Summary'}</span>
        <span className={`w-2 h-2 rounded-full animate-pulse ml-0.5 ${isDark ? 'bg-[#111111]/70' : 'bg-white/80'}`} />
      </button>
    </div>
  );
}
