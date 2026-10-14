import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

/**
 * FiveUnitsHubVisualizer
 * Faithful, award-winning interactive recreation of the textbook diagram:
 * "Figure: Functional block diagram of a typical computer"
 * 
 * Features:
 * - Central Processing Unit (CPU) enclosing ALU (top), Memory (middle), and Control Unit (bottom).
 * - From Operator -> Input Device -> Memory -> Output Device -> To Operator.
 * - Solid Red lines for Information Flow (Data & Results) with traveling electrical data packets.
 * - Dotted/Dashed Blue lines for Control Signals from Control Unit with electrical timing pulses.
 * - Comprehensive dynamic hover effects revealing signal direction ("going this way and that way").
 * - Interactive test pulses, signal speed controls, and component deep-dive inspection.
 */
export const FiveUnitsHubVisualizer = ({ lang = 'both' }) => {
  // Currently hovered or selected component: 'alu' | 'memory' | 'cu' | 'input' | 'output' | 'cpu' | 'operatorIn' | 'operatorOut' | null
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [pinnedUnit, setPinnedUnit] = useState(null);

  // Animation playback state
  const [isFlowActive, setIsFlowActive] = useState(true);
  const [flowSpeed, setFlowSpeed] = useState(1); // 0.5x, 1x, 2x
  const [activeSignalPath, setActiveSignalPath] = useState(null);

  // Signal pulse trigger for manual test demonstration
  const [testPulseMode, setTestPulseMode] = useState(null); // 'alu-math' | 'cu-broadcast' | 'input-to-ram' | 'ram-to-screen'

  const activeUnit = pinnedUnit || hoveredUnit;

  // Metadata for all components
  const COMPONENT_INFO = {
    alu: {
      id: 'alu',
      name: 'ALU (Arithmetic & Logic Unit)',
      bnName: 'অ্যারিথমেটিক অ্যান্ড লজিক ইউনিট',
      tag: 'The Mathematical Calculator & Decision Brain',
      color: 'amber',
      accentColor: '#f59e0b',
      glowClass: 'shadow-amber-500/30 border-amber-500',
      description:
        'The ALU performs all arithmetic calculations (addition, subtraction, multiplication, division) and logical true/false decisions (comparisons like A > B).',
      signalsIn: [
        {
          label: 'Operands from Memory (Red Upward Line)',
          desc: 'Numbers waiting to be calculated (e.g. 10 and 20) travel upward from Memory into ALU input registers.',
          direction: 'Memory ──↑──> ALU',
          type: 'data',
        },
        {
          label: 'Control Command from Control Unit (Blue Dashed Line)',
          desc: 'The Control Unit sends an electrical command pulse (ADD, SUB, COMPARE) up the right-hand bus line.',
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
    },

    memory: {
      id: 'memory',
      name: 'Memory Unit (Primary Storage / RAM)',
      bnName: 'মেমোরি ইউনিট (প্রাইমারি স্টোরেজ)',
      tag: 'The Central Data Warehouse & Working Desk',
      color: 'emerald',
      accentColor: '#10b981',
      glowClass: 'shadow-emerald-500/30 border-emerald-500',
      description:
        'Memory temporarily stores incoming user data, intermediate calculation variables, active program instructions, and results awaiting display.',
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
          label: 'Read/Write Enable from Control Unit (Blue Dashed Loop)',
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
    },

    cu: {
      id: 'cu',
      name: 'Control Unit (CU)',
      bnName: 'কন্ট্রোল ইউনিট (কেন্দ্রীয় নিয়ন্ত্রক)',
      tag: 'The Master Conductor & Electrical Traffic Police',
      color: 'purple',
      accentColor: '#8b5cf6',
      glowClass: 'shadow-purple-500/30 border-purple-500',
      description:
        'The Control Unit does NOT perform mathematical calculations. Instead, it directs traffic across the entire computer, issuing synchronized electrical timing pulses.',
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
    },

    input: {
      id: 'input',
      name: 'Input Device (Keyboard / Mouse / Mic)',
      bnName: 'ইনপুট ডিভাইস',
      tag: 'The Physical-to-Digital Gateway',
      color: 'sky',
      accentColor: '#0284c7',
      glowClass: 'shadow-sky-500/30 border-sky-500',
      description:
        'Accepts human physical actions (keystrokes, mouse clicks, sound waves) and encodes them into digital binary electrical signals (0s and 1s).',
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
    },

    output: {
      id: 'output',
      name: 'Output Device (Monitor / Screen / Printer)',
      bnName: 'আউটপুট ডিভাইস',
      tag: 'The Digital-to-Human Presentation Window',
      color: 'rose',
      accentColor: '#e11d48',
      glowClass: 'shadow-rose-500/30 border-rose-500',
      description:
        'Takes finalized binary data from Memory and transforms it into human-perceivable colorful screen pixels, printed text, or acoustic audio waves.',
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
    },

    cpu: {
      id: 'cpu',
      name: 'Central Processing Unit (CPU)',
      bnName: 'সেন্ট্রাল প্রসেসিং ইউনিট (সিপিইউ)',
      tag: 'The Silicon Microprocessor Core',
      color: 'indigo',
      accentColor: '#6366f1',
      glowClass: 'shadow-indigo-500/30 border-indigo-500',
      description:
        'The outer grey box represents the Central Processing Unit (CPU). In classic computer architecture, it encloses the Arithmetic & Logic Unit (ALU), the Memory Unit (RAM/Registers), and the Control Unit (CU) communicating over ultra-high-speed internal buses.',
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
        {
          label: 'Supervisory Control Signals to Peripherals',
          desc: 'Blue dashed timing lines exit the CPU to synchronize Input and Output devices.',
          direction: 'CPU (CU) ──→──> Peripherals',
          type: 'control',
        },
      ],
      crucialRule:
        'CRITICAL RULE: The CPU is not a single black box. Inside, the ALU, Memory, and Control Unit continuously exchange data and timing pulses.',
    },
  };

  // Trigger interactive test demonstration pulses
  const triggerTestPulse = (mode) => {
    setTestPulseMode(mode);
    setTimeout(() => setTestPulseMode(null), 3000);
  };

  const selectedData = activeUnit ? COMPONENT_INFO[activeUnit] : null;

  // Animation cycle duration in seconds
  const animDuration = 2 / (flowSpeed || 1);

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c1017] p-4 sm:p-7 shadow-sm space-y-6 select-none relative overflow-hidden font-sans">
      {/* Subtle technical background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ========================================================
          HEADER & INTERACTION TOOLBAR
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              Interactive Textbook Block Diagram
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Hover Any Unit
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            Functional Block Diagram of a Typical Computer
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Hover over any component to see what it does and trace how electrical signals flow through the system!
          </p>
        </div>

        {/* Animation & Signal Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Signal Flow Toggle */}
          <button
            type="button"
            onClick={() => setIsFlowActive(!isFlowActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isFlowActive
                ? 'bg-red-500 text-white shadow-red-500/20'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
            title="Toggle Live Electrical Flow Animation"
          >
            {isFlowActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isFlowActive ? 'Live Signals: ON' : 'Live Signals: PAUSED'}</span>
          </button>

          {/* Speed Selector */}
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

          {/* Reset Inspection */}
          {(pinnedUnit || hoveredUnit) && (
            <button
              type="button"
              onClick={() => {
                setPinnedUnit(null);
                setHoveredUnit(null);
              }}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Reset inspection"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          THE TEXTBOOK FUNCTIONAL BLOCK DIAGRAM (HIGH-RES SVG)
         ======================================================== */}
      <div className="relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-[#fbfcfd] dark:bg-[#070b12] p-2 sm:p-5 overflow-x-auto shadow-inner">
        <svg
          viewBox="0 0 1000 580"
          className="w-full min-w-[860px] h-auto drop-shadow-xs"
          aria-label="Functional block diagram of a typical computer recreation"
        >
          {/* SVG Marker Definitions */}
          <defs>
            {/* Red Arrowhead for Solid Information Flow */}
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

            {/* Glowing Red Arrowhead for Hovered Flow */}
            <marker
              id="tb-red-arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
            </marker>

            {/* Blue Arrowhead for Dotted Timing & Control Signals */}
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

            <marker
              id="tb-blue-arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
            </marker>

            {/* CPU Chassis Striping Pattern */}
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

          {/* ========================================================
              1. CENTRAL PROCESSING UNIT (CPU) ENCLOSING CONTAINER
             ======================================================== */}
          <g
            id="cpu-enclosure"
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredUnit('cpu')}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => setPinnedUnit(pinnedUnit === 'cpu' ? null : 'cpu')}
          >
            {/* Outer CPU Boundary Box (Matches the thick black border in reference image) */}
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

            {/* Silicon wafer subtle background fill */}
            <rect
              x="340"
              y="40"
              width="320"
              height="455"
              rx="16"
              fill="url(#chip-dots)"
              className="pointer-events-none"
            />

            {/* Bottom Label: Central Processing Unit (CPU) */}
            <text
              x="500"
              y="522"
              textAnchor="middle"
              className={`font-black text-[15px] select-none transition-colors duration-200 tracking-wide ${
                activeUnit === 'cpu'
                  ? 'fill-indigo-600 dark:fill-indigo-400 font-extrabold'
                  : 'fill-neutral-900 dark:fill-neutral-100'
              }`}
            >
              Central Processing Unit (CPU)
            </text>
          </g>

          {/* ========================================================
              2. RED INFORMATION FLOW PATHS (SOLID LINES & TRAVELING SIGNALS)
             ======================================================== */}
          {/* Path 1: From Operator -> Input Device */}
          <path
            id="path-op-to-input"
            d="M 65 267 L 170 267"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'input' || activeUnit === 'operatorIn' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* Path 2: Input Device -> Memory */}
          <path
            id="path-input-to-mem"
            d="M 310 267 L 370 267"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'input' || activeUnit === 'memory' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* Path 3: Memory -> ALU (Upward left red line) */}
          <path
            id="path-mem-to-alu"
            d="M 435 220 L 435 155"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'alu' || activeUnit === 'memory' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* Path 4: ALU -> Memory (Downward right red line) */}
          <path
            id="path-alu-to-mem"
            d="M 565 155 L 565 220"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'alu' || activeUnit === 'memory' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* Path 5: Memory -> Control Unit (Downward left red line) */}
          <path
            id="path-mem-to-cu"
            d="M 435 315 L 435 380"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'cu' || activeUnit === 'memory' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* Path 6: Control Unit -> Memory (Upward right red line) */}
          <path
            id="path-cu-to-mem"
            d="M 565 380 L 565 315"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'cu' || activeUnit === 'memory' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* Path 7: Memory -> Output Device */}
          <path
            id="path-mem-to-output"
            d="M 630 267 L 690 267"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'output' || activeUnit === 'memory' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* Path 8: Output Device -> To Operator */}
          <path
            id="path-output-to-op"
            d="M 830 267 L 935 267"
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeUnit === 'output' || activeUnit === 'operatorOut' ? '3.5' : '2.5'}
            markerEnd="url(#tb-red-arrow)"
          />

          {/* ========================================================
              3. BLUE TIMING & CONTROL SIGNAL PATHS (DOTTED/DASHED LINES)
             ======================================================== */}
          {/* CU left -> Input Device bottom */}
          <path
            id="path-cu-to-input"
            d="M 370 440 L 240 440 L 240 315"
            fill="none"
            stroke="#2563eb"
            strokeWidth={activeUnit === 'cu' || activeUnit === 'input' ? '3' : '2'}
            strokeDasharray="5 4"
            markerEnd="url(#tb-blue-arrow)"
          />

          {/* CU left -> Memory left edge */}
          <path
            id="path-cu-to-memory-loop"
            d="M 370 410 L 345 410 L 345 275 L 370 275"
            fill="none"
            stroke="#2563eb"
            strokeWidth={activeUnit === 'cu' || activeUnit === 'memory' ? '3' : '2'}
            strokeDasharray="5 4"
            markerEnd="url(#tb-blue-arrow)"
          />

          {/* CU right -> ALU right edge */}
          <path
            id="path-cu-to-alu"
            d="M 630 420 L 655 420 L 655 112 L 630 112"
            fill="none"
            stroke="#2563eb"
            strokeWidth={activeUnit === 'cu' || activeUnit === 'alu' ? '3' : '2'}
            strokeDasharray="5 4"
            markerEnd="url(#tb-blue-arrow)"
          />

          {/* CU right -> Output Device bottom */}
          <path
            id="path-cu-to-output"
            d="M 630 440 L 760 440 L 760 315"
            fill="none"
            stroke="#2563eb"
            strokeWidth={activeUnit === 'cu' || activeUnit === 'output' ? '3' : '2'}
            strokeDasharray="5 4"
            markerEnd="url(#tb-blue-arrow)"
          />

          {/* ========================================================
              4. LIVE TRAVELING ELECTRICAL PARTICLES (ANIMATED PACKETS)
             ======================================================== */}
          {isFlowActive && (
            <g className="pointer-events-none">
              {/* Red Data Pulses */}
              {/* Op -> Input */}
              <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration * 0.8}s`} repeatCount="indefinite">
                  <mpath href="#path-op-to-input" />
                </animateMotion>
              </circle>

              {/* Input -> Memory */}
              <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration * 0.7}s`} repeatCount="indefinite">
                  <mpath href="#path-input-to-mem" />
                </animateMotion>
              </circle>

              {/* Memory -> ALU */}
              <circle r="5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration}s`} repeatCount="indefinite">
                  <mpath href="#path-mem-to-alu" />
                </animateMotion>
              </circle>

              {/* ALU -> Memory */}
              <circle r="5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration}s`} repeatCount="indefinite">
                  <mpath href="#path-alu-to-mem" />
                </animateMotion>
              </circle>

              {/* Memory -> CU */}
              <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration * 1.1}s`} repeatCount="indefinite">
                  <mpath href="#path-mem-to-cu" />
                </animateMotion>
              </circle>

              {/* CU -> Memory */}
              <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration * 1.1}s`} repeatCount="indefinite">
                  <mpath href="#path-cu-to-mem" />
                </animateMotion>
              </circle>

              {/* Memory -> Output */}
              <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration * 0.7}s`} repeatCount="indefinite">
                  <mpath href="#path-mem-to-output" />
                </animateMotion>
              </circle>

              {/* Output -> To Op */}
              <circle r="4.5" fill="#ef4444" className="filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                <animateMotion dur={`${animDuration * 0.8}s`} repeatCount="indefinite">
                  <mpath href="#path-output-to-op" />
                </animateMotion>
              </circle>

              {/* Blue Control Signal Pulses */}
              {/* CU -> Input */}
              <circle r="3.5" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                <animateMotion dur={`${animDuration * 1.5}s`} repeatCount="indefinite">
                  <mpath href="#path-cu-to-input" />
                </animateMotion>
              </circle>

              {/* CU -> Memory loop */}
              <circle r="3.5" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                <animateMotion dur={`${animDuration * 1.2}s`} repeatCount="indefinite">
                  <mpath href="#path-cu-to-memory-loop" />
                </animateMotion>
              </circle>

              {/* CU -> ALU */}
              <circle r="3.5" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                <animateMotion dur={`${animDuration * 1.6}s`} repeatCount="indefinite">
                  <mpath href="#path-cu-to-alu" />
                </animateMotion>
              </circle>

              {/* CU -> Output */}
              <circle r="3.5" fill="#3b82f6" className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]">
                <animateMotion dur={`${animDuration * 1.5}s`} repeatCount="indefinite">
                  <mpath href="#path-cu-to-output" />
                </animateMotion>
              </circle>
            </g>
          )}

          {/* ========================================================
              5. THE FIVE CORE HARDWARE COMPONENT BOXES
             ======================================================== */}
          {/* A. ALU BOX (Top inside CPU) */}
          <g
            id="unit-alu"
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredUnit('alu')}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => setPinnedUnit(pinnedUnit === 'alu' ? null : 'alu')}
          >
            <rect
              x="370"
              y="70"
              width="260"
              height="85"
              rx="10"
              className={`transition-all duration-200 ${
                activeUnit === 'alu'
                  ? 'fill-amber-500/15 stroke-amber-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]'
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

          {/* B. MEMORY BOX (Middle inside CPU) */}
          <g
            id="unit-memory"
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredUnit('memory')}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => setPinnedUnit(pinnedUnit === 'memory' ? null : 'memory')}
          >
            <rect
              x="370"
              y="220"
              width="260"
              height="95"
              rx="10"
              className={`transition-all duration-200 ${
                activeUnit === 'memory'
                  ? 'fill-emerald-500/15 stroke-emerald-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]'
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

          {/* C. CONTROL UNIT BOX (Bottom inside CPU) */}
          <g
            id="unit-cu"
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredUnit('cu')}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => setPinnedUnit(pinnedUnit === 'cu' ? null : 'cu')}
          >
            <rect
              x="370"
              y="380"
              width="260"
              height="85"
              rx="10"
              className={`transition-all duration-200 ${
                activeUnit === 'cu'
                  ? 'fill-purple-500/15 stroke-purple-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]'
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

          {/* D. INPUT DEVICE BOX (Left of CPU) */}
          <g
            id="unit-input"
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredUnit('input')}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => setPinnedUnit(pinnedUnit === 'input' ? null : 'input')}
          >
            <rect
              x="170"
              y="220"
              width="140"
              height="95"
              rx="10"
              className={`transition-all duration-200 ${
                activeUnit === 'input'
                  ? 'fill-sky-500/15 stroke-sky-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(2,132,199,0.4)]'
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

          {/* E. OUTPUT DEVICE BOX (Right of CPU) */}
          <g
            id="unit-output"
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredUnit('output')}
            onMouseLeave={() => setHoveredUnit(null)}
            onClick={() => setPinnedUnit(pinnedUnit === 'output' ? null : 'output')}
          >
            <rect
              x="690"
              y="220"
              width="140"
              height="95"
              rx="10"
              className={`transition-all duration-200 ${
                activeUnit === 'output'
                  ? 'fill-rose-500/15 stroke-rose-500 stroke-[3] filter drop-shadow-[0_0_12px_rgba(225,29,72,0.4)]'
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

          {/* ========================================================
              6. OPERATOR LABELS (FROM OPERATOR / TO OPERATOR)
             ======================================================== */}
          {/* From Operator Label (Red) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredUnit('input')}
            onMouseLeave={() => setHoveredUnit(null)}
          >
            <text
              x="55"
              y="250"
              textAnchor="middle"
              className="font-black text-[13px] fill-red-600 dark:fill-red-400 select-none tracking-tight"
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

          {/* To Operator Label (Blue) */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredUnit('output')}
            onMouseLeave={() => setHoveredUnit(null)}
          >
            <text
              x="945"
              y="250"
              textAnchor="middle"
              className="font-black text-[13px] fill-blue-600 dark:fill-blue-400 select-none tracking-tight"
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

          {/* Diagram Legend / Subtitle text at bottom */}
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

      {/* ========================================================
          DYNAMIC HOVER / PINNED COMPONENT SPOTLIGHT PANEL
         ======================================================== */}
      {selectedData ? (
        <div className="rounded-3xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#111622] p-5 sm:p-6 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md"
                style={{ backgroundColor: selectedData.accentColor }}
              >
                {selectedData.id === 'alu' && <Cpu className="w-5 h-5" />}
                {selectedData.id === 'memory' && <HardDrive className="w-5 h-5" />}
                {selectedData.id === 'cu' && <Layers className="w-5 h-5" />}
                {selectedData.id === 'input' && <Keyboard className="w-5 h-5" />}
                {selectedData.id === 'output' && <Monitor className="w-5 h-5" />}
                {selectedData.id === 'cpu' && <Zap className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  {selectedData.tag}
                </span>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                  {selectedData.name}
                </h3>
              </div>
            </div>

            {pinnedUnit && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Pinned for Inspection (Click again to unpin)
              </span>
            )}
          </div>

          {/* Overview text */}
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {selectedData.description}
          </p>

          {/* Dynamic Signal Flow Direction ("Going in this way and that way") */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Incoming Signals */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <span className="text-xs font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 rotate-45" />
                <span>Electrical Signals Coming IN (এই ইউনিটে যা প্রবেশ করে):</span>
              </span>
              <div className="space-y-2 text-xs">
                {selectedData.signalsIn?.map((sig, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                    <div className="font-mono font-bold text-[11px] text-sky-600 dark:text-sky-400">
                      {sig.direction}
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 text-[11.5px] mt-0.5">
                      {sig.label}
                    </div>
                    <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {sig.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Outgoing Signals */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                <span>Electrical Signals Going OUT (এই ইউনিট থেকে যা বের হয়):</span>
              </span>
              <div className="space-y-2 text-xs">
                {selectedData.signalsOut?.map((sig, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                    <div className="font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                      {sig.direction}
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 text-[11.5px] mt-0.5">
                      {sig.label}
                    </div>
                    <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {sig.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crucial Teaching Rule Alert */}
          {selectedData.crucialRule && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{selectedData.crucialRule}</span>
            </div>
          )}
        </div>
      ) : (
        /* Default Hint State */
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-4 text-center text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-sky-500" />
          <span>
            Hover over any component (like <strong>ALU</strong>, <strong>Memory</strong>, or <strong>Control Unit</strong>) in the diagram above to inspect how electrical signals travel in and out!
          </span>
        </div>
      )}

      {/* ========================================================
          QUICK SIGNAL INTERACTION BENCH
         ======================================================== */}
      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-700 dark:text-neutral-300">
            Signal Legend:
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Solid Red: Information Flow (Data Packets)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Dotted Blue: Timing & Control Signals (Control Unit)
          </span>
        </div>

        <div className="text-[11px] font-semibold text-neutral-500">
          Source: Web-101 Lecture 01 & 02 Curriculum Diagram
        </div>
      </div>
    </div>
  );
};

export default FiveUnitsHubVisualizer;
