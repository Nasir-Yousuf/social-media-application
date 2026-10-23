import {
  PacketType,
  createEnvelope,
  MeshEnvelope,
  BROADCAST_PUBKEY,
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

export type DeliveryListener = (message: MeshMessage) => void;
export type PeerListener = () => void;

class DesktopMeshRouter {
  private messageListeners: Set<DeliveryListener> = new Set();
  private deliveryListeners: Set<DeliveryListener> = new Set();
  private peerListeners: Set<PeerListener> = new Set();
  private beaconIntervalTimer: any = null;

  constructor() {
    meshTransport.onPacket((envelope) => this.handleIncomingPacket(envelope));
    // Start auto-beaconing for discovery of nearby devices
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
        hopsRemaining: 1, // Single-hop local discovery
        hopCount: 0,
        payload: {
          nickname: identity.nickname,
          timestamp: Date.now(),
        },
      });

      const sigString = `${envelope.packetId}:${envelope.senderPubkey}:${envelope.recipientPubkey}:${envelope.timestamp}:beacon`;
      envelope.signature = signPacket(identity.secretKeyHex, sigString);

      await meshTransport.broadcastPacket(envelope);
    } catch (err: any) {
      console.warn('[MeshRouter] Beacon broadcast error:', err?.message);
    }
  }

  /**
   * Start periodic beacon broadcasting
   */
  public startBeaconing(intervalSec = 8): void {
    this.stopBeaconing();
    // Immediate initial beacon
    this.broadcastBeacon();
    this.beaconIntervalTimer = setInterval(() => {
      this.broadcastBeacon();
    }, intervalSec * 1000);
  }

  /**
   * Stop periodic beacon broadcasting
   */
  public stopBeaconing(): void {
    if (this.beaconIntervalTimer) {
      clearInterval(this.beaconIntervalTimer);
      this.beaconIntervalTimer = null;
    }
  }

  /**
   * Announce presence directly to a newly seen peer so pairing is instantaneous
   */
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

      const sigString = `${envelope.packetId}:${envelope.senderPubkey}:${envelope.recipientPubkey}:${envelope.timestamp}:announce`;
      envelope.signature = signPacket(identity.secretKeyHex, sigString);

      await meshTransport.sendDirect(targetPubkey, envelope);
    } catch {}
  }

  /**
   * Encrypts and transmits a direct end-to-end user message
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

    const { ciphertextHex, nonceHex } = encryptPayload(
      identity.secretKeyHex,
      recipientPubkey,
      text
    );

    const envelope = createEnvelope({
      type: PacketType.ROUTED_DATA,
      senderPubkey: identity.publicKeyHex,
      recipientPubkey,
      hopsRemaining: 5,
      hopCount: 0,
      payload: {
        ciphertext: ciphertextHex,
        ciphertextHex: ciphertextHex,
        nonce: nonceHex,
        nonceHex: nonceHex,
        senderNickname: identity.nickname,
      },
    });

    envelope.signature = signEnvelope(envelope, identity.secretKeyHex);

    const message: MeshMessage = {
      id: envelope.packetId,
      conversationId: recipientPubkey.toLowerCase(),
      senderPubkey: identity.publicKeyHex,
      recipientPubkey: recipientPubkey.toLowerCase(),
      senderNickname: identity.nickname,
      text,
      timestamp: envelope.timestamp,
      isOutgoing: true,
      deliveryState: 'queued',
      hopCount: 0,
    };

    // Store outgoing message
    const existingMessages = await meshStorage.loadMessages(recipientPubkey);
    await meshStorage.saveMessages(recipientPubkey, [...existingMessages, message]);

    // Update conversation list
    await this.updateConversationSnippet(recipientPubkey, recipientNickname, text, envelope.timestamp);

    // Transmit over transport
    await meshTransport.sendDirect(recipientPubkey, envelope);

    // Simulate immediate local single-hop delivery acknowledgement
    setTimeout(async () => {
      message.deliveryState = 'delivered';
      const msgs = await meshStorage.loadMessages(recipientPubkey);
      const updated = msgs.map((m) => (m.id === message.id ? { ...m, deliveryState: 'delivered' as const } : m));
      await meshStorage.saveMessages(recipientPubkey, updated);
      this.deliveryListeners.forEach((cb) => cb(message));
    }, 600);

    return message;
  }

  /**
   * Inbound envelope dispatch and multi-hop relay processing
   */
  public async handleIncomingPacket(envelope: MeshEnvelope): Promise<void> {
    if (!envelope || !envelope.packetId) return;

    // Deduplication check
    const isSeen = await meshStorage.isPacketSeen(envelope.packetId);
    if (isSeen) return;
    await meshStorage.markPacketSeen(envelope.packetId);

    const identity = await meshStorage.loadIdentity();
    if (!identity) return;

    const myPubkey = identity.publicKeyHex.toLowerCase();
    const isForMe = envelope.recipientPubkey.toLowerCase() === myPubkey || envelope.recipientPubkey === BROADCAST_PUBKEY;

    // Handle Peer Discovery Beacons and Announcements
    if (envelope.type === PacketType.BEACON || envelope.type === PacketType.ANNOUNCE) {
      if (envelope.senderPubkey.toLowerCase() !== myPubkey) {
        const senderPubkey = envelope.senderPubkey.toLowerCase();
        const nick = envelope.payload?.nickname || `Peer_${senderPubkey.substring(0, 6)}`;

        await meshStorage.upsertPeer({
          publicKeyHex: senderPubkey,
          nickname: nick,
          status: 'discovered',
          lastSeen: Date.now(),
          hopDistance: envelope.hopCount || 0,
        });

        meshTransport.setState(TransportState.CONNECTED_PEERS);
        this.peerListeners.forEach((cb) => cb());

        // If another device sent a discovery beacon, respond with an immediate announce
        // so discovery is bidirectional in under a second without waiting for next timer
        if (envelope.type === PacketType.BEACON) {
          this.sendAnnounce(senderPubkey);
        }
      }
      return;
    }

    if (isForMe && envelope.type === PacketType.ROUTED_DATA) {
      try {
        const ciphertext = envelope.payload?.ciphertext || envelope.payload?.ciphertextHex;
        const nonce = envelope.payload?.nonce || envelope.payload?.nonceHex;
        const senderNickname = envelope.payload?.senderNickname;
        if (!ciphertext || !nonce) return;

        // Verify sender signature
        const isValid = verifyEnvelopeSignature(envelope);
        if (!isValid) {
          console.warn('[MeshRouter] Discarded packet with invalid signature');
          return;
        }

        // Decrypt ChaCha20-Poly1305 payload
        const plaintext = decryptPayload(
          identity.secretKeyHex,
          envelope.senderPubkey,
          ciphertext,
          nonce
        );

        const msg: MeshMessage = {
          id: envelope.packetId,
          conversationId: envelope.senderPubkey.toLowerCase(),
          senderPubkey: envelope.senderPubkey.toLowerCase(),
          recipientPubkey: myPubkey,
          senderNickname: senderNickname || 'Nearby Peer',
          text: plaintext,
          timestamp: envelope.timestamp,
          isOutgoing: false,
          deliveryState: 'delivered',
          hopCount: envelope.hopCount,
        };

        const existing = await meshStorage.loadMessages(envelope.senderPubkey);
        await meshStorage.saveMessages(envelope.senderPubkey, [...existing, msg]);

        await this.updateConversationSnippet(
          envelope.senderPubkey,
          senderNickname || 'Nearby Peer',
          plaintext,
          envelope.timestamp
        );

        await meshStorage.upsertPeer({
          publicKeyHex: envelope.senderPubkey.toLowerCase(),
          nickname: senderNickname || 'Nearby Peer',
          status: 'discovered',
          lastSeen: envelope.timestamp,
          hopDistance: envelope.hopCount,
        });
        this.peerListeners.forEach((cb) => cb());

        this.messageListeners.forEach((cb) => cb(msg));
      } catch (err: any) {
        console.warn('[MeshRouter] Failed to process message:', err.message);
      }
    } else if (!isForMe && envelope.hopsRemaining > 0) {
      // Relaying multi-hop envelope
      const settings = await meshStorage.loadSettings();
      if (settings.relayEnabled) {
        envelope.hopsRemaining -= 1;
        envelope.hopCount += 1;
        await meshTransport.broadcastPacket(envelope);
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
export default meshRouter;
