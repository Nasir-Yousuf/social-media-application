import React, { useState, useEffect, useCallback } from 'react';
import { Code2, Search, RefreshCw, Terminal, X } from 'lucide-react';
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
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="pb-3 border-b cf-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[var(--color-cf-accent)]" />
            <h1 className="text-xl font-bold tracking-tight cf-text">Code Hub</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full cf-surface border cf-border text-[var(--color-cf-accent)] font-mono font-semibold">
              {totalCount} workspaces
            </span>
          </div>
          <p className="text-xs cf-text-muted mt-0.5 font-serif italic">
            Multi-file VS Code snippets, algorithms, and experiments.
          </p>
        </div>

        <button
          onClick={() => fetchCodeFeed(true)}
          disabled={refreshing || loading}
          title="Refresh code feed"
          className="p-2 cf-text-muted hover:text-[var(--color-cf-accent)] hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[var(--color-cf-accent)]' : ''}`} />
        </button>
      </div>

      {/* Search & Language Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 cf-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code by language, keyword, filename, or syntax..."
            className="w-full cf-surface text-sm cf-text placeholder:cf-text-muted pl-11 pr-4 py-2.5 rounded-full border cf-border focus:outline-none cf-focus-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-xs cf-text-muted hover:cf-text cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Language Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold cf-btn-transition shrink-0 cursor-pointer ${
                selectedLanguage === lang.id
                  ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                  : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)] dark:hover:bg-[var(--color-cfd-elevated)]'
              }`}
            >
              {lang.label}
            </button>
          ))}
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
