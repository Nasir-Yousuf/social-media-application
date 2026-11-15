use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use sha2::{Digest, Sha256, Sha512};
use chacha20poly1305::{
    aead::{Aead, KeyInit, Payload},
    ChaCha20Poly1305, Nonce,
};
use rand::rngs::OsRng;

use super::protocol::{CFM1Frame, HEADER_SIZE};

pub fn generate_keypair() -> (SigningKey, VerifyingKey) {
    let mut csprng = OsRng;
    let signing_key = SigningKey::generate(&mut csprng);
    let verifying_key = signing_key.verifying_key();
    (signing_key, verifying_key)
}

pub fn generate_identity_keypair() -> ([u8; 32], SigningKey) {
    let (signing_key, verifying_key) = generate_keypair();
    (verifying_key.to_bytes(), signing_key)
}

pub fn compute_fingerprint(pubkey: &[u8; 32]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(pubkey);
    let hash = hasher.finalize();
    let hex = hex::encode_upper(hash);
    format!(
        "{} : {} : {} : {}",
        &hex[0..4],
        &hex[4..8],
        &hex[8..12],
        &hex[12..16]
    )
}

/// Computes deterministic 60-digit safety number between two public keys
pub fn compute_safety_number(pub_a: &[u8; 32], pub_b: &[u8; 32]) -> String {
    let (first, second) = if pub_a < pub_b {
        (pub_a, pub_b)
    } else {
        (pub_b, pub_a)
    };

    let mut hasher = Sha512::new();
    hasher.update(first);
    hasher.update(second);
    let digest = hasher.finalize();

    let mut digits = String::with_capacity(60);
    for chunk in digest.chunks_exact(4) {
        let val = u32::from_be_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]) % 100000;
        digits.push_str(&format!("{:05}", val));
        if digits.len() >= 60 {
            break;
        }
    }
    digits.truncate(60);
    digits
}

pub fn sign_frame_header(signing_key: &SigningKey, frame: &mut CFM1Frame) {
    let serialized = frame.serialize();
    let header_and_ciphertext = &serialized[0..HEADER_SIZE + frame.ciphertext.len() + 16];
    let sig = signing_key.sign(header_and_ciphertext);
    frame.signature = sig.to_bytes();
}

pub fn verify_frame_signature(frame: &CFM1Frame) -> bool {
    let Ok(verifying_key) = VerifyingKey::from_bytes(&frame.sender_pubkey) else {
        return false;
    };
    let sig = Signature::from_bytes(&frame.signature);
    let serialized = frame.serialize();
    let header_and_ciphertext = &serialized[0..HEADER_SIZE + frame.ciphertext.len() + 16];
    verifying_key.verify(header_and_ciphertext, &sig).is_ok()
}

pub fn encrypt_direct(
    shared_key: &[u8; 32],
    plaintext: &[u8],
    nonce_bytes: &[u8; 12],
) -> Result<(Vec<u8>, [u8; 16]), String> {
    let cipher = ChaCha20Poly1305::new_from_slice(shared_key).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(nonce_bytes);
    let ciphertext_with_tag = cipher
        .encrypt(nonce, Payload { msg: plaintext, aad: b"" })
        .map_err(|e| e.to_string())?;

    if ciphertext_with_tag.len() < 16 {
        return Err("Encryption produced invalid output".to_string());
    }

    let split_idx = ciphertext_with_tag.len() - 16;
    let ciphertext = ciphertext_with_tag[0..split_idx].to_vec();
    let mut tag = [0u8; 16];
    tag.copy_from_slice(&ciphertext_with_tag[split_idx..]);
    Ok((ciphertext, tag))
}

pub fn decrypt_direct(
    shared_key: &[u8; 32],
    ciphertext: &[u8],
    tag: &[u8; 16],
    nonce_bytes: &[u8; 12],
) -> Result<Vec<u8>, String> {
    let cipher = ChaCha20Poly1305::new_from_slice(shared_key).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(nonce_bytes);
    let mut combined = Vec::with_capacity(ciphertext.len() + 16);
    combined.extend_from_slice(ciphertext);
    combined.extend_from_slice(tag);

    cipher
        .decrypt(nonce, Payload { msg: &combined, aad: b"" })
        .map_err(|e| e.to_string())
}

/// 256-Byte Bloom Filter (2048 bits) with 4 hash functions for 0x06=SYNC_SUMMARY
pub struct BloomFilter {
    bitset: [u8; 256],
}

impl BloomFilter {
    pub const BYTES: usize = 256;
    pub const BITS: usize = Self::BYTES * 8; // 2048

    pub fn new() -> Self {
        Self {
            bitset: [0u8; Self::BYTES],
        }
    }

    pub fn from_bytes(bytes: [u8; 256]) -> Self {
        Self { bitset: bytes }
    }

    pub fn from_hex(hex_str: &str) -> Result<Self, String> {
        let clean: String = hex_str.chars().filter(|c| c.is_ascii_hexdigit()).collect();
        let bytes = hex::decode(clean).map_err(|e| e.to_string())?;
        if bytes.len() != Self::BYTES {
            return Err(format!("Expected 256 bytes, got {}", bytes.len()));
        }
        let mut bitset = [0u8; Self::BYTES];
        bitset.copy_from_slice(&bytes);
        Ok(Self { bitset })
    }

    pub fn to_hex(&self) -> String {
        hex::encode(self.bitset)
    }

    pub fn as_bytes(&self) -> &[u8; 256] {
        &self.bitset
    }

    pub fn contains(&self, item: &[u8]) -> bool {
        self.has(item)
    }

    pub fn add(&mut self, item: &[u8]) {
        let (h1, h2) = self.hash_pair(item);
        for i in 0..4u32 {
            let combined = h1.wrapping_add(i.wrapping_mul(h2)) as usize;
            let bit_idx = combined % Self::BITS;
            let byte_idx = bit_idx / 8;
            let bit_mask = 1 << (bit_idx % 8);
            self.bitset[byte_idx] |= bit_mask;
        }
    }

    pub fn has(&self, item: &[u8]) -> bool {
        let (h1, h2) = self.hash_pair(item);
        for i in 0..4u32 {
            let combined = h1.wrapping_add(i.wrapping_mul(h2)) as usize;
            let bit_idx = combined % Self::BITS;
            let byte_idx = bit_idx / 8;
            let bit_mask = 1 << (bit_idx % 8);
            if (self.bitset[byte_idx] & bit_mask) == 0 {
                return false;
            }
        }
        true
    }

    fn hash_pair(&self, data: &[u8]) -> (u32, u32) {
        // FNV-1a
        let mut fnv: u32 = 0x811c9dc5;
        for &b in data {
            fnv ^= b as u32;
            fnv = fnv.wrapping_mul(0x01000193);
        }

        // Murmur3-like secondary hash
        let mut mur: u32 = 0;
        for chunk in data.chunks(4) {
            let mut k = 0u32;
            for (i, &b) in chunk.iter().enumerate() {
                k |= (b as u32) << (i * 8);
            }
            k = k.wrapping_mul(0xcc9e2d51);
            k = k.rotate_left(15);
            k = k.wrapping_mul(0x1b873593);
            mur ^= k;
            mur = mur.rotate_left(13);
            mur = mur.wrapping_mul(5).wrapping_add(0xe6546b64);
        }
        (fnv, mur)
    }
}
