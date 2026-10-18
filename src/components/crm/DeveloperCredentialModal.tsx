import { useState, useMemo } from 'react';
import { X, ShieldCheck, Key, Sparkles, AlertCircle, Eye, EyeOff, Search, History, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { DEFAULT_CLIENT_PERMISSIONS } from '../../types/clientAccess';
import { generateNextClientId, generateSecurePassword } from '../../utils/securityServer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Scopes which controls this modal exposes:
   * - 'developer' (default): full credential administration.
   * - 'projectManager': generate credentials, create clients, assign projects,
   *   and reset passwords — but no account-status changes and no Access Records.
   * Enforcement also happens in securityServer.ts / ClientAccessContext.tsx;
   * this prop only hides controls the role may not use.
   */
  mode?: 'developer' | 'projectManager';
}

export function DeveloperCredentialModal({ isOpen, onClose, mode = 'developer' }: Props) {
  const { theme, showNotification } = useApp();
  const { projects } = useData();
  const { clients, registerClient, updateClient, updateClientStatus, resetClientPassword, getClientByPublicId, clientAuditLogs } = useClientAccess();
  const isDark = theme === 'dark';
  const isProjectManager = mode === 'projectManager';

  // View state: manage credentials (default) or view Staff/PM Access Records
  const [activeView, setActiveView] = useState<'manage' | 'access'>('manage');
  // Access Records is a Developer/Admin surface — Project Managers are always
  // scoped back to the credential-management view.
  const currentView = isProjectManager && activeView === 'access' ? 'manage' : activeView;
  const [accessSearch, setAccessSearch] = useState('');

  // All registered clients (developer may re-activate / deactivate existing accounts)
  const availableClients = useMemo(() => {
    return clients;
  }, [clients]);

  // Genuine successful-login records for Staff / Project Manager / Client sessions.
  // Only events recorded by the real authentication flow are shown; no secrets are stored or displayed.
  const successfulLoginRecords = useMemo(() => {
    const successfulActions = new Set(['LOGIN_SUCCESS', 'CLIENT_LOGIN']);
    const q = accessSearch.trim().toLowerCase();
    return clientAuditLogs
      .filter(r => successfulActions.has(r.action))
      .filter(r => {
        if (!q) return true;
        return (
          (r.userId || '').toLowerCase().includes(q) ||
          (r.userRole || '').toLowerCase().includes(q) ||
          (r.details || '').toLowerCase().includes(q) ||
          (r.timestamp || '').toLowerCase().includes(q)
        );
      });
  }, [clientAuditLogs, accessSearch]);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedClientId, setGeneratedClientId] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Client Form
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [country, setCountry] = useState('India');

  // Existing-client management state
  const [accountStatus, setAccountStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');
  const [resetPassword, setResetPassword] = useState(false);

  // Creation/assignment confirmation (returned from the auth layer, includes real Client ID)
  const [confirmation, setConfirmation] = useState<{
    clientId: string;
    companyName: string;
    password?: string;
    mode: 'created' | 'updated';
    projectCount: number;
  } | null>(null);

  // Auto-generate password when creating new client
  const handleGeneratePassword = () => {
    const newPass = generateSecurePassword();
    setGeneratedPassword(newPass);
  };

  // Auto-generate client ID
  const handleGenerateClientId = () => {
    const newId = generateNextClientId(clients);
    setGeneratedClientId(newId);
  };

  // Handle existing client selection
  const handleSelectExistingClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setResetPassword(false);
    const client = getClientByPublicId(clientId);
    if (client) {
      setSelectedProjectIds(client.assignedProjects || []);
      setAccountStatus(client.accountStatus === 'Suspended' ? 'Suspended' : (client.accountStatus === 'Inactive' ? 'Inactive' : 'Active'));
    } else {
      setAccountStatus('Active');
    }
  };

  // Handle project selection
  const handleToggleProject = (projectId: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isCreatingNew) {
        // Create new client with generated credentials
        if (!companyName || !contactPerson || !email) {
          setError('Company Name, Contact Person, and Email are required.');
          setIsSubmitting(false);
          return;
        }

        if (selectedProjectIds.length === 0) {
          setError('Please select at least one project to assign.');
          setIsSubmitting(false);
          return;
        }

        // Resolve credentials synchronously (setState is async, so compute locally)
        const password = generatedPassword || generateSecurePassword();
        const clientId = generatedClientId || generateNextClientId(clients);
        setGeneratedPassword(password);
        setGeneratedClientId(clientId);

        const result = await registerClient({
          companyName,
          contactPerson,
          email,
          mobile,
          country,
          companyAddress: '',
          password,
          requirePasswordChange: true,
          twoFactorEnabled: false,
          assignedCountry: country,
          assignedFolder: '',
          assignedProjects: selectedProjectIds,
          allowMultipleProjects: true,
          permissions: DEFAULT_CLIENT_PERMISSIONS,
          accountStatus: 'Active',
          accessStartDate: new Date().toISOString().split('T')[0],
          accessExpiryDate: 'No Expiry',
          accountNotes: isProjectManager
            ? 'Created by Project Manager via credential management'
            : 'Created by Developer via credential management',
        });

        if (!result.success || !result.client) {
          setError(result.error || 'Failed to create client account.');
          setIsSubmitting(false);
          return;
        }

        // Use the authoritative Client ID returned by the auth layer (never a stale local value)
        const createdId = result.client.clientId;
        setConfirmation({
          clientId: createdId,
          companyName,
          password,
          mode: 'created',
          projectCount: selectedProjectIds.length,
        });
        showNotification(`Client account ${createdId} created. Credentials shown securely in the confirmation panel.`);
      } else {
        // Update an EXISTING client's project assignments (never create a duplicate)
        if (!selectedClientId) {
          setError('Please select an existing client.');
          setIsSubmitting(false);
          return;
        }

        const client = getClientByPublicId(selectedClientId);
        if (!client) {
          setError('Client not found.');
          setIsSubmitting(false);
          return;
        }

        // Update project assignments on the existing record
        const updateResult = await updateClient(client.internalId, {
          assignedProjects: selectedProjectIds,
          accountNotes: isProjectManager
            ? 'Project assignments updated by Project Manager'
            : 'Project assignments updated by Developer',
        });

        if (!updateResult.success) {
          setError(updateResult.error || 'Failed to update client assignments.');
          setIsSubmitting(false);
          return;
        }

        // Apply account activation / deactivation / suspension if changed.
        // Account status is Admin/Developer-only — Project Managers are blocked
        // here as well as by the credential_admin check in the auth layer.
        if (!isProjectManager && accountStatus !== client.accountStatus) {
          const statusResult = await updateClientStatus(client.internalId, accountStatus);
          if (!statusResult.success) {
            setError(statusResult.error || 'Failed to update account status.');
            setIsSubmitting(false);
            return;
          }
        }

        let newPassword: string | undefined;
        // Optionally reset the password (hashed server-side; plaintext never persisted or logged)
        if (resetPassword) {
          newPassword = generateSecurePassword();
          const resetResult = await resetClientPassword(client.internalId, newPassword);
          if (!resetResult.success) {
            setError(resetResult.error || 'Failed to reset password.');
            setIsSubmitting(false);
            return;
          }
        }

        setConfirmation({
          clientId: client.clientId,
          companyName: client.companyName,
          password: newPassword,
          mode: 'updated',
          projectCount: selectedProjectIds.length,
        });
        showNotification(`Assignments updated for ${client.clientId}.`);
      }

      // Reset form for the next operation (kept in place after showing confirmation)
      setSelectedClientId('');
      setSelectedProjectIds([]);
      setGeneratedPassword('');
      setGeneratedClientId('');
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setMobile('');
      setCountry('India');
      setAccountStatus('Active');
      setResetPassword(false);
      setIsCreatingNew(false);
    } catch {
      // Unexpected error — show generic message to user
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all ${
        isDark ? 'bg-[#13161F] border-[#252B3B]' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#252B3B] bg-[#13161F]' : 'border-slate-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isProjectManager
                  ? 'Project Manager: Client Credential Management'
                  : 'Developer: Client Credential Management'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Generate secure client credentials and assign project access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#252B3B] text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className={`p-1 rounded-xl inline-flex flex-wrap gap-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <button
              type="button"
              onClick={() => { setActiveView('manage'); setConfirmation(null); setError(null); setIsCreatingNew(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentView === 'manage' && !isCreatingNew
                  ? (isDark ? 'bg-[#1E2433] text-white' : 'bg-white text-slate-900 shadow-sm')
                  : (isDark ? 'text-slate-400' : 'text-slate-500')
              }`}
            >
              Existing Client
            </button>
            <button
              type="button"
              onClick={() => { setActiveView('manage'); setConfirmation(null); setError(null); setIsCreatingNew(true); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentView === 'manage' && isCreatingNew
                  ? (isDark ? 'bg-[#1E2433] text-white' : 'bg-white text-slate-900 shadow-sm')
                  : (isDark ? 'text-slate-400' : 'text-slate-500')
              }`}
            >
              Create New Client
            </button>
            {!isProjectManager && (
              <button
                type="button"
                onClick={() => { setActiveView('access'); setError(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                  currentView === 'access'
                    ? (isDark ? 'bg-[#1E2433] text-white' : 'bg-white text-slate-900 shadow-sm')
                    : (isDark ? 'text-slate-400' : 'text-slate-500')
                }`}
              >
                <History size={13} />
                Access Records
              </button>
            )}
          </div>

          {error && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
              isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ACCESS RECORDS VIEW (Developer/Admin-only): genuine successful logins, no secrets */}
          {currentView === 'access' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#181C26] border-[#2A3142]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                  <span className={`text-xs font-black uppercase tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Successful Login Activity (Staff &amp; Project Managers)
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Only real, stored successful-authentication events are listed. Failed attempts and
                  registrations are excluded. No passwords, hashes, or session tokens are shown.
                </p>
              </div>

              <div className="relative">
                <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={accessSearch}
                  onChange={(e) => setAccessSearch(e.target.value)}
                  placeholder="Search by user ID, role, or time…"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark ? 'bg-[#181C26] border-[#2A3142] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {successfulLoginRecords.length === 0 ? (
                <div className={`p-8 rounded-xl border text-center ${isDark ? 'bg-[#181C26] border-[#2A3142]' : 'bg-white border-slate-200'}`}>
                  <History size={28} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {accessSearch.trim() ? 'No matching login records.' : 'No successful login records yet.'}
                  </p>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Records appear here after Staff or Project Managers authenticate through the portal.
                  </p>
                </div>
              ) : (
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-[#2A3142]' : 'border-slate-200'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={isDark ? 'bg-[#181C26] text-slate-400' : 'bg-slate-50 text-slate-500'}>
                          <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">User ID / Username</th>
                          <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Role</th>
                          <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Event</th>
                          <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Last Successful Login</th>
                          <th className="text-left font-bold px-4 py-2.5 whitespace-nowrap">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {successfulLoginRecords.map((rec, idx) => (
                          <tr key={rec.id} className={`border-t ${isDark ? 'border-[#2A3142]' : 'border-slate-100'} ${idx % 2 === 1 ? (isDark ? 'bg-[#141821]' : 'bg-slate-50/50') : ''}`}>
                            <td className={`px-4 py-2.5 font-mono font-bold whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {rec.userId || '—'}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                rec.userRole === 'Admin' ? (isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-700')
                                  : rec.userRole === 'ProjectManager' ? (isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700')
                                  : rec.userRole === 'Client' ? (isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                  : (isDark ? 'bg-slate-500/15 text-slate-400' : 'bg-slate-100 text-slate-600')
                              }`}>
                                {rec.userRole}
                              </span>
                            </td>
                            <td className={`px-4 py-2.5 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {rec.action === 'LOGIN_SUCCESS' ? 'Staff / PM Login' : rec.action === 'CLIENT_LOGIN' ? 'Client Login' : rec.action}
                            </td>
                            <td className={`px-4 py-2.5 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {rec.timestamp}
                            </td>
                            <td className={`px-4 py-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {rec.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'manage' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Existing Client Selection */}
            {!isCreatingNew && (
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Existing Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectExistingClient(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? 'bg-[#181C26] border-[#2A3142] text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">-- Select Client --</option>
                  {availableClients.map(client => (
                    <option key={client.clientId} value={client.clientId}>
                      {client.clientId} - {client.companyName} ({client.contactPerson}){client.accountStatus !== 'Active' ? ` [${client.accountStatus}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Existing-client account controls (password reset; account status is Admin/Developer-only). */}
            {!isCreatingNew && selectedClientId && (
              <div className={`grid grid-cols-1 gap-4 ${isProjectManager ? '' : 'md:grid-cols-2'}`}>
                {!isProjectManager && (
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Account Status
                  </label>
                  <select
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value as 'Active' | 'Inactive' | 'Suspended')}
                    className={`w-full px-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark
                        ? 'bg-[#181C26] border-[#2A3142] text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                )}
                <div className="flex items-end">
                  <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <input
                      type="checkbox"
                      checked={resetPassword}
                      onChange={(e) => setResetPassword(e.target.checked)}
                      className="w-4 h-4 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                    />
                    Reset password (generate a new secure password)
                  </label>
                </div>
              </div>
            )}

            {/* New Client Form */}
            {isCreatingNew && (
              <div className={`p-4 rounded-xl border space-y-4 ${
                isDark ? 'bg-[#181C26] border-[#2A3142]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark
                          ? 'bg-[#0E131F] border-[#252B3B] text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark
                          ? 'bg-[#0E131F] border-[#252B3B] text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark
                          ? 'bg-[#0E131F] border-[#252B3B] text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark
                          ? 'bg-[#0E131F] border-[#252B3B] text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDark
                          ? 'bg-[#0E131F] border-[#252B3B] text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      placeholder="India"
                    />
                  </div>
                </div>

                {/* Generated Credentials Display */}
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Key size={16} className="text-purple-500" />
                    <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                      Generated Credentials
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Client ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={generatedClientId}
                          readOnly
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono border ${
                            isDark
                              ? 'bg-[#0E131F] border-[#252B3B] text-purple-400'
                              : 'bg-white border-slate-200 text-purple-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleGenerateClientId}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                            isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          <Sparkles size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Password
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={generatedPassword}
                            readOnly
                            className={`w-full px-3 py-2 rounded-lg text-xs font-mono border pr-8 ${
                              isDark
                                ? 'bg-[#0E131F] border-[#252B3B] text-purple-400'
                                : 'bg-white border-slate-200 text-purple-700'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                            isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          <Sparkles size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Assignment */}
            <div>
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Assign Projects ({selectedProjectIds.length} selected)
              </label>
              <div className={`max-h-60 overflow-y-auto rounded-lg border p-3 space-y-2 ${
                isDark ? 'bg-[#181C26] border-[#2A3142]' : 'bg-slate-50 border-slate-200'
              }`}>
                {projects.map(project => (
                  <label
                    key={project.projectId}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedProjectIds.includes(project.projectId)
                        ? (isDark ? 'bg-purple-500/20' : 'bg-purple-50')
                        : (isDark ? 'hover:bg-[#252B3B]' : 'hover:bg-slate-100')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjectIds.includes(project.projectId)}
                      onChange={() => handleToggleProject(project.projectId)}
                      className="w-4 h-4 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {project.projectId} - {project.project}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {project.customer} | {project.country}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Creation / Assignment Confirmation */}
            {confirmation && (
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
                  <span className={`text-xs font-black uppercase tracking-wide ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {confirmation.mode === 'created' ? 'Client Account Created' : 'Assignments Updated'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Client ID / Login ID</span>
                    <span className={`font-mono font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{confirmation.clientId}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{confirmation.companyName}</span>
                  </div>
                  <div>
                    <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assigned Projects</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{confirmation.projectCount}</span>
                  </div>
                  {confirmation.password && (
                    <div>
                      <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Initial Password (share securely)</span>
                      <span className={`font-mono font-extrabold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{confirmation.password}</span>
                    </div>
                  )}
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {confirmation.password
                    ? 'Deliver this password to the client through a secure channel. The stored value is hashed and is never recoverable in plaintext. The client will be prompted to change it on first login.'
                    : 'The existing password was not changed. Deliver the previously issued credentials through a secure channel.'}
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="text-[11px] font-bold text-purple-600 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  isDark
                    ? 'bg-[#252B3B] text-slate-300 hover:bg-[#303540]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedProjectIds.length === 0}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-2 ${
                  isSubmitting || selectedProjectIds.length === 0
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    {isCreatingNew ? 'Create Client Account' : 'Update Assignments'}
                  </>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
