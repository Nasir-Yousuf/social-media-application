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
  Sparkles,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import PostComposer from '../posts/PostComposer';

export const SidebarLeft = () => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Home Feed', icon: Home, end: true },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/members', label: 'Course Members', icon: Users },
    { to: '/search', label: 'Search', icon: Search },
    { to: `/profile/${user?.username}`, label: 'My Profile', icon: User },
    ...(isAdmin ? [{ to: '/admin', label: 'Faculty Admin', icon: ShieldAlert, highlight: true }] : []),
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 px-4 py-6 border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl z-20">
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <NavLink to="/" className="flex items-center gap-3 px-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  Pulse<span className="text-indigo-500">518</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cohort
                </span>
              </div>
              <p className="text-xs text-zinc-400">CS-518 Social Network</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                    } ${item.highlight ? 'text-amber-400 hover:text-amber-300' : ''}`
                  }
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Post CTA */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Post to Course</span>
          </button>
        </div>

        {/* Current User Pill & Logout */}
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3 px-2">
          <NavLink
            to={`/profile/${user?.username}`}
            className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.name}
              size="md"
              showRoleBadge={true}
              role={user?.role}
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-100 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-400 truncate">@{user?.username}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Quick Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Share with Course 518"
      >
        <PostComposer
          onPostCreated={() => {
            setIsPostModalOpen(false);
            window.dispatchEvent(new CustomEvent('pulse518:newPost'));
          }}
          compact={true}
        />
      </Modal>
    </>
  );
};

export default SidebarLeft;
