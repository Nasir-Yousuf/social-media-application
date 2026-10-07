import React from 'react';
import { Flame, Sparkles, Calendar, ChevronRight, Play } from 'lucide-react';
import { getDailyChallenge } from '../../data/codeLessons';

export const DailyCodeChallenge = ({ onStartDaily, progress = {} }) => {
  const daily = getDailyChallenge();
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = progress.lastPracticedDate === todayStr;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-neutral-900 dark:text-white font-sans space-y-3 relative overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-black font-extrabold shadow-sm">
            <Flame className="w-5 h-5 fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Daily Code Challenge
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                +100 XP Bonus
              </span>
            </div>
            <h3 className="text-base font-extrabold leading-tight mt-0.5">
              {daily.title}
            </h3>
          </div>
        </div>

        <button
          onClick={() => onStartDaily(daily)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md ${
            isCompletedToday
              ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-amber-500/25 hover:brightness-110'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isCompletedToday ? 'Completed Today! Replay' : 'Start Daily Challenge'}</span>
        </button>
      </div>

      <p className="text-xs text-neutral-600 dark:text-neutral-300">
        Type today's hand-crafted code snippet to maintain your <strong className="text-amber-500">🔥 {progress.streak || 1} Day Streak</strong>!
      </p>
    </div>
  );
};

export default DailyCodeChallenge;
