import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Radio,
  Users,
  RefreshCw,
  Plus,
  PenSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMesh } from '../mesh/context/MeshContext';
import api from '../api/client';
import PostComposer from '../components/posts/PostComposer';
import PostList from '../components/posts/PostList';
import LiveSpacesBar from '../components/spaces/LiveSpacesBar';
import { Conversation, User } from '../types';

interface HomeViewProps {
  onNavigate: (section: string) => void;
  onOpenConversation?: (convId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { user, backendConnected } = useAuth();
  const { conversations: meshConvs } = useMesh();

  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Right sidebar data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recentMembers, setRecentMembers] = useState<User[]>([]);

  const fetchFeed = useCallback(
    async (isRefresh = false, pageNum = 1) => {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await api.get(`/posts/feed?tab=${activeTab}&page=${pageNum}&limit=15`);
        const incoming = res.data?.posts || [];
        setPosts((prev) => (pageNum === 1 ? incoming : [...prev, ...incoming]));
        setHasMore(Boolean(res.data?.pagination?.hasMore));
        setPage(pageNum);
      } catch (err) {
        console.warn('Failed to load live feed from database:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab]
  );

  const fetchSidebarData = async () => {
    try {
      const [convsRes, usersRes] = await Promise.allSettled([
        api.get('/messages/conversations'),
        api.get('/users/directory'),
      ]);

      if (convsRes.status === 'fulfilled' && convsRes.value.data?.conversations) {
        setConversations(convsRes.value.data.conversations.slice(0, 5));
      }
      if (usersRes.status === 'fulfilled') {
        const list = usersRes.value.data?.users || usersRes.value.data?.members || [];
        setRecentMembers(list.slice(0, 5));
      }
    } catch {
      // Graceful offline fallback
    }
  };

  useEffect(() => {
    fetchFeed(false, 1);
    fetchSidebarData();

    const handleNewPost = () => {
      fetchFeed(true, 1);
    };
    window.addEventListener('clearfeed:newPost', handleNewPost);
    window.addEventListener('pulse518:newPost', handleNewPost);
    return () => {
      window.removeEventListener('clearfeed:newPost', handleNewPost);
      window.removeEventListener('pulse518:newPost', handleNewPost);
    };
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(false, page + 1);
    }
  };

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
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Header with Tabs & Refresh */}
          <div className="sticky top-0 z-10 backdrop-blur-xl bg-neutral-950/80 border border-neutral-800 rounded-2xl flex items-center justify-between p-1.5 shadow-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                For you
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'following'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                Following
              </button>
            </div>

            <div className="flex items-center gap-2 pr-2">
              <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                {posts.length > 0 ? `${posts.length} real posts` : 'Connecting to DB...'}
              </span>
              <button
                onClick={() => fetchFeed(true, 1)}
                disabled={refreshing || loading}
                title="Refresh feed"
                className="p-2 text-neutral-400 hover:text-sky-400 hover:bg-neutral-900 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Real Full PostComposer */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 shadow-sm">
            <PostComposer onPostCreated={handlePostCreated} compact={true} />
          </div>

          {/* Live Audio Spaces Bar */}
          <LiveSpacesBar />

          {/* Real Post List (with full likes, comments, bookmarks, markdown, code highlighting) */}
          <div className="space-y-4">
            <PostList
              posts={posts}
              loading={loading}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
              showChronologicalBadge={true}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
              emptyMessage={
                activeTab === 'following'
                  ? 'No posts from people you follow yet.'
                  : 'No posts in the database yet.'
              }
              emptyDescription={
                activeTab === 'following'
                  ? 'Follow classmates from the Members directory to curate your personal feed.'
                  : 'Be the first to share code or start a discussion using the composer above!'
              }
            />
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-5">
          {/* Recent Online Chats Card */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                Recent Chats
              </h4>
              <button
                onClick={() => onNavigate('messages')}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                Open Chats
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="py-4 text-center text-xs text-neutral-500 space-y-2">
                <p>No active conversations yet.</p>
                <button
                  onClick={() => onNavigate('messages')}
                  className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Start a Chat
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => onNavigate('messages')}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/60 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {conv.otherUser?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-neutral-200 truncate">
                          {conv.otherUser?.name || 'User'}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {conv.lastMessage?.content || 'Started a conversation'}
                        </p>
                      </div>
                    </div>
                    {(conv.unreadCount || 0) > 0 && (
                      <span className="px-1.5 py-0.5 bg-sky-500 text-white text-[10px] font-bold rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real Course Cohort Members */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Course Members
              </h4>
              <button
                onClick={() => onNavigate('members')}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                View Directory
              </button>
            </div>

            {recentMembers.length === 0 ? (
              <p className="text-xs text-neutral-500 py-2 text-center">Loading members...</p>
            ) : (
              <div className="space-y-2">
                {recentMembers.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/40 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {member.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-neutral-200 truncate">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-neutral-500 truncate">
                          @{member.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate(`profile/${member.username}`)}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium rounded-lg transition cursor-pointer shrink-0"
                    >
                      Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clearfeed Mesh Card */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Radio className="w-4 h-4 animate-pulse" />
                Clearfeed Mesh
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                100% Offline
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-200">
              Connect nearby. Communicate offline.
            </p>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              কাছাকাছি সংযুক্ত হোন। ইন্টারনেট ছাড়াই যোগাযোগ করুন। Direct peer-to-peer ChaCha20-Poly1305 encrypted multi-hop relay.
            </p>
            <button
              onClick={() => onNavigate('mesh')}
              className="w-full mt-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              Open Offline Mesh
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
