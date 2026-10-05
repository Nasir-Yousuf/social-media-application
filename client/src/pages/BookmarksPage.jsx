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
    <div className="flex flex-col space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
              <Bookmark className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Saved Posts</h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
            Your private collection of posts and code snippets.
          </p>
        </div>

        <button
          onClick={() => fetchBookmarks(true, 1)}
          disabled={refreshing || loading}
          title="Refresh bookmarks"
          className="p-2 text-neutral-400 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer active:scale-90"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-500' : ''}`} />
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
