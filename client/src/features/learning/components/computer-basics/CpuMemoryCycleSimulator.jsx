import React, { useState } from 'react';
import {
  Cpu,
  Database,
  ArrowRight,
  RotateCcw,
  Play,
  CheckCircle2,
  Layers,
  Radio,
  FileCode,
} from 'lucide-react';

const READ_CYCLE_STEPS = [
  {
    step: 1,
    titleEn: 'Address into MAR',
    titleBn: 'MAR-এ মেমোরি ঠিকানা লোড',
    descEn: 'CPU places the memory location (e.g., 0x2040) into the Memory Address Register (MAR).',
    descBn: 'সিপিইউ টার্গেট মেমোরি সেল (যেমন 0x2040) মার (MAR) রেজিস্টারে লোড করে।',
    busActive: 'address',
    highlight: 'mar',
  },
  {
    step: 2,
    titleEn: 'Address Bus Transmission',
    titleBn: 'এড্রেস বাস দিয়ে ঠিকানা প্রেরণ',
    descEn: 'The address bits travel down the unidirectional Address Bus straight to the RAM Address Decoder.',
    descBn: 'এড্রেস বাস দিয়ে একমুখী সিগন্যালে ঠিকানাটি সরাসরি র‍্যামের ডিকোডারে পৌঁছে যায়।',
    busActive: 'address',
    highlight: 'addrBus',
  },
  {
    step: 3,
    titleEn: 'Control Bus READ Signal',
    titleBn: 'কন্ট্রোল বাসে READ সিগন্যাল অ্যাক্টিভ',
    descEn: 'The Control Unit activates the READ timing pulse. RAM awakens and latches the memory cell.',
    descBn: 'কন্ট্রোল ইউনিট READ সিগন্যাল পাঠায়। মেমোরি চিপ সচল হয়ে নির্দিষ্ট সেলের তথ্য প্রস্তুত করে।',
    busActive: 'control',
    highlight: 'cu',
  },
  {
    step: 4,
    titleEn: 'Data Bus Transfer',
    titleBn: 'ডাটা বাস দিয়ে তথ্যের যাত্রা',
    descEn: 'RAM places the stored byte (0x5A / 90) onto the bidirectional Data Bus moving toward the CPU.',
    descBn: 'র‍্যাম সেল থেকে ডাটা বের করে দ্বিমুখী ডাটা বাসে ছেড়ে দেয়, যা সিপিইউ-র দিকে ছোটে।',
    busActive: 'data',
    highlight: 'dataBus',
  },
  {
    step: 5,
    titleEn: 'MBR Latches Result',
    titleBn: 'MBR ও একুমুলেটরে ফলাফল সংরক্ষণ',
    descEn: 'The byte is safely captured by the Memory Buffer Register (MBR) and passed to the Accumulator (AC)!',
    descBn: 'ডাটা বাসের তথ্য MBR রেজিস্টারে সুরক্ষিতভাবে জমা হয় এবং ALU-তে ব্যবহারের জন্য প্রস্তুত হয়!',
    busActive: 'none',
    highlight: 'mbr',
  },
];

const WRITE_CYCLE_STEPS = [
  {
    step: 1,
    titleEn: 'Address & Data Setup',
    titleBn: 'ঠিকানা ও ডাটা রেজিস্টারে সেট',
    descEn: 'CPU loads target address (0x3010) into MAR, and loads the calculated answer (0x7F) into MBR.',
    descBn: 'সিপিইউ লক্ষ্য ঠিকানা MAR-এ এবং হিসাবের চূড়ান্ত উত্তর (0x7F) MBR রেজিস্টারে বসায়।',
    busActive: 'none',
    highlight: 'mar-mbr',
  },
  {
    step: 2,
    titleEn: 'Address Bus Drive',
    titleBn: 'এড্রেস বাসে ঠিকানা দেওয়া',
    descEn: 'Address bits drive down the Address Bus to select the exact destination cell in RAM.',
    descBn: 'এড্রেস বাস দিয়ে ঠিকানা পাঠিয়ে র‍্যামের নির্দিষ্ট লোকেশনকে নির্বাচন করা হয়।',
    busActive: 'address',
    highlight: 'addrBus',
  },
  {
    step: 3,
    titleEn: 'Data Bus Drive',
    titleBn: 'ডাটা বাসে ডাটা পাঠানো',
    descEn: 'MBR pushes the value (0x7F) onto the Data Bus traveling toward the RAM input pins.',
    descBn: 'MBR রেজিস্টার থেকে সংখ্যা 0x7F ডাটা বাসে উঠিয়ে দেওয়া হয়।',
    busActive: 'data',
    highlight: 'dataBus',
  },
  {
    step: 4,
    titleEn: 'Control Bus WRITE Pulse',
    titleBn: 'কন্ট্রোল বাসে WRITE পালস পাঠানো',
    descEn: 'Control Unit fires the WRITE command pulse. RAM opens electrical gates to burn the byte into memory cells.',
    descBn: 'কন্ট্রোল ইউনিট WRITE পালস পাঠায়। র‍্যাম মেমোরি গেট খুলে ডাটা স্থায়ীভাবে সেলে ধরে রাখে।',
    busActive: 'control',
    highlight: 'cu',
  },
  {
    step: 5,
    titleEn: 'Write Complete',
    titleBn: 'রাইট অপারেশন সম্পন্ন',
    descEn: 'The byte is permanently stored in cell 0x3010. Control Unit removes WRITE signal.',
    descBn: 'র‍্যামের সেলে সফলভাবে ডাটা লেখা শেষ হলো। কন্ট্রোল ইউনিট সংকেত বন্ধ করে দেয়।',
    busActive: 'none',
    highlight: 'ram',
  },
];

export const CpuMemoryCycleSimulator = ({ lang = 'both' }) => {
  const [mode, setMode] = useState('read'); // 'read' | 'write'
  const [currentStep, setCurrentStep] = useState(0);

  const steps = mode === 'read' ? READ_CYCLE_STEPS : WRITE_CYCLE_STEPS;
  const active = steps[currentStep];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setCurrentStep(0);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              Interactive Micro-Cycle Stepper
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 03 · Topic 4.1</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            The CPU Read & Write Cycle (Step-by-Step Micro-Operation)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'সিপিইউ কীভাবে র‍্যাম থেকে ডাটা পড়ে (Read) এবং কীভাবে নতুন ফলাফল র‍্যামে লেখে (Write)—ধাপে ধাপে পর্যবেক্ষণ করুন।'
              : 'Follow MAR, MBR, PC, and the 3 bus lines through every single clock tick of memory access!'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => handleSwitchMode('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'read'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            READ Cycle (CPU ← RAM)
          </button>
          <button
            onClick={() => handleSwitchMode('write')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'write'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            WRITE Cycle (CPU → RAM)
          </button>
        </div>
      </div>

      {/* Interactive Micro-Architecture Visualizer Canvas */}
      <div className="relative rounded-2xl bg-neutral-950 p-6 border border-neutral-800 text-white space-y-6">
        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-between gap-2">
          {steps.map((st, sIdx) => {
            const isCompleted = sIdx < currentStep;
            const isCurrent = sIdx === currentStep;
            return (
              <button
                key={sIdx}
                onClick={() => setCurrentStep(sIdx)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                  isCurrent
                    ? 'bg-violet-600 border-violet-400 text-white shadow-md shadow-violet-500/30'
                    : isCompleted
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                }`}
              >
                Step {sIdx + 1}
              </button>
            );
          })}
        </div>

        {/* Dynamic Architectural Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* CPU Internal Registers */}
          <div className="md:col-span-4 rounded-xl bg-neutral-900/90 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-indigo-400 border-b border-neutral-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> CPU Internal Registers
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Registers</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div
                className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                  active.highlight === 'mar' || active.highlight === 'mar-mbr'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-102'
                    : 'bg-black/40 border-neutral-800 text-neutral-400'
                }`}
              >
                <span>MAR (Memory Address Register)</span>
                <strong>0x2040</strong>
              </div>

              <div
                className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                  active.highlight === 'mbr' || active.highlight === 'mar-mbr'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-102'
                    : 'bg-black/40 border-neutral-800 text-neutral-400'
                }`}
              >
                <span>MBR (Memory Buffer Register)</span>
                <strong>{mode === 'read' ? '0x5A' : '0x7F'}</strong>
              </div>

              <div className="p-2 rounded-lg bg-black/40 border border-neutral-800 text-neutral-400 flex items-center justify-between">
                <span>PC (Program Counter)</span>
                <span>0x0104</span>
              </div>

              <div
                className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                  active.highlight === 'cu'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 scale-102'
                    : 'bg-black/40 border-neutral-800 text-neutral-400'
                }`}
              >
                <span>CU Control Signal</span>
                <strong>{mode === 'read' ? 'READ: ACTIVE' : 'WRITE: ACTIVE'}</strong>
              </div>
            </div>
          </div>

          {/* Central Bus Interconnect */}
          <div className="md:col-span-4 space-y-3">
            <div
              className={`p-2.5 rounded-xl border text-center transition-all ${
                active.busActive === 'address'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 animate-pulse'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="text-[10px] uppercase font-mono font-bold">Address Bus (Unidirectional)</div>
              <div className="text-xs font-mono mt-0.5">
                {active.busActive === 'address' ? '→ Address [0x2040] flowing →' : 'Idle'}
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border text-center transition-all ${
                active.busActive === 'data'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20 animate-pulse'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="text-[10px] uppercase font-mono font-bold">Data Bus (Bidirectional)</div>
              <div className="text-xs font-mono mt-0.5">
                {active.busActive === 'data'
                  ? mode === 'read'
                    ? '← Data Byte [0x5A] returning to CPU ←'
                    : '→ Data Byte [0x7F] writing into RAM →'
                  : 'Idle'}
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border text-center transition-all ${
                active.busActive === 'control'
                  ? 'bg-sky-950/80 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20 animate-pulse'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="text-[10px] uppercase font-mono font-bold">Control Bus (Timing Pulses)</div>
              <div className="text-xs font-mono mt-0.5">
                {active.busActive === 'control'
                  ? `⚡ ${mode.toUpperCase()} PULSE PULSED ⚡`
                  : 'Clock synchronizing'}
              </div>
            </div>
          </div>

          {/* Primary RAM Grid */}
          <div className="md:col-span-4 rounded-xl bg-neutral-900/90 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-emerald-400 border-b border-neutral-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4" /> RAM Storage Cells
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">1024 Bytes</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-1.5 rounded bg-black/40 border border-neutral-800/80 flex justify-between text-neutral-500 text-[11px]">
                <span>Addr: 0x2038</span>
                <span>Val: 0x12</span>
              </div>
              <div
                className={`p-2 rounded-lg border transition-all flex justify-between text-xs font-bold ${
                  currentStep >= 3
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-black/60 border-neutral-700 text-neutral-300'
                }`}
              >
                <span>Addr: 0x2040 (Target)</span>
                <span>{mode === 'read' ? '0x5A (Read)' : currentStep >= 4 ? '0x7F (Stored)' : '0x00'}</span>
              </div>
              <div className="p-1.5 rounded bg-black/40 border border-neutral-800/80 flex justify-between text-neutral-500 text-[11px]">
                <span>Addr: 0x2048</span>
                <span>Val: 0xFF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Step Explanation Card */}
        <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-300">
              Step {currentStep + 1} of {steps.length}: {active.titleEn} ({active.titleBn})
            </span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed">{active.descEn}</p>
          {lang === 'both' && (
            <p className="text-xs text-violet-300/80 pt-1 border-t border-violet-500/20">
              🇧🇩 {active.descBn}
            </p>
          )}
        </div>
      </div>

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={currentStep === 0}
          onClick={handlePrevStep}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentStep === 0
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300'
          }`}
        >
          ← Previous Tick
        </button>

        <span className="text-xs font-mono text-neutral-400">
          Step {currentStep + 1} / {steps.length}
        </span>

        <button
          type="button"
          disabled={currentStep === steps.length - 1}
          onClick={handleNextStep}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentStep === steps.length - 1
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs active:scale-95'
          }`}
        >
          {currentStep === steps.length - 1 ? 'Cycle Completed ✓' : 'Next Clock Tick →'}
        </button>
      </div>
    </div>
  );
};

export default CpuMemoryCycleSimulator;
