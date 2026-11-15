/**
 * Clearfeed Connect Screen (Tab 4)
 * Segmented switcher uniting:
 * - Cloud Messages (E2E socket-backed cloud direct messaging)
 * - Clearfeed Mesh (Zero-internet peer-to-peer BLE & LAN mesh network)
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MessagesScreen from './MessagesScreen';
import MeshHomeScreen from './mesh/MeshHomeScreen';
import { useNotifications } from '../context/NotificationContext';
import { useMesh } from '../mesh/context/MeshContext';

export const ConnectScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const initialMode = route?.params?.initialMode || 'cloud';
  const [activeMode, setActiveMode] = useState(initialMode);
  const { unreadMessagesCount } = useNotifications();
  const { peerCount, unreadMeshCount = 0 } = useMesh ? useMesh() : {};

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Segmented Mode Switcher */}
      <View style={styles.switcherContainer}>
        <View style={styles.segmentTrack}>
          {/* Cloud Messages Tab */}
          <Pressable
            style={[
              styles.segmentTab,
              activeMode === 'cloud' && styles.segmentTabActiveCloud,
            ]}
            onPress={() => setActiveMode('cloud')}
            android_ripple={{ color: 'rgba(20, 184, 166, 0.15)', borderless: false }}
          >
            <Ionicons
              name="chatbubbles"
              size={15}
              color={activeMode === 'cloud' ? '#14B8A6' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeMode === 'cloud' && styles.segmentTextActiveCloud,
              ]}
            >
              Cloud Chat
            </Text>
            {unreadMessagesCount > 0 && (
              <View style={styles.badgeCloud}>
                <Text style={styles.badgeText}>{unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Offline Mesh Network Tab */}
          <Pressable
            style={[
              styles.segmentTab,
              activeMode === 'mesh' && styles.segmentTabActiveMesh,
            ]}
            onPress={() => setActiveMode('mesh')}
            android_ripple={{ color: 'rgba(245, 158, 11, 0.15)', borderless: false }}
          >
            <Ionicons
              name="radio"
              size={15}
              color={activeMode === 'mesh' ? '#F59E0B' : '#94A3B8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentText,
                activeMode === 'mesh' && styles.segmentTextActiveMesh,
              ]}
            >
              Mesh P2P
            </Text>
            {peerCount > 0 && (
              <View style={styles.peerPill}>
                <Text style={styles.peerPillText}>{peerCount} online</Text>
              </View>
            )}
            {unreadMeshCount > 0 && (
              <View style={styles.badgeMesh}>
                <Text style={styles.badgeText}>{unreadMeshCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Screen Host */}
      <View style={styles.contentHost}>
        {activeMode === 'cloud' ? (
          <MessagesScreen navigation={navigation} />
        ) : (
          <MeshHomeScreen navigation={navigation} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  switcherContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#090D16',
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentTabActiveCloud: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#14B8A6',
  },
  segmentTabActiveMesh: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  segmentTextActiveCloud: {
    color: '#14B8A6',
  },
  segmentTextActiveMesh: {
    color: '#F59E0B',
  },
  badgeCloud: {
    backgroundColor: '#14B8A6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  badgeMesh: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  badgeText: {
    color: '#090D16',
    fontSize: 10,
    fontWeight: '900',
  },
  peerPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  peerPillText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  contentHost: {
    flex: 1,
  },
});

export default ConnectScreen;
