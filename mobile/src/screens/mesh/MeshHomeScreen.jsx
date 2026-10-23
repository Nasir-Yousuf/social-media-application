import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useMesh } from '../../mesh/context/MeshContext';
import { MeshPairingModal } from '../../components/mesh/MeshPairingModal';
import { BROADCAST_PUBKEY } from '../../mesh/protocol/wireProtocol';

export const MeshHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: currentColors } = useTheme();
  const {
    identity,
    transportState,
    transportExplanation,
    peers,
    conversations,
    settings,
    addPeer,
  } = useMesh();

  const [showPairModal, setShowPairModal] = useState(false);
  const activePeerCount = peers.filter((p) => p.status !== 'blocked').length;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: currentColors.bg },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: currentColors.border,
            backgroundColor: currentColors.surface,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back to app"
        >
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <View style={styles.brandBadge}>
            <MaterialCommunityIcons
              name="transit-connection-variant"
              size={18}
              color="#00ba7c"
            />
            <Text style={styles.brandTitle}>
              Clearfeed <Text style={{ color: '#00ba7c' }}>Mesh</Text>
            </Text>
          </View>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentColors.textSecondary },
            ]}
          >
            Connect nearby. Communicate offline.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            onPress={() => setShowPairModal(true)}
            style={styles.iconBtn}
            accessibilityLabel="Scan & Connect QR"
          >
            <Ionicons
              name="qr-code-outline"
              size={21}
              color="#00ba7c"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MeshSettings')}
            style={styles.iconBtn}
            accessibilityLabel="Mesh Settings"
          >
            <Ionicons
              name="settings-outline"
              size={21}
              color={currentColors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status / Connectivity Banner */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <View style={styles.statusHeader}>
            <View style={styles.statusDotRow}>
              <View style={[styles.pulseDot, { backgroundColor: '#00ba7c' }]} />
              <Text style={[styles.statusTitle, { color: currentColors.text }]}>
                Offline Mesh Mode Active
              </Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>P2P Radio</Text>
            </View>
          </View>
          <Text
            style={[
              styles.statusExplanation,
              { color: currentColors.textSecondary },
            ]}
          >
            {transportExplanation}
          </Text>
        </View>

        {/* 1. NEARBY ACTIVE DEVICES (Tap-to-chat instantly without scanning) */}
        <View
          style={[
            styles.radarCard,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <View style={styles.radarHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.pulseDot, { backgroundColor: '#00ba7c' }]} />
              <Text style={[styles.radarTitle, { color: currentColors.text }]}>
                Nearby Active Users • আশেপাশে সক্রিয়
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowPairModal(true)}>
              <Text style={styles.qrScanLink}>Scan QR</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.radarList}
          >
            {/* Quick Pair Button */}
            <TouchableOpacity
              style={styles.radarItem}
              onPress={() => setShowPairModal(true)}
            >
              <View style={[styles.radarAvatar, { borderColor: '#00ba7c', borderStyle: 'dashed' }]}>
                <Ionicons name="qr-code-outline" size={20} color="#00ba7c" />
              </View>
              <Text style={[styles.radarNick, { color: currentColors.text }]} numberOfLines={1}>
                Pair / Scan
              </Text>
            </TouchableOpacity>

            {/* Discovered Nearby Devices */}
            {peers.length === 0 ? (
              <View style={styles.emptyRadarBox}>
                <Text style={[styles.emptyRadarText, { color: currentColors.textSecondary }]}>
                  Keep Mesh open nearby to auto-detect phones and laptops
                </Text>
              </View>
            ) : (
              peers.map((peer) => (
                <TouchableOpacity
                  key={peer.publicKeyHex}
                  style={styles.radarItem}
                  onPress={() =>
                    navigation.navigate('MeshConversation', {
                      recipientPubkey: peer.publicKeyHex,
                      recipientNickname: peer.nickname,
                    })
                  }
                >
                  <View style={[styles.radarAvatar, { backgroundColor: 'rgba(0,186,124,0.15)', borderColor: '#00ba7c' }]}>
                    <Text style={styles.radarInitial}>
                      {peer.nickname?.[0]?.toUpperCase() || 'P'}
                    </Text>
                    <View style={styles.radarGreenDot} />
                  </View>
                  <Text style={[styles.radarNick, { color: currentColors.text }]} numberOfLines={1}>
                    {peer.nickname}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* 2. PINNED PUBLIC BROADCAST CHANNEL (Chat with everyone in range) */}
        <TouchableOpacity
          style={[
            styles.publicBroadcastCard,
            {
              backgroundColor: currentColors.surface,
              borderColor: 'rgba(0,186,124,0.4)',
            },
          ]}
          onPress={() =>
            navigation.navigate('MeshConversation', {
              recipientPubkey: BROADCAST_PUBKEY,
              recipientNickname: '📢 Public Broadcast (Everyone Nearby)',
            })
          }
        >
          <View style={styles.broadcastIconBadge}>
            <Ionicons name="megaphone" size={22} color="#ffffff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.publicBroadcastTitle, { color: currentColors.text }]}>
                Nearby Public Broadcast
              </Text>
              <View style={styles.publicLiveBadge}>
                <Text style={styles.publicLiveBadgeText}>EVERYONE</Text>
              </View>
            </View>
            <Text style={[styles.publicBroadcastDesc, { color: currentColors.textSecondary }]} numberOfLines={1}>
              Broadcast to all devices in range • ইন্টারনেট ছাড়া সবাইকে বার্তা
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#00ba7c" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* 3. CONVERSATIONS LIST (Direct 1-on-1 Chats) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Direct Encrypted Chats
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MeshPeers')}
            style={styles.newChatBtn}
          >
            <Ionicons name="people-outline" size={15} color="#00ba7c" />
            <Text style={styles.newChatBtnText}>All Nearby ({peers.length})</Text>
          </TouchableOpacity>
        </View>

        {conversations.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="chat-sleep-outline"
              size={42}
              color={currentColors.textSecondary}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={[styles.emptyTitle, { color: currentColors.text }]}
            >
              No offline conversations yet
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: currentColors.textSecondary },
              ]}
            >
              When other users open Clearfeed Mesh nearby, you can exchange end-to-end encrypted messages without internet.
            </Text>
            <TouchableOpacity
              style={[styles.findPeersBtn, { backgroundColor: '#00ba7c' }]}
              onPress={() => navigation.navigate('MeshPeers')}
            >
              <Text style={styles.findPeersBtnText}>Discover Nearby Peers</Text>
            </TouchableOpacity>
          </View>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity
              key={conv.id}
              style={[
                styles.convCard,
                {
                  backgroundColor: currentColors.surface,
                  borderColor: currentColors.border,
                },
              ]}
              onPress={() =>
                navigation.navigate('MeshConversation', {
                  recipientPubkey: conv.recipientPubkey,
                  recipientNickname: conv.recipientNickname,
                })
              }
            >
              <View style={styles.convAvatar}>
                <Ionicons name="person" size={20} color="#00ba7c" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.convTopRow}>
                  <Text
                    style={[styles.convName, { color: currentColors.text }]}
                    numberOfLines={1}
                  >
                    {conv.recipientNickname}
                  </Text>
                  <Text
                    style={[
                      styles.convTime,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    {new Date(conv.lastTimestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.convSnippet,
                    { color: currentColors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {conv.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Offline QR Code Pairing & Scanner Modal */}
      <MeshPairingModal
        visible={showPairModal}
        onClose={() => setShowPairModal(false)}
        onConnect={(peer) => {
          addPeer(peer);
          navigation.navigate('MeshConversation', {
            recipientPubkey: peer.publicKeyHex,
            recipientNickname: peer.nickname,
          });
        }}
        identity={identity}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  radarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  radarTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  qrScanLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00ba7c',
  },
  radarList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  radarItem: {
    alignItems: 'center',
    width: 64,
  },
  radarAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  radarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00ba7c',
  },
  radarGreenDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ba7c',
    borderWidth: 2,
    borderColor: '#000000',
  },
  radarNick: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyRadarBox: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  emptyRadarText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  publicBroadcastCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00ba7c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  broadcastIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#00ba7c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  publicBroadcastTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  publicLiveBadge: {
    backgroundColor: 'rgba(0, 186, 124, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  publicLiveBadgeText: {
    color: '#00ba7c',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  publicBroadcastDesc: {
    fontSize: 11,
    marginTop: 3,
  },
  qrHomeBanner: {
    backgroundColor: '#00ba7c',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    shadowColor: '#00ba7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  qrIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  qrBannerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleGroup: {
    flex: 1,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginLeft: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: 'rgba(0, 186, 124, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00ba7c',
    textTransform: 'uppercase',
  },
  statusExplanation: {
    fontSize: 13,
    lineHeight: 18,
  },
  identityCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  identityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 186, 124, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityNickname: {
    fontSize: 16,
    fontWeight: '800',
  },
  identityMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  fingerprintBox: {
    borderRadius: 8,
    padding: 10,
  },
  fingerprintLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fingerprintValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#00ba7c',
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  actionBtnCount: {
    fontSize: 11,
    color: '#71767b',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  newChatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00ba7c',
    marginLeft: 4,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  findPeersBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  findPeersBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  convAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 186, 124, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  convName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  convTime: {
    fontSize: 11,
    marginLeft: 8,
  },
  convSnippet: {
    fontSize: 12,
  },
});

export default MeshHomeScreen;
