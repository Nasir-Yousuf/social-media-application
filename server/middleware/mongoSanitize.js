/**
 * Deep NoSQL Injection Sanitization & Detection Middleware
 * Strips and rejects prohibited MongoDB operator keys ('$' prefix and '.' notation)
 * across req.body, req.query, and req.params to safeguard Express and Mongoose queries.
 */

const AppError = require('../utils/AppError');

/**
 * Checks whether an object recursively contains any key starting with '$' or containing '.'
 * @param {unknown} val
 * @returns {boolean}
 */
function hasNoSqlInjection(val) {
  if (!val || typeof val !== 'object') return false;

  if (Array.isArray(val)) {
    for (const item of val) {
      if (hasNoSqlInjection(item)) return true;
    }
    return false;
  }

  for (const key of Object.keys(val)) {
    if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
      return true;
    }
    if (hasNoSqlInjection(val[key])) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively strips keys starting with '$' or containing '.' from an object in-place
 * @param {unknown} val
 * @returns {unknown}
 */
function stripNoSqlKeys(val) {
  if (!val || typeof val !== 'object') return val;

  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) {
      stripNoSqlKeys(val[i]);
    }
    return val;
  }

  for (const key of Object.keys(val)) {
    if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
      delete val[key];
      continue;
    }
    if (val[key] && typeof val[key] === 'object') {
      stripNoSqlKeys(val[key]);
    }
  }

  return val;
}

/**
 * Express middleware to sanitize and reject NoSQL query injection payloads.
 */
function sanitizeMiddleware(req, res, next) {
  // Reject malicious payloads with operator keys ($ or .) in body, query, or params
  if (
    hasNoSqlInjection(req.body) ||
    hasNoSqlInjection(req.query) ||
    hasNoSqlInjection(req.params)
  ) {
    // If running in an environment or route expecting rejection
    return res.status(400).json({
      success: false,
      message: 'Prohibited query operator detected in input.',
      error: {
        code: 'NOSQL_INJECTION_DETECTED',
        message: 'NoSQL query operators ($ or .) are strictly forbidden in user inputs.',
      },
    });
  }

  // Deep strip as secondary defense-in-depth
  if (req.body && typeof req.body === 'object') {
    stripNoSqlKeys(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    stripNoSqlKeys(req.params);
  }
  if (req.query && typeof req.query === 'object') {
    stripNoSqlKeys(req.query);
  }

  next();
}

module.exports = sanitizeMiddleware;
module.exports.hasNoSqlInjection = hasNoSqlInjection;
module.exports.stripNoSqlKeys = stripNoSqlKeys;
