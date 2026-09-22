import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { formatCurrency, type ProjectMaster } from '../data/projectData';
import { StatusBadge } from './ui/StatusBadge';
import { KPICard } from './ui/KPICard';
import { ProjectManagerCard } from './ProjectManagerCard';
import { SyncExcelButton } from './ui/SyncExcelButton';
import {
  FolderKanban, CheckCircle2, AlertTriangle, TrendingUp,
  DollarSign, ChevronRight, ArrowRight
} from 'lucide-react';

const darkCountryColorsMap: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  india: { bar: 'bg-[#C9A86A]', text: 'text-[#E8D6AE]', bg: 'bg-[#2A2419]', border: 'border-[#55462C]' },
  malaysia: { bar: 'bg-[#4BA7A7]', text: 'text-[#83CACA]', bg: 'bg-[#172A2A]', border: 'border-[#294949]' },
  maldives: { bar: 'bg-[#9A82D4]', text: 'text-[#BBA8E8]', bg: 'bg-[#251F32]', border: 'border-[#42375A]' },
};

const lightCountryColorsMap: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  india: { bar: 'bg-[#1688D4]', text: 'text-[#0284C7]', bg: 'bg-[#E0F2FE]', border: 'border-[#BAE6FD]' },
  malaysia: { bar: 'bg-[#0D9488]', text: 'text-[#0F766E]', bg: 'bg-[#CCFBF1]', border: 'border-[#99F6E4]' },
  maldives: { bar: 'bg-[#7C3AED]', text: 'text-[#6D28D9]', bg: 'bg-[#F3E8FF]', border: 'border-[#DDD6FE]' },
};

function ExecutiveMetricsSection() {
  const { selectedCountry, setSelectedCountry, selectedFolder, setSelectedFolder, navigate, theme } = useApp();
  const isDark = theme === 'dark';
  const { projects } = useData();

  // Aggregate real portfolio data by country
  const countryData = projects.reduce((acc, p) => {
    const c = p.country || 'Other';
    if (!acc[c]) acc[c] = { count: 0, areaM2: 0, customers: new Set<string>() };
    acc[c].count += 1;
    acc[c].areaM2 += (p.actualDesignQtyM2 || p.contractQtyM2 || 0);
    if (p.customer) acc[c].customers.add(p.customer);
    return acc;
  }, {} as Record<string, { count: number; areaM2: number; customers: Set<string> }>);

  const countryEntries = Object.entries(countryData);
  const maxCount = Math.max(...countryEntries.map(([, d]) => d.count), 1);
  const countryMap = isDark ? darkCountryColorsMap : lightCountryColorsMap;

  // If a country is selected, filter project folders (by customer/client)
  const countryProjects = selectedCountry
    ? projects.filter(p => p.country?.toLowerCase() === selectedCountry.toLowerCase())
    : [];

  const folderData = countryProjects.reduce((acc, p) => {
    const folder = p.customer || p.project || 'General Projects';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(p);
    return acc;
  }, {} as Record<string, ProjectMaster[]>);

  const folderEntries = Object.entries(folderData);

  return (
    <div className="space-y-6 my-2">
      {/* HEADER BAR FOR PORTFOLIO FOOTPRINT */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>PORTFOLIO BY COUNTRY</span>
            <span>•</span>
            <span className={isDark ? 'text-[#C9A86A]' : 'text-[#1688D4]'}>Project Footprint</span>
          </div>
          <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>
            {!selectedCountry 
              ? 'Portfolio Footprint' 
              : !selectedFolder 
              ? `${selectedCountry} Project Folders` 
              : `${selectedCountry} / ${selectedFolder}`}
          </h3>
        </div>

        {/* Breadcrumb Navigation / Back Button */}
        {selectedCountry && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedFolder) {
                  setSelectedFolder(null);
                } else {
                  setSelectedCountry(null);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isDark 
                  ? 'bg-[#18181B] text-[#D5D5D8] border-[#303035] hover:bg-[#222226]' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              ← Back to {selectedFolder ? selectedCountry : 'All Countries'}
            </button>
          </div>
        )}
      </div>

      {/* LEVEL 1: ALL COUNTRIES PORTFOLIO FOOTPRINT */}
      {!selectedCountry && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countryEntries.map(([country, data], i) => {
            const percentage = Math.round((data.count / maxCount) * 100);
            const cTheme = countryMap[country.toLowerCase()] || (
              isDark
                ? { bar: 'bg-[#C9A86A]', text: 'text-[#E8D6AE]', bg: 'bg-[#2A2419]', border: 'border-[#55462C]' }
                : { bar: 'bg-[#1688D4]', text: 'text-[#0284C7]', bg: 'bg-[#E0F2FE]', border: 'border-[#BAE6FD]' }
            );

            return (
              <motion.div
                key={country}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedCountry(country); setSelectedFolder(null); }}
                className={`rounded-2xl p-5 transition-all cursor-pointer group border flex flex-col justify-between ${
                  isDark 
                    ? 'bg-[#151517] border-[#262629] hover:bg-[#1B1B1F] hover:border-[#3A3A40]' 
                    : 'bg-white border-[#DCE5EE] hover:border-[#CBD5E1] hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${cTheme.bar}`} />
                      <h4 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                        {country}
                      </h4>
                    </div>
                    <span className={`text-xs font-extrabold ${cTheme.text} ${cTheme.bg} border ${cTheme.border} px-3 py-1 rounded-full`}>
                      {data.count} Projects
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Footprint Progress</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{percentage}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2.5 overflow-hidden ${isDark ? 'bg-[#111113]' : 'bg-slate-100'}`}>
                      <div className={`${cTheme.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-3 border-t text-xs font-semibold ${isDark ? 'border-[#262629] text-slate-400' : 'border-slate-100 text-slate-600'}`}>
                  <span>{data.customers.size} Client Folder{data.customers.size > 1 ? 's' : ''}</span>
                  <span className={`flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform ${cTheme.text}`}>
                    Explore Folders <ArrowRight size={13} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* LEVEL 2: COUNTRY FOLDERS (e.g. Client / Customer folders) */}
      {selectedCountry && !selectedFolder && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folderEntries.map(([folderName, folderProjects]) => (
            <div
              key={folderName}
              onClick={() => setSelectedFolder(folderName)}
              className={`rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                isDark ? 'bg-[#151517] border-[#262629] hover:bg-[#1B1B1F]' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isDark ? 'bg-[#2A2419] text-[#C9A86A] border-[#55462C]' : 'bg-sky-50 text-[#1688D4] border-sky-100'
                  }`}>
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h4 className={`text-base font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {folderName}
                    </h4>
                    <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedCountry} Folder
                    </p>
                  </div>
                </div>

                <p className={`text-xs font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Contains {folderProjects.length} active project record{folderProjects.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className={`flex items-center justify-between pt-3 border-t text-xs font-bold ${
                isDark ? 'border-[#262629] text-[#C9A86A]' : 'border-slate-100 text-[#1688D4]'
              }`}>
                <span>View {folderProjects.length} Projects</span>
                <ChevronRight size={15} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEVEL 3: PROJECTS INSIDE SELECTED FOLDER */}
      {selectedCountry && selectedFolder && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(folderData[selectedFolder] || []).map(project => (
              <div
                key={project.projectId}
                onClick={() => navigate('project-detail', project.projectId)}
                className={`rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
                  isDark ? 'bg-[#151517] border-[#262629] hover:bg-[#1B1B1F]' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                    isDark ? 'bg-[#18181B] text-slate-200 border-[#303035]' : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    {project.projectId}
                  </span>
                  <StatusBadge status={project.contractStatus} />
                </div>

                <h4 className={`text-base font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {project.project}
                </h4>

                <p className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Client: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{project.customer}</strong>
                  {project.block ? ` • Block: ${project.block}` : ''}
                </p>

                <div className={`pt-3 border-t flex items-center justify-between text-xs font-bold ${
                  isDark ? 'border-[#262629] text-[#C9A86A]' : 'border-slate-100 text-[#1688D4]'
                }`}>
                  <span>Open Details</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { navigate, theme } = useApp();
  const isDark = theme === 'dark';
  const {
    getDashboardKPIs, getDelayedProjects, getTotalOutstandingBalance
  } = useData();

  const kpis = getDashboardKPIs();
  const delayedProjects = getDelayedProjects();
  const outstandingBalance = getTotalOutstandingBalance();

  return (
    <div className="space-y-6">
      {/* Executive Brief Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border border-l-4 rounded-xl p-4 sm:p-5 shadow-2xs ${
        isDark 
          ? 'bg-[#151517] border-[#262629] border-l-[#C9A86A]' 
          : 'bg-[#FFFFFF] border-[#DCE5EE] border-l-[#1688D4]'
      }`}>
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <p className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-[#85858B]' : 'text-[#64748B]'}`}>
              PROJECT CONTROL CENTER · LIVE MANAGEMENT DASHBOARD
            </p>
            {/* Kumgang Signature Motion Signature: Data Flow Indicator */}
            <div className={`flex items-center gap-1 px-2.5 py-0.5 border rounded-full text-[10px] font-bold shadow-2xs ${
              isDark ? 'bg-[#111113] border-[#262629] text-[#B4B4B8]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-[#C9A86A]' : 'bg-[#1688D4]'}`} />
              <span className={`tracking-wider text-[9px] uppercase font-extrabold ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>DATA FLOW:</span>
              <span className={`font-mono ${isDark ? 'text-[#E8D6AE]' : 'text-[#0284C7]'}`}>Excel</span>
              <span className={`text-[9px] ${isDark ? 'text-[#85858B]' : 'text-[#94A3B8]'}`}>➔</span>
              <span className={`font-mono ${isDark ? 'text-[#E8D6AE]' : 'text-[#0284C7]'}`}>Data</span>
              <span className={`text-[9px] ${isDark ? 'text-[#85858B]' : 'text-[#94A3B8]'}`}>➔</span>
              <span className={`font-mono ${isDark ? 'text-[#E8D6AE]' : 'text-[#0284C7]'}`}>Projects</span>
              <span className={`text-[9px] ${isDark ? 'text-[#85858B]' : 'text-[#94A3B8]'}`}>➔</span>
              <span className={`font-mono font-extrabold ${isDark ? 'text-[#70D0A8]' : 'text-[#16A36A]'}`}>Live Dashboard</span>
            </div>
          </div>
          <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-[#FFFFFF]' : 'text-[#0F172A]'}`}>
            Executive Brief
          </h1>
          <p className={`text-xs mt-0.5 max-w-2xl ${isDark ? 'text-[#B4B4B8]' : 'text-[#475569]'}`}>
            Operational portfolio, management actions, progress tracking, and live status across all projects.
          </p>
        </div>
        <SyncExcelButton variant="primary" />
      </div>

      <ProjectManagerCard />

      {/* 1. PORTFOLIO STATUS (5 High-Value KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Projects" value={kpis.totalProjects} description="All portfolio contracts" icon={FolderKanban} index={0} onClick={() => navigate('projects')} />
        <KPICard label="Signed / Active" value={kpis.signedProjects} description="Active project execution" icon={CheckCircle2} variant="highlight" index={1} />
        <KPICard label="At Risk" value={delayedProjects.length} description={delayedProjects.length > 0 ? `${delayedProjects.length} critical issues` : 'No active risks'} icon={AlertTriangle} variant={delayedProjects.length > 0 ? 'danger' : 'default'} index={2} onClick={() => navigate('delays')} />
        <KPICard label="Contract Value" value={formatCurrency(kpis.totalContractValueUSD)} description="Signed contracts total" icon={TrendingUp} variant="highlight" index={3} />
        <KPICard label="Outstanding" value={formatCurrency(outstandingBalance)} description="Total balance due" icon={DollarSign} variant={outstandingBalance > 0 ? 'attention' : 'highlight'} index={4} onClick={() => navigate('payments')} />
      </div>

      {/* 2. PORTFOLIO FOOTPRINT */}
      <ExecutiveMetricsSection />
    </div>
  );
}

