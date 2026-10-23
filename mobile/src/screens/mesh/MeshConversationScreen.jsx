import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useMesh } from '../../mesh/context/MeshContext';
import { DeliveryState } from '../../mesh/routing/meshRouter';
import { computeFingerprint } from '../../mesh/crypto/meshCrypto';
import { BROADCAST_PUBKEY } from '../../mesh/protocol/wireProtocol';

export const MeshConversationScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: currentColors } = useTheme();
  const { recipientPubkey, recipientNickname } = route.params || {};
  const { loadMessages, sendMessage, peers } = useMesh();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);

  const isBroadcast = (recipientPubkey || '').toLowerCase() === BROADCAST_PUBKEY.toLowerCase();
  const currentPeer = peers.find(
    (p) => p.publicKeyHex?.toLowerCase() === recipientPubkey?.toLowerCase()
  );
  const fingerprint = isBroadcast ? 'PUBLIC BROADCAST ROOM' : (currentPeer?.fingerprint || computeFingerprint(recipientPubkey || ''));
  const isVerified = currentPeer?.status === 'verified';

  // Listen to keyboard show/hide to automatically keep input and bottom messages in view
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!recipientPubkey) return;
      const history = await loadMessages(recipientPubkey);
      if (isMounted) {
        setMessages(history);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [recipientPubkey, loadMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');
    try {
      await sendMessage({
        recipientPubkey,
        recipientNickname: recipientNickname || 'Mesh Peer',
        text,
      });
      const updated = await loadMessages(recipientPubkey);
      setMessages(updated);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
    } catch (err) {
      Alert.alert('Send Failed', err.message);
    } finally {
      setSending(false);
    }
  };

  const renderDeliveryBadge = (status, isMe = true) => {
    const badgeColor = isMe ? 'rgba(255, 255, 255, 0.9)' : '#00ba7c';
    switch (status) {
      case DeliveryState.DELIVERED_ACK:
        return (
          <View style={styles.deliveryRow}>
            <Ionicons name="checkmark-done" size={13} color={badgeColor} />
            <Text style={[styles.deliveryText, { color: badgeColor }]}>Delivered</Text>
          </View>
        );
      case DeliveryState.SENT_NEIGHBOR:
        return (
          <View style={styles.deliveryRow}>
            <Ionicons name="checkmark" size={13} color={badgeColor} />
            <Text style={[styles.deliveryText, { color: badgeColor }]}>Sent to Peer</Text>
          </View>
        );
      case DeliveryState.RELAYED:
        return (
          <View style={styles.deliveryRow}>
            <MaterialCommunityIcons name="transit-connection-variant" size={13} color={badgeColor} />
            <Text style={[styles.deliveryText, { color: badgeColor }]}>Relayed</Text>
          </View>
        );
      case DeliveryState.QUEUED:
        return (
          <View style={styles.deliveryRow}>
            <Ionicons name="time-outline" size={12} color={badgeColor} />
            <Text style={[styles.deliveryText, { color: badgeColor }]}>Queued</Text>
          </View>
        );
      case DeliveryState.SAVED_LOCALLY:
      default:
        return (
          <View style={styles.deliveryRow}>
            <Ionicons name="checkmark-outline" size={12} color={badgeColor} />
            <Text style={[styles.deliveryText, { color: badgeColor }]}>Saved</Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.bg }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 6,
              borderBottomColor: currentColors.border,
              backgroundColor: currentColors.surface,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <View style={styles.nameRow}>
            <Text style={[styles.headerName, { color: currentColors.text }]}>
              {isBroadcast ? '📢 Nearby Public Broadcast' : (recipientNickname || 'Mesh Peer')}
            </Text>
            {isVerified && !isBroadcast && (
              <Ionicons
                name="shield-checkmark"
                size={16}
                color="#00ba7c"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <Text
            style={[styles.headerFingerprint, { color: currentColors.textSecondary }]}
            numberOfLines={1}
          >
            {isBroadcast ? 'Broadcast to all nearby devices • সবার সাথে উন্মুক্ত চ্যাট' : fingerprint}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              isBroadcast ? 'Nearby Public Broadcast' : 'End-to-End Encryption',
              isBroadcast
                ? 'Messages sent in this channel are heard by all Clearfeed Mesh devices within local radio range without requiring internet or pairing.'
                : `Conversation with ${recipientNickname} is encrypted with ChaCha20-Poly1305. Packets passing through intermediate relay nodes cannot be read.\n\nKey Fingerprint:\n${fingerprint}`
            )
          }
          style={styles.infoBtn}
        >
          <Ionicons
            name={isBroadcast ? 'megaphone-outline' : 'lock-closed'}
            size={18}
            color="#00ba7c"
          />
        </TouchableOpacity>
      </View>

      {/* Security Info Banner */}
      <View
        style={[
          styles.securityPill,
          {
            backgroundColor: currentColors.surface,
            borderBottomColor: currentColors.border,
          },
        ]}
      >
        <MaterialCommunityIcons name="shield-lock-outline" size={14} color="#00ba7c" />
        <Text
          style={[styles.securityPillText, { color: currentColors.textSecondary }]}
        >
          Offline Encrypted Mesh • Multi-Hop Relay Active
        </Text>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || item.packetId}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={36}
              color="#00ba7c"
              style={{ marginBottom: 10 }}
            />
            <Text style={[styles.emptyText, { color: currentColors.text }]}>
              No messages yet
            </Text>
            <Text
              style={[styles.emptySubtext, { color: currentColors.textSecondary }]}
            >
              Messages sent here are encrypted locally and travel directly or across mesh hops without cloud servers.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMe = item.isOutgoing;
          return (
            <View
              style={[
                styles.messageRow,
                isMe ? styles.messageRowMe : styles.messageRowOther,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMe
                    ? { backgroundColor: '#00ba7c' }
                    : {
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                        borderWidth: 1,
                      },
                ]}
              >
                {!isMe && isBroadcast && (
                  <Text style={styles.broadcastSenderNick}>
                    {item.senderNickname || 'Nearby Peer'}
                  </Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    { color: isMe ? '#ffffff' : currentColors.text },
                  ]}
                >
                  {item.text}
                </Text>

                <View style={styles.messageMetaRow}>
                  <Text
                    style={[
                      styles.messageTime,
                      {
                        color: isMe
                          ? 'rgba(255,255,255,0.75)'
                          : currentColors.textSecondary,
                      },
                    ]}
                  >
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {isMe && renderDeliveryBadge(item.deliveryStatus, isMe)}
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Input Bar */}
      <View
        style={[
          styles.inputContainer,
          {
            borderTopColor: currentColors.border,
            backgroundColor: currentColors.surface,
            paddingBottom: isKeyboardVisible ? 8 : Math.max(insets.bottom, 10),
          },
        ]}
      >
        <TextInput
          style={[
            styles.inputField,
            {
              backgroundColor: currentColors.bg,
              borderColor: currentColors.border,
              color: currentColors.text,
            },
          ]}
          placeholder={
            isBroadcast
              ? '📢 Broadcast message to everyone...'
              : 'Type an offline encrypted message...'
          }
          placeholderTextColor={currentColors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          onFocus={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 120);
          }}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                inputText.trim().length > 0 ? '#00ba7c' : currentColors.border,
            },
          ]}
          onPress={handleSend}
          disabled={inputText.trim().length === 0 || sending}
        >
          <Ionicons name="arrow-up" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitleGroup: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  headerName: { fontSize: 16, fontWeight: '800' },
  headerFingerprint: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginTop: 2,
  },
  infoBtn: { padding: 6 },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 6,
  },
  securityPillText: { fontSize: 11, fontWeight: '600', flexShrink: 1 },
  messageList: { padding: 14, paddingBottom: 16 },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyText: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  broadcastSenderNick: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00ba7c',
    marginBottom: 3,
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 6,
  },
  messageTime: { fontSize: 10 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deliveryText: { fontSize: 10, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MeshConversationScreen;
