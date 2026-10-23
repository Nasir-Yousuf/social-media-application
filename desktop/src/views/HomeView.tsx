import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Radio,
  Users,
  Sparkles,
  Send,
  Code2,
  RefreshCw,
  WifiOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMesh } from '../mesh/context/MeshContext';
import api from '../api/client';
import { Post, Conversation } from '../types';

interface HomeViewProps {
  onNavigate: (section: string) => void;
  onOpenConversation?: (convId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { user, backendConnected, checkAuth } = useAuth();
  const { identity, transportState, conversations: meshConvs } = useMesh();

  const [posts, setPosts] = useState<Post[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [postContent, setPostContent] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [postError, setPostError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setPostError(null);
    try {
      const [feedRes, convsRes] = await Promise.allSettled([
        api.get('/posts/feed?limit=10'),
        api.get('/messages/conversations'),
      ]);

      if (feedRes.status === 'fulfilled' && feedRes.value.data?.posts) {
        setPosts(feedRes.value.data.posts);
      }
      if (convsRes.status === 'fulfilled' && convsRes.value.data?.conversations) {
        setConversations(convsRes.value.data.conversations.slice(0, 5));
      }
    } catch {
      // Graceful offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || submitting) return;

    setSubmitting(true);
    setPostError(null);
    try {
      const res = await api.post('/posts', { content: postContent.trim() });
      if (res.data?.post) {
        setPosts([res.data.post, ...posts]);
        setPostContent('');
      }
    } catch (err: any) {
      setPostError(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalUnreadMessages = conversations.reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto p-6 space-y-6">
      {/* Offline Alert Banner */}
      {!backendConnected && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-sm">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-200">
                You're currently offline or backend is unreachable.
              </p>
              <p className="text-xs text-amber-300/80">
                Your saved Clearfeed Mesh conversations and local settings are still fully available.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              checkAuth();
              fetchData();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Welcome & Quick Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome Card */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Platform Status
            </span>
            <h2 className="text-lg font-bold text-neutral-100 mt-1">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Clearfeed Course Network & Anti-Algorithm Platform.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {backendConnected ? 'Connected to Clearfeed Cloud' : 'Offline / Standalone Mode'}
          </div>
        </div>

        {/* Messaging Hub Card */}
        <div
          onClick={() => onNavigate('messages')}
          className="bg-neutral-900/60 border border-neutral-800/80 hover:border-sky-500/40 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Online Messaging
              </span>
              <div className="text-2xl font-bold text-neutral-100 mt-1 flex items-center gap-2">
                {totalUnreadMessages > 0 ? (
                  <span className="text-sky-400">{totalUnreadMessages} New</span>
                ) : (
                  <span>All caught up</span>
                )}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-sky-400 group-hover:translate-x-1 transition font-medium">
            Open Messages <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Clearfeed Mesh Offline Card */}
        <div
          onClick={() => onNavigate('mesh')}
          className="bg-neutral-900/60 border border-neutral-800/80 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                <Radio className="w-3.5 h-3.5" />
                Clearfeed Mesh
              </div>
              <div className="text-sm font-semibold text-neutral-200 mt-1">
                {identity?.nickname || 'Local Identity Active'}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {meshConvs.length} offline conversations stored
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-400">
            <span className="text-neutral-400">Status: {transportState}</span>
            <span className="flex items-center group-hover:translate-x-1 transition font-medium">
              Open Mesh <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Composer & Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Feed & Composer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Post Composer */}
          <form
            onSubmit={handleCreatePost}
            className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                What are you studying or building?
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {280 - postContent.length} chars
              </span>
            </div>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              maxLength={280}
              placeholder="Share a study update, code question, or cohort insight..."
              rows={3}
              className="w-full bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500 resize-none"
            />
            {postError && (
              <p className="text-xs text-rose-400">{postError}</p>
            )}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => onNavigate('code')}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-sky-400 transition cursor-pointer"
              >
                <Code2 className="w-4 h-4" />
                Share Snippet in Code Hub
              </button>
              <button
                type="submit"
                disabled={!postContent.trim() || submitting || !backendConnected}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Posting...' : 'Post Update'}
              </button>
            </div>
          </form>

          {/* Feed List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-neutral-300">Recent Course Feed</h3>
              <button
                onClick={fetchData}
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Loading course discussions...
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl text-center text-xs text-neutral-400">
                No recent posts found. Be the first to share an update!
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700/60 rounded-2xl p-4 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                        {post.author?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-200">
                          {post.author?.name || 'Classmate'}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          @{post.author?.username || 'user'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 whitespace-pre-wrap pl-10">
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Chats & Mesh Tagline */}
        <div className="space-y-4">
          {/* Quick Chats */}
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Recent Chats
              </h4>
              <button
                onClick={() => onNavigate('messages')}
                className="text-xs text-sky-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {conversations.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 text-center">
                No active conversations yet.
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => onNavigate('messages')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-800/50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
                        {conv.otherUser?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-neutral-200 truncate">
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

          {/* Offline Mesh Info Banner */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Radio className="w-4 h-4" />
              Clearfeed Mesh
            </div>
            <p className="text-xs font-medium text-emerald-200">
              Connect nearby. Communicate offline.
            </p>
            <p className="text-[11px] text-emerald-400/80 leading-relaxed">
              Clearfeed Mesh allows direct peer-to-peer communication using versioned CFM1 wire packets and ChaCha20-Poly1305 end-to-end encryption. Works independently of the cloud server.
            </p>
            <button
              onClick={() => onNavigate('mesh')}
              className="w-full mt-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
            >
              Open Offline Mesh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
