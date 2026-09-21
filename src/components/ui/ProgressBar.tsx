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

const trackMap = {
  forest: 'bg-[#28282C]',
  orange: 'bg-[#28282C]',
  blue: 'bg-[#28282C]',
  amber: 'bg-[#28282C]',
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
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-[#85858B]">{label}</span>}
          {showLabel && (
            <span className="text-xs font-semibold text-[#F5F5F3] ml-auto">{pct.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${heightMap[size]} ${trackMap[color]}`}
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
  const pct = planned > 0 ? (actual / planned) * 100 : 0;
  const isOk = pct >= 90;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-[#B4B4B8]">{label}</span>
        <span className="text-xs text-[#85858B]">
          {actual.toLocaleString()}{unit} / {planned.toLocaleString()}{unit}
        </span>
      </div>
      <div className="relative h-4 bg-[#28282C] rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-[#28282C] rounded-full" />
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${isOk ? 'bg-[#3FB984]' : 'bg-[#E05A5A]'} transition-[width] duration-400 ease-out motion-reduce:transition-none`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        <div className="absolute top-0 right-0 h-full w-0.5 bg-[#46464D]" />
      </div>
      <div className="flex justify-between text-[10px] text-[#85858B]">
        <span className="font-medium" style={{ color: isOk ? '#70D0A8' : '#F08A8A' }}>{pct.toFixed(1)}% of planned</span>
        <span>Target: {planned.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
}
