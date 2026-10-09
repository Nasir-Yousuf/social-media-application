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
  ChevronRight,
} from 'lucide-react';
import { getSpeedTier } from '../../utils/typingEngine';
import Modal from '../common/Modal';

// Cubic Bezier spline generator for smooth curves
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

  if (!results || !isOpen) return null;

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
  const peakWpm = Math.max(...speedValues, wpm);
  const minWpm = Math.min(...speedValues, wpm);
  const avgWpm = Math.round(speedValues.reduce((a, b) => a + b, 0) / Math.max(1, speedValues.length)) || wpm;

  const variance = speedValues.reduce((sum, v) => sum + Math.pow(v - avgWpm, 2), 0) / Math.max(1, speedValues.length);
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(60, Math.min(99, Math.round(100 - (stdDev / Math.max(1, avgWpm)) * 50)));

  // --- SVG Dimensions & Coordinate Mapping ---
  const svgWidth = 620;
  const svgHeight = 240;
  const paddingLeft = 52;
  const paddingRight = 28;
  const paddingTop = 36;
  const paddingBottom = 38;

  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

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

  const peakPoint = mappedPoints.reduce((max, p) => (p.speed > max.speed ? p : max), mappedPoints[0]);

  const yIntervals = [maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0];

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

  const avgLineY = paddingTop + (1 - avgWpm / maxY) * graphHeight;

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
    <Modal isOpen={isOpen} onClose={onClose} title="🎉 Test Performance Completed" maxWidth="max-w-5xl">
      <div className="font-sans space-y-5 select-none">
        {/* Main 2-Column Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Metrics & Celebration (5 cols / 40%) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Top Celebration Card */}
            <div className="relative p-5 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#12161f] border border-neutral-800 text-center overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-28 h-28 text-amber-400" />
              </div>

              {/* Tier Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-2 text-xs font-mono font-bold tracking-wide shadow-sm"
                style={{ backgroundColor: `${tier.bg}`, borderColor: `${tier.border}` }}
              >
                <span>{tier.badge}</span>
                <span className={tier.color}>{tier.name}</span>
              </div>

              {/* Big WPM Metric */}
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
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
                <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{xpGained} XP Awarded</span>
                </div>
              )}
            </div>

            {/* Leaderboard Status Banner */}
            {savedToLeaderboard ? (
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>Saved to Leaderboard</span>
                      {userRank && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-extrabold text-[10px]">
                          RANK #{userRank}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Your {duration}s sprint score is live on the scoreboard!
                    </div>
                  </div>
                </div>
              </div>
            ) : isGuest ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-200">Guest Mode</div>
                    <div className="text-[10px] text-neutral-400">Sign in to claim leaderboard rank</div>
                  </div>
                </div>
                <a
                  href="/login"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 transition-colors shadow-sm"
                >
                  Sign In
                </a>
              </div>
            ) : null}

            {/* Secondary Metrics 3-Grid */}
            <div className="grid grid-cols-3 gap-2.5 font-mono">
              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-center">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">Raw Speed</div>
                <div className="text-xl font-black text-neutral-200">{rawWpm}</div>
                <div className="text-[10px] text-neutral-500 font-sans">wpm</div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-center">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" /> Accuracy
                </div>
                <div className="text-xl font-black text-emerald-400">{accuracy}%</div>
                <div className="text-[10px] text-neutral-500 font-sans">precision</div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-center">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Max Streak
                </div>
                <div className="text-xl font-black text-amber-400">{highestCombo}x</div>
                <div className="text-[10px] text-neutral-500 font-sans">consecutive</div>
              </div>
            </div>
          </div>

          {/* Right Column: Speed Trajectory & Pace Graph (7 cols / 60%) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e14] border border-neutral-800 shadow-2xl overflow-hidden">
              {/* Graph Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-sky-500/15 text-sky-400">
                    <Activity className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide uppercase font-mono">
                      Speed Trajectory & Pace
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Second-by-second velocity curve
                    </p>
                  </div>
                </div>

                {/* Hover Metric Display */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  {hoveredPoint ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/15 border border-sky-500/40 text-sky-300">
                      <span className="font-bold">⏱️ {hoveredPoint.second}s:</span>
                      <span className="text-white font-extrabold text-sm">{hoveredPoint.speed} WPM</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap text-xs">
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

              {/* SVG Canvas Container with Crisp High-Contrast Labels */}
              <div className="relative w-full overflow-hidden select-none">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-52 sm:h-60 cursor-crosshair transition-all"
                  onMouseMove={handleGraphPointerMove}
                  onTouchMove={handleGraphPointerMove}
                  onMouseLeave={handleGraphPointerLeave}
                  onTouchEnd={handleGraphPointerLeave}
                >
                  <defs>
                    <linearGradient id="speedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#0284c7" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </linearGradient>

                    <linearGradient id="speedStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="70%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>

                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Y-Axis Grid Lines & Crisp Readable Labels */}
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
                          x={paddingLeft - 10}
                          y={y + 4}
                          textAnchor="end"
                          fill="#cbd5e1"
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* X-Axis Time Ticks & Crisp Readable Labels */}
                  {timeTicks.map((t) => {
                    const x = paddingLeft + (t / effectiveDuration) * graphWidth;
                    return (
                      <g key={`x-${t}`}>
                        <line
                          x1={x}
                          y1={svgHeight - paddingBottom}
                          x2={x}
                          y2={svgHeight - paddingBottom + 5}
                          stroke="#525252"
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={svgHeight - paddingBottom + 20}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="12"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {t}s
                        </text>
                      </g>
                    );
                  })}

                  {/* Average WPM Line */}
                  {avgWpm > 0 && avgLineY >= paddingTop && avgLineY <= svgHeight - paddingBottom && (
                    <g>
                      <line
                        x1={paddingLeft}
                        y1={avgLineY}
                        x2={svgWidth - paddingRight}
                        y2={avgLineY}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />
                      <text
                        x={svgWidth - paddingRight}
                        y={avgLineY - 4}
                        textAnchor="end"
                        fill="#38bdf8"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        AVG {avgWpm} WPM
                      </text>
                    </g>
                  )}

                  {/* Area Gradient Fill */}
                  {areaPath && <path d={areaPath} fill="url(#speedAreaGrad)" />}

                  {/* Velocity Trajectory Curve */}
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

                  {/* Peak WPM Marker */}
                  {peakPoint && (
                    <g>
                      <circle
                        cx={peakPoint.x}
                        cy={peakPoint.y}
                        r="4.5"
                        fill="#fbbf24"
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                      <text
                        x={peakPoint.x}
                        y={Math.max(paddingTop - 6, peakPoint.y - 8)}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="extrabold"
                      >
                        ★ {peakPoint.speed}
                      </text>
                    </g>
                  )}

                  {/* Interactive Pointer Beacon & Tooltip */}
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
                      <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" fill="#38bdf8" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Caption */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono mt-1 pt-2 border-t border-neutral-800">
                <span>💡 Hover trajectory to inspect velocity</span>
                <span>Mode: {mode.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {onChallengeFriend && (
              <button
                type="button"
                onClick={onChallengeFriend}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Swords className="w-4 h-4" />
                <span>Challenge a Friend</span>
              </button>
            )}

            <button
              type="button"
              onClick={onShareToFeed}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-black text-xs transition-all cursor-pointer shadow-md shadow-sky-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Feed</span>
            </button>

            <button
              type="button"
              onClick={onPlayAgain}
              className="px-4 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy summary text"
            className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer ml-auto"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TypingResultsModal;
