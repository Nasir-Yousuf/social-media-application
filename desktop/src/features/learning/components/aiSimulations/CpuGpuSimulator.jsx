import React, { useState } from 'react';
import { Play, RotateCcw, Cpu, Zap, CheckCircle2 } from 'lucide-react';

export default function CpuGpuSimulator() {
  const [taskCount, setTaskCount] = useState(16);
  const [cpuRunning, setCpuRunning] = useState(false);
  const [gpuRunning, setGpuRunning] = useState(false);
  const [cpuProgress, setCpuProgress] = useState(0);
  const [gpuProgress, setGpuProgress] = useState(Array(16).fill(0));
  const [cpuTime, setCpuTime] = useState(null);
  const [gpuTime, setGpuTime] = useState(null);

  const runCpuSimulation = () => {
    setCpuRunning(true);
    setCpuProgress(0);
    setCpuTime(null);
    const startTime = performance.now();
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      setCpuProgress(current);
      if (current >= taskCount) {
        clearInterval(interval);
        setCpuRunning(false);
        setCpuTime(((performance.now() - startTime) / 1000).toFixed(2));
      }
    }, 150);
  };

  const runGpuSimulation = () => {
    setGpuRunning(true);
    setGpuProgress(Array(taskCount).fill(0));
    setGpuTime(null);
    const startTime = performance.now();
    let progress = 0;

    const interval = setInterval(() => {
      progress += 25;
      setGpuProgress(Array(taskCount).fill(progress));
      if (progress >= 100) {
        clearInterval(interval);
        setGpuRunning(false);
        setGpuTime(((performance.now() - startTime) / 1000).toFixed(2));
      }
    }, 150);
  };

  const resetAll = () => {
    setCpuRunning(false);
    setGpuRunning(false);
    setCpuProgress(0);
    setGpuProgress(Array(taskCount).fill(0));
    setCpuTime(null);
    setGpuTime(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Zap className="w-6 h-6" />
            Interactive Hardware Simulator: CPU vs. GPU Workload
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Observe how a CPU executes matrix tasks one-by-one sequentially, while a GPU processes thousands in parallel simultaneously!
          </p>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPU Section */}
        <div className="bg-slate-950/70 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sky-400 font-semibold">
                <Cpu className="w-5 h-5" />
                <span>CPU (Sequential 4 Heavy Cores)</span>
              </div>
              {cpuTime && (
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-1 rounded font-mono">
                  Time: {cpuTime}s
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Processes 1 task at a time per core. Great for complex decision logic, slow for massive matrix math.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: taskCount }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-10 rounded-lg flex items-center justify-center font-mono text-xs transition-all duration-200 ${
                    idx < cpuProgress
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                      : idx === cpuProgress && cpuRunning
                      ? 'bg-amber-500 animate-pulse text-slate-900 font-bold'
                      : 'bg-slate-900 text-slate-600 border border-slate-800'
                  }`}
                >
                  {idx < cpuProgress ? <CheckCircle2 className="w-4 h-4" /> : `T-${idx + 1}`}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={runCpuSimulation}
            disabled={cpuRunning}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Run CPU Workload
          </button>
        </div>

        {/* GPU Section */}
        <div className="bg-slate-950/70 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Zap className="w-5 h-5" />
                <span>GPU (Thousands of Parallel Tensor Cores)</span>
              </div>
              {gpuTime && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-mono">
                  Time: {gpuTime}s
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Executes all 16 matrix calculations simultaneously in parallel! Ideal for AI model training.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {gpuProgress.map((prog, idx) => (
                <div
                  key={idx}
                  className={`h-10 rounded-lg flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                    prog === 100
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : gpuRunning
                      ? 'bg-emerald-600/60 animate-pulse text-white'
                      : 'bg-slate-900 text-slate-600 border border-slate-800'
                  }`}
                >
                  {prog === 100 ? <CheckCircle2 className="w-4 h-4" /> : `Core-${idx + 1}`}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={runGpuSimulation}
            disabled={gpuRunning}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Run Parallel GPU Workload
          </button>
        </div>
      </div>
    </div>
  );
}
