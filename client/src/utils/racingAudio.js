// Synthesizer Web Audio API sound engine for Multiplayer Typing Racing Arena
// Zero external audio files required — ultra-lightweight, 0 network latency, 0 KB extra download!

class RacingAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('clearfeed_racing_muted') === 'true';
    this.engineGain = null;
    this.engineOsc = null;
    this.engineSub = null;
    this.isEngineRunning = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('clearfeed_racing_muted', muted ? 'true' : 'false');
    if (muted) {
      this.stopEngine();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  // Soft mechanical key click for typing
  playKey(isCorrect = true) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isCorrect) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  // Countdown beeps (3, 2, 1, GO)
  playCountdown(count) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = count === 0 ? 880 : 440; // 0 is "GO!"
      const duration = count === 0 ? 0.35 : 0.15;

      osc.type = count === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      if (count === 0) {
        osc.frequency.exponentialRampToValueAtTime(1200, now + duration);
      }

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (_) {}
  }

  // Nitro Boost explosion / whoosh
  playNitro() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise blast + rising sine wave
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // Turbo whistle
      const whistle = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(500, now);
      whistle.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
      whistleGain.gain.setValueAtTime(0.12, now);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      whistle.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);
      whistle.start(now);
      whistle.stop(now + 0.4);
    } catch (_) {}
  }

  // Overtake swoosh
  playOvertake() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  // Victory fanfare
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.1;
        const dur = 0.25;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    } catch (_) {}
  }

  // Start continuous engine hum modulated by live speed (WPM)
  startEngine(wpm = 40) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      const now = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineSub = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineSub.type = 'triangle';

      const baseFreq = 50 + Math.min(180, wpm * 0.9);
      this.engineOsc.frequency.setValueAtTime(baseFreq, now);
      this.engineSub.frequency.setValueAtTime(baseFreq / 2, now);

      this.engineGain.gain.setValueAtTime(0.025, now);

      // Lowpass filter to muffle harsh buzzing
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);

      this.engineOsc.connect(filter);
      this.engineSub.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
      this.engineSub.start(now);
      this.isEngineRunning = true;
    } catch (_) {}
  }

  // Update engine pitch dynamically as player accelerates
  updateEnginePitch(wpm = 0, isNitro = false) {
    if (!this.isEngineRunning || !this.engineOsc || !this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const targetFreq = 55 + Math.min(220, wpm * 1.1) + (isNitro ? 60 : 0);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
      if (this.engineSub) {
        this.engineSub.frequency.setTargetAtTime(targetFreq / 2, now, 0.1);
      }
    } catch (_) {}
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      }
      setTimeout(() => {
        try {
          if (this.engineOsc) this.engineOsc.stop();
          if (this.engineSub) this.engineSub.stop();
        } catch (_) {}
        this.engineOsc = null;
        this.engineSub = null;
        this.engineGain = null;
        this.isEngineRunning = false;
      }, 60);
    } catch (_) {
      this.isEngineRunning = false;
    }
  }
}

export const racingAudio = new RacingAudioEngine();
export default racingAudio;
