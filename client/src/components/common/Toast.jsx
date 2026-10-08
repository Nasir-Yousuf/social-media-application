import React from 'react';
import { X, Check, AlertCircle, Info, Bell, Swords } from 'lucide-react';
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
  warning: {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    icon: Swords,
    bar: 'bg-amber-500',
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
      role="alert"
      className="fixed top-3 sm:top-5 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm sm:max-w-md select-none animate-toast pointer-events-auto"
      style={{
        // Ensure proper transform centering with mobile protection
        maxWidth: 'min(440px, calc(100vw - 24px))',
      }}
    >
      <div
        onClick={handleClick}
        className={`relative overflow-hidden flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl backdrop-blur-xl bg-neutral-900/95 dark:bg-[#12151a]/95 text-white shadow-2xl shadow-black/50 border border-neutral-700/60 dark:border-neutral-700/50 hover:border-sky-500/50 transition-all ${
          toast.onClick ? 'cursor-pointer active:scale-[0.99]' : ''
        }`}
      >
        <div className="flex items-center gap-3 text-xs sm:text-sm font-medium min-w-0 font-sans flex-1">
          {toast.avatarUrl ? (
            <img
              src={toast.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-sky-500/50 shadow-sm"
            />
          ) : (
            <span className={`p-1.5 rounded-xl shrink-0 ${style.badge}`}>
              <Icon className="w-4 h-4" strokeWidth={2.5} />
            </span>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-neutral-100 font-semibold leading-snug line-clamp-2 break-words text-xs sm:text-sm">
              {toast.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          {toast.actionLabel && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (toast.actionOnClick) toast.actionOnClick();
                else if (toast.onClick) toast.onClick();
                dismissToast();
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-xs transition-colors cursor-pointer"
            >
              {toast.actionLabel}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissToast();
            }}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Accent indicator line at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${style.bar}`} />
      </div>
    </div>
  );
};

export default Toast;

