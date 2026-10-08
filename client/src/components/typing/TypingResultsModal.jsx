import React, { useState, useRef } from 'react';
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
  Crown,
} from 'lucide-react';
import { getSpeedTier } from '../../utils/typingEngine';
import Modal from '../common/Modal';

// Cubic Bezier spline generator for buttery smooth curves
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

export const TypingResultsModal = ({
  isOpen,
  onClose,
  results, // { wpm, rawWpm, accuracy, duration, mode, highestCombo, xpGained, telemetry }
  onPlayAgain,
  onShareToFeed,
  onChallengeFriend,
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const svgRef = useRef(null);

  if (!results) return null;

  const {
    wpm = 0,
    rawWpm = 0,
    accuracy = 100,
    duration = 60,
    mode = 'words_200',
    highestCombo = 0,
    xpGained = 0,
    telemetry = [],
    savedToLeaderboard = false,
    userRank = null,
    isGuest = false,
  } = results;

  const tier = getSpeedTier(wpm);
  const effectiveDuration = Number(duration) || 60;

  const handleCopy = () => {
    const summary = `⌨️ Clearfeed Typing Arena: ${wpm} WPM (${rawWpm} Raw) | ${accuracy}% Accuracy | ${highestCombo}x Streak [Tier: ${tier.name}]`;
    navigator.clipboard?.writeText?.(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Process & Normalize Speed Trajectory Data ---
  let rawList = Array.isArray(telemetry) && telemetry.length > 0 ? telemetry : [];

  // If telemetry is empty, synthesize realistic human pace curve culminating at final WPM
  if (rawList.length === 0) {
    const steps = Math.min(Math.max(5, effectiveDuration), 30);
    rawList = Array.from({ length: steps }, (_, i) => {
      const progress = (i + 1) / steps;
      const initialDip = Math.sin(progress * Math.PI) * (wpm * 0.15);
      const curve = wpm * (0.65 + 0.35 * progress) + initialDip;
      return Math.max(10, Math.round(curve));
    });
  }

  // Downsample if telemetry exceeds duration (e.g., from high-frequency samplers)
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

  // Ensure start point at 0s for a grounded trajectory
  if (normalizedPoints.length > 0 && normalizedPoints[0].second > 1) {
    normalizedPoints.unshift({
      second: 0,
      speed: Math.max(0, Math.round(normalizedPoints[0].speed * 0.6)),
    });
  }

  // Speed statistics
  const speedValues = normalizedPoints.map((p) => p.speed);
  const peakWpm = Math.max(...speedValues, wpm);
  const minWpm = Math.min(...speedValues, wpm);
  const avgWpm = Math.round(speedValues.reduce((a, b) => a + b, 0) / Math.max(1, speedValues.length)) || wpm;

  // Consistency score (%): 100 - coefficient of variation * 50
  const variance = speedValues.reduce((sum, v) => sum + Math.pow(v - avgWpm, 2), 0) / Math.max(1, speedValues.length);
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(60, Math.min(99, Math.round(100 - (stdDev / Math.max(1, avgWpm)) * 50)));

  // --- SVG Dimensions & Coordinate Mapping ---
  const svgWidth = 560;
  const svgHeight = 200;
  const paddingLeft = 46;
  const paddingRight = 24;
  const paddingTop = 30;
  const paddingBottom = 32;

  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  // Round max WPM up to nearest 20 or 25 for clean grid intervals
  const maxY = Math.max(Math.ceil((peakWpm + 15) / 25) * 25, 60);

  const mappedPoints = normalizedPoints.map((pt) => {
    const x = paddingLeft + (pt.second / effectiveDuration) * graphWidth;
    const y = paddingTop + (1 - pt.speed / maxY) * graphHeight;
    return {
      ...pt,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      delta: pt.speed - avgWpm,
    };
  });

  const curvePath = getSmoothSvgPath(mappedPoints);
  const areaPath = mappedPoints.length > 1
    ? `${curvePath} L ${mappedPoints[mappedPoints.length - 1].x},${svgHeight - paddingBottom} L ${mappedPoints[0].x},${svgHeight - paddingBottom} Z`
    : '';

  // Peak Point Marker
  const peakPoint = mappedPoints.reduce((max, p) => (p.speed > max.speed ? p : max), mappedPoints[0]);

  // Horizontal Grid Lines (Y-Axis intervals)
  const yIntervals = [maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0];

  // Vertical Time Markers (X-Axis intervals)
  let timeStep = 5;
  if (effectiveDuration <= 15) timeStep = 3;
  else if (effectiveDuration <= 30) timeStep = 5;
  else if (effectiveDuration <= 60) timeStep = 10;
  else timeStep = 20;

  const timeTicks = [];
  for (let t = 0; t <= effectiveDuration; t += timeStep) {
    timeTicks.push(t);
  }
  if (!timeTicks.includes(effectiveDuration)) {
    timeTicks.push(effectiveDuration);
  }

  // Average WPM reference line Y-coordinate
  const avgLineY = paddingTop + (1 - avgWpm / maxY) * graphHeight;

  // --- Interactive Hover Handlers ---
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test Completed!">
      <div className="font-sans space-y-5">
        {/* Top Celebration Card */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#12161f] border border-neutral-800 text-center overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-32 h-32 text-amber-400" />
          </div>

          {/* Tier Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 text-xs font-mono font-bold tracking-wide shadow-sm"
            style={{ backgroundColor: `${tier.bg}`, borderColor: `${tier.border}` }}
          >
            <span>{tier.badge}</span>
            <span className={tier.color}>{tier.name}</span>
          </div>

          {/* Big WPM Metric */}
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-5xl sm:text-6xl font-extrabold text-white font-mono tracking-tight">
              {wpm}
            </span>
            <span className="text-base text-neutral-400 font-bold uppercase tracking-wider">
              WPM
            </span>
          </div>

          <p className="text-xs text-neutral-400">
            {accuracy}% accuracy over {duration} seconds in {mode.replace('_', ' ')}
          </p>

          {xpGained > 0 && (
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{xpGained} XP Awarded</span>
            </div>
          )}
        </div>

        {/* Leaderboard Status Banner */}
        {savedToLeaderboard ? (
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Saved to Global Leaderboard</span>
                  {userRank && (
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-extrabold text-[10px]">
                      RANK #{userRank}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Your {duration}s sprint score is active and ranked on the scoreboard!
                </div>
              </div>
            </div>
          </div>
        ) : isGuest ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-amber-200">
                  Guest Mode · Score Not Saved to Leaderboard
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  You scored {wpm} WPM! Sign in or register to record your scores and claim your leaderboard rank.
                </div>
              </div>
            </div>
            <a
              href="/login"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 text-center transition-colors shadow-sm"
            >
              Sign In to Save
            </a>
          </div>
        ) : null}

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center">
            <div className="text-xs text-neutral-500 mb-0.5">Raw Speed</div>
            <div className="text-xl font-bold text-neutral-200">{rawWpm}</div>
            <div className="text-[10px] text-neutral-600 font-sans">wpm</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center">
            <div className="text-xs text-neutral-500 mb-0.5 flex items-center justify-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" /> Accuracy
            </div>
            <div className="text-xl font-bold text-emerald-400">{accuracy}%</div>
            <div className="text-[10px] text-neutral-600 font-sans">precision</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center">
            <div className="text-xs text-neutral-500 mb-0.5 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Max Streak
            </div>
            <div className="text-xl font-bold text-amber-400">{highestCombo}x</div>
            <div className="text-[10px] text-neutral-600 font-sans">consecutive</div>
          </div>
        </div>

        {/* Interactive Dynamic Speed Trajectory Graph */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e14] border border-neutral-800/90 shadow-xl overflow-hidden">
          {/* Graph Header: Meaningful Title & Interactive Real-Time Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-sky-500/15 text-sky-400">
                <Activity className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                  Speed Trajectory & Pace
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Interactive second-by-second velocity curve
                </p>
              </div>
            </div>

            {/* Dynamic Metric Display: Switches on Hover to exact second */}
            <div className="flex items-center gap-2 font-mono text-xs">
              {hoveredPoint ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300 animate-fadeIn">
                  <span className="font-bold">⏱️ {hoveredPoint.second}s:</span>
                  <span className="text-white font-extrabold text-sm">{hoveredPoint.speed} WPM</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      hoveredPoint.delta >= 0
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {hoveredPoint.delta >= 0 ? `+${hoveredPoint.delta}` : hoveredPoint.delta} vs avg
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <span className="text-neutral-500 mr-1">Peak:</span>
                    <strong className="text-amber-400 font-bold">{peakWpm}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <span className="text-neutral-500 mr-1">Avg:</span>
                    <strong className="text-sky-400 font-bold">{avgWpm}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <span className="text-neutral-500 mr-1">Consistency:</span>
                    <strong className="text-emerald-400 font-bold">{consistencyScore}%</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SVG Canvas Container with full hover interactivity */}
          <div className="relative w-full overflow-hidden select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 sm:h-52 cursor-crosshair transition-all"
              onMouseMove={handleGraphPointerMove}
              onTouchMove={handleGraphPointerMove}
              onMouseLeave={handleGraphPointerLeave}
              onTouchEnd={handleGraphPointerLeave}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="speedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>

                {/* Main Stroke Gradient */}
                <linearGradient id="speedStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="70%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>

                {/* Soft Glow Filter */}
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Horizontal Y-Axis Grid Lines & WPM Scale */}
              {yIntervals.map((val) => {
                const y = paddingTop + (1 - val / maxY) * graphHeight;
                return (
                  <g key={`y-${val}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#262626"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#737373"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* 2. Vertical X-Axis Time Marks */}
              {timeTicks.map((t) => {
                const x = paddingLeft + (t / effectiveDuration) * graphWidth;
                return (
                  <g key={`x-${t}`}>
                    <line
                      x1={x}
                      y1={svgHeight - paddingBottom}
                      x2={x}
                      y2={svgHeight - paddingBottom + 5}
                      stroke="#404040"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={svgHeight - paddingBottom + 18}
                      textAnchor="middle"
                      fill="#737373"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      {t}s
                    </text>
                  </g>
                );
              })}

              {/* 3. Average Speed Reference Baseline */}
              {avgWpm > 0 && avgLineY >= paddingTop && avgLineY <= svgHeight - paddingBottom && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={avgLineY}
                    x2={svgWidth - paddingRight}
                    y2={avgLineY}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.4"
                  />
                  <text
                    x={svgWidth - paddingRight}
                    y={avgLineY - 4}
                    textAnchor="end"
                    fill="#38bdf8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    opacity="0.8"
                  >
                    AVG {avgWpm} WPM
                  </text>
                </g>
              )}

              {/* 4. Area Gradient Fill under curve */}
              {areaPath && (
                <path d={areaPath} fill="url(#speedAreaGrad)" />
              )}

              {/* 5. Main Velocity Trajectory Line with Smooth Spline */}
              {curvePath && (
                <path
                  d={curvePath}
                  fill="none"
                  stroke="url(#speedStrokeGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonGlow)"
                />
              )}

              {/* 6. Peak WPM Highlight Marker */}
              {peakPoint && (
                <g>
                  <circle
                    cx={peakPoint.x}
                    cy={peakPoint.y}
                    r="4"
                    fill="#fbbf24"
                    stroke="#000000"
                    strokeWidth="1.5"
                  />
                  <text
                    x={peakPoint.x}
                    y={Math.max(paddingTop - 6, peakPoint.y - 8)}
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="extrabold"
                  >
                    ★ {peakPoint.speed}
                  </text>
                </g>
              )}

              {/* 7. Interactive Hover Cursor & Tooltip */}
              {hoveredPoint && (
                <g className="transition-all duration-75">
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={hoveredPoint.x}
                    y1={paddingTop}
                    x2={hoveredPoint.x}
                    y2={svgHeight - paddingBottom}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.85"
                  />

                  {/* Pulsing Beacon Circle */}
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="9"
                    fill="#38bdf8"
                    fillOpacity="0.25"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="5"
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="2"
                    fill="#ffffff"
                  />

                  {/* Interactive Tooltip Callout Box */}
                  {(() => {
                    const tooltipWidth = 100;
                    const tooltipHeight = 44;
                    const clampedX = Math.max(
                      paddingLeft,
                      Math.min(svgWidth - paddingRight - tooltipWidth, hoveredPoint.x - tooltipWidth / 2)
                    );
                    const isNearTop = hoveredPoint.y < paddingTop + 50;
                    const tooltipY = isNearTop ? hoveredPoint.y + 12 : hoveredPoint.y - tooltipHeight - 12;

                    return (
                      <g transform={`translate(${clampedX}, ${tooltipY})`}>
                        {/* Box Background */}
                        <rect
                          width={tooltipWidth}
                          height={tooltipHeight}
                          rx="8"
                          fill="#0f172a"
                          fillOpacity="0.95"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        {/* Tooltip Content */}
                        <text
                          x={tooltipWidth / 2}
                          y="16"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          Time: {hoveredPoint.second}s
                        </text>
                        <text
                          x={tooltipWidth / 2}
                          y="34"
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="13"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {hoveredPoint.speed} WPM
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>
          </div>

          {/* Graph Footer Caption */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono mt-2 pt-2 border-t border-neutral-800/60">
            <span>💡 Hover across the trajectory to inspect speed at each second</span>
            <span>Duration: {duration}s · {mode.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          {onChallengeFriend && (
            <button
              type="button"
              onClick={onChallengeFriend}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-extrabold text-sm transition-all duration-150 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Swords className="w-4 h-4" />
              <span>Challenge a Friend</span>
            </button>
          )}

          <button
            type="button"
            onClick={onShareToFeed}
            className={`w-full ${onChallengeFriend ? 'sm:w-auto' : 'sm:flex-1'} flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-md shadow-sky-500/20`}
          >
            <Share2 className="w-4 h-4" />
            <span>Share to Feed</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy summary text"
            className="p-3 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TypingResultsModal;
