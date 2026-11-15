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
};

export const initDatabase = async () => {
  if (dbInstance) return dbInstance;

  if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
    try {
      dbInstance = SQLite.openDatabaseSync(DB_NAME);
      runMigrations(dbInstance);
      return dbInstance;
    } catch (e) {
      console.warn('[OfflineDB] openDatabaseSync failed, trying async fallback:', e?.message);
    }
  }

  if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
    try {
      dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
      runMigrationsAsync(dbInstance);
      return dbInstance;
    } catch (e) {
      console.warn('[OfflineDB] openDatabaseAsync failed, falling back to AsyncStorage:', e?.message);
    }
  }

  // Fallback to AsyncStorage backed memory store
  await hydrateMemoryStore();
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
    const top50 = Array.from(memoryStore.posts.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
    await AsyncStorage.setItem('@cf_offline_posts', JSON.stringify(top50));
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

export default {
  initDatabase,
  cachePosts,
  getCachedPosts,
  cacheLearnLesson,
  getCachedLearnLesson,
  saveLearnProgress,
  enqueueOutboxItem,
  getPendingOutboxItems,
  removeOutboxItem,
};
