pub const CFM1_MAGIC: [u8; 4] = [0x43, 0x46, 0x4D, 0x31]; // "CFM1"
pub const CFM1_VERSION: u8 = 0x01;

pub const HEADER_SIZE: usize = 110;
pub const POLY1305_TAG_SIZE: usize = 16;
pub const ED25519_SIG_SIZE: usize = 64;
pub const MIN_FRAME_SIZE: usize = HEADER_SIZE + POLY1305_TAG_SIZE + ED25519_SIG_SIZE; // 190
pub const MAX_FRAME_SIZE: usize = 65536; // 64 KB

pub const OFFSET_MAGIC: usize = 0;
pub const OFFSET_VERSION: usize = 4;
pub const OFFSET_PACKET_TYPE: usize = 5;
pub const OFFSET_TTL: usize = 6;
pub const OFFSET_HOP_COUNT: usize = 7;
pub const OFFSET_PACKET_ID: usize = 8;
pub const OFFSET_SENDER_PUBKEY: usize = 24;
pub const OFFSET_RECIPIENT_PUBKEY: usize = 56;
pub const OFFSET_TIMESTAMP: usize = 88;
pub const OFFSET_NONCE: usize = 96;
pub const OFFSET_PAYLOAD_LEN: usize = 108;
pub const OFFSET_CIPHERTEXT: usize = 110;

pub const BROADCAST_PUBKEY: [u8; 32] = [0u8; 32];
pub const FRAGMENT_HEADER_SIZE: usize = 6;
pub const BLE_SAFE_MIN_CHUNK: usize = 20;
pub const DEFAULT_REASSEMBLY_TIMEOUT_MS: u64 = 15000;
pub const DEFAULT_TTL: u8 = 5;
