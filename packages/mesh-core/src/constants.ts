/**
 * Clearfeed Mesh (CFM1) Constants
 */

// Magic 4 bytes: 0x43, 0x46, 0x4D, 0x31 ("CFM1")
export const CFM1_MAGIC = new Uint8Array([0x43, 0x46, 0x4d, 0x31]);
export const CFM1_MAGIC_STR = 'CFM1';
export const CFM1_VERSION = 0x01;

// Binary layout sizes
export const HEADER_SIZE = 110; // Fixed size of fields before ciphertext
export const POLY1305_TAG_SIZE = 16;
export const ED25519_SIG_SIZE = 64;
export const MIN_FRAME_SIZE = HEADER_SIZE + POLY1305_TAG_SIZE + ED25519_SIG_SIZE; // 190 bytes with 0-byte payload
export const MAX_FRAME_SIZE = 65536; // 64 KB hard limit

// Field byte lengths
export const MAGIC_LEN = 4;
export const VERSION_LEN = 1;
export const PACKET_TYPE_LEN = 1;
export const TTL_LEN = 1;
export const HOP_COUNT_LEN = 1;
export const PACKET_ID_LEN = 16;
export const PUBKEY_LEN = 32;
export const TIMESTAMP_LEN = 8;
export const NONCE_LEN = 12;
export const PAYLOAD_LEN_LEN = 2;

// Offset constants in binary frame
export const OFFSET_MAGIC = 0;
export const OFFSET_VERSION = 4;
export const OFFSET_PACKET_TYPE = 5;
export const OFFSET_TTL = 6;
export const OFFSET_HOP_COUNT = 7;
export const OFFSET_PACKET_ID = 8;
export const OFFSET_SENDER_PUBKEY = 24;
export const OFFSET_RECIPIENT_PUBKEY = 56;
export const OFFSET_TIMESTAMP = 88;
export const OFFSET_NONCE = 96;
export const OFFSET_PAYLOAD_LEN = 108;
export const OFFSET_CIPHERTEXT = 110;

// Relays mutate TTL and HopCount (offsets 6 and 7).
// Data signed by Ed25519 excludes TTL and HopCount:
// Magic (4) || Version (1) || PacketType (1) || PacketID (16) || SenderEd25519Pub (32) || RecipientEd25519Pub (32) || TimestampMs (8) || Nonce (12) || PayloadLen (2) || Ciphertext (N) || Tag (16)
// Total immutable length before ciphertext = 108 bytes.

// Broadcast recipient (all zeros, 32 bytes)
export const BROADCAST_PUBKEY = new Uint8Array(32);

// BLE MTU fragmentation constants
export const FRAGMENT_HEADER_SIZE = 6; // FrameShortID (2B) | FragIdx (2B) | TotalFrags (2B)
export const BLE_MIN_ATT_MTU = 23; // BLE specification minimum ATT MTU
export const BLE_SAFE_MIN_CHUNK = 20; // 23 - 3 ATT overhead
export const DEFAULT_REASSEMBLY_TIMEOUT_MS = 15000; // 15 seconds

// Mesh routing limits
export const DEFAULT_TTL = 5;
export const MAX_TTL = 7;
export const MIN_TTL = 1;
export const MAX_HOPS = 7;
