// Web Audio & WebRTC Audio Engine for Clearfeed
const ICE_SERVERS = {
  iceServers: [
    // Public STUN servers for direct peer-to-peer connection (fastest, zero relay latency)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:openrelay.metered.ca:80' },

    // TURN Relay servers (Critical for cross-city / cross-ISP connections over 4G/CGNAT)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:80?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};

class SoundEffectsEngine {
  constructor() {
    this.audioCtx = null;
    this.ringInterval = null;
  }

  getAudioContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Pre-unlock audio context on user interaction (tap, click, keydown)
  unlock() {
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
  }

  // Play pleasant incoming ring tone + phone vibration
  startIncomingRing() {
    this.stopRingtone();
    this.unlock();

    const vibratePhone = () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([800, 400, 800, 400]);
        }
      } catch {}
    };

    vibratePhone();

    const playChime = () => {
      vibratePhone();
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.35); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.9);
      } catch {}
    };

    playChime();
    this.ringInterval = setInterval(playChime, 2200);
  }

  // Play outgoing ringback tone (soft dual beep)
  startOutgoingRing() {
    this.stopRingtone();
    this.unlock();
    const playBeep = () => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(425, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch {}
    };

    playBeep();
    this.ringInterval = setInterval(playBeep, 3500);
  }

  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(0);
      }
    } catch {}
  }

  // Play call connected tone
  playConnectedTone() {
    this.stopRingtone();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }

  // Play call ended tone
  playEndTone() {
    this.stopRingtone();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }
}

export const sounds = new SoundEffectsEngine();

// Microphone audio stream helper
export const getLocalAudioStream = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone access is not supported in this browser.');
  }
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
};

// Create RTCPeerConnection for WebRTC mesh audio
export const createPeerConnection = ({ onIceCandidate, onTrack, onConnectionStateChange }) => {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (event) => {
    if (event.candidate && typeof onIceCandidate === 'function') {
      onIceCandidate(event.candidate);
    }
  };

  pc.ontrack = (event) => {
    console.log('🔊 [WebRTC] ontrack received:', event);
    let stream = event.streams && event.streams[0] ? event.streams[0] : null;
    if (!stream && event.track) {
      stream = new MediaStream([event.track]);
    }
    if (stream && typeof onTrack === 'function') {
      onTrack(stream, event.track);
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log('🧊 [WebRTC ICE State]:', pc.iceConnectionState);
    if (typeof onConnectionStateChange === 'function') {
      onConnectionStateChange(pc.iceConnectionState);
    }
  };

  pc.onconnectionstatechange = () => {
    console.log('🔗 [WebRTC Connection State]:', pc.connectionState);
  };

  return pc;
};

// Automatically unlock audio context on user's first gesture
if (typeof window !== 'undefined') {
  const handleUserGesture = () => {
    sounds.unlock();
  };
  window.addEventListener('click', handleUserGesture, { passive: true });
  window.addEventListener('touchstart', handleUserGesture, { passive: true });
  window.addEventListener('keydown', handleUserGesture, { passive: true });
}
