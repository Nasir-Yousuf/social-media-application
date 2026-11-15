const crypto = require('crypto');

// Clearfeed Academy Root Certificate Authority (Ed25519)
// Deterministic seed ensures continuity across server restarts in development,
// while allowing production environments to override via CLEARFEED_CERT_CA_SEED.
const DEFAULT_SEED_HEX = '436c6561726665656441636164656d79526f6f74434153656564323032362121'; // 32 bytes

let caPrivateKey;
let caPublicKey;
let caPublicKeyRawHex;

function initCertificateAuthority() {
  if (caPrivateKey && caPublicKey) return;

  const seedHex = process.env.CLEARFEED_CERT_CA_SEED || DEFAULT_SEED_HEX;
  const seedBuffer = Buffer.from(seedHex, 'hex');

  // Derive Ed25519 keypair deterministically using PKCS#8 prefix for Ed25519
  // PKCS#8 private key prefix for Ed25519: 302e020100300506032b657004220420 (16 bytes) + 32-byte seed
  const pkcs8Prefix = Buffer.from('302e020100300506032b657004220420', 'hex');
  const pkcs8Der = Buffer.concat([pkcs8Prefix, seedBuffer.subarray(0, 32)]);

  try {
    caPrivateKey = crypto.createPrivateKey({
      key: pkcs8Der,
      format: 'der',
      type: 'pkcs8',
    });
    caPublicKey = crypto.createPublicKey(caPrivateKey);

    // Extract raw 32-byte public key (skip 12-byte SPKI header: 302a300506032b6570032100)
    const spkiDer = caPublicKey.export({ type: 'spki', format: 'der' });
    caPublicKeyRawHex = spkiDer.subarray(12).toString('hex');
  } catch (err) {
    console.warn('[CertificateAuthority] Deterministic key derivation fallback to generateKeyPairSync:', err.message);
    const pair = crypto.generateKeyPairSync('ed25519');
    caPrivateKey = pair.privateKey;
    caPublicKey = pair.publicKey;
    const spki = caPublicKey.export({ type: 'spki', format: 'der' });
    caPublicKeyRawHex = spki.subarray(12).toString('hex');
  }
}

// Canonical serialization of certificate payload for signing
const EXCLUDED_FIELDS = new Set(['signature', 'issuerPubkey', 'verificationUrl', 'issuer', '_id', 'id', 'createdAt', 'updatedAt']);

function canonicalizePayload(payload) {
  const sortedKeys = Object.keys(payload)
    .filter((k) => !EXCLUDED_FIELDS.has(k))
    .sort();
  const sortedObj = {};
  for (const k of sortedKeys) {
    const val = payload[k];
    sortedObj[k] = val instanceof Date ? val.toISOString() : val;
  }
  return JSON.stringify(sortedObj);
}

/**
 * Sign a certificate payload with the Root Ed25519 CA
 * @param {Object} payload { certificateId, trackId, trackTitle, studentName, studentUserId, score, issuedAt }
 * @returns {Object} { signature, issuerPubkey, verificationUrl }
 */
function signCertificate(payload) {
  initCertificateAuthority();

  const canonicalString = canonicalizePayload(payload);
  const dataToSign = Buffer.from(canonicalString, 'utf8');

  const signature = crypto.sign(null, dataToSign, caPrivateKey);
  const signatureHex = signature.toString('hex');
  const verificationUrl = `https://clearfeed.app/verify-cert/${payload.certificateId}?sig=${signatureHex}&pub=${caPublicKeyRawHex}`;

  return {
    signature: signatureHex,
    issuerPubkey: caPublicKeyRawHex,
    verificationUrl,
    issuer: 'Clearfeed Academy Root CA',
  };
}

/**
 * Verify an Ed25519 signed certificate
 * @param {Object} certificate
 * @returns {Object} { verified: boolean, issuer: string, error?: string }
 */
function verifyCertificate(certificate) {
  initCertificateAuthority();

  if (!certificate || !certificate.signature || !certificate.certificateId) {
    return { verified: false, error: 'Missing certificate data or signature' };
  }

  try {
    const canonicalString = canonicalizePayload(certificate);
    const dataToVerify = Buffer.from(canonicalString, 'utf8');
    const signatureBuffer = Buffer.from(certificate.signature, 'hex');

    // Use provided issuer public key or fallback to Root CA public key
    let verifyKey = caPublicKey;
    if (certificate.issuerPubkey) {
      const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
      const pubDer = Buffer.concat([spkiPrefix, Buffer.from(certificate.issuerPubkey, 'hex')]);
      verifyKey = crypto.createPublicKey({
        key: pubDer,
        format: 'der',
        type: 'spki',
      });
    }

    const isValid = crypto.verify(null, dataToVerify, verifyKey, signatureBuffer);
    return {
      verified: isValid,
      issuer: 'Clearfeed Academy Root CA',
      issuerPubkey: caPublicKeyRawHex,
    };
  } catch (err) {
    return { verified: false, error: err.message };
  }
}

function getIssuerPublicKeyHex() {
  initCertificateAuthority();
  return caPublicKeyRawHex;
}

module.exports = {
  signCertificate,
  verifyCertificate,
  getIssuerPublicKeyHex,
  canonicalizePayload,
};
