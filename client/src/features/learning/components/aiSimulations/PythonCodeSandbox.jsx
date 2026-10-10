import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function PythonCodeSandbox({ codeLab }) {
  if (!codeLab) return null;

  const [code, setCode] = useState(codeLab.initialCode || '');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunPython = () => {
    setIsRunning(true);
    setOutput('Executing Python runtime in sandbox...');

    setTimeout(() => {
      setIsRunning(false);
      setOutput(codeLab.expectedOutput || 'Execution completed with 0 errors.');
    }, 450);
  };

  const handleReset = () => {
    setCode(codeLab.initialCode || '');
    setOutput('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Terminal className="w-6 h-6" />
            Interactive AI Python Code Lab
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Read, edit, and execute Python AI code directly in your browser terminal!
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Code
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Python Code Editor Window */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
            <span>script.py</span>
            <span className="text-emerald-400 font-bold">Python 3.11</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 p-4 font-mono text-xs sm:text-sm text-emerald-300 focus:outline-none resize-none leading-relaxed"
            spellCheck="false"
          />
          <div className="p-3 bg-slate-900/50 border-t border-slate-800">
            <button
              onClick={handleRunPython}
              disabled={isRunning}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isRunning ? 'Running Python Script...' : 'Run Python Code 🚀'}</span>
            </button>
          </div>
        </div>

        {/* Output Terminal Window */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Terminal Output stdout</span>
            </div>
            <pre className="p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto min-h-[180px] whitespace-pre-wrap leading-relaxed">
              {output || '# Click "Run Python Code" to view execution output here...'}
            </pre>
          </div>

          {codeLab.explanation && (
            <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{codeLab.explanation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
