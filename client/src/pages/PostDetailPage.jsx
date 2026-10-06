import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Compass,
  LogIn,
  UserCheck,
} from 'lucide-react';
import PostCard from '../components/posts/PostCard';
import TwitterSpinner from '../components/common/TwitterSpinner';
import Button from '../components/common/Button';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loginGuest } = useAuth();
  const { showToast } = useNotifications();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data.post);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError('This post was not found. It may have been deleted by the author.');
      } else {
        setError('Could not load this post. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Update document title for social sharing & browser tab
  useEffect(() => {
    if (post) {
      const authorName = post.author?.name || post.author?.username || 'Member';
      const snippet = post.content ? post.content.slice(0, 50).trim() : 'Post';
      document.title = `${authorName} on Clearfeed: "${snippet}..."`;
    } else {
      document.title = 'Post · Clearfeed';
    }
    return () => {
      document.title = 'Clearfeed';
    };
  }, [post]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/posts/${id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    showToast('Post link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const postUrl = `${window.location.origin}/posts/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post?.author?.name || 'Clearfeed'} on Clearfeed`,
          text: (post?.content || '').slice(0, 100),
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

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      await loginGuest();
      showToast('Welcome! Browsing as Guest.', 'info');
      fetchPost();
    } catch {
      showToast('Could not sign in as guest', 'error');
    } finally {
      setGuestLoading(false);
    }
  };

  const handlePostDeleted = () => {
    showToast('Post was deleted', 'info');
    navigate('/', { replace: true });
  };

  return (
    <div className="font-sans min-h-screen">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-1 text-neutral-600 dark:text-neutral-300 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 rounded-full transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
              Post
            </h1>
            {post?.author && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-none">
                by @{post.author.username}
              </p>
            )}
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={navigator.share ? handleNativeShare : handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-800"
            title="Share post"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-sky-500" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <TwitterSpinner size="md" className="text-sky-500" />
            <p className="text-xs font-medium">Loading post...</p>
          </div>
        ) : error ? (
          <div className="p-8 my-6 text-center bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Post Not Found
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
              {error}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={fetchPost}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <NavLink
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/20"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Go to Feed</span>
              </NavLink>
            </div>
          </div>
        ) : post ? (
          <div className="space-y-4">
            {/* The Post with Comments expanded by default */}
            <PostCard
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={(updated) => setPost((prev) => ({ ...prev, ...updated }))}
              defaultShowComments={true}
              isDetailView={true}
            />

            {/* Guest Action Callout if not authenticated */}
            {!isAuthenticated && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/50 dark:from-[#121824] dark:to-[#10141d] border border-sky-100 dark:border-sky-500/20 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5 shadow-xs shadow-sky-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      Join the conversation on Clearfeed
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                      Log in or try guest mode to like, comment, bookmark, and share snippets with other developers.
                    </p>
                    <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                      <NavLink
                        to="/login"
                        state={{ from: { pathname: `/posts/${id}` } }}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/20"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log In</span>
                      </NavLink>
                      <NavLink
                        to="/register"
                        state={{ from: { pathname: `/posts/${id}` } }}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <span>Sign Up</span>
                      </NavLink>
                      <button
                        onClick={handleGuestLogin}
                        disabled={guestLoading}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{guestLoading ? 'Signing in...' : 'Browse as Guest'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostDetailPage;
