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
    <div className="space-y-6 font-sans">
      {/* Search Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, thoughts, code, and members..."
            className="w-full bg-white dark:bg-[#121519] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pl-11 pr-10 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 shadow-2xs transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchParams({});
                setResults({ users: [], posts: [] });
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {queryParam && (
          <div className="flex items-center gap-1.5 mt-3 select-none">
            {[
              { id: 'all', label: `All (${totalResults})` },
              { id: 'users', label: `People (${results.users?.length || 0})` },
              { id: 'posts', label: `Posts (${results.posts?.length || 0})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/25 ring-2 ring-sky-500/30'
                      : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Content */}
      {!queryParam ? (
        <div className="py-16 text-center bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Search Clearfeed</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
            Find topics, specific authors, technical questions, or shared code snippets.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 h-20" />
          ))}
        </div>
      ) : totalResults === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">No matches for "{queryParam}"</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">Check your spelling or try broader keywords.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">People</h3>
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
              <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Posts</h3>
              <PostList posts={results.posts} loading={false} emptyMessage="No posts found." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
