import React, { useState } from 'react';
import { Sliders, Activity, RefreshCw } from 'lucide-react';

export default function NeuralNetPlayground() {
  const [x1, setX1] = useState(2.0);
  const [x2, setX2] = useState(3.0);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(-0.5);
  const [bias, setBias] = useState(0.2);
  const [activation, setActivation] = useState('relu');

  // Compute z = x1*w1 + x2*w2 + bias
  const z = x1 * w1 + x2 * w2 + bias;

  // Activation calculation
  const getOutput = () => {
    if (activation === 'relu') return Math.max(0, z);
    if (activation === 'sigmoid') return 1 / (1 + Math.exp(-z));
    return z; // linear
  };

  const output = getOutput();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Activity className="w-6 h-6" />
            Neural Neuron Playground: Inputs, Weights & Activation
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Adjust the input signals, synapse weights, and bias to observe instant output changes!
          </p>
        </div>
        <button
          onClick={() => {
            setX1(2.0);
            setX2(3.0);
            setW1(0.8);
            setW2(-0.5);
            setBias(0.2);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Weights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Sliders */}
        <div className="space-y-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" /> Synapse Controls
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Input x₁</span>
              <span className="font-mono text-emerald-400">{x1.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={x1}
              onChange={(e) => setX1(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Weight w₁</span>
              <span className="font-mono text-sky-400">{w1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={w1}
              onChange={(e) => setW1(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Input x₂</span>
              <span className="font-mono text-emerald-400">{x2.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={x2}
              onChange={(e) => setX2(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Weight w₂</span>
              <span className="font-mono text-sky-400">{w2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={w2}
              onChange={(e) => setW2(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Bias (b)</span>
              <span className="font-mono text-purple-400">{bias.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={bias}
              onChange={(e) => setBias(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        {/* Neural Network Diagram */}
        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[260px] relative">
          <div className="text-xs font-mono text-slate-400 mb-4">
            Formula: z = (x₁·w₁) + (x₂·w₂) + b
          </div>

          <div className="flex items-center gap-8 w-full justify-center">
            {/* Input Nodes */}
            <div className="flex flex-col gap-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center font-mono text-xs font-bold text-emerald-300">
                x₁={x1}
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center font-mono text-xs font-bold text-emerald-300">
                x₂={x2}
              </div>
            </div>

            {/* Neuron Center */}
            <div className="w-20 h-20 rounded-full bg-purple-600/30 border-2 border-purple-500 flex flex-col items-center justify-center text-center shadow-lg shadow-purple-500/20">
              <span className="text-[10px] text-purple-300 font-mono">z={z.toFixed(2)}</span>
              <span className="text-xs font-bold text-white uppercase">{activation}</span>
            </div>

            {/* Output Node */}
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center font-mono text-sm font-bold text-amber-300 shadow-lg shadow-amber-500/20">
              {output.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Activation Selector & Math Output */}
        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-semibold text-slate-300">Activation Function f(z)</div>
          <div className="grid grid-cols-3 gap-2">
            {['relu', 'sigmoid', 'linear'].map((act) => (
              <button
                key={act}
                onClick={() => setActivation(act)}
                className={`py-2 text-xs font-mono uppercase rounded-lg border transition ${
                  activation === act
                    ? 'bg-purple-600 text-white border-purple-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {act}
              </button>
            ))}
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-400">Sum z = ({x1} × {w1}) + ({x2} × {w2}) + {bias}</div>
            <div className="text-emerald-400 font-bold">Sum z = {z.toFixed(3)}</div>
            <div className="text-amber-400 font-bold mt-2">
              f({z.toFixed(2)}) = {output.toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
