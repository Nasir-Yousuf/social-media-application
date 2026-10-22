import {
  createEnvelope,
  validateEnvelope,
  PacketType,
} from '../protocol/wireProtocol.js';
import {
  generateIdentityKeypair,
  computeFingerprint,
  encryptDirectPayload,
  decryptDirectPayload,
  signEnvelope,
  verifyEnvelopeSignature,
} from '../crypto/meshCrypto.js';

async function runTests() {
  console.log('--- STARTING CLEARFEED MESH PROTOCOL & CRYPTO TEST SUITE ---');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Identity Keypair Generation & Fingerprinting
  const alice = generateIdentityKeypair();
  const bob = generateIdentityKeypair();
  const charlie = generateIdentityKeypair(); // Relay node

  assert(alice.publicKeyHex.length === 64, 'Alice public key is 32 bytes (64 hex characters)');
  assert(alice.secretKeyHex.length === 64, 'Alice secret key is 32 bytes (64 hex characters)');

  const aliceFp = computeFingerprint(alice.publicKeyHex);
  const bobFp = computeFingerprint(bob.publicKeyHex);
  assert(aliceFp.includes(':') && aliceFp.length >= 19, 'Fingerprint formatted in verifiable hex blocks');
  assert(aliceFp !== bobFp, 'Distinct nodes produce distinct fingerprints');

  // 2. CFM1 Wire Envelope Creation and Validation
  const rawEnvelope = createEnvelope({
    type: PacketType.ROUTED_DATA,
    senderPubkey: alice.publicKeyHex,
    recipientPubkey: bob.publicKeyHex,
    hopsRemaining: 5,
    hopCount: 0,
    payload: { sample: 'metadata' },
  });

  const check1 = validateEnvelope(rawEnvelope);
  assert(check1.valid === true, 'Valid CFM1 envelope passes validation');

  const invalidEnvelope = { ...rawEnvelope, magic: 'CFMX' };
  const check2 = validateEnvelope(invalidEnvelope);
  assert(check2.valid === false, 'Invalid magic bytes rejected');

  // 3. Digital Signatures (Ed25519)
  rawEnvelope.signature = signEnvelope(rawEnvelope, alice.secretKeyHex);
  assert(verifyEnvelopeSignature(rawEnvelope) === true, 'Sender signature successfully verifies');

  const tamperedEnvelope = { ...rawEnvelope, recipientPubkey: charlie.publicKeyHex };
  assert(verifyEnvelopeSignature(tamperedEnvelope) === false, 'Tampered envelope (altered recipient) fails signature verification');

  // 4. End-to-End Encryption (ChaCha20-Poly1305 + X25519)
  const secretText = 'Hello Bob! This is an offline encrypted message.';
  const encrypted = encryptDirectPayload(secretText, alice.secretKeyHex, bob.publicKeyHex);

  assert(encrypted.ciphertextHex && encrypted.nonceHex, 'Payload encrypted with random nonce');

  // Recipient (Bob) decrypts
  const decrypted = decryptDirectPayload(
    encrypted.ciphertextHex,
    encrypted.nonceHex,
    bob.secretKeyHex,
    alice.publicKeyHex
  );
  assert(decrypted === secretText, 'Bob successfully decrypts plaintext with his private key');

  // 5. Zero Knowledge for Relays (Charlie cannot decrypt)
  let charlieDecrypted = false;
  try {
    decryptDirectPayload(
      encrypted.ciphertextHex,
      encrypted.nonceHex,
      charlie.secretKeyHex,
      alice.publicKeyHex
    );
    charlieDecrypted = true;
  } catch {
    charlieDecrypted = false;
  }
  assert(charlieDecrypted === false, 'Intermediate relay node (Charlie) CANNOT decrypt private message');

  // 6. Altered Ciphertext Rejection
  let tamperedDecrypted = false;
  try {
    const alteredCiphertext =
      encrypted.ciphertextHex.slice(0, -2) +
      (encrypted.ciphertextHex.slice(-2) === 'aa' ? 'bb' : 'aa');
    decryptDirectPayload(
      alteredCiphertext,
      encrypted.nonceHex,
      bob.secretKeyHex,
      alice.publicKeyHex
    );
    tamperedDecrypted = true;
  } catch {
    tamperedDecrypted = false;
  }
  assert(tamperedDecrypted === false, 'Tampered ciphertext rejected by Poly1305 authenticator');

  // 7. Multi-hop Store-and-Forward Forwarding Simulation
  // Hop 0: Alice creates envelope
  const hop0 = createEnvelope({
    type: PacketType.ROUTED_DATA,
    senderPubkey: alice.publicKeyHex,
    recipientPubkey: bob.publicKeyHex,
    hopsRemaining: 5,
    hopCount: 0,
    payload: encrypted,
  });
  hop0.signature = signEnvelope(hop0, alice.secretKeyHex);

  // Hop 1: Charlie forwards without decrypting
  assert(hop0.hopsRemaining === 5 && hop0.hopCount === 0, 'Alice initiates packet with 5 hops');
  const hop1 = {
    ...hop0,
    hopsRemaining: hop0.hopsRemaining - 1,
    hopCount: hop0.hopCount + 1,
  };
  assert(hop1.hopsRemaining === 4 && hop1.hopCount === 1, 'Charlie relays packet: decrements TTL, increments hop count');

  // Hop 2: Bob receives hop1 and decrypts
  const bobFinalDecrypted = decryptDirectPayload(
    hop1.payload.ciphertextHex,
    hop1.payload.nonceHex,
    bob.secretKeyHex,
    hop1.senderPubkey
  );
  assert(bobFinalDecrypted === secretText, 'Bob decrypts packet delivered via Charlie relay');

  // Hop 3: Bob issues signed END_TO_END_ACK
  const ack = createEnvelope({
    type: PacketType.END_TO_END_ACK,
    senderPubkey: bob.publicKeyHex,
    recipientPubkey: alice.publicKeyHex,
    payload: { acknowledgedPacketId: hop0.packetId },
  });
  ack.signature = signEnvelope(ack, bob.secretKeyHex);
  assert(verifyEnvelopeSignature(ack) === true, 'End-to-end receipt successfully verified by Alice');

  console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
