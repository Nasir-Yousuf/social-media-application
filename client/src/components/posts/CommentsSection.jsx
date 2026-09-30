import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../api/client';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

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
      showToast('Comment posted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
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
      showToast('Comment deleted', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete comment', 'error');
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
    <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-col gap-3">
      {/* Existing Comments */}
      {loading ? (
        <div className="py-2 space-y-2">
          <div className="h-4 bg-zinc-800/60 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-zinc-800/40 rounded w-1/2 animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-500 py-1">No comments yet. Start the conversation!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isOwner = comment.author?._id === user?._id || comment.isOwner;
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={comment._id}
                className="flex items-start justify-between gap-2.5 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 text-xs"
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
                        className="font-semibold text-zinc-200 hover:text-indigo-400 truncate"
                      >
                        {comment.author?.name}
                      </NavLink>
                      <span className="text-zinc-500 text-[11px]">@{comment.author?.username}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-500 text-[11px]">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-zinc-300 mt-0.5 leading-relaxed break-words">{comment.content}</p>
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    title="Delete comment"
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Input */}
      <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a reply..."
          maxLength={500}
          className="flex-1 bg-zinc-900 text-xs text-zinc-100 placeholder-zinc-500 px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <Button
          type="submit"
          variant="primary"
          size="xs"
          disabled={!newComment.trim() || submitting}
          isLoading={submitting}
        >
          <Send className="w-3 h-3" />
          <span>Reply</span>
        </Button>
      </form>
    </div>
  );
};

export default CommentsSection;
