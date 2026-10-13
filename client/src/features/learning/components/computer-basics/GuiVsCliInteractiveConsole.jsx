import React, { useState } from 'react';
import {
  AppWindow,
  Folder,
  Music,
  Calculator,
} from 'lucide-react';

const getSystemDateString = () => {
  const now = new Date();
  return `${now.toLocaleTimeString()} ${now.toLocaleDateString()}`;
};

export const GuiVsCliInteractiveConsole = () => {
  // CLI Terminal state
  const [terminalHistory, setTerminalHistory] = useState([
    'Clearfeed DOS/Linux Kernel v1.0 [Ready]',
    'Type a command or click a quick command below:',
  ]);
  const [cliInput, setCliInput] = useState('');

  // GUI Window state
  const [guiOpenApp, setGuiOpenApp] = useState('Welcome');
  const [guiCount, setGuiCount] = useState(0);

  const handleRunCommand = (cmd) => {
    const trimmed = (cmd || cliInput).trim().toLowerCase();
    if (!trimmed) return;

    let response = '';
    if (trimmed === 'help') {
      response = 'Available commands: help, date, dir, calc, hello, clear';
    } else if (trimmed === 'date') {
      response = `System Time: ${getSystemDateString()}`;
    } else if (trimmed === 'dir' || trimmed === 'ls') {
      response = 'Directory of C:\\Users\\Student\n  homework.docx   [14 KB]\n  game.exe        [2.4 GB]\n  photo.png       [3.1 MB]';
    } else if (trimmed.startsWith('calc') || trimmed.includes('+') || trimmed.includes('*')) {
      response = 'ALU Execution: 10 + 20 = 30';
    } else if (trimmed === 'hello') {
      response = 'Hello human operator! CPU is functioning normally at 3.2 GHz.';
    } else if (trimmed === 'clear' || trimmed === 'cls') {
      setTerminalHistory(['Terminal cleared.']);
      setCliInput('');
      return;
    } else {
      response = `Command '${trimmed}' executed successfully. [Exit code: 0]`;
    }

    setTerminalHistory((prev) => [...prev, `> ${trimmed}`, response]);
    setCliInput('');
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            Interactive Visualizer 5
          </span>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            CLI vs GUI: How Humans Talk to the Operating System
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Test the hacker Command Line (CLI) on the left and the point-and-click Graphical Interface (GUI) on the right!
          </p>
        </div>
      </div>

      {/* Side-by-Side: Terminal vs GUI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LEFT: CLI TERMINAL */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0d1117] text-emerald-400 p-4 font-mono text-xs flex flex-col justify-between min-h-[280px] shadow-md">
          <div className="space-y-2">
            {/* Terminal Window Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-400 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 font-bold text-neutral-300">bash / command-prompt</span>
              </div>
              <span>CLI (Text-Only)</span>
            </div>

            {/* Terminal Output Stream */}
            <div className="space-y-1 max-h-40 overflow-y-auto pt-1 leading-relaxed text-[11px]">
              {terminalHistory.map((line, idx) => (
                <div
                  key={idx}
                  className={line.startsWith('>') ? 'text-sky-300 font-bold' : 'text-emerald-400'}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Command Buttons & Input Form */}
          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <div className="flex flex-wrap gap-1 text-[10px]">
              <span className="text-neutral-500 py-0.5">Quick:</span>
              {['help', 'date', 'dir', 'calc 10+20', 'clear'].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleRunCommand(btn)}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
                >
                  {btn}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunCommand(cliInput);
              }}
              className="flex items-center gap-2"
            >
              <span className="text-emerald-500 font-bold">{'>'}</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="type command & press Enter..."
                className="flex-1 bg-transparent border-none text-emerald-400 placeholder:text-neutral-600 focus:outline-none text-xs font-mono"
              />
            </form>
          </div>
        </div>

        {/* RIGHT: GUI DESKTOP */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-100 to-white dark:from-[#161d28] dark:to-[#0f141d] p-4 flex flex-col justify-between min-h-[280px] shadow-md">
          <div className="space-y-3">
            {/* GUI Window Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500">
              <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-200">
                <AppWindow className="w-4 h-4 text-sky-500" />
                <span>Modern GUI Desktop (WIMP)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                Point & Click
              </span>
            </div>

            {/* Desktop Icons */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <button
                type="button"
                onClick={() => setGuiOpenApp('My Files Folder')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  guiOpenApp === 'My Files Folder'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Folder className="w-5 h-5 text-amber-500" />
                <span className="text-[10px] font-bold">Files</span>
              </button>

              <button
                type="button"
                onClick={() => setGuiOpenApp('Calculator App')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  guiOpenApp === 'Calculator App'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Calculator className="w-5 h-5 text-sky-500" />
                <span className="text-[10px] font-bold">Calculator</span>
              </button>

              <button
                type="button"
                onClick={() => setGuiOpenApp('Music Player')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  guiOpenApp === 'Music Player'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Music className="w-5 h-5 text-rose-500" />
                <span className="text-[10px] font-bold">Music</span>
              </button>
            </div>

            {/* Active App Window Preview */}
            <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#12161f] space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase">
                Active Window: {guiOpenApp}
              </span>
              {guiOpenApp === 'Calculator App' ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    Counter: {guiCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuiCount((prev) => prev + 1)}
                    className="px-3 py-1 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 cursor-pointer"
                  >
                    Click +1 Button
                  </button>
                </div>
              ) : guiOpenApp === 'Music Player' ? (
                <div className="flex items-center gap-2 text-xs text-rose-500 font-bold">
                  <span>▶ Playing: Lo-fi Study Beats (3:24)</span>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Click any colorful icon above! No memorizing command syntax required.
                </p>
              )}
            </div>
          </div>

          <div className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            WIMP acronym: <strong>Windows, Icons, Menus, Pointers</strong>
          </div>
        </div>
      </div>

      {/* Comparison Bottom Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700 space-y-1">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            Why Coders Love CLI (Command Line):
          </span>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Uses zero graphics memory, runs blazingly fast over the internet, and allows automating 10,000 files with a single typed script.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700 space-y-1">
          <span className="font-bold text-sky-600 dark:text-sky-400">
            Why Everyday Users Love GUI (Graphical):
          </span>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Super friendly and visual. You don’t need to remember commands like <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">rmdir /s</code>; you just drag a file to the Trash Can!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuiVsCliInteractiveConsole;
