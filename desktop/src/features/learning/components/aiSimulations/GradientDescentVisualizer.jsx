import React, { useState } from 'react';
import { Play, RotateCcw, TrendingDown } from 'lucide-react';

export default function GradientDescentVisualizer() {
  const [learningRate, setLearningRate] = useState(0.1);
  const [position, setPosition] = useState(4.0); // start at x = 4.0
  const [history, setHistory] = useState([4.0]);
  const [isStepping, setIsStepping] = useState(false);

  // Loss function: L(w) = w^2
  // Derivative: dL/dw = 2*w
  const loss = (w) => w * w;
  const gradient = (w) => 2 * w;

  const stepGradient = () => {
    if (Math.abs(position) < 0.01) return;
    const g = gradient(position);
    const nextPos = position - learningRate * g;
    setPosition(nextPos);
    setHistory((prev) => [...prev, nextPos]);
  };

  const runAutoGradient = () => {
    setIsStepping(true);
    let current = position;
    let count = 0;
    const interval = setInterval(() => {
      const g = gradient(current);
      current = current - learningRate * g;
      setPosition(current);
      setHistory((prev) => [...prev, current]);
      count += 1;
      if (count >= 15 || Math.abs(current) < 0.02) {
        clearInterval(interval);
        setIsStepping(false);
      }
    }, 200);
  };

  const reset = () => {
    setPosition(4.0);
    setHistory([4.0]);
    setIsStepping(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <TrendingDown className="w-6 h-6" />
            Gradient Descent Loss Minimization Visualizer
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Watch the parameter (w) step downhill along the loss slope L(w) = w² toward the lowest error!
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Graph Canvas Visualizer */}
        <div className="md:col-span-2 bg-slate-950/80 rounded-xl p-5 border border-slate-800 flex flex-col items-center justify-center relative min-h-[220px]">
          <svg viewBox="-5 0 10 25" className="w-full h-48 stroke-slate-700 fill-none overflow-visible">
            {/* Parabola L(w) = w^2 */}
            <path
              d="M -4.5 20.25 Q 0 0 4.5 20.25"
              stroke="#0284c7"
              strokeWidth="0.4"
              fill="none"
            />

            {/* Current Position Marker */}
            <circle
              cx={position}
              cy={loss(position)}
              r="0.4"
              fill="#10b981"
              className="transition-all duration-200"
            />
          </svg>

          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 p-2 rounded text-xs font-mono">
            <div>Parameter w = <span className="text-emerald-400 font-bold">{position.toFixed(3)}</span></div>
            <div>Loss L(w) = <span className="text-amber-400 font-bold">{loss(position).toFixed(3)}</span></div>
            <div>Slope dL/dw = <span className="text-sky-400 font-bold">{gradient(position).toFixed(3)}</span></div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Learning Rate (α)</span>
              <span className="font-mono text-emerald-400">{learningRate}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.9"
              step="0.02"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {learningRate > 0.6 ? '⚠️ High Learning Rate may overshoot minimum!' : 'Optimal step size toward minimum loss.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={stepGradient}
              disabled={isStepping}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition border border-slate-700"
            >
              Step 1 Epoch
            </button>

            <button
              onClick={runAutoGradient}
              disabled={isStepping}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition flex items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5" /> Auto Run
            </button>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
            <div className="text-slate-400">Total Steps Taken: {history.length - 1}</div>
            <div className="text-slate-500">Update Rule: w := w - α · (dL/dw)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
