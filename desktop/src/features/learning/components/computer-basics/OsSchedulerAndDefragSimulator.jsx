import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  RotateCcw,
  Play,
  HardDrive,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const OsSchedulerAndDefragSimulator = ({ lang = 'both' }) => {
  const [activeTab, setActiveTab] = useState('scheduling'); // 'scheduling' | 'defrag'

  // ==========================================
  // TAB 1: CPU Round-Robin Scheduling State
  // ==========================================
  const [isRunningScheduler, setIsRunningScheduler] = useState(false);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);

  const TASKS = [
    { name: 'Browser (Chrome)', color: 'border-sky-500 bg-sky-500/10 text-sky-400' },
    { name: 'Music Player (Spotify)', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
    { name: 'Game Engine (Minecraft)', color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  ];

  useEffect(() => {
    let schedTimer;
    if (isRunningScheduler) {
      schedTimer = setInterval(() => {
        setCurrentTaskIdx((prev) => (prev + 1) % TASKS.length);
        setCompletedCycles((c) => c + 1);
      }, 700);
    }
    return () => clearInterval(schedTimer);
  }, [isRunningScheduler]);

  // ==========================================
  // TAB 2: Disk Defragmenter State
  // ==========================================
  const FRAGMENTED_BLOCKS = [
    { id: 1, file: 'A', color: 'bg-rose-500' },
    { id: 2, file: 'B', color: 'bg-blue-500' },
    { id: 3, file: 'Free', color: 'bg-neutral-800' },
    { id: 4, file: 'A', color: 'bg-rose-500' },
    { id: 5, file: 'C', color: 'bg-emerald-500' },
    { id: 6, file: 'Free', color: 'bg-neutral-800' },
    { id: 7, file: 'B', color: 'bg-blue-500' },
    { id: 8, file: 'A', color: 'bg-rose-500' },
    { id: 9, file: 'Free', color: 'bg-neutral-800' },
    { id: 10, file: 'C', color: 'bg-emerald-500' },
    { id: 11, file: 'Free', color: 'bg-neutral-800' },
    { id: 12, file: 'B', color: 'bg-blue-500' },
  ];

  const DEFRAGMENTED_BLOCKS = [
    { id: 1, file: 'A', color: 'bg-rose-500' },
    { id: 2, file: 'A', color: 'bg-rose-500' },
    { id: 3, file: 'A', color: 'bg-rose-500' },
    { id: 4, file: 'B', color: 'bg-blue-500' },
    { id: 5, file: 'B', color: 'bg-blue-500' },
    { id: 6, file: 'B', color: 'bg-blue-500' },
    { id: 7, file: 'C', color: 'bg-emerald-500' },
    { id: 8, file: 'C', color: 'bg-emerald-500' },
    { id: 9, file: 'Free', color: 'bg-neutral-800' },
    { id: 10, file: 'Free', color: 'bg-neutral-800' },
    { id: 11, file: 'Free', color: 'bg-neutral-800' },
    { id: 12, file: 'Free', color: 'bg-neutral-800' },
  ];

  const [blocks, setBlocks] = useState(FRAGMENTED_BLOCKS);
  const [isDefragging, setIsDefragging] = useState(false);
  const [isDefragDone, setIsDefragDone] = useState(false);

  const handleStartDefrag = () => {
    setIsDefragging(true);
    setIsDefragDone(false);

    setTimeout(() => {
      setBlocks(DEFRAGMENTED_BLOCKS);
      setIsDefragging(false);
      setIsDefragDone(true);
    }, 1800);
  };

  const handleResetDefrag = () => {
    setBlocks(FRAGMENTED_BLOCKS);
    setIsDefragging(false);
    setIsDefragDone(false);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Interactive OS Core & Utility
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 06 · Topics 2.1 & 5.1</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Operating System Multitasking & Disk Defragmenter
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'সিপিইউ টাইম-শেয়ারিং শিডিউলার এবং হার্ড ড্রাইভের ছড়ানো ফাইল একত্রিত করার ডিফ্র্যাগমেন্টার ইউটিলিটি।'
              : 'Toggle between round-robin task time-slicing and disk cluster defragmentation!'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('scheduling')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scheduling'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Multitasking Scheduler
          </button>
          <button
            onClick={() => setActiveTab('defrag')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'defrag'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Disk Defragmenter
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: MULTITASKING SCHEDULER
         ======================================================== */}
      {activeTab === 'scheduling' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-neutral-950 p-6 border border-neutral-800 text-white space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-400">Round-Robin Time Slice (Quantum: 10ms)</span>
                <h4 className="text-lg font-black text-white mt-0.5">CPU Time-Sharing In Action</h4>
              </div>

              <button
                type="button"
                onClick={() => setIsRunningScheduler(!isRunningScheduler)}
                className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
                  isRunningScheduler
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningScheduler ? 'Pause Scheduling' : 'Start Multitasking'}</span>
              </button>
            </div>

            {/* 3 Active Tasks in Queue */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TASKS.map((t, idx) => {
                const isActive = currentTaskIdx === idx && isRunningScheduler;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 transition-all space-y-2 ${
                      isActive
                        ? `${t.color} scale-105 shadow-lg`
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{t.name}</span>
                      {isActive && <Activity className="w-4 h-4 animate-spin text-purple-400" />}
                    </div>
                    <div className="text-[10px] font-mono">
                      State: <strong>{isActive ? 'RUNNING (CPU Latch)' : 'READY IN QUEUE'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metrics: Throughput, Turnaround Time, Response Time */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-800 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">Throughput</span>
                <strong className="text-purple-400">140 Jobs / sec</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">Turnaround Time</span>
                <strong className="text-emerald-400">12 ms</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">Response Time</span>
                <strong className="text-sky-400">&lt; 2 ms (Instant!)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DISK DEFRAGMENTER
         ======================================================== */}
      {activeTab === 'defrag' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-neutral-950 p-6 border border-neutral-800 text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-neutral-400">Hard Drive Physical Sectors</span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {isDefragDone
                    ? '✓ Defragmentation Complete: Contiguous Clusters'
                    : isDefragging
                    ? 'Reorganizing Sectors...'
                    : 'Scattered / Fragmented File Clusters'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isDefragging || isDefragDone}
                  onClick={handleStartDefrag}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDefragging || isDefragDone
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {isDefragging ? 'Defragmenting...' : 'Run Disk Defragmenter'}
                </button>
                <button
                  type="button"
                  onClick={handleResetDefrag}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual 12-Sector Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {blocks.map((b, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border border-neutral-700 transition-all text-center space-y-1 ${b.color} text-white font-mono shadow-xs`}
                >
                  <div className="text-[10px] opacity-75">Sector {idx + 1}</div>
                  <div className="text-xs font-black">{b.file === 'Free' ? 'Empty' : `File ${b.file}`}</div>
                </div>
              ))}
            </div>

            {/* Benchmark Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="text-neutral-300">Sequential Read Throughput:</span>
                <strong className={isDefragDone ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                  {isDefragDone ? '180 MB/s (Lightning Fast!)' : '38 MB/s (Head Seeking Lag)'}
                </strong>
              </div>
              <span className="text-neutral-400 text-[11px]">
                Reduces mechanical read-head travel distance.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OsSchedulerAndDefragSimulator;
