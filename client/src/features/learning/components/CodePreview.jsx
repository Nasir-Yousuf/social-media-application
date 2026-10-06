import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Terminal, Eye, Trash2 } from 'lucide-react';

export const CodePreview = ({
  html = '',
  css = '',
  javascript = '',
  autoRun = true,
  runTrigger = 0,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'console'
  const [logs, setLogs] = useState([]);
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');
  const iframeRef = useRef(null);

  const generateSourceDoc = () => {
    // Generate secure sandbox document with console interception
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 16px;
      padding: 0;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
    }
    /* User Custom CSS */
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    (function() {
      // Intercept console.log and errors
      const origLog = console.log;
      console.log = function(...args) {
        origLog.apply(console, args);
        try {
          const formatted = args.map(a => {
            if (typeof a === 'object') {
              try { return JSON.stringify(a, null, 2); } catch (e) { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({ type: 'LEARN_CONSOLE_LOG', data: formatted }, '*');
        } catch(e) {}
      };

      window.onerror = function(msg, url, line) {
        try {
          window.parent.postMessage({
            type: 'LEARN_CONSOLE_ERROR',
            data: 'Error: ' + msg + ' (Line ' + line + ')'
          }, '*');
        } catch(e) {}
      };
    })();

    try {
      ${javascript}
    } catch(err) {
      console.log('Error executing JavaScript:', err.message);
    }
  <\/script>
</body>
</html>`;
  };

  const handleRun = () => {
    setLogs([]);
    setIframeSrcDoc(generateSourceDoc());
  };

  useEffect(() => {
    if (autoRun || runTrigger > 0) {
      handleRun();
    }
  }, [html, css, javascript, runTrigger, autoRun]);

  // Listen for console messages from sandboxed iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'LEARN_CONSOLE_LOG') {
        setLogs((prev) => [...prev, { type: 'log', text: e.data.data, time: new Date() }]);
      } else if (e.data?.type === 'LEARN_CONSOLE_ERROR') {
        setLogs((prev) => [...prev, { type: 'error', text: e.data.data, time: new Date() }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div
      className={`flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0e1116] overflow-hidden shadow-xs font-sans ${className}`}
    >
      {/* Preview Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-100/90 dark:bg-[#161a22] border-b border-neutral-200 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'console'
                ? 'bg-neutral-800 dark:bg-neutral-700 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
            {logs.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          {activeTab === 'console' && logs.length > 0 && (
            <button
              type="button"
              onClick={() => setLogs([])}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Clear Console"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleRun}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors cursor-pointer"
            title="Reload preview"
          >
            <RotateCw className="w-3 h-3" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Main Preview / Console Body */}
      <div className="relative flex-1 min-h-[220px] max-h-[420px] overflow-hidden bg-white">
        {activeTab === 'preview' ? (
          <iframe
            ref={iframeRef}
            srcDoc={iframeSrcDoc}
            title="Code Preview Sandbox"
            sandbox="allow-scripts"
            className="w-full h-full min-h-[220px] max-h-[420px] border-0 bg-white"
          />
        ) : (
          <div className="h-full min-h-[220px] max-h-[420px] p-3 overflow-y-auto font-mono text-xs bg-[#0b0e14] text-neutral-200 space-y-1.5">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-xs">
                <p>Console is clean.</p>
                <p className="text-[11px] mt-1 text-neutral-600">
                  Use console.log(...) in JavaScript to see outputs here.
                </p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 py-1 px-2 rounded font-mono ${
                    log.type === 'error'
                      ? 'bg-rose-500/15 text-rose-300 border-l-2 border-rose-500'
                      : 'hover:bg-neutral-900 text-neutral-200'
                  }`}
                >
                  <span className="text-neutral-500 select-none">&gt;</span>
                  <span className="whitespace-pre-wrap break-all">{log.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview;
