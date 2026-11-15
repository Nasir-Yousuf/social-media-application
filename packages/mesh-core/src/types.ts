/**
 * Clearfeed Mesh (CFM1) Type Definitions
 * Specification Version 1.0 (CFM1)
 */

export enum CFM1PacketType {
  BEACON_HELLO = 0x01,
  HANDSHAKE = 0x02,
  DIRECT_ENCRYPTED = 0x03,
  BROADCAST_SIGNED = 0x04,
  DELIVERY_ACK = 0x05,
  SYNC_SUMMARY = 0x06,
}

export interface CFM1Header {
  magic: Uint8Array; // 4 bytes [0x43, 0x46, 0x4D, 0x31]
  version: number; // 1 byte (0x01)
  packetType: CFM1PacketType; // 1 byte (0x01..0x06)
  ttl: number; // 1 byte (1..7)
  hopCount: number; // 1 byte (0..7)
  packetId: Uint8Array; // 16 bytes (128-bit UUID)
  senderPubkey: Uint8Array; // 32 bytes (Ed25519)
  recipientPubkey: Uint8Array; // 32 bytes (Ed25519 or 0x00 * 32)
  timestampMs: bigint; // 8 bytes Big-Endian Uint64
  nonce: Uint8Array; // 12 bytes ChaCha20 nonce
  payloadLen: number; // 2 bytes Big-Endian Uint16
}

export interface CFM1Frame extends CFM1Header {
  ciphertext: Uint8Array; // N bytes (payloadLen)
  tag: Uint8Array; // 16 bytes Poly1305 MAC tag
  signature: Uint8Array; // 64 bytes Ed25519 signature
}

export interface CFM1FrameInput {
  packetType: CFM1PacketType;
  ttl?: number;
  hopCount?: number;
  packetId?: Uint8Array;
  senderPubkey: Uint8Array;
  recipientPubkey?: Uint8Array;
  timestampMs?: bigint | number;
  nonce?: Uint8Array;
  ciphertext?: Uint8Array;
  tag?: Uint8Array;
  signature?: Uint8Array;
}

export interface BLEFragmentHeader {
  frameShortId: number; // 2 bytes Uint16
  fragIdx: number; // 2 bytes Uint16 (0-indexed)
  totalFrags: number; // 2 bytes Uint16
}

export interface BLEFragment {
  header: BLEFragmentHeader;
  data: Uint8Array;
  rawBytes: Uint8Array;
}

export interface EphemeralSessionKeypair {
  secretKey: Uint8Array; // 32 bytes X25519 secret
  publicKey: Uint8Array; // 32 bytes X25519 public
}

export interface DirectionalSessionKeys {
  initiatorToResponderKey: Uint8Array; // 32 bytes ChaCha20-Poly1305 key
  responderToInitiatorKey: Uint8Array; // 32 bytes ChaCha20-Poly1305 key
  sharedSecret: Uint8Array; // 32 bytes derived ECDH secret
}

export interface HandshakePayload {
  ephemeralPubkey: Uint8Array; // 32 bytes X25519 public key
  timestampMs: bigint; // 8 bytes Big-Endian Uint64
  authSignature: Uint8Array; // 64 bytes Ed25519 signature over (SenderEd25519 || RecipientEd25519 || EphemeralPub || TimestampMs)
}

export interface DeliveryAckPayload {
  originalPacketId: Uint8Array; // 16 bytes original packet UUID
  deliveredTimestampMs: bigint; // 8 bytes Big-Endian Uint64
  ackSignature: Uint8Array; // 64 bytes Ed25519 signature over (OriginalPacketId || DeliveredTimestampMs || OriginalSenderPubkey)
}

export interface SafetyNumber {
  rawDigits: string; // 60 decimal digits
  formattedBlocks: string; // 12 blocks of 5 digits separated by spaces
  qrPayload: string; // cfm1:verify?a=<hex>&b=<hex>&sn=<digits>
}

export interface ReplayWindow {
  maxAgeMs: number;
  seenPacketIds: Set<string>;
}
