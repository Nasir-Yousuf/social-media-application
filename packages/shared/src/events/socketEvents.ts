/**
 * Canonical Socket.io Event Definitions for Clearfeed
 * Shared across Web, Android (React Native), and Windows Desktop (Tauri).
 */

export const SOCKET_EVENTS = {
  // Authentication & Presence
  AUTH_IDENTIFY: 'auth:identify',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
  PRESENCE_SYNC: 'presence:sync',

  // Messaging (1:1 & Direct)
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_READ: 'message:read',
  MESSAGE_REACTION: 'message:reaction',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  CONVERSATION_UPDATE: 'conversation:update',

  // 1-on-1 Audio/Video Calling
  CALL_INITIATE: 'call:initiate',
  CALL_RINGING: 'call:ringing',
  CALL_ACCEPT: 'call:accept',
  CALL_ACCEPTED: 'call:accepted',
  CALL_REJECT: 'call:reject',
  CALL_REJECTED: 'call:rejected',
  CALL_END: 'call:end',
  CALL_ENDED: 'call:ended',
  CALL_SIGNAL: 'call:signal',
  CALL_BUSY: 'call:busy',
  CALL_HEARTBEAT: 'call:heartbeat',

  // Spaces Live Audio Rooms
  SPACE_CREATE: 'space:create',
  SPACE_JOIN: 'space:join',
  SPACE_LEAVE: 'space:leave',
  SPACE_USER_JOINED: 'space:user_joined',
  SPACE_USER_LEFT: 'space:user_left',
  SPACE_SPEAKING_STATE: 'space:speaking_state',
  SPACE_RAISE_HAND: 'space:raise_hand',
  SPACE_SET_ROLE: 'space:set_role',
  SPACE_TOGGLE_MUTE: 'space:toggle_mute',
  SPACE_REACTION: 'space:reaction',
  SPACE_SIGNAL: 'space:signal',
  SPACE_ENDED: 'space:ended',

  // Notifications
  NOTIFICATION_RECEIVE: 'notification:receive',
  NOTIFICATION_COUNT: 'notification:count',

  // Typing Arena & Supercar Races
  TYPING_CHALLENGE_INVITE: 'typing:challenge_invite',
  TYPING_CHALLENGE_ACCEPTED: 'typing:challenge_accepted',
  TYPING_CHALLENGE_PROGRESS: 'typing:challenge_progress',
  TYPING_CHALLENGE_FINISHED: 'typing:challenge_finished',
  TYPING_ROOM_UPDATE: 'typing:room_update',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
