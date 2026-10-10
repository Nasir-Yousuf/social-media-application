import axios from 'axios';

const PRODUCTION_BACKEND_URL = 'https://clearfeed518.up.railway.app/api';

const getBaseUrl = () => {
  const rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (rawUrl) {
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
  }
  // When deployed on Vercel or remote hosts, target Railway production API directly if VITE_API_URL is missing
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
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
