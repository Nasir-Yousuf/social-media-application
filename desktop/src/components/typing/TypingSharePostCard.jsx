import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Swords, Target, Flame, Sparkles } from 'lucide-react';
import { getSpeedTier } from '../../utils/typingEngine';

export const TypingSharePostCard = ({ data }) => {
  const navigate = useNavigate();
  if (!data || !data.wpm) return null;

  const {
    wpm = 0,
    rawWpm = 0,
    accuracy = 100,
    duration = 60,
    mode = 'words_200',
    highestCombo = 0,
    rivalUsername = '',
  } = data;

  const tier = getSpeedTier(wpm);

  const handleChallenge = () => {
    navigate(
      `/typing?rival=${encodeURIComponent(rivalUsername)}&wpm=${wpm}&mode=${mode}&duration=${duration}`
    );
  };

  return (
    <div className="my-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-[#10141b] to-black border border-sky-500/20 font-sans shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Typing Arena Challenge
            </div>
            <div className="text-sm font-bold text-white">
              {duration}s {mode.replace('_', ' ').toUpperCase()} Practice
            </div>
          </div>
        </div>

        {/* Tier badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold"
          style={{ backgroundColor: `${tier.bg}`, borderColor: `${tier.border}` }}
        >
          <span>{tier.badge}</span>
          <span className={tier.color}>{tier.name}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5 my-3 font-mono text-center">
        <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
          <div className="text-2xl font-extrabold text-white">{wpm}</div>
          <div className="text-[10px] text-neutral-400 font-sans uppercase">WPM Net</div>
        </div>
        <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
          <div className="text-2xl font-extrabold text-emerald-400">{accuracy}%</div>
          <div className="text-[10px] text-neutral-400 font-sans uppercase">Accuracy</div>
        </div>
        <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
          <div className="text-2xl font-extrabold text-amber-400">{highestCombo}x</div>
          <div className="text-[10px] text-neutral-400 font-sans uppercase">Max Streak</div>
        </div>
      </div>

      {/* Challenge Button */}
      <button
        type="button"
        onClick={handleChallenge}
        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-sky-500/20 active:scale-95"
      >
        <Swords className="w-4 h-4" />
        <span>Beat this score in the Arena</span>
      </button>
    </div>
  );
};

export default TypingSharePostCard;
