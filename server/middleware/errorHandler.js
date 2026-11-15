const AppError = require('../utils/AppError');

/**
 * Formats Mongoose validation errors into structured details
 */
function formatMongooseValidationError(err) {
  const details = {};
  if (err.errors) {
    for (const key of Object.keys(err.errors)) {
      details[key] = err.errors[key].message;
    }
  }
  return details;
}

/**
 * Centralized Error Handling Middleware for Clearfeed API
 * Formats all operational errors, database errors, and validation errors
 * into a standardized JSON envelope: { success: false, message, error: { code, message, details } }
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred.';
  let details = err.details || null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    details = formatMongooseValidationError(err);
    message = Object.values(details).join('; ') || 'Database validation failed.';
  }
  // Handle Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path || 'identifier'}: ${err.value}`;
  }
  // Handle MongoDB Duplicate Key (code 11000)
  else if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const fields = Object.keys(err.keyValue || {});
    message = fields.length > 0
      ? `Duplicate entry detected for: ${fields.join(', ')}.`
      : 'A duplicate record already exists.';
    details = err.keyValue || null;
  }
  // Handle JWT Verification Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired.';
  }
  // Handle Express SyntaxError (JSON parse failure)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Malformed JSON payload received.';
  }
  // Handle Payload Too Large
  else if (err.type === 'entity.too.large') {
    statusCode = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request entity too large.';
  }

  // Hide internal server error stack details in production
  const isDev = process.env.NODE_ENV === 'development';
  if (statusCode >= 500 && !err.isOperational && !isDev) {
    message = 'Internal Server Error';
  }

  // Log 5xx errors for diagnosis
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${statusCode} [${code}]:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      message,
      details,
    },
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
