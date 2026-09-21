import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import { ClientAccessProvider, useClientAccess } from './context/ClientAccessContext';
import { Sidebar, MobileNav, TopBar } from './components/layout/Navigation';
import { Dashboard } from './components/Dashboard';
import { ProjectsPage } from './components/ProjectsPage';
import { ProjectDetail } from './components/ProjectDetail';
import { DesignPage } from './components/DesignPage';
import { ProductionPage } from './components/ProductionPage';
import { ShipmentPage } from './components/ShipmentPage';
import { PaymentsPage } from './components/PaymentsPage';
import { DelaysPage } from './components/DelaysPage';
import { ReportsPage } from './components/ReportsPage';
import { ClientAccessPage } from './components/crm/ClientAccessPage';
import { ClientDashboardView } from './components/crm/ClientDashboardView';
import { EditProjectManagerModal } from './components/EditProjectManagerModal';
import { NotificationToast } from './components/NotificationToast';
import { AnalyseSummaryButton } from './components/ui/AnalyseSummaryButton';
import { PortfolioAnalysisDrawer } from './components/PortfolioAnalysisDrawer';

function PageContent() {
  const { currentPage } = useApp();
  const { activeSession } = useClientAccess();

  // If user is logged in as a Client, strictly enforce Limited Access Client Dashboard View
  if (activeSession.role === 'Client') {
    return <ClientDashboardView />;
  }

  const pageMap: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    projects: <ProjectsPage />,
    'project-detail': <ProjectDetail />,
    design: <DesignPage />,
    production: <ProductionPage />,
    shipment: <ShipmentPage />,
    payments: <PaymentsPage />,
    delays: <DelaysPage />,
    reports: <ReportsPage />,
    crm: <ClientAccessPage />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {pageMap[currentPage] ?? <Dashboard />}
      </motion.div>
    </AnimatePresence>
  );
}

function AppLayout() {
  const { theme } = useApp();
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0A0A0A] text-[#F5F5F3]' : 'bg-[#F5F8FB] text-[#0F172A]'}`}>
      {/* Sidebar (desktop) */}
      <Sidebar />
      {/* Mobile nav overlay */}
      <MobileNav />

      {/* Main content area */}
      <div className={`lg:pl-60 flex flex-col min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F5F8FB]'}`}>
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-[#18181B]/10 max-w-7xl w-full mx-auto" id="main-content" tabIndex={-1}>
          <PageContent />
        </main>
        <footer className={`text-center py-4 px-6 text-xs transition-colors duration-200 border-t ${
          isDark ? 'text-[#85858B] border-[#1E1E20] bg-[#090909]' : 'text-[#64748B] border-[#DCE5EE] bg-[#FFFFFF]'
        }`}>
          Kumkang Live Project Monitoring · Internal Enterprise Management Application · All data sourced from project dataset
        </footer>
      </div>

      {/* Fixed Management Action: Analyse Summary Button */}
      <AnalyseSummaryButton onClick={() => setIsAnalysisOpen(true)} />

      {/* Full-Fledged Portfolio Analysis Drawer */}
      <PortfolioAnalysisDrawer
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
      />

      {/* Global Modals & Notifications */}
      <EditProjectManagerModal />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppProvider>
        <ClientAccessProvider>
          <AppLayout />
        </ClientAccessProvider>
      </AppProvider>
    </DataProvider>
  );
}

