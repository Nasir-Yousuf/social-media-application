import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, MessageSquare, AlertCircle } from 'lucide-react';
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

  const executeSearch = useCallback(async (searchQuery) => {
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
  }, [showToast]);

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

  const totalResults = results.users.length + results.posts.length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Search Input */}
      <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3.5">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search course posts, code snippets, or student names..."
            className="w-full bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </form>

        {/* Search Results Filter Tabs */}
        {queryParam && (
          <div className="grid grid-cols-3 border-t border-zinc-800/80 mt-3 text-xs font-semibold text-center">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'all' ? 'text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>All Results ({totalResults})</span>
              {activeTab === 'all' && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-indigo-500 rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`py-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'users' ? 'text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>Classmates ({results.users.length})</span>
              {activeTab === 'users' && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-indigo-500 rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'posts' ? 'text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>Posts ({results.posts.length})</span>
              {activeTab === 'posts' && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-indigo-500 rounded-t-full" />
              )}
            </button>
          </div>
        )}
      </header>

      {/* Results View */}
      <div className="flex-1">
        {!queryParam ? (
          <div className="py-20 text-center text-zinc-500 flex flex-col items-center gap-2">
            <Search className="w-8 h-8 text-zinc-600 mb-1" />
            <p className="text-sm font-semibold text-zinc-300">Search Course 518</p>
            <p className="text-xs max-w-xs text-zinc-400">
              Find classmates by name, username, or explore posts by key topics.
            </p>
          </div>
        ) : loading ? (
          <div className="p-4 space-y-4 animate-pulse">
            <div className="h-6 bg-zinc-800 rounded w-1/4" />
            <div className="h-20 bg-zinc-800/60 rounded-xl" />
            <div className="h-20 bg-zinc-800/40 rounded-xl" />
          </div>
        ) : totalResults === 0 ? (
          <div className="py-20 text-center text-zinc-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-zinc-600 mb-1" />
            <p className="text-sm font-semibold text-zinc-200">No results found for "{queryParam}"</p>
            <p className="text-xs text-zinc-500">
              Try searching for a different course keyword or student name.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Classmates Section */}
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <div className="p-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 mb-3">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Matching Classmates ({results.users.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.users.map((student) => (
                    <MemberCard key={student._id} member={student} />
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-bold text-zinc-300 flex items-center gap-2 bg-zinc-900/40 border-b border-zinc-800/60">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Matching Discussions ({results.posts.length})</span>
                </div>
                <PostList
                  posts={results.posts}
                  loading={false}
                  onPostDeleted={(id) =>
                    setResults((prev) => ({
                      ...prev,
                      posts: prev.posts.filter((p) => p._id !== id),
                    }))
                  }
                  onPostUpdated={(up) =>
                    setResults((prev) => ({
                      ...prev,
                      posts: prev.posts.map((p) => (p._id === up._id ? up : p)),
                    }))
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
