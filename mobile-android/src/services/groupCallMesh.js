/**
 * Clearfeed Android Group Call WebRTC P2P Mesh Engine
 *
 * Manages multi-peer full-duplex audio connections over react-native-webrtc
 * using deterministic offer initiator election (lower userId initiates) and
 * W3C Perfect Negotiation rollback to avoid glare collisions.
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

export class GroupCallMeshManager {
  constructor() {
    this.roomId = null;
    this.userId = null;
    this.socketService = null;
    this.iceConfig = DEFAULT_ICE_SERVERS;
    this.localStream = null;
    this.callbacks = {};
    this.peers = new Map();
  }

  connect({
    roomId,
    userId,
    socketService,
    iceServers = null,
    localStream = null,
    callbacks = {},
  }) {
    this.disconnect();
    this.roomId = roomId;
    this.userId = userId ? userId.toString() : null;
    this.socketService = socketService;
    this.iceConfig = normalizeIceConfig(iceServers);
    this.localStream = localStream;
    this.callbacks = callbacks;
  }

  setLocalStream(stream) {
    this.localStream = stream;
    const newTrack = stream?.getAudioTracks?.()[0] || null;
    for (const [peerId, entry] of this.peers.entries()) {
      const pc = entry.pc;
      if (!pc) continue;
      const senders = typeof pc.getSenders === 'function' ? pc.getSenders() : [];
      const audioSender = senders.find((s) => s.track?.kind === 'audio' || !s.track);
      if (audioSender && newTrack && typeof audioSender.replaceTrack === 'function') {
        audioSender.replaceTrack(newTrack).catch(() => {});
      } else if (newTrack && typeof pc.addTrack === 'function') {
        try {
          pc.addTrack(newTrack, stream);
          this.sendOffer(peerId);
        } catch {}
      }
    }
  }

  syncParticipants(participants = []) {
    if (!this.userId || !Array.isArray(participants)) return;

    const activeIds = new Set();
    for (const p of participants) {
      const peerId = (p?.user?._id || p?.user?.id || p?.userId || p?._id || p?.id)?.toString();
      if (!peerId || peerId === this.userId) continue;
      activeIds.add(peerId);
      this.ensurePeer(peerId, this.userId < peerId);
    }

    for (const existingPeerId of Array.from(this.peers.keys())) {
      if (!activeIds.has(existingPeerId)) {
        this.removePeer(existingPeerId);
      }
    }
  }

  handleUserJoined(participant) {
    if (!this.userId || !participant) return;
    const peerId = (participant.user?._id || participant.user?.id || participant.userId || participant._id)?.toString();
    if (!peerId || peerId === this.userId) return;
    this.ensurePeer(peerId, this.userId < peerId);
  }

  handleUserLeft(leftUserId) {
    if (!leftUserId) return;
    this.removePeer(leftUserId.toString());
  }

  ensurePeer(peerId, shouldInitiateOffer = false) {
    let entry = this.peers.get(peerId);
    if (!entry) {
      const pc = new RTCPeerConnection(this.iceConfig);
      entry = {
        pc,
        pendingCandidates: [],
        isRemoteDescSet: false,
        makingOffer: false,
        iceRestartAttempts: 0,
        remoteStream: null,
      };
      this.peers.set(peerId, entry);

      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => {
          pc.addTrack(track, this.localStream);
        });
      }

      pc.onicecandidate = (event) => {
        if (event?.candidate && this.socketService && this.roomId) {
          this.socketService.sendGroupCallSignal({
            roomId: this.roomId,
            targetUserId: peerId,
            signal: { type: 'candidate', candidate: event.candidate },
          });
        }
      };

      pc.ontrack = (event) => {
        const stream =
          event.streams && event.streams[0]
            ? event.streams[0]
            : new MediaStream(event.track ? [event.track] : []);
        entry.remoteStream = stream;
        if (typeof this.callbacks.onTrack === 'function') {
          this.callbacks.onTrack(peerId, stream, event.track);
        }
      };

      pc.oniceconnectionstatechange = async () => {
        const state = pc.iceConnectionState;
        if (state === 'disconnected' || state === 'failed') {
          if (entry.iceRestartAttempts < 2 && this.userId < peerId) {
            entry.iceRestartAttempts += 1;
            try {
              const offer = await restartIce(pc);
              if (offer && this.socketService && this.roomId) {
                this.socketService.sendGroupCallSignal({
                  roomId: this.roomId,
                  targetUserId: peerId,
                  signal: { type: 'offer', sdp: offer },
                });
              }
            } catch {}
          }
        } else if (state === 'connected' || state === 'completed') {
          entry.iceRestartAttempts = 0;
        }
      };

      if (shouldInitiateOffer) {
        this.sendOffer(peerId);
      }
    }
    return entry;
  }

  async sendOffer(peerId) {
    const entry = this.peers.get(peerId);
    if (!entry || !entry.pc || entry.makingOffer) return;
    try {
      entry.makingOffer = true;
      const offer = await entry.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
      if (entry.pc.signalingState !== 'stable') return;
      await entry.pc.setLocalDescription(offer);
      this.socketService?.sendGroupCallSignal({
        roomId: this.roomId,
        targetUserId: peerId,
        signal: { type: 'offer', sdp: entry.pc.localDescription || offer },
      });
    } catch (err) {
      console.warn(`Android Group call offer error (${peerId}):`, err.message);
    } finally {
      entry.makingOffer = false;
    }
  }

  async handleSignal(fromUserId, signal) {
    if (!fromUserId || !signal || !this.userId) return;
    const peerId = fromUserId.toString();
    if (peerId === this.userId) return;

    const entry = this.ensurePeer(peerId, false);
    const pc = entry.pc;

    try {
      if (signal.type === 'offer') {
        const sdpObj = signal.sdp || signal;
        const polite = this.userId > peerId;
        const offerCollision = entry.makingOffer || pc.signalingState !== 'stable';
        if (offerCollision) {
          if (!polite) {
            return;
          }
          await pc.setLocalDescription({ type: 'rollback' }).catch(() => {});
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdpObj));
        entry.isRemoteDescSet = true;
        await this.flushCandidates(entry);

        const answer = await pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        await pc.setLocalDescription(answer);
        this.socketService?.sendGroupCallSignal({
          roomId: this.roomId,
          targetUserId: peerId,
          signal: { type: 'answer', sdp: pc.localDescription || answer },
        });
      } else if (signal.type === 'answer') {
        const sdpObj = signal.sdp || signal;
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(sdpObj));
          entry.isRemoteDescSet = true;
          await this.flushCandidates(entry);
        }
      } else if (signal.type === 'candidate' || signal.candidate) {
        const candidateInit = signal.candidate || signal;
        if (entry.isRemoteDescSet && pc.remoteDescription?.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit)).catch(() => {});
        } else {
          entry.pendingCandidates.push(candidateInit);
        }
      }
    } catch (err) {
      console.warn(`Android Group call signal error (${peerId}):`, err.message);
    }
  }

  async flushCandidates(entry) {
    if (!entry.pendingCandidates.length) return;
    const queued = [...entry.pendingCandidates];
    entry.pendingCandidates = [];
    for (const c of queued) {
      await entry.pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
    }
  }

  removePeer(peerId) {
    const entry = this.peers.get(peerId);
    if (entry) {
      try {
        entry.pc.close();
      } catch {}
      this.peers.delete(peerId);
    }
  }

  disconnect() {
    for (const peerId of Array.from(this.peers.keys())) {
      this.removePeer(peerId);
    }
    this.roomId = null;
  }
}

export default GroupCallMeshManager;
