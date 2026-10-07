import React from 'react';
import { RotateCcw, Award, ChevronLeft, ChevronRight, Keyboard as KeyboardIcon, Play } from 'lucide-react';

export const CodeStatsHeader = ({
  language = 'HTML',
  lessonNumber = 1,
  lessonTitle = '',
  difficulty = 'Beginner',
  wpm = 0,
  accuracy = 100,
  errors = 0,
  typedLength = 0,
  totalLength = 100,
  progressPercent = 0,
  onReset,
  onPrevLesson,
  onNextLesson,
  hasPrev = false,
  hasNext = false,
  showKeyboard = true,
  onToggleKeyboard,
}) => {
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'intermediate':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'advanced':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'expert':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
  };

  const getLangBadge = (lang) => {
    const l = lang?.toLowerCase();
    if (l === 'html') return { label: 'HTML5', color: 'bg-orange-500 text-white' };
    if (l === 'css') return { label: 'CSS3', color: 'bg-blue-500 text-white' };
    return { label: 'JS', color: 'bg-amber-400 text-black font-extrabold' };
  };

  const langBadge = getLangBadge(language);

  return (
    <div className="w-full bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm font-sans space-y-3">
      {/* Top Bar: Title & Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <span className={`text-xs px-2.5 py-1 rounded-lg font-mono uppercase tracking-wider ${langBadge.color}`}>
            {langBadge.label}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Lesson {lessonNumber < 10 ? `0${lessonNumber}` : lessonNumber}: {lessonTitle}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {onPrevLesson && (
            <button
              onClick={onPrevLesson}
              disabled={!hasPrev}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Lesson"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {onNextLesson && (
            <button
              onClick={onNextLesson}
              disabled={!hasNext}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Lesson"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Restart current lesson"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {onToggleKeyboard && (
            <button
              onClick={onToggleKeyboard}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showKeyboard
                  ? 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Toggle Keyboard View"
            >
              <KeyboardIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keyboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {/* WPM */}
        <div className="bg-neutral-50 dark:bg-[#181c23] border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">WPM</span>
          <span className="text-xl font-black text-sky-500 dark:text-sky-400 font-mono leading-tight">
            {wpm}
          </span>
        </div>

        {/* Accuracy */}
        <div className="bg-neutral-50 dark:bg-[#181c23] border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Accuracy</span>
          <span className={`text-xl font-black font-mono leading-tight ${accuracy >= 95 ? 'text-emerald-500' : accuracy >= 80 ? 'text-amber-500' : 'text-rose-500'}`}>
            {accuracy}%
          </span>
        </div>

        {/* Errors */}
        <div className="bg-neutral-50 dark:bg-[#181c23] border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Errors</span>
          <span className={`text-xl font-black font-mono leading-tight ${errors === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {errors}
          </span>
        </div>

        {/* Typed Chars */}
        <div className="bg-neutral-50 dark:bg-[#181c23] border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Typed</span>
          <span className="text-xl font-black text-neutral-800 dark:text-neutral-200 font-mono leading-tight">
            {typedLength} <span className="text-xs font-normal text-neutral-400">/ {totalLength}</span>
          </span>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="col-span-2 sm:col-span-1 bg-neutral-50 dark:bg-[#181c23] border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-2.5 flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            <span>Progress</span>
            <span className="text-sky-500">{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeStatsHeader;
