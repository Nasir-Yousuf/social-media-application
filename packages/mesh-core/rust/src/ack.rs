use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use crate::types::DeliveryAckPayload;

const ACK_PREFIX: &[u8] = b"CFM1-DELIVERY-ACK-V1";

pub fn get_ack_signing_bytes(
    original_packet_id: &[u8; 16],
    delivered_timestamp_ms: u64,
    original_sender_pub: &[u8; 32],
) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(ACK_PREFIX.len() + 16 + 8 + 32);
    bytes.extend_from_slice(ACK_PREFIX);
    bytes.extend_from_slice(original_packet_id);
    bytes.extend_from_slice(&delivered_timestamp_ms.to_be_bytes());
    bytes.extend_from_slice(original_sender_pub);
    bytes
}

pub fn create_delivery_ack(
    original_packet_id: &[u8; 16],
    original_sender_pub: &[u8; 32],
    recipient_signing_key: &SigningKey,
    delivered_timestamp_ms: u64,
) -> (DeliveryAckPayload, Vec<u8>) {
    let signing_bytes = get_ack_signing_bytes(original_packet_id, delivered_timestamp_ms, original_sender_pub);
    let ack_sig = recipient_signing_key.sign(&signing_bytes);
    let ack_sig_bytes = ack_sig.to_bytes();

    let mut serialized_payload = vec![0u8; 88];
    serialized_payload[..16].copy_from_slice(original_packet_id);
    serialized_payload[16..24].copy_from_slice(&delivered_timestamp_ms.to_be_bytes());
    serialized_payload[24..88].copy_from_slice(&ack_sig_bytes);

    let ack_payload = DeliveryAckPayload {
        original_packet_id: *original_packet_id,
        delivered_timestamp_ms,
        ack_signature: ack_sig_bytes,
    };

    (ack_payload, serialized_payload)
}

pub fn verify_delivery_ack(
    serialized_payload: &[u8],
    original_packet_id: &[u8; 16],
    original_sender_pub: &[u8; 32],
    recipient_pub: &[u8; 32],
) -> Result<DeliveryAckPayload, &'static str> {
    if serialized_payload.len() != 88 {
        return Err("Invalid serialized ACK payload length");
    }

    let mut packet_id = [0u8; 16];
    packet_id.copy_from_slice(&serialized_payload[..16]);

    if packet_id != *original_packet_id {
        return Err("ACK packet ID does not match original sent message");
    }

    let mut ts_bytes = [0u8; 8];
    ts_bytes.copy_from_slice(&serialized_payload[16..24]);
    let delivered_timestamp_ms = u64::from_be_bytes(ts_bytes);

    let mut ack_sig = [0u8; 64];
    ack_sig.copy_from_slice(&serialized_payload[24..88]);

    let signing_bytes = get_ack_signing_bytes(original_packet_id, delivered_timestamp_ms, original_sender_pub);

    let verifying_key = VerifyingKey::from_bytes(recipient_pub)
        .map_err(|_| "Invalid recipient public key")?;
    let signature = Signature::from_bytes(&ack_sig);

    verifying_key
        .verify(&signing_bytes, &signature)
        .map_err(|_| "Forged or invalid delivery ACK signature")?;

    Ok(DeliveryAckPayload {
        original_packet_id: packet_id,
        delivered_timestamp_ms,
        ack_signature: ack_sig,
    })
}
