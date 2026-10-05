import React, { useState } from 'react';
import api from '../../api/client';
import { BookmarkIcon } from '../common/ClearfeedIcons';
import { useNotifications } from '../../context/NotificationContext';

export const BookmarkButton = ({ postId, initialIsBookmarked = false, className = '' }) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotifications();

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    if (loading) return;

    // Optimistic update
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    setLoading(true);

    try {
      const res = await api.post(`/posts/${postId}/bookmark`);
      setIsBookmarked(res.data.isBookmarked);
      showToast(res.data.isBookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks', 'info');
    } catch (err) {
      setIsBookmarked(previous);
      showToast('Failed to update bookmark', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading}
      title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
      className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-150 active:scale-90 cursor-pointer ${
        isBookmarked
          ? 'text-sky-500 hover:bg-sky-500/10'
          : 'text-neutral-400 hover:text-sky-500 hover:bg-sky-500/10'
      } ${className}`}
      aria-label="Bookmark post"
    >
      <BookmarkIcon className="w-4 h-4" filled={isBookmarked} />
    </button>
  );
};

export default BookmarkButton;
