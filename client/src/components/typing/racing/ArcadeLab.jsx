import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  Zap,
  Play,
} from 'lucide-react';
import racingAudio from '../../../utils/racingAudio';

/**
 * Arcade Lab / Mood Mini-Games
 * Playable mini-games:
 * 1. Typing Cricket: Bowler delivers words! Type before the ball reaches batsman.
 *    Long words = SIX (6), medium = FOUR (4), short = 1 or 2 runs. Typo = WICKET!
 * 2. Word Rush: Falling rapid cyber words. Type to destroy them before hitting the bottom line.
 */
export const ArcadeLab = ({ onBack = () => {}, defaultGame = 'cricket' }) => {
  const [activeGame, setActiveGame] = useState(defaultGame);

  // --- TYPING CRICKET STATE ---
  const [cricketState, setCricketState] = useState({
    runs: 0,
    wickets: 0,
    balls: 0,
    currentWord: 'STRIKE',
    input: '',
    ballProgress: 0, // 0 to 100%
    commentary: 'Bowler runs in! Type the delivery word cleanly!',
    isOver: false,
    timerActive: false,
  });

  const cricketWords = [
    { word: 'COVERDRIVE', runs: 6, label: 'MASSIVE SIX! 🚀' },
    { word: 'HELICOPTER', runs: 6, label: 'MAXIMUM OUT OF THE PARK! 💥' },
    { word: 'STRAIGHTDRIVE', runs: 4, label: 'CRACKING BOUNDARY! ⚡' },
    { word: 'PULLSHOT', runs: 4, label: 'CRISP FOUR TO MIDWICKET! 🏏' },
    { word: 'SINGLE', runs: 1, label: 'Quick single rotated!' },
    { word: 'DOUBLE', runs: 2, label: 'Good running between the wickets!' },
    { word: 'SWEEP', runs: 4, label: 'Swept away for four!' },
    { word: 'UPPERCUT', runs: 6, label: 'Over third man for six! 🔥' },
    { word: 'DEFENSE', runs: 1, label: 'Solid front foot defense.' },
    { word: 'YORKER', runs: 2, label: 'Dug out the yorker safely!' },
  ];

  const currentDeliveryRef = useRef(cricketWords[0]);
  const cricketInputRef = useRef(null);

  // Cricket Delivery Loop
  useEffect(() => {
    if (activeGame !== 'cricket' || !cricketState.timerActive || cricketState.isOver) return;

    const interval = setInterval(() => {
      setCricketState((prev) => {
        if (prev.ballProgress >= 100) {
          // Ball bowled without typing! WICKET!
          racingAudio.playKey(false);
          const nextWickets = prev.wickets + 1;
          const isGameOver = nextWickets >= 3;
          const nextDelivery = cricketWords[Math.floor(Math.random() * cricketWords.length)];
          currentDeliveryRef.current = nextDelivery;

          return {
            ...prev,
            wickets: nextWickets,
            balls: prev.balls + 1,
            ballProgress: 0,
            currentWord: nextDelivery.word,
            input: '',
            commentary: isGameOver ? 'ALL OUT! Match finished.' : 'TIMBER! Bowled out by the pacer! 🔴',
            isOver: isGameOver,
            timerActive: !isGameOver,
          };
        }

        return {
          ...prev,
          ballProgress: prev.ballProgress + 4,
        };
      });
    }, 120);

    return () => clearInterval(interval);
  }, [activeGame, cricketState.timerActive, cricketState.isOver]);

  const handleCricketInput = (e) => {
    const val = e.target.value.toUpperCase();
    const target = cricketState.currentWord;

    if (val === target) {
      // Hit delivery!
      racingAudio.playVictory();
      const scored = currentDeliveryRef.current.runs;
      const commentary = currentDeliveryRef.current.label;
      const nextDelivery = cricketWords[Math.floor(Math.random() * cricketWords.length)];
      currentDeliveryRef.current = nextDelivery;

      setCricketState((prev) => ({
        ...prev,
        runs: prev.runs + scored,
        balls: prev.balls + 1,
        ballProgress: 0,
        currentWord: nextDelivery.word,
        input: '',
        commentary,
      }));
    } else {
      racingAudio.playKey(true);
      setCricketState((prev) => ({ ...prev, input: val }));
    }
  };

  const startCricketMatch = () => {
    const firstDelivery = cricketWords[0];
    currentDeliveryRef.current = firstDelivery;
    setCricketState({
      runs: 0,
      wickets: 0,
      balls: 0,
      currentWord: firstDelivery.word,
      input: '',
      ballProgress: 0,
      commentary: 'Match started! Fast bowler charging towards the crease!',
      isOver: false,
      timerActive: true,
    });
    setTimeout(() => {
      if (cricketInputRef.current) cricketInputRef.current.focus();
    }, 50);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black italic tracking-wide text-white">
              ARCADE LAB & MOOD GAMES
            </h2>
            <p className="text-xs text-slate-400">
              Experimental mini-games powered by your typing cadence
            </p>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveGame('cricket')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeGame === 'cricket' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏏</span>
            <span>Typing Cricket</span>
          </button>
          <button
            onClick={() => setActiveGame('word_rush')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeGame === 'word_rush' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔤</span>
            <span>Word Rush</span>
          </button>
        </div>
      </div>

      {/* --- GAME 1: TYPING CRICKET --- */}
      {activeGame === 'cricket' && (
        <div className="rounded-3xl bg-slate-950/90 border border-emerald-500/40 p-6 shadow-2xl relative overflow-hidden">
          {/* Cricket Pitch Ambient Background */}
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Scoreboard Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🏏</span>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  CLEARFEED STADIUM
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  {cricketState.runs} / {cricketState.wickets}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-mono font-bold">
              <div>
                <span className="text-xs text-slate-400 block">Overs</span>
                <span className="text-emerald-400">
                  {Math.floor(cricketState.balls / 6)}.{cricketState.balls % 6}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Target</span>
                <span className="text-amber-400">50 Runs</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Status</span>
                <span className={cricketState.wickets >= 3 ? 'text-red-400' : 'text-cyan-400'}>
                  {cricketState.isOver ? 'Match Finished' : cricketState.timerActive ? 'In Play' : 'Waiting'}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Pitch & Ball Delivery Lane */}
          <div className="my-8 relative h-48 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-slate-800 flex items-center justify-between px-8 overflow-hidden">
            {/* Bowler End */}
            <div className="flex flex-col items-center z-10">
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center text-xl shadow-lg">
                🏃
              </div>
              <span className="text-[11px] font-bold text-slate-300 mt-1">Speedster</span>
            </div>

            {/* Pitch Grass & Crease Lines */}
            <div className="absolute inset-y-12 inset-x-28 bg-emerald-900/30 border-y-2 border-dashed border-emerald-500/30 flex items-center">
              {/* Approaching Cricket Red Leather Ball */}
              <div
                className="w-6 h-6 rounded-full bg-red-600 border border-white shadow-[0_0_12px_#ef4444] transition-all duration-100 flex items-center justify-center text-[10px] text-white font-bold"
                style={{
                  marginLeft: `${Math.min(92, cricketState.ballProgress)}%`,
                }}
              >
                🔴
              </div>
            </div>

            {/* Batsman Crease (User End) */}
            <div className="flex flex-col items-center z-10">
              <div className="w-12 h-12 rounded-full bg-purple-900 border-2 border-purple-400 flex items-center justify-center text-xl shadow-lg">
                🏏
              </div>
              <span className="text-[11px] font-bold text-white mt-1">You</span>
            </div>
          </div>

          {/* Live Delivery Word HUD */}
          <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-4">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 w-full text-xs font-semibold text-slate-300">
              {cricketState.commentary}
            </div>

            {cricketState.timerActive ? (
              <div className="w-full space-y-3">
                <div className="text-3xl font-black font-mono tracking-widest text-emerald-400 drop-shadow-[0_0_10px_#10b981]">
                  {cricketState.currentWord}
                </div>

                <input
                  ref={cricketInputRef}
                  type="text"
                  value={cricketState.input}
                  onChange={handleCricketInput}
                  autoFocus
                  placeholder="TYPE WORD TO HIT SHOT!"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border-2 border-emerald-500 text-center font-mono font-black text-xl text-white tracking-widest focus:outline-none shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
              </div>
            ) : (
              <button
                onClick={startCricketMatch}
                className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-widest uppercase shadow-xl shadow-emerald-950/40 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play size={18} className="fill-slate-950" />
                <span>{cricketState.isOver ? 'PLAY REMATCH' : 'START MATCH'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- GAME 2: WORD RUSH --- */}
      {activeGame === 'word_rush' && (
        <div className="rounded-3xl bg-slate-950/90 border border-cyan-500/40 p-6 shadow-2xl flex flex-col items-center justify-center min-h-[360px] text-center space-y-4">
          <span className="text-4xl">🔤</span>
          <h3 className="text-xl font-extrabold text-white">Word Rush</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Type cyber words as they rush across the screen. Defeat word waves to earn XP and level up your typing accuracy!
          </p>
          <button
            onClick={() => {
              setActiveGame('cricket');
              startCricketMatch();
            }}
            className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider"
          >
            PLAY CRICKET OR RETURN TO ARENA
          </button>
        </div>
      )}
    </div>
  );
};

export default ArcadeLab;
