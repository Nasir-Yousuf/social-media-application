import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageCircle,
  Heart,
  Trash2,
  Globe,
  Search,
  Copy,
  Check,
  Activity,
  ShieldCheck,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import api from '../api/client';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useConfirm } from '../context/ConfirmContext';
import { FacultyBadge } from '../components/common/ClearfeedIcons';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'posts', 'logs'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  // Security & Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditGuestCount, setAuditGuestCount] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditQuery, setAuditQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [copiedIp, setCopiedIp] = useState(null);

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

  const fetchAuditLogs = async (query = auditQuery, action = auditActionFilter) => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('ip', query.trim());
      if (action) params.append('action', action);
      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.logs || []);
      setAuditTotal(res.data.total || 0);
      setAuditGuestCount(res.data.totalGuestActions || 0);
    } catch {
      showToast('Could not load security audit logs', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'logs') {
      fetchAuditLogs();
    }
  }, [isAdmin, activeTab]);

  // Non-admins cannot access this page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleCopyIp = (ip) => {
    if (!ip || ip === 'Unknown' || ip === 'Not recorded') return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    showToast(`Copied IP: ${ip}`, 'info');
    setTimeout(() => setCopiedIp(null), 2000);
  };

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
    const ok = await confirm({
      title: 'Delete this member?',
      description: 'This member account and all their published posts, comments, and learning activity will be permanently erased. This action is irreversible.',
      confirmText: 'Delete member',
      variant: 'danger',
    });
    if (!ok) return;

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
    const ok = await confirm({
      title: 'Remove post as administrator?',
      description: 'This will permanently delete this post from the global feed, search index, and member profile.',
      confirmText: 'Remove post',
      variant: 'danger',
    });
    if (!ok) return;

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

  const handlePurgeAllData = async () => {
    const confirmation = window.prompt(
      'Type "PURGE" to permanently remove all non-admin dummy users, fake posts, and reset views:'
    );
    if (confirmation !== 'PURGE') {
      if (confirmation !== null) showToast('Purge aborted: confirmation did not match.', 'info');
      return;
    }

    setPurging(true);
    try {
      const res = await api.post('/admin/purge-all-data');
      showToast(res.data.message || 'Platform data purged successfully!', 'success');
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to purge data.', 'error');
    } finally {
      setPurging(false);
    }
  };

  const renderActionBadge = (action) => {
    switch (action) {
      case 'guest_login':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
            Guest Login
          </span>
        );
      case 'create_post':
        return (
          <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold">
            New Post
          </span>
        );
      case 'create_comment':
        return (
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">
            Comment
          </span>
        );
      case 'user_register':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
            Registered
          </span>
        );
      case 'user_login':
        return (
          <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] font-bold">
            User Login
          </span>
        );
      case 'delete_post':
      case 'delete_comment':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold">
            Deleted
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono text-[10px] font-medium">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Administration</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mt-0.5">
              Platform governance, member management, and security oversight for @{user?.username}.
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-semibold flex items-center gap-1.5">
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
          { id: 'logs', label: `Security & IP Logs (${auditTotal || '•'})` },
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
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-1.5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Clearfeed Administration & Governance
                  </h3>
                  <p className="leading-relaxed font-sans text-xs">
                    As an administrator, you have full oversight over user accounts, client IP address tracking, content moderation, and guest usage monitoring.
                  </p>
                </div>

                {/* DANGER ZONE: Platform Data Reset */}
                <div className="p-5 sm:p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-xs shadow-2xs">
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div>
                      <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                        <Trash2 className="w-4 h-4" />
                        Danger Zone: Purge Dummy Data
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed text-xs max-w-xl">
                        Clean up sample accounts and initial test posts while permanently preserving your admin credentials.
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
                      <th className="p-3.5">IP Address</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {usersList.map((u) => {
                      const displayIp = u.lastLoginIp || u.lastActiveIp || u.registrationIp || '—';
                      return (
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
                          <td className="p-3.5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                                  {displayIp}
                                </span>
                                {displayIp !== '—' && (
                                  <button
                                    onClick={() => handleCopyIp(displayIp)}
                                    title="Copy IP address"
                                    className="text-neutral-400 hover:text-sky-500 transition-colors cursor-pointer p-0.5"
                                  >
                                    {copiedIp === displayIp ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                              {u.registrationIp && u.registrationIp !== displayIp && (
                                <span className="text-[10px] text-neutral-400 font-mono" title="Registered IP">
                                  Reg: {u.registrationIp}
                                </span>
                              )}
                              {u.username === 'guest' && Array.isArray(u.recentIps) && u.recentIps.length > 0 && (
                                <span className="text-[10px] text-sky-500 font-medium">
                                  {u.recentIps.length} guest sessions logged
                                </span>
                              )}
                            </div>
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
                      );
                    })}
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
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">@{p.author?.username || 'unknown'}</span>
                          <span className="text-[11px] text-neutral-400">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                          </span>
                          {p.ipAddress && (
                            <span
                              title={`Author IP Address: ${p.ipAddress}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold"
                            >
                              <Globe className="w-2.5 h-2.5" />
                              IP: {p.ipAddress}
                            </span>
                          )}
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

            {/* SECURITY & IP LOGS TAB */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {/* Security Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <Activity className="w-5 h-5 text-sky-500 mb-1.5" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Security Events</p>
                    <p className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">{auditTotal}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <Globe className="w-5 h-5 text-amber-500 mb-1.5" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Guest Actions Monitored</p>
                    <p className="text-xl font-black text-amber-500 mt-0.5">{auditGuestCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                    <Terminal className="w-5 h-5 text-emerald-500 mb-1.5" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Active IP Filter</p>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white mt-1 truncate">
                      {auditQuery || auditActionFilter || 'Tracking All IPs & Events'}
                    </p>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={auditQuery}
                      onChange={(e) => setAuditQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs(auditQuery, auditActionFilter)}
                      placeholder="Search by IP address or username..."
                      className="w-full bg-white dark:bg-[#121519] text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500"
                    />
                  </div>

                  <select
                    value={auditActionFilter}
                    onChange={(e) => {
                      setAuditActionFilter(e.target.value);
                      fetchAuditLogs(auditQuery, e.target.value);
                    }}
                    className="bg-white dark:bg-[#121519] text-xs text-neutral-800 dark:text-neutral-200 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Security Events</option>
                    <option value="guest_login">Guest Logins</option>
                    <option value="create_post">Post Creations</option>
                    <option value="create_comment">Comments</option>
                    <option value="user_register">User Registrations</option>
                    <option value="user_login">User Logins</option>
                    <option value="delete_post">Post Deletions</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAuditLogs(auditQuery, auditActionFilter)}
                    loading={auditLoading}
                    className="shrink-0 text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${auditLoading ? 'animate-spin' : ''}`} />
                    Filter / Refresh
                  </Button>
                </div>

                {/* Logs Table */}
                <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] shadow-2xs">
                  {auditLogs.length === 0 ? (
                    <div className="py-16 text-center text-xs text-neutral-400">
                      No security audit logs found matching current criteria.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-neutral-900 dark:text-neutral-100">
                      <thead className="border-b border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 uppercase">
                        <tr>
                          <th className="p-3.5">Time</th>
                          <th className="p-3.5">Actor</th>
                          <th className="p-3.5">Action</th>
                          <th className="p-3.5">Client IP</th>
                          <th className="p-3.5">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {auditLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                            <td className="p-3.5 whitespace-nowrap text-neutral-400 text-[11px]">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-3.5 font-bold whitespace-nowrap">
                              <span className={log.username === 'guest' ? 'text-amber-500' : 'text-sky-500'}>
                                @{log.username}
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {renderActionBadge(log.action)}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                                <span>{log.ipAddress}</span>
                                {log.ipAddress && log.ipAddress !== 'Unknown' && (
                                  <button
                                    onClick={() => handleCopyIp(log.ipAddress)}
                                    title="Copy IP"
                                    className="text-neutral-400 hover:text-sky-500 transition-colors p-0.5 cursor-pointer"
                                  >
                                    {copiedIp === log.ipAddress ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 text-neutral-600 dark:text-neutral-400 font-sans max-w-xs truncate">
                              {log.details?.contentPreview ||
                                log.details?.note ||
                                log.details?.description ||
                                (log.details?.email ? `Email: ${log.details.email}` : '—')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
