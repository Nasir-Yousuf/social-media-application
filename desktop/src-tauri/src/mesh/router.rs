use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use serde::{Deserialize, Serialize};

use super::lan::LanTransport;
use super::ble::BleTransport;
use super::protocol::CFM1Frame;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeshPeerInfo {
    pub pubkey_hex: String,
    pub nickname: String,
    pub status: String, // "discovered", "verified", "blocked"
    pub last_seen_ms: u64,
    pub hop_distance: u8,
    pub reachability: String, // "lan", "ble", "relayed"
    pub safety_number: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MeshStats {
    pub packets_sent: u64,
    pub packets_relayed: u64,
    pub packets_stored: u64,
    pub acks_verified: u64,
    pub dropped_invalid_signatures: u64,
    pub dropped_duplicates: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreForwardPacket {
    pub packet_id: [u8; 16],
    pub sender_pubkey: [u8; 32],
    pub recipient_pubkey: [u8; 32],
    pub packet_type: u8,
    pub priority: u8,
    pub raw_bytes: Vec<u8>,
    pub size_bytes: usize,
    pub timestamp_ms: u64,
    pub ttl: u8,
    pub hop_count: u8,
    pub created_at: u64,
}

pub struct MeshRouter {
    pub my_pubkey: [u8; 32],
    pub my_secret: [u8; 32],
    pub my_nickname: String,
    pub relay_enabled: bool,
    pub battery_saver_mode: bool,

    pub peers: HashMap<String, MeshPeerInfo>,
    pub verified_peers: HashSet<String>,
    pub blocked_peers: HashSet<String>,
    pub seen_packets: HashSet<[u8; 16]>,
    pub store_and_forward_queue: Vec<StoreForwardPacket>,
    pub stats: MeshStats,
    pub peer_anomaly_scores: HashMap<String, u32>,

    pub lan_transport: Option<Arc<LanTransport>>,
    pub ble_transport: Option<Arc<BleTransport>>,
}

impl MeshRouter {
    pub const MAX_SF_BYTES: usize = 25 * 1024 * 1024; // 25 MB
    pub const MAX_SF_AGE_MS: u64 = 48 * 60 * 60 * 1000; // 48 Hours
    pub const MAX_PER_SENDER: usize = 50;

    pub fn new(pubkey: [u8; 32], secret: [u8; 32], nickname: String) -> Self {
        Self {
            my_pubkey: pubkey,
            my_secret: secret,
            my_nickname: nickname,
            relay_enabled: true,
            battery_saver_mode: false,
            peers: HashMap::new(),
            verified_peers: HashSet::new(),
            blocked_peers: HashSet::new(),
            seen_packets: HashSet::new(),
            store_and_forward_queue: Vec::new(),
            stats: MeshStats::default(),
            peer_anomaly_scores: HashMap::new(),
            lan_transport: None,
            ble_transport: None,
        }
    }

    pub fn is_packet_seen(&self, packet_id: &[u8; 16]) -> bool {
        self.seen_packets.contains(packet_id)
    }

    pub fn mark_packet_seen(&mut self, packet_id: [u8; 16]) {
        self.seen_packets.insert(packet_id);
    }

    pub fn record_peer_anomaly(&mut self, sender_pubkey_hex: &str) {
        let entry = self.peer_anomaly_scores.entry(sender_pubkey_hex.to_string()).or_insert(0);
        *entry += 1;
        self.stats.dropped_invalid_signatures += 1;
    }

    pub fn purge_delivered_packet(&mut self, packet_id: &[u8; 16]) {
        self.store_and_forward_queue.retain(|p| &p.packet_id != packet_id);
    }

    pub fn add_to_store_and_forward(&mut self, frame: &CFM1Frame, priority: u8) {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        // 1. Evict expired packets (>48 hours)
        let cutoff = now.saturating_sub(Self::MAX_SF_AGE_MS);
        self.store_and_forward_queue.retain(|p| p.created_at >= cutoff);

        // 2. Enforce per-sender quota (max 50)
        let sender_count = self.store_and_forward_queue.iter()
            .filter(|p| p.sender_pubkey == frame.sender_pubkey)
            .count();
        if sender_count >= Self::MAX_PER_SENDER {
            if let Some(pos) = self.store_and_forward_queue.iter().position(|p| p.sender_pubkey == frame.sender_pubkey) {
                self.store_and_forward_queue.remove(pos);
            }
        }

        // 3. Enforce 25 MB buffer ceiling
        let raw_bytes = frame.serialize();
        let size_bytes = raw_bytes.len();
        let mut current_bytes: usize = self.store_and_forward_queue.iter().map(|p| p.size_bytes).sum();
        while current_bytes + size_bytes > Self::MAX_SF_BYTES && !self.store_and_forward_queue.is_empty() {
            let removed = self.store_and_forward_queue.remove(0);
            current_bytes -= removed.size_bytes;
        }

        self.store_and_forward_queue.push(StoreForwardPacket {
            packet_id: frame.packet_id,
            sender_pubkey: frame.sender_pubkey,
            recipient_pubkey: frame.recipient_pubkey,
            packet_type: frame.packet_type as u8,
            priority,
            raw_bytes,
            size_bytes,
            timestamp_ms: frame.timestamp_ms,
            ttl: frame.ttl,
            hop_count: frame.hop_count,
            created_at: now,
        });
        self.stats.packets_stored += 1;
    }

    pub fn get_peers_list(&self) -> Vec<MeshPeerInfo> {
        self.peers.values().cloned().collect()
    }

    pub fn get_diagnostics(&self) -> serde_json::Value {
        let total_bytes: usize = self.store_and_forward_queue.iter().map(|p| p.size_bytes).sum();
        let total_mb = (total_bytes as f64 / (1024.0 * 1024.0) * 100.0).round() / 100.0;

        serde_json::json!({
            "stats": self.stats,
            "peersCount": self.peers.len(),
            "storeForward": {
                "totalCount": self.store_and_forward_queue.len(),
                "totalBytes": total_bytes,
                "totalMB": total_mb,
                "maxMB": 25.0,
                "maxAgeHours": 48,
                "maxPerSender": Self::MAX_PER_SENDER
            },
            "batterySaverMode": self.battery_saver_mode,
            "relayEnabled": self.relay_enabled
        })
    }
}
