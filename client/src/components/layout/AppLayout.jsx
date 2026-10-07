import React from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
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
  const location = useLocation();
  const isMessages = location.pathname.startsWith('/messages');
  const isLearn = location.pathname.startsWith('/learn');
  const isCodePractice = location.pathname.startsWith('/code-practice');

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

  const isPublicPost = location.pathname.startsWith('/posts/') || location.pathname.startsWith('/post/');
  const isPublicLearn = location.pathname.startsWith('/learn') || location.pathname.startsWith('/code-practice');
  const isPublicRoute = isPublicPost || isPublicLearn;

  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Guest view for shared post links or learn & practice
  if (!isAuthenticated && isPublicRoute) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-sky-500 selection:text-white transition-colors duration-200 font-sans">
        {/* Guest Top Navigation */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200 dark:border-neutral-800 px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 select-none">
            <ClearfeedLogo className="w-7 h-7 text-sky-500" />
            <span className="font-sans font-black text-lg tracking-tight text-neutral-900 dark:text-white">
              Clear<span className="text-sky-500">feed</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-2.5">
            <NavLink
              to="/learn"
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Learn & Practice
            </NavLink>
            <ThemeToggle />
            <NavLink
              to="/login"
              state={{ from: location }}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Log In
            </NavLink>
            <NavLink
              to="/register"
              state={{ from: location }}
              className="text-xs font-bold px-4 py-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/20"
            >
              Sign Up
            </NavLink>
          </div>
        </header>

        {/* Center Content */}
        <div className="max-w-7xl mx-auto flex justify-center items-start min-h-[calc(100vh-56px)]">
          <main className={`flex-1 w-full ${isPublicLearn ? 'max-w-[1080px] xl:max-w-[1200px]' : 'max-w-[620px]'} pb-16 min-h-screen border-r md:border-l border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-black`}>
            <Outlet />
          </main>
          {!isPublicLearn && <RightSidebar />}
        </div>

        <Toast />
      </div>
    );
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

        <div className="flex items-center gap-1.5">
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `p-1.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-sky-500 transition-colors ${
                isActive ? 'text-sky-500' : ''
              }`
            }
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </NavLink>
          <ThemeToggle />
        </div>
      </header>

      {/* Main 3-Column Twitter Layout Container */}
      <div className="max-w-7xl mx-auto flex justify-center items-start min-h-screen">
        {/* Left Column: Navigation Sidebar */}
        <LeftSidebar />

        {/* Center Column: Feed & Main Content */}
        <main
          className={`flex-1 w-full ${
            isLearn || isCodePractice
              ? 'max-w-[1080px] xl:max-w-[1200px] 2xl:max-w-[1260px] pb-20 md:pb-12 min-h-screen'
              : isMessages
              ? 'max-w-[1000px] xl:max-w-[1120px] 2xl:max-w-[1240px] pb-0 md:h-screen md:max-h-screen overflow-hidden'
              : 'max-w-[620px] pb-20 md:pb-12 min-h-screen'
          } border-r md:border-l border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-black`}
        >
          <Outlet />
        </main>

        {/* Right Column: Search, Trending & Who to follow (hidden on messages & code practice to give full width) */}
        {!isMessages && !isLearn && !isCodePractice && <RightSidebar />}
      </div>

      {/* Mobile Bottom Navigation (Only on mobile < md) */}
      <BottomNav />

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
};

export default AppLayout;
