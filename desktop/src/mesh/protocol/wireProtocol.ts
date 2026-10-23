/**
 * Clearfeed Mesh (CFM1) - Language-Neutral Versioned Wire Protocol
 * Interoperable across React Native, Web, and Rust/Tauri desktop cores.
 */

export const CFM_MAGIC = 'CFM1';
export const CFM_VERSION = 1;

export enum PacketType {
  BEACON = 0x01,         // Periodic peer discovery broadcast
  ANNOUNCE = 0x02,       // Direct peer announcement / handshake initiation
  KEY_EXCHANGE = 0x03,   // Ephemeral key exchange packet
  ROUTED_DATA = 0x04,    // Encrypted user message payload (relayed multi-hop)
  HOP_ACK = 0x05,        // Direct single-hop link acknowledgement
  END_TO_END_ACK = 0x06, // Cryptographic receipt generated only by destination
  PING = 0x07,           // Connectivity probe
}

export const PacketTypeName: Record<number, string> = {
  [PacketType.BEACON]: 'BEACON',
  [PacketType.ANNOUNCE]: 'ANNOUNCE',
  [PacketType.KEY_EXCHANGE]: 'KEY_EXCHANGE',
  [PacketType.ROUTED_DATA]: 'ROUTED_DATA',
  [PacketType.HOP_ACK]: 'HOP_ACK',
  [PacketType.END_TO_END_ACK]: 'END_TO_END_ACK',
  [PacketType.PING]: 'PING',
};

export const BROADCAST_PUBKEY = 'f'.repeat(64);

export interface MeshEnvelope<T = any> {
  magic: string;
  version: number;
  type: PacketType;
  packetId: string;
  senderPubkey: string;
  recipientPubkey: string;
  hopsRemaining: number;
  hopCount: number;
  timestamp: number;
  expiresAt: number;
  payload: T;
  signature: string | null;
}

export function generatePacketId(): string {
  const hexChars = '0123456789abcdef';
  let result = 'cfm-';
  for (let i = 0; i < 24; i++) {
    result += hexChars[Math.floor(Math.random() * 16)];
  }
  return result;
}

export function createEnvelope<T = any>({
  type,
  packetId,
  senderPubkey,
  recipientPubkey = BROADCAST_PUBKEY,
  hopsRemaining = 5,
  hopCount = 0,
  payload = {} as T,
  expiresInMs = 24 * 60 * 60 * 1000,
  signature = null,
}: {
  type: PacketType;
  packetId?: string;
  senderPubkey: string;
  recipientPubkey?: string;
  hopsRemaining?: number;
  hopCount?: number;
  payload?: T;
  expiresInMs?: number;
  signature?: string | null;
}): MeshEnvelope<T> {
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

export function validateEnvelope(packet: any): { valid: boolean; error?: string } {
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

export function serializeEnvelope(envelope: MeshEnvelope): string {
  return JSON.stringify(envelope);
}

export function deserializeEnvelope(rawString: string | object): MeshEnvelope {
  try {
    const packet = typeof rawString === 'string' ? JSON.parse(rawString) : rawString;
    const check = validateEnvelope(packet);
    if (!check.valid) {
      throw new Error(check.error);
    }
    return packet as MeshEnvelope;
  } catch (err: any) {
    throw new Error(`Wire decode failed: ${err.message}`);
  }
}
