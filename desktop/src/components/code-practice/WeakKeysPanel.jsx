import React from 'react';
import { Target, Zap, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { getWeakestKeysList } from '../../utils/codeTypingAnalyzer';

export const WeakKeysPanel = ({ weakKeysMap = {}, onPracticeWeakKeys, currentLanguage = 'javascript' }) => {
  const list = getWeakestKeysList(weakKeysMap);

  return (
    <div className="w-full bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Programming Weakness Analyzer
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Targeted character error tracking for coding symbols
            </p>
          </div>
        </div>

        <button
          onClick={onPracticeWeakKeys}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black text-xs font-black shadow-sm shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>Practice My Weak Keys</span>
        </button>
      </div>

      {list.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">No Weak Keys Detected Yet!</p>
            <p className="text-neutral-500 dark:text-neutral-400">
              Keep typing lessons. The analyzer will automatically detect which programming symbols slow you down.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
            Your Weakest Programming Keys:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {list.map((item) => {
              const acc = item.accuracy;
              const isSevere = acc < 75;

              return (
                <div
                  key={item.char}
                  className={`p-2.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
                    isSevere
                      ? 'bg-rose-500/5 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-neutral-900 text-amber-300 flex items-center justify-center font-bold text-sm border border-neutral-700 shadow-xs">
                      {item.char}
                    </span>
                    <span className="font-sans text-[11px] text-neutral-500 dark:text-neutral-400">
                      {item.errors} errors
                    </span>
                  </div>
                  <span className="font-black text-sm">{acc}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeakKeysPanel;
