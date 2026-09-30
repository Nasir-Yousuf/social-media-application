import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  Calendar,
  Users,
  Check,
  UserPlus,
  Edit3,
  ArrowLeft,
  FileText,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import PostList from '../components/posts/PostList';
import EditProfileModal from '../components/users/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'likes'
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
      showToast(err.response?.data?.message || 'Failed to load member profile', 'error');
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
        showToast(`Now following @${profile.username}`, 'success');
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
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-32 bg-zinc-800/50 rounded-2xl" />
        <div className="flex gap-4 items-end">
          <div className="w-20 h-20 rounded-full bg-zinc-800 -mt-10" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-zinc-800 rounded w-40" />
            <div className="h-3 bg-zinc-800/60 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <h2 className="text-lg font-bold text-zinc-100">Member Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">This user does not appear to be enrolled in CS-518.</p>
        <NavLink to="/" className="inline-block mt-4 text-xs text-indigo-400 hover:underline">
          &larr; Return to Course Feed
        </NavLink>
      </div>
    );
  }

  const isSelf = profile.isSelf || currentUser?._id === profile._id;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3 flex items-center gap-4">
        <NavLink to="/" className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800">
          <ArrowLeft className="w-5 h-5" />
        </NavLink>
        <div>
          <h1 className="text-base font-bold text-zinc-100">{profile.name}</h1>
          <p className="text-xs text-zinc-400">{profile.postsCount} course posts</p>
        </div>
      </header>

      {/* Banner */}
      <div className="h-36 sm:h-44 bg-gradient-to-r from-indigo-950 via-zinc-900 to-violet-950 border-b border-zinc-800 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      </div>

      {/* Profile Details Header */}
      <div className="px-4 pb-4 border-b border-zinc-800/80 relative">
        {/* Avatar & Action Button Row */}
        <div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-3">
          <Avatar
            src={profile.avatarUrl}
            name={profile.name}
            size="xl"
            showRoleBadge={true}
            role={profile.role}
            className="ring-4 ring-zinc-950"
          />

          {isSelf ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <Button
              variant={profile.isFollowing ? 'outline' : 'primary'}
              size="sm"
              onClick={handleFollowToggle}
              isLoading={followLoading}
            >
              {profile.isFollowing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Identity & Bio */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-zinc-100">{profile.name}</h2>
              {profile.role === 'admin' ? (
                <Badge variant="admin" size="xs">
                  Course Instructor
                </Badge>
              ) : (
                <Badge variant="course" size="xs">
                  CS-518 Cohort
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400">@{profile.username}</p>
          </div>

          <p className="text-sm text-zinc-200 leading-relaxed max-w-xl whitespace-pre-wrap">
            {profile.bio || 'CS-518 student exploring modern web architecture.'}
          </p>

          {/* Meta & Stats */}
          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>
                Joined{' '}
                {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'Recently'}
              </span>
            </span>

            <button
              onClick={() => openConnectionsModal('following')}
              className="hover:underline flex items-center gap-1 text-zinc-300 cursor-pointer"
            >
              <strong className="text-zinc-100">{profile.followingCount}</strong>
              <span className="text-zinc-400">Following</span>
            </button>

            <button
              onClick={() => openConnectionsModal('followers')}
              className="hover:underline flex items-center gap-1 text-zinc-300 cursor-pointer"
            >
              <strong className="text-zinc-100">{profile.followersCount}</strong>
              <span className="text-zinc-400">Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Feed Tab Switcher */}
      <div className="grid grid-cols-2 border-b border-zinc-800/80 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-3 text-center relative transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'text-zinc-100 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Posts ({posts.length})</span>
          {activeTab === 'posts' && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-indigo-500 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('likes')}
          className={`py-3 text-center relative transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'likes'
              ? 'text-zinc-100 font-bold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Activity</span>
          {activeTab === 'likes' && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-rose-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* User Posts Stream */}
      <PostList
        posts={activeTab === 'posts' ? posts : posts.filter((p) => p.likesCount > 0)}
        loading={false}
        onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
        onPostUpdated={(up) => setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))}
        emptyMessage={`@${profile.username} hasn't posted anything in the course feed yet.`}
      />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {/* Followers / Following List Modal */}
      <Modal
        isOpen={connectionsModal.isOpen}
        onClose={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
        title={connectionsModal.title}
      >
        {connectionsLoading ? (
          <div className="py-6 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-zinc-800 rounded-xl" />
            ))}
          </div>
        ) : connectionsModal.users.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">No students to show.</p>
        ) : (
          <div className="divide-y divide-zinc-800/80 max-h-80 overflow-y-auto">
            {connectionsModal.users.map((u) => (
              <div key={u._id} className="py-2.5 flex items-center justify-between gap-3">
                <NavLink
                  to={`/profile/${u.username}`}
                  onClick={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
                  className="flex items-center gap-2.5 min-w-0 hover:opacity-80"
                >
                  <Avatar src={u.avatarUrl} name={u.name} size="sm" role={u.role} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-100 truncate">{u.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">@{u.username}</p>
                  </div>
                </NavLink>
                <NavLink
                  to={`/profile/${u.username}`}
                  onClick={() => setConnectionsModal({ isOpen: false, title: '', users: [] })}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Profile
                </NavLink>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
