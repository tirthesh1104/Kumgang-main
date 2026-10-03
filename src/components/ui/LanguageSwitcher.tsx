import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-1.5">
      <div className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold border ${
        isDark ? 'bg-[#151517] border-[#262629] text-[#85858B]' : 'bg-white border-slate-200 text-slate-600'
      }`}>
        <Globe size={14} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
        <select
          value={language}
          onChange={e => setLanguage(e.target.value as 'en' | 'ko')}
          className={`bg-transparent text-xs font-semibold outline-none cursor-pointer ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}
          title={t('language')}
        >
          <option value="en" className={isDark ? 'bg-[#151517] text-white' : 'bg-white text-slate-800'}>
            EN (English)
          </option>
          <option value="ko" className={isDark ? 'bg-[#151517] text-white' : 'bg-white text-slate-800'}>
            KO (한국어)
          </option>
        </select>
      </div>
    </div>
  );
}
