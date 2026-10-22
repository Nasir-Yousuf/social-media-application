import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import colors from '../theme/colors';
import Avatar from './Avatar';
import { useCall } from '../context/CallContext';
import { useNotifications } from '../context/NotificationContext';

const { width } = Dimensions.get('window');

export const CallModal = () => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();
  const {
    callState,
    activeCall,
    groupCall,
    isMuted,
    isSpeaker,
    callDuration,
    formatDuration,
    acceptIncomingCall,
    declineIncomingCall,
    endCall,
    leaveGroupCall,
    toggleMute,
    toggleSpeaker,
  } = useCall();

  // Pulse animation for avatar ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Audio wave animation
  const waveAnim1 = useRef(new Animated.Value(12)).current;
  const waveAnim2 = useRef(new Animated.Value(24)).current;
  const waveAnim3 = useRef(new Animated.Value(16)).current;
  const waveAnim4 = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (callState === 'incoming' || callState === 'calling') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.22,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callState, pulseAnim]);

  useEffect(() => {
    if (callState === 'connected' || callState === 'group') {
      const animateWaves = () => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(waveAnim1, { toValue: 32, duration: 350, useNativeDriver: false }),
              Animated.timing(waveAnim2, { toValue: 14, duration: 400, useNativeDriver: false }),
              Animated.timing(waveAnim3, { toValue: 28, duration: 320, useNativeDriver: false }),
              Animated.timing(waveAnim4, { toValue: 18, duration: 450, useNativeDriver: false }),
            ]),
            Animated.parallel([
              Animated.timing(waveAnim1, { toValue: 12, duration: 350, useNativeDriver: false }),
              Animated.timing(waveAnim2, { toValue: 34, duration: 400, useNativeDriver: false }),
              Animated.timing(waveAnim3, { toValue: 15, duration: 320, useNativeDriver: false }),
              Animated.timing(waveAnim4, { toValue: 32, duration: 450, useNativeDriver: false }),
            ]),
          ])
        ).start();
      };
      animateWaves();
    }
  }, [callState, waveAnim1, waveAnim2, waveAnim3, waveAnim4]);

  if (callState === 'idle') {
    return null;
  }

  const copyRoomLink = async () => {
    if (groupCall?.roomId) {
      await Clipboard.setStringAsync(groupCall.roomId);
      showToast('Room Code copied to clipboard!', 'success');
    }
  };

  const otherUser = activeCall?.otherUser;

  return (
    <Modal
      visible={callState !== 'idle'}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        {/* Background Ambient Glow */}
        <View style={styles.ambientGlow} />

        {/* ========================================================================= */}
        {/* SCENARIO 1: INCOMING CALL SCREEN */}
        {/* ========================================================================= */}
        {callState === 'incoming' && (
          <View style={styles.screenContent}>
            <View style={styles.headerInfo}>
              <View style={styles.badgeRow}>
                <Ionicons name="call" size={14} color="#10b981" />
                <Text style={styles.badgeText}>INCOMING AUDIO CALL</Text>
              </View>
              <Text style={styles.callingUserName}>{otherUser?.name || 'Someone'}</Text>
              <Text style={styles.callingUserHandle}>@{otherUser?.username || 'user'}</Text>
            </View>

            <View style={styles.avatarCenter}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
              <Avatar uri={otherUser?.avatarUrl} name={otherUser?.name} size={110} />
            </View>

            <Text style={styles.incomingSubtext}>Clearfeed Encrypted Audio Call</Text>

            <View style={styles.actionsRow}>
              {/* Decline Button */}
              <TouchableOpacity
                style={[styles.callBtn, styles.declineBtn]}
                onPress={declineIncomingCall}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={32} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
                <Text style={styles.btnLabel}>Decline</Text>
              </TouchableOpacity>

              {/* Accept Button */}
              <TouchableOpacity
                style={[styles.callBtn, styles.acceptBtn]}
                onPress={acceptIncomingCall}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={32} color="#ffffff" />
                <Text style={styles.btnLabel}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 2: OUTGOING CALL SCREEN */}
        {/* ========================================================================= */}
        {callState === 'calling' && (
          <View style={styles.screenContent}>
            <View style={styles.headerInfo}>
              <View style={styles.badgeRow}>
                <Ionicons name="radio" size={14} color="#1d9bf0" />
                <Text style={[styles.badgeText, { color: '#1d9bf0' }]}>
                  {activeCall?.status === 'ringing' ? 'RINGING...' : 'CALLING...'}
                </Text>
              </View>
              <Text style={styles.callingUserName}>{otherUser?.name || 'User'}</Text>
              <Text style={styles.callingUserHandle}>@{otherUser?.username || 'user'}</Text>
            </View>

            <View style={styles.avatarCenter}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
              <Avatar uri={otherUser?.avatarUrl} name={otherUser?.name} size={110} />
            </View>

            <Text style={styles.incomingSubtext}>Connecting 100% Free Peer-to-Peer Audio...</Text>

            <View style={styles.singleActionRow}>
              <TouchableOpacity
                style={[styles.callBtn, styles.declineBtn]}
                onPress={endCall}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={32} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
                <Text style={styles.btnLabel}>End Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 3: CONNECTED 1-ON-1 AUDIO CALL */}
        {/* ========================================================================= */}
        {callState === 'connected' && (
          <View style={styles.screenContent}>
            <View style={styles.headerInfo}>
              <View style={styles.activeCallBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
              </View>
              <Text style={styles.callingUserName}>{otherUser?.name || 'User'}</Text>
              <Text style={styles.callingUserHandle}>@{otherUser?.username || 'user'}</Text>
            </View>

            <View style={styles.avatarCenter}>
              <Avatar uri={otherUser?.avatarUrl} name={otherUser?.name} size={120} />

              {/* Animated Audio Waveform */}
              <View style={styles.waveformContainer}>
                <Animated.View style={[styles.waveBar, { height: waveAnim1 }]} />
                <Animated.View style={[styles.waveBar, { height: waveAnim2 }]} />
                <Animated.View style={[styles.waveBar, { height: waveAnim3 }]} />
                <Animated.View style={[styles.waveBar, { height: waveAnim4 }]} />
                <Animated.View style={[styles.waveBar, { height: waveAnim2 }]} />
                <Animated.View style={[styles.waveBar, { height: waveAnim1 }]} />
              </View>
            </View>

            <Text style={styles.connectedStatus}>
              {isMuted ? 'Microphone Muted' : 'HD Audio Encrypted (STUN Peer-to-Peer)'}
            </Text>

            {/* In-Call Audio Controls */}
            <View style={styles.inCallControls}>
              {/* Mute Button */}
              <TouchableOpacity
                style={[styles.controlCircle, isMuted && styles.controlActive]}
                onPress={toggleMute}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? '#ef4444' : '#ffffff'}
                />
                <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
              </TouchableOpacity>

              {/* End Call Button */}
              <TouchableOpacity
                style={[styles.callBtn, styles.declineBtn, { width: 68, height: 68, borderRadius: 34 }]}
                onPress={endCall}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={30} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>

              {/* Speaker Button */}
              <TouchableOpacity
                style={[styles.controlCircle, isSpeaker && styles.controlActive]}
                onPress={toggleSpeaker}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isSpeaker ? 'volume-high' : 'volume-medium'}
                  size={24}
                  color={isSpeaker ? '#1d9bf0' : '#ffffff'}
                />
                <Text style={styles.controlLabel}>{isSpeaker ? 'Speaker' : 'Ear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 4: GROUP AUDIO CALL */}
        {/* ========================================================================= */}
        {callState === 'group' && (
          <View style={[styles.screenContent, { justifyContent: 'flex-start' }]}>
            <View style={styles.groupHeader}>
              <View>
                <Text style={styles.groupRoomTitle}>{groupCall?.roomName || 'Group Audio Call'}</Text>
                <View style={styles.groupSubRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.groupSubtext}>
                    {formatDuration(callDuration)} • {groupCall?.participants?.length || 1} connected
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.copyCodeBtn} onPress={copyRoomLink} activeOpacity={0.7}>
                <Feather name="copy" size={15} color="#1d9bf0" />
                <Text style={styles.copyCodeText}>Code</Text>
              </TouchableOpacity>
            </View>

            {/* Participants Grid */}
            <ScrollView
              contentContainerStyle={styles.participantsGrid}
              showsVerticalScrollIndicator={false}
            >
              {(groupCall?.participants || []).map((p, idx) => (
                <View key={p.user?._id || idx} style={styles.participantCard}>
                  <Avatar uri={p.user?.avatarUrl} name={p.user?.name} size={64} />
                  <Text style={styles.pName} numberOfLines={1}>
                    {p.user?.name || 'Member'}
                  </Text>
                  <Text style={styles.pHandle} numberOfLines={1}>
                    @{p.user?.username || 'member'}
                  </Text>

                  {p.isMuted ? (
                    <View style={styles.mutedBadge}>
                      <Ionicons name="mic-off" size={12} color="#ef4444" />
                      <Text style={styles.mutedText}>Muted</Text>
                    </View>
                  ) : (
                    <View style={styles.speakingBadge}>
                      <Ionicons name="volume-medium" size={12} color="#10b981" />
                      <Text style={styles.speakingText}>Speaking</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* In-Group Controls Bar */}
            <View style={styles.groupControlsBar}>
              <TouchableOpacity
                style={[styles.controlCircle, isMuted && styles.controlActive]}
                onPress={toggleMute}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? '#ef4444' : '#ffffff'}
                />
                <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.callBtn, styles.declineBtn, { width: 68, height: 68, borderRadius: 34 }]}
                onPress={leaveGroupCall}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={30} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlCircle, isSpeaker && styles.controlActive]}
                onPress={toggleSpeaker}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isSpeaker ? 'volume-high' : 'volume-medium'}
                  size={24}
                  color={isSpeaker ? '#1d9bf0' : '#ffffff'}
                />
                <Text style={styles.controlLabel}>Speaker</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  ambientGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(29, 155, 240, 0.08)',
  },
  screenContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  callingUserName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  callingUserHandle: {
    color: colors.textSecondary || '#8b98a5',
    fontSize: 15,
    marginTop: 4,
  },
  avatarCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 40,
  },
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(29, 155, 240, 0.4)',
    backgroundColor: 'rgba(29, 155, 240, 0.08)',
  },
  incomingSubtext: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  singleActionRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  callBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  declineBtn: {
    backgroundColor: '#ef4444',
  },
  acceptBtn: {
    backgroundColor: '#10b981',
  },
  btnLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    position: 'absolute',
    bottom: -22,
  },
  activeCallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  durationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    height: 40,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#1d9bf0',
  },
  connectedStatus: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 24,
  },
  inCallControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  controlCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  controlLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    position: 'absolute',
    bottom: -18,
  },
  // Group Call Styles
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  groupRoomTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  groupSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  groupSubtext: {
    color: '#94a3b8',
    fontSize: 12,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(29, 155, 240, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  copyCodeText: {
    color: '#1d9bf0',
    fontSize: 12,
    fontWeight: '700',
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 20,
    width: width - 48,
  },
  participantCard: {
    width: (width - 48 - 12) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  pHandle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  mutedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mutedText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
  },
  speakingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  speakingText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  groupControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default CallModal;
