pub mod constants;
pub mod types;
pub mod wire;
pub mod crypto;
pub mod handshake;
pub mod ack;
pub mod fragmenter;

pub use constants::*;
pub use types::*;
pub use wire::*;
pub use crypto::*;
pub use handshake::*;
pub use ack::*;
pub use fragmenter::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cfm1_roundtrip() {
        let (alice_sec, alice_pub) = generate_identity_keypair();
        let (_bob_sec, bob_pub) = generate_identity_keypair();

        let packet_id = [1u8; 16];
        let nonce = [2u8; 12];
        let key = [3u8; 32];
        let plaintext = b"Hello Rust CFM1 Wire Protocol!";

        let (ciphertext, tag) = encrypt_chacha20_poly1305(&key, plaintext, &nonce).unwrap();

        let mut frame = CFM1Frame {
            magic: CFM1_MAGIC,
            version: CFM1_VERSION,
            packet_type: CFM1PacketType::DirectEncrypted,
            ttl: 5,
            hop_count: 0,
            packet_id,
            sender_pubkey: alice_pub.to_bytes(),
            recipient_pubkey: bob_pub.to_bytes(),
            timestamp_ms: 1700000000000,
            nonce,
            payload_len: ciphertext.len() as u16,
            ciphertext,
            tag,
            signature: [0u8; 64],
        };

        let sig = sign_frame(&alice_sec, &frame);
        frame.signature = sig;

        assert!(verify_frame_signature(&frame));

        let serialized = serialize_cfm1_frame(&frame).unwrap();
        assert_eq!(serialized.len(), MIN_FRAME_SIZE + plaintext.len());

        let mut deserialized = deserialize_cfm1_frame(&serialized).unwrap();
        assert_eq!(deserialized.packet_type, CFM1PacketType::DirectEncrypted);
        assert!(verify_frame_signature(&deserialized));

        // Test multi-hop TTL decrement
        let mut relayed_bytes = serialized.clone();
        for expected_ttl in (1..5).rev() {
            let alive = decrement_ttl(&mut relayed_bytes);
            assert!(alive);
            let relayed_frame = deserialize_cfm1_frame(&relayed_bytes).unwrap();
            assert_eq!(relayed_frame.ttl, expected_ttl);
            assert_eq!(relayed_frame.hop_count, 5 - expected_ttl);
            // Crucial: signature remains 100% valid across hops!
            assert!(verify_frame_signature(&relayed_frame));
        }

        // Test TTL expiry
        let alive = decrement_ttl(&mut relayed_bytes);
        assert!(!alive);
    }
}
