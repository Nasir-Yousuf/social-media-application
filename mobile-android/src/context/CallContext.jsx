import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import socketService from '../services/socket';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import ClearFeedTelecom, { TelecomEventEmitter } from '../modules/clearfeed-telecom';
import {
  fetchIceServers,
  getLocalAudioStream,
  createPeerConnection,
  restartIce,
  setupNetworkHandoffListener,
  RTCSessionDescription,
  RTCIceCandidate,
} from '../services/webrtc';

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
  const [audioRoute, setAudioRouteState] = useState('EARPIECE');
  const [availableAudioRoutes, setAvailableAudioRoutes] = useState(['EARPIECE', 'SPEAKER']);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [localAudioStream, setLocalAudioStream] = useState(null);
  const [remoteAudioStream, setRemoteAudioStream] = useState(null);

  const minimizeCall = useCallback(() => setIsMinimized(true), []);
  const maximizeCall = useCallback(() => setIsMinimized(false), []);

  // WebRTC & System References
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const isRemoteDescriptionSetRef = useRef(false);
  const iceRestartAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);
  const durationTimerRef = useRef(null);
  const ringVibrationTimerRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const callStateRef = useRef(callState);
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Heartbeat Watchdog helper (5s interval during connected call)
  const startHeartbeat = useCallback((cId) => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = setInterval(() => {
      socketService.emit('call:heartbeat', { callId: cId });
    }, 5000);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

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

  // Clean up local call resources (hardware, peer connection, audio mode, foreground service)
  const cleanupCallResources = useCallback(() => {
    stopHeartbeat();
    stopTimer();
    stopRingingVibration();
    isRemoteDescriptionSetRef.current = false;
    pendingCandidatesRef.current = [];
    iceRestartAttemptsRef.current = 0;

    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch {}
      localStreamRef.current = null;
      setLocalAudioStream(null);
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }

    setRemoteAudioStream(null);

    // Stop Telecom Audio, Proximity, & Android Foreground Service
    ClearFeedTelecom.stopCallAudio().catch(() => {});
    ClearFeedTelecom.stopCallForegroundService().catch(() => {});
    ClearFeedTelecom.dismissIncomingCallNotification().catch(() => {});

    setCallState('idle');
    setActiveCall(null);
    setIsMuted(false);
    setIsSpeaker(false);
    setAudioRouteState('EARPIECE');
    setCallDuration(0);
    setIsMinimized(false);
  }, [stopTimer, stopHeartbeat, stopRingingVibration]);

  const cleanupCallResourcesRef = useRef(cleanupCallResources);
  useEffect(() => {
    cleanupCallResourcesRef.current = cleanupCallResources;
  });

  // Teardown resources on CallProvider unmount ONLY
  useEffect(() => {
    return () => {
      cleanupCallResourcesRef.current?.();
    };
  }, []);

  // Telecom event listeners (audio focus, route changes, notification action clicks)
  useEffect(() => {
    const routeSub = TelecomEventEmitter.addListener('onAudioRouteChanged', ({ route }) => {
      setAudioRouteState(route);
      setIsSpeaker(route === 'SPEAKER');
    });

    const focusSub = TelecomEventEmitter.addListener('onAudioFocusChanged', ({ isFocused }) => {
      if (!isFocused) {
        // GSM Cellular call interruption: Mute audio track and hold
        if (localStreamRef.current) {
          const track = localStreamRef.current.getAudioTracks()[0];
          if (track) track.enabled = false;
        }
        showToast('Call on hold (Cellular phone call active)', 'info');
      } else {
        // GSM Cellular call finished: Restore audio track
        if (localStreamRef.current && !isMuted) {
          const track = localStreamRef.current.getAudioTracks()[0];
          if (track) track.enabled = true;
        }
        showToast('Call resumed', 'info');
      }
    });

    const notifSub = TelecomEventEmitter.addListener('onCallNotificationAction', ({ action }) => {
      if (action === 'hangup') {
        endCall();
      } else if (action === 'mute_toggle') {
        toggleMute();
      } else if (action === 'accept_call') {
        acceptIncomingCall();
      } else if (action === 'decline_call') {
        declineIncomingCall();
      }
    });

    // Refresh available audio routes
    ClearFeedTelecom.getAvailableAudioRoutes()
      .then((routes) => {
        if (Array.isArray(routes) && routes.length > 0) {
          setAvailableAudioRoutes(routes);
        }
      })
      .catch(() => {});

    return () => {
      routeSub?.remove();
      focusSub?.remove();
      notifSub?.remove();
    };
  }, [isMuted]);

  // Network Handoff Listener (Wi-Fi <-> Cellular automatic ICE restart)
  useEffect(() => {
    const unsubNetHandoff = setupNetworkHandoffListener(async () => {
      if (callState === 'connected' && peerConnectionRef.current && activeCallRef.current) {
        console.log('🔄 Triggering automatic WebRTC ICE restart on network handoff...');
        try {
          const offer = await restartIce(peerConnectionRef.current);
          if (offer) {
            const targetPeerId =
              activeCallRef.current.otherUser?._id || activeCallRef.current.otherUser?.id;
            socketService.sendSignal({
              callId: activeCallRef.current.callId,
              targetUserId: targetPeerId,
              fromUserId: currentUser?._id,
              signal: { type: 'offer', sdp: offer },
            });
            showToast('Network switched, audio reconnected', 'info');
          }
        } catch (err) {
          console.warn('Network handoff ICE restart warning:', err);
        }
      }
    });

    return () => {
      unsubNetHandoff();
    };
  }, [callState, currentUser, showToast]);

  // Socket Event Listeners for Call Lifecycle
  useEffect(() => {
    if (!currentUser) return;

    socketService.connect();

    // 1. Incoming Call Event
    const unsubIncoming = socketService.on('call:incoming', ({ callId, caller, callType }) => {
      if (callStateRef.current !== 'idle') {
        // Auto-busy reject if already engaged
        const callerId = caller?._id || caller?.id;
        if (callerId) {
          socketService.rejectCall({ callId, targetUserId: callerId, reason: 'busy' });
        }
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

      // Show high-priority heads-up notification with Accept & Decline buttons
      ClearFeedTelecom.showIncomingCallNotification(
        callId,
        caller.name || caller.username || 'Classmate',
        caller.avatarUrl
      ).catch(() => {});
    });

    // 2. Outgoing Call Ringing Event
    const unsubRinging = socketService.on('call:ringing', ({ callId }) => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'ringing' } : prev));
    });

    // 3. Call Accepted Event
    const unsubAccepted = socketService.on('call:accepted', async ({ callId, responder }) => {
      stopRingingVibration();
      ClearFeedTelecom.dismissIncomingCallNotification().catch(() => {});

      setCallState('connected');
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : prev));
      startTimer();
      startHeartbeat(callId);

      // Start Android Foreground Service for background survival
      const peerName = responder?.name || activeCallRef.current?.otherUser?.name || 'Classmate';
      ClearFeedTelecom.startCallForegroundService(peerName).catch(() => {});
      ClearFeedTelecom.startCallAudio().catch(() => {});

      // ONLY the caller initiates the WebRTC offer upon callee acceptance!
      // Callee answers the offer in unsubSignal. This avoids WebRTC glare/collision.
      if (!activeCallRef.current?.isOutgoing) {
        return;
      }

      const targetPeerId =
        responder?._id ||
        responder?.id ||
        activeCallRef.current?.otherUser?._id ||
        activeCallRef.current?.otherUser?.id;

      try {
        let stream = localStreamRef.current;
        if (!stream) {
          stream = await getLocalAudioStream();
          localStreamRef.current = stream;
          setLocalAudioStream(stream);
        }

        if (peerConnectionRef.current) {
          try {
            peerConnectionRef.current.close();
          } catch {}
          peerConnectionRef.current = null;
        }

        const iceConfig = await fetchIceServers(api);

        const pc = createPeerConnection({
          iceServers: iceConfig.iceServers,
          onIceCandidate: (candidate) => {
            if (candidate) {
              socketService.sendSignal({
                callId,
                targetUserId: targetPeerId,
                fromUserId: currentUser?._id,
                signal: { type: 'candidate', candidate },
              });
            }
          },
          onTrack: (remoteStream) => {
            setRemoteAudioStream(remoteStream);
          },
          onConnectionStateChange: async (iceState) => {
            if (iceState === 'disconnected' || iceState === 'failed') {
              if (iceRestartAttemptsRef.current < 3) {
                iceRestartAttemptsRef.current += 1;
                console.warn(`🧊 ICE ${iceState}, auto ICE restart (${iceRestartAttemptsRef.current}/3)...`);
                try {
                  const offer = await restartIce(peerConnectionRef.current);
                  if (offer && activeCallRef.current) {
                    socketService.sendSignal({
                      callId,
                      targetUserId: targetPeerId,
                      fromUserId: currentUser?._id,
                      signal: { type: 'offer', sdp: offer },
                    });
                  }
                } catch (e) {
                  console.warn('ICE restart error:', e);
                }
              } else {
                showToast('Audio connection lost', 'error');
                cleanupCallResources();
              }
            } else if (iceState === 'connected' || iceState === 'completed') {
              iceRestartAttemptsRef.current = 0;
            }
          },
        });

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        peerConnectionRef.current = pc;

        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        await pc.setLocalDescription(offer);

        socketService.sendSignal({
          callId,
          targetUserId: targetPeerId,
          fromUserId: currentUser?._id,
          signal: { type: 'offer', sdp: offer },
        });

        showToast('Call connected', 'success');
      } catch (err) {
        console.warn('WebRTC caller setup error:', err);
      }
    });

    // 4. WebRTC Signaling Relay
    const unsubSignal = socketService.on('call:signal', async ({ callId, fromUserId, signal }) => {
      try {
        if (!signal) return;
        const otherUserId =
          fromUserId ||
          activeCallRef.current?.otherUser?._id ||
          activeCallRef.current?.otherUser?.id;

        const ensurePeerConnection = async () => {
          if (peerConnectionRef.current) return peerConnectionRef.current;

          let stream = localStreamRef.current;
          if (!stream) {
            stream = await getLocalAudioStream();
            localStreamRef.current = stream;
            setLocalAudioStream(stream);
          }

          const iceConfig = await fetchIceServers(api);

          const pc = createPeerConnection({
            iceServers: iceConfig.iceServers,
            onIceCandidate: (candidate) => {
              if (candidate) {
                socketService.sendSignal({
                  callId,
                  targetUserId: otherUserId,
                  fromUserId: currentUser?._id,
                  signal: { type: 'candidate', candidate },
                });
              }
            },
            onTrack: (remoteStream) => {
              setRemoteAudioStream(remoteStream);
            },
            onConnectionStateChange: async (iceState) => {
              if (iceState === 'disconnected' || iceState === 'failed') {
                if (iceRestartAttemptsRef.current < 3) {
                  iceRestartAttemptsRef.current += 1;
                  try {
                    const offer = await restartIce(peerConnectionRef.current);
                    if (offer && activeCallRef.current) {
                      socketService.sendSignal({
                        callId,
                        targetUserId: otherUserId,
                        fromUserId: currentUser?._id,
                        signal: { type: 'offer', sdp: offer },
                      });
                    }
                  } catch (e) {
                    console.warn('ICE restart error:', e);
                  }
                } else {
                  showToast('Audio connection lost', 'error');
                  cleanupCallResources();
                }
              } else if (iceState === 'connected' || iceState === 'completed') {
                iceRestartAttemptsRef.current = 0;
              }
            },
          });

          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          peerConnectionRef.current = pc;
          return pc;
        };

        if (signal.type === 'offer') {
          const pc = await ensurePeerConnection();
          if (RTCSessionDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else {
            await pc.setRemoteDescription(signal.sdp);
          }
          isRemoteDescriptionSetRef.current = true;

          // Flush any buffered ICE candidates sequentially
          if (pendingCandidatesRef.current.length > 0) {
            const queued = [...pendingCandidatesRef.current];
            pendingCandidatesRef.current = [];
            for (const cand of queued) {
              try {
                if (RTCIceCandidate) {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } else {
                  await pc.addIceCandidate(cand);
                }
              } catch (e) {
                console.warn('Candidate flush warning:', e);
              }
            }
          }

          const answer = await pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
          await pc.setLocalDescription(answer);

          socketService.sendSignal({
            callId,
            targetUserId: otherUserId,
            fromUserId: currentUser?._id,
            signal: { type: 'answer', sdp: answer },
          });
        } else if (signal.type === 'answer') {
          if (peerConnectionRef.current) {
            const pc = peerConnectionRef.current;
            if (RTCSessionDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            } else {
              await pc.setRemoteDescription(signal.sdp);
            }
            isRemoteDescriptionSetRef.current = true;

            // Flush buffered candidates
            if (pendingCandidatesRef.current.length > 0) {
              const queued = [...pendingCandidatesRef.current];
              pendingCandidatesRef.current = [];
              for (const cand of queued) {
                try {
                  if (RTCIceCandidate) {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                  } else {
                    await pc.addIceCandidate(cand);
                  }
                } catch (e) {
                  console.warn('Candidate flush warning:', e);
                }
              }
            }
          }
        } else if (signal.type === 'candidate' && signal.candidate) {
          const pc = peerConnectionRef.current;
          if (isRemoteDescriptionSetRef.current && pc && pc.remoteDescription) {
            if (RTCIceCandidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
            } else {
              await pc.addIceCandidate(signal.candidate).catch(() => {});
            }
          } else {
            pendingCandidatesRef.current.push(signal.candidate);
          }
        }
      } catch (err) {
        console.warn('Signal handling error:', err);
      }
    });

    // 5. Multi-Device Coordination: answered on another device
    const unsubAnsweredElsewhere = socketService.on('call:answered_elsewhere', ({ callId }) => {
      console.log('📱 Call answered on another device:', callId);
      cleanupCallResources();
    });

    // 6. Busy / Glare Handling
    const unsubBusy = socketService.on('call:busy', ({ reason }) => {
      if (reason === 'glare_superseded') {
        showToast('Connecting incoming call...', 'info');
      } else {
        showToast('User is busy on another call', 'info');
        cleanupCallResources();
      }
    });

    // 7. Call Cancelled by Caller
    const unsubCancelled = socketService.on('call:cancelled', () => {
      showToast('Call cancelled by caller', 'info');
      cleanupCallResources();
    });

    // 8. Call Rejected Event
    const unsubRejected = socketService.on('call:rejected', ({ callId, reason }) => {
      showToast(reason === 'busy' ? 'User is busy on another call' : 'Call declined', 'info');
      cleanupCallResources();
    });

    // 9. Call Ended Event
    const unsubEnded = socketService.on('call:ended', (data) => {
      const reasonMsg =
        data?.reason === 'no_answer'
          ? 'No answer'
          : data?.reason === 'disconnected'
          ? 'Call disconnected'
          : data?.reason === 'timeout'
          ? 'Call timed out'
          : 'Call ended';
      showToast(reasonMsg, 'info');
      cleanupCallResources();
    });

    // 10. Call Missed
    const unsubMissed = socketService.on('call:missed', () => {
      showToast('Missed call', 'info');
      cleanupCallResources();
    });

    // 11. User Offline Fallback
    const unsubOffline = socketService.on('call:user_offline', () => {
      showToast('User is currently offline', 'info');
      cleanupCallResources();
    });

    // 12. Group Call Events
    const unsubGroupParticipants = socketService.on('group-call:existing_participants', ({ roomId, participants }) => {
      setGroupCall((prev) => (prev ? { ...prev, participants: participants || [] } : prev));
    });

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

    const unsubGroupMute = socketService.on('group-call:user_mute_state', ({ userId, isMuted: mutedState }) => {
      setGroupCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user._id === userId ? { ...p, isMuted: mutedState } : p
          ),
        };
      });
    });

    return () => {
      unsubIncoming();
      unsubRinging();
      unsubAccepted();
      unsubSignal();
      unsubAnsweredElsewhere();
      unsubBusy();
      unsubCancelled();
      unsubRejected();
      unsubEnded();
      unsubMissed();
      unsubOffline();
      unsubGroupParticipants();
      unsubGroupJoined();
      unsubGroupLeft();
      unsubGroupMute();
    };
  }, [currentUser, cleanupCallResources, showToast]);

  // Actions: Initiate 1-on-1 Audio Call
  const startAudioCall = useCallback(
    (targetUser) => {
      const targetId = targetUser?._id || targetUser?.id;
      if (!targetId) {
        showToast('Unable to start call: Invalid user', 'error');
        return;
      }
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
      setAudioRouteState('EARPIECE');

      socketService.initiateCall({
        callId,
        targetUserId: targetId,
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
  const acceptIncomingCall = useCallback(async () => {
    if (!activeCall) return;
    stopRingingVibration();
    ClearFeedTelecom.dismissIncomingCallNotification().catch(() => {});

    setCallState('connected');
    startTimer();
    startHeartbeat(activeCall.callId);

    // Start Foreground Service & Audio
    const peerName = activeCall.otherUser?.name || 'Classmate';
    ClearFeedTelecom.startCallForegroundService(peerName).catch(() => {});
    ClearFeedTelecom.startCallAudio().catch(() => {});

    try {
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await getLocalAudioStream();
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      }

      const targetId = activeCall.otherUser?._id || activeCall.otherUser?.id;
      if (targetId) {
        socketService.acceptCall({
          callId: activeCall.callId,
          targetUserId: targetId,
        });
      }
    } catch (err) {
      console.warn('Microphone acquisition error on accept:', err);
    }
  }, [activeCall, stopRingingVibration, startTimer, startHeartbeat]);

  // Decline Incoming Call
  const declineIncomingCall = useCallback(() => {
    if (!activeCall) return;
    stopRingingVibration();
    ClearFeedTelecom.dismissIncomingCallNotification().catch(() => {});

    const targetId = activeCall.otherUser?._id || activeCall.otherUser?.id;
    if (targetId) {
      socketService.rejectCall({
        callId: activeCall.callId,
        targetUserId: targetId,
        reason: 'declined',
      });
    }
    cleanupCallResources();
  }, [activeCall, stopRingingVibration, cleanupCallResources]);

  // End / Cancel Active Call
  const endCall = useCallback(() => {
    if (!activeCall) return;
    const targetId = activeCall.otherUser?._id || activeCall.otherUser?.id;

    if (targetId) {
      if (callState === 'calling') {
        socketService.cancelCall({
          callId: activeCall.callId,
          targetUserId: targetId,
          reason: 'cancelled',
        });
      } else {
        socketService.endCall({
          callId: activeCall.callId,
          targetUserId: targetId,
        });
      }
    }

    cleanupCallResources();
  }, [activeCall, callState, cleanupCallResources]);

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

      ClearFeedTelecom.startCallAudio().catch(() => {});
      ClearFeedTelecom.setSpeakerphoneOn(true).catch(() => {});
      ClearFeedTelecom.startCallForegroundService('Clearfeed Live Space', roomName).catch(() => {});

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
    ClearFeedTelecom.stopCallForegroundService().catch(() => {});
    ClearFeedTelecom.stopCallAudio().catch(() => {});
    setCallState('idle');
    setGroupCall(null);
    setCallDuration(0);
  }, [groupCall, stopTimer]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMute = !prev;
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !nextMute;
        }
      }
      if (callState === 'group' && groupCall) {
        socketService.toggleGroupCallMute({ roomId: groupCall.roomId, isMuted: nextMute });
      }
      return nextMute;
    });
  }, [callState, groupCall]);

  // Toggle Speakerphone
  const toggleSpeaker = useCallback(() => {
    setIsSpeaker((prev) => {
      const nextSpeaker = !prev;
      ClearFeedTelecom.setSpeakerphoneOn(nextSpeaker).catch(() => {});
      return nextSpeaker;
    });
  }, []);

  // Select Specific Audio Route
  const setAudioRoute = useCallback((route) => {
    ClearFeedTelecom.setAudioRoute(route).catch(() => {});
  }, []);

  return (
    <CallContext.Provider
      value={{
        callState,
        activeCall,
        groupCall,
        isMuted,
        isSpeaker,
        audioRoute,
        availableAudioRoutes,
        callDuration,
        formatDuration,
        isMinimized,
        localAudioStream,
        remoteAudioStream,
        setIsMinimized,
        minimizeCall,
        maximizeCall,
        startAudioCall,
        startGroupAudioCall,
        acceptIncomingCall,
        declineIncomingCall,
        endCall,
        leaveGroupCall,
        toggleMute,
        toggleSpeaker,
        setAudioRoute,
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
