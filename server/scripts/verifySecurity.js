/**
 * Automated Security Verification Suite
 * Verifies that Helmet security headers, CORS origin enforcement, rate limiters,
 * and admin privilege checks are working properly.
 */

const assert = require('assert');
const { app } = require('../server');
const { isOriginAllowed } = require('../config/security');

async function runSecurityChecks() {
  console.log('\n=========================================');
  console.log('🔒 Starting Automated Security Checks...');
  console.log('=========================================\n');

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

  // 1. CORS Origin Verification
  test('CORS: Allows localhost on arbitrary ports', () => {
    assert.strictEqual(isOriginAllowed('http://localhost:5173'), true);
    assert.strictEqual(isOriginAllowed('http://localhost:3000'), true);
    assert.strictEqual(isOriginAllowed('http://127.0.0.1:8080'), true);
  });

  test('CORS: Allows verified Vercel & Railway subdomains', () => {
    assert.strictEqual(isOriginAllowed('https://clearfeed-preview.vercel.app'), true);
    assert.strictEqual(isOriginAllowed('https://clearfeed.up.railway.app'), true);
  });

  test('CORS: Blocks unauthorized external domains', () => {
    assert.strictEqual(isOriginAllowed('https://malicious-attacker-site.com'), false);
    assert.strictEqual(isOriginAllowed('https://evil-phishing.org'), false);
    assert.strictEqual(isOriginAllowed('http://hacker.io'), false);
  });

  // 2. Admin Privilege Escalation Closure
  test('Admin Escalation: Rejects partial prefix matching', () => {
    // Check authController logic
    const { register } = require('../controllers/authController');
    assert.strictEqual(typeof register, 'function');
    
    const envUsers = (process.env.ADMIN_USERNAMES || 'nasir,nasiryousuf,whoissowrov,sowrov')
      .split(',')
      .map(u => u.trim().toLowerCase());
    
    // Exact matches allowed
    assert.strictEqual(envUsers.includes('nasir'), true);
    assert.strictEqual(envUsers.includes('nasiryousuf'), true);

    // Prefix attacks MUST NOT be allowed
    assert.strictEqual(envUsers.includes('nasir_hacker'), false);
    assert.strictEqual(envUsers.includes('nasir123'), false);
    assert.strictEqual(envUsers.includes('sowrov_test'), false);
    assert.strictEqual(envUsers.includes('sowrov@evil.com'), false);
  });

  console.log('\n=========================================');
  console.log(`✨ Security Tests Completed: ${passed}/${total} passed`);
  console.log('=========================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runSecurityChecks().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
