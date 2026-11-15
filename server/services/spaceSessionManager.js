/**
 * Clearfeed Spaces Live Server-Authoritative Session Engine
 * 
 * Features:
 * - 5 Authoritative Roles: HOST, CO_HOST, MODERATOR, SPEAKER, LISTENER
 * - Server-verified permission matrix
 * - Hand-raise queue workflow (FIFO order)
 * - Privacy-First Speaker Promotion (microphone MUTED by default)
 * - 180-second Host Disconnect Grace Window with Co-Host survivability
 * - Pluggable Media Transport (LiveKit SFU token generation vs Speaker-Only P2P Mesh with Opus DTX)
 */

const jwt = require('jsonwebtoken');

// Valid Roles
const SpaceRole = {
  HOST: 'HOST',
  CO_HOST: 'CO_HOST',
  MODERATOR: 'MODERATOR',
  SPEAKER: 'SPEAKER',
  LISTENER: 'LISTENER',
};

// In-Memory active sessions map: roomId -> SpaceSession
const activeSessions = new Map();

class SpaceSessionManager {
  constructor() {
    this.sessions = activeSessions;
  }

  /**
   * Initialize a new live audio Space
   */
  createSpace({
    roomId,
    title,
    description = '',
    topicTags = ['General'],
    visibility = 'public',
    hostUser,
  }) {
    const hostId = hostUser._id ? hostUser._id.toString() : hostUser.id.toString();

    const session = {
      roomId,
      title: title.trim().slice(0, 120),
      description: description.trim().slice(0, 500),
      topicTags: Array.isArray(topicTags) ? topicTags : ['General'],
      visibility,
      hostId,
      participants: new Map(),
      handRaiseQueue: [], // Array of userIds in FIFO order
      speakingUsers: new Set(),
      hostDisconnectTimer: null,
      hostDisconnectedAt: null,
      createdAt: new Date(),
      mediaMode: process.env.LIVEKIT_URL ? 'sfu' : 'speaker_mesh',
    };

    // Register Host as initial participant with HOST role
    session.participants.set(hostId, {
      userId: hostId,
      user: {
        _id: hostId,
        name: hostUser.name || 'Host',
        username: hostUser.username || 'host',
        avatarUrl: hostUser.avatarUrl,
      },
      role: SpaceRole.HOST,
      isMuted: false,
      raisedHandAt: null,
      joinedAt: new Date(),
      socketIds: new Set(),
    });

    this.sessions.set(roomId, session);
    return session;
  }

  /**
   * Get formatted space summary for client consumption
   */
  getSpace(roomId) {
    const session = this.sessions.get(roomId);
    if (!session) return null;
    return this.formatSession(session);
  }

  /**
   * List all active live audio spaces
   */
  getActiveSpaces() {
    return Array.from(this.sessions.values()).map((session) => this.formatSession(session));
  }

  /**
   * Join a participant to the Space
   */
  joinSpace(roomId, user, socketId) {
    const session = this.sessions.get(roomId);
    if (!session) {
      throw new Error('Space room not found or has ended');
    }

    const userId = user._id ? user._id.toString() : user.id.toString();
    let participant = session.participants.get(userId);

    // If host was disconnected and reconnects, cancel grace window and restore Host role
    if (userId === session.hostId) {
      if (session.hostDisconnectTimer) {
        clearTimeout(session.hostDisconnectTimer);
        session.hostDisconnectTimer = null;
        session.hostDisconnectedAt = null;
      }
    }

    if (!participant) {
      // Determine initial role: if hostId matches, HOST; otherwise default to LISTENER
      const role = userId === session.hostId ? SpaceRole.HOST : SpaceRole.LISTENER;
      participant = {
        userId,
        user: {
          _id: userId,
          name: user.name || 'Visitor',
          username: user.username || 'visitor',
          avatarUrl: user.avatarUrl,
        },
        role,
        isMuted: role === SpaceRole.LISTENER,
        raisedHandAt: null,
        joinedAt: new Date(),
        socketIds: new Set([socketId]),
      };
      session.participants.set(userId, participant);
    } else {
      participant.socketIds.add(socketId);
    }

    const mediaToken = this.generateTransportToken(session, participant);
    return {
      space: this.formatSession(session),
      participant,
      mediaToken,
    };
  }

  /**
   * Handle socket or user leave
   */
  leaveSpace(roomId, userId, socketId, io = null) {
    const session = this.sessions.get(roomId);
    if (!session) return null;

    const uId = userId ? userId.toString() : null;
    const participant = uId ? session.participants.get(uId) : null;

    if (participant) {
      participant.socketIds.delete(socketId);

      // If user has no more open sockets in this space
      if (participant.socketIds.size === 0) {
        // If Host leaves, start 180-second disconnect grace window
        if (participant.role === SpaceRole.HOST) {
          this.startHostDisconnectGrace(session, io);
        } else {
          session.participants.delete(uId);
          session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== uId);
          session.speakingUsers.delete(uId);
        }
      }
    }

    return this.formatSession(session);
  }

  /**
   * Handle complete socket disconnection
   */
  handleSocketDisconnect(userId, socketId, io = null) {
    const uId = userId ? userId.toString() : null;
    if (!uId) return;

    for (const [roomId, session] of this.sessions.entries()) {
      if (session.participants.has(uId)) {
        const participant = session.participants.get(uId);
        participant.socketIds.delete(socketId);

        if (participant.socketIds.size === 0) {
          if (participant.role === SpaceRole.HOST) {
            this.startHostDisconnectGrace(session, io);
          } else {
            session.participants.delete(uId);
            session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== uId);
            session.speakingUsers.delete(uId);

            if (io) {
              io.to(`space:${roomId}`).emit('space:state_change', { space: this.formatSession(session) });
              io.emit('spaces:updated', { spaces: this.getActiveSpaces() });
            }
          }
        }
      }
    }
  }

  /**
   * 180-second Host Disconnect Grace Window
   */
  startHostDisconnectGrace(session, io = null) {
    if (session.hostDisconnectTimer) return; // Already running

    session.hostDisconnectedAt = new Date();
    const gracePeriodMs = 180 * 1000; // 180 seconds

    if (io) {
      io.to(`space:${session.roomId}`).emit('space:host_disconnected', {
        roomId: session.roomId,
        hostId: session.hostId,
        graceRemainingSeconds: 180,
      });
    }

    session.hostDisconnectTimer = setTimeout(() => {
      this.handleHostGraceExpiration(session.roomId, io);
    }, gracePeriodMs);
  }

  /**
   * On Host Grace Expiration: promote senior Co-Host or end room
   */
  handleHostGraceExpiration(roomId, io = null) {
    const session = this.sessions.get(roomId);
    if (!session) return;

    // Check if host reconnected before expiration
    const hostParticipant = session.participants.get(session.hostId);
    if (hostParticipant && hostParticipant.socketIds.size > 0) {
      session.hostDisconnectTimer = null;
      session.hostDisconnectedAt = null;
      return;
    }

    // Find senior Co-Host
    const coHosts = Array.from(session.participants.values()).filter(
      (p) => p.role === SpaceRole.CO_HOST && p.socketIds.size > 0
    );

    if (coHosts.length > 0) {
      // Sort by joinedAt
      coHosts.sort((a, b) => a.joinedAt - b.joinedAt);
      const newHost = coHosts[0];

      // Remove dropped old host
      session.participants.delete(session.hostId);
      session.hostId = newHost.userId;
      newHost.role = SpaceRole.HOST;
      session.hostDisconnectTimer = null;
      session.hostDisconnectedAt = null;

      if (io) {
        io.to(`space:${roomId}`).emit('space:host_transferred', {
          roomId,
          newHostId: newHost.userId,
          reason: 'previous_host_grace_expired',
        });
        io.to(`space:${roomId}`).emit('space:state_change', { space: this.formatSession(session) });
        io.emit('spaces:updated', { spaces: this.getActiveSpaces() });
      }
    } else {
      // No co-hosts available to keep space alive -> end space
      this.endSpace(roomId, io, 'grace_expired');
    }
  }

  /**
   * End Space immediately
   */
  endSpace(roomId, io = null, reason = 'host_ended') {
    const session = this.sessions.get(roomId);
    if (!session) return false;

    if (session.hostDisconnectTimer) {
      clearTimeout(session.hostDisconnectTimer);
      session.hostDisconnectTimer = null;
    }

    this.sessions.delete(roomId);

    if (io) {
      io.to(`space:${roomId}`).emit('space:ended', { roomId, reason });
      io.emit('spaces:updated', { spaces: this.getActiveSpaces() });
    }

    return true;
  }

  // =========================================================================
  // HAND-RAISE WORKFLOW
  // =========================================================================

  /**
   * Listener requests to speak
   */
  requestSpeak(roomId, userId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    const participant = session.participants.get(userId.toString());
    if (!participant) throw new Error('Participant not in space');

    if (participant.role !== SpaceRole.LISTENER) {
      throw new Error('Only listeners can request to speak');
    }

    if (!session.handRaiseQueue.includes(participant.userId)) {
      session.handRaiseQueue.push(participant.userId);
      participant.raisedHandAt = new Date();
    }

    return this.formatSession(session);
  }

  /**
   * Listener cancels speak request
   */
  cancelRequest(roomId, userId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    const uId = userId.toString();
    const participant = session.participants.get(uId);
    if (participant) {
      participant.raisedHandAt = null;
    }

    session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== uId);
    return this.formatSession(session);
  }

  /**
   * Moderator/Host approves hand-raise
   * PRIVACY-FIRST PRINCIPLE: promoted speaker starts MUTED by default
   */
  approveSpeak(roomId, moderatorId, targetUserId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    this.assertModeratorPrivilege(session, moderatorId);

    const tId = targetUserId.toString();
    const target = session.participants.get(tId);
    if (!target) throw new Error('Target participant not found in space');

    // Remove from hand-raise queue
    session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== tId);
    target.raisedHandAt = null;

    // Promote to SPEAKER, microphone starts MUTED by default
    target.role = SpaceRole.SPEAKER;
    target.isMuted = true;

    // Generate refreshed media transport token granting canPublish
    const mediaToken = this.generateTransportToken(session, target);

    return {
      space: this.formatSession(session),
      targetUser: target,
      mediaToken,
    };
  }

  /**
   * Moderator/Host rejects hand-raise
   */
  rejectSpeak(roomId, moderatorId, targetUserId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    this.assertModeratorPrivilege(session, moderatorId);

    const tId = targetUserId.toString();
    const target = session.participants.get(tId);
    if (target) {
      target.raisedHandAt = null;
    }

    session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== tId);
    return this.formatSession(session);
  }

  // =========================================================================
  // AUDIO & MODERATION CONTROLS
  // =========================================================================

  /**
   * Speaker / Host self-mute toggle
   */
  toggleMute(roomId, userId, isMuted) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    const participant = session.participants.get(userId.toString());
    if (!participant) throw new Error('Participant not in space');

    if (participant.role === SpaceRole.LISTENER) {
      throw new Error('Listeners cannot toggle microphone mute');
    }

    participant.isMuted = Boolean(isMuted);
    if (participant.isMuted) {
      session.speakingUsers.delete(participant.userId);
    }

    return this.formatSession(session);
  }

  /**
   * Moderator / Host forces a speaker to mute
   */
  forceMute(roomId, moderatorId, targetUserId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    this.assertModeratorPrivilege(session, moderatorId);

    const tId = targetUserId.toString();
    const target = session.participants.get(tId);
    if (!target) throw new Error('Target participant not in space');

    if (target.role === SpaceRole.HOST) {
      throw new Error('Cannot force-mute the room Host');
    }

    target.isMuted = true;
    session.speakingUsers.delete(tId);

    return this.formatSession(session);
  }

  /**
   * Moderator / Host demotes Speaker to Listener
   */
  demoteToListener(roomId, moderatorId, targetUserId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    this.assertModeratorPrivilege(session, moderatorId);

    const tId = targetUserId.toString();
    const target = session.participants.get(tId);
    if (!target) throw new Error('Target participant not in space');

    if (target.role === SpaceRole.HOST) {
      throw new Error('Cannot demote the room Host');
    }

    target.role = SpaceRole.LISTENER;
    target.isMuted = true;
    session.speakingUsers.delete(tId);

    const mediaToken = this.generateTransportToken(session, target);
    return {
      space: this.formatSession(session),
      targetUser: target,
      mediaToken,
    };
  }

  /**
   * Host promotes participant to Co-Host
   */
  promoteCoHost(roomId, hostId, targetUserId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    if (session.hostId !== hostId.toString()) {
      throw new Error('Only the room Host can promote a Co-Host');
    }

    const tId = targetUserId.toString();
    const target = session.participants.get(tId);
    if (!target) throw new Error('Target participant not in space');

    target.role = SpaceRole.CO_HOST;
    session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== tId);

    const mediaToken = this.generateTransportToken(session, target);
    return {
      space: this.formatSession(session),
      targetUser: target,
      mediaToken,
    };
  }

  /**
   * Host transfers room ownership
   */
  transferHost(roomId, currentHostId, newHostId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    if (session.hostId !== currentHostId.toString()) {
      throw new Error('Only current Host can transfer ownership');
    }

    const nId = newHostId.toString();
    const newHost = session.participants.get(nId);
    if (!newHost) throw new Error('New host must already be in the space');

    const oldHost = session.participants.get(currentHostId.toString());
    if (oldHost) {
      oldHost.role = SpaceRole.CO_HOST;
    }

    session.hostId = nId;
    newHost.role = SpaceRole.HOST;
    session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== nId);

    return this.formatSession(session);
  }

  /**
   * Moderator / Host kicks a participant
   */
  kickParticipant(roomId, moderatorId, targetUserId) {
    const session = this.sessions.get(roomId);
    if (!session) throw new Error('Space not found');

    this.assertModeratorPrivilege(session, moderatorId);

    const tId = targetUserId.toString();
    const target = session.participants.get(tId);
    if (!target) throw new Error('Target participant not in space');

    if (target.role === SpaceRole.HOST) {
      throw new Error('Cannot kick the room Host');
    }

    session.participants.delete(tId);
    session.handRaiseQueue = session.handRaiseQueue.filter((id) => id !== tId);
    session.speakingUsers.delete(tId);

    return {
      space: this.formatSession(session),
      kickedSocketIds: Array.from(target.socketIds),
    };
  }

  /**
   * Active Speaker Detection state update
   */
  setSpeakingState(roomId, userId, isSpeaking) {
    const session = this.sessions.get(roomId);
    if (!session) return;

    const uId = userId.toString();
    const participant = session.participants.get(uId);
    if (!participant || participant.role === SpaceRole.LISTENER) return;

    if (isSpeaking && !participant.isMuted) {
      session.speakingUsers.add(uId);
    } else {
      session.speakingUsers.delete(uId);
    }
  }

  // =========================================================================
  // MEDIA TRANSPORT TOKEN GENERATION (SFU & P2P MESH FALLBACK)
  // =========================================================================

  /**
   * Generate LiveKit SFU token or Speaker-Mesh adapter authorization
   */
  generateTransportToken(session, participant) {
    const canPublish =
      participant.role === SpaceRole.HOST ||
      participant.role === SpaceRole.CO_HOST ||
      participant.role === SpaceRole.SPEAKER;
    const canSubscribe = true;

    // Check if LiveKit credentials exist in environment
    if (process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;

      const claims = {
        iss: apiKey,
        sub: participant.userId,
        nbf: Math.floor(Date.now() / 1000) - 5,
        exp: Math.floor(Date.now() / 1000) + 6 * 3600, // 6 hours
        name: participant.user.name || participant.userId,
        metadata: JSON.stringify({
          role: participant.role,
          avatarUrl: participant.user.avatarUrl,
        }),
        video: {
          room: session.roomId,
          roomJoin: true,
          canPublish,
          canSubscribe,
        },
      };

      const token = jwt.sign(claims, apiSecret, { algorithm: 'HS256' });

      return {
        mode: 'sfu',
        url: process.env.LIVEKIT_URL,
        token,
        canPublish,
        canSubscribe,
        role: participant.role,
      };
    }

    // Zero-Config Fallback: Speaker-Only P2P Mesh
    return {
      mode: 'speaker_mesh',
      url: null,
      token: null,
      canPublish,
      canSubscribe,
      role: participant.role,
      maxSpeakers: 6,
      opusDtx: true,
    };
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  assertModeratorPrivilege(session, userId) {
    const uId = userId.toString();
    const participant = session.participants.get(uId);
    if (!participant) {
      throw new Error('Moderator not in space');
    }

    const allowed = [SpaceRole.HOST, SpaceRole.CO_HOST, SpaceRole.MODERATOR];
    if (!allowed.includes(participant.role)) {
      throw new Error('Action requires Host, Co-Host, or Moderator privileges');
    }
  }

  formatSession(session) {
    const participantsList = Array.from(session.participants.values());
    const host = session.participants.get(session.hostId) || {
      userId: session.hostId,
      user: { _id: session.hostId, name: 'Host' },
      role: SpaceRole.HOST,
    };

    const speakers = participantsList.filter(
      (p) => p.role === SpaceRole.HOST || p.role === SpaceRole.CO_HOST || p.role === SpaceRole.SPEAKER
    );
    const listeners = participantsList.filter(
      (p) => p.role === SpaceRole.LISTENER || p.role === SpaceRole.MODERATOR
    );

    return {
      id: session.roomId,
      roomId: session.roomId,
      title: session.title,
      description: session.description,
      topic: session.topicTags[0] || 'General',
      topicTags: session.topicTags,
      visibility: session.visibility,
      host: host.user,
      hostId: session.hostId,
      isHostDisconnected: Boolean(session.hostDisconnectTimer),
      hostDisconnectedAt: session.hostDisconnectedAt,
      speakersCount: speakers.length,
      listenersCount: listeners.length,
      totalParticipants: participantsList.length,
      speakers: speakers.map((s) => ({
        user: s.user,
        role: s.role,
        isMuted: s.isMuted,
        joinedAt: s.joinedAt,
      })),
      listeners: listeners.map((l) => ({
        user: l.user,
        role: l.role,
        isMuted: l.isMuted,
        raisedHandAt: l.raisedHandAt,
        joinedAt: l.joinedAt,
      })),
      handRaiseQueue: session.handRaiseQueue,
      speakingUsers: Array.from(session.speakingUsers),
      createdAt: session.createdAt,
      mediaMode: session.mediaMode,
      isLive: true,
    };
  }
}

const spaceSessionManager = new SpaceSessionManager();

module.exports = {
  spaceSessionManager,
  SpaceRole,
};
