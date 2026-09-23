import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Paintbrush, Factory,
  Truck, AlertTriangle, User, ChevronRight, Menu, X, 
  Building2, History, Sun, Moon, Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SyncExcelButton } from '../ui/SyncExcelButton';
import { UpdateHistoryModal } from '../UpdateHistoryModal';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isAction?: boolean;
}

interface NavGroup {
  title: string;
  isOperations?: boolean;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'PORTFOLIO',
    items: [
      { id: 'projects', label: 'Projects', icon: FolderKanban },
    ]
  },
  {
    title: 'OPERATIONS',
    isOperations: true,
    items: [
      { id: 'design', label: 'Design', icon: Paintbrush },
      { id: 'production', label: 'Production', icon: Factory },
      { id: 'shipment', label: 'Shipment', icon: Truck },
    ]
  },
  {
    title: 'RISK',
    items: [
      { id: 'delays', label: 'Delays & Risk', icon: AlertTriangle },
    ]
  },
  {
    title: 'DATA',
    items: [
      { id: 'pipeline', label: 'Live Data Pipeline', icon: Database },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'audit-log', label: 'Audit Log History', icon: History, isAction: true },
      { id: 'admin', label: 'Administrator', icon: User, isAction: true },
    ]
  }
];

function SidebarContent() {
  const { currentPage, navigate, theme, setIsEditModalOpen } = useApp();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isDark = theme === 'dark';

  const categoryColors: Record<string, string> = {
    dashboard: isDark ? 'text-[#C9A86A]' : 'text-[#38BDF8]',
    projects: isDark ? 'text-[#C9A86A]' : 'text-[#38BDF8]',
    design: isDark ? 'text-[#9A82D4]' : 'text-[#C084FC]',
    production: isDark ? 'text-[#4BA7A7]' : 'text-[#2DD4BF]',
    shipment: isDark ? 'text-[#56A9C7]' : 'text-[#38BDF8]',
    delays: isDark ? 'text-[#E05A5A]' : 'text-[#F87171]',
    pipeline: isDark ? 'text-[#3FB984]' : 'text-[#34D399]',
    'audit-log': isDark ? 'text-[#85858B]' : 'text-slate-400',
    admin: isDark ? 'text-[#C9A86A]' : 'text-[#38BDF8]',
  };

  const handleItemClick = (item: NavItem) => {
    if (item.id === 'audit-log') {
      setIsHistoryOpen(true);
    } else if (item.id === 'admin') {
      setIsEditModalOpen(true);
    } else {
      navigate(item.id as Parameters<typeof navigate>[0]);
    }
  };

  const renderNavItem = (item: NavItem) => {
    const active = currentPage === item.id || (item.id === 'projects' && currentPage === 'project-detail');
    const iconColor = categoryColors[item.id] || (isDark ? 'text-[#C9A86A]' : 'text-[#38BDF8]');

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group text-left cursor-pointer ${
          active
            ? isDark
              ? 'bg-[#1B1B1F] text-[#FFFFFF] font-semibold border-l-2 border-l-[#C9A86A] shadow-xs'
              : 'bg-[#142E4C] text-white font-semibold border-l-2 border-l-[#1688D4] shadow-xs'
            : isDark
            ? 'text-[#A0A0A5] hover:bg-[#141416] hover:text-[#FFFFFF]'
            : 'text-slate-300 hover:bg-[#142E4C]/60 hover:text-white'
        }`}
        aria-current={active ? 'page' : undefined}
      >
        <item.icon size={16} className={`flex-shrink-0 transition-colors ${active ? (isDark ? 'text-[#C9A86A]' : 'text-[#38BDF8]') : iconColor}`} />
        <span className="truncate">{item.label}</span>
        {active && (
          <ChevronRight size={13} className={`ml-auto flex-shrink-0 ${isDark ? 'text-[#C9A86A]' : 'text-[#38BDF8]'}`} />
        )}
      </button>
    );
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-200 ${
      isDark ? 'bg-[#090909] text-[#F5F5F3]' : 'bg-[#0B2239] text-white'
    }`}>
      {/* Brand */}
      <div className={`px-4 py-3.5 border-b transition-colors ${isDark ? 'border-[#1E1E20]' : 'border-[#142E4C]'}`}>
        <motion.div 
          onClick={() => navigate('dashboard')}
          className="cursor-pointer group select-none flex flex-col items-start pl-1"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('dashboard')}
          title="Kumkang Kind Management Dashboard"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Prominent Logo Container aligned slightly to left */}
          <motion.div 
            className="relative overflow-hidden bg-white rounded-lg w-[152px] h-[38px] shadow-xs border border-white/40 flex items-center justify-center transition-all"
            whileHover={{ 
              scale: 1.03, 
              y: -1,
              boxShadow: isDark 
                ? '0 6px 22px -3px rgba(56, 189, 248, 0.35), 0 0 10px rgba(255,255,255,0.1)' 
                : '0 6px 22px -3px rgba(2, 132, 199, 0.25)' 
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
          >
            {/* Ambient Shimmer / Light Sweep */}
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none z-20"
              animate={{
                translateX: ['-100%', '200%'],
              }}
              transition={{
                repeat: Infinity,
                repeatDelay: 3.5,
                duration: 1.4,
                ease: "easeInOut"
              }}
            />
            
            {/* Exact original Kumkang logo */}
            <motion.img
              src="/kumkang_logo.png"
              alt="Kumkang Kind"
              className="h-[28px] w-auto object-contain block relative z-10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
            />
          </motion.div>

          {/* Subtitle & Live Status */}
          <div className="flex items-center gap-2 mt-2 pl-0.5">
            <span className={`text-sm font-medium ${isDark ? 'text-[#F5F5F3]' : 'text-white'}`}>
              Management Dashboard
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" title="System Connected & Live" />
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2 pb-1">
              <p className={`text-[10px] font-bold uppercase tracking-wider select-none ${
                isDark ? 'text-[#65656B]' : 'text-slate-400/80'
              }`}>
                {group.title}
              </p>
            </div>
            {group.isOperations ? (
              <div className={`ml-1.5 pl-2 space-y-1 border-l ${isDark ? 'border-[#262629]/60' : 'border-white/10'}`}>
                {group.items.map((item) => renderNavItem(item))}
              </div>
            ) : (
              <div className="space-y-1">
                {group.items.map((item) => renderNavItem(item))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {isHistoryOpen && <UpdateHistoryModal onClose={() => setIsHistoryOpen(false)} />}
    </div>
  );
}

export function Sidebar() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  return (
    <aside className={`hidden lg:flex flex-col w-60 h-screen border-r fixed left-0 top-0 z-30 shadow-lg transition-colors duration-200 ${
      isDark ? 'bg-[#090909] border-[#1E1E20]' : 'bg-[#0B2239] border-[#142E4C]'
    }`}>
      <SidebarContent />
    </aside>
  );
}

export function MobileNav() {
  const { sidebarOpen, setSidebarOpen, theme } = useApp();
  const isDark = theme === 'dark';
  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className={`fixed left-0 top-0 h-full w-64 z-50 shadow-2xl lg:hidden border-r ${
              isDark ? 'bg-[#090909] border-[#1E1E20]' : 'bg-[#0B2239] border-[#142E4C]'
            }`}
          >
            <div className={`flex items-center justify-between px-4 py-4 border-b ${
              isDark ? 'border-[#1E1E20] bg-[#090909]' : 'border-[#142E4C] bg-[#0B2239]'
            }`}>
              <span className="font-bold text-white text-sm">Navigation Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-1 rounded-lg ${isDark ? 'text-[#B4B4B8] hover:bg-[#141416]' : 'text-slate-300 hover:bg-[#142E4C]'}`}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TopBar() {
  const { setSidebarOpen, liveDateTime, theme, toggleTheme } = useApp();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const isDark = theme === 'dark';

  return (
    <header className={`h-14 border-b flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20 shadow-xs transition-colors duration-200 ${
      isDark ? 'bg-[#0A0A0A] border-[#202023] text-[#F5F5F3]' : 'bg-[#FFFFFF] border-[#DCE5EE] text-[#0F172A]'
    }`}>
      <button
        className={`lg:hidden p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-[#141416] text-[#B4B4B8]' : 'hover:bg-slate-100 text-[#475569]'
        }`}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 lg:hidden">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${
          isDark ? 'bg-[#18181B] border-[#303035] text-[#C9A86A]' : 'bg-[#0B2239] border-[#0B2239] text-white'
        }`}>
          <Building2 size={14} />
        </div>
        <span className={`font-bold text-sm ${isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}`}>Kumkang Monitor</span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-2.5 flex-wrap">
        {/* Theme Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer select-none border shadow-2xs ${
            isDark
              ? 'bg-[#151517] text-[#E8E8E6] border-[#303035] hover:bg-[#1F1F22] hover:border-[#46464D]'
              : 'bg-[#FFFFFF] text-[#1688D4] border-[#DCE5EE] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="dark-moon"
                initial={{ rotate: -60, scale: 0.85, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 60, scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Moon size={18} className="text-[#E8E8E6]" />
              </motion.div>
            ) : (
              <motion.div
                key="light-sun"
                initial={{ rotate: -60, scale: 0.85, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 60, scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Sun size={18} className="text-[#1688D4]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Sync Excel Action Button in Header */}
        <SyncExcelButton variant="secondary" label="Sync Excel" />

        <button
          onClick={() => setIsHistoryOpen(true)}
          className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150 ease-out active:scale-[0.98] hover:-translate-y-[1px] cursor-pointer select-none group border ${
            isDark
              ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035] hover:bg-[#222226] hover:border-[#46464D]'
              : 'text-[#14213D] bg-white border-[#DCE5EE] hover:bg-slate-50'
          }`}
          title="View update audit trail history"
        >
          <History size={13} className={`group-hover:rotate-12 transition-transform duration-150 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`} />
          <span>Audit Log</span>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
            isDark ? 'bg-[#141416] border-[#262629] text-[#B4B4B8]' : 'bg-[#F1F5F9] border-[#DCE5EE] text-[#475569]'
          }`}>
            DISPLAY <strong className={isDark ? 'text-[#FFFFFF]' : 'text-[#0B2239]'}>USD</strong>
          </span>
        </div>

        <div className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-md border ${
          isDark ? 'text-[#B4B4B8] bg-[#141416] border-[#262629]' : 'text-[#475569] bg-[#F1F5F9] border-[#DCE5EE]'
        }`}>
          <span className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'}>Reporting:</span>
          <span className={`font-semibold ${isDark ? 'text-[#F5F5F3]' : 'text-[#14213D]'}`}>{liveDateTime}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="live-dot w-2.5 h-2.5 rounded-full bg-[#3FB984] animate-pulse" aria-hidden="true" />
          <span className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${isDark ? 'text-[#70D0A8]' : 'text-[#16A36A]'}`}>Live</span>
        </div>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
          isDark ? 'bg-[#18181B] border-[#303035] text-[#C9A86A]' : 'bg-[#0B2239] border-[#0B2239] text-white'
        }`} aria-label="Administrator">
          <User size={15} />
        </div>
      </div>

      {isHistoryOpen && <UpdateHistoryModal onClose={() => setIsHistoryOpen(false)} />}
    </header>
  );
}
