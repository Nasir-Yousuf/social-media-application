import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMesh } from '../mesh/context/MeshContext';
import { PRODUCTION_BACKEND_URL, LOCAL_BACKEND_URL, getBaseUrl } from '../api/client';

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout, checkAuth } = useAuth();
  const { identity, settings: meshSettings, updateSettings, clearAllData } = useMesh();

  const [apiUrl, setApiUrl] = useState<string>(() => {
    return localStorage.getItem('pulse518_api_url') || getBaseUrl();
  });
  const [savedApiNotice, setSavedApiNotice] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [showPreviews, setShowPreviews] = useState<boolean>(true);

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

      {/* 6. Account & Application Info */}
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
