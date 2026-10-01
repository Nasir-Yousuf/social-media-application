import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import api from '../api/client';
import MemberCard from '../components/users/MemberCard';
import PostList from '../components/posts/PostList';
import { useNotifications } from '../context/NotificationContext';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'users', 'posts'
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotifications();

  const executeSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults({ users: [], posts: [] });
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setResults(res.data);
      } catch (err) {
        showToast('Search execution failed', 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      executeSearch(queryParam);
    }
  }, [queryParam, executeSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      executeSearch(query.trim());
    }
  };

  const totalResults = (results.users?.length || 0) + (results.posts?.length || 0);

  return (
    <div className="space-y-5 font-sans">
      {/* Search Header */}
      <div className="pb-3 border-b cf-border">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 cf-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, thoughts, code, and members..."
            className="w-full cf-surface text-sm cf-text placeholder:cf-text-muted pl-11 pr-10 py-2.5 rounded-full border cf-border focus:outline-none cf-focus-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchParams({});
                setResults({ users: [], posts: [] });
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-xs cf-text-muted hover:cf-text cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {queryParam && (
          <div className="flex items-center gap-1.5 mt-3 select-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold cf-btn-transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                  : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)] dark:hover:bg-[var(--color-cfd-elevated)]'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold cf-btn-transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                  : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)] dark:hover:bg-[var(--color-cfd-elevated)]'
              }`}
            >
              People ({results.users?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold cf-btn-transition cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                  : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)] dark:hover:bg-[var(--color-cfd-elevated)]'
              }`}
            >
              Posts ({results.posts?.length || 0})
            </button>
          </div>
        )}
      </div>

      {/* Results Content */}
      {!queryParam ? (
        <div className="py-16 text-center cf-surface border cf-border rounded-xl">
          <Search className="w-8 h-8 mx-auto mb-2 cf-text-muted" />
          <h2 className="text-base font-semibold cf-text">Search Clearfeed</h2>
          <p className="text-xs cf-text-muted mt-1 max-w-sm mx-auto font-serif italic">
            Find topics, specific authors, technical questions, or shared code snippets.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl cf-surface border cf-border h-20" />
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="py-16 text-center cf-surface border cf-border rounded-xl">
          <h3 className="text-base font-semibold cf-text">No matches for "{queryParam}"</h3>
          <p className="text-xs cf-text-muted mt-1">Check your spelling or try broader keywords.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold cf-text-muted uppercase tracking-wider">People</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.users.map((u) => (
                  <MemberCard key={u._id} member={u} />
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold cf-text-muted uppercase tracking-wider">Posts</h3>
              <PostList posts={results.posts} loading={false} emptyMessage="No posts found." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
