import React from 'react';
import { Flame, Trophy, Award, Clock, Zap, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../../utils/codeTypingAnalyzer';

export const CodeProgressDashboard = ({ progress = {} }) => {
  const completed = progress.completedLessons || { html: [], css: [], javascript: [] };
  const bestWpm = progress.bestWpm || { html: 0, css: 0, javascript: 0 };
  const unlocked = new Set(progress.achievements || []);

  const totalTimeMinutes = Math.round((progress.totalPracticeTime || 0) / 60);
  const totalChars = progress.totalCharactersTyped || 0;

  const languages = [
    { id: 'html', label: 'HTML', total: 25, color: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'css', label: 'CSS', total: 34, color: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'javascript', label: 'JavaScript', total: 63, color: 'bg-amber-400', text: 'text-amber-500' },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm font-sans space-y-5">
      {/* Top Banner: Level, XP & Streak */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-sky-500/25">
            L{progress.level || 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Code Practice Dashboard
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 font-bold border border-sky-500/20">
                {progress.xp || 0} Total XP
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Track your programming typing speed, milestones & streaks
            </p>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{progress.streak || 1} Day Streak</span>
        </div>
      </div>

      {/* Language Completion Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Curriculum Progress
        </h4>

        <div className="space-y-2.5">
          {languages.map((lang) => {
            const count = (completed[lang.id] || []).length;
            const percent = Math.min(100, Math.round((count / lang.total) * 100));

            return (
              <div key={lang.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-800 dark:text-neutral-200">{lang.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 font-mono">{count}/{lang.total} ({percent}%)</span>
                    <span className={`font-mono ${lang.text}`}>Best: {bestWpm[lang.id] || 0} WPM</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${lang.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Lifetime Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181c23] border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Practice Time</span>
          <span className="text-lg font-black font-mono text-neutral-800 dark:text-neutral-200">
            {totalTimeMinutes} mins
          </span>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181c23] border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Characters Typed</span>
          <span className="text-lg font-black font-mono text-neutral-800 dark:text-neutral-200">
            {totalChars.toLocaleString()}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-neutral-50 dark:bg-[#181c23] border border-neutral-200 dark:border-neutral-800 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Badges Unlocked</span>
          <span className="text-lg font-black font-mono text-sky-500">
            {unlocked.size} / {ACHIEVEMENTS_LIST.length}
          </span>
        </div>
      </div>

      {/* Achievements Badges Section */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Achievements & Trophies
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = unlocked.has(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'bg-sky-500/5 border-sky-500/30 text-neutral-900 dark:text-white'
                    : 'bg-neutral-50 dark:bg-[#15171c] border-neutral-200 dark:border-neutral-800 opacity-50 grayscale'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{ach.icon}</span>
                  {isUnlocked && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                </div>
                <div>
                  <h5 className="text-xs font-extrabold truncate">{ach.title}</h5>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-tight mt-0.5">
                    {ach.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CodeProgressDashboard;
