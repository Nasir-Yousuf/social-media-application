import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, RefreshCw, MessageSquare, Heart } from 'lucide-react';
import api from '../api/client';
import { Post } from '../types';

export const ExploreView: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchExplore = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/explore');
      if (res.data?.posts) {
        setPosts(res.data.posts);
      }
    } catch {
      // Graceful error fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            Explore Course Discussions
          </h2>
          <p className="text-xs text-neutral-400">
            Popular questions, study topics, and discussions across your cohort.
          </p>
        </div>
        <button
          onClick={fetchExplore}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500">
          Loading trending discussions...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-neutral-900/40 rounded-2xl border border-neutral-800">
          No trending posts yet.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    {post.author?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">
                      {post.author?.name || 'Classmate'}
                    </h4>
                    <p className="text-[11px] text-neutral-500">@{post.author?.username}</p>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-neutral-300 whitespace-pre-wrap pl-10">
                {post.content}
              </p>

              <div className="flex items-center gap-4 pl-10 pt-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  {post.likesCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  {post.commentsCount || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreView;
