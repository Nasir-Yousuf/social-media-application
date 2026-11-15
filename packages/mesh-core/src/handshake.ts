/**
 * Clearfeed Mesh (CFM1) Ephemeral X25519 Session Handshake & Replay Protection
 */

import { ed25519 } from '@noble/curves/ed25519';
import {
  DirectionalSessionKeys,
  EphemeralSessionKeypair,
  HandshakePayload,
  ReplayWindow,
} from './types.js';
import {
  deriveDirectionalSessionKeys,
  generateEphemeralX25519,
  bytesToHex,
} from './crypto.js';

const HANDSHAKE_AUTH_PREFIX = new TextEncoder().encode('CFM1-HANDSHAKE-AUTH-V1');

/**
 * Creates the auth payload bytes for signing a handshake
 */
export function getHandshakeAuthBytes(
  senderEd25519Pub: Uint8Array,
  recipientEd25519Pub: Uint8Array,
  ephemeralPubkey: Uint8Array,
  timestampMs: bigint
): Uint8Array {
  // Prefix (22) + Sender (32) + Recipient (32) + Ephemeral (32) + Timestamp (8) = 126 bytes
  const bytes = new Uint8Array(HANDSHAKE_AUTH_PREFIX.length + 32 + 32 + 32 + 8);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let offset = 0;
  bytes.set(HANDSHAKE_AUTH_PREFIX, offset);
  offset += HANDSHAKE_AUTH_PREFIX.length;

  bytes.set(senderEd25519Pub, offset);
  offset += 32;

  bytes.set(recipientEd25519Pub, offset);
  offset += 32;

  bytes.set(ephemeralPubkey, offset);
  offset += 32;

  view.setBigUint64(offset, timestampMs, false);

  return bytes;
}

/**
 * Initiates an Ephemeral X25519 Handshake signed by the sender's Ed25519 key
 */
export function createHandshakeInitiation(
  senderEd25519Pub: Uint8Array,
  senderEd25519Secret: Uint8Array,
  recipientEd25519Pub: Uint8Array,
  timestampMs?: bigint | number
): {
  handshakePayload: HandshakePayload;
  ephemeralKeypair: EphemeralSessionKeypair;
  payloadBytes: Uint8Array;
} {
  const ephemeralKeypair = generateEphemeralX25519();
  const tsBigInt = typeof timestampMs === 'bigint' ? timestampMs : BigInt(timestampMs || Date.now());

  const authBytes = getHandshakeAuthBytes(
    senderEd25519Pub,
    recipientEd25519Pub,
    ephemeralKeypair.publicKey,
    tsBigInt
  );

  const authSignature = ed25519.sign(authBytes, senderEd25519Secret);

  // Serialize handshake payload into binary: EphemeralPub (32B) || Timestamp (8B) || AuthSig (64B) = 104B
  const payloadBytes = new Uint8Array(32 + 8 + 64);
  const view = new DataView(payloadBytes.buffer, payloadBytes.byteOffset, payloadBytes.byteLength);

  payloadBytes.set(ephemeralKeypair.publicKey, 0);
  view.setBigUint64(32, tsBigInt, false);
  payloadBytes.set(authSignature, 40);

  const handshakePayload: HandshakePayload = {
    ephemeralPubkey: ephemeralKeypair.publicKey,
    timestampMs: tsBigInt,
    authSignature,
  };

  return {
    handshakePayload,
    ephemeralKeypair,
    payloadBytes,
  };
}

/**
 * Deserializes and verifies a HandshakePayload received from a peer
 */
export function verifyAndParseHandshake(
  payloadBytes: Uint8Array,
  senderEd25519Pub: Uint8Array,
  recipientEd25519Pub: Uint8Array
): HandshakePayload {
  if (payloadBytes.length !== 104) {
    throw new Error(`Invalid handshake payload size: expected 104 bytes, got ${payloadBytes.length}`);
  }

  const ephemeralPubkey = payloadBytes.slice(0, 32);
  const view = new DataView(payloadBytes.buffer, payloadBytes.byteOffset, payloadBytes.byteLength);
  const timestampMs = view.getBigUint64(32, false);
  const authSignature = payloadBytes.slice(40, 104);

  const authBytes = getHandshakeAuthBytes(
    senderEd25519Pub,
    recipientEd25519Pub,
    ephemeralPubkey,
    timestampMs
  );

  const isValid = ed25519.verify(authSignature, authBytes, senderEd25519Pub);
  if (!isValid) {
    throw new Error('Handshake signature verification failed: invalid peer credentials');
  }

  return {
    ephemeralPubkey,
    timestampMs,
    authSignature,
  };
}

/**
 * Responds to a Handshake Initiation, deriving directional session keys
 */
export function respondToHandshake(
  initiatorEd25519Pub: Uint8Array,
  initiatorHandshakePayload: HandshakePayload,
  responderEd25519Pub: Uint8Array,
  responderEd25519Secret: Uint8Array
): {
  responsePayload: HandshakePayload;
  responseBytes: Uint8Array;
  sessionKeys: DirectionalSessionKeys;
} {
  const responderEphemeral = generateEphemeralX25519();
  const now = BigInt(Date.now());

  const authBytes = getHandshakeAuthBytes(
    responderEd25519Pub,
    initiatorEd25519Pub,
    responderEphemeral.publicKey,
    now
  );

  const authSignature = ed25519.sign(authBytes, responderEd25519Secret);

  const responseBytes = new Uint8Array(104);
  const view = new DataView(responseBytes.buffer, responseBytes.byteOffset, responseBytes.byteLength);
  responseBytes.set(responderEphemeral.publicKey, 0);
  view.setBigUint64(32, now, false);
  responseBytes.set(authSignature, 40);

  // Derive session keys
  const sessionKeys = deriveDirectionalSessionKeys(
    responderEphemeral.secretKey,
    initiatorHandshakePayload.ephemeralPubkey,
    initiatorEd25519Pub,
    responderEd25519Pub
  );

  return {
    responsePayload: {
      ephemeralPubkey: responderEphemeral.publicKey,
      timestampMs: now,
      authSignature,
    },
    responseBytes,
    sessionKeys,
  };
}

/**
 * Completes the handshake on the initiator side upon receiving the responder's payload
 */
export function completeInitiatorHandshake(
  myEphemeralSecret: Uint8Array,
  initiatorEd25519Pub: Uint8Array,
  responderEd25519Pub: Uint8Array,
  responsePayload: HandshakePayload
): DirectionalSessionKeys {
  return deriveDirectionalSessionKeys(
    myEphemeralSecret,
    responsePayload.ephemeralPubkey,
    initiatorEd25519Pub,
    responderEd25519Pub
  );
}

/**
 * Simple in-memory sliding replay window filter
 */
export class ReplayFilter {
  private seenIds: Set<string> = new Set();
  private maxAgeMs: number;

  constructor(maxAgeMs = 5 * 60 * 1000) {
    this.maxAgeMs = maxAgeMs;
  }

  /**
   * Check if a packet is acceptable and mark it as seen.
   * Returns true if packet is fresh & novel, false if duplicate or expired.
   */
  public checkAndRecord(packetId: Uint8Array, timestampMs: bigint | number): boolean {
    const ts = typeof timestampMs === 'bigint' ? Number(timestampMs) : timestampMs;
    const now = Date.now();

    // Check expiration (maxAgeMs in past, or more than 60s in future clock drift)
    if (now - ts > this.maxAgeMs || ts - now > 60000) {
      return false; // Out of valid timestamp window
    }

    const idHex = bytesToHex(packetId);
    if (this.seenIds.has(idHex)) {
      return false; // Replay detected!
    }

    this.seenIds.add(idHex);
    // Keep set bounded to 5,000 recent packets
    if (this.seenIds.size > 5000) {
      const firstEntry = this.seenIds.values().next().value;
      if (firstEntry) this.seenIds.delete(firstEntry);
    }

    return true;
  }
}
