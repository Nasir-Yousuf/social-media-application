import React, { useState, useEffect } from 'react';
import { Compass, Tag, X } from 'lucide-react';
import PostList from '../components/posts/PostList';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const { showToast } = useNotifications();

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

  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const res = await api.get('/posts/explore');
        setPosts(res.data.posts || []);
      } catch (err) {
        showToast('Failed to load discover feed', 'error');
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
    <div className="p-4 sm:p-5 space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Discover</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
              Explore thoughtful posts, notes, and discussions across the network.
            </p>
          </div>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-2.5 font-medium">
          <Tag className="w-3.5 h-3.5" />
          <span>Browse popular topics:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/25 ring-2 ring-sky-500/30'
                    : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                #{tag}
              </button>
            );
          })}

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Stream */}
      <PostList
        posts={filteredPosts}
        loading={loading}
        onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
        onPostUpdated={(up) => setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))}
        emptyMessage={selectedTag ? `No posts matching #${selectedTag}` : 'No posts to discover yet.'}
        emptyDescription="Posts from all community members will appear here."
      />
    </div>
  );
};

export default ExplorePage;
