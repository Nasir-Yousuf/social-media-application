import React from 'react';
import { MessageSquareDashed } from 'lucide-react';
import PostCard from './PostCard';

export const PostList = ({ posts = [], loading = false, onPostDeleted, onPostUpdated, emptyMessage = 'No course discussions yet.' }) => {
  if (loading) {
    return (
      <div className="divide-y divide-zinc-800/80">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 md:p-5 flex gap-3.5 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-zinc-800 rounded w-28" />
                <div className="h-3 bg-zinc-800/60 rounded w-20" />
              </div>
              <div className="h-4 bg-zinc-800/80 rounded w-full" />
              <div className="h-4 bg-zinc-800/60 rounded w-3/4" />
              <div className="flex gap-6 pt-2">
                <div className="h-3 bg-zinc-800 rounded w-10" />
                <div className="h-3 bg-zinc-800 rounded w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
          <MessageSquareDashed className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-zinc-300">{emptyMessage}</p>
        <p className="text-xs text-zinc-500 max-w-xs">
          Be the first to share an update, ask a question, or start a study discussion with your classmates!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800/80">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onPostDeleted={onPostDeleted}
          onPostUpdated={onPostUpdated}
        />
      ))}
    </div>
  );
};

export default PostList;
