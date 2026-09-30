import { useApp } from '../../context/AppContext';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'forest' | 'orange' | 'blue' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

const colorMap = {
  forest: 'bg-[#3FB984]',
  orange: 'bg-[#E05A5A]',
  blue: 'bg-[#C9A86A]',
  amber: 'bg-[#D6A84F]',
};

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'forest',
  size = 'md',
  showLabel = false,
  label,
}: ProgressBarProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>{label}</span>}
          {showLabel && (
            <span className={`text-xs font-semibold ml-auto ${isDark ? 'text-[#F5F5F3]' : 'text-slate-800'}`}>{pct.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${heightMap[size]} ${isDark ? 'bg-[#28282C]' : 'bg-slate-200'}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heightMap[size]} rounded-full ${colorMap[color]} transition-[width] duration-400 ease-out motion-reduce:transition-none`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface PlannedActualBarProps {
  label: string;
  planned: number;
  actual: number;
  unit?: string;
}

export function PlannedActualBar({ label, planned, actual, unit = '' }: PlannedActualBarProps) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const pct = planned > 0 ? (actual / planned) * 100 : 0;
  const isOk = pct >= 90;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className={`text-xs font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-slate-700'}`}>{label}</span>
        <span className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
          {actual.toLocaleString()}{unit} / {planned.toLocaleString()}{unit}
        </span>
      </div>
      <div className={`relative h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#28282C]' : 'bg-slate-200'}`}>
        <div
          className={`h-full rounded-full ${isOk ? 'bg-[#3FB984]' : 'bg-[#E05A5A]'} transition-[width] duration-400 ease-out motion-reduce:transition-none`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px]">
        <span className="font-bold" style={{ color: isOk ? (isDark ? '#70D0A8' : '#137333') : (isDark ? '#F08A8A' : '#C5221F') }}>
          {pct.toFixed(1)}% of planned
        </span>
        <span className={isDark ? 'text-[#85858B]' : 'text-slate-500'}>Target: {planned.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
}
