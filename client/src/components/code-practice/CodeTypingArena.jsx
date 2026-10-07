import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Lock, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { calculateWPM, calculateAccuracy } from '../../utils/codeTypingAnalyzer';

export const CodeTypingArena = ({
  snippet = '',
  language = 'javascript',
  onKeystroke,
  onComplete,
  onReset,
}) => {
  const [typedText, setTypedText] = useState('');
  const [mistakesMap, setMistakesMap] = useState({}); // idx -> wrong input char
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const activeCharRef = useRef(null);

  const targetCode = snippet || '';

  // Reset arena state whenever snippet changes
  useEffect(() => {
    setTypedText('');
    setMistakesMap({});
    setErrorCount(0);
    setTotalKeystrokes(0);
    setStartTime(null);
    setEndTime(null);

    // Auto-focus hidden input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [snippet]);

  // Focus input automatically
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  // Keep active line scrolled into view
  useEffect(() => {
    if (activeCharRef.current) {
      activeCharRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [typedText]);

  // Handle keydown events directly for precision code typing
  const handleKeyDown = useCallback(
    (e) => {
      if (endTime || !targetCode) return;

      // Ignore modifier keys alone
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // Prevent default page scroll on Space or Backspace or Tab
      if ([' ', 'Backspace', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }

      const now = Date.now();
      if (!startTime) {
        setStartTime(now);
      }

      const currentIndex = typedText.length;
      const expectedChar = targetCode[currentIndex];

      // 1. Backspace handling
      if (e.key === 'Backspace') {
        if (currentIndex > 0) {
          setTypedText((prev) => prev.slice(0, -1));
        }
        return;
      }

      // 2. Character Input handling
      let inputChar = e.key;

      // Handle Tab as spaces if target expects spaces/tabs
      if (e.key === 'Tab') {
        inputChar = '  '; // 2 spaces
      } else if (e.key === 'Enter') {
        inputChar = '\n';
      }

      // Compare char
      const isCorrect = inputChar === expectedChar;

      setTotalKeystrokes((prev) => prev + 1);

      if (!isCorrect) {
        setErrorCount((prev) => prev + 1);
        setMistakesMap((prev) => ({ ...prev, [currentIndex]: inputChar }));
      }

      // Advance typed text
      const nextTyped = typedText + inputChar;
      setTypedText(nextTyped);

      // Report keystroke to parent stats header & virtual keyboard
      const nextTargetChar = targetCode[nextTyped.length] || '';
      if (onKeystroke) {
        onKeystroke({
          isCorrect,
          key: inputChar,
          nextChar: nextTargetChar,
          typedLength: nextTyped.length,
          totalLength: targetCode.length,
          errors: errorCount + (isCorrect ? 0 : 1),
          totalKeystrokes: totalKeystrokes + 1,
        });
      }

      // Check if snippet completed!
      if (nextTyped.length >= targetCode.length) {
        const finishTime = Date.now();
        setEndTime(finishTime);
        const secondsElapsed = Math.max(1, Math.round((finishTime - (startTime || now)) / 1000));
        const finalWpm = calculateWPM(targetCode.length, secondsElapsed);
        const finalAccuracy = calculateAccuracy(targetCode.length, totalKeystrokes + 1);

        if (onComplete) {
          onComplete({
            wpm: finalWpm,
            accuracy: finalAccuracy,
            errors: errorCount + (isCorrect ? 0 : 1),
            timeSeconds: secondsElapsed,
            typedLength: targetCode.length,
            mistakesMap,
          });
        }
      }
    },
    [endTime, targetCode, startTime, typedText, errorCount, totalKeystrokes, onKeystroke, onComplete, mistakesMap]
  );

  // Split code into lines for VS Code-like line numbering
  const codeLines = targetCode.split('\n');

  // Compute character offset mapping for multi-line layout
  let globalCharIndex = 0;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative w-full rounded-2xl border transition-all duration-200 overflow-hidden font-mono select-none cursor-text ${
        isFocused
          ? 'bg-[#181a1f] border-sky-500/50 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/30'
          : 'bg-[#14161a] border-neutral-800 opacity-90'
      }`}
    >
      {/* Hidden Textarea for mobile keyboard & screen reader focus */}
      <textarea
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute opacity-0 pointer-events-none w-0 h-0 left-0 top-0"
        value=""
        onChange={() => {}}
        aria-label="Code Typing Arena Input"
        autoFocus
      />

      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111317] border-b border-neutral-800/90 text-xs font-sans">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-neutral-400 font-mono text-[11px] ml-2">
            practice_workspace.{language === 'html' ? 'html' : language === 'css' ? 'css' : 'js'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isFocused && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse font-medium">
              Click to focus typing area
            </span>
          )}
          {isFocused && (
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              ● ACTIVE FOCUS
            </span>
          )}
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="p-4 sm:p-5 overflow-x-auto text-sm sm:text-base leading-relaxed tracking-wide min-h-[220px] max-h-[440px] overflow-y-auto">
        {codeLines.map((lineText, lineIdx) => {
          const lineStartIndex = globalCharIndex;
          const lineChars = lineText.split('');
          
          // Advance globalCharIndex to include newline char
          globalCharIndex += lineText.length + 1;

          return (
            <div key={lineIdx} className="flex items-start hover:bg-white/[0.02] rounded-xs px-1">
              {/* Line Number */}
              <div className="w-8 sm:w-10 shrink-0 text-right pr-3 select-none text-neutral-600 dark:text-neutral-600 font-mono text-xs sm:text-sm pt-0.5">
                {lineIdx + 1}
              </div>

              {/* Line Content Characters */}
              <div className="flex-1 whitespace-pre font-mono">
                {lineChars.map((char, charIdx) => {
                  const charGlobalIdx = lineStartIndex + charIdx;
                  const isTyped = charGlobalIdx < typedText.length;
                  const isCurrent = charGlobalIdx === typedText.length;
                  const isWrong = mistakesMap[charGlobalIdx] !== undefined;

                  let charClass = 'text-neutral-400';

                  if (isTyped) {
                    if (isWrong) {
                      charClass = 'bg-rose-500/30 text-rose-300 underline decoration-rose-500 font-bold';
                    } else {
                      charClass = 'text-emerald-400 bg-emerald-500/10 font-semibold';
                    }
                  } else if (isCurrent) {
                    charClass =
                      'bg-sky-500 text-white font-black underline decoration-2 decoration-sky-300 shadow-sm shadow-sky-500/50 animate-pulse rounded-xs px-0.5';
                  }

                  return (
                    <span
                      key={charIdx}
                      ref={isCurrent ? activeCharRef : null}
                      className={`inline-block transition-colors duration-75 ${charClass}`}
                    >
                      {char}
                    </span>
                  );
                })}

                {/* Newline indicator if current character is newline */}
                {lineStartIndex + lineChars.length === typedText.length && (
                  <span
                    ref={activeCharRef}
                    className="bg-sky-500 text-white font-bold text-xs px-1 rounded-xs animate-pulse ml-0.5"
                  >
                    ↵
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodeTypingArena;
