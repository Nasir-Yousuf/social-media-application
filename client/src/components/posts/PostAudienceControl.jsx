import React, { useState, useRef, useEffect } from 'react';
import { Globe, Users, Handshake, Lock, MessageCircle, UserCheck, AtSign, Check, ChevronDown } from 'lucide-react';

export const VISIBILITY_OPTIONS = [
  {
    id: 'public',
    label: 'Everyone',
    shortLabel: 'Everyone',
    description: 'Anyone on or off Clearfeed',
    icon: Globe,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
  {
    id: 'followers',
    label: 'Followers only',
    shortLabel: 'Followers',
    description: 'Only members following your profile',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'mutuals',
    label: 'Mutual follows',
    shortLabel: 'Mutuals',
    description: 'People you follow who also follow you back',
    icon: Handshake,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'private',
    label: 'Only me',
    shortLabel: 'Only me',
    description: 'Private post visible only to your account',
    icon: Lock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
];

export const REPLY_POLICY_OPTIONS = [
  {
    id: 'everyone',
    label: 'Everyone can reply',
    shortLabel: 'Everyone can reply',
    description: 'Anyone who can view this post can reply',
    icon: MessageCircle,
    color: 'text-sky-500',
  },
  {
    id: 'following',
    label: 'People you follow',
    shortLabel: 'Following only',
    description: 'Only members that you follow can reply',
    icon: UserCheck,
    color: 'text-emerald-500',
  },
  {
    id: 'mentioned',
    label: 'Only people you mention',
    shortLabel: 'Mentioned only',
    description: 'Only members tagged with @username can reply',
    icon: AtSign,
    color: 'text-amber-500',
  },
];

export const PostAudienceControl = ({
  visibility = 'public',
  onChangeVisibility,
  replyPolicy = 'everyone',
  onChangeReplyPolicy,
  compact = false,
}) => {
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const audienceRef = useRef(null);
  const replyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (audienceRef.current && !audienceRef.current.contains(e.target)) {
        setIsAudienceOpen(false);
      }
      if (replyRef.current && !replyRef.current.contains(e.target)) {
        setIsReplyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentVis = VISIBILITY_OPTIONS.find((v) => v.id === visibility) || VISIBILITY_OPTIONS[0];
  const currentRep = REPLY_POLICY_OPTIONS.find((r) => r.id === replyPolicy) || REPLY_POLICY_OPTIONS[0];
  const VisIcon = currentVis.icon;
  const RepIcon = currentRep.icon;

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
      {/* Visibility Pill Dropdown */}
      <div className="relative" ref={audienceRef}>
        <button
          type="button"
          onClick={() => {
            setIsAudienceOpen(!isAudienceOpen);
            setIsReplyOpen(false);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer ${
            visibility !== 'public' ? 'ring-1 ring-sky-500/30 text-sky-600 dark:text-sky-400' : ''
          }`}
          title="Choose who can see this post"
        >
          <VisIcon className={`w-3.5 h-3.5 ${currentVis.color}`} />
          <span>{currentVis.shortLabel}</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </button>

        {isAudienceOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-64 p-1.5 rounded-2xl bg-white dark:bg-[#161a20] border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 animate-fade-in">
            <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Who can see this?
            </div>
            <div className="space-y-0.5">
              {VISIBILITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = opt.id === visibility;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChangeVisibility(opt.id);
                      setIsAudienceOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${opt.bgColor} ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs">{opt.label}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                          {opt.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reply Policy Pill Dropdown (Only show if not private) */}
      {visibility !== 'private' && (
        <div className="relative" ref={replyRef}>
          <button
            type="button"
            onClick={() => {
              setIsReplyOpen(!isReplyOpen);
              setIsAudienceOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer ${
              replyPolicy !== 'everyone' ? 'ring-1 ring-amber-500/30 text-amber-600 dark:text-amber-400' : ''
            }`}
            title="Choose who can reply to this post"
          >
            <RepIcon className={`w-3.5 h-3.5 ${currentRep.color}`} />
            <span>{currentRep.shortLabel}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isReplyOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 p-1.5 rounded-2xl bg-white dark:bg-[#161a20] border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Who can reply?
              </div>
              <div className="space-y-0.5">
                {REPLY_POLICY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = opt.id === replyPolicy;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChangeReplyPolicy(opt.id);
                        setIsReplyOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          <Icon className={`w-4 h-4 ${opt.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs">{opt.label}</div>
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                            {opt.description}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostAudienceControl;
