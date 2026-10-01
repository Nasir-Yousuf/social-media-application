import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../../api/client';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { FacultyBadge } from '../common/ClearfeedIcons';

export const CommentsSection = ({ postId, onCommentCountChange }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment('');
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
    try {
      const res = await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (onCommentCountChange) {
        onCommentCountChange(res.data.commentsCount);
      }
      showToast('Response deleted', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete reply', 'error');
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
          <div className="h-4 bg-[var(--color-cf-border)] rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-[var(--color-cf-border)]/60 rounded w-1/2 animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs cf-text-muted py-1">No responses yet. Share your thoughts below.</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map((comment) => {
            const isOwner = comment.author?._id === user?._id || comment.isOwner;
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={comment._id}
                className="flex items-start justify-between gap-2.5 p-3 rounded-xl cf-bg border cf-border text-xs"
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
                        className="font-bold cf-text hover:underline truncate"
                      >
                        {comment.author?.name}
                      </NavLink>
                      {comment.author?.role === 'admin' && (
                        <FacultyBadge className="w-3 h-3 text-[var(--color-cf-amber)]" />
                      )}
                      <span className="cf-text-muted text-[11px]">@{comment.author?.username}</span>
                      <span className="cf-text-muted">·</span>
                      <span className="cf-text-muted text-[11px]">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="cf-text mt-1 leading-relaxed break-words font-serif text-[13px]">{comment.content}</p>
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    title="Delete response"
                    className="cf-text-muted hover:text-[var(--color-cf-danger)] p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reply Input */}
      <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a response..."
          maxLength={1000}
          className="flex-1 cf-bg text-xs cf-text placeholder:cf-text-muted px-3.5 py-2 rounded-lg border cf-border cf-focus-ring transition-colors"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!newComment.trim() || submitting}
          isLoading={submitting}
          className="px-4 py-2 font-semibold"
        >
          Respond
        </Button>
      </form>
    </div>
  );
};

export default CommentsSection;
