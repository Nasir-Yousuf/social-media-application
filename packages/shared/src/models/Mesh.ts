/**
 * Clearfeed Mesh (CFM1) Shared Models & Wire Protocol Definitions
 * Cross-platform definitions for Web, Android, and Windows Desktop
 */

export enum CFM1PacketType {
  BEACON_HELLO = 0x01,
  HANDSHAKE = 0x02,
  DIRECT_ENCRYPTED = 0x03,
  BROADCAST_SIGNED = 0x04,
  DELIVERY_ACK = 0x05,
  SYNC_SUMMARY = 0x06,
}

// Legacy string-based types for backward compatibility
export type MeshPacketType =
  | 'BEACON'
  | 'ANNOUNCE'
  | 'KEY_EXCHANGE'
  | 'ROUTED_DATA'
  | 'HOP_ACK'
  | 'END_TO_END_ACK'
  | 'PING';

export interface CFM1BinaryHeader {
  magic: Uint8Array; // 4 bytes [0x43, 0x46, 0x4D, 0x31]
  version: number; // 0x01
  packetType: CFM1PacketType;
  ttl: number; // 1..7
  hopCount: number; // 0..7
  packetId: Uint8Array; // 16 bytes
  senderPubkey: Uint8Array; // 32 bytes Ed25519
  recipientPubkey: Uint8Array; // 32 bytes Ed25519 (0x00*32 broadcast)
  timestampMs: bigint; // 8 bytes Big-Endian
  nonce: Uint8Array; // 12 bytes CSPRNG
  payloadLen: number; // 2 bytes Big-Endian
}

export interface CFM1BinaryFrame extends CFM1BinaryHeader {
  ciphertext: Uint8Array; // N bytes
  tag: Uint8Array; // 16 bytes Poly1305
  signature: Uint8Array; // 64 bytes Ed25519
}

export interface BLEFragmentHeader {
  frameShortId: number; // 2 bytes Uint16
  fragIdx: number; // 2 bytes Uint16 (0-indexed)
  totalFrags: number; // 2 bytes Uint16
}

export interface SafetyNumberInfo {
  rawDigits: string; // 60 decimal digits
  formattedBlocks: string; // 12 groups of 5 digits
  qrPayload: string;
}

export interface MeshPacketHeader {
  magic: string; // 'CFM1'
  version: number; // 1
  packetType: MeshPacketType;
  packetId: string;
  senderPubkey: string;
  recipientPubkey: string;
  hopsRemaining: number;
  hopCount: number;
  timestamp: number;
  expiresAt: number;
  payloadLength?: number;
  signature?: string;
}

export interface MeshPacket<T = unknown> extends MeshPacketHeader {
  payload: T;
}
