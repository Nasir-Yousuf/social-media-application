// Advanced Synthesizer Web Audio Engine for Multiplayer Typing Racing Arena
// High-Octane V8 Supercar Acoustics, Dynamic Gearbox & Exhaust Synthesizer
// Zero external audio files required — ultra-lightweight, 0 network latency, 0 KB extra download!

class RacingAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('clearfeed_racing_muted') === 'true';
    this.engineGain = null;
    this.engineOsc = null;
    this.engineSub = null;
    this.engineHarmonic = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    this.currentBaseFreq = 52;
    this.lastGear = 1;
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
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.035);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
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

      const freq = count === 0 ? 987.77 : 493.88; // 0 is high-pitch "GO!"
      const duration = count === 0 ? 0.45 : 0.18;

      osc.type = count === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      if (count === 0) {
        osc.frequency.exponentialRampToValueAtTime(1400, now + duration);
      }

      gain.gain.setValueAtTime(0.22, now);
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
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(4200, now + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // Turbo whistle
      const whistle = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(600, now);
      whistle.frequency.exponentialRampToValueAtTime(2400, now + 0.35);
      whistleGain.gain.setValueAtTime(0.18, now);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      whistle.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);
      whistle.start(now);
      whistle.stop(now + 0.45);
    } catch (_) {}
  }

  // Overtake Doppler pass-by swoosh (ZHOOOOOOM!)
  playOvertake() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (_) {}
  }

  // Gear Shift Blow-Off Valve & Clutch Drop
  playGearShift(gear = 2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Turbo blow-off valve hiss
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // Brief drop in engine frequency to simulate transmission engagement
      if (this.engineOsc && this.isEngineRunning) {
        const cur = this.currentBaseFreq;
        this.engineOsc.frequency.setValueAtTime(Math.max(45, cur * 0.72), now);
        this.engineOsc.frequency.setTargetAtTime(cur, now + 0.05, 0.1);
      }
    } catch (_) {}
  }

  // Throttle rev on every correct keystroke (Gas Pedal Blip)
  revThrottle() {
    if (this.isMuted || !this.isEngineRunning || !this.engineOsc || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const surgeFreq = this.currentBaseFreq + 28;
      this.engineOsc.frequency.setValueAtTime(surgeFreq, now);
      this.engineOsc.frequency.setTargetAtTime(this.currentBaseFreq, now + 0.04, 0.08);

      if (this.engineGain) {
        this.engineGain.gain.setValueAtTime(0.16, now);
        this.engineGain.gain.setTargetAtTime(0.11, now + 0.05, 0.08);
      }
    } catch (_) {}
  }

  // Start continuous roaring supercar engine
  startEngine(speedKmH = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    if (this.isEngineRunning) {
      this.updateEnginePitch(speedKmH);
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineSub = this.ctx.createOscillator();
      this.engineHarmonic = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      // V8 multi-oscillator mix
      this.engineOsc.type = 'sawtooth';
      this.engineSub.type = 'triangle';
      this.engineHarmonic.type = 'sawtooth';

      const baseFreq = 48 + Math.min(220, (speedKmH || 40) * 0.95);
      this.currentBaseFreq = baseFreq;

      this.engineOsc.frequency.setValueAtTime(baseFreq, now);
      this.engineSub.frequency.setValueAtTime(baseFreq * 0.5, now);
      this.engineHarmonic.frequency.setValueAtTime(baseFreq * 1.5, now);

      // Audible, punchy engine volume (clearly hearable through laptop speakers)
      this.engineGain.gain.setValueAtTime(0.11, now);

      // Resonant Lowpass Filter for throaty supercar exhaust rumble
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(550, now);
      this.engineFilter.Q.setValueAtTime(2.2, now);

      // Connect network
      this.engineOsc.connect(this.engineFilter);
      this.engineSub.connect(this.engineFilter);
      this.engineHarmonic.connect(this.engineFilter);

      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
      this.engineSub.start(now);
      this.engineHarmonic.start(now);
      this.isEngineRunning = true;
    } catch (_) {}
  }

  // Update engine pitch & exhaust roar dynamically as player accelerates or shifts gears
  updateEnginePitch(speedKmH = 0, isNitro = false) {
    if (!this.isEngineRunning || !this.engineOsc || !this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const safeSpeed = Math.max(0, Number(speedKmH) || 0);

      // Gear calculation to trigger transmission shift sound
      const currentGear = Math.min(6, Math.max(1, Math.floor(safeSpeed / 35) + 1));
      if (currentGear !== this.lastGear && safeSpeed > 25) {
        this.playGearShift(currentGear);
        this.lastGear = currentGear;
      }

      // Target frequency scales smoothly from 48Hz (idle) up to 320Hz (high speed)
      const targetFreq = 48 + Math.min(260, safeSpeed * 1.1) + (isNitro ? 75 : 0);
      this.currentBaseFreq = targetFreq;

      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
      if (this.engineSub) {
        this.engineSub.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.08);
      }
      if (this.engineHarmonic) {
        this.engineHarmonic.frequency.setTargetAtTime(targetFreq * 1.5, now, 0.08);
      }

      // Filter opens up as speed increases (brighter exhaust scream)
      if (this.engineFilter) {
        const filterCutoff = 450 + Math.min(1800, safeSpeed * 8.5) + (isNitro ? 600 : 0);
        this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.1);
      }

      // Engine volume increases slightly with speed
      if (this.engineGain) {
        const targetVol = 0.10 + Math.min(0.08, safeSpeed * 0.00045) + (isNitro ? 0.04 : 0);
        this.engineGain.gain.setTargetAtTime(targetVol, now, 0.1);
      }
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
        const dur = 0.28;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
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
          if (this.engineHarmonic) this.engineHarmonic.stop();
        } catch (_) {}
        this.engineOsc = null;
        this.engineSub = null;
        this.engineHarmonic = null;
        this.engineGain = null;
        this.engineFilter = null;
        this.isEngineRunning = false;
      }, 65);
    } catch (_) {
      this.isEngineRunning = false;
    }
  }
}

export const racingAudio = new RacingAudioEngine();
export default racingAudio;
