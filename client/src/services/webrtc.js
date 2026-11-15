// Web Audio & WebRTC Audio Engine for Clearfeed

export const DEFAULT_ICE_SERVERS = {
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

// In-Memory Cached Ephemeral ICE Server configuration (TTL: 30 minutes)
let cachedIceConfiguration = null;
let lastIceFetchTime = 0;
const ICE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 mins

/**
 * Fetch dynamic ephemeral HMAC-SHA1 TURN/STUN credentials from backend
 */
export const fetchIceServers = async (apiClient) => {
  const now = Date.now();
  if (cachedIceConfiguration && (now - lastIceFetchTime) < ICE_CACHE_TTL_MS) {
    return cachedIceConfiguration;
  }

  try {
    if (apiClient && typeof apiClient.get === 'function') {
      const res = await apiClient.get('/calls/ice-servers');
      if (res.data?.iceServers && Array.isArray(res.data.iceServers)) {
        cachedIceConfiguration = {
          iceServers: res.data.iceServers,
          iceCandidatePoolSize: 10,
        };
        lastIceFetchTime = now;
        return cachedIceConfiguration;
      }
    }
  } catch (err) {
    console.warn('⚠️ Ephemeral ICE server fetch notice, falling back to static configuration:', err.message);
  }

  return DEFAULT_ICE_SERVERS;
};

// Backwards-compatible export
export const ICE_SERVERS = DEFAULT_ICE_SERVERS;

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
          // Chrome Intervention compliance: check user activation before calling navigator.vibrate
          const hasActivation = typeof navigator.userActivation !== 'undefined'
            ? !!(navigator.userActivation.hasBeenActive || navigator.userActivation.isActive)
            : true;
          if (hasActivation) {
            navigator.vibrate([800, 400, 800, 400]);
          }
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
        const hasActivation = typeof navigator.userActivation !== 'undefined'
          ? !!(navigator.userActivation.hasBeenActive || navigator.userActivation.isActive)
          : true;
        if (hasActivation) {
          navigator.vibrate(0);
        }
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

// Microphone audio stream helper with optional audio input device selection
export const getLocalAudioStream = async (audioSourceDeviceId = null) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone access is not supported in this browser.');
  }

  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  if (audioSourceDeviceId) {
    audioConstraints.deviceId = { exact: audioSourceDeviceId };
  }

  return await navigator.mediaDevices.getUserMedia({
    audio: audioConstraints,
    video: false,
  });
};

// Audio Device Enumeration (Microphones and Speakers/Headsets)
export const enumerateAudioDevices = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return { audioInputs: [], audioOutputs: [] };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices
      .filter((d) => d.kind === 'audioinput')
      .map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${index + 1}`,
      }));

    const audioOutputs = devices
      .filter((d) => d.kind === 'audiooutput')
      .map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Speaker/Headset ${index + 1}`,
      }));

    return { audioInputs, audioOutputs };
  } catch (err) {
    console.warn('Device enumeration error:', err);
    return { audioInputs: [], audioOutputs: [] };
  }
};

// Set Audio Output Device (setSinkId) for Windows Headset/Speaker Switching
export const setAudioOutputDevice = async (audioElement, deviceId) => {
  if (!audioElement || !deviceId) return false;
  if (typeof audioElement.setSinkId === 'function') {
    try {
      await audioElement.setSinkId(deviceId);
      console.log(`🔊 [Audio Output] Routed audio to device: ${deviceId}`);
      return true;
    } catch (err) {
      console.warn('⚠️ setSinkId notice:', err.message);
      return false;
    }
  }
  return false;
};

// WebRTC ICE Restart helper
export const restartIce = async (pc) => {
  if (!pc) return null;
  try {
    if (typeof pc.restartIce === 'function') {
      pc.restartIce();
    }
    const offer = await pc.createOffer({ iceRestart: true });
    await pc.setLocalDescription(offer);
    return offer;
  } catch (err) {
    console.warn('ICE restart offer creation failed:', err);
    return null;
  }
};

// Create RTCPeerConnection for WebRTC mesh audio with configurable ICE servers
export const createPeerConnection = ({
  iceServers = null,
  onIceCandidate,
  onTrack,
  onConnectionStateChange,
}) => {
  const config = iceServers || cachedIceConfiguration || DEFAULT_ICE_SERVERS;
  const pc = new RTCPeerConnection(config);

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
