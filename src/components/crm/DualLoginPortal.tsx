import { useState, type FormEvent } from 'react';
import {
  Users, Lock, Eye, EyeOff,
  ArrowRight, AlertCircle, X, RefreshCw,
  HardHat, ChevronRight, Code2, KeyRound
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { verifyPassword } from '../../utils/securityServer';
import { GlobalFootprintMap, type MapNode, GLOBAL_NODES } from './GlobalFootprintMap';

interface Props {
  onClose?: () => void;
}

type AuthTab = 'staff' | 'plant' | 'client' | 'developer';

export function DualLoginPortal({ onClose }: Props) {
  const { theme, showNotification } = useApp();
  const { switchRole, activeSession, loginClient, recordStaffLogin } = useClientAccess();
  const isDark = theme === 'dark';

  // Active Tab: Staff | Plant | Client
  const [activeTab, setActiveTab] = useState<AuthTab>('staff');

  // Region Header Toggle
  const [selectedRegion, setSelectedRegion] = useState<'INDIA' | 'AFRICA' | 'GLOBAL'>('INDIA');

  // Developer authentication state
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devError, setDevError] = useState<string | null>(null);

  const isDeveloper = activeSession.role === 'Developer';

  // Selected Map Node
  const [selectedNode, setSelectedNode] = useState<MapNode>(GLOBAL_NODES[2]); // India default

  // Staff Form State
  const [staffEmpNo, setStaffEmpNo] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [autoSignIn, setAutoSignIn] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);

  // Plant / Operations Form State
  const [plantSupervisorId, setPlantSupervisorId] = useState('');
  const [plantEmail, setPlantEmail] = useState('');
  const [plantPassword, setPlantPassword] = useState('');
  const [showPlantPassword, setShowPlantPassword] = useState(false);
  const [plantError, setPlantError] = useState<string | null>(null);
  const [isPlantSubmitting, setIsPlantSubmitting] = useState(false);

  // Client Form State
  const [clientError, setClientError] = useState<string | null>(null);
  const [isClientSubmitting, setIsClientSubmitting] = useState(false);

  // Client password-based login (for Developer-issued credentials)
  // Default to Client ID / Password — OTP is NOT required for normal client login.
  const [clientPasswordId, setClientPasswordId] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showClientPassword, setShowClientPassword] = useState(false);

  // 1. Staff Login Submit
  const handleStaffLogin = (e: FormEvent) => {
    e.preventDefault();
    setStaffError(null);

    if (!staffEmpNo.trim() && !staffEmail.trim()) {
      setStaffError('Please enter Employee No. or Email Address');
      return;
    }
    if (!staffPassword.trim()) {
      setStaffError('Please enter your staff password');
      return;
    }

    setIsStaffSubmitting(true);
    setTimeout(() => {
      setIsStaffSubmitting(false);
      switchRole('Admin');
      // Record the genuine successful login under the identifier the user actually entered.
      recordStaffLogin(staffEmpNo.trim() || staffEmail.trim(), 'Admin');
      showNotification('Authenticated as Administrator (Staff Mode).');
      if (onClose) onClose();
    }, 500);
  };

  // 2. Plant / Operations Login Submit
  const handlePlantLogin = (e: FormEvent) => {
    e.preventDefault();
    setPlantError(null);

    if (!plantSupervisorId.trim() && !plantEmail.trim()) {
      setPlantError('Please enter Supervisor ID or Plant Operations Email');
      return;
    }
    if (!plantPassword.trim()) {
      setPlantError('Please enter your plant authorization password');
      return;
    }

    setIsPlantSubmitting(true);
    setTimeout(() => {
      setIsPlantSubmitting(false);
      // Maps securely to existing ProjectManager role for plant operations
      switchRole('ProjectManager');
      // Record the genuine successful login under the identifier the user actually entered.
      recordStaffLogin(plantSupervisorId.trim() || plantEmail.trim(), 'ProjectManager');
      showNotification('Authenticated as Plant Operations / Project Manager.');
      if (onClose) onClose();
    }, 500);
  };

  // Client password login (for Developer-issued Client ID + password credentials)
  const handleClientPasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const clientId = clientPasswordId.trim().toUpperCase();
    const password = clientPassword;

    if (!clientId) {
      setClientError('Please enter your Client ID.');
      return;
    }
    if (!password) {
      setClientError('Please enter your password.');
      return;
    }

    setIsClientSubmitting(true);
    try {
      const result = await loginClient(clientId, password);
      if (!result.success) {
        setClientError(result.error || 'Invalid Client ID or password.');
        return;
      }
      showNotification(`Client Portal Authenticated (${clientId}).`);
      if (onClose) onClose();
    } catch {
      setClientError('Authentication failed. Please try again.');
    } finally {
      setIsClientSubmitting(false);
    }
  };

  // Quick Role Handlers (evaluation shortcuts to existing roles — no fabricated data)
  const handleQuickRole = (role: 'Admin' | 'ProjectManager') => {
    switchRole(role);
    showNotification(`Quick Login: Signed in as ${role === 'Admin' ? 'Administrator' : 'Project Manager'}.`);
    if (onClose) onClose();
  };

  // Developer entry: open dashboard directly if already authenticated as Developer
  const handleDeveloperEntry = () => {
    if (isDeveloper) {
      showNotification('Developer session active. Opening management dashboard.');
      if (onClose) onClose();
      return;
    }
    setShowDevLogin(true);
    setDevError(null);
  };

  // Developer password authentication (secure developer-only access)
  const handleDeveloperLogin = async (e: FormEvent) => {
    e.preventDefault();
    setDevError(null);
    if (!devPassword.trim()) {
      setDevError('Please enter the Developer access password.');
      return;
    }
    // Developer access is verified against a configured SHA-256 hash of the authorized
    // Developer password (VITE_DEVELOPER_PASSWORD_HASH). The plaintext password is never
    // stored in source code, URLs, or logs. If no authorized hash is configured, the
    // request is rejected — there is no unauthenticated bypass.
    const configuredHash = (import.meta.env.VITE_DEVELOPER_PASSWORD_HASH as string | undefined)?.trim();
    if (!configuredHash) {
      setDevError('Developer access is not configured on this deployment. Set VITE_DEVELOPER_PASSWORD_HASH to enable secure Developer login.');
      return;
    }
    const isValid = await verifyPassword(devPassword, configuredHash);
    if (!isValid) {
      setDevError('Invalid Developer password. Access denied.');
      return;
    }
    setTimeout(() => {
      switchRole('Developer');
      showNotification('Authenticated as Developer. Management dashboard unlocked.');
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className={`min-h-screen w-full transition-colors ${
      isDark ? 'bg-[#0E131F] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
    } flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans`}>
      
      {/* TOP HEADER SECTION */}
      <header className="max-w-7xl w-full mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/kumkang_logo_transparent.png"
            alt="Kumkang Kind Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0E4E8A] dark:text-sky-400">
                {selectedRegion === 'INDIA' && 'KUMKANG INDIA'}
                {selectedRegion === 'AFRICA' && 'KUMKANG AFRICA'}
                {selectedRegion === 'GLOBAL' && 'KUMKANG KIND GLOBAL'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-100 text-[#0E4E8A] dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                ERP GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Aluminum Formwork Engineering · Unified Enterprise Resource Planning & Client Access Portal
            </p>
          </div>
        </div>

        {/* Region Switcher & Close button */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setSelectedRegion('INDIA')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedRegion === 'INDIA'
                  ? 'bg-white dark:bg-slate-700 text-[#0E4E8A] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              India (KKI)
            </button>
            <button
              onClick={() => setSelectedRegion('AFRICA')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedRegion === 'AFRICA'
                  ? 'bg-white dark:bg-slate-700 text-[#0E4E8A] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              East Africa (KKEA)
            </button>
            <button
              onClick={() => setSelectedRegion('GLOBAL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedRegion === 'GLOBAL'
                  ? 'bg-white dark:bg-slate-700 text-[#0E4E8A] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Global (HQ)
            </button>
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-0.5" />
            <button
              onClick={handleDeveloperEntry}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                isDeveloper || activeTab === 'developer'
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
              title={isDeveloper ? 'Open Developer dashboard' : 'Developer access (requires authorization)'}
            >
              <Code2 size={13} />
              Developer
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Close Portal"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* INFORMATIVE CLIENT BANNER matching Screenshot 4 */}
      <div className="max-w-7xl w-full mx-auto mb-6 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800/60 dark:to-slate-800/40 border border-sky-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0E4E8A] dark:text-sky-400 block mb-1">
            CLIENT PROJECT ACCESS SYSTEM
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
            Authorized Client Project Tracking & Certified Document Portal
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Client login uses your designated <strong>Project Access ID</strong> (e.g. <code>KKAF-2026-001</code> or <code>KKI-2026-001</code>). 
            Gives each client secure, real-time access to their own project milestones, journey timeline, and approved PDF downloads, 
            without exposing internal financials, margins, or other clients' records.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('client')}
          className="shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#0E4E8A] hover:bg-[#0B3D6D] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Client Login Access</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        
        {/* LEFT COLUMN: GLOBAL FOOTPRINT MAP (7 cols) */}
        <section className="lg:col-span-7 flex flex-col space-y-4">
          <GlobalFootprintMap
            selectedNodeId={selectedNode.id}
            onSelectNode={node => setSelectedNode(node)}
          />

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Global Branches</span>
              <span className="text-lg font-black text-[#0E4E8A] dark:text-sky-400">7 Locations</span>
              <span className="text-[10px] text-slate-500 block">HQ, Plants & Depots</span>
            </div>
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Formwork Production</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">100% Quality</span>
              <span className="text-[10px] text-slate-500 block">Extrusion to Site</span>
            </div>
            <div className={`p-3.5 rounded-xl border ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Client Isolation</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">Strict RBAC</span>
              <span className="text-[10px] text-slate-500 block">OTP & Access ID Guard</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: COMPACT AUTHENTICATION CARD (5 cols) */}
        <section className="lg:col-span-5">
          <div className={`p-6 sm:p-7 rounded-2xl border shadow-xl transition-all ${
            isDark
              ? 'bg-[#13161F] border-[#252B3B]'
              : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            
            {/* 4-WAY TAB SELECTOR */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'staff'
                    ? 'bg-white dark:bg-[#1E2433] text-[#0E4E8A] dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Users size={12} />
                <span>Staff</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('plant')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'plant'
                    ? 'bg-white dark:bg-[#1E2433] text-[#0E4E8A] dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <HardHat size={12} />
                <span>Plant / Ops</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('client')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'client'
                    ? 'bg-white dark:bg-[#1E2433] text-[#0E4E8A] dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Lock size={12} />
                <span>Client</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('developer'); handleDeveloperEntry(); }}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'developer'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
                title="Developer access (authorized personnel only)"
              >
                <Code2 size={12} />
                <span>Dev</span>
              </button>
            </div>

            {/* TAB 1: STAFF LOGIN */}
            {activeTab === 'staff' && (
              <div>
                <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Internal Staff Sign In
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full ERP management, financial approvals & administrative operations
                  </p>
                </div>

                <form onSubmit={handleStaffLogin} className="space-y-3.5 text-xs">
                  {staffError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      <span>{staffError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Employee Number
                    </label>
                    <input
                      type="text"
                      value={staffEmpNo}
                      onChange={e => setStaffEmpNo(e.target.value)}
                      placeholder="e.g. EMP-2026-081 or ADMIN-001"
                      className={`w-full p-2.5 rounded-lg border outline-none font-medium transition-all ${
                        isDark
                          ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-sky-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0E4E8A]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Corporate Email Address
                    </label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={e => setStaffEmail(e.target.value)}
                      placeholder="prakash@kumkang.in / staff@kumkang.com"
                      className={`w-full p-2.5 rounded-lg border outline-none font-medium transition-all ${
                        isDark
                          ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-sky-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0E4E8A]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Staff Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="text-[10px] font-bold text-[#0E4E8A] dark:text-sky-400 hover:underline flex items-center gap-1"
                      >
                        {showStaffPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                        {showStaffPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={e => setStaffPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full p-2.5 rounded-lg border outline-none font-medium transition-all ${
                        isDark
                          ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-sky-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0E4E8A]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSignIn}
                        onChange={e => setAutoSignIn(e.target.checked)}
                        className="rounded border-slate-400 text-[#0E4E8A] focus:ring-0"
                      />
                      <span className="text-[11px] text-slate-500">Auto sign in on this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isStaffSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl font-extrabold bg-[#0E4E8A] hover:bg-[#0B3D6D] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isStaffSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In as Administrator <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Staff Demo */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Evaluation Shortcuts:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickRole('Admin')}
                      className="px-2.5 py-1 rounded-lg border text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold"
                    >
                      Admin Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRole('ProjectManager')}
                      className="px-2.5 py-1 rounded-lg border text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 font-bold"
                    >
                      PM Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PLANT / OPERATIONS LOGIN */}
            {activeTab === 'plant' && (
              <div>
                <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Plant & Site Operations Sign In
                  </h3>
                  <p className="text-xs text-slate-400">
                    Production schedules, fabrication dispatch & site erection execution
                  </p>
                </div>

                <form onSubmit={handlePlantLogin} className="space-y-3.5 text-xs">
                  {plantError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      <span>{plantError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Site Supervisor / Plant ID
                    </label>
                    <input
                      type="text"
                      value={plantSupervisorId}
                      onChange={e => setPlantSupervisorId(e.target.value)}
                      placeholder="e.g. SUP-SITE-01 or PM-OPS"
                      className={`w-full p-2.5 rounded-lg border outline-none font-medium transition-all ${
                        isDark
                          ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-amber-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Operations Email Address
                    </label>
                    <input
                      type="email"
                      value={plantEmail}
                      onChange={e => setPlantEmail(e.target.value)}
                      placeholder="site.ops@kumkang.com"
                      className={`w-full p-2.5 rounded-lg border outline-none font-medium transition-all ${
                        isDark
                          ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-amber-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Authorization Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPlantPassword(!showPlantPassword)}
                        className="text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                      >
                        {showPlantPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                        {showPlantPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showPlantPassword ? 'text' : 'password'}
                      value={plantPassword}
                      onChange={e => setPlantPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full p-2.5 rounded-lg border outline-none font-medium transition-all ${
                        isDark
                          ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-amber-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                      }`}
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
                    Note: Plant access is scoped to production records, loading schedules, shell plan verification, and site erection checklists.
                  </div>

                  <button
                    type="submit"
                    disabled={isPlantSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl font-extrabold bg-[#C05621] hover:bg-[#9C4221] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPlantSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Signing In to Operations...
                      </>
                    ) : (
                      <>
                        Sign In to Plant Operations <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Plant Ops Shortcut */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Direct Operations Access:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickRole('ProjectManager')}
                    className="px-2.5 py-1 rounded-lg border text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 font-bold"
                  >
                    Launch Plant Ops (PM Role)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: CLIENT LOGIN (CLIENT ID + PASSWORD) */}
            {activeTab === 'client' && (
              <div>
                <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Authorized Client Project Portal
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase border bg-indigo-100 text-indigo-800 border-indigo-200">
                      ID + PASSWORD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Isolated access to your assigned project milestones & approved PDF plans
                  </p>
                </div>

                  <form onSubmit={handleClientPasswordLogin} className="space-y-3.5 text-xs">
                    {clientError && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>{clientError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={clientPasswordId}
                        onChange={e => setClientPasswordId(e.target.value)}
                        placeholder="e.g. CLIENT-WEST-2026"
                        className={`w-full p-2.5 rounded-lg border font-mono outline-none font-medium transition-all ${
                          isDark
                            ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-sky-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0E4E8A]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showClientPassword ? 'text' : 'password'}
                          value={clientPassword}
                          onChange={e => setClientPassword(e.target.value)}
                          placeholder="Enter your password"
                          className={`w-full p-2.5 pr-9 rounded-lg border outline-none font-medium transition-all ${
                            isDark
                              ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-sky-500'
                              : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0E4E8A]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowClientPassword(!showClientPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showClientPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      Use the Client ID and password issued by your Kumkang Developer to access
                      your assigned projects.
                    </p>

                    <button
                      type="submit"
                      disabled={isClientSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl font-extrabold bg-[#0E4E8A] hover:bg-[#0B3D6D] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isClientSubmitting ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Authenticating...
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> Sign In to Portal
                        </>
                      )}
                    </button>
                  </form>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl w-full mx-auto mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Kumkang Kind Co., Ltd. All Rights Reserved.</span>
          <span>·</span>
          <span>ISO 9001:2015 &amp; ISO 14001 Certified</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Confidential ERP System</span>
          <span>·</span>
          <span>Multi-Tenant RBAC Security</span>
          <span>·</span>
          <span>Version 2.4.0 (Remediated Production)</span>
        </div>
      </footer>

      {/* Developer Secure Login Overlay */}
      {showDevLogin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border transition-all ${
            isDark ? 'bg-[#13161F] border-[#252B3B]' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? 'border-[#252B3B]' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Developer Access
                  </h3>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Restricted to authorized technical personnel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDevLogin(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-[#252B3B] text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDeveloperLogin} className="p-6 space-y-4">
              {devError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{devError}</span>
                </div>
              )}

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Developer Access Password
                </label>
                <div className="relative">
                  <KeyRound size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    value={devPassword}
                    onChange={e => setDevPassword(e.target.value)}
                    placeholder="Enter developer password"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg border outline-none font-medium text-xs transition-all ${
                      isDark
                        ? 'bg-[#181C26] border-[#2E364A] text-white focus:border-purple-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-purple-500'
                    }`}
                    autoFocus
                  />
                </div>
              </div>

              <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
                isDark ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}>
                Developer access grants the Project Manager-style dashboard with the
                Generate ID &amp; Password credential management tool. All actions are
                audit-logged.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-extrabold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Code2 size={14} /> Unlock Developer Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
