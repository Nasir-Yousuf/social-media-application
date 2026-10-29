/**
 * ClearFeed BLE Mesh Transport Bridge
 * Compatible with BitChat BLE Protocol Specifications:
 * - Service UUID: F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C
 * - Characteristic UUID: A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D
 * - Fragment MTU: 469 bytes
 */

import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';
import ClearFeedBleMesh, { BleMeshEventEmitter } from '../../../modules/clearfeed-ble-mesh';

export const BLE_SERVICE_UUID = 'F47B5E2D-4A9E-4C5A-9B3F-8E1D2C3A4B5C';
export const BLE_CHARACTERISTIC_UUID = 'A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D';
export const MAX_FRAGMENT_PAYLOAD = 469; // BitChat fragment ceiling

class BleMeshBridge {
  constructor() {
    this.isNativeAvailable = false;
    this.nativeModule = ClearFeedBleMesh || NativeModules.ClearFeedBleMesh || NativeModules.ExpoBleMesh;
    this.eventEmitter = BleMeshEventEmitter;
    this.fragmentBuffer = new Map(); // fragmentId -> { total, received, chunks: [], createdAt }
    this.seenPacketIds = new Set();
    this.listeners = new Set();
    this.peerListeners = new Set();
    this.activePeers = new Map(); // peerId -> { lastSeen, rssi, nickname }

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

    this.eventEmitter.addListener('onMeshPacketReceived', (event) => {
      const rawString = typeof event === 'string' ? event : (event?.raw || '');
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

    this.eventEmitter.addListener('onPeerLost', (data) => {
      const peerId = typeof data === 'string' ? data : (data?.peerId || '');
      if (peerId) {
        this.activePeers.delete(peerId);
        this.notifyPeers();
      }
    });
  }

  /**
   * Request Bluetooth permissions for Android 12+ (Nearby Devices) and older versions
   */
  async requestBlePermissions() {
    if (Platform.OS !== 'android') return true;
    try {
      const apiLevel = Platform.Version;
      if (apiLevel >= 31) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ];
        const results = await PermissionsAndroid.requestMultiple(permissions);
        const granted =
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;
        return granted;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Nearby Bluetooth Devices',
            message: 'ClearFeed requires Bluetooth permission to connect with nearby peers offline without Wi-Fi.',
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

  /**
   * Check if Bluetooth radio is enabled
   */
  async isBluetoothEnabled() {
    if (this.isNativeAvailable && this.nativeModule.isBluetoothEnabled) {
      try {
        return await this.nativeModule.isBluetoothEnabled();
      } catch (err) {}
    }
    return true;
  }

  /**
   * Start Bluetooth Low Energy Advertising & Scanning
   */
  async start(nodeIdHex = '') {
    if (Platform.OS === 'android') {
      await this.requestBlePermissions();
    }
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

        const buffer = this.fragmentBuffer.get(fid);
        if (!buffer.chunks[idx]) {
          buffer.chunks[idx] = chunk;
          buffer.received++;
        }

        // All fragments received: assemble complete packet
        if (buffer.received === buffer.total) {
          const assembledString = buffer.chunks.join('');
          this.fragmentBuffer.delete(fid);
          const envelope = JSON.parse(assembledString);
          this.dispatchEnvelope(envelope);
        }
      }
    } catch (err) {
      console.warn('[BleMeshBridge] Inbound packet parsing warning:', err.message);
    }
  }

  dispatchEnvelope(envelope) {
    if (!envelope || !envelope.id) return;
    if (this.seenPacketIds.has(envelope.id)) return;

    this.seenPacketIds.add(envelope.id);

    // Bound seen cache to 2000 entries
    if (this.seenPacketIds.size > 2000) {
      const firstEntry = this.seenPacketIds.values().next().value;
      this.seenPacketIds.delete(firstEntry);
    }

    for (const listener of this.listeners) {
      try {
        listener(envelope);
      } catch (err) {
        console.error('[BleMeshBridge] Listener error:', err);
      }
    }
  }
}

export const bleMeshBridge = new BleMeshBridge();
