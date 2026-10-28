/**
 * ClearFeed BLE Mesh Transport Bridge
 * Compatible with BitChat BLE Protocol Specifications:
 * - Service UUID: F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C
 * - Characteristic UUID: A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D
 * - Fragment MTU: 469 bytes
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

export const BLE_SERVICE_UUID = 'F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C';
export const BLE_CHARACTERISTIC_UUID = 'A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D';
export const MAX_FRAGMENT_PAYLOAD = 469; // BitChat fragment ceiling

class BleMeshBridge {
  constructor() {
    this.isNativeAvailable = false;
    this.nativeModule = NativeModules.ClearFeedBleMesh || NativeModules.ExpoBleMesh;
    this.eventEmitter = null;
    this.fragmentBuffer = new Map(); // fragmentId -> { total, received, chunks: [], createdAt }
    this.seenPacketIds = new Set();
    this.listeners = new Set();
    this.peerListeners = new Set();
    this.activePeers = new Map(); // peerId -> { lastSeen, rssi, nickname }

    if (this.nativeModule) {
      this.isNativeAvailable = true;
      try {
        this.eventEmitter = new NativeEventEmitter(this.nativeModule);
        this.setupNativeListeners();
      } catch (err) {
        console.warn('[BleMeshBridge] Native event emitter setup warning:', err.message);
      }
    }
  }

  setupNativeListeners() {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('onMeshPacketReceived', (rawString) => {
      this.handleIncomingRaw(rawString);
    });

    this.eventEmitter.addListener('onPeerDiscovered', (peerData) => {
      if (peerData && peerData.peerId) {
        this.activePeers.set(peerData.peerId, {
          lastSeen: Date.now(),
          rssi: peerData.rssi || -70,
          nickname: peerData.nickname || `BLE_Node_${peerData.peerId.substring(0, 4)}`,
        });
        this.notifyPeers();
      }
    });

    this.eventEmitter.addListener('onPeerLost', (peerId) => {
      this.activePeers.delete(peerId);
      this.notifyPeers();
    });
  }

  /**
   * Start Bluetooth Low Energy Advertising & Scanning
   */
  async start(nodeIdHex = '') {
    if (this.isNativeAvailable && this.nativeModule.startMesh) {
      try {
        return await this.nativeModule.startMesh(nodeIdHex, BLE_SERVICE_UUID, BLE_CHARACTERISTIC_UUID);
      } catch (err) {
        console.warn('[BleMeshBridge] Native startMesh error:', err.message);
      }
    }
    return false;
  }

  /**
   * Stop Bluetooth Low Energy engine
   */
  async stop() {
    if (this.isNativeAvailable && this.nativeModule.stopMesh) {
      try {
        return await this.nativeModule.stopMesh();
      } catch (err) {}
    }
    return true;
  }

  /**
   * Listen for decoded, verified envelopes
   */
  onPacket(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  onPeersUpdated(cb) {
    this.peerListeners.add(cb);
    return () => this.peerListeners.delete(cb);
  }

  notifyPeers() {
    const list = Array.from(this.activePeers.values());
    for (const cb of this.peerListeners) {
      try {
        cb(list);
      } catch {}
    }
  }

  /**
   * Fragment and send packet over BLE GATT
   */
  async broadcastEnvelope(envelope) {
    try {
      const serialized = JSON.stringify(envelope);

      // If envelope fits in a single frame
      if (serialized.length <= MAX_FRAGMENT_PAYLOAD) {
        return this.sendRawChunk({
          type: 'single',
          data: serialized,
        });
      }

      // Large packet: fragment into ~469 byte chunks (BitChat compatible fragmentation)
      const fragmentId = Math.random().toString(36).substring(2, 10);
      const chunks = [];
      for (let i = 0; i < serialized.length; i += MAX_FRAGMENT_PAYLOAD) {
        chunks.push(serialized.substring(i, i + MAX_FRAGMENT_PAYLOAD));
      }

      const total = chunks.length;
      for (let index = 0; index < total; index++) {
        await this.sendRawChunk({
          type: 'frag',
          fid: fragmentId,
          idx: index,
          tot: total,
          chunk: chunks[index],
        });
      }

      return true;
    } catch (err) {
      console.warn('[BleMeshBridge] Broadcast envelope error:', err.message);
      return false;
    }
  }

  async sendRawChunk(chunkObj) {
    const rawPayload = JSON.stringify(chunkObj);
    if (this.isNativeAvailable && this.nativeModule.sendBlePacket) {
      try {
        return await this.nativeModule.sendBlePacket(rawPayload);
      } catch (err) {
        console.warn('[BleMeshBridge] Native sendBlePacket error:', err.message);
      }
    }
    return false;
  }

  handleIncomingRaw(rawString) {
    if (!rawString) return;
    try {
      const parsed = JSON.parse(rawString);

      // Case 1: Unfragmented single packet
      if (parsed.type === 'single' && parsed.data) {
        const envelope = JSON.parse(parsed.data);
        this.dispatchEnvelope(envelope);
        return;
      }

      // Case 2: Fragmented packet reassembly
      if (parsed.type === 'frag' && parsed.fid) {
        const { fid, idx, tot, chunk } = parsed;
        if (!this.fragmentBuffer.has(fid)) {
          this.fragmentBuffer.set(fid, {
            total: tot,
            received: 0,
            chunks: new Array(tot),
            createdAt: Date.now(),
          });
        }

        const entry = this.fragmentBuffer.get(fid);
        if (!entry.chunks[idx]) {
          entry.chunks[idx] = chunk;
          entry.received++;
        }

        if (entry.received === entry.total) {
          const fullString = entry.chunks.join('');
          this.fragmentBuffer.delete(fid);
          const envelope = JSON.parse(fullString);
          this.dispatchEnvelope(envelope);
        }
      }
    } catch (err) {
      console.warn('[BleMeshBridge] Raw packet parse error:', err.message);
    }

    // Prune stale fragments (>30s)
    const now = Date.now();
    for (const [fid, entry] of this.fragmentBuffer.entries()) {
      if (now - entry.createdAt > 30000) {
        this.fragmentBuffer.delete(fid);
      }
    }
  }

  dispatchEnvelope(envelope) {
    if (!envelope || !envelope.id) return;
    if (this.seenPacketIds.has(envelope.id)) return;
    this.seenPacketIds.add(envelope.id);

    // Limit seen cache size
    if (this.seenPacketIds.size > 2000) {
      const first = this.seenPacketIds.values().next().value;
      this.seenPacketIds.delete(first);
    }

    for (const listener of this.listeners) {
      try {
        listener(envelope);
      } catch (err) {
        console.warn('[BleMeshBridge] Listener error:', err.message);
      }
    }
  }
}

export const bleMeshBridge = new BleMeshBridge();
export default bleMeshBridge;
