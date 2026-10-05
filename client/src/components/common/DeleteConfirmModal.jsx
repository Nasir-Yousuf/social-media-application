import React, { useEffect } from 'react';
import TwitterSpinner from './TwitterSpinner';

/**
 * Twitter/X style confirmation modal for deletions
 */
export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete post?',
  description = "This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.",
  confirmLabel = 'Delete',
  isDeleting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Twitter-style Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[320px] rounded-3xl bg-white dark:bg-[#181b20] border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 z-10 flex flex-col gap-4 animate-scale-in"
      >
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight font-sans">
            {title}
          </h3>
          <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <TwitterSpinner size="sm" className="text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 active:scale-[0.98] text-neutral-800 dark:text-neutral-200 font-bold text-sm transition-all duration-150 cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
