import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, Lock, User, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

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
      showToast('Welcome back to Course 518!', 'success');
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Pulse<span className="text-indigo-500">518</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Private Course Social Community for CS-518
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Username or Course Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="nasir or nasir@course518.edu"
                  required
                  className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-3"
              disabled={loading}
              isLoading={loading}
            >
              <span>Sign In to Class</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Credentials for Fast Testing */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 block text-center">
              Quick 1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('nasir', 'password123')}
                className="p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-indigo-400">
                  👤 Nasir
                </div>
                <div className="text-[10px] text-zinc-400">Student Account</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dr_vance', 'admin123')}
                className="p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-amber-300 group-hover:text-amber-200">
                  ★ Dr. Vance
                </div>
                <div className="text-[10px] text-zinc-400">Instructor Admin</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-zinc-400">
          Enrolled student but don't have an account?{' '}
          <NavLink to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Join with Course Code
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
