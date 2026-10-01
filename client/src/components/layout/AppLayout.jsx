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
      <div className="min-h-screen cf-bg cf-text flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center animate-pulse">
          <ClearfeedLogo className="w-10 h-10 text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]" />
        </div>
        <p className="text-sm font-medium cf-text-muted font-sans">Opening Clearfeed...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen cf-bg cf-text flex flex-col">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Single-Column Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Toast */}
      <Toast />
    </div>
  );
};

export default AppLayout;
