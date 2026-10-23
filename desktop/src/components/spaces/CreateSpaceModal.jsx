import React, { useState } from 'react';
import { Radio, X, Sparkles, Hash, Mic } from 'lucide-react';
import { useCall } from '../../context/CallContext';

const TOPIC_PRESETS = [
  'General Discussion',
  'Tech & Code',
  'Web Development',
  'Career & Jobs',
  'Open Mic & Chill',
  'AI & Machine Learning',
  'Design & UI/UX',
  'DSA & Algorithms',
];

export const CreateSpaceModal = ({ isOpen, onClose }) => {
  const { createSpace } = useCall();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Tech & Code');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createSpace({ title: title.trim(), topic });
      setTitle('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-2xl p-6 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                Host an Audio Space
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Live audio room for your community
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Space Title Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              What do you want to talk about?
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={80}
              placeholder="e.g. Next.js App Router vs Pages: Architecture Breakdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-[#16181c] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all text-xs sm:text-sm"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-500">
              <span>Give your room an interesting topic</span>
              <span>{title.length}/80</span>
            </div>
          </div>

          {/* Topic Category Select / Chips */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-sky-500" />
              <span>Select Category</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {TOPIC_PRESETS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    topic === t
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Host Permissions Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
            <Mic className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Anyone with access can tune in as a listener. As host, you control mic permissions, invite speakers, and manage the stage.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Launching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Space</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpaceModal;
