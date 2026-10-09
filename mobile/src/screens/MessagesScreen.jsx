import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isToday, isYesterday } from 'date-fns';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { VerifiedBadge } from '../components/TwitterIcons';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const MessagesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();
  const { showToast, setUnreadMessagesCount } = useNotifications();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Chat Modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [directoryMembers, setDirectoryMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isMountedRef = useRef(true);

  // Format timestamp for conversation list
  const formatConvTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return format(d, 'h:mm a');
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'MMM d');
    } catch {
      return '';
    }
  };

  // Fetch all conversations
  const fetchConversations = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.get('/messages/conversations');
        const list = res.data.conversations || [];
        if (isMountedRef.current) {
          setConversations(list);
          const totalUnread = list.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
          setUnreadMessagesCount(totalUnread);
        }
      } catch (err) {
        if (!silent) showToast('Failed to load messages', 'error');
      } finally {
        if (!silent && isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [showToast, setUnreadMessagesCount]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchConversations(false);

    // Live background polling every 5 seconds for new conversation activity
    const pollInterval = setInterval(() => {
      fetchConversations(true);
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearInterval(pollInterval);
    };
  }, [fetchConversations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations(false);
  };

  // Open "New Chat" modal and fetch members directory
  const handleOpenNewChat = async () => {
    setIsNewChatModalOpen(true);
    setLoadingMembers(true);
    try {
      const res = await api.get('/users/directory');
      const list = res.data.users || res.data || [];
      // Filter out self
      const others = list.filter((m) => m._id !== currentUser?._id && m.username !== currentUser?.username);
      setDirectoryMembers(others);
    } catch (err) {
      // Fallback to /users
      try {
        const fallbackRes = await api.get('/users');
        const list = fallbackRes.data.users || fallbackRes.data || [];
        setDirectoryMembers(list.filter((m) => m._id !== currentUser?._id));
      } catch {
        showToast('Could not load member directory', 'error');
      }
    } finally {
      setLoadingMembers(false);
    }
  };

  // Start or open conversation with member
  const handleStartChatWithMember = async (member) => {
    setIsNewChatModalOpen(false);
    try {
      const res = await api.post('/messages/conversations', {
        recipientId: member._id,
      });
      const conv = res.data.conversation;
      if (conv) {
        navigation.navigate('Conversation', {
          conversationId: conv._id,
          otherUser: member,
        });
      }
    } catch (err) {
      showToast(err.data?.message || 'Could not start chat', 'error');
    }
  };

  // Delete conversation with confirmation
  const handleDeleteConversation = (conv) => {
    Alert.alert(
      'Delete Conversation',
      `Delete conversation with ${conv.otherUser?.name || 'this member'}? Message history will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/messages/conversations/${conv._id}`);
              setConversations((prev) => prev.filter((c) => c._id !== conv._id));
              showToast('Conversation removed', 'info');
            } catch (err) {
              showToast('Failed to delete conversation', 'error');
            }
          },
        },
      ]
    );
  };

  // Filter conversations by search input
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const other = c.otherUser || {};
    return (
      (other.name && other.name.toLowerCase().includes(q)) ||
      (other.username && other.username.toLowerCase().includes(q)) ||
      (c.lastMessage?.text && c.lastMessage.text.toLowerCase().includes(q))
    );
  });

  const filteredMembers = directoryMembers.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.username && m.username.toLowerCase().includes(q))
    );
  });

  const renderConversationItem = ({ item }) => {
    const other = item.otherUser || {};
    const unread = item.unreadCount || 0;
    const lastMsg = item.lastMessage || {};
    const isCodeSnippet = lastMsg.hasCode || (lastMsg.text && lastMsg.text.includes('code snippet'));

    return (
      <TouchableOpacity
        style={[styles.convItem, unread > 0 && styles.convItemUnread]}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('Conversation', {
            conversationId: item._id,
            otherUser: other,
          });
        }}
        onLongPress={() => handleDeleteConversation(item)}
      >
        <Avatar
          src={other.avatarUrl}
          name={other.name}
          role={other.role}
          size="md"
          showRoleBadge={true}
        />

        <View style={styles.convContent}>
          <View style={styles.convHeaderRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.convName} numberOfLines={1}>
                {other.name || 'Member'}
              </Text>
              {other.role === 'admin' && (
                <VerifiedBadge size={13} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={[styles.convTime, unread > 0 && styles.convTimeUnread]}>
              {formatConvTime(item.updatedAt || lastMsg.createdAt)}
            </Text>
          </View>

          <View style={styles.convPreviewRow}>
            <View style={styles.previewTextWrapper}>
              {isCodeSnippet && (
                <Ionicons
                  name="code-slash"
                  size={14}
                  color={colors.accent}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.convPreviewText,
                  unread > 0 && styles.convPreviewUnread,
                ]}
                numberOfLines={1}
              >
                {lastMsg.text || 'Started a conversation'}
              </Text>
            </View>

            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unread > 99 ? '99+' : unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={handleOpenNewChat}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations Stream */}
      {loading && !refreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item._id}
          renderItem={renderConversationItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={42}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No conversations match your search.'
                  : 'Connect with classmates, share code snippets, and study together in private messages.'}
              </Text>
              <Button
                variant="primary"
                size="md"
                onPress={handleOpenNewChat}
                style={{ marginTop: 18 }}
              >
                Start a New Chat
              </Button>
            </View>
          }
          contentContainerStyle={
            filteredConversations.length === 0 ? { flexGrow: 1 } : null
          }
        />
      )}

      {/* New Chat Modal */}
      <Modal
        visible={isNewChatModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsNewChatModalOpen(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'ios' ? insets.top : 16 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Message</Text>
            <TouchableOpacity
              onPress={() => setIsNewChatModalOpen(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearchRow}>
            <Feather name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search classmates by name or username..."
              placeholderTextColor={colors.textSecondary}
              value={memberSearch}
              onChangeText={setMemberSearch}
              autoFocus={true}
            />
          </View>

          {loadingMembers ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberPickRow}
                  activeOpacity={0.7}
                  onPress={() => handleStartChatWithMember(item)}
                >
                  <Avatar
                    src={item.avatarUrl}
                    name={item.name}
                    role={item.role}
                    size="md"
                    showRoleBadge={true}
                  />
                  <View style={styles.memberPickInfo}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.memberPickName}>{item.name}</Text>
                      {item.role === 'admin' && (
                        <VerifiedBadge size={13} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text style={styles.memberPickHandle}>@{item.username}</Text>
                    {item.status ? (
                      <Text style={styles.memberPickStatus} numberOfLines={1}>
                        {item.status}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptySubtitle}>No members found</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.4,
  },
  newChatBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  convItemUnread: {
    backgroundColor: '#0a1622',
  },
  convContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  convName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  convTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  convTimeUnread: {
    color: colors.accent,
    fontWeight: '700',
  },
  convPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  convPreviewText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  convPreviewUnread: {
    color: colors.text,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: colors.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
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
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  memberPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberPickInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  memberPickName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  memberPickHandle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  memberPickStatus: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 2,
  },
});

export default MessagesScreen;
