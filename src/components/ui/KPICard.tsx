import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'highlight' | 'attention' | 'danger';
  index?: number;
  onClick?: () => void;
}

function AnimatedNumber({ value }: { value: string | number }) {
  const valStr = String(value);
  // Extract numerical parts if present
  const numMatch = valStr.match(/[\d,.]+/);
  const rawNum = numMatch ? parseFloat(numMatch[0].replace(/,/g, '')) : null;

  const [displayValue, setDisplayValue] = useState<string | number>(value);

  useEffect(() => {
    if (rawNum == null || isNaN(rawNum)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = rawNum;
    const duration = 350; // ms
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);

      const prefix = valStr.substring(0, numMatch!.index);
      const suffix = valStr.substring(numMatch!.index! + numMatch![0].length);
      const formattedCurrent = current.toLocaleString();

      setDisplayValue(`${prefix}${formattedCurrent}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, rawNum]);

  return <>{displayValue}</>;
}

import { useApp } from '../../context/AppContext';

function getKpiTheme(label: string, variant?: string, isDark: boolean = true) {
  const l = label.toLowerCase();
  if (isDark) {
    if (l.includes('total')) {
      return {
        cardBg: 'bg-[#151517] border-[#262629]',
        iconStyle: 'bg-[#2A2419] text-[#C9A86A] border border-[#55462C] group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#FFFFFF]',
        labelColor: 'text-[#85858B]',
        descColor: 'text-[#B4B4B8]',
      };
    }
    if (l.includes('signed')) {
      return {
        cardBg: 'bg-[#151517] border-[#262629]',
        iconStyle: 'bg-[#163127] text-[#3FB984] border border-[#28523F] group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#FFFFFF]',
        labelColor: 'text-[#85858B]',
        descColor: 'text-[#B4B4B8]',
      };
    }
    if (l.includes('countr')) {
      return {
        cardBg: 'bg-[#151517] border-[#262629]',
        iconStyle: 'bg-[#251F32] text-[#9A82D4] border border-[#42375A] group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#FFFFFF]',
        labelColor: 'text-[#85858B]',
        descColor: 'text-[#B4B4B8]',
      };
    }
    if (l.includes('risk') || variant === 'attention' || variant === 'danger') {
      return {
        cardBg: 'bg-[#34191B]/40 border-[#5A292B]',
        iconStyle: 'bg-[#34191B] text-[#F08A8A] border border-[#5A292B] group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#F08A8A]',
        labelColor: 'text-[#F08A8A]/80',
        descColor: 'text-[#F08A8A]/80',
      };
    }
    if (l.includes('contract') || l.includes('value')) {
      return {
        cardBg: 'bg-[#151517] border-[#262629]',
        iconStyle: 'bg-[#2A2419] text-[#C9A86A] border border-[#55462C] group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#FFFFFF]',
        labelColor: 'text-[#85858B]',
        descColor: 'text-[#B4B4B8]',
      };
    }
    if (l.includes('outstand') || l.includes('balance')) {
      return {
        cardBg: 'bg-[#322917]/40 border-[#5B4724]',
        iconStyle: 'bg-[#322917] text-[#E5C47A] border border-[#5B4724] group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#E5C47A]',
        labelColor: 'text-[#E5C47A]/80',
        descColor: 'text-[#E5C47A]/80',
      };
    }

    return {
      cardBg: 'bg-[#151517] border-[#262629]',
      iconStyle: 'bg-[#18181B] text-[#B4B4B8] border border-[#303035] group-hover:scale-105 transition-transform duration-150',
      numColor: 'text-[#FFFFFF]',
      labelColor: 'text-[#85858B]',
      descColor: 'text-[#B4B4B8]',
    };
  } else {
    // LIGHT MODE
    if (l.includes('total')) {
      return {
        cardBg: 'bg-white border-[#DCE5EE]',
        iconStyle: 'bg-[#E9F5FD] text-[#1688D4] border border-[#1688D4]/30 group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#14213D]',
        labelColor: 'text-[#64748B]',
        descColor: 'text-[#64748B]',
      };
    }
    if (l.includes('signed')) {
      return {
        cardBg: 'bg-white border-[#DCE5EE]',
        iconStyle: 'bg-[#E8F7F0] text-[#087A4D] border border-[#16A36A]/30 group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#14213D]',
        labelColor: 'text-[#64748B]',
        descColor: 'text-[#64748B]',
      };
    }
    if (l.includes('countr')) {
      return {
        cardBg: 'bg-white border-[#DCE5EE]',
        iconStyle: 'bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#14213D]',
        labelColor: 'text-[#64748B]',
        descColor: 'text-[#64748B]',
      };
    }
    if (l.includes('risk') || variant === 'attention' || variant === 'danger') {
      return {
        cardBg: 'bg-[#FDECEC]/60 border-[#D64545]/30',
        iconStyle: 'bg-[#FDECEC] text-[#D64545] border border-[#D64545]/30 group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#D64545]',
        labelColor: 'text-[#D64545]',
        descColor: 'text-[#D64545]',
      };
    }
    if (l.includes('contract') || l.includes('value')) {
      return {
        cardBg: 'bg-white border-[#DCE5EE]',
        iconStyle: 'bg-[#E9F5FD] text-[#0869A8] border border-[#1688D4]/30 group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#14213D]',
        labelColor: 'text-[#64748B]',
        descColor: 'text-[#64748B]',
      };
    }
    if (l.includes('outstand') || l.includes('balance')) {
      return {
        cardBg: 'bg-[#FFF6DD]/60 border-[#D6A84F]/30',
        iconStyle: 'bg-[#FFF6DD] text-[#9A6700] border border-[#D6A84F]/30 group-hover:scale-105 transition-transform duration-150',
        numColor: 'text-[#9A6700]',
        labelColor: 'text-[#9A6700]',
        descColor: 'text-[#9A6700]',
      };
    }

    return {
      cardBg: 'bg-white border-[#DCE5EE]',
      iconStyle: 'bg-[#F1F5F9] text-[#64748B] border border-[#DCE5EE] group-hover:scale-105 transition-transform duration-150',
      numColor: 'text-[#14213D]',
      labelColor: 'text-[#64748B]',
      descColor: 'text-[#64748B]',
    };
  }
}

export function KPICard({
  label,
  value,
  description,
  icon: Icon,
  variant = 'default',
  index = 0,
  onClick,
}: KPICardProps) {
  const { theme: appTheme } = useApp();
  const isDark = appTheme === 'dark';

  const theme = getKpiTheme(label, variant, isDark);
  const valStr = String(value);
  const textSizeClass =
    valStr.length > 8
      ? 'text-xl sm:text-2xl font-extrabold tracking-tight'
      : valStr.length > 6
      ? 'text-2xl sm:text-3xl font-extrabold tracking-tight'
      : 'text-3xl sm:text-4xl font-extrabold tracking-tight';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      className={`
        relative rounded-xl border shadow-card p-4 sm:p-5 overflow-hidden transition-all duration-200 group select-none
        ${theme.cardBg}
        ${onClick ? (
          isDark
            ? 'cursor-pointer hover:bg-[#1B1B1F] hover:shadow-card-hover hover:-translate-y-[1px] hover:border-[#3A3A40] active:scale-[0.99] active:translate-y-0'
            : 'cursor-pointer hover:bg-slate-50 hover:shadow-card-hover hover:-translate-y-[1px] hover:border-[#CBD5E1] active:scale-[0.99] active:translate-y-0'
        ) : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2.5 gap-1">
        <p className={`text-[10px] font-extrabold uppercase tracking-widest truncate ${theme.labelColor}`}>{label}</p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${theme.iconStyle}`}>
            <Icon size={14} />
          </div>
        )}
      </div>
      <p className={`${textSizeClass} leading-tight mb-1 truncate ${theme.numColor}`} title={valStr}>
        <AnimatedNumber value={value} />
      </p>
      {description && (
        <p className={`text-[11px] font-medium mt-1 leading-snug truncate ${theme.descColor}`}>{description}</p>
      )}
    </motion.div>
  );
}
