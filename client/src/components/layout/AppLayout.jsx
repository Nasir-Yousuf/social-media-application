import React from 'react';
import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, LogOut, User, Bookmark, Zap, Users, Palette, KeyRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import BottomNav from './BottomNav';
import Toast from '../common/Toast';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import { ClearfeedLogo } from '../common/ClearfeedIcons';
import ChangePasswordModal from '../users/ChangePasswordModal';

export const AppLayout = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isMessages = location.pathname.startsWith('/messages');
  const isLearn = location.pathname.startsWith('/learn');
  const isCodePractice = location.pathname.startsWith('/code-practice');
  const isLeaderboard = location.pathname.startsWith('/leaderboard');
  const isTyping =
    location.pathname.startsWith('/typing') ||
    location.pathname === '/code-practice/typing' ||
    isLeaderboard;

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
  const isPublicLearn =
    location.pathname.startsWith('/learn') ||
    location.pathname.startsWith('/code-practice') ||
    location.pathname.startsWith('/typing') ||
    isLeaderboard;
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
        <div className={`${isTyping ? 'max-w-[1440px] 2xl:max-w-[1560px]' : 'max-w-7xl'} mx-auto flex justify-center items-start min-h-[calc(100vh-56px)]`}>
          <main className={`flex-1 w-full ${isTyping ? 'max-w-full' : isPublicLearn ? 'max-w-[1080px] xl:max-w-[1200px]' : 'max-w-[620px]'} pb-16 min-h-screen border-r md:border-l border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-black`}>
            <Outlet />
          </main>
          {!isPublicLearn && !isTyping && <RightSidebar />}
        </div>

        <Toast />
      </div>
    );
  }

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const { logout } = useAuth();
  const { openThemeModal, currentTheme } = useTheme();
  const navigate = useNavigate();

  const handleMobileLogout = () => {
    setIsMobileDrawerOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Mobile Top Bar (Only on screens smaller than md) */}
      <header className="md:hidden sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200 dark:border-neutral-800 px-4 h-13 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="shrink-0 cursor-pointer active:scale-95 transition-transform"
          title="Account Menu & Options"
          aria-label="Open account menu"
        >
          <Avatar
            src={user?.avatarUrl}
            name={user?.name}
            size="sm"
            showRoleBadge={false}
          />
        </button>

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

      {/* Mobile Account Drawer / Sheet (Twitter-Style) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-[320px] bg-white dark:bg-[#12151a] h-full shadow-2xl flex flex-col justify-between p-4 z-10 border-r border-neutral-200 dark:border-neutral-800 animate-slide-right overflow-y-auto">
            <div>
              {/* Header with avatar & close */}
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user?.avatarUrl}
                    name={user?.name}
                    size="md"
                    showRoleBadge={false}
                  />
                  <div className="min-w-0">
                    <p className="font-black text-sm text-neutral-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      @{user?.username}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Follower Stats */}
              <div className="flex items-center gap-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800/80">
                <span>
                  <strong className="text-neutral-900 dark:text-white font-bold">
                    {user?.followingCount ?? 0}
                  </strong>{' '}
                  Following
                </span>
                <span>
                  <strong className="text-neutral-900 dark:text-white font-bold">
                    {user?.followersCount ?? 0}
                  </strong>{' '}
                  Followers
                </span>
              </div>

              {/* Navigation Menu */}
              <div className="py-3 space-y-1">
                <NavLink
                  to={`/profile/${user?.username}`}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                >
                  <User className="w-5 h-5 text-sky-500" />
                  <span>View Profile</span>
                </NavLink>

                <NavLink
                  to="/bookmarks"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                >
                  <Bookmark className="w-5 h-5 text-sky-500" />
                  <span>Bookmarks</span>
                </NavLink>

                <NavLink
                  to="/typing"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                >
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Typing Arena & Duels</span>
                </NavLink>

                <NavLink
                  to="/members"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                >
                  <Users className="w-5 h-5 text-sky-500" />
                  <span>Community Directory</span>
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    openThemeModal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Palette className="w-5 h-5 text-emerald-500" />
                    <span>Display & Themes</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                    {currentTheme?.name}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsChangePasswordOpen(true);
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>

            {/* Bottom: Explicit Mobile Log Out Button */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleMobileLogout}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out @{user?.username}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal for Mobile */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Main 3-Column Twitter Layout Container */}
      <div className={`${isTyping ? 'max-w-[1440px] 2xl:max-w-[1560px]' : 'max-w-7xl'} mx-auto flex justify-center items-start min-h-screen`}>
        {/* Left Column: Navigation Sidebar */}
        <LeftSidebar />

        {/* Center Column: Feed & Main Content */}
        <main
          className={`flex-1 w-full ${
            isTyping
              ? 'max-w-[1400px] 2xl:max-w-[1520px] pb-20 md:pb-12 min-h-screen'
              : isLearn || isCodePractice
              ? 'max-w-[1080px] xl:max-w-[1200px] 2xl:max-w-[1260px] pb-20 md:pb-12 min-h-screen'
              : isMessages
              ? 'max-w-[1000px] xl:max-w-[1120px] 2xl:max-w-[1240px] pb-0 h-[calc(100dvh-3.25rem-3.5rem)] md:h-screen md:max-h-screen overflow-hidden'
              : 'max-w-[620px] pb-20 md:pb-12 min-h-screen'
          } border-r md:border-l border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-black`}
        >
          <Outlet />
        </main>

        {/* Right Column: Search, Trending & Who to follow (hidden on messages, learn, code-practice, and typing arena to give full width) */}
        {!isMessages && !isLearn && !isCodePractice && !isTyping && <RightSidebar />}
      </div>

      {/* Mobile Bottom Navigation (Only on mobile < md) */}
      <BottomNav />

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
};

export default AppLayout;
