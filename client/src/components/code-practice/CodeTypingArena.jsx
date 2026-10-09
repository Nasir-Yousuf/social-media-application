import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Lock, Sparkles, CheckCircle2, RotateCcw, Flame, ShieldAlert } from 'lucide-react';
import { calculateWPM, calculateAccuracy } from '../../utils/codeTypingAnalyzer';

export const CodeTypingArena = ({
  snippet = '',
  language = 'javascript',
  mode = 'classic',
  onKeystroke,
  onComplete,
  onReset,
}) => {
  const [typedText, setTypedText] = useState('');
  const [mistakesMap, setMistakesMap] = useState({});
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // WPM History tracker for chart
  const [wpmHistory, setWpmHistory] = useState([]);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const containerRef = useRef(null);
  const editorBodyRef = useRef(null);
  const inputRef = useRef(null);
  const activeCharRef = useRef(null);

  const targetCode = snippet || '';

  // Reset state when snippet or mode changes
  useEffect(() => {
    setTypedText('');
    setMistakesMap({});
    setErrorCount(0);
    setTotalKeystrokes(0);
    setStartTime(null);
    setEndTime(null);
    setWpmHistory([]);
    setComboStreak(0);
    setMaxCombo(0);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [snippet, mode]);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  // Keep active line visible vertically without thrashing horizontal scroll
  useEffect(() => {
    if (activeCharRef.current && editorBodyRef.current) {
      const activeEl = activeCharRef.current;
      const containerEl = editorBodyRef.current;
      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom - 20) {
        activeEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
  }, [typedText]);

  const handleKeyDown = useCallback(
    (e) => {
      if (endTime || !targetCode) return;

      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }
      if ([' ', 'Backspace', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }

      const now = Date.now();
      if (!startTime) {
        setStartTime(now);
      }

      const currentIndex = typedText.length;
      const expectedChar = targetCode[currentIndex];

      if (e.key === 'Backspace') {
        if (currentIndex > 0) {
          setTypedText((prev) => prev.slice(0, -1));
          setComboStreak(0);
        }
        return;
      }

      let inputChar = e.key;
      if (e.key === 'Tab') inputChar = '  ';
      else if (e.key === 'Enter') inputChar = '\n';

      const isCorrect = inputChar === expectedChar;
      setTotalKeystrokes((prev) => prev + 1);

      if (!isCorrect) {
        setErrorCount((prev) => prev + 1);
        setMistakesMap((prev) => ({ ...prev, [currentIndex]: inputChar }));
        setComboStreak(0);
      } else {
        setComboStreak((prev) => {
          const next = prev + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });
      }

      const nextTyped = typedText + inputChar;
      setTypedText(nextTyped);

      const secondsElapsed = Math.max(1, (now - (startTime || now)) / 1000);
      const liveWpm = calculateWPM(nextTyped.length, secondsElapsed);

      if (nextTyped.length % 6 === 0) {
        setWpmHistory((prev) => [...prev, { timeSec: Math.round(secondsElapsed), wpm: liveWpm }]);
      }

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

      if (nextTyped.length >= targetCode.length) {
        const finishTime = Date.now();
        setEndTime(finishTime);
        const totalSec = Math.max(1, Math.round((finishTime - (startTime || now)) / 1000));
        const finalWpm = calculateWPM(targetCode.length, totalSec);
        const finalAccuracy = calculateAccuracy(targetCode.length, totalKeystrokes + 1);

        const modeLabel =
          mode === 'arcade'
            ? 'Arcade Combo ⚡'
            : mode === 'cyber'
            ? 'Cyber Hacker 💻'
            : mode === 'focus'
            ? 'Focus Zen 🧘'
            : 'Classic Curriculum';

        if (onComplete) {
          onComplete({
            wpm: finalWpm,
            accuracy: finalAccuracy,
            errors: errorCount + (isCorrect ? 0 : 1),
            timeSeconds: totalSec,
            typedLength: targetCode.length,
            mistakesMap,
            wpmHistory: [...wpmHistory, { timeSec: totalSec, wpm: finalWpm }],
            modeName: modeLabel,
          });
        }
      }
    },
    [endTime, targetCode, startTime, typedText, errorCount, totalKeystrokes, onKeystroke, onComplete, mistakesMap, mode, wpmHistory, maxCombo]
  );

  const codeLines = targetCode.split('\n');
  let globalCharIndex = 0;

  // Mode Theme Classes
  let bgTheme = 'bg-[#181a1f] border-sky-500/50 shadow-xl shadow-sky-500/10';
  let fontTheme = 'text-neutral-400';
  let correctCharTheme = 'text-emerald-400 bg-emerald-500/10 font-semibold';
  let currentCharTheme = 'bg-sky-500 text-white font-black underline decoration-sky-300 rounded-xs px-0.5';

  if (mode === 'cyber') {
    bgTheme = 'bg-[#050d08] border-emerald-500/60 shadow-2xl shadow-emerald-500/20';
    fontTheme = 'text-emerald-700 font-mono';
    correctCharTheme = 'text-emerald-400 font-bold bg-emerald-500/20 shadow-xs shadow-emerald-500/50';
    currentCharTheme = 'bg-emerald-400 text-black font-black underline ring-1 ring-emerald-400 rounded-xs px-0.5';
  } else if (mode === 'arcade') {
    bgTheme = 'bg-[#0f0c1b] border-purple-500/60 shadow-2xl shadow-purple-500/20';
    fontTheme = 'text-purple-300 font-mono';
    correctCharTheme = 'text-amber-300 font-bold bg-amber-500/20';
    currentCharTheme = 'bg-amber-400 text-black font-black underline ring-1 ring-amber-400 rounded-xs px-0.5';
  } else if (mode === 'focus') {
    bgTheme = 'bg-[#090a0f] border-neutral-800 shadow-lg';
    fontTheme = 'text-neutral-500 font-mono';
    correctCharTheme = 'text-sky-300 font-medium';
    currentCharTheme = 'bg-white text-black font-bold rounded-xs px-0.5';
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`relative w-full rounded-2xl border transition-all duration-200 overflow-hidden font-mono select-none cursor-text ${bgTheme}`}
    >
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

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10 text-xs font-sans">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-neutral-400 font-mono text-[11px] ml-2 uppercase font-bold tracking-wider">
            {mode} Mode · practice_workspace.{language}
          </span>
        </div>

        {/* Combo Multiplier for Arcade */}
        {mode === 'arcade' && comboStreak >= 5 && (
          <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500 text-black font-black text-xs shadow-md">
            <Flame className="w-3.5 h-3.5 fill-black" />
            <span>{comboStreak}x STREAK COMBO!</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isFocused && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse font-medium">
              Click to focus
            </span>
          )}
          {isFocused && (
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              ● ACTIVE FOCUS
            </span>
          )}
        </div>
      </div>

      {/* Code Body */}
      <div
        ref={editorBodyRef}
        className="p-4 sm:p-5 overflow-y-auto text-sm sm:text-base leading-relaxed tracking-wide min-h-[220px] max-h-[440px]"
      >
        {codeLines.map((lineText, lineIdx) => {
          const lineStartIndex = globalCharIndex;
          const lineChars = lineText.split('');
          globalCharIndex += lineText.length + 1;

          return (
            <div key={lineIdx} className="flex items-start hover:bg-white/[0.02] rounded-xs px-1">
              <div className="w-8 sm:w-10 shrink-0 text-right pr-3 select-none text-neutral-600 font-mono text-xs sm:text-sm pt-0.5">
                {lineIdx + 1}
              </div>

              <div className="flex-1 whitespace-pre-wrap break-words font-mono">
                {lineChars.map((char, charIdx) => {
                  const charGlobalIdx = lineStartIndex + charIdx;
                  const isTyped = charGlobalIdx < typedText.length;
                  const isCurrent = charGlobalIdx === typedText.length;
                  const isWrong = mistakesMap[charGlobalIdx] !== undefined;

                  let charClass = fontTheme;

                  if (isTyped) {
                    charClass = isWrong
                      ? 'bg-rose-500/30 text-rose-300 underline font-bold'
                      : correctCharTheme;
                  } else if (isCurrent) {
                    charClass = currentCharTheme;
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

                {lineStartIndex + lineChars.length === typedText.length && (
                  <span
                    ref={activeCharRef}
                    className="bg-sky-500 text-white font-bold text-xs px-1 rounded-xs ml-0.5"
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
