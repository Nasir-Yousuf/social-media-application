import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Users, RefreshCw } from 'lucide-react';
import PostComposer from '../components/posts/PostComposer';
import PostList from '../components/posts/PostList';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'following'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useNotifications();

  const fetchFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get(`/posts/feed?tab=${activeTab}`);
      setPosts(res.data.posts || []);
    } catch (err) {
      showToast('Could not load course feed', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchFeed();

    // Listen for new posts created anywhere (e.g. sidebar modal)
    const handleNewPost = () => {
      fetchFeed(true);
    };
    window.addEventListener('pulse518:newPost', handleNewPost);
    return () => window.removeEventListener('pulse518:newPost', handleNewPost);
  }, [fetchFeed]);

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
    <div className="flex flex-col min-h-screen">
      {/* Feed Sticky Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight text-zinc-100">Course Feed</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              CS-518
            </span>
          </div>

          <button
            onClick={() => fetchFeed(true)}
            disabled={refreshing || loading}
            title="Refresh feed"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Feed Tab Bar */}
        <div className="grid grid-cols-2 border-t border-zinc-800/80 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 text-center relative transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'text-zinc-100 font-bold'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>All Course</span>
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-indigo-500 rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`py-3 text-center relative transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'following'
                ? 'text-zinc-100 font-bold'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
            }`}
          >
            <Users className="w-4 h-4 text-violet-400" />
            <span>Following</span>
            {activeTab === 'following' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-violet-500 rounded-t-full" />
            )}
          </button>
        </div>
      </header>

      {/* Main Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Posts Feed Stream */}
      <PostList
        posts={posts}
        loading={loading}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
        emptyMessage={
          activeTab === 'following'
            ? 'No posts from people you follow yet. Follow classmates from the Course Directory!'
            : 'No course discussions yet. Be the first to start a conversation!'
        }
      />
    </div>
  );
};

export default HomePage;
