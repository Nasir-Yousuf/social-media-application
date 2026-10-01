import React, { useState, useEffect } from 'react';
import { Bookmark, RefreshCw } from 'lucide-react';
import PostList from '../components/posts/PostList';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export const BookmarksPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { showToast } = useNotifications();

  const fetchBookmarks = async (isRefresh = false, pageNum = 1) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get(`/bookmarks?page=${pageNum}&limit=15`);
      const incoming = res.data.posts || [];
      setPosts((prev) => (pageNum === 1 ? incoming : [...prev, ...incoming]));
      setHasMore(Boolean(res.data.pagination?.hasMore));
      setPage(pageNum);
    } catch (err) {
      showToast('Could not load bookmarks', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <div className="flex flex-col space-y-5 font-sans">
      <div className="flex items-center justify-between pb-3 border-b cf-border">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[var(--color-cf-accent)]" />
            <h1 className="text-xl font-bold tracking-tight cf-text">Saved Posts</h1>
          </div>
          <p className="text-xs cf-text-muted mt-0.5 font-sans">
            Your private collection of posts and code snippets.
          </p>
        </div>

        <button
          onClick={() => fetchBookmarks(true, 1)}
          disabled={refreshing || loading}
          title="Refresh bookmarks"
          className="p-2 cf-text-muted hover:text-[var(--color-cf-accent)] hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] rounded-full transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[var(--color-cf-accent)]' : ''}`} />
        </button>
      </div>

      <PostList
        posts={posts}
        loading={loading}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={() => fetchBookmarks(false, page + 1)}
        emptyMessage="No saved posts yet."
        emptyDescription="When you find an article, thought, or code snippet you want to keep, click the bookmark icon on the post."
      />
    </div>
  );
};

export default BookmarksPage;
