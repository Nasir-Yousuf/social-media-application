import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ClearfeedLogo } from '../components/common/ClearfeedIcons';
import ThemeToggle from '../components/common/ThemeToggle';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!loginId.trim() || !password) {
      setError('Please provide your username or email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginId.trim(), password);
      showToast('Welcome back to Clearfeed!', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoId, demoPass) => {
    setLoginId(demoId);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-4 relative font-sans transition-colors duration-200">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 mb-1 transition-transform hover:scale-110 duration-200">
            <ClearfeedLogo className="w-12 h-12 text-sky-500 drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Clear<span className="text-sky-500">feed</span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-serif italic">
            "Unfiltered. Chronological. Yours."
          </p>
        </div>

        {/* Login Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="nasir or your email"
                  required
                  className="w-full bg-neutral-50 dark:bg-black/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-50 dark:bg-black/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-2.5 font-bold shadow-md shadow-sky-500/20"
              disabled={loading}
              isLoading={loading}
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 block text-center uppercase tracking-wider">
              Quick Test Sign-in
            </span>
            <div>
              <button
                type="button"
                onClick={() => handleQuickLogin('nasir', 'password123')}
                className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-black/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs transition-all duration-150 cursor-pointer group active:scale-95"
              >
                <div className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-sky-500 transition-colors">
                  Nasir
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">@nasir · 1-click test</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Don't have an account?{' '}
          <NavLink
            to="/register"
            className="text-sky-500 hover:text-sky-400 hover:underline font-semibold"
          >
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
