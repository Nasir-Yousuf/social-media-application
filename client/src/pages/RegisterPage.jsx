import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { Lock, User, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ClearfeedLogo } from '../components/common/ClearfeedIcons';
import ThemeToggle from '../components/common/ThemeToggle';

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
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
        bio: formData.bio.trim() || 'Thinking, building, and exploring code.',
      });

      showToast('Account created! Welcome to Clearfeed.', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your information.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cf-bg cf-text flex flex-col items-center justify-center p-4 relative py-10 font-sans">
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
            Join Clear<span className="text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]">feed</span>
          </h1>
          <p className="text-sm cf-text-muted font-serif italic">
            "The anti-algorithm platform. Text. Code. Substance."
          </p>
        </div>

        {/* Register Card */}
        <div className="p-7 rounded-2xl cf-surface border cf-border shadow-md space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-cf-danger-soft)] text-[var(--color-cf-danger)] border border-[var(--color-cf-danger)]/25 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold cf-text mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 cf-text-muted" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ada Lovelace"
                  required
                  maxLength={50}
                  className="w-full cf-bg text-sm cf-text placeholder:cf-text-muted pl-10 pr-3.5 py-2.5 rounded-lg border cf-border focus:outline-none cf-focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold cf-text mb-1.5">Username</label>
              <div className="relative">
                <span className="text-sm font-semibold absolute left-3.5 top-1/2 -translate-y-1/2 cf-text-muted select-none">
                  @
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="adalovelace"
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full cf-bg text-sm cf-text placeholder:cf-text-muted pl-9 pr-3.5 py-2.5 rounded-lg border cf-border focus:outline-none cf-focus-ring lowercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold cf-text mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 cf-text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ada@example.com"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full cf-bg text-sm cf-text placeholder:cf-text-muted pl-10 pr-3.5 py-2.5 rounded-lg border cf-border focus:outline-none cf-focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold cf-text mb-1.5">Bio (Optional)</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="What do you build, write, or think about?"
                rows={2}
                maxLength={160}
                className="w-full cf-bg text-sm cf-text placeholder:cf-text-muted p-3 rounded-lg border cf-border focus:outline-none cf-focus-ring resize-none font-serif"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-2.5 font-bold mt-2"
              disabled={loading}
              isLoading={loading}
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-sm cf-text-muted">
          Already have an account?{' '}
          <NavLink
            to="/login"
            className="text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] hover:underline font-semibold"
          >
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
