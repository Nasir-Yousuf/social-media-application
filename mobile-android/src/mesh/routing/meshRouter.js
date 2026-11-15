import meshStorage from '../storage/meshStorage.js';
import meshTransport from '../transport/meshTransport.js';
import meshIdentityService from '../identity/meshIdentityService.js';
import {
  PacketType,
  createEnvelope,
  validateEnvelope,
  BROADCAST_PUBKEY,
  DeliveryState,
} from '../protocol/wireProtocol.js';
import {
  encryptDirectPayload,
  decryptDirectPayload,
  signEnvelope,
  verifyEnvelopeSignature,
} from '../crypto/meshCrypto.js';
import { BloomFilter } from '@clearfeed/mesh-core';

export { DeliveryState };

class MeshRouter {
  constructor() {
    this.messageListeners = new Set();
    this.deliveryListeners = new Set();
    this.peerListeners = new Set();
    this.beaconTimer = null;

    // In-memory LRU deduplication cache for sub-millisecond lookups
    this.recentSeen = new Set();
    this.MAX_RECENT_SEEN = 5000;

    // Node Diagnostics & Metrics
    this.stats = {
      packetsSent: 0,
      packetsRelayed: 0,
      packetsStored: 0,
      acksVerified: 0,
      droppedInvalidSignatures: 0,
      droppedDuplicates: 0,
    };

    // Anti-Spam Relay Guard: Peer anomaly tracking
    this.peerAnomalyScores = new Map(); // pubkeyHex -> count

    // Battery-Saver Scan Mode toggle
    this.batterySaverMode = false;
  }

  initialize() {
    meshTransport.onPacket((envelope) => this.handleIncomingEnvelope(envelope));
    this.startBeaconing(this.batterySaverMode ? 30 : 8);
  }

  onMessageReceived(cb) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  onDeliveryUpdated(cb) {
    this.deliveryListeners.add(cb);
    return () => this.deliveryListeners.delete(cb);
  }

  onPeersUpdated(cb) {
    this.peerListeners.add(cb);
    return () => this.peerListeners.delete(cb);
  }

  notifyPeersUpdated() {
    for (const cb of this.peerListeners) {
      try {
        cb();
      } catch (e) {}
    }
  }

  // --- STATS & DIAGNOSTICS ---
  getStats() {
    return { ...this.stats };
  }

  resetStats() {
    this.stats = {
      packetsSent: 0,
      packetsRelayed: 0,
      packetsStored: 0,
      acksVerified: 0,
      droppedInvalidSignatures: 0,
      droppedDuplicates: 0,
    };
  }

  getPeerAnomalyScores() {
    const obj = {};
    for (const [k, v] of this.peerAnomalyScores.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  recordPeerAnomaly(pubkeyHex) {
    if (!pubkeyHex) return;
    const key = pubkeyHex.toLowerCase();
    const current = this.peerAnomalyScores.get(key) || 0;
    this.peerAnomalyScores.set(key, current + 1);
    this.stats.droppedInvalidSignatures++;
  }

  async getStoreAndForwardStats() {
    return await meshStorage.getStoreAndForwardStats();
  }

  // --- BATTERY-SAVER SCAN MODE ---
  isBatterySaverMode() {
    return this.batterySaverMode;
  }

  setBatterySaverMode(enabled) {
    this.batterySaverMode = !!enabled;
    const intervalSec = this.batterySaverMode ? 30 : 8;
    this.startBeaconing(intervalSec);
  }

  // --- DEDUPLICATION ---
  async isPacketSeen(packetId) {
    if (!packetId) return true;
    if (this.recentSeen.has(packetId)) return true;
    const seenInDb = await meshStorage.isPacketSeen(packetId);
    if (seenInDb) {
      this.recentSeen.add(packetId);
      return true;
    }
    return false;
  }

  async markPacketSeen(packetId, senderPubkey = '', packetType = 0) {
    if (!packetId) return;
    if (this.recentSeen.size >= this.MAX_RECENT_SEEN) {
      // Clear oldest half
      const iter = this.recentSeen.values();
      for (let i = 0; i < Math.floor(this.MAX_RECENT_SEEN / 2); i++) {
        this.recentSeen.delete(iter.next().value);
      }
    }
    this.recentSeen.add(packetId);
    await meshStorage.markPacketSeen(packetId, senderPubkey, packetType);
  }

  /**
   * Broadcast an unencrypted peer presence beacon on the local transport
   */
  async broadcastBeacon() {
    try {
      const identity = await meshIdentityService.getOrCreateIdentity();
      if (!identity) return;

      const envelope = createEnvelope({
        type: PacketType.BEACON,
        senderPubkey: identity.publicKeyHex,
        recipientPubkey: BROADCAST_PUBKEY,
        hopsRemaining: 1,
        hopCount: 0,
        payload: {
          nickname: identity.nickname,
          timestamp: Date.now(),
        },
      });

      envelope.signature = signEnvelope(envelope, identity.secretKeyHex);
      await meshTransport.broadcastPacket(envelope);
    } catch (err) {
      console.warn('[MeshRouter] Beacon broadcast error:', err?.message);
    }
  }

  startBeaconing(intervalSec = 8) {
    this.stopBeaconing();
    this.broadcastBeacon();
    this.beaconTimer = setInterval(() => {
      this.broadcastBeacon();
    }, intervalSec * 1000);
  }

  stopBeaconing() {
    if (this.beaconTimer) {
      clearInterval(this.beaconTimer);
      this.beaconTimer = null;
    }
  }

  async sendAnnounce(targetPubkey) {
    try {
      const identity = await meshIdentityService.getOrCreateIdentity();
      if (!identity) return;

      const envelope = createEnvelope({
        type: PacketType.ANNOUNCE,
        senderPubkey: identity.publicKeyHex,
        recipientPubkey: targetPubkey,
        hopsRemaining: 1,
        hopCount: 0,
        payload: {
          nickname: identity.nickname,
          timestamp: Date.now(),
        },
      });

      envelope.signature = signEnvelope(envelope, identity.secretKeyHex);
      await meshTransport.sendDirect(targetPubkey, envelope);
    } catch {}
  }

  /**
   * Send an end-to-end encrypted message or rich media (image, voice, file) to a peer
   * Enforces honest delivery progression:
   * SAVED_LOCALLY -> QUEUED -> SENT_NEIGHBOR
   * (transitions to DELIVERED_ACK ONLY upon destination-signed ACK arrival)
   */
  async sendMessage({
    recipientPubkey,
    recipientNickname,
    text,
    type = 'text',
    mediaBase64 = null,
    mediaMime = null,
    mediaName = null,
    duration = null,
  }) {
    const identity = await meshIdentityService.getOrCreateIdentity();
    if (!identity) throw new Error('Local Mesh identity not available');

    const trimmedText = (text || '').trim();
    if (!trimmedText && !mediaBase64) throw new Error('Message cannot be empty');

    const isBroadcast = recipientPubkey.toLowerCase() === BROADCAST_PUBKEY;
    const defaultPlaceholder = type === 'image' ? '📷 Photo' : type === 'voice' ? '🎤 Voice Note' : '📎 Attachment';
    const displayText = trimmedText || defaultPlaceholder;

    const msgData = {
      text: displayText,
      type: type || 'text',
      mediaBase64: mediaBase64 || null,
      mediaMime: mediaMime || null,
      mediaName: mediaName || null,
      duration: duration || null,
      senderNickname: identity.nickname || 'Nearby Peer',
    };

    let payload;

    if (isBroadcast) {
      payload = msgData;
    } else {
      const plaintextJson = JSON.stringify(msgData);
      const encrypted = encryptDirectPayload(
        plaintextJson,
        identity.secretKeyHex,
        recipientPubkey
      );
      payload = {
        ciphertext: encrypted.ciphertextHex,
        ciphertextHex: encrypted.ciphertextHex,
        nonce: encrypted.nonceHex,
        nonceHex: encrypted.nonceHex,
        senderNickname: identity.nickname,
      };
    }

    // 2. Build signed wire envelope
    const envelope = createEnvelope({
      type: PacketType.ROUTED_DATA,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: recipientPubkey.toLowerCase(),
      hopsRemaining: 5,
      hopCount: 0,
      payload,
    });

    envelope.signature = signEnvelope(envelope, identity.secretKeyHex);

    // 3. Save locally first (Honest state: SAVED_LOCALLY)
    const localMessage = {
      id: envelope.packetId,
      packetId: envelope.packetId,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: recipientPubkey.toLowerCase(),
      recipientNickname: isBroadcast ? 'Nearby Public Broadcast' : (recipientNickname || 'Mesh Peer'),
      text: displayText,
      type: msgData.type,
      mediaBase64: msgData.mediaBase64,
      mediaMime: msgData.mediaMime,
      mediaName: msgData.mediaName,
      duration: msgData.duration,
      timestamp: Date.now(),
      deliveryStatus: DeliveryState.SAVED_LOCALLY,
      isOutgoing: true,
      hopsTraveled: 0,
      isBroadcast,
    };

    // Update conversation history
    const existingMessages = await meshStorage.loadMessages(recipientPubkey.toLowerCase());
    existingMessages.push(localMessage);
    await meshStorage.saveMessages(recipientPubkey.toLowerCase(), existingMessages);

    // Update conversation summary
    const conversations = await meshStorage.loadConversations();
    const convIdx = conversations.findIndex(
      (c) => c.recipientPubkey === recipientPubkey.toLowerCase()
    );
    const convSummary = {
      id: recipientPubkey.toLowerCase(),
      recipientPubkey: recipientPubkey.toLowerCase(),
      recipientNickname: recipientNickname || 'Mesh Peer',
      lastMessage: displayText,
      lastTimestamp: Date.now(),
      unreadCount: 0,
    };

    if (convIdx >= 0) {
      conversations[convIdx] = convSummary;
    } else {
      conversations.unshift(convSummary);
    }
    await meshStorage.saveConversations(conversations);

    // 4. Queue into outbox for transmission
    localMessage.deliveryStatus = DeliveryState.QUEUED;
    await meshStorage.saveMessages(recipientPubkey.toLowerCase(), existingMessages);

    // Add to Store-and-Forward queue (25MB bounded, 48h expiration) for epidemic synchronization
    if (!isBroadcast) {
      await meshStorage.addToStoreAndForwardQueue(envelope);
      this.stats.packetsStored++;
    }

    // Mark as seen locally to prevent reflecting back
    await this.markPacketSeen(envelope.packetId, identity.publicKeyHex, envelope.type);

    // 5. Dispatch outbox transmission
    try {
      await meshTransport.broadcastPacket(envelope);
      localMessage.deliveryStatus = DeliveryState.SENT_NEIGHBOR;
      await meshStorage.saveMessages(recipientPubkey.toLowerCase(), existingMessages);
      this.notifyDelivery(localMessage);
      this.stats.packetsSent++;
    } catch {
      // Retains QUEUED status
    }

    return localMessage;
  }

  /**
   * Relay packet with randomized jitter (40-180 ms) to suppress radio collisions
   */
  async relayPacketWithJitter(forwardedEnvelope) {
    const jitterMs = 40 + Math.floor(Math.random() * 140); // 40–180 ms
    setTimeout(async () => {
      try {
        await meshTransport.broadcastPacket(forwardedEnvelope);
        this.stats.packetsRelayed++;
      } catch (err) {
        // Stored in store-and-forward queue; will be synced upon peer encounter
      }
    }, jitterMs);
  }

  /**
   * Epidemic Peer Encounter Sync: Sends 256-byte Bloom Filter summary of stored packets
   */
  async sendSyncSummary(targetPubkey) {
    try {
      const identity = await meshIdentityService.getOrCreateIdentity();
      if (!identity) return;

      // Extract all packet IDs from store-and-forward queue
      const queue = await meshStorage.getStoreAndForwardQueue(500);
      const filter = new BloomFilter();
      for (const item of queue) {
        if (item.packetId) filter.add(item.packetId);
      }
      for (const id of this.recentSeen) {
        filter.add(id);
      }

      const envelope = createEnvelope({
        type: PacketType.SYNC_SUMMARY,
        senderPubkey: identity.publicKeyHex,
        recipientPubkey: targetPubkey || BROADCAST_PUBKEY,
        hopsRemaining: 1, // Single-hop direct exchange
        hopCount: 0,
        payload: {
          bloomFilterHex: filter.toHex(),
          packetCount: queue.length,
          timestamp: Date.now(),
        },
      });

      envelope.signature = signEnvelope(envelope, identity.secretKeyHex);
      if (targetPubkey && targetPubkey !== BROADCAST_PUBKEY) {
        await meshTransport.sendDirect(targetPubkey, envelope);
      } else {
        await meshTransport.broadcastPacket(envelope);
      }
    } catch (err) {
      console.warn('[MeshRouter] sendSyncSummary error:', err?.message);
    }
  }

  /**
   * Handles incoming 0x06=SYNC_SUMMARY Bloom filter from peer
   */
  async handleSyncSummary(envelope) {
    try {
      const bloomHex = envelope.payload?.bloomFilterHex;
      if (!bloomHex) return;
      const remoteFilter = BloomFilter.fromHex(bloomHex);

      const storedPackets = await meshStorage.getStoreAndForwardQueue(100);
      const missingForPeer = [];

      for (const stored of storedPackets) {
        if (stored.packetId && !remoteFilter.has(stored.packetId)) {
          missingForPeer.push(stored);
        }
      }

      // Transmit missing packets to peer with randomized jitter spacing (30-110 ms)
      let delayMs = 30 + Math.floor(Math.random() * 40);
      for (const item of missingForPeer) {
        setTimeout(async () => {
          try {
            const rawPacket = item.rawHex ? JSON.parse(item.rawHex) : null;
            if (rawPacket && rawPacket.hopsRemaining > 0) {
              await meshTransport.sendDirect(envelope.senderPubkey, rawPacket);
              this.stats.packetsRelayed++;
            }
          } catch {}
        }, delayMs);
        delayMs += 30 + Math.floor(Math.random() * 80); // 30–110 ms spacing
      }
    } catch (err) {
      console.warn('[MeshRouter] handleSyncSummary error:', err?.message);
    }
  }

  /**
   * Inbound envelope router & multi-hop handler
   */
  async handleIncomingEnvelope(envelope) {
    const check = validateEnvelope(envelope);
    if (!check.valid) return;

    // Check anti-spam: is sender blocked by user?
    const isBlocked = await meshStorage.isPeerBlocked(envelope.senderPubkey);
    if (isBlocked) return;

    // Deduplication (loop and broadcast storm prevention)
    const alreadySeen = await this.isPacketSeen(envelope.packetId);
    if (alreadySeen) {
      this.stats.droppedDuplicates++;
      return;
    }
    await this.markPacketSeen(envelope.packetId, envelope.senderPubkey, envelope.type);

    // Cryptographic signature verification (Outer Ed25519)
    const isValidSig = verifyEnvelopeSignature(envelope);
    if (!isValidSig) {
      this.recordPeerAnomaly(envelope.senderPubkey);
      return;
    }

    const identity = await meshIdentityService.getOrCreateIdentity();
    if (!identity) return;

    const myPub = identity.publicKeyHex.toLowerCase();
    const recipientPub = envelope.recipientPubkey.toLowerCase();
    const senderPub = envelope.senderPubkey.toLowerCase();

    // CASE 0: Peer Discovery Beacons and Announcements
    if (envelope.type === PacketType.BEACON || envelope.type === PacketType.ANNOUNCE) {
      if (senderPub !== myPub) {
        const senderNick = envelope.payload?.nickname || `Peer_${senderPub.substring(0, 6)}`;
        const peers = await meshStorage.loadPeers();
        const idx = peers.findIndex((p) => p.publicKeyHex.toLowerCase() === senderPub);
        const updatedPeer = {
          publicKeyHex: senderPub,
          nickname: senderNick,
          status: 'discovered',
          lastSeen: Date.now(),
          hopDistance: envelope.hopCount || 0,
          reachability: envelope.hopCount === 0 ? 'direct' : 'relayed',
        };
        if (idx >= 0) {
          peers[idx] = { ...peers[idx], ...updatedPeer };
        } else {
          peers.unshift(updatedPeer);
        }
        await meshStorage.savePeers(peers);
        this.notifyPeersUpdated();

        // Immediate announce back so pairing completes in < 1 sec
        if (envelope.type === PacketType.BEACON) {
          this.sendAnnounce(senderPub);
          // Trigger Epidemic Sync with encountered peer
          this.sendSyncSummary(senderPub);
        }
      }
      return;
    }

    // CASE 1: Epidemic Peer Sync Summary (0x06=SYNC_SUMMARY)
    if (envelope.type === PacketType.SYNC_SUMMARY) {
      await this.handleSyncSummary(envelope);
      return;
    }

    // CASE 2: Packet is for ME or for EVERYONE (Nearby Public Broadcast)
    const isBroadcast = recipientPub === BROADCAST_PUBKEY;
    if (recipientPub === myPub || isBroadcast) {
      if (envelope.type === PacketType.ROUTED_DATA) {
        try {
          let text = '';
          let type = 'text';
          let mediaBase64 = null;
          let mediaMime = null;
          let mediaName = null;
          let duration = null;

          if (isBroadcast) {
            text = envelope.payload?.text || '';
            type = envelope.payload?.type || 'text';
            mediaBase64 = envelope.payload?.mediaBase64 || null;
            mediaMime = envelope.payload?.mediaMime || null;
            mediaName = envelope.payload?.mediaName || null;
            duration = envelope.payload?.duration || null;
          } else {
            const cHex = envelope.payload?.ciphertextHex || envelope.payload?.ciphertext;
            const nHex = envelope.payload?.nonceHex || envelope.payload?.nonce;
            if (!cHex || !nHex) return;

            const decryptedStr = decryptDirectPayload(
              cHex,
              nHex,
              identity.secretKeyHex,
              envelope.senderPubkey
            );

            try {
              const parsed = JSON.parse(decryptedStr);
              text = parsed.text || '';
              type = parsed.type || 'text';
              mediaBase64 = parsed.mediaBase64 || null;
              mediaMime = parsed.mediaMime || null;
              mediaName = parsed.mediaName || null;
              duration = parsed.duration || null;
            } catch {
              text = decryptedStr;
              type = 'text';
            }
          }

          if (!text && !mediaBase64) return;

          const senderNick = envelope.payload?.senderNickname || 'Nearby Peer';
          const targetConvPubkey = isBroadcast ? BROADCAST_PUBKEY : senderPub;
          const targetConvNick = isBroadcast ? 'Nearby Public Broadcast' : senderNick;

          const incomingMsg = {
            id: envelope.packetId,
            packetId: envelope.packetId,
            senderPubkey: senderPub,
            recipientPubkey: isBroadcast ? BROADCAST_PUBKEY : myPub,
            senderNickname: senderNick,
            text: text || (type === 'image' ? '📷 Photo' : type === 'voice' ? '🎤 Voice Note' : '📎 Attachment'),
            type,
            mediaBase64,
            mediaMime,
            mediaName,
            duration,
            timestamp: envelope.timestamp,
            deliveryStatus: DeliveryState.DELIVERED_ACK,
            isOutgoing: false,
            hopsTraveled: envelope.hopCount,
            isBroadcast,
          };

          const msgs = await meshStorage.loadMessages(targetConvPubkey);
          msgs.push(incomingMsg);
          await meshStorage.saveMessages(targetConvPubkey, msgs);

          // Update conversation list
          const conversations = await meshStorage.loadConversations();
          const convIdx = conversations.findIndex((c) => c.recipientPubkey === targetConvPubkey);
          const summary = {
            id: targetConvPubkey,
            recipientPubkey: targetConvPubkey,
            recipientNickname: targetConvNick,
            lastMessage: isBroadcast ? `${senderNick}: ${text}` : text,
            lastTimestamp: Date.now(),
            unreadCount: (conversations[convIdx]?.unreadCount || 0) + 1,
            isBroadcast,
          };
          if (convIdx >= 0) {
            conversations[convIdx] = summary;
          } else {
            conversations.unshift(summary);
          }
          await meshStorage.saveConversations(conversations);

          // Auto-discover sender in peers list
          if (senderPub && senderPub !== myPub) {
            const peers = await meshStorage.loadPeers();
            const pIdx = peers.findIndex((p) => p.publicKeyHex.toLowerCase() === senderPub);
            const discoveredPeer = {
              publicKeyHex: senderPub,
              nickname: senderNick,
              status: 'discovered',
              lastSeen: Date.now(),
              hopDistance: envelope.hopCount || 0,
              reachability: envelope.hopCount === 0 ? 'direct' : 'relayed',
            };
            if (pIdx >= 0) {
              peers[pIdx] = { ...peers[pIdx], ...discoveredPeer };
            } else {
              peers.unshift(discoveredPeer);
            }
            await meshStorage.savePeers(peers);
            this.notifyPeersUpdated();
          }

          // Send back cryptographically signed DELIVERY_ACK (0x05) if 1-on-1
          if (!isBroadcast) {
            await this.sendEndToEndAck(envelope);
          } else {
            // Also relay broadcast forward if hops remaining
            if (envelope.hopsRemaining > 0 && envelope.expiresAt > Date.now()) {
              const forwarded = {
                ...envelope,
                hopsRemaining: envelope.hopsRemaining - 1,
                hopCount: envelope.hopCount + 1,
              };
              this.relayPacketWithJitter(forwarded);
            }
          }

          this.notifyMessage(incomingMsg);
        } catch (e) {
          // Decryption failed or tampered packet; drop safely
        }
      } else if (
        envelope.type === PacketType.DELIVERY_ACK ||
        envelope.type === PacketType.END_TO_END_ACK ||
        envelope.type === PacketType.HOP_ACK
      ) {
        // Mark outgoing message as acknowledged by recipient
        const ackPacketId = envelope.payload?.acknowledgedPacketId || envelope.payload?.originalPacketId;
        const senderPub = envelope.senderPubkey.toLowerCase();
        if (ackPacketId) {
          // 1. Purge acknowledged packet from local store-and-forward queue
          await meshStorage.purgeDeliveredFromStoreAndForward(ackPacketId);

          // 2. Update local conversation if we are the sender
          const msgs = await meshStorage.loadMessages(senderPub);
          let updated = false;
          for (const m of msgs) {
            if (m.packetId === ackPacketId) {
              m.deliveryStatus = DeliveryState.DELIVERED_ACK;
              updated = true;
              this.notifyDelivery(m);
              this.stats.acksVerified++;
            }
          }
          if (updated) {
            await meshStorage.saveMessages(senderPub, msgs);
          }

          // 3. If we are an intermediate node relaying an ACK, jitter forward it
          if (recipientPub !== myPub && envelope.hopsRemaining > 0) {
            const forwardedAck = {
              ...envelope,
              hopsRemaining: envelope.hopsRemaining - 1,
              hopCount: envelope.hopCount + 1,
            };
            this.relayPacketWithJitter(forwardedAck);
          }
        }
      }
      return;
    }

    // CASE 3: Packet is for SOMEONE ELSE -> Store-and-Forward & Multi-hop Relay
    const settings = await meshStorage.loadSettings();
    if (!settings.relayEnabled) return; // User opted out of relaying

    if (envelope.hopsRemaining > 0 && envelope.expiresAt > Date.now()) {
      const forwardedEnvelope = {
        ...envelope,
        hopsRemaining: envelope.hopsRemaining - 1,
        hopCount: envelope.hopCount + 1,
      };

      // Add to bounded store-and-forward queue (25MB bounded, 48h expiration)
      await meshStorage.addToStoreAndForwardQueue(forwardedEnvelope);
      this.stats.packetsStored++;

      // Jittered broadcast forwarding (40-180 ms) to suppress radio collisions
      await this.relayPacketWithJitter(forwardedEnvelope);
    }
  }

  /**
   * Destination-signed cryptographic delivery receipt (0x05=DELIVERY_ACK)
   */
  async sendEndToEndAck(originalEnvelope) {
    const identity = await meshIdentityService.getOrCreateIdentity();
    if (!identity) return;

    const ackEnvelope = createEnvelope({
      type: PacketType.DELIVERY_ACK,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: originalEnvelope.senderPubkey,
      hopsRemaining: 5,
      hopCount: 0,
      payload: {
        acknowledgedPacketId: originalEnvelope.packetId,
        originalPacketId: originalEnvelope.packetId,
        deliveredTimestamp: Date.now(),
        timestamp: Date.now(),
      },
    });

    ackEnvelope.signature = signEnvelope(ackEnvelope, identity.secretKeyHex);
    await meshTransport.broadcastPacket(ackEnvelope);
  }

  notifyMessage(msg) {
    for (const cb of this.messageListeners) {
      try {
        cb(msg);
      } catch (e) {}
    }
  }

  notifyDelivery(msg) {
    for (const cb of this.deliveryListeners) {
      try {
        cb(msg);
      } catch (e) {}
    }
  }
}

export const meshRouter = new MeshRouter();
meshRouter.initialize();
export default meshRouter;