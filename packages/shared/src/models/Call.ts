import { UserSummary } from './User';

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed' | 'busy';

export interface CallSession {
  callId: string;
  caller: UserSummary | string;
  recipient: UserSummary | string;
  type: CallType;
  status: CallStatus;
  startedAt: string | Date;
  connectedAt?: string | Date;
  endedAt?: string | Date;
  durationSeconds?: number;
}

export interface WebRTCSignal {
  callId: string;
  fromUserId: string;
  targetUserId: string;
  signal: unknown;
}
