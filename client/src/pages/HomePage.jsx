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
    <div className="flex flex-col font-sans">
      {/* Twitter Sticky Header: For you / Following */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
        <div className="flex-1 flex">
          <button
            onClick={() => setActiveTab('all')}
            className="flex-1 py-3.5 text-center font-bold text-sm hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors relative cursor-pointer"
          >
            <span
              className={`transition-colors ${
                activeTab === 'all'
                  ? 'text-neutral-900 dark:text-white font-extrabold'
                  : 'text-neutral-500 font-medium'
              }`}
            >
              For you
            </span>
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-sky-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className="flex-1 py-3.5 text-center font-bold text-sm hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors relative cursor-pointer"
          >
            <span
              className={`transition-colors ${
                activeTab === 'following'
                  ? 'text-neutral-900 dark:text-white font-extrabold'
                  : 'text-neutral-500 font-medium'
              }`}
            >
              Following
            </span>
            {activeTab === 'following' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-sky-500 rounded-full" />
            )}
          </button>
        </div>

        <button
          onClick={() => fetchFeed(true, 1)}
          disabled={refreshing || loading}
          title="Refresh feed"
          className="p-3 mr-1 text-neutral-400 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50 cursor-pointer active:scale-90"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-500' : ''}`} />
        </button>
      </div>

      {/* Post Composer right at top of feed */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-800/80 p-3 sm:p-4 bg-white dark:bg-black">
        <PostComposer onPostCreated={handlePostCreated} compact={true} />
      </div>

      {/* Chronological Posts Stream */}
      <div className="p-3 sm:p-4 space-y-4">
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
    </div>
  );
};

export default HomePage;
