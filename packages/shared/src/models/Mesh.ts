export type MeshPacketType =
  | 'BEACON'
  | 'ANNOUNCE'
  | 'KEY_EXCHANGE'
  | 'ROUTED_DATA'
  | 'HOP_ACK'
  | 'END_TO_END_ACK'
  | 'PING';

export interface MeshPacketHeader {
  magic: string; // 'CFM1'
  version: number; // 1
  packetType: MeshPacketType;
  packetId: string;
  senderPubkey: string;
  recipientPubkey: string;
  hopsRemaining: number;
  hopCount: number;
  timestamp: number;
  expiresAt: number;
  payloadLength?: number;
  signature?: string;
}

export interface MeshPacket<T = unknown> extends MeshPacketHeader {
  payload: T;
}
