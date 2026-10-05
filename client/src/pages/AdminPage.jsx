import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageCircle,
  Heart,
  Flame,
  Trash2,
} from 'lucide-react';
import api from '../api/client';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { FacultyBadge } from '../components/common/ClearfeedIcons';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'posts', 'announcement'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Announcement Form
  const [announcementText, setAnnouncementText] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, postsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/posts'),
      ]);
      setStats(overviewRes.data.stats);
      setUsersList(usersRes.data.users || []);
      setPostsList(postsRes.data.posts || []);
    } catch {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  // Non-admins cannot access this page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleToggleRole = async (targetUser) => {
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/role`);
      showToast(res.data.message, 'success');
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: res.data.user.role } : u))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role', 'error');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    try {
      const res = await api.patch(`/admin/users/${targetUser._id}/status`);
      showToast(res.data.message, 'info');
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isApproved: res.data.user.isApproved } : u))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this member and all their posts? This action is irreversible.')) return;
    setDeletingUserId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      showToast('Member removed', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove user', 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleForceDeletePost = async (postId) => {
    if (!window.confirm('Remove this post as administrator?')) return;
    setDeletingPostId(postId);
    try {
      await api.delete(`/posts/${postId}`);
      setPostsList((prev) => prev.filter((p) => p._id !== postId));
      showToast('Post removed', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove post', 'error');
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementText.trim() || sendingAnnouncement) return;

    setSendingAnnouncement(true);
    try {
      await api.post('/posts', {
        content: announcementText.trim(),
        isAnnouncement: true,
      });
      showToast('Official announcement published to all feeds', 'success');
      setAnnouncementText('');
      window.dispatchEvent(new CustomEvent('clearfeed:newPost'));
      fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to broadcast announcement', 'error');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const [purging, setPurging] = useState(false);
  const handlePurgeAllData = async () => {
    const confirmation = window.prompt(
      '⚠️ DANGER: This will permanently delete ALL dummy users, posts, messages, comments, likes, and follows from MongoDB.\n\nType "RESET" to confirm:'
    );
    if (confirmation !== 'RESET') return;

    setPurging(true);
    try {
      const res = await api.post('/admin/purge-all-data');
      showToast(res.data.message || 'All platform data purged successfully', 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to purge data', 'error');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-6 font-sans">
      {/* Top Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Administration</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
              Platform metrics, governance, moderation, and broadcast tools.
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
          <FacultyBadge className="w-3.5 h-3.5" />
          Administrator
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2 select-none overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: `Users (${usersList.length})` },
          { id: 'posts', label: `Moderation (${postsList.length})` },
          { id: 'announcement', label: 'Broadcast' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 active:scale-95 ${
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

      <div>
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">Loading administration data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <Users className="w-5 h-5 text-sky-500 mb-2" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Users</p>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white mt-0.5">{stats?.totalUsers || 0}</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <FileText className="w-5 h-5 text-sky-500 mb-2" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Posts</p>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white mt-0.5">{stats?.totalPosts || 0}</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <MessageCircle className="w-5 h-5 text-sky-500 mb-2" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Comments</p>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white mt-0.5">{stats?.totalComments || 0}</p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <Heart className="w-5 h-5 text-rose-500 mb-2" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Likes</p>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white mt-0.5">{stats?.totalLikes || 0}</p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 shadow-2xs">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-1.5">
                    Clearfeed Administration & Governance
                  </h3>
                  <p className="leading-relaxed font-sans text-xs">
                    As an administrator, you have full oversight over user accounts, content moderation, and platform announcements. Use the Broadcast tab to publish announcements that pin to the top of all feeds.
                  </p>
                </div>

                {/* DANGER ZONE: Platform Data Reset */}
                <div className="p-5 sm:p-6 rounded-3xl bg-red-500/5 border border-red-500/20 text-xs shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-red-600 dark:text-red-400">
                        Platform Reset & Data Cleanup
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
                        Permanently purge all dummy users, sample posts, comments, likes, and messages from MongoDB to test with real users.
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handlePurgeAllData}
                      loading={purging}
                      className="shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Purge All Dummy Data
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] shadow-2xs">
                <table className="w-full text-left text-xs text-neutral-900 dark:text-neutral-100">
                  <thead className="border-b border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 uppercase">
                    <tr>
                      <th className="p-3.5">Member</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="p-3.5 flex items-center gap-2.5">
                          <Avatar src={u.avatarUrl} name={u.name} size="xs" />
                          <div>
                            <span className="font-semibold block">{u.name}</span>
                            <span className="text-[10px] text-neutral-400">@{u.username}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-neutral-500 dark:text-neutral-400">{u.email}</td>
                        <td className="p-3.5">
                          <Badge variant={u.role === 'admin' ? 'admin' : 'neutral'}>
                            {u.role === 'admin' ? 'Admin' : 'Member'}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                              u.isApproved ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="text-[11px] font-medium">{u.isApproved ? 'Active' : 'Suspended'}</span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleToggleRole(u)}
                            className="text-[11px]"
                          >
                            {u.role === 'admin' ? 'Make Member' : 'Make Admin'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleToggleStatus(u)}
                            className="text-[11px]"
                          >
                            {u.isApproved ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            isLoading={deletingUserId === u._id}
                            disabled={deletingUserId === u._id}
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-[11px]"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MODERATION TAB */}
            {activeTab === 'posts' && (
              <div className="space-y-3">
                {postsList.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-8 text-center">No posts to moderate.</p>
                ) : (
                  postsList.map((p) => (
                    <div
                      key={p._id}
                      className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] flex items-start justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">@{p.author?.username || 'unknown'}</span>
                          <span className="text-[11px] text-neutral-400">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 font-sans line-clamp-2">{p.content}</p>
                      </div>

                      <Button
                        variant="danger"
                        size="xs"
                        isLoading={deletingPostId === p._id}
                        disabled={deletingPostId === p._id}
                        onClick={() => handleForceDeletePost(p._id)}
                        className="shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* BROADCAST TAB */}
            {activeTab === 'announcement' && (
              <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 max-w-xl">
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                    <Flame className="w-4 h-4" />
                    <span>Publish Announcement to All Members</span>
                  </div>

                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    rows={4}
                    placeholder="Write an announcement to pin to the top of all members' feeds..."
                    className="w-full bg-neutral-50 dark:bg-black/50 p-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 resize-none font-sans leading-relaxed"
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!announcementText.trim() || sendingAnnouncement}
                    isLoading={sendingAnnouncement}
                    className="font-bold"
                  >
                    Broadcast Announcement
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
