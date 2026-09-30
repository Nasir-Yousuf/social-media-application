import React, { useState, useEffect } from 'react';
import { Compass, Hash, Flame, Award } from 'lucide-react';
import PostList from '../components/posts/PostList';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const { showToast } = useNotifications();

  const courseTags = [
    { tag: 'React19', count: 18 },
    { tag: 'MongoDB', count: 14 },
    { tag: 'Architecture', count: 21 },
    { tag: 'StudyGroup', count: 11 },
    { tag: 'MidtermPrep', count: 16 },
    { tag: 'Docker', count: 9 },
    { tag: 'TailwindCSS', count: 12 },
  ];

  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const res = await api.get('/posts/explore');
        setPosts(res.data.posts || []);
      } catch (err) {
        showToast('Failed to load explore feed', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchExplore();
  }, [showToast]);

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.content.toLowerCase().includes(selectedTag.toLowerCase()))
    : posts;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-extrabold tracking-tight text-zinc-100">Explore & Discover</h1>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          Trending topics and top-rated discussions across our 35 cohort members
        </p>
      </header>

      {/* Course Tags Banner */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/30">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-2.5">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Trending Course Topics</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
              selectedTag === null
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            All Discussions
          </button>
          {courseTags.map((item) => (
            <button
              key={item.tag}
              onClick={() => setSelectedTag(selectedTag === item.tag ? null : item.tag)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
                selectedTag === item.tag
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <Hash className="w-3 h-3 text-indigo-400" />
              <span>{item.tag}</span>
              <span className="text-[10px] text-zinc-400">({item.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Posts */}
      <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          {selectedTag ? `Discussions mentioning #${selectedTag}` : 'Most Engaged Course Posts'}
        </span>
        <span>{filteredPosts.length} posts</span>
      </div>

      <PostList
        posts={filteredPosts}
        loading={loading}
        onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
        onPostUpdated={(up) => setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))}
        emptyMessage="No posts match this topic filter."
      />
    </div>
  );
};

export default ExplorePage;
