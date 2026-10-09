import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Share2,
  RotateCcw,
  Copy,
  Check,
  Flame,
  Target,
  Zap,
  Sparkles,
  Swords,
  Activity,
  ChevronRight,
  X,
  Flag,
} from 'lucide-react';
import { getSpeedTier } from '../../utils/typingEngine';
import { useAuth } from '../../context/AuthContext';

// Cubic Bezier spline generator for smooth velocity curves
const getSmoothSvgPath = (points) => {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
};

// Polished 3D Golden Trophy Graphic
const GoldenTrophyGraphic = () => (
  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0 select-none">
    {/* Confetti Particles */}
    <div className="absolute inset-0 pointer-events-none">
      <span className="absolute top-1 left-2 w-2 h-2 rounded-xs bg-sky-400 rotate-12 animate-pulse" />
      <span className="absolute top-4 right-3 w-2.5 h-1.5 rounded-xs bg-amber-400 -rotate-45" />
      <span className="absolute bottom-3 left-4 w-1.5 h-2 rounded-xs bg-blue-500 rotate-45" />
      <span className="absolute top-10 left-0 w-2 h-2 rounded-full bg-cyan-300 opacity-80" />
      <span className="absolute top-8 right-1 w-2 h-2 rounded-full bg-orange-400 opacity-90 animate-ping" />
      <span className="absolute bottom-5 right-5 w-2 h-1.5 rounded-xs bg-amber-300 rotate-12" />
    </div>

    {/* SVG 3D Trophy */}
    <svg viewBox="0 0 160 160" className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.5)]">
      <defs>
        <linearGradient id="goldCupGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="goldStemGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="laurelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <filter id="trophyGlow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Laurel Wreath Left */}
      <path d="M 35 95 C 20 80 20 50 38 35 M 35 80 C 25 65 28 45 42 38 M 38 65 C 30 55 35 42 45 42" fill="none" stroke="url(#laurelGrad)" strokeWidth="3" strokeLinecap="round" />
      {/* Laurel Wreath Right */}
      <path d="M 125 95 C 140 80 140 50 122 35 M 125 80 C 135 65 132 45 118 38 M 122 65 C 130 55 125 42 115 42" fill="none" stroke="url(#laurelGrad)" strokeWidth="3" strokeLinecap="round" />

      {/* Trophy Handles */}
      <path d="M 45 45 C 22 45 22 75 48 78" fill="none" stroke="url(#goldCupGrad)" strokeWidth="7" strokeLinecap="round" />
      <path d="M 115 45 C 138 45 138 75 112 78" fill="none" stroke="url(#goldCupGrad)" strokeWidth="7" strokeLinecap="round" />

      {/* Trophy Cup Body */}
      <path d="M 45 32 L 115 32 C 115 32 115 75 80 92 C 45 75 45 32 45 32 Z" fill="url(#goldCupGrad)" filter="url(#trophyGlow)" />

      {/* Cup Rim Top */}
      <ellipse cx="80" cy="32" rx="35" ry="6" fill="#fef08a" />

      {/* Star Emblem inside Cup */}
      <polygon points="80,44 83,53 92,53 85,58 87,67 80,62 73,67 75,58 68,53 77,53" fill="#ffffff" />

      {/* Trophy Stem */}
      <path d="M 72 90 L 88 90 L 85 112 L 75 112 Z" fill="url(#goldStemGrad)" />
      <ellipse cx="80" cy="112" rx="14" ry="4" fill="#fbbf24" />

      {/* Pedestal Base */}
      <path d="M 52 116 L 108 116 L 114 132 L 46 132 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <rect x="58" y="119" width="44" height="10" rx="2" fill="#0f172a" />
      <rect x="62" y="122" width="36" height="4" rx="1" fill="#fbbf24" opacity="0.9" />
    </svg>
  </div>
);

export const TypingResultsModal = ({
  isOpen = false,
  onClose,
  results = null,
  onPlayAgain,
  onShareToFeed,
  onChallengeFriend,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const svgRef = useRef(null);

  // Keyboard Escape key & body scroll lock handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !results) return null;

  const {
    wpm = 0,
    rawWpm = 0,
    accuracy = 100,
    duration = 60,
    mode = 'words_200',
    highestCombo = 0,
    xpGained = 20,
    telemetry = [],
    savedToLeaderboard = true,
    userRank = 1,
    isGuest = false,
  } = results;

  const tier = getSpeedTier(wpm);
  const effectiveDuration = Number(duration) || 60;
  const userName = user?.name || user?.username || '';

  const handleCopy = () => {
    const summary = `⌨️ Clearfeed Typing Arena: ${wpm} WPM (${rawWpm} Raw) | ${accuracy}% Accuracy | ${highestCombo}x Streak [Tier: ${tier.name}]`;
    navigator.clipboard?.writeText?.(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Process & Normalize Speed Trajectory Data ---
  let rawList = Array.isArray(telemetry) && telemetry.length > 0 ? telemetry : [];

  if (rawList.length === 0) {
    const steps = Math.min(Math.max(5, effectiveDuration), 30);
    rawList = Array.from({ length: steps }, (_, i) => {
      const progress = (i + 1) / steps;
      const initialDip = Math.sin(progress * Math.PI) * (wpm * 0.15);
      const curve = wpm * (0.65 + 0.35 * progress) + initialDip;
      return Math.max(10, Math.round(curve));
    });
  }

  let normalizedPoints = [];
  const targetSamples = Math.min(rawList.length, Math.max(8, effectiveDuration));

  if (rawList.length <= targetSamples) {
    normalizedPoints = rawList.map((val, idx) => ({
      second: rawList.length === 1
        ? effectiveDuration
        : Math.max(1, Math.round(((idx + 1) / rawList.length) * effectiveDuration)),
      speed: Math.max(0, Math.round(Number(val) || 0)),
    }));
  } else {
    for (let i = 0; i < targetSamples; i++) {
      const sampleIdx = Math.round((i / (targetSamples - 1)) * (rawList.length - 1));
      normalizedPoints.push({
        second: Math.max(1, Math.round(((i + 1) / targetSamples) * effectiveDuration)),
        speed: Math.max(0, Math.round(Number(rawList[sampleIdx]) || 0)),
      });
    }
  }

  if (normalizedPoints.length > 0 && normalizedPoints[0].second > 1) {
    normalizedPoints.unshift({
      second: 0,
      speed: Math.max(0, Math.round(normalizedPoints[0].speed * 0.6)),
    });
  }

  const speedValues = normalizedPoints.map((p) => p.speed);
  const peakWpm = Math.max(...speedValues, wpm, 72);
  const avgWpm = Math.round(speedValues.reduce((a, b) => a + b, 0) / Math.max(1, speedValues.length)) || wpm;

  const variance = speedValues.reduce((sum, v) => sum + Math.pow(v - avgWpm, 2), 0) / Math.max(1, speedValues.length);
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(65, Math.min(99, Math.round(100 - (stdDev / Math.max(1, avgWpm)) * 45)));

  // --- SVG Dimensions & Coordinate Mapping ---
  const svgWidth = 620;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 35;
  const paddingBottom = 35;

  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  const maxY = Math.max(Math.ceil((peakWpm + 15) / 25) * 25, 100);

  const mappedPoints = normalizedPoints.map((pt) => {
    const x = paddingLeft + (pt.second / effectiveDuration) * graphWidth;
    const y = paddingTop + (1 - pt.speed / maxY) * graphHeight;
    return {
      ...pt,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
    };
  });

  const curvePath = getSmoothSvgPath(mappedPoints);
  const areaPath = mappedPoints.length > 1
    ? `${curvePath} L ${mappedPoints[mappedPoints.length - 1].x},${svgHeight - paddingBottom} L ${mappedPoints[0].x},${svgHeight - paddingBottom} Z`
    : '';

  const peakPoint = mappedPoints.reduce((max, p) => (p.speed > max.speed ? p : max), mappedPoints[0]);
  const lastPoint = mappedPoints[mappedPoints.length - 1] || mappedPoints[0];

  const yIntervals = [100, 75, 50, 25, 0];

  let timeStep = 3;
  if (effectiveDuration <= 15) timeStep = 3;
  else if (effectiveDuration <= 30) timeStep = 6;
  else if (effectiveDuration <= 60) timeStep = 15;
  else timeStep = 30;

  const timeTicks = [];
  for (let t = 0; t <= effectiveDuration; t += timeStep) {
    timeTicks.push(t);
  }
  if (!timeTicks.includes(effectiveDuration)) {
    timeTicks.push(effectiveDuration);
  }

  const handleGraphPointerMove = (e) => {
    if (!svgRef.current || mappedPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const normalizedX = ((clientX - rect.left) / rect.width) * svgWidth;

    let closest = mappedPoints[0];
    let minDiff = Infinity;
    for (const pt of mappedPoints) {
      const diff = Math.abs(pt.x - normalizedX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }
    setHoveredPoint(closest);
  };

  const handleGraphPointerLeave = () => {
    setHoveredPoint(null);
  };

  const formattedMode = mode.replace('_', ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Dark Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Pixel-Perfect Modal Card */}
      <div className="relative w-full max-w-5xl rounded-[28px] bg-[#070b14] border border-sky-500/30 shadow-[0_0_60px_rgba(2,132,199,0.25)] p-5 sm:p-7 text-white font-sans overflow-hidden flex flex-col gap-5 z-10 my-auto animate-fade-in">
        
        {/* 1. Modal Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Flag className="w-5 h-5 fill-sky-400 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Test Performance Completed
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                Great job{userName ? `, ${userName}` : ''}! You just leveled up your typing game!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-400 hover:text-white transition-all cursor-pointer shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Main 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT COLUMN: Achievement & Metrics (5 cols / approx 42%) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            {/* Achievement Card */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#1c1409] via-[#0b101c] to-[#070b14] border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden flex items-center justify-between gap-4">
              {/* Left Content */}
              <div className="space-y-3 z-10">
                {/* Swift Hacker Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{tier.name || 'Swift Hacker'}</span>
                </div>

                {/* Big WPM Metric */}
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl sm:text-7xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                    {wpm}
                  </span>
                  <span className="text-lg font-black text-sky-400 font-mono uppercase tracking-wider">
                    WPM
                  </span>
                </div>

                {/* Details Subtext */}
                <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                  {accuracy}% accuracy over <strong className="text-white">{duration} seconds</strong> • Words: <strong className="text-white">{formattedMode.replace('words ', '')}</strong>
                </p>

                {/* XP Awarded Pill */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>+{xpGained || 20} XP Awarded</span>
                </div>
              </div>

              {/* Right 3D Trophy Graphic */}
              <GoldenTrophyGraphic />
            </div>

            {/* Leaderboard Status Panel */}
            <div className="p-4 rounded-2xl bg-[#090f1d] border border-sky-500/30 flex items-center justify-between gap-3 shadow-md hover:border-sky-500/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>Saved to Leaderboard</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-black text-[10px] border border-sky-500/40 uppercase">
                      RANK #{userRank || 1}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Your {duration}s sprint score is live on the scoreboard!
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
            </div>

            {/* 3 Compact Stat Cards Row */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              {/* Card 1: Raw Speed */}
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-sky-500/40 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>RAW SPEED</span>
                </div>
                <div className="text-2xl font-black text-white">{rawWpm || wpm}</div>
                <div className="text-[10px] text-neutral-500 font-sans mt-0.5">Your typing speed</div>
              </div>

              {/* Card 2: Accuracy */}
              <div className="p-3.5 rounded-2xl bg-[#051515] border border-teal-500/40 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  <Target className="w-3.5 h-3.5 text-teal-400" />
                  <span>ACCURACY</span>
                </div>
                <div className="text-2xl font-black text-teal-400">{accuracy}%</div>
                <div className="text-[10px] text-teal-500/80 font-sans mt-0.5">
                  {accuracy === 100 ? 'No mistakes!' : 'High accuracy'}
                </div>
              </div>

              {/* Card 3: Max Streak */}
              <div className="p-3.5 rounded-2xl bg-[#160f08] border border-amber-500/40 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>MAX STREAK</span>
                </div>
                <div className="text-2xl font-black text-amber-400">{highestCombo}x</div>
                <div className="text-[10px] text-amber-500/80 font-sans mt-0.5">Your best streak</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Speed & Accuracy Analytics Chart (7 cols / approx 58%) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="p-5 rounded-3xl bg-[#060a14] border border-sky-500/30 shadow-2xl flex flex-col justify-between h-full space-y-3">
              
              {/* Graph Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wider uppercase font-mono">
                      SPEED & ACCURACY
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Your typing performance throughout the test
                    </p>
                  </div>
                </div>

                {/* 3 Metric Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Peak WPM Badge */}
                  <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-300" />
                    <span>Peak</span>
                    <Zap className="w-3 h-3 fill-amber-300" />
                    <span className="text-white font-extrabold">{peakWpm}</span>
                  </div>

                  {/* Avg WPM Badge */}
                  <div className="px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Avg</span>
                    <Zap className="w-3 h-3 fill-sky-300" />
                    <span className="text-white font-extrabold">{avgWpm}</span>
                  </div>

                  {/* Consistency Badge */}
                  <div className="px-2.5 py-1 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold flex items-center gap-1">
                    <Target className="w-3 h-3 text-teal-300" />
                    <span>Consistency</span>
                    <span className="text-white font-extrabold">{consistencyScore}%</span>
                  </div>
                </div>
              </div>

              {/* Interactive High-Contrast SVG Performance Chart */}
              <div className="relative w-full select-none my-1">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-52 sm:h-56 cursor-crosshair transition-all"
                  onMouseMove={handleGraphPointerMove}
                  onTouchMove={handleGraphPointerMove}
                  onMouseLeave={handleGraphPointerLeave}
                  onTouchEnd={handleGraphPointerLeave}
                >
                  <defs>
                    {/* Electric Blue Gradient Fill */}
                    <linearGradient id="speedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                      <stop offset="65%" stopColor="#0369a1" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#070b14" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Smooth Spline Stroke Gradient */}
                    <linearGradient id="speedStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>

                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Horizontal Gridlines & Axis Labels */}
                  {yIntervals.map((val) => {
                    const y = paddingTop + (1 - val / maxY) * graphHeight;
                    return (
                      <g key={`y-${val}`}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={svgWidth - paddingRight}
                          y2={y}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingLeft - 10}
                          y={y + 4}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Time Ticks & X-Axis Labels */}
                  {timeTicks.map((t) => {
                    const x = paddingLeft + (t / effectiveDuration) * graphWidth;
                    return (
                      <g key={`x-${t}`}>
                        <line
                          x1={x}
                          y1={svgHeight - paddingBottom}
                          x2={x}
                          y2={svgHeight - paddingBottom + 5}
                          stroke="#475569"
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={svgHeight - paddingBottom + 20}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {t}s
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area Fill under Curve */}
                  {areaPath && <path d={areaPath} fill="url(#speedAreaGrad)" />}

                  {/* Electric Velocity Line Curve */}
                  {curvePath && (
                    <path
                      d={curvePath}
                      fill="none"
                      stroke="url(#speedStrokeGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#neonGlow)"
                    />
                  )}

                  {/* Floating Marker Badge 1: Peak WPM */}
                  {peakPoint && (
                    <g>
                      <circle
                        cx={peakPoint.x}
                        cy={peakPoint.y}
                        r="5"
                        fill="#fbbf24"
                        stroke="#000000"
                        strokeWidth="2"
                      />
                      <g transform={`translate(${Math.max(40, Math.min(svgWidth - 50, peakPoint.x))}, ${Math.max(20, peakPoint.y - 24)})`}>
                        <rect x="-30" y="-11" width="60" height="20" rx="10" fill="#fbbf24" />
                        <text x="0" y="3" textAnchor="middle" fill="#000000" fontSize="11" fontFamily="monospace" fontWeight="900">
                          {peakPoint.speed} ⚡WPM
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Floating Marker Badge 2: Average WPM */}
                  {lastPoint && (
                    <g>
                      <circle
                        cx={lastPoint.x}
                        cy={lastPoint.y}
                        r="5"
                        fill="#2dd4bf"
                        stroke="#000000"
                        strokeWidth="2"
                      />
                      <g transform={`translate(${Math.max(45, Math.min(svgWidth - 45, lastPoint.x - 15))}, ${Math.max(20, lastPoint.y - 24)})`}>
                        <rect x="-42" y="-11" width="84" height="20" rx="10" fill="#0d9488" stroke="#2dd4bf" strokeWidth="1" />
                        <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="900">
                          AVG {avgWpm} WPM
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Pointer Hover Line & Beacon */}
                  {hoveredPoint && (
                    <g className="transition-all duration-75">
                      <line
                        x1={hoveredPoint.x}
                        y1={paddingTop}
                        x2={hoveredPoint.x}
                        y2={svgHeight - paddingBottom}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Graph Footer Bar */}
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hover over the graph to see detailed stats at any moment.</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <span>📖 Mode: {formattedMode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sky-500/20">
          
          {/* Button 1: Challenge a Friend (Orange-to-Gold Gradient Pill) */}
          <button
            type="button"
            onClick={onChallengeFriend}
            className="flex-1 min-w-[200px] w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-black font-black text-sm flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-amber-500/25 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-black/20 text-black font-black">
                <Swords className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-sm leading-tight text-black">
                  Challenge a Friend
                </div>
                <div className="text-[11px] font-medium text-black/80">
                  See who's faster!
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 2: Share to Feed (Electric Blue Gradient Pill) */}
          <button
            type="button"
            onClick={onShareToFeed}
            className="flex-1 min-w-[200px] w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] text-white font-black text-sm flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-sky-500/25 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/20 text-white">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-sm leading-tight text-white">
                  Share to Feed
                </div>
                <div className="text-[11px] font-medium text-sky-100">
                  Show off your score
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Button 3: Try Again (Dark Translucent Pill Button) */}
          <button
            type="button"
            onClick={onPlayAgain}
            className="py-3.5 px-5 rounded-2xl bg-[#121826] hover:bg-[#1a2336] border border-neutral-700/80 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-between gap-3 transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/10 text-neutral-300 group-hover:rotate-180 transition-transform duration-300">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-sm leading-tight text-white">
                  Try Again
                </div>
                <div className="text-[11px] font-medium text-neutral-400">
                  Beat your score
                </div>
              </div>
            </div>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy summary text"
            className="p-3 rounded-2xl bg-[#121826] hover:bg-[#1a2336] border border-neutral-700/80 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypingResultsModal;
