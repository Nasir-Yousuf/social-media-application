import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Globe,
  Bell,
  Keyboard,
  Radio,
  Trash2,
  LogOut,
  Info,
  Shield,
  Check,
  Server,
  Download,
  Smartphone,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMesh } from '../mesh/context/MeshContext';
import { PRODUCTION_BACKEND_URL, LOCAL_BACKEND_URL, getBaseUrl, api } from '../api/client';

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout, checkAuth } = useAuth();
  const { identity, settings: meshSettings, updateSettings, clearAllData } = useMesh();

  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('pulse518_api_url') || getBaseUrl();
  });
  const [savedApiNotice, setSavedApiNotice] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [showPreviews, setShowPreviews] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [showDeleteBox, setShowDeleteBox] = useState<boolean>(false);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [privacyMessage, setPrivacyMessage] = useState<string>('');

  const handleExportData = async () => {
    setIsExporting(true);
    setPrivacyMessage('');
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
      setPrivacyMessage('Data export downloaded successfully.');
      setTimeout(() => setPrivacyMessage(''), 3000);
    } catch (err: any) {
      setPrivacyMessage(err.response?.data?.message || err.message || 'Failed to export data.');
      setTimeout(() => setPrivacyMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Log out of all devices? This will invalidate all your sessions across Windows, Web, and Android immediately.')) {
      return;
    }
    setIsRevoking(true);
    try {
      await api.post('/auth/logout-all');
      alert('All active sessions have been invalidated across all devices.');
      logout();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to revoke sessions.');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Password is required to confirm account deletion.');
      return;
    }
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.delete('/users/me', { data: { password: deletePassword.trim() } });
      alert('Your Clearfeed account and all associated personal data have been permanently deleted.');
      logout();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveApiUrl = (url: string) => {
    const trimmed = url.trim();
    setApiUrl(trimmed);
    localStorage.setItem('pulse518_api_url', trimmed);
    setSavedApiNotice(true);
    checkAuth();
    setTimeout(() => setSavedApiNotice(false), 2500);
  };

  const handleResetApiUrl = () => {
    localStorage.removeItem('pulse518_api_url');
    setApiUrl(getBaseUrl());
    setSavedApiNotice(true);
    checkAuth();
    setTimeout(() => setSavedApiNotice(false), 2500);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-sky-400" />
          Desktop Settings & Preferences
        </h2>
        <p className="text-xs text-neutral-400">
          Configure appearance, backend endpoints, keyboard shortcuts, and Clearfeed Mesh offline controls.
        </p>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
          <Moon className="w-4 h-4 text-sky-400" />
          Appearance & Themes
        </div>
        <p className="text-xs text-neutral-400">
          Tailor your desktop environment with curated high-contrast or low-strain palettes.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'dark', label: 'Dark (Lights Out)', color: '#000000', border: 'border-neutral-800' },
            { id: 'dim', label: 'Dim Navy', color: '#15202b', border: 'border-blue-900/60' },
            { id: 'emerald', label: 'Hacker Emerald', color: '#080f0c', border: 'border-emerald-900/60' },
            { id: 'light', label: 'Crisp Light', color: '#ffffff', border: 'border-neutral-300' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id as ThemeMode)}
              className={`p-3.5 rounded-xl border flex flex-col justify-between h-20 transition text-left cursor-pointer ${
                theme === item.id
                  ? 'border-sky-500 ring-2 ring-sky-500/20 bg-neutral-950'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-4 h-4 rounded-full border border-neutral-700" style={{ backgroundColor: item.color }} />
                {theme === item.id && <Check className="w-4 h-4 text-sky-400" />}
              </div>
              <span className="text-xs font-semibold text-neutral-200">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Backend & API Endpoint */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <Server className="w-4 h-4 text-sky-400" />
            Clearfeed Backend API Endpoint
          </div>
          {savedApiNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Endpoint Updated
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-400">
          Switch between production cloud backend and local development servers without rebuilding the binary.
        </p>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSaveApiUrl(PRODUCTION_BACKEND_URL)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                apiUrl === PRODUCTION_BACKEND_URL
                  ? 'bg-sky-500 text-white'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              Railway Cloud (Production)
            </button>
            <button
              onClick={() => handleSaveApiUrl(LOCAL_BACKEND_URL)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                apiUrl === LOCAL_BACKEND_URL
                  ? 'bg-sky-500 text-white'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              Local Server (http://localhost:5180/api)
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="Custom API URL..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => handleSaveApiUrl(apiUrl)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Apply
            </button>
            <button
              onClick={handleResetApiUrl}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 3. Notifications & Privacy */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
          <Bell className="w-4 h-4 text-sky-400" />
          Notifications & Privacy
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
            <div>
              <p className="font-semibold text-neutral-200">Desktop Notifications</p>
              <p className="text-[11px] text-neutral-400">Receive alert when messages and mentions arrive.</p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="rounded text-sky-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-neutral-300 cursor-pointer">
            <div>
              <p className="font-semibold text-neutral-200">Show Message Previews</p>
              <p className="text-[11px] text-neutral-400">Display message text in desktop alert banners.</p>
            </div>
            <input
              type="checkbox"
              checked={showPreviews}
              onChange={(e) => setShowPreviews(e.target.checked)}
              className="rounded text-sky-500 focus:ring-0"
            />
          </label>
        </div>
      </div>

      {/* 4. Keyboard Shortcuts */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
          <Keyboard className="w-4 h-4 text-sky-400" />
          Desktop Keyboard Shortcuts
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {[
            { key: 'Ctrl + K', desc: 'Focus Search / Command Palette' },
            { key: 'Ctrl + N', desc: 'New Message / Post Composer' },
            { key: 'Ctrl + M', desc: 'Quick Switch to Clearfeed Mesh' },
            { key: 'Ctrl + B', desc: 'Toggle Sidebar Collapse' },
            { key: 'Ctrl + ,', desc: 'Open Settings' },
            { key: 'Esc', desc: 'Close dialogs or clear focus' },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-800/80"
            >
              <span className="text-neutral-400">{item.desc}</span>
              <kbd className="px-2 py-0.5 bg-neutral-800 text-neutral-200 font-mono text-[11px] rounded border border-neutral-700">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Clearfeed Mesh Offline Controls */}
      <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
          <Radio className="w-4 h-4 text-emerald-400" />
          Clearfeed Mesh Offline Storage & Controls
        </div>
        <p className="text-xs text-emerald-400/80">
          Mesh data is stored strictly on this device and is independent of your cloud account.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300">Local Ed25519 Identity</span>
            <span className="font-mono text-[11px] text-emerald-400">
              {identity?.publicKeyHex.substring(0, 16)}...
            </span>
          </div>

          <button
            onClick={clearAllData}
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge All Local Mesh Data
          </button>
        </div>
      </div>

      {/* 6. Privacy & Data Ownership */}
      {user && (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <Shield className="w-4 h-4 text-sky-400" />
            Privacy & Data Ownership
          </div>
          <p className="text-xs text-neutral-400">
            Export your entire personal archive, invalidate active sessions across all devices, or delete your account under GDPR / Right to be Forgotten.
          </p>

          {privacyMessage && (
            <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl text-xs text-sky-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-sky-400" />
              {privacyMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Download Data Archive */}
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="p-3.5 bg-neutral-950/50 hover:bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-center justify-between transition cursor-pointer text-left"
            >
              <div>
                <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  {isExporting ? 'Preparing Archive...' : 'Download My Data (JSON)'}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Full export of posts, code snippets, progress & bookmarks
                </div>
              </div>
            </button>

            {/* Invalidate All Sessions */}
            <button
              onClick={handleLogoutAll}
              disabled={isRevoking}
              className="p-3.5 bg-neutral-950/50 hover:bg-neutral-950 border border-amber-900/40 hover:border-amber-700/60 rounded-xl flex items-center justify-between transition cursor-pointer text-left"
            >
              <div>
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  {isRevoking ? 'Revoking...' : 'Log Out of All Devices'}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Invalidate all sessions across Web, Android, and Windows
                </div>
              </div>
            </button>
          </div>

          {/* Account Deletion Accordion */}
          <div className="pt-2">
            {!showDeleteBox ? (
              <button
                onClick={() => setShowDeleteBox(true)}
                className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account (Permanent Right to be Forgotten)
              </button>
            ) : (
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Confirm Permanent Account Deletion
                </div>
                <p className="text-[11px] text-neutral-400">
                  This action is permanent and cannot be undone. All your posts, comments, learning progress, and personal data will be completely deleted.
                </p>
                {deleteError && (
                  <p className="text-xs text-rose-400 font-semibold">{deleteError}</p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteBox(false);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Hardware & Network Diagnostics */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <Activity className="w-4 h-4 text-emerald-400" />
            System Diagnostics & Field Test Harness
          </div>
          <p className="text-xs text-neutral-400">
            Verify real microphone capture, WebRTC STUN/TURN ICE traversal, and Clearfeed Mesh (CFM1) physical peer pings.
          </p>
        </div>
        <button
          onClick={() => navigate('/diagnostics')}
          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2"
        >
          <Activity className="w-3.5 h-3.5" />
          Open Diagnostics
        </button>
      </div>

      {/* 8. Account & Application Info */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-neutral-200">Clearfeed Desktop</h4>
          <p className="text-[11px] text-neutral-500">
            Version 2.0.0 • Tauri 2 + Rust + React 19 Architecture
          </p>
        </div>

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Online Account
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
