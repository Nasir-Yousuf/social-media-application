import React, { useState, useEffect } from 'react';
import { Compass, RefreshCw, Tag, X } from 'lucide-react';
import PostList from '../components/posts/PostList';
import api from '../api/client';

export const ExploreView: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const topics = [
    'Architecture',
    'React',
    'Python',
    'JavaScript',
    'Databases',
    'Design',
    'Compilers',
    'DevOps',
  ];

  const fetchExplore = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/explore');
      setPosts(res.data?.posts || []);
    } catch (err) {
      console.warn('Failed to load explore posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost: any) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const filteredPosts = selectedTag
    ? posts.filter((p) => (p.content || '').toLowerCase().includes(selectedTag.toLowerCase()))
    : posts;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-100">
              Discover & Explore
            </h2>
            <p className="text-xs text-neutral-400">
              Trending questions, study topics, and discussions across your cohort.
            </p>
          </div>
        </div>
        <button
          onClick={fetchExplore}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Topic Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 shrink-0">
          <Tag className="w-3.5 h-3.5" /> Topics:
        </span>
        {selectedTag && (
          <button
            onClick={() => setSelectedTag(null)}
            className="flex items-center gap-1 px-3 py-1 bg-sky-500 text-white rounded-full text-xs font-bold transition cursor-pointer shrink-0"
          >
            <span>#{selectedTag}</span>
            <X className="w-3 h-3" />
          </button>
        )}
        {topics.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
              selectedTag === tag
                ? 'bg-sky-500 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-800'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Real Post List */}
      <div className="space-y-4">
        <PostList
          posts={filteredPosts}
          loading={loading}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
          onLoadMore={() => {}}
          emptyMessage="No trending posts found."
          emptyDescription="When cohort members post questions and discussions, they appear here."
        />
      </div>
    </div>
  );
};

export default ExploreView;
