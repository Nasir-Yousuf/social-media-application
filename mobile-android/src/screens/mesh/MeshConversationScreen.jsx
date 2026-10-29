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
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  // Voice note recording states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordingTimerRef = useRef(null);

  // Simulated voice note playback
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const playbackTimeoutRef = useRef(null);

  const flatListRef = useRef(null);

  const isBroadcast = (recipientPubkey || '').toLowerCase() === BROADCAST_PUBKEY.toLowerCase();
  const currentPeer = peers.find(
    (p) => p.publicKeyHex?.toLowerCase() === recipientPubkey?.toLowerCase()
  );
  const fingerprint = isBroadcast ? 'PUBLIC BROADCAST ROOM' : (currentPeer?.fingerprint || computeFingerprint(recipientPubkey || ''));
  const isVerified = currentPeer?.status === 'verified';

  // Listen to keyboard show/hide to keep bottom messages in view
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

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, []);

  const handleSendText = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');
    try {
      await sendMessage({
        recipientPubkey,
        recipientNickname: recipientNickname || 'Mesh Peer',
        text,
        type: 'text',
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

  // 1. Pick and send image (Gallery or Camera)
  const handlePickImage = () => {
    Alert.alert(
      'Attach Photo',
      'Select a photo to send securely over Bluetooth Mesh',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if (!perm.granted) {
                Alert.alert('Permission needed', 'Camera permission is required.');
                return;
              }
              const res = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5,
                base64: true,
              });
              if (!res.canceled && res.assets && res.assets[0]) {
                await sendImagePayload(res.assets[0]);
              }
            } catch (err) {
              Alert.alert('Camera error', err.message);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) {
                Alert.alert('Permission needed', 'Gallery permission is required.');
                return;
              }
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5,
                base64: true,
              });
              if (!res.canceled && res.assets && res.assets[0]) {
                await sendImagePayload(res.assets[0]);
              }
            } catch (err) {
              Alert.alert('Gallery error', err.message);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const sendImagePayload = async (asset) => {
    setSending(true);
    try {
      const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      await sendMessage({
        recipientPubkey,
        recipientNickname: recipientNickname || 'Mesh Peer',
        text: '📷 Photo',
        type: 'image',
        mediaBase64: base64Data,
        mediaMime: 'image/jpeg',
      });
      const updated = await loadMessages(recipientPubkey);
      setMessages(updated);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      Alert.alert('Photo send failed', err.message);
    } finally {
      setSending(false);
    }
  };

  // 2. Voice Note Recording
  const handleStartVoiceRecord = () => {
    setIsRecordingVoice(true);
    setRecordSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordSeconds((sec) => sec + 1);
    }, 1000);
  };

  const handleCancelVoiceRecord = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setRecordSeconds(0);
  };

  const handleSendVoiceNote = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = recordSeconds > 0 ? recordSeconds : 1;
    setIsRecordingVoice(false);
    setRecordSeconds(0);
    setSending(true);

    try {
      await sendMessage({
        recipientPubkey,
        recipientNickname: recipientNickname || 'Mesh Peer',
        text: `🎤 Voice note (${duration}s)`,
        type: 'voice',
        duration,
        mediaMime: 'audio/m4a',
      });
      const updated = await loadMessages(recipientPubkey);
      setMessages(updated);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
    } catch (err) {
      Alert.alert('Voice send failed', err.message);
    } finally {
      setSending(false);
    }
  };

  const togglePlayVoiceNote = (messageId, duration) => {
    if (playingVoiceId === messageId) {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
      setPlayingVoiceId(null);
    } else {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
      setPlayingVoiceId(messageId);
      playbackTimeoutRef.current = setTimeout(() => {
        setPlayingVoiceId(null);
      }, (duration || 3) * 1000);
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
                  ? 'Messages sent in this channel are heard by all ClearFeed Mesh devices within local radio range without requiring internet or pairing.'
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

        {/* Security or Broadcast Info Banner */}
        {isBroadcast ? (
          <View
            style={[
              styles.broadcastHelperPill,
              {
                backgroundColor: 'rgba(0,186,124,0.12)',
                borderBottomColor: 'rgba(0,186,124,0.25)',
              },
            ]}
          >
            <Ionicons name="radio-outline" size={15} color="#00ba7c" style={{ marginRight: 6 }} />
            <Text style={styles.broadcastHelperText}>
              📡 Nearby Public Chat • Everyone on your Bluetooth mesh can talk freely!
            </Text>
          </View>
        ) : (
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
        )}

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
                Send text, photos, or voice notes. Packets travel directly or across mesh hops 100% offline.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.isOutgoing;
            const isImage = item.type === 'image' && item.mediaBase64;
            const isVoice = item.type === 'voice' || item.type === 'audio';

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

                  {/* 1. Image Message */}
                  {isImage ? (
                    <TouchableOpacity
                      onPress={() => setSelectedImageModal(item.mediaBase64)}
                      activeOpacity={0.9}
                      style={styles.imageBubbleContainer}
                    >
                      <Image
                        source={{ uri: item.mediaBase64 }}
                        style={styles.imageThumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlayTag}>
                        <Ionicons name="expand" size={14} color="#ffffff" />
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {/* 2. Voice Note Message */}
                  {isVoice ? (
                    <View style={styles.voiceBubbleContainer}>
                      <TouchableOpacity
                        onPress={() => togglePlayVoiceNote(item.id || item.packetId, item.duration || 3)}
                        style={[
                          styles.voicePlayBtn,
                          { backgroundColor: isMe ? 'rgba(255,255,255,0.25)' : '#00ba7c' },
                        ]}
                      >
                        <Ionicons
                          name={playingVoiceId === (item.id || item.packetId) ? 'pause' : 'play'}
                          size={18}
                          color="#ffffff"
                        />
                      </TouchableOpacity>
                      <View style={styles.voiceWaveformArea}>
                        <View style={styles.waveformBars}>
                          {[12, 22, 16, 26, 18, 14, 20, 10, 24, 16].map((h, i) => (
                            <View
                              key={i}
                              style={[
                                styles.waveformBar,
                                {
                                  height: h,
                                  backgroundColor: isMe
                                    ? 'rgba(255,255,255,0.85)'
                                    : currentColors.accent || '#00ba7c',
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text
                          style={[
                            styles.voiceDurationText,
                            { color: isMe ? 'rgba(255,255,255,0.85)' : currentColors.textSecondary },
                          ]}
                        >
                          {playingVoiceId === (item.id || item.packetId) ? 'Playing...' : `0:0${item.duration || 3}`}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {/* 3. Text Message */}
                  {item.text && !isVoice && !isImage ? (
                    <Text
                      style={[
                        styles.messageText,
                        { color: isMe ? '#ffffff' : currentColors.text },
                      ]}
                    >
                      {item.text}
                    </Text>
                  ) : null}

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

        {/* Input Bar / Voice Recording Bar */}
        {isRecordingVoice ? (
          <View
            style={[
              styles.voiceRecordingBar,
              {
                backgroundColor: currentColors.surface,
                borderTopColor: currentColors.border,
                paddingBottom: Math.max(insets.bottom, 12),
              },
            ]}
          >
            <View style={styles.voiceRecordingTimer}>
              <View style={styles.recordingDot} />
              <Text style={[styles.recordingTimerText, { color: currentColors.text }]}>
                Recording {Math.floor(recordSeconds / 60)}:{(recordSeconds % 60).toString().padStart(2, '0')}
              </Text>
            </View>

            <View style={styles.voiceRecordingActions}>
              <TouchableOpacity
                onPress={handleCancelVoiceRecord}
                style={styles.voiceCancelBtn}
              >
                <Ionicons name="trash-outline" size={20} color="#ff453a" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendVoiceNote}
                style={styles.voiceSendBtn}
              >
                <Ionicons name="arrow-up" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
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
            {/* Attachment Button (Photo) */}
            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.mediaBtn}
              accessibilityLabel="Attach Photo"
            >
              <Ionicons name="image-outline" size={22} color={currentColors.textSecondary} />
            </TouchableOpacity>

            {/* Mic Button (Voice Note) */}
            <TouchableOpacity
              onPress={handleStartVoiceRecord}
              style={styles.mediaBtn}
              accessibilityLabel="Record Voice Note"
            >
              <Ionicons name="mic-outline" size={22} color={currentColors.textSecondary} />
            </TouchableOpacity>

            {/* Input Field */}
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
                  ? '📢 Broadcast to everyone...'
                  : 'Type an offline message...'
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

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    inputText.trim().length > 0 ? '#00ba7c' : currentColors.border,
                },
              ]}
              onPress={handleSendText}
              disabled={inputText.trim().length === 0 || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="arrow-up" size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Full-Screen Image Viewer Modal */}
      <Modal
        visible={!!selectedImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImageModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={[styles.modalCloseBtn, { top: insets.top + 10 }]}
            onPress={() => setSelectedImageModal(null)}
          >
            <Ionicons name="close" size={26} color="#ffffff" />
          </TouchableOpacity>
          {selectedImageModal && (
            <Image
              source={{ uri: selectedImageModal }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  broadcastHelperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  broadcastHelperText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00ba7c',
    textAlign: 'center',
  },
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
  imageBubbleContainer: {
    width: 220,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  imageThumbnail: { width: '100%', height: '100%' },
  imageOverlayTag: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  voiceBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 190,
    paddingVertical: 4,
    gap: 8,
  },
  voicePlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceWaveformArea: { flex: 1 },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 3,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDurationText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
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
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  mediaBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  voiceRecordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  voiceRecordingTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff453a',
  },
  recordingTimerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  voiceRecordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceCancelBtn: {
    padding: 8,
  },
  voiceSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00ba7c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImage: {
    width: '94%',
    height: '80%',
  },
});

export default MeshConversationScreen;
