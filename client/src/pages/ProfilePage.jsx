import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  Calendar,
  Code2,
  FileText,
  UserCheck,
  UserPlus,
  ArrowLeft,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import PostList from '../components/posts/PostList';
import EditProfileModal from '../components/users/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { FacultyBadge } from '../components/common/ClearfeedIcons';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'code'
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Followers / Following Modal
  const [connectionsModal, setConnectionsModal] = useState({ isOpen: false, title: '', users: [] });
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const fetchProfileAndPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/profile/${username}`),
        api.get(`/posts/user/${username}`),
      ]);
      setProfile(profileRes.data.user);
      setPosts(postsRes.data.posts || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [username, showToast]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await api.delete(`/users/${profile._id}/follow`);
        setProfile((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1),
        }));
        showToast(`Unfollowed @${profile.username}`, 'info');
      } else {
        await api.post(`/users/${profile._id}/follow`);
        setProfile((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1,
        }));
        showToast(`Following @${profile.username}`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update follow', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const openConnectionsModal = async (type) => {
    if (!profile) return;
    setConnectionsModal({
      isOpen: true,
      title: type === 'followers' ? 'Followers' : 'Following',
      users: [],
    });
    setConnectionsLoading(true);
    try {
      const res = await api.get(`/users/${profile._id}/${type}`);
      setConnectionsModal((prev) => ({
        ...prev,
        users: res.data[type] || [],
      }));
    } catch (err) {
      showToast('Could not load connections', 'error');
    } finally {
      setConnectionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="p-6 rounded-xl cf-surface border cf-border space-y-4">
          <div className="w-20 h-20 rounded-full bg-[var(--color-cf-border)]" />
          <div className="h-5 bg-[var(--color-cf-border)] rounded w-44" />
          <div className="h-3 bg-[var(--color-cf-border)]/60 rounded w-28" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center cf-text-muted">
        <h2 className="text-xl font-bold cf-text">Member not found</h2>
        <p className="text-sm mt-1">This user profile does not exist.</p>
        <NavLink
          to="/"
          className="inline-block mt-4 text-sm text-[var(--color-cf-accent)] hover:underline font-semibold"
        >
          &larr; Back to Feed
        </NavLink>
      </div>
    );
  }

  const isSelf = profile.isSelf || currentUser?._id === profile._id;

  const codePosts = posts.filter(
    (p) =>
      p.codeSnippet &&
      ((Array.isArray(p.codeSnippet.files) && p.codeSnippet.files.length > 0) || p.codeSnippet.code)
  );

  const displayedPosts = activeTab === 'code' ? codePosts : posts;

  return (
    <div className="space-y-6 font-sans">
      {/* Profile Card */}
      <div className="p-6 rounded-xl cf-surface border cf-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar
              src={profile.avatarUrl}
              name={profile.name}
              size="xl"
              showRoleBadge={true}
              role={profile.role}
            />

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight cf-text">{profile.name}</h1>
                {profile.role === 'admin' && (
                  <FacultyBadge className="w-4 h-4 text-[var(--color-cf-amber)]" />
                )}
              </div>
              <p className="text-sm cf-text-muted">@{profile.username}</p>

              {profile.status && (
                <div className="pt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)] text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] font-medium inline-block">
                    {profile.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            {isSelf ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto"
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={profile.isFollowing ? 'outline' : 'secondary'}
                size="sm"
                onClick={handleFollowToggle}
                isLoading={followLoading}
                className="w-full sm:w-auto px-5"
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 cf-text font-sans text-sm leading-relaxed whitespace-pre-wrap">
            {profile.bio}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-5 pt-4 border-t cf-border text-xs cf-text-muted flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'recently'}
            </span>
          </span>

          <button
            onClick={() => openConnectionsModal('following')}
            className="hover:cf-text transition-colors cursor-pointer"
          >
            <strong className="cf-text font-bold">{profile.followingCount || 0}</strong> Following
          </button>

          <button
            onClick={() => openConnectionsModal('followers')}
            className="hover:cf-text transition-colors cursor-pointer"
          >
            <strong className="cf-text font-bold">{profile.followersCount || 0}</strong> Followers
          </button>

          <span>
            <strong className="cf-text font-bold">{profile.postsCount || 0}</strong> Posts
          </span>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b cf-border pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold cf-btn-transition cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
              : 'cf-text-muted hover:cf-text hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold cf-btn-transition cursor-pointer ${
            activeTab === 'code'
              ? 'bg-[var(--color-cf-accent)] text-white shadow-sm'
              : 'cf-text-muted hover:cf-text hover:bg-[var(--color-cf-surface)] dark:hover:bg-[var(--color-cfd-surface)]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Code ({codePosts.length})</span>
        </button>
      </div>

      {/* Posts Stream */}
      <PostList
        posts={displayedPosts}
        emptyMessage={
          activeTab === 'code' ? 'No code snippets posted yet.' : 'No posts published yet.'
        }
        emptyDescription="Thoughts and code snippets written by this member will show up here."
        onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
        onPostUpdated={(up) => setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))}
      />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {/* Connections Modal */}
      <Modal
        isOpen={connectionsModal.isOpen}
        onClose={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
        title={connectionsModal.title}
      >
        <div className="space-y-3 py-1">
          {connectionsLoading ? (
            <div className="py-6 text-center text-xs cf-text-muted">Loading...</div>
          ) : connectionsModal.users.length === 0 ? (
            <div className="py-8 text-center text-xs cf-text-muted">
              No {connectionsModal.title.toLowerCase()} yet.
            </div>
          ) : (
            connectionsModal.users.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg cf-surface border cf-border"
              >
                <NavLink
                  to={`/profile/${u.username}`}
                  onClick={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs cf-text truncate">{u.name}</p>
                    <p className="text-[11px] cf-text-muted truncate">@{u.username}</p>
                  </div>
                </NavLink>

                <NavLink
                  to={`/profile/${u.username}`}
                  onClick={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
                  className="text-xs text-[var(--color-cf-accent)] hover:underline font-semibold"
                >
                  View &rarr;
                </NavLink>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
