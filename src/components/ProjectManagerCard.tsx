import { useApp } from '../context/AppContext';
import { Pencil, Building2, Folder, Mail, Phone } from 'lucide-react';

export function ProjectManagerCard() {
  const { projectManager, setIsEditModalOpen, theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className={`border border-l-4 rounded-xl shadow-2xs p-3.5 sm:p-4 transition-all ${
      isDark
        ? 'bg-[#151517] border-[#262629] border-l-[#C9A86A]'
        : 'bg-[#FFFFFF] border-[#DCE5EE] border-l-[#1688D4]'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Left: Avatar, Name, Role & Contact */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={projectManager.photoUrl}
              alt={projectManager.name}
              className={`w-10 h-10 rounded-full object-cover border shadow-2xs ${
                isDark ? 'border-[#C9A86A] bg-[#18181B]' : 'border-[#1688D4] bg-[#F1F5F9]'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(projectManager.name)}&background=${isDark ? '1B1B1F' : '0284C7'}&color=${isDark ? 'C9A86A' : 'fff'}`;
              }}
            />
            {projectManager.status === 'Active' && (
              <span className={`w-2.5 h-2.5 bg-[#3FB984] border-2 rounded-full absolute bottom-0 right-0 ${
                isDark ? 'border-[#151517]' : 'border-[#FFFFFF]'
              }`} title="Active" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
                Project Leadership
              </span>
              <span className={isDark ? 'text-[#303035]' : 'text-[#CBD5E1]'}>•</span>
              <h4 className={`text-sm font-extrabold leading-tight ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>
                {projectManager.name}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isDark ? 'text-[#D9DCE0] bg-[#18181B] border-[#303035]' : 'text-[#334155] bg-[#F8FAFC] border-[#CBD5E1]'
              }`}>
                {projectManager.designation}
              </span>
              {projectManager.status === 'Active' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  isDark ? 'bg-[#163127] text-[#70D0A8] border-[#28523F]' : 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3FB984]" />
                  Active
                </span>
              )}
            </div>
            <p className={`text-xs font-medium truncate mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 ${
              isDark ? 'text-[#85858B]' : 'text-[#64748B]'
            }`}>
              <span className="flex items-center gap-1"><Building2 size={12} className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'} /> {projectManager.department}</span>
              <span className={isDark ? 'text-[#303035]' : 'text-[#CBD5E1]'}>•</span>
              <span className="flex items-center gap-1"><Folder size={12} className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'} /> {projectManager.project}</span>
              <span className={isDark ? 'text-[#303035]' : 'text-[#CBD5E1]'}>•</span>
              <a href={`mailto:${projectManager.email}`} className={`hover:underline flex items-center gap-1 ${isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}`}>
                <Mail size={12} className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'} /> {projectManager.email}
              </a>
              <span className={isDark ? 'text-[#303035]' : 'text-[#CBD5E1]'}>•</span>
              <a href={`tel:${projectManager.phone}`} className={`hover:underline flex items-center gap-1 ${isDark ? 'text-[#B4B4B8]' : 'text-[#334155]'}`}>
                <Phone size={12} className={isDark ? 'text-[#85858B]' : 'text-[#64748B]'} /> {projectManager.phone}
              </a>
            </p>
          </div>
        </div>

        {/* Right: Edit Button */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className={`border font-bold text-xs rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0 shadow-2xs ${
            isDark ? 'bg-[#18181B] hover:bg-[#222226] text-[#D5D5D8] border-[#303035]' : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]'
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

