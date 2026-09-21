import { useState } from 'react';
import {
  Users, Plus, Search, Filter, Eye, ShieldCheck, UserCheck, Terminal,
  Lock, Key
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useClientAccess } from '../../context/ClientAccessContext';
import { ClientRegistrationModal } from './ClientRegistrationModal';
import { ClientDetailsModal } from './ClientDetailsModal';
import { ClientLoginModal } from './ClientLoginModal';
import type { ClientRecord } from '../../types/clientAccess';

export function ClientAccessPage() {
  const { theme } = useApp();
  const { clients, activeSession, switchRole, logout } = useClientAccess();
  const isDark = theme === 'dark';

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedClientForView, setSelectedClientForView] = useState<ClientRecord | null>(null);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<ClientRecord | null>(null);

  // Filtered Clients List
  const filteredClients = clients.filter(c => {
    const matchSearch =
      c.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.accountStatus.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const isRoleAdminOrPM = activeSession.role === 'Admin' || activeSession.role === 'ProjectManager';

  return (
    <div className="space-y-6">
      {/* Role Banner / Context Switcher */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
        activeSession.role === 'Admin'
          ? (isDark ? 'bg-[#17261F] border-[#294B3C] text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900')
          : activeSession.role === 'ProjectManager'
          ? (isDark ? 'bg-[#2A2419] border-[#55462C] text-[#E8D6AE]' : 'bg-amber-50 border-amber-200 text-amber-900')
          : activeSession.role === 'Developer'
          ? (isDark ? 'bg-[#251F32] border-[#42375A] text-[#BBA8E8]' : 'bg-purple-50 border-purple-200 text-purple-900')
          : (isDark ? 'bg-[#17272E] border-[#294651] text-[#89C9DF]' : 'bg-sky-50 border-sky-200 text-sky-900')
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
            isDark ? 'bg-[#111113] border-white/10' : 'bg-white border-black/10'
          }`}>
            {activeSession.role === 'Admin' && <ShieldCheck size={18} className="text-emerald-500" />}
            {activeSession.role === 'ProjectManager' && <UserCheck size={18} className="text-amber-500" />}
            {activeSession.role === 'Developer' && <Terminal size={18} className="text-purple-500" />}
            {activeSession.role === 'Client' && <Lock size={18} className="text-sky-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">Current Access Role:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold uppercase bg-white/20 border border-white/20">
                {activeSession.role}
              </span>
            </div>
            <p className="text-xs opacity-90">
              Active User: <strong>{activeSession.displayName}</strong>
              {activeSession.clientId ? ` (${activeSession.clientId})` : ''}
            </p>
          </div>
        </div>

        {/* Role Switch Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold opacity-75 hidden sm:inline">Role Switcher:</span>
          <button
            onClick={() => switchRole('Admin')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              activeSession.role === 'Admin'
                ? 'bg-white text-emerald-900 font-extrabold shadow-2xs'
                : 'bg-black/10 hover:bg-black/20 text-current'
            }`}
          >
            Admin Mode
          </button>
          <button
            onClick={() => switchRole('ProjectManager')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              activeSession.role === 'ProjectManager'
                ? 'bg-white text-amber-900 font-extrabold shadow-2xs'
                : 'bg-black/10 hover:bg-black/20 text-current'
            }`}
          >
            PM Mode
          </button>
          <button
            onClick={() => switchRole('Developer')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              activeSession.role === 'Developer'
                ? 'bg-white text-purple-900 font-extrabold shadow-2xs'
                : 'bg-black/10 hover:bg-black/20 text-current'
            }`}
          >
            Developer Mode
          </button>

          {activeSession.role === 'Client' ? (
            <button
              onClick={logout}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
            >
              Exit Client View
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#1688D4] text-white hover:bg-[#1272B2] flex items-center gap-1"
            >
              <Key size={12} /> Client Login Portal
            </button>
          )}
        </div>
      </div>

      {/* Developer Access Operations Notice if Developer */}
      {activeSession.role === 'Developer' && (
        <div className={`p-4 rounded-xl border space-y-2 ${
          isDark ? 'bg-[#1D172A] border-[#3B2C54] text-[#D8C4FF]' : 'bg-purple-50 border-purple-200 text-purple-950'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} />
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Authorized Technical Developer Mode</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/30 text-purple-300">
              SCHEMA / DB MAINTENANCE ONLY
            </span>
          </div>
          <p className="text-xs">
            Developer role is restricted to technical tasks (Database maintenance, Schema management, Migrations, Debugging, Technical configuration). Business data editing is disabled unless explicit business permissions are assigned.
          </p>
        </div>
      )}

      {/* CRM Header & Action Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border border-l-4 rounded-xl p-4 sm:p-5 shadow-2xs ${
        isDark ? 'bg-[#151517] border-[#262629] border-l-[#C9A86A]' : 'bg-[#FFFFFF] border-[#DCE5EE] border-l-[#1688D4]'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">CRM</span>
            <span className="text-slate-500">•</span>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>
              Client Register & Access Control
            </span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Client Access Management
          </h1>
          <p className={`text-xs mt-0.5 max-w-2xl ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
            Manage registered clients, public Client IDs, project access permissions, security credentials, and account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRoleAdminOrPM && (
            <button
              onClick={() => { setSelectedClientForEdit(null); setIsAddModalOpen(true); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                isDark ? 'bg-[#C9A86A] text-[#111111] hover:bg-[#D7B97C]' : 'bg-[#1688D4] text-white hover:bg-[#1272B2]'
              }`}
            >
              <Plus size={16} />
              <span>+ ADD CLIENT</span>
            </button>
          )}
        </div>
      </div>

      {/* CLIENT REGISTER TABLE SECTION */}
      <section className={`rounded-xl p-5 lg:p-6 shadow-2xs border ${
        isDark ? 'bg-[#151517] border-[#262629]' : 'bg-[#FFFFFF] border-[#DCE5EE]'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/30">
          <div className="flex items-center gap-2">
            <Users size={18} className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'} />
            <h2 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              CLIENT REGISTER
            </h2>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              isDark ? 'bg-[#262629] text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {filteredClients.length} Total
            </span>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search Client ID, Company, Contact..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-lg border focus:outline-none focus:ring-2 ${
                  isDark ? 'bg-[#111113] border-[#303035] focus:ring-[#C9A86A] text-white' : 'bg-white border-slate-300 focus:ring-[#1688D4] text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Filter size={13} className="text-slate-400" />
              <span className="font-bold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border focus:outline-none ${
                  isDark ? 'bg-[#111113] border-[#303035] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* REGISTER TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                isDark ? 'border-[#262629] text-[#85858B] bg-[#111113]' : 'border-[#E2E8F0] text-[#64748B] bg-[#F8FAFC]'
              }`}>
                <th className="py-3 px-4">Client ID</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Projects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    {clients.length === 0
                      ? 'No clients registered yet. Click "+ ADD CLIENT" to create a new client access record.'
                      : 'No clients match your filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr
                    key={client.internalId}
                    className={`transition-colors hover:bg-slate-500/5 ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#C9A86A]">
                      {client.clientId}
                    </td>
                    <td className="py-3 px-4 font-extrabold">
                      {client.companyName}
                      <span className="block text-[10px] font-normal text-slate-400">{client.email}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {client.contactPerson}
                      <span className="block text-[10px] text-slate-400">{client.mobile || '—'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {client.assignedProjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {client.assignedProjects.map(pid => (
                            <span key={pid} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              isDark ? 'bg-[#18181B] border-[#303035] text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                            }`}>
                              {pid}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        client.accountStatus === 'Active'
                          ? (isDark ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300')
                          : (isDark ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-800 border border-rose-300')
                      }`}>
                        {client.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedClientForView(client)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ml-auto ${
                          isDark ? 'bg-[#18181B] text-white border-[#303035] hover:bg-[#222226]' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODALS */}
      <ClientRegistrationModal
        isOpen={isAddModalOpen || !!selectedClientForEdit}
        onClose={() => { setIsAddModalOpen(false); setSelectedClientForEdit(null); }}
        initialClientToEdit={selectedClientForEdit}
      />

      <ClientDetailsModal
        client={selectedClientForView}
        onClose={() => setSelectedClientForView(null)}
        onEditClient={client => {
          setSelectedClientForView(null);
          setSelectedClientForEdit(client);
        }}
      />

      <ClientLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
