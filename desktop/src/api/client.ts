import axios from 'axios';

export const PRODUCTION_BACKEND_URL = 'https://clearfeed518.up.railway.app/api';
export const LOCAL_BACKEND_URL = 'http://localhost:5180/api';

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('pulse518_api_url');
    if (custom) return custom.endsWith('/api') ? custom : `${custom}/api`;
  }
  const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (rawUrl) {
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
  }
  // Default to production cloud backend so Desktop & Mobile communicate on the same network bridge
  return PRODUCTION_BACKEND_URL;
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
  async (error) => {
    const originalRequest = error.config;
    // Auto-fallback from local server to cloud if local dev server is unreachable
    if (
      error.message &&
      (error.message.includes('Network Error') || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') &&
      !originalRequest._retry &&
      originalRequest.baseURL !== PRODUCTION_BACKEND_URL &&
      !originalRequest.url?.includes('railway.app')
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = PRODUCTION_BACKEND_URL;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pulse518_api_url', PRODUCTION_BACKEND_URL);
      }
      return api(originalRequest);
    }

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
