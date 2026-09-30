import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Bell, Users, User, Plus, Sparkles, Search, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../common/Modal';
import PostComposer from '../posts/PostComposer';

export const MobileNav = () => {
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [isPostOpen, setIsPostOpen] = useState(false);

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Pulse<span className="text-indigo-500">518</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          <NavLink
            to="/search"
            className="p-2 text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-zinc-900"
          >
            <Search className="w-5 h-5" />
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin"
              className="p-2 text-amber-400 hover:text-amber-300 rounded-xl hover:bg-amber-500/10"
            >
              <ShieldAlert className="w-5 h-5" />
            </NavLink>
          )}
        </div>
      </header>

      {/* Bottom Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2.5 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/80 shadow-2xl">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium ${
              isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium ${
              isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </NavLink>

        {/* Center Floating Post Button */}
        <button
          onClick={() => setIsPostOpen(true)}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium ${
              isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          )}
          <span>Alerts</span>
        </NavLink>

        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium ${
              isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-zinc-200'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* Mobile Composer Modal */}
      <Modal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        title="Post to Course 518"
      >
        <PostComposer
          onPostCreated={() => {
            setIsPostOpen(false);
            window.dispatchEvent(new CustomEvent('pulse518:newPost'));
          }}
          compact={true}
        />
      </Modal>
    </>
  );
};

export default MobileNav;
