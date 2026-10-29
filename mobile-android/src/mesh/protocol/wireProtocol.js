/**
 * Clearfeed Mesh (CFM1) - Language-Neutral Versioned Wire Protocol
 * 
 * Interoperable across React Native, Web, and future Rust/Tauri desktop cores.
 * 
 * Wire Envelope Specification:
 * - MAGIC: 'CFM1' (4 bytes: 0x43, 0x46, 0x4D, 0x31)
 * - VERSION: 1
 * - TYPE: uint8 (0x01: BEACON, 0x02: ANNOUNCE, 0x03: KEY_EXCHANGE, 0x04: ROUTED_DATA, 0x05: HOP_ACK, 0x06: END_TO_END_ACK, 0x07: PING)
 * - PACKET_ID: string (UUIDv4 or hex string)
 * - SENDER_PUBKEY: 64-char hex string (32-byte Ed25519 public key)
 * - RECIPIENT_PUBKEY: 64-char hex string (32-byte Ed25519 public key, or 'ffff...ffff' for broadcast)
 * - HOPS_REMAINING: uint8 (default 5, decremented at each relay)
 * - HOP_COUNT: uint8 (starts at 0, incremented at each relay)
 * - TIMESTAMP: uint64 (epoch ms)
 * - EXPIRES_AT: uint64 (epoch ms, default now + 24 hours)
 * - PAYLOAD: object (encrypted ciphertext + nonce for ROUTED_DATA, or plain metadata for BEACON/ACK)
 * - SIGNATURE: 128-char hex string (64-byte Ed25519 signature by sender over header + payload)
 */

export const CFM_MAGIC = 'CFM1';
export const CFM_VERSION = 1;

export const PacketType = {
  BEACON: 0x01,          // Periodic peer discovery broadcast
  ANNOUNCE: 0x02,        // Direct peer announcement / handshake initiation
  KEY_EXCHANGE: 0x03,    // Ephemeral key exchange packet
  ROUTED_DATA: 0x04,     // Encrypted user message payload (relayed multi-hop)
  HOP_ACK: 0x05,         // Direct single-hop link acknowledgement
  END_TO_END_ACK: 0x06,  // Cryptographic receipt generated only by destination
  PING: 0x07,            // Connectivity probe
};

export const PacketTypeName = {
  [PacketType.BEACON]: 'BEACON',
  [PacketType.ANNOUNCE]: 'ANNOUNCE',
  [PacketType.KEY_EXCHANGE]: 'KEY_EXCHANGE',
  [PacketType.ROUTED_DATA]: 'ROUTED_DATA',
  [PacketType.HOP_ACK]: 'HOP_ACK',
  [PacketType.END_TO_END_ACK]: 'END_TO_END_ACK',
  [PacketType.PING]: 'PING',
};

export const MessageContentType = {
  TEXT: 'text',
  IMAGE: 'image',
  VOICE: 'voice',
  FILE: 'file',
};

export const BROADCAST_PUBKEY = 'f'.repeat(64);

/**
 * Creates a raw CFM1 packet envelope
 */
export function createEnvelope({
  type,
  packetId,
  senderPubkey,
  recipientPubkey = BROADCAST_PUBKEY,
  hopsRemaining = 5,
  hopCount = 0,
  payload = {},
  expiresInMs = 24 * 60 * 60 * 1000, // 24 hours default TTL
  signature = null,
}) {
  const now = Date.now();
  return {
    magic: CFM_MAGIC,
    version: CFM_VERSION,
    type,
    packetId: packetId || generatePacketId(),
    senderPubkey: senderPubkey.toLowerCase(),
    recipientPubkey: recipientPubkey.toLowerCase(),
    hopsRemaining: Math.max(0, hopsRemaining),
    hopCount: Math.max(0, hopCount),
    timestamp: now,
    expiresAt: now + expiresInMs,
    payload,
    signature: signature || null,
  };
}

/**
 * Validates envelope structure and boundaries
 */
export function validateEnvelope(packet) {
  if (!packet || typeof packet !== 'object') {
    return { valid: false, error: 'Packet must be a non-null object' };
  }

  if (packet.magic !== CFM_MAGIC) {
    return { valid: false, error: `Invalid magic bytes: expected ${CFM_MAGIC}, got ${packet.magic}` };
  }

  if (packet.version !== CFM_VERSION) {
    return { valid: false, error: `Unsupported protocol version: ${packet.version}` };
  }

  if (!packet.packetId || typeof packet.packetId !== 'string') {
    return { valid: false, error: 'Missing or invalid packetId' };
  }

  if (!packet.senderPubkey || packet.senderPubkey.length !== 64) {
    return { valid: false, error: 'Invalid senderPubkey: must be 64-hex characters' };
  }

  if (!packet.recipientPubkey || packet.recipientPubkey.length !== 64) {
    return { valid: false, error: 'Invalid recipientPubkey: must be 64-hex characters' };
  }

  if (typeof packet.hopsRemaining !== 'number' || packet.hopsRemaining < 0) {
    return { valid: false, error: 'Invalid hopsRemaining' };
  }

  if (typeof packet.expiresAt !== 'number' || packet.expiresAt < Date.now()) {
    return { valid: false, error: 'Packet has expired' };
  }

  return { valid: true };
}

/**
 * Serializes envelope to UTF-8 JSON wire string
 */
export function serializeEnvelope(envelope) {
  return JSON.stringify(envelope);
}

/**
 * Deserializes wire data and validates standard envelope
 */
export function deserializeEnvelope(rawString) {
  try {
    const packet = typeof rawString === 'string' ? JSON.parse(rawString) : rawString;
    const check = validateEnvelope(packet);
    if (!check.valid) {
      throw new Error(check.error);
    }
    return packet;
  } catch (err) {
    throw new Error(`Wire decode failed: ${err.message}`);
  }
}

/**
 * Helper to generate a 16-byte random hex packet ID
 */
export function generatePacketId() {
  const hexChars = '0123456789abcdef';
  let result = 'cfm-';
  for (let i = 0; i < 24; i++) {
    result += hexChars[Math.floor(Math.random() * 16)];
  }
  return result;
}
