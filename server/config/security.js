/**
 * Centralized Security Configuration
 * Manages CORS origin validation, security assertions, and environment checks.
 */

const getAllowedOrigins = () => {
  const customOrigins = (process.env.CLIENT_URL || process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5180',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5180',
    ...customOrigins,
  ];
};

const isOriginAllowed = (origin) => {
  // Allow non-browser requests (e.g. mobile apps, Electron desktop apps, curl, server-to-server)
  if (!origin) return true;

  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;

  // Allow local development ports dynamically
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;

  // Allow Vercel preview/production deployments
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(origin)) return true;

  // Allow Railway deployed domains
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)*up\.railway\.app$/.test(origin)) return true;

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin "${origin}" is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-maintenance-key',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
};

const validateSecurityEnvironment = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;
  const DEFAULT_SECRET = 'pulse518_super_secret_course_key_2026';

  if (isProd) {
    if (!jwtSecret || jwtSecret === DEFAULT_SECRET) {
      console.error('\n======================================================');
      console.error(' [SECURITY ALERT] CRITICAL VULNERABILITY DETECTED');
      console.error(' In production, you MUST provide a unique, cryptographically strong JWT_SECRET.');
      console.error(' Please set JWT_SECRET in your environment variables.');
      console.error('======================================================\n');
    }

    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ [SECURITY NOTICE] Running in production without a remote MONGODB_URI.');
    }
  }
};

module.exports = {
  isOriginAllowed,
  corsOptions,
  getAllowedOrigins,
  validateSecurityEnvironment,
};
