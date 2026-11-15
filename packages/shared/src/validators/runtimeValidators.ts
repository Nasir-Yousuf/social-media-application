import {
  User,
  UserSummary,
  Post,
  Comment,
  CodeHubPost,
  CodeFile,
  LearnLesson,
  LearnTrack,
  LearnProgress,
  AIConversation,
  Message,
  Conversation,
  CallSession,
  SpaceRoom,
  SpaceParticipant,
  MeshPacketHeader,
} from '../models';
import { ApiResponse } from '../contracts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidUserSummary(data: unknown): data is UserSummary {
  if (!isRecord(data)) return false;
  return (
    typeof data._id === 'string' &&
    typeof data.username === 'string' &&
    typeof data.name === 'string' &&
    typeof data.role === 'string'
  );
}

export function isValidUser(data: unknown): data is User {
  if (!isValidUserSummary(data)) return false;
  const d = data as unknown as Record<string, unknown>;
  return typeof d.email === 'string';
}

export function isValidPost(data: unknown): data is Post {
  if (!isRecord(data)) return false;
  return (
    typeof data._id === 'string' &&
    typeof data.content === 'string' &&
    (typeof data.author === 'string' || isValidUserSummary(data.author))
  );
}

export function isValidComment(data: unknown): data is Comment {
  if (!isRecord(data)) return false;
  return (
    typeof data._id === 'string' &&
    typeof data.post === 'string' &&
    typeof data.content === 'string'
  );
}

export function isValidCodeFile(data: unknown): data is CodeFile {
  if (!isRecord(data)) return false;
  return typeof data.name === 'string' && typeof data.content === 'string';
}

export function isValidCodeHubPost(data: unknown): data is CodeHubPost {
  if (!isRecord(data)) return false;
  return (
    typeof data._id === 'string' &&
    typeof data.title === 'string' &&
    Array.isArray(data.files)
  );
}

export function isValidLearnLesson(data: unknown): data is LearnLesson {
  if (!isRecord(data)) return false;
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.markdownContent === 'string'
  );
}

export function isValidLearnTrack(data: unknown): data is LearnTrack {
  if (!isRecord(data)) return false;
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    Array.isArray(data.lessons)
  );
}

export function isValidLearnProgress(data: unknown): data is LearnProgress {
  if (!isRecord(data)) return false;
  return (
    typeof data.user === 'string' &&
    Array.isArray(data.completedLessons) &&
    typeof data.currentTrack === 'string'
  );
}

export function isValidAIConversation(data: unknown): data is AIConversation {
  if (!isRecord(data)) return false;
  return (
    typeof data._id === 'string' &&
    typeof data.userId === 'string' &&
    Array.isArray(data.messages)
  );
}

export function isValidMessage(data: unknown): data is Message {
  if (!isRecord(data)) return false;
  return (
    typeof data._id === 'string' &&
    typeof data.conversation === 'string' &&
    typeof data.text === 'string' &&
    (typeof data.sender === 'string' || isValidUserSummary(data.sender)) &&
    (typeof data.recipient === 'string' || isValidUserSummary(data.recipient))
  );
}

export function isValidConversation(data: unknown): data is Conversation {
  if (!isRecord(data)) return false;
  return typeof data._id === 'string' && Array.isArray(data.participants);
}

export function isValidCallSession(data: unknown): data is CallSession {
  if (!isRecord(data)) return false;
  return (
    typeof data.callId === 'string' &&
    (typeof data.caller === 'string' || isValidUserSummary(data.caller)) &&
    (typeof data.recipient === 'string' || isValidUserSummary(data.recipient)) &&
    typeof data.type === 'string' &&
    typeof data.status === 'string'
  );
}

export function isValidSpaceParticipant(data: unknown): data is SpaceParticipant {
  if (!isRecord(data)) return false;
  return (
    typeof data._id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.username === 'string' &&
    typeof data.role === 'string'
  );
}

export function isValidSpaceRoom(data: unknown): data is SpaceRoom {
  if (!isRecord(data)) return false;
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    Array.isArray(data.speakers) &&
    Array.isArray(data.listeners)
  );
}

export function isValidMeshPacketHeader(data: unknown): data is MeshPacketHeader {
  if (!isRecord(data)) return false;
  return (
    data.magic === 'CFM1' &&
    data.version === 1 &&
    typeof data.packetType === 'string' &&
    typeof data.packetId === 'string' &&
    typeof data.senderPubkey === 'string' &&
    typeof data.recipientPubkey === 'string' &&
    typeof data.hopsRemaining === 'number' &&
    typeof data.hopCount === 'number' &&
    typeof data.timestamp === 'number'
  );
}

export function isValidApiResponse<T = unknown>(data: unknown): data is ApiResponse<T> {
  if (!isRecord(data)) return false;
  return typeof data.success === 'boolean' && typeof data.timestamp === 'string';
}
