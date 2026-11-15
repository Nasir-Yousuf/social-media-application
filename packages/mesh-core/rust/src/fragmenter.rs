use std::collections::HashMap;
use crate::constants::*;
use crate::types::{BLEFragment, BLEFragmentHeader};

pub fn compute_frame_short_id(frame_bytes: &[u8]) -> u16 {
    if frame_bytes.len() >= 24 {
        let mut id_bytes = [0u8; 2];
        id_bytes.copy_from_slice(&frame_bytes[22..24]);
        return u16::from_be_bytes(id_bytes);
    }
    let mut sum: u16 = 0;
    for &b in frame_bytes {
        sum = sum.wrapping_add(b as u16);
    }
    sum
}

pub fn fragment_frame(
    serialized_frame: &[u8],
    negotiated_mtu: usize,
    custom_short_id: Option<u16>,
) -> Result<Vec<BLEFragment>, &'static str> {
    if serialized_frame.len() > MAX_FRAME_SIZE {
        return Err("Frame size exceeds MAX_FRAME_SIZE");
    }

    let max_fragment_bytes = negotiated_mtu.saturating_sub(3).max(BLE_SAFE_MIN_CHUNK);
    let max_payload_per_chunk = max_fragment_bytes.saturating_sub(FRAGMENT_HEADER_SIZE);
    if max_payload_per_chunk < 14 {
        return Err("Negotiated MTU too small for fragment header");
    }

    let frame_short_id = custom_short_id.unwrap_or_else(|| compute_frame_short_id(serialized_frame));
    let total_frags = (serialized_frame.len() + max_payload_per_chunk - 1) / max_payload_per_chunk;

    if total_frags > 0xffff {
        return Err("Total fragments exceeds u16");
    }
    let total_frags_u16 = total_frags as u16;

    let mut fragments = Vec::with_capacity(total_frags);

    for i in 0..total_frags {
        let start = i * max_payload_per_chunk;
        let end = (start + max_payload_per_chunk).min(serialized_frame.len());
        let chunk_data = serialized_frame[start..end].to_vec();

        let mut raw_bytes = vec![0u8; FRAGMENT_HEADER_SIZE + chunk_data.len()];
        raw_bytes[0..2].copy_from_slice(&frame_short_id.to_be_bytes());
        raw_bytes[2..4].copy_from_slice(&(i as u16).to_be_bytes());
        raw_bytes[4..6].copy_from_slice(&total_frags_u16.to_be_bytes());
        raw_bytes[6..].copy_from_slice(&chunk_data);

        fragments.push(BLEFragment {
            header: BLEFragmentHeader {
                frame_short_id,
                frag_idx: i as u16,
                total_frags: total_frags_u16,
            },
            data: chunk_data,
            raw_bytes,
        });
    }

    Ok(fragments)
}

pub fn parse_fragment(raw_bytes: &[u8]) -> Result<BLEFragment, &'static str> {
    if raw_bytes.len() < FRAGMENT_HEADER_SIZE {
        return Err("Fragment buffer too small");
    }

    let frame_short_id = u16::from_be_bytes([raw_bytes[0], raw_bytes[1]]);
    let frag_idx = u16::from_be_bytes([raw_bytes[2], raw_bytes[3]]);
    let total_frags = u16::from_be_bytes([raw_bytes[4], raw_bytes[5]]);

    if total_frags == 0 {
        return Err("total_frags cannot be 0");
    }
    if frag_idx >= total_frags {
        return Err("frag_idx out of bounds");
    }

    let data = raw_bytes[FRAGMENT_HEADER_SIZE..].to_vec();

    Ok(BLEFragment {
        header: BLEFragmentHeader {
            frame_short_id,
            frag_idx,
            total_frags,
        },
        data,
        raw_bytes: raw_bytes.to_vec(),
    })
}

struct InFlightAssembly {
    total_frags: u16,
    chunks: HashMap<u16, Vec<u8>>,
    total_received_bytes: usize,
    created_at_ms: u64,
}

pub struct BLEFrameReassembler {
    in_flight: HashMap<u16, InFlightAssembly>,
    timeout_ms: u64,
}

impl BLEFrameReassembler {
    pub fn new(timeout_ms: u64) -> Self {
        Self {
            in_flight: HashMap::new(),
            timeout_ms,
        }
    }

    pub fn ingest_fragment(&mut self, raw_fragment: &[u8], now_ms: u64) -> Result<Option<Vec<u8>>, &'static str> {
        self.prune_expired(now_ms);

        let fragment = parse_fragment(raw_fragment)?;
        let short_id = fragment.header.frame_short_id;
        let frag_idx = fragment.header.frag_idx;
        let total_frags = fragment.header.total_frags;

        let assembly = self.in_flight.entry(short_id).or_insert_with(|| InFlightAssembly {
            total_frags,
            chunks: HashMap::new(),
            total_received_bytes: 0,
            created_at_ms: now_ms,
        });

        if assembly.total_frags != total_frags {
            self.in_flight.remove(&short_id);
            return Err("Conflicting total_frags for short_id");
        }

        if !assembly.chunks.contains_key(&frag_idx) {
            assembly.total_received_bytes += fragment.data.len();
            assembly.chunks.insert(frag_idx, fragment.data);

            if assembly.total_received_bytes > MAX_FRAME_SIZE {
                self.in_flight.remove(&short_id);
                return Err("Assembled frame exceeds 64 KB limit");
            }
        }

        if assembly.chunks.len() == (total_frags as usize) {
            let mut full_frame = Vec::with_capacity(assembly.total_received_bytes);
            for i in 0..total_frags {
                if let Some(chunk) = assembly.chunks.get(&i) {
                    full_frame.extend_from_slice(chunk);
                } else {
                    return Ok(None);
                }
            }
            self.in_flight.remove(&short_id);
            return Ok(Some(full_frame));
        }

        Ok(None)
    }

    pub fn prune_expired(&mut self, now_ms: u64) -> usize {
        let timeout = self.timeout_ms;
        let before_len = self.in_flight.len();
        self.in_flight.retain(|_, assembly| now_ms.saturating_sub(assembly.created_at_ms) <= timeout);
        before_len - self.in_flight.len()
    }
}
