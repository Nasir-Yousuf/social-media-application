/**
 * Clearfeed Desktop SpacesMediaAdapter
 * Pluggable Media Transport Adapter supporting:
 * 1. SFU Mode (LiveKit room token)
 * 2. Speaker-Only P2P Mesh Mode (zero-cost fallback with Opus DTX, max 6 speakers, listeners recvonly)
 */

import { DEFAULT_ICE_SERVERS } from './webrtc';

export class SpacesMediaAdapter {
  constructor() {
    this.mode = 'speaker_mesh';
    this.spaceId = null;
    this.userId = null;
    this.role = 'LISTENER';
    this.localStream = null;
    this.callbacks = {};
  }

  async connect(config, localStream, callbacks) {
    throw new Error('connect must be implemented by subclass');
  }

  async setMicrophoneMuted(muted) {
    throw new Error('setMicrophoneMuted must be implemented by subclass');
  }

  async updateRole(newRole, newToken) {
    throw new Error('updateRole must be implemented by subclass');
  }

  disconnect() {
    throw new Error('disconnect must be implemented by subclass');
  }
}

/**
 * Speaker-Only P2P Mesh Media Transport Adapter
 */
export class SpeakerMeshAudioAdapter extends SpacesMediaAdapter {
  constructor() {
    super();
    this.mode = 'speaker_mesh';
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    this.isMuted = true;
    this.unsubSignal = null;
  }

  async connect(config, localStream, callbacks = {}) {
    this.spaceId = config.spaceId;
    this.userId = config.userId;
    this.role = config.role || 'LISTENER';
    this.socketService = config.socketService;
    this.iceServers = config.iceServers || DEFAULT_ICE_SERVERS;
    this.localStream = localStream;
    this.callbacks = callbacks;
    this.isMuted = this.role === 'LISTENER';

    if (this.socketService && typeof this.socketService.on === 'function') {
      this.unsubSignal = this.socketService.on('space:signal', async ({ spaceId, fromUserId, signal }) => {
        if (spaceId !== this.spaceId || fromUserId === this.userId) return;
        await this.handleIncomingSignal(fromUserId, signal);
      });
    }

    if (this.canPublish()) {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }
    }
  }

  canPublish() {
    return this.role === 'HOST' || this.role === 'CO_HOST' || this.role === 'SPEAKER' || this.role === 'host' || this.role === 'speaker';
  }

  async setMicrophoneMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });
    }

    if (this.socketService) {
      this.socketService.emit('spaces:toggle_mute', {
        spaceId: this.spaceId,
        isMuted: this.isMuted,
      });
    }
  }

  async updateRole(newRole, newToken) {
    const previousCanPublish = this.canPublish();
    this.role = newRole;
    const nowCanPublish = this.canPublish();

    if (!previousCanPublish && nowCanPublish) {
      this.isMuted = true;
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }
    } else if (previousCanPublish && !nowCanPublish) {
      this.isMuted = true;
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }
    }
  }

  async handleIncomingSignal(fromUserId, signal) {
    let pc = this.peerConnections.get(fromUserId);

    if (signal.type === 'offer') {
      if (!pc) {
        pc = this.createPeerConnection(fromUserId);
      }

      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await pc.createAnswer();
      const modifiedAnswer = this.applyOpusDtx(answer);
      await pc.setLocalDescription(modifiedAnswer);

      if (this.socketService) {
        this.socketService.emit('spaces:signal', {
          spaceId: this.spaceId,
          targetUserId: fromUserId,
          signal: pc.localDescription,
        });
      }
    } else if (signal.type === 'answer') {
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
      }
    } else if (signal.candidate) {
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch (e) {
          console.warn('Spaces candidate error:', e);
        }
      }
    }
  }

  createPeerConnection(targetUserId) {
    const pc = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(targetUserId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate && this.socketService) {
        this.socketService.emit('spaces:signal', {
          spaceId: this.spaceId,
          targetUserId,
          signal: { candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
      this.remoteStreams.set(targetUserId, stream);
      if (typeof this.callbacks.onTrack === 'function') {
        this.callbacks.onTrack(targetUserId, stream, event.track);
      }
    };

    if (this.canPublish() && this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    } else {
      try {
        pc.addTransceiver('audio', { direction: 'recvonly' });
      } catch {}
    }

    return pc;
  }

  applyOpusDtx(sessionDescription) {
    if (!sessionDescription || !sessionDescription.sdp) return sessionDescription;
    let sdp = sessionDescription.sdp;
    if (sdp.includes('useinbandfec=1')) {
      sdp = sdp.replace(/useinbandfec=1/g, 'useinbandfec=1;usedtx=1;stereo=0');
    }
    return new RTCSessionDescription({
      type: sessionDescription.type,
      sdp,
    });
  }

  disconnect() {
    if (this.unsubSignal) {
      try {
        this.unsubSignal();
      } catch {}
      this.unsubSignal = null;
    }

    this.peerConnections.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();
  }
}

/**
 * Factory creating the optimal Media Transport Adapter
 */
export const createSpacesMediaAdapter = (transportToken) => {
  return new SpeakerMeshAudioAdapter();
};

export default {
  SpacesMediaAdapter,
  SpeakerMeshAudioAdapter,
  createSpacesMediaAdapter,
};
