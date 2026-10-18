import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ProjectManagerInfo } from '../types/projectManager';

type NavPage =
  | 'dashboard'
  | 'projects'
  | 'project-detail'
  | 'design'
  | 'production'
  | 'shipment'
  | 'site-execution'
  | 'payments'
  | 'delays'
  | 'reports'
  | 'crm'
  | 'pipeline'
  | 'pi-approvals';

export type ThemeMode = 'light' | 'dark';

interface AppContextType {
  currentPage: NavPage;
  selectedProjectId: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  navigate: (page: NavPage, projectId?: string, source?: 'dashboard' | 'projects') => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  lastUpdated: string;
  // Real-time live date & time
  liveDateTime: string;
  // Theme Management
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  // Project Manager State
  projectManager: ProjectManagerInfo;
  updateProjectManager: (data: Partial<ProjectManagerInfo>) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  notification: string | null;
  showNotification: (msg: string) => void;
  // Footprint Drilldown Navigation State
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
  selectedFolder: string | null;
  setSelectedFolder: (folder: string | null) => void;
  navSource: 'dashboard' | 'projects' | null;
  setNavSource: (source: 'dashboard' | 'projects' | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function formatLiveDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
}

function parseStateFromURL(): {
  page: NavPage;
  projectId: string | null;
  country: string | null;
  folder: string | null;
  explicit: boolean;
} {
  try {
    const params = new URLSearchParams(window.location.search);
    // Every page in the NavPage union must be deep-linkable, otherwise a
    // reload or shared link silently falls back to the dashboard.
    const validPages: NavPage[] = [
      'dashboard', 'projects', 'project-detail', 'design',
      'production', 'shipment', 'site-execution', 'payments', 'delays',
      'reports', 'crm', 'pipeline', 'pi-approvals'
    ];
    const rawPage = params.get('page') as NavPage | null;
    // A page route is only "explicit" when a valid `?page=` param is present.
    // Landing URLs — the bare root, `?Page` (capital P / no value), or any URL
    // without a valid `?page=` param — are NOT explicit: they represent the
    // Landing Page, not the dashboard. This resolves the `?page=dashboard` vs
    // `?Page` routing conflict so a landing URL is never treated as a
    // dashboard deep-link.
    const explicit = !!rawPage && validPages.includes(rawPage);
    const page = explicit ? (rawPage as NavPage) : 'dashboard';
    const projectId = params.get('id');
    const country = params.get('country');
    const folder = params.get('folder');
    return { page, projectId, country, folder, explicit };
  } catch {
    return { page: 'dashboard', projectId: null, country: null, folder: null, explicit: false };
  }
}

function buildURLString(
  page: NavPage,
  projectId: string | null,
  country: string | null,
  folder: string | null
): string {
  const params = new URLSearchParams();
  params.set('page', page);
  if (projectId) params.set('id', projectId);
  if (country) params.set('country', country);
  if (folder) params.set('folder', folder);
  return `${window.location.pathname}?${params.toString()}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialState = parseStateFromURL();
  const [currentPage, setCurrentPage] = useState<NavPage>(initialState.page);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialState.projectId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Country and Folder drilldown state
  const [selectedCountry, setSelectedCountry] = useState<string | null>(initialState.country);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(initialState.folder);
  const [navSource, setNavSource] = useState<'dashboard' | 'projects' | null>(null);

  // Sync state on Browser Back / Forward (< / >) navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state || parseStateFromURL();
      setCurrentPage(state.page || 'dashboard');
      setSelectedProjectId(state.projectId || null);
      setSelectedCountry(state.country || null);
      setSelectedFolder(state.folder || null);
    };

    // Normalize the URL on mount so the first history entry is valid, but ONLY
    // when the visitor landed on an explicit `?page=` route (e.g. ?page=projects).
    // A landing URL (bare root, `?Page`, or anything without a valid page param)
    // is left untouched — it is NOT rewritten to `?page=dashboard`, so the
    // Landing Page route stays the initial route and no dashboard URL auto-appears.
    const init = parseStateFromURL();
    if (init.explicit) {
      const initUrl = buildURLString(init.page, init.projectId, init.country, init.folder);
      window.history.replaceState(
        { page: init.page, projectId: init.projectId, country: init.country, folder: init.folder },
        '',
        initUrl
      );
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Real-time live date & time updating every second
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveDateTime = formatLiveDateTime(now);
  const lastUpdated = liveDateTime;

  // Project Manager State pre-filled with Prakash Shinde details and persisted in localStorage
  const STORAGE_PM_KEY = 'kumkang_project_manager_v1';

  const [projectManager, setProjectManager] = useState<ProjectManagerInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read projectManager from localStorage', e);
    }
    return {
      name: 'Prakash Shinde',
      designation: 'Project Manager KKI',
      email: 'prakash.shinde@kumkang.com',
      phone: '+91 98765 43210',
      department: 'KKI Project Management',
      project: 'Kumkang Live Monitoring',
      status: 'Active',
      photoUrl: '/prakash_shinde.png',
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PM_KEY, JSON.stringify(projectManager));
    } catch (e) {
      console.warn('Failed to save projectManager to localStorage', e);
    }
  }, [projectManager]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  const updateProjectManager = useCallback((data: Partial<ProjectManagerInfo>) => {
    setProjectManager(prev => ({ ...prev, ...data }));
  }, []);

  const navigate = useCallback((page: NavPage, projectId?: string, source?: 'dashboard' | 'projects') => {
    const pid = projectId !== undefined ? projectId : (page === 'project-detail' ? selectedProjectId : null);
    setCurrentPage(page);
    if (projectId !== undefined) setSelectedProjectId(pid);
    if (source) setNavSource(source);
    setSidebarOpen(false);

    const newUrl = buildURLString(page, pid, selectedCountry, selectedFolder);
    window.history.pushState(
      { page, projectId: pid, country: selectedCountry, folder: selectedFolder },
      '',
      newUrl
    );
  }, [selectedProjectId, selectedCountry, selectedFolder]);

  const handleSetSelectedCountry = useCallback((country: string | null) => {
    setSelectedCountry(country);
    const newUrl = buildURLString(currentPage, selectedProjectId, country, selectedFolder);
    window.history.pushState(
      { page: currentPage, projectId: selectedProjectId, country, folder: selectedFolder },
      '',
      newUrl
    );
  }, [currentPage, selectedProjectId, selectedFolder]);

  const handleSetSelectedFolder = useCallback((folder: string | null) => {
    setSelectedFolder(folder);
    const newUrl = buildURLString(currentPage, selectedProjectId, selectedCountry, folder);
    window.history.pushState(
      { page: currentPage, projectId: selectedProjectId, country: selectedCountry, folder },
      '',
      newUrl
    );
  }, [currentPage, selectedProjectId, selectedCountry]);

  // Theme Management (Default: Light Mode for all users)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('kumkang_theme');
      if (saved === 'light') return 'light';
      if (saved === 'dark') return 'dark';
      return 'light'; // Default to Light Mode
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kumkang_theme', theme);
    } catch {
      // ignore
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        selectedProjectId,
        sidebarOpen,
        searchQuery,
        navigate,
        setSidebarOpen,
        setSearchQuery,
        lastUpdated,
        liveDateTime,
        theme,
        toggleTheme,
        setTheme,
        projectManager,
        updateProjectManager,
        isEditModalOpen,
        setIsEditModalOpen,
        notification,
        showNotification,
        selectedCountry,
        setSelectedCountry: handleSetSelectedCountry,
        selectedFolder,
        setSelectedFolder: handleSetSelectedFolder,
        navSource,
        setNavSource,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
