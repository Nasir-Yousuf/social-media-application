const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for sensitive authentication endpoints (login, register, reset password)
 * Mitigates brute-force credential stuffing and automated bot account creation.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * General API limiter to prevent DDoS / scraping of endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per 15 minutes per IP
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
 * Limiter for content creation (posts, comments, messages) to prevent automated spam
 */
const contentCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // Max 60 creations per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
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
