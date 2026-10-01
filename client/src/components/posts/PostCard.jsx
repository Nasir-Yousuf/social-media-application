import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Edit3,
  Trash2,
  Pin,
  Flame,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import CommentsSection from './CommentsSection';
import EditPostModal from './EditPostModal';
import CodeSnippetBlock from './CodeSnippetBlock';
import MarkdownRenderer from './MarkdownRenderer';
import BookmarkButton from './BookmarkButton';
import { FacultyBadge, BoostIcon, ForkIcon } from '../common/ClearfeedIcons';
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
  const [reposted, setReposted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const author = currentPost.author || {};
  const isOwner = user && (author._id === user._id || author.id === user._id);
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, 'MMM d, yyyy · h:mm a');
    } catch {
      return 'Recently';
    }
  };

  const handleLikeToggle = async () => {
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      setAnimatingHeart(true);
      setTimeout(() => setAnimatingHeart(false), 300);
    }

    try {
      const res = await api.post(`/posts/${currentPost._id}/like`);
      setIsLiked(res.data.isLiked ?? res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setIsLiked(!nextLiked);
      setLikesCount(likesCount);
      showToast('Could not update like', 'error');
    }
  };

  const handleRepostToggle = () => {
    setReposted(!reposted);
    showToast(reposted ? 'Removed repost' : 'Reposted to your followers', 'info');
  };

  const handleFork = () => {
    // Dispatch event to open composer with forked code
    window.dispatchEvent(
      new CustomEvent('clearfeed:forkPost', {
        detail: {
          originalPostId: currentPost._id,
          originalAuthor: author.username,
          codeSnippet: currentPost.codeSnippet,
          content: `Forked from @${author.username}:\n`,
        },
      })
    );
    showToast(`Forking @${author.username}'s snippet into composer...`, 'info');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${currentPost._id}`);
      showToast('Post removed', 'info');
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
    showToast('Link copied to clipboard', 'success');
  };

  const handlePostUpdated = (updated) => {
    setCurrentPost((prev) => ({ ...prev, ...updated }));
    if (onPostUpdated) {
      onPostUpdated(updated);
    }
  };

  const hasCode = Boolean(
    currentPost.codeSnippet &&
      ((Array.isArray(currentPost.codeSnippet.files) && currentPost.codeSnippet.files.length > 0) ||
        currentPost.codeSnippet.code)
  );

  return (
    <article
      id={`post-${currentPost._id}`}
      className={`rounded-xl border cf-border cf-surface p-5 mb-4 shadow-sm cf-post-card transition-all ${
        currentPost.isAnnouncement
          ? 'border-l-4 border-l-[var(--color-cf-amber)] bg-[var(--color-cf-amber-soft)]/20'
          : ''
      }`}
    >
      {/* Pinned / Announcement / Forked Header Tag */}
      {(currentPost.isPinned || currentPost.isAnnouncement || currentPost.forkedFrom) && (
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--color-cf-amber)]">
          {currentPost.isPinned && (
            <span className="flex items-center gap-1">
              <Pin className="w-3.5 h-3.5" /> Pinned
            </span>
          )}
          {currentPost.isAnnouncement && (
            <span className="flex items-center gap-1 font-bold">
              <Flame className="w-3.5 h-3.5" /> Announcement
            </span>
          )}
          {currentPost.forkedFrom && (
            <span className="flex items-center gap-1 text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]">
              <ForkIcon className="w-3.5 h-3.5" />
              <span>
                Forked from{' '}
                <NavLink
                  to={`/profile/${currentPost.forkedFrom.author?.username}`}
                  className="font-bold underline"
                >
                  @{currentPost.forkedFrom.author?.username || 'member'}
                </NavLink>
              </span>
            </span>
          )}
        </div>
      )}

      {/* Author Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <NavLink to={`/profile/${author.username}`} className="shrink-0">
            <Avatar
              src={author.avatarUrl}
              name={author.name}
              size="md"
              showRoleBadge={true}
              role={author.role}
            />
          </NavLink>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <NavLink
                to={`/profile/${author.username}`}
                className="font-sans font-bold text-sm cf-text hover:underline truncate"
              >
                {author.name || 'Member'}
              </NavLink>

              {author.role === 'admin' && (
                <FacultyBadge className="w-3.5 h-3.5 text-[var(--color-cf-amber)]" />
              )}

              <span className="text-xs cf-text-muted truncate">@{author.username}</span>

              {author.status && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)] text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] font-medium">
                  {author.status}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] cf-text-muted mt-0.5 font-sans">
              <time dateTime={currentPost.createdAt}>{formatDate(currentPost.createdAt)}</time>
              {currentPost.isEdited && <span className="italic">· edited</span>}
            </div>
          </div>
        </div>

        {/* Options Menu (Edit / Delete) */}
        {(canEdit || canDelete) && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-[var(--color-cf-text-muted)] hover:text-[var(--color-cf-accent)] hover:bg-[var(--color-cf-accent-soft)] rounded-full transition-colors cursor-pointer"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-36 cf-bg border cf-border rounded-xl py-1 z-30 shadow-lg animate-fade-in"
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                {canEdit && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold cf-text hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[var(--color-cf-accent)]" />
                    <span>Edit Post</span>
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--color-cf-danger)] hover:bg-[var(--color-cf-danger-soft)] transition-colors cursor-pointer"
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

      {/* Main Post Content (Serif Reading Typography + Markdown) */}
      <div className="mt-3.5">
        <MarkdownRenderer content={currentPost.content} />

        {/* Code Snippet Block */}
        {hasCode && (
          <div className="mt-3">
            <CodeSnippetBlock snippet={currentPost.codeSnippet} />
          </div>
        )}
      </div>

      {/* Action Bar: Quiet, intentional, non-distracting */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t cf-border text-xs cf-text-muted select-none">
        <div className="flex items-center gap-5">
          {/* Like / Heart (Twitter Pink #f91880) */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 p-1.5 rounded-full cf-btn-transition cursor-pointer ${
              isLiked
                ? 'text-[var(--color-cf-like)]'
                : 'hover:text-[var(--color-cf-like)] hover:bg-[var(--color-cf-like-soft)]'
            }`}
            title="Like"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-[var(--color-cf-like)] text-[var(--color-cf-like)]' : ''} ${
                animatingHeart ? 'scale-125' : ''
              } transition-transform`}
            />
            <span className="font-medium text-xs">{likesCount > 0 ? likesCount : ''}</span>
          </button>

          {/* Comments Toggle (Twitter Blue #1d9bf0) */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 p-1.5 rounded-full hover:text-[var(--color-cf-accent)] hover:bg-[var(--color-cf-accent-soft)] cf-btn-transition cursor-pointer"
            title="Reply"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium text-xs">{commentsCount > 0 ? commentsCount : ''}</span>
          </button>

          {/* Repost / Retweet (Twitter Green #00ba7c) */}
          <button
            onClick={handleRepostToggle}
            className={`flex items-center gap-1.5 p-1.5 rounded-full cf-btn-transition cursor-pointer ${
              reposted
                ? 'text-[var(--color-cf-boost)]'
                : 'hover:text-[var(--color-cf-boost)] hover:bg-[var(--color-cf-boost-soft)]'
            }`}
            title="Repost"
          >
            <BoostIcon className="w-4 h-4" />
            <span className="font-medium text-xs">{reposted ? 1 : ''}</span>
          </button>

          {/* Fork Code Button (only shown if post has code) */}
          {hasCode && (
            <button
              onClick={handleFork}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[var(--color-cf-accent)] hover:bg-[var(--color-cf-accent-soft)] cf-btn-transition cursor-pointer font-medium"
              title="Fork code into your editor"
            >
              <ForkIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Fork</span>
            </button>
          )}
        </div>

        {/* Right Actions: Private Bookmark + Share */}
        <div className="flex items-center gap-1">
          <BookmarkButton
            postId={currentPost._id}
            initialIsBookmarked={currentPost.isBookmarked || false}
          />

          <button
            onClick={handleShare}
            title="Share post"
            className="p-1.5 rounded-full hover:text-[var(--color-cf-accent)] hover:bg-[var(--color-cf-accent-soft)] cf-btn-transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t cf-border">
          <CommentsSection
            postId={currentPost._id}
            onCommentCountChange={(newCount) => setCommentsCount(newCount)}
          />
        </div>
      )}

      {/* Edit Post Modal */}
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
