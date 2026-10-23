import React from 'react';
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
  } = useMesh();

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

        <TouchableOpacity
          onPress={() => navigation.navigate('MeshSettings')}
          style={styles.iconBtn}
          accessibilityLabel="Mesh Settings"
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={currentColors.text}
          />
        </TouchableOpacity>
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

        {/* Local Cryptographic Identity Card */}
        {identity && (
          <View
            style={[
              styles.identityCard,
              {
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              },
            ]}
          >
            <View style={styles.identityTopRow}>
              <View style={styles.identityAvatar}>
                <Ionicons name="shield-checkmark" size={24} color="#00ba7c" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[
                    styles.identityNickname,
                    { color: currentColors.text },
                  ]}
                >
                  {identity.nickname}
                </Text>
                <Text
                  style={[
                    styles.identityMeta,
                    { color: currentColors.textSecondary },
                  ]}
                >
                  Independent Local Mesh Node
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.fingerprintBox,
                { backgroundColor: currentColors.bg },
              ]}
            >
              <Text
                style={[
                  styles.fingerprintLabel,
                  { color: currentColors.textSecondary },
                ]}
              >
                PUBLIC KEY FINGERPRINT
              </Text>
              <Text style={styles.fingerprintValue}>
                {identity.fingerprint}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              },
            ]}
            onPress={() => navigation.navigate('MeshPeers')}
          >
            <MaterialCommunityIcons
              name="account-multiple-outline"
              size={24}
              color="#00A6F4"
            />
            <Text
              style={[styles.actionBtnText, { color: currentColors.text }]}
            >
              Nearby Peers
            </Text>
            <Text style={styles.actionBtnCount}>{activePeerCount} visible</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              },
            ]}
            onPress={() => navigation.navigate('MeshSettings')}
          >
            <Ionicons
              name="git-network-outline"
              size={24}
              color="#ffd700"
            />
            <Text
              style={[styles.actionBtnText, { color: currentColors.text }]}
            >
              Relay Status
            </Text>
            <Text style={styles.actionBtnCount}>
              {settings.relayEnabled ? 'Forwarding ON' : 'Direct Only'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conversations Section */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[styles.sectionTitle, { color: currentColors.text }]}
          >
            Encrypted Conversations
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MeshPeers')}
            style={styles.newChatBtn}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#00ba7c" />
            <Text style={styles.newChatBtnText}>New Chat</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
