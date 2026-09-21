import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck, Key, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useClientAccess } from '../../context/ClientAccessContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientLoginModal({ isOpen, onClose }: Props) {
  const { theme, showNotification } = useApp();
  const { loginClient, clients, switchRole } = useClientAccess();
  const isDark = theme === 'dark';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Please enter your Client ID or Username.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginClient(username.trim(), password.trim());
      if (res.success) {
        showNotification('Client Login Successful! Welcome to your secure dashboard.');
        onClose();
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Auto-fill for convenience when testing
  const handleQuickDemoFill = (client: typeof clients[0]) => {
    if (!client) return;
    setUsername(client.clientId);
    // Switch directly in demo mode if requested
    switchRole('Client', client);
    showNotification(`Simulating Client login for ${client.clientId} (${client.companyName}).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border flex flex-col transition-all overflow-hidden ${
          isDark ? 'bg-[#121214] border-[#2A2A2E] text-[#F5F5F3]' : 'bg-[#FFFFFF] border-[#DCE5EE] text-[#0F172A]'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isDark ? 'border-[#262629] bg-[#161618]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isDark ? 'bg-[#18181B] border-[#303035] text-[#C9A86A]' : 'bg-[#E0F2FE] border-[#BAE6FD] text-[#1688D4]'
            }`}>
              <Lock size={18} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
                SECURE PORTAL
              </p>
              <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Client Login Access
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#1C1C20] text-[#85858B]' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-semibold">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
              Client ID / Username
            </label>
            <div className="relative">
              <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="e.g. KKI-CL-0001 or registered email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                  isDark ? 'bg-[#18181B] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-xs font-bold ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                Password
              </label>
              <button
                type="button"
                onClick={() => showNotification('Please contact your Kumkang Project Manager or Admin to reset your password.')}
                className={`text-[11px] font-bold hover:underline ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Key size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                  isDark ? 'bg-[#18181B] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg text-xs font-extrabold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              isDark ? 'bg-[#C9A86A] text-[#111111] hover:bg-[#D7B97C]' : 'bg-[#1688D4] text-white hover:bg-[#1272B2]'
            }`}
          >
            <ShieldCheck size={16} />
            <span>{isSubmitting ? 'VERIFYING...' : 'LOGIN TO CLIENT DASHBOARD'}</span>
          </button>

          {/* Quick Demo Switcher if Clients exist */}
          {clients.length > 0 && (
            <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-[#262629]' : 'border-slate-200'}`}>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Sparkles size={11} /> Quick Demo Access (Registered Clients):
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {clients.map(c => (
                  <button
                    key={c.clientId}
                    type="button"
                    onClick={() => handleQuickDemoFill(c)}
                    className={`w-full text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                      isDark ? 'bg-[#18181B] border-[#2A2A2E] hover:bg-[#222226]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-[#C9A86A] mr-2">{c.clientId}</span>
                      <span className="font-bold">{c.companyName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">Simulate Login →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
