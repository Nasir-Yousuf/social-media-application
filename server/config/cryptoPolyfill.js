/**
 * Global WebCrypto & Node Crypto Polyfill
 * Guarantees that bare `crypto`, `global.crypto`, and `globalThis.crypto`
 * are fully populated with both WebCrypto (.subtle) and Node crypto methods
 * across all Node.js runtimes (Node 16, 18, 20+) and cloud platforms (Railway, Render, Vercel).
 */
const nodeCrypto = require('crypto');
const webCrypto = nodeCrypto.webcrypto || {};

const fullCrypto = Object.assign(Object.create(nodeCrypto), webCrypto);
if (webCrypto.subtle) {
  fullCrypto.subtle = webCrypto.subtle;
}
if (webCrypto.getRandomValues) {
  fullCrypto.getRandomValues = webCrypto.getRandomValues.bind(webCrypto);
}
if (webCrypto.randomUUID) {
  fullCrypto.randomUUID = webCrypto.randomUUID.bind(webCrypto);
}

try {
  global.crypto = fullCrypto;
} catch (e) {}

try {
  globalThis.crypto = fullCrypto;
} catch (e) {}

try {
  Object.defineProperty(global, 'crypto', {
    value: fullCrypto,
    writable: true,
    configurable: true,
    enumerable: true,
  });
} catch (e) {}

try {
  Object.defineProperty(globalThis, 'crypto', {
    value: fullCrypto,
    writable: true,
    configurable: true,
    enumerable: true,
  });
} catch (e) {}

module.exports = fullCrypto;
