/**
 * Clearfeed Local Moderation & Blocklist Service
 * Manages blocked users (@cf_blocked_users) and content filtering.
 */
import RawAsyncStorage from '@react-native-async-storage/async-storage';

const memStorage = new Map();

const storage = {
  getItem: async (k) => {
    try {
      if (typeof RawAsyncStorage?.getItem === 'function') return await RawAsyncStorage.getItem(k);
      if (typeof RawAsyncStorage?.default?.getItem === 'function') return await RawAsyncStorage.default.getItem(k);
    } catch {}
    return memStorage.get(k) || null;
  },
  setItem: async (k, v) => {
    try {
      if (typeof RawAsyncStorage?.setItem === 'function') return await RawAsyncStorage.setItem(k, v);
      if (typeof RawAsyncStorage?.default?.setItem === 'function') return await RawAsyncStorage.default.setItem(k, v);
    } catch {}
    memStorage.set(k, v);
  },
};

export const getBlockedUserIds = async () => {
  try {
    const raw = await storage.getItem('@cf_blocked_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

export const blockUserId = async (userId) => {
  try {
    const current = await getBlockedUserIds();
    if (!current.includes(userId)) {
      const updated = [...current, userId];
      await storage.setItem('@cf_blocked_users', JSON.stringify(updated));
    }
    return true;
  } catch {
    return false;
  }
};

export const unblockUserId = async (userId) => {
  try {
    const current = await getBlockedUserIds();
    const updated = current.filter((id) => id !== userId);
    await storage.setItem('@cf_blocked_users', JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
};

export default {
  getBlockedUserIds,
  blockUserId,
  unblockUserId,
};
