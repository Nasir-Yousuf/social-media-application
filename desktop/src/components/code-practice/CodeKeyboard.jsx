import React from 'react';
import { Keyboard as KeyboardIcon } from 'lucide-react';

const KEYBOARD_ROWS = [
  [
    { key: '`', label: '` ~', alt: '~' },
    { key: '1', label: '1 !', alt: '!' },
    { key: '2', label: '2 @', alt: '@' },
    { key: '3', label: '3 #', alt: '#' },
    { key: '4', label: '4 $', alt: '$' },
    { key: '5', label: '5 %', alt: '%' },
    { key: '6', label: '6 ^', alt: '^' },
    { key: '7', label: '7 &', alt: '&' },
    { key: '8', label: '8 *', alt: '*' },
    { key: '9', label: '9 (', alt: '(' },
    { key: '0', label: '0 )', alt: ')' },
    { key: '-', label: '- _', alt: '_' },
    { key: '=', label: '= +', alt: '+' },
    { key: 'Backspace', label: '⌫', width: 'w-14 sm:w-16' },
  ],
  [
    { key: 'Tab', label: 'Tab ⇥', width: 'w-12 sm:w-14' },
    { key: 'q' }, { key: 'w' }, { key: 'e' }, { key: 'r' }, { key: 't' },
    { key: 'y' }, { key: 'u' }, { key: 'i' }, { key: 'o' }, { key: 'p' },
    { key: '[', label: '[ {', alt: '{' },
    { key: ']', label: '] }', alt: '}' },
    { key: '\\', label: '\\ |', alt: '|', width: 'w-10 sm:w-12' },
  ],
  [
    { key: 'Caps', label: 'Caps', width: 'w-14 sm:w-16' },
    { key: 'a' }, { key: 's' }, { key: 'd' }, { key: 'f' }, { key: 'g' },
    { key: 'h' }, { key: 'j' }, { key: 'k' }, { key: 'l' },
    { key: ';', label: '; :', alt: ':' },
    { key: "'", label: "' \"", alt: '"' },
    { key: 'Enter', label: 'Enter ↵', width: 'w-16 sm:w-20' },
  ],
  [
    { key: 'Shift', label: '⇧ Shift', width: 'w-16 sm:w-20' },
    { key: 'z' }, { key: 'x' }, { key: 'c' }, { key: 'v' }, { key: 'b' },
    { key: 'n' }, { key: 'm' },
    { key: ',', label: ', <', alt: '<' },
    { key: '.', label: '. >', alt: '>' },
    { key: '/', label: '/ ?', alt: '?' },
    { key: 'ShiftRight', label: '⇧ Shift', width: 'w-16 sm:w-20' },
  ],
  [
    { key: 'Space', label: 'Space Bar', width: 'w-48 sm:w-64' },
  ],
];

export const CodeKeyboard = ({ nextChar = '', isVisible = true, onToggleVisible }) => {
  if (!isVisible) return null;

  // Determine if target next char matches a key
  const isTargetKey = (item) => {
    if (!nextChar) return false;

    if (nextChar === '\n' && item.key === 'Enter') return true;
    if (nextChar === ' ' && item.key === 'Space') return true;
    if (nextChar === '\t' && item.key === 'Tab') return true;

    const lowerTarget = nextChar.toLowerCase();
    if (item.key.toLowerCase() === lowerTarget) return true;
    if (item.alt === nextChar) return true;
    if (item.key === nextChar) return true;

    return false;
  };

  const PROGRAMMING_SYMBOLS = ['<', '>', '/', '=', '"', "'", '`', ';', ':', '(', ')', '[', ']', '{', '}', '_', '-', '+', '*', '&', '|', '!', '?', '@', '#', '$', '%'];

  return (
    <div className="w-full bg-[#121519] border border-neutral-800 rounded-2xl p-3 sm:p-4 text-white shadow-xl animate-fade-in font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-3">
        <div className="flex items-center gap-2">
          <KeyboardIcon className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Interactive Code Keyboard
          </span>
          {nextChar && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 font-mono font-bold">
              Next Key: <span className="text-amber-300 underline font-black">{nextChar === ' ' ? 'Space' : nextChar === '\n' ? 'Enter ↵' : nextChar}</span>
            </span>
          )}
        </div>

        {onToggleVisible && (
          <button
            onClick={onToggleVisible}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Hide Keyboard
          </button>
        )}
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col items-center gap-1.5 overflow-x-auto pb-1 select-none">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 sm:gap-1.5 justify-center shrink-0">
            {row.map((item, kIdx) => {
              const active = isTargetKey(item);
              const isProgSymbol = item.alt && PROGRAMMING_SYMBOLS.includes(item.alt);
              const keyWidth = item.width || 'w-7 sm:w-9';

              return (
                <div
                  key={kIdx}
                  className={`h-9 sm:h-10 ${keyWidth} rounded-lg flex flex-col items-center justify-center text-xs font-mono transition-all duration-150 relative border shadow-sm ${
                    active
                      ? 'bg-sky-500 border-sky-300 text-white font-extrabold scale-105 shadow-md shadow-sky-500/50 ring-2 ring-sky-300 animate-pulse'
                      : isProgSymbol
                      ? 'bg-neutral-800/90 border-amber-500/30 text-amber-300 hover:border-amber-400'
                      : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-[11px] font-semibold leading-none">
                    {item.label || item.key.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeKeyboard;
