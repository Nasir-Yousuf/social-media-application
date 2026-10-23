import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const ElectronicCircuitsExploration = ({ lang = 'both' }) => {
  // Transistor Switch Simulator State
  const [gateVoltage, setGateVoltage] = useState(false); // false = 0V (OFF), true = +5V (ON)

  // Logic Gate Bench State
  const [activeGate, setActiveGate] = useState('AND'); // 'AND', 'OR', 'NOT', 'XOR'
  const [gateInputA, setGateInputA] = useState(1);
  const [gateInputB, setGateInputB] = useState(1);

  // 1-Bit Half Adder State
  const [adderA, setAdderA] = useState(1);
  const [adderB, setAdderB] = useState(1);

  // Calculate logic gate output
  const calculateGateOutput = (type, a, b) => {
    switch (type) {
      case 'AND':
        return a === 1 && b === 1 ? 1 : 0;
      case 'OR':
        return a === 1 || b === 1 ? 1 : 0;
      case 'NOT':
        return a === 1 ? 0 : 1;
      case 'XOR':
        return a !== b ? 1 : 0;
      default:
        return 0;
    }
  };

  const gateOutput = calculateGateOutput(activeGate, gateInputA, gateInputB);

  // Half Adder calculations:
  // SUM = A XOR B
  // CARRY = A AND B
  const sumBit = adderA !== adderB ? 1 : 0;
  const carryBit = adderA === 1 && adderB === 1 ? 1 : 0;
  const totalDecimal = adderA + adderB;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Critical Scientific Hierarchy Distinction Banner */}
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500 text-white shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Under the Hood / হার্ডওয়্যারের গভীরে
            </span>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
              What Happens Inside Electronic Devices? (Electrons vs Data)
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          In computer science, we must never confuse an abstract <strong>data packet</strong> with an individual <strong>electron</strong>. Computation operates on three distinct physical and conceptual tiers:
        </p>

        {/* 3-Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-[#111722]">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400">
              Tier 1: Architecture
            </span>
            <h5 className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              Data & Instructions
            </h5>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px] leading-relaxed">
              Numbers like 10, 20, and instructions (ADD) moving between functional blocks (Memory, ALU, CU).
            </p>
          </div>

          <div className="p-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-[#111722]">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400">
              Tier 2: Digital Logic
            </span>
            <h5 className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              Binary States & Gates
            </h5>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px] leading-relaxed">
              0s and 1s represented by voltage states (+5V = 1, 0V = 0) evaluated by logic gates (AND, OR, XOR).
            </p>
          </div>

          <div className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-[#111722]">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Tier 3: Physical Electronics
            </span>
            <h5 className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              Semiconductor Switches
            </h5>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px] leading-relaxed">
              Microscopic silicon MOSFET transistors where electrical gate charge opens or closes conductive channels.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Transistor Switch Demonstration */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f141d] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              Semiconductor Switching Lab
            </span>
            <h4 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
              The Transistor: An Electronic Switch with Zero Moving Parts
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setGateVoltage(!gateVoltage)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              gateVoltage
                ? 'bg-purple-600 text-white shadow-purple-500/25'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {gateVoltage ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>Gate Voltage: {gateVoltage ? '+5 Volts (High)' : '0 Volts (Low)'}</span>
          </button>
        </div>

        {/* Visual Transistor Diagram */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Input Gate Control */}
            <div className="text-center md:text-left space-y-1">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                Gate Terminal (Base):
              </span>
              <div
                className={`text-sm font-mono font-black ${
                  gateVoltage ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-500'
                }`}
              >
                {gateVoltage ? '⚡ 5V Potential Applied' : '○ 0V Ground (No Bias)'}
              </div>
              <span className="text-[10px] text-neutral-400">
                Electrostatic field attracts charge carriers into the silicon channel.
              </span>
            </div>

            {/* Semiconductor Channel Animation */}
            <div className="w-full max-w-xs h-16 rounded-xl border-2 relative flex items-center justify-center overflow-hidden transition-all duration-300 bg-neutral-950">
              {/* Conductive Silicon Channel */}
              <div
                className={`h-4 w-full transition-all duration-300 ${
                  gateVoltage
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 shadow-md shadow-purple-500/50'
                    : 'bg-neutral-800 opacity-40'
                }`}
              />

              <span className="absolute z-10 text-[10px] font-mono font-black tracking-wider text-white">
                {gateVoltage ? 'CHANNEL CONDUCTING (CURRENT FLOWS)' : 'CHANNEL BLOCKED (HIGH RESISTANCE)'}
              </span>
            </div>

            {/* Output Digital Bit */}
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                Digital State Result:
              </span>
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-mono font-black text-2xl transition-all ${
                  gateVoltage
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40 ring-4 ring-purple-500/20'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                {gateVoltage ? '1' : '0'}
              </div>
              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                Logical {gateVoltage ? 'TRUE / HIGH' : 'FALSE / LOW'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Logic Gates Test Bench */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f141d] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
              Digital Logic Gates
            </span>
            <h4 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
              Combining Transistors into Decision Circuits
            </h4>
          </div>

          {/* Gate Selector Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
            {['AND', 'OR', 'NOT', 'XOR'].map((gate) => (
              <button
                key={gate}
                type="button"
                onClick={() => setActiveGate(gate)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeGate === gate
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {gate} Gate
              </button>
            ))}
          </div>
        </div>

        {/* Live Gate Circuit Demonstrator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Input Controls */}
          <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs">
            <h5 className="font-bold text-neutral-700 dark:text-neutral-300">
              Interactive Input Lines
            </h5>

            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-neutral-600 dark:text-neutral-400">
                Input A:
              </span>
              <button
                type="button"
                onClick={() => setGateInputA(gateInputA === 1 ? 0 : 1)}
                className={`px-3 py-1 rounded-xl font-mono font-black text-sm cursor-pointer transition-all ${
                  gateInputA === 1
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {gateInputA}
              </button>
            </div>

            {activeGate !== 'NOT' && (
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-neutral-600 dark:text-neutral-400">
                  Input B:
                </span>
                <button
                  type="button"
                  onClick={() => setGateInputB(gateInputB === 1 ? 0 : 1)}
                  className={`px-3 py-1 rounded-xl font-mono font-black text-sm cursor-pointer transition-all ${
                    gateInputB === 1
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {gateInputB}
                </button>
              </div>
            )}
          </div>

          {/* Interactive Gate Schematic */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
            <span className="text-[10px] font-mono font-bold text-neutral-400">
              LOGIC EVALUATION
            </span>
            <div className="flex items-center justify-center gap-3 text-lg font-mono font-black">
              <span className={gateInputA === 1 ? 'text-emerald-400' : 'text-neutral-500'}>
                {gateInputA}
              </span>
              <span className="text-sky-400 px-2 py-0.5 rounded-lg bg-sky-500/20 text-xs">
                {activeGate}
              </span>
              {activeGate !== 'NOT' && (
                <span className={gateInputB === 1 ? 'text-emerald-400' : 'text-neutral-500'}>
                  {gateInputB}
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-neutral-500" />
              <span
                className={`text-xl ${
                  gateOutput === 1 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-neutral-500'
                }`}
              >
                {gateOutput}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {activeGate === 'AND' && 'Outputs 1 ONLY when BOTH inputs are 1.'}
              {activeGate === 'OR' && 'Outputs 1 when EITHER or BOTH inputs are 1.'}
              {activeGate === 'NOT' && 'Inverts the binary signal (0 becomes 1, 1 becomes 0).'}
              {activeGate === 'XOR' && 'Outputs 1 ONLY when the inputs are DIFFERENT (0 & 1 or 1 & 0).'}
            </p>
          </div>

          {/* Live Truth Table */}
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs">
            <h5 className="font-bold text-neutral-700 dark:text-neutral-300 mb-1 text-[11px]">
              {activeGate} Truth Table
            </h5>
            <div className="font-mono text-[10px] space-y-0.5">
              {activeGate === 'NOT' ? (
                <>
                  <div className={`p-1 rounded flex justify-between ${gateInputA === 0 ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold' : ''}`}>
                    <span>A: 0</span>
                    <span>OUT: 1</span>
                  </div>
                  <div className={`p-1 rounded flex justify-between ${gateInputA === 1 ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold' : ''}`}>
                    <span>A: 1</span>
                    <span>OUT: 0</span>
                  </div>
                </>
              ) : (
                [
                  { a: 0, b: 0 },
                  { a: 0, b: 1 },
                  { a: 1, b: 0 },
                  { a: 1, b: 1 },
                ].map((row, idx) => {
                  const out = calculateGateOutput(activeGate, row.a, row.b);
                  const isCurrent = gateInputA === row.a && gateInputB === row.b;
                  return (
                    <div
                      key={idx}
                      className={`p-1 rounded flex justify-between ${
                        isCurrent ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold' : 'text-neutral-500'
                      }`}
                    >
                      <span>{row.a} {activeGate} {row.b}</span>
                      <span>= {out}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. The Half Adder: How Logic Gates Actually Do Arithmetic in the ALU! */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f141d] p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            The Magic of the ALU
          </span>
          <h4 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
            The 1-Bit Binary Half Adder: How Logic Gates Perform Math!
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Ever wondered how an ALU adds 10 + 20? It combines millions of these simple 2-gate circuits! An <strong>XOR gate</strong> produces the Sum bit, and an <strong>AND gate</strong> produces the Carry bit.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Binary Input Toggles */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                Operands:
              </span>
              <button
                type="button"
                onClick={() => setAdderA(adderA === 1 ? 0 : 1)}
                className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs cursor-pointer ${
                  adderA === 1 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Bit A: {adderA}
              </button>
              <span className="text-sm font-black text-neutral-400">+</span>
              <button
                type="button"
                onClick={() => setAdderB(adderB === 1 ? 0 : 1)}
                className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs cursor-pointer ${
                  adderB === 1 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Bit B: {adderB}
              </button>
            </div>

            {/* Arithmetic Resolution Display */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Carry (AND):</span>
                <span className="font-black text-amber-500 text-base">{carryBit}</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Sum (XOR):</span>
                <span className="font-black text-sky-500 text-base">{sumBit}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="text-[10px] font-bold block">Binary Result:</span>
                <span className="font-black text-base">{carryBit}{sumBit}₂ ({totalDecimal} in decimal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicCircuitsExploration;
