import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Currency = 'USD' | 'INR' | 'KRW';

export interface CurrencyRates {
  USD: number;
  INR: number | null;
  KRW: number | null;
  effectiveDate: string | null;
  source: string;
}

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  currencyRates: CurrencyRates;
  isRateAvailable: (currency?: Currency) => boolean;
  convertAmount: (amountUSD: number) => number | null;
  formatCurrency: (amountUSD: number, showSymbol?: boolean) => string;
  formatCompactCurrency: (amountUSD: number) => string;
  getCurrencySymbol: (currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_CURRENCY_KEY = 'kumkang_selected_currency';
const STORAGE_RATES_KEY = 'kumkang_currency_rates_v2';

function loadConfiguredRates(): CurrencyRates {
  try {
    const envJson = import.meta.env.VITE_EXCHANGE_RATES_JSON;
    if (envJson) {
      const parsed = JSON.parse(envJson);
      if (parsed && typeof parsed.INR === 'number' && typeof parsed.KRW === 'number') {
        return {
          USD: 1,
          INR: parsed.INR,
          KRW: parsed.KRW,
          effectiveDate: parsed.effectiveDate || new Date().toISOString().slice(0, 10),
          source: 'Configured',
        };
      }
    }
  } catch {
    // ignore
  }
  try {
    const saved = localStorage.getItem(STORAGE_RATES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.INR === 'number' && typeof parsed.KRW === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { USD: 1, INR: null, KRW: null, effectiveDate: null, source: 'Unavailable' };
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
      if (saved === 'USD' || saved === 'INR' || saved === 'KRW') return saved as Currency;
    } catch {
      // fallback
    }
    return 'USD';
  });

  const [currencyRates, setCurrencyRates] = useState<CurrencyRates>(() => loadConfiguredRates());

  useEffect(() => {
    let cancelled = false;
    async function fetchLiveRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) return;
        const data = await res.json();
        if (
          !cancelled &&
          data &&
          data.result === 'success' &&
          data.rates &&
          typeof data.rates.INR === 'number' &&
          typeof data.rates.KRW === 'number'
        ) {
          const effectiveDate = data.time_last_update_utc
            ? new Date(data.time_last_update_utc).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10);
          const nextRates: CurrencyRates = {
            USD: 1,
            INR: data.rates.INR,
            KRW: data.rates.KRW,
            effectiveDate,
            source: 'Market Reference',
          };
          setCurrencyRates(nextRates);
          try {
            localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify(nextRates));
          } catch {
            // ignore
          }
        }
      } catch {
        // keep configured/cached or unavailable state
      }
    }
    fetchLiveRates();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENCY_KEY, selectedCurrency);
    } catch {
      // ignore
    }
  }, [selectedCurrency]);

  const setSelectedCurrency = useCallback((currency: Currency) => {
    setSelectedCurrencyState(currency);
  }, []);

  const isRateAvailable = useCallback(
    (currency: Currency = selectedCurrency): boolean => {
      if (currency === 'USD') return true;
      const rate = currencyRates[currency];
      return typeof rate === 'number' && rate > 0;
    },
    [selectedCurrency, currencyRates]
  );

  const getCurrencySymbol = useCallback((currency: Currency = selectedCurrency): string => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'INR':
        return '₹';
      case 'KRW':
        return '₩';
      default:
        return '$';
    }
  }, [selectedCurrency]);

  const convertAmount = useCallback(
    (amountUSD: number): number | null => {
      if (amountUSD == null || isNaN(amountUSD)) return 0;
      if (selectedCurrency === 'USD') return amountUSD;
      const rate = currencyRates[selectedCurrency];
      if (typeof rate !== 'number' || rate <= 0) return null;
      return amountUSD * rate;
    },
    [selectedCurrency, currencyRates]
  );

  const formatCurrency = useCallback(
    (amountUSD: number, showSymbol = true): string => {
      if (amountUSD == null || isNaN(amountUSD)) return showSymbol ? '$0' : '0';
      const converted = convertAmount(amountUSD);
      if (converted === null) {
        const usdFormatted = amountUSD.toLocaleString('en-US', { maximumFractionDigits: 0 });
        return showSymbol ? `$${usdFormatted} (USD · rate unavailable)` : `${usdFormatted} USD`;
      }
      const symbol = getCurrencySymbol(selectedCurrency);
      if (selectedCurrency === 'KRW') {
        const formatted = Math.round(converted).toLocaleString('en-US');
        return showSymbol ? `${symbol}${formatted}` : formatted;
      }
      if (selectedCurrency === 'INR') {
        const formatted = Math.round(converted).toLocaleString('en-IN');
        return showSymbol ? `${symbol}${formatted}` : formatted;
      }
      const formatted = converted.toLocaleString('en-US', { maximumFractionDigits: 0 });
      return showSymbol ? `${symbol}${formatted}` : formatted;
    },
    [selectedCurrency, convertAmount, getCurrencySymbol]
  );

  const formatCompactCurrency = useCallback(
    (amountUSD: number): string => {
      if (amountUSD == null || isNaN(amountUSD)) return '$0';
      const converted = convertAmount(amountUSD);
      if (converted === null) {
        if (amountUSD >= 1_000_000) return `$${(amountUSD / 1_000_000).toFixed(2)}M`;
        if (amountUSD >= 1_000) return `$${(amountUSD / 1_000).toFixed(1)}K`;
        return `$${amountUSD.toFixed(0)}`;
      }
      if (selectedCurrency === 'INR') {
        if (converted >= 10_000_000) return `₹${(converted / 10_000_000).toFixed(2)} Cr`;
        if (converted >= 100_000) return `₹${(converted / 100_000).toFixed(2)} L`;
        if (converted >= 1_000) return `₹${(converted / 1_000).toFixed(1)}K`;
        return `₹${Math.round(converted).toLocaleString('en-IN')}`;
      }
      if (selectedCurrency === 'KRW') {
        if (converted >= 100_000_000) return `₩${(converted / 100_000_000).toFixed(2)}억`;
        if (converted >= 1_000_000) return `₩${(converted / 1_000_000).toFixed(1)}M`;
        if (converted >= 1_000) return `₩${(converted / 1_000).toFixed(0)}K`;
        return `₩${Math.round(converted).toLocaleString('en-US')}`;
      }
      if (converted >= 1_000_000) return `$${(converted / 1_000_000).toFixed(2)}M`;
      if (converted >= 1_000) return `$${(converted / 1_000).toFixed(1)}K`;
      return `$${converted.toFixed(0)}`;
    },
    [selectedCurrency, convertAmount]
  );

  const value: CurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    currencyRates,
    isRateAvailable,
    convertAmount,
    formatCurrency,
    formatCompactCurrency,
    getCurrencySymbol,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
