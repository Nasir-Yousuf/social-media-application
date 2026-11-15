import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CFM1PacketType,
  CFM1_MAGIC,
  CFM1_VERSION,
  HEADER_SIZE,
  MIN_FRAME_SIZE,
  bytesToHex,
  hexToBytes,
  ed25519,
  x25519,
  generateIdentityKeypair,
  computeSafetyNumber,
  deriveDirectionalSessionKeys,
  encryptChaCha20Poly1305,
  decryptChaCha20Poly1305,
  serializeCFM1Frame,
  deserializeCFM1Frame,
  signFrame,
  verifyFrameSignature,
  decrementTTL,
  createHandshakeInitiation,
  verifyAndParseHandshake,
  respondToHandshake,
  completeInitiatorHandshake,
  createDeliveryAck,
  verifyDeliveryAck,
  fragmentFrame,
  BLEFrameReassembler,
  ReplayFilter,
} from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vectorsRaw = fs.readFileSync(path.join(__dirname, 'cfm1Vectors.json'), 'utf8');
const vectors = JSON.parse(vectorsRaw);

console.log('================================================================');
console.log('🛡️  CLEARFEED MESH (CFM1) PROTOCOL & CRYPTO CORE VERIFICATION');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`        Error: ${err.message}`);
    failed++;
  }
}

// Test 1: Deterministic Identity Key Generation & Matching Vectors
runTest('Identity Keys & Public Key Derivation', () => {
  const aliceSecret = hexToBytes(vectors.nodes.alice.secretSeedHex);
  const alicePub = ed25519.getPublicKey(aliceSecret);
  assert.strictEqual(bytesToHex(alicePub), vectors.nodes.alice.ed25519PublicKeyHex);

  const bobSecret = hexToBytes(vectors.nodes.bob.secretSeedHex);
  const bobPub = ed25519.getPublicKey(bobSecret);
  assert.strictEqual(bytesToHex(bobPub), vectors.nodes.bob.ed25519PublicKeyHex);
});

// Test 2: Safety Number & QR Fingerprint Generation
runTest('Safety Number (60 Digits) & QR Payload', () => {
  const alicePub = hexToBytes(vectors.nodes.alice.ed25519PublicKeyHex);
  const bobPub = hexToBytes(vectors.nodes.bob.ed25519PublicKeyHex);

  const sn1 = computeSafetyNumber(alicePub, bobPub);
  const sn2 = computeSafetyNumber(bobPub, alicePub); // Order swapped

  assert.strictEqual(sn1.rawDigits.length, 60);
  assert.strictEqual(sn1.rawDigits, vectors.safetyNumber.aliceBobRawDigits);
  assert.strictEqual(sn1.formattedBlocks, vectors.safetyNumber.aliceBobFormatted);
  assert.strictEqual(sn1.qrPayload, vectors.safetyNumber.qrPayload);
  assert.strictEqual(sn1.rawDigits, sn2.rawDigits, 'Safety number must be symmetric regardless of who initiates');
});

// Test 3: Ephemeral X25519 Session Handshake & Directional HKDF-SHA256 Derivation
runTest('Ephemeral X25519 Handshake & Directional Session Keys', () => {
  const aliceIdPub = hexToBytes(vectors.nodes.alice.ed25519PublicKeyHex);
  const aliceIdSecret = hexToBytes(vectors.nodes.alice.secretSeedHex);
  const bobIdPub = hexToBytes(vectors.nodes.bob.ed25519PublicKeyHex);
  const bobIdSecret = hexToBytes(vectors.nodes.bob.secretSeedHex);

  // 1. Alice initiates handshake
  const { handshakePayload, ephemeralKeypair, payloadBytes } = createHandshakeInitiation(
    aliceIdPub,
    aliceIdSecret,
    bobIdPub,
    1700000000000n
  );

  // 2. Bob receives and verifies Alice's handshake initiation
  const parsedByBob = verifyAndParseHandshake(payloadBytes, aliceIdPub, bobIdPub);
  assert.strictEqual(bytesToHex(parsedByBob.ephemeralPubkey), bytesToHex(ephemeralKeypair.publicKey));

  // 3. Bob responds to handshake and derives session keys
  const { responsePayload, responseBytes, sessionKeys: bobSessionKeys } = respondToHandshake(
    aliceIdPub,
    parsedByBob,
    bobIdPub,
    bobIdSecret
  );

  // 4. Alice receives Bob's response and completes handshake
  const aliceSessionKeys = completeInitiatorHandshake(
    ephemeralKeypair.secretKey,
    aliceIdPub,
    bobIdPub,
    responsePayload
  );

  // Assert both peers derive identical directional keys
  assert.strictEqual(
    bytesToHex(aliceSessionKeys.initiatorToResponderKey),
    bytesToHex(bobSessionKeys.initiatorToResponderKey)
  );
  assert.strictEqual(
    bytesToHex(aliceSessionKeys.responderToInitiatorKey),
    bytesToHex(bobSessionKeys.responderToInitiatorKey)
  );
  assert.strictEqual(
    bytesToHex(aliceSessionKeys.sharedSecret),
    bytesToHex(bobSessionKeys.sharedSecret)
  );

  // Check against fixed vector
  const aliceEphSec = hexToBytes(vectors.sessionKeyDerivation.aliceEphemeralSecretHex);
  const bobEphSec = hexToBytes(vectors.sessionKeyDerivation.bobEphemeralSecretHex);
  const aliceEphPub = x25519.getPublicKey(aliceEphSec);
  const bobEphPub = x25519.getPublicKey(bobEphSec);

  const fixedKeys = deriveDirectionalSessionKeys(aliceEphSec, bobEphPub, aliceIdPub, bobIdPub);
  assert.strictEqual(
    bytesToHex(fixedKeys.initiatorToResponderKey),
    vectors.sessionKeyDerivation.initiatorToResponderKeyHex
  );
  assert.strictEqual(
    bytesToHex(fixedKeys.responderToInitiatorKey),
    vectors.sessionKeyDerivation.responderToInitiatorKeyHex
  );
});

// Test 4: ChaCha20-Poly1305 AEAD Authenticated Encryption & Decryption
runTest('ChaCha20-Poly1305 Encryption & Decryption', () => {
  const key = hexToBytes(vectors.sessionKeyDerivation.initiatorToResponderKeyHex);
  const nonce = hexToBytes(vectors.directEncryptedFrame.nonceHex);
  const plaintext = new TextEncoder().encode(vectors.directEncryptedFrame.plaintextUtf8);

  const { ciphertext, tag } = encryptChaCha20Poly1305(key, plaintext, nonce);
  assert.strictEqual(bytesToHex(ciphertext), vectors.directEncryptedFrame.ciphertextHex);
  assert.strictEqual(bytesToHex(tag), vectors.directEncryptedFrame.poly1305TagHex);

  const decrypted = decryptChaCha20Poly1305(key, ciphertext, tag, nonce);
  assert.strictEqual(new TextDecoder().decode(decrypted), vectors.directEncryptedFrame.plaintextUtf8);

  // Tampered ciphertext rejection
  const tampered = new Uint8Array(ciphertext);
  tampered[0] ^= 0x01;
  assert.throws(() => {
    decryptChaCha20Poly1305(key, tampered, tag, nonce);
  }, /failed|tag|mac/i);
});

// Test 5: CFM1 Canonical Binary Serialization & Deserialization
runTest('CFM1 Canonical Binary Frame Serialization', () => {
  const aliceSecret = hexToBytes(vectors.nodes.alice.secretSeedHex);
  const alicePub = hexToBytes(vectors.nodes.alice.ed25519PublicKeyHex);
  const bobPub = hexToBytes(vectors.nodes.bob.ed25519PublicKeyHex);
  const packetId = hexToBytes(vectors.directEncryptedFrame.packetIdHex);
  const nonce = hexToBytes(vectors.directEncryptedFrame.nonceHex);
  const ciphertext = hexToBytes(vectors.directEncryptedFrame.ciphertextHex);
  const tag = hexToBytes(vectors.directEncryptedFrame.poly1305TagHex);

  const frame = {
    magic: CFM1_MAGIC,
    version: CFM1_VERSION,
    packetType: CFM1PacketType.DIRECT_ENCRYPTED,
    ttl: vectors.directEncryptedFrame.ttl,
    hopCount: vectors.directEncryptedFrame.hopCount,
    packetId,
    senderPubkey: alicePub,
    recipientPubkey: bobPub,
    timestampMs: BigInt(vectors.directEncryptedFrame.timestampMs),
    nonce,
    payloadLen: ciphertext.length,
    ciphertext,
    tag,
    signature: new Uint8Array(64),
  };

  frame.signature = signFrame(aliceSecret, frame);
  assert.strictEqual(bytesToHex(frame.signature), vectors.directEncryptedFrame.ed25519SignatureHex);
  assert.strictEqual(verifyFrameSignature(frame), true);

  const serialized = serializeCFM1Frame(frame);
  assert.strictEqual(serialized.length, MIN_FRAME_SIZE + ciphertext.length);

  const deserialized = deserializeCFM1Frame(serialized);
  assert.strictEqual(deserialized.packetType, CFM1PacketType.DIRECT_ENCRYPTED);
  assert.strictEqual(deserialized.ttl, 5);
  assert.strictEqual(deserialized.hopCount, 0);
  assert.strictEqual(bytesToHex(deserialized.ciphertext), vectors.directEncryptedFrame.ciphertextHex);
  assert.strictEqual(verifyFrameSignature(deserialized), true);
});

// Test 6: Multi-Hop Relay Routing with Signature Preservation
runTest('Multi-Hop Relay TTL Decrement (5 -> 0) & Signature Preservation', () => {
  const aliceSecret = hexToBytes(vectors.nodes.alice.secretSeedHex);
  const alicePub = hexToBytes(vectors.nodes.alice.ed25519PublicKeyHex);
  const bobPub = hexToBytes(vectors.nodes.bob.ed25519PublicKeyHex);
  const packetId = hexToBytes(vectors.directEncryptedFrame.packetIdHex);
  const nonce = hexToBytes(vectors.directEncryptedFrame.nonceHex);
  const ciphertext = hexToBytes(vectors.directEncryptedFrame.ciphertextHex);
  const tag = hexToBytes(vectors.directEncryptedFrame.poly1305TagHex);

  const frame = {
    magic: CFM1_MAGIC,
    version: CFM1_VERSION,
    packetType: CFM1PacketType.DIRECT_ENCRYPTED,
    ttl: 5,
    hopCount: 0,
    packetId,
    senderPubkey: alicePub,
    recipientPubkey: bobPub,
    timestampMs: 1700000000000n,
    nonce,
    payloadLen: ciphertext.length,
    ciphertext,
    tag,
    signature: new Uint8Array(64),
  };
  frame.signature = signFrame(aliceSecret, frame);

  const serialized = serializeCFM1Frame(frame);

  // Simulate 4 intermediate relay hops
  for (let hop = 1; hop <= 4; hop++) {
    const alive = decrementTTL(serialized);
    assert.strictEqual(alive, true);

    const relayed = deserializeCFM1Frame(serialized);
    assert.strictEqual(relayed.ttl, 5 - hop);
    assert.strictEqual(relayed.hopCount, hop);
    // Crucial check: Ed25519 signature remains 100% valid despite TTL and HopCount mutation!
    assert.strictEqual(verifyFrameSignature(relayed), true, `Hop ${hop} broke Ed25519 signature!`);
  }

  // 5th hop: TTL goes to 0 and packet is dropped
  const finalHop = decrementTTL(serialized);
  assert.strictEqual(finalHop, false, 'Packet with TTL 1 must expire and return false on relay');
  assert.strictEqual(serialized[6], 0, 'TTL must be zeroed');
});

// Test 7: Tampered Frame & Header Alteration Rejection
runTest('Tampered Ciphertext & Header Rejection', () => {
  const aliceSecret = hexToBytes(vectors.nodes.alice.secretSeedHex);
  const alicePub = hexToBytes(vectors.nodes.alice.ed25519PublicKeyHex);
  const bobPub = hexToBytes(vectors.nodes.bob.ed25519PublicKeyHex);
  const charliePub = hexToBytes(vectors.nodes.charlie.ed25519PublicKeyHex);

  const frame = {
    magic: CFM1_MAGIC,
    version: CFM1_VERSION,
    packetType: CFM1PacketType.DIRECT_ENCRYPTED,
    ttl: 5,
    hopCount: 0,
    packetId: new Uint8Array(16).fill(0x55),
    senderPubkey: alicePub,
    recipientPubkey: bobPub,
    timestampMs: 1700000000000n,
    nonce: new Uint8Array(12).fill(0x01),
    payloadLen: 10,
    ciphertext: new Uint8Array(10).fill(0x77),
    tag: new Uint8Array(16).fill(0x88),
    signature: new Uint8Array(64),
  };
  frame.signature = signFrame(aliceSecret, frame);

  // Alter recipient
  const forgedRecipient = { ...frame, recipientPubkey: charliePub };
  assert.strictEqual(verifyFrameSignature(forgedRecipient), false);

  // Alter payload ciphertext
  const tamperedCiphertext = { ...frame, ciphertext: new Uint8Array(10).fill(0x99) };
  assert.strictEqual(verifyFrameSignature(tamperedCiphertext), false);

  // Alter timestamp
  const tamperedTimestamp = { ...frame, timestampMs: 1700000005000n };
  assert.strictEqual(verifyFrameSignature(tamperedTimestamp), false);
});

// Test 8: Destination-Signed Delivery ACK Receipts & Forgery Resistance
runTest('Signed End-to-End Delivery ACK & Forged Receipt Rejection', () => {
  const alicePub = hexToBytes(vectors.nodes.alice.ed25519PublicKeyHex);
  const bobPub = hexToBytes(vectors.nodes.bob.ed25519PublicKeyHex);
  const bobSecret = hexToBytes(vectors.nodes.bob.secretSeedHex);
  const charlieSecret = hexToBytes(vectors.nodes.charlie.secretSeedHex);
  const packetId = hexToBytes(vectors.directEncryptedFrame.packetIdHex);

  // Destination (Bob) generates authentic delivery ACK
  const { ackPayload, serializedPayload } = createDeliveryAck(packetId, alicePub, bobSecret, 1700000002000n);
  const verified = verifyDeliveryAck(serializedPayload, packetId, alicePub, bobPub);
  assert.strictEqual(bytesToHex(verified.originalPacketId), bytesToHex(packetId));
  assert.strictEqual(verified.deliveredTimestampMs, 1700000002000n);

  // Adversary (Charlie) tries to forge Bob's ACK receipt
  const forgedAck = createDeliveryAck(packetId, alicePub, charlieSecret, 1700000002000n);
  assert.throws(() => {
    verifyDeliveryAck(forgedAck.serializedPayload, packetId, alicePub, bobPub);
  }, /forged|invalid/i);
});

// Test 9: BLE MTU Fragmentation & Out-of-Order Reassembly
runTest('BLE MTU Fragmentation (20B-512B) & Out-of-Order Reassembly', () => {
  const largePayload = new Uint8Array(1200);
  for (let i = 0; i < largePayload.length; i++) {
    largePayload[i] = (i * 37) & 0xff;
  }

  // Fragment at typical Android BLE MTU 247 bytes
  const fragments = fragmentFrame(largePayload, 247, 0xcafe);
  assert.strictEqual(fragments.length, 6);

  // Reassemble in reversed (out-of-order) sequence
  const reassembler = new BLEFrameReassembler(15000);
  let assembled = null;

  for (let i = fragments.length - 1; i >= 0; i--) {
    assembled = reassembler.ingestFragment(fragments[i].rawBytes);
  }

  assert.notStrictEqual(assembled, null);
  assert.strictEqual(assembled.length, 1200);
  for (let i = 0; i < 1200; i++) {
    assert.strictEqual(assembled[i], largePayload[i]);
  }

  // Verify safe minimum chunk (20 bytes)
  const minFragments = fragmentFrame(largePayload.slice(0, 100), 23); // 23 MTU -> 20 bytes chunk
  assert.ok(minFragments.length > 5);
  for (const frag of minFragments) {
    assert.ok(frag.rawBytes.length <= 20);
  }

  // Verify 15-second timeout drop
  const timedReassembler = new BLEFrameReassembler(15000);
  timedReassembler.ingestFragment(fragments[0].rawBytes, 1000);
  assert.strictEqual(timedReassembler.getActiveAssemblyCount(), 1);
  timedReassembler.pruneExpired(17000); // 16 seconds later
  assert.strictEqual(timedReassembler.getActiveAssemblyCount(), 0);
});

// Test 10: Replay Window Protection
runTest('Replay Protection Sliding Window', () => {
  const filter = new ReplayFilter(300000); // 5 min max age
  const packetId1 = new Uint8Array(16).fill(0x11);
  const packetId2 = new Uint8Array(16).fill(0x22);
  const now = Date.now();

  assert.strictEqual(filter.checkAndRecord(packetId1, now), true);
  assert.strictEqual(filter.checkAndRecord(packetId1, now), false, 'Duplicate packetId must be rejected');
  assert.strictEqual(filter.checkAndRecord(packetId2, now), true);
  assert.strictEqual(filter.checkAndRecord(new Uint8Array(16).fill(0x33), now - 400000), false, 'Expired packet must be rejected');
});

console.log('\n================================================================');
console.log(`✨ CFM1 Protocol Core Tests: ${passed}/${passed + failed} passed (${failed} failed)`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
