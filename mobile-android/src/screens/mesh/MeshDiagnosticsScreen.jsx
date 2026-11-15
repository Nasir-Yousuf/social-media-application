import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { useMesh } from '../../mesh/context/MeshContext';
import bleMeshBridge, {
  CFM1_SERVICE_UUID,
  CFM1_TX_RX_FRAME_CHAR,
  CFM1_PEER_IDENTITY_CHAR,
} from '../../mesh/transport/bleMeshBridge';

import {
  CFM1PacketType,
  CFM1_MAGIC,
  CFM1_VERSION,
  signFrame,
  hexToBytes,
  bytesToHex,
  encryptChaCha20Poly1305,
} from '@clearfeed/mesh-core';

export const MeshDiagnosticsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: currentColors } = useTheme();
  const { identity } = useMesh();

  const [diagnostics, setDiagnostics] = useState(bleMeshBridge.getDiagnostics());
  const [fgsActive, setFgsActive] = useState(bleMeshBridge.transportState.isForegroundServiceActive);
  const [lastActionResult, setLastActionResult] = useState('');
  const [isStressTesting, setIsStressTesting] = useState(false);

  useEffect(() => {
    const unsub = bleMeshBridge.onDiagnosticsUpdated((diag) => {
      setDiagnostics(diag);
      setFgsActive(diag.transportState.isForegroundServiceActive);
    });

    const interval = setInterval(() => {
      setDiagnostics(bleMeshBridge.getDiagnostics());
    }, 1500);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleToggleFgs = async () => {
    if (fgsActive) {
      await bleMeshBridge.stopForegroundService();
      setFgsActive(false);
      setLastActionResult('Foreground Service stopped');
    } else {
      const ok = await bleMeshBridge.startForegroundService(
        'Clearfeed Mesh Active',
        `Ready for offline messages (${diagnostics.activePeers.length} peers connected)`
      );
      setFgsActive(ok === true);
      setLastActionResult(ok ? 'Foreground Service started (connectedDevice)' : 'Failed to start Foreground Service');
    }
  };

  const handleSendTestPing = async () => {
    if (!identity?.secretKeyHex || !identity?.publicKeyHex) {
      Alert.alert('Identity Missing', 'Local cryptographic identity is not initialized.');
      return;
    }

    try {
      const secret = hexToBytes(identity.secretKeyHex);
      const pubkey = hexToBytes(identity.publicKeyHex);
      const packetId = new Uint8Array(16);
      for (let i = 0; i < 16; i++) packetId[i] = Math.floor(Math.random() * 256);
      const nonce = new Uint8Array(12).fill(0x05);

      const frame = {
        magic: CFM1_MAGIC,
        version: CFM1_VERSION,
        packetType: CFM1PacketType.BEACON_HELLO,
        ttl: 3,
        hopCount: 0,
        packetId,
        senderPubkey: pubkey,
        recipientPubkey: new Uint8Array(32), // Broadcast
        timestampMs: BigInt(Date.now()),
        nonce,
        payloadLen: 0,
        ciphertext: new Uint8Array(0),
        tag: new Uint8Array(16),
        signature: new Uint8Array(64),
      };
      frame.signature = signFrame(secret, frame);

      const res = await bleMeshBridge.sendCFM1Frame(frame);
      setLastActionResult(`Ping dispatched: ${res.status} (${res.fragmentsSent} chunk sent)`);
    } catch (err) {
      setLastActionResult(`Ping failed: ${err.message}`);
    }
  };

  const handleStressTest = async () => {
    if (!identity?.secretKeyHex || !identity?.publicKeyHex) return;
    setIsStressTesting(true);
    try {
      const secret = hexToBytes(identity.secretKeyHex);
      const pubkey = hexToBytes(identity.publicKeyHex);
      const packetId = new Uint8Array(16);
      for (let i = 0; i < 16; i++) packetId[i] = Math.floor(Math.random() * 256);
      const nonce = new Uint8Array(12).fill(0x09);
      const symKey = new Uint8Array(32).fill(0x42);

      // 1200-byte stress test payload
      const largePlaintext = new Uint8Array(1200);
      for (let i = 0; i < 1200; i++) largePlaintext[i] = (i * 31) & 0xff;

      const { ciphertext, tag } = encryptChaCha20Poly1305(symKey, largePlaintext, nonce);

      const frame = {
        magic: CFM1_MAGIC,
        version: CFM1_VERSION,
        packetType: CFM1PacketType.DIRECT_ENCRYPTED,
        ttl: 5,
        hopCount: 0,
        packetId,
        senderPubkey: pubkey,
        recipientPubkey: new Uint8Array(32),
        timestampMs: BigInt(Date.now()),
        nonce,
        payloadLen: ciphertext.length,
        ciphertext,
        tag,
        signature: new Uint8Array(64),
      };
      frame.signature = signFrame(secret, frame);

      const res = await bleMeshBridge.sendCFM1Frame(frame);
      setLastActionResult(`Stress test dispatched: ${res.status} (${res.fragmentsSent} fragments across MTU)`);
    } catch (err) {
      setLastActionResult(`Stress test failed: ${err.message}`);
    } finally {
      setIsStressTesting(false);
    }
  };

  const handleCopyDiagnostics = async () => {
    const text = JSON.stringify(diagnostics, null, 2);
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Telemetry snapshot copied to clipboard.');
  };

  const getRssiColor = (rssi) => {
    if (rssi >= -60) return '#10B981'; // Green (strong)
    if (rssi >= -75) return '#F59E0B'; // Amber (medium)
    return '#EF4444'; // Red (weak)
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: currentColors.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={currentColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>CFM1 Hardware Test Harness</Text>
          <Text style={[styles.headerSubtitle, { color: currentColors.subtext }]}>
            2-Device BLE GATT Physical Diagnostics
          </Text>
        </View>
        <TouchableOpacity onPress={handleCopyDiagnostics} style={styles.copyButton}>
          <Feather name="copy" size={20} color={currentColors.primary || '#14B8A6'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hardware Status Card */}
        <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bluetooth-connect" size={20} color="#14B8A6" />
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>BLE Transceiver & Service</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Protocol:</Text>
            <Text style={[styles.metaValue, { color: '#14B8A6' }]}>CFM1 (Version 0x01)</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Service UUID:</Text>
            <Text style={[styles.metaCode, { color: currentColors.text }]}>0000CFM1...5F9B34FB</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>TX/RX Char:</Text>
            <Text style={[styles.metaCode, { color: currentColors.text }]}>0000CFM2 (Notify/Write)</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Identity Char:</Text>
            <Text style={[styles.metaCode, { color: currentColors.text }]}>0000CFM3 (Read Beacon)</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Advertising:</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusDot, { backgroundColor: diagnostics.transportState.isAdvertising ? '#10B981' : '#6B7280' }]} />
              <Text style={{ color: currentColors.text, fontSize: 13 }}>
                {diagnostics.transportState.isAdvertising ? 'Active (BALANCED)' : 'Idle'}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Central Scanner:</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusDot, { backgroundColor: diagnostics.transportState.isScanning ? '#10B981' : '#6B7280' }]} />
              <Text style={{ color: currentColors.text, fontSize: 13 }}>
                {diagnostics.transportState.isScanning ? 'Duty-Cycled (Active)' : 'Duty-Cycled (Pause)'}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Foreground Service:</Text>
            <TouchableOpacity onPress={handleToggleFgs} style={[styles.fgsPill, { backgroundColor: fgsActive ? '#10B98120' : '#EF444420' }]}>
              <Text style={{ color: fgsActive ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: '700' }}>
                {fgsActive ? 'RUNNING (connectedDevice)' : 'STOPPED'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Counters Grid */}
        <View style={styles.counterGrid}>
          <View style={[styles.counterBox, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Text style={[styles.counterNumber, { color: '#14B8A6' }]}>{diagnostics.counters.chunksSent}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>Chunks Sent</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Text style={[styles.counterNumber, { color: '#6366F1' }]}>{diagnostics.counters.chunksReceived}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>Chunks Received</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Text style={[styles.counterNumber, { color: '#10B981' }]}>{diagnostics.counters.framesAssembled}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>Frames Reassembled</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Text style={[styles.counterNumber, { color: '#F59E0B' }]}>{diagnostics.counters.writeSuccesses}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>SENT_TO_NEIGHBOR</Text>
          </View>
        </View>

        {/* Connected Peers List */}
        <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={20} color="#6366F1" />
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>
              Connected GATT Peers ({diagnostics.activePeers.length})
            </Text>
          </View>

          {diagnostics.activePeers.length === 0 ? (
            <View style={styles.emptyPeers}>
              <MaterialCommunityIcons name="radar" size={36} color={currentColors.subtext} />
              <Text style={[styles.emptyPeersText, { color: currentColors.subtext }]}>
                Scanning for nearby Android / Windows CFM1 devices...
              </Text>
              <Text style={[styles.emptyPeersSubtext, { color: currentColors.subtext }]}>
                Turn Bluetooth ON and keep devices within 10 meters.
              </Text>
            </View>
          ) : (
            diagnostics.activePeers.map((peer, idx) => (
              <View key={peer.peerAddress || idx} style={[styles.peerRow, { borderBottomColor: currentColors.border }]}>
                <View style={styles.peerLeft}>
                  <Text style={[styles.peerNickname, { color: currentColors.text }]}>{peer.nickname}</Text>
                  <Text style={[styles.peerAddress, { color: currentColors.subtext }]}>
                    {peer.peerAddress} • PubKey: {peer.truncatedPubkey || 'N/A'}
                  </Text>
                </View>
                <View style={styles.peerRight}>
                  <View style={styles.rssiBadge}>
                    <Ionicons name="cellular" size={14} color={getRssiColor(peer.rssi)} />
                    <Text style={[styles.rssiText, { color: getRssiColor(peer.rssi) }]}>
                      {peer.rssi} dBm
                    </Text>
                  </View>
                  <Text style={[styles.mtuText, { color: currentColors.subtext }]}>
                    MTU: {peer.mtu}B
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action Controls */}
        <View style={styles.actionContainer}>
          <TouchableOpacity onPress={handleSendTestPing} style={[styles.actionBtn, { backgroundColor: '#14B8A6' }]}>
            <Ionicons name="paper-plane-outline" size={18} color="#090D16" />
            <Text style={styles.actionBtnText}>Send Test CFM1 Ping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStressTest}
            disabled={isStressTesting}
            style={[styles.actionBtn, { backgroundColor: '#6366F1', opacity: isStressTesting ? 0.6 : 1 }]}
          >
            <MaterialCommunityIcons name="buffer" size={18} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
              {isStressTesting ? 'Fragmenting...' : '1200B Reassembly Stress Test'}
            </Text>
          </TouchableOpacity>
        </View>

        {lastActionResult ? (
          <View style={[styles.resultBanner, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Ionicons name="information-circle-outline" size={18} color="#14B8A6" />
            <Text style={[styles.resultText, { color: currentColors.text }]}>{lastActionResult}</Text>
          </View>
        ) : null}
      </ScrollView>
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
  backButton: { padding: 4 },
  headerTitleContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSubtitle: { fontSize: 12 },
  copyButton: { padding: 6 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  metaLabel: { fontSize: 13 },
  metaValue: { fontSize: 13, fontWeight: '600' },
  metaCode: { fontSize: 12, fontFamily: 'monospace' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  fgsPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  counterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  counterBox: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  counterNumber: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  counterLabel: { fontSize: 12, fontWeight: '500' },
  emptyPeers: { alignItems: 'center', paddingVertical: 24 },
  emptyPeersText: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  emptyPeersSubtext: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  peerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  peerLeft: { flex: 1 },
  peerNickname: { fontSize: 14, fontWeight: '600' },
  peerAddress: { fontSize: 12, marginTop: 2, fontFamily: 'monospace' },
  peerRight: { alignItems: 'flex-end', gap: 4 },
  rssiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rssiText: { fontSize: 12, fontWeight: '700' },
  mtuText: { fontSize: 11 },
  actionContainer: { gap: 10, marginBottom: 16 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionBtnText: { color: '#090D16', fontSize: 14, fontWeight: '700' },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultText: { fontSize: 12, flex: 1 },
});

export default MeshDiagnosticsScreen;
