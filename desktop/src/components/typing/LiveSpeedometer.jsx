import React from 'react';
import { Timer, Gauge, Target } from 'lucide-react';
import { getSpeedTier } from '../../utils/typingEngine';

export const LiveSpeedometer = ({
  wpm = 0,
  accuracy = 100,
  timeLeft = 60,
  totalTime = 60,
  isActive = false,
}) => {
  const tier = getSpeedTier(wpm);
  const percentLeft = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentLeft / 100) * circumference;

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-neutral-800 font-mono">
      {/* Real-time WPM Gauge */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-1">
            <span>{wpm}</span>
            <span className="text-xs text-neutral-500 font-sans font-semibold">WPM</span>
          </div>
        </div>

        {wpm > 0 && (
          <div className="flex flex-col">
            <span className={`text-xs font-bold ${tier.color} flex items-center gap-1`}>
              <span>{tier.badge}</span>
              <span>{tier.name}</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-sans">Current Pace</span>
          </div>
        )}
      </div>

      {/* Accuracy Metric */}
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-emerald-400" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-neutral-200">{accuracy}%</span>
          <span className="text-[10px] text-neutral-500 font-sans">Accuracy</span>
        </div>
      </div>

      {/* Circular Countdown Timer */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="currentColor"
              strokeWidth="3"
              className="text-neutral-800"
              fill="none"
            />
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-300 ${
                timeLeft <= 5
                  ? 'text-rose-500 animate-pulse'
                  : timeLeft <= 15
                  ? 'text-amber-500'
                  : 'text-sky-500'
              }`}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span
            className={`absolute font-bold text-sm ${
              timeLeft <= 5 ? 'text-rose-400 font-extrabold' : 'text-neutral-200'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveSpeedometer;
