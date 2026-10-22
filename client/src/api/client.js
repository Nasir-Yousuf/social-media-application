import axios from 'axios';

const PRODUCTION_BACKEND_URL = 'https://clearfeed518.up.railway.app/api';

const getBaseUrl = () => {
  const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (rawUrl) {
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
  }
  // When running locally on localhost or LAN IP, use local /api
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname.endsWith('.local')
    ) {
      return '/api';
    }
    return PRODUCTION_BACKEND_URL;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pulse518_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auth expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, remove bad token and trigger re-auth
      if (localStorage.getItem('pulse518_token')) {
        localStorage.removeItem('pulse518_token');
        localStorage.removeItem('pulse518_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
