import React, { useState } from 'react';
import { Target, Play, RotateCcw } from 'lucide-react';

export default function DecisionTreeClassifierSimulator() {
  const [splitThreshold, setSplitThreshold] = useState(50);
  const [trained, setTrained] = useState(false);

  // Simulated 2D points (x: Feature 1 e.g. House Size, y: Label 0=Small, 1=Large)
  const dataPoints = [
    { id: 1, x: 20, label: 0, name: 'Sample A' },
    { id: 2, x: 35, label: 0, name: 'Sample B' },
    { id: 3, x: 42, label: 0, name: 'Sample C' },
    { id: 4, x: 60, label: 1, name: 'Sample D' },
    { id: 5, x: 75, label: 1, name: 'Sample E' },
    { id: 6, x: 88, label: 1, name: 'Sample F' },
  ];

  const correctPredictions = dataPoints.filter((pt) => {
    const pred = pt.x >= splitThreshold ? 1 : 0;
    return pred === pt.label;
  }).length;

  const accuracy = Math.round((correctPredictions / dataPoints.length) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Target className="w-6 h-6" />
            Decision Tree Classifier Boundary Simulator
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Slide the decision boundary threshold to separate Class 0 (Small) from Class 1 (Large) with 100% accuracy!
          </p>
        </div>
        <button
          onClick={() => {
            setSplitThreshold(50);
            setTrained(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Interactive Coordinate Visualization */}
        <div className="md:col-span-2 bg-slate-950/80 rounded-xl p-5 border border-slate-800 flex flex-col justify-between min-h-[220px]">
          <div className="text-xs font-semibold text-slate-400 mb-2">
            Feature Axis X (0 to 100) | Decision Split at X = <span className="text-emerald-400 font-mono font-bold">{splitThreshold}</span>
          </div>

          {/* Points Track */}
          <div className="relative h-20 bg-slate-900 rounded-xl border border-slate-800 my-4 flex items-center px-4">
            {/* Vertical Split Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-500 shadow-lg shadow-emerald-500/50 transition-all duration-150 z-10"
              style={{ left: `${splitThreshold}%` }}
            >
              <div className="absolute -top-3 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                Split: {splitThreshold}
              </div>
            </div>

            {/* Render Data Points */}
            {dataPoints.map((pt) => {
              const predictedClass = pt.x >= splitThreshold ? 1 : 0;
              const isCorrect = predictedClass === pt.label;

              return (
                <div
                  key={pt.id}
                  className={`absolute -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                    pt.label === 0
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-purple-500/20 border-purple-500 text-purple-300'
                  } ${!isCorrect ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                  style={{ left: `${pt.x}%` }}
                >
                  {pt.x}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span className="text-sky-400 font-semibold">← Predict Class 0 (Small)</span>
            <span className="text-purple-400 font-semibold">Predict Class 1 (Large) →</span>
          </div>
        </div>

        {/* Controls and Accuracy Score */}
        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Split Threshold (X)</span>
              <span className="font-mono text-emerald-400">{splitThreshold}</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={splitThreshold}
              onChange={(e) => setSplitThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center space-y-1">
            <div className="text-xs text-slate-400">Model Classification Accuracy</div>
            <div className={`text-2xl font-black ${accuracy === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </div>
            <p className="text-[11px] text-slate-500">
              {accuracy === 100 ? '🎉 Perfect decision split found!' : 'Adjust threshold to fix misclassified points.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
