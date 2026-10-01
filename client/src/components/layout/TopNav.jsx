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

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors cf-btn-transition ${
      isActive
        ? 'text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)]'
        : 'text-[var(--color-cf-text-secondary)] dark:text-[var(--color-cfd-text-secondary)] hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] hover:text-[var(--color-cf-accent)]'
    }`;

  return (
    <>
      <header className="sticky top-0 z-30 cf-bg border-b cf-border backdrop-blur-md bg-opacity-90">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 shrink-0 group" title="Clearfeed Home">
              <ClearfeedLogo className="w-7 h-7 text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] transition-transform group-hover:scale-105" />
              <span className="font-sans font-extrabold text-lg tracking-tight cf-text hidden sm:inline">
                Clear<span className="text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]">feed</span>
              </span>
            </NavLink>

            {/* Desktop Navigation — compact horizontal links */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    title={item.label}
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4" />
                      {item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-bold rounded-full bg-[var(--color-cf-like)] text-white flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Controls: Write + Theme + Avatar + Mobile Menu */}
            <div className="flex items-center gap-1.5">
              {/* Write Post Button */}
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-[var(--color-cf-accent)] hover:bg-[var(--color-cf-accent-hover)] text-white cf-btn-transition cursor-pointer shadow-sm hover:shadow"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Post</span>
              </button>

              <ThemeToggle />

              {/* User Avatar (links to profile) */}
              <NavLink
                to={`/profile/${user?.username}`}
                className="hidden md:block rounded-full p-0.5 hover:ring-2 hover:ring-[var(--color-cf-accent)] transition-all"
                title="Your profile"
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
                className="hidden md:flex p-2 rounded-full text-[var(--color-cf-text-muted)] dark:text-[var(--color-cfd-text-muted)] hover:text-[var(--color-cf-danger)] dark:hover:text-[var(--color-cfd-danger)] hover:bg-[var(--color-cf-danger-soft)] dark:hover:bg-[var(--color-cfd-danger-soft)] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full cf-text hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t cf-border cf-bg animate-fade-in">
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
                      `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                        isActive
                          ? 'text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)]'
                          : 'cf-text hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] hover:text-[var(--color-cf-accent)]'
                      } ${item.highlight ? 'text-[var(--color-cf-amber)] dark:text-[var(--color-cfd-amber)]' : ''}`
                    }
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full bg-[var(--color-cf-like)] text-white flex items-center justify-center">
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-cf-danger)] dark:text-[var(--color-cfd-danger)] hover:bg-[var(--color-cf-danger-soft)] dark:hover:bg-[var(--color-cfd-danger-soft)] transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Quick Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Write something"
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
