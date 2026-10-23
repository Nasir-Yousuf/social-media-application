import socketService from '../../services/socket';

export const TransportState = {
  INITIALIZING: 'INITIALIZING',
  READY_OFFLINE: 'READY_OFFLINE',
  SCANNING: 'SCANNING',
  CONNECTED_PEERS: 'CONNECTED_PEERS',
  NO_PEERS_FOUND: 'NO_PEERS_FOUND',
  BLUETOOTH_OFF: 'BLUETOOTH_OFF',
  PERMISSIONS_NEEDED: 'PERMISSIONS_NEEDED',
  UNSUPPORTED: 'UNSUPPORTED',
};

class MeshTransportManager {
  constructor() {
    this.currentState = TransportState.INITIALIZING;
    this.subscribers = new Set();
    this.packetListeners = new Set();
    this.isBluetoothEnabled = true;
    this.hasPermissions = true;
    this.isSocketBound = false;
  }

  /**
   * Initialize platform transport capabilities
   */
  async initialize() {
    try {
      if (!this.isSocketBound) {
        this.isSocketBound = true;
        // Connect socket immediately so all devices on Wi-Fi link together for mesh
        socketService.connect().catch((err) => {
          console.warn('[MeshTransport] Socket connection notice:', err?.message);
        });
        socketService.on('mesh:packet', (envelope) => {
          if (envelope && envelope.magic === 'CFM1') {
            this.emitIncomingPacket(envelope);
          }
        });
      }

      this.currentState = TransportState.READY_OFFLINE;
      this.notifyState();
    } catch (err) {
      this.currentState = TransportState.UNSUPPORTED;
      this.notifyState();
    }
  }

  /**
   * Subscribe to transport state changes
   */
  onStateChange(cb) {
    this.subscribers.add(cb);
    cb(this.currentState);
    return () => this.subscribers.delete(cb);
  }

  notifyState() {
    for (const cb of this.subscribers) {
      try {
        cb(this.currentState);
      } catch (e) {
        // Safe dispatch
      }
    }
  }

  /**
   * Listen for incoming raw network envelopes
   */
  onPacket(cb) {
    this.packetListeners.add(cb);
    return () => this.packetListeners.delete(cb);
  }

  emitIncomingPacket(envelope) {
    for (const listener of this.packetListeners) {
      try {
        listener(envelope);
      } catch (e) {
        console.warn('[MeshTransport] Packet listener error:', e.message);
      }
    }
  }

  /**
   * Transmit packet over supported local wireless & LAN transport
   */
  async broadcastPacket(envelope) {
    try {
      socketService.emit('mesh:packet', envelope);
    } catch (err) {
      console.warn('[MeshTransport] Broadcast packet error:', err.message);
    }
    return true;
  }

  async sendDirect(peerPubkey, envelope) {
    return this.broadcastPacket(envelope);
  }

  getStateExplanation() {
    switch (this.currentState) {
      case TransportState.READY_OFFLINE:
        return 'No internet connection? That’s okay. Mesh Chat can communicate directly with nearby compatible devices when a supported wireless connection is available.';
      case TransportState.NO_PEERS_FOUND:
        return 'No nearby peers found. Keep Mesh enabled, or ask another user to open Mesh Chat nearby.';
      case TransportState.BLUETOOTH_OFF:
        return 'Bluetooth is turned off. Turn it on to discover nearby Mesh users.';
      case TransportState.PERMISSIONS_NEEDED:
        return 'Nearby device permissions are required to discover and connect to local Mesh peers.';
      case TransportState.CONNECTED_PEERS:
        return 'Connected to nearby mesh peers. Offline encrypted communication active.';
      case TransportState.UNSUPPORTED:
        return 'Mesh wireless transport is not supported on this platform hardware.';
      default:
        return 'Initializing local wireless subsystem...';
    }
  }
}

export const meshTransport = new MeshTransportManager();
export default meshTransport;
