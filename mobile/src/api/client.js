import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Automatically detect host computer's LAN IP or Android Emulator when running on Expo Go:
const getDevHostIp = () => {
  // If running inside an Android Emulator, 10.0.2.2 routes directly to host PC localhost
  if (Platform.OS === 'android' && !Device.isDevice) {
    return '10.0.2.2';
  }

  // hostUri in Expo Go contains "192.168.0.246:8081"
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  // Default to your current local machine Wi-Fi IPv4 address
  return '192.168.0.246';
};

const DEV_IP = getDevHostIp();

export const CLOUD_URL = 'https://clearfeed518.up.railway.app/api';
export const CLOUD_ORIGIN = 'https://clearfeed518.up.railway.app';
export const LOCAL_DEV_URL = `http://${DEV_IP}:5180/api`;
export const LOCAL_DEV_ORIGIN = `http://${DEV_IP}:5180`;

const DEFAULT_URL = CLOUD_URL;

let customBaseUrl = null;

// Eagerly hydrate customBaseUrl from storage if present
AsyncStorage.getItem('cf_api_base_url').then((saved) => {
  if (saved) customBaseUrl = saved;
}).catch(() => {});

export const setBaseUrl = async (url) => {
  customBaseUrl = url;
  if (url) {
    await AsyncStorage.setItem('cf_api_base_url', url);
  } else {
    await AsyncStorage.removeItem('cf_api_base_url');
  }
  try {
    const socketService = (await import('../services/socket')).default;
    socketService.reconnect().catch(() => {});
  } catch {}
};

export const getBaseUrl = async () => {
  if (customBaseUrl) return customBaseUrl;
  const saved = await AsyncStorage.getItem('cf_api_base_url');
  if (saved) {
    customBaseUrl = saved;
    return saved;
  }
  return DEFAULT_URL;
};

export const getServerOrigin = () => {
  if (customBaseUrl) {
    return customBaseUrl.replace(/\/api\/?$/, '');
  }
  return CLOUD_ORIGIN;
};

export const resolveAvatarUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Convert DiceBear SVGs to PNG for native React Native Image support
  if (trimmed.includes('api.dicebear.com') && trimmed.includes('/svg')) {
    return trimmed.replace('/svg', '/png');
  }

  // Base64 data URLs
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  // Absolute URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Relative URLs like /api/users/:id/avatar or /uploads/...
  const origin = getServerOrigin();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${origin}${path}`;
};

// Generic request helper
async function request(endpoint, options = {}) {
  // Normalize /users/:username -> /users/profile/:username alias
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const userProfileMatch = cleanEndpoint.match(/^\/users\/([a-zA-Z0-9_.-]+)$/);
  if (userProfileMatch) {
    const segment = userProfileMatch[1];
    const reserved = ['me', 'directory', 'suggestions', 'profile', 'sync-follows'];
    if (!reserved.includes(segment.toLowerCase())) {
      cleanEndpoint = `/users/profile/${segment}`;
    }
  }

  const baseUrl = await getBaseUrl();
  const token = await AsyncStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${baseUrl}${cleanEndpoint}`;

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.response = { status: response.status, data };
      throw error;
    }

    return { data, status: response.status };
  } catch (err) {
    const errMsg = (err && err.message) || '';
    const isConnError =
      errMsg.includes('ConnectException') ||
      errMsg.includes('Failed to connect') ||
      errMsg.includes('Network request failed') ||
      errMsg.includes('NetworkError') ||
      errMsg.includes('connection refused');

    // If local endpoint was unreachable and we aren't already targeting cloud, fallback to cloud
    if (isConnError && !url.includes('railway.app')) {
      try {
        const cloudUrl = `${CLOUD_URL}${cleanEndpoint}`;
        const fallbackResponse = await fetch(cloudUrl, config);
        const data = await fallbackResponse.json().catch(() => ({}));

        if (fallbackResponse.ok) {
          customBaseUrl = CLOUD_URL;
          AsyncStorage.setItem('cf_api_base_url', CLOUD_URL).catch(() => {});
          import('../services/socket').then((m) => m.default.reconnect().catch(() => {})).catch(() => {});
          return { data, status: fallbackResponse.status };
        }
      } catch (fallbackErr) {
        // Fallback also failed, proceed with original error
      }
    }

    const isMuted =
      options.silent ||
      (err.status === 404 &&
        (cleanEndpoint.includes('/learning/progress') ||
          cleanEndpoint.includes('/users/profile') ||
          cleanEndpoint.includes('/users/') ||
          cleanEndpoint.includes('/posts/user')));

    if (err.status !== 401 && err.status !== 403 && !isMuted) {
      console.warn(`API Error [${options.method || 'GET'} ${cleanEndpoint}]:`, err.message);
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options = {}) => request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options = {}) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options = {}) => request(endpoint, { method: 'DELETE', ...options }),
};

export default api;
