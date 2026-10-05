import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { showToast } = useNotifications();

  const [step, setStep] = useState(1); // 1 = Request code, 2 = Enter code & new password
  const [loginId, setLoginId] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeHint, setCodeHint] = useState('');

  const resetState = () => {
    setStep(1);
    setLoginId('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError('');
    setCodeHint('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Step 1: Request reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginId.trim()) {
      setError('Please enter your username or email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        loginId: loginId.trim(),
      });

      const generatedCode = res.data.resetCode;
      setCodeHint(generatedCode);
      setResetCode(generatedCode); // Auto-fill for seamless user experience
      setStep(2);
      showToast(`Reset code generated for @${res.data.username}!`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request reset code. Please check your username or email.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetCode.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        loginId: loginId.trim(),
        resetCode: resetCode.trim(),
        newPassword,
        confirmPassword,
      });

      // If token and user are returned, automatically authenticate
      if (res.data.token && res.data.user) {
        localStorage.setItem('pulse518_token', res.data.token);
        localStorage.setItem('pulse518_user', JSON.stringify(res.data.user));
        if (updateUser) updateUser(res.data.user);
      }

      showToast('Password reset successfully! Welcome back.', 'success');
      handleClose();
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired code. Please verify the code or use the course key.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Find Your Account' : 'Choose New Password'}
    >
      <div className="space-y-4 font-sans py-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Identifier Input */
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Enter the username or email address associated with your Clearfeed account to reset your password.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. nasir or user@example.com"
                  required
                  autoFocus
                  className="w-full bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading || !loginId.trim()}
                isLoading={loading}
                className="px-5 py-2 font-bold text-xs shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        ) : (
          /* Step 2: Code & New Password */
          <form onSubmit={handleResetPassword} className="space-y-4">
            {codeHint && (
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/80 dark:border-sky-500/20 text-xs text-sky-800 dark:text-sky-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Verification Code Ready</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your 6-digit code is <strong className="font-mono text-sm tracking-wider px-1.5 py-0.5 rounded bg-sky-200/60 dark:bg-sky-500/20">{codeHint}</strong>. (You can also use the course key <code className="font-mono font-bold">CS518-2026</code>).
                </p>
              </div>
            )}

            {/* Reset Code Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                6-Digit Reset Code or Course Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 123456 or CS518-2026"
                  required
                  className="w-full bg-neutral-100 dark:bg-[#16181c] font-mono text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                New Password <span className="text-[11px] text-neutral-400 font-normal">(min 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="w-full bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  className="w-full bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-neutral-500 hover:text-sky-500 font-medium cursor-pointer"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  isLoading={loading}
                  className="px-5 py-2 font-bold text-xs shadow-xs"
                >
                  Reset Password
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
