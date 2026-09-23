import { useApp } from '../context/AppContext';
import { Pencil, Building2, FolderKanban, Mail, Phone } from 'lucide-react';

export function ProjectManagerCard() {
  const { projectManager, setIsEditModalOpen, theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl border p-3.5 sm:px-5 sm:py-3 transition-all shadow-2xs ${
      isDark ? 'bg-[#151517] border-[#262629]' : 'bg-[#FFFFFF] border-[#E2E8F0]'
    }`}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Avatar, Name, Designation Pills & Contact Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={projectManager.photoUrl}
              alt={projectManager.name}
              className={`w-10 h-10 rounded-full object-cover border ${
                isDark ? 'border-[#303035] bg-[#18181B]' : 'border-[#CBD5E1] bg-[#F1F5F9]'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(projectManager.name)}&background=${isDark ? '1B1B1F' : '0284C7'}&color=${isDark ? 'C9A86A' : 'fff'}`;
              }}
            />
            {projectManager.status === 'Active' && (
              <span className={`w-2.5 h-2.5 bg-emerald-500 border-2 rounded-full absolute bottom-0 right-0 ${
                isDark ? 'border-[#151517]' : 'border-white'
              }`} title="Active" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            {/* Top row: Name + Role Pills */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-[#0B2239]'}`}>
                {projectManager.name}
              </h4>

              {/* Designation Pill */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isDark
                  ? 'bg-[#132338] text-[#38BDF8] border-[#1D3B5E]'
                  : 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]/80'
              }`}>
                {projectManager.designation || 'Project Manager KKI'}
              </span>

              {/* Active Badge Pill */}
              {projectManager.status === 'Active' && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isDark
                    ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]'
                    : 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]/80'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              )}
            </div>

            {/* Bottom row: Sub-info with icons */}
            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <div className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                <Building2 size={12} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />
                <span>{projectManager.department || 'KKI Project Management'}</span>
              </div>

              <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>•</span>

              <div className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
                <FolderKanban size={12} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />
                <span>Kumkang Live Monitoring</span>
              </div>

              {projectManager.email && (
                <>
                  <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>•</span>
                  <a
                    href={`mailto:${projectManager.email}`}
                    className="flex items-center gap-1.5 font-medium text-[#0284C7] dark:text-[#38BDF8] hover:underline"
                  >
                    <Mail size={12} className="text-[#0284C7] dark:text-[#38BDF8]" />
                    <span>{projectManager.email}</span>
                  </a>
                </>
              )}

              {projectManager.phone && (
                <>
                  <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>•</span>
                  <div className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                    <Phone size={12} className={isDark ? 'text-[#85858B]' : 'text-slate-400'} />
                    <span>{projectManager.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Edit Button */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className={`border font-bold text-xs rounded-xl px-3.5 py-2 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs hover:shadow-xs ${
            isDark 
              ? 'bg-[#18181B] hover:bg-[#222226] text-[#D5D5D8] hover:text-white border-[#303035]' 
              : 'bg-white hover:bg-slate-50 text-[#334155] hover:text-[#0F172A] border-[#CBD5E1]'
          }`}
          aria-label="Edit Project Manager"
        >
          <Pencil size={12} className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'} />
          <span>Edit Manager</span>
        </button>
      </div>
    </div>
  );
}
