import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  AlertOctagon,
  HelpCircle,
  X,
} from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const confirmButtonRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title: options.title || 'Are you sure?',
        description: options.description || 'This action cannot be undone. Please confirm to proceed.',
        confirmText: options.confirmText || options.confirmLabel || 'Confirm',
        cancelText: options.cancelText || options.cancelLabel || 'Cancel',
        variant: options.variant || 'danger', // 'danger' | 'warning' | 'report' | 'reset' | 'info'
        icon: options.icon, // optional override
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialog?.resolve) {
      dialog.resolve(true);
    }
    setDialog(null);
  };

  const handleCancel = () => {
    if (dialog?.resolve) {
      dialog.resolve(false);
    }
    setDialog(null);
  };

  // Keyboard navigation: Escape cancels, Enter confirms
  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        // Only trigger on Enter if not focused on cancel button
        if (document.activeElement?.getAttribute('data-dialog-cancel')) {
          handleCancel();
        } else {
          e.preventDefault();
          handleConfirm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Auto focus confirm button on mount
    const timer = setTimeout(() => {
      if (confirmButtonRef.current) {
        confirmButtonRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [dialog]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (dialog) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [dialog]);

  // Determine icon & color theme based on variant
  const getVariantStyles = (variant, iconType) => {
    switch (variant) {
      case 'warning':
        return {
          iconBadge: 'bg-amber-500/15 border-amber-500/30 text-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.2)]',
          Icon: AlertTriangle,
          confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md shadow-amber-950/30 hover:scale-[1.02]',
        };
      case 'report':
        return {
          iconBadge: 'bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.2)]',
          Icon: ShieldAlert,
          confirmBtn: 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-950/30 hover:scale-[1.02]',
        };
      case 'reset':
        return {
          iconBadge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.2)]',
          Icon: RotateCcw,
          confirmBtn: 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black shadow-md shadow-cyan-950/30 hover:scale-[1.02]',
        };
      case 'info':
        return {
          iconBadge: 'bg-sky-500/15 border-sky-500/30 text-sky-400 shadow-[0_0_24px_rgba(14,165,233,0.2)]',
          Icon: HelpCircle,
          confirmBtn: 'bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-md shadow-sky-950/30 hover:scale-[1.02]',
        };
      case 'danger':
      default:
        return {
          iconBadge: 'bg-rose-500/15 border-rose-500/30 text-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.2)]',
          Icon: iconType === 'octagon' ? AlertOctagon : Trash2,
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-950/40 hover:scale-[1.02]',
        };
    }
  };

  const styles = dialog ? getVariantStyles(dialog.variant, dialog.icon) : null;
  const DialogIcon = styles?.Icon || Trash2;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Global Confirmation Modal Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans select-none animate-fade-in">
          {/* Glass Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={handleCancel}
          />

          {/* Modal Container */}
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            className="relative w-full max-w-[360px] sm:max-w-[400px] rounded-3xl bg-white dark:bg-[#15181e] border border-neutral-200 dark:border-neutral-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-7 z-10 flex flex-col gap-5 animate-scale-in"
          >
            {/* Top Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Icon & Heading Header */}
            <div className="flex items-start gap-4 pr-6">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${styles.iconBadge}`}
              >
                <DialogIcon size={22} strokeWidth={2.3} />
              </div>

              <div className="space-y-1.5 min-w-0 flex-1 pt-0.5">
                <h3
                  id="confirm-dialog-title"
                  className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight leading-snug"
                >
                  {dialog.title}
                </h3>
                <p
                  id="confirm-dialog-desc"
                  className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal"
                >
                  {dialog.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                data-dialog-cancel="true"
                onClick={handleCancel}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer active:scale-95 text-center"
              >
                {dialog.cancelText}
              </button>

              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5 ${styles.confirmBtn}`}
              >
                <span>{dialog.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export default ConfirmContext;
