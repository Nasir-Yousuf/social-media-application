import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ClearfeedLogo } from '../components/TwitterIcons';

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'following'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchFeed = useCallback(
    async (isRefresh = false, pageNum = 1) => {
      if (isRefresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await api.get(`/posts/feed?tab=${activeTab}&page=${pageNum}&limit=15`);
        const incoming = res.data.posts || [];
        setPosts((prev) => (pageNum === 1 ? incoming : [...prev, ...incoming]));
        setHasMore(Boolean(res.data.pagination?.hasMore));
        setPage(pageNum);
      } catch (err) {
        showToast('Could not load feed', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab, showToast]
  );

  useEffect(() => {
    fetchFeed(false, 1);
  }, [fetchFeed]);

  const handleRefresh = () => {
    fetchFeed(true, 1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(false, page + 1);
    }
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { postId: post._id, post });
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
          <ClearfeedLogo size={22} color={colors.accent} />
          <Text style={[styles.brandClear, { marginLeft: 8 }]}>Clear</Text>
          <Text style={styles.brandFeed}>feed</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Bookmarks')}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Feed Tabs (Twitter Pill Tabs) */}
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

      {/* Feed List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading chronological feed...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={handlePostPress}
              navigation={navigation}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📡</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyDesc}>
                {activeTab === 'following'
                  ? 'Follow members to see their posts here, or check out the All Feed.'
                  : 'Be the first to share a thought or code snippet!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Compose Button (Twitter Blue FAB) */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('Compose')}
        activeOpacity={0.85}
      >
        <Feather name="feather" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandClear: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandFeed: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerBtn: {
    padding: 6,
    borderRadius: 9999,
  },
  headerBtnText: {
    fontSize: 18,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabPillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  tabPillTextActive: {
    color: colors.white,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 22,
    color: colors.white,
  },
});

export default HomeScreen;
