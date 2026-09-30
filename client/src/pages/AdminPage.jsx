import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageCircle,
  Heart,
  Megaphone,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import api from '../api/client';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'posts', 'announcement'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Announcement Form
  const [announcementText, setAnnouncementText] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Non-admins cannot access this page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

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
    } catch (err) {
      showToast('Failed to load admin telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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
    if (!window.confirm('Delete this course member and all their posts? This action is irreversible.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      showToast('Course member removed', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove user', 'error');
    }
  };

  const handleForceDeletePost = async (postId) => {
    if (!window.confirm('Remove this post as course moderator?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPostsList((prev) => prev.filter((p) => p._id !== postId));
      showToast('Post moderated and removed', 'info');
    } catch (err) {
      showToast('Failed to remove post', 'error');
    }
  };

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setSendingAnnouncement(true);
    try {
      await api.post('/posts', {
        content: announcementText.trim(),
        isAnnouncement: true,
        isPinned: true,
      });
      setAnnouncementText('');
      showToast('Official course announcement published!', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to publish announcement', 'error');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h1 className="text-lg font-extrabold tracking-tight text-zinc-100">Faculty Administration</h1>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
          CS-518 Moderator Panel
        </span>
      </header>

      {/* Tabs */}
      <div className="grid grid-cols-4 border-b border-zinc-800/80 text-xs sm:text-sm font-semibold text-center">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: `Users (${usersList.length})` },
          { id: 'posts', label: `Moderation (${postsList.length})` },
          { id: 'announcement', label: 'Broadcast' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 relative transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-amber-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 flex-1">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 animate-pulse">Loading administration data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Total Enrolled</p>
                      <p className="text-xl font-extrabold text-zinc-100">{stats?.totalUsers || 0}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Total Posts</p>
                      <p className="text-xl font-extrabold text-zinc-100">{stats?.totalPosts || 0}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Discussion Comments</p>
                      <p className="text-xl font-extrabold text-zinc-100">{stats?.totalComments || 0}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Total Likes</p>
                      <p className="text-xl font-extrabold text-zinc-100">{stats?.totalLikes || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400">
                  <h3 className="font-bold text-sm text-zinc-200 mb-2">CS-518 Governance & Policies</h3>
                  <p className="leading-relaxed">
                    As course administrator, you have full oversight over student discourse, team coordination, and platform security. Use the Broadcast tab to publish announcements that pin to the top of all students' feeds.
                  </p>
                </div>
              </div>
            )}

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Member</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Posts</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {usersList.map((u) => (
                        <tr key={u._id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar src={u.avatarUrl} name={u.name} size="xs" role={u.role} />
                              <div>
                                <p className="font-semibold text-zinc-100">{u.name}</p>
                                <p className="text-[11px] text-zinc-500">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-zinc-400">{u.email}</td>
                          <td className="p-3">
                            <Badge variant={u.role === 'admin' ? 'admin' : 'neutral'} size="xs">
                              {u.role === 'admin' ? 'Instructor' : 'Student'}
                            </Badge>
                          </td>
                          <td className="p-3 font-mono">{u.postsCount}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                u.isApproved
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {u.isApproved ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {u._id !== user._id && (
                              <>
                                <button
                                  onClick={() => handleToggleRole(u)}
                                  title="Toggle Role"
                                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                >
                                  {u.role === 'admin' ? 'Demote' : 'Promote'}
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  title="Toggle Status"
                                  className={`px-2 py-1 rounded transition-colors ${
                                    u.isApproved
                                      ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/30'
                                      : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/30'
                                  }`}
                                >
                                  {u.isApproved ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  title="Delete Member"
                                  className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODERATION TAB */}
            {activeTab === 'posts' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Moderation controls allow instructors to delete off-topic or inappropriate posts.
                  </span>
                </div>

                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/30">
                  {postsList.map((post) => (
                    <div key={post._id} className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-200">
                            {post.author?.name}
                          </span>
                          <span className="text-[11px] text-zinc-500">@{post.author?.username}</span>
                          {post.isAnnouncement && <Badge variant="announcement" size="xs">Announcement</Badge>}
                        </div>
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap">{post.content}</p>
                      </div>

                      <button
                        onClick={() => handleForceDeletePost(post._id)}
                        className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BROADCAST ANNOUNCEMENT TAB */}
            {activeTab === 'announcement' && (
              <div className="max-w-xl mx-auto p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-2">
                  <Megaphone className="w-5 h-5" />
                  <span>Broadcast Course Announcement</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Announcements are pinned to the top of the course feed and push instant notifications to all 35 students in the class.
                </p>

                <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    rows={4}
                    maxLength={280}
                    placeholder="Enter official course notice (e.g. assignment deadline adjustment, room change, milestone review)..."
                    className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500">
                      {280 - announcementText.length} characters left
                    </span>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!announcementText.trim() || sendingAnnouncement}
                      isLoading={sendingAnnouncement}
                      className="bg-amber-600 hover:bg-amber-500 text-white"
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>Broadcast to Class</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
