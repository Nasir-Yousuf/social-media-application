export const CFM1_SERVICE_UUID = '0000CFM1-0000-1000-8000-00805F9B34FB';
export const CFM1_TX_RX_FRAME_CHAR = '0000CFM2-0000-1000-8000-00805F9B34FB';
export const CFM1_PEER_IDENTITY_CHAR = '0000CFM3-0000-1000-8000-00805F9B34FB';
export const CFM1_MDNS_SERVICE_TYPE = '_clearfeed-mesh._tcp.';
export const CFM1_DEFAULT_LAN_PORT = 49152;

class MockEventEmitter {
  constructor() {
    this._listeners = new Map();
  }
  addListener(event, listener) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(listener);
    return {
      remove: () => {
        const set = this._listeners.get(event);
        if (set) set.delete(listener);
      },
    };
  }
  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (set) {
      set.forEach((fn) => {
        try {
          fn(...args);
        } catch {}
      });
    }
  }
}

let NativeBleMesh = null;
let EventEmitterClass = MockEventEmitter;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expo = require('expo-modules-core');
  if (expo?.requireOptionalNativeModule) {
    NativeBleMesh = expo.requireOptionalNativeModule('ClearFeedBleMesh');
  }
  if (expo?.EventEmitter) {
    EventEmitterClass = expo.EventEmitter;
  }
} catch {}

export const mockBleMesh = {
  startMesh: async (nodeId, pubkey, syncHash) => true,
  stopMesh: async () => true,
  sendChunk: async (peerId, chunkHex) => true,
  broadcastChunk: async (chunkHex) => true,
  sendBlePacket: async (payload) => true,
  isBluetoothEnabled: async () => true,
  getConnectedPeers: async () => [],
  setScanTier: async (tier) => true,
  getScanTier: async () => 'FOREGROUND',
  startForegroundService: async () => true,
  stopForegroundService: async () => true,

  // High-Speed LAN & Wi-Fi Direct methods
  startLanTransport: async (nodeId, pubKeyPrefix, port) => true,
  stopLanTransport: async () => true,
  startWifiDirect: async (nodeId, pubKeyPrefix, port) => true,
  stopWifiDirect: async () => true,
  sendTcpFrame: async (peerIp, port, frameHex) => true,
  broadcastLanBeacon: async () => true,
  getLanPeers: async () => [],
};

const activeModule = NativeBleMesh || mockBleMesh;
export const BleMeshEventEmitter = new EventEmitterClass(activeModule);

export default activeModule;
