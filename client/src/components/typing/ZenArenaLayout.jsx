import React from 'react';

export const ZenArenaLayout = ({
  timeLeft,
  wpm,
  accuracy,
  typingStageSlot,
  duration,
  setDuration,
  mode,
  setMode,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 font-mono select-none">
      {/* Subtle minimalistic mode indicators */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-2">
        <div className="flex items-center gap-3">
          {['words_200', 'words_1000', 'quote'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`transition-colors cursor-pointer ${
                mode === m ? 'text-neutral-200 font-bold' : 'hover:text-neutral-400'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {[15, 30, 60].map((dur) => (
            <button
              key={dur}
              type="button"
              onClick={() => setDuration(dur)}
              className={`transition-colors cursor-pointer ${
                duration === dur ? 'text-amber-400 font-bold' : 'hover:text-neutral-400'
              }`}
            >
              {dur}
            </button>
          ))}
        </div>
      </div>

      {/* Zen Typing Canvas */}
      <div className="p-4 sm:p-6 rounded-3xl bg-transparent">
        {typingStageSlot}
      </div>

      {/* Subtle minimalist stats footer */}
      <div className="flex items-center justify-center gap-6 text-xs text-neutral-500 font-mono">
        <span>{timeLeft}s</span>
        <span>·</span>
        <span className="text-neutral-300 font-bold">{wpm} wpm</span>
        <span>·</span>
        <span>{accuracy}% acc</span>
      </div>
    </div>
  );
};

export default ZenArenaLayout;
