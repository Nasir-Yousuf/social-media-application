import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default backend API URL:
// - Android Emulator uses 10.0.2.2 to access host machine localhost
// - iOS Simulator uses localhost
// - Change this to your local Wi-Fi IP (e.g., http://192.168.1.X:5180/api) when testing on a physical phone
const DEFAULT_URL = Platform.select({
  android: 'http://10.0.2.2:5180/api',
  ios: 'http://localhost:5180/api',
  default: 'http://localhost:5180/api',
});

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
