import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Minimize2, Maximize2, Radio } from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import AudioVisualizerWave from './AudioVisualizerWave';

export const CallModal = () => {
  const { user: currentUser } = useAuth();
  const {
    callState,
    activeCall,
    isMuted,
    callDuration,
    formatDuration,
    isMinimized,
    localAudioStream,
    speakingUsers,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleMinimize,
  } = useCall();

  if (callState === 'idle' || !activeCall) {
    return null;
  }

  const otherUser = activeCall.otherUser || {};
  const isIncoming = callState === 'incoming';
  const isCalling = callState === 'calling';
  const isConnected = callState === 'connected';
  const isOtherSpeaking = speakingUsers.has(otherUser._id);
  const isMeSpeaking = currentUser && speakingUsers.has(currentUser._id);

  // 1. Minimized Floating PIP Widget (Browsing while on call)
  if (isMinimized && isConnected) {
    return (
      <aside aria-label="Active call widget" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white dark:bg-[#121519] border border-sky-500/40 text-neutral-900 dark:text-white shadow-2xl shadow-sky-500/20 backdrop-blur-xl animate-fade-in font-sans">
        <div className="relative">
          <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="sm" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 animate-pulse" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold leading-tight truncate max-w-[120px]">
            {otherUser.name || otherUser.username}
          </span>
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {formatDuration(callDuration)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            className={`p-2 rounded-full transition-colors ${
              isMuted ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleMinimize}
            aria-label="Expand call window"
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={endCall}
            aria-label="End active call"
            className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            title="End Call"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // 2. Full Call Dialog Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-2xl p-7 flex flex-col items-center text-center overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header controls */}
        {isConnected && (
          <div className="w-full flex justify-between items-center mb-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>

            <button
              type="button"
              onClick={toggleMinimize}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="Minimize to PIP"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Avatar with Pulsing Audio Ripples */}
        <div className="relative my-6 flex items-center justify-center">
          {(isCalling || isIncoming) && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-sky-500/15 animate-ping" />
              <div className="absolute w-28 h-28 rounded-full bg-sky-500/25 animate-pulse" />
            </>
          )}

          {isConnected && (isOtherSpeaking || isMeSpeaking) && (
            <div className="absolute w-32 h-32 rounded-full bg-sky-500/25 animate-pulse blur-xs" />
          )}

          <div
            className={`relative rounded-full transition-all ${
              isConnected && (isOtherSpeaking || isMeSpeaking)
                ? 'ring-4 ring-sky-500 shadow-lg shadow-sky-500/30'
                : 'ring-4 ring-neutral-200 dark:ring-neutral-800'
            }`}
          >
            <Avatar src={otherUser.avatarUrl} name={otherUser.name} size="xl" />
          </div>
        </div>

        {/* User Info & Status */}
        <h3 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white mb-1">
          {otherUser.name || otherUser.username}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-mono">
          @{otherUser.username}
        </p>

        {/* Call State Feedback */}
        <div className="mb-6 w-full flex flex-col items-center">
          {isIncoming && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-semibold animate-pulse border border-sky-500/20">
              <Radio className="w-3.5 h-3.5" />
              <span>Incoming Voice Call...</span>
            </div>
          )}

          {isCalling && (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                activeCall?.status === 'ringing'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {activeCall?.status === 'ringing' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-medium tracking-wide">Ringing...</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                  <span className="font-medium tracking-wide">Calling...</span>
                </>
              )}
            </div>
          )}

          {isConnected && (
            <div className="flex flex-col items-center gap-3 w-full">
              <span className="text-2xl font-black font-mono tracking-wider text-sky-500">
                {formatDuration(callDuration)}
              </span>

              {/* Real-time Dynamic Audio Wave Visualizer */}
              <div className="w-full flex justify-center py-1">
                <AudioVisualizerWave
                  stream={localAudioStream}
                  isSpeaking={isOtherSpeaking || isMeSpeaking}
                  isMuted={isMuted}
                  barCount={22}
                  size="md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        {isIncoming ? (
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={rejectCall}
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
              onClick={acceptCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all animate-bounce">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-500 group-hover:text-emerald-400">
                Answer
              </span>
            </button>
          </div>
        ) : isCalling ? (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={endCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-rose-500">
                Cancel
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {/* Mic Mute Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                    : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </div>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {isMuted ? 'Muted' : 'Mute'}
              </span>
            </button>

            {/* End Call */}
            <button
              type="button"
              onClick={endCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-rose-500">
                End
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
