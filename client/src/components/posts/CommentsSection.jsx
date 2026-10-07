import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Trash2, AtSign, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../api/client';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import MarkdownRenderer from './MarkdownRenderer';
import { useMentionAutocomplete, MentionDropdown } from '../common/MentionAutocomplete';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { FacultyBadge } from '../common/ClearfeedIcons';
import TwitterSpinner from '../common/TwitterSpinner';

export const CommentsSection = ({ postId, onCommentCountChange, canReply = true }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [fadingCommentId, setFadingCommentId] = useState(null);
  const commentInputRef = useRef(null);

  const {
    mentionActive,
    filteredUsers,
    selectedIndex,
    insertMention,
    handleKeyDown: handleMentionKeyDown,
    closeMention,
  } = useMentionAutocomplete(newComment, setNewComment, commentInputRef);

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        const res = await api.get(`/posts/${postId}/comments`);
        if (isMounted) {
          setComments(res.data.comments || []);
        }
      } catch (err) {
        console.warn('Failed to load comments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in or continue as guest to post a response', 'info');
      return;
    }
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment('');
      closeMention();
      if (onCommentCountChange) {
        onCommentCountChange(res.data.commentsCount);
      }
      showToast('Response posted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post reply', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      const res = await api.delete(`/comments/${commentId}`);
      setFadingCommentId(commentId);
      setTimeout(() => {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setFadingCommentId(null);
        setDeletingCommentId(null);
        if (onCommentCountChange) {
          onCommentCountChange(res.data.commentsCount);
        }
        showToast('Response deleted', 'info');
      }, 250);
    } catch (err) {
      setDeletingCommentId(null);
      setFadingCommentId(null);
      showToast(err.response?.data?.message || 'Failed to delete reply', 'error');
    }
  };

  const handleTriggerMention = () => {
    if (commentInputRef.current) {
      const current = newComment;
      const needsSpace = current.length > 0 && !current.endsWith(' ');
      setNewComment(`${current}${needsSpace ? ' ' : ''}@`);
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 0);
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Existing Comments */}
      {loading ? (
        <div className="py-2 space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-neutral-100 dark:bg-neutral-800/60 rounded w-1/2 animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 py-1">
          No responses yet. Share your thoughts or mention a member below.
        </p>
      ) : (
        <div className="space-y-2.5">
          {comments.map((comment) => {
            const isOwner = comment.author?._id === user?._id || comment.isOwner;
            const canDelete = isOwner || isAdmin;
            const isDeletingThis = deletingCommentId === comment._id;
            const isFadingThis = fadingCommentId === comment._id;

            return (
              <div
                key={comment._id}
                className={`flex items-start justify-between gap-2.5 p-3 rounded-2xl bg-neutral-50/80 dark:bg-black/40 border border-neutral-200/80 dark:border-neutral-800 text-xs transition-all duration-250 ${
                  isFadingThis ? 'opacity-0 scale-95 -translate-y-1' : ''
                } ${isDeletingThis ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <NavLink to={`/profile/${comment.author?.username}`}>
                    <Avatar
                      src={comment.author?.avatarUrl}
                      name={comment.author?.name}
                      size="xs"
                      role={comment.author?.role}
                    />
                  </NavLink>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <NavLink
                        to={`/profile/${comment.author?.username}`}
                        className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline truncate"
                      >
                        {comment.author?.name}
                      </NavLink>
                      <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                        @{comment.author?.username}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-400 text-[11px]">
                        {formatTime(comment.createdAt)}
                      </span>
                      {isAdmin && comment.ipAddress && (
                        <span
                          title={`Commenter IP Address: ${comment.ipAddress} (Visible only to Admin)`}
                          className="px-1.5 py-0.2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[9px] font-bold"
                        >
                          IP: {comment.ipAddress}
                        </span>
                      )}
                    </div>

                    <div className="text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed break-words font-sans text-xs">
                      <MarkdownRenderer content={comment.content} />
                    </div>
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    disabled={isDeletingThis}
                    title="Delete response"
                    className="text-neutral-400 hover:text-rose-500 p-1 rounded-full hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isDeletingThis ? (
                      <TwitterSpinner size="xs" className="text-rose-500" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply restriction notice OR Add Reply Input Form */}
      {!canReply ? (
        <div className="flex items-center gap-2 p-3 mt-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs">
          <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span>The author has limited who can reply to this post.</span>
        </div>
      ) : (
        <div className="relative mt-2">
          {/* Floating Mention Autocomplete Dropdown above input */}
          {mentionActive && (
            <div className="absolute bottom-full mb-1 left-0 z-50">
              <MentionDropdown
                users={filteredUsers}
                selectedIndex={selectedIndex}
                onSelect={insertMention}
              />
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (mentionActive && handleMentionKeyDown(e)) {
                    return;
                  }
                }}
                placeholder="Write a response or type @ to mention someone..."
                maxLength={1000}
                className="w-full bg-white dark:bg-[#121519] text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pl-3.5 pr-8 py-2 rounded-full border border-neutral-300 dark:border-neutral-700/80 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              />

              <button
                type="button"
                onClick={handleTriggerMention}
                title="Mention a member (@)"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-sky-500 transition-colors p-1 cursor-pointer"
              >
                <AtSign className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newComment.trim() || submitting}
              isLoading={submitting}
              className="px-4 py-1.5 font-bold"
            >
              Reply
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
