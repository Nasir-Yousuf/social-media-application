import React from 'react';
import { Terminal, Shield, Cpu, Flame, Volume2, VolumeX, Trophy } from 'lucide-react';
import { getSpeedTier } from '../../utils/typingEngine';

export const HackerArenaLayout = ({
  mode,
  setMode,
  duration,
  setDuration,
  punctuation,
  setPunctuation,
  numbers,
  setNumbers,
  soundTheme,
  setSoundTheme,
  timeLeft,
  streak,
  wpm,
  accuracy,
  typingStageSlot,
  leaderboard = [],
  onChallengeGhost,
}) => {
  const tier = getSpeedTier(wpm);

  return (
    <div className="w-full space-y-4 font-mono select-none">
      {/* Terminal Title Bar */}
      <div className="rounded-2xl bg-[#030804] border border-emerald-500/50 p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold">root@clearfeed:~/arena$</span>
          <span className="text-emerald-500/80">./typing-protocol --turbo-stream</span>
        </div>

        {/* Diagnostic Status Tickers */}
        <div className="flex items-center gap-3 text-[11px] text-emerald-400/90">
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
            [SYS_STAT: OPERATIONAL]
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
            [BUFFER: {timeLeft}s]
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 font-bold text-emerald-300">
            [SPEED: {wpm} WPM]
          </span>
        </div>
      </div>

      {/* Terminal Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#040a05] border border-emerald-500/30 text-xs text-emerald-400">
        <div className="flex flex-wrap items-center gap-2">
          {/* Modes */}
          {[
            { id: 'words_200', label: '200_TOKENS' },
            { id: 'words_1000', label: '1000_TOKENS' },
            { id: 'code', label: 'SYNTAX_CODE' },
            { id: 'quote', label: 'MAN_PAGES' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer border ${
                mode === m.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'border-emerald-900/40 text-emerald-600 hover:text-emerald-400'
              }`}
            >
              {m.label}
            </button>
          ))}

          {/* Timers */}
          {mode !== 'quote' && (
            <div className="flex items-center gap-1 border-l border-emerald-900/60 pl-2">
              {[15, 30, 60, 120].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    duration === dur
                      ? 'bg-emerald-500/25 text-emerald-200 font-bold border border-emerald-400'
                      : 'text-emerald-600 hover:text-emerald-300'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          )}

          {/* Toggles */}
          <button
            type="button"
            onClick={() => setPunctuation(!punctuation)}
            className={`px-2.5 py-1 rounded border cursor-pointer ${
              punctuation
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                : 'border-emerald-900/40 text-emerald-700'
            }`}
          >
            PUNCT: {punctuation ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => setNumbers(!numbers)}
            className={`px-2.5 py-1 rounded border cursor-pointer ${
              numbers
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                : 'border-emerald-900/40 text-emerald-700'
            }`}
          >
            NUMS: {numbers ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={() =>
            setSoundTheme(soundTheme === 'mute' ? 'mechanical' : soundTheme === 'mechanical' ? 'beep' : 'mute')
          }
          className="px-2.5 py-1 rounded border border-emerald-900/50 text-emerald-400 hover:text-emerald-200 cursor-pointer"
        >
          AUDIO: {soundTheme.toUpperCase()}
        </button>
      </div>

      {/* Main Terminal Screen with CRT Scanlines Effect */}
      <div className="relative rounded-3xl bg-[#020502] border-2 border-emerald-500/40 p-6 sm:p-8 shadow-[0_0_35px_rgba(16,185,129,0.18)] overflow-hidden">
        {/* CRT Scanline Overlay Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)]"
          style={{ backgroundSize: '100% 4px' }}
        />

        {/* Terminal Header Telemetry */}
        <div className="relative flex items-center justify-between pb-4 mb-4 border-b border-emerald-900/60 text-emerald-400 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]">
              {timeLeft} SEC
            </span>
            {streak > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold">
                OVERCLOCK: {streak}x
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-emerald-300 text-lg">
              {wpm} <span className="text-xs text-emerald-500">WPM</span>
            </span>
            <span className="text-emerald-400">{accuracy}% ACC</span>
            <span className="text-emerald-300 font-bold">[{tier.name.toUpperCase()}]</span>
          </div>
        </div>

        {/* The Typing Canvas */}
        <div className="relative">{typingStageSlot}</div>
      </div>
    </div>
  );
};

export default HackerArenaLayout;
