import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import PostCard from '../components/PostCard';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const TOPICS = [
  'Architecture',
  'React',
  'Python',
  'JavaScript',
  'Databases',
  'Design',
  'Compilers',
  'DevOps',
];

export const ExploreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchExplore = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/posts/explore');
      setPosts(res.data.posts || []);
    } catch (err) {
      showToast('Failed to load explore feed', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExplore();
  }, []);

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.content?.toLowerCase().includes(selectedTag.toLowerCase()))
    : posts;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topHeaderRow}>
          <Text style={styles.title}>Discover</Text>
        </View>

        {/* Tap to Search Bar */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.searchBarFake}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={17} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <Text style={styles.searchBarPlaceholder}>Search students, posts, discussions...</Text>
        </TouchableOpacity>

        {/* Quick Nav Chips */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Members')}
            style={styles.quickNavChip}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={14} color={colors.accent} style={{ marginRight: 5 }} />
            <Text style={styles.quickNavChipText}>Cohort Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CodeHub')}
            style={styles.quickNavChip}
            activeOpacity={0.7}
          >
            <Ionicons name="code-slash-outline" size={14} color={colors.accent} style={{ marginRight: 5 }} />
            <Text style={styles.quickNavChipText}>Code Hub</Text>
          </TouchableOpacity>
        </View>

        {/* Topics Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.topicsScroll}
          contentContainerStyle={styles.topicsContainer}
        >
          {TOPICS.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setSelectedTag(isSelected ? null : tag)}
                style={[styles.tagPill, isSelected && styles.tagPillActive]}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>
                  #{tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Posts Stream */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={(p) => navigation.navigate('PostDetail', { postId: p._id, post: p })}
              navigation={navigation}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchExplore(true)}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="compass-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>
                {selectedTag ? `No posts matching #${selectedTag}` : 'No posts to discover'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  topHeaderRow: {
    marginBottom: 10,
  },
  searchBarFake: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchBarPlaceholder: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  quickNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  quickNavChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickNavChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  topicsScroll: {
    flexGrow: 0,
  },
  topicsContainer: {
    gap: 6,
    paddingBottom: 4,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextActive: {
    color: colors.white,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ExploreScreen;
