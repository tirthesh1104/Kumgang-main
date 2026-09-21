import { useState, useMemo } from 'react';
import { X, ShieldCheck, Key, Lock, Building2, User, Mail, Phone, Globe, MapPin, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { DEFAULT_CLIENT_PERMISSIONS, type ClientPermissions, type AccountStatus, type ClientRecord } from '../../types/clientAccess';
import { generateNextClientId, generateSecurePassword } from '../../utils/securityServer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialClientToEdit?: ClientRecord | null;
}

export function ClientRegistrationModal({ isOpen, onClose, initialClientToEdit }: Props) {
  const { theme, showNotification } = useApp();
  const { projects, getUniqueCountries } = useData();
  const { clients, registerClient, updateClient } = useClientAccess();
  const isDark = theme === 'dark';

  const isEditing = !!initialClientToEdit;

  // Auto-generated Client ID for new registration
  const autoClientId = useMemo(() => {
    if (initialClientToEdit) return initialClientToEdit.clientId;
    return generateNextClientId(clients);
  }, [clients, initialClientToEdit]);

  // Available Countries
  const availableCountries = useMemo(() => {
    const fromData = getUniqueCountries();
    return fromData.length > 0 ? fromData : ['India', 'Malaysia', 'Maldives'];
  }, [getUniqueCountries]);

  // Form State - A. CLIENT INFORMATION
  const [companyName, setCompanyName] = useState(initialClientToEdit?.companyName || '');
  const [contactPerson, setContactPerson] = useState(initialClientToEdit?.contactPerson || '');
  const [email, setEmail] = useState(initialClientToEdit?.email || '');
  const [mobile, setMobile] = useState(initialClientToEdit?.mobile || '');
  const [country, setCountry] = useState(initialClientToEdit?.country || availableCountries[0] || 'India');
  const [companyAddress, setCompanyAddress] = useState(initialClientToEdit?.companyAddress || '');

  // Form State - B. LOGIN INFORMATION
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(
    initialClientToEdit ? initialClientToEdit.requirePasswordChange : true
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    initialClientToEdit ? initialClientToEdit.twoFactorEnabled : false
  );

  // Form State - C. PROJECT ACCESS
  const [assignedCountry, setAssignedCountry] = useState(
    initialClientToEdit?.assignedCountry || availableCountries[0] || 'India'
  );

  // Derive Folders for Assigned Country
  const availableFolders = useMemo(() => {
    const countryProjects = projects.filter(
      p => p.country?.toLowerCase() === assignedCountry.toLowerCase()
    );
    const folders = [...new Set(countryProjects.map(p => p.customer || p.project).filter(Boolean))];
    return folders.length > 0 ? folders : ['All Folders'];
  }, [projects, assignedCountry]);

  const [assignedFolder, setAssignedFolder] = useState(
    initialClientToEdit?.assignedFolder || (availableFolders[0] || 'All Folders')
  );

  // Derive Projects for Assigned Country & Folder
  const availableProjects = useMemo(() => {
    return projects.filter(p => {
      const matchCountry = p.country?.toLowerCase() === assignedCountry.toLowerCase();
      const folderKey = p.customer || p.project;
      const matchFolder = assignedFolder === 'All Folders' || folderKey === assignedFolder;
      return matchCountry && matchFolder;
    });
  }, [projects, assignedCountry, assignedFolder]);

  const [assignedProjects, setAssignedProjects] = useState<string[]>(
    initialClientToEdit?.assignedProjects || []
  );
  const [allowMultipleProjects, setAllowMultipleProjects] = useState(
    initialClientToEdit ? initialClientToEdit.allowMultipleProjects : true
  );

  // Form State - D. CLIENT PERMISSIONS
  const [permissions, setPermissions] = useState<ClientPermissions>(
    initialClientToEdit?.permissions || { ...DEFAULT_CLIENT_PERMISSIONS }
  );

  // Form State - E. ACCOUNT CONTROL
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(
    initialClientToEdit?.accountStatus || 'Active'
  );
  const [accessStartDate, setAccessStartDate] = useState(
    initialClientToEdit?.accessStartDate || new Date().toISOString().split('T')[0]
  );
  const [noExpiry, setNoExpiry] = useState(
    initialClientToEdit ? initialClientToEdit.accessExpiryDate === 'No Expiry' : true
  );
  const [accessExpiryDate, setAccessExpiryDate] = useState(
    initialClientToEdit && initialClientToEdit.accessExpiryDate !== 'No Expiry'
      ? initialClientToEdit.accessExpiryDate
      : ''
  );
  const [accountNotes, setAccountNotes] = useState(initialClientToEdit?.accountNotes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Generate Temp Password
  const handleGeneratePassword = () => {
    const generated = generateSecurePassword();
    setPassword(generated);
    setConfirmPassword(generated);
    showNotification('Generated secure temporary password!');
  };

  // Toggle Project Assignment
  const toggleProjectAssignment = (projectId: string) => {
    if (assignedProjects.includes(projectId)) {
      setAssignedProjects(assignedProjects.filter(id => id !== projectId));
    } else {
      if (!allowMultipleProjects) {
        setAssignedProjects([projectId]);
      } else {
        setAssignedProjects([...assignedProjects, projectId]);
      }
    }
  };

  // Select All Available Projects
  const handleSelectAllProjects = () => {
    const allIds = availableProjects.map(p => p.projectId);
    setAssignedProjects(allIds);
  };

  // Toggle Permission Checkbox
  const togglePermission = (key: keyof ClientPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Submit Handler
  const handleSubmit = async (generateLogin: boolean = false) => {
    setFormError(null);

    if (!companyName.trim()) {
      setFormError('Company Name is required.');
      return;
    }
    if (!contactPerson.trim()) {
      setFormError('Contact Person Name is required.');
      return;
    }
    if (!email.trim()) {
      setFormError('Email Address is required.');
      return;
    }

    if (!isEditing && password) {
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const finalExpiry = noExpiry ? 'No Expiry' : accessExpiryDate;
      const finalPassword = password.trim() || 'Temp1234!';

      if (isEditing && initialClientToEdit) {
        const res = await updateClient(initialClientToEdit.internalId, {
          companyName,
          contactPerson,
          email,
          mobile,
          country,
          companyAddress,
          assignedCountry,
          assignedFolder,
          assignedProjects,
          allowMultipleProjects,
          permissions,
          accountStatus,
          accessStartDate,
          accessExpiryDate: finalExpiry,
          accountNotes,
          requirePasswordChange,
          twoFactorEnabled,
        });

        if (res.success) {
          showNotification(`Client ${initialClientToEdit.clientId} updated successfully.`);
          onClose();
        } else {
          setFormError(res.error || 'Failed to update client.');
        }
      } else {
        const res = await registerClient({
          companyName,
          contactPerson,
          email,
          mobile,
          country,
          companyAddress,
          password: finalPassword,
          requirePasswordChange,
          twoFactorEnabled,
          assignedCountry,
          assignedFolder,
          assignedProjects,
          allowMultipleProjects,
          permissions,
          accountStatus,
          accessStartDate,
          accessExpiryDate: finalExpiry,
          accountNotes,
        });

        if (res.success && res.client) {
          showNotification(
            generateLogin
              ? `Client ${res.client.clientId} created! Login credentials generated & activated.`
              : `Client ${res.client.clientId} saved successfully.`
          );
          onClose();
        } else {
          setFormError(res.error || 'Failed to register client.');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/70 backdrop-blur-xs">
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl border max-h-[92vh] flex flex-col transition-all ${
          isDark ? 'bg-[#121214] border-[#2A2A2E] text-[#F5F5F3]' : 'bg-[#FFFFFF] border-[#DCE5EE] text-[#0F172A]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 ${
            isDark ? 'border-[#262629] bg-[#121214]' : 'border-[#E2E8F0] bg-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-[#18181B] border-[#303035] text-[#C9A86A]' : 'bg-[#E0F2FE] border-[#BAE6FD] text-[#1688D4]'
              }`}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
                CLIENT ACCESS MANAGEMENT
              </p>
              <h2 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {isEditing ? `Edit Client (${initialClientToEdit?.clientId})` : 'Register New Client Access'}
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

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-semibold">
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          {/* SECTION A: CLIENT INFORMATION */}
          <section className={`p-5 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#18181B]/60 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-center gap-2 border-b pb-2">
              <Building2 size={16} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                A. Client Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Client ID (Automatically Generated)
                </label>
                <input
                  type="text"
                  value={autoClientId}
                  readOnly
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border cursor-not-allowed ${
                    isDark ? 'bg-[#111113] border-[#2A2A2E] text-[#C9A86A]' : 'bg-slate-100 border-slate-300 text-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Enter company name..."
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Full name of primary contact..."
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="+1 234 567 8900"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Country
                </label>
                <div className="relative">
                  <Globe size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  >
                    {availableCountries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Company Address
                </label>
                <div className="relative">
                  <MapPin size={14} className={`absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Full corporate street address..."
                    value={companyAddress}
                    onChange={e => setCompanyAddress(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION B: LOGIN INFORMATION */}
          <section className={`p-5 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#18181B]/60 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-center gap-2 border-b pb-2">
              <Key size={16} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                B. Login Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Login Username / Client ID
                </label>
                <input
                  type="text"
                  value={autoClientId}
                  readOnly
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border cursor-not-allowed ${
                    isDark ? 'bg-[#111113] border-[#2A2A2E] text-[#C9A86A]' : 'bg-slate-100 border-slate-300 text-[#1688D4]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Registered Email
                </label>
                <input
                  type="text"
                  value={email || 'Same as client email'}
                  readOnly
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border cursor-not-allowed opacity-80 ${
                    isDark ? 'bg-[#111113] border-[#2A2A2E] text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-bold ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                    Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className={`text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                      isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'
                    }`}
                  >
                    <Sparkles size={12} /> Generate Secure Password
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Set temporary password..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    placeholder="Confirm temporary password..."
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requirePasswordChange}
                    onChange={e => setRequirePasswordChange(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1688D4] focus:ring-0 cursor-pointer"
                  />
                  <span>Require Password Change on First Login</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={e => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1688D4] focus:ring-0 cursor-pointer"
                  />
                  <span>Two-Factor Authentication (2FA)</span>
                </label>
              </div>
            </div>
          </section>

          {/* SECTION C: PROJECT ACCESS */}
          <section className={`p-5 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#18181B]/60 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Globe size={16} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  C. Project Access
                </h3>
              </div>
              <span className={`text-[11px] font-bold ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>
                Using EXISTING Projects & Folders
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Assigned Country
                </label>
                <select
                  value={assignedCountry}
                  onChange={e => {
                    setAssignedCountry(e.target.value);
                    setAssignedProjects([]);
                  }}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                  }`}
                >
                  {availableCountries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Assigned Folder
                </label>
                <select
                  value={assignedFolder}
                  onChange={e => setAssignedFolder(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                  }`}
                >
                  <option value="All Folders">All Folders ({assignedCountry})</option>
                  {availableFolders.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-bold ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                    Assigned Project(s) ({assignedProjects.length} selected)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSelectAllProjects}
                      className={`text-[11px] font-bold hover:underline ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}
                    >
                      Select All in Folder
                    </button>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowMultipleProjects}
                        onChange={e => setAllowMultipleProjects(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#1688D4] focus:ring-0"
                      />
                      <span>Allow Multiple Projects</span>
                    </label>
                  </div>
                </div>

                <div className={`max-h-48 overflow-y-auto p-3 rounded-lg border space-y-2 ${
                  isDark ? 'bg-[#121214] border-[#2A2A2E]' : 'bg-white border-slate-200'
                }`}>
                  {availableProjects.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No existing projects found for selected filters.</p>
                  ) : (
                    availableProjects.map(p => {
                      const checked = assignedProjects.includes(p.projectId);
                      return (
                        <div
                          key={p.projectId}
                          onClick={() => toggleProjectAssignment(p.projectId)}
                          className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                            checked
                              ? (isDark ? 'bg-[#2A2419] border-[#C9A86A] text-white' : 'bg-sky-50 border-[#1688D4] text-slate-900')
                              : (isDark ? 'bg-[#18181B] border-[#2A2A2E] text-slate-300 hover:bg-[#202024]' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100')
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}} // handled by parent div click
                              className="w-4 h-4 rounded text-[#1688D4] focus:ring-0 cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-400">{p.projectId}</span>
                            <span className="font-bold">{p.project}</span>
                            <span className="text-slate-500">({p.customer || p.country})</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            p.contractStatus === 'Signed'
                              ? (isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800')
                              : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                          }`}>
                            {p.contractStatus}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION D: CLIENT PERMISSIONS */}
          <section className={`p-5 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#18181B]/60 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  D. Client Permissions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Default Security Rules Applied</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { key: 'viewAssignedProject', label: 'View Assigned Project', defaultOn: true },
                { key: 'viewProjectProgress', label: 'View Project Progress', defaultOn: true },
                { key: 'viewChecklist', label: 'View Checklist', defaultOn: true },
                { key: 'viewManufacturingSchedule', label: 'View Manufacturing Schedule', defaultOn: true },
                { key: 'viewProductionSchedule', label: 'View Production Schedule', defaultOn: true },
                { key: 'viewShipmentVesselSchedule', label: 'View Shipment / Vessel Schedule', defaultOn: true },
                { key: 'viewFuturePlans', label: 'View Future Plans', defaultOn: true },
                { key: 'viewApprovedReports', label: 'View Approved Reports', defaultOn: true },
                { key: 'downloadApprovedReports', label: 'Download Approved Reports', defaultOn: true },
                { key: 'editProjectData', label: 'Edit Project Data', defaultOn: false, highlightDanger: true },
                { key: 'viewInternalNotes', label: 'View Internal Notes', defaultOn: false, highlightDanger: true },
                { key: 'viewOtherClients', label: 'View Other Clients', defaultOn: false, highlightDanger: true },
                { key: 'accessAdministration', label: 'Access Administration', defaultOn: false, highlightDanger: true },
              ].map(item => {
                const checked = permissions[item.key as keyof ClientPermissions];
                return (
                  <label
                    key={item.key}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                      checked
                        ? item.highlightDanger
                          ? (isDark ? 'bg-red-950/40 border-red-800 text-red-300' : 'bg-red-50 border-red-300 text-red-800')
                          : (isDark ? 'bg-[#2A2419] border-[#C9A86A] text-white' : 'bg-sky-50 border-[#1688D4] text-slate-900')
                        : (isDark ? 'bg-[#121214] border-[#2A2A2E] text-slate-400 hover:text-slate-200' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(item.key as keyof ClientPermissions)}
                      className="w-4 h-4 rounded text-[#1688D4] focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* SECTION E: ACCOUNT CONTROL */}
          <section className={`p-5 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#18181B]/60 border-[#262629]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-center gap-2 border-b pb-2">
              <ShieldCheck size={16} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
              <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                E. Account Control
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Account Status
                </label>
                <select
                  value={accountStatus}
                  onChange={e => setAccountStatus(e.target.value as AccountStatus)}
                  className={`w-full px-3 py-2 text-xs font-bold rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Access Start Date
                </label>
                <input
                  type="date"
                  value={accessStartDate}
                  onChange={e => setAccessStartDate(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-bold ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                    Access Expiry Date
                  </label>
                  <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noExpiry}
                      onChange={e => setNoExpiry(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#1688D4] focus:ring-0"
                    />
                    <span>No Expiry</span>
                  </label>
                </div>
                {noExpiry ? (
                  <input
                    type="text"
                    value="No Expiry"
                    readOnly
                    className={`w-full px-3 py-2 text-xs font-medium rounded-lg border cursor-not-allowed opacity-80 ${
                      isDark ? 'bg-[#111113] border-[#2A2A2E] text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  />
                ) : (
                  <input
                    type="date"
                    value={accessExpiryDate}
                    onChange={e => setAccessExpiryDate(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                    }`}
                  />
                )}
              </div>

              <div className="md:col-span-3">
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
                  Account Notes / Administrative Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional internal administrative notes regarding client access..."
                  value={accountNotes}
                  onChange={e => setAccountNotes(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark ? 'bg-[#121214] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                  }`}
                />
              </div>
            </div>
          </section>
        </div>

        {/* SECTION F: ACTIONS FOOTER */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap items-center justify-end gap-3 sticky bottom-0 z-10 ${
            isDark ? 'border-[#262629] bg-[#121214]' : 'border-[#E2E8F0] bg-[#FFFFFF]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-[#18181B] text-[#B4B4B8] border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border ${
              isDark ? 'bg-[#26262B] text-white border-[#404046] hover:bg-[#323238]' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-900'
            }`}
          >
            {isSubmitting ? 'SAVING...' : 'SAVE CLIENT'}
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                isDark ? 'bg-[#C9A86A] text-[#111111] hover:bg-[#D7B97C]' : 'bg-[#1688D4] text-white hover:bg-[#1272B2]'
              }`}
            >
              <Key size={14} />
              <span>SAVE & GENERATE LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
