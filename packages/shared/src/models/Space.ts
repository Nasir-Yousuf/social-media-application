import { UserSummary } from './User';

export type SpaceRole =
  | 'HOST'
  | 'CO_HOST'
  | 'MODERATOR'
  | 'SPEAKER'
  | 'LISTENER'
  | 'host'
  | 'co-host'
  | 'speaker'
  | 'listener';

export type SpaceVisibility = 'public' | 'community' | 'private';
export type SpaceMediaMode = 'sfu' | 'speaker_mesh';

export interface SpaceParticipant {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: SpaceRole;
  isMuted?: boolean;
  isSpeaking?: boolean;
  handRaised?: boolean;
  raisedHandAt?: string | Date | null;
  joinedAt?: string | Date;
}

export interface MediaTransportToken {
  mode: SpaceMediaMode;
  url: string | null;
  token: string | null;
  canPublish: boolean;
  canSubscribe: boolean;
  role: SpaceRole;
  maxSpeakers?: number;
  opusDtx?: boolean;
}

export interface SpaceRoom {
  id: string;
  roomId?: string;
  title: string;
  description?: string;
  topic: string;
  topicTags?: string[];
  visibility?: SpaceVisibility;
  host: UserSummary | string;
  hostId?: string;
  isHostDisconnected?: boolean;
  hostDisconnectedAt?: string | Date | null;
  speakersCount: number;
  listenersCount: number;
  totalParticipants: number;
  speakers: SpaceParticipant[];
  listeners: SpaceParticipant[];
  handRaiseQueue?: string[];
  handRaised?: string[];
  speakingUsers?: string[];
  isLive: boolean;
  mediaMode?: SpaceMediaMode;
  createdAt: string | Date;
  endedAt?: string | Date;
}
