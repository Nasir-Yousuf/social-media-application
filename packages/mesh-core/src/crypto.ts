/**
 * Clearfeed Mesh (CFM1) Cryptographic Core
 * Implements Ed25519, X25519, ChaCha20-Poly1305, SHA-256, HKDF, and Safety Numbers.
 */

import { ed25519, x25519 } from '@noble/curves/ed25519';
import { chacha20poly1305 } from '@noble/ciphers/chacha';
import { sha256 } from '@noble/hashes/sha256';
import { hkdf } from '@noble/hashes/hkdf';

export { ed25519, x25519, chacha20poly1305, sha256, hkdf };
import {
  DirectionalSessionKeys,
  EphemeralSessionKeypair,
  SafetyNumber,
  CFM1Frame,
} from './types.js';
import { getImmutableSigningData } from './wire.js';
import { POLY1305_TAG_SIZE, ED25519_SIG_SIZE } from './constants.js';

/**
 * CSPRNG bytes generator safe across Browser, Node, and React Native
 */
export function secureRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const g = globalThis as any;
  if (g && g.crypto && typeof g.crypto.getRandomValues === 'function') {
    g.crypto.getRandomValues(bytes);
    return bytes;
  }
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

/**
 * Utility: bytes to hex
 */
export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Utility: hex to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim().toLowerCase();
  if (cleanHex.length % 2 !== 0) {
    throw new Error(`Invalid hex length: ${cleanHex.length}`);
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byteVal = parseInt(cleanHex.substr(i * 2, 2), 16);
    if (isNaN(byteVal)) {
      throw new Error(`Invalid hex character at index ${i * 2}`);
    }
    bytes[i] = byteVal;
  }
  return bytes;
}

/**
 * Compares two Uint8Arrays lexicographically
 * Returns -1 if a < b, 1 if a > b, 0 if a === b
 */
export function compareBytes(a: Uint8Array, b: Uint8Array): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  if (a.length < b.length) return -1;
  if (a.length > b.length) return 1;
  return 0;
}

/**
 * Generate an Ed25519 identity keypair
 */
export function generateIdentityKeypair(): {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
  publicKeyHex: string;
} {
  const secretKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(secretKey);
  return {
    secretKey,
    publicKey,
    publicKeyHex: bytesToHex(publicKey),
  };
}

/**
 * Generate an ephemeral X25519 keypair for session handshakes
 */
export function generateEphemeralX25519(): EphemeralSessionKeypair {
  const secretKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(secretKey);
  return { secretKey, publicKey };
}

/**
 * Signs the canonical immutable fields of a CFM1 frame using Ed25519.
 * Note: TTL and HopCount are omitted so intermediate relays can modify them without breaking the signature.
 */
export function signFrame(secretKey: Uint8Array, frame: CFM1Frame): Uint8Array {
  const dataToSign = getImmutableSigningData(frame);
  return ed25519.sign(dataToSign, secretKey);
}

/**
 * Verifies the Ed25519 signature of a CFM1 frame against the immutable fields
 */
export function verifyFrameSignature(frame: CFM1Frame): boolean {
  if (!frame.signature || frame.signature.length !== ED25519_SIG_SIZE) {
    return false;
  }
  try {
    const dataToVerify = getImmutableSigningData(frame);
    return ed25519.verify(frame.signature, dataToVerify, frame.senderPubkey);
  } catch {
    return false;
  }
}

/**
 * Compute SHA-256 hash
 */
export function computeSha256(data: Uint8Array): Uint8Array {
  return sha256(data);
}

/**
 * Encrypt plaintext using ChaCha20-Poly1305 AEAD.
 * Returns separated ciphertext (N bytes) and Poly1305 authentication tag (16 bytes).
 */
export function encryptChaCha20Poly1305(
  key: Uint8Array,
  plaintext: Uint8Array,
  nonce: Uint8Array
): { ciphertext: Uint8Array; tag: Uint8Array } {
  if (key.length !== 32) throw new Error('ChaCha20 key must be 32 bytes');
  if (nonce.length !== 12) throw new Error('ChaCha20 nonce must be 12 bytes');

  const cipher = chacha20poly1305(key, nonce);
  const encryptedCombined = cipher.encrypt(plaintext);

  // @noble/ciphers appends the 16-byte Poly1305 tag at the end of the ciphertext
  const ciphertextLen = encryptedCombined.length - POLY1305_TAG_SIZE;
  const ciphertext = encryptedCombined.slice(0, ciphertextLen);
  const tag = encryptedCombined.slice(ciphertextLen);

  return { ciphertext, tag };
}

/**
 * Decrypt ciphertext using ChaCha20-Poly1305 AEAD.
 * Verifies the 16-byte Poly1305 tag; throws error if tampered or invalid key/nonce.
 */
export function decryptChaCha20Poly1305(
  key: Uint8Array,
  ciphertext: Uint8Array,
  tag: Uint8Array,
  nonce: Uint8Array
): Uint8Array {
  if (key.length !== 32) throw new Error('ChaCha20 key must be 32 bytes');
  if (nonce.length !== 12) throw new Error('ChaCha20 nonce must be 12 bytes');
  if (tag.length !== POLY1305_TAG_SIZE) throw new Error('Poly1305 tag must be 16 bytes');

  const cipher = chacha20poly1305(key, nonce);
  const combined = new Uint8Array(ciphertext.length + POLY1305_TAG_SIZE);
  combined.set(ciphertext, 0);
  combined.set(tag, ciphertext.length);

  return cipher.decrypt(combined);
}

/**
 * Derives directional session keys between two peers using Ephemeral X25519 ECDH + HKDF-SHA256.
 * Both peers arrive at the exact same directional keys:
 * initiatorToResponderKey and responderToInitiatorKey.
 */
export function deriveDirectionalSessionKeys(
  myEphemeralSecret: Uint8Array,
  theirEphemeralPub: Uint8Array,
  initiatorEd25519Pub: Uint8Array,
  responderEd25519Pub: Uint8Array
): DirectionalSessionKeys {
  if (myEphemeralSecret.length !== 32) throw new Error('Ephemeral secret must be 32 bytes');
  if (theirEphemeralPub.length !== 32) throw new Error('Ephemeral public key must be 32 bytes');
  if (initiatorEd25519Pub.length !== 32) throw new Error('Initiator public key must be 32 bytes');
  if (responderEd25519Pub.length !== 32) throw new Error('Responder public key must be 32 bytes');

  // 1. Compute shared ECDH secret via X25519
  const sharedSecret = x25519.getSharedSecret(myEphemeralSecret, theirEphemeralPub);

  // 2. Salt from lexicographically sorted Ed25519 identity keys
  const sortOrder = compareBytes(initiatorEd25519Pub, responderEd25519Pub);
  const salt = new Uint8Array(64);
  if (sortOrder <= 0) {
    salt.set(initiatorEd25519Pub, 0);
    salt.set(responderEd25519Pub, 32);
  } else {
    salt.set(responderEd25519Pub, 0);
    salt.set(initiatorEd25519Pub, 32);
  }

  // 3. HKDF-Expand 64 bytes: 32 bytes for A->B, 32 bytes for B->A
  const info = new TextEncoder().encode('CFM1-DIRECTIONAL-SESSION-KEYS-V1');
  const derivedKeyMaterial = hkdf(sha256, sharedSecret, salt, info, 64);

  const initiatorToResponderKey = derivedKeyMaterial.slice(0, 32);
  const responderToInitiatorKey = derivedKeyMaterial.slice(32, 64);

  return {
    initiatorToResponderKey,
    responderToInitiatorKey,
    sharedSecret,
  };
}

/**
 * Computes a deterministic 60-digit Safety Number and QR payload for out-of-band verification.
 * Lexicographically orders pubkeys so Alice and Bob always produce the exact same 60 digits.
 */
export function computeSafetyNumber(pubkeyA: Uint8Array, pubkeyB: Uint8Array): SafetyNumber {
  if (pubkeyA.length !== 32 || pubkeyB.length !== 32) {
    throw new Error('Both public keys must be 32 bytes');
  }

  // Lexicographical ordering
  const cmp = compareBytes(pubkeyA, pubkeyB);
  const first = cmp <= 0 ? pubkeyA : pubkeyB;
  const second = cmp <= 0 ? pubkeyB : pubkeyA;

  // Generate 12 5-digit decimal blocks = 60 digits total
  const blocks: string[] = [];
  const baseData = new Uint8Array(65);
  baseData.set(first, 0);
  baseData.set(second, 32);

  for (let i = 0; i < 12; i++) {
    baseData[64] = i;
    const digest = sha256(baseData);
    const view = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
    // Take 4 bytes as Big-Endian uint32
    const num = view.getUint32(0, false) % 100000;
    blocks.push(num.toString().padStart(5, '0'));
  }

  const rawDigits = blocks.join('');
  const formattedBlocks = blocks.join(' ');
  const qrPayload = `cfm1:verify?a=${bytesToHex(first)}&b=${bytesToHex(second)}&sn=${rawDigits}`;

  return {
    rawDigits,
    formattedBlocks,
    qrPayload,
  };
}
