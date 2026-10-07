import React, { useRef, useEffect } from 'react';
import { Ghost, Trophy } from 'lucide-react';
import typingSounds from '../../utils/typingSounds';

export const TypingStage = ({
  words = [],
  currentWordIndex = 0,
  currentInput = '',
  wordHistory = {}, // index -> { status: 'correct'|'incorrect', typed: string }
  viewMode = 'caret',
  onInputChange,
  onKeyDown,
  isActive = false,
  isFinished = false,
  ghostData = null, // { wpm, name, progress: 0-100 }
  userProgress = 0, // 0-100
}) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Focus input automatically
  useEffect(() => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFinished, currentWordIndex]);

  const handleContainerClick = () => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const currentWord = words[currentWordIndex] || '';

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative p-6 sm:p-8 rounded-3xl bg-[#0e1116] border border-neutral-800 shadow-2xl cursor-text select-none overflow-hidden transition-all duration-300"
    >
      {/* Ghost Racing Track (Multiplayer / Ghost Challenge mode) */}
      {ghostData && (
        <div className="mb-6 p-3 rounded-2xl bg-black/50 border border-neutral-800/80 font-mono text-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Ghost className="w-3.5 h-3.5" />
              <span>Ghost: @{ghostData.username || 'rival'} ({ghostData.wpm} WPM)</span>
            </div>
            <div className="flex items-center gap-1 text-sky-400 font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>You</span>
            </div>
          </div>

          {/* Race Track Bar */}
          <div className="space-y-2">
            {/* Ghost Track */}
            <div className="relative h-2 w-full bg-neutral-800/60 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ghostData.progress || 0)}%` }}
              />
            </div>
            {/* User Track */}
            <div className="relative h-2 w-full bg-neutral-800/60 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-sky-400 rounded-full transition-all duration-150"
                style={{ width: `${Math.min(100, userProgress || 0)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hidden input field for keystroke capture */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        disabled={isFinished}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
      />

      {/* View Mode 1: Monkeytype Flowing Smooth Caret */}
      {viewMode === 'caret' ? (
        <div className="font-mono text-xl sm:text-2xl leading-relaxed tracking-wider min-h-[140px] max-h-[220px] overflow-hidden flex flex-wrap gap-x-3 gap-y-2 text-neutral-600 transition-all">
          {words.slice(Math.max(0, currentWordIndex - 2), currentWordIndex + 30).map((word, relIdx) => {
            const actualIdx = Math.max(0, currentWordIndex - 2) + relIdx;
            const isCurrent = actualIdx === currentWordIndex;
            const history = wordHistory[actualIdx];

            if (history) {
              // Word has already been submitted
              const isCorrect = history.status === 'correct';
              return (
                <span
                  key={actualIdx}
                  className={`transition-colors ${
                    isCorrect ? 'text-neutral-300' : 'text-rose-500 line-through opacity-80'
                  }`}
                >
                  {word}
                </span>
              );
            }

            if (isCurrent) {
              // Active Word being typed letter-by-letter
              return (
                <span key={actualIdx} className="relative inline-flex items-center">
                  {word.split('').map((char, charIdx) => {
                    const typedChar = currentInput[charIdx];
                    let charColor = 'text-neutral-500';

                    if (typedChar !== undefined) {
                      charColor = typedChar === char ? 'text-white font-bold' : 'text-rose-500 bg-rose-500/20';
                    }

                    const isCaretPos = charIdx === currentInput.length;

                    return (
                      <span key={charIdx} className={`relative ${charColor}`}>
                        {isCaretPos && (
                          <span className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] bg-sky-400 rounded-full animate-pulse shadow-sm shadow-sky-400/50" />
                        )}
                        {char}
                      </span>
                    );
                  })}

                  {/* Overflow letters typed beyond word length */}
                  {currentInput.length > word.length && (
                    <span className="text-rose-500 bg-rose-500/20 underline">
                      {currentInput.slice(word.length)}
                    </span>
                  )}

                  {/* Caret at very end of word */}
                  {currentInput.length >= word.length && (
                    <span className="inline-block w-[2.5px] h-6 bg-sky-400 rounded-full animate-pulse shadow-sm shadow-sky-400/50 ml-0.5" />
                  )}
                </span>
              );
            }

            // Upcoming words
            return (
              <span key={actualIdx} className="text-neutral-600">
                {word}
              </span>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: 10FastFingers Classic Input Box */
        <div className="space-y-5">
          {/* Word Cloud Box */}
          <div className="font-mono text-lg sm:text-xl leading-relaxed flex flex-wrap gap-2.5 p-4 rounded-2xl bg-black/40 border border-neutral-800/80 min-h-[90px] max-h-[140px] overflow-hidden">
            {words.slice(Math.max(0, currentWordIndex - 3), currentWordIndex + 20).map((word, relIdx) => {
              const actualIdx = Math.max(0, currentWordIndex - 3) + relIdx;
              const isCurrent = actualIdx === currentWordIndex;
              const history = wordHistory[actualIdx];

              if (history) {
                return (
                  <span
                    key={actualIdx}
                    className={`px-2 py-0.5 rounded-lg text-sm ${
                      history.status === 'correct'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10 line-through'
                    }`}
                  >
                    {word}
                  </span>
                );
              }

              if (isCurrent) {
                return (
                  <span
                    key={actualIdx}
                    className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold text-sm shadow-xs"
                  >
                    {word}
                  </span>
                );
              }

              return (
                <span key={actualIdx} className="px-1.5 py-0.5 text-neutral-500 text-sm">
                  {word}
                </span>
              );
            })}
          </div>

          {/* Classic 10FastFingers Input Box */}
          <div className="relative">
            <input
              type="text"
              value={currentInput}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              disabled={isFinished}
              placeholder={isActive ? '' : 'Type the word here and press Space...'}
              className="w-full bg-neutral-900 text-xl font-mono text-white px-5 py-3.5 rounded-2xl border-2 border-neutral-700 focus:border-sky-500 focus:outline-none transition-colors shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Click to focus hint if not focused */}
      {!isActive && !isFinished && (
        <div className="mt-4 text-center">
          <span className="text-xs text-neutral-500 font-sans tracking-wide">
            💡 Click anywhere or start typing to begin the countdown
          </span>
        </div>
      )}
    </div>
  );
};

export default TypingStage;
