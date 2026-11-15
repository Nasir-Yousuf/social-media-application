/**
 * Clearfeed Mesh (CFM1) Signed End-to-End Delivery Acknowledgement (ACK)
 */

import { ed25519 } from '@noble/curves/ed25519';
import { DeliveryAckPayload } from './types.js';

const ACK_PREFIX = new TextEncoder().encode('CFM1-DELIVERY-ACK-V1');

/**
 * Constructs the canonical byte sequence for signing an ACK receipt
 */
export function getAckSigningBytes(
  originalPacketId: Uint8Array,
  deliveredTimestampMs: bigint,
  originalSenderPubkey: Uint8Array
): Uint8Array {
  // Prefix (19) + OriginalPacketId (16) + Timestamp (8) + OriginalSenderPubkey (32) = 75 bytes
  const bytes = new Uint8Array(ACK_PREFIX.length + 16 + 8 + 32);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  let offset = 0;
  bytes.set(ACK_PREFIX, offset);
  offset += ACK_PREFIX.length;

  bytes.set(originalPacketId, offset);
  offset += 16;

  view.setBigUint64(offset, deliveredTimestampMs, false);
  offset += 8;

  bytes.set(originalSenderPubkey, offset);

  return bytes;
}

/**
 * Creates a destination-signed delivery ACK receipt
 */
export function createDeliveryAck(
  originalPacketId: Uint8Array,
  originalSenderPubkey: Uint8Array,
  recipientEd25519Secret: Uint8Array,
  deliveredTimestampMs?: bigint | number
): {
  ackPayload: DeliveryAckPayload;
  serializedPayload: Uint8Array;
} {
  if (originalPacketId.length !== 16) {
    throw new Error(`Original packet ID must be 16 bytes, got ${originalPacketId.length}`);
  }
  if (originalSenderPubkey.length !== 32) {
    throw new Error(`Original sender public key must be 32 bytes, got ${originalSenderPubkey.length}`);
  }

  const tsBigInt =
    typeof deliveredTimestampMs === 'bigint' ? deliveredTimestampMs : BigInt(deliveredTimestampMs || Date.now());

  const signingBytes = getAckSigningBytes(originalPacketId, tsBigInt, originalSenderPubkey);
  const ackSignature = ed25519.sign(signingBytes, recipientEd25519Secret);

  // Binary serialized ACK payload: OriginalPacketId (16B) || DeliveredTimestamp (8B) || AckSignature (64B) = 88 bytes
  const serializedPayload = new Uint8Array(16 + 8 + 64);
  const view = new DataView(serializedPayload.buffer, serializedPayload.byteOffset, serializedPayload.byteLength);

  serializedPayload.set(originalPacketId, 0);
  view.setBigUint64(16, tsBigInt, false);
  serializedPayload.set(ackSignature, 24);

  const ackPayload: DeliveryAckPayload = {
    originalPacketId,
    deliveredTimestampMs: tsBigInt,
    ackSignature,
  };

  return { ackPayload, serializedPayload };
}

/**
 * Verifies a destination-signed delivery ACK receipt
 */
export function verifyDeliveryAck(
  serializedPayload: Uint8Array,
  originalPacketId: Uint8Array,
  originalSenderPubkey: Uint8Array,
  recipientEd25519Pub: Uint8Array
): DeliveryAckPayload {
  if (serializedPayload.length !== 88) {
    throw new Error(`Invalid serialized ACK payload length: expected 88 bytes, got ${serializedPayload.length}`);
  }

  const packetId = serializedPayload.slice(0, 16);
  const view = new DataView(
    serializedPayload.buffer,
    serializedPayload.byteOffset,
    serializedPayload.byteLength
  );
  const deliveredTimestampMs = view.getBigUint64(16, false);
  const ackSignature = serializedPayload.slice(24, 88);

  // Verify packet ID matches
  for (let i = 0; i < 16; i++) {
    if (packetId[i] !== originalPacketId[i]) {
      throw new Error('ACK packet ID does not match original sent message');
    }
  }

  const signingBytes = getAckSigningBytes(originalPacketId, deliveredTimestampMs, originalSenderPubkey);
  const isValid = ed25519.verify(ackSignature, signingBytes, recipientEd25519Pub);
  if (!isValid) {
    throw new Error('Forged or invalid delivery ACK signature: receipt rejected');
  }

  return {
    originalPacketId: packetId,
    deliveredTimestampMs,
    ackSignature,
  };
}
