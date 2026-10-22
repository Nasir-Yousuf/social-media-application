import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();

  // Call States: 'idle' | 'calling' | 'incoming' | 'connected' | 'group'
  const [callState, setCallState] = useState('idle');
  const [activeCall, setActiveCall] = useState(null);
  const [groupCall, setGroupCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const durationTimerRef = useRef(null);
  const ringVibrationTimerRef = useRef(null);

  // Start duration timer
  const startTimer = useCallback(() => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  // Stop duration timer
  const stopTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  // Start vibration for incoming call
  const startRingingVibration = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 800, 1000], true);
      } catch {}
    }
  }, []);

  // Stop vibration
  const stopRingingVibration = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.cancel();
      } catch {}
    }
  }, []);

  // Format call duration helper
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Socket Event Listeners
  useEffect(() => {
    if (!currentUser) return;

    // Connect socket on mount
    socketService.connect();

    // 1. Incoming Call Event
    const unsubIncoming = socketService.on('call:incoming', ({ callId, caller, callType }) => {
      if (callState !== 'idle') {
        // Already on another call: auto-busy reject
        socketService.rejectCall({ callId, targetUserId: caller._id, reason: 'busy' });
        return;
      }

      setActiveCall({
        callId,
        otherUser: caller,
        isOutgoing: false,
        callType: callType || 'audio',
      });
      setCallState('incoming');
      startRingingVibration();
    });

    // 2. Outgoing Call Ringing Event
    const unsubRinging = socketService.on('call:ringing', ({ callId }) => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'ringing' } : prev));
    });

    // 3. Call Accepted Event
    const unsubAccepted = socketService.on('call:accepted', ({ callId, responder }) => {
      stopRingingVibration();
      setCallState('connected');
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : prev));
      startTimer();
      showToast('Call connected', 'success');
    });

    // 4. Call Rejected Event
    const unsubRejected = socketService.on('call:rejected', ({ callId, reason }) => {
      stopRingingVibration();
      stopTimer();
      setCallState('idle');
      setActiveCall(null);
      showToast(reason === 'busy' ? 'User is busy on another call' : 'Call declined', 'info');
    });

    // 5. Call Ended Event
    const unsubEnded = socketService.on('call:ended', (data) => {
      stopRingingVibration();
      stopTimer();
      setCallState('idle');
      setActiveCall(null);
      const reasonMsg =
        data?.reason === 'no_answer'
          ? 'No answer'
          : data?.reason === 'disconnected'
          ? 'Call disconnected'
          : 'Call ended';
      showToast(reasonMsg, 'info');
    });

    // 6. User Offline Event (Fallback)
    const unsubOffline = socketService.on('call:user_offline', () => {
      stopRingingVibration();
      stopTimer();
      setCallState('idle');
      setActiveCall(null);
      showToast('User is currently offline', 'info');
    });

    // 7. Group Call Events
    const unsubGroupParticipants = socketService.on(
      'group-call:existing_participants',
      ({ roomId, participants }) => {
        setGroupCall((prev) =>
          prev ? { ...prev, participants: participants || [] } : prev
        );
      }
    );

    const unsubGroupJoined = socketService.on('group-call:user_joined', ({ participant }) => {
      setGroupCall((prev) => {
        if (!prev) return prev;
        const exists = prev.participants.some((p) => p.user._id === participant.user._id);
        if (exists) return prev;
        return { ...prev, participants: [...prev.participants, participant] };
      });
      showToast(`${participant.user?.name || 'Someone'} joined group call`, 'info');
    });

    const unsubGroupLeft = socketService.on('group-call:user_left', ({ userId }) => {
      setGroupCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.filter((p) => p.user._id !== userId),
        };
      });
    });

    const unsubGroupMute = socketService.on(
      'group-call:user_mute_state',
      ({ userId, isMuted: mutedState }) => {
        setGroupCall((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: prev.participants.map((p) =>
              p.user._id === userId ? { ...p, isMuted: mutedState } : p
            ),
          };
        });
      }
    );

    return () => {
      unsubIncoming();
      unsubRinging();
      unsubAccepted();
      unsubRejected();
      unsubEnded();
      unsubOffline();
      unsubGroupParticipants();
      unsubGroupJoined();
      unsubGroupLeft();
      unsubGroupMute();
      stopTimer();
      stopRingingVibration();
    };
  }, [currentUser, callState, startTimer, stopTimer, startRingingVibration, stopRingingVibration, showToast]);

  // Actions: Initiate 1-on-1 Audio Call
  const startAudioCall = useCallback(
    (targetUser) => {
      if (!targetUser?._id) return;
      if (!currentUser) {
        showToast('Please sign in to make calls', 'error');
        return;
      }

      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setActiveCall({
        callId,
        otherUser: targetUser,
        isOutgoing: true,
        callType: 'audio',
        status: 'calling',
      });
      setCallState('calling');
      setIsMuted(false);
      setIsSpeaker(false);

      socketService.initiateCall({
        callId,
        targetUserId: targetUser._id,
        callerInfo: {
          _id: currentUser._id,
          name: currentUser.name,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
        },
        callType: 'audio',
      });
    },
    [currentUser, showToast]
  );

  // Accept Incoming Call
  const acceptIncomingCall = useCallback(() => {
    if (!activeCall) return;
    stopRingingVibration();
    setCallState('connected');
    startTimer();

    socketService.acceptCall({
      callId: activeCall.callId,
      targetUserId: activeCall.otherUser._id,
    });
  }, [activeCall, stopRingingVibration, startTimer]);

  // Decline Incoming Call
  const declineIncomingCall = useCallback(() => {
    if (!activeCall) return;
    stopRingingVibration();
    socketService.rejectCall({
      callId: activeCall.callId,
      targetUserId: activeCall.otherUser._id,
      reason: 'declined',
    });
    setCallState('idle');
    setActiveCall(null);
  }, [activeCall, stopRingingVibration]);

  // End Active Call
  const endCall = useCallback(() => {
    stopRingingVibration();
    stopTimer();
    if (activeCall) {
      socketService.endCall({
        callId: activeCall.callId,
        targetUserId: activeCall.otherUser?._id,
      });
    }
    setCallState('idle');
    setActiveCall(null);
    setCallDuration(0);
  }, [activeCall, stopRingingVibration, stopTimer]);

  // Start Group Audio Call
  const startGroupAudioCall = useCallback(
    (roomId, roomName = 'Dev Group Call') => {
      if (!currentUser) return;
      const finalRoomId = roomId || `room_${Date.now()}`;
      setGroupCall({
        roomId: finalRoomId,
        roomName,
        participants: [
          {
            user: {
              _id: currentUser._id,
              name: currentUser.name,
              username: currentUser.username,
              avatarUrl: currentUser.avatarUrl,
            },
            isMuted: false,
          },
        ],
      });
      setCallState('group');
      startTimer();

      socketService.joinGroupCall({
        roomId: finalRoomId,
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
        },
      });
    },
    [currentUser, startTimer]
  );

  // Leave Group Audio Call
  const leaveGroupCall = useCallback(() => {
    stopTimer();
    if (groupCall) {
      socketService.leaveGroupCall({ roomId: groupCall.roomId });
    }
    setCallState('idle');
    setGroupCall(null);
    setCallDuration(0);
  }, [groupCall, stopTimer]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (callState === 'group' && groupCall) {
        socketService.toggleGroupCallMute({ roomId: groupCall.roomId, isMuted: next });
      }
      return next;
    });
  }, [callState, groupCall]);

  // Toggle Speaker
  const toggleSpeaker = useCallback(() => {
    setIsSpeaker((prev) => !prev);
  }, []);

  return (
    <CallContext.Provider
      value={{
        callState,
        activeCall,
        groupCall,
        isMuted,
        isSpeaker,
        callDuration,
        formatDuration,
        startAudioCall,
        startGroupAudioCall,
        acceptIncomingCall,
        declineIncomingCall,
        endCall,
        leaveGroupCall,
        toggleMute,
        toggleSpeaker,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export default CallContext;
