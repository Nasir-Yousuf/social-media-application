/**
 * Clearfeed SQLite Offline Database & Migration Engine
 * Provides persistent offline caching for:
 * - Posts (Cold-start 50-post chronological feed)
 * - Learn Lessons & Progress (Full offline reading of Clearfeed Academy)
 * - Messages & Outbox Queue (Offline queueing & replay)
 * - Mesh Packets (Offline telemetry & packet deduplication)
 */
import RawAsyncStorage from '@react-native-async-storage/async-storage';

const memDbStore = new Map();
const AsyncStorage = {
  getItem: async (k) => {
    try {
      if (typeof RawAsyncStorage?.getItem === 'function') return await RawAsyncStorage.getItem(k);
      if (typeof RawAsyncStorage?.default?.getItem === 'function') return await RawAsyncStorage.default.getItem(k);
    } catch {}
    return memDbStore.get(k) || null;
  },
  setItem: async (k, v) => {
    try {
      if (typeof RawAsyncStorage?.setItem === 'function') return await RawAsyncStorage.setItem(k, v);
      if (typeof RawAsyncStorage?.default?.setItem === 'function') return await RawAsyncStorage.default.setItem(k, v);
    } catch {}
    memDbStore.set(k, v);
  },
  removeItem: async (k) => {
    try {
      if (typeof RawAsyncStorage?.removeItem === 'function') return await RawAsyncStorage.removeItem(k);
      if (typeof RawAsyncStorage?.default?.removeItem === 'function') return await RawAsyncStorage.default.removeItem(k);
    } catch {}
    memDbStore.delete(k);
  },
};

let SQLite = null;
try {
  SQLite = require('expo-sqlite');
} catch {
  // Graceful fallback for non-native test environments
}

const DB_NAME = 'clearfeed_offline_v2.db';
let dbInstance = null;

// In-memory / AsyncStorage fallback store when expo-sqlite is not available
const memoryStore = {
  posts: new Map(),
  learn_lessons: new Map(),
  learn_progress: new Map(),
  messages: new Map(),
  outbox_queue: new Map(),
  mesh_packets: new Map(),
  seen_packets: new Map(),
  store_and_forward_queue: new Map(),
};

export const initDatabase = async () => {
  if (dbInstance) return dbInstance;

  if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
    try {
      dbInstance = SQLite.openDatabaseSync(DB_NAME);
      runMigrations(dbInstance);
      vacuumAndPruneDatabase(null, dbInstance).catch(() => {});
      return dbInstance;
    } catch (e) {
      console.warn('[OfflineDB] openDatabaseSync failed, trying async fallback:', e?.message);
    }
  }

  if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
    try {
      dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
      await runMigrationsAsync(dbInstance);
      vacuumAndPruneDatabase(null, dbInstance).catch(() => {});
      return dbInstance;
    } catch (e) {
      console.warn('[OfflineDB] openDatabaseAsync failed, falling back to AsyncStorage:', e?.message);
    }
  }

  // Fallback to AsyncStorage backed memory store
  await hydrateMemoryStore();
  vacuumAndPruneDatabase(null, null).catch(() => {});
  return null;
};

const runMigrations = (db) => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        author_id TEXT,
        created_at INTEGER NOT NULL,
        cached_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

      CREATE TABLE IF NOT EXISTS learn_lessons (
        id TEXT PRIMARY KEY,
        track TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_learn_track ON learn_lessons(track);

      CREATE TABLE IF NOT EXISTS learn_progress (
        id TEXT PRIMARY KEY,
        track TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        client_message_id TEXT,
        status TEXT NOT NULL DEFAULT 'sent'
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS outbox_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS mesh_packets (
        id TEXT PRIMARY KEY,
        packet_hash TEXT UNIQUE NOT NULL,
        sender_fingerprint TEXT,
        recipient_fingerprint TEXT,
        payload TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        hops INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_mesh_timestamp ON mesh_packets(timestamp DESC);

      CREATE TABLE IF NOT EXISTS seen_packets (
        packet_id TEXT PRIMARY KEY,
        sender_pubkey TEXT,
        packet_type INTEGER,
        seen_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_seen_packets_seen_at ON seen_packets(seen_at);

      CREATE TABLE IF NOT EXISTS store_and_forward_queue (
        packet_id TEXT PRIMARY KEY,
        sender_pubkey TEXT NOT NULL,
        recipient_pubkey TEXT NOT NULL,
        packet_type INTEGER NOT NULL,
        priority INTEGER NOT NULL DEFAULT 1,
        raw_hex TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        timestamp_ms INTEGER NOT NULL,
        ttl INTEGER NOT NULL,
        hop_count INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sf_created_at ON store_and_forward_queue(created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_sf_sender ON store_and_forward_queue(sender_pubkey, created_at ASC);
    `);
  } catch (err) {
    console.error('[OfflineDB] Sync Migration execution failed:', err);
  }
};

const runMigrationsAsync = async (db) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        author_id TEXT,
        created_at INTEGER NOT NULL,
        cached_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

      CREATE TABLE IF NOT EXISTS learn_lessons (
        id TEXT PRIMARY KEY,
        track TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_learn_track ON learn_lessons(track);

      CREATE TABLE IF NOT EXISTS learn_progress (
        id TEXT PRIMARY KEY,
        track TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        client_message_id TEXT,
        status TEXT NOT NULL DEFAULT 'sent'
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS outbox_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS mesh_packets (
        id TEXT PRIMARY KEY,
        packet_hash TEXT UNIQUE NOT NULL,
        sender_fingerprint TEXT,
        recipient_fingerprint TEXT,
        payload TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        hops INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_mesh_timestamp ON mesh_packets(timestamp DESC);

      CREATE TABLE IF NOT EXISTS seen_packets (
        packet_id TEXT PRIMARY KEY,
        sender_pubkey TEXT,
        packet_type INTEGER,
        seen_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_seen_packets_seen_at ON seen_packets(seen_at);

      CREATE TABLE IF NOT EXISTS store_and_forward_queue (
        packet_id TEXT PRIMARY KEY,
        sender_pubkey TEXT NOT NULL,
        recipient_pubkey TEXT NOT NULL,
        packet_type INTEGER NOT NULL,
        priority INTEGER NOT NULL DEFAULT 1,
        raw_hex TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        timestamp_ms INTEGER NOT NULL,
        ttl INTEGER NOT NULL,
        hop_count INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sf_created_at ON store_and_forward_queue(created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_sf_sender ON store_and_forward_queue(sender_pubkey, created_at ASC);
    `);
  } catch (err) {
    console.error('[OfflineDB] Async Migration execution failed:', err);
  }
};

const hydrateMemoryStore = async () => {
  try {
    const rawPosts = await AsyncStorage.getItem('@cf_offline_posts');
    if (rawPosts) {
      const parsed = JSON.parse(rawPosts);
      parsed.forEach((p) => memoryStore.posts.set(p._id || p.id, p));
    }
  } catch {}
};

// ==========================================
// 1. Post Caching & Cold-Start Retrieval
// ==========================================
export const cachePosts = async (posts = []) => {
  if (!Array.isArray(posts) || posts.length === 0) return;
  const now = Date.now();

  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      for (const p of posts) {
        const id = p._id || p.id;
        const createdAt = new Date(p.createdAt || now).getTime();
        db.runSync(
          `INSERT OR REPLACE INTO posts (id, data, author_id, created_at, cached_at) VALUES (?, ?, ?, ?, ?)`,
          [id, JSON.stringify(p), p.author?._id || p.author || null, createdAt, now]
        );
      }
      return;
    }
  } catch (e) {
    console.warn('[OfflineDB] cachePosts SQL write failed, falling back:', e?.message);
  }

  // Fallback
  posts.forEach((p) => {
    const id = p._id || p.id;
    memoryStore.posts.set(id, p);
  });
  try {
    const top500 = Array.from(memoryStore.posts.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 500);
    await AsyncStorage.setItem('@cf_offline_posts', JSON.stringify(top500));
  } catch {}
};

export const getCachedPosts = async (limit = 50) => {
  try {
    const db = await initDatabase();
    if (db && typeof db.getAllSync === 'function') {
      const rows = db.getAllSync(`SELECT data FROM posts ORDER BY created_at DESC LIMIT ?`, [limit]);
      return rows.map((r) => JSON.parse(r.data));
    }
  } catch (e) {
    console.warn('[OfflineDB] getCachedPosts SQL read failed:', e?.message);
  }

  // Fallback
  try {
    const raw = await AsyncStorage.getItem('@cf_offline_posts');
    if (raw) return JSON.parse(raw).slice(0, limit);
  } catch {}
  return Array.from(memoryStore.posts.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

// ==========================================
// 2. Clearfeed Learn Academy Offline Caching
// ==========================================
export const cacheLearnLesson = async (track, lessonId, content) => {
  const id = `${track}_${lessonId}`;
  const now = Date.now();

  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      db.runSync(
        `INSERT OR REPLACE INTO learn_lessons (id, track, lesson_id, title, content, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, track, lessonId, content.title || null, JSON.stringify(content), now]
      );
      return;
    }
  } catch {}

  memoryStore.learn_lessons.set(id, content);
};

export const getCachedLearnLesson = async (track, lessonId) => {
  const id = `${track}_${lessonId}`;
  try {
    const db = await initDatabase();
    if (db && typeof db.getFirstSync === 'function') {
      const row = db.getFirstSync(`SELECT content FROM learn_lessons WHERE id = ?`, [id]);
      if (row?.content) return JSON.parse(row.content);
    }
  } catch {}

  return memoryStore.learn_lessons.get(id) || null;
};

export const saveLearnProgress = async (track, lessonId, completed = true) => {
  const id = `${track}_${lessonId}`;
  const now = Date.now();

  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      db.runSync(
        `INSERT OR REPLACE INTO learn_progress (id, track, lesson_id, completed, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [id, track, lessonId, completed ? 1 : 0, now]
      );
      return;
    }
  } catch {}

  memoryStore.learn_progress.set(id, { track, lessonId, completed, updated_at: now });
};

// ==========================================
// 3. Outbox Queue for Offline Interactions
// ==========================================
export const enqueueOutboxItem = async (type, payload, customId = null) => {
  const id = customId || payload?.clientMessageId || payload?._id || `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();

  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      db.runSync(
        `INSERT INTO outbox_queue (id, type, payload, created_at, attempts, status) VALUES (?, ?, ?, ?, 0, 'pending')`,
        [id, type, JSON.stringify(payload), now]
      );
      return id;
    }
  } catch {}

  memoryStore.outbox_queue.set(id, { id, type, payload, created_at: now, attempts: 0, status: 'pending' });
  return id;
};

export const getPendingOutboxItems = async () => {
  try {
    const db = await initDatabase();
    if (db && typeof db.getAllSync === 'function') {
      const rows = db.getAllSync(`SELECT * FROM outbox_queue WHERE status = 'pending' ORDER BY created_at ASC`);
      return rows.map((r) => ({ ...r, payload: JSON.parse(r.payload) }));
    }
  } catch {}

  return Array.from(memoryStore.outbox_queue.values()).filter((i) => i.status === 'pending');
};

export const removeOutboxItem = async (id) => {
  if (!id) return;
  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      db.runSync(`DELETE FROM outbox_queue WHERE id = ?`, [id]);
      return;
    }
  } catch {}

  memoryStore.outbox_queue.delete(id);
  for (const [key, item] of memoryStore.outbox_queue.entries()) {
    if (
      key === id ||
      item.id === id ||
      item.payload?.clientMessageId === id ||
      item.payload?._id === id
    ) {
      memoryStore.outbox_queue.delete(key);
    }
  }
};

// ==========================================
// 4. Mesh Store-and-Forward & Seen Packets
// ==========================================
export const MAX_STORE_FORWARD_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_PACKET_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours
export const MAX_PACKETS_PER_SENDER = 50;
export const SEEN_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const isPacketSeen = async (packetId) => {
  if (!packetId) return false;
  try {
    const db = await initDatabase();
    if (db && typeof db.getFirstSync === 'function') {
      const row = db.getFirstSync(`SELECT packet_id FROM seen_packets WHERE packet_id = ?`, [packetId]);
      return !!row;
    }
  } catch {}
  return memoryStore.seen_packets.has(packetId);
};

export const markPacketSeen = async (packetId, senderPubkey = '', packetType = 0) => {
  if (!packetId) return;
  const now = Date.now();
  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      db.runSync(
        `INSERT OR REPLACE INTO seen_packets (packet_id, sender_pubkey, packet_type, seen_at) VALUES (?, ?, ?, ?)`,
        [packetId, senderPubkey, packetType, now]
      );
    }
  } catch {}
  memoryStore.seen_packets.set(packetId, { packetId, senderPubkey, packetType, seenAt: now });
  if (memoryStore.seen_packets.size > 10000) {
    const firstKey = memoryStore.seen_packets.keys().next().value;
    memoryStore.seen_packets.delete(firstKey);
  }
};

export const cleanSeenPackets = async (retentionMs = SEEN_RETENTION_MS) => {
  const cutoff = Date.now() - retentionMs;
  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      db.runSync(`DELETE FROM seen_packets WHERE seen_at < ?`, [cutoff]);
    }
  } catch {}
  for (const [k, v] of memoryStore.seen_packets.entries()) {
    if (v.seenAt < cutoff) memoryStore.seen_packets.delete(k);
  }
};

export const addToStoreAndForwardQueue = async (packet) => {
  if (!packet || !packet.packetId) return false;
  const now = Date.now();
  const packetId = packet.packetId;
  const senderPubkey = packet.senderPubkey || '';
  const recipientPubkey = packet.recipientPubkey || '';
  const packetType = packet.packetType || 0;
  const priority = packet.priority || 1;
  const rawHex = packet.rawHex || '';
  const sizeBytes = packet.sizeBytes || Math.ceil(rawHex.length / 2) || 188;
  const timestampMs = packet.timestampMs || now;
  const createdAt = packet.createdAt || packet.created_at || now;
  const ttl = packet.ttl || 3;
  const hopCount = packet.hopCount || 0;

  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      // 1. Evict expired packets (>48 hours)
      const expiryCutoff = now - MAX_PACKET_AGE_MS;
      db.runSync(`DELETE FROM store_and_forward_queue WHERE created_at < ?`, [expiryCutoff]);

      // 2. Check per-sender limit (max 50 packets per sender)
      const senderRows = db.getAllSync(
        `SELECT packet_id FROM store_and_forward_queue WHERE sender_pubkey = ? ORDER BY created_at ASC`,
        [senderPubkey]
      );
      if (senderRows.length >= MAX_PACKETS_PER_SENDER) {
        const oldestId = senderRows[0].packet_id;
        db.runSync(`DELETE FROM store_and_forward_queue WHERE packet_id = ?`, [oldestId]);
      }

      // 3. Check total buffer limit (25 MB)
      const sumRow = db.getFirstSync(`SELECT SUM(size_bytes) as total_size FROM store_and_forward_queue`);
      let currentTotal = sumRow?.total_size || 0;
      while (currentTotal + sizeBytes > MAX_STORE_FORWARD_BYTES) {
        const oldestLowPriority = db.getFirstSync(
          `SELECT packet_id, size_bytes FROM store_and_forward_queue ORDER BY priority ASC, created_at ASC LIMIT 1`
        );
        if (!oldestLowPriority) break;
        db.runSync(`DELETE FROM store_and_forward_queue WHERE packet_id = ?`, [oldestLowPriority.packet_id]);
        currentTotal -= oldestLowPriority.size_bytes;
      }

      // Insert packet
      db.runSync(
        `INSERT OR REPLACE INTO store_and_forward_queue 
        (packet_id, sender_pubkey, recipient_pubkey, packet_type, priority, raw_hex, size_bytes, timestamp_ms, ttl, hop_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [packetId, senderPubkey, recipientPubkey, packetType, priority, rawHex, sizeBytes, timestampMs, ttl, hopCount, createdAt]
      );
    }
  } catch {}

  // In-memory fallback
  const expiryCutoff = now - MAX_PACKET_AGE_MS;
  for (const [id, p] of memoryStore.store_and_forward_queue.entries()) {
    if (p.createdAt < expiryCutoff) memoryStore.store_and_forward_queue.delete(id);
  }

  let senderCount = 0;
  let oldestSenderPacketId = null;
  let oldestSenderTime = Infinity;
  for (const [id, p] of memoryStore.store_and_forward_queue.entries()) {
    if (p.senderPubkey === senderPubkey) {
      senderCount++;
      if (p.createdAt < oldestSenderTime) {
        oldestSenderTime = p.createdAt;
        oldestSenderPacketId = id;
      }
    }
  }
  if (senderCount >= MAX_PACKETS_PER_SENDER && oldestSenderPacketId) {
    memoryStore.store_and_forward_queue.delete(oldestSenderPacketId);
  }

  memoryStore.store_and_forward_queue.set(packetId, {
    packetId,
    senderPubkey,
    recipientPubkey,
    packetType,
    priority,
    rawHex,
    sizeBytes,
    timestampMs,
    ttl,
    hopCount,
    createdAt,
  });

  return true;
};

export const removeFromStoreAndForwardQueue = async (packetId) => {
  if (!packetId) return false;
  try {
    const db = await initDatabase();
    if (db && typeof db.runSync === 'function') {
      db.runSync(`DELETE FROM store_and_forward_queue WHERE packet_id = ?`, [packetId]);
    }
  } catch {}
  memoryStore.store_and_forward_queue.delete(packetId);
  return true;
};

export const purgeDeliveredFromStoreAndForward = async (originalPacketId) => {
  return await removeFromStoreAndForwardQueue(originalPacketId);
};

export const getStoreAndForwardQueue = async () => {
  try {
    const db = await initDatabase();
    if (db && typeof db.getAllSync === 'function') {
      const rows = db.getAllSync(`SELECT * FROM store_and_forward_queue ORDER BY priority DESC, created_at ASC`);
      return rows.map((r) => ({
        packetId: r.packet_id,
        senderPubkey: r.sender_pubkey,
        recipientPubkey: r.recipient_pubkey,
        packetType: r.packet_type,
        priority: r.priority,
        rawHex: r.raw_hex,
        sizeBytes: r.size_bytes,
        timestampMs: r.timestamp_ms,
        ttl: r.ttl,
        hopCount: r.hop_count,
        createdAt: r.created_at,
      }));
    }
  } catch {}
  return Array.from(memoryStore.store_and_forward_queue.values());
};

export const getStoreAndForwardStats = async () => {
  let count = 0;
  let totalBytes = 0;
  try {
    const db = await initDatabase();
    if (db && typeof db.getFirstSync === 'function') {
      const row = db.getFirstSync(`SELECT COUNT(*) as count, SUM(size_bytes) as total_size FROM store_and_forward_queue`);
      count = row?.count || 0;
      totalBytes = row?.total_size || 0;
    }
  } catch {}

  if (count === 0 && memoryStore.store_and_forward_queue.size > 0) {
    count = memoryStore.store_and_forward_queue.size;
    for (const p of memoryStore.store_and_forward_queue.values()) {
      totalBytes += p.sizeBytes || 0;
    }
  }

  return {
    totalCount: count,
    count,
    totalBytes,
    totalMB: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
    maxMB: 25.0,
    maxAgeHours: 48,
    maxPerSender: MAX_PACKETS_PER_SENDER,
    maxBytes: MAX_STORE_FORWARD_BYTES,
  };
};

/**
 * Automatic SQLite PRAGMA incremental_vacuum / TTL pruning on startup:
 * - Purges expired (>48h) Mesh store-and-forward packets.
 * - Trims cached feed items beyond the most recent 500 posts.
 * - Executes PRAGMA incremental_vacuum(50) / VACUUM to reclaim storage.
 */
export const vacuumAndPruneDatabase = async (customNowMs = null, passedDb = null) => {
  const now = customNowMs || Date.now();
  const ttlCutoff = now - MAX_PACKET_AGE_MS;
  let prunedPackets = 0;
  let prunedPosts = 0;

  try {
    const db = passedDb || (await initDatabase());
    if (db) {
      if (typeof db.runSync === 'function') {
        const sfRes = db.runSync(`DELETE FROM store_and_forward_queue WHERE created_at < ?`, [ttlCutoff]);
        prunedPackets += sfRes?.changes || 0;

        const postRes = db.runSync(
          `DELETE FROM posts WHERE id NOT IN (SELECT id FROM posts ORDER BY created_at DESC LIMIT 500)`
        );
        prunedPosts += postRes?.changes || 0;

        try {
          db.execSync('PRAGMA incremental_vacuum(50);');
        } catch {
          try {
            db.execSync('VACUUM;');
          } catch {}
        }
      } else if (typeof db.runAsync === 'function') {
        const sfRes = await db.runAsync(`DELETE FROM store_and_forward_queue WHERE created_at < ?`, [ttlCutoff]);
        prunedPackets += sfRes?.changes || 0;

        const postRes = await db.runAsync(
          `DELETE FROM posts WHERE id NOT IN (SELECT id FROM posts ORDER BY created_at DESC LIMIT 500)`
        );
        prunedPosts += postRes?.changes || 0;

        try {
          await db.execAsync('PRAGMA incremental_vacuum(50);');
        } catch {
          try {
            await db.execAsync('VACUUM;');
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn('[OfflineDB] vacuumAndPruneDatabase SQL notice:', err?.message);
  }

  // Also prune in fallback memory store
  try {
    for (const [key, item] of memoryStore.store_and_forward_queue.entries()) {
      const itemCreatedAt = item.createdAt || item.created_at || item.timestampMs || item.timestamp_ms || 0;
      if (itemCreatedAt < ttlCutoff) {
        memoryStore.store_and_forward_queue.delete(key);
        prunedPackets++;
      }
    }

    if (memoryStore.posts.size > 500) {
      const sortedPosts = Array.from(memoryStore.posts.entries()).sort((a, b) => {
        const aTime = new Date(a[1].createdAt || a[1].created_at || 0).getTime();
        const bTime = new Date(b[1].createdAt || b[1].created_at || 0).getTime();
        return bTime - aTime;
      });
      const toRemove = sortedPosts.slice(500);
      for (const [postId] of toRemove) {
        memoryStore.posts.delete(postId);
        prunedPosts++;
      }
    }
  } catch {}

  return { prunedPackets, prunedPosts };
};

export default {
  initDatabase,
  vacuumAndPruneDatabase,
  cachePosts,
  getCachedPosts,
  cacheLearnLesson,
  getCachedLearnLesson,
  saveLearnProgress,
  enqueueOutboxItem,
  getPendingOutboxItems,
  removeOutboxItem,
  isPacketSeen,
  markPacketSeen,
  cleanSeenPackets,
  addToStoreAndForwardQueue,
  removeFromStoreAndForwardQueue,
  purgeDeliveredFromStoreAndForward,
  getStoreAndForwardQueue,
  getStoreAndForwardStats,
};
