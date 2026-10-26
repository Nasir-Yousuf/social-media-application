import React, { useState } from 'react';
import {
  Keyboard,
  Cpu,
  Zap,
  Activity,
  RotateCcw,
  Sparkles,
  Terminal,
  Layers,
} from 'lucide-react';

const SCAN_CODES = {
  A: { scan: '0x1E', ascii: 65, char: 'A' },
  B: { scan: '0x30', ascii: 66, char: 'B' },
  C: { scan: '0x2E', ascii: 67, char: 'C' },
  D: { scan: '0x20', ascii: 68, char: 'D' },
  E: { scan: '0x12', ascii: 69, char: 'E' },
  K: { scan: '0x25', ascii: 75, char: 'K' },
  M: { scan: '0x32', ascii: 77, char: 'M' },
  W: { scan: '0x11', ascii: 87, char: 'W' },
  SPACE: { scan: '0x39', ascii: 32, char: ' ' },
  ENTER: { scan: '0x1C', ascii: 13, char: '\n' },
};

export const KeyboardInterruptSimulator = ({ lang = 'both' }) => {
  const [typedScreen, setTypedScreen] = useState('HELLO');
  const [activeKey, setActiveKey] = useState(null);
  const [buffer, setBuffer] = useState(['0x1E', '0x12', '0x26', '0x26', '0x18']); // Scan codes
  const [irqActive, setIrqActive] = useState(false);
  const [lastEvent, setLastEvent] = useState({
    key: 'O',
    scan: '0x18',
    ascii: 79,
    irq: 'IRQ 1',
  });

  const handleKeyPress = (keyName) => {
    const info = SCAN_CODES[keyName] || {
      scan: '0x' + Math.floor(Math.random() * 80).toString(16).toUpperCase(),
      ascii: keyName.charCodeAt(0) || 63,
      char: keyName,
    };

    setActiveKey(keyName);
    setIrqActive(true);
    setLastEvent({
      key: keyName,
      scan: info.scan,
      ascii: info.ascii,
      irq: 'IRQ 1 (Hardware Interrupt)',
    });

    // Add to circular buffer
    setBuffer((prev) => [...prev.slice(-5), info.scan]);

    // Update screen
    if (keyName === 'ENTER') {
      setTypedScreen((prev) => prev + '\n');
    } else if (keyName === 'SPACE') {
      setTypedScreen((prev) => prev + ' ');
    } else {
      setTypedScreen((prev) => (prev.length > 24 ? prev.slice(1) : prev) + info.char);
    }

    // Reset pulse
    setTimeout(() => {
      setIrqActive(false);
      setActiveKey(null);
    }, 450);
  };

  const handleClear = () => {
    setTypedScreen('');
    setBuffer([]);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Interactive Peripheral & IRQ Simulator
            </span>
            <span className="text-xs text-neutral-400 font-mono">Lecture 04 · Topic 2.2</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Keyboard Mechanics & The Hardware Interrupt (IRQ 1)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lang === 'bn'
              ? 'বাটন চাপলে কীভাবে সুইচ বন্ধ হয়, স্ক্যান কোড বাফারে জমা হয় এবং সিপিইউ-তে IRQ 1 ইন্টারাপ্ট সিগন্যাল ছোটে।'
              : 'Press keys to watch the matrix switch close, scan code buffer fill, and IRQ 1 interrupt fire!'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Screen</span>
        </button>
      </div>

      {/* Interactive Visual Circuit Highway */}
      <div className="rounded-2xl bg-neutral-950 p-6 border border-neutral-800 text-white space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* STEP 1: Keyboard Key Switch Matrix */}
          <div className="md:col-span-4 rounded-xl bg-neutral-900/90 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-amber-400 border-b border-neutral-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-4 h-4" /> 1. Key Matrix Switch
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Mechanical / Membrane</span>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Click keys below to close the electrical matrix circuit:
            </p>

            {/* Virtual Key Buttons */}
            <div className="grid grid-cols-4 gap-1.5 font-mono text-xs font-bold">
              {['W', 'A', 'S', 'D', 'E', 'B', 'C', 'M'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    activeKey === k
                      ? 'bg-amber-500 border-amber-300 text-black scale-95 shadow-md shadow-amber-500/50'
                      : 'bg-neutral-800/80 border-neutral-700 text-white hover:bg-neutral-700'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs font-bold">
              <button
                onClick={() => handleKeyPress('SPACE')}
                className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 cursor-pointer text-center text-[10px]"
              >
                [ SPACE ]
              </button>
              <button
                onClick={() => handleKeyPress('ENTER')}
                className="p-2 rounded-lg bg-amber-600/80 border border-amber-500/50 text-white hover:bg-amber-600 cursor-pointer text-center text-[10px]"
              >
                ENTER ↵
              </button>
            </div>
          </div>

          {/* STEP 2: Controller & Buffer & IRQ 1 Line */}
          <div className="md:col-span-4 space-y-3">
            {/* Keyboard Controller */}
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1 text-center font-mono">
              <span className="text-[10px] text-neutral-400 uppercase">2. Keyboard Controller Chip</span>
              <div className="text-xs text-amber-300 font-bold">
                Scan Code: {lastEvent.scan} | ASCII: {lastEvent.ascii}
              </div>
            </div>

            {/* IRQ Interrupt Pulse Wire */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                irqActive
                  ? 'bg-rose-950 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/30 scale-102'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="text-[10px] uppercase font-mono font-bold flex items-center justify-center gap-1.5">
                <Zap className={`w-3.5 h-3.5 ${irqActive ? 'text-rose-400 animate-bounce' : 'text-neutral-600'}`} />
                3. Hardware Interrupt: IRQ 1
              </div>
              <div className="text-[11px] font-mono mt-0.5">
                {irqActive ? '⚡ IRQ 1 SIGNAL SENT TO CPU ⚡' : 'Interrupt line idle'}
              </div>
            </div>

            {/* 16-Byte Circular Keyboard Buffer */}
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                <span>Circular Buffer in RAM:</span>
                <span className="text-emerald-400">{buffer.length} / 16 bytes</span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
                {buffer.map((sc, bIdx) => (
                  <span
                    key={bIdx}
                    className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0"
                  >
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: CPU ISR & Virtual Display */}
          <div className="md:col-span-4 rounded-xl bg-neutral-900/90 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-emerald-400 border-b border-neutral-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> 4. CPU & Display Screen
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Interrupt Routine</span>
            </div>

            <div className="rounded-lg bg-black p-3 border border-neutral-800 min-h-[90px] font-mono text-emerald-400 text-xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 pb-1 border-b border-neutral-900">
                <Terminal className="w-3 h-3 text-emerald-500" />
                <span>Virtual Monitor Display:</span>
              </div>
              <div className="text-sm font-bold tracking-wider whitespace-pre-wrap py-2">
                {typedScreen || <span className="text-neutral-700 italic">Press any key above...</span>}
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
              </div>
              <span className="text-[9px] text-neutral-600">ISR handles scan code into glyph</span>
            </div>
          </div>
        </div>
      </div>

      {/* Did You Know Banner */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 space-y-1 text-xs">
        <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Why is this called an "Interrupt"? (The Teacher Analogy)</span>
        </div>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
          The CPU is doing billions of math operations every second. It doesn't waste time checking if you pressed a key! Instead, when you press a key, the keyboard controller raises its hand (**Interrupt Request - IRQ 1**) like a student in a classroom. The CPU pauses for a microsecond, grabs the letter, and immediately goes back to its math!
        </p>
      </div>
    </div>
  );
};

export default KeyboardInterruptSimulator;
