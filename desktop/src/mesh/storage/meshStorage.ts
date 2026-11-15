import { DeliveryState } from '../protocol/wireProtocol';

export interface MeshIdentity {
  publicKeyHex: string;
  secretKeyHex: string;
  nickname: string;
  createdAt: number;
}

export interface MeshPeer {
  publicKeyHex: string;
  nickname: string;
  status: 'discovered' | 'verified' | 'blocked';
  lastSeen: number;
  hopDistance?: number;
}

export interface MeshConversation {
  peerPubkey: string;
  nickname: string;
  lastMessageSnippet: string;
  lastTimestamp: number;
  unreadCount: number;
}

export interface MeshMessage {
  id: string;
  conversationId: string;
  senderPubkey: string;
  recipientPubkey: string;
  senderNickname: string;
  text: string;
  timestamp: number;
  isOutgoing: boolean;
  deliveryState:
    | DeliveryState
    | 'SAVED_LOCALLY'
    | 'QUEUED'
    | 'SENT_NEIGHBOR'
    | 'RELAYED'
    | 'DELIVERED_ACK'
    | 'EXPIRED'
    | 'FAILED'
    | 'queued'
    | 'relayed'
    | 'delivered'
    | 'failed';
  hopCount: number;
}

export interface MeshSettings {
  meshEnabled: boolean;
  relayEnabled: boolean;
  batterySaving: boolean;
  discoveryIntervalSec: number;
}

const STORAGE_KEYS = {
  IDENTITY: '@cfm_identity_v1',
  PEERS: '@cfm_peers_v1',
  BLOCKED_PEERS: '@cfm_blocked_peers_v1',
  VERIFIED_PEERS: '@cfm_verified_peers_v1',
  CONVERSATIONS: '@cfm_conversations_v1',
  MESSAGES_PREFIX: '@cfm_messages_v1_',
  SETTINGS: '@cfm_settings_v1',
  SEEN_PACKETS: '@cfm_seen_packets_v1',
  STORE_FORWARD: '@cfm_store_and_forward_v1',
};

const MAX_SEEN_PACKETS = 500;
const MAX_MESSAGES_PER_CONV = 200;
const MAX_SF_BYTES = 25 * 1024 * 1024; // 25 MB bounded storage
const MAX_SF_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours retention
const MAX_PER_SENDER = 50;

class MeshStorage {
  // Identity
  public async loadIdentity(): Promise<MeshIdentity | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.IDENTITY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public async saveIdentity(identity: MeshIdentity): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(identity));
      return true;
    } catch {
      return false;
    }
  }

  public async clearIdentity(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.IDENTITY);
  }

  // Settings
  public async loadSettings(): Promise<MeshSettings> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw
        ? JSON.parse(raw)
        : {
            meshEnabled: true,
            relayEnabled: true,
            batterySaving: false,
            discoveryIntervalSec: 10,
          };
    } catch {
      return {
        meshEnabled: true,
        relayEnabled: true,
        batterySaving: false,
        discoveryIntervalSec: 10,
      };
    }
  }

  public async saveSettings(settings: MeshSettings): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }

  // Peers
  public async loadPeers(): Promise<MeshPeer[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PEERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async savePeers(peers: MeshPeer[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.PEERS, JSON.stringify(peers));
    } catch {}
  }

  public async upsertPeer(peer: MeshPeer): Promise<void> {
    try {
      const peers = await this.loadPeers();
      const idx = peers.findIndex(
        (p) => p.publicKeyHex.toLowerCase() === peer.publicKeyHex.toLowerCase()
      );
      let updated: MeshPeer[];
      if (idx >= 0) {
        updated = [...peers];
        updated[idx] = {
          ...updated[idx],
          nickname: peer.nickname || updated[idx].nickname,
          lastSeen: peer.lastSeen || Date.now(),
          status: peer.status || updated[idx].status,
          hopDistance: peer.hopDistance !== undefined ? peer.hopDistance : updated[idx].hopDistance,
        };
      } else {
        updated = [peer, ...peers];
      }
      await this.savePeers(updated);
    } catch {}
  }

  // Conversations
  public async loadConversations(): Promise<MeshConversation[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async saveConversations(conversations: MeshConversation[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch {}
  }

  // Messages
  public async loadMessages(convId: string): Promise<MeshMessage[]> {
    try {
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${convId.toLowerCase()}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async saveMessages(convId: string, messages: MeshMessage[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${convId.toLowerCase()}`;
      const bounded = messages.slice(-MAX_MESSAGES_PER_CONV);
      localStorage.setItem(key, JSON.stringify(bounded));
    } catch {}
  }

  // Deduplication
  public async loadSeenPackets(): Promise<string[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SEEN_PACKETS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async markPacketSeen(packetId: string): Promise<void> {
    try {
      const list = await this.loadSeenPackets();
      if (!list.includes(packetId)) {
        list.push(packetId);
        const bounded = list.slice(-MAX_SEEN_PACKETS);
        localStorage.setItem(STORAGE_KEYS.SEEN_PACKETS, JSON.stringify(bounded));
      }
    } catch {}
  }

  public async isPacketSeen(packetId: string): Promise<boolean> {
    try {
      const list = await this.loadSeenPackets();
      return list.includes(packetId);
    } catch {
      return false;
    }
  }

  // --- PEER TRUST & BLOCKING ---
  public async loadBlockedPeers(): Promise<string[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED_PEERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async blockPeer(pubkey: string): Promise<boolean> {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadBlockedPeers();
      if (!list.includes(key)) {
        list.push(key);
        localStorage.setItem(STORAGE_KEYS.BLOCKED_PEERS, JSON.stringify(list));
      }
      return true;
    } catch {
      return false;
    }
  }

  public async unblockPeer(pubkey: string): Promise<boolean> {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadBlockedPeers();
      const filtered = list.filter((p) => p !== key);
      localStorage.setItem(STORAGE_KEYS.BLOCKED_PEERS, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  public async isPeerBlocked(pubkey: string): Promise<boolean> {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadBlockedPeers();
      return list.includes(key);
    } catch {
      return false;
    }
  }

  public async loadVerifiedPeers(): Promise<string[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VERIFIED_PEERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async verifyPeer(pubkey: string, verified = true): Promise<boolean> {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadVerifiedPeers();
      let updated: string[];
      if (verified) {
        updated = list.includes(key) ? list : [...list, key];
      } else {
        updated = list.filter((p) => p !== key);
      }
      localStorage.setItem(STORAGE_KEYS.VERIFIED_PEERS, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }

  public async isPeerVerified(pubkey: string): Promise<boolean> {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadVerifiedPeers();
      return list.includes(key);
    } catch {
      return false;
    }
  }

  // --- BOUNDED STORE-AND-FORWARD QUEUE (25MB, 48h expiration, max 50/sender) ---
  public async loadStoreAndForwardQueue(): Promise<any[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STORE_FORWARD);
      const list = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      // Filter out packets older than 48 hours
      return list.filter((item: any) => now - (item.createdAt || item.timestamp || now) < MAX_SF_AGE_MS);
    } catch {
      return [];
    }
  }

  public async addToStoreAndForwardQueue(packet: any, priority = 0): Promise<boolean> {
    try {
      const queue = await this.loadStoreAndForwardQueue();
      const packetId = packet.packetId;
      const sender = (packet.senderPubkey || '').toLowerCase();
      const rawHex = JSON.stringify(packet);
      const sizeBytes = new TextEncoder().encode(rawHex).length;
      const now = Date.now();

      // Check per-sender cap (max 50)
      const senderPackets = queue.filter((p: any) => (p.senderPubkey || '').toLowerCase() === sender);
      if (senderPackets.length >= MAX_PER_SENDER) {
        // Evict oldest low-priority packet from this sender
        const oldest = senderPackets.sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0) || a.createdAt - b.createdAt)[0];
        const idx = queue.findIndex((p: any) => p.packetId === oldest.packetId);
        if (idx >= 0) queue.splice(idx, 1);
      }

      // Check buffer byte size ceiling (25 MB)
      let currentBytes = queue.reduce((sum: number, p: any) => sum + (p.sizeBytes || 0), 0);
      while (currentBytes + sizeBytes > MAX_SF_BYTES && queue.length > 0) {
        // Evict oldest low-priority packet
        queue.sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0) || a.createdAt - b.createdAt);
        const removed = queue.shift();
        currentBytes -= removed?.sizeBytes || 0;
      }

      // Remove any existing duplicate packetId
      const existingIdx = queue.findIndex((p: any) => p.packetId === packetId);
      if (existingIdx >= 0) {
        queue.splice(existingIdx, 1);
      }

      queue.push({
        packetId,
        senderPubkey: sender,
        recipientPubkey: (packet.recipientPubkey || '').toLowerCase(),
        packetType: packet.type || 0,
        priority,
        rawHex,
        sizeBytes,
        timestampMs: packet.timestamp || now,
        ttl: packet.hopsRemaining ?? 5,
        hopCount: packet.hopCount ?? 0,
        createdAt: now,
      });

      localStorage.setItem(STORAGE_KEYS.STORE_FORWARD, JSON.stringify(queue));
      return true;
    } catch {
      return false;
    }
  }

  public async removeFromStoreAndForwardQueue(packetId: string): Promise<boolean> {
    try {
      const queue = await this.loadStoreAndForwardQueue();
      const filtered = queue.filter((p: any) => p.packetId !== packetId);
      localStorage.setItem(STORAGE_KEYS.STORE_FORWARD, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  public async purgeDeliveredFromStoreAndForward(originalPacketId: string): Promise<boolean> {
    return await this.removeFromStoreAndForwardQueue(originalPacketId);
  }

  public async getStoreAndForwardQueue(limit = 100): Promise<any[]> {
    const queue = await this.loadStoreAndForwardQueue();
    return queue.slice(0, limit);
  }

  public async getStoreAndForwardStats(): Promise<{
    totalCount: number;
    totalBytes: number;
    totalMB: number;
    maxMB: number;
    maxAgeHours: number;
    maxPerSender: number;
  }> {
    const queue = await this.loadStoreAndForwardQueue();
    const totalBytes = queue.reduce((sum: number, p: any) => sum + (p.sizeBytes || 0), 0);
    return {
      totalCount: queue.length,
      totalBytes,
      totalMB: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
      maxMB: 25.0,
      maxAgeHours: 48,
      maxPerSender: MAX_PER_SENDER,
    };
  }

  // Purge all Mesh data
  public async clearAllMeshStorage(): Promise<void> {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('@cfm_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}

export const meshStorage = new MeshStorage();
export default meshStorage;
