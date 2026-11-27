/**
 * Clearfeed Android Mobile SpacesMediaAdapter
 * Speaker-Only P2P Mesh with Opus DTX and LiveKit SFU support
 */

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  DEFAULT_ICE_SERVERS,
  normalizeIceConfig,
  restartIce,
} from './webrtc.js';

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
 * Mobile Speaker-Only P2P Mesh Media Transport Adapter
 */
export class SpeakerMeshAudioAdapter extends SpacesMediaAdapter {
  constructor() {
    super();
    this.mode = 'speaker_mesh';
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    this.pendingCandidates = new Map();
    this.remoteDescSet = new Map();
    this.makingOffer = new Map();
    this.iceRestartAttempts = new Map();
    this.isMuted = true;
    this.unsubSignal = null;
  }

  async connect(config, localStream, callbacks = {}) {
    this.disconnect();
    this.spaceId = config.spaceId;
    this.userId = config.userId ? config.userId.toString() : null;
    this.role = config.role || 'LISTENER';
    this.socketService = config.socketService;
    this.iceServers = normalizeIceConfig(config.iceServers || DEFAULT_ICE_SERVERS);
    this.localStream = localStream;
    this.callbacks = callbacks;
    this.isMuted = this.role === 'LISTENER';

    if (this.socketService && typeof this.socketService.on === 'function') {
      this.unsubSignal = this.socketService.on('space:signal', async ({ spaceId, fromUserId, signal }) => {
        if (spaceId !== this.spaceId || !fromUserId || fromUserId.toString() === this.userId) return;
        await this.handleIncomingSignal(fromUserId.toString(), signal);
      });
    }

    if (this.canPublish()) {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((t) => {
          t.enabled = false; // Privacy default
        });
      }
    }
  }

  canPublish() {
    return (
      this.role === 'HOST' ||
      this.role === 'CO_HOST' ||
      this.role === 'SPEAKER' ||
      this.role === 'host' ||
      this.role === 'co-host' ||
      this.role === 'speaker'
    );
  }

  setLocalStream(stream) {
    this.localStream = stream;
    if (!this.canPublish() || !stream) return;
    const newTrack = stream.getAudioTracks()[0] || null;
    if (newTrack) {
      newTrack.enabled = !this.isMuted;
    }

    for (const [peerId, pc] of this.peerConnections.entries()) {
      const senders = pc.getSenders ? pc.getSenders() : [];
      const audioSender = senders.find((s) => s.track?.kind === 'audio');
      if (audioSender && newTrack && typeof audioSender.replaceTrack === 'function') {
        audioSender.replaceTrack(newTrack).catch(() => {});
      } else if (newTrack) {
        try {
          pc.addTrack(newTrack, stream);
          this.sendOffer(peerId);
        } catch {}
      }
    }
  }

  syncParticipants(spaceSnapshot) {
    if (!spaceSnapshot || !this.userId) return;

    const speakers = Array.isArray(spaceSnapshot.speakers) ? spaceSnapshot.speakers : [];
    const listeners = Array.isArray(spaceSnapshot.listeners) ? spaceSnapshot.listeners : [];
    const activePeerIds = new Set();

    if (this.canPublish()) {
      for (const lst of listeners) {
        const peerId = (lst.user?._id || lst.user?.id || lst.userId)?.toString();
        if (!peerId || peerId === this.userId) continue;
        activePeerIds.add(peerId);
        if (!this.peerConnections.has(peerId)) {
          this.createPeerConnection(peerId);
          this.sendOffer(peerId);
        }
      }

      for (const spk of speakers) {
        const peerId = (spk.user?._id || spk.user?.id || spk.userId)?.toString();
        if (!peerId || peerId === this.userId) continue;
        activePeerIds.add(peerId);
        if (!this.peerConnections.has(peerId)) {
          this.createPeerConnection(peerId);
          if (this.userId < peerId) {
            this.sendOffer(peerId);
          }
        }
      }
    } else {
      for (const spk of speakers) {
        const peerId = (spk.user?._id || spk.user?.id || spk.userId)?.toString();
        if (!peerId || peerId === this.userId) continue;
        activePeerIds.add(peerId);
      }
    }

    for (const existingPeerId of Array.from(this.peerConnections.keys())) {
      if (!activePeerIds.has(existingPeerId)) {
        this.removePeer(existingPeerId);
      }
    }
  }

  async sendOffer(targetUserId) {
    if (!this.canPublish()) return;
    const pc = this.peerConnections.get(targetUserId);
    if (!pc || this.makingOffer.get(targetUserId)) return;

    try {
      this.makingOffer.set(targetUserId, true);
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
      const modifiedOffer = this.applyOpusDtx(offer);
      if (pc.signalingState !== 'stable') return;
      await pc.setLocalDescription(modifiedOffer);

      if (this.socketService) {
        this.socketService.emit('spaces:signal', {
          spaceId: this.spaceId,
          targetUserId,
          signal: pc.localDescription || modifiedOffer,
        });
      }
    } catch (err) {
      console.warn(`Android Spaces offer error (${targetUserId}):`, err.message);
    } finally {
      this.makingOffer.set(targetUserId, false);
    }
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

      const offerCollision = this.makingOffer.get(fromUserId) || pc.signalingState !== 'stable';
      const polite = !this.canPublish() || this.userId > fromUserId;
      if (offerCollision) {
        if (!polite) return;
        await pc.setLocalDescription({ type: 'rollback' }).catch(() => {});
      }

      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      this.remoteDescSet.set(fromUserId, true);
      await this.flushCandidates(fromUserId, pc);

      const answer = await pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
      const modifiedAnswer = this.applyOpusDtx(answer);
      await pc.setLocalDescription(modifiedAnswer);

      if (this.socketService) {
        this.socketService.emit('spaces:signal', {
          spaceId: this.spaceId,
          targetUserId: fromUserId,
          signal: pc.localDescription || modifiedAnswer,
        });
      }
    } else if (signal.type === 'answer') {
      if (pc && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        this.remoteDescSet.set(fromUserId, true);
        await this.flushCandidates(fromUserId, pc);
      }
    } else if (signal.candidate) {
      if (pc && this.remoteDescSet.get(fromUserId) && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch (e) {
          console.warn('Spaces candidate error:', e);
        }
      } else {
        const list = this.pendingCandidates.get(fromUserId) || [];
        list.push(signal.candidate);
        this.pendingCandidates.set(fromUserId, list);
      }
    }
  }

  async flushCandidates(peerId, pc) {
    const queue = this.pendingCandidates.get(peerId);
    if (!queue || !queue.length) return;
    this.pendingCandidates.set(peerId, []);
    for (const c of queue) {
      await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
  }

  createPeerConnection(targetUserId) {
    const pc = new RTCPeerConnection(this.iceServers);
    this.peerConnections.set(targetUserId, pc);
    this.remoteDescSet.set(targetUserId, false);
    this.iceRestartAttempts.set(targetUserId, 0);

    pc.onicecandidate = (event) => {
      if (event?.candidate && this.socketService) {
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

    pc.oniceconnectionstatechange = async () => {
      const state = pc.iceConnectionState;
      if ((state === 'disconnected' || state === 'failed') && this.canPublish()) {
        const attempts = this.iceRestartAttempts.get(targetUserId) || 0;
        if (attempts < 2) {
          this.iceRestartAttempts.set(targetUserId, attempts + 1);
          const offer = await restartIce(pc).catch(() => null);
          if (offer && this.socketService) {
            this.socketService.emit('spaces:signal', {
              spaceId: this.spaceId,
              targetUserId,
              signal: offer,
            });
          }
        }
      } else if (state === 'connected' || state === 'completed') {
        this.iceRestartAttempts.set(targetUserId, 0);
      }
    };

    if (this.canPublish() && this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    return pc;
  }

  removePeer(peerId) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      try { pc.close(); } catch {}
      this.peerConnections.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
    this.pendingCandidates.delete(peerId);
    this.remoteDescSet.delete(peerId);
    this.makingOffer.delete(peerId);
    this.iceRestartAttempts.delete(peerId);
  }

  applyOpusDtx(sessionDescription) {
    if (!sessionDescription || !sessionDescription.sdp) return sessionDescription;
    let sdp = sessionDescription.sdp;
    if (sdp.includes('useinbandfec=1') && !sdp.includes('usedtx=1')) {
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

    for (const peerId of Array.from(this.peerConnections.keys())) {
      this.removePeer(peerId);
    }
  }
}

export const createSpacesMediaAdapter = (transportToken) => {
  return new SpeakerMeshAudioAdapter();
};

export default {
  SpacesMediaAdapter,
  SpeakerMeshAudioAdapter,
  createSpacesMediaAdapter,
};
