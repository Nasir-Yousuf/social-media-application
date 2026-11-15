use std::collections::HashSet;
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use x25519_dalek::StaticSecret;

use crate::crypto::{derive_directional_session_keys, generate_ephemeral_x25519};
use crate::types::{DirectionalSessionKeys, HandshakePayload};

const HANDSHAKE_AUTH_PREFIX: &[u8] = b"CFM1-HANDSHAKE-AUTH-V1";

pub fn get_handshake_auth_bytes(
    sender_pub: &[u8; 32],
    recipient_pub: &[u8; 32],
    ephemeral_pub: &[u8; 32],
    timestamp_ms: u64,
) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(HANDSHAKE_AUTH_PREFIX.len() + 32 + 32 + 32 + 8);
    bytes.extend_from_slice(HANDSHAKE_AUTH_PREFIX);
    bytes.extend_from_slice(sender_pub);
    bytes.extend_from_slice(recipient_pub);
    bytes.extend_from_slice(ephemeral_pub);
    bytes.extend_from_slice(&timestamp_ms.to_be_bytes());
    bytes
}

pub fn create_handshake_initiation(
    sender_signing_key: &SigningKey,
    recipient_pub: &[u8; 32],
    timestamp_ms: u64,
) -> (HandshakePayload, StaticSecret, Vec<u8>) {
    let (ephemeral_sec, ephemeral_pub) = generate_ephemeral_x25519();
    let sender_pub = sender_signing_key.verifying_key().to_bytes();
    let eph_pub_bytes = ephemeral_pub.to_bytes();

    let auth_bytes = get_handshake_auth_bytes(&sender_pub, recipient_pub, &eph_pub_bytes, timestamp_ms);
    let auth_sig = sender_signing_key.sign(&auth_bytes);
    let auth_sig_bytes = auth_sig.to_bytes();

    let mut payload_bytes = vec![0u8; 104];
    payload_bytes[..32].copy_from_slice(&eph_pub_bytes);
    payload_bytes[32..40].copy_from_slice(&timestamp_ms.to_be_bytes());
    payload_bytes[40..104].copy_from_slice(&auth_sig_bytes);

    let payload = HandshakePayload {
        ephemeral_pubkey: eph_pub_bytes,
        timestamp_ms,
        auth_signature: auth_sig_bytes,
    };

    (payload, ephemeral_sec, payload_bytes)
}

pub fn verify_and_parse_handshake(
    payload_bytes: &[u8],
    sender_pub: &[u8; 32],
    recipient_pub: &[u8; 32],
) -> Result<HandshakePayload, &'static str> {
    if payload_bytes.len() != 104 {
        return Err("Invalid handshake payload size");
    }

    let mut eph_pub = [0u8; 32];
    eph_pub.copy_from_slice(&payload_bytes[..32]);

    let mut ts_bytes = [0u8; 8];
    ts_bytes.copy_from_slice(&payload_bytes[32..40]);
    let timestamp_ms = u64::from_be_bytes(ts_bytes);

    let mut auth_sig = [0u8; 64];
    auth_sig.copy_from_slice(&payload_bytes[40..104]);

    let auth_bytes = get_handshake_auth_bytes(sender_pub, recipient_pub, &eph_pub, timestamp_ms);

    let verifying_key = VerifyingKey::from_bytes(sender_pub)
        .map_err(|_| "Invalid sender public key")?;
    let signature = Signature::from_bytes(&auth_sig);

    verifying_key
        .verify(&auth_bytes, &signature)
        .map_err(|_| "Handshake signature verification failed")?;

    Ok(HandshakePayload {
        ephemeral_pubkey: eph_pub,
        timestamp_ms,
        auth_signature: auth_sig,
    })
}

pub fn respond_to_handshake(
    initiator_pub: &[u8; 32],
    initiator_handshake: &HandshakePayload,
    responder_signing_key: &SigningKey,
    timestamp_ms: u64,
) -> Result<(HandshakePayload, Vec<u8>, DirectionalSessionKeys), &'static str> {
    let (responder_ephemeral_sec, responder_ephemeral_pub) = generate_ephemeral_x25519();
    let responder_pub = responder_signing_key.verifying_key().to_bytes();
    let eph_pub_bytes = responder_ephemeral_pub.to_bytes();

    let auth_bytes = get_handshake_auth_bytes(&responder_pub, initiator_pub, &eph_pub_bytes, timestamp_ms);
    let auth_sig = responder_signing_key.sign(&auth_bytes);
    let auth_sig_bytes = auth_sig.to_bytes();

    let mut response_bytes = vec![0u8; 104];
    response_bytes[..32].copy_from_slice(&eph_pub_bytes);
    response_bytes[32..40].copy_from_slice(&timestamp_ms.to_be_bytes());
    response_bytes[40..104].copy_from_slice(&auth_sig_bytes);

    let session_keys = derive_directional_session_keys(
        &responder_ephemeral_sec,
        &initiator_handshake.ephemeral_pubkey,
        initiator_pub,
        &responder_pub,
    )?;

    let payload = HandshakePayload {
        ephemeral_pubkey: eph_pub_bytes,
        timestamp_ms,
        auth_signature: auth_sig_bytes,
    };

    Ok((payload, response_bytes, session_keys))
}

pub fn complete_initiator_handshake(
    my_ephemeral_sec: &StaticSecret,
    initiator_pub: &[u8; 32],
    responder_pub: &[u8; 32],
    response_payload: &HandshakePayload,
) -> Result<DirectionalSessionKeys, &'static str> {
    derive_directional_session_keys(
        my_ephemeral_sec,
        &response_payload.ephemeral_pubkey,
        initiator_pub,
        responder_pub,
    )
}

pub struct ReplayFilter {
    seen_ids: HashSet<[u8; 16]>,
    max_age_ms: u64,
}

impl ReplayFilter {
    pub fn new(max_age_ms: u64) -> Self {
        Self {
            seen_ids: HashSet::new(),
            max_age_ms,
        }
    }

    pub fn check_and_record(&mut self, packet_id: &[u8; 16], timestamp_ms: u64, now_ms: u64) -> bool {
        if now_ms.saturating_sub(timestamp_ms) > self.max_age_ms || timestamp_ms.saturating_sub(now_ms) > 60000 {
            return false;
        }

        if self.seen_ids.contains(packet_id) {
            return false;
        }

        self.seen_ids.insert(*packet_id);
        if self.seen_ids.len() > 5000 {
            self.seen_ids.clear();
            self.seen_ids.insert(*packet_id);
        }

        true
    }
}
