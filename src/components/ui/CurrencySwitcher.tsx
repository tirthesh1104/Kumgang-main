import { useCurrency, type Currency } from '../../context/CurrencyContext';
import { useApp } from '../../context/AppContext';

export function CurrencySwitcher() {
  const { theme } = useApp();
  const { selectedCurrency, setSelectedCurrency, getCurrencySymbol, currencyRates, isRateAvailable } = useCurrency();
  const isDark = theme === 'dark';

  const currencies: Currency[] = ['USD', 'INR', 'KRW'];

  const rateTooltip = (currency: Currency): string => {
    if (currency === 'USD') return 'Base currency: USD ($)';
    const rate = currencyRates[currency];
    if (typeof rate === 'number' && rate > 0) {
      return `1 USD = ${rate.toFixed(2)} ${currency}${currencyRates.effectiveDate ? ` (Effective: ${currencyRates.effectiveDate})` : ''}`;
    }
    return `${currency} conversion rate unavailable — displaying original USD`;
  };

  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border ${
        isDark ? 'bg-[#141416] border-[#262629]' : 'bg-[#F1F5F9] border-[#DCE5EE]'
      }`}
      title={
        currencyRates.effectiveDate
          ? `FX Effective Date: ${currencyRates.effectiveDate}`
          : 'FX rates: Base USD'
      }
    >
      {currencies.map((currency) => {
        const isSelected = selectedCurrency === currency;
        const available = isRateAvailable(currency);
        return (
          <button
            key={currency}
            onClick={() => setSelectedCurrency(currency)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
              isSelected
                ? (isDark ? 'bg-[#252B3B] text-white' : 'bg-white text-[#0B2239] shadow-sm')
                : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
            } ${!available ? 'opacity-60' : ''}`}
            title={rateTooltip(currency)}
          >
            {getCurrencySymbol(currency)} {currency}
          </button>
        );
      })}
    </div>
  );
}

