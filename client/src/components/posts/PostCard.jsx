import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MoreHorizontal,
  Edit3,
  Trash2,
  Pin,
  BarChart2,
  MapPin,
  Flag,
  ShieldAlert,
  Users,
  Handshake,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import Avatar from '../common/Avatar';
import CommentsSection from './CommentsSection';
import EditPostModal from './EditPostModal';
import CodeSnippetBlock from './CodeSnippetBlock';
import MarkdownRenderer from './MarkdownRenderer';
import BookmarkButton from './BookmarkButton';
import TypingSharePostCard from '../typing/TypingSharePostCard';
import { FacultyBadge, BoostIcon, ForkIcon } from '../common/ClearfeedIcons';
import TwitterSpinner from '../common/TwitterSpinner';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const PostCard = ({
  post,
  onPostDeleted,
  onPostUpdated,
  defaultShowComments = false,
  isDetailView = false,
}) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [currentPost, setCurrentPost] = useState(post);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const resolveViews = (p) => {
    if (Array.isArray(p?.viewedBy) && p.viewedBy.length > 0) {
      return p.viewedBy.length;
    }
    return typeof p?.viewsCount === 'number' && p.viewsCount > 0 ? p.viewsCount : 1;
  };

  const [viewsCount, setViewsCount] = useState(() => resolveViews(post));
  const [isFlagged, setIsFlagged] = useState(post.isFlagged || false);
  const [reposted, setReposted] = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animatingHeart, setAnimatingHeart] = useState(false);
  const viewRecordedRef = useRef(false);
  const shareMenuRef = useRef(null);

  // Close share menu on click outside
  useEffect(() => {
    if (!isShareMenuOpen) return;
    const handleClickOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareMenuOpen]);

  useEffect(() => {
    setViewsCount(resolveViews(post));
  }, [post.viewsCount, post.viewedBy]);

  // Record impression view once
  useEffect(() => {
    if (!viewRecordedRef.current && currentPost._id) {
      viewRecordedRef.current = true;
      api.post(`/posts/${currentPost._id}/view`)
        .then((res) => {
          if (typeof res.data?.viewsCount === 'number') {
            setViewsCount(res.data.viewsCount);
          }
        })
        .catch(() => {});
    }
  }, [currentPost._id]);

  const author = currentPost.author || {};
  const isOwner = user && (author._id === user._id || author.id === user._id);
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  const formatCount = (count) => {
    if (!count || count <= 0) return '';
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count;
  };

  const handleFlagPost = async () => {
    setIsMenuOpen(false);
    if (!window.confirm('Report this post to course moderators?')) return;
    try {
      await api.post(`/posts/${currentPost._id}/flag`, { reason: 'Community report' });
      setIsFlagged(true);
      showToast('Post flagged for moderator review', 'info');
    } catch {
      showToast('Could not submit report', 'error');
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, 'MMM d, yyyy · h:mm a');
    } catch {
      return 'Recently';
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      showToast('Please sign in or continue as guest to like posts', 'info');
      return;
    }

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
    if (!user) {
      showToast('Please sign in or continue as guest to repost', 'info');
      return;
    }
    setReposted(!reposted);
    showToast(reposted ? 'Removed repost' : 'Reposted to your followers', 'info');
  };

  const handleFork = () => {
    if (!user) {
      showToast('Please sign in or continue as guest to fork snippets', 'info');
      return;
    }
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

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${currentPost._id}`);
      setIsConfirmDeleteOpen(false);
      setIsFadingOut(true);
      setTimeout(() => {
        if (onPostDeleted) {
          onPostDeleted(currentPost._id);
        }
        showToast('Post removed', 'info');
      }, 300);
    } catch (err) {
      setIsDeleting(false);
      showToast(err.response?.data?.message || 'Failed to delete post', 'error');
    }
  };

  const postUrl = `${window.location.origin}/posts/${currentPost._id}`;

  const handleCopyLink = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(postUrl);
    setShareCopied(true);
    showToast('Post link copied to clipboard!', 'success');
    setTimeout(() => setShareCopied(false), 2000);
    setIsShareMenuOpen(false);
  };

  const handleNativeShare = async (e) => {
    e?.stopPropagation();
    setIsShareMenuOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${author.name || 'Clearfeed'} on Clearfeed`,
          text: (currentPost.content || '').slice(0, 100),
          url: postUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareButtonClick = (e) => {
    e?.stopPropagation();
    setIsShareMenuOpen((prev) => !prev);
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

  const typingScoreData = React.useMemo(() => {
    if (!currentPost.content) return null;
    const match = currentPost.content.match(
      /scored\s+(\d+)\s+WPM\s+\((\d+)\s+Raw\)\s+with\s+(\d+)%\s+accuracy\s+and\s+a\s+(\d+)x\s+streak/i
    );
    if (match) {
      return {
        wpm: Number(match[1]),
        rawWpm: Number(match[2]),
        accuracy: Number(match[3]),
        highestCombo: Number(match[4]),
        duration: 60,
        mode: 'words_200',
        rivalUsername: author.username || '',
      };
    }
    return null;
  }, [currentPost.content, author.username]);

  return (
    <article
      id={`post-${currentPost._id}`}
      className={`relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-4 sm:p-5 mb-4 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700/80 transition-all duration-300 ${
        isDetailView ? 'ring-1 ring-sky-500/20 dark:ring-sky-500/10' : ''
      } ${
        isFadingOut
          ? 'opacity-0 scale-[0.98] -translate-y-2 max-h-0 py-0 my-0 mb-0 overflow-hidden border-transparent pointer-events-none'
          : ''
      }`}
    >
      {/* Twitter-style in-card Deleting overlay with Spinner */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 dark:bg-[#121519]/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2.5 z-20 animate-fade-in pointer-events-none">
          <TwitterSpinner size="lg" className="text-sky-500" />
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 tracking-wide font-sans">
            Deleting post...
          </span>
        </div>
      )}
      {/* Pinned / Forked Header Tag */}
      {(currentPost.isPinned || currentPost.forkedFrom) && (
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-amber-500">
          {currentPost.isPinned && (
            <span className="flex items-center gap-1">
              <Pin className="w-3.5 h-3.5" /> Pinned
            </span>
          )}
          {currentPost.forkedFrom && (
            <span className="flex items-center gap-1 text-sky-500">
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
                className="font-sans font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:underline truncate"
              >
                {author.name || 'Member'}
              </NavLink>

              <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">@{author.username}</span>

              {author.status && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium">
                  {author.status}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-sans flex-wrap">
              <NavLink
                to={`/posts/${currentPost._id}`}
                className="hover:underline hover:text-sky-500 transition-colors"
                title="View full post"
              >
                <time dateTime={currentPost.createdAt}>{formatDate(currentPost.createdAt)}</time>
              </NavLink>
              {isAdmin && currentPost.ipAddress && (
                <span
                  title={`Author IP Address: ${currentPost.ipAddress} (Visible only to Admin @${user?.username})`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold tracking-tight"
                >
                  <ShieldAlert className="w-2.5 h-2.5" />
                  IP: {currentPost.ipAddress}
                </span>
              )}
              {currentPost.location && (
                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                  <MapPin className="w-3 h-3 text-sky-500" />
                  <span>{currentPost.location}</span>
                </span>
              )}
              {currentPost.visibility && currentPost.visibility !== 'public' && (
                <span
                  title={
                    currentPost.visibility === 'followers'
                      ? 'Followers only'
                      : currentPost.visibility === 'mutuals'
                      ? 'Mutual follows only'
                      : currentPost.visibility === 'private'
                      ? 'Only me (private)'
                      : 'Specific audience'
                  }
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium text-[10px]"
                >
                  {currentPost.visibility === 'followers' && <Users className="w-2.5 h-2.5 text-purple-400" />}
                  {currentPost.visibility === 'mutuals' && <Handshake className="w-2.5 h-2.5 text-emerald-400" />}
                  {currentPost.visibility === 'private' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                  <span className="capitalize">{currentPost.visibility}</span>
                </span>
              )}
              {currentPost.isEdited && <span className="italic">· edited</span>}
              {isFlagged && (
                <span className="text-amber-500 font-semibold text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10">
                  Reported
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu (Edit / Delete / Flag) */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-neutral-400 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#181b20] border border-neutral-200 dark:border-neutral-800 rounded-2xl py-1 z-30 shadow-xl animate-fade-in"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              {canEdit && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-500" />
                  <span>Edit Post</span>
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsConfirmDeleteOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              {!isOwner && (
                <button
                  onClick={handleFlagPost}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/15 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Flag Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Post Content */}
      <div className="mt-3.5">
        <MarkdownRenderer content={currentPost.content} />

        {/* Typing Score Challenge Card */}
        {typingScoreData && (
          <TypingSharePostCard data={typingScoreData} />
        )}

        {/* Code Snippet Block */}
        {hasCode && (
          <div className="mt-3">
            <CodeSnippetBlock snippet={currentPost.codeSnippet} />
          </div>
        )}
      </div>

      {/* Twitter Action Bar: Reply, Repost, Like, Views Analytics, Bookmark, Share */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-500 dark:text-neutral-400 select-none">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          {/* Comments / Reply */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 p-1.5 rounded-full hover:text-sky-500 hover:bg-sky-500/10 transition-all duration-150 active:scale-90 cursor-pointer group"
            title="Reply"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-105 transition-transform" />
            <span className="font-semibold text-xs">{commentsCount > 0 ? commentsCount : ''}</span>
          </button>

          {/* Repost / Retweet */}
          <button
            onClick={handleRepostToggle}
            className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-150 active:scale-90 cursor-pointer group ${
              reposted
                ? 'text-emerald-500'
                : 'hover:text-emerald-500 hover:bg-emerald-500/10'
            }`}
            title="Repost"
          >
            <BoostIcon className="w-4 h-4 group-hover:scale-105 transition-transform" />
            <span className="font-semibold text-xs">{reposted ? 1 : ''}</span>
          </button>

          {/* Like / Heart */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-150 active:scale-90 cursor-pointer group ${
              isLiked
                ? 'text-rose-500'
                : 'hover:text-rose-500 hover:bg-rose-500/10'
            }`}
            title="Like"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''} ${
                animatingHeart ? 'scale-125' : 'group-hover:scale-105'
              } transition-transform`}
            />
            <span className="font-semibold text-xs">{likesCount > 0 ? likesCount : ''}</span>
          </button>

          {/* Views Analytics (Unique Views) */}
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-full text-neutral-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors cursor-default"
            title={`${viewsCount || 1} ${viewsCount === 1 ? 'View' : 'Views'}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="font-medium text-xs font-mono">{viewsCount || 1}</span>
          </div>

          {/* Fork Code Button */}
          {hasCode && (
            <button
              onClick={handleFork}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sky-500 hover:bg-sky-500/10 transition-all duration-150 active:scale-95 cursor-pointer font-semibold"
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

          {/* Share Button & Popover */}
          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={handleShareButtonClick}
              title="Share post"
              className={`p-1.5 rounded-full transition-all duration-150 active:scale-90 cursor-pointer ${
                shareCopied
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : 'hover:text-sky-500 hover:bg-sky-500/10'
              }`}
              aria-label="Share options"
            >
              {shareCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {isShareMenuOpen && (
              <div
                className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-[#181b20] border border-neutral-200 dark:border-neutral-800 rounded-2xl py-1.5 z-40 shadow-xl shadow-black/10 dark:shadow-black/50 animate-fade-in text-xs font-sans"
              >
                {/* Copy Link to Post */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium text-left cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>Copy Link to Post</span>
                </button>

                {/* Share via Native OS (Mobile/Desktop) */}
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium text-left cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Share via Device...</span>
                  </button>
                )}

                {/* Direct Link / Open in New Tab */}
                <NavLink
                  to={`/posts/${currentPost._id}`}
                  onClick={() => setIsShareMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Open Post</span>
                </NavLink>

                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                {/* Share to X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out this post on Clearfeed:\n"${(currentPost.content || '').slice(0, 100)}..."`
                  )}&url=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsShareMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium text-left"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Post on X</span>
                </a>

                {/* Share to WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Check out this post on Clearfeed: ${postUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsShareMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium text-left"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Share to WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <CommentsSection
            postId={currentPost._id}
            canReply={currentPost.canReply !== false}
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

      {/* Twitter-style Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => !isDeleting && setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete post?"
        description="This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results."
      />
    </article>
  );
};

export default PostCard;
