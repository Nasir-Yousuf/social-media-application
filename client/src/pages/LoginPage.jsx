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
    <div className="min-h-screen cf-bg cf-text flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 mb-1">
            <ClearfeedLogo className="w-12 h-12 text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight cf-text">
            Clear<span className="text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]">feed</span>
          </h1>
          <p className="text-sm cf-text-muted font-serif italic">
            "Unfiltered. Chronological. Yours."
          </p>
        </div>

        {/* Login Card */}
        <div className="p-7 rounded-2xl cf-surface border cf-border shadow-md space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-cf-danger-soft)] text-[var(--color-cf-danger)] border border-[var(--color-cf-danger)]/25 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold cf-text mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 cf-text-muted" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="nasir or your email"
                  required
                  className="w-full cf-bg text-sm cf-text placeholder:cf-text-muted pl-10 pr-3.5 py-2.5 rounded-lg border cf-border focus:outline-none cf-focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold cf-text mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 cf-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full cf-bg text-sm cf-text placeholder:cf-text-muted pl-10 pr-3.5 py-2.5 rounded-lg border cf-border focus:outline-none cf-focus-ring"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-2.5 font-bold"
              disabled={loading}
              isLoading={loading}
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t cf-border space-y-2">
            <span className="text-[10px] font-bold cf-text-muted block text-center uppercase tracking-wider">
              1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('nasir', 'password123')}
                className="p-3 rounded-lg cf-bg hover:bg-[var(--color-cf-elevated)] border cf-border text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold cf-text group-hover:text-[var(--color-cf-accent)]">
                  Nasir
                </div>
                <div className="text-[11px] cf-text-muted">Member</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dr_vance', 'admin123')}
                className="p-3 rounded-lg cf-bg hover:bg-[var(--color-cf-elevated)] border cf-border text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-[var(--color-cf-amber)]">
                  ★ Dr. Vance
                </div>
                <div className="text-[11px] cf-text-muted">Admin</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-sm cf-text-muted">
          Don't have an account?{' '}
          <NavLink
            to="/register"
            className="text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] hover:underline font-semibold"
          >
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
