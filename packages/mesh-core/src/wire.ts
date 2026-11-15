/**
 * Clearfeed Mesh (CFM1) Binary Wire Protocol Serializer & Deserializer
 */

import {
  CFM1_MAGIC,
  CFM1_VERSION,
  HEADER_SIZE,
  POLY1305_TAG_SIZE,
  ED25519_SIG_SIZE,
  MIN_FRAME_SIZE,
  MAX_FRAME_SIZE,
  OFFSET_MAGIC,
  OFFSET_VERSION,
  OFFSET_PACKET_TYPE,
  OFFSET_TTL,
  OFFSET_HOP_COUNT,
  OFFSET_PACKET_ID,
  OFFSET_SENDER_PUBKEY,
  OFFSET_RECIPIENT_PUBKEY,
  OFFSET_TIMESTAMP,
  OFFSET_NONCE,
  OFFSET_PAYLOAD_LEN,
  OFFSET_CIPHERTEXT,
  BROADCAST_PUBKEY,
  DEFAULT_TTL,
} from './constants.js';
import { CFM1Frame, CFM1PacketType } from './types.js';

/**
 * Serializes a CFM1Frame into its canonical binary wire format
 */
export function serializeCFM1Frame(frame: CFM1Frame): Uint8Array {
  const payloadLen = frame.ciphertext.length;
  if (payloadLen > 0xffff) {
    throw new Error(`Ciphertext length (${payloadLen}) exceeds maximum 16-bit uint (65535)`);
  }

  const totalSize = HEADER_SIZE + payloadLen + POLY1305_TAG_SIZE + ED25519_SIG_SIZE;
  if (totalSize > MAX_FRAME_SIZE) {
    throw new Error(`Frame total size (${totalSize}) exceeds MAX_FRAME_SIZE (${MAX_FRAME_SIZE})`);
  }

  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // 1. Magic (4B)
  buffer.set(CFM1_MAGIC, OFFSET_MAGIC);

  // 2. Version (1B)
  buffer[OFFSET_VERSION] = frame.version || CFM1_VERSION;

  // 3. PacketType (1B)
  buffer[OFFSET_PACKET_TYPE] = frame.packetType;

  // 4. TTL (1B)
  buffer[OFFSET_TTL] = frame.ttl !== undefined ? frame.ttl : DEFAULT_TTL;

  // 5. HopCount (1B)
  buffer[OFFSET_HOP_COUNT] = frame.hopCount || 0;

  // 6. PacketID (16B)
  if (frame.packetId.length !== 16) {
    throw new Error(`Invalid packetId length: expected 16 bytes, got ${frame.packetId.length}`);
  }
  buffer.set(frame.packetId, OFFSET_PACKET_ID);

  // 7. SenderEd25519Pub (32B)
  if (frame.senderPubkey.length !== 32) {
    throw new Error(`Invalid senderPubkey length: expected 32 bytes, got ${frame.senderPubkey.length}`);
  }
  buffer.set(frame.senderPubkey, OFFSET_SENDER_PUBKEY);

  // 8. RecipientEd25519Pub (32B)
  const recipient = frame.recipientPubkey || BROADCAST_PUBKEY;
  if (recipient.length !== 32) {
    throw new Error(`Invalid recipientPubkey length: expected 32 bytes, got ${recipient.length}`);
  }
  buffer.set(recipient, OFFSET_RECIPIENT_PUBKEY);

  // 9. TimestampMs (8B Big-Endian Uint64)
  const tsBigInt = typeof frame.timestampMs === 'bigint' ? frame.timestampMs : BigInt(frame.timestampMs || Date.now());
  view.setBigUint64(OFFSET_TIMESTAMP, tsBigInt, false);

  // 10. Nonce (12B)
  if (frame.nonce.length !== 12) {
    throw new Error(`Invalid nonce length: expected 12 bytes, got ${frame.nonce.length}`);
  }
  buffer.set(frame.nonce, OFFSET_NONCE);

  // 11. PayloadLen (2B Big-Endian Uint16)
  view.setUint16(OFFSET_PAYLOAD_LEN, payloadLen, false);

  // 12. CiphertextPayload (N bytes)
  if (payloadLen > 0) {
    buffer.set(frame.ciphertext, OFFSET_CIPHERTEXT);
  }

  // 13. Poly1305Tag (16B)
  const tagOffset = OFFSET_CIPHERTEXT + payloadLen;
  if (frame.tag.length !== POLY1305_TAG_SIZE) {
    throw new Error(`Invalid tag length: expected 16 bytes, got ${frame.tag.length}`);
  }
  buffer.set(frame.tag, tagOffset);

  // 14. Ed25519Signature (64B)
  const sigOffset = tagOffset + POLY1305_TAG_SIZE;
  if (frame.signature.length !== ED25519_SIG_SIZE) {
    throw new Error(`Invalid signature length: expected 64 bytes, got ${frame.signature.length}`);
  }
  buffer.set(frame.signature, sigOffset);

  return buffer;
}

/**
 * Deserializes a binary buffer into a validated CFM1Frame
 */
export function deserializeCFM1Frame(buffer: Uint8Array): CFM1Frame {
  if (buffer.length < MIN_FRAME_SIZE) {
    throw new Error(`Buffer too short: expected at least ${MIN_FRAME_SIZE} bytes, got ${buffer.length}`);
  }
  if (buffer.length > MAX_FRAME_SIZE) {
    throw new Error(`Buffer too large: exceeds MAX_FRAME_SIZE (${MAX_FRAME_SIZE}), got ${buffer.length}`);
  }

  // Check Magic
  if (
    buffer[0] !== CFM1_MAGIC[0] ||
    buffer[1] !== CFM1_MAGIC[1] ||
    buffer[2] !== CFM1_MAGIC[2] ||
    buffer[3] !== CFM1_MAGIC[3]
  ) {
    throw new Error(
      `Invalid magic bytes: expected CFM1 (0x43464D31), got 0x${buffer[0].toString(16)}${buffer[1].toString(16)}${buffer[2].toString(16)}${buffer[3].toString(16)}`
    );
  }

  // Check Version
  const version = buffer[OFFSET_VERSION];
  if (version !== CFM1_VERSION) {
    throw new Error(`Unsupported protocol version: ${version}`);
  }

  const packetType = buffer[OFFSET_PACKET_TYPE] as CFM1PacketType;
  const ttl = buffer[OFFSET_TTL];
  const hopCount = buffer[OFFSET_HOP_COUNT];

  const packetId = buffer.slice(OFFSET_PACKET_ID, OFFSET_PACKET_ID + 16);
  const senderPubkey = buffer.slice(OFFSET_SENDER_PUBKEY, OFFSET_SENDER_PUBKEY + 32);
  const recipientPubkey = buffer.slice(OFFSET_RECIPIENT_PUBKEY, OFFSET_RECIPIENT_PUBKEY + 32);

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const timestampMs = view.getBigUint64(OFFSET_TIMESTAMP, false);
  const nonce = buffer.slice(OFFSET_NONCE, OFFSET_NONCE + 12);
  const payloadLen = view.getUint16(OFFSET_PAYLOAD_LEN, false);

  const expectedTotalSize = HEADER_SIZE + payloadLen + POLY1305_TAG_SIZE + ED25519_SIG_SIZE;
  if (buffer.length !== expectedTotalSize) {
    throw new Error(`Frame length mismatch: expected ${expectedTotalSize} bytes for payloadLen ${payloadLen}, got ${buffer.length}`);
  }

  const ciphertext = buffer.slice(OFFSET_CIPHERTEXT, OFFSET_CIPHERTEXT + payloadLen);
  const tagOffset = OFFSET_CIPHERTEXT + payloadLen;
  const tag = buffer.slice(tagOffset, tagOffset + POLY1305_TAG_SIZE);
  const sigOffset = tagOffset + POLY1305_TAG_SIZE;
  const signature = buffer.slice(sigOffset, sigOffset + ED25519_SIG_SIZE);

  return {
    magic: CFM1_MAGIC,
    version,
    packetType,
    ttl,
    hopCount,
    packetId,
    senderPubkey,
    recipientPubkey,
    timestampMs,
    nonce,
    payloadLen,
    ciphertext,
    tag,
    signature,
  };
}

/**
 * Extracts the canonical immutable fields to sign/verify via Ed25519.
 * Excludes TTL and HopCount (offsets 6 and 7) so intermediate relays can
 * decrement TTL and increment HopCount without breaking the sender's signature!
 *
 * Immutable fields signed:
 * Magic (4B) || Version (1B) || PacketType (1B) || PacketID (16B) ||
 * SenderEd25519Pub (32B) || RecipientEd25519Pub (32B) || TimestampMs (8B) ||
 * Nonce (12B) || PayloadLen (2B) || Ciphertext (N bytes) || Tag (16B)
 */
export function getImmutableSigningData(frame: CFM1Frame): Uint8Array {
  const payloadLen = frame.ciphertext.length;
  // 4 + 1 + 1 + 16 + 32 + 32 + 8 + 12 + 2 + payloadLen + 16 = 124 + payloadLen
  const signingLen = 124 + payloadLen;
  const data = new Uint8Array(signingLen);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  let offset = 0;

  // 1. Magic (4B)
  data.set(CFM1_MAGIC, offset);
  offset += 4;

  // 2. Version (1B)
  data[offset] = frame.version || CFM1_VERSION;
  offset += 1;

  // 3. PacketType (1B)
  data[offset] = frame.packetType;
  offset += 1;

  // 4. PacketID (16B)
  data.set(frame.packetId, offset);
  offset += 16;

  // 5. SenderEd25519Pub (32B)
  data.set(frame.senderPubkey, offset);
  offset += 32;

  // 6. RecipientEd25519Pub (32B)
  const recipient = frame.recipientPubkey || BROADCAST_PUBKEY;
  data.set(recipient, offset);
  offset += 32;

  // 7. TimestampMs (8B Big-Endian Uint64)
  const tsBigInt = typeof frame.timestampMs === 'bigint' ? frame.timestampMs : BigInt(frame.timestampMs || Date.now());
  view.setBigUint64(offset, tsBigInt, false);
  offset += 8;

  // 8. Nonce (12B)
  data.set(frame.nonce, offset);
  offset += 12;

  // 9. PayloadLen (2B Big-Endian Uint16)
  view.setUint16(offset, payloadLen, false);
  offset += 2;

  // 10. Ciphertext (N bytes)
  if (payloadLen > 0) {
    data.set(frame.ciphertext, offset);
    offset += payloadLen;
  }

  // 11. Poly1305Tag (16B)
  data.set(frame.tag, offset);
  offset += 16;

  return data;
}

/**
 * Mutates TTL and HopCount directly in serialized frame buffer.
 * Decrements TTL by 1, increments HopCount by 1.
 * Returns true if frame is still alive (TTL > 0), false if expired/dropped.
 */
export function decrementTTL(frameBuffer: Uint8Array): boolean {
  if (frameBuffer.length < MIN_FRAME_SIZE) return false;
  const currentTTL = frameBuffer[OFFSET_TTL];
  if (currentTTL <= 1) {
    frameBuffer[OFFSET_TTL] = 0;
    return false; // Dropped: TTL expired
  }
  frameBuffer[OFFSET_TTL] = currentTTL - 1;
  frameBuffer[OFFSET_HOP_COUNT] = frameBuffer[OFFSET_HOP_COUNT] + 1;
  return true;
}
