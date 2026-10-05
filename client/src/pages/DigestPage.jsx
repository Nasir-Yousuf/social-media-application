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
        <div className="h-24 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800" />
        <div className="h-44 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800" />
      </div>
    );
  }

  const stats = digest?.stats || {};
  const topPosts = digest?.topPosts || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Weekly Digest</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-sans">
              A calm summary of thoughts, code, and discussions from the past 7 days.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center shadow-2xs">
          <MessageSquare className="w-5 h-5 mx-auto mb-2 text-sky-500" />
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{stats.totalPosts || 0}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Posts shared</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center shadow-2xs">
          <Code2 className="w-5 h-5 mx-auto mb-2 text-amber-500" />
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{stats.codeSnippets || 0}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Workspaces</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center shadow-2xs">
          <Users className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{stats.newMembers || 0}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">New members</div>
        </div>
      </div>

      {/* Top Posts */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Notable posts from this week
        </h2>

        {topPosts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-500 shadow-2xs">
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
