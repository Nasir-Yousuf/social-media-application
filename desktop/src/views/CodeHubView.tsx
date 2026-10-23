import React, { useState, useEffect, useCallback } from 'react';
import { Code2, Search, RefreshCw, X } from 'lucide-react';
import PostComposer from '../components/posts/PostComposer';
import PostList from '../components/posts/PostList';
import api from '../api/client';

const LANGUAGES = [
  { id: 'all', label: 'All Code' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'react', label: 'React' },
  { id: 'python', label: 'Python' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'sql', label: 'SQL' },
  { id: 'html', label: 'HTML/CSS' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'shell', label: 'Shell' },
];

export const CodeHubView: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCodeFeed = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        if (selectedLanguage !== 'all') {
          params.append('language', selectedLanguage);
        }
        if (debouncedQuery.trim()) {
          params.append('q', debouncedQuery.trim());
        }

        const res = await api.get(`/posts/code-snippets?${params.toString()}`);
        setPosts(res.data?.posts || []);
      } catch (err) {
        console.warn('Could not load code snippets feed:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedLanguage, debouncedQuery]
  );

  useEffect(() => {
    fetchCodeFeed();
  }, [fetchCodeFeed]);

  const handlePostCreated = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost: any) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-100">Code Hub</h1>
            <p className="text-xs text-neutral-400">
              Interactive sandbox repository of member code snippets, solutions, and scripts.
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchCodeFeed(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer border border-neutral-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Code Composer */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 shadow-sm">
        <PostComposer onPostCreated={handlePostCreated} compact={true} />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition cursor-pointer shrink-0 ${
                selectedLanguage === lang.id
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code snippets..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-neutral-400 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Code Post List */}
      <div className="space-y-4">
        <PostList
          posts={posts}
          loading={loading}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
          onLoadMore={() => {}}
          emptyMessage="No code snippets found."
          emptyDescription="Be the first to share a code snippet using the composer above!"
        />
      </div>
    </div>
  );
};

export default CodeHubView;
