import React, { useState } from 'react';
import {
  Keyboard,
  HardDrive,
  Cpu,
  Layers,
  Monitor,
  Zap,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Info,
  Radio,
  Sliders,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

/**
 * FiveUnitsHubVisualizer
 * Faithful, award-winning interactive recreation of the textbook diagram:
 * "Figure: Functional block diagram of a typical computer"
 * 
 * Features:
 * - Map-style interactive floating popover/tooltip right beside the hovered component
 * - Side-by-side desktop layout at eye level (no scrolling to the far bottom!)
 * - Ultra-smooth micro-transitions (fade, scale, color transitions)
 * - Compact efficient summary on hover + full expandable deep-dive
 * - Real-time animated electrical signals on solid red data paths & blue dashed control lines
 */
export const FiveUnitsHubVisualizer = ({ lang = 'both' }) => {
  // Currently hovered or pinned component: 'alu' | 'memory' | 'cu' | 'input' | 'output' | 'cpu' | null
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [pinnedUnit, setPinnedUnit] = useState('alu'); // Default to ALU so inspector is never blank

  // Animation playback state
  const [isFlowActive, setIsFlowActive] = useState(true);
  const [flowSpeed, setFlowSpeed] = useState(1); // 0.5x, 1x, 2x

  const activeUnit = hoveredUnit || pinnedUnit;

  // Metadata for all components
  const COMPONENT_INFO = {
    alu: {
      id: 'alu',
      name: 'ALU (Arithmetic & Logic Unit)',
      bnName: 'অ্যারিথমেটিক অ্যান্ড লজিক ইউনিট (ALU)',
      tag: 'Mathematical Engine',
      color: 'amber',
      accentColor: '#f59e0b',
      glowClass: 'shadow-amber-500/30 border-amber-500',
      shortSummary: 'Executes all math (+, -, ×, ÷) & true/false logic decisions.',
      shortSummaryBn: 'সব ধরনের গাণিতিক হিসাব এবং সত্য/মিথ্যা যৌক্তিক সিদ্ধান্ত নেয়।',
      tooltipPos: { top: '15%', left: '68%' },
      quickSignals: {
        inData: 'Operands from Memory (↑)',
        outData: 'Result to Memory (↓)',
        control: 'Command from CU (Right)',
      },
      description:
        'The ALU performs all arithmetic calculations (addition, subtraction, multiplication, division) and logical comparisons (like age >= 18).',
      descriptionBn:
        'এএলইউ (ALU) কম্পিউটারের সমস্ত গাণিতিক হিসাব-নিকাশ (যোগ, বিয়োগ, গুণ, ভাগ) এবং লজিক্যাল সত্য/মিথ্যা তুলনা সম্পন্ন করে।',
      signalsIn: [
        {
          label: 'Operands from Memory (Red Upward Line)',
          desc: 'Numbers waiting to be calculated (e.g. 10 and 20) travel upward from Memory into ALU input registers.',
          direction: 'Memory ──↑──> ALU',
          type: 'data',
        },
        {
          label: 'Control Command from CU (Blue Dashed Line)',
          desc: 'The Control Unit sends an electrical command pulse (ADD, SUB) up the right-hand bus line.',
          direction: 'Control Unit ──↑──> ALU',
          type: 'control',
        },
      ],
      signalsOut: [
        {
          label: 'Calculated Result to Memory (Red Downward Line)',
          desc: 'The finalized answer (e.g. 30) travels downward from the ALU accumulator back into Memory addresses.',
          direction: 'ALU ──↓──> Memory',
          type: 'data',
        },
      ],
      crucialRule:
        'CRITICAL RULE: The ALU NEVER connects directly to input keyboards or output monitors! It only reads from and writes to Memory.',
      crucialRuleBn:
        'জরুরি নিয়ম: ALU কখনোই সরাসরি কীবোর্ড বা মনিটরের সাথে যোগাযোগ করে না! এটি সর্বদা মেমোরির মাধ্যমেই কাজ করে।',
    },

    memory: {
      id: 'memory',
      name: 'Memory Unit (Primary Storage / RAM)',
      bnName: 'মেমোরি ইউনিট (প্রাইমারি স্টোরেজ / র‍্যাম)',
      tag: 'Central Data Warehouse',
      color: 'emerald',
      accentColor: '#10b981',
      glowClass: 'shadow-emerald-500/30 border-emerald-500',
      shortSummary: 'Temporarily holds active data, variables, and waiting results.',
      shortSummaryBn: 'চলমান সফটওয়্যার, উপাত্ত এবং হিসাবের ফলাফল সাময়িকভাবে ধরে রাখে।',
      tooltipPos: { top: '42%', left: '68%' },
      quickSignals: {
        inData: 'Raw from Input (→) & Answers from ALU (↓)',
        outData: 'Operands to ALU (↑) & Results to Output (→)',
        control: 'Read/Write Strobe from CU (↺)',
      },
      description:
        'Memory acts as the central holding hub for all incoming data, intermediate calculation variables, and finalized results awaiting display.',
      descriptionBn:
        'মেমোরি হলো সমস্ত তথ্যের কেন্দ্রীয় জংশন। ইনপুট থেকে ডাটা গ্রহণ, ALU-তে পাঠানো এবং ফলাফল আউটপুটে পাঠানোর আগে তা মেমোরিতেই জমা থাকে।',
      signalsIn: [
        {
          label: 'Raw Data from Input Device (Red Line)',
          desc: 'Newly encoded binary data packets travel directly from the Input Device into Memory addresses.',
          direction: 'Input Device ──→──> Memory',
          type: 'data',
        },
        {
          label: 'Calculated Results from ALU (Red Downward Line)',
          desc: 'The computed answer from the ALU accumulator is latched into a designated memory slot.',
          direction: 'ALU ──↓──> Memory',
          type: 'data',
        },
        {
          label: 'Read/Write Enable from CU (Blue Dashed Loop)',
          desc: 'The Control Unit activates the memory bus line, commanding Memory when to accept new data or release stored values.',
          direction: 'Control Unit ──↺──> Memory',
          type: 'control',
        },
      ],
      signalsOut: [
        {
          label: 'Operands to ALU (Red Upward Line)',
          desc: 'Feeds numbers into the ALU whenever a calculation is ordered.',
          direction: 'Memory ──↑──> ALU',
          type: 'data',
        },
        {
          label: 'Finalized Data to Output Device (Red Line)',
          desc: 'Pushes saved calculation results across the information bus to the Output Device for screen presentation.',
          direction: 'Memory ──→──> Output Device',
          type: 'data',
        },
      ],
      crucialRule:
        'CRITICAL RULE: Memory is the central junction point. All data entering the computer or leaving the computer must pass through Memory first.',
      crucialRuleBn:
        'জরুরি নিয়ম: মেমোরি হলো কেন্দ্রীয় সংযোগস্থল। সমস্ত ডাটা প্রবেশের পর এবং বের হওয়ার আগে অবশ্যই মেমোরির ভেতর দিয়ে যেতে হবে।',
    },

    cu: {
      id: 'cu',
      name: 'Control Unit (CU)',
      bnName: 'কন্ট্রোল ইউনিট (কেন্দ্রীয় তদারককারী)',
      tag: 'Electrical Traffic Police',
      color: 'purple',
      accentColor: '#8b5cf6',
      glowClass: 'shadow-purple-500/30 border-purple-500',
      shortSummary: 'Directs all traffic; issues clock timing pulses to all units.',
      shortSummaryBn: 'সমস্ত ডাটা চলাচলের পথ নির্দেশ করে এবং প্রতিটি ইউনিটে টাইমিং সংকেত পাঠায়।',
      tooltipPos: { top: '68%', left: '68%' },
      quickSignals: {
        inData: 'Instruction Opcode from Memory (↓)',
        outData: 'None (does not carry user data)',
        control: 'Pushes signals to Input, Memory, ALU & Output',
      },
      description:
        'The Control Unit does NOT perform mathematical calculations. Instead, it directs traffic across the entire computer, issuing synchronized electrical timing pulses.',
      descriptionBn:
        'কন্ট্রোল ইউনিট নিজে কোনো হিসাব করে না। অর্কেস্ট্রা পরিচালকের মতো এটি সমস্ত যন্ত্রাংশকে সময়মতো কাজ করার সংকেত পাঠায়।',
      signalsIn: [
        {
          label: 'Instruction Code from Memory (Red Line)',
          desc: 'Fetches program opcodes (e.g. instruction to ADD or STORE) from Memory into the Instruction Register.',
          direction: 'Memory ──↓──> Control Unit',
          type: 'data',
        },
      ],
      signalsOut: [
        {
          label: 'To Input Device (Blue Dashed Line Left)',
          desc: 'Pulses the input controller to sample key switches and latch input buffers.',
          direction: 'Control Unit ──←↑──> Input Device',
          type: 'control',
        },
        {
          label: 'To Memory (Blue Dashed Loop)',
          desc: 'Commands Memory to strobe read/write address lines at the exact nanosecond needed.',
          direction: 'Control Unit ──↺──> Memory',
          type: 'control',
        },
        {
          label: 'To ALU (Blue Dashed Line Right)',
          desc: 'Sends function-select signals (ADD, SUB, MULT) commanding the ALU circuits to compute.',
          direction: 'Control Unit ──↑──> ALU',
          type: 'control',
        },
        {
          label: 'To Output Device (Blue Dashed Line Right)',
          desc: 'Commands the display adapter to flush the frame buffer and illuminate monitor pixels.',
          direction: 'Control Unit ──→↑──> Output Device',
          type: 'control',
        },
      ],
      crucialRule:
        'CRITICAL RULE: The Control Unit does zero math directly. Like an orchestra conductor who does not play the violin, it tells all other units when to perform.',
      crucialRuleBn:
        'জরুরি নিয়ম: কন্ট্রোল ইউনিট নিজে কোনো গণিত করে না। ট্রাফিক পুলিশের মতো এটি সমস্ত ইউনিটের সংকেত নিয়ন্ত্রণ করে।',
    },

    input: {
      id: 'input',
      name: 'Input Device (Keyboard / Mouse / Mic)',
      bnName: 'ইনপুট ডিভাইস (কীবোর্ড, মাউস, স্ক্যানার)',
      tag: 'Human-to-Digital Gateway',
      color: 'sky',
      accentColor: '#0284c7',
      glowClass: 'shadow-sky-500/30 border-sky-500',
      shortSummary: 'Converts keystrokes & physical actions into binary 0s and 1s.',
      shortSummaryBn: 'মানুষের টাইপিং ও ক্লিককে ডিজিটাল বাইনারি সংকেতে (০ ও ১) রূপান্তর করে।',
      tooltipPos: { top: '42%', left: '5%' },
      quickSignals: {
        inData: 'Raw strokes From Operator (→)',
        outData: 'Binary Packets to Memory (→)',
        control: 'Sampling strobe from CU (↑)',
      },
      description:
        'Accepts human physical actions (keystrokes, mouse clicks, sound waves) and encodes them into digital binary electrical signals (0s and 1s).',
      descriptionBn:
        'ইনপুট ডিভাইস মানুষের নির্দেশকে ডিজিটাল বাইনারি কোডে রূপান্তর করে সরাসরি মেমোরিতে পাঠিয়ে দেয়।',
      signalsIn: [
        {
          label: 'Physical Input from Operator (Red Arrow Left)',
          desc: 'The human user presses keys or moves the pointer.',
          direction: 'From Operator ──→──> Input Device',
          type: 'data',
        },
        {
          label: 'Timing Pulse from Control Unit (Blue Dashed Line)',
          desc: 'Control Unit checks if keys are pressed and triggers the input buffer.',
          direction: 'Control Unit ──↑──> Input Device',
          type: 'control',
        },
      ],
      signalsOut: [
        {
          label: 'Binary Packets to Memory (Red Line)',
          desc: 'Encodes the keystrokes and streams the binary bits along the information bus straight into Memory.',
          direction: 'Input Device ──→──> Memory',
          type: 'data',
        },
      ],
      crucialRule:
        'CRITICAL RULE: The Input Device NEVER sends numbers directly to the ALU! It must always store them in Memory first.',
      crucialRuleBn:
        'জরুরি নিয়ম: ইনপুট ডিভাইস কখনোই ডাটা সরাসরি ALU-তে পাঠাতে পারে না; আগে মেমোরিতে জমা হতেই হবে।',
    },

    output: {
      id: 'output',
      name: 'Output Device (Monitor / Screen / Speaker)',
      bnName: 'আউটপুট ডিভাইস (মনিটর, স্পিকার, প্রিন্টার)',
      tag: 'Digital-to-Human Presentation',
      color: 'rose',
      accentColor: '#e11d48',
      glowClass: 'shadow-rose-500/30 border-rose-500',
      shortSummary: 'Renders stored binary results into visible screen pixels or sound.',
      shortSummaryBn: 'মেমোরিতে সংরক্ষিত বাইনারি ফলাফল মানুষের জন্য স্ক্রিনে প্রদর্শন করে।',
      tooltipPos: { top: '42%', left: '72%' },
      quickSignals: {
        inData: 'Finalized Result from Memory (→)',
        outData: 'Visual & Audio Presentation To Operator (→)',
        control: 'Display Refresh Strobe from CU (↑)',
      },
      description:
        'Takes finalized binary data from Memory and transforms it into human-perceivable colorful screen pixels, printed text, or sound waves.',
      descriptionBn:
        'আউটপুট ডিভাইস মেমোরি থেকে প্রসেস করা ফলাফল নিয়ে মনিটরের স্ক্রিনে ফুটিয়ে তোলে বা স্পিকারে শোনায়।',
      signalsIn: [
        {
          label: 'Processed Data from Memory (Red Line)',
          desc: 'Reads the finalized calculation result directly from Memory.',
          direction: 'Memory ──→──> Output Device',
          type: 'data',
        },
        {
          label: 'Display Enable from Control Unit (Blue Dashed Line)',
          desc: 'Control Unit pulses the display controller to render the frame buffer.',
          direction: 'Control Unit ──↑──> Output Device',
          type: 'control',
        },
      ],
      signalsOut: [
        {
          label: 'Visual Presentation to Operator (Red Line Right)',
          desc: 'Illuminates monitor pixels displaying the answer (e.g. 30) to the human operator.',
          direction: 'Output Device ──→──> To Operator',
          type: 'data',
        },
      ],
      crucialRule:
        'CRITICAL RULE: The Output Device never receives data from the ALU directly. It exclusively reads stored results from Memory.',
      crucialRuleBn:
        'জরুরি নিয়ম: আউটপুট ডিভাইস কখনোই ALU থেকে সরাসরি ডাটা পায় না। এটি সর্বদা মেমোরি থেকেই ডাটা নেয়।',
    },

    cpu: {
      id: 'cpu',
      name: 'Central Processing Unit (CPU)',
      bnName: 'সেন্ট্রাল প্রসেসিং ইউনিট (সিপিইউ / প্রসেসর)',
      tag: 'The Microprocessor Enclosure',
      color: 'indigo',
      accentColor: '#6366f1',
      glowClass: 'shadow-indigo-500/30 border-indigo-500',
      shortSummary: 'The main brain enclosure uniting ALU, Memory (Registers), & Control Unit.',
      shortSummaryBn: 'মূল প্রসেসর যা ALU, মেমোরি ও কন্ট্রোল ইউনিটকে একটি চিপে যুক্ত করে।',
      tooltipPos: { top: '4%', left: '38%' },
      quickSignals: {
        inData: 'Data enters Memory from Input',
        outData: 'Data leaves Memory to Output',
        control: 'CU broadcasts timing pulses',
      },
      description:
        'The outer grey box represents the Central Processing Unit (CPU). In classic computer architecture, it encloses the Arithmetic & Logic Unit (ALU), Memory, and the Control Unit (CU) communicating over ultra-high-speed internal buses.',
      descriptionBn:
        'বাইরের বড় বক্সটি হলো কেন্দ্রীয় প্রক্রিয়াকরণ ইউনিট (CPU)। এর ভেতরেই ALU, মেমোরি এবং কন্ট্রোল ইউনিট উচ্চগতির বাস দিয়ে যুক্ত থাকে।',
      signalsIn: [
        {
          label: 'Input Data from Input Device',
          desc: 'Enters the CPU boundary to be stored in Memory.',
          direction: 'Input Device ──→──> CPU (Memory)',
          type: 'data',
        },
      ],
      signalsOut: [
        {
          label: 'Output Data to Output Device',
          desc: 'Leaves the CPU boundary toward display screens.',
          direction: 'CPU (Memory) ──→──> Output Device',
          type: 'data',
        },
      ],
      crucialRule:
        'CRITICAL RULE: The CPU is not a single black box. Inside, the ALU, Memory, and Control Unit continuously exchange data and timing pulses.',
      crucialRuleBn:
        'জরুরি নিয়ম: সিপিইউ কোনো একক উপাদান নয়; এর ভেতরে ALU, মেমোরি ও কন্ট্রোল ইউনিট সার্বক্ষণিক যোগাযোগ বজায় রাখে।',
    },

    operator: {
      id: 'operator',
      name: 'Operator (Human User)',
      bnName: 'অপারেটর (মানুষ / ব্যবহারকারী)',
      tag: 'User & Requester',
      color: 'blue',
      accentColor: '#3b82f6',
      glowClass: 'shadow-blue-500/30 border-blue-500',
      shortSummary: 'Enters commands to input device and perceives final screen results.',
      shortSummaryBn: 'কীবোর্ডে ইনপুট নির্দেশ দেন এবং মনিটরে ফলাফল পর্যবেক্ষণ করেন।',
      tooltipPos: { top: '35%', left: '2%' },
      quickSignals: {
        inData: 'Visual Output from Monitor (→)',
        outData: 'Physical Keypresses to Input (→)',
        control: 'Human Intent & Timing',
      },
      description:
        'The human operator initiates actions via keyboard or mouse and observes finalized information displayed on the screen.',
      descriptionBn:
        'কম্পিউটার পরিচালনাকারী মানুষ যিনি ইনপুট ডিভাইসের মাধ্যমে নির্দেশ দেন এবং মনিটরে ফলাফল দেখতে পান।',
      signalsIn: [
        {
          label: 'Visual Screen Display (Red Line)',
          desc: 'Light from the monitor display reaches human eyes.',
          direction: 'Output Device ──→──> Operator',
          type: 'data',
        },
      ],
      signalsOut: [
        {
          label: 'Keystrokes / Clicks (Red Line)',
          desc: 'Physical finger movements convert to electrical contact.',
          direction: 'Operator ──→──> Input Device',
          type: 'data',
        },
      ],
      crucialRule:
        'CRITICAL RULE: The operator interacts only through input and output peripherals, never directly with raw CPU registers.',
      crucialRuleBn:
        'জরুরি নিয়ম: ব্যবহারকারী শুধুমাত্র ইনপুট ও আউটপুট যন্ত্রের সাথেই যুক্ত থাকেন; প্রসেসরের ভেতরে সরাসরি হাত দেন না।',
    },
  };

  const selectedData = COMPONENT_INFO[activeUnit] || COMPONENT_INFO.alu;
  const animDuration = 2 / (flowSpeed || 1);

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c1017] p-4 sm:p-6 shadow-sm space-y-5 select-none relative overflow-hidden font-sans">
      {/* Background ambient grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ========================================================
          HEADER & INTERACTION CONTROLS
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              Interactive Architecture Diagram
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Interactive Map Hover
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Functional Block Diagram of a Typical Computer
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Hover over any component to see instant map-style data and trace electrical signals!
          </p>
        </div>

        {/* Live Flow & Speed Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsFlowActive(!isFlowActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isFlowActive
                ? 'bg-red-500 text-white shadow-red-500/20'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            {isFlowActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isFlowActive ? 'Signals: Active' : 'Signals: Paused'}</span>
          </button>

          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/90 rounded-xl p-0.5 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFlowSpeed(0.5)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                flowSpeed === 0.5 ? 'bg-sky-500 text-white' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              0.5x
            </button>
            <button
              type="button"
              onClick={() => setFlowSpeed(1)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                flowSpeed === 1 ? 'bg-sky-500 text-white' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => setFlowSpeed(2)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                flowSpeed === 2 ? 'bg-sky-500 text-white' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              2x
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          DESKTOP EYE-LEVEL SIDE-BY-SIDE LAYOUT
          Diagram (left 8 cols / 7 cols) + Eye-Level Inspector HUD (right 4 cols / 5 cols)
          Eliminates endless downward scrolling!
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: THE DIAGRAM WITH MAP-STYLE HOVER (8 COLS) */}
        <div className="md:col-span-7 lg:col-span-8 relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-[#fbfcfd] dark:bg-[#070b12] p-2 sm:p-4 shadow-inner overflow-hidden">
          {/* MAP-OF-BANGLADESH STYLE FLOATING QUICK-TOOLTIP BADGE */}
          {hoveredUnit && COMPONENT_INFO[hoveredUnit] && (
            <div
              className="absolute z-30 pointer-events-none transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
              style={{
                top: COMPONENT_INFO[hoveredUnit].tooltipPos.top,
                left: COMPONENT_INFO[hoveredUnit].tooltipPos.left,
              }}
            >
              <div
                className="max-w-[240px] rounded-2xl border-2 bg-white/95 dark:bg-[#0f141f]/95 p-2.5 shadow-2xl backdrop-blur-md space-y-1.5 transition-all duration-200"
                style={{ borderColor: COMPONENT_INFO[hoveredUnit].accentColor }}
              >
                <div className="flex items-center justify-between gap-1.5 border-b border-neutral-100 dark:border-neutral-800/80 pb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full animate-ping shrink-0"
                      style={{ backgroundColor: COMPONENT_INFO[hoveredUnit].accentColor }}
                    />
                    <h5 className="text-[11px] font-black text-neutral-900 dark:text-neutral-100 truncate">
                      {lang === 'bn'
                        ? COMPONENT_INFO[hoveredUnit].bnName.split('(')[0].trim()
                        : COMPONENT_INFO[hoveredUnit].name.split('(')[0].trim()}
                    </h5>
                  </div>
                  <span className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0">
                    {COMPONENT_INFO[hoveredUnit].tag}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-600 dark:text-neutral-300 leading-snug">
                  {lang === 'bn'
                    ? COMPONENT_INFO[hoveredUnit].shortSummaryBn
                    : COMPONENT_INFO[hoveredUnit].shortSummary}
                </p>
                <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800/80 text-[8.5px] font-mono font-bold text-neutral-500 space-y-0.5">
                  <div className="text-red-500 truncate">🔴 {COMPONENT_INFO[hoveredUnit].quickSignals.inData}</div>
                  <div className="text-blue-500 truncate">🔵 {COMPONENT_INFO[hoveredUnit].quickSignals.control}</div>
                </div>
                <div className="pt-0.5 text-[8.5px] font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                  <span>Click box to pin in side inspector</span>
                </div>
              </div>
            </div>
          )}

          {/* SVG Canvas */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox="0 0 1000 580"
              className="w-full min-w-[760px] h-auto drop-shadow-xs"
              aria-label="Functional block diagram of a typical computer recreation"
            >
              {/* Marker Definitions */}
              <defs>
                <marker
                  id="tb-red-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ef4444" />
                </marker>

                <marker
                  id="tb-blue-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#2563eb" />
                </marker>

                <pattern
                  id="chip-dots"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="currentColor" className="text-neutral-400/20" />
                </pattern>
              </defs>

              {/* CPU Box */}
              <g
                id="cpu-enclosure"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredUnit('cpu')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('cpu')}
              >
                <rect
                  x="340"
                  y="40"
                  width="320"
                  height="455"
                  rx="16"
                  className={`transition-all duration-300 ${
                    activeUnit === 'cpu'
                      ? 'fill-indigo-500/10 stroke-indigo-500 stroke-[3.5] filter drop-shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                      : 'fill-neutral-100/90 dark:fill-neutral-900/90 stroke-neutral-900 dark:stroke-neutral-300 stroke-[3]'
                  }`}
                />
                <rect
                  x="340"
                  y="40"
                  width="320"
                  height="455"
                  rx="16"
                  fill="url(#chip-dots)"
                  className="pointer-events-none"
                />
                <text
                  x="500"
                  y="522"
                  textAnchor="middle"
                  className={`font-black text-[15px] select-none transition-colors duration-200 tracking-wide ${
                    activeUnit === 'cpu'
                      ? 'fill-indigo-600 dark:fill-indigo-400'
                      : 'fill-neutral-900 dark:fill-neutral-100'
                  }`}
                >
                  Central Processing Unit (CPU)
                </text>
              </g>

              {/* Red Information Flow Paths */}
              <path
                id="path-op-to-input"
                d="M 65 267 L 170 267"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'input' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-input-to-mem"
                d="M 310 267 L 370 267"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'input' || activeUnit === 'memory' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-mem-to-alu"
                d="M 435 220 L 435 155"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'alu' || activeUnit === 'memory' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-alu-to-mem"
                d="M 565 155 L 565 220"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'alu' || activeUnit === 'memory' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-mem-to-cu"
                d="M 435 315 L 435 380"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'cu' || activeUnit === 'memory' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-cu-to-mem"
                d="M 565 380 L 565 315"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'cu' || activeUnit === 'memory' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-mem-to-output"
                d="M 630 267 L 690 267"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'output' || activeUnit === 'memory' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-output-to-op"
                d="M 830 267 L 935 267"
                fill="none"
                stroke="#ef4444"
                strokeWidth={activeUnit === 'output' ? '3.5' : '2.5'}
                markerEnd="url(#tb-red-arrow)"
                className="transition-all duration-200"
              />

              {/* Blue Control Signal Paths */}
              <path
                id="path-cu-to-input"
                d="M 370 440 L 240 440 L 240 315"
                fill="none"
                stroke="#2563eb"
                strokeWidth={activeUnit === 'cu' || activeUnit === 'input' ? '3' : '2'}
                strokeDasharray="5 4"
                markerEnd="url(#tb-blue-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-cu-to-memory-loop"
                d="M 370 410 L 345 410 L 345 275 L 370 275"
                fill="none"
                stroke="#2563eb"
                strokeWidth={activeUnit === 'cu' || activeUnit === 'memory' ? '3' : '2'}
                strokeDasharray="5 4"
                markerEnd="url(#tb-blue-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-cu-to-alu"
                d="M 630 420 L 655 420 L 655 112 L 630 112"
                fill="none"
                stroke="#2563eb"
                strokeWidth={activeUnit === 'cu' || activeUnit === 'alu' ? '3' : '2'}
                strokeDasharray="5 4"
                markerEnd="url(#tb-blue-arrow)"
                className="transition-all duration-200"
              />

              <path
                id="path-cu-to-output"
                d="M 630 440 L 760 440 L 760 315"
                fill="none"
                stroke="#2563eb"
                strokeWidth={activeUnit === 'cu' || activeUnit === 'output' ? '3' : '2'}
                strokeDasharray="5 4"
                markerEnd="url(#tb-blue-arrow)"
                className="transition-all duration-200"
              />

              {/* Animated Signals */}
              {isFlowActive && (
                <g className="pointer-events-none">
                  <circle r="4" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration * 0.8}s`} repeatCount="indefinite">
                      <mpath href="#path-op-to-input" />
                    </animateMotion>
                  </circle>

                  <circle r="4" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration * 0.7}s`} repeatCount="indefinite">
                      <mpath href="#path-input-to-mem" />
                    </animateMotion>
                  </circle>

                  <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration}s`} repeatCount="indefinite">
                      <mpath href="#path-mem-to-alu" />
                    </animateMotion>
                  </circle>

                  <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration}s`} repeatCount="indefinite">
                      <mpath href="#path-alu-to-mem" />
                    </animateMotion>
                  </circle>

                  <circle r="4" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration * 1.1}s`} repeatCount="indefinite">
                      <mpath href="#path-mem-to-cu" />
                    </animateMotion>
                  </circle>

                  <circle r="4" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration * 1.1}s`} repeatCount="indefinite">
                      <mpath href="#path-cu-to-mem" />
                    </animateMotion>
                  </circle>

                  <circle r="4" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration * 0.7}s`} repeatCount="indefinite">
                      <mpath href="#path-mem-to-output" />
                    </animateMotion>
                  </circle>

                  <circle r="4" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                    <animateMotion dur={`${animDuration * 0.8}s`} repeatCount="indefinite">
                      <mpath href="#path-output-to-op" />
                    </animateMotion>
                  </circle>

                  {/* Blue Control Pulses */}
                  <circle r="3" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                    <animateMotion dur={`${animDuration * 1.5}s`} repeatCount="indefinite">
                      <mpath href="#path-cu-to-input" />
                    </animateMotion>
                  </circle>

                  <circle r="3" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                    <animateMotion dur={`${animDuration * 1.2}s`} repeatCount="indefinite">
                      <mpath href="#path-cu-to-memory-loop" />
                    </animateMotion>
                  </circle>

                  <circle r="3" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                    <animateMotion dur={`${animDuration * 1.6}s`} repeatCount="indefinite">
                      <mpath href="#path-cu-to-alu" />
                    </animateMotion>
                  </circle>

                  <circle r="3" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                    <animateMotion dur={`${animDuration * 1.5}s`} repeatCount="indefinite">
                      <mpath href="#path-cu-to-output" />
                    </animateMotion>
                  </circle>
                </g>
              )}

              {/* Hardware Units */}
              {/* ALU */}
              <g
                id="unit-alu"
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredUnit('alu')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('alu')}
              >
                <rect
                  x="370"
                  y="70"
                  width="260"
                  height="85"
                  rx="10"
                  className={`transition-all duration-200 ${
                    activeUnit === 'alu'
                      ? 'fill-amber-500/20 stroke-amber-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'fill-white dark:fill-[#12161f] stroke-neutral-900 dark:stroke-neutral-300 stroke-[2] hover:stroke-amber-400'
                  }`}
                />
                <text
                  x="500"
                  y="108"
                  textAnchor="middle"
                  className="font-black text-[15px] fill-neutral-900 dark:fill-neutral-100 select-none pointer-events-none"
                >
                  ALU
                </text>
                <text
                  x="500"
                  y="130"
                  textAnchor="middle"
                  className="font-bold text-[11.5px] fill-neutral-600 dark:fill-neutral-400 select-none pointer-events-none"
                >
                  (Arithmetic & Logic Unit)
                </text>
              </g>

              {/* Memory */}
              <g
                id="unit-memory"
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredUnit('memory')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('memory')}
              >
                <rect
                  x="370"
                  y="220"
                  width="260"
                  height="95"
                  rx="10"
                  className={`transition-all duration-200 ${
                    activeUnit === 'memory'
                      ? 'fill-emerald-500/20 stroke-emerald-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'fill-white dark:fill-[#12161f] stroke-neutral-900 dark:stroke-neutral-300 stroke-[2] hover:stroke-emerald-400'
                  }`}
                />
                <text
                  x="500"
                  y="273"
                  textAnchor="middle"
                  className="font-black text-[16px] fill-neutral-900 dark:fill-neutral-100 select-none pointer-events-none"
                >
                  Memory
                </text>
                <text
                  x="500"
                  y="293"
                  textAnchor="middle"
                  className="font-semibold text-[10.5px] fill-neutral-500 dark:fill-neutral-400 select-none pointer-events-none"
                >
                  (Primary Storage / RAM)
                </text>
              </g>

              {/* Control Unit */}
              <g
                id="unit-cu"
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredUnit('cu')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('cu')}
              >
                <rect
                  x="370"
                  y="380"
                  width="260"
                  height="85"
                  rx="10"
                  className={`transition-all duration-200 ${
                    activeUnit === 'cu'
                      ? 'fill-purple-500/20 stroke-purple-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                      : 'fill-white dark:fill-[#12161f] stroke-neutral-900 dark:stroke-neutral-300 stroke-[2] hover:stroke-purple-400'
                  }`}
                />
                <text
                  x="500"
                  y="423"
                  textAnchor="middle"
                  className="font-black text-[15px] fill-neutral-900 dark:fill-neutral-100 select-none pointer-events-none"
                >
                  Control Unit
                </text>
                <text
                  x="500"
                  y="445"
                  textAnchor="middle"
                  className="font-bold text-[11px] fill-neutral-500 dark:fill-neutral-400 select-none pointer-events-none"
                >
                  (Timing & Command Generator)
                </text>
              </g>

              {/* Input Device */}
              <g
                id="unit-input"
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredUnit('input')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('input')}
              >
                <rect
                  x="170"
                  y="220"
                  width="140"
                  height="95"
                  rx="10"
                  className={`transition-all duration-200 ${
                    activeUnit === 'input'
                      ? 'fill-sky-500/20 stroke-sky-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(2,132,199,0.5)]'
                      : 'fill-white dark:fill-[#12161f] stroke-neutral-900 dark:stroke-neutral-300 stroke-[2] hover:stroke-sky-400'
                  }`}
                />
                <text
                  x="240"
                  y="267"
                  textAnchor="middle"
                  className="font-black text-[14px] fill-neutral-900 dark:fill-neutral-100 select-none pointer-events-none"
                >
                  Input Device
                </text>
                <text
                  x="240"
                  y="288"
                  textAnchor="middle"
                  className="font-semibold text-[10px] fill-neutral-500 select-none pointer-events-none"
                >
                  Keyboard / Mouse
                </text>
              </g>

              {/* Output Device */}
              <g
                id="unit-output"
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredUnit('output')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('output')}
              >
                <rect
                  x="690"
                  y="220"
                  width="140"
                  height="95"
                  rx="10"
                  className={`transition-all duration-200 ${
                    activeUnit === 'output'
                      ? 'fill-rose-500/20 stroke-rose-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(225,29,72,0.5)]'
                      : 'fill-white dark:fill-[#12161f] stroke-neutral-900 dark:stroke-neutral-300 stroke-[2] hover:stroke-rose-400'
                  }`}
                />
                <text
                  x="760"
                  y="267"
                  textAnchor="middle"
                  className="font-black text-[14px] fill-neutral-900 dark:fill-neutral-100 select-none pointer-events-none"
                >
                  Output Device
                </text>
                <text
                  x="760"
                  y="288"
                  textAnchor="middle"
                  className="font-semibold text-[10px] fill-neutral-500 select-none pointer-events-none"
                >
                  Monitor / Display
                </text>
              </g>

              {/* Labels & Operator Groups */}
              <g
                id="unit-operator-left"
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredUnit('operator')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('operator')}
              >
                <text
                  x="55"
                  y="250"
                  textAnchor="middle"
                  className={`font-black text-[13px] select-none transition-all duration-200 ${
                    activeUnit === 'operator'
                      ? 'fill-blue-600 dark:fill-blue-400 font-extrabold'
                      : 'fill-red-600 dark:fill-red-400'
                  }`}
                >
                  From Operator
                </text>
                <text
                  x="55"
                  y="283"
                  textAnchor="middle"
                  className="font-bold text-[9.5px] fill-neutral-500 select-none"
                >
                  (Human User)
                </text>
              </g>

              <g
                id="unit-operator-right"
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredUnit('operator')}
                onMouseLeave={() => setHoveredUnit(null)}
                onClick={() => setPinnedUnit('operator')}
              >
                <text
                  x="945"
                  y="250"
                  textAnchor="middle"
                  className={`font-black text-[13px] select-none transition-all duration-200 ${
                    activeUnit === 'operator'
                      ? 'fill-blue-600 dark:fill-blue-400 font-extrabold'
                      : 'fill-blue-600 dark:fill-blue-400'
                  }`}
                >
                  To Operator
                </text>
                <text
                  x="945"
                  y="283"
                  textAnchor="middle"
                  className="font-bold text-[9.5px] fill-neutral-500 select-none"
                >
                  (Human Eyes)
                </text>
              </g>

              <text
                x="500"
                y="560"
                textAnchor="middle"
                className="font-black text-[13px] fill-blue-700 dark:fill-sky-400 select-none tracking-wide"
              >
                Figure: Functional block diagram of a typical computer
              </text>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: EYE-LEVEL INSPECTOR HUD
            Positioned right beside the diagram so students NEVER scroll to the bottom! */}
        <div className="md:col-span-5 lg:col-span-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-[#111622] p-4 sm:p-5 shadow-md space-y-4 transition-all duration-300 ease-in-out max-h-[580px] overflow-y-auto">
          <div key={activeUnit} className="space-y-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md transition-colors"
                  style={{ backgroundColor: selectedData.accentColor }}
                >
                  {selectedData.id === 'alu' && <Cpu className="w-4 h-4" />}
                  {selectedData.id === 'memory' && <HardDrive className="w-4 h-4" />}
                  {selectedData.id === 'cu' && <Layers className="w-4 h-4" />}
                  {selectedData.id === 'input' && <Keyboard className="w-4 h-4" />}
                  {selectedData.id === 'output' && <Monitor className="w-4 h-4" />}
                  {selectedData.id === 'cpu' && <Zap className="w-4 h-4" />}
                  {selectedData.id === 'operator' && <ExternalLink className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 block">
                    {selectedData.tag}
                  </span>
                  <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100 leading-tight">
                    {selectedData.name.split('(')[0].trim()}
                  </h4>
                </div>
              </div>

              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Active Focus
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed transition-opacity duration-200">
              {lang === 'bn' ? selectedData.descriptionBn : selectedData.description}
            </p>

            {/* Incoming & Outgoing Signals Breakdown */}
            <div className="space-y-2 text-xs">
              {/* IN */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 rotate-45" />
                  <span>Signals Coming IN (প্রবেশ করে):</span>
                </span>
                <ul className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300 pl-1">
                  {selectedData.signalsIn?.map((s, idx) => (
                    <li key={idx} className="leading-tight">
                      • <span className="font-bold text-sky-600 dark:text-sky-400 font-mono text-[10px]">{s.direction}</span>: {s.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* OUT */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 -rotate-45" />
                  <span>Signals Going OUT (বের হয়):</span>
                </span>
                <ul className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300 pl-1">
                  {selectedData.signalsOut?.map((s, idx) => (
                    <li key={idx} className="leading-tight">
                      • <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">{s.direction}</span>: {s.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Crucial Teaching Rule */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-bold leading-relaxed flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{lang === 'bn' ? selectedData.crucialRuleBn : selectedData.crucialRule}</span>
            </div>

            {/* Fast Component Selector Pills */}
            <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
              <span className="text-[10px] font-bold text-neutral-400 block mb-1.5">
                Quick Switch Component:
              </span>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                {['alu', 'memory', 'cu', 'input', 'output', 'cpu', 'operator'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPinnedUnit(key)}
                    className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      activeUnit === key
                        ? 'border-sky-500 bg-sky-500 text-white shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-bold text-neutral-500 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-[11px]">
            <span className="w-4 h-0.5 bg-red-500" />
            Solid Red: Information Flow (Data & Answers)
          </span>
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px]">
            <span className="w-4 h-0.5 border-t border-dashed border-blue-500" />
            Dashed Blue: Control Signals (Control Unit)
          </span>
        </div>

        <div className="text-[11px] text-neutral-400 italic">
          Hover or click any box to inspect instant signal flow
        </div>
      </div>
    </div>
  );
};

export default FiveUnitsHubVisualizer;
