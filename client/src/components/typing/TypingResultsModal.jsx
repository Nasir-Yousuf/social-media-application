import React, { useState } from 'react';
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
  ChevronRight,
} from 'lucide-react';
import { getSpeedTier } from '../../utils/typingEngine';
import Modal from '../common/Modal';

export const TypingResultsModal = ({
  isOpen,
  onClose,
  results, // { wpm, rawWpm, accuracy, duration, mode, highestCombo, xpGained, telemetry }
  onPlayAgain,
  onShareToFeed,
}) => {
  const [copied, setCopied] = useState(false);
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
  } = results;

  const tier = getSpeedTier(wpm);

  const handleCopy = () => {
    const summary = `⌨️ Clearfeed Typing Arena: ${wpm} WPM (${rawWpm} Raw) | ${accuracy}% Accuracy | ${highestCombo}x Streak [Tier: ${tier.name}]`;
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build SVG Speed Curve Chart
  const svgWidth = 460;
  const svgHeight = 110;
  const padding = 15;
  const points = telemetry.length > 1 ? telemetry : [wpm, wpm];
  const maxVal = Math.max(...points, 80);
  const minVal = Math.min(...points, 20);
  const range = maxVal - minVal || 1;

  const svgPoints = points
    .map((val, idx) => {
      const x = padding + (idx / (points.length - 1)) * (svgWidth - padding * 2);
      const y = svgHeight - padding - ((val - minVal) / range) * (svgHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test Completed!">
      <div className="font-sans space-y-6">
        {/* Top Celebration Card */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#12161f] border border-neutral-800 text-center overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-32 h-32 text-amber-400" />
          </div>

          {/* Tier Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 text-xs font-mono font-bold tracking-wide shadow-sm"
               style={{ backgroundColor: `${tier.bg}`, borderColor: `${tier.border}` }}>
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

        {/* Speed Chart SVG */}
        {telemetry.length > 2 && (
          <div className="p-4 rounded-2xl bg-black/40 border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 font-mono">
              <span>Speed Trajectory</span>
              <span className="text-sky-400">{wpm} WPM Final</span>
            </div>
            <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24">
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={svgPoints}
                />
              </svg>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onShareToFeed}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-sm transition-all duration-150 cursor-pointer shadow-md shadow-sky-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on Feed (Challenge)</span>
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
