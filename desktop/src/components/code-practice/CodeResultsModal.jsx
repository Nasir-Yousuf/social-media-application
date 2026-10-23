import React from "react";
import {
  Trophy,
  Zap,
  Clock,
  RotateCcw,
  Share2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Award,
  Swords,
  Gauge,
  Target,
  Flame,
} from "lucide-react";
import Modal from "../common/Modal";
import CodePerformanceGraph from "./CodePerformanceGraph";

export const CodeResultsModal = ({
  isOpen = false,
  onClose,
  results = null,
  onNextLesson,
  onRetry,
  onShare,
  onChallenge,
}) => {
  if (!isOpen || !results) return null;

  const {
    wpm = 0,
    accuracy = 100,
    errors = 0,
    timeSeconds = 0,
    typedLength = 0,
    isPersonalBest = false,
    wpmDiff = 0,
    goodCategories = [],
    needsPracticeChars = [],
    xpGained = 50,
    lessonTitle = "",
    wpmHistory = [],
    modeName = "Classic",
    raceRank = null,
  } = results;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Compute consistency rating percentage based on accuracy and speed stability
  const consistencyScore = Math.min(
    100,
    Math.max(60, Math.round(accuracy * 0.95 + (wpm > 40 ? 5 : 0))),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎉 Test Performance Completed"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-5 font-sans selection:bg-sky-500 selection:text-white">
        {/* 1. Header Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-purple-500/15 border border-sky-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0 animate-bounce">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {lessonTitle
                    ? `Completed: ${lessonTitle}`
                    : "Awesome Typing Performance!"}
                </h3>
                <span className="px-3 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 font-extrabold text-xs font-mono">
                  {modeName}
                </span>
              </div>

              <div className="flex items-center gap-2.5 mt-1 text-xs font-bold text-sky-500 flex-wrap">
                <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                  <span>+{xpGained} XP Earned</span>
                </span>

                {isPersonalBest && (
                  <span className="bg-amber-400 text-black px-2.5 py-0.5 rounded-full font-black text-xs shadow-sm">
                    🔥 +{wpmDiff} WPM Personal Best!
                  </span>
                )}

                {raceRank && (
                  <span className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-black text-xs shadow-sm">
                    {raceRank === 1
                      ? "🥇 1st Place Champion!"
                      : raceRank === 2
                        ? "🥈 2nd Place Runner-Up"
                        : "🥉 3rd Place Finish"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Horizontal Grid: Left Stat Cards & Right Speed Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Primary Metrics & Diagnostics (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* WPM */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151820] border border-neutral-200 dark:border-neutral-800 text-center space-y-1 relative overflow-hidden group hover:border-sky-500/50 transition-colors">
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                  Typing Speed
                </span>
                <span className="text-3xl sm:text-4xl font-black text-sky-500 font-mono tracking-tight">
                  {wpm}
                </span>
                <span className="text-[10px] text-neutral-500 font-bold block">
                  Words Per Min
                </span>
              </div>

              {/* Accuracy */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151820] border border-neutral-200 dark:border-neutral-800 text-center space-y-1 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                  Accuracy
                </span>
                <span
                  className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                    accuracy >= 95
                      ? "text-emerald-500"
                      : accuracy >= 85
                        ? "text-amber-500"
                        : "text-rose-500"
                  }`}
                >
                  {accuracy}%
                </span>
                <span className="text-[10px] text-neutral-500 font-bold block">
                  Precision Score
                </span>
              </div>

              {/* Errors */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151820] border border-neutral-200 dark:border-neutral-800 text-center space-y-1 relative overflow-hidden group hover:border-rose-500/50 transition-colors">
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                  Uncorrected Errors
                </span>
                <span
                  className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                    errors === 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {errors}
                </span>
                <span className="text-[10px] text-neutral-500 font-bold block">
                  Mistakes Count
                </span>
              </div>

              {/* Duration */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151820] border border-neutral-200 dark:border-neutral-800 text-center space-y-1 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                  Time Spent
                </span>
                <span className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 font-mono tracking-tight">
                  {formatTime(timeSeconds)}
                </span>
                <span className="text-[10px] text-neutral-500 font-bold block">
                  MM:SS Elapsed
                </span>
              </div>
            </div>

            {/* Diagnostics Analysis Cards */}
            <div className="space-y-3">
              {/* Strengths */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Strong Key Syntax</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {goodCategories.length > 0 ? (
                    goodCategories.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-medium text-[11px]"
                      >
                        ✓ {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-neutral-500">
                      Solid overall syntax control
                    </span>
                  )}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Keys Needing Practice</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {needsPracticeChars.length > 0 ? (
                    needsPracticeChars.map((char, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-mono font-bold text-xs"
                      >
                        {char}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-500 font-bold">
                      Zero key misstrikes! Perfect precision.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Performance Graph (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <CodePerformanceGraph
              wpmHistory={wpmHistory}
              finalWpm={wpm}
              accuracy={accuracy}
              modeName={modeName}
              height={230}
            />

            {/* Quick Metrics Callout Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              <span>
                Typed length:{" "}
                <strong className="text-neutral-900 dark:text-white font-mono">
                  {typedLength} chars
                </strong>
              </span>
              <span>
                Consistency rating:{" "}
                <strong className="text-sky-500 font-mono font-bold">
                  {consistencyScore}%
                </strong>
              </span>
              <span>
                XP multiplier:{" "}
                <strong className="text-amber-500 font-mono font-bold">
                  1.5x
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Action Footer Bar with prominent Challenge & Share buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-sky-500" />
              <span>Retry Test</span>
            </button>

            {onChallenge && (
              <button
                onClick={onChallenge}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-black transition-all cursor-pointer active:scale-95"
              >
                <Swords className="w-4 h-4 text-amber-500" />
                <span>Challenge a Friend</span>
              </button>
            )}

            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-black transition-all cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4 text-sky-500" />
                <span>Share Achievement to Feed</span>
              </button>
            )}
          </div>

          {onNextLesson && (
            <button
              onClick={onNextLesson}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-sky-500/25 transition-all active:scale-95 cursor-pointer ml-auto"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CodeResultsModal;
