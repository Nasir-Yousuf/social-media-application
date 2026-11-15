/**
 * Clearfeed Native Windows Desktop Tauri 2 Mesh Bridge
 * 
 * Directly bridges the web interface with the native Tokio TCP/UDP & WinRT BLE
 * mesh daemon running in Rust when on Windows, or smoothly falls back to the
 * in-browser LAN transport.
 */

import { isTauri } from '../../services/secureStorage';
import { MeshEnvelope } from '../protocol/wireProtocol';
import desktopLanTransport from './lanTransport';

export interface NativeMeshPeer {
  id: string;
  name: string;
  rssi: number;
  transport: 'BLE' | 'LAN' | 'WIFI_DIRECT';
  lastSeen: number;
  pubkey: string;
  isDirect: boolean;
}

export interface NativeMeshDiagnostics {
  running: boolean;
  batterySaver: boolean;
  relayEnabled: boolean;
  activePeersCount: number;
  storedPacketsCount: number;
  packetsForwarded: number;
  packetsDropped: number;
  bytesReceived: number;
  bytesSent: number;
}

type PeerListener = (peers: NativeMeshPeer[]) => void;
type MessageListener = (msg: any) => void;
type AckListener = (ack: { packetId: string; recipientPubkey: string; timestamp: number }) => void;

class TauriMeshBridge {
  private peerListeners: Set<PeerListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private ackListeners: Set<AckListener> = new Set();
  private unlistenFunctions: Array<() => void> = [];
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!isTauri()) {
      // Running in standard browser or preview mode
      desktopLanTransport.onPeers((lanPeers) => {
        const mapped: NativeMeshPeer[] = lanPeers.map((p) => ({
          id: p.peerId,
          name: p.nickname || `Node-${p.peerId.slice(0, 6)}`,
          rssi: -50,
          transport: p.transport,
          lastSeen: p.lastSeen,
          pubkey: p.pubKeyPrefix,
          isDirect: true,
        }));
        this.notifyPeers(mapped);
      });
      return;
    }

    try {
      const { listen } = await import('@tauri-apps/api/event');

      const unlistenPeer = await listen<NativeMeshPeer[]>('mesh://peer-updated', (event) => {
        if (event.payload) {
          this.notifyPeers(event.payload);
        }
      });
      this.unlistenFunctions.push(unlistenPeer);

      const unlistenMsg = await listen<any>('mesh://message-received', (event) => {
        if (event.payload) {
          for (const l of this.messageListeners) {
            try {
              l(event.payload);
            } catch {}
          }
        }
      });
      this.unlistenFunctions.push(unlistenMsg);

      const unlistenAck = await listen<{ packetId: string; recipientPubkey: string; timestamp: number }>(
        'mesh://ack-received',
        (event) => {
          if (event.payload) {
            for (const l of this.ackListeners) {
              try {
                l(event.payload);
              } catch {}
            }
          }
        }
      );
      this.unlistenFunctions.push(unlistenAck);
    } catch (err) {
      console.warn('[TauriMeshBridge] Failed to bind native event listeners:', err);
    }
  }

  public async startMesh(config?: {
    listenPort?: number;
    enableBle?: boolean;
    enableLan?: boolean;
    batterySaver?: boolean;
    relayEnabled?: boolean;
  }): Promise<boolean> {
    await this.initialize();
    if (!isTauri()) {
      await desktopLanTransport.start();
      return true;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<boolean>('mesh_start', {
        listenPort: config?.listenPort ?? 49152,
        enableBle: config?.enableBle ?? true,
        enableLan: config?.enableLan ?? true,
        batterySaver: config?.batterySaver ?? false,
        relayEnabled: config?.relayEnabled ?? true,
      });
    } catch (err) {
      console.error('[TauriMeshBridge] mesh_start failed:', err);
      return false;
    }
  }

  public async stopMesh(): Promise<boolean> {
    if (!isTauri()) {
      await desktopLanTransport.stop();
      return true;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<boolean>('mesh_stop');
    } catch (err) {
      console.error('[TauriMeshBridge] mesh_stop failed:', err);
      return false;
    }
  }

  public async sendMessage(
    recipientPubkey: string,
    text: string,
    ttl?: number,
    priority?: number
  ): Promise<string | null> {
    if (!isTauri()) {
      return null;
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<string>('mesh_send_message', {
        recipientPubkey,
        text,
        ttl: ttl ?? 3,
        priority: priority ?? 1,
      });
    } catch (err) {
      console.error('[TauriMeshBridge] mesh_send_message failed:', err);
      return null;
    }
  }

  public async getPeers(): Promise<NativeMeshPeer[]> {
    if (!isTauri()) {
      return desktopLanTransport.getPeers().map((p) => ({
        id: p.peerId,
        name: p.nickname || `Node-${p.peerId.slice(0, 6)}`,
        rssi: -50,
        transport: p.transport,
        lastSeen: p.lastSeen,
        pubkey: p.pubKeyPrefix,
        isDirect: true,
      }));
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<NativeMeshPeer[]>('mesh_get_peers');
    } catch (err) {
      console.warn('[TauriMeshBridge] mesh_get_peers notice:', err);
      return [];
    }
  }

  public async getDiagnostics(): Promise<NativeMeshDiagnostics | null> {
    if (!isTauri()) {
      return {
        running: true,
        batterySaver: false,
        relayEnabled: true,
        activePeersCount: desktopLanTransport.getPeers().length,
        storedPacketsCount: 0,
        packetsForwarded: 0,
        packetsDropped: 0,
        bytesReceived: 0,
        bytesSent: 0,
      };
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<NativeMeshDiagnostics>('mesh_get_diagnostics');
    } catch (err) {
      console.warn('[TauriMeshBridge] mesh_get_diagnostics notice:', err);
      return null;
    }
  }

  public async setBatterySaver(enabled: boolean): Promise<boolean> {
    if (!isTauri()) return true;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<boolean>('mesh_set_battery_saver', { enabled });
    } catch {
      return false;
    }
  }

  public async setRelayEnabled(enabled: boolean): Promise<boolean> {
    if (!isTauri()) return true;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<boolean>('mesh_set_relay_enabled', { enabled });
    } catch {
      return false;
    }
  }

  public onPeers(listener: PeerListener): () => void {
    this.peerListeners.add(listener);
    return () => this.peerListeners.delete(listener);
  }

  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public onAck(listener: AckListener): () => void {
    this.ackListeners.add(listener);
    return () => this.ackListeners.delete(listener);
  }

  private notifyPeers(peers: NativeMeshPeer[]): void {
    for (const l of this.peerListeners) {
      try {
        l(peers);
      } catch {}
    }
  }

  public dispose(): void {
    for (const u of this.unlistenFunctions) {
      try {
        u();
      } catch {}
    }
    this.unlistenFunctions = [];
  }
}

export const tauriMeshBridge = new TauriMeshBridge();
export default tauriMeshBridge;
