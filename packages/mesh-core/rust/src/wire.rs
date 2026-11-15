use crate::constants::*;
use crate::types::{CFM1Frame, CFM1PacketType};

pub fn serialize_cfm1_frame(frame: &CFM1Frame) -> Result<Vec<u8>, &'static str> {
    let payload_len = frame.ciphertext.len();
    if payload_len > 0xffff {
        return Err("Ciphertext length exceeds 65535");
    }

    let total_size = HEADER_SIZE + payload_len + POLY1305_TAG_SIZE + ED25519_SIG_SIZE;
    if total_size > MAX_FRAME_SIZE {
        return Err("Frame total size exceeds MAX_FRAME_SIZE");
    }

    let mut buffer = vec![0u8; total_size];

    buffer[OFFSET_MAGIC..OFFSET_MAGIC + 4].copy_from_slice(&CFM1_MAGIC);
    buffer[OFFSET_VERSION] = frame.version;
    buffer[OFFSET_PACKET_TYPE] = frame.packet_type as u8;
    buffer[OFFSET_TTL] = frame.ttl;
    buffer[OFFSET_HOP_COUNT] = frame.hop_count;
    buffer[OFFSET_PACKET_ID..OFFSET_PACKET_ID + 16].copy_from_slice(&frame.packet_id);
    buffer[OFFSET_SENDER_PUBKEY..OFFSET_SENDER_PUBKEY + 32].copy_from_slice(&frame.sender_pubkey);
    buffer[OFFSET_RECIPIENT_PUBKEY..OFFSET_RECIPIENT_PUBKEY + 32].copy_from_slice(&frame.recipient_pubkey);

    let ts_bytes = frame.timestamp_ms.to_be_bytes();
    buffer[OFFSET_TIMESTAMP..OFFSET_TIMESTAMP + 8].copy_from_slice(&ts_bytes);

    buffer[OFFSET_NONCE..OFFSET_NONCE + 12].copy_from_slice(&frame.nonce);

    let len_bytes = (payload_len as u16).to_be_bytes();
    buffer[OFFSET_PAYLOAD_LEN..OFFSET_PAYLOAD_LEN + 2].copy_from_slice(&len_bytes);

    if payload_len > 0 {
        buffer[OFFSET_CIPHERTEXT..OFFSET_CIPHERTEXT + payload_len].copy_from_slice(&frame.ciphertext);
    }

    let tag_offset = OFFSET_CIPHERTEXT + payload_len;
    buffer[tag_offset..tag_offset + POLY1305_TAG_SIZE].copy_from_slice(&frame.tag);

    let sig_offset = tag_offset + POLY1305_TAG_SIZE;
    buffer[sig_offset..sig_offset + ED25519_SIG_SIZE].copy_from_slice(&frame.signature);

    Ok(buffer)
}

pub fn deserialize_cfm1_frame(buffer: &[u8]) -> Result<CFM1Frame, &'static str> {
    if buffer.len() < MIN_FRAME_SIZE {
        return Err("Buffer too short for CFM1 frame");
    }
    if buffer.len() > MAX_FRAME_SIZE {
        return Err("Buffer exceeds MAX_FRAME_SIZE");
    }

    if buffer[0..4] != CFM1_MAGIC {
        return Err("Invalid magic bytes: expected CFM1");
    }

    let version = buffer[OFFSET_VERSION];
    if version != CFM1_VERSION {
        return Err("Unsupported protocol version");
    }

    let packet_type = CFM1PacketType::try_from(buffer[OFFSET_PACKET_TYPE])?;
    let ttl = buffer[OFFSET_TTL];
    let hop_count = buffer[OFFSET_HOP_COUNT];

    let mut packet_id = [0u8; 16];
    packet_id.copy_from_slice(&buffer[OFFSET_PACKET_ID..OFFSET_PACKET_ID + 16]);

    let mut sender_pubkey = [0u8; 32];
    sender_pubkey.copy_from_slice(&buffer[OFFSET_SENDER_PUBKEY..OFFSET_SENDER_PUBKEY + 32]);

    let mut recipient_pubkey = [0u8; 32];
    recipient_pubkey.copy_from_slice(&buffer[OFFSET_RECIPIENT_PUBKEY..OFFSET_RECIPIENT_PUBKEY + 32]);

    let mut ts_bytes = [0u8; 8];
    ts_bytes.copy_from_slice(&buffer[OFFSET_TIMESTAMP..OFFSET_TIMESTAMP + 8]);
    let timestamp_ms = u64::from_be_bytes(ts_bytes);

    let mut nonce = [0u8; 12];
    nonce.copy_from_slice(&buffer[OFFSET_NONCE..OFFSET_NONCE + 12]);

    let mut len_bytes = [0u8; 2];
    len_bytes.copy_from_slice(&buffer[OFFSET_PAYLOAD_LEN..OFFSET_PAYLOAD_LEN + 2]);
    let payload_len = u16::from_be_bytes(len_bytes);

    let expected_len = HEADER_SIZE + (payload_len as usize) + POLY1305_TAG_SIZE + ED25519_SIG_SIZE;
    if buffer.len() != expected_len {
        return Err("Buffer length does not match payload_len");
    }

    let ciphertext = buffer[OFFSET_CIPHERTEXT..OFFSET_CIPHERTEXT + (payload_len as usize)].to_vec();

    let tag_offset = OFFSET_CIPHERTEXT + (payload_len as usize);
    let mut tag = [0u8; 16];
    tag.copy_from_slice(&buffer[tag_offset..tag_offset + POLY1305_TAG_SIZE]);

    let sig_offset = tag_offset + POLY1305_TAG_SIZE;
    let mut signature = [0u8; 64];
    signature.copy_from_slice(&buffer[sig_offset..sig_offset + ED25519_SIG_SIZE]);

    Ok(CFM1Frame {
        magic: CFM1_MAGIC,
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

pub fn get_immutable_signing_data(frame: &CFM1Frame) -> Vec<u8> {
    let payload_len = frame.ciphertext.len();
    let signing_len = 124 + payload_len;
    let mut data = vec![0u8; signing_len];

    let mut offset = 0;
    data[offset..offset + 4].copy_from_slice(&CFM1_MAGIC);
    offset += 4;

    data[offset] = frame.version;
    offset += 1;

    data[offset] = frame.packet_type as u8;
    offset += 1;

    data[offset..offset + 16].copy_from_slice(&frame.packet_id);
    offset += 16;

    data[offset..offset + 32].copy_from_slice(&frame.sender_pubkey);
    offset += 32;

    data[offset..offset + 32].copy_from_slice(&frame.recipient_pubkey);
    offset += 32;

    let ts_bytes = frame.timestamp_ms.to_be_bytes();
    data[offset..offset + 8].copy_from_slice(&ts_bytes);
    offset += 8;

    data[offset..offset + 12].copy_from_slice(&frame.nonce);
    offset += 12;

    let len_bytes = (payload_len as u16).to_be_bytes();
    data[offset..offset + 2].copy_from_slice(&len_bytes);
    offset += 2;

    if payload_len > 0 {
        data[offset..offset + payload_len].copy_from_slice(&frame.ciphertext);
        offset += payload_len;
    }

    data[offset..offset + 16].copy_from_slice(&frame.tag);

    data
}

pub fn decrement_ttl(buffer: &mut [u8]) -> bool {
    if buffer.len() < MIN_FRAME_SIZE {
        return false;
    }
    let current_ttl = buffer[OFFSET_TTL];
    if current_ttl <= 1 {
        buffer[OFFSET_TTL] = 0;
        return false;
    }
    buffer[OFFSET_TTL] = current_ttl - 1;
    buffer[OFFSET_HOP_COUNT] = buffer[OFFSET_HOP_COUNT].saturating_add(1);
    true
}
