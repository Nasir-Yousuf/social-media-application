import React, { useRef, useEffect, useState } from 'react';
import { Ghost, Trophy } from 'lucide-react';

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
  ghostData = null, // { wpm, username, progress: 0-100 }
  userProgress = 0, // 0-100
  theme = 'classic', // 'classic' | 'game' | 'hacker' | 'zen'
}) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const wordsWrapperRef = useRef(null);
  const wordRefs = useRef([]);
  const boxWordRefs = useRef([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  // In-text Ghost position
  const ghostWordIndex =
    ghostData && ghostData.progress > 0
      ? Math.min(words.length - 1, Math.floor(((ghostData.progress || 0) / 100) * words.length))
      : -1;

  // Focus input automatically
  useEffect(() => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFinished, currentWordIndex]);

  // Handle smooth line-by-line scrolling so words NEVER shift horizontally
  useEffect(() => {
    const targetRefs = viewMode === 'caret' ? wordRefs.current : boxWordRefs.current;
    const activeEl = targetRefs[currentWordIndex];
    const firstEl = targetRefs[0];

    if (activeEl && firstEl) {
      const activeTop = activeEl.offsetTop;
      const initialTop = firstEl.offsetTop;
      const lineDiff = activeTop - initialTop;

      // Only scroll when reaching a new line
      if (lineDiff >= 0 && lineDiff !== scrollOffset) {
        setScrollOffset(lineDiff);
      }
    }
  }, [currentWordIndex, words, viewMode]);

  // Reset scroll offset on new test
  useEffect(() => {
    if (currentWordIndex === 0) {
      setScrollOffset(0);
    }
  }, [currentWordIndex, words]);

  const handleContainerClick = () => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isEmbeddedTheme = theme === 'game' || theme === 'hacker' || theme === 'zen';

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative cursor-text select-none overflow-hidden transition-all duration-300 ${
        isEmbeddedTheme
          ? 'p-0 bg-transparent border-0 shadow-none'
          : 'p-6 sm:p-8 rounded-3xl bg-[#0e1116] border border-neutral-800 shadow-2xl'
      }`}
    >
      {/* Ghost Racing Track Bar (only for classic standalone mode when ghost is active) */}
      {ghostData && !isEmbeddedTheme && (
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
            <div className="relative h-2 w-full bg-neutral-800/60 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ghostData.progress || 0)}%` }}
              />
            </div>
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

      {/* View Mode 1: Monkeytype Flowing Caret (Fixed 3-Line Window with Line Scroll) */}
      {viewMode === 'caret' ? (
        <div className="relative h-[130px] sm:h-[150px] overflow-hidden">
          <div
            ref={wordsWrapperRef}
            style={{ transform: `translateY(-${scrollOffset}px)` }}
            className={`transition-transform duration-200 ease-out flex flex-wrap gap-x-3 gap-y-3.5 font-mono text-xl sm:text-2xl leading-normal tracking-wide ${
              theme === 'hacker' ? 'text-emerald-900' : 'text-neutral-500'
            }`}
          >
            {words.map((word, idx) => {
              const isCurrent = idx === currentWordIndex;
              const history = wordHistory[idx];
              const isGhostHere = ghostWordIndex === idx;

              if (history) {
                // Previously typed word
                const isCorrect = history.status === 'correct';
                return (
                  <span
                    key={idx}
                    ref={(el) => (wordRefs.current[idx] = el)}
                    className={`transition-colors whitespace-nowrap inline-flex items-center gap-1 ${
                      isCorrect
                        ? theme === 'hacker' ? 'text-emerald-600' : 'text-neutral-400'
                        : 'text-rose-500 line-through opacity-75'
                    }`}
                  >
                    <span>{word}</span>
                    {/* Render Ghost Caret if ghost is passing through this word */}
                    {isGhostHere && (
                      <span className="inline-flex flex-col items-center select-none pointer-events-none animate-pulse">
                        <span className="text-purple-400 font-black text-sm -mb-1 leading-none drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]">^</span>
                        <span className="text-[9px] font-mono font-bold text-purple-200 bg-purple-950/90 px-1 py-0.2 rounded border border-purple-500/50 shadow-[0_0_8px_rgba(192,132,252,0.6)] whitespace-nowrap">
                          {ghostData?.username ? `@${ghostData.username}` : 'PB ghost'}
                        </span>
                      </span>
                    )}
                  </span>
                );
              }

              if (isCurrent) {
                // Active Word with live letter matching and caret
                return (
                  <span
                    key={idx}
                    ref={(el) => (wordRefs.current[idx] = el)}
                    className="relative inline-flex items-center whitespace-nowrap"
                  >
                    {word.split('').map((char, charIdx) => {
                      const typedChar = currentInput[charIdx];
                      let charColor = theme === 'hacker' ? 'text-emerald-700' : 'text-neutral-500';

                      if (typedChar !== undefined) {
                        charColor =
                          typedChar === char
                            ? theme === 'hacker' ? 'text-emerald-300 font-semibold' : 'text-white font-semibold'
                            : 'text-rose-400 bg-rose-500/20 border-b-2 border-rose-500 rounded-xs font-semibold';
                      }

                      const isCaretPos = charIdx === currentInput.length;

                      return (
                        <span key={charIdx} className={`relative ${charColor}`}>
                          {isCaretPos && (
                            <span
                              className={`absolute -left-[1.5px] top-0 bottom-0 w-[2.5px] rounded-full animate-pulse shadow-sm ${
                                theme === 'hacker'
                                  ? 'bg-emerald-400 shadow-emerald-400/60'
                                  : 'bg-sky-400 shadow-sky-400/60'
                              }`}
                            />
                          )}
                          {char}
                        </span>
                      );
                    })}

                    {/* Overflow letters typed beyond word length */}
                    {currentInput.length > word.length && (
                      <span className="text-rose-400 bg-rose-500/20 border-b-2 border-rose-500">
                        {currentInput.slice(word.length)}
                      </span>
                    )}

                    {/* Caret at end of word */}
                    {currentInput.length >= word.length && (
                      <span
                        className={`inline-block w-[2.5px] h-6 rounded-full animate-pulse shadow-sm ml-0.5 ${
                          theme === 'hacker'
                            ? 'bg-emerald-400 shadow-emerald-400/60'
                            : 'bg-sky-400 shadow-sky-400/60'
                        }`}
                      />
                    )}

                    {/* Render Ghost Caret if ghost is at current active word */}
                    {isGhostHere && (
                      <span className="inline-flex flex-col items-center ml-1.5 select-none pointer-events-none animate-pulse">
                        <span className="text-purple-400 font-black text-sm -mb-1 leading-none drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]">^</span>
                        <span className="text-[9px] font-mono font-bold text-purple-200 bg-purple-950/90 px-1 py-0.2 rounded border border-purple-500/50 shadow-[0_0_8px_rgba(192,132,252,0.6)] whitespace-nowrap">
                          {ghostData?.username ? `@${ghostData.username}` : 'PB ghost'}
                        </span>
                      </span>
                    )}
                  </span>
                );
              }

              // Upcoming words: fixed and completely static in place
              return (
                <span
                  key={idx}
                  ref={(el) => (wordRefs.current[idx] = el)}
                  className={`whitespace-nowrap inline-flex items-center gap-1 ${
                    theme === 'hacker' ? 'text-emerald-800' : 'text-neutral-500'
                  }`}
                >
                  <span>{word}</span>
                  {/* Render Ghost Caret if ghost is ahead at this word */}
                  {isGhostHere && (
                    <span className="inline-flex flex-col items-center select-none pointer-events-none animate-pulse">
                      <span className="text-purple-400 font-black text-sm -mb-1 leading-none drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]">^</span>
                      <span className="text-[9px] font-mono font-bold text-purple-200 bg-purple-950/90 px-1 py-0.2 rounded border border-purple-500/50 shadow-[0_0_8px_rgba(192,132,252,0.6)] whitespace-nowrap">
                        {ghostData?.username ? `@${ghostData.username}` : 'PB ghost'}
                      </span>
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode 2: 10FastFingers Classic Input Box (Fixed Line Scroll) */
        <div className="space-y-5">
          {/* Word Cloud Box with 2 Fixed Stationary Lines */}
          <div className="relative h-[95px] sm:h-[110px] overflow-hidden p-4 rounded-2xl bg-black/40 border border-neutral-800/80">
            <div
              style={{ transform: `translateY(-${scrollOffset}px)` }}
              className="transition-transform duration-200 ease-out flex flex-wrap gap-2.5 font-mono text-lg sm:text-xl leading-normal"
            >
              {words.map((word, idx) => {
                const isCurrent = idx === currentWordIndex;
                const history = wordHistory[idx];

                if (history) {
                  return (
                    <span
                      key={idx}
                      ref={(el) => (boxWordRefs.current[idx] = el)}
                      className={`px-2 py-0.5 rounded-lg text-sm whitespace-nowrap ${
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
                      key={idx}
                      ref={(el) => (boxWordRefs.current[idx] = el)}
                      className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold text-sm shadow-xs whitespace-nowrap"
                    >
                      {word}
                    </span>
                  );
                }

                return (
                  <span
                    key={idx}
                    ref={(el) => (boxWordRefs.current[idx] = el)}
                    className="px-1.5 py-0.5 text-neutral-500 text-sm whitespace-nowrap"
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Classic 10FastFingers Stationary Input Box */}
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
            💡 Click anywhere or start typing to begin
          </span>
        </div>
      )}
    </div>
  );
};

export default TypingStage;
