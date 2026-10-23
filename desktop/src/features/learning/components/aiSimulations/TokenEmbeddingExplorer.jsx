import React, { useState } from 'react';
import { Type, Binary, Search } from 'lucide-react';

export default function TokenEmbeddingExplorer() {
  const [inputText, setInputText] = useState('Artificial Intelligence learns fast');

  // Simple token splitter simulation
  const tokens = inputText.trim().split(/\s+/).filter(Boolean);

  // Generate deterministic pseudo vector for tokens
  const getVector = (word) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const v1 = ((Math.abs(hash) % 100) / 100).toFixed(2);
    const v2 = (((Math.abs(hash * 3) % 100)) / 100).toFixed(2);
    const v3 = (((Math.abs(hash * 7) % 100)) / 100).toFixed(2);
    const v4 = (((Math.abs(hash * 11) % 100)) / 100).toFixed(2);
    return [v1, v2, v3, v4];
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Type className="w-6 h-6" />
            Tokenizer & Embedding Vector Explorer
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Type any sentence to see how text is split into tokens and converted into numerical vector arrays!
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Input Sentence
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            placeholder="Type text here..."
          />
        </div>

        {/* Tokens Grid */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Binary className="w-4 h-4 text-sky-400" />
            1. Tokenizer Output ({tokens.length} Tokens)
          </div>
          <div className="flex flex-wrap gap-2">
            {tokens.map((token, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-sky-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <span className="text-sky-300 font-medium text-sm">"{token}"</span>
                <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-mono">
                  ID: {1000 + idx * 47}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Embeddings Vector Table */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-emerald-400" />
            2. High-Dimensional Vector Embeddings (4D Representation)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tokens.map((token, idx) => {
              const vec = getVector(token);
              return (
                <div
                  key={idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5"
                >
                  <div className="text-xs font-bold text-emerald-400">
                    Token: "{token}"
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-300 flex justify-between">
                    <span>[{vec.join(', ')}]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
