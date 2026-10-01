import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import PostComposer from '../components/posts/PostComposer';
import PostList from '../components/posts/PostList';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'following'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { showToast } = useNotifications();

  const fetchFeed = useCallback(
    async (isRefresh = false, pageNum = 1) => {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await api.get(`/posts/feed?tab=${activeTab}&page=${pageNum}&limit=15`);
        const incoming = res.data.posts || [];
        setPosts((prev) => (pageNum === 1 ? incoming : [...prev, ...incoming]));
        setHasMore(Boolean(res.data.pagination?.hasMore));
        setPage(pageNum);
      } catch (err) {
        showToast('Could not load feed', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab, showToast]
  );

  useEffect(() => {
    fetchFeed(false, 1);

    const handleNewPost = () => {
      fetchFeed(true, 1);
    };
    window.addEventListener('clearfeed:newPost', handleNewPost);
    window.addEventListener('pulse518:newPost', handleNewPost);
    return () => {
      window.removeEventListener('clearfeed:newPost', handleNewPost);
      window.removeEventListener('pulse518:newPost', handleNewPost);
    };
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(false, page + 1);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <div className="flex flex-col space-y-5 font-sans">
      {/* Feed Filter Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold cf-btn-transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                : 'cf-text-muted hover:cf-text hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)]'
            }`}
          >
            All Feed
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold cf-btn-transition cursor-pointer ${
              activeTab === 'following'
                ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                : 'cf-text-muted hover:cf-text hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)]'
            }`}
          >
            Following
          </button>
        </div>

        <button
          onClick={() => fetchFeed(true, 1)}
          disabled={refreshing || loading}
          title="Refresh feed"
          className="p-2 cf-text-muted hover:text-[var(--color-cf-accent)] hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[var(--color-cf-accent)]' : ''}`} />
        </button>
      </div>

      {/* Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Chronological Posts Stream */}
      <PostList
        posts={posts}
        loading={loading}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
        showChronologicalBadge={true}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        emptyMessage={
          activeTab === 'following'
            ? 'No posts from people you follow yet.'
            : 'No posts yet.'
        }
        emptyDescription={
          activeTab === 'following'
            ? 'Follow thinkers and builders from the Community page to curate your reading feed.'
            : 'Write the first post or share a code snippet to start the conversation.'
        }
      />
    </div>
  );
};

export default HomePage;
