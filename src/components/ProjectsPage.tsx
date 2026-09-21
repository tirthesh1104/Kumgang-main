import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { StatusBadge, PaymentBadge } from './ui/StatusBadge';
import { ProgressBar } from './ui/ProgressBar';
import { EditProjectModal } from './EditProjectModal';
import { Search, X, ArrowRight, AlertTriangle, Globe, Plus, Edit3 } from 'lucide-react';

export function ProjectsPage() {
  const { navigate, theme } = useApp();
  const isDark = theme === 'dark';
  const {
    projects: allProjects,
    getShipmentForProject,
    getUniqueStatuses,
    getUniqueCountries
  } = useData();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDelay, setFilterDelay] = useState('all');
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const uniqueStatuses = getUniqueStatuses();
  const uniqueCountries = getUniqueCountries();

  let projects = [...allProjects];

  if (filterStatus !== 'all') {
    projects = projects.filter(p => p.contractStatus === filterStatus);
  }
  if (filterCountry !== 'all') {
    projects = projects.filter(p => p.country === filterCountry);
  }
  if (filterPayment !== 'all') {
    projects = projects.filter(p => p.paymentStatus && p.paymentStatus.toLowerCase().includes(filterPayment.toLowerCase()));
  }
  if (filterDelay === 'delayed') {
    projects = projects.filter(p => (p.balanceUSD || 0) > 0 && p.paymentStatus && !p.paymentStatus.toLowerCase().includes('100%'));
  }
  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter(p =>
      p.projectId.toLowerCase().includes(q) ||
      p.customer.toLowerCase().includes(q) ||
      p.project.toLowerCase().includes(q) ||
      (p.block && p.block.toLowerCase().includes(q)) ||
      p.contractStatus.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q)
    );
  }

  const hasFilters = filterStatus !== 'all' || filterCountry !== 'all' || filterPayment !== 'all' || filterDelay !== 'all' || search.length > 0;

  const handleOpenAddModal = () => {
    setEditProjectId(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEditProjectId(id);
    setIsEditModalOpen(true);
  };

  return (
    <div className={`space-y-5 ${isDark ? 'text-[#F5F5F3]' : 'text-[#0F172A]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`kpi-label mb-1 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>Portfolio</p>
          <h2 className={`text-xl font-bold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>All Projects</h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
            {allProjects.length} projects · Click any project to open its workspace.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary"
        >
          <Plus size={15} className="btn-icon-edit" />
          ADD NEW PROJECT
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#85858B]' : 'text-[#94A3B8]'}`} />
          <input
            type="text"
            placeholder="Search by ID, customer, project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none ${
              isDark 
                ? 'border-[#303035] bg-[#111113] text-[#F5F5F3] placeholder-[#66666C] focus:border-[#C9A86A]' 
                : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1688D4]'
            }`}
            aria-label="Search projects"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X size={13} className={isDark ? 'text-[#85858B]' : 'text-[#94A3B8]'} />
            </button>
          )}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className={`text-sm border rounded-lg px-3 py-2 focus:outline-none ${
            isDark 
              ? 'border-[#303035] bg-[#111113] text-[#F5F5F3] focus:border-[#C9A86A]' 
              : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] focus:border-[#1688D4]'
          }`}>
          <option value="all">All Status</option>
          {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className={`text-sm border rounded-lg px-3 py-2 focus:outline-none ${
            isDark 
              ? 'border-[#303035] bg-[#111113] text-[#F5F5F3] focus:border-[#C9A86A]' 
              : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] focus:border-[#1688D4]'
          }`}>
          <option value="all">All Countries</option>
          {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
          className={`text-sm border rounded-lg px-3 py-2 focus:outline-none ${
            isDark 
              ? 'border-[#303035] bg-[#111113] text-[#F5F5F3] focus:border-[#C9A86A]' 
              : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] focus:border-[#1688D4]'
          }`}>
          <option value="all">All Payments</option>
          <option value="100%">100% Paid</option>
          <option value="50%">50% Paid</option>
          <option value="30%">30% Paid</option>
          <option value="10%">10% Paid</option>
        </select>
        <select value={filterDelay} onChange={e => setFilterDelay(e.target.value)}
          className={`text-sm border rounded-lg px-3 py-2 focus:outline-none ${
            isDark 
              ? 'border-[#303035] bg-[#111113] text-[#F5F5F3] focus:border-[#C9A86A]' 
              : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] focus:border-[#1688D4]'
          }`}>
          <option value="all">All Risk Levels</option>
          <option value="delayed">Balance Due</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => { setFilterStatus('all'); setFilterCountry('all'); setFilterPayment('all'); setFilterDelay('all'); setSearch(''); }}
            className={`text-xs border rounded-lg px-3 py-2 flex items-center gap-1 ${
              isDark 
                ? 'text-[#B4B4B8] hover:text-[#FFFFFF] border-[#303035] hover:bg-[#18181B]' 
                : 'text-[#64748B] hover:text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
            }`}
          >
            <X size={12} /> Clear Filters
          </button>
        )}
      </div>

      {/* Results */}
      <p className={`text-xs font-medium ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>{projects.length} project{projects.length !== 1 ? 's' : ''} shown</p>

      {projects.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
          <p className="font-medium text-sm">No projects match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, i) => {
            const shipment = getShipmentForProject(project.projectId);
            const hasBalance = (project.balanceUSD || 0) > 0;
            const notFullyPaid = project.paymentStatus && !project.paymentStatus.toLowerCase().includes('100%');
            const needsAttention = hasBalance && notFullyPaid;
            const progress = project.designProgressPercent != null ? Math.min(project.designProgressPercent, 100) : null;
            
            return (
              <motion.div
                key={project.projectId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate('project-detail', project.projectId)}
                className={`
                  rounded-xl shadow-card transition-all duration-200 cursor-pointer p-4 sm:p-5 group relative overflow-hidden border
                  ${isDark 
                    ? 'bg-[#151517] border-[#262629] hover:bg-[#1B1B1F]' 
                    : 'bg-[#FFFFFF] border-[#DCE5EE] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]'
                  }
                  ${needsAttention ? (isDark ? 'border-l-4 border-l-[#E05A5A] bg-[#34191B]/30' : 'border-l-4 border-l-[#EF4444] bg-[#FEF2F2]/60') : ''} 
                  ${project.contractStatus === 'Cancelled' ? (isDark ? 'opacity-50 bg-[#141416]' : 'opacity-50 bg-[#F1F5F9]') : ''}
                `}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded font-mono border ${
                    isDark ? 'text-[#F5F5F3] bg-[#18181B] border-[#303035]' : 'text-[#0F172A] bg-[#F1F5F9] border-[#CBD5E1]'
                  }`}>
                    {project.projectId}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        isDark ? 'text-[#E8D6AE] bg-[#2A2419] border-[#55462C]' : 'text-[#0284C7] bg-[#E0F2FE] border-[#BAE6FD]'
                      }`}>
                        <Globe size={11} className={isDark ? 'text-[#C9A86A]' : 'text-[#0284C7]'} />
                        {project.country}
                      </span>
                      <span className={`font-extrabold text-base ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>{project.project}</span>
                      <span className={`font-bold ${isDark ? 'text-[#303035]' : 'text-[#CBD5E1]'}`}>·</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>{project.customer}</span>
                      {project.block && (
                        <>
                          <span className={isDark ? 'text-[#303035]' : 'text-[#CBD5E1]'}>·</span>
                          <span className={`text-xs ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>Block {project.block}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 mt-2">
                      <StatusBadge status={project.contractStatus} />
                      <PaymentBadge status={project.paymentStatus} />
                      {needsAttention && (
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isDark ? 'text-[#F08A8A] bg-[#34191B] border-[#5A292B]' : 'text-[#DC2626] bg-[#FEF2F2] border-[#FCA5A5]'
                        }`}>
                          <AlertTriangle size={11} />
                          Balance Due: ${project.balanceUSD?.toLocaleString()}
                        </span>
                      )}
                      {shipment && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          isDark ? 'text-[#89C9DF] bg-[#17272E] border-[#294651]' : 'text-[#0369A1] bg-[#E0F2FE] border-[#BAE6FD]'
                        }`}>
                          Shipment: {shipment.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {progress != null && (
                      <div className="text-right hidden sm:block">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>Design Progress</p>
                        <p className={`text-base font-extrabold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>{Math.round(progress)}%</p>
                        <div className="w-24 mt-1">
                          <ProgressBar value={progress} color={needsAttention ? 'orange' : 'forest'} size="sm" />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleOpenEditModal(e, project.projectId)}
                      className={`p-2 rounded-lg transition-colors border cursor-pointer ${
                        isDark ? 'bg-[#18181B] hover:bg-[#222226] text-[#B4B4B8] hover:text-[#FFFFFF] border-[#303035]' : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border-[#CBD5E1]'
                      }`}
                      title="Edit project data"
                    >
                      <Edit3 size={15} />
                    </button>

                    <ArrowRight size={16} className={`transition-all ${
                      isDark ? 'text-[#85858B] group-hover:text-[#C9A86A] group-hover:translate-x-1' : 'text-[#64748B] group-hover:text-[#1688D4] group-hover:translate-x-1'
                    }`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {isEditModalOpen && (
        <EditProjectModal
          projectId={editProjectId}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

