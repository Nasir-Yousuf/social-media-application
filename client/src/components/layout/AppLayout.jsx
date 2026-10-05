import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import Toast from '../common/Toast';
import { ClearfeedLogo } from '../common/ClearfeedIcons';

export const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center animate-pulse">
          <ClearfeedLogo className="w-10 h-10 text-sky-500 drop-shadow-sm" />
        </div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 font-sans tracking-tight">
          Opening Clearfeed...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Top Glassmorphic Navigation */}
      <TopNav />

      {/* Main Single-Column Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-5 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Floating Toast */}
      <Toast />
    </div>
  );
};

export default AppLayout;
