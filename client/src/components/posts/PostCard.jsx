import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Edit3,
  Trash2,
  Megaphone,
  Pin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import CommentsSection from './CommentsSection';
import EditPostModal from './EditPostModal';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [currentPost, setCurrentPost] = useState(post);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const author = currentPost.author || {};
  const isOwner = user && author._id === user._id;
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  const handleLikeToggle = async () => {
    // Optimistic UI update
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      setAnimatingHeart(true);
      setTimeout(() => setAnimatingHeart(false), 400);
    }

    try {
      const res = await api.post(`/posts/${currentPost._id}/like`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      // Revert on error
      setIsLiked(!nextLiked);
      setLikesCount(likesCount);
      showToast('Could not update like', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${currentPost._id}`);
      showToast('Post deleted', 'info');
      if (onPostDeleted) {
        onPostDeleted(currentPost._id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete post', 'error');
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/#post-${currentPost._id}`;
    navigator.clipboard.writeText(postUrl);
    showToast('Post link copied to clipboard!', 'success');
  };

  const handlePostUpdated = (updated) => {
    setCurrentPost((prev) => ({ ...prev, ...updated }));
    if (onPostUpdated) {
      onPostUpdated(updated);
    }
  };

  return (
    <article
      id={`post-${currentPost._id}`}
      className={`border-b border-zinc-800/80 p-4 md:p-5 transition-colors hover:bg-zinc-900/30 ${
        currentPost.isAnnouncement
          ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500'
          : ''
      }`}
    >
      {/* Top Banner if Announcement or Pinned */}
      {(currentPost.isAnnouncement || currentPost.isPinned) && (
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400">
          <Megaphone className="w-3.5 h-3.5" />
          <span>Official Course Announcement</span>
          {currentPost.isPinned && (
            <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-normal">
              <Pin className="w-3 h-3 text-amber-500" /> Pinned
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3.5">
        {/* Author Avatar */}
        <NavLink to={`/profile/${author.username}`} className="shrink-0">
          <Avatar
            src={author.avatarUrl}
            name={author.name}
            size="md"
            showRoleBadge={true}
            role={author.role}
          />
        </NavLink>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <NavLink
                to={`/profile/${author.username}`}
                className="font-bold text-sm text-zinc-100 hover:text-indigo-400 truncate"
              >
                {author.name}
              </NavLink>

              {author.role === 'admin' && (
                <Badge variant="admin" size="xs">
                  Instructor
                </Badge>
              )}

              <span className="text-xs text-zinc-500 truncate">@{author.username}</span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-xs text-zinc-500 hover:underline">
                {formatTime(currentPost.createdAt)}
              </span>

              {currentPost.isEdited && (
                <span className="text-[11px] text-zinc-500 italic">(edited)</span>
              )}
            </div>

            {/* Post Options Menu */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-36 glass-dropdown rounded-xl py-1 z-30 shadow-xl"
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit Post</span>
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleDelete();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="mt-2 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
            {currentPost.content}
          </div>

          {/* Actions Bar (Likes, Comments, Share) */}
          <div className="flex items-center gap-6 mt-3 pt-2 text-zinc-500 text-xs">
            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 p-1 rounded-lg transition-colors group cursor-pointer ${
                isLiked ? 'text-rose-500' : 'hover:text-rose-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isLiked ? 'fill-rose-500' : ''
                } ${animatingHeart ? 'animate-heart' : ''}`}
              />
              <span className="font-semibold">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:text-indigo-400 transition-colors group cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="font-semibold">{commentsCount}</span>
            </button>

            {/* Share / Copy Link */}
            <button
              onClick={handleShare}
              title="Copy post link"
              className="flex items-center gap-1.5 p-1 rounded-lg hover:text-sky-400 transition-colors group cursor-pointer"
            >
              <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Inline Comments Section */}
          {showComments && (
            <CommentsSection
              postId={currentPost._id}
              onCommentCountChange={(newCount) => setCommentsCount(newCount)}
            />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={currentPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </article>
  );
};

export default PostCard;
