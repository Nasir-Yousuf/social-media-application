import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Code2,
  Bookmark,
  Users,
  User,
  ShieldAlert,
  MoreHorizontal,
  PenSquare,
  LogOut,
  Sparkles,
  Palette,
  KeyRound,
  BookOpen,
  Keyboard,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { ClearfeedLogo } from '../common/ClearfeedIcons';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import PostComposer from '../posts/PostComposer';
import ChangePasswordModal from '../users/ChangePasswordModal';

export const LeftSidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, currentTheme, isDark, toggleTheme, openThemeModal } = useTheme();
  const { unreadCount, unreadMessagesCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userMenuPos, setUserMenuPos] = useState({ bottom: 0, left: 0 });
  const [moreMenuPos, setMoreMenuPos] = useState({ bottom: 0, left: 0 });

  const userButtonRef = useRef(null);
  const moreButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserMenu = () => {
    if (!isUserMenuOpen && userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setUserMenuPos({
        bottom: Math.max(12, window.innerHeight - rect.top + 8),
        left: Math.max(12, rect.left),
      });
      setIsUserMenuOpen(true);
      setIsMoreMenuOpen(false);
    } else {
      setIsUserMenuOpen(false);
    }
  };

  const toggleMoreMenu = () => {
    if (!isMoreMenuOpen && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setMoreMenuPos({
        bottom: Math.max(12, window.innerHeight - rect.top + 8),
        left: Math.max(12, rect.left),
      });
      setIsMoreMenuOpen(true);
      setIsUserMenuOpen(false);
    } else {
      setIsMoreMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(e.target)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        isMoreMenuOpen &&
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(e.target)
      ) {
        setIsMoreMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMoreMenuOpen(false);
      }
    };

    const handleWindowResize = () => {
      setIsUserMenuOpen(false);
      setIsMoreMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleWindowResize);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isUserMenuOpen, isMoreMenuOpen]);

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/typing', label: 'Typing Arena', icon: Zap },
    { to: '/code-practice', label: 'Code Practice', icon: Keyboard },
    { to: '/learn', label: 'Learn & Practice', icon: BookOpen },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount,
    },
    {
      to: '/messages',
      label: 'Chat',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    { to: '/code', label: 'CodeHub', icon: Code2 },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: '/members', label: 'Community', icon: Users },
    { to: `/profile/${user?.username}`, label: 'Profile', icon: User },
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin', icon: ShieldAlert, highlight: true }]
      : []),
  ];

  return (
    <>
      <aside
        ref={sidebarRef}
        onScroll={() => {
          if (isUserMenuOpen) setIsUserMenuOpen(false);
          if (isMoreMenuOpen) setIsMoreMenuOpen(false);
        }}
        className="hidden md:flex flex-col sticky top-0 h-screen max-h-screen w-18 xl:w-64 px-2 xl:px-4 pt-2 pb-4 overflow-y-auto shrink-0 border-r border-neutral-200/80 dark:border-neutral-800/80 select-none z-30 self-start transition-all duration-200 overscroll-contain sidebar-scroll"
      >
        <div className="flex flex-col justify-between min-h-full">
          {/* Top: Logo & Nav Links */}
          <div className="flex flex-col gap-1 shrink-0">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center gap-3 p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/80 w-fit transition-colors group mb-1"
              title="Clearfeed Home"
            >
              <div className="transition-transform group-hover:scale-110 duration-200">
                <ClearfeedLogo className="w-8 h-8 text-sky-500" />
              </div>
              <span className="hidden xl:inline font-sans font-black text-xl tracking-tight text-neutral-900 dark:text-white">
                Clear<span className="text-sky-500">feed</span>
              </span>
            </NavLink>

            {/* Nav Items */}
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.end
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={`flex items-center gap-4 px-3.5 py-2.5 rounded-full text-base font-semibold transition-all duration-150 active:scale-95 group w-fit xl:w-full ${
                      isActive
                        ? 'font-bold text-neutral-900 dark:text-white bg-neutral-100/90 dark:bg-neutral-800/80'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <div className="relative">
                      <Icon
                        className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'text-sky-500 stroke-[2.5]'
                            : 'text-neutral-700 dark:text-neutral-300 stroke-[2]'
                        } ${item.highlight ? 'text-amber-500 dark:text-amber-400' : ''}`}
                      />
                      {item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-4.5 h-4.5 px-1 text-[10px] font-black rounded-full bg-sky-500 text-white flex items-center justify-center animate-pulse shadow-sm">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden xl:inline text-lg tracking-tight">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}

              {/* Display / Theme Customizer */}
              <button
                type="button"
                onClick={openThemeModal}
                className="flex items-center gap-4 px-3.5 py-2.5 rounded-full text-base font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white transition-all duration-150 active:scale-95 w-fit xl:w-full cursor-pointer group"
                title={`Theme: ${currentTheme?.name} (Click to customize)`}
              >
                <div className="relative transition-transform duration-200 group-hover:scale-110">
                  <Palette className="w-6 h-6 stroke-[2]" style={{ color: currentTheme?.accentColor }} />
                </div>
                <span className="hidden xl:inline text-lg tracking-tight">Display</span>
              </button>

              {/* More / Settings Menu */}
              <div>
                <button
                  ref={moreButtonRef}
                  type="button"
                  onClick={toggleMoreMenu}
                  className="flex items-center gap-4 px-3.5 py-2.5 rounded-full text-base font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white transition-all duration-150 active:scale-95 w-fit xl:w-full cursor-pointer"
                  title="More Options"
                >
                  <MoreHorizontal className="w-6 h-6 stroke-[2]" />
                  <span className="hidden xl:inline text-lg tracking-tight">More</span>
                </button>
              </div>
            </nav>

            {/* Big Twitter-style Post Button */}
            <div className="mt-2.5 mb-2">
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="w-12 h-12 xl:w-full xl:h-11 flex items-center justify-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-base shadow-md shadow-sky-500/25 transition-all duration-150 active:scale-95 cursor-pointer"
                title="Post"
              >
                <PenSquare className="w-5 h-5 xl:hidden" />
                <span className="hidden xl:inline tracking-tight font-extrabold text-base">
                  Post
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Left: User Profile Pill (Exactly like Twitter) */}
          <div className="pt-2 mt-auto shrink-0 pb-1">
            <button
              ref={userButtonRef}
              type="button"
              onClick={toggleUserMenu}
              className="flex items-center justify-between w-full p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all duration-150 cursor-pointer active:scale-95 group"
              title={`Account options for @${user?.username}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name}
                  size="md"
                  showRoleBadge={false}
                />
                <div className="hidden xl:flex flex-col text-left min-w-0">
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate leading-tight">
                    @{user?.username}
                  </span>
                </div>
              </div>

              <div className="hidden xl:block text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Render More Menu Portal outside overflow container */}
      {isMoreMenuOpen &&
        createPortal(
          <div
            ref={moreMenuRef}
            style={{
              position: 'fixed',
              bottom: `${moreMenuPos.bottom}px`,
              left: `${moreMenuPos.left}px`,
            }}
            className="w-60 bg-white dark:bg-[#12151a] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-fade-in select-none"
          >
            <button
              type="button"
              onClick={() => {
                openThemeModal();
                setIsMoreMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-sky-500" />
                <span>Display & Themes</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                {currentTheme?.name}
              </span>
            </button>
            <NavLink
              to="/digest"
              onClick={() => setIsMoreMenuOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Weekly Digest</span>
            </NavLink>
          </div>,
          document.body
        )}

      {/* Render User Menu Portal outside overflow container */}
      {isUserMenuOpen &&
        createPortal(
          <div
            ref={userMenuRef}
            style={{
              position: 'fixed',
              bottom: `${userMenuPos.bottom}px`,
              left: `${userMenuPos.left}px`,
            }}
            className="w-64 bg-white dark:bg-[#12151a] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in select-none"
          >
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                @{user?.username}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-sans">
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-100 font-bold">
                    {user?.followingCount ?? 0}
                  </strong>{' '}
                  Following
                </span>
                <span>
                  <strong className="text-neutral-900 dark:text-neutral-100 font-bold">
                    {user?.followersCount ?? 0}
                  </strong>{' '}
                  Followers
                </span>
              </div>
            </div>

            <div className="py-1">
              <NavLink
                to={`/profile/${user?.username}`}
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
              >
                <User className="w-4 h-4 text-sky-500" />
                <span>View Profile</span>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  openThemeModal();
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-sky-500" />
                  <span>Theme ({currentTheme?.name})</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500">
                  {currentTheme?.badge}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChangePasswordOpen(true);
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Change Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out @{user?.username}</span>
              </button>
            </div>
          </div>,
          document.body
        )}

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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};

export default LeftSidebar;
