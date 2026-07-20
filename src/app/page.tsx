'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import Sidebar from '@/components/layout/Sidebar';
import LoginPage from '@/components/auth/LoginPage';
import Dashboard from '@/components/pages/Dashboard';
import TasksPage from '@/components/pages/TasksPage';
import ProjectsPage from '@/components/pages/ProjectsPage';
import ValuationPage from '@/components/pages/ValuationPage';
import BanksPage from '@/components/pages/BanksPage';
import EmployeesPage from '@/components/pages/EmployeesPage';
import AnalyticsPage from '@/components/pages/AnalyticsPage';
import AccountsPage from '@/components/pages/AccountsPage';
import LeavesPage from '@/components/pages/LeavesPage';
import { Menu } from 'lucide-react';

// Register service worker
function registerSW() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    if (process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    } else {
      // In development, actively unregister service workers to prevent cached routing issues
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      }).catch(() => {});
    }
  }
}

type PageId = 'dashboard' | 'projects' | 'tasks' | 'valuation' | 'banks' | 'employees' | 'analytics' | 'accounts' | 'leaves';

export default function Home() {
  const { currentUser, isAdmin, mounted } = useApp();
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    LocalDbService.init();
    registerSW();
  }, []);

  // Redirect employee from unauthorized pages
  useEffect(() => {
    if (!isAdmin && currentUser) {
      const allowedPages = ['dashboard', 'leaves'];
      if (currentUser.department === 'Valuation') {
        allowedPages.push('valuation');
      } else if (currentUser.department === 'Accounts') {
        allowedPages.push('accounts');
      } else {
        allowedPages.push('tasks');
      }

      if (!allowedPages.includes(activePage)) {
        setActivePage('dashboard');
      }
    }
  }, [isAdmin, currentUser, activePage]);

  // ── CRITICAL: Don't render until client has hydrated ──────────
  // This prevents the SSR (no localStorage) vs client (has localStorage)
  // mismatch that causes the React hydration error.
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'Outfit',
          boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
          animation: 'pulse 1.5s infinite',
        }}>GT</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading GT Consultancy…</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={(p: string) => setActivePage(p as PageId)} />;
      case 'projects': return <ProjectsPage />;
      case 'tasks': return <TasksPage myTasksOnly={false} />;
      case 'valuation': return <ValuationPage />;
      case 'banks': return isAdmin ? <BanksPage /> : null;
      case 'employees': return isAdmin ? <EmployeesPage /> : null;
      case 'analytics': return isAdmin ? <AnalyticsPage /> : null;
      case 'accounts': return (isAdmin || currentUser.department === 'Accounts') ? <AccountsPage /> : null;
      case 'leaves': return <LeavesPage />;
      default: return <Dashboard onNavigate={(p: string) => setActivePage(p as PageId)} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={p => setActivePage(p as PageId)}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <main className="main-content">
        {/* Mobile Header */}
        <div style={{
          display: 'none',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-sidebar)',
          position: 'sticky', top: 0, zIndex: 40,
        }} className="mobile-header">
          <button onClick={() => setMobileNavOpen(true)} className="btn btn-icon btn-secondary">
            <Menu size={18} />
          </button>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16 }}>GT Consultancy</div>
          <div style={{ width: 36 }} />
        </div>

        <div style={{ minHeight: '100vh' }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
