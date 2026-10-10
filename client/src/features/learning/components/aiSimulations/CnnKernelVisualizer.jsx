import React, { useState } from 'react';
import { Eye, Layers } from 'lucide-react';

export default function CnnKernelVisualizer() {
  const [filterType, setFilterType] = useState('edge'); // 'edge' | 'sharpen' | 'blur'

  // 5x5 Input Image Pixel Grid (Brightness values 0 to 255)
  const inputGrid = [
    [10, 10, 10, 200, 200],
    [10, 10, 10, 200, 200],
    [10, 10, 10, 200, 200],
    [10, 10, 10, 200, 200],
    [10, 10, 10, 200, 200],
  ];

  // 3x3 Filters
  const filters = {
    edge: [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1],
    ],
    sharpen: [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0],
    ],
  };

  const activeKernel = filters[filterType] || filters.edge;

  // Simple 3x3 convolution on center pixel
  const computeCenterConvolution = () => {
    let sum = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        sum += inputGrid[r + 1][c + 1] * activeKernel[r][c];
      }
    }
    return Math.min(255, Math.max(0, sum));
  };

  const outputPixel = computeCenterConvolution();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Layers className="w-6 h-6" />
            CNN 2D Convolution Kernel Visualizer
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Observe how a 3x3 Convolution Kernel slides over 2D image pixel values to detect vertical edges and visual features!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Input Image Grid */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-400">1. Input Image Pixel Grid (5x5)</div>
          <div className="grid grid-cols-5 gap-1.5">
            {inputGrid.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`h-10 rounded flex items-center justify-center font-mono text-xs font-bold transition ${
                    r >= 1 && r <= 3 && c >= 1 && c <= 3
                      ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {val}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3x3 Kernel Matrix */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">2. 3x3 Convolution Kernel</span>
            <div className="flex gap-1">
              {['edge', 'sharpen'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-1 text-[11px] font-mono uppercase rounded border transition ${
                    filterType === type
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {activeKernel.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="h-10 bg-slate-900 border border-sky-500/40 rounded flex items-center justify-center font-mono text-xs font-bold text-sky-300"
                >
                  {val}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Convolution Output Feature Map */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-center">
          <div className="text-xs font-semibold text-slate-400">3. Feature Map Output Pixel</div>

          <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-black text-emerald-300 font-mono">{outputPixel}</span>
            <span className="text-[10px] text-slate-400 font-mono">Pixel Val</span>
          </div>

          <p className="text-xs text-slate-400">
            {outputPixel > 100
              ? '⚡ Sharp Edge Detected! High convolution response.'
              : 'Flat region. Low convolution response.'}
          </p>
        </div>
      </div>
    </div>
  );
}
