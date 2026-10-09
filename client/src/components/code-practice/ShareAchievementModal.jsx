import React from 'react';
import Modal from '../common/Modal';
import PostComposer from '../posts/PostComposer';
import { useNotifications } from '../../context/NotificationContext';
import { Sparkles, Trophy, Flame, Share2 } from 'lucide-react';

export const ShareAchievementModal = ({
  isOpen = false,
  onClose,
  results = null,
  initialContent = '',
  initialLanguage = 'javascript',
}) => {
  const { showToast } = useNotifications();

  if (!isOpen) return null;

  const wpm = results?.wpm || 65;
  const accuracy = results?.accuracy || 98;
  const modeName = results?.modeName || 'Classic';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🚀 Share Achievement to Feed" maxWidth="max-w-2xl">
      <div className="space-y-4 font-sans selection:bg-sky-500 selection:text-white">
        {/* Live Visual Card Graphic Preview */}
        <div className="p-4 rounded-2xl bg-[#0d1017] border border-sky-500/40 shadow-xl text-white space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-black text-sm">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider text-sky-400 uppercase">
                  Clearfeed Code Typing Badge
                </h4>
                <span className="text-[10px] text-neutral-400 font-mono">{initialLanguage.toUpperCase()} · {modeName}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
              <Sparkles className="w-3 h-3" />
              <span>COMMUNITY VERIFIED</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-[#141824] border border-sky-500/20">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Speed</span>
              <span className="text-2xl font-black text-sky-400 font-mono">{wpm} WPM</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#141824] border border-emerald-500/20">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Accuracy</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{accuracy}%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#141824] border border-amber-500/20">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Rank Badge</span>
              <span className="text-2xl font-black text-amber-400 font-mono">PRO ⚡</span>
            </div>
          </div>

          {/* Mini Performance Graph SVG Illustration */}
          <div className="h-12 w-full bg-[#121620] rounded-xl border border-neutral-800 flex items-center px-3 justify-between overflow-hidden">
            <span className="text-[10px] font-mono text-neutral-400 font-bold">WPM SPEED CURVE</span>
            <svg viewBox="0 0 200 30" className="w-32 h-8 overflow-visible">
              <path
                d="M 0 25 Q 40 10, 80 18 T 160 5 T 200 12"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>

        {/* Post Composer Component */}
        <div className="space-y-1">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Personalize your post caption before publishing to the developer stream:
          </p>
          <PostComposer
            initialContent={initialContent}
            initialShowCode={false}
            initialLanguage={initialLanguage}
            compact={true}
            onPostCreated={() => {
              showToast('Achievement post published to feed!', 'success');
              onClose();
              window.dispatchEvent(new CustomEvent('clearfeed:newPost'));
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ShareAchievementModal;
