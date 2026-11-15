use chacha20poly1305::aead::Aead;
use chacha20poly1305::{ChaCha20Poly1305, Key, KeyInit, Nonce};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use hkdf::Hkdf;
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};
use x25519_dalek::{PublicKey as X25519Public, StaticSecret};

use crate::types::{CFM1Frame, DirectionalSessionKeys, SafetyNumber};
use crate::wire::get_immutable_signing_data;

pub fn generate_identity_keypair() -> (SigningKey, VerifyingKey) {
    let signing_key = SigningKey::generate(&mut OsRng);
    let verifying_key = signing_key.verifying_key();
    (signing_key, verifying_key)
}

pub fn generate_ephemeral_x25519() -> (StaticSecret, X25519Public) {
    let secret = StaticSecret::random_from_rng(&mut OsRng);
    let public = X25519Public::from(&secret);
    (secret, public)
}

pub fn sign_frame(signing_key: &SigningKey, frame: &CFM1Frame) -> [u8; 64] {
    let data = get_immutable_signing_data(frame);
    let signature = signing_key.sign(&data);
    signature.to_bytes()
}

pub fn verify_frame_signature(frame: &CFM1Frame) -> bool {
    let verifying_key = match VerifyingKey::from_bytes(&frame.sender_pubkey) {
        Ok(vk) => vk,
        Err(_) => return false,
    };
    let data = get_immutable_signing_data(frame);
    let signature = Signature::from_bytes(&frame.signature);
    verifying_key.verify(&data, &signature).is_ok()
}

pub fn compute_sha256(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    let mut out = [0u8; 32];
    out.copy_from_slice(&result);
    out
}

pub fn encrypt_chacha20_poly1305(
    key_bytes: &[u8; 32],
    plaintext: &[u8],
    nonce_bytes: &[u8; 12],
) -> Result<(Vec<u8>, [u8; 16]), &'static str> {
    let key = Key::from_slice(key_bytes);
    let cipher = ChaCha20Poly1305::new(key);
    let nonce = Nonce::from_slice(nonce_bytes);

    let ciphertext_with_tag = cipher
        .encrypt(nonce, plaintext)
        .map_err(|_| "ChaCha20Poly1305 encryption failed")?;

    let tag_offset = ciphertext_with_tag.len() - 16;
    let ciphertext = ciphertext_with_tag[..tag_offset].to_vec();
    let mut tag = [0u8; 16];
    tag.copy_from_slice(&ciphertext_with_tag[tag_offset..]);

    Ok((ciphertext, tag))
}

pub fn decrypt_chacha20_poly1305(
    key_bytes: &[u8; 32],
    ciphertext: &[u8],
    tag_bytes: &[u8; 16],
    nonce_bytes: &[u8; 12],
) -> Result<Vec<u8>, &'static str> {
    let key = Key::from_slice(key_bytes);
    let cipher = ChaCha20Poly1305::new(key);
    let nonce = Nonce::from_slice(nonce_bytes);

    let mut combined = Vec::with_capacity(ciphertext.len() + 16);
    combined.extend_from_slice(ciphertext);
    combined.extend_from_slice(tag_bytes);

    cipher
        .decrypt(nonce, combined.as_ref())
        .map_err(|_| "ChaCha20Poly1305 decryption / authentication failed")
}

pub fn derive_directional_session_keys(
    my_ephemeral_secret: &StaticSecret,
    their_ephemeral_pub: &[u8; 32],
    initiator_pub: &[u8; 32],
    responder_pub: &[u8; 32],
) -> Result<DirectionalSessionKeys, &'static str> {
    let their_x25519_pub = X25519Public::from(*their_ephemeral_pub);
    let shared_diffie_hellman = my_ephemeral_secret.diffie_hellman(&their_x25519_pub);
    let shared_bytes = shared_diffie_hellman.to_bytes();

    let mut salt = [0u8; 64];
    if initiator_pub <= responder_pub {
        salt[..32].copy_from_slice(initiator_pub);
        salt[32..].copy_from_slice(responder_pub);
    } else {
        salt[..32].copy_from_slice(responder_pub);
        salt[32..].copy_from_slice(initiator_pub);
    }

    let info = b"CFM1-DIRECTIONAL-SESSION-KEYS-V1";
    let hk = Hkdf::<Sha256>::new(Some(&salt), &shared_bytes);
    let mut okm = [0u8; 64];
    hk.expand(info, &mut okm)
        .map_err(|_| "HKDF expansion failed")?;

    let mut initiator_to_responder_key = [0u8; 32];
    initiator_to_responder_key.copy_from_slice(&okm[..32]);

    let mut responder_to_initiator_key = [0u8; 32];
    responder_to_initiator_key.copy_from_slice(&okm[32..]);

    Ok(DirectionalSessionKeys {
        initiator_to_responder_key,
        responder_to_initiator_key,
        shared_secret: shared_bytes,
    })
}

pub fn compute_safety_number(pub_a: &[u8; 32], pub_b: &[u8; 32]) -> SafetyNumber {
    let (first, second) = if pub_a <= pub_b {
        (pub_a, pub_b)
    } else {
        (pub_b, pub_a)
    };

    let mut blocks = Vec::with_capacity(12);
    let mut base_data = [0u8; 65];
    base_data[..32].copy_from_slice(first);
    base_data[32..64].copy_from_slice(second);

    for i in 0..12u8 {
        base_data[64] = i;
        let mut hasher = Sha256::new();
        hasher.update(&base_data);
        let digest = hasher.finalize();

        let num_bytes: [u8; 4] = [digest[0], digest[1], digest[2], digest[3]];
        let num = u32::from_be_bytes(num_bytes) % 100000;
        blocks.push(format!("{:05}", num));
    }

    let raw_digits = blocks.join("");
    let formatted_blocks = blocks.join(" ");

    let mut hex_first = String::with_capacity(64);
    for b in first {
        hex_first.push_str(&format!("{:02x}", b));
    }
    let mut hex_second = String::with_capacity(64);
    for b in second {
        hex_second.push_str(&format!("{:02x}", b));
    }

    let qr_payload = format!("cfm1:verify?a={}&b={}&sn={}", hex_first, hex_second, raw_digits);

    SafetyNumber {
        raw_digits,
        formatted_blocks,
        qr_payload,
    }
}
