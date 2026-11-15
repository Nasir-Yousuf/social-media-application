import { MeshEnvelope } from '../protocol/wireProtocol';
import socketService from '../../services/socket';
import desktopLanTransport, { CFM1_LAN_PORT, CFM1_MDNS_SERVICE_TYPE } from './lanTransport';

export enum TransportState {
  INITIALIZING = 'INITIALIZING',
  READY_OFFLINE = 'READY_OFFLINE',
  SCANNING = 'SCANNING',
  CONNECTED_PEERS = 'CONNECTED_PEERS',
  NO_PEERS_FOUND = 'NO_PEERS_FOUND',
  BLUETOOTH_OFF = 'BLUETOOTH_OFF',
  PERMISSIONS_NEEDED = 'PERMISSIONS_NEEDED',
  UNSUPPORTED = 'UNSUPPORTED',
}

class DesktopMeshTransportManager {
  private currentState: TransportState = TransportState.INITIALIZING;
  private subscribers: Set<(state: TransportState) => void> = new Set();
  private packetListeners: Set<(envelope: MeshEnvelope) => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isSocketBound = false;
  private lanPeerCount = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('clearfeed_mesh_local_bus');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.magic === 'CFM1') {
            this.emitIncomingPacket(event.data);
          }
        };
      } catch {}
    }

    try {
      if (!this.isSocketBound) {
        this.isSocketBound = true;
        socketService.on('mesh:packet', (envelope: MeshEnvelope) => {
          if (envelope && envelope.magic === 'CFM1') {
            this.emitIncomingPacket(envelope);
          }
        });
      }
    } catch {}

    // Integrate High-Speed LAN Transport
    desktopLanTransport.onPacket((envelope: MeshEnvelope) => {
      this.emitIncomingPacket(envelope);
    });

    desktopLanTransport.onPeers((peers) => {
      this.lanPeerCount = peers.length;
      if (this.lanPeerCount > 0) {
        this.currentState = TransportState.CONNECTED_PEERS;
      } else if (this.currentState === TransportState.CONNECTED_PEERS) {
        this.currentState = TransportState.READY_OFFLINE;
      }
      this.notifyState();
    });
  }

  public async initialize(): Promise<void> {
    try {
      if (!this.isSocketBound) {
        this.isSocketBound = true;
        socketService.on('mesh:packet', (envelope: MeshEnvelope) => {
          if (envelope && envelope.magic === 'CFM1') {
            this.emitIncomingPacket(envelope);
          }
        });
      }
      try {
        socketService.connect();
      } catch (err: any) {
        console.warn('[DesktopMeshTransport] Socket connect notice:', err?.message);
      }

      await desktopLanTransport.start();

      this.currentState = this.lanPeerCount > 0 ? TransportState.CONNECTED_PEERS : TransportState.READY_OFFLINE;
      this.notifyState();
    } catch {
      this.currentState = TransportState.UNSUPPORTED;
      this.notifyState();
    }
  }

  public onStateChange(cb: (state: TransportState) => void): () => void {
    this.subscribers.add(cb);
    cb(this.currentState);
    return () => this.subscribers.delete(cb);
  }

  private notifyState(): void {
    for (const cb of this.subscribers) {
      try {
        cb(this.currentState);
      } catch {}
    }
  }

  public setState(state: TransportState): void {
    this.currentState = state;
    this.notifyState();
  }

  public onPacket(cb: (envelope: MeshEnvelope) => void): () => void {
    this.packetListeners.add(cb);
    return () => this.packetListeners.delete(cb);
  }

  public emitIncomingPacket(envelope: MeshEnvelope): void {
    for (const listener of this.packetListeners) {
      try {
        listener(envelope);
      } catch (err: any) {
        console.warn('[DesktopMeshTransport] Listener error:', err?.message);
      }
    }
  }

  public async broadcastPacket(envelope: MeshEnvelope): Promise<boolean> {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(envelope);
      } catch {}
    }
    try {
      socketService.emit('mesh:packet', envelope);
    } catch (err: any) {
      console.warn('[DesktopMeshTransport] Socket emit warning:', err?.message);
    }

    // High-speed LAN transmission to local subnet peers
    try {
      const diag = desktopLanTransport.getDiagnostics();
      for (const peer of diag.connectedLanPeers) {
        desktopLanTransport.sendTcpFrame(peer.ip, peer.port, envelope).catch(() => {});
      }
    } catch {}

    return true;
  }

  public async sendDirect(_peerPubkey: string, envelope: MeshEnvelope): Promise<boolean> {
    return this.broadcastPacket(envelope);
  }

  public getStateExplanation(): string {
    switch (this.currentState) {
      case TransportState.READY_OFFLINE:
        return 'No internet connection? That’s okay. Mesh Chat can communicate directly with nearby compatible devices when a supported wireless connection is available.';
      case TransportState.NO_PEERS_FOUND:
        return 'No nearby peers found. Keep Mesh enabled, or ask another user to open Mesh Chat nearby.';
      case TransportState.BLUETOOTH_OFF:
        return 'Bluetooth or local wireless adapter is inactive. Enable it to discover nearby Mesh peers.';
      case TransportState.PERMISSIONS_NEEDED:
        return 'Nearby device permissions are required to discover and connect to local Mesh peers.';
      case TransportState.CONNECTED_PEERS:
        return `Connected to nearby mesh peers (${this.lanPeerCount} active on LAN / hotspot). Offline encrypted communication active.`;
      case TransportState.UNSUPPORTED:
        return 'Direct Bluetooth mesh transport is currently unavailable on this desktop system. Protocol core active.';
      default:
        return 'Initializing local wireless subsystem...';
    }
  }
}

export const meshTransport = new DesktopMeshTransportManager();
export default meshTransport;
