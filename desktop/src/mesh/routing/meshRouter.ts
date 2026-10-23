import {
  PacketType,
  createEnvelope,
  MeshEnvelope,
  BROADCAST_PUBKEY,
} from '../protocol/wireProtocol';
import {
  signPacket,
  verifyPacketSignature,
  encryptPayload,
  decryptPayload,
} from '../crypto/meshCrypto';
import meshStorage, { MeshMessage, MeshConversation } from '../storage/meshStorage';
import meshTransport from '../transport/meshTransport';

export type DeliveryListener = (message: MeshMessage) => void;

class DesktopMeshRouter {
  private messageListeners: Set<DeliveryListener> = new Set();
  private deliveryListeners: Set<DeliveryListener> = new Set();

  constructor() {
    meshTransport.onPacket((envelope) => this.handleIncomingPacket(envelope));
  }

  public onMessageReceived(cb: DeliveryListener): () => void {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  public onDeliveryUpdated(cb: DeliveryListener): () => void {
    this.deliveryListeners.add(cb);
    return () => this.deliveryListeners.delete(cb);
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
        nonce: nonceHex,
        senderNickname: identity.nickname,
      },
    });

    const sigString = `${envelope.packetId}:${envelope.senderPubkey}:${envelope.recipientPubkey}:${envelope.timestamp}:${ciphertextHex}`;
    envelope.signature = signPacket(identity.secretKeyHex, sigString);

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

    if (isForMe && envelope.type === PacketType.ROUTED_DATA) {
      try {
        const { ciphertext, nonce, senderNickname } = envelope.payload;
        if (!ciphertext || !nonce) return;

        // Verify sender signature
        const sigString = `${envelope.packetId}:${envelope.senderPubkey}:${envelope.recipientPubkey}:${envelope.timestamp}:${ciphertext}`;
        const isValid = verifyPacketSignature(envelope.senderPubkey, sigString, envelope.signature || '');
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
