import React, { useState } from 'react';
import {
  Keyboard,
  HardDrive,
  Cpu,
  Layers,
  Monitor,
  Play,
} from 'lucide-react';

export const FiveUnitsHubVisualizer = () => {
  const [activeUnit, setActiveUnit] = useState('cu');
  const [isSimulating, setIsSimulating] = useState(false);
  const [pulseStep, setPulseStep] = useState(0);

  const UNITS = {
    input: {
      id: 'input',
      name: '1. Input Unit',
      role: 'The Eyes & Ears',
      icon: Keyboard,
      color: 'from-sky-500 to-cyan-500',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      analogy: 'Like your eyes reading a test question or your ears listening to music.',
      simpleDuty: 'Takes keyboard presses, mouse clicks, and mic sounds from the human world and converts them into 0s and 1s.',
      howItTalks: 'Sends newly converted binary data directly into the Memory Unit.',
    },
    memory: {
      id: 'memory',
      name: '2. Memory Unit (RAM)',
      role: 'The Working Desk / Backpack',
      icon: HardDrive,
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      analogy: 'Like your school study desk where you keep open notebooks and pens while doing homework.',
      simpleDuty: 'Holds the apps you are currently using, the data waiting to be calculated, and the results ready to be shown.',
      howItTalks: 'Feeds numbers to the ALU, receives calculated answers back, and sends results to Output.',
    },
    alu: {
      id: 'alu',
      name: '3. Arithmetic & Logic Unit (ALU)',
      role: 'The Math & Logic Brain',
      icon: Cpu,
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      analogy: 'Like a genius friend who can solve any math equation (+, -, ×, ÷) and true/false question in a nanosecond.',
      simpleDuty: 'Does all actual calculations (10 + 20 = 30) and makes logical decisions (is password correct? yes or no).',
      howItTalks: 'Only talks to Memory! It grabs numbers from Memory, does the math, and returns the answer to Memory.',
    },
    cu: {
      id: 'cu',
      name: '4. Control Unit (CU)',
      role: 'The Traffic Cop / Conductor',
      icon: Layers,
      color: 'from-purple-500 to-indigo-500',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      analogy: 'Like an orchestra conductor who does not play the drums, but tells every musician exactly when to start playing.',
      simpleDuty: 'Directs traffic! It does not do math itself. It tells Memory when to send data, tells ALU when to calculate, and tells Output when to display.',
      howItTalks: 'Sends timing and command pulses (dashed signals) to ALL other units.',
    },
    output: {
      id: 'output',
      name: '5. Output Unit',
      role: 'The Mouth & Screen',
      icon: Monitor,
      color: 'from-rose-500 to-pink-500',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      analogy: 'Like speaking the answer out loud to your teacher or showing your completed drawing.',
      simpleDuty: 'Takes computed binary results from Memory and turns them into colorful pixels on your screen or sounds in your headphones.',
      howItTalks: 'Receives finalized data from Memory and shows it to the human operator.',
    },
  };

  const handleSimulatePulse = () => {
    setIsSimulating(true);
    setPulseStep(1);

    setTimeout(() => setPulseStep(2), 800);
    setTimeout(() => setPulseStep(3), 1600);
    setTimeout(() => setPulseStep(4), 2400);
    setTimeout(() => {
      setPulseStep(0);
      setIsSimulating(false);
    }, 3200);
  };

  const current = UNITS[activeUnit] || UNITS.cu;
  const CurrentIcon = current.icon;

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            Interactive Visualizer 3
          </span>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            The 5 Functional Units: Click to See How They Communicate!
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Every computer has these exact 5 team members working in synchrony.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulatePulse}
          disabled={isSimulating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? 'Signals Traveling...' : 'Broadcast Communication Pulse'}</span>
        </button>
      </div>

      {/* 5 Units Interactive Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {Object.values(UNITS).map((unit, idx) => {
          const Icon = unit.icon;
          const isSelected = activeUnit === unit.id;
          const isPulsing =
            (pulseStep === 1 && unit.id === 'input') ||
            (pulseStep === 2 && (unit.id === 'cu' || unit.id === 'memory')) ||
            (pulseStep === 3 && unit.id === 'alu') ||
            (pulseStep === 4 && unit.id === 'output');

          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => setActiveUnit(unit.id)}
              className={`p-3 rounded-2xl border-2 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 shadow-md scale-[1.02]'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
              } ${isPulsing ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-xl bg-gradient-to-br ${unit.color} text-white shadow-xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-neutral-400">
                  Unit {idx + 1}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-black text-neutral-900 dark:text-neutral-100 leading-tight">
                  {unit.name.split('.')[1]}
                </h4>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
                  {unit.role}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Communication Flow Status Bar when Simulating */}
      {isSimulating && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>
              {pulseStep === 1 && 'Step 1: Input Unit encodes keystroke -> pushes to Memory!'}
              {pulseStep === 2 && 'Step 2: Control Unit directs traffic -> tells Memory to share with ALU!'}
              {pulseStep === 3 && 'Step 3: ALU performs the math -> returns calculated answer to Memory!'}
              {pulseStep === 4 && 'Step 4: Memory pushes finalized result -> Output Unit illuminates screen!'}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase">Bus Active</span>
        </div>
      )}

      {/* Selected Unit Deep-Dive Card */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 space-y-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl bg-gradient-to-br ${current.color} text-white shadow-sm`}
            >
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${current.badgeColor}`}>
                {current.role}
              </span>
              <h4 className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-0.5">
                {current.name}
              </h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 space-y-1">
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 block uppercase">
              What does it do?
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {current.simpleDuty}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-1">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block uppercase">
              14-Year-Old Analogy
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
              "{current.analogy}"
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/40 space-y-1">
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 block uppercase">
              How does it talk to others?
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {current.howItTalks}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiveUnitsHubVisualizer;
