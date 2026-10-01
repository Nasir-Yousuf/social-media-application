import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import PostCard from '../components/PostCard';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { VerifiedBadge } from '../components/TwitterIcons';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { user: currentUser, logout, updateUser } = useAuth();
  const { showToast } = useNotifications();

  // If no username passed, default to current user's username
  const targetUsername = route?.params?.username || currentUser?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'code'
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${targetUsername}`);
      setProfile(res.data.user);
      setPosts(res.data.posts || []);
    } catch (err) {
      showToast('Could not load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [targetUsername, showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isSelf = profile?.isSelf || currentUser?._id === profile?._id;

  // Follow / Unfollow
  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await api.delete(`/users/${profile._id}/follow`);
        setProfile((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, (prev.followersCount || 1) - 1),
        }));
        showToast(`Unfollowed @${profile.username}`, 'info');
      } else {
        await api.post(`/users/${profile._id}/follow`);
        setProfile((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: (prev.followersCount || 0) + 1,
        }));
        showToast(`Following @${profile.username}`, 'success');
      }
    } catch (err) {
      showToast('Failed to update follow status', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  // Avatar Upload (<100KB direct database storage via base64 data URI)
  const handlePickAvatar = async () => {
    if (!isSelf) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Please allow camera roll access to select a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4, // Compress to ensure ≤ 100KB
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Data = `data:image/jpeg;base64,${asset.base64}`;

        // Verify approximate size (base64 length * 0.75 <= 120KB)
        const sizeInKb = (asset.base64.length * 0.75) / 1024;
        if (sizeInKb > 150) {
          showToast('Image is larger than 100KB. Please choose a smaller photo.', 'error');
          return;
        }

        setUploadingAvatar(true);
        const res = await api.patch('/users/me/avatar', {
          avatarUrl: base64Data,
        });

        setProfile((prev) => ({ ...prev, avatarUrl: base64Data }));
        updateUser({ avatarUrl: base64Data });
        showToast('Profile photo updated!', 'success');
      }
    } catch (err) {
      showToast('Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Clearfeed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const codePosts = posts.filter(
    (p) =>
      p.codeSnippet &&
      ((Array.isArray(p.codeSnippet.files) && p.codeSnippet.files.length > 0) || p.codeSnippet.code)
  );

  const displayedPosts = activeTab === 'code' ? codePosts : posts;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerLoading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.centerLoading, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>Member not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.topBarTitle}>
          <Text style={styles.topBarName}>{profile.name}</Text>
          <Text style={styles.topBarPostCount}>{posts.length} posts</Text>
        </View>
        {isSelf && (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={17} color={colors.danger} style={{ marginRight: 4 }} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={(p) => navigation.navigate('PostDetail', { postId: p._id, post: p })}
            navigation={navigation}
          />
        )}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            {/* Avatar & Follow button row */}
            <View style={styles.avatarRow}>
              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={!isSelf || uploadingAvatar}
                activeOpacity={0.8}
                style={styles.avatarTouch}
              >
                <Avatar
                  src={profile.avatarUrl}
                  name={profile.name}
                  size="xl"
                  role={profile.role}
                  showRoleBadge={true}
                />
                {isSelf && (
                  <View style={styles.avatarEditBadge}>
                    <Ionicons name="camera" size={13} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.actionCol}>
                {!isSelf && (
                  <Button
                    variant={profile.isFollowing ? 'outline' : 'secondary'}
                    size="sm"
                    onPress={handleFollowToggle}
                    isLoading={followLoading}
                    style={styles.followBtn}
                  >
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </View>
            </View>

            {/* User Info */}
            <View style={styles.nameRow}>
              <Text style={styles.fullName}>{profile.name}</Text>
              {profile.role === 'admin' && (
                <VerifiedBadge size={16} style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text style={styles.handle}>@{profile.username}</Text>

            {profile.status ? (
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{profile.status}</Text>
              </View>
            ) : null}

            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

            {/* Followers / Following counts */}
            <View style={styles.statsRow}>
              <Text style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followingCount || 0} </Text>
                <Text style={styles.statLabel}>Following</Text>
              </Text>

              <Text style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followersCount || 0} </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </Text>
            </View>

            {/* Profile Tabs */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                onPress={() => setActiveTab('posts')}
                style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
                  Posts ({posts.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('code')}
                style={[styles.tabBtn, activeTab === 'code' && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, activeTab === 'code' && styles.tabTextActive]}>
                  Code ({codePosts.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsText}>
              {activeTab === 'code' ? 'No code snippets yet.' : 'No posts published yet.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingRight: 12,
  },
  backBtnText: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700',
  },
  topBarTitle: {
    flex: 1,
  },
  topBarName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  topBarPostCount: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  profileHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  avatarTouch: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  avatarEditBadgeText: {
    fontSize: 11,
  },
  actionCol: {},
  followBtn: {
    minWidth: 90,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  goldBadge: {
    backgroundColor: colors.gold,
    borderRadius: 6,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  goldBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  handle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    marginTop: 8,
  },
  statusPillText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  bio: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 16,
  },
  statItem: {
    fontSize: 13,
  },
  statNumber: {
    color: colors.text,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
  },
  tabsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
    paddingTop: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.white,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  emptyPosts: {
    padding: 40,
    alignItems: 'center',
  },
  emptyPostsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default ProfileScreen;
