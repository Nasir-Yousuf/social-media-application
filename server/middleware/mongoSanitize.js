const mongoSanitize = require('express-mongo-sanitize');

/**
 * Express 5 compatible middleware to prevent NoSQL query injection.
 * Safely sanitizes req.body, req.params, and mutates req.query in-place
 * avoiding Express 5's getter-only req.query limitation.
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    mongoSanitize.sanitize(req.params);
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
        const cleanKey = key.replace(/^\$|\./g, '_');
        req.query[cleanKey] = req.query[key];
        delete req.query[key];
      }
      if (req.query[key] && typeof req.query[key] === 'object') {
        mongoSanitize.sanitize(req.query[key]);
      }
    }
  }
  next();
};

module.exports = sanitizeMiddleware;
