import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SimulationControls = ({
  currentStep,
  totalSteps = 9,
  isPlaying,
  onPlay,
  onPause,
  onRestart,
  onNext,
  onPrev,
  speed = 1,
  onSpeedChange,
  reducedMotion = false,
  onToggleReducedMotion,
  customInput = { a: 10, b: 20, op: '+' },
  onUpdateCustomInput,
  stepInfo,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [inputA, setInputA] = useState(customInput.a);
  const [inputB, setInputB] = useState(customInput.b);
  const [op, setOp] = useState(customInput.op);

  const handleApplyCustom = (e) => {
    e.preventDefault();
    const valA = parseFloat(inputA) || 0;
    const valB = parseFloat(inputB) || 0;
    onUpdateCustomInput({ a: valA, b: valB, op });
    setShowConfig(false);
    onRestart();
  };

  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="space-y-4">
      {/* Current Step Banner & Description */}
      <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-sky-500 text-white tracking-wide shadow-xs shadow-sky-500/25">
              STEP {currentStep} OF {totalSteps}
            </span>
            <h4 className="text-sm sm:text-base font-black text-neutral-900 dark:text-neutral-100">
              {stepInfo?.title || 'Processing...'}
            </h4>
          </div>

          {/* Quick Stats / Formula Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              Formula:
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-black font-mono text-sky-600 dark:text-sky-400">
              {customInput.a} {customInput.op} {customInput.b} = {stepInfo?.previewResult ?? '?'}
            </span>
          </div>
        </div>

        {/* Step Detailed Narrative */}
        <p className="mt-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {stepInfo?.description}
        </p>

        {/* Active Flow Signals */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
          {stepInfo?.activeFlow === 'info' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              Information Flow Active (Solid Arrow)
            </span>
          )}
          {stepInfo?.activeFlow === 'control' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Timing & Control Signal Active (Dashed Arrow)
            </span>
          )}
          {stepInfo?.activeFlow === 'both' && (
            <>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Information Flow
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Control Signal
              </span>
            </>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="mt-3 w-full bg-neutral-200/80 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Main Simulation Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-[#161a22] border border-neutral-200/80 dark:border-neutral-800">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shadow-xs shadow-amber-500/20 cursor-pointer"
              title="Pause Simulation"
              aria-label="Pause Simulation"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/20 cursor-pointer"
              title="Start / Resume Simulation"
              aria-label="Start / Resume Simulation"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{currentStep === 1 ? 'Start Simulation' : 'Play'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRestart}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Restart from Step 1"
            aria-label="Restart from Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={onPrev}
            disabled={currentStep <= 1}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Step"
            aria-label="Previous Step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={currentStep >= totalSteps}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Step"
            aria-label="Next Step"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed, Custom Inputs & Accessibility Toggles */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex items-center bg-white dark:bg-neutral-800 rounded-xl p-0.5 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => onSpeedChange(0.5)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                speed === 0.5
                  ? 'bg-sky-500 text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              title="0.5x Speed (Slow)"
            >
              0.5x
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange(1)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                speed === 1
                  ? 'bg-sky-500 text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              title="1x Speed (Normal)"
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange(2)}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                speed === 2
                  ? 'bg-sky-500 text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              title="2x Speed (Fast)"
            >
              2x
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <button
            type="button"
            onClick={onToggleReducedMotion}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              reducedMotion
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                : 'text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
            title={
              reducedMotion
                ? 'Animations paused (Reduced Motion Mode). Click to re-enable.'
                : 'Reduce Motion / Static diagram mode'
            }
            aria-label="Toggle Reduced Motion"
          >
            {reducedMotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Custom Calculation Button */}
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              showConfig
                ? 'bg-sky-500 text-white border-sky-500'
                : 'text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
            title="Customize Numbers and Arithmetic Operation"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Custom Input</span>
          </button>
        </div>
      </div>

      {/* Custom Input Modal / Drawer */}
      {showConfig && (
        <form
          onSubmit={handleApplyCustom}
          className="p-4 rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Configure Arithmetic Operation for the Simulation</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setInputA(10);
                setInputB(20);
                setOp('+');
              }}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Reset to 10 + 20
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Number 1 (Input A)
              </label>
              <input
                type="number"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Operation
              </label>
              <select
                value={op}
                onChange={(e) => setOp(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-bold"
              >
                <option value="+">+ (Addition)</option>
                <option value="-">- (Subtraction)</option>
                <option value="*">× (Multiplication)</option>
                <option value="/">÷ (Division)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Number 2 (Input B)
              </label>
              <input
                type="number"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors shadow-xs cursor-pointer"
            >
              Apply & Run Simulation
            </button>
          </div>
        </form>
      )}

      {/* Clear Visual Legend for Connections */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-2 pb-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-sky-500 rounded-full" />
          <span>Solid Line: Information Flow (Data & Results)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-amber-500" />
          <span>Dashed Line: Timing & Control Signals (Control Unit)</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Click, hover, or tap any component card to inspect details</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
