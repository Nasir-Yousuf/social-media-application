import React, { useState, useRef } from 'react';
import { Copy, RotateCcw, Check, Code2, Palette, Sparkles, Terminal } from 'lucide-react';

export const CodeEditor = ({
  code,
  onChange,
  onReset,
  activeTab = 'html',
  setActiveTab,
  readOnly = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    // Enable tab indentation inside textarea
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const currentVal = code[activeTab] || '';
      const newVal = currentVal.substring(0, start) + '  ' + currentVal.substring(end);
      onChange({ ...code, [activeTab]: newVal });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code[activeTab] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentContent = code[activeTab] || '';
  const lineCount = Math.max(1, currentContent.split('\n').length);

  return (
    <div
      className={`flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0e1116] overflow-hidden shadow-xs font-sans ${className}`}
    >
      {/* Editor Header Bar with Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-100/90 dark:bg-[#161a22] border-b border-neutral-200 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(code.python !== undefined || activeTab === 'python') && (
            <button
              type="button"
              onClick={() => setActiveTab('python')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'python'
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-500'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Python 🐍</span>
            </button>
          )}

          {code.html !== undefined && (
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'html'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-orange-500'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
          )}

          {code.css !== undefined && (
            <button
              type="button"
              onClick={() => setActiveTab('css')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'css'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-sky-500'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>CSS</span>
            </button>
          )}

          {code.javascript !== undefined && (
            <button
              type="button"
              onClick={() => setActiveTab('javascript')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'javascript'
                  ? 'bg-amber-400 text-black shadow-xs font-black'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-amber-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>JS</span>
            </button>
          )}
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Reset code to initial starter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Copy current code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers Gutter */}
      <div className="relative flex flex-1 min-h-[220px] max-h-[420px] overflow-hidden bg-neutral-50/50 dark:bg-[#0c0f14]">
        {/* Line Numbers Gutter */}
        <div className="select-none py-3 px-2 text-right text-[11px] font-mono text-neutral-400 dark:text-neutral-600 bg-neutral-100/50 dark:bg-[#12151c]/60 border-r border-neutral-200/60 dark:border-neutral-800/60 min-w-[36px]">
          {Array.from({ length: Math.min(lineCount, 120) }, (_, i) => (
            <div key={i + 1} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Input Textarea */}
        <textarea
          ref={textareaRef}
          value={currentContent}
          onChange={(e) => onChange({ ...code, [activeTab]: e.target.value })}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={`Write ${activeTab.toUpperCase()} code here...`}
          className="flex-1 w-full p-3 font-mono text-xs sm:text-[13px] leading-5 text-neutral-900 dark:text-neutral-100 bg-transparent resize-none focus:outline-none focus:ring-0 selection:bg-sky-500/30 overflow-auto"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
