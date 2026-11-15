#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum CFM1PacketType {
    BeaconHello = 0x01,
    Handshake = 0x02,
    DirectEncrypted = 0x03,
    BroadcastSigned = 0x04,
    DeliveryAck = 0x05,
    SyncSummary = 0x06,
}

impl TryFrom<u8> for CFM1PacketType {
    type Error = &'static str;

    fn try_from(val: u8) -> Result<Self, Self::Error> {
        match val {
            0x01 => Ok(CFM1PacketType::BeaconHello),
            0x02 => Ok(CFM1PacketType::Handshake),
            0x03 => Ok(CFM1PacketType::DirectEncrypted),
            0x04 => Ok(CFM1PacketType::BroadcastSigned),
            0x05 => Ok(CFM1PacketType::DeliveryAck),
            0x06 => Ok(CFM1PacketType::SyncSummary),
            _ => Err("Invalid packet type"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CFM1Frame {
    pub magic: [u8; 4],
    pub version: u8,
    pub packet_type: CFM1PacketType,
    pub ttl: u8,
    pub hop_count: u8,
    pub packet_id: [u8; 16],
    pub sender_pubkey: [u8; 32],
    pub recipient_pubkey: [u8; 32],
    pub timestamp_ms: u64,
    pub nonce: [u8; 12],
    pub payload_len: u16,
    pub ciphertext: Vec<u8>,
    pub tag: [u8; 16],
    pub signature: [u8; 64],
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BLEFragmentHeader {
    pub frame_short_id: u16,
    pub frag_idx: u16,
    pub total_frags: u16,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BLEFragment {
    pub header: BLEFragmentHeader,
    pub data: Vec<u8>,
    pub raw_bytes: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DirectionalSessionKeys {
    pub initiator_to_responder_key: [u8; 32],
    pub responder_to_initiator_key: [u8; 32],
    pub shared_secret: [u8; 32],
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HandshakePayload {
    pub ephemeral_pubkey: [u8; 32],
    pub timestamp_ms: u64,
    pub auth_signature: [u8; 64],
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeliveryAckPayload {
    pub original_packet_id: [u8; 16],
    pub delivered_timestamp_ms: u64,
    pub ack_signature: [u8; 64],
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SafetyNumber {
    pub raw_digits: String,
    pub formatted_blocks: String,
    pub qr_payload: String,
}
