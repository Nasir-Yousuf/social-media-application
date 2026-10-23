import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useMesh } from '../../mesh/context/MeshContext';
import { computeFingerprint, generateIdentityKeypair } from '../../mesh/crypto/meshCrypto';
import { MeshPairingModal } from '../../components/mesh/MeshPairingModal';

export const MeshPeersScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: currentColors } = useTheme();
  const {
    identity,
    peers,
    addDiscoveredPeer,
    addPeer,
    broadcastBeacon,
    verifyPeer,
    blockPeer,
  } = useMesh();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [newPub, setNewPub] = useState('');

  const handleManualPing = async () => {
    setIsPinging(true);
    await broadcastBeacon();
    setTimeout(() => setIsPinging(false), 1200);
  };

  const handlePairConnect = (peer) => {
    addPeer(peer);
    navigation.navigate('MeshConversation', {
      recipientPubkey: peer.publicKeyHex,
      recipientNickname: peer.nickname,
    });
  };

  const filteredPeers = peers.filter(
    (p) =>
      p.nickname?.toLowerCase().includes(search.toLowerCase()) ||
      p.fingerprint?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddManualPeer = () => {
    if (!newNick.trim()) {
      Alert.alert('Required', 'Please provide a peer nickname');
      return;
    }
    // If no pubkey provided, generate a simulated peer keypair for offline multi-peer testing
    let pubHex = newPub.trim();
    if (!pubHex) {
      const generated = generateIdentityKeypair();
      pubHex = generated.publicKeyHex;
    }

    addDiscoveredPeer({
      publicKeyHex: pubHex,
      nickname: newNick.trim(),
      fingerprint: computeFingerprint(pubHex),
      reachability: 'direct',
      hops: 0,
    });

    setNewNick('');
    setNewPub('');
    setModalVisible(false);
  };

  const handleVerify = (peer) => {
    Alert.alert(
      'Verify Peer Fingerprint',
      `Compare this fingerprint with your contact in person or via trusted channel:\n\n${peer.fingerprint}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Verified',
          onPress: () => verifyPeer(peer.publicKeyHex),
        },
      ]
    );
  };

  const handleBlock = (peer) => {
    Alert.alert(
      'Block Peer',
      `Block ${peer.nickname}? You will no longer receive or relay messages for this node.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => blockPeer(peer.publicKeyHex),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: currentColors.bg },
      ]}
    >
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
        >
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>
            Nearby Mesh Peers
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentColors.textSecondary },
            ]}
          >
            Discovered over Bluetooth & local wireless
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShowPairingModal(true)}
            style={styles.qrHeaderBtn}
            accessibilityLabel="Scan & Connect QR"
          >
            <Ionicons name="qr-code-outline" size={20} color="#00ba7c" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addBtn}
            accessibilityLabel="Add contact manually"
          >
            <Ionicons name="person-add-outline" size={20} color="#00ba7c" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: currentColors.surface,
              borderColor: currentColors.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={currentColors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: currentColors.text }]}
            placeholder="Search by nickname or fingerprint..."
            placeholderTextColor={currentColors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Peer List */}
      <FlatList
        data={filteredPeers}
        keyExtractor={(item) => item.publicKeyHex}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View
            style={[
              styles.radarCard,
              {
                backgroundColor: currentColors.surface,
                borderColor: 'rgba(0,186,124,0.3)',
              },
            ]}
          >
            <View style={styles.radarTopRow}>
              <View style={styles.radarPulseContainer}>
                <MaterialCommunityIcons name="radar" size={22} color="#00ba7c" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={[styles.radarTitle, { color: currentColors.text }]}
                >
                  Nearby Peer Radar Active
                </Text>
                <Text
                  style={[
                    styles.radarSubtitle,
                    { color: currentColors.textSecondary },
                  ]}
                >
                  Auto-beaconing local Wi-Fi & radio
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleManualPing}
                disabled={isPinging}
                style={[
                  styles.pingBtn,
                  {
                    backgroundColor: currentColors.bg,
                    borderColor: currentColors.border,
                  },
                ]}
              >
                <Ionicons
                  name="flash"
                  size={14}
                  color={isPinging ? '#ffd700' : '#00ba7c'}
                />
                <Text
                  style={[
                    styles.pingBtnText,
                    { color: currentColors.text },
                  ]}
                >
                  {isPinging ? 'Pinging...' : 'Ping'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowPairingModal(true)}
              style={styles.qrBannerBtn}
            >
              <Ionicons name="qr-code" size={16} color="#ffffff" />
              <Text style={styles.qrBannerBtnText}>
                Scan & Connect QR | কুইক পেয়ার
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
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
              name="radar"
              size={44}
              color={currentColors.textSecondary}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={[styles.emptyTitle, { color: currentColors.text }]}
            >
              Scanning for nearby nodes...
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: currentColors.textSecondary },
              ]}
            >
              Ensure Bluetooth is turned on. Compatible devices running Clearfeed Mesh nearby will appear automatically.
            </Text>
            <TouchableOpacity
              style={[styles.simBtn, { backgroundColor: '#00ba7c' }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.simBtnText}>Pair or Add Peer Key</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.peerCard,
              {
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              },
            ]}
          >
            <View style={styles.peerAvatar}>
              <Ionicons
                name={item.status === 'verified' ? 'shield-checkmark' : 'person'}
                size={22}
                color={item.status === 'verified' ? '#00ba7c' : '#00A6F4'}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.peerTopRow}>
                <Text
                  style={[styles.peerName, { color: currentColors.text }]}
                >
                  {item.nickname}
                </Text>
                <View
                  style={[
                    styles.reachabilityBadge,
                    {
                      backgroundColor:
                        item.reachability === 'direct'
                          ? 'rgba(0, 186, 124, 0.15)'
                          : 'rgba(29, 155, 240, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.reachabilityText,
                      {
                        color:
                          item.reachability === 'direct' ? '#00ba7c' : '#00A6F4',
                      },
                    ]}
                  >
                    {item.reachability === 'direct' ? 'Direct 1-Hop' : 'Multi-hop Relay'}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.peerFingerprint,
                  { color: currentColors.textSecondary },
                ]}
              >
                {item.fingerprint}
              </Text>

              <View style={styles.peerActionsRow}>
                <TouchableOpacity
                  style={[styles.chatBtn, { backgroundColor: '#00ba7c' }]}
                  onPress={() =>
                    navigation.navigate('MeshConversation', {
                      recipientPubkey: item.publicKeyHex,
                      recipientNickname: item.nickname,
                    })
                  }
                >
                  <Ionicons name="chatbubble" size={14} color="#ffffff" />
                  <Text style={styles.chatBtnText}>Chat</Text>
                </TouchableOpacity>

                {item.status !== 'verified' && (
                  <TouchableOpacity
                    style={[
                      styles.verifyBtn,
                      { borderColor: currentColors.border },
                    ]}
                    onPress={() => handleVerify(item)}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color="#00ba7c"
                    />
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.blockBtn,
                    { borderColor: currentColors.border },
                  ]}
                  onPress={() => handleBlock(item)}
                >
                  <Ionicons name="ban-outline" size={14} color="#f4212e" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Add Peer Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: currentColors.surface,
                borderColor: currentColors.border,
              },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: currentColors.text }]}
            >
              Pair or Add Peer
            </Text>
            <Text
              style={[
                styles.modalDesc,
                { color: currentColors.textSecondary },
              ]}
            >
              Enter a nickname and optional public key to add a trusted peer or test node.
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentColors.bg,
                  borderColor: currentColors.border,
                  color: currentColors.text,
                },
              ]}
              placeholder="Contact Nickname (e.g., Alex)"
              placeholderTextColor={currentColors.textSecondary}
              value={newNick}
              onChangeText={setNewNick}
            />

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentColors.bg,
                  borderColor: currentColors.border,
                  color: currentColors.text,
                },
              ]}
              placeholder="64-hex Public Key (leave empty to generate)"
              placeholderTextColor={currentColors.textSecondary}
              value={newPub}
              onChangeText={setNewPub}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { borderColor: currentColors.border },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={{ color: currentColors.text, fontWeight: '700' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: '#00ba7c' },
                ]}
                onPress={handleAddManualPeer}
              >
                <Text style={{ color: '#ffffff', fontWeight: '800' }}>
                  Save Contact
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Offline QR Code Pairing & Scanner Modal */}
      <MeshPairingModal
        visible={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        onConnect={handlePairConnect}
        identity={identity}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  qrHeaderBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,186,124,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,186,124,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  radarTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radarPulseContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,186,124,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  radarSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  pingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  pingBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  qrBannerBtn: {
    backgroundColor: '#00ba7c',
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#00ba7c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  qrBannerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13 },
  listContent: { padding: 16 },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  simBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20 },
  simBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  peerCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  peerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(29, 155, 240, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peerName: { fontSize: 15, fontWeight: '800', flex: 1 },
  reachabilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  reachabilityText: { fontSize: 10, fontWeight: '800' },
  peerFingerprint: {
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 4,
  },
  peerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  chatBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  verifyBtnText: { color: '#00ba7c', fontSize: 12, fontWeight: '700' },
  blockBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  modalDesc: { fontSize: 12, lineHeight: 16, marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    fontSize: 13,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});

export default MeshPeersScreen;
