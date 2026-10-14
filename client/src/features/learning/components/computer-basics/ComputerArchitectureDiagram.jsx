import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layers,
  Sparkles,
  Cpu,
  Zap,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Monitor,
} from 'lucide-react';
import DataFlowConnection from './DataFlowConnection';
import ComputerDiagramNode from './ComputerDiagramNode';
import SimulationControls from './SimulationControls';
import ComponentDetailsPanel from './ComponentDetailsPanel';
import VirtualMonitor from './VirtualMonitor';
import ElectronicCircuitsExploration from './ElectronicCircuitsExploration';

export const ComputerArchitectureDiagram = ({
  lang = 'both',
  onSimulationComplete,
}) => {
  // Navigation Mode: 'simulation' | 'explorer' | 'electronics'
  const [activeTab, setActiveTab] = useState('simulation');

  // Simulation Step: 1 to 9
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Selected component node for inspector details
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Custom calculation parameters (defaults to lecture: 10 + 20 = 30)
  const [customInput, setCustomInput] = useState({
    a: 10,
    b: 20,
    op: '+',
  });

  const timerRef = useRef(null);

  // Arithmetic calculation
  const calculateResult = useCallback(() => {
    const { a, b, op } = customInput;
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b !== 0 ? Math.round((a / b) * 100) / 100 : 'Div0 Error';
      default:
        return a + b;
    }
  }, [customInput]);

  const result = calculateResult();
  const opSymbol = customInput.op === '*' ? '×' : customInput.op === '/' ? '÷' : customInput.op;

  // Step definitions matching the lecture syllabus and museum-quality narrative
  const STEPS = [
    {
      step: 1,
      title: 'Scene 1: Operator Enters Input Data',
      description: `The human operator types the operands (${customInput.a} and ${customInput.b}) and the calculation instruction (${opSymbol}) using the input device.`,
      activeNodes: ['operator', 'input'],
      activeFlow: 'info',
      activeConnections: ['operator-to-input'],
      payload: `${customInput.a}, ${customInput.b}`,
      nodeStates: {
        operator: { label: 'Action:', value: `Typing ${customInput.a} ${opSymbol} ${customInput.b}` },
        input: { label: 'Switch:', value: 'Key Pressed' },
        memory: { label: 'RAM:', value: 'Addresses Empty' },
        alu: { label: 'ALU:', value: 'Standby' },
        controlUnit: { label: 'CU:', value: 'Monitoring Bus' },
        output: { label: 'Display:', value: 'Standby' },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: null },
          { addr: '0x02', val: null },
          { addr: '0x03', val: null },
        ],
        aluRegisters: { regA: null, regB: null, op: opSymbol, acc: null, resultReady: false },
        cuState: { command: 'MONITOR_BUS' },
        inputState: { binary: 'KEYSTROKE' },
        outputState: { buffer: 'STANDBY' },
        operatorState: { text: `Entering ${customInput.a} ${opSymbol} ${customInput.b}` },
        virtualMonitor: { isOn: false, displayValue: null, status: 'STANDBY' },
      },
      previewResult: result,
    },
    {
      step: 2,
      title: 'Scene 2: Input Device Encodes to Binary',
      description:
        'The input device registers the mechanical keystrokes, converts them into digital binary signals, and packages the data into the input buffer.',
      activeNodes: ['input'],
      activeFlow: null,
      activeConnections: [],
      payload: null,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: `[${customInput.a}, ${customInput.b}] Ready` },
        memory: { label: 'RAM:', value: 'Ready for Write' },
        alu: { label: 'ALU:', value: 'Standby' },
        controlUnit: { label: 'CU:', value: 'Ready to Sync' },
        output: { label: 'Display:', value: 'Blank' },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: null },
          { addr: '0x02', val: null },
          { addr: '0x03', val: null },
        ],
        aluRegisters: { regA: null, regB: null, op: opSymbol, acc: null, resultReady: false },
        cuState: { command: 'POLL_INPUT' },
        inputState: { binary: `${Number(customInput.a).toString(2).padStart(8, '0')}` },
        outputState: { buffer: 'STANDBY' },
        operatorState: { text: 'Keystrokes registered' },
        virtualMonitor: { isOn: false, displayValue: null, status: 'STANDBY' },
      },
      previewResult: result,
    },
    {
      step: 3,
      title: 'Scene 3: Data Packet Travels Directly to Memory',
      description:
        'The input packet travels across the solid information-flow bus directly into Memory addresses. (Notice: data NEVER goes straight to the ALU; it must enter Memory first!).',
      activeNodes: ['input', 'memory'],
      activeFlow: 'info',
      activeConnections: ['input-to-memory'],
      payload: `[${customInput.a}, ${customInput.b}]`,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Sent to RAM' },
        memory: { label: 'Stored:', value: `0x01=${customInput.a}, 0x02=${customInput.b}` },
        alu: { label: 'ALU:', value: 'Standby' },
        controlUnit: { label: 'CU:', value: 'Scheduling ALU' },
        output: { label: 'Display:', value: 'Blank' },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: customInput.a, isHighlighted: true },
          { addr: '0x02', val: customInput.b, isHighlighted: true },
          { addr: '0x03', val: null },
        ],
        aluRegisters: { regA: null, regB: null, op: opSymbol, acc: null, resultReady: false },
        cuState: { command: 'WRITE_RAM' },
        inputState: { binary: 'PACKET SENT' },
        outputState: { buffer: 'STANDBY' },
        operatorState: { text: 'Waiting for computer' },
        virtualMonitor: { isOn: false, displayValue: null, status: 'STANDBY' },
      },
      previewResult: result,
    },
    {
      step: 4,
      title: 'Scene 4: Control Unit Coordinates Execution',
      description:
        'The Control Unit (CU) issues electronic timing and supervisory signals (dashed lines) to Memory and ALU, commanding them to synchronize for calculation.',
      activeNodes: ['controlUnit', 'memory', 'alu'],
      activeFlow: 'control',
      activeConnections: ['cu-to-memory', 'cu-to-alu'],
      payload: 'SYNC',
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Signal:', value: 'Read Enable (0x01,0x02)' },
        alu: { label: 'Signal:', value: `CMD: EXECUTE ${opSymbol}` },
        controlUnit: { label: 'Active:', value: 'Pulsing CLK & CMD' },
        output: { label: 'Display:', value: 'Blank' },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: customInput.a, isHighlighted: true },
          { addr: '0x02', val: customInput.b, isHighlighted: true },
          { addr: '0x03', val: null },
        ],
        aluRegisters: { regA: null, regB: null, op: opSymbol, acc: null, resultReady: false },
        cuState: { command: `SYNC_MEM_ALU (${opSymbol})` },
        inputState: { binary: '0000 0000' },
        outputState: { buffer: 'STANDBY' },
        operatorState: { text: 'Control signals dispatching' },
        virtualMonitor: { isOn: false, displayValue: null, status: 'STANDBY' },
      },
      previewResult: result,
    },
    {
      step: 5,
      title: 'Scene 5: Operands Sent from Memory to ALU',
      description:
        'Under Control Unit timing, Memory transmits the operands over the internal data bus into the ALU input registers (RegA and RegB). The ALU waits until all operands arrive.',
      activeNodes: ['memory', 'alu'],
      activeFlow: 'info',
      activeConnections: ['memory-to-alu-fwd'],
      payload: `${customInput.a}, ${customInput.b}`,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Sending:', value: `Bus: ${customInput.a}, ${customInput.b}` },
        alu: { label: 'Registers:', value: `A=${customInput.a}, B=${customInput.b}` },
        controlUnit: { label: 'CU:', value: 'Verifying Sync' },
        output: { label: 'Display:', value: 'Blank' },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: customInput.a },
          { addr: '0x02', val: customInput.b },
          { addr: '0x03', val: null },
        ],
        aluRegisters: { regA: customInput.a, regB: customInput.b, op: opSymbol, acc: null, resultReady: false },
        cuState: { command: 'FETCH_OPERANDS' },
        inputState: { binary: '0000 0000' },
        outputState: { buffer: 'STANDBY' },
        operatorState: { text: 'Operands loaded into ALU' },
        virtualMonitor: { isOn: false, displayValue: null, status: 'STANDBY' },
      },
      previewResult: result,
    },
    {
      step: 6,
      title: 'Scene 6: ALU Computes Arithmetic Operation',
      description: `The ALU arithmetic logic circuits execute the calculation (${customInput.a} ${opSymbol} ${customInput.b}) and produce the computed result: ${result}!`,
      activeNodes: ['alu'],
      activeFlow: null,
      activeConnections: [],
      payload: null,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'RAM:', value: 'Awaiting Write' },
        alu: { label: 'Result:', value: `${customInput.a} ${opSymbol} ${customInput.b} = ${result}` },
        controlUnit: { label: 'CU:', value: 'Latch Result' },
        output: { label: 'Display:', value: 'Blank' },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: customInput.a },
          { addr: '0x02', val: customInput.b },
          { addr: '0x03', val: null },
        ],
        aluRegisters: { regA: customInput.a, regB: customInput.b, op: opSymbol, acc: result, resultReady: true },
        cuState: { command: `EXEC_${customInput.op === '+' ? 'ADD' : 'MATH'}` },
        inputState: { binary: '0000 0000' },
        outputState: { buffer: 'STANDBY' },
        operatorState: { text: 'Calculation complete' },
        virtualMonitor: { isOn: false, displayValue: null, status: 'STANDBY' },
      },
      previewResult: result,
    },
    {
      step: 7,
      title: 'Scene 7: Result Returned Back into Memory',
      description: `The ALU writes the computed result (${result}) back across the bidirectional connection into Memory address 0x03. (The ALU never writes directly to output!).`,
      activeNodes: ['alu', 'memory'],
      activeFlow: 'info',
      activeConnections: ['alu-to-memory-rev'],
      payload: `${result}`,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Saved 0x03:', value: `Result = ${result}` },
        alu: { label: 'Acc:', value: `Sent ${result} to RAM` },
        controlUnit: { label: 'CU:', value: 'Notify Output' },
        output: { label: 'Display:', value: 'Blank' },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: customInput.a },
          { addr: '0x02', val: customInput.b },
          { addr: '0x03', val: result, isHighlighted: true },
        ],
        aluRegisters: { regA: customInput.a, regB: customInput.b, op: opSymbol, acc: result, resultReady: true },
        cuState: { command: 'STORE_RESULT' },
        inputState: { binary: '0000 0000' },
        outputState: { buffer: 'STANDBY' },
        operatorState: { text: 'Result saved in Memory' },
        virtualMonitor: { isOn: false, displayValue: null, status: 'STANDBY' },
      },
      previewResult: result,
    },
    {
      step: 8,
      title: 'Scene 8: Memory Transmits Result to Output Device',
      description: `The Control Unit signals Memory to push the saved result (${result}) to the Output Device, which rasters the pixels and feeds the virtual monitor!`,
      activeNodes: ['controlUnit', 'memory', 'output'],
      activeFlow: 'both',
      activeConnections: ['cu-to-output', 'memory-to-output', 'output-to-monitor'],
      payload: `${result}`,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Sending:', value: `0x03 -> Output` },
        alu: { label: 'ALU:', value: 'Math Done' },
        controlUnit: { label: 'CU:', value: 'Display Enable' },
        output: { label: 'Buffer:', value: `Received ${result}` },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: customInput.a },
          { addr: '0x02', val: customInput.b },
          { addr: '0x03', val: result },
        ],
        aluRegisters: { regA: null, regB: null, op: opSymbol, acc: 'DONE', resultReady: true },
        cuState: { command: 'ENABLE_OUTPUT' },
        inputState: { binary: '0000 0000' },
        outputState: { buffer: `LATCH [${result}]` },
        operatorState: { text: 'Monitor illuminating...' },
        virtualMonitor: { isOn: true, displayValue: result, status: 'ACTIVE_RASTER' },
      },
      previewResult: result,
    },
    {
      step: 9,
      title: 'Scene 9: Output Display Presents Result to Operator',
      description: `The Output Device illuminates the virtual monitor displaying "${result}", and the human operator visually receives the completed answer!`,
      activeNodes: ['output', 'operator'],
      activeFlow: 'info',
      activeConnections: ['output-to-operator', 'output-to-monitor'],
      payload: `${result}`,
      nodeStates: {
        operator: { label: 'Received:', value: `Sees "${result}"! 🎉` },
        input: { label: 'Buffer:', value: 'Ready' },
        memory: { label: 'RAM:', value: 'Stored in 0x03' },
        alu: { label: 'ALU:', value: 'Idle' },
        controlUnit: { label: 'CU:', value: 'Cycle Complete' },
        output: { label: 'Screen:', value: `Rendered "${result}"` },
      },
      detailedState: {
        ramCells: [
          { addr: '0x01', val: customInput.a },
          { addr: '0x02', val: customInput.b },
          { addr: '0x03', val: result },
        ],
        aluRegisters: { regA: null, regB: null, op: opSymbol, acc: 'DONE', resultReady: true },
        cuState: { command: 'CYCLE_COMPLETE' },
        inputState: { binary: '0000 0000' },
        outputState: { buffer: `DISPLAYED [${result}]` },
        operatorState: { text: `Viewing "${result}"! Complete.` },
        virtualMonitor: { isOn: true, displayValue: result, status: 'SIGNAL_LOCKED' },
      },
      previewResult: result,
    },
  ];

  const currentStepData = STEPS[currentStep - 1] || STEPS[0];

  // Auto-play timer management
  useEffect(() => {
    if (isPlaying) {
      const stepDuration = 2800 / speed;
      timerRef.current = setTimeout(() => {
        if (currentStep < 9) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          if (onSimulationComplete) onSimulationComplete();
        }
      }, stepDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, onSimulationComplete]);

  const handlePlay = () => {
    if (currentStep >= 9) {
      setCurrentStep(1);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentStep(1);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isNodeActive = (nodeId) => currentStepData.activeNodes?.includes(nodeId);
  const isConnActive = (connId) => currentStepData.activeConnections?.includes(connId);

  // Geometric coordinates for clean scalable SVG diagram:
  // Control Unit:   x: 420, y: 15,  w: 200, h: 95
  // Input:          x: 180, y: 150, w: 180, h: 125
  // Memory:         x: 420, y: 150, w: 200, h: 125
  // ALU:            x: 680, y: 150, w: 190, h: 125
  // Operator:       x: 20,  y: 220, w: 130, h: 120
  // Output Device:  x: 420, y: 345, w: 190, h: 120
  // Virtual Monitor x: 660, y: 345, w: 230, h: 120
  const NODES = {
    operator: { x: 20, y: 220, w: 130, h: 120, title: 'Operator', sub: 'Human User' },
    input: { x: 180, y: 150, w: 180, h: 125, title: 'Input Device', sub: 'Keyboard / Encoder' },
    memory: { x: 420, y: 150, w: 200, h: 125, title: 'Memory Unit', sub: 'Primary RAM' },
    alu: { x: 680, y: 150, w: 190, h: 125, title: 'ALU', sub: 'Arithmetic & Logic Unit' },
    controlUnit: { x: 420, y: 15, w: 200, h: 95, title: 'Control Unit (CU)', sub: 'Coordinator / Clock' },
    output: { x: 420, y: 345, w: 190, h: 120, title: 'Output Device', sub: 'Display Adapter' },
    virtualMonitor: { x: 660, y: 345, w: 230, h: 120 },
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ========================================================
          TOP NAVIGATION BAR: 3 COMPREHENSIVE LEARNING MODES
         ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-neutral-100/80 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Guided 10 + 20 = 30 Simulation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('explorer');
              if (!selectedComponent) setSelectedComponent('memory');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'explorer'
                ? 'bg-sky-500 text-white shadow-xs shadow-sky-500/30'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Live Component Explorer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('electronics')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'electronics'
                ? 'bg-purple-600 text-white shadow-xs shadow-purple-500/30'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Inside Electronic Devices (Logic & Gates)</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Interactive Computer Architecture Lab</span>
        </div>
      </div>

      {/* ========================================================
          MODE 1: GUIDED SIMULATION & INTERACTIVE SVG DIAGRAM
         ======================================================== */}
      {activeTab === 'simulation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Simulation Controls at Top */}
          <SimulationControls
            currentStep={currentStep}
            totalSteps={9}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onRestart={handleRestart}
            onNext={handleNext}
            onPrev={handlePrev}
            speed={speed}
            onSpeedChange={setSpeed}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
            customInput={customInput}
            onUpdateCustomInput={setCustomInput}
            stepInfo={currentStepData}
          />

          {/* Interactive Technical Visualization Canvas */}
          <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-[#f8fafc] dark:bg-[#080c14] p-3 sm:p-5 shadow-sm overflow-hidden select-none">
            {/* Subtle technical coordinate grid */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Diagram SVG Canvas */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox="0 0 1020 500"
                className="w-full min-w-[840px] h-auto drop-shadow-xs"
                aria-label="Interactive Functional Block Diagram of a Typical Computer"
              >
                {/* SVG Marker Definitions for Directional Arrow Heads */}
                <defs>
                  {/* Solid Cyan Arrow (Info Flow) */}
                  <marker
                    id="arrow-info"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7" />
                  </marker>

                  {/* Active Glowing Solid Arrow */}
                  <marker
                    id="arrow-info-active"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>

                  {/* Dashed Amber Arrow (Control Signal) */}
                  <marker
                    id="arrow-control"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#d97706" />
                  </marker>

                  <marker
                    id="arrow-control-active"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                </defs>

                {/* ========================================================
                    1. CONTROL SIGNALS (Dashed Lines from Control Unit)
                   ======================================================== */}
                {/* CU to Memory (Straight down) */}
                <DataFlowConnection
                  id="cu-to-memory"
                  from={{ x: 520, y: 110 }}
                  to={{ x: 520, y: 150 }}
                  type="control"
                  isActive={isConnActive('cu-to-memory')}
                  reducedMotion={reducedMotion}
                  payload="SYNC"
                  speed={speed}
                />

                {/* CU to Input Device (Angled left-down) */}
                <DataFlowConnection
                  id="cu-to-input"
                  from={{
                    x: 420,
                    y: 65,
                    pathPoints: 'M 420 65 Q 345 95 270 150',
                  }}
                  to={{ x: 270, y: 150 }}
                  type="control"
                  isActive={isConnActive('cu-to-input')}
                  reducedMotion={reducedMotion}
                  payload="CMD"
                  speed={speed}
                />

                {/* CU to ALU (Angled right-down) */}
                <DataFlowConnection
                  id="cu-to-alu"
                  from={{
                    x: 620,
                    y: 65,
                    pathPoints: 'M 620 65 Q 695 95 775 150',
                  }}
                  to={{ x: 775, y: 150 }}
                  type="control"
                  isActive={isConnActive('cu-to-alu')}
                  reducedMotion={reducedMotion}
                  payload="EXEC"
                  speed={speed}
                />

                {/* CU to Output Device (Curved bypass left) */}
                <DataFlowConnection
                  id="cu-to-output"
                  from={{
                    x: 420,
                    y: 80,
                    pathPoints: 'M 420 80 C 375 140 375 320 420 385',
                  }}
                  to={{ x: 420, y: 385 }}
                  type="control"
                  isActive={isConnActive('cu-to-output')}
                  reducedMotion={reducedMotion}
                  payload="DISP"
                  speed={speed}
                />

                {/* ========================================================
                    2. INFORMATION FLOW CONNECTIONS (Solid Lines)
                   ======================================================== */}
                {/* Operator to Input Device */}
                <DataFlowConnection
                  id="operator-to-input"
                  from={{
                    x: 150,
                    y: 280,
                    pathPoints: 'M 150 280 Q 165 245 180 212',
                  }}
                  to={{ x: 180, y: 212 }}
                  type="info"
                  isActive={isConnActive('operator-to-input')}
                  reducedMotion={reducedMotion}
                  payload={currentStepData.payload}
                  speed={speed}
                />

                {/* Input Device to Memory (Straight horizontal) */}
                <DataFlowConnection
                  id="input-to-memory"
                  from={{ x: 360, y: 212 }}
                  to={{ x: 420, y: 212 }}
                  type="info"
                  isActive={isConnActive('input-to-memory')}
                  reducedMotion={reducedMotion}
                  payload={currentStepData.payload}
                  speed={speed}
                />

                {/* Memory to ALU (Operands Forward) */}
                <DataFlowConnection
                  id="memory-to-alu"
                  from={{ x: 620, y: 190 }}
                  to={{ x: 680, y: 190 }}
                  type="info"
                  isActive={isConnActive('memory-to-alu-fwd')}
                  reducedMotion={reducedMotion}
                  payload={isConnActive('memory-to-alu-fwd') ? currentStepData.payload : null}
                  speed={speed}
                />

                {/* ALU back to Memory (Result Return) */}
                <DataFlowConnection
                  id="alu-to-memory"
                  from={{ x: 680, y: 230 }}
                  to={{ x: 620, y: 230 }}
                  type="info"
                  isActive={isConnActive('alu-to-memory-rev')}
                  reducedMotion={reducedMotion}
                  payload={isConnActive('alu-to-memory-rev') ? currentStepData.payload : null}
                  speed={speed}
                />

                {/* Memory to Output Device (Straight vertical down) */}
                <DataFlowConnection
                  id="memory-to-output"
                  from={{ x: 515, y: 275 }}
                  to={{ x: 515, y: 345 }}
                  type="info"
                  isActive={isConnActive('memory-to-output')}
                  reducedMotion={reducedMotion}
                  payload={isConnActive('memory-to-output') ? currentStepData.payload : null}
                  speed={speed}
                />

                {/* Output Device to Virtual Monitor */}
                <DataFlowConnection
                  id="output-to-monitor"
                  from={{ x: 610, y: 405 }}
                  to={{ x: 660, y: 405 }}
                  type="info"
                  isActive={isConnActive('output-to-monitor')}
                  reducedMotion={reducedMotion}
                  payload={isConnActive('output-to-monitor') ? currentStepData.payload : null}
                  speed={speed}
                />

                {/* Output Device back to Operator (Visual Perception Path) */}
                <DataFlowConnection
                  id="output-to-operator"
                  from={{
                    x: 420,
                    y: 405,
                    pathPoints: 'M 420 405 C 280 470 140 430 85 340',
                  }}
                  to={{ x: 85, y: 340 }}
                  type="info"
                  isActive={isConnActive('output-to-operator')}
                  reducedMotion={reducedMotion}
                  payload={isConnActive('output-to-operator') ? currentStepData.payload : null}
                  speed={speed}
                />

                {/* ========================================================
                    3. THE HARDWARE COMPONENT NODES
                   ======================================================== */}
                {/* Operator */}
                <ComputerDiagramNode
                  id="operator"
                  title={NODES.operator.title}
                  subtitle={NODES.operator.sub}
                  x={NODES.operator.x}
                  y={NODES.operator.y}
                  width={NODES.operator.w}
                  height={NODES.operator.h}
                  isActive={isNodeActive('operator')}
                  isSelected={selectedComponent === 'operator'}
                  onSelect={setSelectedComponent}
                  onHover={setSelectedComponent}
                  liveData={currentStepData.nodeStates?.operator}
                  detailedState={currentStepData.detailedState}
                  reducedMotion={reducedMotion}
                />

                {/* Input Device */}
                <ComputerDiagramNode
                  id="input"
                  title={NODES.input.title}
                  subtitle={NODES.input.sub}
                  x={NODES.input.x}
                  y={NODES.input.y}
                  width={NODES.input.w}
                  height={NODES.input.h}
                  isActive={isNodeActive('input')}
                  isSelected={selectedComponent === 'input'}
                  onSelect={setSelectedComponent}
                  onHover={setSelectedComponent}
                  liveData={currentStepData.nodeStates?.input}
                  detailedState={currentStepData.detailedState}
                  reducedMotion={reducedMotion}
                />

                {/* Control Unit */}
                <ComputerDiagramNode
                  id="controlUnit"
                  title={NODES.controlUnit.title}
                  subtitle={NODES.controlUnit.sub}
                  x={NODES.controlUnit.x}
                  y={NODES.controlUnit.y}
                  width={NODES.controlUnit.w}
                  height={NODES.controlUnit.h}
                  isActive={isNodeActive('controlUnit')}
                  isSelected={selectedComponent === 'controlUnit'}
                  onSelect={setSelectedComponent}
                  onHover={setSelectedComponent}
                  liveData={currentStepData.nodeStates?.controlUnit}
                  detailedState={currentStepData.detailedState}
                  reducedMotion={reducedMotion}
                />

                {/* Memory Unit */}
                <ComputerDiagramNode
                  id="memory"
                  title={NODES.memory.title}
                  subtitle={NODES.memory.sub}
                  x={NODES.memory.x}
                  y={NODES.memory.y}
                  width={NODES.memory.w}
                  height={NODES.memory.h}
                  isActive={isNodeActive('memory')}
                  isSelected={selectedComponent === 'memory'}
                  onSelect={setSelectedComponent}
                  onHover={setSelectedComponent}
                  liveData={currentStepData.nodeStates?.memory}
                  detailedState={currentStepData.detailedState}
                  reducedMotion={reducedMotion}
                />

                {/* Arithmetic & Logic Unit (ALU) */}
                <ComputerDiagramNode
                  id="alu"
                  title={NODES.alu.title}
                  subtitle={NODES.alu.sub}
                  x={NODES.alu.x}
                  y={NODES.alu.y}
                  width={NODES.alu.w}
                  height={NODES.alu.h}
                  isActive={isNodeActive('alu')}
                  isSelected={selectedComponent === 'alu'}
                  onSelect={setSelectedComponent}
                  onHover={setSelectedComponent}
                  liveData={currentStepData.nodeStates?.alu}
                  detailedState={currentStepData.detailedState}
                  reducedMotion={reducedMotion}
                />

                {/* Output Device */}
                <ComputerDiagramNode
                  id="output"
                  title={NODES.output.title}
                  subtitle={NODES.output.sub}
                  x={NODES.output.x}
                  y={NODES.output.y}
                  width={NODES.output.w}
                  height={NODES.output.h}
                  isActive={isNodeActive('output')}
                  isSelected={selectedComponent === 'output'}
                  onSelect={setSelectedComponent}
                  onHover={setSelectedComponent}
                  liveData={currentStepData.nodeStates?.output}
                  detailedState={currentStepData.detailedState}
                  reducedMotion={reducedMotion}
                />

                {/* 4. DEDICATED VIRTUAL MONITOR (Output Screen) */}
                <VirtualMonitor
                  x={NODES.virtualMonitor.x}
                  y={NODES.virtualMonitor.y}
                  width={NODES.virtualMonitor.w}
                  height={NODES.virtualMonitor.h}
                  isOn={currentStepData.detailedState?.virtualMonitor?.isOn}
                  displayValue={currentStepData.detailedState?.virtualMonitor?.displayValue}
                  formula={`${customInput.a} ${opSymbol} ${customInput.b} =`}
                  status={currentStepData.detailedState?.virtualMonitor?.status}
                  reducedMotion={reducedMotion}
                />
              </svg>
            </div>
          </div>

          {/* Completion Celebration Card (Step 9) */}
          {currentStep === 9 && (
            <div className="rounded-3xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/20 p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Simulation Complete / কার্যপ্রক্রিয়া সম্পন্ন
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                      Result Verified: {customInput.a} {opSymbol} {customInput.b} = {result}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Run Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('explorer');
                      setSelectedComponent('alu');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Explore ALU & Components</span>
                  </button>
                </div>
              </div>

              {/* Data Journey Summary */}
              <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-900/60">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block mb-1.5">
                  Summary of the Data Path (ইনফরমেশন চলাচলের পথ):
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono font-bold text-neutral-700 dark:text-neutral-300">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    Operator
                  </span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    Input Device
                  </span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    Memory (RAM)
                  </span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    ALU (Calc)
                  </span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    Memory (Store)
                  </span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    Output Device
                  </span>
                  <ArrowRight className="w-3 h-3 text-sky-500" />
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Virtual Screen ({result})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Inspection Panel */}
          {selectedComponent && (
            <ComponentDetailsPanel
              componentId={selectedComponent}
              onClose={() => setSelectedComponent(null)}
              lang={lang}
              currentStepData={currentStepData}
            />
          )}
        </div>
      )}

      {/* ========================================================
          MODE 2: LIVE COMPONENT EXPLORER
         ======================================================== */}
      {activeTab === 'explorer' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f141d] p-5 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                Interactive Component Anatomy
              </span>
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
                Select a Component to Inspect Its Live Circuitry & Test Bench
              </h3>
            </div>

            {/* Component Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'memory', title: 'Memory Unit', badge: 'RAM Cells' },
                { id: 'alu', title: 'ALU', badge: 'Logic & Math' },
                { id: 'controlUnit', title: 'Control Unit', badge: 'Supervisor' },
                { id: 'input', title: 'Input Device', badge: 'Binary Encoder' },
                { id: 'output', title: 'Output Device', badge: 'Video Buffer' },
                { id: 'operator', title: 'Operator', badge: 'Human User' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedComponent(c.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedComponent === c.id
                      ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className="text-[10px] text-neutral-400 font-bold block">{c.badge}</span>
                  <span className="text-xs font-black">{c.title}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedComponent && (
            <ComponentDetailsPanel
              componentId={selectedComponent}
              onClose={() => setSelectedComponent(null)}
              lang={lang}
              currentStepData={currentStepData}
            />
          )}
        </div>
      )}

      {/* ========================================================
          MODE 3: INSIDE ELECTRONIC DEVICES (TRANSISTORS & GATES)
         ======================================================== */}
      {activeTab === 'electronics' && (
        <div className="animate-in fade-in duration-200">
          <ElectronicCircuitsExploration lang={lang} />
        </div>
      )}
    </div>
  );
};

export default ComputerArchitectureDiagram;
