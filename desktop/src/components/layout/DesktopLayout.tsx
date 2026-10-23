import React, { useState, useEffect } from 'react';
import {
  Home,
  MessageSquare,
  Radio,
  Users,
  Code2,
  Compass,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Search,
  Bell,
  LogOut,
  GraduationCap,
  Keyboard,
  Play,
  Trophy,
  Bookmark,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMesh } from '../../mesh/context/MeshContext';
import { useNotifications } from '../../context/NotificationContext';
import { ClearfeedLogo } from '../common/ClearfeedIcons';
import Avatar from '../common/Avatar';

interface DesktopLayoutProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  currentSection,
  onNavigate,
  children,
}) => {
  const { user, backendConnected, logout, isAdmin } = useAuth();
  const { transportState } = useMesh();
  const { unreadCount, unreadMessagesCount } = useNotifications();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pulse518_desktop_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pulse518_desktop_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        onNavigate('mesh');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        onNavigate('learn');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        onNavigate('typing');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        onNavigate('code-practice');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onNavigate('search');
      } else if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        onNavigate('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const navItems = [
    { id: 'home', label: 'Home Feed', icon: Home },
    { id: 'learn', label: 'Learn & Academy', icon: GraduationCap },
    { id: 'typing', label: 'Typing Arena', icon: Keyboard, offline: true },
    { id: 'code-practice', label: 'Code Sandbox & Practice', icon: Play, offline: true },
    { id: 'code', label: 'Code Hub', icon: Code2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'mesh', label: 'Clearfeed Mesh (P2P)', icon: Radio, highlight: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'members', label: 'Cohort Members', icon: Users },
    { id: 'explore', label: 'Explore Topics', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    ...(isAdmin
      ? [{ id: 'admin', label: 'Administration', icon: ShieldAlert, highlight: true }]
      : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none">
      {/* Top Desktop Window Bar */}
      <header
        data-tauri-drag-region
        className="h-10 px-4 bg-neutral-950 border-b border-neutral-800/80 flex items-center justify-between shrink-0 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-sky-500 flex items-center justify-center font-bold text-[10px] text-white">
              CF
            </div>
            <span className="font-bold text-xs tracking-wide text-neutral-200">
              Clearfeed Desktop
            </span>
          </div>

          <span className="text-neutral-700">|</span>

          {/* Online/Offline Status Pill */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {backendConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <WifiOff className="w-3 h-3" /> Offline Mode
              </span>
            )}
          </div>
        </div>

        {/* Clearfeed Mesh Offline Status Pill */}
        <div
          onClick={() => onNavigate('mesh')}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800/80 hover:border-emerald-500/40 text-[11px] text-neutral-300 cursor-pointer transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-semibold">Mesh:</span>
          <span className="text-neutral-400 font-mono text-[10px]">{transportState}</span>
        </div>

        {/* App Version Info */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="font-mono text-[10px]">v2.0.0 (Tauri 2)</span>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-68'
          } bg-neutral-950/80 border-r border-neutral-800/80 flex flex-col justify-between transition-all duration-200 shrink-0 select-none`}
        >
          {/* Top Brand Logo */}
          <div className={`p-3.5 pb-2 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} border-b border-neutral-800/50 shrink-0`}>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-3 p-1.5 rounded-2xl hover:bg-neutral-800/60 transition-colors group cursor-pointer ${
                sidebarCollapsed ? 'mx-auto' : ''
              }`}
              title="Clearfeed Home"
            >
              <div className="transition-transform group-hover:scale-105 duration-200 shrink-0">
                <ClearfeedLogo className="w-8 h-8 text-sky-500" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-sans font-black text-xl tracking-tight text-white">
                  Clear<span className="text-sky-500">feed</span>
                </span>
              )}
            </button>
          </div>

          {/* Top Nav List */}
          <div className="p-2.5 space-y-1 overflow-y-auto flex-1 select-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              const hasBadge = typeof item.badge === 'number' && item.badge > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
                  } py-2.5 rounded-2xl text-[15px] font-medium transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                    isActive
                      ? item.highlight
                        ? 'bg-emerald-500/15 text-emerald-300 font-bold ring-1 ring-emerald-500/30'
                        : 'bg-neutral-800/90 text-white font-bold ring-1 ring-white/10 shadow-sm'
                      : item.highlight
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <div className="relative shrink-0">
                      <Icon
                        className={`w-5.5 h-5.5 transition-transform duration-150 group-hover:scale-105 ${
                          isActive
                            ? item.highlight
                              ? 'text-emerald-400 stroke-[2.3]'
                              : 'text-sky-400 stroke-[2.3]'
                            : item.highlight
                            ? 'text-emerald-400 stroke-[1.8]'
                            : 'text-neutral-400 group-hover:text-neutral-200 stroke-[1.8]'
                        }`}
                      />
                      {sidebarCollapsed && hasBadge && (
                        <span className="absolute -top-1.5 -right-2 min-w-4.5 h-4.5 px-1 text-[10px] font-black rounded-full bg-sky-500 text-white flex items-center justify-center animate-pulse shadow-sm">
                          {item.badge! > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="ml-3.5 tracking-tight truncate">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!sidebarCollapsed && item.offline && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      OFFLINE
                    </span>
                  )}
                  {!sidebarCollapsed && hasBadge && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 text-[11px] font-bold rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm">
                      {item.badge! > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Profile & Collapse Toggle */}
          <div className="p-3 border-t border-neutral-800/80 space-y-2">
            {/* User pill */}
            {user ? (
              <div
                className={`flex items-center justify-between ${
                  sidebarCollapsed ? 'justify-center p-1.5' : 'p-2.5'
                } rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition`}
              >
                <div
                  onClick={() => onNavigate('profile')}
                  className="flex items-center min-w-0 cursor-pointer flex-1 hover:opacity-90 group"
                  title={`View Profile (@${user.username})`}
                >
                  <Avatar
                    user={user}
                    src={user.avatarUrl}
                    name={user.name}
                    size={sidebarCollapsed ? 'sm' : 'md'}
                    showRoleBadge={false}
                  />
                  {!sidebarCollapsed && (
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-100 truncate group-hover:text-sky-400 transition-colors">
                        {user.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">@{user.username}</p>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 hover:text-rose-400 text-neutral-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => onNavigate('auth')}
                className={`flex items-center justify-center ${
                  sidebarCollapsed ? 'p-2' : 'px-4 py-2.5'
                } rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold cursor-pointer hover:bg-sky-500/20 transition`}
              >
                <span>{sidebarCollapsed ? 'In' : 'Sign In / Register'}</span>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center py-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 rounded-xl text-xs transition cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4.5 h-4.5" />
              ) : (
                <div className="w-full flex items-center justify-between px-2">
                  <div className="flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-medium">Collapse</span>
                  </div>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                    Ctrl+B
                  </kbd>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-neutral-950 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DesktopLayout;
