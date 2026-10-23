import meshStorage from '../storage/meshStorage.js';
import meshTransport from '../transport/meshTransport.js';
import meshIdentityService from '../identity/meshIdentityService.js';
import {
  PacketType,
  createEnvelope,
  validateEnvelope,
  BROADCAST_PUBKEY,
} from '../protocol/wireProtocol.js';
import {
  encryptDirectPayload,
  decryptDirectPayload,
  signEnvelope,
  verifyEnvelopeSignature,
} from '../crypto/meshCrypto.js';

export const DeliveryState = {
  SAVED_LOCALLY: 'SAVED_LOCALLY',
  QUEUED: 'QUEUED',
  SENT_NEIGHBOR: 'SENT_NEIGHBOR',
  RELAYED: 'RELAYED',
  DELIVERED_ACK: 'DELIVERED_ACK',
  FAILED_EXPIRED: 'FAILED_EXPIRED',
};

class MeshRouter {
  constructor() {
    this.messageListeners = new Set();
    this.deliveryListeners = new Set();
    this.peerListeners = new Set();
    this.beaconTimer = null;
  }

  initialize() {
    meshTransport.onPacket((envelope) => this.handleIncomingEnvelope(envelope));
    this.startBeaconing(8);
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
   * Send an end-to-end encrypted message to a peer
   */
  async sendMessage({ recipientPubkey, recipientNickname, text }) {
    const identity = await meshIdentityService.getOrCreateIdentity();
    if (!identity) throw new Error('Local Mesh identity not available');

    const trimmedText = text.trim();
    if (!trimmedText) throw new Error('Message cannot be empty');

    // 1. End-to-end encrypt payload
    const encrypted = encryptDirectPayload(
      trimmedText,
      identity.secretKeyHex,
      recipientPubkey
    );

    // 2. Build signed wire envelope
    const envelope = createEnvelope({
      type: PacketType.ROUTED_DATA,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: recipientPubkey.toLowerCase(),
      hopsRemaining: 5,
      hopCount: 0,
      payload: {
        ciphertext: encrypted.ciphertextHex,
        ciphertextHex: encrypted.ciphertextHex,
        nonce: encrypted.nonceHex,
        nonceHex: encrypted.nonceHex,
        senderNickname: identity.nickname,
      },
    });

    envelope.signature = signEnvelope(envelope, identity.secretKeyHex);

    // 3. Save locally first (Honest state: SAVED_LOCALLY)
    const localMessage = {
      id: envelope.packetId,
      packetId: envelope.packetId,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: recipientPubkey.toLowerCase(),
      recipientNickname: recipientNickname || 'Mesh Peer',
      text: trimmedText,
      timestamp: Date.now(),
      deliveryStatus: DeliveryState.SAVED_LOCALLY,
      isOutgoing: true,
      hopsTraveled: 0,
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
      lastMessage: trimmedText,
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

    // Dispatch outbox transmission
    try {
      await meshTransport.broadcastPacket(envelope);
      localMessage.deliveryStatus = DeliveryState.SENT_NEIGHBOR;
      await meshStorage.saveMessages(recipientPubkey.toLowerCase(), existingMessages);
      this.notifyDelivery(localMessage);
    } catch {
      // Retains QUEUED status
    }

    return localMessage;
  }

  /**
   * Inbound envelope router & multi-hop handler
   */
  async handleIncomingEnvelope(envelope) {
    const check = validateEnvelope(envelope);
    if (!check.valid) return;

    // Check deduplication (loop prevention)
    const alreadySeen = await meshStorage.isPacketSeen(envelope.packetId);
    if (alreadySeen) return;
    await meshStorage.markPacketSeen(envelope.packetId);

    // Verify digital signature
    const isValidSig = verifyEnvelopeSignature(envelope);
    if (!isValidSig) return;

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
        }
      }
      return;
    }

    // CASE A: Packet is for ME
    if (recipientPub === myPub) {
      if (envelope.type === PacketType.ROUTED_DATA) {
          const cHex = envelope.payload?.ciphertextHex || envelope.payload?.ciphertext;
          const nHex = envelope.payload?.nonceHex || envelope.payload?.nonce;
          if (!cHex || !nHex) return;

          const decrypted = decryptDirectPayload(
            cHex,
            nHex,
            identity.secretKeyHex,
            envelope.senderPubkey
          );

          const senderPub = envelope.senderPubkey.toLowerCase();
          const senderNick = envelope.payload.senderNickname || 'Nearby Peer';

          const incomingMsg = {
            id: envelope.packetId,
            packetId: envelope.packetId,
            senderPubkey: senderPub,
            recipientPubkey: myPub,
            senderNickname: senderNick,
            text: decrypted,
            timestamp: envelope.timestamp,
            deliveryStatus: DeliveryState.DELIVERED_ACK,
            isOutgoing: false,
            hopsTraveled: envelope.hopCount,
          };

          const msgs = await meshStorage.loadMessages(senderPub);
          msgs.push(incomingMsg);
          await meshStorage.saveMessages(senderPub, msgs);

          // Update conversation list
          const conversations = await meshStorage.loadConversations();
          const convIdx = conversations.findIndex((c) => c.recipientPubkey === senderPub);
          const summary = {
            id: senderPub,
            recipientPubkey: senderPub,
            recipientNickname: senderNick,
            lastMessage: decrypted,
            lastTimestamp: Date.now(),
            unreadCount: (conversations[convIdx]?.unreadCount || 0) + 1,
          };
          if (convIdx >= 0) {
            conversations[convIdx] = summary;
          } else {
            conversations.unshift(summary);
          }
          await meshStorage.saveConversations(conversations);

          // Send back cryptographically signed END_TO_END_ACK
          await this.sendEndToEndAck(envelope);

          this.notifyMessage(incomingMsg);
        } catch (e) {
          // Decryption failed or tampered packet; drop safely
        }
      } else if (envelope.type === PacketType.END_TO_END_ACK) {
        // Mark outgoing message as acknowledged by recipient
        const ackPacketId = envelope.payload?.acknowledgedPacketId;
        const senderPub = envelope.senderPubkey.toLowerCase();
        if (ackPacketId) {
          const msgs = await meshStorage.loadMessages(senderPub);
          let updated = false;
          for (const m of msgs) {
            if (m.packetId === ackPacketId) {
              m.deliveryStatus = DeliveryState.DELIVERED_ACK;
              updated = true;
              this.notifyDelivery(m);
            }
          }
          if (updated) {
            await meshStorage.saveMessages(senderPub, msgs);
          }
        }
      }
      return;
    }

    // CASE B: Packet is for SOMEONE ELSE -> Multi-hop Relay
    const settings = await meshStorage.loadSettings();
    if (!settings.relayEnabled) return; // User opted out of relaying

    if (envelope.hopsRemaining > 0 && envelope.expiresAt > Date.now()) {
      const forwardedEnvelope = {
        ...envelope,
        hopsRemaining: envelope.hopsRemaining - 1,
        hopCount: envelope.hopCount + 1,
      };

      // Add to bounded store-and-forward relay cache
      const relayCache = await meshStorage.loadRelayCache();
      relayCache.push(forwardedEnvelope);
      await meshStorage.saveRelayCache(relayCache);

      // Attempt broadcast forwarding to neighboring peers
      try {
        await meshTransport.broadcastPacket(forwardedEnvelope);
      } catch {
        // Will be forwarded upon next peer discovery event
      }
    }
  }

  async sendEndToEndAck(originalEnvelope) {
    const identity = await meshIdentityService.getOrCreateIdentity();
    if (!identity) return;

    const ackEnvelope = createEnvelope({
      type: PacketType.END_TO_END_ACK,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: originalEnvelope.senderPubkey,
      hopsRemaining: 5,
      hopCount: 0,
      payload: {
        acknowledgedPacketId: originalEnvelope.packetId,
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
