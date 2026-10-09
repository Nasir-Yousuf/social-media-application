import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import colors from '../theme/colors';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { VerifiedBadge } from '../components/TwitterIcons';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'posts' | 'members'
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  const performSearch = useCallback(async () => {
    if (!debouncedQuery) {
      setPosts([]);
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(debouncedQuery)}`);
      setPosts(res.data.posts || []);
      setUsers(res.data.users || []);
    } catch {
      showToast('Search request failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, showToast]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const renderMember = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.memberCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Profile', { username: item.username })}
    >
      <Avatar
        src={item.avatarUrl}
        name={item.name}
        role={item.role}
        size="md"
        showRoleBadge={true}
      />
      <View style={styles.memberInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName}>{item.name}</Text>
          {item.role === 'admin' && <VerifiedBadge size={13} style={{ marginLeft: 4 }} />}
        </View>
        <Text style={styles.memberHandle}>@{item.username}</Text>
        {item.bio ? (
          <Text style={styles.memberBio} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, topics, members..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            Posts ({posts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
            Members ({users.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Stream */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'members' ? [] : posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={(p) => navigation.navigate('PostDetail', { postId: p._id, post: p })}
              navigation={navigation}
            />
          )}
          ListHeaderComponent={
            activeTab !== 'posts' && users.length > 0 ? (
              <View style={styles.membersSection}>
                <Text style={styles.sectionHeaderTitle}>Members</Text>
                {users.map(renderMember)}
                {activeTab === 'all' && posts.length > 0 && (
                  <Text style={[styles.sectionHeaderTitle, { marginTop: 16 }]}>Posts</Text>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            debouncedQuery ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>Try searching for a different keyword or member username.</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="compass-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>Search Clearfeed</Text>
                <Text style={styles.emptySubtitle}>Search course discussions, code snippets, and classmates.</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
  },
  membersSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  memberHandle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  memberBio: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchScreen;
