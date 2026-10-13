import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  User,
  Cpu,
} from 'lucide-react';

const HUMAN_THOUGHTS = [
  'Grabbing pen and paper...',
  'Calculating: 432 × 197... carry the 2...',
  'Oops, made a mistake! Erasing...',
  'Checking my phone notification...',
  'Drinking some water...',
  'Got tired. Only finished 14 out of 1,000,000!',
];

export const SpeedRaceSimulator = () => {
  const [isRacing, setIsRacing] = useState(false);
  const [computerProgress, setComputerProgress] = useState(0);
  const [humanProgress, setHumanProgress] = useState(0);
  const [computerTime, setComputerTime] = useState(null);
  const [humanThought, setHumanThought] = useState('Waiting at starting line...');

  useEffect(() => {
    let interval;
    if (isRacing) {
      // Computer instantly finishes
      const compTimer = setTimeout(() => {
        setComputerProgress(100);
        setComputerTime('0.003 seconds');
      }, 300);

      // Human struggles slowly
      let count = 0;
      interval = setInterval(() => {
        count++;
        if (count < HUMAN_THOUGHTS.length) {
          setHumanProgress(count * 0.05); // tiny progress
          setHumanThought(HUMAN_THOUGHTS[count]);
        } else {
          setIsRacing(false);
        }
      }, 800);

      return () => {
        clearTimeout(compTimer);
        clearInterval(interval);
      };
    }
  }, [isRacing]);

  const handleStart = () => {
    setComputerProgress(0);
    setHumanProgress(0);
    setComputerTime(null);
    setHumanThought('Solving 1,000,000 math equations...');
    setIsRacing(true);
  };

  const handleReset = () => {
    setIsRacing(false);
    setComputerProgress(0);
    setHumanProgress(0);
    setComputerTime(null);
    setHumanThought('Waiting at starting line...');
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Interactive Visualizer 2
          </span>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Why Use Computers? The Great Speed & Consistency Race!
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Task: Calculate 1,000,000 complex math problems. Hit Start to see why human mathematicians handed this job to computers!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isRacing && computerProgress === 0 ? (
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Speed Race</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Race</span>
            </button>
          )}
        </div>
      </div>

      {/* Race Tracks */}
      <div className="space-y-4">
        {/* Computer Track */}
        <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
              <Cpu className="w-4 h-4 text-sky-500" />
              <span>Computer (Billion Calculations / Sec)</span>
            </div>
            <span className="font-mono text-sky-600 dark:text-sky-400">
              {computerTime ? `Finished in ${computerTime}! ⚡` : 'Ready'}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${computerProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Result: 1,000,000 / 1,000,000 solved with 100% precision</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {computerProgress === 100 ? 'WINNER! 🏆' : ''}
            </span>
          </div>
        </div>

        {/* Human Track */}
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <User className="w-4 h-4 text-neutral-500" />
              <span>Human Mathematician (With Pencil & Paper)</span>
            </div>
            <span className="text-amber-600 dark:text-amber-400 font-mono italic text-[11px]">
              {humanThought}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, humanProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>Estimated time to finish by hand: <strong>~35 Years</strong> without sleeping!</span>
            <span>Progress: {humanProgress.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* The 3 Core Superpowers Explained Simply */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-black text-sky-600 dark:text-sky-400 block">
            1. Insane Speed
          </span>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A modern phone CPU runs at 3.0 GHz — that is <strong>3 Billion clock pulses per second</strong>!
          </p>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
            2. Never Gets Tired
          </span>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Humans get bored, sleepy, and make typos. A computer performs the 1,000,000th calculation identically to the 1st.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 space-y-1">
          <span className="text-xs font-black text-purple-600 dark:text-purple-400 block">
            3. Giant Memory
          </span>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            A tiny memory chip holds 500,000 songs and 1,000 books in a space smaller than your fingernail.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedRaceSimulator;
