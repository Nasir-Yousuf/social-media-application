import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Camera,
  Calculator,
  Mic,
  CheckCircle2,
} from 'lucide-react';

export const IPOMachineSimulator = () => {
  // 3 Fun Everyday Scenarios
  const SCENARIOS = [
    {
      id: 'photo',
      name: 'Phone Camera Selfie',
      icon: Camera,
      badge: 'Instagram / Snapchat Filter',
      inputData: 'Raw Photo Pixels from Camera Lens',
      inputIcon: '📸',
      processAction: 'AI analyzes face lighting & applies smooth filter',
      processIcon: '⚙️',
      outputData: 'Gorgeous Filtered Photo on Screen',
      outputIcon: '✨',
      storageData: 'Saved permanently to Cloud Photo Gallery',
      storageIcon: '☁️',
      color: 'from-pink-500 to-rose-500',
      tagColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    },
    {
      id: 'math',
      name: 'Typing 25 × 4 in Calculator',
      icon: Calculator,
      badge: 'Math Calculation',
      inputData: 'Keystrokes: "2", "5", "×", "4"',
      inputIcon: '⌨️',
      processAction: 'CPU ALU multiplies binary numbers (00011001 × 00000100)',
      processIcon: '🧠',
      outputData: 'Displays "100" on the Calculator Screen',
      outputIcon: '💯',
      storageData: 'Saved into History Memory for next calculation',
      storageIcon: '💾',
      color: 'from-sky-500 to-blue-600',
      tagColor: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    },
    {
      id: 'voice',
      name: 'Speaking to Siri / Google Assistant',
      icon: Mic,
      badge: 'Voice Recognition',
      inputData: 'Acoustic Sound Waves: "What is the weather?"',
      inputIcon: '🎙️',
      processAction: 'Audio converted to text & weather API queried',
      processIcon: '🌩️',
      outputData: 'Speaker speaks: "It is 24°C and Sunny today!"',
      outputIcon: '🔊',
      storageData: 'Cached in Voice History log',
      storageIcon: '🗄️',
      color: 'from-amber-500 to-orange-600',
      tagColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
  ];

  const [activeScenarioId, setActiveScenarioId] = useState('photo');
  const [stage, setStage] = useState(0); // 0: Idle, 1: Input, 2: Process, 3: Output, 4: Storage Done
  const [isRunning, setIsRunning] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setTimeout(() => {
        if (stage < 4) {
          setStage((prev) => prev + 1);
        } else {
          setIsRunning(false);
        }
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [isRunning, stage]);

  const handleRun = () => {
    setStage(1);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStage(0);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Interactive Visualizer 1
          </span>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            The IPO Machine: How Every Computer in the World Works
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Pick a real-world scenario below and watch the data travel step-by-step through the 4 stages.
          </p>
        </div>

        {/* Scenario Selectors */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-2xl">
          {SCENARIOS.map((s) => {
            const Icon = s.icon;
            const isSelected = s.id === scenario.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveScenarioId(s.id);
                  handleReset();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The 4 Stage Visual Conveyor Belt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stage 1: INPUT */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all duration-300 space-y-2.5 relative ${
            stage >= 1
              ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
              1. INPUT (Data In)
            </span>
            <span className="text-lg">{scenario.inputIcon}</span>
          </div>

          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
            Raw Data from Outside
          </h4>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed min-h-[38px]">
            {scenario.inputData}
          </p>

          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[10px] font-bold">
            <span className="text-neutral-500">Device:</span>
            <span className="text-sky-600 dark:text-sky-400">Camera / Mic / Keyboard</span>
          </div>
        </div>

        {/* Stage 2: PROCESSING */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all duration-300 space-y-2.5 relative ${
            stage >= 2
              ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              2. PROCESSING (The Brain)
            </span>
            <span className="text-lg">{scenario.processIcon}</span>
          </div>

          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
            CPU Crunching Code
          </h4>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed min-h-[38px]">
            {scenario.processAction}
          </p>

          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[10px] font-bold">
            <span className="text-neutral-500">Device:</span>
            <span className="text-purple-600 dark:text-purple-400">Central Processor (CPU)</span>
          </div>
        </div>

        {/* Stage 3: OUTPUT */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all duration-300 space-y-2.5 relative ${
            stage >= 3
              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. OUTPUT (Result Out)
            </span>
            <span className="text-lg">{scenario.outputIcon}</span>
          </div>

          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
            Useful Information
          </h4>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed min-h-[38px]">
            {scenario.outputData}
          </p>

          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[10px] font-bold">
            <span className="text-neutral-500">Device:</span>
            <span className="text-emerald-600 dark:text-emerald-400">Screen / Speaker / Print</span>
          </div>
        </div>

        {/* Stage 4: STORAGE */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all duration-300 space-y-2.5 relative ${
            stage >= 4
              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
              : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              4. STORAGE (The Vault)
            </span>
            <span className="text-lg">{scenario.storageIcon}</span>
          </div>

          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
            Saved for the Future
          </h4>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed min-h-[38px]">
            {scenario.storageData}
          </p>

          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[10px] font-bold">
            <span className="text-neutral-500">Device:</span>
            <span className="text-amber-600 dark:text-amber-400">SSD / Flash / Cloud</span>
          </div>
        </div>
      </div>

      {/* Control Buttons & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {stage === 0 ? (
            <button
              type="button"
              onClick={handleRun}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Data Flow</span>
            </button>
          ) : stage < 4 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
              <span>
                {stage === 1 && 'Step 1: Reading Input...'}
                {stage === 2 && 'Step 2: CPU Processing data...'}
                {stage === 3 && 'Step 3: Rendering Output...'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cycle Complete! Data Processed & Safely Stored.</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* 14-year-old Plain English Rule */}
        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
          💡 Simple Rule: <strong className="text-neutral-800 dark:text-neutral-200">Data</strong> goes IN, <strong className="text-neutral-800 dark:text-neutral-200">Work</strong> happens, <strong className="text-neutral-800 dark:text-neutral-200">Answers</strong> come OUT!
        </div>
      </div>
    </div>
  );
};

export default IPOMachineSimulator;
