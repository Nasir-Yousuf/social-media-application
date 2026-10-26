import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileText,
  Cpu,
  Layers,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  HardDrive,
} from 'lucide-react';

export const PrintSpoolerSimulator = ({ lang = 'both' }) => {
  const [spoolingEnabled, setSpoolingEnabled] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [cpuStatus, setCpuStatus] = useState('Idle / Free to run games');
  const [cpuBlocked, setCpuBlocked] = useState(false);
  const [spoolQueue, setSpoolQueue] = useState([]);
  const [printedCount, setPrintedCount] = useState(0);

  const DOCUMENTS = [
    { id: 1, name: 'Web-101-Assignment.pdf', pages: 12 },
    { id: 2, name: 'Research-Report.docx', pages: 8 },
    { id: 3, name: 'Presentation-Slides.pptx', pages: 15 },
  ];

  useEffect(() => {
    let printTimer;
    if (isPrinting && spoolQueue.length > 0) {
      printTimer = setInterval(() => {
        setSpoolQueue((prev) => {
          if (prev.length <= 1) {
            setIsPrinting(false);
            setCpuBlocked(false);
            setCpuStatus('Idle / 100% Free');
            setPrintedCount((c) => c + 1);
            return [];
          }
          setPrintedCount((c) => c + 1);
          return prev.slice(1);
        });
      }, 1200);
    }
    return () => clearInterval(printTimer);
  }, [isPrinting, spoolQueue]);

  const handlePrintAll = () => {
    if (isPrinting) return;

    if (spoolingEnabled) {
      // With Spooling: Queue immediately buffers, CPU stays free!
      setSpoolQueue([...DOCUMENTS]);
      setIsPrinting(true);
      setCpuBlocked(false);
      setCpuStatus('FREE! Playing Minecraft at 144 FPS while Spooler prints in background');
    } else {
      // Without Spooling: CPU is blocked waiting for physical printer
      setSpoolQueue([...DOCUMENTS]);
      setIsPrinting(true);
      setCpuBlocked(true);
      setCpuStatus('FROZEN! CPU is waiting for printer mechanical rollers to finish...');
    }
  };

  const handleReset = () => {
    setIsPrinting(false);
    setCpuBlocked(false);
    setCpuStatus('Idle / Free');
    setSpoolQueue([]);
    setPrintedCount(0);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Interactive Operating Buffer
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 05 · Topic 3.3</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Print Spooling (SPOOL: Simultaneous Peripheral Operations On-Line)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'স্পুলিং কী? কীভাবে ডিস্ক বাফার ব্যবহার করে ধীরগতির প্রিন্টারের অপেক্ষায় পিসি আটকে থাকা রোধ করা হয়।'
              : 'Discover how the background print spooler frees your CPU instantly so your PC never freezes during printing!'}
          </p>
        </div>

        {/* Toggle Mode Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSpoolingEnabled(!spoolingEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              spoolingEnabled
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {spoolingEnabled ? 'SPOOLING: ON (Modern OS)' : 'SPOOLING: OFF (Old DOS)'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visual Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: CPU / User Experience */}
        <div
          className={`md:col-span-4 rounded-2xl p-5 border-2 transition-all space-y-3 ${
            cpuBlocked
              ? 'bg-rose-950/20 border-rose-500/80 text-rose-200'
              : 'bg-teal-950/20 border-teal-500/60 text-teal-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">
              {cpuBlocked ? 'CPU: Completely Frozen' : 'CPU: Running Smoothly'}
            </span>
            <Cpu className={`w-5 h-5 ${cpuBlocked ? 'text-rose-500 animate-spin' : 'text-teal-400 animate-pulse'}`} />
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs font-mono">
            <div className="text-[10px] text-neutral-400 mb-1">Current State:</div>
            <p className={cpuBlocked ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {cpuStatus}
            </p>
          </div>

          <button
            type="button"
            disabled={isPrinting}
            onClick={handlePrintAll}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer ${
              isPrinting
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:scale-[1.02]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Print 3 Large Documents (35 Pages)</span>
          </button>
        </div>

        {/* Center: Spool Buffer Vault (Hard Drive) */}
        <div className="md:col-span-4 rounded-2xl bg-neutral-950 p-5 border border-neutral-800 text-white space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-sky-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" /> Spool Queue on Disk
            </span>
            <span className="text-[10px] font-mono">{spoolQueue.length} Jobs Waiting</span>
          </div>

          {spoolingEnabled ? (
            <div className="space-y-1.5 min-h-[110px]">
              {spoolQueue.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-500 font-mono">
                  Queue is empty. Click Print!
                </div>
              ) : (
                spoolQueue.map((doc, dIdx) => (
                  <div
                    key={doc.id}
                    className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/30 text-xs font-mono flex items-center justify-between"
                  >
                    <span className="truncate max-w-[150px]">{doc.name}</span>
                    <span className="text-[10px] text-sky-300 font-bold">{doc.pages} pgs</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 font-mono text-center">
              SPOOLING DISABLED! No buffer exists. All data directly ties up the CPU bus!
            </div>
          )}
        </div>

        {/* Right: Physical Mechanical Printer */}
        <div className="md:col-span-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 text-white space-y-3 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
            <Printer className={`w-6 h-6 ${isPrinting ? 'animate-bounce text-emerald-400' : ''}`} />
          </div>

          <div>
            <h4 className="text-sm font-bold">Physical Printer</h4>
            <p className="text-[11px] text-neutral-400 font-mono">Slow Mechanical Speed: 15 PPM</p>
          </div>

          <div className="text-xs font-mono p-2 rounded-lg bg-black/40 text-emerald-400 border border-neutral-800">
            {isPrinting ? 'Printing page...' : 'Ready for paper'}
          </div>
        </div>
      </div>

      {/* The Analogy Banner */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs space-y-1.5">
        <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span>The Waiter & Kitchen Tray Analogy / সহজ উপমা</span>
        </div>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
          Imagine a superfast restaurant chef (the CPU). If the chef has to personally walk over to the customer's table, sit down, and feed them each spoonful slowly (Without Spooling), the entire restaurant stops! With **Spooling**, the chef puts all the cooked plates onto a warming tray (**Spool Buffer**). The waiter delivers them slowly, while the chef immediately starts cooking the next delicious dish!
        </p>
      </div>
    </div>
  );
};

export default PrintSpoolerSimulator;
