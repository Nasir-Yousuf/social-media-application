import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isToday, isYesterday } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  Octicons,
} from '@expo/vector-icons';
import colors from '../theme/colors';
import Avatar from '../components/Avatar';
import { VerifiedBadge } from '../components/TwitterIcons';
import AiSettingsModal from '../components/AiSettingsModal';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCall } from '../context/CallContext';
import socketService from '../services/socket';
import offlineOutbox, { DeliveryStatus } from '../services/offlineOutbox';

const QUICK_EMOJIS = ['❤️', '👍', '😂', '🔥', '🚀', '💡', '😮', '👏'];

const CODE_LANGUAGES = [
  'javascript',
  'python',
  'typescript',
  'html',
  'css',
  'react',
  'sql',
  'cpp',
  'java',
  'json',
];

export const ConversationScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { conversationId, otherUser: initialOtherUser } = route.params;
  const { user: currentUser } = useAuth();
  const { showToast, fetchUnreadCount } = useNotifications();
  const { startAudioCall, startGroupAudioCall } = useCall();

  const [otherUser, setOtherUser] = useState(initialOtherUser || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [customAiSettings, setCustomAiSettings] = useState(null);

  // Pagination state (cursor-based for history virtualization)
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Media attachment state
  const [mediaAttachment, setMediaAttachment] = useState(null);

  // Code composer drawer state
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLang, setSnippetLang] = useState('javascript');

  // Emoji Reaction picker state
  const [activeReactionMsgId, setActiveReactionMsgId] = useState(null);

  const flatListRef = useRef(null);
  const isMountedRef = useRef(true);
  const typingTimerRef = useRef(null);
  const otherUserRef = useRef(otherUser);

  useEffect(() => {
    otherUserRef.current = otherUser;
  }, [otherUser]);

  // Format message time
  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return format(d, 'h:mm a');
    } catch {
      return '';
    }
  };

  // Format group date header
  const getDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return 'Today';
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'EEEE, MMMM d, yyyy');
    } catch {
      return '';
    }
  };

  // Fetch messages from server (inverted format: newest message first at index 0)
  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.get(`/messages/conversations/${conversationId}`);
        const serverMessages = res.data.messages || [];
        if (res.data.conversation?.otherUser) {
          setOtherUser(res.data.conversation.otherUser);
        }
        if (res.data.conversation?.customAiSettings) {
          setCustomAiSettings(res.data.conversation.customAiSettings);
        }
        setNextCursor(res.data.pagination?.nextCursor || null);
        setHasMore(Boolean(res.data.pagination?.hasMore));

        if (isMountedRef.current) {
          const reversedServer = [...serverMessages].reverse();
          setMessages((prev) => {
            const pending = prev.filter(
              (m) =>
                m.deliveryStatus === DeliveryStatus.QUEUED_OFFLINE ||
                m.status === 'sending' ||
                m.status === 'failed'
            );

            if (pending.length === 0) return reversedServer;

            const serverIds = new Set(reversedServer.map((m) => m._id));
            const clientIds = new Set(reversedServer.map((m) => m.clientMessageId).filter(Boolean));
            const stillPending = pending.filter(
              (opt) => !serverIds.has(opt._id) && !clientIds.has(opt.clientMessageId)
            );
            return [...stillPending, ...reversedServer];
          });
        }
      } catch (err) {
        if (!silent) showToast('Could not load message history', 'error');
      } finally {
        if (!silent && isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [conversationId, showToast]
  );

  // Load older messages via cursor pagination when scrolling up in inverted list
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await api.get(`/messages/conversations/${conversationId}`, {
        params: { cursor: nextCursor },
      });
      const olderMessages = res.data.messages || [];
      setNextCursor(res.data.pagination?.nextCursor || null);
      setHasMore(Boolean(res.data.pagination?.hasMore));

      if (olderMessages.length > 0 && isMountedRef.current) {
        const olderReversed = [...olderMessages].reverse();
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const filtered = olderReversed.filter((m) => !existingIds.has(m._id));
          return [...prev, ...filtered];
        });
      }
    } catch (err) {
      console.warn('Failed to load older messages:', err?.message);
    } finally {
      if (isMountedRef.current) setLoadingMore(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchMessages(false);
    if (fetchUnreadCount) fetchUnreadCount();

    // 1. Join Conversation Room & Mark Read via Socket
    socketService.joinConversation(conversationId);
    socketService.markMessagesAsRead(conversationId);

    // Sync any missed messages since device last sleep/disconnection
    offlineOutbox.syncMissedMessages(api, conversationId).then((missed) => {
      if (Array.isArray(missed) && missed.length > 0 && isMountedRef.current) {
        const missedReversed = [...missed].reverse();
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const newItems = missedReversed.filter((m) => !existingIds.has(m._id));
          return [...newItems, ...prev];
        });
      }
    }).catch(() => {});

    // 2. Real-time Incoming Message Listener
    const unsubMsg = socketService.on('chat:message', (payload) => {
      const incomingMsg = payload?.message;
      if (!incomingMsg) return;

      const currentConvIdStr = conversationId ? conversationId.toString() : '';
      const payloadConvIdStr = (payload.conversationId || incomingMsg.conversation?._id || incomingMsg.conversation)?.toString() || '';
      const otherIdStr = (otherUserRef.current?._id || otherUserRef.current?.id || otherUserRef.current)?.toString() || '';
      const senderIdStr = (incomingMsg.sender?._id || incomingMsg.sender)?.toString() || '';
      const recipientIdStr = (incomingMsg.recipient?._id || incomingMsg.recipient)?.toString() || '';

      const belongsToThisChat =
        (payloadConvIdStr && currentConvIdStr && payloadConvIdStr === currentConvIdStr) ||
        (otherIdStr && (senderIdStr === otherIdStr || recipientIdStr === otherIdStr));

      if (belongsToThisChat && isMountedRef.current) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m._id === incomingMsg._id ||
              (m.clientMessageId && incomingMsg.clientMessageId && m.clientMessageId === incomingMsg.clientMessageId)
          );
          if (exists) {
            return prev.map((m) =>
              m._id === incomingMsg._id || (m.clientMessageId && m.clientMessageId === incomingMsg.clientMessageId)
                ? incomingMsg
                : m
            );
          }
          // Prepend at index 0 in inverted list
          return [incomingMsg, ...prev];
        });

        // Acknowledge delivery to sender
        socketService.sendDeliveryAck({
          messageId: incomingMsg._id,
          clientMessageId: incomingMsg.clientMessageId,
          conversationId,
          senderId: senderIdStr,
        });

        // Acknowledge read if message is from the other person
        if (otherIdStr && senderIdStr === otherIdStr) {
          socketService.markMessagesAsRead(conversationId, [incomingMsg._id]);
        }
      }
    });

    // 3. Real-time Delivery Receipt Listener (DELIVERED_TO_DEVICE)
    const unsubDelivered = socketService.on('chat:message_delivered', (data) => {
      if (isMountedRef.current && (data?.clientMessageId || data?.messageId)) {
        setMessages((prev) =>
          prev.map((m) => {
            const isMatch =
              (data.clientMessageId && m.clientMessageId === data.clientMessageId) ||
              (data.messageId && (m._id === data.messageId || m.clientMessageId === data.messageId));
            if (isMatch && m.deliveryStatus !== DeliveryStatus.READ) {
              return {
                ...m,
                deliveryStatus: DeliveryStatus.DELIVERED_TO_DEVICE,
                deliveredAt: data.deliveredAt || new Date().toISOString(),
              };
            }
            return m;
          })
        );
      }
    });

    // 4. Real-time Read Receipt Listener (READ teal double-check)
    const unsubRead = socketService.on('chat:messages_read', (data) => {
      if (data.conversationId?.toString() === conversationId?.toString()) {
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) => {
              const senderId = (m.sender?._id || m.sender)?.toString();
              if (senderId === currentUser?._id?.toString()) {
                return {
                  ...m,
                  isRead: true,
                  deliveryStatus: DeliveryStatus.READ,
                  readAt: data.readAt || new Date().toISOString(),
                };
              }
              return m;
            })
          );
        }
      }
    });

    // 5. Real-time Typing Status Listener
    const unsubTyping = socketService.on('chat:typing', (data) => {
      if (
        data.conversationId?.toString() === conversationId?.toString() &&
        data.userId?.toString() !== currentUser?._id?.toString()
      ) {
        if (isMountedRef.current) {
          setIsOtherUserTyping(data.isTyping);
        }
      }
    });

    // 6. Real-time Presence Listener
    const unsubOnline = socketService.on('presence:user_online', (data) => {
      const otherId = (otherUserRef.current?._id || otherUserRef.current?.id)?.toString();
      if (data.userId?.toString() === otherId) {
        if (isMountedRef.current) setIsOtherUserOnline(true);
      }
    });

    const unsubOffline = socketService.on('presence:user_offline', (data) => {
      const otherId = (otherUserRef.current?._id || otherUserRef.current?.id)?.toString();
      if (data.userId?.toString() === otherId) {
        if (isMountedRef.current) setIsOtherUserOnline(false);
      }
    });

    // 7. Real-time Message Reactions Listener
    const handleReactionEvent = (data) => {
      if (data?.messageId && isMountedRef.current) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId ? { ...m, reactions: data.reactions || [] } : m
          )
        );
      }
    };
    const unsubReaction = socketService.on('chat:reaction', handleReactionEvent);
    const unsubReactionAlt = socketService.on('chat:message_reacted', handleReactionEvent);

    // 8. Real-time Message Deletion Listener
    const handleDeleteEvent = (data) => {
      const targetConvId = data?.conversationId?.toString();
      const currentConvId = conversationId?.toString();
      if (!targetConvId || targetConvId === currentConvId) {
        if (isMountedRef.current) {
          if (data.messageId === '__ALL__' || data.messageId === '__CONVERSATION_DELETED__') {
            setMessages([]);
          } else if (data.messageId) {
            setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
          }
        }
      }
    };
    const unsubDelete = socketService.on('chat:delete', handleDeleteEvent);
    const unsubDeleteAlt = socketService.on('chat:message_deleted', handleDeleteEvent);

    // Passive fallback interval (20s background safety sync)
    const fallbackSync = setInterval(() => {
      fetchMessages(true);
    }, 20000);

    return () => {
      isMountedRef.current = false;
      clearInterval(fallbackSync);
      socketService.leaveConversation(conversationId);
      socketService.sendTypingStatus(conversationId, otherUserRef.current?._id, false);
      unsubMsg();
      unsubDelivered();
      unsubRead();
      unsubTyping();
      unsubOnline();
      unsubOffline();
      unsubReaction();
      unsubReactionAlt();
      unsubDelete();
      unsubDeleteAlt();
      if (fetchUnreadCount) fetchUnreadCount();
    };
  }, [conversationId, currentUser?._id, fetchMessages, fetchUnreadCount]);

  // Handle typing input
  const handleTypingChange = (text) => {
    setInputText(text);
    if (conversationId && otherUser?._id) {
      socketService.sendTypingStatus(conversationId, otherUser._id, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socketService.sendTypingStatus(conversationId, otherUser._id, false);
      }, 1800);
    }
  };

  // Image attachment picker
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are required to attach images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Data = asset.base64
          ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        setMediaAttachment(base64Data);
      }
    } catch (err) {
      showToast('Failed to select image', 'error');
    }
  };

  // Handle message sending (with deterministic offline outbox queue & idempotency)
  const handleSendMessage = async () => {
    const trimmedText = inputText.trim();
    const trimmedCode = snippetCode.trim();
    const media = mediaAttachment;

    if (!trimmedText && !trimmedCode && !media) return;

    setInputText('');
    setSnippetCode('');
    setMediaAttachment(null);
    setShowCodeEditor(false);
    setSending(true);

    try {
      // 1. Enqueue to local outbox (status: QUEUED_OFFLINE)
      const optimisticMsg = await offlineOutbox.enqueueMessage({
        conversationId,
        recipientId: otherUser?._id,
        text: trimmedText,
        codeSnippet: trimmedCode ? { language: snippetLang, code: trimmedCode } : undefined,
        mediaUrl: media || undefined,
        sender: { _id: currentUser._id, name: currentUser.name, username: currentUser.username },
      });

      // 2. Insert into inverted message stream immediately
      setMessages((prev) => [optimisticMsg, ...prev]);

      // 3. Flush outbox to server
      offlineOutbox.flushOutbox(api, (finalizedMsg, pendingMsg) => {
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) => {
              if (
                m.clientMessageId === pendingMsg.clientMessageId ||
                m._id === pendingMsg._id
              ) {
                return {
                  ...finalizedMsg,
                  deliveryStatus: DeliveryStatus.SENT_TO_SERVER,
                  status: DeliveryStatus.SENT_TO_SERVER,
                };
              }
              return m;
            })
          );
        }
      }).catch((err) => {
        console.warn('Background outbox flush error:', err?.message);
      });
    } catch (err) {
      showToast('Could not queue message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Retry sending failed message
  const handleRetrySend = async (failedMsg) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === failedMsg._id ? { ...m, deliveryStatus: DeliveryStatus.SENDING, status: 'sending' } : m
      )
    );

    try {
      await offlineOutbox.flushOutbox(api, (finalizedMsg, pendingMsg) => {
        if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) => (m._id === pendingMsg._id ? finalizedMsg : m))
          );
        }
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === failedMsg._id ? { ...m, deliveryStatus: DeliveryStatus.FAILED, status: 'failed' } : m
        )
      );
      showToast('Message delivery failed again', 'error');
    }
  };

    try {
      const payload = {
        conversationId,
        text: failedMsg.text,
        codeSnippet: failedMsg.codeSnippet,
      };
      const res = await api.post('/messages/send', payload);
      const delivered = res.data.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === failedMsg._id ? delivered : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m._id === failedMsg._id ? { ...m, status: 'failed' } : m))
      );
      showToast('Message delivery failed again', 'error');
    }
  };

  // Toggle emoji reaction
  const handleReactToMessage = async (msgId, emoji) => {
    setActiveReactionMsgId(null);
    try {
      // Optimistic reaction update
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== msgId) return m;
          const currentReactions = Array.isArray(m.reactions) ? [...m.reactions] : [];
          const existingIdx = currentReactions.findIndex((r) => {
            const uId = r.user?._id || r.user;
            return String(uId) === String(currentUser?._id);
          });

          if (existingIdx >= 0) {
            if (currentReactions[existingIdx].emoji === emoji) {
              // Toggle off
              currentReactions.splice(existingIdx, 1);
            } else {
              // Update emoji
              currentReactions[existingIdx] = {
                ...currentReactions[existingIdx],
                emoji,
                createdAt: new Date(),
              };
            }
          } else {
            currentReactions.push({
              emoji,
              user: { _id: currentUser?._id, name: currentUser?.name },
              createdAt: new Date(),
            });
          }
          return { ...m, reactions: currentReactions };
        })
      );

      const res = await api.post(`/messages/${msgId}/react`, { emoji });
      if (res.data?.reactions && isMountedRef.current) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, reactions: res.data.reactions } : m))
        );
      }
    } catch (err) {
      showToast('Failed to update reaction', 'error');
    }
  };

  // Delete individual message with confirmation
  const handleDeleteMessage = (msgId) => {
    if (!msgId) return;
    Alert.alert(
      'Delete Message?',
      'This message will be permanently removed for everyone in this conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setMessages((prev) => prev.filter((m) => m._id !== msgId));
            try {
              await api.delete(`/messages/${msgId}`);
              showToast('Message deleted', 'info');
            } catch (err) {
              showToast(err.response?.data?.message || 'Failed to delete message', 'error');
              fetchMessages(true);
            }
          },
        },
      ]
    );
  };

  // Message long-press options action sheet
  const handleMessageLongPress = (msg) => {
    if (!msg || !msg._id) return;
    const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
    const isMine = senderId === currentUser?._id;
    const isOtherAi =
      otherUser?.username === 'ai' ||
      otherUser?.role === 'ai' ||
      Boolean(otherUser?.isAi);
    const canDelete = (isMine || isOtherAi) && msg.status !== 'sending' && msg.status !== 'failed';

    const options = [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add / Change Reaction 😊',
        onPress: () => setActiveReactionMsgId((curr) => (curr === msg._id ? null : msg._id)),
      },
    ];

    if (msg.text) {
      options.push({
        text: 'Copy Message Text 📋',
        onPress: async () => {
          await Clipboard.setStringAsync(msg.text);
          showToast('Text copied to clipboard', 'success');
        },
      });
    }

    if (msg.codeSnippet?.code) {
      options.push({
        text: 'Copy Code Snippet 💻',
        onPress: () => handleCopyCode(msg.codeSnippet.code),
      });
    }

    if (canDelete) {
      options.push({
        text: isOtherAi && !isMine ? 'Delete AI Response 🗑️' : 'Delete Message 🗑️',
        style: 'destructive',
        onPress: () => handleDeleteMessage(msg._id),
      });
    }

    Alert.alert('Message Options', undefined, options);
  };

  // Copy code snippet to clipboard
  const handleCopyCode = async (code) => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    showToast('Code copied to clipboard!', 'success');
  };

  // More options menu (clear messages or delete conversation)
  const isAiChat =
    otherUser?.username === 'ai' ||
    otherUser?.role === 'ai' ||
    Boolean(otherUser?.isAi);

  const handleMoreOptions = () => {
    const alertButtons = [{ text: 'Cancel', style: 'cancel' }];

    if (isAiChat) {
      alertButtons.push({
        text: 'Customize AI Companion ✨',
        onPress: () => setShowAiModal(true),
      });
    }

    alertButtons.push(
      {
        text: 'Clear Message History',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Clear History', 'Are you sure you want to delete all messages in this chat?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear All',
              style: 'destructive',
              onPress: async () => {
                try {
                  await api.delete(`/messages/conversations/${conversationId}/messages`);
                  setMessages([]);
                  showToast('Message history cleared', 'info');
                } catch {
                  showToast('Failed to clear messages', 'error');
                }
              },
            },
          ]);
        },
      },
      {
        text: 'Delete Entire Conversation',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/messages/conversations/${conversationId}`);
            showToast('Conversation deleted', 'info');
            navigation.goBack();
          } catch {
            showToast('Failed to delete conversation', 'error');
          }
        },
      }
    );

    Alert.alert('Conversation Options', `Manage chat with @${otherUser?.username}`, alertButtons);
  };

  // Render individual message item
  const renderMessageItem = ({ item, index }) => {
    const senderId = typeof item.sender === 'object' ? item.sender?._id : item.sender;
    const isMine = senderId === currentUser?._id;
    const isSending = item.deliveryStatus === DeliveryStatus.SENDING || item.status === 'sending';
    const isFailed = item.deliveryStatus === DeliveryStatus.FAILED || item.status === 'failed';

    // In inverted list, item at index + 1 is the older message rendered visually above item
    const olderMsg = index < messages.length - 1 ? messages[index + 1] : null;
    const showDateDivider =
      !olderMsg ||
      new Date(item.createdAt).toDateString() !== new Date(olderMsg.createdAt).toDateString();

    // Group reactions by emoji
    const reactionCounts = {};
    if (Array.isArray(item.reactions)) {
      item.reactions.forEach((r) => {
        if (r.emoji) {
          reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
        }
      });
    }

    return (
      <View style={styles.msgItemWrapper}>
        {showDateDivider && (
          <View style={styles.dateDividerRow}>
            <View style={styles.dateDividerLine} />
            <Text style={styles.dateDividerText}>{getDateLabel(item.createdAt)}</Text>
            <View style={styles.dateDividerLine} />
          </View>
        )}

        <View
          style={[
            styles.bubbleRow,
            isMine ? styles.bubbleRowMine : styles.bubbleRowOther,
          ]}
        >
          {/* Action icon for reaction */}
          <TouchableOpacity
            style={styles.reactionTriggerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() =>
              setActiveReactionMsgId(activeReactionMsgId === item._id ? null : item._id)
            }
          >
            <Ionicons name="happy-outline" size={15} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bubbleContainer,
              isMine ? styles.bubbleMine : styles.bubbleOther,
              isFailed && styles.bubbleFailed,
            ]}
            activeOpacity={0.9}
            onLongPress={() => handleMessageLongPress(item)}
            onPress={() => {
              if (isFailed) handleRetrySend(item);
            }}
          >
            {/* Media Image attachment if present */}
            {item.mediaUrl ? (
              <View style={styles.bubbleMediaWrapper}>
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={styles.bubbleMediaImage}
                  resizeMode="cover"
                />
              </View>
            ) : null}

            {/* Code Snippet attachment if present */}
            {item.codeSnippet && item.codeSnippet.code ? (
              <View style={styles.codeSnippetBox}>
                <View style={styles.codeHeader}>
                  <View style={styles.codeLangPill}>
                    <Octicons name="file-code" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.codeLangText}>
                      {(item.codeSnippet.language || 'code').toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyCodeBtn}
                    onPress={() => handleCopyCode(item.codeSnippet.code)}
                  >
                    <Feather name="copy" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.copyCodeText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeContentText} numberOfLines={14}>
                  {item.codeSnippet.code}
                </Text>
              </View>
            ) : null}

            {/* Message text */}
            {item.text ? (
              <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
                {item.text}
              </Text>
            ) : null}

            {/* Bubble Footer: time & explicit delivery status checkmarks */}
            <View style={styles.bubbleFooter}>
              <Text
                style={[
                  styles.msgTimeText,
                  isMine ? styles.msgTimeMine : styles.msgTimeOther,
                ]}
              >
                {formatMsgTime(item.createdAt)}
              </Text>

              {isMine && (
                <View style={styles.statusIconWrapper}>
                  {item.deliveryStatus === DeliveryStatus.QUEUED_OFFLINE ? (
                    <Ionicons name="time-outline" size={13} color="#faad14" />
                  ) : item.deliveryStatus === DeliveryStatus.SENDING || isSending ? (
                    <ActivityIndicator size={10} color="#ffffff" style={{ marginHorizontal: 2 }} />
                  ) : item.deliveryStatus === DeliveryStatus.READ || item.isRead ? (
                    <Ionicons name="checkmark-done" size={15} color="#2b825e" />
                  ) : item.deliveryStatus === DeliveryStatus.DELIVERED_TO_DEVICE ? (
                    <Ionicons name="checkmark-done" size={15} color="#bfbfbf" />
                  ) : isFailed ? (
                    <Ionicons name="alert-circle" size={14} color="#ff4d4f" />
                  ) : (
                    <Ionicons name="checkmark" size={15} color="#bfbfbf" />
                  )}
                </View>
              )}
            </View>

            {/* Reaction Pill Badge below bubble */}
            {Object.keys(reactionCounts || {}).length > 0 && (
              <View
                style={[
                  styles.reactionBadgeRow,
                  isMine ? styles.reactionBadgeMine : styles.reactionBadgeOther,
                ]}
              >
                {Object.entries(reactionCounts || {}).map(([emoji, count]) => {
                  const hasUserReacted = item.reactions?.some((r) => {
                    const uId = r.user?._id || r.user;
                    return String(uId) === String(currentUser?._id) && r.emoji === emoji;
                  });
                  return (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.reactionPill,
                        hasUserReacted && styles.reactionPillActive,
                      ]}
                      onPress={() => handleReactToMessage(item._id, emoji)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      {count > 1 && (
                        <Text
                          style={[
                            styles.reactionCount,
                            hasUserReacted && styles.reactionCountActive,
                          ]}
                        >
                          {count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Emoji Bar & Action Pill if active for this message */}
        {activeReactionMsgId === item._id && (
          <View
            style={[
              styles.quickEmojiBar,
              isMine ? styles.quickEmojiBarMine : styles.quickEmojiBarOther,
            ]}
          >
            <View style={styles.quickEmojiScroll}>
              {QUICK_EMOJIS.map((emoji) => {
                const isSelected = item.reactions?.some((r) => {
                  const uId = r.user?._id || r.user;
                  return String(uId) === String(currentUser?._id) && r.emoji === emoji;
                });
                return (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.quickEmojiBtn, isSelected && styles.quickEmojiBtnSelected]}
                    onPress={() => handleReactToMessage(item._id, emoji)}
                  >
                    <Text style={styles.quickEmojiText}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.quickActionDivider} />

            <View style={styles.quickActionsRow}>
              {item.text ? (
                <TouchableOpacity
                  style={styles.quickActionIconBtn}
                  onPress={async () => {
                    setActiveReactionMsgId(null);
                    await Clipboard.setStringAsync(item.text);
                    showToast('Text copied to clipboard', 'success');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="copy" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}

              {((isMine || isAiChat) && !isSending && !isFailed) ? (
                <TouchableOpacity
                  style={styles.quickActionIconBtn}
                  onPress={() => {
                    setActiveReactionMsgId(null);
                    handleDeleteMessage(item._id);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={17} color="#ff4d4f" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.quickActionIconBtn}
                onPress={() => setActiveReactionMsgId(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={17} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerUserRow}
          activeOpacity={0.8}
          onPress={() => {
            if (otherUser?.username) {
              navigation.navigate('Profile', { username: otherUser.username });
            }
          }}
        >
          <Avatar
            src={otherUser?.avatarUrl}
            name={otherUser?.name}
            role={otherUser?.role}
            size="sm"
            showRoleBadge={true}
          />
          <View style={styles.headerUserInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>
                {otherUser?.name || 'Classmate'}
              </Text>
              {otherUser?.role === 'admin' && (
                <VerifiedBadge size={13} style={{ marginLeft: 4 }} />
              )}
            </View>
            <View style={styles.headerStatusRow}>
              {isOtherUserOnline && <View style={styles.onlineDotGreen} />}
              <Text
                style={[
                  styles.headerStatusText,
                  isOtherUserTyping && styles.headerStatusTyping,
                ]}
                numberOfLines={1}
              >
                {isOtherUserTyping
                  ? 'typing...'
                  : isOtherUserOnline
                  ? 'Online'
                  : otherUser?.status || `@${otherUser?.username || 'member'}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Customize AI Companion button */}
        {isAiChat && (
          <TouchableOpacity
            onPress={() => setShowAiModal(true)}
            style={styles.headerAiBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="sparkles" size={14} color={colors.accent || '#1d9bf0'} />
            <Text style={styles.headerAiBtnText}>Customize</Text>
          </TouchableOpacity>
        )}

        {/* 100% Free Audio Call Button */}
        <TouchableOpacity
          onPress={() => startAudioCall(otherUser)}
          style={styles.headerCallBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="call" size={20} color={colors.accent || '#1d9bf0'} />
        </TouchableOpacity>

        {/* Group Audio Call Button */}
        <TouchableOpacity
          onPress={() =>
            startGroupAudioCall(
              `conv_${conversationId}`,
              `Call with ${otherUser?.name || 'Class'}`
            )
          }
          style={styles.headerCallBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="people" size={20} color={colors.accent || '#1d9bf0'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMoreOptions}
          style={styles.moreBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Message Stream (Inverted Virtualized List for 60fps Scrolling) */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted={true}
          keyExtractor={(item) => item.clientMessageId || item._id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ padding: 12 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Avatar
                src={otherUser?.avatarUrl}
                name={otherUser?.name}
                size="lg"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyTitle}>
                Direct chat with {otherUser?.name || 'Classmate'}
              </Text>
              <Text style={styles.emptySubtitle}>
                Say hello, ask questions about course assignments, or share technical snippets.
              </Text>
            </View>
          }
        />
      )}

      {/* Expandable Code Snippet Drawer */}
      {showCodeEditor && (
        <View style={styles.codeDrawerContainer}>
          <View style={styles.codeDrawerHeader}>
            <View style={styles.codeDrawerTitleRow}>
              <Ionicons name="code-slash" size={16} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={styles.codeDrawerTitle}>Attach Code Snippet</Text>
            </View>

            {/* Language Selector pills */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CODE_LANGUAGES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langPill,
                    snippetLang === item && styles.langPillActive,
                  ]}
                  onPress={() => setSnippetLang(item)}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      snippetLang === item && styles.langPillTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.langList}
            />

            <TouchableOpacity
              onPress={() => setShowCodeEditor(false)}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.codeDrawerInput}
            placeholder={`// Paste or type your ${snippetLang} code here...`}
            placeholderTextColor={colors.textSecondary}
            value={snippetCode}
            onChangeText={setSnippetCode}
            multiline={true}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      {/* Typing Indicator Bar */}
      {isOtherUserTyping && (
        <View style={styles.typingIndicatorRow}>
          <View style={styles.typingDotPulse} />
          <Text style={styles.typingIndicatorText}>
            {otherUser?.name || 'Classmate'} is typing...
          </Text>
        </View>
      )}

      {/* Media Attachment Preview Chip */}
      {mediaAttachment && (
        <View style={styles.mediaPreviewContainer}>
          <Image source={{ uri: mediaAttachment }} style={styles.mediaPreviewThumb} />
          <View style={styles.mediaPreviewInfo}>
            <Text style={styles.mediaPreviewLabel}>Image attached</Text>
            <Text style={styles.mediaPreviewSub}>Ready to send</Text>
          </View>
          <TouchableOpacity
            style={styles.mediaPreviewRemoveBtn}
            onPress={() => setMediaAttachment(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color="#ff4d4f" />
          </TouchableOpacity>
        </View>
      )}

      {/* Composer Bar */}
      <View style={[styles.composerContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          style={styles.composerIconBtn}
          onPress={handlePickImage}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="image-outline"
            size={22}
            color={mediaAttachment ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.composerIconBtn, showCodeEditor && styles.composerIconBtnActive]}
          onPress={() => setShowCodeEditor((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="code-slash"
            size={22}
            color={showCodeEditor ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.composerTextInput}
          placeholder="Send a message..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={handleTypingChange}
          multiline={true}
          maxHeight={100}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!inputText.trim() && !snippetCode.trim() && !mediaAttachment) && styles.sendBtnDisabled,
          ]}
          disabled={!inputText.trim() && !snippetCode.trim() && !mediaAttachment}
          onPress={handleSendMessage}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={18} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>

      {/* AI Companion Customization Modal */}
      {isAiChat && (
        <AiSettingsModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          conversationId={conversationId}
          currentSettings={customAiSettings}
          onSaved={(newSettings) => {
            setCustomAiSettings(newSettings);
            if (newSettings?.customName) {
              setOtherUser((prev) => ({ ...prev, name: newSettings.customName }));
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 166, 244, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 166, 244, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  headerAiBtnText: {
    color: colors.accent || '#1d9bf0',
    fontSize: 11,
    fontWeight: '700',
  },
  backBtn: {
    paddingRight: 12,
  },
  headerUserRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUserInfo: {
    marginLeft: 10,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  headerStatusText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  moreBtn: {
    paddingLeft: 12,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexGrow: 1,
  },
  msgItemWrapper: {
    marginBottom: 8,
  },
  dateDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateDividerText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginHorizontal: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowOther: {
    justifyContent: 'flex-start',
  },
  reactionTriggerBtn: {
    padding: 6,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  bubbleContainer: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleFailed: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: '#ffffff',
  },
  bubbleTextOther: {
    color: colors.text,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  msgTimeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  msgTimeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  msgTimeOther: {
    color: colors.textSecondary,
  },
  statusIconWrapper: {
    marginLeft: 4,
  },
  codeSnippetBox: {
    backgroundColor: '#0a0d14',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  codeLangPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeLangText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242e42',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  copyCodeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  codeContentText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#00e5ff',
    lineHeight: 18,
  },
  reactionBadgeRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -10,
  },
  reactionBadgeMine: {
    right: 8,
  },
  reactionBadgeOther: {
    left: 8,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  reactionPillActive: {
    backgroundColor: '#172e48',
    borderColor: '#38bdf8',
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 3,
  },
  reactionCountActive: {
    color: '#38bdf8',
  },
  quickEmojiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  quickEmojiBarMine: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  quickEmojiBarOther: {
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  quickEmojiScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickEmojiBtn: {
    padding: 6,
    borderRadius: 14,
  },
  quickEmojiBtnSelected: {
    backgroundColor: '#1a365d',
  },
  quickEmojiText: {
    fontSize: 18,
  },
  quickActionDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginHorizontal: 6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIconBtn: {
    padding: 6,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  composerIconBtn: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 20,
  },
  composerIconBtnActive: {
    backgroundColor: colors.surface,
  },
  composerTextInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    color: colors.text,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  codeDrawerContainer: {
    backgroundColor: '#0d1117',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 10,
  },
  codeDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeDrawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  codeDrawerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  langList: {
    flex: 1,
    marginHorizontal: 4,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#161b22',
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langPillTextActive: {
    color: '#ffffff',
  },
  codeDrawerInput: {
    backgroundColor: '#161b22',
    borderRadius: 8,
    padding: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#58a6ff',
    minHeight: 80,
    maxHeight: 140,
    textAlignVertical: 'top',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  headerCallBtn: {
    padding: 8,
    marginRight: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 155, 240, 0.1)',
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  headerStatusTyping: {
    color: '#10b981',
    fontWeight: '700',
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  typingDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  typingIndicatorText: {
    fontSize: 12,
    color: '#10b981',
    fontStyle: 'italic',
  },
  bubbleMediaWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  bubbleMediaImage: {
    width: 220,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#161b22',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mediaPreviewThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#161b22',
  },
  mediaPreviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  mediaPreviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  mediaPreviewSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  mediaPreviewRemoveBtn: {
    padding: 6,
  },
});

export default ConversationScreen;
