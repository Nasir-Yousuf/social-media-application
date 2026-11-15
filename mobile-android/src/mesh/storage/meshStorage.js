import rawAsyncStorage from '@react-native-async-storage/async-storage';
import offlineDatabase, {
  isPacketSeen as dbIsPacketSeen,
  markPacketSeen as dbMarkPacketSeen,
  cleanSeenPackets as dbCleanSeenPackets,
  addToStoreAndForwardQueue as dbAddToSF,
  removeFromStoreAndForwardQueue as dbRemoveFromSF,
  purgeDeliveredFromStoreAndForward as dbPurgeDelivered,
  getStoreAndForwardQueue as dbGetSFQueue,
  getStoreAndForwardStats as dbGetSFStats,
} from '../../services/offlineDatabase.js';

const memStorage = new Map();
const AsyncStorage = {
  getItem: async (key) => {
    try {
      if (rawAsyncStorage && typeof rawAsyncStorage.getItem === 'function') {
        const val = await rawAsyncStorage.getItem(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch {}
    return memStorage.has(key) ? memStorage.get(key) : null;
  },
  setItem: async (key, val) => {
    memStorage.set(key, typeof val === 'string' ? val : JSON.stringify(val));
    try {
      if (rawAsyncStorage && typeof rawAsyncStorage.setItem === 'function') {
        await rawAsyncStorage.setItem(key, val);
      }
    } catch {}
  },
  removeItem: async (key) => {
    memStorage.delete(key);
    try {
      if (rawAsyncStorage && typeof rawAsyncStorage.removeItem === 'function') {
        await rawAsyncStorage.removeItem(key);
      }
    } catch {}
  },
  getAllKeys: async () => {
    try {
      if (rawAsyncStorage && typeof rawAsyncStorage.getAllKeys === 'function') {
        return await rawAsyncStorage.getAllKeys();
      }
    } catch {}
    return Array.from(memStorage.keys());
  },
  multiRemove: async (keys) => {
    for (const k of keys) memStorage.delete(k);
    try {
      if (rawAsyncStorage && typeof rawAsyncStorage.multiRemove === 'function') {
        await rawAsyncStorage.multiRemove(keys);
      }
    } catch {}
  },
};

const STORAGE_KEYS = {
  IDENTITY: '@cfm_identity_v1',
  PEERS: '@cfm_peers_v1',
  BLOCKED_PEERS: '@cfm_blocked_peers_v1',
  VERIFIED_PEERS: '@cfm_verified_peers_v1',
  CONVERSATIONS: '@cfm_conversations_v1',
  MESSAGES_PREFIX: '@cfm_messages_v1_',
  OUTBOX: '@cfm_outbox_v1',
  RELAY_CACHE: '@cfm_relay_cache_v1',
  SEEN_PACKETS: '@cfm_seen_packets_v1',
  SETTINGS: '@cfm_settings_v1',
};

// Limits to prevent unbounded offline memory accumulation
const MAX_SEEN_PACKETS = 500;
const MAX_RELAY_ITEMS = 50;
const MAX_MESSAGES_PER_CONV = 200;

class MeshStorage {
  // --- IDENTITY ---
  async loadIdentity() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.IDENTITY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('[MeshStorage] Failed to load identity:', err.message);
      return null;
    }
  }

  async saveIdentity(identity) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(identity));
      return true;
    } catch (err) {
      console.warn('[MeshStorage] Failed to save identity:', err.message);
      return false;
    }
  }

  async clearIdentity() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.IDENTITY);
      return true;
    } catch {
      return false;
    }
  }

  // --- SETTINGS ---
  async loadSettings() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw
        ? JSON.parse(raw)
        : {
            meshEnabled: true,
            relayEnabled: true,
            batterySaving: false,
          };
    } catch {
      return { meshEnabled: true, relayEnabled: true, batterySaving: false };
    }
  }

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('[MeshStorage] Failed to save settings:', err.message);
    }
  }

  // --- PEERS ---
  async loadPeers() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PEERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async savePeers(peers) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PEERS, JSON.stringify(peers));
    } catch (err) {
      console.warn('[MeshStorage] Failed to save peers:', err.message);
    }
  }

  // --- PEER TRUST & BLOCKING ---
  async loadBlockedPeers() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_PEERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async blockPeer(pubkey) {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadBlockedPeers();
      if (!list.includes(key)) {
        list.push(key);
        await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_PEERS, JSON.stringify(list));
      }
      return true;
    } catch {
      return false;
    }
  }

  async unblockPeer(pubkey) {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadBlockedPeers();
      const filtered = list.filter((p) => p !== key);
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_PEERS, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  async isPeerBlocked(pubkey) {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadBlockedPeers();
      return list.includes(key);
    } catch {
      return false;
    }
  }

  async loadVerifiedPeers() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.VERIFIED_PEERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async setPeerVerified(pubkey, verified = true) {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadVerifiedPeers();
      let updated;
      if (verified) {
        updated = list.includes(key) ? list : [...list, key];
      } else {
        updated = list.filter((p) => p !== key);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.VERIFIED_PEERS, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }

  async isPeerVerified(pubkey) {
    try {
      const key = (pubkey || '').toLowerCase();
      const list = await this.loadVerifiedPeers();
      return list.includes(key);
    } catch {
      return false;
    }
  }

  // --- CONVERSATIONS ---
  async loadConversations() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async saveConversations(conversations) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (err) {
      console.warn('[MeshStorage] Failed to save conversations:', err.message);
    }
  }

  // --- MESSAGES ---
  async loadMessages(convId) {
    try {
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${convId}`;
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async saveMessages(convId, messages) {
    try {
      const bounded = messages.slice(-MAX_MESSAGES_PER_CONV);
      const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${convId}`;
      await AsyncStorage.setItem(key, JSON.stringify(bounded));
    } catch (err) {
      console.warn('[MeshStorage] Failed to save messages:', err.message);
    }
  }

  // --- OUTBOX ---
  async loadOutbox() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.OUTBOX);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async saveOutbox(outbox) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(outbox));
    } catch (err) {
      console.warn('[MeshStorage] Failed to save outbox:', err.message);
    }
  }

  // --- RELAY STORE-AND-FORWARD CACHE (SQLite + Async fallback) ---
  async loadRelayCache() {
    try {
      const dbQueue = await dbGetSFQueue();
      if (dbQueue && dbQueue.length > 0) {
        return dbQueue;
      }
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.RELAY_CACHE);
      const items = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      return items.filter((p) => (p.expiresAt || p.timestampMs + 172800000) > now);
    } catch {
      return [];
    }
  }

  async saveRelayCache(cache) {
    try {
      const bounded = cache.slice(-MAX_RELAY_ITEMS);
      await AsyncStorage.setItem(STORAGE_KEYS.RELAY_CACHE, JSON.stringify(bounded));
    } catch (err) {
      console.warn('[MeshStorage] Failed to save relay cache:', err.message);
    }
  }

  async addToStoreAndForward(packet, priority = 0) {
    return await dbAddToSF(packet, priority);
  }

  async addToStoreAndForwardQueue(packet, priority = 0) {
    return await dbAddToSF(packet, priority);
  }

  async removeFromStoreAndForward(packetId) {
    return await dbRemoveFromSF(packetId);
  }

  async removeFromStoreAndForwardQueue(packetId) {
    return await dbRemoveFromSF(packetId);
  }

  async purgeDelivered(originalPacketId) {
    return await dbPurgeDelivered(originalPacketId);
  }

  async purgeDeliveredFromStoreAndForward(originalPacketId) {
    return await dbPurgeDelivered(originalPacketId);
  }

  async getStoreAndForwardQueue(limit = 100) {
    return await dbGetSFQueue(limit);
  }

  async getStoreAndForwardStats() {
    return await dbGetSFStats();
  }

  // --- DEDUPLICATION CACHE (SQLite 24h retention + LRU in-memory) ---
  async loadSeenPackets() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SEEN_PACKETS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async markPacketSeen(packetId, senderPubkey = '', packetType = 0) {
    try {
      await dbMarkPacketSeen(packetId, senderPubkey, packetType);
      const list = await this.loadSeenPackets();
      if (!list.includes(packetId)) {
        list.push(packetId);
        const bounded = list.slice(-MAX_SEEN_PACKETS);
        await AsyncStorage.setItem(STORAGE_KEYS.SEEN_PACKETS, JSON.stringify(bounded));
      }
    } catch (err) {
      console.warn('[MeshStorage] Failed to mark packet seen:', err.message);
    }
  }

  async isPacketSeen(packetId) {
    try {
      const seenInDb = await dbIsPacketSeen(packetId);
      if (seenInDb) return true;
      const list = await this.loadSeenPackets();
      return list.includes(packetId);
    } catch {
      return false;
    }
  }

  async cleanSeenPackets() {
    return await dbCleanSeenPackets();
  }

  // --- TOTAL PURGE / RESET ---
  async clearAllMeshStorage() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const meshKeys = allKeys.filter((k) => k.startsWith('@cfm_'));
      if (meshKeys.length > 0) {
        await AsyncStorage.multiRemove(meshKeys);
      }
      return true;
    } catch (err) {
      console.warn('[MeshStorage] Failed to purge storage:', err.message);
      return false;
    }
  }
}

export const meshStorage = new MeshStorage();
export default meshStorage;
