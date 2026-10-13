import React, { useState } from 'react';
import {
  Sparkles,
  Thermometer,
  Wind,
  RefreshCw,
} from 'lucide-react';

export const SystemFeedbackLoopSimulator = () => {
  const [temperature, setTemperature] = useState(24); // in Celsius

  // Feedback loop calculation:
  // > 28°C: High Fan Speed (Cooling active)
  // 22°C - 28°C: Medium Fan Speed (Normal)
  // < 22°C: Low Fan Speed (Silent)
  const isHighHeat = temperature >= 30;
  const isMedium = temperature >= 22 && temperature < 30;

  const fanSpeedText = isHighHeat ? '100% (High Cool Turbo)' : isMedium ? '50% (Normal Balanced)' : '15% (Silent Eco)';
  const fanColor = isHighHeat ? 'text-rose-500' : isMedium ? 'text-sky-500' : 'text-emerald-500';

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Interactive Visualizer 6
          </span>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            The System Feedback Loop: Input → Process → Output → Feedback!
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            A real computer system is not just one-way; it monitors its results and automatically adjusts!
          </p>
        </div>
      </div>

      {/* Temperature Slider & Live Feedback Loop Display */}
      <div className="space-y-4">
        {/* Interactive Input: Temperature Slider */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <span>Simulate Computer Heat (Input from Thermal Sensor):</span>
            </span>
            <span
              className={`font-mono font-black text-sm ${
                isHighHeat ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-sky-400'
              }`}
            >
              {temperature}°C
            </span>
          </div>

          <input
            type="range"
            min="15"
            max="45"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />

          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>15°C (Cool Idle)</span>
            <span>28°C (Normal Load)</span>
            <span>45°C (Heavy Gaming / Hot!)</span>
          </div>
        </div>

        {/* The 4-Step Live Feedback Loop Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Step 1: Input */}
          <div className="p-3.5 rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 block">
              1. Input
            </span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
              Sensor Reads {temperature}°C
            </h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Thermal probe sends voltage level to motherboard.
            </p>
          </div>

          {/* Step 2: Processing */}
          <div className="p-3.5 rounded-2xl border border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 block">
              2. Processing
            </span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
              CPU Compares
            </h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {isHighHeat
                ? 'CPU sees >30°C! Orders Emergency Cooling Turbo.'
                : 'CPU sees Safe Range. Orders Eco Balanced Cooling.'}
            </p>
          </div>

          {/* Step 3: Output */}
          <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
              3. Output
            </span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
              Fan Speed Adjusted
            </h4>
            <p className={`text-[11px] font-bold ${fanColor} leading-relaxed flex items-center gap-1`}>
              <Wind className={`w-3.5 h-3.5 ${isHighHeat ? 'animate-spin' : ''}`} />
              <span>{fanSpeedText}</span>
            </p>
          </div>

          {/* Step 4: Feedback Loop */}
          <div className="p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>4. Feedback Loop</span>
            </span>
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
              Continuous Loop
            </h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Airflow cools down chip. Sensor immediately feeds new temp back to Step 1!
            </p>
          </div>
        </div>
      </div>

      {/* Takeaway Card */}
      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
        <span>
          A <strong>System</strong> is smart because of the <strong>Feedback Loop</strong>: output informs future input to keep the machine safe, stable, and fast!
        </span>
      </div>
    </div>
  );
};

export default SystemFeedbackLoopSimulator;
