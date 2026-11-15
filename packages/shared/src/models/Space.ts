import { UserSummary } from './User';

export type SpaceRole = 'host' | 'co-host' | 'speaker' | 'listener';

export interface SpaceParticipant {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: SpaceRole;
  isMuted?: boolean;
  isSpeaking?: boolean;
  handRaised?: boolean;
  joinedAt?: string | Date;
}

export interface SpaceRoom {
  id: string;
  title: string;
  topic: string;
  host: UserSummary | string;
  speakersCount: number;
  listenersCount: number;
  totalParticipants: number;
  speakers: SpaceParticipant[];
  listeners: SpaceParticipant[];
  handRaised?: string[];
  isLive: boolean;
  createdAt: string | Date;
  endedAt?: string | Date;
}
