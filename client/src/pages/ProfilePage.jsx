import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Code2,
  FileText,
  MessageSquare,
  ArrowLeft,
  Camera,
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
  const navigate = useNavigate();
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
      <div className="flex flex-col font-sans animate-pulse">
        {/* Sticky Top Bar Skeleton */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-2 flex items-center gap-6">
          <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-1.5">
            <div className="w-28 h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="w-16 h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded" />
          </div>
        </div>
        {/* Banner Skeleton */}
        <div className="h-32 sm:h-44 w-full bg-neutral-200 dark:bg-neutral-800/60" />
        {/* Profile Info Skeleton */}
        <div className="px-4 sm:px-6 pb-4 space-y-4">
          <div className="flex justify-between items-end -mt-12 sm:-mt-14">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neutral-300 dark:bg-neutral-700 ring-4 ring-white dark:ring-black" />
            <div className="w-24 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-1" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="w-40 h-5 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="w-24 h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded" />
            <div className="w-full max-w-sm h-3 bg-neutral-100 dark:bg-neutral-800/50 rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col font-sans">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-2 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors text-neutral-800 dark:text-neutral-200 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">Profile</h1>
          </div>
        </div>

        {/* Not Found Body */}
        <div className="py-24 px-4 text-center text-neutral-500 dark:text-neutral-400">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">This account doesn’t exist</h2>
          <p className="text-sm mt-1">Try searching for another member.</p>
          <NavLink
            to="/"
            className="inline-block mt-4 px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors"
          >
            Back to Feed
          </NavLink>
        </div>
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
    <div className="flex flex-col font-sans">
      {/* Twitter Sticky Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-2 flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors text-neutral-800 dark:text-neutral-200 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white truncate leading-tight">
              {profile.name}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight">
            {profile.postsCount ?? posts.length} {((profile.postsCount ?? posts.length) === 1) ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Cover Banner */}
      <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-600/25 dark:from-sky-950/60 dark:via-indigo-950/40 dark:to-neutral-900 relative overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="absolute inset-0 opacity-20 dark:opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* Profile Header Details */}
      <div className="px-4 sm:px-6 pb-4">
        {/* Avatar and Action Buttons */}
        <div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-4">
          <div className="relative group">
            <div
              className={`ring-4 ring-white dark:ring-black rounded-full overflow-hidden inline-block bg-white dark:bg-black shadow-md ${
                isSelf ? 'cursor-pointer' : ''
              }`}
              onClick={() => isSelf && setIsEditModalOpen(true)}
              title={isSelf ? 'Click to change profile photo' : profile.name}
            >
              <Avatar
                src={profile.avatarUrl}
                name={profile.name}
                size="2xl"
                showRoleBadge={false}
              />
            </div>

            {isSelf && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                title="Change profile photo"
                className="absolute inset-0 rounded-full bg-black/45 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ring-4 ring-white dark:ring-black"
              >
                <Camera className="w-6 h-6 mb-0.5 drop-shadow-md" />
                <span className="text-[10px] font-bold">Edit</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            {isSelf ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="font-bold rounded-full px-4 text-sm"
              >
                Edit profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to={`/messages?user=${profile.username}`}
                  className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-sky-500 hover:border-sky-500/50 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                  title={`Direct Message @${profile.username}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </NavLink>

                <Button
                  variant={profile.isFollowing ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={handleFollowToggle}
                  isLoading={followLoading}
                  className="px-5 font-bold rounded-full text-sm"
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* User Identity Info */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                {profile.name}
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">@{profile.username}</p>
          </div>

          {profile.status && (
            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium inline-block border border-sky-200/50 dark:border-sky-500/20">
                {profile.status}
              </span>
            </div>
          )}

          {profile.bio && (
            <p className="text-sm text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 pt-1 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                Joined {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'recently'}
              </span>
            </span>
          </div>

          {/* Followers / Following counts */}
          <div className="flex items-center gap-5 pt-1 text-sm text-neutral-500 dark:text-neutral-400">
            <button
              onClick={() => openConnectionsModal('following')}
              className="hover:underline transition-all cursor-pointer flex items-center gap-1"
            >
              <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{profile.followingCount || 0}</strong>
              <span className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">Following</span>
            </button>

            <button
              onClick={() => openConnectionsModal('followers')}
              className="hover:underline transition-all cursor-pointer flex items-center gap-1"
            >
              <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{profile.followersCount || 0}</strong>
              <span className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex border-b border-neutral-200/80 dark:border-neutral-800/80">
        <button
          onClick={() => setActiveTab('posts')}
          className="flex-1 py-3.5 text-center font-bold text-sm hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors relative cursor-pointer"
        >
          <span
            className={`transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'posts'
                ? 'text-neutral-900 dark:text-white font-extrabold'
                : 'text-neutral-500 font-medium'
            }`}
          >
            <FileText className="w-4 h-4" />
            Posts ({posts.length})
          </span>
          {activeTab === 'posts' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-sky-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className="flex-1 py-3.5 text-center font-bold text-sm hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors relative cursor-pointer"
        >
          <span
            className={`transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'code'
                ? 'text-neutral-900 dark:text-white font-extrabold'
                : 'text-neutral-500 font-medium'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Code Hub ({codePosts.length})
          </span>
          {activeTab === 'code' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-sky-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Posts Stream */}
      <div>
        <PostList
          posts={displayedPosts}
          emptyMessage={
            activeTab === 'code' ? 'No code snippets posted yet.' : 'No posts published yet.'
          }
          emptyDescription="Thoughts and code snippets written by this member will show up here."
          onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
          onPostUpdated={(up) => setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))}
        />
      </div>

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
            <div className="py-6 text-center text-xs text-neutral-500">Loading...</div>
          ) : connectionsModal.users.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No {connectionsModal.title.toLowerCase()} yet.
            </div>
          ) : (
            connectionsModal.users.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50/70 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800"
              >
                <NavLink
                  to={`/profile/${u.username}`}
                  onClick={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">{u.name}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">@{u.username}</p>
                  </div>
                </NavLink>

                <NavLink
                  to={`/profile/${u.username}`}
                  onClick={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
                  className="text-xs text-sky-500 hover:underline font-semibold"
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
