import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, Lock, User, Mail, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    inviteCode: 'CS518-2026', // Pre-fill or leave as hint
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        inviteCode: formData.inviteCode.trim(),
        bio: formData.bio.trim() || 'CS-518 student exploring modern full-stack development.',
      });

      showToast('Registration complete! Welcome to CS-518.', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Check the course invite code.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 py-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Join Pulse<span className="text-indigo-500">518</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Private Course Enrollment for CS-518
          </p>
        </div>

        {/* Register Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Registration is restricted to verified CS-518 course students.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Miller"
                  required
                  className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">
                  @
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="alex_m"
                  required
                  className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@course518.edu"
                  required
                  className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Course Passcode (Required)
                </label>
                <span className="text-[10px] text-indigo-400 font-mono">Code: CS518-2026</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  placeholder="CS518-2026"
                  required
                  className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500 uppercase tracking-wider font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Short Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="What are your technical interests in CS-518?"
                rows={2}
                maxLength={160}
                className="w-full bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 p-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-2.5 mt-2"
              disabled={loading}
              isLoading={loading}
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-zinc-400">
          Already registered?{' '}
          <NavLink to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign In here
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
