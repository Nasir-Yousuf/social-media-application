import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';

export const EditPostModal = ({ isOpen, onClose, post, onPostUpdated }) => {
  const [content, setContent] = useState(post?.content || '');
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotifications();

  const MAX_CHARS = 280;
  const remaining = MAX_CHARS - content.length;
  const isValid = content.trim().length > 0 && remaining >= 0;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    try {
      const res = await api.patch(`/posts/${post._id}`, { content: content.trim() });
      showToast('Post updated successfully', 'success');
      if (onPostUpdated) {
        onPostUpdated(res.data.post);
      }
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={MAX_CHARS}
          className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-sm leading-relaxed"
          placeholder="Edit your post content..."
        />

        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-mono ${
              remaining < 20 ? 'text-amber-400 font-semibold' : 'text-zinc-500'
            }`}
          >
            {remaining} characters left
          </span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!isValid || loading}
              isLoading={loading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditPostModal;
