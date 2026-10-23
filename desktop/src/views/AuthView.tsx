import React, { useState } from 'react';
import { Lock, User as UserIcon, Mail, Key, Shield, Radio, ArrowRight, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onContinueOffline: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onContinueOffline }) => {
  const { login, register, loginGuest } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Register fields
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [coursePasscode, setCoursePasscode] = useState<string>('CS518-2026');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [guestLoading, setGuestLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login({ usernameOrEmail, password });
        if (!res.success) {
          setError(res.message || 'Login failed.');
        }
      } else {
        const res = await register({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          studentId: studentId.trim() || undefined,
          coursePasscode: coursePasscode.trim(),
        });
        if (!res.success) {
          setError(res.message || 'Registration failed.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setGuestLoading(true);
    try {
      const res = await loginGuest();
      if (!res.success) {
        setError(res.message || 'Failed to enter as guest.');
      }
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-6 bg-neutral-950">
      <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-neutral-100">
            {mode === 'login' ? 'Sign in to Clearfeed' : 'Join Course Cohort'}
          </h1>
          <p className="text-xs text-neutral-400">
            Private academic social network and real-time messaging
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-neutral-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300">Course Passcode</label>
                <input
                  type="text"
                  required
                  value={coursePasscode}
                  onChange={(e) => setCoursePasscode(e.target.value)}
                  placeholder="CS518-2026"
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 font-mono text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-neutral-300">
              {mode === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <input
              type="text"
              required
              value={mode === 'login' ? usernameOrEmail : username}
              onChange={(e) =>
                mode === 'login'
                  ? setUsernameOrEmail(e.target.value)
                  : setUsername(e.target.value)
              }
              placeholder={mode === 'login' ? 'username or student@university.edu' : 'alex_r'}
              className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer mt-2"
          >
            {submitting
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In to Account'
              : 'Create Cohort Account'}
          </button>
        </form>

        {/* Guest Mode Option */}
        <div className="space-y-3 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-neutral-900 px-3 text-[10px] uppercase tracking-wider font-semibold text-neutral-500 shrink-0">
              or
            </span>
            <div className="border-t border-neutral-800 w-full" />
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading || submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 border border-neutral-700/60 transition cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>{guestLoading ? 'Entering as Guest...' : 'Continue as Guest'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
          <span>
            {mode === 'login' ? "Don't have an account?" : 'Already registered?'}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-sky-400 hover:underline font-semibold cursor-pointer"
          >
            {mode === 'login' ? 'Register with passkey' : 'Sign in'}
          </button>
        </div>

        {/* Clearfeed Mesh Offline Bypass */}
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-300">Clearfeed Mesh</p>
              <p className="text-[10px] text-emerald-400/80">Connect nearby. Communicate offline.</p>
            </div>
          </div>
          <button
            onClick={onContinueOffline}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Open Mesh <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
