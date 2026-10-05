import React from 'react';
import PostCard from './PostCard';
import { ChronologicalIcon } from '../common/ClearfeedIcons';
import Button from '../common/Button';

export const PostList = ({
  posts = [],
  loading = false,
  onPostDeleted,
  onPostUpdated,
  emptyMessage = 'No posts yet.',
  emptyDescription = 'When members share thoughts or code, they appear here in direct chronological order.',
  showChronologicalBadge = false,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-2xs animate-pulse"
          >
            <div className="flex gap-3.5">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-28" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded w-20" />
                </div>
                <div className="h-4 bg-neutral-200/70 dark:bg-neutral-800/60 rounded w-full" />
                <div className="h-4 bg-neutral-200/50 dark:bg-neutral-800/40 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] py-16 px-6 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-2xs">
          <ChronologicalIcon className="w-7 h-7" />
        </div>
        <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 font-sans tracking-tight">
          {emptyMessage}
        </p>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm font-sans leading-relaxed">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chronological Transparency Badge */}
      {showChronologicalBadge && (
        <div className="flex items-center justify-between px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 select-none">
          <div className="flex items-center gap-1.5 font-mono text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-3 py-1 rounded-full border border-sky-200/70 dark:border-sky-500/20 shadow-2xs">
            <ChronologicalIcon className="w-3.5 h-3.5" />
            <span>Chronological • No Algorithm</span>
          </div>
          <span className="text-[11px] font-medium text-neutral-400">Latest feed updates</span>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onPostDeleted={onPostDeleted}
          onPostUpdated={onPostUpdated}
        />
      ))}

      {/* Pagination: Deliberate "Load more" button */}
      {hasMore && onLoadMore && (
        <div className="pt-4 pb-6 flex justify-center">
          <Button
            variant="outline"
            size="md"
            onClick={onLoadMore}
            isLoading={loadingMore}
            className="w-full sm:w-auto px-8 font-semibold"
          >
            Load earlier posts
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostList;
