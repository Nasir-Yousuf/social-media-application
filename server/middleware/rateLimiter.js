const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for sensitive authentication endpoints (login, register, reset password, refresh)
 * Mitigates brute-force credential stuffing and automated bot account creation.
 * Enforces 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * General API limiter to prevent DDoS / scraping of endpoints
 * Enforces 300 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    message: 'Rate limit exceeded. Please slow down your requests.',
  },
});

/**
 * Limiter for AI mentor and AI assistant endpoints to prevent API quota exhaustion
 */
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 25, // Max 25 AI queries per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    message: 'AI usage rate limit reached. Please wait a minute before sending another prompt.',
  },
});

/**
 * Strict per-user rate limiter for AI queries & comment mentions (20 requests / 15 minutes)
 */
const aiPerUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 requests per 15 minutes per user
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    return req.user?._id ? req.user._id.toString() : (req.ip || 'unknown');
  },
  message: {
    message: 'AI request limit reached (20 requests per 15 minutes). Please wait before asking again.',
  },
});

/**
 * Limiter for content creation (posts, comments, messages, uploads) to prevent automated spam
 * Enforces 60 requests per 15 minutes per authenticated user (falling back to IP).
 */
const contentCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Max 60 creations per 15 minutes per user
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    return req.user?._id ? req.user._id.toString() : (req.ip || 'unknown');
  },
  message: {
    message: 'You are posting too quickly. Please pause for a moment.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  aiLimiter,
  aiPerUserLimiter,
  contentCreationLimiter,
};
