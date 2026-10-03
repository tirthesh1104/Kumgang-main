import { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, CheckCheck, X, Clock, DollarSign, Truck, FileCheck, Info } from 'lucide-react';

export function NotificationCenter() {
  const { theme, navigate } = useApp();
  const { activeSession } = useClientAccess();
  const { t } = useLanguage();
  const { getNotificationsForUser, markNotificationAsRead, dismissNotification, markAllNotificationsAsRead } = useData();

  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const notifications = getNotificationsForUser(
    activeSession.role,
    activeSession.assignedProjects
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT_DUE': return <DollarSign className="text-emerald-400" size={16} />;
      case 'DESIGN_DELAYED': return <Clock className="text-amber-400" size={16} />;
      case 'SHIPMENT_PENDING': return <Truck className="text-cyan-400" size={16} />;
      case 'APPROVAL_REQUIRED': return <FileCheck className="text-purple-400" size={16} />;
      default: return <Info className="text-sky-400" size={16} />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
          isDark
            ? 'bg-[#151517] border-[#262629] text-[#85858B] hover:text-white hover:bg-[#1A1A1E]'
            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
        title={t('notifications')}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#151517] border-[#303035] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#111113] border-[#262629]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Bell size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
              <h4 className="font-bold text-sm tracking-wide">{t('notifications')}</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(activeSession.displayName || 'User')}
                className={`text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                  isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'
                }`}
              >
                <CheckCheck size={13} /> {t('markAllAsRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-700/20 text-xs">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic">
                {t('noNotifications')}
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id, activeSession.displayName || 'User');
                    if (n.projectId) {
                      navigate('project-detail', n.projectId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    !n.read
                      ? (isDark ? 'bg-cyan-950/20 hover:bg-cyan-950/30' : 'bg-sky-50/70 hover:bg-sky-100/70')
                      : (isDark ? 'hover:bg-[#1A1A1E]' : 'hover:bg-slate-50')
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-gray-800/40 border border-gray-700/40 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-[11px] leading-snug line-clamp-2 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{n.message}</p>
                    {n.projectId && (
                      <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-700/50 text-cyan-300">
                        {n.projectId}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(n.id, activeSession.displayName || 'User');
                    }}
                    className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Dismiss notification"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
