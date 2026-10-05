import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Smile, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';

// WhatsApp default reaction emojis + user requested love, angry, happy
export const WHATSAPP_PRIMARY_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🙏'];

// Additional popular reactions when expanding the "+" button
export const WHATSAPP_EXTRA_REACTIONS = [
  '🔥', '🎉', '🚀', '💯', '✨', '👏', '👀', '💀',
  '💡', '⚡', '☕', '💪', '🤝', '🙌', '🥳', '💔',
  '🤡', '💩', '😴', '🤯', '😎', '🫡', '🎯', '🔒',
];

/**
 * Floating WhatsApp Reaction Bar Capsule
 * Appears above/beside message bubble with hover animation & + expansion
 */
export const WhatsAppReactionPicker = ({
  messageId,
  isMe,
  currentUserReaction,
  onReact,
  onClose,
}) => {
  const [showMore, setShowMore] = useState(false);
  const pickerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className={`absolute -top-11 ${
        isMe ? 'right-0' : 'left-0'
      } z-40 flex flex-col items-center animate-in zoom-in-75 duration-150 select-none drop-shadow-xl`}
    >
      <div className="bg-white/95 dark:bg-[#1e222b]/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-700/80 rounded-full px-2 py-1 flex items-center gap-1 shadow-2xl">
        {WHATSAPP_PRIMARY_REACTIONS.map((emoji) => {
          const isSelected = currentUserReaction === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(messageId, emoji);
                onClose();
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-transform duration-150 hover:scale-135 active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-500 scale-110'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title={isSelected ? `Remove ${emoji}` : `React ${emoji}`}
            >
              <span className="leading-none">{emoji}</span>
            </button>
          );
        })}

        {/* Plus button to show more emojis */}
        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer ${
            showMore
              ? 'bg-sky-500 text-white hover:text-white rotate-45'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title="More reactions"
        >
          <Plus className="w-4 h-4 transition-transform duration-150" />
        </button>
      </div>

      {/* Expanded Emoji Tray */}
      {showMore && (
        <div className="mt-1.5 p-2 bg-white/95 dark:bg-[#1e222b]/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-700/80 rounded-2xl shadow-2xl grid grid-cols-8 gap-1 animate-in fade-in slide-in-from-top-1 duration-150 max-w-xs">
          {WHATSAPP_EXTRA_REACTIONS.map((emoji) => {
            const isSelected = currentUserReaction === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onReact(messageId, emoji);
                  onClose();
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-base transition-transform hover:scale-135 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-500'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span className="leading-none">{emoji}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Overlapping WhatsApp Reaction Badge attached to Message Bubble
 */
export const WhatsAppReactionsBadge = ({
  reactions = [],
  currentUserId,
  isMe,
  onClick,
}) => {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji to get unique emojis and counts
  const emojiCounts = {};
  reactions.forEach((r) => {
    if (r.emoji) {
      emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
    }
  });

  const uniqueEmojis = Object.keys(emojiCounts);
  const totalCount = reactions.length;
  const hasUserReacted = reactions.some((r) => {
    const uId = r.user?._id || r.user;
    return String(uId) === String(currentUserId);
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute -bottom-2.5 ${
        isMe ? 'right-2' : 'left-2'
      } z-10 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs border text-[11px] font-semibold cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${
        hasUserReacted
          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-600/80 text-sky-800 dark:text-sky-200'
          : 'bg-white dark:bg-[#1a1e27] border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200'
      }`}
      title="View reactions"
    >
      <span className="flex items-center gap-0.5 leading-none">
        {uniqueEmojis.slice(0, 3).map((emoji) => (
          <span key={emoji} className="text-xs">
            {emoji}
          </span>
        ))}
      </span>
      {totalCount > 1 && (
        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
          {totalCount}
        </span>
      )}
    </button>
  );
};

/**
 * WhatsApp-style Reactions Detail Modal / Sheet
 * Displays tabs by reaction emoji and list of users who reacted
 */
export const WhatsAppReactionsModal = ({
  isOpen,
  onClose,
  reactions = [],
  currentUserId,
  onRemoveReaction,
}) => {
  const [selectedEmojiTab, setSelectedEmojiTab] = useState('all');

  useEffect(() => {
    if (isOpen) {
      setSelectedEmojiTab('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Group reactions by emoji
  const emojiCounts = {};
  reactions.forEach((r) => {
    if (r.emoji) {
      emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
    }
  });

  const uniqueEmojis = Object.keys(emojiCounts);

  const filteredReactions =
    selectedEmojiTab === 'all'
      ? reactions
      : reactions.filter((r) => r.emoji === selectedEmojiTab);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reactions" maxWidth="max-w-sm">
      <div className="space-y-3 py-1">
        {/* Emoji Tabs (All, then individual emojis) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-200 dark:border-neutral-800 sidebar-scroll">
          <button
            type="button"
            onClick={() => setSelectedEmojiTab('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedEmojiTab === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            All {reactions.length}
          </button>

          {uniqueEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmojiTab(emoji)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                selectedEmojiTab === emoji
                  ? 'bg-sky-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <span>{emoji}</span>
              <span className="text-[10px] opacity-80">{emojiCounts[emoji]}</span>
            </button>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-2 max-h-60 overflow-y-auto sidebar-scroll pr-0.5">
          {filteredReactions.map((r, i) => {
            const user = r.user || {};
            const isCurrentUser = String(user._id || user) === String(currentUserId);

            return (
              <div
                key={r._id || `${user._id || i}-${r.emoji}`}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50/80 dark:bg-black/30 border border-neutral-200/80 dark:border-neutral-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name || 'User'}
                    size="sm"
                    showRoleBadge={false}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {user.name || 'User'} {isCurrentUser && <span className="text-sky-500 font-normal">(You)</span>}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      @{user.username || 'member'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg leading-none">{r.emoji}</span>
                  {isCurrentUser && onRemoveReaction && (
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveReaction();
                        onClose();
                      }}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer px-2 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Remove your reaction"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
