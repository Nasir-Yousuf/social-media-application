import React, { useState, useEffect, useCallback } from 'react';
import { Code2, Search, RefreshCw, X } from 'lucide-react';
import PostComposer from '../components/posts/PostComposer';
import PostList from '../components/posts/PostList';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

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

export const CodeHubPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const { showToast } = useNotifications();

  // Debounce search query
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
        const fetchedPosts = res.data.posts || [];
        setPosts(fetchedPosts);
        setTotalCount(res.data.total || fetchedPosts.length);
      } catch (err) {
        showToast('Could not load code snippets feed', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedLanguage, debouncedQuery, showToast]
  );

  useEffect(() => {
    fetchCodeFeed();

    const handleNewPost = () => {
      fetchCodeFeed(true);
    };
    window.addEventListener('clearfeed:newPost', handleNewPost);
    window.addEventListener('pulse518:newPost', handleNewPost);
    return () => {
      window.removeEventListener('clearfeed:newPost', handleNewPost);
      window.removeEventListener('pulse518:newPost', handleNewPost);
    };
  }, [fetchCodeFeed]);

  const handlePostCreated = (newPost) => {
    if (
      newPost.codeSnippet &&
      ((newPost.codeSnippet.files && newPost.codeSnippet.files.length > 0) || newPost.codeSnippet.code)
    ) {
      setPosts((prev) => [newPost, ...prev]);
      setTotalCount((prev) => prev + 1);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <div className="p-4 sm:p-5 space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Code Hub</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 font-mono font-semibold">
              {totalCount} workspaces
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
            Multi-file VS Code snippets, algorithms, and experiments.
          </p>
        </div>

        <button
          onClick={() => fetchCodeFeed(true)}
          disabled={refreshing || loading}
          title="Refresh code feed"
          className="p-2 text-neutral-400 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50 cursor-pointer active:scale-90"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-500' : ''}`} />
        </button>
      </div>

      {/* Search & Language Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code by language, keyword, filename, or syntax..."
            className="w-full bg-white dark:bg-[#121519] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pl-11 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/25 ring-2 ring-sky-500/30'
                    : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Composer */}
      <PostComposer
        onPostCreated={handlePostCreated}
        initialShowCode={true}
        initialLanguage={selectedLanguage !== 'all' ? selectedLanguage : 'javascript'}
      />

      {/* Code Stream */}
      <PostList
        posts={posts}
        loading={loading}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
        emptyMessage={
          selectedLanguage !== 'all'
            ? `No ${selectedLanguage} snippets found.`
            : 'No code snippets shared yet.'
        }
        emptyDescription="Share your code workspaces, multi-file projects, or snippets using the editor above."
      />
    </div>
  );
};

export default CodeHubPage;
