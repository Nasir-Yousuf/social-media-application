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

      envelope.signature = signEnvelope(envelope, identity.secretKeyHex);

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

      envelope.signature = signEnvelope(envelope, identity.secretKeyHex);

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

    const isBroadcast = envelope.recipientPubkey.toLowerCase() === BROADCAST_PUBKEY.toLowerCase();
    const isForMe = envelope.recipientPubkey.toLowerCase() === myPubkey || isBroadcast;

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

        // Verify sender signature
        const isValid = verifyEnvelopeSignature(envelope);
        if (!isValid) {
          console.warn('[MeshRouter] Discarded packet with invalid signature');
          return;
        }

        const senderPubkey = envelope.senderPubkey.toLowerCase();
        const senderNickname = envelope.payload?.senderNickname || 'Nearby Peer';
        const targetConvPubkey = isBroadcast ? BROADCAST_PUBKEY.toLowerCase() : senderPubkey;
        const targetConvNick = isBroadcast ? 'Nearby Public Broadcast' : senderNickname;

        const msg: MeshMessage = {
          id: envelope.packetId,
          conversationId: targetConvPubkey,
          senderPubkey,
          recipientPubkey: isBroadcast ? BROADCAST_PUBKEY.toLowerCase() : myPubkey,
          senderNickname,
          text: plaintext,
          timestamp: envelope.timestamp,
          isOutgoing: false,
          deliveryState: 'delivered',
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
export { BROADCAST_PUBKEY };
export default meshRouter;
