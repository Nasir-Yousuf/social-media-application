import React, { useState } from 'react';
import {
  X,
  User,
  Keyboard,
  HardDrive,
  Cpu,
  Layers,
  Monitor,
  Lightbulb,
  Sparkles,
  Link,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

const COMPONENT_METADATA = {
  operator: {
    id: 'operator',
    name: 'Operator (Human User)',
    bnName: 'অপারেটর (মানুষ / ব্যবহারকারী)',
    icon: User,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    roleBadge: 'User & Origin of Request',
    purpose:
      'Provides the data, commands, and problem statements to be solved, and receives the resulting information back from the computer.',
    howItWorks:
      'The human operator enters keystrokes, voice commands, or mouse clicks. Once the machine finishes processing, the operator visually perceives and interprets the displayed results.',
    analogy:
      'The client who enters an office with a calculation request and waits for the completed report.',
    practicalExample:
      'A student typing "10 + 20" into a calculator application, or a doctor entering patient symptoms into a hospital diagnosis database.',
    relationships: [
      'Initiates Information Flow to the Input Device.',
      'Receives final Output Information from the Output Device.',
      'Does not interact directly with internal CPU registers or Memory addresses.',
    ],
  },

  input: {
    id: 'input',
    name: 'Input Device (Keyboard / Mouse / Scanner)',
    bnName: 'ইনপুট ডিভাইস (কীবোর্ড, মাউস, স্ক্যানার)',
    icon: Keyboard,
    color: 'from-sky-500 to-cyan-600',
    borderColor: 'border-sky-500',
    bgColor: 'bg-sky-500/10',
    textColor: 'text-sky-500',
    roleBadge: 'Data Intake & Binary Encoder',
    purpose:
      'Accepts human-readable data from the operator and translates it into digital binary electrical pulses (0s and 1s) readable by the computer.',
    howItWorks:
      'When you press a key on a keyboard, a microswitch closes an electric circuit. An onboard microcontroller detects the key matrix coordinates and transmits the ASCII/Unicode binary code into an input buffer.',
    analogy:
      'An interpreter or intake clerk who converts a foreign visitor’s spoken language into the office’s official native record book.',
    practicalExample:
      'Typing numbers 10 and 20 on a mechanical keyboard, scanning a barcode in a supermarket, or speaking into a microphone.',
    relationships: [
      'Receives raw physical data from the Operator.',
      'Transfers encoded data directly to Memory along the Information Flow bus.',
      'Receives timing and enable signals from the Control Unit.',
      'CRITICAL: Data never goes directly to the ALU from the input device; it must go to Memory first!',
    ],
  },

  memory: {
    id: 'memory',
    name: 'Memory Unit (Primary Storage / RAM)',
    bnName: 'মেমোরি ইউনিট (প্রাইমারি স্টোরেজ / র‍্যাম)',
    icon: HardDrive,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    roleBadge: 'Central Data Warehouse',
    purpose:
      'Acts as the central holding hub for all active programs, incoming data, intermediate calculation variables, and finalized results.',
    howItWorks:
      'Memory consists of millions of microscopic capacitor-and-transistor cells arranged in sequential hexadecimal addresses (e.g. 0x01, 0x02). Data can be read from or written to any address in nanoseconds.',
    analogy:
      'A huge organized whiteboard or workspace desk where an accountant keeps all the active papers, invoices, and numbers they are currently reviewing.',
    practicalExample:
      'Temporarily storing the numbers 10 (at Address 1) and 20 (at Address 2), and holding the calculated sum 30 before sending it to the screen.',
    relationships: [
      'Receives incoming data from the Input Device.',
      'Maintains a bidirectional information exchange with the ALU (sends operands, receives results).',
      'Feeds finalized output data to the Output Device.',
      'Is commanded and synchronized by the Control Unit.',
    ],
  },

  alu: {
    id: 'alu',
    name: 'Arithmetic & Logic Unit (ALU)',
    bnName: 'অ্যারিথমেটিক অ্যান্ড লজিক ইউনিট (ALU)',
    icon: Cpu,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    roleBadge: 'Mathematical Engine',
    purpose:
      'The execution engine of the computer where all mathematical additions, subtractions, multiplications, divisions, and logical boolean comparisons are executed.',
    howItWorks:
      'Constructed from high-speed semiconductor logic gates (AND, OR, NOT, XOR) and adder circuits. Operands arrive from Memory into input registers, the logic gates resolve within nanoseconds, and the output is placed in the accumulator register.',
    analogy:
      'The expert mathematical clerk who sits at the desk with pencil and paper, executing calculations when commanded by the office manager.',
    practicalExample:
      'Adding 10 + 20 to compute 30, or checking if accountBalance >= withdrawalAmount.',
    relationships: [
      'Connects strictly to Memory via a bidirectional information-flow bus.',
      'Receives function select signals (ADD, SUB, AND, CMP) from the Control Unit.',
      'Does not receive data directly from Input devices, and never writes directly to Output monitors.',
    ],
  },

  controlUnit: {
    id: 'controlUnit',
    name: 'Control Unit (CU)',
    bnName: 'কন্ট্রোল ইউনিট (CU)',
    icon: Layers,
    color: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    roleBadge: 'Master Coordinator & Conductor',
    purpose:
      'Directs and supervises all operations across the computer system. It fetches instructions, decodes what needs to happen, and sends synchronized control pulses to every other unit.',
    howItWorks:
      'Contains an instruction register and a microcode decoder. Driven by the system clock crystal, it pulses control lines (Read, Write, Execute, Enable) to synchronize all internal circuitry.',
    analogy:
      'An orchestra conductor or a traffic police officer standing in a busy four-way intersection directing every vehicle without driving the cars himself.',
    practicalExample:
      'Telling Memory: "Put address 0x01 on the bus now!", telling the ALU: "Execute ADD operation now!", and telling Output: "Render the buffer now!"',
    relationships: [
      'Sends Timing and Control Signals (dashed arrows) to Input Device, Memory, ALU, and Output Device.',
      'Does not store large user data packets or perform arithmetic math directly.',
    ],
  },

  output: {
    id: 'output',
    name: 'Output Device & Display',
    bnName: 'আউটপুট ডিভাইস ও ডিসপ্লে',
    icon: Monitor,
    color: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-500',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    roleBadge: 'Result Presentation & Display',
    purpose:
      'Converts internal binary data results from Memory into human-perceivable visual, printed, or acoustic representations.',
    howItWorks:
      'Reads data from the video buffer or output spooler, transforms binary bits into screen pixel colors, printed toner patterns, or sound wave frequencies.',
    analogy:
      'The customer service window or loudspeaker delivering the finalized report or announcement to the waiting client.',
    practicalExample:
      'Illuminating LED monitor pixels to display "30" on the screen, printing an invoice on paper, or playing an audio chime.',
    relationships: [
      'Receives information-flow data exclusively from Memory.',
      'Delivers physical visual or auditory output to the Operator.',
      'Is enabled and synchronized by the Control Unit.',
    ],
  },
};

export const ComponentDetailsPanel = ({
  componentId,
  onClose,
  lang = 'both',
  currentStepData = null,
}) => {
  // Mini Sandbox State for the active component
  const [sandboxOpA, setSandboxOpA] = useState(15);
  const [sandboxOpB, setSandboxOpB] = useState(25);
  const [sandboxOperation, setSandboxOperation] = useState('+');

  const [sandboxInputText, setSandboxInputText] = useState('HELLO');
  const [sandboxRamCells, setSandboxRamCells] = useState({
    '0x01': 10,
    '0x02': 20,
    '0x03': 30,
  });
  const [selectedAddr, setSelectedAddr] = useState('0x01');
  const [editVal, setEditVal] = useState('42');

  const [cuCycleStep, setCuCycleStep] = useState('FETCH');

  if (!componentId) return null;
  const data = COMPONENT_METADATA[componentId];
  if (!data) return null;

  const Icon = data.icon;

  // Mini ALU Sandbox Calculation
  const getSandboxAluResult = () => {
    const a = Number(sandboxOpA) || 0;
    const b = Number(sandboxOpB) || 0;
    switch (sandboxOperation) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b !== 0 ? Math.round((a / b) * 100) / 100 : 'Div0 Error';
      case 'CMP':
        return a === b ? 'A == B (Equal)' : a > b ? 'A > B (True)' : 'A < B (False)';
      default:
        return a + b;
    }
  };

  return (
    <div
      role="region"
      aria-labelledby="comp-details-heading"
      className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${data.bgColor} ${data.textColor} shadow-xs`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${data.bgColor} ${data.textColor}`}>
                {data.roleBadge}
              </span>
              {currentStepData?.activeNodes?.includes(componentId) && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                  Active in Current Step!
                </span>
              )}
            </div>
            <h3
              id="comp-details-heading"
              className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-0.5"
            >
              {data.name}
            </h3>
            {lang !== 'en' && (
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {data.bnName}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close component details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Structured Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Purpose */}
        <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
            <HelpCircle className="w-4 h-4 text-sky-500" />
            <span>Primary Purpose / মূল উদ্দেশ্য</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11.5px]">
            {data.purpose}
          </p>
        </div>

        {/* How It Works */}
        <div className="space-y-1.5 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
            <Cpu className="w-4 h-4 text-purple-500" />
            <span>How It Operates / কার্যপদ্ধতি</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11.5px]">
            {data.howItWorks}
          </p>
        </div>

        {/* Analogy */}
        <div className="space-y-1.5 bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-800/40">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Beginner Analogy / বাস্তব উপমা</span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed italic text-[11.5px]">
            "{data.analogy}"
          </p>
        </div>

        {/* Practical Example */}
        <div className="space-y-1.5 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Real-World Example / উদাহরণ</span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-[11.5px]">
            {data.practicalExample}
          </p>
        </div>
      </div>

      {/* ========================================================
          LIVE INTERACTIVE COMPONENT TEST BENCH / SANDBOX
         ======================================================== */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-sky-500" />
            <span>Live Interactive Test Bench / লাইভ এক্সপেরিমেন্ট</span>
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            Try It Now
          </span>
        </div>

        {/* 1. ALU Interactive Calculator */}
        {componentId === 'alu' && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Test how the ALU takes two operands from Memory and evaluates mathematical and comparison logic:
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <input
                type="number"
                value={sandboxOpA}
                onChange={(e) => setSandboxOpA(e.target.value)}
                className="w-20 px-2 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold text-center"
              />
              <select
                value={sandboxOperation}
                onChange={(e) => setSandboxOperation(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold"
              >
                <option value="+">+ (ADD)</option>
                <option value="-">- (SUB)</option>
                <option value="*">× (MULT)</option>
                <option value="/">÷ (DIV)</option>
                <option value="CMP">CMP (Compare)</option>
              </select>
              <input
                type="number"
                value={sandboxOpB}
                onChange={(e) => setSandboxOpB(e.target.value)}
                className="w-20 px-2 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold text-center"
              />
              <span className="font-black text-neutral-400">=</span>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-black">
                {getSandboxAluResult()}
              </div>
            </div>
          </div>
        )}

        {/* 2. Memory RAM Workbench */}
        {componentId === 'memory' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-600 dark:text-neutral-400">
              Notice: Memory <strong>holds</strong> values at specific addresses. It does not perform math!
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {Object.entries(sandboxRamCells).map(([addr, val]) => (
                <div
                  key={addr}
                  onClick={() => setSelectedAddr(addr)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all ${
                    selectedAddr === addr
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <span className="text-[10px] text-neutral-400 block">{addr}:</span>
                  <span className="font-black text-sm">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-neutral-500">Edit {selectedAddr}:</span>
              <input
                type="text"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono font-bold"
              />
              <button
                type="button"
                onClick={() =>
                  setSandboxRamCells((prev) => ({
                    ...prev,
                    [selectedAddr]: editVal,
                  }))
                }
                className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-bold cursor-pointer hover:bg-emerald-600"
              >
                Write to RAM
              </button>
            </div>
          </div>
        )}

        {/* 3. Control Unit Cycle Simulator */}
        {componentId === 'controlUnit' && (
          <div className="space-y-3 text-xs">
            <p className="text-neutral-600 dark:text-neutral-400">
              The Control Unit cycles through instruction execution states and sends synchronization pulses:
            </p>
            <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
              {['FETCH', 'DECODE', 'EXECUTE', 'WRITEBACK'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCuCycleStep(st)}
                  className={`p-2 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                    cuCycleStep === st
                      ? 'border-purple-500 bg-purple-500 text-white shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[11px] font-mono">
              {cuCycleStep === 'FETCH' && 'Step 1: Fetch instruction from Memory address bus into the Instruction Register.'}
              {cuCycleStep === 'DECODE' && 'Step 2: Decode opcode (e.g. ADD) to determine control lines to activate.'}
              {cuCycleStep === 'EXECUTE' && 'Step 3: Pulse timing lines to command the ALU to perform the calculation.'}
              {cuCycleStep === 'WRITEBACK' && 'Step 4: Command ALU to store computed result back into Memory destination address.'}
            </div>
          </div>
        )}

        {/* 4. Input Device Live Binary Encoder */}
        {componentId === 'input' && (
          <div className="space-y-2 text-xs">
            <label className="block text-neutral-600 dark:text-neutral-400 font-semibold">
              Type text or numbers to see instant keyboard binary encoding:
            </label>
            <input
              type="text"
              value={sandboxInputText}
              onChange={(e) => setSandboxInputText(e.target.value)}
              maxLength={12}
              className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono font-bold"
            />
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[10px] space-y-1">
              <div>
                ASCII Bytes:{' '}
                {Array.from(sandboxInputText)
                  .map((c) => c.charCodeAt(0))
                  .join(' ')}
              </div>
              <div className="truncate">
                Binary:{' '}
                {Array.from(sandboxInputText)
                  .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
                  .join(' ')}
              </div>
            </div>
          </div>
        )}

        {/* 5. Output Device Rasterizer */}
        {componentId === 'output' && (
          <div className="space-y-2 text-xs">
            <p className="text-neutral-600 dark:text-neutral-400">
              The Output Device translates raw stored binary bytes into visual pixels for the display:
            </p>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-center space-y-1">
              <span className="text-[9px] text-neutral-500 block">VIRTUAL SCREEN BUFFER</span>
              <div className="text-xl font-bold tracking-widest">[ 30 ]</div>
              <span className="text-[8px] text-emerald-600">60 FPS RASTERIZED OUTPUT</span>
            </div>
          </div>
        )}
      </div>

      {/* Relationships with other units */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
          <Link className="w-4 h-4 text-indigo-500" />
          <span>Architectural Bus Relationships / যোগাযোগ নীতি</span>
        </div>
        <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 list-disc list-inside">
          {data.relationships.map((rel, idx) => (
            <li key={idx} className="leading-relaxed">
              {rel}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ComponentDetailsPanel;
