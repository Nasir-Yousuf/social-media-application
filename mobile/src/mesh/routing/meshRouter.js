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
  }

  initialize() {
    meshTransport.onPacket((envelope) => this.handleIncomingEnvelope(envelope));
  }

  onMessageReceived(cb) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  onDeliveryUpdated(cb) {
    this.deliveryListeners.add(cb);
    return () => this.deliveryListeners.delete(cb);
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
        ciphertextHex: encrypted.ciphertextHex,
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

    // CASE A: Packet is for ME
    if (recipientPub === myPub) {
      if (envelope.type === PacketType.ROUTED_DATA) {
        try {
          const decrypted = decryptDirectPayload(
            envelope.payload.ciphertextHex,
            envelope.payload.nonceHex,
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
