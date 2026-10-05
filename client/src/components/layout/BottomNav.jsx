import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Code2, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const BottomNav = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const items = [
    { to: '/', label: 'Feed', icon: Home, end: true },
    { to: '/explore', label: 'Discover', icon: Compass },
    { to: '/code', label: 'Code', icon: Code2 },
    {
      to: '/notifications',
      label: 'Alerts',
      icon: Bell,
      badge: unreadCount,
    },
    { to: `/profile/${user?.username}`, label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-black/90 border-t border-neutral-200/80 dark:border-neutral-800/80 px-3 py-1.5 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-xs transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'text-sky-500 font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-1 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
