import React from 'react';
import { Flame, Zap } from 'lucide-react';
import { getComboInfo } from '../../utils/typingEngine';

export const ComboMeter = ({ streak = 0, highestStreak = 0 }) => {
  const combo = getComboInfo(streak);
  const isHigh = streak >= 25;

  return (
    <div className="flex items-center gap-2 font-mono">
      {streak >= 5 ? (
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300 animate-pulse ${
            streak >= 100
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/20'
              : streak >= 50
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-lg shadow-purple-500/20'
              : streak >= 25
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
          }`}
        >
          <Flame
            className={`w-4 h-4 ${
              isHigh ? 'animate-bounce text-amber-400' : 'text-sky-400'
            }`}
          />
          <span className="font-extrabold text-xs tracking-wider">
            {streak} STREAK
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-bold uppercase tracking-tight">
            {combo.multiplier}x {combo.label}
          </span>
        </div>
      ) : (
        highestStreak > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <Zap className="w-3.5 h-3.5" />
            <span>Best: {highestStreak}x streak</span>
          </div>
        )
      )}
    </div>
  );
};

export default ComboMeter;
