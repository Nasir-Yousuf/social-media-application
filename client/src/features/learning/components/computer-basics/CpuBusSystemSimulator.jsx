import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ArrowRight,
  ArrowLeftRight,
  Zap,
  Activity,
  RotateCcw,
  Layers,
  Database,
  Radio,
} from 'lucide-react';

export const CpuBusSystemSimulator = ({ lang = 'both' }) => {
  const [busWidth, setBusWidth] = useState(16); // 16-bit, 32-bit, 64-bit
  const [clockSpeed, setClockSpeed] = useState(2.4); // GHz
  const [activeSignal, setActiveSignal] = useState(null); // 'read' | 'write' | null
  const [pulsePosition, setPulsePosition] = useState(0); // 0 to 100%
  const [transferredData, setTransferredData] = useState('0x4A (74)');
  const [transferredAddress, setTransferredAddress] = useState('0x00FF');
  const [historyLog, setHistoryLog] = useState([
    'System ready. Clock pulse synchronizing at 2.4 GHz.',
  ]);

  // Max addressable memory formula: 2^n
  const maxMemoryText =
    busWidth === 16
      ? '64 KB (2¹⁶ = 65,536 addresses)'
      : busWidth === 32
      ? '4 GB (2³² = 4,294,967,296 addresses)'
      : '16 EB (Exabytes! 2⁶⁴ addresses)';

  useEffect(() => {
    let animId;
    if (activeSignal) {
      const startTime = performance.now();
      const duration = 1400; // ms

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setPulsePosition(progress * 100);

        if (progress < 1) {
          animId = requestAnimationFrame(step);
        } else {
          setActiveSignal(null);
          setPulsePosition(0);
        }
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [activeSignal]);

  const handleTriggerRead = () => {
    if (activeSignal) return;
    const addr = '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const val = '0x' + Math.floor(Math.random() * 0xff).toString(16).toUpperCase().padStart(2, '0');
    setTransferredAddress(addr);
    setTransferredData(val);
    setActiveSignal('read');
    setHistoryLog((prev) => [
      `[READ] CPU sent Address ${addr} on Address Bus. Control Bus pulsed READ signal. Memory returned ${val} on Data Bus.`,
      ...prev.slice(0, 4),
    ]);
  };

  const handleTriggerWrite = () => {
    if (activeSignal) return;
    const addr = '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const val = '0x' + Math.floor(Math.random() * 0xff).toString(16).toUpperCase().padStart(2, '0');
    setTransferredAddress(addr);
    setTransferredData(val);
    setActiveSignal('write');
    setHistoryLog((prev) => [
      `[WRITE] CPU sent Address ${addr} on Address Bus, placed Data ${val} on Data Bus. Control Bus pulsed WRITE pulse.`,
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Interactive Hardware Simulation
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 02 · Topic 3.4</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            The Computer Bus Highway (Address, Data & Control)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'কম্পিউটারের ৩টি বাস হাইওয়ে: এড্রেস বাস (একমুখী), ডাটা বাস (দ্বিমুখী), এবং কন্ট্রোল বাস (সিঙ্ক্রোনাইজিং পালস)।'
              : 'Witness the 3-lane copper highway connecting CPU, Memory, and Devices. Test Read and Write cycles live!'}
          </p>
        </div>

        {/* Bus Width Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          {[16, 32, 64].map((width) => (
            <button
              key={width}
              onClick={() => setBusWidth(width)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                busWidth === width
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {width}-bit Bus
            </button>
          ))}
        </div>
      </div>

      {/* Main Highway Canvas */}
      <div className="relative rounded-2xl bg-neutral-950 p-5 sm:p-7 border border-neutral-800 text-white overflow-hidden">
        {/* Subtle background circuit grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* LEFT: CPU Block */}
          <div className="md:col-span-3 rounded-2xl bg-gradient-to-br from-indigo-950 to-neutral-900 border-2 border-indigo-500/60 p-4 text-center space-y-2 shadow-lg shadow-indigo-500/10">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Central Processing Unit</h4>
              <p className="text-[11px] text-indigo-300 font-mono">CPU Core @ {clockSpeed} GHz</p>
            </div>
            <div className="text-[10px] bg-black/40 rounded-lg p-2 font-mono text-left space-y-1 text-neutral-300 border border-neutral-800">
              <div>MAR: <span className="text-amber-400">{transferredAddress}</span></div>
              <div>MDR/MBR: <span className="text-emerald-400">{transferredData}</span></div>
            </div>
          </div>

          {/* CENTER: The 3 Bus Lanes */}
          <div className="md:col-span-6 space-y-4">
            {/* Lane 1: Address Bus */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 relative">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Address Bus ({busWidth}-bit)
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Unidirectional (CPU → RAM)
                </span>
              </div>
              <div className="h-6 rounded-lg bg-black/60 border border-amber-500/30 relative overflow-hidden flex items-center px-3">
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-amber-500/60">
                  <span>CPU Pin</span>
                  <span>Target Address: {transferredAddress}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </div>
                {activeSignal && (
                  <div
                    className="absolute top-1 bottom-1 w-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-200 blur-[2px] transition-all shadow-md shadow-amber-400"
                    style={{ left: `${pulsePosition * 0.9}%` }}
                  />
                )}
              </div>
            </div>

            {/* Lane 2: Data Bus */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 relative">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Data Bus ({busWidth}-bit)
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ArrowLeftRight className="w-2.5 h-2.5" /> Bidirectional
                </span>
              </div>
              <div className="h-6 rounded-lg bg-black/60 border border-emerald-500/30 relative overflow-hidden flex items-center px-3">
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-emerald-500/60">
                  <span>Byte Port</span>
                  <span>Data Packet: {transferredData}</span>
                  <span>RAM Port</span>
                </div>
                {activeSignal && (
                  <div
                    className="absolute top-1 bottom-1 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-200 blur-[2px] transition-all shadow-md shadow-emerald-400"
                    style={{
                      left:
                        activeSignal === 'read'
                          ? `${(100 - pulsePosition) * 0.9}%`
                          : `${pulsePosition * 0.9}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Lane 3: Control Bus */}
            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/40 relative">
              <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Control Bus (Timing & Signals)
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Clock & Commands (READ / WRITE)
                </span>
              </div>
              <div className="h-6 rounded-lg bg-black/60 border border-sky-500/30 relative overflow-hidden flex items-center px-3">
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-sky-500/60">
                  <span>Control Signal</span>
                  <span className="font-bold text-sky-300">
                    {activeSignal ? activeSignal.toUpperCase() + ' PULSE ACTIVE' : 'SYSTEM CLOCK IDLE'}
                  </span>
                  <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                </div>
                {activeSignal && (
                  <div
                    className="absolute top-1 bottom-1 w-8 rounded-full bg-gradient-to-r from-sky-400 to-cyan-200 blur-[2px] transition-all shadow-md shadow-sky-400"
                    style={{ left: `${pulsePosition * 0.9}%` }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Primary Memory / RAM Block */}
          <div className="md:col-span-3 rounded-2xl bg-gradient-to-br from-emerald-950 to-neutral-900 border-2 border-emerald-500/60 p-4 text-center space-y-2 shadow-lg shadow-emerald-500/10">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Main Memory (RAM)</h4>
              <p className="text-[11px] text-emerald-300 font-mono">Address Decoder Matrix</p>
            </div>
            <div className="text-[10px] bg-black/40 rounded-lg p-2 font-mono text-left space-y-1 text-neutral-300 border border-neutral-800">
              <div>Decoded: <span className="text-amber-300">{transferredAddress}</span></div>
              <div>Stored Val: <span className="text-emerald-300">{transferredData}</span></div>
            </div>
          </div>
        </div>

        {/* Dynamic Bus Math Banner */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-neutral-300">
              Max Addressable Space for <strong>{busWidth}-bit</strong> Bus:
            </span>
            <span className="font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {maxMemoryText}
            </span>
          </div>
          <span className="text-neutral-400 text-[11px]">
            Formula: <code>2^(Bus Width) = Total RAM Bytes</code>
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!!activeSignal}
            onClick={handleTriggerRead}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
              activeSignal
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs active:scale-95'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Simulate Memory READ Cycle (CPU ← RAM)</span>
          </button>

          <button
            type="button"
            disabled={!!activeSignal}
            onClick={handleTriggerWrite}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
              activeSignal
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Memory WRITE Cycle (CPU → RAM)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setHistoryLog(['System bus refreshed. Ready for commands.']);
          }}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Log</span>
        </button>
      </div>

      {/* Live Transaction Log */}
      <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 p-3 space-y-1.5 font-mono text-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          <span>Bus Activity Monitor / ট্রান্সফার লগ</span>
        </div>
        {historyLog.map((log, idx) => (
          <div key={idx} className="text-[11px] text-neutral-700 dark:text-neutral-300">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CpuBusSystemSimulator;
