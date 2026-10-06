import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Lock, User, Mail, AlertCircle, ArrowRight, Camera, Upload, Trash2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { ClearfeedLogo } from '../components/common/ClearfeedIcons';
import ThemeToggle from '../components/common/ThemeToggle';
import { compressAvatarImage } from '../utils/imageCompressor';

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = location.state?.from?.pathname || searchParams.get('redirect') || '/';
  const from = redirectTarget === '/login' || redirectTarget === '/register' ? '/' : redirectTarget;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    bio: '',
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [avatarSizeKB, setAvatarSizeKB] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    setCompressing(true);
    try {
      const result = await compressAvatarImage(file, {
        size: 256,
        maxSizeBytes: 200 * 1024, // 200KB limit
        initialQuality: 0.85,
      });

      setAvatarPreview(result.base64);
      setAvatarBase64(result.base64);
      setAvatarSizeKB(result.sizeKB);
      showToast(`Photo optimized (${result.sizeKB} KB) - under 200KB limit`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to compress image.', 'error');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarBase64('');
    setAvatarSizeKB(null);
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
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        bio: formData.bio.trim() || 'Thinking, building, and exploring code.',
      };

      if (avatarBase64) {
        payload.avatarBase64 = avatarBase64;
      }

      await register(payload);

      showToast('Account created! Welcome to Clearfeed.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your information.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-4 relative py-12 font-sans transition-colors duration-200">
      {/* Background ambient glow */}
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
            Join Clear<span className="text-sky-500">feed</span>
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-serif italic">
            "The anti-algorithm platform. Text. Code. Substance."
          </p>
        </div>

        {/* Register Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Optional Profile Photo Selector */}
            <div className="flex flex-col items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <div
                className="relative group cursor-pointer"
                onClick={() => !compressing && fileInputRef.current?.click()}
                title="Add profile photo (optional)"
              >
                {avatarPreview ? (
                  <div className="ring-3 ring-sky-500 rounded-full overflow-hidden inline-block shadow-sm">
                    <Avatar src={avatarPreview} name={formData.name || 'User'} size="xl" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center text-neutral-400 hover:text-sky-500 hover:border-sky-500 transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                )}

                <div className="absolute inset-0 rounded-full bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-semibold">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>{avatarPreview ? 'Change' : 'Add Photo'}</span>
                </div>

                {compressing && (
                  <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
                    Optimizing...
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleAvatarSelect}
                className="hidden"
              />

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sky-500 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>{avatarPreview ? 'Change photo' : 'Add profile photo (optional)'}</span>
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-rose-500 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {avatarSizeKB ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Optimized: {avatarSizeKB} KB (&le; 200 KB)</span>
                </span>
              ) : (
                <span className="text-[10px] text-neutral-400">
                  Auto-compressed to under 200 KB
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ada Lovelace"
                  required
                  maxLength={50}
                  className="w-full bg-neutral-50 dark:bg-black/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Username</label>
              <div className="relative">
                <span className="text-sm font-semibold absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 select-none">
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
                  className="w-full bg-neutral-50 dark:bg-black/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors lowercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ada@example.com"
                  required
                  className="w-full bg-neutral-50 dark:bg-black/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-neutral-50 dark:bg-black/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1 rounded-md cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Bio (Optional)</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="What do you build, write, or think about?"
                rows={2}
                maxLength={160}
                className="w-full bg-neutral-50 dark:bg-black/50 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 p-3 rounded-xl border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors resize-none font-serif"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-2.5 font-bold mt-2 shadow-md shadow-sky-500/20"
              disabled={loading}
              isLoading={loading}
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{' '}
          <NavLink
            to="/login"
            className="text-sky-500 hover:text-sky-400 hover:underline font-semibold"
          >
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
