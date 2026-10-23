import React, { useState } from 'react';
import {
  Power,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const DeskVsBookshelfSimulator = () => {
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [deskItems, setDeskItems] = useState(['Minecraft Game', 'Discord Chat', 'Homework Essay']);

  const BOOKSHELF_FILES = [
    'Minecraft Game (20 GB)',
    'Discord Chat (500 MB)',
    'Homework Essay (2 MB)',
    'Family Photo Album (15 GB)',
    'Spotify Songs (4 GB)',
    'Operating System Windows (30 GB)',
  ];

  const handleTogglePower = () => {
    if (isPowerOn) {
      // Power turned off: RAM wipes out!
      setIsPowerOn(false);
      setDeskItems([]);
    } else {
      // Power turned back on
      setIsPowerOn(true);
    }
  };

  const handleOpenAppToDesk = (app) => {
    if (!isPowerOn) return;
    const cleanName = app.split(' (')[0];
    if (!deskItems.includes(cleanName)) {
      setDeskItems((prev) => [...prev, cleanName]);
    }
  };

  const handleCloseDeskApp = (app) => {
    setDeskItems((prev) => prev.filter((i) => i !== app));
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-sm space-y-6 select-none">
      {/* Header with Master Power Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Interactive Visualizer 4
          </span>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
            RAM vs Storage: The Famous "Desk vs. Bookshelf" Simulator
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Why do computers need BOTH RAM and an SSD? Test the power switch below to see what happens to each!
          </p>
        </div>

        {/* Master Power Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePower}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isPowerOn
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isPowerOn ? 'Turn Computer Power OFF' : 'Turn Computer Power ON'}</span>
        </button>
      </div>

      {/* Side-by-Side: Desk (RAM) vs Bookshelf (SSD) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* THE DESK (RAM / Primary Memory) */}
        <div
          className={`p-5 rounded-2xl border-2 transition-all duration-300 space-y-4 ${
            isPowerOn
              ? 'border-sky-400 bg-sky-50/40 dark:bg-sky-950/20'
              : 'border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  Your Desk = RAM (Primary Memory)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  VOLATILE
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Fastest access for open active apps. Holds what you are doing RIGHT NOW.
              </p>
            </div>
            <span className="text-2xl">🪑</span>
          </div>

          {/* Active Desk Surface */}
          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-[#12161f] min-h-[140px] flex flex-col justify-between">
            {isPowerOn ? (
              deskItems.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-400 block uppercase">
                    Active on Desk ({deskItems.length} open):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {deskItems.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-xs"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleCloseDeskApp(item)}
                          className="hover:opacity-75 cursor-pointer ml-1"
                          title="Close app"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-neutral-400 italic">
                  Desk is currently empty. Click files on the Bookshelf (SSD) to load them into RAM!
                </div>
              )
            ) : (
              <div className="text-center py-6 space-y-2">
                <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto" />
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                  POWER CUT! RAM WIPED CLEAN!
                </span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Because RAM needs electricity to hold charges, turning off the PC wipes everything on your desk to zero!
                </p>
              </div>
            )}

            {isPowerOn && (
              <div className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                Speed: <strong>~20 Nanoseconds</strong> (Lightning fast directly next to CPU)
              </div>
            )}
          </div>
        </div>

        {/* THE BOOKSHELF (SSD / Secondary Storage) */}
        <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Your Bookshelf = SSD (Secondary Storage)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  NON-VOLATILE
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Huge permanent vault. Safe forever even if power is completely OFF!
              </p>
            </div>
            <span className="text-2xl">📚</span>
          </div>

          {/* Bookshelf Storage Files */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-[#12161f] min-h-[140px] space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 block uppercase">
              Permanent Library (Click to load into RAM):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {BOOKSHELF_FILES.map((file) => (
                <button
                  key={file}
                  type="button"
                  disabled={!isPowerOn}
                  onClick={() => handleOpenAppToDesk(file)}
                  className="text-left px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">{file}</span>
                  <span className="text-emerald-500 font-bold ml-1">+</span>
                </button>
              ))}
            </div>

            <div className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              Status: <strong>100% Safe and Intact</strong> whether power is ON or OFF.
            </div>
          </div>
        </div>
      </div>

      {/* Teen Lesson Takeaway */}
      <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Golden Rule: You WORK at your Desk (RAM), but you STORE in your Bookshelf (SSD)!</span>
        </div>
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:inline">
          Always save your documents before shutting down!
        </span>
      </div>
    </div>
  );
};

export default DeskVsBookshelfSimulator;
