import React from 'react';
import { Sparkles } from 'lucide-react';
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
            className="rounded-xl border cf-border cf-surface p-5 animate-pulse"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-cf-border)] dark:bg-[var(--color-cfd-border)] shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-[var(--color-cf-border)] dark:bg-[var(--color-cfd-border)] rounded w-28" />
                  <div className="h-3 bg-[var(--color-cf-border)]/50 rounded w-20" />
                </div>
                <div className="h-4 bg-[var(--color-cf-border)]/70 rounded w-full" />
                <div className="h-4 bg-[var(--color-cf-border)]/50 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border cf-border cf-surface py-16 px-4 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)] flex items-center justify-center text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)]">
          <ChronologicalIcon className="w-6 h-6" />
        </div>
        <p className="text-base font-bold cf-text font-sans">{emptyMessage}</p>
        <p className="text-xs cf-text-muted max-w-sm font-sans">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chronological Transparency Badge */}
      {showChronologicalBadge && (
        <div className="flex items-center justify-between px-2 py-1 text-xs cf-text-muted select-none">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)] px-2.5 py-1 rounded-full border border-[var(--color-cf-accent)]/20">
            <ChronologicalIcon className="w-3.5 h-3.5" />
            <span>Chronological • No Algorithm</span>
          </div>
          <span className="text-[11px]">Latest updates</span>
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

      {/* Pagination: Deliberate "Load more" button (anti infinite scroll doom loop) */}
      {hasMore && onLoadMore && (
        <div className="pt-4 pb-6 flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={onLoadMore}
            isLoading={loadingMore}
            className="w-full sm:w-auto px-8"
          >
            Load earlier posts
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostList;
