import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, type LanguageMode, type TranslationKey } from '../data/translations';

interface LanguageContextType {
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_LANG_KEY = 'kumkang_language_v1';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'ko') return saved;
    } catch (e) {
      console.warn('Failed to load language from localStorage:', e);
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: LanguageMode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (e) {
      console.error('Error saving language preference:', e);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = (translations[language as keyof typeof translations] || translations.en) as Record<string, string>;
      const fallback = translations.en as Record<string, string>;
      return dict[key] || fallback[key] || String(key);
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if not wrapped
    return {
      language: 'en' as LanguageMode,
      setLanguage: () => {},
      t: (key: TranslationKey) => (translations.en as Record<string, string>)[key] || String(key),
    };
  }
  return ctx;
}
