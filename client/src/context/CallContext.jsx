import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import socketService from "../services/socket";
import {
  sounds,
  getLocalAudioStream,
  createPeerConnection,
} from "../services/webrtc";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import api from "../api/client";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();

  // 1-on-1 Call States: 'idle' | 'calling' | 'incoming' | 'connected'
  const [callState, setCallState] = useState("idle");
  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [localAudioStream, setLocalAudioStream] = useState(null);

  // Group Call States
  const [groupCallState, setGroupCallState] = useState("idle"); // 'idle' | 'incoming' | 'connected'
  const [activeGroupCall, setActiveGroupCall] = useState(null);
  const [incomingGroupCall, setIncomingGroupCall] = useState(null);
  const [isGroupCallModalOpen, setIsGroupCallModalOpen] = useState(false);
  const [isGroupMuted, setIsGroupMuted] = useState(false);
  const [groupCallDuration, setGroupCallDuration] = useState(0);

  // Universal Call Hub Launcher Modal
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [newCallModalTab, setNewCallModalTab] = useState("direct"); // 'direct' | 'group' | 'spaces'

  // Audio Spaces States
  const [spacesList, setSpacesList] = useState([]);
  const [activeSpace, setActiveSpace] = useState(null);
  const [isSpacesModalOpen, setIsSpacesModalOpen] = useState(false);
  const [isSpaceMuted, setIsSpaceMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [spaceReactions, setSpaceReactions] = useState([]);

  // Internal WebRTC references
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioElemRef = useRef(null);
  const durationTimerRef = useRef(null);
  const groupDurationTimerRef = useRef(null);
  const vadIntervalRef = useRef(null);
  const isSpeakingLocallyRef = useRef(false);

  // Ensure remote audio element exists in DOM
  useEffect(() => {
    if (!remoteAudioElemRef.current && typeof document !== "undefined") {
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.playsInline = true;
      audio.style.display = "none";
      document.body.appendChild(audio);
      remoteAudioElemRef.current = audio;
    }

    return () => {
      if (remoteAudioElemRef.current) {
        remoteAudioElemRef.current.remove();
        remoteAudioElemRef.current = null;
      }
    };
  }, []);

  // Duration Timer Helper
  const startTimer = useCallback(() => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  const startGroupTimer = useCallback(() => {
    if (groupDurationTimerRef.current)
      clearInterval(groupDurationTimerRef.current);
    setGroupCallDuration(0);
    groupDurationTimerRef.current = setInterval(() => {
      setGroupCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopGroupTimer = useCallback(() => {
    if (groupDurationTimerRef.current) {
      clearInterval(groupDurationTimerRef.current);
      groupDurationTimerRef.current = null;
    }
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean up local call resources
  const cleanupCallResources = useCallback(() => {
    stopTimer();
    sounds.stopRingtone();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalAudioStream(null);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioElemRef.current) {
      remoteAudioElemRef.current.srcObject = null;
    }

    setCallState("idle");
    setActiveCall(null);
    setIsMuted(false);
    setIsMinimized(false);
    setCallDuration(0);
  }, [stopTimer]);

  const cleanupGroupCallResources = useCallback(() => {
    stopGroupTimer();
    sounds.stopRingtone();

    if (localStreamRef.current && callState === "idle" && !activeSpace) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalAudioStream(null);
    }

    setGroupCallState("idle");
    setActiveGroupCall(null);
    setIncomingGroupCall(null);
    setIsGroupCallModalOpen(false);
    setIsGroupMuted(false);
    setGroupCallDuration(0);
  }, [stopGroupTimer, callState, activeSpace]);

  // Voice Activity Detection (VAD) to trigger real-time sound waves
  useEffect(() => {
    if (!localAudioStream || isMuted || isSpaceMuted || isGroupMuted) {
      if (isSpeakingLocallyRef.current && currentUser?._id) {
        isSpeakingLocallyRef.current = false;
        setSpeakingUsers((prev) => {
          const next = new Set(prev);
          next.delete(currentUser._id);
          return next;
        });
        if (activeSpace)
          socketService.sendSpeakingState({
            spaceId: activeSpace.id,
            isSpeaking: false,
          });
        if (activeGroupCall)
          socketService.sendGroupCallSpeaking({
            roomId: activeGroupCall.roomId,
            isSpeaking: false,
          });
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(localAudioStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      vadIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const isSpeakingNow = avg > 18;

        if (
          isSpeakingNow !== isSpeakingLocallyRef.current &&
          currentUser?._id
        ) {
          isSpeakingLocallyRef.current = isSpeakingNow;
          setSpeakingUsers((prev) => {
            const next = new Set(prev);
            if (isSpeakingNow) next.add(currentUser._id);
            else next.delete(currentUser._id);
            return next;
          });

          if (activeSpace) {
            socketService.sendSpeakingState({
              spaceId: activeSpace.id,
              isSpeaking: isSpeakingNow,
            });
          }
          if (activeGroupCall) {
            socketService.sendGroupCallSpeaking({
              roomId: activeGroupCall.roomId,
              isSpeaking: isSpeakingNow,
            });
          }
        }
      }, 150);

      return () => {
        if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
        source.disconnect();
        if (audioCtx.state !== "closed") audioCtx.close().catch(() => {});
      };
    } catch {}
  }, [
    localAudioStream,
    isMuted,
    isSpaceMuted,
    isGroupMuted,
    currentUser,
    activeSpace,
    activeGroupCall,
  ]);

  // Fetch active spaces list
  const refreshSpaces = useCallback(async () => {
    try {
      const res = await api.get("/spaces");
      setSpacesList(res.data.spaces || []);
    } catch {}
  }, []);

  // Universal New Call Modal helper
  const openNewCallModal = useCallback((tab = "direct") => {
    setNewCallModalTab(tab);
    setIsNewCallModalOpen(true);
  }, []);

  const closeNewCallModal = useCallback(() => {
    setIsNewCallModalOpen(false);
  }, []);

  // Socket Connection & Event Listeners
  useEffect(() => {
    if (!currentUser) return;

    socketService.connect();
    refreshSpaces();

    // 1. Incoming Call
    const unsubIncoming = socketService.on(
      "call:incoming",
      ({ callId, caller, callType }) => {
        if (callState !== "idle" || groupCallState !== "idle") {
          socketService.rejectCall({
            callId,
            targetUserId: caller._id,
            reason: "busy",
          });
          return;
        }

        setActiveCall({
          callId,
          otherUser: caller,
          isOutgoing: false,
          callType: callType || "audio",
        });
        setCallState("incoming");
        sounds.startIncomingRing();
      },
    );

    // 2. Call Ringing
    const unsubRinging = socketService.on("call:ringing", () => {
      sounds.startOutgoingRing();
    });

    // 3. Call Accepted
    const unsubAccepted = socketService.on(
      "call:accepted",
      async ({ callId }) => {
        sounds.playConnectedTone();
        setCallState("connected");
        startTimer();

        try {
          const stream = await getLocalAudioStream();
          localStreamRef.current = stream;
          setLocalAudioStream(stream);

          const pc = createPeerConnection({
            onIceCandidate: (candidate) => {
              if (activeCall?.otherUser?._id) {
                socketService.sendSignal({
                  callId,
                  targetUserId: activeCall.otherUser._id,
                  signal: { type: "candidate", candidate },
                });
              }
            },
            onTrack: (remoteStream) => {
              if (remoteAudioElemRef.current) {
                remoteAudioElemRef.current.srcObject = remoteStream;
                remoteAudioElemRef.current.play().catch(() => {});
              }
            },
          });

          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
          peerConnectionRef.current = pc;

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          if (activeCall?.otherUser?._id) {
            socketService.sendSignal({
              callId,
              targetUserId: activeCall.otherUser._id,
              signal: { type: "offer", sdp: offer },
            });
          }
        } catch (err) {
          console.warn("WebRTC offer error:", err.message);
        }
      },
    );

    // 4. WebRTC Signaling Relay
    const unsubSignal = socketService.on(
      "call:signal",
      async ({ callId, fromUserId, signal }) => {
        try {
          if (!peerConnectionRef.current) {
            const stream = await getLocalAudioStream();
            localStreamRef.current = stream;
            setLocalAudioStream(stream);

            const pc = createPeerConnection({
              onIceCandidate: (candidate) => {
                socketService.sendSignal({
                  callId,
                  targetUserId: fromUserId,
                  signal: { type: "candidate", candidate },
                });
              },
              onTrack: (remoteStream) => {
                if (remoteAudioElemRef.current) {
                  remoteAudioElemRef.current.srcObject = remoteStream;
                  remoteAudioElemRef.current.play().catch(() => {});
                }
              },
            });

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            peerConnectionRef.current = pc;
          }

          const pc = peerConnectionRef.current;

          if (signal.type === "offer") {
            await pc.setRemoteDescription(
              new RTCSessionDescription(signal.sdp),
            );
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketService.sendSignal({
              callId,
              targetUserId: fromUserId,
              signal: { type: "answer", sdp: answer },
            });
          } else if (signal.type === "answer") {
            await pc.setRemoteDescription(
              new RTCSessionDescription(signal.sdp),
            );
          } else if (signal.type === "candidate" && signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        } catch (err) {
          console.warn("Signal handling error:", err.message);
        }
      },
    );

    // 5. Call End / Rejected
    const unsubRejected = socketService.on("call:rejected", ({ reason }) => {
      sounds.playEndTone();
      showToast(
        reason === "busy" ? "User is busy on another call" : "Call declined",
        "info",
      );
      cleanupCallResources();
    });

    const unsubOffline = socketService.on("call:user_offline", () => {
      sounds.playEndTone();
      showToast("User is currently offline", "error");
      cleanupCallResources();
    });

    const unsubEnded = socketService.on("call:ended", () => {
      sounds.playEndTone();
      showToast("Call ended", "info");
      cleanupCallResources();
    });

    // 6. Group Call Events
    const unsubGroupIncoming = socketService.on(
      "group-call:incoming",
      ({ roomId, roomName, caller }) => {
        if (groupCallState !== "idle" || callState !== "idle") return;
        setIncomingGroupCall({ roomId, roomName, caller });
        setGroupCallState("incoming");
        sounds.startIncomingRing();
      },
    );

    const unsubGroupExisting = socketService.on(
      "group-call:existing_participants",
      ({ roomId, participants }) => {
        setActiveGroupCall((prev) => (prev ? { ...prev, participants } : prev));
      },
    );

    const unsubGroupJoined = socketService.on(
      "group-call:user_joined",
      ({ roomId, participant }) => {
        setActiveGroupCall((prev) => {
          if (!prev || prev.roomId !== roomId) return prev;
          const filtered = prev.participants.filter(
            (p) => p.user?._id !== participant.user?._id,
          );
          return { ...prev, participants: [...filtered, participant] };
        });
        sounds.playConnectedTone();
        showToast(
          `${participant.user?.name || "A classmate"} joined the group call`,
          "info",
        );
      },
    );

    const unsubGroupLeft = socketService.on(
      "group-call:user_left",
      ({ roomId, userId: leftUserId }) => {
        setActiveGroupCall((prev) => {
          if (!prev || prev.roomId !== roomId) return prev;
          return {
            ...prev,
            participants: prev.participants.filter(
              (p) => p.user?._id !== leftUserId,
            ),
          };
        });
      },
    );

    const unsubGroupSpeaking = socketService.on(
      "group-call:user_speaking",
      ({ userId: uId, isSpeaking }) => {
        setSpeakingUsers((prev) => {
          const next = new Set(prev);
          if (isSpeaking) next.add(uId);
          else next.delete(uId);
          return next;
        });
      },
    );

    const unsubGroupMute = socketService.on(
      "group-call:user_mute_state",
      ({ userId: uId, isMuted: uMuted }) => {
        setActiveGroupCall((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: prev.participants.map((p) =>
              p.user?._id === uId ? { ...p, isMuted: uMuted } : p,
            ),
          };
        });
      },
    );

    // 7. Spaces Updates
    const unsubSpacesUpdated = socketService.on(
      "spaces:updated",
      ({ spaces }) => {
        setSpacesList(spaces || []);
      },
    );

    const unsubSpaceState = socketService.on(
      "space:state_change",
      ({ space }) => {
        setActiveSpace((prev) => (prev && prev.id === space.id ? space : prev));
      },
    );

    const unsubSpaceEnded = socketService.on("space:ended", ({ spaceId }) => {
      setActiveSpace((prev) => {
        if (prev && prev.id === spaceId) {
          showToast("This Audio Space has ended.", "info");
          return null;
        }
        return prev;
      });
      refreshSpaces();
    });

    const unsubSpeaking = socketService.on(
      "space:user_speaking",
      ({ userId: uId, isSpeaking }) => {
        setSpeakingUsers((prev) => {
          const next = new Set(prev);
          if (isSpeaking) next.add(uId);
          else next.delete(uId);
          return next;
        });
      },
    );

    const unsubReaction = socketService.on(
      "space:reaction",
      ({ emoji, username }) => {
        const id = Date.now() + Math.random();
        setSpaceReactions((prev) => [
          ...prev.slice(-10),
          { id, emoji, username },
        ]);
        setTimeout(() => {
          setSpaceReactions((prev) => prev.filter((r) => r.id !== id));
        }, 3500);
      },
    );

    return () => {
      unsubIncoming();
      unsubRinging();
      unsubAccepted();
      unsubSignal();
      unsubRejected();
      unsubOffline();
      unsubEnded();
      unsubGroupIncoming();
      unsubGroupExisting();
      unsubGroupJoined();
      unsubGroupLeft();
      unsubGroupSpeaking();
      unsubGroupMute();
      unsubSpacesUpdated();
      unsubSpaceState();
      unsubSpaceEnded();
      unsubSpeaking();
      unsubReaction();
    };
  }, [
    currentUser,
    callState,
    groupCallState,
    activeCall,
    cleanupCallResources,
    refreshSpaces,
    showToast,
    startTimer,
  ]);

  // ==========================================
  // 1-ON-1 CALL ACTIONS
  // ==========================================

  const startCall = useCallback(
    async (targetUser) => {
      if (!targetUser || !targetUser._id) {
        showToast("Invalid user profile for calling", "error");
        return;
      }

      if (targetUser._id === currentUser?._id) {
        showToast("You cannot call yourself", "info");
        return;
      }

      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const callerInfo = {
        _id: currentUser._id,
        name: currentUser.name,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
      };

      try {
        const stream = await getLocalAudioStream();
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      } catch {}

      setActiveCall({
        callId,
        otherUser: targetUser,
        isOutgoing: true,
        callType: "audio",
      });
      setCallState("calling");
      sounds.startOutgoingRing();

      socketService.initiateCall({
        callId,
        targetUserId: targetUser._id,
        callerInfo,
        callType: "audio",
      });
    },
    [currentUser, showToast],
  );

  const acceptCall = useCallback(async () => {
    if (!activeCall) return;
    sounds.stopRingtone();
    sounds.playConnectedTone();
    setCallState("connected");
    startTimer();

    try {
      const stream = await getLocalAudioStream();
      localStreamRef.current = stream;
      setLocalAudioStream(stream);
    } catch {}

    socketService.acceptCall({
      callId: activeCall.callId,
      targetUserId: activeCall.otherUser._id,
    });
  }, [activeCall, startTimer]);

  const rejectCall = useCallback(() => {
    if (!activeCall) return;
    sounds.playEndTone();
    socketService.rejectCall({
      callId: activeCall.callId,
      targetUserId: activeCall.otherUser._id,
      reason: "declined",
    });
    cleanupCallResources();
  }, [activeCall, cleanupCallResources]);

  const endCall = useCallback(() => {
    if (!activeCall) return;
    sounds.playEndTone();
    socketService.endCall({
      callId: activeCall.callId,
      targetUserId: activeCall.otherUser._id,
    });
    cleanupCallResources();
  }, [activeCall, cleanupCallResources]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted((prev) => !prev);
    }
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  // ==========================================
  // GROUP CALL ACTIONS
  // ==========================================

  const startGroupCall = useCallback(
    async ({ roomName, targetUserIds = [] }) => {
      const roomId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const finalName = (roomName || "Group Voice Call").trim();

      try {
        const stream = await getLocalAudioStream();
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      } catch {}

      setActiveGroupCall({
        roomId,
        roomName: finalName,
        host: currentUser,
        participants: [
          {
            user: currentUser,
            isMuted: false,
            joinedAt: new Date(),
          },
        ],
      });

      setGroupCallState("connected");
      setIsGroupCallModalOpen(true);
      startGroupTimer();
      sounds.playConnectedTone();

      // Join socket room
      socketService.joinGroupCall({ roomId, user: currentUser });

      // Ring all selected participants
      if (targetUserIds.length > 0) {
        socketService.inviteToGroupCall({
          roomId,
          roomName: finalName,
          targetUserIds,
          caller: currentUser,
        });
        showToast(`Calling ${targetUserIds.length} member(s)...`, "info");
      }
    },
    [currentUser, startGroupTimer, showToast],
  );

  const acceptGroupCall = useCallback(async () => {
    if (!incomingGroupCall) return;
    sounds.stopRingtone();
    sounds.playConnectedTone();

    try {
      const stream = await getLocalAudioStream();
      localStreamRef.current = stream;
      setLocalAudioStream(stream);
    } catch {}

    setActiveGroupCall({
      roomId: incomingGroupCall.roomId,
      roomName: incomingGroupCall.roomName,
      host: incomingGroupCall.caller,
      participants: [
        { user: incomingGroupCall.caller, isMuted: false },
        { user: currentUser, isMuted: false },
      ],
    });

    setGroupCallState("connected");
    setIncomingGroupCall(null);
    setIsGroupCallModalOpen(true);
    startGroupTimer();

    socketService.joinGroupCall({
      roomId: incomingGroupCall.roomId,
      user: currentUser,
    });
  }, [incomingGroupCall, currentUser, startGroupTimer]);

  const rejectGroupCall = useCallback(() => {
    sounds.stopRingtone();
    setIncomingGroupCall(null);
    setGroupCallState("idle");
  }, []);

  const leaveGroupCall = useCallback(() => {
    if (activeGroupCall) {
      socketService.leaveGroupCall({ roomId: activeGroupCall.roomId });
    }
    sounds.playEndTone();
    cleanupGroupCallResources();
    showToast("Left group call", "info");
  }, [activeGroupCall, cleanupGroupCallResources, showToast]);

  const toggleGroupMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsGroupMuted(!audioTrack.enabled);
        if (activeGroupCall) {
          socketService.toggleGroupCallMute({
            roomId: activeGroupCall.roomId,
            isMuted: !audioTrack.enabled,
          });
        }
      }
    } else {
      setIsGroupMuted((prev) => !prev);
    }
  }, [activeGroupCall]);

  // ==========================================
  // TWITTER SPACES ACTIONS
  // ==========================================

  const createSpace = useCallback(
    async ({ title, topic }) => {
      try {
        const stream = await getLocalAudioStream().catch(() => null);
        if (stream) {
          localStreamRef.current = stream;
          setLocalAudioStream(stream);
        }

        const res = await api.post("/spaces", { title, topic });
        const space = res.data.space;
        setActiveSpace(space);
        setIsSpacesModalOpen(true);
        setIsSpaceMuted(false);

        socketService.joinSpace({
          spaceId: space.id,
          user: currentUser,
        });

        showToast("Audio Space launched! You are live.", "success");
        refreshSpaces();
        return space;
      } catch (err) {
        showToast(
          err.response?.data?.message || err.message || "Failed to start Space",
          "error",
        );
      }
    },
    [currentUser, showToast, refreshSpaces],
  );

  const joinSpace = useCallback(
    (space) => {
      if (!space) return;
      setActiveSpace(space);
      setIsSpacesModalOpen(true);
      setIsSpaceMuted(true);

      socketService.joinSpace({
        spaceId: space.id,
        user: currentUser,
      });
    },
    [currentUser],
  );

  const leaveSpace = useCallback(() => {
    if (!activeSpace) return;
    socketService.leaveSpace({ spaceId: activeSpace.id });
    setActiveSpace(null);
    setIsSpacesModalOpen(false);
    setIsHandRaised(false);
    setIsSpaceMuted(false);
    showToast("Left Audio Space", "info");
  }, [activeSpace, showToast]);

  const toggleSpaceMute = useCallback(async () => {
    if (!activeSpace) return;
    const nextState = !isSpaceMuted;

    if (!nextState && !localStreamRef.current) {
      try {
        const stream = await getLocalAudioStream();
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      } catch {}
    }

    setIsSpaceMuted(nextState);
    socketService.toggleSpaceMute({
      spaceId: activeSpace.id,
      isMuted: nextState,
    });
  }, [activeSpace, isSpaceMuted]);

  const raiseHand = useCallback(() => {
    if (!activeSpace) return;
    const next = !isHandRaised;
    setIsHandRaised(next);
    socketService.raiseHand({ spaceId: activeSpace.id, raised: next });
    showToast(next ? "Hand raised to speak ✋" : "Hand lowered", "info");
  }, [activeSpace, isHandRaised, showToast]);

  const setParticipantRole = useCallback(
    (targetUserId, role) => {
      if (!activeSpace) return;
      socketService.setRole({ spaceId: activeSpace.id, targetUserId, role });
    },
    [activeSpace],
  );

  const sendSpaceReaction = useCallback(
    (emoji) => {
      if (!activeSpace) return;
      socketService.sendReaction({
        spaceId: activeSpace.id,
        emoji,
        username: currentUser?.name || "Someone",
      });
    },
    [activeSpace, currentUser],
  );

  const isHost = activeSpace?.host?._id === currentUser?._id;
  const isSpeaker =
    isHost ||
    (activeSpace?.speakers &&
      activeSpace.speakers.some((s) => s.user?._id === currentUser?._id));

  return (
    <CallContext.Provider
      value={{
        // 1-on-1 Call
        callState,
        activeCall,
        isMuted,
        callDuration,
        formatDuration,
        isMinimized,
        localAudioStream,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleMinimize,

        // Group Voice Call
        groupCallState,
        activeGroupCall,
        incomingGroupCall,
        isGroupCallModalOpen,
        setIsGroupCallModalOpen,
        isGroupMuted,
        groupCallDuration,
        startGroupCall,
        acceptGroupCall,
        rejectGroupCall,
        leaveGroupCall,
        toggleGroupMute,

        // New Call Hub Launcher Modal
        isNewCallModalOpen,
        newCallModalTab,
        openNewCallModal,
        closeNewCallModal,

        // Audio Spaces
        spacesList,
        activeSpace,
        isSpacesModalOpen,
        setIsSpacesModalOpen,
        isSpaceMuted,
        isHandRaised,
        speakingUsers,
        spaceReactions,
        isHost,
        isSpeaker,
        refreshSpaces,
        createSpace,
        joinSpace,
        leaveSpace,
        toggleSpaceMute,
        raiseHand,
        setParticipantRole,
        sendSpaceReaction,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export default CallContext;
