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
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Explore thoughtful posts and discussions.</Text>

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
              <Text style={styles.emptyIcon}>🧭</Text>
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
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
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
