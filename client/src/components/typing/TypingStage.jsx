import React, { useRef, useEffect, useState } from 'react';
import { Ghost, Trophy, MousePointerClick } from 'lucide-react';

export const TypingStage = ({
  words = [],
  currentWordIndex = 0,
  currentInput = '',
  wordHistory = {}, // index -> { status: 'correct'|'incorrect', typed: string }
  viewMode = 'caret',
  onInputChange,
  onKeyDown,
  onJumpToWord,
  isActive = false,
  isFinished = false,
  ghostData = null, // { wpm, username, progress: 0-100 }
  userProgress = 0, // 0-100
  theme = 'classic', // 'classic' | 'game' | 'hacker' | 'zen'
}) => {
  const inputRef = useRef(null);
  const boxInputRef = useRef(null);
  const containerRef = useRef(null);
  const wordsWrapperRef = useRef(null);
  const wordRefs = useRef([]);
  const boxWordRefs = useRef([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  // Always ensure input focus on mount or index reset
  useEffect(() => {
    if (!isFinished) {
      const len = (currentInput || '').length;
      if (inputRef.current) {
        try {
          inputRef.current.focus({ preventScroll: true });
          setIsFocused(true);
          inputRef.current.setSelectionRange(len, len);
        } catch (err) {}
      }
      if (boxInputRef.current) {
        try {
          boxInputRef.current.focus({ preventScroll: true });
          boxInputRef.current.setSelectionRange(len, len);
        } catch (err) {}
      }
    }
  }, [isFinished, currentWordIndex, words, viewMode]);

  // Handle smooth line-by-line scrolling when active word moves to a new line
  useEffect(() => {
    const targetRefs = viewMode === 'caret' ? wordRefs.current : boxWordRefs.current;
    const activeEl = targetRefs[currentWordIndex];
    const firstEl = targetRefs[0];

    if (activeEl && firstEl) {
      const activeTop = activeEl.offsetTop;
      const initialTop = firstEl.offsetTop;
      const lineDiff = activeTop - initialTop;

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
      inputRef.current.focus({ preventScroll: true });
      setIsFocused(true);
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
      {/* Ghost Racing Track Bar (renders at top cleanly without DOM shifts) */}
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={isFinished}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
      />

      {/* Focus Hint */}
      {!isFocused && !isActive && !isFinished && (
        <div
          onClick={handleContainerClick}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-2xl cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-900/95 border border-sky-500/50 text-sky-300 text-xs font-mono font-bold shadow-2xl animate-pulse">
            <MousePointerClick className="w-4 h-4 text-sky-400" />
            <span>Click or start typing to focus</span>
          </div>
        </div>
      )}

      {/* View Mode 1: Monkeytype Flowing Caret (Fixed Window with Line Scroll) */}
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

              if (history) {
                // Previously typed word
                const isCorrect = history.status === 'correct';
                return (
                  <span
                    key={idx}
                    ref={(el) => (wordRefs.current[idx] = el)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpToWord?.(idx);
                    }}
                    title={
                      isCorrect
                        ? 'Press Backspace or click to revisit'
                        : '⚠️ Mistake! Click or press Backspace to fix this word'
                    }
                    className={`relative whitespace-nowrap inline-flex items-center font-mono cursor-pointer transition-transform duration-100 hover:scale-105 active:scale-95 group ${
                      isCorrect
                        ? theme === 'hacker'
                          ? 'text-emerald-600 hover:text-emerald-300'
                          : 'text-neutral-400 hover:text-white'
                        : 'text-rose-500 line-through opacity-80 hover:opacity-100 hover:text-rose-300'
                    }`}
                  >
                    <span>{word}</span>
                  </span>
                );
              }

              if (isCurrent) {
                // Active Word with live letter matching and caret
                return (
                  <span
                    key={idx}
                    ref={(el) => (wordRefs.current[idx] = el)}
                    className="relative inline-flex items-center whitespace-nowrap font-mono"
                  >
                    {word.split('').map((char, charIdx) => {
                      const typedChar = currentInput[charIdx];
                      let charClass = theme === 'hacker' ? 'text-emerald-700' : 'text-neutral-500';

                      if (typedChar !== undefined) {
                        charClass =
                          typedChar === char
                            ? theme === 'hacker' ? 'text-emerald-300' : 'text-white'
                            : 'text-rose-400 bg-rose-500/20 underline decoration-rose-500 decoration-2 underline-offset-4';
                      }

                      const isCaretPos = charIdx === currentInput.length;

                      return (
                        <span key={charIdx} className={`relative font-mono ${charClass}`}>
                          {isCaretPos && (
                            <span
                              className={`absolute -left-[1.5px] top-[10%] bottom-[10%] w-[2.5px] rounded-full animate-pulse shadow-sm pointer-events-none ${
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
                      <span className="text-rose-400 bg-rose-500/20 underline decoration-rose-500">
                        {currentInput.slice(word.length)}
                      </span>
                    )}

                    {/* Caret at end of word */}
                    {currentInput.length >= word.length && (
                      <span
                        className={`absolute -right-[2px] top-[10%] bottom-[10%] w-[2.5px] rounded-full animate-pulse shadow-sm pointer-events-none ${
                          theme === 'hacker'
                            ? 'bg-emerald-400 shadow-emerald-400/60'
                            : 'bg-sky-400 shadow-sky-400/60'
                        }`}
                      />
                    )}
                  </span>
                );
              }

              // Upcoming words
              return (
                <span
                  key={idx}
                  ref={(el) => (wordRefs.current[idx] = el)}
                  className={`relative whitespace-nowrap inline-flex items-center font-mono ${
                    theme === 'hacker' ? 'text-emerald-900' : 'text-neutral-500'
                  }`}
                >
                  <span>{word}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode 2: Box Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {words.map((word, idx) => {
            const isCurrent = idx === currentWordIndex;
            const history = wordHistory[idx];

            let boxStyle = 'bg-neutral-900/60 border-neutral-800 text-neutral-500';
            if (history) {
              boxStyle =
                history.status === 'correct'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 line-through';
            } else if (isCurrent) {
              boxStyle = 'bg-sky-500/20 border-sky-500 text-white font-bold ring-2 ring-sky-500/30 animate-pulse';
            }

            return (
              <div
                key={idx}
                ref={(el) => (boxWordRefs.current[idx] = el)}
                className={`p-3 rounded-2xl border font-mono text-base text-center truncate transition-all ${boxStyle}`}
              >
                {word}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TypingStage;
