import React, { useState, useEffect, useRef, useCallback } from 'react';
import DataFlowConnection from './DataFlowConnection';
import ComputerDiagramNode from './ComputerDiagramNode';
import SimulationControls from './SimulationControls';
import ComponentDetailsPanel from './ComponentDetailsPanel';

export const ComputerArchitectureDiagram = ({
  lang = 'both',
  onSimulationComplete,
}) => {
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

  // Selected component node for the detail inspection panel
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Custom calculation parameters (defaults to lecture: 10 + 20 = 30)
  const [customInput, setCustomInput] = useState({
    a: 10,
    b: 20,
    op: '+',
  });

  const timerRef = useRef(null);

  // Calculate arithmetic result
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

  // Step definitions matching the lecture syllabus
  const STEPS = [
    {
      step: 1,
      title: 'Step 1: Operator Enters Input Data',
      description: `The human operator types the operands (${customInput.a} and ${customInput.b}) and the calculation instruction (${opSymbol}) using the input device.`,
      activeNodes: ['operator', 'input'],
      activeFlow: 'info',
      activeConnections: ['operator-to-input'],
      payload: `${customInput.a}, ${customInput.b}`,
      nodeStates: {
        operator: { label: 'Action:', value: `Entering ${customInput.a} ${opSymbol} ${customInput.b}` },
        input: { label: 'Reading:', value: 'Key switch closed' },
        memory: { label: 'RAM:', value: 'Addresses empty' },
        alu: { label: 'ALU:', value: 'Standby' },
        controlUnit: { label: 'CU:', value: 'Monitoring bus' },
        output: { label: 'Display:', value: 'Ready' },
      },
      previewResult: result,
    },
    {
      step: 2,
      title: 'Step 2: Input Device Encodes to Binary',
      description:
        'The input device registers the mechanical keystrokes, converts them into digital binary signals, and buffers the data packets.',
      activeNodes: ['input'],
      activeFlow: null,
      activeConnections: [],
      payload: null,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: `[${customInput.a}, ${customInput.b}] ready` },
        memory: { label: 'RAM:', value: 'Ready for write' },
        alu: { label: 'ALU:', value: 'Standby' },
        controlUnit: { label: 'CU:', value: 'Ready to sync' },
        output: { label: 'Display:', value: 'Blank' },
      },
      previewResult: result,
    },
    {
      step: 3,
      title: 'Step 3: Data Packet Travels to Memory',
      description:
        'The input packet travels across the solid information-flow bus directly into Memory addresses. (Notice: data never goes straight to the ALU!).',
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
      previewResult: result,
    },
    {
      step: 4,
      title: 'Step 4: Control Unit Coordinates Execution',
      description:
        'The Control Unit (CU) issues electronic timing and control signals (dashed lines) to Memory and ALU, commanding them to sync up.',
      activeNodes: ['controlUnit', 'memory', 'alu'],
      activeFlow: 'control',
      activeConnections: ['cu-to-memory', 'cu-to-alu'],
      payload: 'SYNC',
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Signal:', value: 'Read Enable (0x01,0x02)' },
        alu: { label: 'Signal:', value: `CMD: EXECUTE ${opSymbol}` },
        controlUnit: { label: 'Active:', value: `Pulsing CLK & CMD` },
        output: { label: 'Display:', value: 'Blank' },
      },
      previewResult: result,
    },
    {
      step: 5,
      title: 'Step 5: Operands Sent from Memory to ALU',
      description:
        'Under Control Unit timing, Memory transmits the operands over the internal data bus into the ALU input registers.',
      activeNodes: ['memory', 'alu'],
      activeFlow: 'info',
      activeConnections: ['memory-to-alu-fwd'],
      payload: `${customInput.a}, ${customInput.b}`,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Sending:', value: `Bus: ${customInput.a}, ${customInput.b}` },
        alu: { label: 'Registers:', value: `RegA=${customInput.a}, RegB=${customInput.b}` },
        controlUnit: { label: 'CU:', value: 'Verifying sync' },
        output: { label: 'Display:', value: 'Blank' },
      },
      previewResult: result,
    },
    {
      step: 6,
      title: 'Step 6: ALU Computes Arithmetic Operation',
      description: `The ALU arithmetic logic circuits execute the calculation (${customInput.a} ${opSymbol} ${customInput.b}) and produce the computed result: ${result}!`,
      activeNodes: ['alu'],
      activeFlow: null,
      activeConnections: [],
      payload: null,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'RAM:', value: 'Awaiting write' },
        alu: { label: 'Calculated:', value: `${customInput.a} ${opSymbol} ${customInput.b} = ${result}` },
        controlUnit: { label: 'CU:', value: 'Latch result' },
        output: { label: 'Display:', value: 'Blank' },
      },
      previewResult: result,
    },
    {
      step: 7,
      title: 'Step 7: Result Returned Back into Memory',
      description: `The ALU writes the computed result (${result}) back across the bidirectional connection into Memory address 0x03. (The ALU never sends directly to output!).`,
      activeNodes: ['alu', 'memory'],
      activeFlow: 'info',
      activeConnections: ['alu-to-memory-rev'],
      payload: `${result}`,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Saved 0x03:', value: `Result = ${result}` },
        alu: { label: 'Accumulator:', value: `Sent ${result} to RAM` },
        controlUnit: { label: 'CU:', value: 'Notify Output' },
        output: { label: 'Display:', value: 'Blank' },
      },
      previewResult: result,
    },
    {
      step: 8,
      title: 'Step 8: Memory Transmits Result to Output Device',
      description: `The Control Unit signals Memory to push the saved result (${result}) to the Output Device buffer for display presentation.`,
      activeNodes: ['controlUnit', 'memory', 'output'],
      activeFlow: 'both',
      activeConnections: ['cu-to-output', 'memory-to-output'],
      payload: `${result}`,
      nodeStates: {
        operator: { label: 'State:', value: 'Waiting' },
        input: { label: 'Buffer:', value: 'Idle' },
        memory: { label: 'Transmitting:', value: `0x03 -> Output` },
        alu: { label: 'ALU:', value: 'Calculation done' },
        controlUnit: { label: 'CU:', value: 'Display enable' },
        output: { label: 'Video Buffer:', value: `Received ${result}` },
      },
      previewResult: result,
    },
    {
      step: 9,
      title: 'Step 9: Output Device Displays Result to Operator',
      description: `The Output Device (Monitor screen) illuminates pixels rendering the final answer "${result}", and the human operator visually receives it!`,
      activeNodes: ['output', 'operator'],
      activeFlow: 'info',
      activeConnections: ['output-to-operator'],
      payload: `${result}`,
      nodeStates: {
        operator: { label: 'Received:', value: `Sees result ${result}!` },
        input: { label: 'Buffer:', value: 'Ready' },
        memory: { label: 'RAM:', value: 'Stored in 0x03' },
        alu: { label: 'ALU:', value: 'Idle' },
        controlUnit: { label: 'CU:', value: 'Cycle complete' },
        output: { label: 'Screen:', value: `Rendered "${result}"` },
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

  // Layout Nodes:
  // Operator: x: 40, y: 245, w: 160, h: 105
  // Input:    x: 260, y: 155, w: 175, h: 105
  // Memory:   x: 505, y: 155, w: 180, h: 105
  // ALU:      x: 765, y: 155, w: 175, h: 105
  // CU:       x: 505, y: 20,  w: 180, h: 95
  // Output:   x: 505, y: 340, w: 180, h: 105
  const NODES = {
    operator: { x: 40, y: 245, w: 160, h: 105, title: 'Operator', sub: 'Human User' },
    input: { x: 260, y: 155, w: 175, h: 105, title: 'Input Device', sub: 'Keyboard / Mouse' },
    memory: { x: 505, y: 155, w: 180, h: 105, title: 'Memory Unit', sub: 'Primary Storage (RAM)' },
    alu: { x: 765, y: 155, w: 175, h: 105, title: 'ALU', sub: 'Arithmetic & Logic Unit' },
    controlUnit: { x: 505, y: 20, w: 180, h: 95, title: 'Control Unit (CU)', sub: 'Coordinator / Clock' },
    output: { x: 505, y: 340, w: 180, h: 105, title: 'Output Device', sub: 'Monitor / Printer' },
  };

  return (
    <div className="space-y-6">
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

      {/* The Diagram Card */}
      <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c1017] p-3 sm:p-5 shadow-sm overflow-hidden select-none">
        {/* Subtle ambient grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Diagram SVG Canvas */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox="0 0 980 480"
            className="w-full min-w-[760px] h-auto drop-shadow-xs"
            aria-label="Interactive Functional Block Diagram of a Typical Computer"
          >
            {/* SVG Marker Definitions for Directional Arrow Heads */}
            <defs>
              {/* Solid Blue Arrow (Info Flow) */}
              <marker
                id="arrow-info"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
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
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
              </marker>

              {/* Bidirectional Start Arrow */}
              <marker
                id="arrow-info-start"
                viewBox="0 0 10 10"
                refX="3"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 10 1 L 0 5 L 10 9 z" fill="#38bdf8" />
              </marker>

              <marker
                id="arrow-info-active-start"
                viewBox="0 0 10 10"
                refX="3"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 10 1 L 0 5 L 10 9 z" fill="#0284c7" />
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
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
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
                CU connects to Input, Memory, ALU, and Output
               ======================================================== */}
            {/* CU to Memory (Straight down) */}
            <DataFlowConnection
              id="cu-to-memory"
              from={{ x: 595, y: 115 }}
              to={{ x: 595, y: 155 }}
              type="control"
              isActive={isConnActive('cu-to-memory')}
              reducedMotion={reducedMotion}
              payload="SYNC"
            />

            {/* CU to Input Device (Angled left-down) */}
            <DataFlowConnection
              id="cu-to-input"
              from={{ x: 505, y: 65 }}
              to={{ x: 350, y: 155 }}
              type="control"
              isActive={isConnActive('cu-to-input')}
              reducedMotion={reducedMotion}
              payload="CMD"
            />

            {/* CU to ALU (Angled right-down) */}
            <DataFlowConnection
              id="cu-to-alu"
              from={{ x: 685, y: 65 }}
              to={{ x: 850, y: 155 }}
              type="control"
              isActive={isConnActive('cu-to-alu')}
              reducedMotion={reducedMotion}
              payload="EXEC"
            />

            {/* CU to Output Device (Curved route around left edge) */}
            <DataFlowConnection
              id="cu-to-output"
              from={{
                x: 505,
                y: 85,
                pathPoints: 'M 505 85 C 455 110 455 310 505 375',
              }}
              to={{ x: 505, y: 375 }}
              type="control"
              isActive={isConnActive('cu-to-output')}
              reducedMotion={reducedMotion}
              payload="DISP"
            />

            {/* ========================================================
                2. INFORMATION FLOW CONNECTIONS (Solid Lines)
                Operator -> Input -> Memory <-> ALU, Memory -> Output -> Operator
               ======================================================== */}
            {/* Operator to Input Device */}
            <DataFlowConnection
              id="operator-to-input"
              from={{
                x: 200,
                y: 280,
                pathPoints: 'M 200 280 Q 230 250 260 210',
              }}
              to={{ x: 260, y: 210 }}
              type="info"
              isActive={isConnActive('operator-to-input')}
              reducedMotion={reducedMotion}
              payload={currentStepData.payload}
            />

            {/* Input Device to Memory (Straight horizontal) */}
            <DataFlowConnection
              id="input-to-memory"
              from={{ x: 435, y: 207 }}
              to={{ x: 505, y: 207 }}
              type="info"
              isActive={isConnActive('input-to-memory')}
              reducedMotion={reducedMotion}
              payload={currentStepData.payload}
            />

            {/* Memory to ALU (Forward) */}
            <DataFlowConnection
              id="memory-to-alu"
              from={{ x: 685, y: 195 }}
              to={{ x: 765, y: 195 }}
              type="info"
              isActive={isConnActive('memory-to-alu-fwd')}
              bidirectional={false}
              reducedMotion={reducedMotion}
              payload={isConnActive('memory-to-alu-fwd') ? currentStepData.payload : null}
            />

            {/* ALU back to Memory (Reverse return arrow) */}
            <DataFlowConnection
              id="alu-to-memory"
              from={{ x: 765, y: 225 }}
              to={{ x: 685, y: 225 }}
              type="info"
              isActive={isConnActive('alu-to-memory-rev')}
              reducedMotion={reducedMotion}
              payload={isConnActive('alu-to-memory-rev') ? currentStepData.payload : null}
            />

            {/* Memory to Output Device (Straight vertical down) */}
            <DataFlowConnection
              id="memory-to-output"
              from={{ x: 595, y: 260 }}
              to={{ x: 595, y: 340 }}
              type="info"
              isActive={isConnActive('memory-to-output')}
              reducedMotion={reducedMotion}
              payload={isConnActive('memory-to-output') ? currentStepData.payload : null}
            />

            {/* Output Device back to Operator (Curved return path) */}
            <DataFlowConnection
              id="output-to-operator"
              from={{
                x: 505,
                y: 395,
                pathPoints: 'M 505 395 C 330 435 220 375 190 330',
              }}
              to={{ x: 190, y: 330 }}
              type="info"
              isActive={isConnActive('output-to-operator')}
              reducedMotion={reducedMotion}
              payload={isConnActive('output-to-operator') ? currentStepData.payload : null}
            />

            {/* ========================================================
                3. THE SIX COMPONENT NODES
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
              reducedMotion={reducedMotion}
            />
          </svg>
        </div>
      </div>

      {/* Interactive Detail Drawer for Hovered / Focused Component */}
      {selectedComponent && (
        <ComponentDetailsPanel
          componentId={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          lang={lang}
        />
      )}
    </div>
  );
};

export default ComputerArchitectureDiagram;
