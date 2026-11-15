use serde::{Deserialize, Serialize};

pub const CFM1_MAGIC: [u8; 4] = [0x43, 0x46, 0x4D, 0x31]; // 'CFM1'
pub const CFM1_VERSION: u8 = 1;
pub const HEADER_SIZE: usize = 110;
pub const MIN_FRAME_SIZE: usize = HEADER_SIZE + 16 + 64; // 190 bytes

pub const CFM1_SERVICE_UUID: &str = "0000CFM1-0000-1000-8000-00805F9B34FB";
pub const CFM1_TX_RX_CHAR_UUID: &str = "0000CFM2-0000-1000-8000-00805F9B34FB";
pub const CFM1_PEER_IDENTITY_CHAR_UUID: &str = "0000CFM3-0000-1000-8000-00805F9B34FB";
pub const CFM1_DEFAULT_LAN_PORT: u16 = 49152;
pub const CFM1_MDNS_SERVICE_TYPE: &str = "_clearfeed-mesh._tcp.local.";

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CFM1PacketType {
    BeaconHello = 0x01,
    Handshake = 0x02,
    DirectEncrypted = 0x03,
    BroadcastSigned = 0x04,
    DeliveryAck = 0x05,
    SyncSummary = 0x06,
    Ping = 0x07,
}

impl CFM1PacketType {
    pub fn from_u8(val: u8) -> Option<Self> {
        match val {
            0x01 => Some(Self::BeaconHello),
            0x02 => Some(Self::Handshake),
            0x03 => Some(Self::DirectEncrypted),
            0x04 => Some(Self::BroadcastSigned),
            0x05 => Some(Self::DeliveryAck),
            0x06 => Some(Self::SyncSummary),
            0x07 => Some(Self::Ping),
            _ => None,
        }
    }
}

mod serde_sig {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(bytes: &[u8; 64], serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_bytes(bytes)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<[u8; 64], D::Error>
    where
        D: Deserializer<'de>,
    {
        let v: Vec<u8> = Vec::deserialize(deserializer)?;
        if v.len() == 64 {
            let mut arr = [0u8; 64];
            arr.copy_from_slice(&v);
            Ok(arr)
        } else {
            Err(serde::de::Error::custom("expected 64 bytes for signature"))
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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
    #[serde(with = "serde_sig")]
    pub signature: [u8; 64],
}

impl CFM1Frame {
    pub fn serialize(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(HEADER_SIZE + self.ciphertext.len() + 16 + 64);
        buf.extend_from_slice(&self.magic);
        buf.push(self.version);
        buf.push(self.packet_type as u8);
        buf.push(self.ttl);
        buf.push(self.hop_count);
        buf.extend_from_slice(&self.packet_id);
        buf.extend_from_slice(&self.sender_pubkey);
        buf.extend_from_slice(&self.recipient_pubkey);
        buf.extend_from_slice(&self.timestamp_ms.to_be_bytes());
        buf.extend_from_slice(&self.nonce);
        buf.extend_from_slice(&(self.ciphertext.len() as u16).to_be_bytes());
        buf.extend_from_slice(&self.ciphertext);
        buf.extend_from_slice(&self.tag);
        buf.extend_from_slice(&self.signature);
        buf
    }

    pub fn deserialize(bytes: &[u8]) -> Result<Self, String> {
        if bytes.len() < MIN_FRAME_SIZE {
            return Err(format!("Frame size {} too short for CFM1", bytes.len()));
        }

        let magic: [u8; 4] = bytes[0..4].try_into().map_err(|_| "Invalid magic slice")?;
        if magic != CFM1_MAGIC {
            return Err("Invalid CFM1 magic bytes".to_string());
        }

        let version = bytes[4];
        if version != CFM1_VERSION {
            return Err(format!("Unsupported protocol version: {}", version));
        }

        let packet_type = CFM1PacketType::from_u8(bytes[5])
            .ok_or_else(|| format!("Unknown packet type: 0x{:02x}", bytes[5]))?;

        let ttl = bytes[6];
        let hop_count = bytes[7];
        let packet_id: [u8; 16] = bytes[8..24].try_into().map_err(|_| "Invalid packet_id slice")?;
        let sender_pubkey: [u8; 32] = bytes[24..56].try_into().map_err(|_| "Invalid sender slice")?;
        let recipient_pubkey: [u8; 32] = bytes[56..88].try_into().map_err(|_| "Invalid recipient slice")?;

        let timestamp_ms = u64::from_be_bytes(
            bytes[88..96].try_into().map_err(|_| "Invalid timestamp slice")?
        );
        let nonce: [u8; 12] = bytes[96..108].try_into().map_err(|_| "Invalid nonce slice")?;
        let payload_len = u16::from_be_bytes(
            bytes[108..110].try_into().map_err(|_| "Invalid payload_len slice")?
        );

        let total_expected = HEADER_SIZE + (payload_len as usize) + 16 + 64;
        if bytes.len() < total_expected {
            return Err(format!("Truncated payload: expected {}, got {}", total_expected, bytes.len()));
        }

        let c_start = HEADER_SIZE;
        let c_end = c_start + (payload_len as usize);
        let ciphertext = bytes[c_start..c_end].to_vec();

        let tag: [u8; 16] = bytes[c_end..c_end + 16].try_into().map_err(|_| "Invalid tag slice")?;
        let signature: [u8; 64] = bytes[c_end + 16..c_end + 80].try_into().map_err(|_| "Invalid sig slice")?;

        Ok(Self {
            magic,
            version,
            packet_type,
            ttl,
            hop_count,
            packet_id,
            sender_pubkey,
            recipient_pubkey,
            timestamp_ms,
            nonce,
            payload_len,
            ciphertext,
            tag,
            signature,
        })
    }

    /// Serializes with 4-byte Big-Endian length header for TCP streaming
    pub fn serialize_length_prefixed(&self) -> Vec<u8> {
        let frame_bytes = self.serialize();
        let len = (frame_bytes.len() as u32).to_be_bytes();
        let mut out = Vec::with_capacity(4 + frame_bytes.len());
        out.extend_from_slice(&len);
        out.extend_from_slice(&frame_bytes);
        out
    }
}
