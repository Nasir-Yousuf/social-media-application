import React, { useState } from 'react';
import { Shield, Download, Smartphone, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const PrivacySettingsModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { showToast } = useNotifications();

  const [isExporting, setIsExporting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await api.get('/users/me/export-data');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clearfeed-data-export-${user?.username || 'user'}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Personal data archive downloaded successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to export data.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Log out of all devices? This will invalidate all your sessions across Web, Android, and Windows immediately.')) {
      return;
    }
    setIsRevoking(true);
    try {
      await api.post('/auth/logout-all');
      showToast('All active sessions have been invalidated.', 'success');
      onClose();
      logout();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to revoke sessions.', 'error');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your current password to confirm deletion.');
      return;
    }
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.delete('/users/me', { data: { password: deletePassword.trim() } });
      showToast('Your account has been permanently deleted.', 'info');
      onClose();
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy & Data Ownership">
      <div className="space-y-4 py-2">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Clearfeed gives you complete sovereignty over your data under GDPR and Right to be Forgotten standards.
        </p>

        {/* Export Data */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-sky-500" />
              Download My Data (JSON Export)
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Full archive of your profile, posts, snippets, Learn progress, and bookmarks.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportData}
            disabled={isExporting}
            className="shrink-0 text-xs font-semibold"
          >
            {isExporting ? 'Exporting...' : 'Export JSON'}
          </Button>
        </div>

        {/* Log Out All Devices */}
        <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-500" />
              Log Out of All Devices
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Invalidate active JWT tokens across all phones, tablets, and computers.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogoutAll}
            disabled={isRevoking}
            className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          >
            {isRevoking ? 'Revoking...' : 'Revoke All'}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Delete Account (Permanent)
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Right to be Forgotten: permanently erase profile, posts, and learning progress.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Permanent Deletion</span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                This will irreversibly delete all your posts, comments, bookmarks, and learning records. Enter your current password to proceed:
              </p>
              {deleteError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{deleteError}</p>
              )}
              <input
                type="password"
                placeholder="Account password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PrivacySettingsModal;