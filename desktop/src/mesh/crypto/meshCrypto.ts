import { ed25519, x25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha2';
import { chacha20poly1305 } from '@noble/ciphers/chacha';

export function secureRandomBytes(length = 32): Uint8Array {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    window.crypto.getRandomValues(array);
    return array;
  }
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string length');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function generateIdentityKeypair(): { publicKeyHex: string; secretKeyHex: string } {
  let secretKey: Uint8Array;
  try {
    secretKey = ed25519.utils.randomSecretKey();
  } catch {
    secretKey = secureRandomBytes(32);
  }
  const publicKey = ed25519.getPublicKey(secretKey);
  return {
    publicKeyHex: bytesToHex(publicKey),
    secretKeyHex: bytesToHex(secretKey),
  };
}

export function computeFingerprint(publicKeyHex: string): string {
  try {
    const pubBytes = hexToBytes(publicKeyHex);
    const hash = sha256(pubBytes);
    const hex = bytesToHex(hash).toUpperCase();
    return `${hex.slice(0, 4)} : ${hex.slice(4, 8)} : ${hex.slice(8, 12)} : ${hex.slice(12, 16)}`;
  } catch {
    return 'INVALID:KEY';
  }
}

export function computeSharedSecret(mySecretKeyHex: string, theirPublicKeyHex: string): Uint8Array {
  const mySecret = hexToBytes(mySecretKeyHex);
  const theirPub = hexToBytes(theirPublicKeyHex);

  const myX25519Secret = ed25519.utils.toMontgomerySecret(mySecret);
  const theirX25519Pub = ed25519.utils.toMontgomery(theirPub);

  const shared = x25519.getSharedSecret(myX25519Secret, theirX25519Pub);
  return sha256(shared);
}

export function encryptPayload(
  senderSecretHex: string,
  recipientPubkeyHex: string,
  plainText: string
): { ciphertextHex: string; nonceHex: string } {
  const symmetricKey = computeSharedSecret(senderSecretHex, recipientPubkeyHex);
  const nonce = secureRandomBytes(12);
  const cipher = chacha20poly1305(symmetricKey, nonce);
  const plaintextBytes = new TextEncoder().encode(plainText);
  const ciphertextBytes = cipher.encrypt(plaintextBytes);

  return {
    ciphertextHex: bytesToHex(ciphertextBytes),
    nonceHex: bytesToHex(nonce),
  };
}

export function decryptPayload(
  recipientSecretHex: string,
  senderPubkeyHex: string,
  ciphertextHex: string,
  nonceHex: string
): string {
  try {
    const symmetricKey = computeSharedSecret(recipientSecretHex, senderPubkeyHex);
    const nonce = hexToBytes(nonceHex);
    const ciphertext = hexToBytes(ciphertextHex);

    const cipher = chacha20poly1305(symmetricKey, nonce);
    const decryptedBytes = cipher.decrypt(ciphertext);
    return new TextDecoder().decode(decryptedBytes);
  } catch {
    throw new Error('Message decryption failed: Invalid key, altered ciphertext, or wrong recipient');
  }
}

export function signPacket(secretKeyHex: string, dataString: string): string {
  const secretKey = hexToBytes(secretKeyHex);
  const dataBytes = new TextEncoder().encode(dataString);
  const sig = ed25519.sign(dataBytes, secretKey);
  return bytesToHex(sig);
}

export function verifyPacketSignature(publicKeyHex: string, dataString: string, signatureHex: string): boolean {
  try {
    const pub = hexToBytes(publicKeyHex);
    const dataBytes = new TextEncoder().encode(dataString);
    const sig = hexToBytes(signatureHex);
    return ed25519.verify(sig, dataBytes, pub);
  } catch {
    return false;
  }
}
