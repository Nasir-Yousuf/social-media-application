import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import BottomNav from './BottomNav';
import Toast from '../common/Toast';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import { ClearfeedLogo } from '../common/ClearfeedIcons';

export const AppLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();

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
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Mobile Top Bar (Only on screens smaller than md) */}
      <header className="md:hidden sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200 dark:border-neutral-800 px-4 h-13 flex items-center justify-between">
        <NavLink to={`/profile/${user?.username}`} className="shrink-0">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name}
            size="sm"
            showRoleBadge={false}
          />
        </NavLink>

        <NavLink to="/" className="flex items-center gap-1.5 select-none">
          <ClearfeedLogo className="w-6 h-6 text-sky-500" />
          <span className="font-sans font-black text-base tracking-tight text-neutral-900 dark:text-white">
            Clear<span className="text-sky-500">feed</span>
          </span>
        </NavLink>

        <ThemeToggle />
      </header>

      {/* Main 3-Column Twitter Layout Container */}
      <div className="max-w-7xl mx-auto flex justify-center min-h-screen">
        {/* Left Column: Navigation Sidebar */}
        <LeftSidebar />

        {/* Center Column: Feed & Main Content */}
        <main className="flex-1 w-full max-w-[620px] min-h-screen border-r md:border-l border-neutral-200/80 dark:border-neutral-800/80 pb-20 md:pb-12 bg-white dark:bg-black">
          <Outlet />
        </main>

        {/* Right Column: Search, Trending & Who to follow */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation (Only on mobile < md) */}
      <BottomNav />

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
};

export default AppLayout;
