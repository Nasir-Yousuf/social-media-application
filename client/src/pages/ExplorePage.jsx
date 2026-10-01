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
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="pb-3 border-b cf-border">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[var(--color-cf-accent)]" />
          <h1 className="text-xl font-bold tracking-tight cf-text">Discover</h1>
        </div>
        <p className="text-xs cf-text-muted mt-0.5 font-serif italic">
          Explore thoughtful posts, notes, and discussions across the network.
        </p>
      </div>

      {/* Topic Filter Pills */}
      <div>
        <div className="flex items-center gap-1.5 text-xs cf-text-muted mb-2 font-medium">
          <Tag className="w-3.5 h-3.5" />
          <span>Browse topics:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {topics.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cf-btn-transition cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                    : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)] dark:hover:bg-[var(--color-cfd-elevated)]'
                }`}
              >
                #{tag}
              </button>
            );
          })}

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--color-cf-danger)] hover:bg-[var(--color-cf-danger-soft)] cf-btn-transition cursor-pointer flex items-center gap-1"
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
