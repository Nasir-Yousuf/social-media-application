import React from 'react';
import { Mail, MessageSquare, Shield } from 'lucide-react';
import Button from '../components/common/Button';

export const MessagesPage = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-3 border-b cf-border">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[var(--color-cf-accent)]" />
          <h1 className="text-xl font-bold tracking-tight cf-text">Messages</h1>
        </div>
        <p className="text-xs cf-text-muted mt-0.5 font-serif italic">
          Quiet, intentional 1-on-1 text communication.
        </p>
      </div>

      <div className="p-12 text-center rounded-xl cf-surface border cf-border space-y-3 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-[var(--color-cf-accent-soft)] dark:bg-[var(--color-cfd-accent-soft)] flex items-center justify-center text-[var(--color-cf-accent)] dark:text-[var(--color-cfd-accent)] mx-auto">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold cf-text">Direct Messages</h2>
        <p className="text-xs cf-text-muted leading-relaxed font-serif">
          Clearfeed direct messaging is designed for substantive technical exchanges and direct discussions without read receipts, typing indicators, or artificial urgency.
        </p>
        <div className="pt-2">
          <span className="text-[11px] px-3 py-1 rounded-full cf-bg border cf-border cf-text-muted font-mono">
            Direct Messaging Architecture Initialized (Phase 2)
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
