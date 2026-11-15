#[cfg(test)]
mod tests {
    use crate::mesh::protocol::{CFM1Frame, CFM1PacketType, CFM1_MAGIC, CFM1_VERSION, HEADER_SIZE};
    use crate::mesh::crypto::{
        generate_identity_keypair, sign_frame_header, verify_frame_signature,
        encrypt_direct, decrypt_direct, compute_safety_number, compute_fingerprint,
        BloomFilter,
    };
    use crate::mesh::router::MeshRouter;
    use crate::storage::sqlite::{DesktopDatabase, CachedPost, LearnLessonRecord, LearnProgressRecord};
    use tempfile::tempdir;

    #[test]
    fn test_cfm1_frame_wire_serialization_roundtrip() {
        let (pubkey, secret) = generate_identity_keypair();
        let (recipient_pub, _) = generate_identity_keypair();

        let mut frame = CFM1Frame {
            magic: CFM1_MAGIC,
            version: CFM1_VERSION,
            packet_type: CFM1PacketType::DirectEncrypted,
            ttl: 3,
            hop_count: 0,
            packet_id: [0x42; 16],
            sender_pubkey: pubkey,
            recipient_pubkey: recipient_pub,
            timestamp_ms: 1718000000000,
            nonce: [0x01; 12],
            payload_len: 11,
            ciphertext: b"Hello World".to_vec(),
            tag: [0x99; 16],
            signature: [0u8; 64],
        };

        // Sign the frame
        sign_frame_header(&secret, &mut frame);
        assert!(verify_frame_signature(&frame));

        // Serialize to wire bytes
        let raw = frame.serialize();
        assert_eq!(raw.len(), HEADER_SIZE + 11 + 16 + 64); // HEADER_SIZE + payload + tag + sig

        // Deserialize
        let decoded = CFM1Frame::deserialize(&raw).expect("Deserialization should succeed");
        assert_eq!(decoded.magic, CFM1_MAGIC);
        assert_eq!(decoded.version, CFM1_VERSION);
        assert_eq!(decoded.packet_type, CFM1PacketType::DirectEncrypted);
        assert_eq!(decoded.packet_id, [0x42; 16]);
        assert_eq!(decoded.ciphertext, b"Hello World");
        assert!(verify_frame_signature(&decoded));
    }

    #[test]
    fn test_tampered_frame_signature_fails() {
        let (pubkey, secret) = generate_identity_keypair();
        let (recipient_pub, _) = generate_identity_keypair();

        let mut frame = CFM1Frame {
            magic: CFM1_MAGIC,
            version: CFM1_VERSION,
            packet_type: CFM1PacketType::DirectEncrypted,
            ttl: 3,
            hop_count: 0,
            packet_id: [0x11; 16],
            sender_pubkey: pubkey,
            recipient_pubkey: recipient_pub,
            timestamp_ms: 1718000000000,
            nonce: [0x02; 12],
            payload_len: 4,
            ciphertext: b"Test".to_vec(),
            tag: [0x00; 16],
            signature: [0u8; 64],
        };

        sign_frame_header(&secret, &mut frame);
        assert!(verify_frame_signature(&frame));

        // Tamper with packet_id
        frame.packet_id[0] ^= 0xFF;
        assert!(!verify_frame_signature(&frame));
    }

    #[test]
    fn test_tcp_length_prefixed_framing() {
        let frame = CFM1Frame {
            magic: CFM1_MAGIC,
            version: CFM1_VERSION,
            packet_type: CFM1PacketType::BeaconHello,
            ttl: 1,
            hop_count: 0,
            packet_id: [0x77; 16],
            sender_pubkey: [0xAA; 32],
            recipient_pubkey: [0xFF; 32],
            timestamp_ms: 1718000000000,
            nonce: [0u8; 12],
            payload_len: 0,
            ciphertext: vec![],
            tag: [0u8; 16],
            signature: [0u8; 64],
        };

        let framed = frame.serialize_length_prefixed();
        assert!(framed.len() > 4);

        let len_header = u32::from_be_bytes(framed[0..4].try_into().unwrap());
        assert_eq!(len_header as usize, framed.len() - 4);

        let decoded = CFM1Frame::deserialize(&framed[4..]).expect("Decoding length-prefixed payload");
        assert_eq!(decoded.packet_id, [0x77; 16]);
    }

    #[test]
    fn test_chacha20_poly1305_e2e_encryption() {
        let shared_key = [0x5Au8; 32];
        let nonce = [0x3Cu8; 12];
        let plaintext = b"Windows Desktop to Android Phone Offline Message";

        let (ciphertext, tag) = encrypt_direct(&shared_key, plaintext, &nonce)
            .expect("Encryption should succeed");

        let decrypted = decrypt_direct(&shared_key, &ciphertext, &tag, &nonce)
            .expect("Decryption should succeed");

        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_safety_number_and_fingerprint() {
        let (pub_a, _) = generate_identity_keypair();
        let (pub_b, _) = generate_identity_keypair();

        let safety_ab = compute_safety_number(&pub_a, &pub_b);
        let safety_ba = compute_safety_number(&pub_b, &pub_a);

        // Commutative safety number
        assert_eq!(safety_ab, safety_ba);
        assert_eq!(safety_ab.len(), 60);

        let fp = compute_fingerprint(&pub_a);
        assert_eq!(fp.len(), 25); // "XXXX : XXXX : XXXX : XXXX"
    }

    #[test]
    fn test_bloom_filter_membership() {
        let mut bf = BloomFilter::new();
        let id1 = [1u8; 16];
        let id2 = [2u8; 16];
        let id3 = [3u8; 16];

        bf.add(&id1);
        bf.add(&id2);

        assert!(bf.contains(&id1));
        assert!(bf.contains(&id2));
        assert!(!bf.contains(&id3));

        let raw = *bf.as_bytes();
        assert_eq!(raw.len(), 256);
        let restored = BloomFilter::from_bytes(raw);
        assert!(restored.contains(&id1));
        assert!(!restored.contains(&id3));
    }

    #[test]
    fn test_store_and_forward_bounded_queue() {
        let (my_pub, my_sec) = generate_identity_keypair();
        let mut router = MeshRouter::new(my_pub, my_sec.to_bytes(), "WinPC".to_string());

        let (sender_pub, _) = generate_identity_keypair();
        let (dest_pub, _) = generate_identity_keypair();

        // Push 55 packets from same sender
        for i in 0..55 {
            let mut id = [0u8; 16];
            id[0] = (i & 0xFF) as u8;
            id[1] = (i >> 8) as u8;

            let frame = CFM1Frame {
                magic: CFM1_MAGIC,
                version: CFM1_VERSION,
                packet_type: CFM1PacketType::DirectEncrypted,
                ttl: 3,
                hop_count: 0,
                packet_id: id,
                sender_pubkey: sender_pub,
                recipient_pubkey: dest_pub,
                timestamp_ms: 1000 + i as u64,
                nonce: [0u8; 12],
                payload_len: 4,
                ciphertext: vec![1, 2, 3, 4],
                tag: [0u8; 16],
                signature: [0u8; 64],
            };

            router.add_to_store_and_forward(&frame, 1);
        }

        // Bounded queue must cap at MAX_PER_SENDER (50)
        let queue_len = router.store_and_forward_queue.len();
        assert_eq!(queue_len, 50);
    }

    #[test]
    fn test_sqlite_persistence_posts_and_lessons() {
        let dir = tempdir().expect("Create tempdir");
        let db = DesktopDatabase::new(dir.path().to_path_buf()).expect("Init DB");

        // Test caching posts
        let post = CachedPost {
            id: "post_101".to_string(),
            title: "Phase 14 Windows Desktop".to_string(),
            content: "Testing offline SQLite caching".to_string(),
            author: "nasir".to_string(),
            likes_count: 42,
            comments_count: 7,
            created_at: "2026-11-15T19:00:00Z".to_string(),
            updated_at: 1718000000000,
        };

        db.cache_posts(&[post]).expect("Cache post");
        let retrieved = db.get_cached_posts(10).expect("Get cached posts");
        assert_eq!(retrieved.len(), 1);
        assert_eq!(retrieved[0].id, "post_101");
        assert_eq!(retrieved[0].title, "Phase 14 Windows Desktop");

        // Test caching curriculum lessons
        let lesson = LearnLessonRecord {
            lesson_id: "lesson_py_01".to_string(),
            track_id: "python".to_string(),
            title: "Introduction to Python".to_string(),
            content_en: "Variables and types in Python".to_string(),
            content_bn: "পাইথনে ভেরিয়েবল এবং ডেটা টাইপ".to_string(),
            exercises_json: "[]".to_string(),
            order_index: 1,
        };

        db.cache_lessons(&[lesson]).expect("Cache lesson");
        let fetched_lesson = db.get_lesson("lesson_py_01").expect("Get lesson").expect("Found");
        assert_eq!(fetched_lesson.title, "Introduction to Python");
        assert_eq!(fetched_lesson.content_bn, "পাইথনে ভেরিয়েবল এবং ডেটা টাইপ");

        // Test saving lesson progress
        let progress = LearnProgressRecord {
            lesson_id: "lesson_py_01".to_string(),
            completed: true,
            score: 100,
            last_accessed_at: 1718000500000,
        };
        db.save_learn_progress(&progress).expect("Save progress");
    }
}
