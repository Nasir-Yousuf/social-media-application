/**
 * Verification Test Suite for Unified Cross-Platform API Client SDK
 * Verifies storage adapters, auto auth header injection, retry backoff, and refresh queue.
 */

const assert = require('assert');
const {
  ClearfeedApiClient,
  MemoryStorageAdapter,
  CustomStorageAdapter,
  isValidUserSummary,
  SOCKET_EVENTS,
} = require('../dist/index.js');

async function runClientSdkTests() {
  console.log('\n======================================================');
  console.log('🌐 Starting Unified Client SDK Verification Checks...');
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

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`       ${err.message}`);
    }
  }

  // 1. Storage Adapters
  await testAsync('Storage Adapters: MemoryStorageAdapter stores and clears tokens', async () => {
    const memory = new MemoryStorageAdapter();
    assert.strictEqual(await memory.getToken(), null);
    await memory.setToken('jwt-access-token');
    await memory.setRefreshToken('jwt-refresh-token');
    assert.strictEqual(await memory.getToken(), 'jwt-access-token');
    assert.strictEqual(await memory.getRefreshToken(), 'jwt-refresh-token');
    await memory.clearTokens();
    assert.strictEqual(await memory.getToken(), null);
    assert.strictEqual(await memory.getRefreshToken(), null);
  });

  await testAsync('Storage Adapters: CustomStorageAdapter wraps async key-value store (Android/Tauri)', async () => {
    const fakeSecureStore = new Map();
    const adapter = new CustomStorageAdapter({
      getToken: async () => fakeSecureStore.get('auth_token') || null,
      setToken: async (t) => { fakeSecureStore.set('auth_token', t); },
      getRefreshToken: async () => fakeSecureStore.get('refresh_token') || null,
      setRefreshToken: async (rt) => { fakeSecureStore.set('refresh_token', rt); },
      clearTokens: async () => { fakeSecureStore.clear(); },
    });

    await adapter.setToken('android-keystore-token');
    assert.strictEqual(await adapter.getToken(), 'android-keystore-token');
    await adapter.clearTokens();
    assert.strictEqual(await adapter.getToken(), null);
  });

  // 2. Auth Header Injection & URL Parameter Serializing
  await testAsync('API Client: Automatically injects Authorization header and query params', async () => {
    const storage = new MemoryStorageAdapter('active-user-jwt');
    const originalFetch = global.fetch;

    let interceptedUrl = null;
    let interceptedHeaders = null;

    global.fetch = async (url, options) => {
      interceptedUrl = url;
      interceptedHeaders = options.headers;
      return new Response(JSON.stringify({ success: true, data: { status: 'healthy' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const client = new ClearfeedApiClient({
        baseUrl: 'https://api.clearfeed.app',
        storageAdapter: storage,
      });

      const res = await client.get('/health', {
        params: { version: '2.2', limit: 10 },
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(interceptedUrl, 'https://api.clearfeed.app/health?version=2.2&limit=10');
      assert.strictEqual(interceptedHeaders['Authorization'], 'Bearer active-user-jwt');
    } finally {
      global.fetch = originalFetch;
    }
  });

  // 3. Retry with Exponential Backoff for GET
  await testAsync('API Client: Retries failed GET requests with exponential backoff', async () => {
    const originalFetch = global.fetch;
    let attempts = 0;

    global.fetch = async () => {
      attempts++;
      if (attempts < 3) {
        // Fail twice with 503 Service Unavailable
        return new Response(JSON.stringify({ message: 'Service Unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Succeed on 3rd attempt
      return new Response(JSON.stringify({ success: true, data: { ok: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const client = new ClearfeedApiClient({
        baseUrl: 'https://api.clearfeed.app',
        maxRetries: 3,
        retryDelayMs: 20, // fast retry for test
      });

      const res = await client.get('/posts/feed');
      assert.strictEqual(res.success, true);
      assert.strictEqual(attempts, 3, 'Should have retried exactly twice before succeeding');
    } finally {
      global.fetch = originalFetch;
    }
  });

  // 4. Token Refresh Queueing during 401
  await testAsync('API Client: Queues concurrent requests during 401 token refresh and replays', async () => {
    const originalFetch = global.fetch;
    const storage = new MemoryStorageAdapter('expired-token');

    let fetchCount = 0;
    let refreshCount = 0;

    global.fetch = async (url, options) => {
      fetchCount++;
      const authHeader = options.headers['Authorization'];
      if (authHeader === 'Bearer expired-token') {
        return new Response(JSON.stringify({ error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (authHeader === 'Bearer fresh-renewed-token') {
        return new Response(JSON.stringify({ success: true, data: { endpoint: url } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Unexpected auth header: ${authHeader}`);
    };

    try {
      const client = new ClearfeedApiClient({
        baseUrl: 'https://api.clearfeed.app',
        storageAdapter: storage,
        maxRetries: 0,
        onTokenExpired: async () => {
          refreshCount++;
          // Simulate network latency for refresh
          await new Promise((r) => setTimeout(r, 50));
          return 'fresh-renewed-token';
        },
      });

      // Fire 3 concurrent requests simultaneously
      const [res1, res2, res3] = await Promise.all([
        client.get('/users/me'),
        client.get('/notifications'),
        client.get('/conversations'),
      ]);

      assert.strictEqual(res1.success, true);
      assert.strictEqual(res2.success, true);
      assert.strictEqual(res3.success, true);
      assert.strictEqual(refreshCount, 1, 'Token refresh must only be triggered once for all concurrent requests');
      assert.strictEqual(await storage.getToken(), 'fresh-renewed-token');
    } finally {
      global.fetch = originalFetch;
    }
  });

  // 5. Shared Package Integration Verification
  test('Shared Package: Canonical exports and validators are functional', () => {
    assert.strictEqual(typeof SOCKET_EVENTS.MESSAGE_SEND, 'string');
    assert.strictEqual(typeof SOCKET_EVENTS.SPACE_JOIN, 'string');

    const validUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Elena Rostova',
      username: 'elena_r',
      role: 'developer',
    };
    assert.strictEqual(isValidUserSummary(validUser), true);
    assert.strictEqual(isValidUserSummary({ name: 123 }), false);
  });

  console.log('\n======================================================');
  console.log(`Results: ${passed}/${total} checks passed.`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runClientSdkTests();
}

module.exports = runClientSdkTests;
