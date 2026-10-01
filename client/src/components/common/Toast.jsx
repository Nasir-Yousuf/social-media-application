import React from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TOAST_STYLES = {
  success: {
    bg: 'bg-[var(--color-cf-accent)]',
    icon: Check,
    iconClass: 'text-white',
  },
  error: {
    bg: 'bg-[var(--color-cf-danger)]',
    icon: AlertCircle,
    iconClass: 'text-white',
  },
  info: {
    bg: 'bg-[var(--color-cf-text-secondary)] dark:bg-[var(--color-cfd-elevated)]',
    icon: Info,
    iconClass: 'text-white',
  },
};

export const Toast = () => {
  const { toast, dismissToast } = useNotifications();

  if (!toast) return null;

  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-toast">
      <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg ${style.bg} text-white shadow-lg`}>
        <div className="flex items-center gap-2.5 text-sm font-semibold min-w-0 font-sans">
          <Icon className={`w-4 h-4 shrink-0 ${style.iconClass}`} strokeWidth={2.5} />
          <p className="truncate">{toast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          className="text-white/70 hover:text-white p-1 rounded hover:bg-white/15 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
