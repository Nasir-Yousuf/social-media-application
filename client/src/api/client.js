import axios from 'axios';

const PRODUCTION_BACKEND_URL = 'https://social-media-application-production-e75d.up.railway.app/api';

const sanitizeApiUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  // Automatically purge obsolete/expired Railway deployment URLs
  if (trimmed.includes('clearfeed518.up.railway.app')) {
    return '';
  }
  return trimmed;
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('pulse518_api_url');
    if (custom) {
      const sanitized = sanitizeApiUrl(custom);
      if (!sanitized) {
        localStorage.removeItem('pulse518_api_url');
      } else {
        return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
      }
    }
  }
  const rawUrl = sanitizeApiUrl(import.meta.env.VITE_API_URL || '');
  if (rawUrl) {
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
  }
  // When running in the browser on Vercel or locally, prefer relative /api so requests
  // are routed through Vercel's rewrite proxy without any CORS issues.
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return PRODUCTION_BACKEND_URL;
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
