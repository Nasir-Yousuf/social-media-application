import React from 'react';
import { Trophy, Zap, Clock, RotateCcw, Share2, ChevronRight, CheckCircle2, AlertTriangle, Sparkles, Award } from 'lucide-react';
import Modal from '../common/Modal';

export const CodeResultsModal = ({
  isOpen = false,
  onClose,
  results = null,
  onNextLesson,
  onRetry,
  onShare,
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
    lessonTitle = '',
  } = results;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎉 Lesson Complete">
      <div className="space-y-5 font-sans">
        {/* Top Celebration Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-purple-500/15 border border-sky-500/30 text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-500 flex items-center justify-center mx-auto mb-2 shadow-sm animate-bounce">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-neutral-900 dark:text-white">
            {lessonTitle ? `Completed: ${lessonTitle}` : 'Great Typing Performance!'}
          </h3>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-500">
            <Sparkles className="w-4 h-4" />
            <span>+{xpGained} XP Earned</span>
            {isPersonalBest && (
              <span className="bg-amber-400 text-black px-2 py-0.5 rounded-full font-black text-[10px]">
                +{wpmDiff} WPM Personal Best!
              </span>
            )}
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">WPM</span>
            <span className="text-2xl font-black text-sky-500 font-mono">{wpm}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Accuracy</span>
            <span className={`text-2xl font-black font-mono ${accuracy >= 95 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {accuracy}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Errors</span>
            <span className={`text-2xl font-black font-mono ${errors === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {errors}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Time</span>
            <span className="text-2xl font-black text-neutral-800 dark:text-neutral-200 font-mono">
              {formatTime(timeSeconds)}
            </span>
          </div>
        </div>

        {/* Diagnostic Analysis Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* What you typed well */}
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>What you typed well</span>
            </div>
            <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 font-medium">
              {goodCategories.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What needs practice */}
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>What needs practice</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {needsPracticeChars.map((char, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-mono font-bold text-xs"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>

            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-100 border border-sky-200 dark:border-sky-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Achievement</span>
              </button>
            )}
          </div>

          {onNextLesson && (
            <button
              onClick={onNextLesson}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer ml-auto"
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
