import React from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Code,
  Quote,
  Flame,
  LayoutTemplate,
  TextCursor,
} from 'lucide-react';

export const MODES = [
  { id: 'words_200', label: 'Top 200', icon: Sparkles, desc: 'Most common 200 English words' },
  { id: 'words_1000', label: 'Top 1000', icon: Sparkles, desc: 'Expanded 1000 vocabulary' },
  { id: 'code', label: 'Code Mode', icon: Code, desc: 'JS/Python keywords & syntax tokens' },
  { id: 'quote', label: 'Quotes', icon: Quote, desc: 'Famous programming quotes' },
];

export const DURATIONS = [15, 30, 60, 120];

export const SOUND_THEMES = [
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'thock', label: 'Thock' },
  { id: 'bubble', label: 'Bubble' },
  { id: 'beep', label: 'Beep' },
  { id: 'mute', label: 'Mute' },
];

export const TypingControlsBar = ({
  mode,
  setMode,
  duration,
  setDuration,
  soundTheme,
  setSoundTheme,
  viewMode, // 'caret' or 'box'
  setViewMode,
  onRestart,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs font-sans backdrop-blur-md">
      {/* Modes Group */}
      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-neutral-800/80">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              onClick={() => setMode(m.id)}
              title={m.desc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Durations Group (hidden in quote mode) */}
      {mode !== 'quote' && (
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-neutral-800/80">
          <span className="text-[10px] text-neutral-500 px-2 font-mono uppercase">Time</span>
          {DURATIONS.map((dur) => {
            const isActive = duration === dur;
            return (
              <button
                key={dur}
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  setDuration(dur);
                  e.currentTarget.blur();
                }}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {dur}s
              </button>
            );
          })}
        </div>
      )}

      {/* Style & Sound Options Group */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle: Monkeytype Flowing Caret vs 10FastFingers Box */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-neutral-800/80">
          <button
            type="button"
            onClick={() => setViewMode('caret')}
            title="Monkeytype Style: Flowing smooth caret"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'caret' ? 'bg-sky-500/20 text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TextCursor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('box')}
            title="10FastFingers Style: Classic separate input box"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'box' ? 'bg-sky-500/20 text-sky-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
          </button>
        </div>

        {/* Sound Theme Selector */}
        <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-neutral-800/80">
          {soundTheme === 'mute' ? (
            <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          )}
          <select
            value={soundTheme}
            onChange={(e) => setSoundTheme(e.target.value)}
            className="bg-transparent text-neutral-300 text-xs focus:outline-none cursor-pointer"
          >
            {SOUND_THEMES.map((s) => (
              <option key={s.id} value={s.id} className="bg-neutral-900 text-neutral-200">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          title="Restart practice (Tab + Enter)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition-all duration-150 cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restart</span>
        </button>
      </div>
    </div>
  );
};

export default TypingControlsBar;
