import React, { useState } from 'react';
import { Eye, Network } from 'lucide-react';

export default function AttentionMapVisualizer() {
  const words = ['The', 'animal', 'did', 'not', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
  const [selectedWordIndex, setSelectedWordIndex] = useState(8); // Default on "it"

  // Attention score matrix simulation focusing "it" on "animal"
  const getAttentionWeight = (targetIdx, sourceIdx) => {
    // "it" (idx 8) attends strongly to "animal" (idx 1) and "tired" (idx 11)
    if (words[targetIdx] === 'it') {
      if (words[sourceIdx] === 'animal') return 0.88;
      if (words[sourceIdx] === 'tired') return 0.65;
      if (words[sourceIdx] === 'street') return 0.12;
      if (words[sourceIdx] === 'it') return 0.45;
    }
    if (words[targetIdx] === 'animal') {
      if (words[sourceIdx] === 'tired') return 0.72;
      if (words[sourceIdx] === 'cross') return 0.55;
    }
    if (targetIdx === sourceIdx) return 0.60;
    return Math.max(0.05, ((targetIdx * 3 + sourceIdx * 7) % 40) / 100);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Eye className="w-6 h-6" />
            Transformer Self-Attention Heatmap Explorer
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Click on any word to inspect how the Transformer's self-attention mechanism links contextual relationships across the sentence!
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Network className="w-4 h-4 text-emerald-400" />
            Click a token to set Query Attention:
          </div>

          <div className="flex flex-wrap gap-2">
            {words.map((word, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedWordIndex(idx)}
                className={`px-3 py-1.5 rounded-lg font-mono text-sm border transition ${
                  selectedWordIndex === idx
                    ? 'bg-emerald-500 text-slate-900 font-bold border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap visualization */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-300">
            Attention weights for Query Token: <span className="text-emerald-400 font-bold font-mono">"{words[selectedWordIndex]}"</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {words.map((word, sourceIdx) => {
              const weight = getAttentionWeight(selectedWordIndex, sourceIdx);
              const opacity = Math.max(0.1, weight);

              return (
                <div
                  key={sourceIdx}
                  className="p-2.5 rounded-lg border border-slate-800 flex items-center justify-between transition"
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${opacity * 0.35})`,
                    borderColor: weight > 0.5 ? '#10b981' : '#1e293b',
                  }}
                >
                  <span className="text-xs font-mono text-white font-medium">{word}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
                    {(weight * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 pt-2 border-t border-slate-900">
            💡 Notice how selecting <strong className="text-emerald-400">"it"</strong> connects strongly with <strong className="text-emerald-400">"animal" (88%)</strong>, resolving pronoun coreference automatically!
          </p>
        </div>
      </div>
    </div>
  );
}
