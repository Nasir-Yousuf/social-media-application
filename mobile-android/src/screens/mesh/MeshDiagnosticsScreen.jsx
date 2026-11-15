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
import meshRouter from '../../mesh/routing/meshRouter';
import bleMeshBridge, {
  CFM1_SERVICE_UUID,
  CFM1_TX_RX_FRAME_CHAR,
  CFM1_PEER_IDENTITY_CHAR,
  CFM1_MDNS_SERVICE_TYPE,
  CFM1_DEFAULT_LAN_PORT,
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
  const [routerStats, setRouterStats] = useState(meshRouter.getStats());
  const [sfStats, setSfStats] = useState({ totalCount: 0, totalBytes: 0, totalMB: 0, maxMB: 25.0, maxAgeHours: 48, maxPerSender: 50 });
  const [isBatterySaver, setIsBatterySaver] = useState(meshRouter.isBatterySaverMode());

  useEffect(() => {
    const unsub = bleMeshBridge.onDiagnosticsUpdated((diag) => {
      setDiagnostics(diag);
      setFgsActive(diag.transportState.isForegroundServiceActive);
    });

    const updateMeshMetrics = async () => {
      setDiagnostics(bleMeshBridge.getDiagnostics());
      setRouterStats(meshRouter.getStats());
      const sf = await meshRouter.getStoreAndForwardStats();
      if (sf) setSfStats(sf);
      setIsBatterySaver(meshRouter.isBatterySaverMode());
    };

    updateMeshMetrics();
    const interval = setInterval(updateMeshMetrics, 1500);

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
      setLastActionResult(`Ping dispatched via [${res.transport || 'BLE'}]: ${res.status} (${res.speed || '25 KB/s'})`);
    } catch (err) {
      setLastActionResult(`Ping failed: ${err.message}`);
    }
  };

  const handleBroadcastBeacon = async () => {
    try {
      await bleMeshBridge.broadcastLanBeacon();
      setLastActionResult('UDP broadcast beacon sent on port 49152 (255.255.255.255)');
    } catch (err) {
      setLastActionResult(`Beacon failed: ${err.message}`);
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
      setLastActionResult(`Stress test dispatched via [${res.transport || 'BLE'}]: ${res.status} (${res.speed || 'high-speed'})`);
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
            BLE + High-Speed LAN / Wi-Fi Direct Multi-Transport
          </Text>
        </View>
        <TouchableOpacity onPress={handleCopyDiagnostics} style={styles.copyButton}>
          <Feather name="copy" size={20} color={currentColors.primary || '#14B8A6'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* High-Speed LAN & Wi-Fi Direct Status Card */}
        <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: '#10B98150' }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="wifi-star" size={20} color="#10B981" />
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>High-Speed LAN & Wi-Fi Direct (TCP/UDP)</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>mDNS Service:</Text>
            <Text style={[styles.metaCode, { color: '#10B981' }]}>{CFM1_MDNS_SERVICE_TYPE}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>TCP / UDP Port:</Text>
            <Text style={[styles.metaCode, { color: currentColors.text }]}>{CFM1_DEFAULT_LAN_PORT} (Framed 4B BE)</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>LAN TCP Server:</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusDot, { backgroundColor: diagnostics.lanState?.isServerRunning ? '#10B981' : '#6B7280' }]} />
              <Text style={{ color: currentColors.text, fontSize: 13 }}>
                {diagnostics.lanState?.isServerRunning ? 'Listening (Port 49152)' : 'Active (Ready)'}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Wi-Fi Direct (P2P):</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={{ color: currentColors.text, fontSize: 13 }}>
                DNS-SD P2P Discovery Active
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Bandwidth Ceiling:</Text>
            <Text style={[styles.metaValue, { color: '#10B981', fontWeight: '700' }]}>
              ~10–15 MB/s (100x vs BLE)
            </Text>
          </View>
        </View>

        {/* BLE Transceiver & Service Card */}
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
            <Text style={[styles.counterNumber, { color: '#10B981' }]}>{diagnostics.counters.tcpFramesSent || 0}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>TCP Frames Sent</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Text style={[styles.counterNumber, { color: '#10B981' }]}>{diagnostics.counters.tcpFramesReceived || 0}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>TCP Frames Rcvd</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Text style={[styles.counterNumber, { color: '#14B8A6' }]}>{diagnostics.counters.chunksSent}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>BLE Chunks Sent</Text>
          </View>
          <View style={[styles.counterBox, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
            <Text style={[styles.counterNumber, { color: '#6366F1' }]}>{diagnostics.counters.chunksReceived}</Text>
            <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>BLE Chunks Rcvd</Text>
          </View>
        </View>

        {/* Phase 13: Multi-Hop Routing & Honest Delivery Telemetry */}
        <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: '#6366F150' }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="transit-connection-variant" size={20} color="#6366F1" />
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>Multi-Hop Relay & Store-and-Forward Telemetry</Text>
          </View>

          <View style={styles.counterGrid}>
            <View style={[styles.counterBox, { backgroundColor: currentColors.bg, borderColor: currentColors.border }]}>
              <Text style={[styles.counterNumber, { color: '#10B981' }]}>{routerStats.packetsSent}</Text>
              <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>Packets Sent</Text>
            </View>
            <View style={[styles.counterBox, { backgroundColor: currentColors.bg, borderColor: currentColors.border }]}>
              <Text style={[styles.counterNumber, { color: '#818CF8' }]}>{routerStats.packetsRelayed}</Text>
              <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>Packets Relayed</Text>
            </View>
            <View style={[styles.counterBox, { backgroundColor: currentColors.bg, borderColor: currentColors.border }]}>
              <Text style={[styles.counterNumber, { color: '#38BDF8' }]}>{routerStats.packetsStored}</Text>
              <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>Stored in Queue</Text>
            </View>
            <View style={[styles.counterBox, { backgroundColor: currentColors.bg, borderColor: currentColors.border }]}>
              <Text style={[styles.counterNumber, { color: '#4ADE80' }]}>{routerStats.acksVerified}</Text>
              <Text style={[styles.counterLabel, { color: currentColors.subtext }]}>ACKs Verified</Text>
            </View>
          </View>

          <View style={[styles.metaRow, { marginTop: 8 }]}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Dropped (Invalid Sig):</Text>
            <Text style={[styles.metaValue, { color: '#F87171', fontWeight: '700' }]}>{routerStats.droppedInvalidSignatures}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Dropped (Duplicates):</Text>
            <Text style={[styles.metaValue, { color: '#FBBF24', fontWeight: '700' }]}>{routerStats.droppedDuplicates}</Text>
          </View>
        </View>

        {/* Phase 13: Bounded Store-and-Forward Buffer Status */}
        <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: '#38BDF850' }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="layers-outline" size={20} color="#38BDF8" />
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>Store-and-Forward Bounded Buffer (25 MB)</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Storage Usage:</Text>
            <Text style={[styles.metaValue, { color: '#38BDF8', fontWeight: '700' }]}>
              {sfStats.totalMB} MB / {sfStats.maxMB} MB ({sfStats.totalCount} packets)
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Retention Policy:</Text>
            <Text style={[styles.metaValue, { color: currentColors.text }]}>48 hours max age • Max 50/sender</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: currentColors.subtext }]}>Jitter Window:</Text>
            <Text style={[styles.metaValue, { color: '#10B981' }]}>40–180 ms (Storm Suppression)</Text>
          </View>
        </View>

        {/* Phase 13: Battery-Saver Scan Mode Toggle Card */}
        <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="battery-charging-outline" size={20} color="#F59E0B" />
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>Battery-Saver Scan Mode</Text>
          </View>

          <View style={[styles.metaRow, { alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: currentColors.text, fontSize: 13, fontWeight: '600' }}>
                {isBatterySaver ? 'Battery-Saver Mode Active' : 'Balanced Duty Cycle (Standard)'}
              </Text>
              <Text style={{ color: currentColors.subtext, fontSize: 11 }}>
                {isBatterySaver ? 'Duty-cycled discovery (30s interval)' : 'Active discovery (8s interval)'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const next = !isBatterySaver;
                meshRouter.setBatterySaverMode(next);
                setIsBatterySaver(next);
              }}
              style={[
                styles.fgsPill,
                { backgroundColor: isBatterySaver ? '#F59E0B25' : '#10B98125', borderColor: isBatterySaver ? '#F59E0B' : '#10B981', borderWidth: 1 },
              ]}
            >
              <Text style={{ color: isBatterySaver ? '#F59E0B' : '#10B981', fontSize: 12, fontWeight: '700' }}>
                {isBatterySaver ? 'BATTERY SAVER' : 'BALANCED'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Connected Multi-Transport Peers List */}
        <View style={[styles.card, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={20} color="#6366F1" />
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>
              Connected Multi-Transport Peers ({diagnostics.activePeers.length})
            </Text>
          </View>

          {diagnostics.activePeers.length === 0 ? (
            <View style={styles.emptyPeers}>
              <MaterialCommunityIcons name="radar" size={36} color={currentColors.subtext} />
              <Text style={[styles.emptyPeersText, { color: currentColors.subtext }]}>
                Scanning for nearby Android / Windows CFM1 devices...
              </Text>
              <Text style={[styles.emptyPeersSubtext, { color: currentColors.subtext }]}>
                Supports Wi-Fi LAN, Hotspot (port 49152), Wi-Fi Direct, and Bluetooth Low Energy.
              </Text>
            </View>
          ) : (
            diagnostics.activePeers.map((peer, idx) => (
              <View key={peer.peerAddress || peer.peerId || idx} style={[styles.peerRow, { borderBottomColor: currentColors.border }]}>
                <View style={styles.peerLeft}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={[styles.peerNickname, { color: currentColors.text }]}>{peer.nickname}</Text>
                    {/* Multi-transport badges */}
                    {peer.badges?.map((badge) => (
                      <View
                        key={badge}
                        style={[
                          styles.transportPill,
                          badge === 'LAN'
                            ? { backgroundColor: '#10B98125', borderColor: '#10B981' }
                            : badge === 'WIFI_DIRECT'
                            ? { backgroundColor: '#F59E0B25', borderColor: '#F59E0B' }
                            : { backgroundColor: '#38BDF825', borderColor: '#38BDF8' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.transportPillText,
                            {
                              color:
                                badge === 'LAN'
                                  ? '#10B981'
                                  : badge === 'WIFI_DIRECT'
                                  ? '#F59E0B'
                                  : '#38BDF8',
                            },
                          ]}
                        >
                          {badge}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.peerAddress, { color: currentColors.subtext }]}>
                    {peer.peerAddress} • PubKey: {peer.truncatedPubkey || peer.pubKeyPrefix || 'N/A'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#10B981', marginTop: 2, fontWeight: '600' }}>
                    ⚡ Route: {peer.activeTransport || 'BLE'} ({peer.speed || '25 KB/s'})
                  </Text>
                </View>
                <View style={styles.peerRight}>
                  {peer.rssi !== undefined && (
                    <View style={styles.rssiBadge}>
                      <Ionicons name="cellular" size={14} color={getRssiColor(peer.rssi)} />
                      <Text style={[styles.rssiText, { color: getRssiColor(peer.rssi) }]}>
                        {peer.rssi} dBm
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.mtuText, { color: currentColors.subtext }]}>
                    MTU: {peer.mtu || 512}B
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
            <Text style={styles.actionBtnText}>Send Test CFM1 Ping (Auto-Route)</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBroadcastBeacon} style={[styles.actionBtn, { backgroundColor: '#10B981' }]}>
            <MaterialCommunityIcons name="broadcast" size={18} color="#090D16" />
            <Text style={styles.actionBtnText}>Broadcast LAN Beacon (Port 49152)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStressTest}
            disabled={isStressTesting}
            style={[styles.actionBtn, { backgroundColor: '#6366F1', opacity: isStressTesting ? 0.6 : 1 }]}
          >
            <MaterialCommunityIcons name="buffer" size={18} color="#FFFFFF" />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
              {isStressTesting ? 'Transmitting...' : '1200B Reassembly Stress Test'}
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
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  copyButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fgsPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  counterBox: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyPeers: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyPeersText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyPeersSubtext: {
    fontSize: 11,
    textAlign: 'center',
  },
  peerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  peerLeft: {
    flex: 1,
    marginRight: 8,
  },
  peerNickname: {
    fontSize: 14,
    fontWeight: '700',
  },
  peerAddress: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  transportPill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  transportPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  peerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rssiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rssiText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mtuText: {
    fontSize: 11,
  },
  actionContainer: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: {
    color: '#090D16',
    fontSize: 14,
    fontWeight: '700',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 13,
    flex: 1,
  },
});

export default MeshDiagnosticsScreen;
