import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flag, Trophy, Zap, RotateCcw, Sparkles, Award } from 'lucide-react';
import { calculateWPM, calculateAccuracy } from '../../utils/codeTypingAnalyzer';

const AI_RACERS = [
  { name: 'SpeedDemon AI', color: 'bg-rose-500 text-white', icon: '🏎️', baseWpm: 55 },
  { name: 'TurboTypist AI', color: 'bg-purple-500 text-white', icon: '🏎️', baseWpm: 68 },
  { name: 'GhostRacer AI', color: 'bg-amber-400 text-black', icon: '🏎️', baseWpm: 75 },
];

export const CarRaceArena = ({
  snippet = 'const boostNitro = () => { console.log("Turbo Nitro Engaged! 🚀"); };',
  language = 'javascript',
  onComplete,
}) => {
  const [typedText, setTypedText] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [mistakesMap, setMistakesMap] = useState({});

  // AI Progress states (0 to 100%)
  const [aiProgress, setAiProgress] = useState([0, 0, 0]);

  const inputRef = useRef(null);
  const targetCode = snippet;

  // Player progress percentage
  const playerPercent = Math.min(100, Math.round((typedText.length / targetCode.length) * 100));

  // AI movement interval loop during race
  useEffect(() => {
    if (!startTime || isFinished) return;

    const interval = setInterval(() => {
      const elapsedSec = Math.max(1, (Date.now() - startTime) / 1000);
      setAiProgress((prev) =>
        prev.map((prog, idx) => {
          if (prog >= 100) return 100;
          const wpm = AI_RACERS[idx].baseWpm;
          const charsPerSec = (wpm * 5) / 60;
          const totalCharsSimulated = charsPerSec * elapsedSec;
          const percent = Math.min(100, (totalCharsSimulated / targetCode.length) * 100);
          return Math.round(percent);
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [startTime, isFinished, targetCode.length]);

  // Focus input automatically
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (isFinished || !targetCode) return;

      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }
      if ([' ', 'Backspace', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }

      const now = Date.now();
      if (!startTime) setStartTime(now);

      const currentIndex = typedText.length;
      const expectedChar = targetCode[currentIndex];

      if (e.key === 'Backspace') {
        if (currentIndex > 0) {
          setTypedText((prev) => prev.slice(0, -1));
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
      }

      const nextTyped = typedText + inputChar;
      setTypedText(nextTyped);

      // Track WPM snapshot history for performance graph
      const secondsElapsed = Math.max(1, (now - (startTime || now)) / 1000);
      const currentWpm = calculateWPM(nextTyped.length, secondsElapsed);
      
      if (nextTyped.length % 5 === 0) {
        setWpmHistory((prev) => [...prev, { timeSec: Math.round(secondsElapsed), wpm: currentWpm }]);
      }

      // Check Finish Line!
      if (nextTyped.length >= targetCode.length) {
        setIsFinished(true);
        const finishTime = Date.now();
        const totalSec = Math.max(1, Math.round((finishTime - (startTime || now)) / 1000));
        const finalWpm = calculateWPM(targetCode.length, totalSec);
        const finalAccuracy = calculateAccuracy(targetCode.length, totalKeystrokes + 1);

        // Determine final position
        const finishersBeforePlayer = aiProgress.filter((p) => p >= 100).length;
        const playerRank = finishersBeforePlayer + 1; // 1st, 2nd, 3rd, or 4th

        if (onComplete) {
          onComplete({
            wpm: finalWpm,
            accuracy: finalAccuracy,
            errors: errorCount + (isCorrect ? 0 : 1),
            timeSeconds: totalSec,
            typedLength: targetCode.length,
            mistakesMap,
            wpmHistory: [...wpmHistory, { timeSec: totalSec, wpm: finalWpm }],
            modeName: 'Car Race 🏎️',
            raceRank: playerRank,
          });
        }
      }
    },
    [isFinished, targetCode, startTime, typedText, errorCount, totalKeystrokes, aiProgress, wpmHistory, onComplete, mistakesMap]
  );

  // Compute live race rankings
  const rankings = [
    { name: 'You (Player)', percent: playerPercent, isPlayer: true },
    ...AI_RACERS.map((r, i) => ({ name: r.name, percent: aiProgress[i], isPlayer: false })),
  ].sort((a, b) => b.percent - a.percent);

  const playerRankIndex = rankings.findIndex((r) => r.isPlayer) + 1;

  const resetRace = () => {
    setTypedText('');
    setErrorCount(0);
    setTotalKeystrokes(0);
    setStartTime(null);
    setIsFinished(false);
    setAiProgress([0, 0, 0]);
    setWpmHistory([]);
    setMistakesMap({});
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full bg-[#0d1017] border border-sky-500/40 rounded-3xl p-5 shadow-2xl space-y-5 text-white font-sans relative overflow-hidden select-none cursor-text"
    >
      <input
        ref={inputRef}
        type="text"
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
      />

      {/* Top Race Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-black flex items-center justify-center font-black text-xl shadow-md">
            🏎️
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Code Typing Race</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                {playerRankIndex === 1 ? '🥇 1st Place' : playerRankIndex === 2 ? '🥈 2nd Place' : playerRankIndex === 3 ? '🥉 3rd Place' : '4th Place'}
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Type code as fast as possible to accelerate your sportscar to victory!
            </p>
          </div>
        </div>

        <button
          onClick={resetRace}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Race</span>
        </button>
      </div>

      {/* 3D Highway Race Track Container */}
      <div className="bg-[#141824] border border-neutral-800 rounded-2xl p-4 space-y-3 relative overflow-hidden">
        {/* Highway Lane 1: Player Car */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-bold font-mono">
            <span className="text-sky-400 flex items-center gap-1.5">
              <span>🏎️ You (Player)</span>
              {playerPercent > 0 && (
                <span className="text-[10px] bg-sky-500/20 px-2 py-0.2 rounded-full border border-sky-500/40 text-sky-300">
                  NITRO ACTIVE
                </span>
              )}
            </span>
            <span className="text-white">{playerPercent}%</span>
          </div>

          <div className="relative w-full bg-[#0a0d14] rounded-full h-8 border border-sky-500/30 overflow-hidden flex items-center px-1">
            {/* Track Dashed Line */}
            <div className="absolute inset-0 border-b border-dashed border-sky-500/20 top-1/2 -translate-y-1/2 pointer-events-none" />
            {/* Animated Car */}
            <div
              className="absolute transition-all duration-200 ease-out flex items-center gap-1.5"
              style={{ left: `${Math.min(90, Math.max(1, playerPercent * 0.9))}%` }}
            >
              <div className="text-xl">🏎️</div>
              <div className="w-5 h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 blur-xs animate-pulse" />
            </div>
          </div>
        </div>

        {/* Highway Lanes: AI Opponents */}
        {AI_RACERS.map((ai, idx) => {
          const prog = aiProgress[idx];
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <span className="text-neutral-400">{ai.icon} {ai.name}</span>
                <span className="text-neutral-400">{prog}%</span>
              </div>
              <div className="relative w-full bg-[#0a0d14] rounded-full h-6 border border-neutral-800 overflow-hidden flex items-center px-1">
                <div
                  className="absolute transition-all duration-200 ease-out text-base"
                  style={{ left: `${Math.min(90, Math.max(1, prog * 0.9))}%` }}
                >
                  🚗
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Typing Arena for Race */}
      <div className="p-4 rounded-2xl bg-[#090b10] border border-sky-500/20 font-mono text-sm sm:text-base leading-relaxed tracking-wide min-h-[140px] max-h-[260px] overflow-y-auto">
        <div className="text-xs text-neutral-500 pb-2 border-b border-neutral-800 font-sans flex justify-between">
          <span>Target Code Snippet:</span>
          <span>Click arena & start typing to accelerate</span>
        </div>
        <div className="pt-2 whitespace-pre-wrap break-all">
          {targetCode.split('').map((char, idx) => {
            const isTyped = idx < typedText.length;
            const isCurrent = idx === typedText.length;
            const isWrong = mistakesMap[idx] !== undefined;

            let charClass = 'text-neutral-500';
            if (isTyped) {
              charClass = isWrong ? 'bg-rose-500/30 text-rose-300 underline font-bold' : 'text-emerald-400 font-bold';
            } else if (isCurrent) {
              charClass = 'bg-amber-400 text-black font-black underline animate-pulse px-0.5 rounded-xs';
            }

            return (
              <span key={idx} className={charClass}>
                {char}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarRaceArena;
