import React, { useEffect, useRef, useState } from 'react';

/**
 * Real-time dynamic audio wave and equalizer visualizer.
 * Connects to live Web Audio MediaStream when available,
 * and dynamically animates responsive sound waves when speaking.
 */
export const AudioVisualizerWave = ({
  stream = null,
  isSpeaking = false,
  isMuted = false,
  barCount = 18,
  accentColor = '#0ea5e9', // Clearfeed signature sky-500
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const [frequencies, setFrequencies] = useState(() =>
    Array.from({ length: barCount }, () => 0.15)
  );

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Height mappings based on size
  const heightClasses = {
    sm: 'h-6 gap-1',
    md: 'h-10 gap-1.5',
    lg: 'h-16 gap-2',
  }[size] || 'h-10 gap-1.5';

  const barWidthClass = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2.5',
  }[size] || 'w-1.5';

  // 1. Live MediaStream Web Audio Analysis
  useEffect(() => {
    if (!stream || isMuted || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateFrequency = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Normalize frequency values into 0.1 - 1.0 scale
        const step = Math.max(1, Math.floor(dataArray.length / barCount));
        const newFreqs = Array.from({ length: barCount }, (_, i) => {
          const val = dataArray[i * step] || 0;
          return Math.max(0.12, Math.min(1.0, val / 200));
        });

        setFrequencies(newFreqs);
        animationFrameRef.current = requestAnimationFrame(updateFrequency);
      };

      updateFrequency();

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
      };
    } catch (e) {
      // Fallback handled by simulated wave below
    }
  }, [stream, isMuted, barCount]);

  // 2. Simulated Sound Waves when stream isn't directly bound or for remote peers
  useEffect(() => {
    if (stream) return; // Managed by audio analyzer

    let frameId;
    let time = 0;

    const animateSimulatedWave = () => {
      time += 0.15;
      if (isMuted) {
        setFrequencies(Array.from({ length: barCount }, () => 0.1));
        return;
      }

      if (isSpeaking) {
        const newFreqs = Array.from({ length: barCount }, (_, i) => {
          // Dynamic harmonic sine & organic noise for lifelike voice modulation
          const sinWave = Math.sin(time + i * 0.45) * 0.35;
          const cosWave = Math.cos(time * 0.8 - i * 0.3) * 0.25;
          const rand = Math.sin(i * 13.5 + time) * 0.2;
          const val = Math.max(0.2, Math.min(1.0, 0.45 + sinWave + cosWave + rand));
          return val;
        });
        setFrequencies(newFreqs);
        frameId = requestAnimationFrame(animateSimulatedWave);
      } else {
        // Idle gentle breathing baseline
        const idleWave = Array.from({ length: barCount }, (_, i) => {
          return 0.12 + Math.sin(time * 0.5 + i * 0.3) * 0.05;
        });
        setFrequencies(idleWave);
        frameId = requestAnimationFrame(animateSimulatedWave);
      }
    };

    animateSimulatedWave();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [stream, isSpeaking, isMuted, barCount]);

  return (
    <div
      className={`flex items-center justify-center ${heightClasses} ${className}`}
      aria-label={isSpeaking ? 'Speaking audio wave' : 'Microphone idle'}
    >
      {frequencies.map((scale, index) => {
        const heightPercent = Math.max(12, Math.min(100, Math.round(scale * 100)));
        const isActive = isSpeaking || (stream && scale > 0.25);

        return (
          <div
            key={index}
            className={`relative rounded-full transition-all duration-75 ${barWidthClass}`}
            style={{
              height: `${heightPercent}%`,
              backgroundColor: isMuted
                ? '#71717a'
                : isActive
                ? accentColor
                : '#94a3b8',
              opacity: isMuted ? 0.35 : isActive ? 1 : 0.45,
              boxShadow:
                isActive && !isMuted
                  ? `0 0 10px ${accentColor}80, 0 0 4px ${accentColor}`
                  : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioVisualizerWave;
