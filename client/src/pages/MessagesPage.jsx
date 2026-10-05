import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

export const MessagesPage = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Messages</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-sans">
              Quiet, intentional 1-on-1 text communication.
            </p>
          </div>
        </div>
      </div>

      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 space-y-3 max-w-lg mx-auto shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-500 mx-auto shadow-2xs">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Direct Messages</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans max-w-sm mx-auto">
          Clearfeed direct messaging is designed for substantive technical exchanges and direct discussions without read receipts, typing indicators, or artificial urgency.
        </p>
        <div className="pt-2">
          <span className="text-[11px] px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-neutral-600 dark:text-neutral-400 font-mono">
            Direct Messaging Architecture Initialized (Phase 2)
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
