'use client';

import { useState, useEffect, cloneElement, isValidElement } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode;
  topBar?: React.ReactNode;
  children: React.ReactNode;
  logoText?: string;
}

export default function ResponsiveLayout({ 
  sidebar, 
  topBar, 
  children, 
  logoText = "ABC Polytechnic" 
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on path change (navigation)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleClose = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* 
        1. Navbar (Mobile Only)
      */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[rgba(8,12,20,0.8)] backdrop-blur-md border-b border-[var(--border)] z-[100] flex items-center justify-between px-4 md:hidden">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          <span className="text-2xl">{sidebarOpen ? '✕' : '☰'}</span>
        </button>
        <div className="font-extrabold text-sm text-[var(--text-primary)]">{logoText}</div>
        <div className="w-10" />
      </header>

      {/* 
        2. Overlay Layer (Mobile)
      */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[105] md:hidden transition-opacity duration-300"
          onClick={handleClose}
        />
      )}

      {/* 
        3. Sidebar Container
      */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border)] z-[110] transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {isValidElement(sidebar) 
          ? cloneElement(sidebar as React.ReactElement<any>, { onItemClick: handleClose }) 
          : sidebar}
      </aside>

      {/* 
        4. Main Content Area
      */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar (Optional) */}
        {topBar && (
          <div className="hidden md:flex h-16 items-center justify-between px-8 border-b border-[var(--border)] bg-[rgba(8,12,20,0.5)] backdrop-blur-sm sticky top-0 z-[90]">
            {topBar}
          </div>
        )}

        <main className={cn(
          "flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-[1400px] mx-auto transition-all duration-300",
          "fade-in"
        )}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        /* Avoid body scroll when sidebar is open on mobile */
        body {
          overflow: ${sidebarOpen ? 'hidden' : 'auto'};
        }
        @media (min-width: 768px) {
          body {
            overflow: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
