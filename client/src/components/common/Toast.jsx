import React from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TOAST_STYLES = {
  success: {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: Check,
    bar: 'bg-emerald-500',
  },
  error: {
    badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    icon: AlertCircle,
    bar: 'bg-rose-500',
  },
  info: {
    badge: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    icon: Info,
    bar: 'bg-sky-500',
  },
};

export const Toast = () => {
  const { toast, dismissToast } = useNotifications();

  if (!toast) return null;

  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  const handleClick = () => {
    if (toast.onClick) {
      toast.onClick();
      dismissToast();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm sm:max-w-md w-full px-4 animate-toast select-none ${
        toast.onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative overflow-hidden flex items-center justify-between gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl bg-neutral-900/95 dark:bg-[#16181d]/95 text-white shadow-2xl border border-neutral-700/60 dark:border-neutral-700/50 hover:border-sky-500/50 transition-colors">
        <div className="flex items-center gap-3 text-xs sm:text-sm font-medium min-w-0 font-sans">
          {toast.avatarUrl ? (
            <img
              src={toast.avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-sky-500/40"
            />
          ) : (
            <span className={`p-1 rounded-lg shrink-0 ${style.badge}`}>
              <Icon className="w-4 h-4" strokeWidth={2.5} />
            </span>
          )}
          <p className="truncate text-neutral-100">{toast.message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Accent indicator line at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${style.bar}`} />
      </div>
    </div>
  );
};

export default Toast;
