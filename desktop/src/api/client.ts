import axios from 'axios';

export const PRODUCTION_BACKEND_URL = 'https://clearfeed518.up.railway.app/api';
export const LOCAL_BACKEND_URL = 'http://localhost:5180/api';

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('pulse518_api_url');
    if (custom) return custom.endsWith('/api') ? custom : `${custom}/api`;

    const hostname = window.location.hostname;
    if (
      import.meta.env.DEV ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === 'tauri.localhost' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname.endsWith('.local')
    ) {
      const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
      if (rawUrl) return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
      return LOCAL_BACKEND_URL;
    }
  }
  const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (rawUrl) {
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
  }
  return LOCAL_BACKEND_URL;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // Dynamically update baseURL in case user switched API URL in desktop settings
    config.baseURL = getBaseUrl();
    const token = localStorage.getItem('pulse518_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('pulse518_token')) {
        localStorage.removeItem('pulse518_token');
        localStorage.removeItem('pulse518_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
