import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);

  // Avatar presets using Dicebear seeds
  const avatarPresets = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=sparkle`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=cyber`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=nexus`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=quantum`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=alpha`,
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await api.patch('/users/profile', {
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      updateUser(res.data.user);
      showToast('Profile updated successfully!', 'success');
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Avatar Preview & Quick Presets */}
        <div className="flex flex-col items-center gap-3 py-2 border-b border-zinc-800/80">
          <Avatar src={avatarUrl} name={name} size="lg" />
          <div className="flex items-center gap-2">
            {avatarPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(preset)}
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                  avatarUrl === preset ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-zinc-700'
                }`}
              >
                <img src={preset} alt="preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <span className="text-[11px] text-zinc-400">Choose an avatar preset or enter a custom URL below</span>
        </div>

        {/* Custom Avatar URL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Avatar Image URL</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="w-full bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="w-full bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-zinc-300">Bio</label>
            <span className="text-[11px] text-zinc-400">{160 - bio.length} left</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            placeholder="Share your interests, course goals, or tech stack..."
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
