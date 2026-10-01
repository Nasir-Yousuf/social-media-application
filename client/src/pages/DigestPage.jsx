import React, { useState, useEffect } from 'react';
import { Newspaper, Code2, Users, MessageSquare } from 'lucide-react';
import api from '../api/client';
import PostCard from '../components/posts/PostCard';
import { useNotifications } from '../context/NotificationContext';

export const DigestPage = () => {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        const res = await api.get('/posts/digest/weekly');
        setDigest(res.data);
      } catch (err) {
        showToast('Could not load weekly digest', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDigest();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 rounded-xl cf-surface border cf-border" />
        <div className="h-40 rounded-xl cf-surface border cf-border" />
      </div>
    );
  }

  const stats = digest?.stats || {};
  const topPosts = digest?.topPosts || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b cf-border">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[var(--color-cf-accent)]" />
          <h1 className="text-xl font-bold tracking-tight cf-text">Weekly Digest</h1>
        </div>
        <p className="text-xs cf-text-muted mt-0.5 font-serif italic">
          A calm summary of thoughts, code, and discussions from the past 7 days.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl cf-surface border cf-border text-center">
          <MessageSquare className="w-4 h-4 mx-auto mb-1 text-[var(--color-cf-accent)]" />
          <div className="text-xl font-extrabold cf-text">{stats.totalPosts || 0}</div>
          <div className="text-[11px] cf-text-muted">Posts shared</div>
        </div>

        <div className="p-4 rounded-xl cf-surface border cf-border text-center">
          <Code2 className="w-4 h-4 mx-auto mb-1 text-[var(--color-cf-amber)]" />
          <div className="text-xl font-extrabold cf-text">{stats.codeSnippets || 0}</div>
          <div className="text-[11px] cf-text-muted">Code workspaces</div>
        </div>

        <div className="p-4 rounded-xl cf-surface border cf-border text-center">
          <Users className="w-4 h-4 mx-auto mb-1 text-[var(--color-cf-accent)]" />
          <div className="text-xl font-extrabold cf-text">{stats.newMembers || 0}</div>
          <div className="text-[11px] cf-text-muted">New members</div>
        </div>
      </div>

      {/* Top Posts */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold cf-text uppercase tracking-wider text-xs">
          Notable posts from this week
        </h2>

        {topPosts.length === 0 ? (
          <div className="p-8 rounded-xl cf-surface border cf-border text-center text-xs cf-text-muted">
            No posts recorded this week yet.
          </div>
        ) : (
          topPosts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default DigestPage;
