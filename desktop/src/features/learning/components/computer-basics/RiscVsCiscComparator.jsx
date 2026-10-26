import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  BatteryCharging,
  Cpu,
  Layers,
} from 'lucide-react';

export const RiscVsCiscComparator = ({ lang = 'both' }) => {
  const [isRacing, setIsRacing] = useState(false);
  const [riscCycle, setRiscCycle] = useState(0);
  const [ciscCycle, setCiscCycle] = useState(0);
  const [riscCompleted, setRiscCompleted] = useState(false);
  const [ciscCompleted, setCiscCompleted] = useState(false);

  // RISC has 4 simple, uniform single-cycle instructions
  const RISC_STEPS = [
    { name: 'LOAD R1, [Addr A]', desc: 'Cycle 1: Load 1st number into register', time: 1 },
    { name: 'LOAD R2, [Addr B]', desc: 'Cycle 2: Load 2nd number into register', time: 2 },
    { name: 'ADD R1, R2, R3', desc: 'Cycle 3: Single-cycle ALU execution', time: 3 },
    { name: 'STORE R3, [Addr C]', desc: 'Cycle 4: Save answer to memory', time: 4 },
  ];

  // CISC has 1 complex instruction, but internally requires 6 microcode cycles
  const CISC_STEPS = [
    { name: 'DECODE COMPLEX OP', desc: 'Cycle 1: Microcode decoder translates instruction', time: 1 },
    { name: 'CALCULATE ADDR A', desc: 'Cycle 2: Resolve complex memory addressing mode', time: 2 },
    { name: 'FETCH MEMORY VAL', desc: 'Cycle 3: Wait for RAM read bus', time: 3 },
    { name: 'ALU EXECUTION', desc: 'Cycle 4: Execute multi-cycle arithmetic', time: 4 },
    { name: 'CALCULATE ADDR C', desc: 'Cycle 5: Resolve target address', time: 5 },
    { name: 'WRITE RESULT', desc: 'Cycle 6: Commit back to memory', time: 6 },
  ];

  useEffect(() => {
    let timer;
    if (isRacing) {
      timer = setInterval(() => {
        setRiscCycle((prev) => {
          if (prev >= 4) {
            setRiscCompleted(true);
            return 4;
          }
          return prev + 1;
        });

        setCiscCycle((prev) => {
          if (prev >= 6) {
            setCiscCompleted(true);
            return 6;
          }
          return prev + 1;
        });
      }, 550);
    }
    return () => clearInterval(timer);
  }, [isRacing]);

  useEffect(() => {
    if (riscCompleted && ciscCompleted) {
      setIsRacing(false);
    }
  }, [riscCompleted, ciscCompleted]);

  const handleStartRace = () => {
    setRiscCycle(0);
    setCiscCycle(0);
    setRiscCompleted(false);
    setCiscCompleted(false);
    setIsRacing(true);
  };

  const handleReset = () => {
    setIsRacing(false);
    setRiscCycle(0);
    setCiscCycle(0);
    setRiscCompleted(false);
    setCiscCompleted(false);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Interactive Architectural Battle
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 02 · Topic 3.2</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            RISC vs CISC Architecture Race (The Sprinter vs The Giant)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'রিস্ক (RISC - স্মার্টফোন/ARM) বনাম সিস্ক (CISC - ডেস্কটপ x86): নির্দেশনার দৈর্ঘ্য, সাইকেল ও কার্যকর গতির তুলনা।'
              : 'Watch how RISC completes streamlined 1-cycle commands while CISC handles heavy multi-cycle instructions!'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRacing}
            onClick={handleStartRace}
            className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
              isRacing
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{riscCompleted ? 'Re-run Benchmark Race' : 'Start Instruction Race'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The 2 Racetracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Track 1: RISC (Reduced Instruction Set Computer) */}
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  RISC (Reduced Instruction Set)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ARM, Apple M-Series, PowerPC
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Under 200 simple instructions. Fixed 32-bit length. 1 clock cycle per step.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              ⚡
            </div>
          </div>

          {/* Visual Instruction Pipeline */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 flex items-center justify-between">
              <span>Instruction Execution (4 Cycles total):</span>
              <span className="text-emerald-600 dark:text-emerald-400">{riscCycle} / 4 Cycles</span>
            </div>

            <div className="space-y-1.5">
              {RISC_STEPS.map((step, idx) => {
                const isCurrent = riscCycle === idx + 1;
                const isDone = riscCycle > idx;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-[1.02]'
                        : 'bg-white/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-black/10">
                        {idx + 1}
                      </span>
                      <span>{step.name}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] opacity-75">1 cycle</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Specs Footer */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-center text-[10px] font-mono">
            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-neutral-400 block">Length</span>
              <strong className="text-emerald-600 dark:text-emerald-400">Fixed (32-bit)</strong>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-neutral-400 block">Power</span>
              <strong className="text-emerald-600 dark:text-emerald-400">Ultra-Low 🔋</strong>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-neutral-400 block">Transistors</span>
              <strong className="text-emerald-600 dark:text-emerald-400">Simpler Design</strong>
            </div>
          </div>
        </div>

        {/* Track 2: CISC (Complex Instruction Set Computer) */}
        <div className="rounded-2xl border-2 border-sky-500/50 bg-sky-50/20 dark:bg-sky-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  CISC (Complex Instruction Set)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  Intel Core, AMD Ryzen (x86)
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                200–300+ instructions. Variable length (1 to 15 bytes). Complex microcode.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              🛠️
            </div>
          </div>

          {/* Visual Instruction Pipeline */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 flex items-center justify-between">
              <span>Microcode Breakdown (6 Cycles total):</span>
              <span className="text-sky-600 dark:text-sky-400">{ciscCycle} / 6 Cycles</span>
            </div>

            <div className="space-y-1.5">
              {CISC_STEPS.map((step, idx) => {
                const isCurrent = ciscCycle === idx + 1;
                const isDone = ciscCycle > idx;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                      isDone
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300'
                        : isCurrent
                        ? 'bg-sky-500 border-sky-600 text-white shadow-md shadow-sky-500/30 scale-[1.02]'
                        : 'bg-white/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-black/10">
                        {idx + 1}
                      </span>
                      <span>{step.name}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-sky-500" />
                    ) : (
                      <span className="text-[10px] opacity-75">Multi-step</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Specs Footer */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sky-500/20 text-center text-[10px] font-mono">
            <div className="p-2 rounded-lg bg-sky-500/5 border border-sky-500/10">
              <span className="text-neutral-400 block">Length</span>
              <strong className="text-sky-600 dark:text-sky-400">Variable (8-120b)</strong>
            </div>
            <div className="p-2 rounded-lg bg-sky-500/5 border border-sky-500/10">
              <span className="text-neutral-400 block">Power</span>
              <strong className="text-sky-600 dark:text-sky-400">Higher Heat 🔥</strong>
            </div>
            <div className="p-2 rounded-lg bg-sky-500/5 border border-sky-500/10">
              <span className="text-neutral-400 block">Transistors</span>
              <strong className="text-sky-600 dark:text-sky-400">Dense Hardware</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Breakdown Summary Table */}
      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" />
          <span>Key Exam Differences at a Glance / পরীক্ষার জন্য জরুরি তুলনা</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400">
                <th className="py-1.5 font-bold">Feature / বৈশিষ্ট্য</th>
                <th className="py-1.5 font-bold text-emerald-600 dark:text-emerald-400">RISC</th>
                <th className="py-1.5 font-bold text-sky-600 dark:text-sky-400">CISC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-neutral-600 dark:text-neutral-300">
              <tr>
                <td className="py-1.5 font-medium">Instruction Count</td>
                <td className="py-1.5 font-mono text-emerald-600 dark:text-emerald-400">Under 200</td>
                <td className="py-1.5 font-mono text-sky-600 dark:text-sky-400">200 to 300+</td>
              </tr>
              <tr>
                <td className="py-1.5 font-medium">Instruction Length</td>
                <td className="py-1.5">Fixed (uniform size)</td>
                <td className="py-1.5">Variable length</td>
              </tr>
              <tr>
                <td className="py-1.5 font-medium">Execution Speed</td>
                <td className="py-1.5 font-semibold text-emerald-600 dark:text-emerald-400">Faster, 1-cycle pipelining</td>
                <td className="py-1.5">Multiple clock cycles</td>
              </tr>
              <tr>
                <td className="py-1.5 font-medium">Hardware Design</td>
                <td className="py-1.5">Simple, low silicon cost</td>
                <td className="py-1.5">Complex microcode control</td>
              </tr>
              <tr>
                <td className="py-1.5 font-medium">Modern Devices</td>
                <td className="py-1.5">iPhones, Androids, M1/M2/M3 Macs</td>
                <td className="py-1.5">Windows Gaming PCs, Enterprise Servers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiscVsCiscComparator;
