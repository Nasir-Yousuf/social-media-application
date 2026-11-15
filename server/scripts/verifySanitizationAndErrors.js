/**
 * Automated NoSQL Sanitization & Error Handling Verification Suite
 * Verifies that:
 * 1. Prohibited NoSQL query operators ({ "$gt": "" }, etc.) are rejected with 400 Bad Request.
 * 2. Deep recursive stripping eliminates '$' and '.' keys while preserving normal string content ($100).
 * 3. Centralized errorHandler formats AppError, Mongoose validation, duplicate keys, and JWT errors.
 */

const assert = require('assert');
const sanitizeMiddleware = require('../middleware/mongoSanitize');
const { hasNoSqlInjection, stripNoSqlKeys } = sanitizeMiddleware;
const errorHandler = require('../middleware/errorHandler');
const AppError = require('../utils/AppError');

function runSanitizationAndErrorTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting NoSQL Sanitization & Error Handling Checks...');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`       ${err.message}`);
    }
  }

  // --- 1. NoSQL Injection Detection & Rejection ---
  test('NoSQL Sanitizer: Detects {"$gt": ""} query operator in login payload', () => {
    const maliciousLogin = {
      username: { $gt: '' },
      password: 'password123',
    };
    assert.strictEqual(hasNoSqlInjection(maliciousLogin), true);
  });

  test('NoSQL Sanitizer: Detects {"$ne": null} in search query parameters', () => {
    const maliciousQuery = {
      q: { $ne: null },
    };
    assert.strictEqual(hasNoSqlInjection(maliciousQuery), true);
  });

  test('NoSQL Sanitizer: Detects dot-notation path injection {"user.role": "admin"}', () => {
    const dotPayload = {
      'user.role': 'admin',
    };
    assert.strictEqual(hasNoSqlInjection(dotPayload), true);
  });

  test('NoSQL Sanitizer: Middleware rejects malicious login payload with 400 and NOSQL_INJECTION_DETECTED', () => {
    let statusSent = null;
    let jsonSent = null;

    const req = {
      body: { username: { $gt: '' }, password: 'secretpassword' },
      query: {},
      params: {},
    };

    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(payload) {
        jsonSent = payload;
        return this;
      },
    };

    let nextCalled = false;
    sanitizeMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, 'Middleware should not have called next() for malicious payload');
    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(jsonSent.error.code, 'NOSQL_INJECTION_DETECTED');
  });

  test('NoSQL Sanitizer: Allows legitimate strings containing "$" characters ($100, $HOME)', () => {
    const legitimatePayload = {
      content: 'I bought a monitor for $150 and wrote $variable in bash.',
      codeSnippet: {
        code: 'const $selector = $("#app");\nreturn $selector;',
        title: 'jQuery $ helper',
      },
    };

    assert.strictEqual(hasNoSqlInjection(legitimatePayload), false);

    let nextCalled = false;
    const req = { body: legitimatePayload, query: { q: '$50' }, params: {} };
    const res = {
      status() { return this; },
      json() { return this; },
    };

    sanitizeMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, 'Legitimate strings with $ must pass without rejection');
    assert.strictEqual(req.body.content, 'I bought a monitor for $150 and wrote $variable in bash.');
  });

  test('NoSQL Sanitizer: Recursive key stripper removes $ and . keys from deep objects', () => {
    const deeplyNested = {
      safe: 'value',
      nested: {
        $where: 'sleep(5000)',
        'dangerous.key': 'exploit',
        clean: 42,
      },
    };

    stripNoSqlKeys(deeplyNested);
    assert.strictEqual(deeplyNested.safe, 'value');
    assert.strictEqual(deeplyNested.nested.clean, 42);
    assert.strictEqual(deeplyNested.nested.$where, undefined);
    assert.strictEqual(deeplyNested.nested['dangerous.key'], undefined);
  });

  // --- 2. Centralized Error Handler ---
  test('Error Handler: Formats custom AppError with statusCode, code, and details', () => {
    const error = new AppError('Resource limit exceeded.', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter: 60 });
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(payload) {
        jsonSent = payload;
        return this;
      },
    };

    errorHandler(error, { method: 'POST', originalUrl: '/api/posts' }, res, () => {});

    assert.strictEqual(statusSent, 429);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(jsonSent.error.code, 'RATE_LIMIT_EXCEEDED');
    assert.strictEqual(jsonSent.error.message, 'Resource limit exceeded.');
    assert.strictEqual(jsonSent.error.details.retryAfter, 60);
  });

  test('Error Handler: Formats Mongoose ValidationError into 400 VALIDATION_ERROR', () => {
    const mongooseValidationError = {
      name: 'ValidationError',
      errors: {
        username: { message: 'Username is required' },
        email: { message: 'Email must be a valid email address' },
      },
    };

    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(payload) {
        jsonSent = payload;
        return this;
      },
    };

    errorHandler(mongooseValidationError, { method: 'POST', originalUrl: '/api/auth/register' }, res, () => {});

    assert.strictEqual(statusSent, 400);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(jsonSent.error.code, 'VALIDATION_ERROR');
    assert.strictEqual(jsonSent.error.details.username, 'Username is required');
    assert.strictEqual(jsonSent.error.details.email, 'Email must be a valid email address');
  });

  test('Error Handler: Formats MongoDB code 11000 duplicate key into 409 DUPLICATE_KEY', () => {
    const duplicateKeyError = {
      code: 11000,
      name: 'MongoServerError',
      keyValue: { username: 'johndoe' },
    };

    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(payload) {
        jsonSent = payload;
        return this;
      },
    };

    errorHandler(duplicateKeyError, { method: 'POST', originalUrl: '/api/auth/register' }, res, () => {});

    assert.strictEqual(statusSent, 409);
    assert.strictEqual(jsonSent.success, false);
    assert.strictEqual(jsonSent.error.code, 'DUPLICATE_KEY');
    assert.strictEqual(jsonSent.error.details.username, 'johndoe');
  });

  test('Error Handler: Formats JWT JsonWebTokenError and TokenExpiredError into 401', () => {
    const jwtInvalid = { name: 'JsonWebTokenError', message: 'invalid signature' };
    const jwtExpired = { name: 'TokenExpiredError', message: 'jwt expired' };

    let resInvalidCode, resInvalidPayload;
    const res1 = {
      status(c) { resInvalidCode = c; return this; },
      json(p) { resInvalidPayload = p; return this; },
    };

    let resExpiredCode, resExpiredPayload;
    const res2 = {
      status(c) { resExpiredCode = c; return this; },
      json(p) { resExpiredPayload = p; return this; },
    };

    errorHandler(jwtInvalid, { method: 'GET', originalUrl: '/api/users/me' }, res1, () => {});
    errorHandler(jwtExpired, { method: 'GET', originalUrl: '/api/posts/feed' }, res2, () => {});

    assert.strictEqual(resInvalidCode, 401);
    assert.strictEqual(resInvalidPayload.error.code, 'INVALID_TOKEN');

    assert.strictEqual(resExpiredCode, 401);
    assert.strictEqual(resExpiredPayload.error.code, 'TOKEN_EXPIRED');
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} checks passed.`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runSanitizationAndErrorTests();
}

module.exports = runSanitizationAndErrorTests;
