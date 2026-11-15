/**
 * Clearfeed Global Mini-Player Overlay
 * Persistent floating bar shown when a 1:1 Audio Call or Spaces Live room is active
 * in the background. Allows user to mute, hang up, or tap to maximize.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCall } from '../context/CallContext';
import Avatar from './Avatar';

export const MiniPlayerOverlay = () => {
  const insets = useSafeAreaInsets();
  const {
    callState,
    activeCall,
    groupCall,
    isMuted,
    isMinimized,
    callDuration,
    formatDuration,
    toggleMute,
    endCall,
    leaveGroupCall,
    maximizeCall,
  } = useCall();

  if (callState === 'idle' || !isMinimized) {
    return null;
  }

  const isGroup = callState === 'group';
  const title = isGroup
    ? groupCall?.roomName || 'Live Space'
    : activeCall?.otherUser?.name || 'Audio Call';
  const subtitle = `${formatDuration(callDuration)} • ${isGroup ? 'Space Active' : 'Connected'}`;

  const handleHangup = () => {
    if (isGroup) {
      leaveGroupCall();
    } else {
      endCall();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Platform.OS === 'android' ? 68 + insets.bottom : 74 + insets.bottom,
        },
      ]}
    >
      <Pressable
        style={styles.innerCard}
        onPress={maximizeCall}
        android_ripple={{ color: 'rgba(20, 184, 166, 0.15)', borderless: false }}
      >
        {/* Left: Avatar / Beacon Status */}
        <View style={styles.leftSection}>
          {isGroup ? (
            <View style={styles.spaceIconCircle}>
              <Ionicons name="radio" size={18} color="#14B8A6" />
            </View>
          ) : (
            <Avatar
              uri={activeCall?.otherUser?.avatarUrl}
              name={activeCall?.otherUser?.name}
              size={36}
              status="online"
            />
          )}

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.subRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
        </View>

        {/* Right Controls: Mute & Hangup */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.btnControl, isMuted && styles.btnMuted]}
            onPress={toggleMute}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={18}
              color={isMuted ? '#EF4444' : '#14B8A6'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnHangup}
            onPress={handleHangup}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  spaceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
    marginRight: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnControl: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  btnHangup: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MiniPlayerOverlay;
