/**
 * Automated Proxy Security & Header Spoofing Verification Suite
 * Verifies that Express trust proxy and ipUtils properly reject spoofed
 * X-Forwarded-For headers according to TRUST_PROXY_HOPS.
 */

const assert = require('assert');
const express = require('express');
const { getClientIp, cleanIp } = require('../utils/ipUtils');
const { validateEnvironment } = require('../config/envValidator');
const { isOriginAllowed } = require('../config/security');

function runProxySecurityTests() {
  console.log('\n======================================================');
  console.log('🛡️  Starting Proxy Security & Header Spoofing Checks...');
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

  // 1. Windows Tauri and Android Mobile CORS Permissions
  test('CORS: Allows Windows Tauri custom origins', () => {
    assert.strictEqual(isOriginAllowed('http://tauri.localhost'), true);
    assert.strictEqual(isOriginAllowed('https://tauri.localhost'), true);
    assert.strictEqual(isOriginAllowed('tauri://localhost'), true);
  });

  test('CORS: Allows Android emulator (10.0.2.2) and local LAN IPs', () => {
    assert.strictEqual(isOriginAllowed('http://10.0.2.2:5180'), true);
    assert.strictEqual(isOriginAllowed('http://192.168.1.50:5173'), true);
    assert.strictEqual(isOriginAllowed('http://10.0.0.15:5180'), true);
    assert.strictEqual(isOriginAllowed(null), true);
    assert.strictEqual(isOriginAllowed(undefined), true);
  });

  // 2. TRUST_PROXY_HOPS = 1: Single Reverse Proxy (Railway / Vercel Edge)
  test('Proxy Security: TRUST_PROXY_HOPS=1 rejects spoofed client IP prepended to header', () => {
    const app = express();
    app.set('trust proxy', 1);

    // Simulated request:
    // Attacker at 203.0.113.50 connects to Reverse Proxy at 198.51.100.1
    // Attacker forged "X-Forwarded-For: 1.1.1.1" (pretending to be Cloudflare or Admin)
    // Reverse proxy appends attacker's real IP: "1.1.1.1, 203.0.113.50"
    const req = {
      headers: {
        'x-forwarded-for': '1.1.1.1, 203.0.113.50',
      },
      connection: { remoteAddress: '198.51.100.1' },
      socket: { remoteAddress: '198.51.100.1' },
    };

    // Express builds req.ip via proxy-addr
    const trustFn = app.get('trust proxy fn');
    const proxyaddr = require('proxy-addr');
    req.ip = proxyaddr(req, trustFn);

    // The genuine client IP is 203.0.113.50; 1.1.1.1 is untrusted spoofed payload
    assert.strictEqual(req.ip, '203.0.113.50', 'req.ip should be 203.0.113.50 (ignoring spoofed 1.1.1.1)');

    // getClientIp MUST use validated req.ip rather than reading index 0 of raw header
    const resolvedIp = getClientIp(req);
    assert.strictEqual(resolvedIp, '203.0.113.50', 'getClientIp must resolve to real client IP, not spoofed 1.1.1.1');
  });

  // 3. TRUST_PROXY_HOPS = 0: Direct Connection (No trusted proxies)
  test('Proxy Security: TRUST_PROXY_HOPS=0 completely ignores X-Forwarded-For', () => {
    const app = express();
    app.set('trust proxy', 0);

    const req = {
      headers: {
        'x-forwarded-for': '198.51.100.99, 10.0.0.1',
      },
      connection: { remoteAddress: '203.0.113.77' },
      socket: { remoteAddress: '203.0.113.77' },
    };

    const trustFn = app.get('trust proxy fn');
    const proxyaddr = require('proxy-addr');
    req.ip = proxyaddr(req, trustFn);

    // When 0 hops are trusted, req.ip must strictly be socket.remoteAddress
    assert.strictEqual(req.ip, '203.0.113.77');
    assert.strictEqual(getClientIp(req), '203.0.113.77');
  });

  // 4. CleanIp normalization
  test('IP Utility: Correctly normalizes IPv4-mapped IPv6 and localhost', () => {
    assert.strictEqual(cleanIp('::ffff:192.168.1.1'), '192.168.1.1');
    assert.strictEqual(cleanIp('::1'), '127.0.0.1 (Localhost)');
    assert.strictEqual(cleanIp(null), 'Unknown');
  });

  // 5. Environment Validator Unit Checks
  test('Env Validator: Defaults TRUST_PROXY_HOPS to 1 when unset', () => {
    const prev = process.env.TRUST_PROXY_HOPS;
    delete process.env.TRUST_PROXY_HOPS;
    const config = validateEnvironment();
    assert.strictEqual(config.trustProxyHops, 1);
    if (prev !== undefined) process.env.TRUST_PROXY_HOPS = prev;
  });

  test('Env Validator: Parses custom TRUST_PROXY_HOPS properly', () => {
    const prev = process.env.TRUST_PROXY_HOPS;
    process.env.TRUST_PROXY_HOPS = '2';
    const config = validateEnvironment();
    assert.strictEqual(config.trustProxyHops, 2);
    if (prev !== undefined) process.env.TRUST_PROXY_HOPS = prev;
    else delete process.env.TRUST_PROXY_HOPS;
  });

  console.log('\n======================================================');
  console.log(`✨ Proxy Security Tests Completed: ${passed}/${total} passed`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runProxySecurityTests();
}

module.exports = { runProxySecurityTests };
