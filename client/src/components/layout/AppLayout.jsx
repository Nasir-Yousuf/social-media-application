import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import MobileNav from './MobileNav';
import Toast from '../common/Toast';

export const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
          <svg className="animate-spin h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-sm font-medium">Entering Pulse 518 Community...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row justify-center">
      <div className="w-full max-w-7xl flex">
        {/* Left Navigation */}
        <SidebarLeft />

        {/* Center Main Scrollable Area */}
        <main className="flex-1 min-w-0 border-r border-zinc-800/80 min-h-screen pb-20 md:pb-8">
          <MobileNav />
          <Outlet />
        </main>

        {/* Right Info & Discovery Sidebar */}
        <SidebarRight />
      </div>

      {/* Global Toast */}
      <Toast />
    </div>
  );
};

export default AppLayout;
