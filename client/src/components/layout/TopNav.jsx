import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  Users,
  Search,
  User,
  ShieldAlert,
  LogOut,
  PenSquare,
  Code2,
  Bookmark,
  Menu,
  X,
  Keyboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ClearfeedLogo } from '../common/ClearfeedIcons';
import ThemeToggle from '../common/ThemeToggle';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import PostComposer from '../posts/PostComposer';

export const TopNav = () => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Feed', icon: Home, end: true },
    { to: '/explore', label: 'Discover', icon: Compass },
    { to: '/code-practice', label: 'Code Practice', icon: Keyboard },
    { to: '/code', label: 'Code', icon: Code2 },
    { to: '/search', label: 'Search', icon: Search },
    {
      to: '/notifications',
      label: 'Alerts',
      icon: Bell,
      badge: unreadCount,
    },
    { to: '/bookmarks', label: 'Saved', icon: Bookmark },
    { to: '/members', label: 'Community', icon: Users },
    { to: `/profile/${user?.username}`, label: 'Profile', icon: User },
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin', icon: ShieldAlert, highlight: true }]
      : []),
  ];

  const getLinkClasses = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-150 active:scale-95 ${
      isActive
        ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 shadow-xs'
        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
    }`;

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center gap-2 shrink-0 group select-none"
              title="Clearfeed Home"
            >
              <div className="transition-transform group-hover:scale-105 duration-200">
                <ClearfeedLogo className="w-7 h-7 text-sky-500" />
              </div>
              <span className="font-sans font-black text-lg tracking-tight text-neutral-900 dark:text-white hidden sm:inline">
                Clear<span className="text-sky-500">feed</span>
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={getLinkClasses}
                    title={item.label}
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4" />
                      {item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Compose Post Button */}
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white shadow-sm shadow-sky-500/25 transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Post</span>
              </button>

              <ThemeToggle />

              {/* User Avatar */}
              <NavLink
                to={`/profile/${user?.username}`}
                className="hidden md:block rounded-full p-0.5 hover:ring-2 hover:ring-sky-500 transition-all duration-200"
                title={`@${user?.username}`}
              >
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name}
                  size="sm"
                  showRoleBadge={false}
                  role={user?.role}
                />
              </NavLink>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Log out"
                className="hidden md:flex p-2 rounded-full text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 dark:text-neutral-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile hamburger menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur-xl animate-fade-in">
            <div className="max-w-2xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-sky-500'
                      } ${item.highlight ? 'text-amber-500 dark:text-amber-400' : ''}`
                    }
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Quick Compose Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Compose Post"
      >
        <PostComposer
          onPostCreated={() => {
            setIsPostModalOpen(false);
            window.dispatchEvent(new CustomEvent('clearfeed:newPost'));
          }}
          compact={true}
        />
      </Modal>
    </>
  );
};

export default TopNav;
