import React, { useState } from 'react';
import { Send, Megaphone, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import api from '../../api/client';

export const PostComposer = ({ onPostCreated, compact = false }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();
  const [content, setContent] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [loading, setLoading] = useState(false);

  const MAX_CHARS = 280;
  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isValid = content.trim().length > 0 && !isOverLimit;

  // Character percentage for circle stroke
  const charPercent = Math.min(100, Math.max(0, (content.length / MAX_CHARS) * 100));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    try {
      const res = await api.post('/posts', {
        content: content.trim(),
        isAnnouncement: isAdmin ? isAnnouncement : false,
      });

      setContent('');
      setIsAnnouncement(false);
      showToast(isAnnouncement ? 'Course announcement broadcasted!' : 'Post shared with Course 518!', 'success');

      if (onPostCreated) {
        onPostCreated(res.data.post);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`border-b border-zinc-800/80 p-4 transition-colors ${compact ? 'p-1 border-0' : 'bg-zinc-950/40'}`}>
      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} name={user?.name} size="md" showRoleBadge={true} role={user?.role} />

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isAdmin
                ? "Share a lecture note, assignment update, or thought with Course 518..."
                : "What are you studying or building in Course 518? (React, databases, labs...)"
            }
            rows={compact ? 3 : 3}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm md:text-base resize-none focus:outline-none leading-relaxed"
          />

          {/* Admin Announcement Toggle */}
          {isAdmin && (
            <div className="flex items-center gap-2 py-2 mb-2 border-t border-zinc-800/60 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-amber-400 hover:text-amber-300">
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={(e) => setIsAnnouncement(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                />
                <Megaphone className="w-3.5 h-3.5" />
                <span className="font-semibold">Broadcast as Course Announcement</span>
              </label>
            </div>
          )}

          {/* Bottom Bar: Character Counter & Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            <div className="flex items-center gap-3">
              {/* Radial or numerical progress */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <svg className="w-5 h-5 -rotate-90">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-zinc-800"
                      fill="none"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeDasharray={50.2}
                      strokeDashoffset={50.2 - (50.2 * charPercent) / 100}
                      className={
                        remaining < 0
                          ? 'text-rose-500'
                          : remaining < 20
                          ? 'text-amber-500'
                          : 'text-indigo-500'
                      }
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span
                  className={
                    remaining < 0
                      ? 'text-rose-400 font-bold'
                      : remaining < 20
                      ? 'text-amber-400'
                      : 'text-zinc-400'
                  }
                >
                  {remaining}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={!isValid || loading}
              isLoading={loading}
              onClick={handleSubmit}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
