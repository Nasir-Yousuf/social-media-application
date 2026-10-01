import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} rounded-xl cf-bg border cf-border shadow-xl p-6 z-10 overflow-hidden max-h-[90vh] flex flex-col animate-fade-in`}
      >
        <div className="flex items-center justify-between pb-3 border-b cf-border mb-4">
          <button
            onClick={onClose}
            className="cf-text-muted hover:cf-text p-2 rounded-lg hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold cf-text flex-1 ml-3 font-sans">{title}</h3>
        </div>
        <div className="overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
