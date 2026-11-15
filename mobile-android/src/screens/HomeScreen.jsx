/**
 * Clearfeed High-Performance Chronological Social Feed (Tab 1)
 * Features:
 * - Instant cold-start rendering via local SQLite cache (latest 50 posts)
 * - Deterministic cursor pagination (?cursor=<ISO_DATE>_<OBJECT_ID>&limit=20)
 * - Pull-to-refresh & auto-caching
 * - Floating non-intrusive "New posts available — Tap to view" pill
 * - High-performance list virtualization (removeClippedSubviews, maxToRenderPerBatch)
 * - Local blocked user filtering & moderation modal integration
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import ModerationModal, { getBlockedUserIds } from '../components/ModerationModal';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ClearfeedLogo } from '../components/ClearfeedIcons';
import { getCachedPosts, cachePosts } from '../services/offlineDatabase';

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast, unreadCount } = useNotifications();
  const flatListRef = useRef(null);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'following'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);

  // New Posts Pill
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const pillAnim = useRef(new Animated.Value(-50)).current;

  // Moderation
  const [moderationPost, setModerationPost] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Load cached posts & blocked users on cold-start
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [cached, blocked] = await Promise.all([
        getCachedPosts(50),
        getBlockedUserIds(),
      ]);
      if (isMounted) {
        setBlockedUsers(blocked);
        if (cached && cached.length > 0) {
          const filteredCached = cached.filter(
            (p) => !blocked.includes(p.author?._id || p.author)
          );
          setPosts(filteredCached);
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchFeed = useCallback(
    async (isRefresh = false, cursor = null) => {
      if (isRefresh) setRefreshing(true);
      else if (!cursor && posts.length === 0) setLoading(true);
      else if (cursor) setLoadingMore(true);

      try {
        setFeedError(null);
        const blocked = await getBlockedUserIds();
        setBlockedUsers(blocked);

        let url = `/posts/feed?tab=${activeTab}&limit=20`;
        if (cursor) {
          url += `&cursor=${encodeURIComponent(cursor)}`;
        }

        const res = await api.get(url);
        const incoming = res.data.posts || [];
        const pagination = res.data.pagination || {};

        const filtered = incoming.filter(
          (p) => !blocked.includes(p.author?._id || p.author)
        );

        if (isRefresh || !cursor) {
          setPosts(filtered);
          cachePosts(filtered); // Persist to SQLite
          setNewPostsAvailable(false);
        } else {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const fresh = filtered.filter((p) => !existingIds.has(p._id));
            return [...prev, ...fresh];
          });
        }

        setNextCursor(pagination.nextCursor || null);
        setHasMore(Boolean(pagination.hasMore));
      } catch (err) {
        setFeedError(err.message || 'Could not load feed');
        if (posts.length === 0) {
          showToast('Could not load feed', 'error');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab, posts.length, showToast]
  );

  useEffect(() => {
    fetchFeed(false, null);
  }, [fetchFeed]);

  const handleRefresh = () => {
    fetchFeed(true, null);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchFeed(false, nextCursor);
    }
  };

  const handleScrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setNewPostsAvailable(false);
    handleRefresh();
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post._id, post });
  };

  const handleFlagPost = (post) => {
    setModerationPost(post);
  };

  const handleUserBlocked = (userId) => {
    setBlockedUsers((prev) => [...prev, userId]);
    setPosts((prev) => prev.filter((p) => (p.author?._id || p.author) !== userId));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', { username: user?.username })}
          activeOpacity={0.8}
        >
          <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
        </TouchableOpacity>

        <View style={styles.brandTitle}>
          <ClearfeedLogo className="w-6 h-6" showSquircle={false} />
          <Text style={[styles.brandClear, { marginLeft: 8 }]}>Clear</Text>
          <Text style={styles.brandFeed}>feed</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.headerBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={21} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Members')}
            style={styles.headerBtn}
            activeOpacity={0.7}
            accessibilityLabel="Community Directory"
          >
            <Ionicons name="people-outline" size={21} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Bookmarks')}
            style={styles.headerBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.headerBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={21} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabPillText, activeTab === 'all' && styles.tabPillTextActive]}>
            All Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('following')}
          style={[styles.tabPill, activeTab === 'following' && styles.tabPillActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabPillText, activeTab === 'following' && styles.tabPillTextActive]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating "New Posts Available" Pill */}
      {newPostsAvailable && (
        <TouchableOpacity
          style={styles.newPostsPill}
          onPress={handleScrollToTop}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-up" size={14} color="#090D16" style={{ marginRight: 6 }} />
          <Text style={styles.newPostsText}>New posts available — Tap to view</Text>
        </TouchableOpacity>
      )}

      {/* Virtualized Chronological Feed List */}
      {loading && posts.length === 0 ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={styles.loadingText}>Loading chronological feed...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={handlePostPress}
              onFlag={() => handleFlagPost(item)}
              navigation={navigation}
            />
          )}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={7}
          initialNumToRender={8}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#14B8A6"
              colors={['#14B8A6']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#14B8A6" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            feedError ? (
              <View style={styles.emptyState}>
                <Ionicons name="cloud-offline-outline" size={42} color="#94A3B8" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>Could not load feed</Text>
                <Text style={styles.emptyDesc}>
                  Unable to reach server. You can still switch to Clearfeed Mesh or review cached lessons.
                </Text>
                <TouchableOpacity
                  onPress={() => fetchFeed(true, null)}
                  style={styles.retryBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={16} color="#090D16" style={{ marginRight: 6 }} />
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={42} color="#334155" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyDesc}>
                  {activeTab === 'following'
                    ? 'Follow members to see their posts here, or check out the All Feed.'
                    : 'Be the first to share an un-curated thought or code snippet!'}
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Floating Compose Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('Compose')}
        activeOpacity={0.85}
      >
        <Feather name="feather" size={24} color="#090D16" />
      </TouchableOpacity>

      {/* Moderation / Report Modal */}
      <ModerationModal
        visible={!!moderationPost}
        onClose={() => setModerationPost(null)}
        targetPost={moderationPost}
        onUserBlocked={handleUserBlocked}
        onPostFlagged={(postId) => {
          setPosts((prev) => prev.filter((p) => p._id !== postId));
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandClear: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  brandFeed: {
    color: '#14B8A6',
    fontSize: 18,
    fontWeight: '800',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    padding: 6,
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    color: '#090D16',
    fontSize: 9,
    fontWeight: '900',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 10,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  tabPillActive: {
    backgroundColor: '#14B8A6',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabPillTextActive: {
    color: '#090D16',
    fontWeight: '800',
  },
  newPostsPill: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  newPostsText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '800',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 10,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  retryBtnText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;
