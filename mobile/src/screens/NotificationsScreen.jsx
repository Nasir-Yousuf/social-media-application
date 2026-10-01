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
import { formatDistanceToNowStrict } from 'date-fns';
import colors from '../theme/colors';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { showToast, setUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
      } catch (err) {
        showToast('Could not load notifications', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark read', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Text style={{ color: colors.like, fontSize: 18 }}>❤️</Text>;
      case 'comment':
        return <Text style={{ color: colors.accent, fontSize: 18 }}>💬</Text>;
      case 'follow':
        return <Text style={{ color: colors.accent, fontSize: 18 }}>👤</Text>;
      case 'announcement':
        return <Text style={{ color: colors.gold, fontSize: 18 }}>📢</Text>;
      default:
        return <Text style={{ color: colors.textSecondary, fontSize: 18 }}>🔔</Text>;
    }
  };

  const renderItem = ({ item }) => {
    const sender = item.sender || {};
    let timeStr = 'now';
    try {
      timeStr = formatDistanceToNowStrict(new Date(item.createdAt));
    } catch {}

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (item.post) {
            navigation.navigate('PostDetail', { postId: item.post._id || item.post });
          } else if (sender.username) {
            navigation.navigate('Profile', { username: sender.username });
          }
        }}
        style={[styles.notifItem, !item.read && styles.notifUnread]}
      >
        <View style={styles.iconCol}>{getIcon(item.type)}</View>

        <View style={styles.contentCol}>
          {sender.username && (
            <Avatar src={sender.avatarUrl} name={sender.name} size="sm" style={styles.avatar} />
          )}

          <Text style={styles.notifText}>
            <Text style={styles.boldText}>{sender.name || 'Someone'} </Text>
            {item.message || 'interacted with your content'}
          </Text>

          <Text style={styles.timeText}>{timeStr}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onPress={handleMarkAllRead}>
            Mark read
          </Button>
        )}
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No alerts yet</Text>
              <Text style={styles.emptyDesc}>
                When someone appreciates your post, replies to your code, or follows you, you'll find it here.
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  notifUnread: {
    backgroundColor: colors.elevated,
  },
  iconCol: {
    width: 32,
    alignItems: 'center',
    marginRight: 10,
  },
  contentCol: {
    flex: 1,
  },
  avatar: {
    marginBottom: 6,
  },
  notifText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
  },
  boldText: {
    fontWeight: '700',
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 80,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default NotificationsScreen;
