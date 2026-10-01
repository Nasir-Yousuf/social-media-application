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
  Lock,
  Unlock,
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
      showToast('Failed to load admin data', 'error');
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
    if (!window.confirm('Delete this member and all their posts? This action is irreversible.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      showToast('Member removed', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove user', 'error');
    }
  };

  const handleForceDeletePost = async (postId) => {
    if (!window.confirm('Remove this post as administrator?')) return;
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
      showToast('Official announcement published!', 'success');
      fetchAdminData();
    } catch (err) {
      showToast('Failed to publish announcement', 'error');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="pb-3 border-b cf-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[var(--color-cf-amber)]" />
          <h1 className="text-xl font-bold tracking-tight cf-text">Administration</h1>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-cf-amber-soft)] text-[var(--color-cf-amber)] font-bold flex items-center gap-1.5 border border-[var(--color-cf-amber)]/25">
          <FacultyBadge className="w-3.5 h-3.5" />
          Administrator
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b cf-border pb-2 select-none overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: `Users (${usersList.length})` },
          { id: 'posts', label: `Moderation (${postsList.length})` },
          { id: 'announcement', label: 'Broadcast' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cf-btn-transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
                : 'cf-surface border cf-border cf-text hover:bg-[var(--color-cf-elevated)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {loading ? (
          <div className="py-12 text-center text-xs cf-text-muted animate-pulse">Loading administration data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl cf-surface border cf-border">
                    <Users className="w-4 h-4 text-[var(--color-cf-accent)] mb-1" />
                    <p className="text-[11px] cf-text-muted">Total Users</p>
                    <p className="text-xl font-extrabold cf-text">{stats?.totalUsers || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl cf-surface border cf-border">
                    <FileText className="w-4 h-4 text-[var(--color-cf-accent)] mb-1" />
                    <p className="text-[11px] cf-text-muted">Total Posts</p>
                    <p className="text-xl font-extrabold cf-text">{stats?.totalPosts || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl cf-surface border cf-border">
                    <MessageCircle className="w-4 h-4 text-[var(--color-cf-accent)] mb-1" />
                    <p className="text-[11px] cf-text-muted">Comments</p>
                    <p className="text-xl font-extrabold cf-text">{stats?.totalComments || 0}</p>
                  </div>

                  <div className="p-4 rounded-xl cf-surface border cf-border">
                    <Heart className="w-4 h-4 text-[var(--color-cf-like)] mb-1" />
                    <p className="text-[11px] cf-text-muted">Likes</p>
                    <p className="text-xl font-extrabold cf-text">{stats?.totalLikes || 0}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl cf-surface border cf-border text-xs cf-text-muted">
                  <h3 className="font-bold text-sm cf-text mb-1">Clearfeed Administration & Governance</h3>
                  <p className="leading-relaxed font-serif text-sm">
                    As an administrator, you have full oversight over user accounts, content moderation, and platform announcements. Use the Broadcast tab to publish announcements that pin to the top of all feeds.
                  </p>
                </div>
              </div>
            )}

            {/* USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto rounded-xl border cf-border cf-surface">
                <table className="w-full text-left text-xs cf-text">
                  <thead className="border-b cf-border text-[11px] cf-text-muted uppercase">
                    <tr>
                      <th className="p-3">Member</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y cf-border">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-[var(--color-cf-elevated)] transition-colors">
                        <td className="p-3 flex items-center gap-2">
                          <Avatar src={u.avatarUrl} name={u.name} size="xs" />
                          <div>
                            <span className="font-semibold block">{u.name}</span>
                            <span className="text-[10px] cf-text-muted">@{u.username}</span>
                          </div>
                        </td>
                        <td className="p-3 cf-text-muted">{u.email}</td>
                        <td className="p-3">
                          <Badge variant={u.role === 'admin' ? 'admin' : 'neutral'}>
                            {u.role === 'admin' ? 'Admin' : 'Member'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                              u.isApproved ? 'bg-[var(--color-cf-success)]' : 'bg-[var(--color-cf-danger)]'
                            }`}
                          />
                          <span className="text-[11px]">{u.isApproved ? 'Active' : 'Suspended'}</span>
                        </td>
                        <td className="p-3 text-right space-x-1">
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
                  <p className="text-xs cf-text-muted py-6 text-center">No posts to moderate.</p>
                ) : (
                  postsList.map((p) => (
                    <div
                      key={p._id}
                      className="p-3.5 rounded-xl border cf-border cf-surface flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold cf-text">@{p.author?.username || 'unknown'}</span>
                          <span className="text-[11px] cf-text-muted">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="cf-text font-serif line-clamp-2">{p.content}</p>
                      </div>

                      <Button
                        variant="danger"
                        size="xs"
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
                <div className="p-4 rounded-xl cf-surface border cf-border space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-cf-amber)]">
                    <Flame className="w-4 h-4" />
                    <span>Publish Announcement to All Members</span>
                  </div>

                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    rows={4}
                    placeholder="Write an announcement to pin to the top of all members' feeds..."
                    className="w-full cf-bg p-3 rounded-lg border cf-border cf-text placeholder:cf-text-muted text-sm focus:outline-none cf-focus-ring resize-none font-serif leading-relaxed"
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!announcementText.trim() || sendingAnnouncement}
                    isLoading={sendingAnnouncement}
                    className="font-semibold"
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
