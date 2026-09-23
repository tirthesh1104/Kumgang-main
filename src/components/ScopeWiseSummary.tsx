import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { Building2, Layers, Plus, Factory, Briefcase, ArrowRight } from 'lucide-react';
import { calculateScopeMetrics } from '../utils/scopeUtils';
import { ScopeDetailModal } from './ScopeDetailModal';

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState<number>(() => value);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const end = value;
    const duration = 350;
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    const handle = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(handle);
  }, [value]);

  if (value === 0) return <>0</>;
  return <>{displayValue.toLocaleString()}</>;
}

export function ScopeWiseSummary() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { projects } = useData();

  const [selectedScope, setSelectedScope] = useState<string | null>(null);

  // Dynamic scope metrics derived directly from current project state
  const scopeMetrics = useMemo(() => {
    return calculateScopeMetrics(projects);
  }, [projects]);

  // Scopes currently available in the dataset
  const availableScopes = useMemo(() => {
    return Object.keys(scopeMetrics).sort();
  }, [scopeMetrics]);

  const scopeStyles: Record<string, {
    icon: typeof Building2;
    cardBg: string;
    iconContainer: string;
    arrowContainer: string;
    waveColor: string;
  }> = {
    KKV: {
      icon: Building2,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#101F30] via-[#151517] to-[#101F30] border-[#1E3B5C] hover:border-[#38BDF8]/40' 
        : 'bg-gradient-to-br from-[#F0F7FD] via-white to-[#EBF5FB] border-[#D4E8F8] hover:border-sky-300',
      iconContainer: isDark 
        ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8]' 
        : 'bg-sky-100/80 border-[#BAE6FD] text-[#0284C7]',
      arrowContainer: isDark 
        ? 'bg-[#132338] border-[#1D3B5E] text-[#38BDF8] group-hover:bg-[#183250]' 
        : 'bg-sky-100/70 border-sky-200/60 text-sky-700 group-hover:bg-sky-200',
      waveColor: isDark ? '#38BDF8' : '#0284C7',
    },
    KKI: {
      icon: Factory,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#112019] via-[#151517] to-[#112019] border-[#244636] hover:border-[#70D0A8]/40' 
        : 'bg-gradient-to-br from-[#F2FBF6] via-white to-[#F0FDF4] border-[#D1F2DF] hover:border-emerald-300',
      iconContainer: isDark 
        ? 'bg-[#163127] border-[#28523F] text-[#70D0A8]' 
        : 'bg-emerald-100/80 border-[#A7F3D0] text-[#059669]',
      arrowContainer: isDark 
        ? 'bg-[#163127] border-[#28523F] text-[#70D0A8] group-hover:bg-[#1E4335]' 
        : 'bg-emerald-100/70 border-emerald-200/60 text-emerald-700 group-hover:bg-emerald-200',
      waveColor: isDark ? '#70D0A8' : '#059669',
    },
    KKHQ: {
      icon: Layers,
      cardBg: isDark 
        ? 'bg-gradient-to-br from-[#241E14] via-[#151517] to-[#241E14] border-[#443823] hover:border-[#C9A86A]/40' 
        : 'bg-gradient-to-br from-[#FEF9F0] via-white to-[#FFFBEB] border-[#FDE8BA] hover:border-amber-300',
      iconContainer: isDark 
        ? 'bg-[#2A2419] border-[#55462C] text-[#C9A86A]' 
        : 'bg-amber-100/80 border-[#FDE293] text-[#D97706]',
      arrowContainer: isDark 
        ? 'bg-[#2A2419] border-[#55462C] text-[#C9A86A] group-hover:bg-[#382E1E]' 
        : 'bg-amber-100/70 border-amber-200/60 text-amber-700 group-hover:bg-amber-200',
      waveColor: isDark ? '#C9A86A' : '#D97706',
    },
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Layered Icon */}
      <div>
        <div className="flex items-center gap-2">
          <Layers size={17} className={isDark ? 'text-[#38BDF8]' : 'text-[#0284C7]'} />
          <h2 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
            Scope
          </h2>
        </div>
        <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
          Select a scope to view its projects
        </p>
      </div>

      {/* Main Scope Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableScopes.map((scope, idx) => {
          const metric = scopeMetrics[scope];
          const style = scopeStyles[scope] || {
            icon: Briefcase,
            cardBg: isDark ? 'bg-[#151517] border-[#262629]' : 'bg-white border-[#DCE5EE]',
            iconContainer: isDark ? 'bg-[#18181B] text-slate-300' : 'bg-slate-100 text-slate-700',
            arrowContainer: isDark ? 'bg-[#18181B] text-slate-300' : 'bg-slate-100 text-slate-700',
            waveColor: '#64748B',
          };
          const IconComponent = style.icon;

          return (
            <motion.div
              key={scope}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.22, ease: 'easeOut' }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedScope(scope)}
              className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-md ${style.cardBg}`}
            >
              {/* Subtle Decorative Wave Graphic in Bottom-Right */}
              <svg 
                className="absolute -bottom-1 -right-1 w-36 h-24 pointer-events-none opacity-45 dark:opacity-20 transition-transform duration-300 group-hover:scale-105" 
                viewBox="0 0 140 80" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M0 80 C40 45 85 70 140 20 L140 80 Z" 
                  fill={style.waveColor} 
                  fillOpacity="0.14" 
                />
                <path 
                  d="M0 80 C40 45 85 70 140 20" 
                  stroke={style.waveColor} 
                  strokeWidth="1.5" 
                  strokeOpacity="0.3" 
                />
              </svg>

              {/* Top Row: Icon Container (Left) and Circular Arrow Button (Right) */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${style.iconContainer}`}>
                  <IconComponent size={20} />
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 group-hover:translate-x-0.5 shadow-2xs ${style.arrowContainer}`}>
                  <ArrowRight size={14} className="stroke-[2.2]" />
                </div>
              </div>

              {/* Bottom Row: Scope Label, Number, Subtitle */}
              <div className="relative z-10">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                  {scope}
                </span>
                <div className={`text-3xl sm:text-4xl font-black tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                  <AnimatedNumber value={metric.totalProjects} />
                </div>
                <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-slate-500'}`}>
                  Total Projects
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Future Scopes Placeholder Card (Shown when fewer than 3 scopes exist) */}
        {availableScopes.length < 3 && (
          <div className={`rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center text-center select-none min-h-[150px] transition-colors ${
            isDark 
              ? 'border-[#262629] bg-[#111113]/50 text-slate-500' 
              : 'border-slate-200/90 bg-gradient-to-br from-slate-50/50 via-purple-50/20 to-white text-slate-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2.5 border shadow-2xs ${
              isDark ? 'bg-[#18181B] border-[#303035] text-slate-400' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              <Plus size={16} />
            </div>
            <p className="text-xs font-semibold">
              More scopes can be added later
            </p>
          </div>
        )}
      </div>

      {/* Scope Detail View Modal */}
      {selectedScope && (
        <ScopeDetailModal
          isOpen={!!selectedScope}
          scope={selectedScope}
          scopeData={scopeMetrics[selectedScope] || null}
          onClose={() => setSelectedScope(null)}
        />
      )}
    </div>
  );
}
