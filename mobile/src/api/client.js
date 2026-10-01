import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect host computer's LAN IP when running on Expo Go:
const getDevHostIp = () => {
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
const DEFAULT_URL = `http://${DEV_IP}:5180/api`;

let customBaseUrl = null;

export const setBaseUrl = async (url) => {
  customBaseUrl = url;
  if (url) {
    await AsyncStorage.setItem('cf_api_base_url', url);
  } else {
    await AsyncStorage.removeItem('cf_api_base_url');
  }
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

// Generic request helper
async function request(endpoint, options = {}) {
  const baseUrl = await getBaseUrl();
  const token = await AsyncStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
      throw error;
    }

    return { data, status: response.status };
  } catch (err) {
    console.warn(`API Error [${options.method || 'GET'} ${endpoint}]:`, err.message);
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
