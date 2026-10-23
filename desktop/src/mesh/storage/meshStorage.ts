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
  deliveryState: 'queued' | 'relayed' | 'delivered' | 'failed';
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
  CONVERSATIONS: '@cfm_conversations_v1',
  MESSAGES_PREFIX: '@cfm_messages_v1_',
  SETTINGS: '@cfm_settings_v1',
  SEEN_PACKETS: '@cfm_seen_packets_v1',
};

const MAX_SEEN_PACKETS = 500;
const MAX_MESSAGES_PER_CONV = 200;

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
