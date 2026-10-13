import React from 'react';
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
} from 'lucide-react';

const COMPONENT_METADATA = {
  operator: {
    id: 'operator',
    name: 'Operator (Human User)',
    bnName: 'অপারেটর (ব্যবহারকারী)',
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
    name: 'Input Device',
    bnName: 'ইনপুট ডিভাইস',
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
    name: 'Memory (Primary Storage)',
    bnName: 'মেমোরি (প্রাইমারি স্টোরেজ)',
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
    name: 'Output Device',
    bnName: 'আউটপুট ডিভাইস',
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
}) => {
  if (!componentId) return null;

  const data = COMPONENT_METADATA[componentId];
  if (!data) return null;

  const Icon = data.icon;

  return (
    <div
      role="region"
      aria-labelledby="comp-details-heading"
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${data.bgColor} ${data.textColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${data.bgColor} ${data.textColor}`}>
                {data.roleBadge}
              </span>
            </div>
            <h3
              id="comp-details-heading"
              className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-0.5"
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
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close component details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Purpose */}
        <div className="space-y-1 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
            <span>Primary Purpose / উদ্দেশ্য</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {data.purpose}
          </p>
        </div>

        {/* How It Works */}
        <div className="space-y-1 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
            <Cpu className="w-3.5 h-3.5 text-purple-500" />
            <span>How It Works / কার্যপদ্ধতি</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {data.howItWorks}
          </p>
        </div>

        {/* Analogy */}
        <div className="space-y-1 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Beginner Analogy / সহজ উপমা</span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
            "{data.analogy}"
          </p>
        </div>

        {/* Practical Example */}
        <div className="space-y-1 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Real-World Example / বাস্তব উদাহরণ</span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {data.practicalExample}
          </p>
        </div>
      </div>

      {/* Relationships */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
          <Link className="w-3.5 h-3.5 text-indigo-500" />
          <span>Relationship to Other Components in the Architecture</span>
        </div>
        <ul className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400 list-disc list-inside">
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
