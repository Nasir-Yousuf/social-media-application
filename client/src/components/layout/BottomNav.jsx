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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 cf-bg border-t cf-border backdrop-blur-md bg-opacity-95 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]'
                    : 'text-[var(--color-cf-text-secondary)] dark:text-[var(--color-cfd-text-secondary)]'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 text-[9px] font-bold rounded-full bg-[var(--color-cf-like)] text-white flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
