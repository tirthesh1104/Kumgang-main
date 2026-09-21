import { useState } from 'react';
import { X, Building2, Globe, ShieldCheck, Key, History, Edit, Ban, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import type { ClientRecord, AccountStatus } from '../../types/clientAccess';
import { generateSecurePassword } from '../../utils/securityServer';

interface Props {
  client: ClientRecord | null;
  onClose: () => void;
  onEditClient: (client: ClientRecord) => void;
}

export function ClientDetailsModal({ client, onClose, onEditClient }: Props) {
  const { theme, showNotification } = useApp();
  const { updateClientStatus, resetClientPassword } = useClientAccess();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'info' | 'projects' | 'permissions' | 'security' | 'status' | 'history'>('info');
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  if (!client) return null;

  const handleSuspendToggle = async () => {
    const newStatus: AccountStatus = client.accountStatus === 'Active' ? 'Suspended' : 'Active';
    const res = await updateClientStatus(client.internalId, newStatus);
    if (res.success) {
      showNotification(`Client ${client.clientId} account status updated to ${newStatus}.`);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword.trim()) {
      showNotification('Please enter or generate a new password.');
      return;
    }
    const res = await resetClientPassword(client.internalId, newPassword.trim());
    if (res.success) {
      showNotification(`Password for Client ${client.clientId} reset successfully.`);
      setResetPassModalOpen(false);
      setNewPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl border max-h-[92vh] flex flex-col transition-all ${
          isDark ? 'bg-[#121214] border-[#2A2A2E] text-[#F5F5F3]' : 'bg-[#FFFFFF] border-[#DCE5EE] text-[#0F172A]'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 ${
          isDark ? 'border-[#262629] bg-[#121214]' : 'border-[#E2E8F0] bg-[#FFFFFF]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isDark ? 'bg-[#18181B] border-[#303035] text-[#C9A86A]' : 'bg-[#E0F2FE] border-[#BAE6FD] text-[#1688D4]'
            }`}>
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  isDark ? 'bg-[#18181B] border-[#303035] text-[#C9A86A]' : 'bg-slate-100 border-slate-300 text-[#1688D4]'
                }`}>
                  {client.clientId}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  client.accountStatus === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {client.accountStatus}
                </span>
              </div>
              <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {client.companyName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#1C1C20] text-[#85858B]' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 border-b flex flex-wrap gap-2 pt-3 ${isDark ? 'border-[#262629] bg-[#161618]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}>
          {[
            { id: 'info', label: 'Client Information', icon: Building2 },
            { id: 'projects', label: `Assigned Projects (${client.assignedProjects.length})`, icon: Globe },
            { id: 'permissions', label: 'Access Permissions', icon: ShieldCheck },
            { id: 'security', label: 'Login & Security', icon: Key },
            { id: 'status', label: 'Account Status', icon: CheckCircle2 },
            { id: 'history', label: `Access History (${(client.accessHistory || []).length})`, icon: History },
          ].map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                  active
                    ? (isDark ? 'border-[#C9A86A] text-[#C9A86A] bg-[#121214]' : 'border-[#1688D4] text-[#1688D4] bg-white')
                    : (isDark ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900')
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: CLIENT INFORMATION */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#18181B]/50 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                <p className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Corporate Identity</p>
                <div>
                  <span className="text-slate-400 block font-medium">Public Client ID</span>
                  <span className="font-mono font-bold text-sm text-[#C9A86A]">{client.clientId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Company Name</span>
                  <span className="font-bold text-sm">{client.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Country</span>
                  <span className="font-semibold">{client.country || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Company Address</span>
                  <span className="font-semibold">{client.companyAddress || '—'}</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#18181B]/50 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                <p className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">Contact Details</p>
                <div>
                  <span className="text-slate-400 block font-medium">Contact Person Name</span>
                  <span className="font-bold text-sm">{client.contactPerson}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Registered Email</span>
                  <span className="font-semibold">{client.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile Phone</span>
                  <span className="font-semibold">{client.mobile || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Registration Date</span>
                  <span className="font-semibold">{client.createdAt}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">Assigned Projects ({client.assignedProjects.length})</span>
                <span className="text-slate-400">Assigned Country: <strong>{client.assignedCountry}</strong> | Folder: <strong>{client.assignedFolder}</strong></span>
              </div>
              {client.assignedProjects.length === 0 ? (
                <p className="text-slate-500 italic p-4 text-center">No projects currently assigned to this client account.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {client.assignedProjects.map(pid => (
                    <div key={pid} className={`p-3 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-[#18181B] border-[#2A2A2E]' : 'bg-white border-slate-200'
                    }`}>
                      <div>
                        <span className="font-mono font-bold text-[#C9A86A] text-xs block">{pid}</span>
                        <span className="font-bold text-xs">Project {pid}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Assigned</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCESS PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              {Object.entries(client.permissions).map(([key, val]) => (
                <div key={key} className={`p-3 rounded-lg border flex items-center justify-between ${
                  val
                    ? (isDark ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-900')
                    : (isDark ? 'bg-[#141416] border-[#262629] text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400')
                }`}>
                  <span className="font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${val ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    {val ? 'ALLOWED' : 'DENIED'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: LOGIN & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#18181B]/50 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-medium">Username / Login ID</span>
                    <span className="font-mono font-bold text-sm">{client.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Stored Password Hash</span>
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs block">{client.passwordHash.substring(0, 24)}... (SHA-256 Hashed)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                  <span>Require Password Change on First Login:</span>
                  <strong className={client.requirePasswordChange ? 'text-amber-400' : 'text-slate-400'}>
                    {client.requirePasswordChange ? 'YES' : 'NO'}
                  </strong>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Two-Factor Authentication:</span>
                  <strong className={client.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-400'}>
                    {client.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                  </strong>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Last Login Timestamp:</span>
                  <span className="font-mono font-semibold">{client.lastLoginAt || 'Never logged in'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNT STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#18181B]/50 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Account Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    client.accountStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {client.accountStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Access Start Date:</span>
                  <span className="font-semibold">{client.accessStartDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Access Expiry Date:</span>
                  <span className="font-semibold">{client.accessExpiryDate}</span>
                </div>
                {client.accountNotes && (
                  <div className="pt-2 border-t border-slate-700/30">
                    <span className="text-slate-400 block font-medium mb-1">Account Notes:</span>
                    <p className="italic text-slate-300">{client.accountNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ACCESS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2 text-xs">
              {(client.accessHistory || []).length === 0 ? (
                <p className="text-slate-500 italic p-4 text-center">No access history entries logged for this client yet.</p>
              ) : (
                (client.accessHistory || []).map(log => (
                  <div key={log.id} className={`p-3 rounded-lg border text-xs space-y-1 ${
                    isDark ? 'bg-[#18181B] border-[#262629]' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-400 text-[10px]">{log.timestamp}</span>
                      <span className="font-bold text-[#C9A86A]">{log.action}</span>
                    </div>
                    <p className="font-medium text-slate-200">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10 ${
          isDark ? 'border-[#262629] bg-[#121214]' : 'border-[#E2E8F0] bg-[#FFFFFF]'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { onClose(); onEditClient(client); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isDark ? 'bg-[#18181B] text-white border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Edit size={13} /> EDIT CLIENT
            </button>

            <button
              onClick={() => { onClose(); onEditClient(client); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isDark ? 'bg-[#18181B] text-white border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Globe size={13} /> MANAGE PROJECT ACCESS
            </button>

            <button
              onClick={() => { onClose(); onEditClient(client); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isDark ? 'bg-[#18181B] text-white border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={13} /> MANAGE PERMISSIONS
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setResetPassModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isDark ? 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/60' : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Key size={13} /> RESET PASSWORD
            </button>

            <button
              onClick={handleSuspendToggle}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                client.accountStatus === 'Active'
                  ? (isDark ? 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/60' : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100')
                  : (isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60' : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100')
              }`}
            >
              <Ban size={13} /> {client.accountStatus === 'Active' ? 'SUSPEND ACCESS' : 'ACTIVATE ACCESS'}
            </button>
          </div>
        </div>

        {/* Reset Password Prompt Modal */}
        {resetPassModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className={`p-6 rounded-2xl border max-w-md w-full space-y-4 ${
              isDark ? 'bg-[#18181B] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <h3 className="font-bold text-sm">Reset Password for {client.clientId}</h3>
              <p className="text-xs text-slate-400">Specify a new secure temporary password for {client.companyName}.</p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New password..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-lg border focus:outline-none ${
                    isDark ? 'bg-[#121214] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setNewPassword(generateSecurePassword())}
                  className="px-3 py-2 bg-[#C9A86A] text-[#111111] text-xs font-bold rounded-lg whitespace-nowrap"
                >
                  Generate
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setResetPassModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPasswordSubmit}
                  className="px-4 py-1.5 text-xs font-bold bg-[#1688D4] text-white rounded-lg"
                >
                  Save New Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
