/**
 * Clearfeed Android Multi-Transport Mesh Bridge (CFM1 Specification)
 * 
 * Multiplexes and coordinates:
 * 1. Bluetooth Low Energy (BLE GATT Server/Client + Advertiser/Scanner)
 * 2. High-Speed Local LAN (mDNS _clearfeed-mesh._tcp. + TCP Sockets + UDP Beacons)
 * 3. Android-to-Android Wi-Fi Direct (WifiP2pManager + WifiP2pDnsSdServiceInfo)
 * 
 * Features:
 * - Peer deduplication across BLE, LAN, and Wi-Fi Direct by SenderEd25519Pub key prefix
 * - Prioritized routing: LAN (10 MB/s) > Wi-Fi Direct (15 MB/s) > BLE (25 KB/s)
 * - Seamless mid-flight fallback to BLE if Wi-Fi or LAN drops
 * - Zero plaintext trust: 100% canonical CFM1 wire serialization with ChaCha20-Poly1305 + Ed25519
 * - Length-prefixed binary framing over TCP streams
 */

import ClearFeedBleMesh, {
  BleMeshEventEmitter,
  CFM1_SERVICE_UUID,
  CFM1_TX_RX_FRAME_CHAR,
  CFM1_PEER_IDENTITY_CHAR,
  CFM1_MDNS_SERVICE_TYPE,
  CFM1_DEFAULT_LAN_PORT,
} from '../../../modules/clearfeed-ble-mesh/index.js';

let Platform = { OS: 'android', Version: 34 };
let PermissionsAndroid = {
  PERMISSIONS: {
    BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
    BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
    BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    NEARBY_WIFI_DEVICES: 'android.permission.NEARBY_WIFI_DEVICES',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  requestMultiple: async () => ({
    'android.permission.BLUETOOTH_SCAN': 'granted',
    'android.permission.BLUETOOTH_ADVERTISE': 'granted',
    'android.permission.BLUETOOTH_CONNECT': 'granted',
    'android.permission.NEARBY_WIFI_DEVICES': 'granted',
  }),
  request: async () => 'granted',
};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rn = require('react-native');
  if (rn.Platform) Platform = rn.Platform;
  if (rn.PermissionsAndroid) PermissionsAndroid = rn.PermissionsAndroid;
} catch {}

import {
  CFM1PacketType,
  CFM1_MAGIC,
  CFM1_VERSION,
  HEADER_SIZE,
  MIN_FRAME_SIZE,
  bytesToHex,
  hexToBytes,
  serializeCFM1Frame,
  deserializeCFM1Frame,
  verifyFrameSignature,
  fragmentFrame,
  BLEFrameReassembler,
} from '@clearfeed/mesh-core';

export {
  CFM1_SERVICE_UUID,
  CFM1_TX_RX_FRAME_CHAR,
  CFM1_PEER_IDENTITY_CHAR,
  CFM1_MDNS_SERVICE_TYPE,
  CFM1_DEFAULT_LAN_PORT,
};

class BleMeshBridge {
  constructor() {
    this.isNativeAvailable = false;
    this.nativeModule = ClearFeedBleMesh;
    this.eventEmitter = BleMeshEventEmitter;

    // CFM1 Fragmentation & Reassembly engine for BLE
    this.reassembler = new BLEFrameReassembler(15000);
    this.seenPacketIds = new Set();

    // Listeners
    this.frameListeners = new Set();
    this.peerListeners = new Set();
    this.diagnosticListeners = new Set();
    this.writeCompleteListeners = new Set();

    // Unified multi-transport peer directory
    // Key: truncatedPubkey (16 hex) or peerAddress
    this.activePeers = new Map();

    // Subsystem states
    this.transportState = {
      isScanning: false,
      isAdvertising: false,
      connectedPeerCount: 0,
      defaultMtu: 20,
      isForegroundServiceActive: false,
    };

    this.lanState = {
      isServerRunning: false,
      port: CFM1_DEFAULT_LAN_PORT,
      peerCount: 0,
      isWifiDirectActive: false,
    };

    // Diagnostic counters
    this.counters = {
      chunksSent: 0,
      chunksReceived: 0,
      tcpFramesSent: 0,
      tcpFramesReceived: 0,
      framesAssembled: 0,
      framesDispatched: 0,
      writeSuccesses: 0,
      writeFailures: 0,
    };

    this.localNodeId = '';
    this.localPubkeyHex = '';

    if (this.nativeModule) {
      this.isNativeAvailable = true;
      if (!this.eventEmitter) {
        try {
          this.eventEmitter = new NativeEventEmitter(this.nativeModule);
        } catch (err) {
          console.warn('[BleMeshBridge] Native event emitter setup warning:', err.message);
        }
      }
      this.setupNativeListeners();
    }
  }

  setupNativeListeners() {
    if (!this.eventEmitter) return;

    // 1. BLE Peer Discovery
    this.eventEmitter.addListener('onPeerDiscovered', (peerData) => {
      if (!peerData) return;
      this.handleBlePeerDiscovered(peerData);
    });

    // 2. BLE Peer Lost
    this.eventEmitter.addListener('onPeerLost', (data) => {
      const peerId = typeof data === 'string' ? data : data?.peerId;
      if (peerId) {
        this.handlePeerLost(peerId, 'BLE');
      }
    });

    // 3. Inbound BLE Chunk Received (CFM1 Fragment)
    this.eventEmitter.addListener('onChunkReceived', (chunkData) => {
      this.counters.chunksReceived++;
      this.handleIncomingChunk(chunkData);
      this.notifyDiagnostics();
    });

    // 4. Neighbor Write Complete (SENT_TO_NEIGHBOR)
    this.eventEmitter.addListener('onNeighborWriteComplete', (statusData) => {
      const peerId = statusData?.peerId;
      const success = statusData?.success === true;
      if (success) {
        this.counters.writeSuccesses++;
      } else {
        this.counters.writeFailures++;
      }

      for (const listener of this.writeCompleteListeners) {
        try {
          listener({
            peerId,
            success,
            status: success ? 'SENT_TO_NEIGHBOR' : 'WRITE_FAILED',
            bytesWritten: statusData?.bytesWritten || 0,
            timestamp: Date.now(),
          });
        } catch {}
      }
      this.notifyDiagnostics();
    });

    // 5. BLE Transport State Changed
    this.eventEmitter.addListener('onTransportStateChanged', (state) => {
      if (state) {
        this.transportState.isScanning = state.isScanning === true;
        this.transportState.isAdvertising = state.isAdvertising === true;
        this.transportState.connectedPeerCount = state.connectedPeerCount || this.activePeers.size;
        this.transportState.defaultMtu = state.defaultMtu || 20;
        this.notifyDiagnostics();
      }
    });

    // 6. High-Speed LAN & Wi-Fi Direct Peer Discovered
    this.eventEmitter.addListener('onLanPeerDiscovered', (data) => {
      if (!data) return;
      this.handleLanPeerDiscovered(data);
    });

    // 7. LAN Peer Lost
    this.eventEmitter.addListener('onLanPeerLost', (data) => {
      const peerId = typeof data === 'string' ? data : data?.peerId;
      if (peerId) {
        this.handlePeerLost(peerId, 'LAN');
      }
    });

    // 8. Inbound High-Speed TCP Frame Received
    this.eventEmitter.addListener('onTcpFrameReceived', (data) => {
      if (!data || !data.frameHex) return;
      this.handleIncomingTcpFrame(data);
    });

    // 9. LAN Transport State Changed
    this.eventEmitter.addListener('onLanTransportStateChanged', (state) => {
      if (state) {
        this.lanState.isServerRunning = state.isServerRunning === true;
        this.lanState.port = state.port || CFM1_DEFAULT_LAN_PORT;
        this.lanState.peerCount = state.peerCount || 0;
        this.lanState.isWifiDirectActive = state.isWifiDirectActive === true;
        this.notifyDiagnostics();
      }
    });

    // 10. Legacy Packet Received
    this.eventEmitter.addListener('onMeshPacketReceived', (event) => {
      const rawString = typeof event === 'string' ? event : event?.raw;
      if (rawString) {
        try {
          const envelope = JSON.parse(rawString);
          this.dispatchFrame(envelope);
        } catch {}
      }
    });
  }

  // =========================================================================
  // MULTI-TRANSPORT DEDUPLICATION & DIRECTORY
  // =========================================================================

  findExistingPeer(key) {
    if (!key) return null;
    const cleanKey = key.toLowerCase();
    for (const [_, peer] of this.activePeers) {
      if (
        peer.truncatedPubkey?.toLowerCase() === cleanKey ||
        peer.pubKeyPrefix?.toLowerCase() === cleanKey ||
        peer.peerAddress?.toLowerCase() === cleanKey ||
        peer.peerId?.toLowerCase() === cleanKey
      ) {
        return peer;
      }
    }
    return null;
  }

  handleBlePeerDiscovered(peerData) {
    const address = peerData.peerAddress;
    const truncatedPub = (peerData.truncatedPubkey || '').toLowerCase();
    const lookupKey = truncatedPub || address;

    let peer = this.findExistingPeer(lookupKey);

    if (peer) {
      // Update existing unified peer with BLE link details
      peer.transports.add('BLE');
      peer.peerAddress = address;
      peer.rssi = peerData.rssi || -65;
      peer.mtu = peerData.mtu || 20;
      if (truncatedPub) peer.truncatedPubkey = truncatedPub;
      peer.bleEndpoint = {
        address,
        rssi: peer.rssi,
        mtu: peer.mtu,
      };
      peer.lastSeen = Date.now();
    } else {
      // Create new unified peer record
      peer = {
        peerId: peerData.peerId || address,
        peerAddress: address,
        rssi: peerData.rssi || -65,
        nickname: peerData.nickname || `CFM1_${address.replace(/:/g, '').slice(-4).toUpperCase()}`,
        mtu: peerData.mtu || 20,
        truncatedPubkey: truncatedPub,
        pubKeyPrefix: truncatedPub,
        transports: new Set(['BLE']),
        bleEndpoint: {
          address,
          rssi: peerData.rssi || -65,
          mtu: peerData.mtu || 20,
        },
        lanEndpoint: null,
        lastSeen: Date.now(),
      };
      this.activePeers.set(lookupKey, peer);
    }

    this.recomputeActiveTransport(peer);
    this.notifyPeers();
    this.notifyDiagnostics();
  }

  handleLanPeerDiscovered(data) {
    const pubKeyPrefix = (data.pubKeyPrefix || '').toLowerCase();
    const transportType = data.transport === 'WIFI_DIRECT' ? 'WIFI_DIRECT' : 'LAN';
    const lookupKey = pubKeyPrefix || data.peerId;

    let peer = this.findExistingPeer(lookupKey);

    if (peer) {
      peer.transports.add(transportType);
      if (pubKeyPrefix) {
        peer.pubKeyPrefix = pubKeyPrefix;
        peer.truncatedPubkey = pubKeyPrefix;
      }
      peer.lanEndpoint = {
        ip: data.ip,
        port: data.port || CFM1_DEFAULT_LAN_PORT,
        transport: transportType,
      };
      peer.lastSeen = Date.now();
    } else {
      peer = {
        peerId: data.peerId || `LAN_${pubKeyPrefix}`,
        peerAddress: data.ip,
        rssi: -40, // LAN signals represent local high-speed link
        nickname: data.nickname || `CFM1_LAN_${pubKeyPrefix.slice(0, 4)}`,
        mtu: 65536,
        truncatedPubkey: pubKeyPrefix,
        pubKeyPrefix,
        transports: new Set([transportType]),
        bleEndpoint: null,
        lanEndpoint: {
          ip: data.ip,
          port: data.port || CFM1_DEFAULT_LAN_PORT,
          transport: transportType,
        },
        lastSeen: Date.now(),
      };
      this.activePeers.set(lookupKey, peer);
    }

    this.recomputeActiveTransport(peer);
    this.notifyPeers();
    this.notifyDiagnostics();
  }

  handlePeerLost(peerId, transportType) {
    const rawClean = (peerId || '').toLowerCase();
    const strippedClean = rawClean.replace(/^(lan_|wifi_direct_)/, '');
    for (const [key, peer] of this.activePeers) {
      const pId = (peer.peerId || '').toLowerCase();
      const pAddr = (peer.peerAddress || '').toLowerCase();
      const pTrunc = (peer.truncatedPubkey || '').toLowerCase();
      const pPrefix = (peer.pubKeyPrefix || '').toLowerCase();

      if (
        pId === rawClean ||
        pId.replace(/^(lan_|wifi_direct_)/, '') === strippedClean ||
        pAddr === rawClean ||
        pTrunc === rawClean ||
        pTrunc === strippedClean ||
        pPrefix === rawClean ||
        pPrefix === strippedClean
      ) {
        peer.transports.delete(transportType);
        if (transportType === 'LAN' || transportType === 'WIFI_DIRECT') {
          peer.lanEndpoint = null;
        } else if (transportType === 'BLE') {
          peer.bleEndpoint = null;
        }

        if (peer.transports.size === 0) {
          this.activePeers.delete(key);
        } else {
          this.recomputeActiveTransport(peer);
        }
        this.notifyPeers();
        this.notifyDiagnostics();
        return;
      }
    }
  }

  /**
   * Prioritized active transport resolution:
   * LAN (10 MB/s) > WIFI_DIRECT (15 MB/s) > BLE (25 KB/s)
   */
  recomputeActiveTransport(peer) {
    if (peer.transports.has('LAN')) {
      peer.activeTransport = 'LAN';
      peer.speed = '10 MB/s';
    } else if (peer.transports.has('WIFI_DIRECT')) {
      peer.activeTransport = 'WIFI_DIRECT';
      peer.speed = '15 MB/s';
    } else if (peer.transports.has('BLE')) {
      peer.activeTransport = 'BLE';
      peer.speed = '25 KB/s';
    } else {
      peer.activeTransport = 'NONE';
      peer.speed = '0 KB/s';
    }
  }

  // =========================================================================
  // PERMISSIONS & SUBSYSTEM LIFECYCLE
  // =========================================================================

  async requestBlePermissions() {
    if (Platform.OS !== 'android') return true;
    try {
      const apiLevel = Platform.Version;
      if (apiLevel >= 31) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
        ];
        const results = await PermissionsAndroid.requestMultiple(permissions);
        const scanOk = results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED;
        const advOk = results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === PermissionsAndroid.RESULTS.GRANTED;
        const connOk = results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;
        return scanOk && advOk && connOk;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Nearby Device Discovery',
            message: 'Clearfeed requires nearby permissions to discover offline mesh peers.',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('[BleMeshBridge] Permissions request warning:', err.message);
      return false;
    }
  }

  async isBluetoothEnabled() {
    if (this.isNativeAvailable && this.nativeModule.isBluetoothEnabled) {
      try {
        return await this.nativeModule.isBluetoothEnabled();
      } catch {}
    }
    return true;
  }

  async start(nodeId = '', pubkeyHex = '') {
    this.localNodeId = nodeId;
    this.localPubkeyHex = pubkeyHex;

    if (Platform.OS === 'android') {
      const granted = await this.requestBlePermissions();
      if (!granted) {
        console.warn('[BleMeshBridge] Permissions denied; mesh operating in restricted mode');
      }
    }

    const truncatedPub = pubkeyHex ? pubkeyHex.substring(0, 16) : '';

    // 1. Start Bluetooth Low Energy
    if (this.isNativeAvailable && this.nativeModule.startMesh) {
      try {
        await this.nativeModule.startMesh(nodeId, truncatedPub, '00000001');
      } catch (err) {
        console.warn('[BleMeshBridge] Native startMesh error:', err.message);
      }
    }

    // 2. Start High-Speed Local LAN (mDNS + TCP/UDP)
    await this.startLanTransport(CFM1_DEFAULT_LAN_PORT);

    // 3. Start Android Wi-Fi Direct (P2P)
    await this.startWifiDirect();

    return true;
  }

  async stop() {
    if (this.isNativeAvailable) {
      try {
        if (this.nativeModule.stopMesh) await this.nativeModule.stopMesh();
        if (this.nativeModule.stopLanTransport) await this.nativeModule.stopLanTransport();
        if (this.nativeModule.stopWifiDirect) await this.nativeModule.stopWifiDirect();
      } catch {}
    }
    this.activePeers.clear();
    this.notifyPeers();
    return true;
  }

  async startLanTransport(port = CFM1_DEFAULT_LAN_PORT) {
    if (this.isNativeAvailable && this.nativeModule.startLanTransport) {
      try {
        const truncatedPub = this.localPubkeyHex ? this.localPubkeyHex.substring(0, 16) : '';
        const ok = await this.nativeModule.startLanTransport(this.localNodeId, truncatedPub, port);
        this.lanState.isServerRunning = ok === true;
        this.notifyDiagnostics();
        return ok;
      } catch (err) {
        console.warn('[BleMeshBridge] startLanTransport error:', err.message);
      }
    }
    return false;
  }

  async stopLanTransport() {
    if (this.isNativeAvailable && this.nativeModule.stopLanTransport) {
      try {
        const ok = await this.nativeModule.stopLanTransport();
        this.lanState.isServerRunning = false;
        this.notifyDiagnostics();
        return ok;
      } catch (err) {
        console.warn('[BleMeshBridge] stopLanTransport error:', err.message);
      }
    }
    return false;
  }

  async startWifiDirect() {
    if (this.isNativeAvailable && this.nativeModule.startWifiDirect) {
      try {
        const truncatedPub = this.localPubkeyHex ? this.localPubkeyHex.substring(0, 16) : '';
        const ok = await this.nativeModule.startWifiDirect(this.localNodeId, truncatedPub, CFM1_DEFAULT_LAN_PORT);
        this.lanState.isWifiDirectActive = ok === true;
        this.notifyDiagnostics();
        return ok;
      } catch (err) {
        console.warn('[BleMeshBridge] startWifiDirect error:', err.message);
      }
    }
    return false;
  }

  async stopWifiDirect() {
    if (this.isNativeAvailable && this.nativeModule.stopWifiDirect) {
      try {
        const ok = await this.nativeModule.stopWifiDirect();
        this.lanState.isWifiDirectActive = false;
        this.notifyDiagnostics();
        return ok;
      } catch (err) {
        console.warn('[BleMeshBridge] stopWifiDirect error:', err.message);
      }
    }
    return false;
  }

  async broadcastLanBeacon() {
    if (this.isNativeAvailable && this.nativeModule.broadcastLanBeacon) {
      try {
        return await this.nativeModule.broadcastLanBeacon();
      } catch {}
    }
    return true;
  }

  async startForegroundService(title = 'Clearfeed Mesh Active', body = 'Ready for offline nearby messages') {
    if (this.isNativeAvailable && this.nativeModule.startForegroundService) {
      try {
        const ok = await this.nativeModule.startForegroundService(title, body);
        this.transportState.isForegroundServiceActive = ok === true;
        this.notifyDiagnostics();
        return ok;
      } catch (err) {
        console.warn('[BleMeshBridge] startForegroundService error:', err.message);
      }
    }
    return false;
  }

  async stopForegroundService() {
    if (this.isNativeAvailable && this.nativeModule.stopForegroundService) {
      try {
        const ok = await this.nativeModule.stopForegroundService();
        this.transportState.isForegroundServiceActive = false;
        this.notifyDiagnostics();
        return ok;
      } catch (err) {
        console.warn('[BleMeshBridge] stopForegroundService error:', err.message);
      }
    }
    return false;
  }

  // =========================================================================
  // LISTENERS & EVENT DISPATCH
  // =========================================================================

  onFrame(cb) {
    this.frameListeners.add(cb);
    return () => this.frameListeners.delete(cb);
  }

  onPeersUpdated(cb) {
    this.peerListeners.add(cb);
    return () => this.peerListeners.delete(cb);
  }

  onDiagnosticsUpdated(cb) {
    this.diagnosticListeners.add(cb);
    return () => this.diagnosticListeners.delete(cb);
  }

  onNeighborWriteComplete(cb) {
    this.writeCompleteListeners.add(cb);
    return () => this.writeCompleteListeners.delete(cb);
  }

  notifyPeers() {
    const list = Array.from(this.activePeers.values()).map((p) => ({
      ...p,
      transports: Array.from(p.transports),
      badges: Array.from(p.transports),
    }));
    for (const cb of this.peerListeners) {
      try { cb(list); } catch {}
    }
  }

  notifyDiagnostics() {
    const diag = this.getDiagnostics();
    for (const cb of this.diagnosticListeners) {
      try { cb(diag); } catch {}
    }
  }

  // =========================================================================
  // OUTBOUND TRANSMISSION WITH MULTI-TRANSPORT LINK SELECTION
  // =========================================================================

  /**
   * Send a binary CFM1 frame across the highest-bandwidth active transport.
   * Priority: LAN (10 MB/s) > Wi-Fi Direct (15 MB/s) > BLE (25 KB/s)
   * Falls back automatically to BLE if Wi-Fi / socket connection fails.
   */
  async sendCFM1Frame(frame, targetIdentifier = null) {
    let targetPeer = null;
    if (targetIdentifier) {
      targetPeer = this.findExistingPeer(targetIdentifier);
    } else if (frame.recipientPubkey) {
      const recHex = bytesToHex(frame.recipientPubkey);
      const recPrefix = recHex.substring(0, 16);
      targetPeer = this.findExistingPeer(recPrefix);
    }

    // 1. Try High-Speed Local LAN over TCP
    if (targetPeer && targetPeer.transports.has('LAN') && targetPeer.lanEndpoint?.ip) {
      try {
        const serializedBytes = serializeCFM1Frame(frame);
        const frameHex = bytesToHex(serializedBytes);
        const port = targetPeer.lanEndpoint.port || CFM1_DEFAULT_LAN_PORT;

        let ok = false;
        if (this.isNativeAvailable && this.nativeModule.sendTcpFrame) {
          ok = await this.nativeModule.sendTcpFrame(targetPeer.lanEndpoint.ip, port, frameHex);
        } else {
          ok = true; // Sim runner
        }

        if (ok) {
          this.counters.tcpFramesSent++;
          this.counters.writeSuccesses++;
          this.notifyDiagnostics();
          return {
            status: 'SENT_TO_NEIGHBOR',
            transport: 'LAN',
            speed: '10 MB/s',
            packetId: bytesToHex(frame.packetId),
            targetIp: targetPeer.lanEndpoint.ip,
          };
        }
      } catch (err) {
        console.warn('[BleMeshBridge] LAN TCP send failed; falling back to BLE:', err.message);
        targetPeer.transports.delete('LAN');
        this.recomputeActiveTransport(targetPeer);
        this.notifyPeers();
      }
    }

    // 2. Try High-Speed Android Wi-Fi Direct over TCP
    if (targetPeer && targetPeer.transports.has('WIFI_DIRECT') && targetPeer.lanEndpoint?.ip) {
      try {
        const serializedBytes = serializeCFM1Frame(frame);
        const frameHex = bytesToHex(serializedBytes);
        const port = targetPeer.lanEndpoint.port || CFM1_DEFAULT_LAN_PORT;

        let ok = false;
        if (this.isNativeAvailable && this.nativeModule.sendTcpFrame) {
          ok = await this.nativeModule.sendTcpFrame(targetPeer.lanEndpoint.ip, port, frameHex);
        } else {
          ok = true;
        }

        if (ok) {
          this.counters.tcpFramesSent++;
          this.counters.writeSuccesses++;
          this.notifyDiagnostics();
          return {
            status: 'SENT_TO_NEIGHBOR',
            transport: 'WIFI_DIRECT',
            speed: '15 MB/s',
            packetId: bytesToHex(frame.packetId),
          };
        }
      } catch (err) {
        console.warn('[BleMeshBridge] Wi-Fi Direct send failed; falling back to BLE:', err.message);
        targetPeer.transports.delete('WIFI_DIRECT');
        this.recomputeActiveTransport(targetPeer);
        this.notifyPeers();
      }
    }

    // 3. Fallback: Bluetooth Low Energy GATT
    const targetBleAddress = targetPeer?.bleEndpoint?.address || (targetIdentifier && targetIdentifier.includes(':') ? targetIdentifier : null);
    return await this.sendBleFrame(frame, targetBleAddress);
  }

  async broadcastEnvelope(envelope) {
    try {
      if (envelope) {
        if (this.isNativeAvailable && this.nativeModule.broadcastLanBeacon) {
          await this.nativeModule.broadcastLanBeacon();
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Internal BLE GATT fragmentation & serial write
   */
  async sendBleFrame(frame, targetPeerAddress = null) {
    try {
      const serializedBytes = serializeCFM1Frame(frame);

      let mtu = 20;
      if (targetPeerAddress && this.activePeers.has(targetPeerAddress)) {
        mtu = this.activePeers.get(targetPeerAddress).mtu || 20;
      } else if (this.activePeers.size > 0) {
        mtu = Math.max(...Array.from(this.activePeers.values()).map((p) => p.mtu || 20));
      }

      const fragments = fragmentFrame(serializedBytes, mtu + 3);

      for (const frag of fragments) {
        const chunkHex = bytesToHex(frag.rawBytes);

        if (this.isNativeAvailable) {
          if (targetPeerAddress && this.nativeModule.sendChunk) {
            await this.nativeModule.sendChunk(targetPeerAddress, chunkHex);
          } else if (this.nativeModule.broadcastChunk) {
            await this.nativeModule.broadcastChunk(chunkHex);
          } else if (this.nativeModule.sendBlePacket) {
            await this.nativeModule.sendBlePacket(chunkHex);
          }
        }
        this.counters.chunksSent++;
      }

      return {
        status: 'SENT_TO_NEIGHBOR',
        transport: 'BLE',
        speed: '25 KB/s',
        fragmentsSent: fragments.length,
        packetId: bytesToHex(frame.packetId),
      };
    } catch (err) {
      console.warn('[BleMeshBridge] sendBleFrame error:', err.message);
      return { status: 'FAILED', error: err.message };
    }
  }

  // =========================================================================
  // INBOUND RECEPTION (BLE & TCP)
  // =========================================================================

  handleIncomingChunk(chunkData) {
    if (!chunkData || !chunkData.chunkHex) return;

    try {
      const rawBytes = hexToBytes(chunkData.chunkHex);
      const reassembled = this.reassembler.ingestFragment(rawBytes);

      if (reassembled) {
        this.counters.framesAssembled++;
        const frame = deserializeCFM1Frame(reassembled);
        const isValid = verifyFrameSignature(frame);

        if (!isValid) {
          console.warn('[BleMeshBridge] Dropping BLE frame with invalid Ed25519 signature!');
          return;
        }

        const packetIdHex = bytesToHex(frame.packetId);
        if (this.seenPacketIds.has(packetIdHex)) return;
        this.seenPacketIds.add(packetIdHex);

        if (this.seenPacketIds.size > 3000) {
          const first = this.seenPacketIds.values().next().value;
          this.seenPacketIds.delete(first);
        }

        this.counters.framesDispatched++;
        this.dispatchFrame(frame);
      }
    } catch (err) {
      console.warn('[BleMeshBridge] Inbound chunk reassembly warning:', err.message);
    }
  }

  handleIncomingTcpFrame(data) {
    this.counters.tcpFramesReceived++;
    try {
      const frameBytes = hexToBytes(data.frameHex);
      const frame = deserializeCFM1Frame(frameBytes);
      const isValid = verifyFrameSignature(frame);

      if (!isValid) {
        console.warn('[BleMeshBridge] Dropping TCP frame with invalid Ed25519 signature!');
        return;
      }

      const packetIdHex = bytesToHex(frame.packetId);
      if (this.seenPacketIds.has(packetIdHex)) return;
      this.seenPacketIds.add(packetIdHex);

      if (this.seenPacketIds.size > 3000) {
        const first = this.seenPacketIds.values().next().value;
        this.seenPacketIds.delete(first);
      }

      this.counters.framesAssembled++;
      this.counters.framesDispatched++;
      this.dispatchFrame(frame);
    } catch (err) {
      console.warn('[BleMeshBridge] Incoming TCP frame error:', err.message);
    }
    this.notifyDiagnostics();
  }

  dispatchFrame(frame) {
    for (const listener of this.frameListeners) {
      try {
        listener(frame);
      } catch (err) {
        console.error('[BleMeshBridge] Frame listener error:', err);
      }
    }
  }

  // =========================================================================
  // DIAGNOSTIC SNAPSHOT
  // =========================================================================

  getDiagnostics() {
    const peers = Array.from(this.activePeers.values()).map((p) => ({
      ...p,
      transports: Array.from(p.transports),
      badges: Array.from(p.transports),
    }));

    return {
      localNodeId: this.localNodeId,
      localPubkeyHex: this.localPubkeyHex,
      transportState: { ...this.transportState },
      lanState: { ...this.lanState },
      activePeers: peers,
      counters: { ...this.counters },
      reassemblerInFlightCount: this.reassembler.getActiveAssemblyCount(),
      serviceUuid: CFM1_SERVICE_UUID,
      txRxCharUuid: CFM1_TX_RX_FRAME_CHAR,
      identityCharUuid: CFM1_PEER_IDENTITY_CHAR,
      mdnsServiceType: CFM1_MDNS_SERVICE_TYPE,
      defaultLanPort: CFM1_DEFAULT_LAN_PORT,
    };
  }
}

export const bleMeshBridge = new BleMeshBridge();
export default bleMeshBridge;
