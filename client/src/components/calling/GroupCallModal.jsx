import React, { useState } from 'react';
import {
  Users,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Minimize2,
  Maximize2,
  UserPlus,
  Volume2,
  X,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import AudioVisualizerWave from './AudioVisualizerWave';

export const GroupCallModal = () => {
  const { user: currentUser } = useAuth();
  const {
    groupCallState,
    activeGroupCall,
    incomingGroupCall,
    isGroupCallModalOpen,
    isGroupMuted,
    groupCallDuration,
    formatDuration,
    localAudioStream,
    speakingUsers,
    acceptGroupCall,
    rejectGroupCall,
    leaveGroupCall,
    toggleGroupMute,
    openNewCallModal,
  } = useCall();

  const [isMinimized, setIsMinimized] = useState(false);

  // 1. Incoming Group Call Ringing Alert
  if (groupCallState === 'incoming' && incomingGroupCall) {
    const caller = incomingGroupCall.caller || {};
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
        <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-2xl p-7 flex flex-col items-center text-center overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Caller Avatar with Pulsing Rings */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full bg-sky-500/20 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full bg-sky-500/30 animate-pulse" />
            <div className="relative ring-4 ring-neutral-200 dark:ring-neutral-800 rounded-full">
              <Avatar src={caller.avatarUrl} name={caller.name} size="xl" />
            </div>
          </div>

          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5" />
              Incoming Group Voice Call
            </span>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white">
              {incomingGroupCall.roomName || 'Group Audio Call'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Invited by @{caller.username || 'member'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 mt-6">
            <button
              type="button"
              onClick={rejectGroupCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-rose-500">
                Decline
              </span>
            </button>

            <button
              type="button"
              onClick={acceptGroupCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all animate-bounce">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-500 group-hover:text-emerald-400">
                Join Call
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isGroupCallModalOpen || !activeGroupCall) {
    return null;
  }

  const participants = activeGroupCall.participants || [];

  // 2. Floating PIP Minimized Bar
  if (isMinimized) {
    return (
      <aside aria-label="Active group call widget" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white dark:bg-[#121519] border border-sky-500/40 text-neutral-900 dark:text-white shadow-2xl shadow-sky-500/20 backdrop-blur-xl animate-fade-in font-sans">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Users className="w-4 h-4 animate-pulse" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold leading-tight truncate max-w-[130px]">
            {activeGroupCall.roomName}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {formatDuration(groupCallDuration)}
            </span>
            <span className="text-[11px] text-sky-500 font-semibold">
              • {participants.length} in call
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-2">
          <button
            type="button"
            onClick={toggleGroupMute}
            className={`p-2 rounded-full transition-colors ${
              isGroupMuted ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
            title={isGroupMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isGroupMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Expand Call"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={leaveGroupCall}
            className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            title="Leave"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // 3. Full Group Voice Call Modal Window
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-28 -left-28 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-black/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-900 dark:text-white truncate">
                {activeGroupCall.roomName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-mono text-sky-500 font-bold">
                  {formatDuration(groupCallDuration)}
                </span>
                <span>•</span>
                <span>{participants.length} connected</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openNewCallModal('group')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
              title="Add more people to group call"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Add Members</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Minimize to PIP"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Participants Stage Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {participants.map((p) => {
              const u = p.user || {};
              const isMe = u._id === currentUser?._id;
              const isSpeaking = speakingUsers.has(u._id);
              const userMuted = isMe ? isGroupMuted : p.isMuted;

              return (
                <div
                  key={u._id}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center relative transition-all ${
                    isSpeaking
                      ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-500 shadow-md shadow-sky-500/10'
                      : 'bg-neutral-50 dark:bg-[#16181c] border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="relative mb-3">
                    {/* Speaking sound ripple ring */}
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
                      <Avatar src={u.avatarUrl} name={u.name} size="lg" />
                    </div>

                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow ${
                        userMuted ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    >
                      {userMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[130px]">
                    {u.name} {isMe && '(You)'}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate max-w-[120px]">
                    @{u.username}
                  </span>

                  {/* Dynamic Audio Wave Effect on Speaker */}
                  <div className="mt-3 w-full flex justify-center h-8">
                    <AudioVisualizerWave
                      stream={isMe ? localAudioStream : null}
                      isSpeaking={isSpeaking}
                      isMuted={userMuted}
                      barCount={14}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/30 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleGroupMute}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                isGroupMuted
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25'
              }`}
            >
              {isGroupMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isGroupMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={leaveGroupCall}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCallModal;
