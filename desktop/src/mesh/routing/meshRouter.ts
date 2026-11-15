import {
  PacketType,
  createEnvelope,
  MeshEnvelope,
  BROADCAST_PUBKEY,
  DeliveryState,
} from '../protocol/wireProtocol';
import {
  signPacket,
  verifyPacketSignature,
  signEnvelope,
  verifyEnvelopeSignature,
  encryptPayload,
  decryptPayload,
} from '../crypto/meshCrypto';
import meshStorage, { MeshMessage, MeshConversation } from '../storage/meshStorage';
import meshTransport, { TransportState } from '../transport/meshTransport';
import { BloomFilter } from '@clearfeed/mesh-core';

export type DeliveryListener = (message: MeshMessage) => void;
export type PeerListener = () => void;

export { DeliveryState };

class DesktopMeshRouter {
  private messageListeners: Set<DeliveryListener> = new Set();
  private deliveryListeners: Set<DeliveryListener> = new Set();
  private peerListeners: Set<PeerListener> = new Set();
  private beaconIntervalTimer: any = null;

  // In-memory LRU deduplication
  private recentSeen: Set<string> = new Set();
  private MAX_RECENT_SEEN = 5000;

  // Node telemetry & stats
  public stats = {
    packetsSent: 0,
    packetsRelayed: 0,
    packetsStored: 0,
    acksVerified: 0,
    droppedInvalidSignatures: 0,
    droppedDuplicates: 0,
  };

  // Anti-Spam Relay Guard: peer anomaly score map
  public peerAnomalyScores: Map<string, number> = new Map();

  // Battery-Saver Scan Mode toggle
  public batterySaverMode = false;

  constructor() {
    meshTransport.onPacket((envelope) => this.handleIncomingPacket(envelope));
    this.startBeaconing(8);
  }

  public onMessageReceived(cb: DeliveryListener): () => void {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  public onDeliveryUpdated(cb: DeliveryListener): () => void {
    this.deliveryListeners.add(cb);
    return () => this.deliveryListeners.delete(cb);
  }

  public onPeersUpdated(cb: PeerListener): () => void {
    this.peerListeners.add(cb);
    return () => this.peerListeners.delete(cb);
  }

  // --- STATS & METRICS ---
  public getStats() {
    return { ...this.stats };
  }

  public resetStats() {
    this.stats = {
      packetsSent: 0,
      packetsRelayed: 0,
      packetsStored: 0,
      acksVerified: 0,
      droppedInvalidSignatures: 0,
      droppedDuplicates: 0,
    };
  }

  public getPeerAnomalyScores(): Record<string, number> {
    const obj: Record<string, number> = {};
    for (const [k, v] of this.peerAnomalyScores.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  public recordPeerAnomaly(pubkeyHex: string): void {
    if (!pubkeyHex) return;
    const key = pubkeyHex.toLowerCase();
    const count = (this.peerAnomalyScores.get(key) || 0) + 1;
    this.peerAnomalyScores.set(key, count);
    this.stats.droppedInvalidSignatures++;
  }

  public async getStoreAndForwardStats() {
    return await meshStorage.getStoreAndForwardStats();
  }

  // --- BATTERY-SAVER SCAN MODE ---
  public isBatterySaverMode(): boolean {
    return this.batterySaverMode;
  }

  public setBatterySaverMode(enabled: boolean): void {
    this.batterySaverMode = !!enabled;
    const intervalSec = this.batterySaverMode ? 30 : 8;
    this.startBeaconing(intervalSec);
  }

  // --- DEDUPLICATION ---
  public async isPacketSeen(packetId: string): Promise<boolean> {
    if (!packetId) return true;
    if (this.recentSeen.has(packetId)) return true;
    const seen = await meshStorage.isPacketSeen(packetId);
    if (seen) {
      this.recentSeen.add(packetId);
      return true;
    }
    return false;
  }

  public async markPacketSeen(packetId: string): Promise<void> {
    if (!packetId) return;
    if (this.recentSeen.size >= this.MAX_RECENT_SEEN) {
      const iter = this.recentSeen.values();
      for (let i = 0; i < Math.floor(this.MAX_RECENT_SEEN / 2); i++) {
        this.recentSeen.delete(iter.next().value);
      }
    }
    this.recentSeen.add(packetId);
    await meshStorage.markPacketSeen(packetId);
  }

  /**
   * Broadcast an unencrypted peer presence beacon on the local transport
   */
  public async broadcastBeacon(): Promise<void> {
    try {
      const identity = await meshStorage.loadIdentity();
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
    } catch (err: any) {
      console.warn('[MeshRouter] Beacon broadcast error:', err?.message);
    }
  }

  public startBeaconing(intervalSec = 8): void {
    this.stopBeaconing();
    this.broadcastBeacon();
    this.beaconIntervalTimer = setInterval(() => {
      this.broadcastBeacon();
    }, intervalSec * 1000);
  }

  public stopBeaconing(): void {
    if (this.beaconIntervalTimer) {
      clearInterval(this.beaconIntervalTimer);
      this.beaconIntervalTimer = null;
    }
  }

  public async sendAnnounce(targetPubkey: string): Promise<void> {
    try {
      const identity = await meshStorage.loadIdentity();
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
   * Relay packet with randomized jitter (40-180 ms) to prevent broadcast storms
   */
  public async relayPacketWithJitter(forwardedEnvelope: MeshEnvelope): Promise<void> {
    const jitterMs = 40 + Math.floor(Math.random() * 140); // 40–180 ms
    setTimeout(async () => {
      try {
        await meshTransport.broadcastPacket(forwardedEnvelope);
        this.stats.packetsRelayed++;
      } catch (err) {
        // Kept in store-and-forward queue; will sync on encounter
      }
    }, jitterMs);
  }

  /**
   * Epidemic Peer Encounter Sync: Sends 256-byte Bloom Filter summary of stored packets
   */
  public async sendSyncSummary(targetPubkey: string): Promise<void> {
    try {
      const identity = await meshStorage.loadIdentity();
      if (!identity) return;

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
        hopsRemaining: 1,
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
    } catch (err: any) {
      console.warn('[MeshRouter] sendSyncSummary error:', err?.message);
    }
  }

  /**
   * Handles incoming 0x06=SYNC_SUMMARY Bloom filter from peer
   */
  public async handleSyncSummary(envelope: MeshEnvelope): Promise<void> {
    try {
      const bloomHex = envelope.payload?.bloomFilterHex;
      if (!bloomHex) return;
      const remoteFilter = BloomFilter.fromHex(bloomHex);

      const storedPackets = await meshStorage.getStoreAndForwardQueue(100);
      const missingForPeer: any[] = [];

      for (const stored of storedPackets) {
        if (stored.packetId && !remoteFilter.has(stored.packetId)) {
          missingForPeer.push(stored);
        }
      }

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
    } catch (err: any) {
      console.warn('[MeshRouter] handleSyncSummary error:', err?.message);
    }
  }

  /**
   * Encrypts and transmits a direct end-to-end user message
   * Follows strict Honest Delivery State progression:
   * SAVED_LOCALLY -> QUEUED -> SENT_NEIGHBOR
   * Transitions to DELIVERED_ACK ONLY upon receipt of destination's Ed25519-signed ACK
   */
  public async sendMessage({
    recipientPubkey,
    recipientNickname,
    text,
  }: {
    recipientPubkey: string;
    recipientNickname: string;
    text: string;
  }): Promise<MeshMessage> {
    const identity = await meshStorage.loadIdentity();
    if (!identity) {
      throw new Error('Local Mesh identity not initialized');
    }

    const isBroadcast = recipientPubkey.toLowerCase() === BROADCAST_PUBKEY.toLowerCase();
    let payload: any;

    if (isBroadcast) {
      payload = {
        text,
        senderNickname: identity.nickname || 'Nearby Peer',
      };
    } else {
      const { ciphertextHex, nonceHex } = encryptPayload(
        identity.secretKeyHex,
        recipientPubkey,
        text
      );
      payload = {
        ciphertext: ciphertextHex,
        ciphertextHex: ciphertextHex,
        nonce: nonceHex,
        nonceHex: nonceHex,
        senderNickname: identity.nickname,
      };
    }

    const envelope = createEnvelope({
      type: PacketType.ROUTED_DATA,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: recipientPubkey.toLowerCase(),
      hopsRemaining: 5,
      hopCount: 0,
      payload,
    });

    envelope.signature = signEnvelope(envelope, identity.secretKeyHex);

    // 1. Initial State: SAVED_LOCALLY
    const message: MeshMessage = {
      id: envelope.packetId,
      conversationId: recipientPubkey.toLowerCase(),
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: recipientPubkey.toLowerCase(),
      senderNickname: identity.nickname,
      text,
      timestamp: envelope.timestamp,
      isOutgoing: true,
      deliveryState: DeliveryState.SAVED_LOCALLY,
      hopCount: 0,
    };

    // Store outgoing message
    const existingMessages = await meshStorage.loadMessages(recipientPubkey);
    await meshStorage.saveMessages(recipientPubkey, [...existingMessages, message]);

    // Update conversation list
    await this.updateConversationSnippet(recipientPubkey, recipientNickname, text, envelope.timestamp);

    // 2. Queue in outbox
    message.deliveryState = DeliveryState.QUEUED;
    const msgsQueued = await meshStorage.loadMessages(recipientPubkey);
    await meshStorage.saveMessages(
      recipientPubkey,
      msgsQueued.map((m) => (m.id === message.id ? { ...m, deliveryState: DeliveryState.QUEUED } : m))
    );

    // Add to Store-and-Forward queue for epidemic synchronization
    if (!isBroadcast) {
      await meshStorage.addToStoreAndForwardQueue(envelope);
      this.stats.packetsStored++;
    }

    // Mark seen locally
    await this.markPacketSeen(envelope.packetId);

    // 3. Transmit to neighbor: transitions to SENT_NEIGHBOR (Strict Invariant: NEVER DELIVERED_ACK here!)
    try {
      if (isBroadcast) {
        await meshTransport.broadcastPacket(envelope);
      } else {
        await meshTransport.sendDirect(recipientPubkey, envelope);
      }
      message.deliveryState = DeliveryState.SENT_NEIGHBOR;
      const msgsSent = await meshStorage.loadMessages(recipientPubkey);
      await meshStorage.saveMessages(
        recipientPubkey,
        msgsSent.map((m) => (m.id === message.id ? { ...m, deliveryState: DeliveryState.SENT_NEIGHBOR } : m))
      );
      this.deliveryListeners.forEach((cb) => cb(message));
      this.stats.packetsSent++;
    } catch {
      // Retains QUEUED status
    }

    return message;
  }

  /**
   * Destination-signed cryptographic delivery receipt (0x05=DELIVERY_ACK)
   */
  public async sendEndToEndAck(originalEnvelope: MeshEnvelope): Promise<void> {
    const identity = await meshStorage.loadIdentity();
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

  /**
   * Inbound envelope dispatch and multi-hop relay processing
   */
  public async handleIncomingPacket(envelope: MeshEnvelope): Promise<void> {
    if (!envelope || !envelope.packetId) return;

    // Check blocked peer
    const isBlocked = await meshStorage.isPeerBlocked(envelope.senderPubkey);
    if (isBlocked) return;

    // Deduplication check
    const isSeen = await this.isPacketSeen(envelope.packetId);
    if (isSeen) {
      this.stats.droppedDuplicates++;
      return;
    }
    await this.markPacketSeen(envelope.packetId);

    // Cryptographic signature verification
    const isValid = verifyEnvelopeSignature(envelope);
    if (!isValid) {
      this.recordPeerAnomaly(envelope.senderPubkey);
      return;
    }

    const identity = await meshStorage.loadIdentity();
    if (!identity) return;

    const myPubkey = identity.publicKeyHex.toLowerCase();
    const senderPub = envelope.senderPubkey.toLowerCase();
    const recipientPub = envelope.recipientPubkey.toLowerCase();

    // CASE 0: Peer Discovery Beacons and Announcements
    if (envelope.type === PacketType.BEACON || envelope.type === PacketType.ANNOUNCE) {
      if (senderPub !== myPubkey) {
        const nick = envelope.payload?.nickname || `Peer_${senderPub.substring(0, 6)}`;

        await meshStorage.upsertPeer({
          publicKeyHex: senderPub,
          nickname: nick,
          status: 'discovered',
          lastSeen: Date.now(),
          hopDistance: envelope.hopCount || 0,
        });

        meshTransport.setState(TransportState.CONNECTED_PEERS);
        this.peerListeners.forEach((cb) => cb());

        if (envelope.type === PacketType.BEACON) {
          this.sendAnnounce(senderPub);
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

    const isBroadcast = recipientPub === BROADCAST_PUBKEY.toLowerCase();
    const isForMe = recipientPub === myPubkey || isBroadcast;

    // CASE 2: Packet is for ME or BROADCAST
    if (isForMe && envelope.type === PacketType.ROUTED_DATA) {
      try {
        let plaintext = '';
        if (isBroadcast) {
          plaintext = envelope.payload?.text || '';
        } else {
          const ciphertext = envelope.payload?.ciphertext || envelope.payload?.ciphertextHex;
          const nonce = envelope.payload?.nonce || envelope.payload?.nonceHex;
          if (!ciphertext || !nonce) return;

          plaintext = decryptPayload(
            identity.secretKeyHex,
            envelope.senderPubkey,
            ciphertext,
            nonce
          );
        }

        if (!plaintext) return;

        const senderNickname = envelope.payload?.senderNickname || 'Nearby Peer';
        const targetConvPubkey = isBroadcast ? BROADCAST_PUBKEY.toLowerCase() : senderPub;
        const targetConvNick = isBroadcast ? 'Nearby Public Broadcast' : senderNickname;

        const msg: MeshMessage = {
          id: envelope.packetId,
          conversationId: targetConvPubkey,
          senderPubkey: senderPub,
          recipientPubkey: isBroadcast ? BROADCAST_PUBKEY.toLowerCase() : myPubkey,
          senderNickname,
          text: plaintext,
          timestamp: envelope.timestamp,
          isOutgoing: false,
          deliveryState: DeliveryState.DELIVERED_ACK,
          hopCount: envelope.hopCount,
        };

        const existing = await meshStorage.loadMessages(targetConvPubkey);
        await meshStorage.saveMessages(targetConvPubkey, [...existing, msg]);

        await this.updateConversationSnippet(
          targetConvPubkey,
          targetConvNick,
          isBroadcast ? `${senderNickname}: ${plaintext}` : plaintext,
          envelope.timestamp
        );

        await meshStorage.upsertPeer({
          publicKeyHex: senderPub,
          nickname: senderNickname || 'Nearby Peer',
          status: 'discovered',
          lastSeen: envelope.timestamp,
          hopDistance: envelope.hopCount,
        });
        this.peerListeners.forEach((cb) => cb());

        // Send back cryptographically signed DELIVERY_ACK if 1-on-1
        if (!isBroadcast) {
          await this.sendEndToEndAck(envelope);
        } else {
          // If broadcast and hops remaining, relay with jitter
          if (envelope.hopsRemaining > 0 && envelope.expiresAt > Date.now()) {
            const forwarded = {
              ...envelope,
              hopsRemaining: envelope.hopsRemaining - 1,
              hopCount: envelope.hopCount + 1,
            };
            this.relayPacketWithJitter(forwarded);
          }
        }

        this.messageListeners.forEach((cb) => cb(msg));
      } catch (err: any) {
        console.warn('[MeshRouter] Failed to process message:', err.message);
      }
    } else if (
      (envelope.type as number) === (PacketType.DELIVERY_ACK as number) ||
      (envelope.type as number) === 0x05
    ) {
      // Destination-signed delivery ACK received
      const ackPacketId = envelope.payload?.acknowledgedPacketId || envelope.payload?.originalPacketId;
      if (ackPacketId) {
        // 1. Purge from local store-and-forward queue
        await meshStorage.purgeDeliveredFromStoreAndForward(ackPacketId);

        // 2. If this node is the sender, transition to DELIVERED_ACK
        const msgs = await meshStorage.loadMessages(senderPub);
        let updated = false;
        for (const m of msgs) {
          if (m.id === ackPacketId) {
            m.deliveryState = DeliveryState.DELIVERED_ACK;
            updated = true;
            this.stats.acksVerified++;
            this.deliveryListeners.forEach((cb) => cb(m));
          }
        }
        if (updated) {
          await meshStorage.saveMessages(senderPub, msgs);
        }

        // 3. If intermediate node, relay ACK with jitter
        if (recipientPub !== myPubkey && envelope.hopsRemaining > 0) {
          const forwardedAck = {
            ...envelope,
            hopsRemaining: envelope.hopsRemaining - 1,
            hopCount: envelope.hopCount + 1,
          };
          this.relayPacketWithJitter(forwardedAck);
        }
      }
    } else if (!isForMe && envelope.hopsRemaining > 0 && envelope.expiresAt > Date.now()) {
      // Relaying multi-hop envelope
      const settings = await meshStorage.loadSettings();
      if (settings.relayEnabled) {
        const forwarded = {
          ...envelope,
          hopsRemaining: envelope.hopsRemaining - 1,
          hopCount: envelope.hopCount + 1,
        };

        // Add to store-and-forward queue (25MB bounded, 48h expiration)
        await meshStorage.addToStoreAndForwardQueue(forwarded);
        this.stats.packetsStored++;

        // Relay with randomized jitter (40-180 ms)
        await this.relayPacketWithJitter(forwarded);
      }
    }
  }

  private async updateConversationSnippet(
    peerPubkey: string,
    nickname: string,
    lastText: string,
    timestamp: number
  ): Promise<void> {
    const convs = await meshStorage.loadConversations();
    const existingIndex = convs.findIndex(
      (c) => c.peerPubkey.toLowerCase() === peerPubkey.toLowerCase()
    );

    const updatedItem: MeshConversation = {
      peerPubkey: peerPubkey.toLowerCase(),
      nickname,
      lastMessageSnippet: lastText,
      lastTimestamp: timestamp,
      unreadCount: 0,
    };

    let updatedConvs: MeshConversation[];
    if (existingIndex >= 0) {
      updatedConvs = [
        updatedItem,
        ...convs.filter((_, idx) => idx !== existingIndex),
      ];
    } else {
      updatedConvs = [updatedItem, ...convs];
    }

    await meshStorage.saveConversations(updatedConvs);
  }
}

export const meshRouter = new DesktopMeshRouter();
export { BROADCAST_PUBKEY };
export default meshRouter;