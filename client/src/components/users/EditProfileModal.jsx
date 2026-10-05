import React, { useState, useRef } from 'react';
import { Upload, Camera, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { compressAvatarImage } from '../../utils/imageCompressor';

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarSizeKB, setAvatarSizeKB] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Resize and compress chosen image to 256x256 JPEG <= 200KB
  const handleFileSelect = async (e) => {
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
      setRemoveAvatar(false);
      setAvatarSizeKB(result.sizeKB);
      showToast(`Photo optimized (${result.sizeKB} KB) - under 200KB limit`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to compress image.', 'error');
    } finally {
      setCompressing(false);
      // Reset input value so re-selecting the same file fires onChange
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setRemoveAvatar(true);
    setAvatarBase64('');
    setAvatarSizeKB(null);
    const defaultDicebear = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      user?.username || 'user'
    )}&backgroundColor=1d9bf0,00ba7c,7856ff,f91880&textColor=ffffff&fontSize=40`;
    setAvatarPreview(defaultDicebear);
    showToast('Profile photo removed. Default initials avatar will be used.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        status: status.trim().slice(0, 60),
      };

      if (removeAvatar) {
        payload.removeAvatar = true;
      } else if (avatarBase64) {
        payload.avatarBase64 = avatarBase64;
      }

      const res = await api.patch('/users/profile', payload);

      updateUser(res.data.user);
      showToast('Profile updated!', 'success');
      if (onProfileUpdated) {
        onProfileUpdated(res.data.user);
      }
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasCustomPhoto =
    (user?.hasCustomAvatar && !removeAvatar) || Boolean(avatarBase64);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
        {/* Avatar Upload Area */}
        <div className="flex flex-col items-center gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <div
            className="relative group cursor-pointer"
            onClick={() => !compressing && fileInputRef.current?.click()}
            title="Click to choose a photo"
          >
            <div className="ring-4 ring-neutral-100 dark:ring-neutral-800 rounded-full overflow-hidden inline-block shadow-sm">
              <Avatar src={avatarPreview} name={name} size="2xl" />
            </div>

            <div className="absolute inset-0 rounded-full bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold">
              <Camera className="w-6 h-6 mb-1" />
              <span>Change</span>
            </div>

            {compressing && (
              <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center text-white text-xs font-bold animate-pulse">
                Optimizing...
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action buttons for Avatar */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={compressing}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{hasCustomPhoto ? 'Upload new photo' : 'Upload photo'}</span>
            </button>

            {hasCustomPhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={compressing}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {/* Size / Status Badge */}
          <div className="text-center">
            {avatarSizeKB ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Compressed: {avatarSizeKB} KB (Limit: 200 KB)</span>
              </span>
            ) : (
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Auto-compressed to &le; 200 KB &bull; JPG, PNG, or WebP &bull; MongoDB safe
              </span>
            )}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="w-full bg-neutral-50 dark:bg-black/50 px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Status / Mood */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Current Status
            </label>
            <span className="text-[11px] text-neutral-400">{60 - status.length}</span>
          </div>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            maxLength={60}
            placeholder="e.g. 🔨 Building a compiler, 📚 Reading Clean Code"
            className="w-full bg-neutral-50 dark:bg-black/50 px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Bio
            </label>
            <span className="text-[11px] text-neutral-400">{160 - bio.length}</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            className="w-full bg-neutral-50 dark:bg-black/50 p-3 rounded-xl border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors resize-none leading-relaxed font-sans"
            placeholder="A brief intro about what you think about and build..."
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading || compressing}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
            disabled={compressing}
            className="px-5 py-1.5 font-bold"
          >
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
