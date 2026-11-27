import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import socketService from '../services/socket';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import ClearFeedTelecom, { TelecomEventEmitter } from '../modules/clearfeed-telecom';
import GroupCallMeshManager from '../services/groupCallMesh';
import { createSpacesMediaAdapter } from '../services/spacesMediaAdapter';
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
  const [callConnectionState, setCallConnectionState] = useState('idle');
  const [iceCandidateType, setIceCandidateType] = useState('');

  // Spaces Live States
  const [spacesList, setSpacesList] = useState([]);
  const [activeSpace, setActiveSpace] = useState(null);
  const [isSpaceMuted, setIsSpaceMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());

  const minimizeCall = useCallback(() => setIsMinimized(true), []);
  const maximizeCall = useCallback(() => setIsMinimized(false), []);

  // WebRTC & System References
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const pendingCandidatesByCallRef = useRef(new Map());
  const isRemoteDescriptionSetRef = useRef(false);
  const makingOfferRef = useRef(false);
  const iceRestartAttemptsRef = useRef(0);
  const disconnectGraceTimerRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const durationTimerRef = useRef(null);
  const ringVibrationTimerRef = useRef(null);
  const groupMeshRef = useRef(new GroupCallMeshManager());
  const groupCallRef = useRef(null);
  const spacesAdapterRef = useRef(null);
  const activeSpaceRef = useRef(null);
  const isSpaceMutedRef = useRef(true);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const callStateRef = useRef(callState);
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    groupCallRef.current = groupCall;
  }, [groupCall]);

  useEffect(() => {
    activeSpaceRef.current = activeSpace;
  }, [activeSpace]);

  useEffect(() => {
    isSpaceMutedRef.current = isSpaceMuted;
  }, [isSpaceMuted]);

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
    if (disconnectGraceTimerRef.current) {
      clearTimeout(disconnectGraceTimerRef.current);
      disconnectGraceTimerRef.current = null;
    }
    isRemoteDescriptionSetRef.current = false;
    makingOfferRef.current = false;
    pendingCandidatesRef.current = [];
    pendingCandidatesByCallRef.current.clear();
    iceRestartAttemptsRef.current = 0;

    if (localStreamRef.current && callStateRef.current !== 'group' && !activeSpaceRef.current) {
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

    if (callStateRef.current !== 'group' && !activeSpaceRef.current) {
      ClearFeedTelecom.stopCallAudio().catch(() => {});
      ClearFeedTelecom.stopCallForegroundService().catch(() => {});
    }
    ClearFeedTelecom.dismissIncomingCallNotification().catch(() => {});

    setCallState('idle');
    setActiveCall(null);
    setCallConnectionState('idle');
    setIceCandidateType('');
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
      groupMeshRef.current?.disconnect();
      spacesAdapterRef.current?.disconnect();
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

  const refreshSpaces = useCallback(async () => {
    try {
      const res = await api.get('/spaces');
      setSpacesList(res?.data?.spaces || (Array.isArray(res?.data) ? res.data : []));
    } catch {}
  }, []);

  // Socket Event Listeners for Call Lifecycle
  useEffect(() => {
    if (!currentUser) return;

    socketService.connect();
    refreshSpaces();

    const flushPendingCandidates = async (targetCallId, pc) => {
      const byCall = pendingCandidatesByCallRef.current.get(targetCallId) || [];
      const legacy = pendingCandidatesRef.current || [];
      if (byCall.length === 0 && legacy.length === 0) return;

      pendingCandidatesByCallRef.current.delete(targetCallId);
      pendingCandidatesRef.current = [];

      for (const cand of [...byCall, ...legacy]) {
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
    };

    const detectSelectedCandidateType = async (pc) => {
      try {
        if (!pc || typeof pc.getStats !== 'function') return;
        const stats = await pc.getStats();
        let selectedPair = null;
        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && (report.nominated || report.selected || report.state === 'succeeded')) {
            if (!selectedPair || report.selected || report.nominated) {
              selectedPair = report;
            }
          }
        });
        if (selectedPair) {
          const remoteCand = stats.get(selectedPair.remoteCandidateId);
          const localCand = stats.get(selectedPair.localCandidateId);
          const cType = remoteCand?.candidateType || localCand?.candidateType || '';
          if (cType) setIceCandidateType(cType);
        }
      } catch {}
    };

    const createActivePeerConnection = async (callId, targetPeerId, stream) => {
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch {}
        peerConnectionRef.current = null;
      }

      isRemoteDescriptionSetRef.current = false;
      makingOfferRef.current = false;
      setCallConnectionState('connecting');
      setIceCandidateType('');

      const iceConfig = await fetchIceServers(api);

      const pc = createPeerConnection({
        iceServers: iceConfig,
        onIceCandidate: (candidate) => {
          if (candidate && targetPeerId) {
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
        onConnectionStateChange: async (connState) => {
          setCallConnectionState(connState);

          if (connState === 'connected' || connState === 'completed') {
            iceRestartAttemptsRef.current = 0;
            if (disconnectGraceTimerRef.current) {
              clearTimeout(disconnectGraceTimerRef.current);
              disconnectGraceTimerRef.current = null;
            }
            detectSelectedCandidateType(pc);
            return;
          }

          const triggerRestart = async () => {
            if (!peerConnectionRef.current || peerConnectionRef.current !== pc) return;
            if (iceRestartAttemptsRef.current < 3) {
              iceRestartAttemptsRef.current += 1;
              try {
                makingOfferRef.current = true;
                const offer = await restartIce(pc);
                if (offer && activeCallRef.current?.callId === callId && targetPeerId) {
                  socketService.sendSignal({
                    callId,
                    targetUserId: targetPeerId,
                    fromUserId: currentUser?._id,
                    signal: { type: 'offer', sdp: offer },
                  });
                }
              } catch (e) {
                console.warn('ICE restart error:', e);
              } finally {
                makingOfferRef.current = false;
              }
            } else if (activeCallRef.current?.callId === callId) {
              showToast('Audio connection lost', 'error');
              cleanupCallResources();
            }
          };

          if (connState === 'disconnected') {
            if (disconnectGraceTimerRef.current) {
              clearTimeout(disconnectGraceTimerRef.current);
            }
            disconnectGraceTimerRef.current = setTimeout(() => {
              disconnectGraceTimerRef.current = null;
              if (pc.iceConnectionState === 'disconnected' || pc.connectionState === 'disconnected') {
                triggerRestart();
              }
            }, 2500);
          } else if (connState === 'failed') {
            if (disconnectGraceTimerRef.current) {
              clearTimeout(disconnectGraceTimerRef.current);
              disconnectGraceTimerRef.current = null;
            }
            await triggerRestart();
          }
        },
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      peerConnectionRef.current = pc;
      return pc;
    };

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

      ClearFeedTelecom.showIncomingCallNotification(
        callId,
        caller.name || caller.username || 'Classmate',
        caller.avatarUrl
      ).catch(() => {});
    });

    const unsubInitiated = socketService.on('call:initiated', ({ callId, status }) => {
      setActiveCall((prev) =>
        prev && prev.callId === callId ? { ...prev, status: status || prev.status } : prev
      );
    });

    // 2. Outgoing Call Ringing Event
    const unsubRinging = socketService.on('call:ringing', () => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'ringing' } : prev));
    });

    // 3. Call Accepted Event
    const unsubAccepted = socketService.on('call:accepted', async ({ callId, responder }) => {
      if (activeCallRef.current?.callId && callId && activeCallRef.current.callId !== callId) {
        return;
      }
      stopRingingVibration();
      ClearFeedTelecom.dismissIncomingCallNotification().catch(() => {});

      setCallState('connected');
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : prev));
      startTimer();
      startHeartbeat(callId);

      const peerName = responder?.name || activeCallRef.current?.otherUser?.name || 'Classmate';
      ClearFeedTelecom.startCallForegroundService(peerName).catch(() => {});
      ClearFeedTelecom.startCallAudio().catch(() => {});

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
        const hasLive = stream && stream.getAudioTracks().some((t) => t.readyState === 'live');
        if (!hasLive) {
          stream = await getLocalAudioStream();
          localStreamRef.current = stream;
          setLocalAudioStream(stream);
        }

        const pc = await createActivePeerConnection(callId, targetPeerId, stream);
        makingOfferRef.current = true;
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
        await pc.setLocalDescription(offer);

        socketService.sendSignal({
          callId,
          targetUserId: targetPeerId,
          fromUserId: currentUser?._id,
          signal: { type: 'offer', sdp: pc.localDescription || offer },
        });

        showToast('Call connected', 'success');
      } catch (err) {
        console.warn('WebRTC caller setup error:', err);
      } finally {
        makingOfferRef.current = false;
      }
    });

    // 4. WebRTC Signaling Relay
    const unsubSignal = socketService.on('call:signal', async ({ callId, fromUserId, signal }) => {
      try {
        if (!signal) return;
        if (activeCallRef.current?.callId && callId && activeCallRef.current.callId !== callId) {
          return;
        }
        const otherUserId =
          fromUserId ||
          activeCallRef.current?.otherUser?._id ||
          activeCallRef.current?.otherUser?.id;

        const ensurePeerConnection = async () => {
          if (peerConnectionRef.current) return peerConnectionRef.current;

          let stream = localStreamRef.current;
          const hasLive = stream && stream.getAudioTracks().some((t) => t.readyState === 'live');
          if (!hasLive) {
            stream = await getLocalAudioStream();
            localStreamRef.current = stream;
            setLocalAudioStream(stream);
          }

          return createActivePeerConnection(callId, otherUserId, stream);
        };

        if (signal.type === 'offer') {
          const pc = await ensurePeerConnection();
          const myIdStr = (currentUser?._id || currentUser?.id || '').toString();
          const peerIdStr = (otherUserId || '').toString();
          const polite = myIdStr > peerIdStr;
          const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';

          if (offerCollision) {
            if (!polite) {
              return;
            }
            await pc.setLocalDescription({ type: 'rollback' }).catch(() => {});
          }

          if (RTCSessionDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else {
            await pc.setRemoteDescription(signal.sdp);
          }
          isRemoteDescriptionSetRef.current = true;
          await flushPendingCandidates(callId, pc);

          const answer = await pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
          await pc.setLocalDescription(answer);

          socketService.sendSignal({
            callId,
            targetUserId: otherUserId,
            fromUserId: currentUser?._id,
            signal: { type: 'answer', sdp: pc.localDescription || answer },
          });
        } else if (signal.type === 'answer') {
          const pc = peerConnectionRef.current;
          if (pc && pc.signalingState === 'have-local-offer') {
            if (RTCSessionDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            } else {
              await pc.setRemoteDescription(signal.sdp);
            }
            isRemoteDescriptionSetRef.current = true;
            await flushPendingCandidates(callId, pc);
          }
        } else if (signal.type === 'candidate' && signal.candidate) {
          const pc = peerConnectionRef.current;
          if (isRemoteDescriptionSetRef.current && pc && pc.remoteDescription) {
            if (RTCIceCandidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
            } else {
              await pc.addIceCandidate(signal.candidate).catch(() => {});
            }
          } else if (callId) {
            const queue = pendingCandidatesByCallRef.current.get(callId) || [];
            queue.push(signal.candidate);
            pendingCandidatesByCallRef.current.set(callId, queue);
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

    // 12. Group Call Events & Multi-Peer Mesh
    const unsubGroupParticipants = socketService.on('group-call:existing_participants', ({ roomId, participants }) => {
      setGroupCall((prev) => (prev ? { ...prev, participants: participants || [] } : prev));
      if (groupMeshRef.current && groupMeshRef.current.roomId === roomId) {
        groupMeshRef.current.syncParticipants(participants || []);
      }
    });

    const unsubGroupJoined = socketService.on('group-call:user_joined', ({ roomId, participant }) => {
      setGroupCall((prev) => {
        if (!prev) return prev;
        const pId = participant.user?._id?.toString();
        const exists = prev.participants.some((p) => p.user?._id?.toString() === pId);
        if (exists) return prev;
        return { ...prev, participants: [...prev.participants, participant] };
      });
      if (groupMeshRef.current && (!roomId || groupMeshRef.current.roomId === roomId)) {
        groupMeshRef.current.handleUserJoined(participant);
      }
      showToast(`${participant.user?.name || 'Someone'} joined group call`, 'info');
    });

    const unsubGroupLeft = socketService.on('group-call:user_left', ({ roomId, userId }) => {
      setGroupCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.filter((p) => p.user?._id?.toString() !== userId?.toString()),
        };
      });
      if (groupMeshRef.current && (!roomId || groupMeshRef.current.roomId === roomId)) {
        groupMeshRef.current.handleUserLeft(userId);
      }
    });

    const unsubGroupSignal = socketService.on('group-call:signal', async ({ roomId, fromUserId, signal }) => {
      if (groupMeshRef.current && groupMeshRef.current.roomId === roomId) {
        await groupMeshRef.current.handleSignal(fromUserId, signal);
      }
    });

    const unsubGroupMute = socketService.on('group-call:user_mute_state', ({ userId, isMuted: mutedState }) => {
      setGroupCall((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user?._id?.toString() === userId?.toString() ? { ...p, isMuted: mutedState } : p
          ),
        };
      });
    });

    // 13. Spaces Live Authoritative Engine & Speaker-Only Mesh
    const resolveMySpaceRole = (spaceSnapshot) => {
      const myId = (currentUser?._id || currentUser?.id)?.toString();
      if (!myId || !spaceSnapshot) return 'LISTENER';
      const hostId = (spaceSnapshot.host?._id || spaceSnapshot.hostId)?.toString();
      if (hostId === myId) return 'HOST';
      const spk = (spaceSnapshot.speakers || []).find(
        (s) => (s.user?._id || s.user?.id || s.userId)?.toString() === myId
      );
      return spk?.role || 'LISTENER';
    };

    const syncSpaceMediaAdapter = async (spaceSnapshot, mediaToken = null) => {
      if (!spaceSnapshot?.id) return;
      const myId = (currentUser?._id || currentUser?.id)?.toString();
      if (!myId) return;
      const myRole = resolveMySpaceRole(spaceSnapshot);

      if (!spacesAdapterRef.current || spacesAdapterRef.current.spaceId !== spaceSnapshot.id) {
        const iceConfig = await fetchIceServers(api).catch(() => null);
        const adapter = createSpacesMediaAdapter(mediaToken);
        await adapter.connect(
          {
            spaceId: spaceSnapshot.id,
            userId: myId,
            role: myRole,
            socketService,
            iceServers: iceConfig,
          },
          localStreamRef.current,
          {}
        );
        spacesAdapterRef.current = adapter;
        ClearFeedTelecom.startCallAudio().catch(() => {});
        ClearFeedTelecom.setSpeakerphoneOn(true).catch(() => {});
        ClearFeedTelecom.startCallForegroundService('Clearfeed Live Space', spaceSnapshot.title).catch(() => {});
      } else {
        if (spacesAdapterRef.current.role !== myRole) {
          await spacesAdapterRef.current.updateRole(myRole, mediaToken);
        }
        if (
          localStreamRef.current &&
          spacesAdapterRef.current.canPublish() &&
          spacesAdapterRef.current.localStream !== localStreamRef.current
        ) {
          spacesAdapterRef.current.setLocalStream(localStreamRef.current);
        }
      }

      spacesAdapterRef.current.syncParticipants(spaceSnapshot);
    };

    const unsubSpaceJoined = socketService.on('spaces:joined', ({ space, mediaToken }) => {
      if (!space) return;
      setActiveSpace(space);
      syncSpaceMediaAdapter(space, mediaToken);
    });

    const unsubSpacesUpdated = socketService.on('spaces:updated', ({ spaces }) => {
      setSpacesList(spaces || []);
    });

    const unsubSpaceState = socketService.on('space:state_change', ({ space }) => {
      if (!space) return;
      setActiveSpace((prev) => (prev && prev.id === space.id ? space : prev));
      if (activeSpaceRef.current?.id === space.id) {
        syncSpaceMediaAdapter(space);
      }
    });

    const unsubSpaceEnded = socketService.on('space:ended', ({ spaceId }) => {
      if (activeSpaceRef.current?.id === spaceId) {
        spacesAdapterRef.current?.disconnect();
        spacesAdapterRef.current = null;
        if (callStateRef.current === 'idle') {
          ClearFeedTelecom.stopCallForegroundService().catch(() => {});
          ClearFeedTelecom.stopCallAudio().catch(() => {});
        }
        setActiveSpace(null);
        setIsSpaceMuted(true);
        setIsHandRaised(false);
        showToast('This Audio Space has ended.', 'info');
      }
      refreshSpaces();
    });

    const unsubSpaceSpeaking = socketService.on('space:user_speaking', ({ userId, isSpeaking }) => {
      setSpeakingUsers((prev) => {
        const next = new Set(prev);
        if (isSpeaking) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    const unsubSpeakerPromoted = socketService.on('spaces:speaker_promoted', async ({ mediaToken } = {}) => {
      setIsSpaceMuted(true);
      setIsHandRaised(false);
      try {
        let stream = localStreamRef.current;
        const hasLive = stream && stream.getAudioTracks().some((t) => t.readyState === 'live');
        if (!hasLive) {
          stream = await getLocalAudioStream().catch(() => null);
          if (stream) {
            stream.getAudioTracks().forEach((t) => (t.enabled = false));
            localStreamRef.current = stream;
            setLocalAudioStream(stream);
          }
        }
        if (spacesAdapterRef.current) {
          await spacesAdapterRef.current.updateRole('SPEAKER', mediaToken);
          if (stream) spacesAdapterRef.current.setLocalStream(stream);
          if (activeSpaceRef.current) {
            spacesAdapterRef.current.syncParticipants(activeSpaceRef.current);
          }
        }
      } catch {}
      showToast('Promoted to Speaker! Tap Unmute to speak.', 'success');
    });

    const unsubSpeakRejected = socketService.on('spaces:speak_rejected', () => {
      setIsHandRaised(false);
      showToast('Your speak request was declined.', 'info');
    });

    const unsubForceMuted = socketService.on('spaces:force_muted', () => {
      setIsSpaceMuted(true);
      if (spacesAdapterRef.current) spacesAdapterRef.current.isMuted = true;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      showToast('Muted by moderator.', 'info');
    });

    const unsubDemoted = socketService.on('spaces:demoted', async ({ mediaToken } = {}) => {
      setIsSpaceMuted(true);
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      if (spacesAdapterRef.current) {
        await spacesAdapterRef.current.updateRole('LISTENER', mediaToken).catch(() => {});
        if (activeSpaceRef.current) spacesAdapterRef.current.syncParticipants(activeSpaceRef.current);
      }
      showToast('Moved back to Listeners.', 'info');
    });

    const unsubKicked = socketService.on('spaces:kicked', () => {
      spacesAdapterRef.current?.disconnect();
      spacesAdapterRef.current = null;
      if (callStateRef.current === 'idle') {
        ClearFeedTelecom.stopCallForegroundService().catch(() => {});
        ClearFeedTelecom.stopCallAudio().catch(() => {});
      }
      setActiveSpace(null);
      setIsSpaceMuted(true);
      setIsHandRaised(false);
      showToast('You were removed from this Space.', 'error');
    });

    return () => {
      unsubIncoming();
      unsubInitiated();
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
      unsubGroupSignal();
      unsubGroupMute();
      unsubSpaceJoined();
      unsubSpacesUpdated();
      unsubSpaceState();
      unsubSpaceEnded();
      unsubSpaceSpeaking();
      unsubSpeakerPromoted();
      unsubSpeakRejected();
      unsubForceMuted();
      unsubDemoted();
      unsubKicked();
    };
  }, [currentUser, cleanupCallResources, refreshSpaces, showToast]);

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
    async (roomId, roomName = 'Dev Group Call', targetUserIds = []) => {
      if (!currentUser) return;
      const finalRoomId = roomId || `room_${Date.now()}`;

      let stream = null;
      try {
        stream = await getLocalAudioStream();
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      } catch {
        showToast('Microphone unavailable: joined Group Call muted', 'info');
      }

      const iceConfig = await fetchIceServers(api).catch(() => null);
      groupMeshRef.current.connect({
        roomId: finalRoomId,
        userId: currentUser._id?.toString(),
        socketService,
        iceServers: iceConfig,
        localStream: stream,
      });

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
            isMuted: !stream,
          },
        ],
      });
      setIsMuted(!stream);
      setCallState('group');
      startTimer();

      ClearFeedTelecom.startCallAudio().catch(() => {});
      ClearFeedTelecom.setSpeakerphoneOn(true).catch(() => {});
      ClearFeedTelecom.startCallForegroundService('Clearfeed Group Call', roomName).catch(() => {});

      socketService.joinGroupCall({
        roomId: finalRoomId,
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
        },
      });

      if (targetUserIds.length > 0) {
        socketService.inviteToGroupCall({
          roomId: finalRoomId,
          roomName,
          targetUserIds,
          caller: currentUser,
        });
      }
    },
    [currentUser, startTimer, showToast]
  );

  // Leave Group Audio Call
  const leaveGroupCall = useCallback(() => {
    stopTimer();
    groupMeshRef.current?.disconnect();
    if (groupCall) {
      socketService.leaveGroupCall({ roomId: groupCall.roomId });
    }
    if (localStreamRef.current && !activeSpaceRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      localStreamRef.current = null;
      setLocalAudioStream(null);
    }
    if (!activeSpaceRef.current) {
      ClearFeedTelecom.stopCallForegroundService().catch(() => {});
      ClearFeedTelecom.stopCallAudio().catch(() => {});
    }
    setIsMuted(false);
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

  // ==========================================
  // SPACES LIVE ACTIONS (Authoritative Stage + Speaker Mesh)
  // ==========================================
  const createSpace = useCallback(
    async ({ title, topic }) => {
      if (!currentUser) return null;
      if (spacesAdapterRef.current) {
        spacesAdapterRef.current.disconnect();
        spacesAdapterRef.current = null;
      }

      const stream = await getLocalAudioStream().catch(() => null);
      if (stream) {
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      } else {
        showToast('Microphone unavailable: launched Space muted.', 'info');
      }

      const res = await api.post('/spaces', {
        title,
        topic,
        topicTags: [topic || 'General'],
        visibility: 'public',
      });
      const space = res.data?.space || res.data;
      const spaceId = space?.id || space?.roomId || space?._id;
      setActiveSpace(space);
      setIsSpaceMuted(!stream);
      setIsHandRaised(false);

      if (spaceId) {
        socketService.joinSpace({ spaceId, user: currentUser });
      }
      refreshSpaces();
      return space;
    },
    [currentUser, refreshSpaces, showToast]
  );

  const joinSpace = useCallback(
    (space) => {
      if (!space || !currentUser) return;
      if (callStateRef.current !== 'idle') {
        showToast('Finish your active call before joining a Space', 'info');
        return;
      }
      const spaceId = space.id || space.roomId || space._id;
      if (!spaceId) return;

      if (spacesAdapterRef.current && spacesAdapterRef.current.spaceId !== spaceId) {
        spacesAdapterRef.current.disconnect();
        spacesAdapterRef.current = null;
      }

      setActiveSpace(space);
      setIsSpaceMuted(true);
      setIsHandRaised(false);

      socketService.joinSpace({ spaceId, user: currentUser });
    },
    [currentUser, showToast]
  );

  const leaveSpace = useCallback(() => {
    if (!activeSpace) return;
    const spaceId = activeSpace.id || activeSpace.roomId || activeSpace._id;
    if (spaceId) {
      socketService.leaveSpace({ spaceId });
    }
    spacesAdapterRef.current?.disconnect();
    spacesAdapterRef.current = null;
    if (localStreamRef.current && callStateRef.current === 'idle') {
      try {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      localStreamRef.current = null;
      setLocalAudioStream(null);
    }
    if (callStateRef.current === 'idle') {
      ClearFeedTelecom.stopCallForegroundService().catch(() => {});
      ClearFeedTelecom.stopCallAudio().catch(() => {});
    }
    setActiveSpace(null);
    setIsSpaceMuted(true);
    setIsHandRaised(false);
    showToast('Left Audio Space', 'info');
  }, [activeSpace, showToast]);

  const toggleSpaceMute = useCallback(async () => {
    if (!activeSpace) return;
    const nextMuted = !isSpaceMuted;
    const spaceId = activeSpace.id || activeSpace.roomId || activeSpace._id;

    if (!nextMuted) {
      let stream = localStreamRef.current;
      const hasLive = stream && stream.getAudioTracks().some((t) => t.readyState === 'live');
      if (!hasLive) {
        try {
          stream = await getLocalAudioStream();
          localStreamRef.current = stream;
          setLocalAudioStream(stream);
        } catch {
          showToast('Microphone permission required to speak', 'error');
          return;
        }
      }
      if (stream && spacesAdapterRef.current) {
        spacesAdapterRef.current.setLocalStream(stream);
      }
    }

    setIsSpaceMuted(nextMuted);
    if (spacesAdapterRef.current) {
      await spacesAdapterRef.current.setMicrophoneMuted(nextMuted);
    } else if (spaceId) {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !nextMuted;
        });
      }
      socketService.toggleSpaceMute({ spaceId, isMuted: nextMuted });
    }
  }, [activeSpace, isSpaceMuted, showToast]);

  const requestToSpeak = useCallback(() => {
    if (!activeSpace) return;
    const spaceId = activeSpace.id || activeSpace.roomId || activeSpace._id;
    if (!spaceId) return;
    const next = !isHandRaised;
    setIsHandRaised(next);
    if (next) {
      socketService.requestSpeak({ spaceId });
    } else {
      socketService.cancelRequest({ spaceId });
    }
    showToast(next ? 'Hand raised to speak' : 'Hand lowered', 'info');
  }, [activeSpace, isHandRaised, showToast]);

  const isSpaceHost = Boolean(
    activeSpace &&
      (activeSpace.host?._id?.toString() === currentUser?._id?.toString() ||
        activeSpace.hostId?.toString() === currentUser?._id?.toString())
  );

  const isSpaceSpeaker = Boolean(
    isSpaceHost ||
      activeSpace?.speakers?.some(
        (s) => (s.user?._id || s.user?.id || s.userId)?.toString() === currentUser?._id?.toString()
      )
  );

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
        callConnectionState,
        iceCandidateType,
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

        // Spaces Live
        spacesList,
        activeSpace,
        isSpaceMuted,
        isHandRaised,
        speakingUsers,
        isSpaceHost,
        isSpaceSpeaker,
        refreshSpaces,
        createSpace,
        joinSpace,
        leaveSpace,
        toggleSpaceMute,
        requestToSpeak,
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
