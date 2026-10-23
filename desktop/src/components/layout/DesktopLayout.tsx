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
  Shield,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMesh } from '../../mesh/context/MeshContext';

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
  const { user, backendConnected, logout } = useAuth();
  const { transportState, conversations: meshConvs } = useMesh();

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
      } else if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        onNavigate('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn & Academy', icon: GraduationCap },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 0 },
    { id: 'mesh', label: 'Clearfeed Mesh', icon: Radio, highlight: true },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'code', label: 'Code Hub', icon: Code2 },
    { id: 'explore', label: 'Explore', icon: Compass },
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
            sidebarCollapsed ? 'w-16' : 'w-60'
          } bg-neutral-900/60 border-r border-neutral-800/80 flex flex-col justify-between transition-all duration-200 shrink-0 select-none`}
        >
          {/* Top Nav List */}
          <div className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? item.highlight
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-sky-500 text-white shadow-sm'
                      : item.highlight
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3 truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Bottom Profile & Collapse Toggle */}
          <div className="p-3 border-t border-neutral-800/80 space-y-2">
            {/* User pill */}
            {user ? (
              <div
                className={`flex items-center ${
                  sidebarCollapsed ? 'justify-center p-1' : 'p-2'
                } rounded-xl bg-neutral-950/60 border border-neutral-800/80`}
              >
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-2.5 min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-200 truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">@{user.username}</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => onNavigate('auth')}
                className={`flex items-center ${
                  sidebarCollapsed ? 'justify-center p-1' : 'px-3 py-2'
                } rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold cursor-pointer hover:bg-sky-500/20 transition`}
              >
                <span>{sidebarCollapsed ? 'In' : 'Sign In'}</span>
              </div>
            )}

            {/* Collapse toggle */}
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center py-1.5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40 rounded-lg text-xs transition cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Collapse Sidebar</span>
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
