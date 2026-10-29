import React, { useState, useEffect } from 'react';
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
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import { VerifiedBadge } from '../components/TwitterIcons';
import { Ionicons } from '@expo/vector-icons';

export const MembersScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin'
  const [followLoadingId, setFollowLoadingId] = useState(null);

  const fetchMembers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/users');
      setMembers(res.data.users || []);
    } catch (err) {
      showToast('Could not load members', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleFollowToggle = async (member) => {
    setFollowLoadingId(member._id);
    try {
      if (member.isFollowing) {
        await api.delete(`/users/${member._id}/follow`);
        setMembers((prev) =>
          prev.map((m) =>
            m._id === member._id
              ? { ...m, isFollowing: false, followersCount: Math.max(0, (m.followersCount || 1) - 1) }
              : m
          )
        );
        showToast(`Unfollowed @${member.username}`, 'info');
      } else {
        await api.post(`/users/${member._id}/follow`);
        setMembers((prev) =>
          prev.map((m) =>
            m._id === member._id
              ? { ...m, isFollowing: true, followersCount: (m.followersCount || 0) + 1 }
              : m
          )
        );
        showToast(`Following @${member.username}`, 'success');
      }
    } catch (err) {
      showToast('Failed to update follow status', 'error');
    } finally {
      setFollowLoadingId(null);
    }
  };

  const filteredMembers =
    roleFilter === 'admin'
      ? members.filter((m) => m.role === 'admin')
      : members;

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile', { username: item.username })}
        style={styles.memberMain}
        activeOpacity={0.8}
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
            <Text style={styles.memberName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.role === 'admin' && (
              <VerifiedBadge size={13} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.memberHandle}>@{item.username}</Text>
          {item.bio ? (
            <Text style={styles.memberBio} numberOfLines={2}>
              {item.bio}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {!item.isSelf && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.directChatBtn}
            onPress={async () => {
              try {
                const res = await api.post('/messages/conversations', {
                  recipientId: item._id,
                });
                const conv = res.data.conversation;
                if (conv) {
                  navigation.navigate('Conversation', {
                    conversationId: conv._id,
                    otherUser: item,
                  });
                }
              } catch {
                showToast('Could not start chat', 'error');
              }
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.text} />
          </TouchableOpacity>
          <Button
            variant={item.isFollowing ? 'outline' : 'secondary'}
            size="sm"
            onPress={() => handleFollowToggle(item)}
            isLoading={followLoadingId === item._id}
            style={styles.followBtn}
          >
            {item.isFollowing ? 'Following' : 'Follow'}
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setRoleFilter('all')}
            style={[styles.filterPill, roleFilter === 'all' && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, roleFilter === 'all' && styles.filterTextActive]}>
              All Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRoleFilter('admin')}
            style={[
              styles.filterPill,
              roleFilter === 'admin' && { backgroundColor: colors.gold, borderColor: colors.gold },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                roleFilter === 'admin' && { color: colors.black, fontWeight: '700' },
              ]}
            >
              Staff & Admins
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Members List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item._id}
          renderItem={renderMember}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchMembers(true)}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
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
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.white,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  memberMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  memberInfo: {
    marginLeft: 10,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    maxWidth: '80%',
  },
  goldBadge: {
    backgroundColor: colors.gold,
    borderRadius: 6,
    width: 13,
    height: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  goldBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  memberHandle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  memberBio: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  followBtn: {
    minWidth: 84,
  },
  directChatBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MembersScreen;
