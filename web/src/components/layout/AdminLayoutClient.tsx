'use client';

import { useState } from 'react';
import GlobalSearch from '@/components/GlobalSearch';

interface AdminLayoutClientProps {
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminLayoutClient({ sidebarContent, children }: AdminLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="admin-layout" style={{ 
      display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)',
      transition: 'all 0.3s ease'
    }}>
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="menu-btn">
          {isMobileOpen ? '✕' : '☰'}
        </button>
        <div className="header-logo">ABC Polytechnic</div>
        <div style={{ width: 40 }} />
      </header>

      {/* Sidebar Overlay (Mobile Only) */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Container */}
      <aside className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
           <span className="logo-icon">🎓</span>
           {!isCollapsed && <span className="logo-text">Polytechnic</span>}
           <button onClick={() => setIsCollapsed(!isCollapsed)} className="collapse-toggle desktop-only">
             {isCollapsed ? '▶' : '◀'}
           </button>
        </div>
        <div className="sidebar-content">
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`main-wrapper ${isCollapsed ? 'expanded' : ''}`}>
        <div className="top-bar">
          <div className="breadcrumb">Portal / Dashboard</div>
          <div className="search-wrap">
            <GlobalSearch />
          </div>
        </div>
        <main className="content-area">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .admin-layout { height: 100vh; overflow: hidden; }
        
        /* Mobile Header */
        .mobile-header {
          display: none; position: fixed; top: 0; left: 0; right: 0; height: 56px;
          background: rgba(8,12,20,0.8); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border); z-index: 100;
          align-items: center; justify-content: space-between; padding: 0 1rem;
        }
        .header-logo { font-weight: 800; font-size: 0.9rem; color: var(--text-primary); }
        .menu-btn { background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer; }

        /* Sidebar */
        .sidebar-container {
          width: 260px; height: 100vh; background: var(--surface);
          border-right: 1px solid var(--border); transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease;
          display: flex; flexDirection: column; z-index: 110;
        }
        .sidebar-container.collapsed { width: 80px; }
        .sidebar-header {
          height: 64px; display: flex; align-items: center; padding: 0 1.25rem;
          gap: 0.75rem; border-bottom: 1px solid var(--border); position: relative;
        }
        .logo-icon { font-size: 1.5rem; }
        .logo-text { font-weight: 800; color: var(--text-primary); transition: opacity 0.2s; }
        .collapse-toggle {
          position: absolute; right: -12px; top: 26px; width: 24px; height: 24px;
          background: #3b82f6; color: white; border: none; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; font-size: 0.6rem;
          cursor: pointer; z-index: 10; border: 2px solid var(--bg-primary);
        }

        /* Main Wrapper */
        .main-wrapper {
          flex: 1; height: 100vh; overflow-y: auto; overflow-x: hidden;
          background: var(--bg-primary); padding-top: 0; transition: margin-left 0.3s ease;
        }
        .top-bar {
          height: 64px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem; border-bottom: 1px solid var(--border); background: rgba(8,12,20,0.5);
          backdrop-filter: blur(8px); sticky; top: 0; z-index: 90;
        }
        .breadcrumb { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
        .content-area { padding: 2rem; max-width: 1400px; margin: 0 auto; }

        /* Tablet/Mobile Adjustments */
        @media (max-width: 1024px) {
           .sidebar-container { position: fixed; left: 0; transform: translateX(-100%); }
           .sidebar-container.mobile-open { transform: translateX(0); }
           .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 105; backdrop-filter: blur(2px); }
           .mobile-header { display: flex; }
           .main-wrapper { padding-top: 56px; }
           .top-bar { display: none; }
           .desktop-only { display: none !important; }
        }
        
        /* Auto-collapse for Tablet (if not hidden) */
        @media (min-width: 1025px) and (max-width: 1280px) {
           .sidebar-container { width: 80px; }
           .sidebar-header .logo-text { display: none; }
        }
      `}</style>
    </div>
  );
}
