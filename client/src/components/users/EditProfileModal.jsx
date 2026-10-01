import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [status, setStatus] = useState(user?.status || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [loading, setLoading] = useState(false);

  // Resize and compress chosen image to 128x128 JPEG <= 100KB using Canvas
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Center crop and draw into square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        // Compress to JPEG with 0.85 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        // Check binary size
        const head = 'data:image/jpeg;base64,';
        const rawLength = Math.round(((compressedBase64.length - head.length) * 3) / 4);

        if (rawLength > 100 * 1024) {
          showToast('Image could not be compressed below 100KB. Try a smaller file.', 'error');
          return;
        }

        setAvatarPreview(compressedBase64);
        setAvatarBase64(compressedBase64);
        showToast(`Image optimized (${Math.round(rawLength / 1024)} KB)`, 'info');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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

      if (avatarBase64) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
        {/* Avatar Upload with 100KB Client Compression */}
        <div className="flex flex-col items-center gap-3 py-2 border-b cf-border">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar src={avatarPreview} name={name} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[var(--color-cf-accent)] hover:underline flex items-center gap-1.5 cursor-pointer mx-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload photo (auto-compressed ≤ 100KB)</span>
            </button>
            <span className="text-[11px] cf-text-muted mt-0.5 block">
              JPG, PNG, or WebP. Stored locally in MongoDB database.
            </span>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold cf-text mb-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="w-full cf-bg px-3.5 py-2 rounded-lg border cf-border cf-text placeholder:cf-text-muted text-sm focus:outline-none cf-focus-ring"
          />
        </div>

        {/* Status / Mood */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold cf-text">Current Status</label>
            <span className="text-[11px] cf-text-muted">{60 - status.length}</span>
          </div>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            maxLength={60}
            placeholder="e.g. 🔨 Building a compiler, 📚 Reading Clean Code"
            className="w-full cf-bg px-3.5 py-2 rounded-lg border cf-border cf-text placeholder:cf-text-muted text-sm focus:outline-none cf-focus-ring"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold cf-text">Bio</label>
            <span className="text-[11px] cf-text-muted">{160 - bio.length}</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            className="w-full cf-bg p-3 rounded-lg border cf-border cf-text placeholder:cf-text-muted text-sm focus:outline-none cf-focus-ring resize-none leading-relaxed font-serif"
            placeholder="A brief intro about what you think about and build..."
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t cf-border">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={loading}
            className="px-5 py-1.5"
          >
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
