/**
 * Clearfeed Secure Storage Service
 * Android Keystore-backed encrypted storage utilizing expo-secure-store.
 * Safely manages JWT credentials, refresh tokens, and Mesh Ed25519/X25519 private keys.
 */
import RawAsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore = null;
try {
  SecureStore = require('expo-secure-store');
} catch {
  // Graceful fallback for non-native test environments
}

const fallbackStore = new Map();
const AsyncStorage = {
  getItem: async (k) => {
    try {
      if (typeof RawAsyncStorage?.getItem === 'function') return await RawAsyncStorage.getItem(k);
      if (typeof RawAsyncStorage?.default?.getItem === 'function') return await RawAsyncStorage.default.getItem(k);
    } catch {}
    return fallbackStore.get(k) || null;
  },
  setItem: async (k, v) => {
    try {
      if (typeof RawAsyncStorage?.setItem === 'function') return await RawAsyncStorage.setItem(k, v);
      if (typeof RawAsyncStorage?.default?.setItem === 'function') return await RawAsyncStorage.default.setItem(k, v);
    } catch {}
    fallbackStore.set(k, v);
  },
  removeItem: async (k) => {
    try {
      if (typeof RawAsyncStorage?.removeItem === 'function') return await RawAsyncStorage.removeItem(k);
      if (typeof RawAsyncStorage?.default?.removeItem === 'function') return await RawAsyncStorage.default.removeItem(k);
    } catch {}
    fallbackStore.delete(k);
  },
};

const SECURE_KEYS = {
  AUTH_TOKEN: 'cf_auth_token',
  REFRESH_TOKEN: 'cf_refresh_token',
  MESH_SEED: 'cf_mesh_identity_seed',
  MESH_KEYPAIR: 'cf_mesh_keypair',
  USER_DATA: 'cf_cached_user',
};

const isSecureStoreAvailable = async () => {
  if (typeof window === 'undefined' && typeof globalThis.nativeCallSyncHook === 'undefined') {
    // Node.js test environment without React Native JSI
    return false;
  }
  if (!SecureStore) return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const setSecureItem = async (key, value) => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    const available = await isSecureStoreAvailable();
    if (available && SecureStore?.setItemAsync) {
      await SecureStore.setItemAsync(key, serialized, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
      return true;
    }
  } catch (err) {
    console.warn(`[SecureStorage] Keystore write error for ${key}:`, err?.message);
  }

  // Fallback to AsyncStorage
  try {
    await AsyncStorage.setItem(`@secure_${key}`, serialized);
    return true;
  } catch (fallbackErr) {
    console.error(`[SecureStorage] Fallback storage failed for ${key}:`, fallbackErr?.message);
    return false;
  }
};

export const getSecureItem = async (key) => {
  try {
    const available = await isSecureStoreAvailable();
    if (available && SecureStore?.getItemAsync) {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch (err) {
    console.warn(`[SecureStorage] Keystore read error for ${key}:`, err?.message);
  }

  // Fallback to AsyncStorage
  try {
    return await AsyncStorage.getItem(`@secure_${key}`);
  } catch {
    return null;
  }
};

export const deleteSecureItem = async (key) => {
  try {
    const available = await isSecureStoreAvailable();
    if (available && SecureStore?.deleteItemAsync) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (err) {
    console.warn(`[SecureStorage] Keystore delete error for ${key}:`, err?.message);
  }

  try {
    await AsyncStorage.removeItem(`@secure_${key}`);
    return true;
  } catch {
    return false;
  }
};

// Specialized Token & Credential Helpers
export const getAuthToken = async () => {
  // Check secure item first, then legacy 'token' for seamless migration
  const token = await getSecureItem(SECURE_KEYS.AUTH_TOKEN);
  if (token) return token;
  const legacy = await AsyncStorage.getItem('token');
  if (legacy) {
    await setAuthToken(legacy); // upgrade to keystore
    return legacy;
  }
  return null;
};

export const setAuthToken = async (token) => {
  if (!token) {
    return await deleteSecureItem(SECURE_KEYS.AUTH_TOKEN);
  }
  await AsyncStorage.setItem('token', token); // keep in sync for legacy callers
  return await setSecureItem(SECURE_KEYS.AUTH_TOKEN, token);
};

export const getRefreshToken = async () => {
  return await getSecureItem(SECURE_KEYS.REFRESH_TOKEN);
};

export const setRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    return await deleteSecureItem(SECURE_KEYS.REFRESH_TOKEN);
  }
  return await setSecureItem(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
};

export const clearAuthTokens = async () => {
  await deleteSecureItem(SECURE_KEYS.AUTH_TOKEN);
  await deleteSecureItem(SECURE_KEYS.REFRESH_TOKEN);
  await AsyncStorage.removeItem('token');
};

export const getMeshKeyPair = async () => {
  const raw = await getSecureItem(SECURE_KEYS.MESH_KEYPAIR);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setMeshKeyPair = async (keyPair) => {
  return await setSecureItem(SECURE_KEYS.MESH_KEYPAIR, keyPair);
};

export default {
  setSecureItem,
  getSecureItem,
  deleteSecureItem,
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
  clearAuthTokens,
  getMeshKeyPair,
  setMeshKeyPair,
  SECURE_KEYS,
};
