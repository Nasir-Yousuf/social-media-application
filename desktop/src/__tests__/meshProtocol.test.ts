import {
  createEnvelope,
  validateEnvelope,
  serializeEnvelope,
  deserializeEnvelope,
  PacketType,
  CFM_MAGIC,
  CFM_VERSION,
} from '../mesh/protocol/wireProtocol';
import {
  generateIdentityKeypair,
  signPacket,
  verifyPacketSignature,
  encryptPayload,
  decryptPayload,
} from '../mesh/crypto/meshCrypto';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('🧪 Starting Clearfeed Mesh Desktop Wire Protocol & Cryptography Tests...\n');

// Test 1: Envelope Creation & Header Validation
{
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();

  const env = createEnvelope({
    type: PacketType.ROUTED_DATA,
    senderPubkey: alice.publicKeyHex,
    recipientPubkey: bob.publicKeyHex,
    hopsRemaining: 5,
    hopCount: 0,
    payload: { message: 'Hello Mesh!' },
  });

  const check = validateEnvelope(env);
  assert(check.valid, `Expected envelope to be valid: ${check.error}`);
  assert(env.magic === CFM_MAGIC, `Expected magic ${CFM_MAGIC}, got ${env.magic}`);
  assert(env.version === CFM_VERSION, `Expected version ${CFM_VERSION}, got ${env.version}`);
  console.log('✓ Test 1 Passed: CFM1 Envelope structure & header validation succeeded.');
}

// Test 2: Wire Serialization & Deserialization
{
  const alice = generateIdentityKeypair();
  const env = createEnvelope({
    type: PacketType.BEACON,
    senderPubkey: alice.publicKeyHex,
  });

  const serialized = serializeEnvelope(env);
  assert(typeof serialized === 'string', 'Expected serialized envelope to be a string');
  const deserialized = deserializeEnvelope(serialized);
  assert(deserialized.packetId === env.packetId, 'Deserialized packetId does not match original');
  assert(deserialized.type === PacketType.BEACON, 'Deserialized packet type mismatch');
  console.log('✓ Test 2 Passed: CFM1 wire JSON serialization/deserialization succeeded.');
}

// Test 3: Ed25519 Signatures & Tamper Resistance
{
  const alice = generateIdentityKeypair();
  const testPayload = 'critical_mesh_packet_payload_hash';

  const sig = signPacket(alice.secretKeyHex, testPayload);
  assert(sig.length === 128, `Expected 128-hex character signature, got ${sig.length}`);

  const valid = verifyPacketSignature(alice.publicKeyHex, testPayload, sig);
  assert(valid, 'Signature verification failed with correct public key');

  const tamperedValid = verifyPacketSignature(alice.publicKeyHex, testPayload + '_tampered', sig);
  assert(!tamperedValid, 'Signature verification unexpectedly succeeded on tampered payload!');
  console.log('✓ Test 3 Passed: Ed25519 cryptographic signature & tamper resistance verified.');
}

// Test 4: End-to-End ChaCha20-Poly1305 Encryption & Decryption
{
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();
  const secretPlaintext = 'Clearfeed secret offline mesh message from Alice to Bob.';

  const { ciphertextHex, nonceHex } = encryptPayload(
    alice.secretKeyHex,
    bob.publicKeyHex,
    secretPlaintext
  );

  assert(ciphertextHex !== secretPlaintext, 'Ciphertext matches plaintext!');

  const decrypted = decryptPayload(
    bob.secretKeyHex,
    alice.publicKeyHex,
    ciphertextHex,
    nonceHex
  );

  assert(decrypted === secretPlaintext, `Decrypted text "${decrypted}" did not match original`);
  console.log('✓ Test 4 Passed: ChaCha20-Poly1305 AEAD payload encryption & decryption verified.');
}

// Test 5: Poly1305 Authentication Tag Integrity
{
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();

  const { ciphertextHex, nonceHex } = encryptPayload(
    alice.secretKeyHex,
    bob.publicKeyHex,
    'Confidential text'
  );

  // Tamper with ciphertext by flipping first byte
  const tamperedCiphertext = (ciphertextHex[0] === 'a' ? 'b' : 'a') + ciphertextHex.substring(1);

  let caughtError = false;
  try {
    decryptPayload(bob.secretKeyHex, alice.publicKeyHex, tamperedCiphertext, nonceHex);
  } catch {
    caughtError = true;
  }
  assert(caughtError, 'Expected Poly1305 MAC tag failure on modified ciphertext!');
  console.log('✓ Test 5 Passed: Altered ciphertext correctly rejected by Poly1305 authenticator.');
}

// Test 6: Multi-Hop Zero-Knowledge Relay Verification
{
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();
  const charlieRelay = generateIdentityKeypair();

  const { ciphertextHex, nonceHex } = encryptPayload(
    alice.secretKeyHex,
    bob.publicKeyHex,
    'Secret for Bob only'
  );

  // Relay Charlie tries to decrypt Alice's message to Bob
  let charlieDecrypted = false;
  try {
    decryptPayload(charlieRelay.secretKeyHex, alice.publicKeyHex, ciphertextHex, nonceHex);
    charlieDecrypted = true;
  } catch {
    charlieDecrypted = false;
  }
  assert(!charlieDecrypted, 'Relay node Charlie should NOT be able to decrypt payload intended for Bob!');
  console.log('✓ Test 6 Passed: Multi-hop relay confidentiality (zero-knowledge) verified.');
}

console.log('\n🎉 ALL 6 CLEARFEED MESH WIRE PROTOCOL & CRYPTO TESTS PASSED SUCCESSFULLY!\n');
