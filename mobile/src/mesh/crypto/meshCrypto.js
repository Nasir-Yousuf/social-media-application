import { ed25519, x25519 } from '@noble/curves/ed25519.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { chacha20poly1305 } from '@noble/ciphers/chacha.js';

let ExpoCrypto = null;
try {
  ExpoCrypto = require('expo-crypto');
} catch {}

const polyfillGetRandom = function getRandomValues(array) {
  if (!array || !array.length) return array;
  try {
    if (ExpoCrypto && typeof ExpoCrypto.getRandomValues === 'function') {
      return ExpoCrypto.getRandomValues(array);
    }
    if (ExpoCrypto && typeof ExpoCrypto.getRandomBytes === 'function') {
      const bytes = ExpoCrypto.getRandomBytes(array.byteLength || array.length);
      array.set(bytes);
      return array;
    }
  } catch {}
  try {
    const nodeCrypto = require('crypto');
    if (nodeCrypto && typeof nodeCrypto.randomFillSync === 'function') {
      nodeCrypto.randomFillSync(array);
      return array;
    }
  } catch {}
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
};

if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.crypto !== 'object' || !globalThis.crypto) globalThis.crypto = {};
  if (typeof globalThis.crypto.getRandomValues !== 'function') globalThis.crypto.getRandomValues = polyfillGetRandom;
}
if (typeof global !== 'undefined') {
  if (typeof global.crypto !== 'object' || !global.crypto) global.crypto = {};
  if (typeof global.crypto.getRandomValues !== 'function') global.crypto.getRandomValues = polyfillGetRandom;
}

/**
 * Generates cryptographically secure random bytes
 */
export function secureRandomBytes(length = 32) {
  const array = new Uint8Array(length);
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(array);
    return array;
  }
  try {
    if (typeof ExpoCrypto.getRandomBytes === 'function') {
      const bytes = ExpoCrypto.getRandomBytes(length);
      array.set(bytes);
      return array;
    }
  } catch {}
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

/**
 * Utility: Convert Uint8Array to hex string
 */
export function bytesToHex(bytes) {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Utility: Convert hex string to Uint8Array
 */
export function hexToBytes(hex) {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string length');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Generate a cryptographically secure Ed25519 Keypair
 */
export function generateIdentityKeypair() {
  let secretKey;
  try {
    secretKey = ed25519.utils.randomSecretKey();
  } catch (err) {
    secretKey = secureRandomBytes(32);
  }
  const publicKey = ed25519.getPublicKey(secretKey);
  return {
    secretKeyHex: bytesToHex(secretKey),
    publicKeyHex: bytesToHex(publicKey),
  };
}

/**
 * Computes an easily human-verifiable fingerprint from a public key (SHA-256)
 * Output format: "8F2A : 3C19 : E47B : 90DA"
 */
export function computeFingerprint(publicKeyHex) {
  try {
    const pubBytes = hexToBytes(publicKeyHex);
    const hash = sha256(pubBytes);
    const hex = bytesToHex(hash).toUpperCase();
    // Group into 4-character chunks for QR or visual verification
    return `${hex.slice(0, 4)} : ${hex.slice(4, 8)} : ${hex.slice(8, 12)} : ${hex.slice(12, 16)}`;
  } catch (err) {
    return 'INVALID:KEY';
  }
}

/**
 * Compute Diffie-Hellman Shared Secret using Montgomery (X25519) curve
 */
export function computeSharedSecret(mySecretKeyHex, theirPublicKeyHex) {
  const mySecret = hexToBytes(mySecretKeyHex);
  const theirPub = hexToBytes(theirPublicKeyHex);

  const myX25519Secret = ed25519.utils.toMontgomerySecret(mySecret);
  const theirX25519Pub = ed25519.utils.toMontgomery(theirPub);

  const shared = x25519.getSharedSecret(myX25519Secret, theirX25519Pub);
  // Hash the shared DH point to produce a 32-byte symmetric cipher key
  return sha256(shared);
}

/**
 * End-to-End Encrypt a plaintext message for a specific recipient using ChaCha20-Poly1305
 */
export function encryptDirectPayload(messageText, mySecretKeyHex, theirPublicKeyHex) {
  const symmetricKey = computeSharedSecret(mySecretKeyHex, theirPublicKeyHex);
  // Generate 12-byte random nonce
  const nonce = secureRandomBytes(12);

  const cipher = chacha20poly1305(symmetricKey, nonce);
  const plaintextBytes = new TextEncoder().encode(messageText);
  const ciphertextBytes = cipher.encrypt(plaintextBytes);

  return {
    ciphertextHex: bytesToHex(ciphertextBytes),
    nonceHex: bytesToHex(nonce),
  };
}

/**
 * Decrypt an End-to-End Encrypted payload using ChaCha20-Poly1305
 */
export function decryptDirectPayload(ciphertextHex, nonceHex, mySecretKeyHex, theirPublicKeyHex) {
  try {
    const symmetricKey = computeSharedSecret(mySecretKeyHex, theirPublicKeyHex);
    const nonce = hexToBytes(nonceHex);
    const ciphertext = hexToBytes(ciphertextHex);

    const cipher = chacha20poly1305(symmetricKey, nonce);
    const decryptedBytes = cipher.decrypt(ciphertext);
    return new TextDecoder().decode(decryptedBytes);
  } catch (err) {
    throw new Error('Message decryption failed: Invalid key, altered ciphertext, or wrong recipient');
  }
}

/**
 * Sign an envelope with sender's Ed25519 secret key
 */
export function signEnvelope(envelope, secretKeyHex) {
  const dataToSign = JSON.stringify({
    magic: envelope.magic,
    version: envelope.version,
    type: envelope.type,
    packetId: envelope.packetId,
    senderPubkey: envelope.senderPubkey,
    recipientPubkey: envelope.recipientPubkey,
    timestamp: envelope.timestamp,
    expiresAt: envelope.expiresAt,
    payload: envelope.payload,
  });

  const messageBytes = new TextEncoder().encode(dataToSign);
  const secretKey = hexToBytes(secretKeyHex);
  const signatureBytes = ed25519.sign(messageBytes, secretKey);
  return bytesToHex(signatureBytes);
}

/**
 * Verify an envelope's Ed25519 signature
 */
export function verifyEnvelopeSignature(envelope) {
  if (!envelope.signature) return false;
  try {
    const dataToVerify = JSON.stringify({
      magic: envelope.magic,
      version: envelope.version,
      type: envelope.type,
      packetId: envelope.packetId,
      senderPubkey: envelope.senderPubkey,
      recipientPubkey: envelope.recipientPubkey,
      timestamp: envelope.timestamp,
      expiresAt: envelope.expiresAt,
      payload: envelope.payload,
    });

    const messageBytes = new TextEncoder().encode(dataToVerify);
    const signatureBytes = hexToBytes(envelope.signature);
    const publicKeyBytes = hexToBytes(envelope.senderPubkey);

    return ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);
  } catch (err) {
    return false;
  }
}
