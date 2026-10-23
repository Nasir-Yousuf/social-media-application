import React, { useState } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Hand,
  Volume2,
  X,
  Minimize2,
  Maximize2,
  Users,
  Crown,
  LogOut,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import AudioVisualizerWave from '../calling/AudioVisualizerWave';

const REACTION_EMOJIS = ['❤️', '🔥', '👏', '🚀', '💯', '😂', '🎉'];

export const SpacesModal = () => {
  const { user: currentUser } = useAuth();
  const {
    activeSpace,
    isSpacesModalOpen,
    setIsSpacesModalOpen,
    isSpaceMuted,
    isHandRaised,
    localAudioStream,
    speakingUsers,
    spaceReactions,
    isHost,
    isSpeaker,
    leaveSpace,
    toggleSpaceMute,
    raiseHand,
    setParticipantRole,
    sendSpaceReaction,
  } = useCall();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!isSpacesModalOpen || !activeSpace) {
    return null;
  }

  const host = activeSpace.host || {};
  const speakers = activeSpace.speakers || [];
  const listeners = activeSpace.listeners || [];
  const totalCount = 1 + speakers.length + listeners.length;
  const isHostSpeaking = speakingUsers.has(host._id);

  // 1. Minimized floating widget (allows browsing website while listening)
  if (isMinimized) {
    return (
      <aside aria-label="Active space widget" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#121519] border border-sky-500/40 text-neutral-900 dark:text-white shadow-2xl shadow-sky-500/20 backdrop-blur-xl animate-fade-in max-w-sm font-sans">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900 animate-pulse" />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-bold leading-tight truncate text-neutral-900 dark:text-white">
            {activeSpace.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-bold text-rose-500">● LIVE</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {totalCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-2">
          {isSpeaker && (
            <button
              type="button"
              onClick={toggleSpaceMute}
              className={`p-2 rounded-xl transition-colors ${
                isSpaceMuted
                  ? 'bg-rose-500/15 text-rose-500'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              }`}
              title={isSpaceMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isSpaceMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Expand Space"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={leaveSpace}
            className="p-2 rounded-xl hover:bg-rose-500/15 text-neutral-400 hover:text-rose-500 transition-colors"
            title="Leave"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // 2. Full Audio Stage Interface
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Background Ambient Lighting */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Emojis Layer */}
        <div className="absolute bottom-24 right-8 pointer-events-none z-30 flex flex-col gap-2">
          {spaceReactions.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-700 shadow-lg text-sm animate-bounce font-medium text-neutral-800 dark:text-neutral-200 backdrop-blur-md"
            >
              <span>{r.emoji}</span>
              <span className="text-[11px] text-neutral-500 font-normal">{r.username}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-black/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-500 text-xs font-bold tracking-wide shrink-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              LIVE
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-900 dark:text-white truncate max-w-md">
                {activeSpace.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="text-sky-500 font-bold">#{activeSpace.topic}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {totalCount} participating
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Minimize to PIP"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={leaveSpace}
              className="p-2 rounded-full hover:bg-rose-500/15 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
              title="Leave Room"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage & Listeners Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Section: Speakers & Host */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                Speakers on Stage ({1 + speakers.length})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Host Card */}
              <div
                className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isHostSpeaking
                    ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-500 shadow-md shadow-sky-500/10'
                    : 'bg-neutral-50 dark:bg-[#16181c] border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="relative mb-2">
                  {/* Glowing speaking ring */}
                  {isHostSpeaking && (
                    <div className="absolute -inset-2 rounded-full bg-sky-500/30 animate-pulse blur-xs" />
                  )}

                  <div
                    className={`relative rounded-full ${
                      isHostSpeaking
                        ? 'ring-3 ring-sky-500'
                        : 'ring-2 ring-neutral-200 dark:ring-neutral-700'
                    }`}
                  >
                    <Avatar src={host.avatarUrl} name={host.name} size="lg" />
                  </div>

                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow"
                    title="Room Host"
                  >
                    <Crown className="w-3 h-3 fill-current" />
                  </span>
                </div>

                <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[110px]">
                  {host.name}
                </span>
                <span className="text-[10px] text-sky-500 font-bold uppercase tracking-wide">
                  Host
                </span>

                {/* Real-time Audio Wave Effect for Host */}
                <div className="mt-2.5 w-full flex justify-center h-6">
                  <AudioVisualizerWave
                    stream={isHost ? localAudioStream : null}
                    isSpeaking={isHostSpeaking}
                    isMuted={isHost ? isSpaceMuted : false}
                    barCount={12}
                    size="sm"
                  />
                </div>
              </div>

              {/* Other Speakers */}
              {speakers.map((spk) => {
                const spkUser = spk.user || {};
                const isSpeaking = speakingUsers.has(spkUser._id);
                const isMe = spkUser._id === currentUser?._id;
                const userMuted = isMe ? isSpaceMuted : spk.isMuted;

                return (
                  <div
                    key={spkUser._id}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      isSpeaking
                        ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-500 shadow-md shadow-sky-500/10'
                        : 'bg-neutral-50 dark:bg-[#16181c] border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="relative mb-2">
                      {isSpeaking && (
                        <div className="absolute -inset-2 rounded-full bg-sky-500/30 animate-pulse blur-xs" />
                      )}

                      <div
                        className={`relative rounded-full ${
                          isSpeaking
                            ? 'ring-3 ring-sky-500'
                            : 'ring-2 ring-neutral-200 dark:ring-neutral-700'
                        }`}
                      >
                        <Avatar src={spkUser.avatarUrl} name={spkUser.name} size="lg" />
                      </div>

                      <span
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                          userMuted ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        title={userMuted ? 'Muted' : 'Speaking'}
                      >
                        {userMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[110px]">
                      {spkUser.name} {isMe && '(You)'}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold uppercase">
                      Speaker
                    </span>

                    {/* Dynamic Audio Wave Effect for Speakers */}
                    <div className="mt-2.5 w-full flex justify-center h-6">
                      <AudioVisualizerWave
                        stream={isMe ? localAudioStream : null}
                        isSpeaking={isSpeaking}
                        isMuted={userMuted}
                        barCount={12}
                        size="sm"
                      />
                    </div>

                    {/* Host action: demote speaker */}
                    {isHost && spkUser._id !== currentUser?._id && (
                      <button
                        type="button"
                        onClick={() => setParticipantRole(spkUser._id, 'listener')}
                        className="mt-1.5 text-[10px] text-neutral-500 hover:text-rose-500 transition-colors"
                      >
                        Make Listener
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Listeners */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                Listeners ({listeners.length})
              </span>
            </div>

            {listeners.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500 italic">
                No listeners currently tuned in. Invite classmates to join the space!
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {listeners.map((lst) => {
                  const lstUser = lst.user || {};
                  const hasHandRaised = lst.raisedHand;

                  return (
                    <div key={lstUser._id} className="flex flex-col items-center text-center group">
                      <div className="relative mb-1.5">
                        <Avatar src={lstUser.avatarUrl} name={lstUser.name} size="md" />

                        {hasHandRaised && (
                          <span
                            className="absolute -top-1 -right-1.5 px-1 rounded-full bg-amber-500 text-[10px] animate-bounce shadow-md"
                            title="Wants to speak!"
                          >
                            ✋
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[75px]">
                        {lstUser.name}
                      </span>

                      {/* Host can invite raised hand listener to stage */}
                      {isHost && (
                        <button
                          type="button"
                          onClick={() => setParticipantRole(lstUser._id, 'speaker')}
                          className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                            hasHandRaised
                              ? 'bg-sky-500 hover:bg-sky-400 text-white animate-pulse'
                              : 'text-neutral-500 hover:text-sky-500'
                          }`}
                        >
                          Invite
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Toolbar & Controls */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left Controls: Mic toggle or Request to Speak */}
          <div className="flex items-center gap-2">
            {isSpeaker ? (
              <button
                type="button"
                onClick={toggleSpaceMute}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                  isSpaceMuted
                    ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25'
                }`}
              >
                {isSpaceMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isSpaceMuted ? 'Muted' : 'Speaking'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={raiseHand}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                  isHandRaised
                    ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-md shadow-amber-500/25'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                }`}
              >
                <Hand className="w-4 h-4" />
                <span>{isHandRaised ? 'Hand Raised ✋' : 'Request to Speak'}</span>
              </button>
            )}
          </div>

          {/* Quick Reaction Bar */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1.5 rounded-full border border-neutral-200 dark:border-neutral-700/60">
            {REACTION_EMOJIS.slice(0, 5).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => sendSpaceReaction(emoji)}
                className="w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-125 flex items-center justify-center text-sm transition-transform cursor-pointer"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Right Controls: Leave or End */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={leaveSpace}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-500/15 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/25 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isHost ? 'End Space' : 'Leave Space'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacesModal;
