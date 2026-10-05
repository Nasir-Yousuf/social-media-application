import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import TwitterSpinner from '../common/TwitterSpinner';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { showToast } = useNotifications();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password cannot be the same as your current password.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      showToast('Password changed successfully!', 'success');
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please verify your current password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans py-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Current Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-1"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            New Password <span className="text-[11px] text-neutral-400 font-normal">(min 6 characters)</span>
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              className="w-full bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-1"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              className="w-full bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-1"
              tabIndex={-1}
              title={showConfirm ? 'Hide password' : 'Show password'}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            isLoading={loading}
            className="px-5 py-2 font-bold text-xs shadow-xs"
          >
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
