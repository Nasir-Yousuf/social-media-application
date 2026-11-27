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
  fetchIceServers,
  enumerateAudioDevices,
  setAudioOutputDevice,
  restartIce,
} from "../services/webrtc";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import api from "../api/client";
import GroupCallMeshManager from "../services/groupCallMesh";
import { createSpacesMediaAdapter } from "../services/spacesMediaAdapter";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();

  // 1-on-1 Call States: 'idle' | 'calling' | 'incoming' | 'connected'
  const [callState, setCallState] = useState("idle");
  const [activeCall, setActiveCall] = useState(null);
  const [callConnectionState, setCallConnectionState] = useState("idle"); // 'idle' | 'signaling' | 'ringing' | 'negotiating' | 'connected' | 'reconnecting' | 'failed'
  const [iceCandidateType, setIceCandidateType] = useState(null); // 'host' | 'srflx' | 'relay' | null
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [localAudioStream, setLocalAudioStream] = useState(null);

  // Audio Device Selection
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState("");

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
  const activeCallRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const pendingCandidatesByCallRef = useRef(new Map());
  const isRemoteDescriptionSetRef = useRef(false);
  const makingOfferRef = useRef(false);
  const iceRestartAttemptsRef = useRef(0);
  const disconnectGraceTimerRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const groupMeshRef = useRef(new GroupCallMeshManager());
  const spacesAdapterRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const callStateRef = useRef(callState);
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const groupCallStateRef = useRef(groupCallState);
  useEffect(() => {
    groupCallStateRef.current = groupCallState;
  }, [groupCallState]);

  const activeSpaceRef = useRef(activeSpace);
  useEffect(() => {
    activeSpaceRef.current = activeSpace;
  }, [activeSpace]);

  // Ensure remote audio element exists in DOM with proper audio policies
  useEffect(() => {
    if (!remoteAudioElemRef.current && typeof document !== "undefined") {
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.playsInline = true;
      audio.muted = false;
      audio.volume = 1.0;
      // Do NOT use display: none as some mobile browsers suspend audio rendering for hidden elements
      audio.style.position = "fixed";
      audio.style.top = "-9999px";
      audio.style.left = "-9999px";
      audio.style.width = "1px";
      audio.style.height = "1px";
      audio.style.opacity = "0.01";
      audio.style.pointerEvents = "none";
      document.body.appendChild(audio);
      remoteAudioElemRef.current = audio;
    }

    return () => {
      if (remoteAudioElemRef.current) {
        try {
          remoteAudioElemRef.current.srcObject = null;
          remoteAudioElemRef.current.remove();
        } catch {}
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

  // Heartbeat ping helper (5s interval during active connected call)
  const startHeartbeat = useCallback((cId) => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = setInterval(() => {
      socketService.emit("call:heartbeat", { callId: cId });
    }, 5000);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Clean up local call resources (hardware, peer connection, timers)
  const cleanupCallResources = useCallback(() => {
    stopHeartbeat();
    stopTimer();
    sounds.stopRingtone();
    if (disconnectGraceTimerRef.current) {
      clearTimeout(disconnectGraceTimerRef.current);
      disconnectGraceTimerRef.current = null;
    }
    isRemoteDescriptionSetRef.current = false;
    makingOfferRef.current = false;
    pendingCandidatesRef.current = [];
    iceRestartAttemptsRef.current = 0;

    if (localStreamRef.current && groupCallStateRef.current === "idle" && !activeSpaceRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      localStreamRef.current = null;
      setLocalAudioStream(null);
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }

    if (remoteAudioElemRef.current) {
      remoteAudioElemRef.current.srcObject = null;
    }

    setCallState("idle");
    setActiveCall(null);
    setCallConnectionState("idle");
    setIceCandidateType(null);
    setAutoplayBlocked(false);
    setIsMuted(false);
    setIsMinimized(false);
    setCallDuration(0);
  }, [stopTimer, stopHeartbeat]);

  const unlockRemoteAudio = useCallback(() => {
    let unlocked = true;
    if (remoteAudioElemRef.current) {
      remoteAudioElemRef.current.muted = false;
      remoteAudioElemRef.current.volume = 1.0;
      const p = remoteAudioElemRef.current.play();
      if (p !== undefined) {
        p.catch(() => {
          unlocked = false;
        });
      }
    }
    groupMeshRef.current?.unlockAudio?.();
    spacesAdapterRef.current?.unlockAudio?.();
    if (unlocked) setAutoplayBlocked(false);
  }, []);

  // Audio Device Enumeration and Switching Helpers
  const refreshAudioDevices = useCallback(async () => {
    try {
      const { audioInputs, audioOutputs } = await enumerateAudioDevices();
      setAudioInputDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);
    } catch (e) {
      console.warn("Audio devices enumerate notice:", e);
    }
  }, []);

  const changeAudioInput = useCallback(async (deviceId) => {
    setSelectedAudioInput(deviceId);
    try {
      const newStream = await getLocalAudioStream(deviceId);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      localStreamRef.current = newStream;
      setLocalAudioStream(newStream);

      // Dynamically replace audio track in active peer connections
      const audioTrack = newStream.getAudioTracks()[0];
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const audioSender = senders.find((s) => s.track && s.track.kind === "audio");
        if (audioSender && audioTrack) {
          await audioSender.replaceTrack(audioTrack);
        }
      }
      groupMeshRef.current?.setLocalStream?.(newStream);
      spacesAdapterRef.current?.setLocalStream?.(newStream);
    } catch (err) {
      console.warn("Change audio input error:", err);
    }
  }, []);

  const changeAudioOutput = useCallback(async (deviceId) => {
    setSelectedAudioOutput(deviceId);
    if (remoteAudioElemRef.current) {
      await setAudioOutputDevice(remoteAudioElemRef.current, deviceId);
    }
    groupMeshRef.current?.setAudioOutput?.(deviceId);
    spacesAdapterRef.current?.setAudioOutput?.(deviceId);
  }, []);

  useEffect(() => {
    refreshAudioDevices();
  }, [refreshAudioDevices]);

  const cleanupGroupCallResources = useCallback(() => {
    stopGroupTimer();
    sounds.stopRingtone();
    groupMeshRef.current?.disconnect?.();

    if (localStreamRef.current && callStateRef.current === "idle" && !activeSpaceRef.current) {
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
  }, [stopGroupTimer]);

  const cleanupCallResourcesRef = useRef(cleanupCallResources);
  useEffect(() => {
    cleanupCallResourcesRef.current = cleanupCallResources;
  });

  const cleanupGroupCallResourcesRef = useRef(cleanupGroupCallResources);
  useEffect(() => {
    cleanupGroupCallResourcesRef.current = cleanupGroupCallResources;
  });

  // Deterministic teardown on window unload or true component unmount (empty dependency array!)
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupCallResourcesRef.current?.();
      cleanupGroupCallResourcesRef.current?.();
      spacesAdapterRef.current?.disconnect?.();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanupCallResourcesRef.current?.();
      cleanupGroupCallResourcesRef.current?.();
      spacesAdapterRef.current?.disconnect?.();
    };
  }, []);

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
        if (callStateRef.current !== "idle" || groupCallStateRef.current !== "idle") {
          socketService.rejectCall({
            callId,
            targetUserId: caller?._id || caller?.id,
            reason: "busy",
          });
          return;
        }

        const callPayload = {
          callId,
          otherUser: caller,
          isOutgoing: false,
          callType: callType || "audio",
        };
        activeCallRef.current = callPayload;
        setActiveCall(callPayload);
        setCallState("incoming");

        // Trigger phone ringtone + vibration
        sounds.startIncomingRing();

        // Browser Native Notification (if supported)
        if (typeof Notification !== 'undefined') {
          if (Notification.permission === 'granted') {
            try {
              new Notification(`📞 Incoming Call from ${caller.name || caller.username}`, {
                body: 'Tap to answer on Clearfeed',
                icon: caller.avatarUrl || '/favicon.png',
                tag: 'incoming-call',
                renotify: true,
              });
            } catch {}
          } else if (Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
          }
        }
      },
    );

    // 2. Call Initiated & Ringing
    const unsubInitiated = socketService.on("call:initiated", ({ callId, online }) => {
      if (online) {
        setCallConnectionState("ringing");
        setActiveCall((prev) => (prev && prev.callId === callId ? { ...prev, status: "ringing" } : prev));
      } else {
        setCallConnectionState("signaling");
      }
    });

    const unsubRinging = socketService.on("call:ringing", () => {
      setCallConnectionState("ringing");
      setActiveCall((prev) => (prev ? { ...prev, status: "ringing" } : prev));
      sounds.startOutgoingRing();
    });

    // Shared 1:1 RTCPeerConnection builder with ICE normalization, autoplay guard & 2.5s disconnect grace
    const createActivePeerConnection = async (callId, peerUserId) => {
      let stream = localStreamRef.current;
      const hasLiveTracks = stream && stream.getAudioTracks().some((t) => t.readyState === "live");
      if (!hasLiveTracks) {
        stream = await getLocalAudioStream(selectedAudioInput || null);
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      }
      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch {}
        peerConnectionRef.current = null;
      }
      isRemoteDescriptionSetRef.current = false;

      const iceConfig = await fetchIceServers(api);

      const pc = createPeerConnection({
        iceServers: iceConfig,
        onIceCandidate: (candidate) => {
          if (candidate) {
            socketService.sendSignal({
              callId,
              targetUserId: peerUserId,
              fromUserId: currentUser?._id,
              signal: { type: "candidate", candidate },
            });
          }
        },
        onTrack: (remoteStream) => {
          if (remoteAudioElemRef.current) {
            remoteAudioElemRef.current.srcObject = remoteStream;
            remoteAudioElemRef.current.muted = false;
            remoteAudioElemRef.current.volume = 1.0;
            if (selectedAudioOutput) {
              setAudioOutputDevice(remoteAudioElemRef.current, selectedAudioOutput);
            }
            const p = remoteAudioElemRef.current.play();
            if (p !== undefined) {
              p.then(() => setAutoplayBlocked(false)).catch((err) => {
                console.warn("Autoplay notice, unlocking on gesture:", err);
                setAutoplayBlocked(true);
                const unlock = () => {
                  remoteAudioElemRef.current?.play().then(() => setAutoplayBlocked(false)).catch(() => {});
                  document.removeEventListener("click", unlock);
                  document.removeEventListener("touchstart", unlock);
                };
                document.addEventListener("click", unlock, { once: true, passive: true });
                document.addEventListener("touchstart", unlock, { once: true, passive: true });
              });
            }
          }
        },
        onConnectionStateChange: async (iceState) => {
          if (iceState === "checking") {
            setCallConnectionState("negotiating");
          } else if (iceState === "connected" || iceState === "completed") {
            if (disconnectGraceTimerRef.current) {
              clearTimeout(disconnectGraceTimerRef.current);
              disconnectGraceTimerRef.current = null;
            }
            iceRestartAttemptsRef.current = 0;
            setCallConnectionState("connected");
            // Inspect active ICE candidate pair (Direct P2P vs TURN Relay)
            try {
              const stats = await pc.getStats();
              stats.forEach((report) => {
                if (report.type === "candidate-pair" && report.state === "succeeded" && report.localCandidateId) {
                  const localCand = stats.get(report.localCandidateId);
                  if (localCand?.candidateType) {
                    setIceCandidateType(localCand.candidateType);
                  }
                }
              });
            } catch {}
          } else if (iceState === "disconnected") {
            setCallConnectionState("reconnecting");
            if (disconnectGraceTimerRef.current) clearTimeout(disconnectGraceTimerRef.current);
            disconnectGraceTimerRef.current = setTimeout(async () => {
              if (!peerConnectionRef.current || peerConnectionRef.current !== pc) return;
              if (pc.iceConnectionState !== "disconnected" && pc.iceConnectionState !== "failed") return;
              if (iceRestartAttemptsRef.current < 3 && activeCallRef.current?.isOutgoing) {
                iceRestartAttemptsRef.current += 1;
                makingOfferRef.current = true;
                try {
                  const offer = await restartIce(pc);
                  if (offer && activeCallRef.current) {
                    socketService.sendSignal({
                      callId,
                      targetUserId: peerUserId,
                      fromUserId: currentUser?._id,
                      signal: { type: "offer", sdp: offer },
                    });
                  }
                } finally {
                  makingOfferRef.current = false;
                }
              }
            }, 2500);
          } else if (iceState === "failed") {
            setCallConnectionState("reconnecting");
            if (iceRestartAttemptsRef.current < 3) {
              iceRestartAttemptsRef.current += 1;
              console.warn(`🧊 ICE failed, auto ICE restart (${iceRestartAttemptsRef.current}/3)...`);
              makingOfferRef.current = true;
              try {
                const offer = await restartIce(pc);
                if (offer && activeCallRef.current) {
                  socketService.sendSignal({
                    callId,
                    targetUserId: peerUserId,
                    fromUserId: currentUser?._id,
                    signal: { type: "offer", sdp: offer },
                  });
                }
              } catch (e) {
                console.warn("ICE restart error:", e);
              } finally {
                makingOfferRef.current = false;
              }
            } else {
              setCallConnectionState("failed");
              showToast("Audio connection lost", "error");
              cleanupCallResources();
            }
          }
        },
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      peerConnectionRef.current = pc;
      return pc;
    };

    const flushCallCandidates = async (callId, pc) => {
      const perCall = pendingCandidatesByCallRef.current.get(callId) || [];
      const legacy = pendingCandidatesRef.current || [];
      pendingCandidatesByCallRef.current.delete(callId);
      pendingCandidatesRef.current = [];
      for (const cand of [...perCall, ...legacy]) {
        await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
      }
    };

    // 3. Call Accepted
    const unsubAccepted = socketService.on(
      "call:accepted",
      async ({ callId, responder }) => {
        sounds.playConnectedTone();
        setActiveCall((prev) => (prev ? { ...prev, status: "connected" } : prev));
        setCallState("connected");
        setCallConnectionState("negotiating");
        startTimer();
        startHeartbeat(callId);

        if (remoteAudioElemRef.current) {
          remoteAudioElemRef.current.play().catch(() => {});
        }

        // ONLY the caller initiates the WebRTC offer upon callee acceptance!
        if (!activeCallRef.current?.isOutgoing) {
          return;
        }

        const targetPeerId =
          responder?._id ||
          responder?.id ||
          activeCallRef.current?.otherUser?._id ||
          activeCallRef.current?.otherUser?.id;

        try {
          const pc = await createActivePeerConnection(callId, targetPeerId);
          makingOfferRef.current = true;
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: false,
          });
          await pc.setLocalDescription(offer);

          socketService.sendSignal({
            callId,
            targetUserId: targetPeerId,
            fromUserId: currentUser?._id,
            signal: { type: "offer", sdp: pc.localDescription || offer },
          });
        } catch (err) {
          console.warn("WebRTC offer error:", err);
        } finally {
          makingOfferRef.current = false;
        }
      },
    );

    // 4. WebRTC Signaling Relay (Perfect Negotiation + per-call candidate queue)
    const unsubSignal = socketService.on(
      "call:signal",
      async ({ callId, fromUserId, signal }) => {
        try {
          if (!signal) return;
          const activeCallId = activeCallRef.current?.callId;
          if (callId && activeCallId && callId !== activeCallId) return;

          const otherUserId =
            fromUserId ||
            activeCallRef.current?.otherUser?._id ||
            activeCallRef.current?.otherUser?.id;

          if (signal.type === "offer") {
            const pc = peerConnectionRef.current || (await createActivePeerConnection(callId, otherUserId));
            const polite = !activeCallRef.current?.isOutgoing;
            const offerCollision = makingOfferRef.current || pc.signalingState !== "stable";

            if (offerCollision) {
              if (!polite) {
                return;
              }
              await pc.setLocalDescription({ type: "rollback" }).catch(() => {});
            }

            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp || signal));
            isRemoteDescriptionSetRef.current = true;
            await flushCallCandidates(callId, pc);

            const answer = await pc.createAnswer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: false,
            });
            await pc.setLocalDescription(answer);

            socketService.sendSignal({
              callId,
              targetUserId: otherUserId,
              fromUserId: currentUser?._id,
              signal: { type: "answer", sdp: pc.localDescription || answer },
            });
          } else if (signal.type === "answer") {
            const pc = peerConnectionRef.current;
            if (pc && pc.signalingState === "have-local-offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp || signal));
              isRemoteDescriptionSetRef.current = true;
              await flushCallCandidates(callId, pc);
            }
          } else if (signal.type === "candidate" && signal.candidate) {
            const pc = peerConnectionRef.current;
            if (isRemoteDescriptionSetRef.current && pc && pc.remoteDescription?.type) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
            } else {
              const list = pendingCandidatesByCallRef.current.get(callId) || [];
              list.push(signal.candidate);
              pendingCandidatesByCallRef.current.set(callId, list);
            }
          }
        } catch (err) {
          console.warn("Signal handling error:", err);
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
      showToast("User is currently offline", "info");
      cleanupCallResources();
    });

    const unsubEnded = socketService.on("call:ended", (data) => {
      sounds.playEndTone();
      const reasonMsg =
        data?.reason === "no_answer"
          ? "No answer"
          : data?.reason === "disconnected"
          ? "Call disconnected"
          : data?.reason === "timeout"
          ? "Call timed out"
          : "Call ended";
      showToast(reasonMsg, "info");
      cleanupCallResources();
    });

    // Multi-Device Ring Coordination: answered on another device
    const unsubAnsweredElsewhere = socketService.on("call:answered_elsewhere", ({ callId }) => {
      console.log("📱 Call answered elsewhere:", callId);
      sounds.stopRingtone();
      setCallState("idle");
      setActiveCall(null);
    });

    const unsubBusy = socketService.on("call:busy", ({ reason }) => {
      sounds.playEndTone();
      if (reason === "glare_superseded") {
        showToast("Connecting incoming call...", "info");
      } else {
        showToast("User is busy on another call", "info");
        cleanupCallResources();
      }
    });

    const unsubCancelled = socketService.on("call:cancelled", () => {
      sounds.playEndTone();
      showToast("Call cancelled by caller", "info");
      cleanupCallResources();
    });

    const unsubMissed = socketService.on("call:missed", () => {
      sounds.playEndTone();
      showToast("Missed call", "info");
      cleanupCallResources();
    });

    // 6. Group Call Events
    const unsubGroupIncoming = socketService.on(
      "group-call:incoming",
      ({ roomId, roomName, caller }) => {
        if (groupCallStateRef.current !== "idle" || callStateRef.current !== "idle") return;
        setIncomingGroupCall({ roomId, roomName, caller });
        setGroupCallState("incoming");
        sounds.startIncomingRing();
      },
    );

    const unsubGroupExisting = socketService.on(
      "group-call:existing_participants",
      ({ roomId, participants }) => {
        setActiveGroupCall((prev) => (prev ? { ...prev, participants } : prev));
        if (groupMeshRef.current?.roomId === roomId) {
          groupMeshRef.current.syncParticipants(participants || []);
        }
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
        if (groupMeshRef.current?.roomId === roomId) {
          groupMeshRef.current.handleUserJoined(participant);
        }
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
        if (groupMeshRef.current?.roomId === roomId) {
          groupMeshRef.current.handleUserLeft(leftUserId);
        }
      },
    );

    const unsubGroupSignal = socketService.on(
      "group-call:signal",
      async ({ roomId, fromUserId, signal }) => {
        if (groupMeshRef.current?.roomId === roomId) {
          await groupMeshRef.current.handleSignal(fromUserId, signal);
        }
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

    // 7. Spaces Updates + WebRTC Speaker Mesh Audio Pipeline
    const syncSpaceMediaAdapter = async (space, explicitRole = null, mediaToken = null) => {
      if (!space || !currentUser?._id) return;
      const myId = (currentUser._id || currentUser.id).toString();
      const spkEntry = space.speakers?.find((s) => (s.user?._id || s.user?.id)?.toString() === myId);
      const role = explicitRole || (space.hostId === myId || space.host?._id?.toString() === myId ? "HOST" : spkEntry?.role || "LISTENER");

      if (!spacesAdapterRef.current || spacesAdapterRef.current.spaceId !== space.id) {
        spacesAdapterRef.current?.disconnect?.();
        const adapter = createSpacesMediaAdapter(mediaToken);
        spacesAdapterRef.current = adapter;
        const iceConfig = await fetchIceServers(api).catch(() => null);
        await adapter.connect(
          {
            spaceId: space.id,
            userId: myId,
            role,
            socketService,
            iceServers: iceConfig,
            selectedAudioOutput,
            url: mediaToken?.url,
            token: mediaToken?.token,
            canPublish: mediaToken?.canPublish ?? (role !== "LISTENER"),
          },
          localStreamRef.current,
          {
            onAutoplayBlocked: () => setAutoplayBlocked(true),
          },
        );
      } else if (explicitRole && spacesAdapterRef.current.role !== explicitRole) {
        await spacesAdapterRef.current.updateRole(explicitRole, mediaToken);
      }
      spacesAdapterRef.current?.syncParticipants?.(space);
    };

    const unsubSpacesUpdated = socketService.on(
      "spaces:updated",
      ({ spaces }) => {
        setSpacesList(spaces || []);
      },
    );

    const unsubSpaceJoined = socketService.on(
      "spaces:joined",
      async ({ space, participant, mediaToken }) => {
        if (!space) return;
        setActiveSpace(space);
        await syncSpaceMediaAdapter(space, participant?.role, mediaToken);
      },
    );

    const unsubSpaceState = socketService.on(
      "space:state_change",
      ({ space }) => {
        if (!space) return;
        setActiveSpace((prev) => (prev && prev.id === space.id ? space : prev));
        if (activeSpaceRef.current?.id === space.id) {
          syncSpaceMediaAdapter(space);
        }
      },
    );

    const unsubSpaceEnded = socketService.on("space:ended", ({ spaceId }) => {
      setActiveSpace((prev) => {
        if (prev && prev.id === spaceId) {
          spacesAdapterRef.current?.disconnect?.();
          spacesAdapterRef.current = null;
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

    const unsubSpeakerPromoted = socketService.on("spaces:speaker_promoted", async () => {
      setIsSpaceMuted(true);
      await spacesAdapterRef.current?.updateRole?.("SPEAKER");
      if (activeSpaceRef.current) {
        spacesAdapterRef.current?.syncParticipants?.(activeSpaceRef.current);
      }
      showToast("You have been promoted to Speaker! Tap Unmute to speak.", "success");
    });

    const unsubSpeakRejected = socketService.on("spaces:speak_rejected", () => {
      setIsHandRaised(false);
      showToast("Your speak request was declined by a moderator.", "info");
    });

    const unsubForceMuted = socketService.on("spaces:force_muted", () => {
      setIsSpaceMuted(true);
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      spacesAdapterRef.current?.setMicrophoneMuted?.(true);
      showToast("You have been muted by a moderator.", "info");
    });

    const unsubDemoted = socketService.on("spaces:demoted", async () => {
      setIsSpaceMuted(true);
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      await spacesAdapterRef.current?.updateRole?.("LISTENER");
      showToast("You have been demoted back to Listeners.", "info");
    });

    const unsubKicked = socketService.on("spaces:kicked", () => {
      spacesAdapterRef.current?.disconnect?.();
      spacesAdapterRef.current = null;
      setActiveSpace(null);
      setIsSpacesModalOpen(false);
      setIsSpaceMuted(true);
      showToast("You were removed from this Space by a moderator.", "error");
    });

    const unsubHostDisconnected = socketService.on("space:host_disconnected", ({ graceRemainingSeconds }) => {
      showToast(`Host disconnected. Co-hosts active; room grace: ${graceRemainingSeconds || 180}s`, "warning");
    });

    const unsubHostReconnected = socketService.on("space:host_reconnected", () => {
      showToast("Room Host has reconnected!", "success");
    });

    const unsubHostTransferred = socketService.on("space:host_transferred", () => {
      showToast("Room host privileges transferred.", "info");
    });

    return () => {
      unsubIncoming();
      unsubInitiated();
      unsubRinging();
      unsubAccepted();
      unsubSignal();
      unsubRejected();
      unsubOffline();
      unsubEnded();
      unsubAnsweredElsewhere();
      unsubBusy();
      unsubCancelled();
      unsubMissed();
      unsubGroupIncoming();
      unsubGroupExisting();
      unsubGroupJoined();
      unsubGroupLeft();
      unsubGroupSignal();
      unsubGroupSpeaking();
      unsubGroupMute();
      unsubSpacesUpdated();
      unsubSpaceJoined();
      unsubSpaceState();
      unsubSpaceEnded();
      unsubSpeaking();
      unsubReaction();
      unsubSpeakerPromoted?.();
      unsubSpeakRejected?.();
      unsubForceMuted?.();
      unsubDemoted?.();
      unsubKicked?.();
      unsubHostDisconnected?.();
      unsubHostReconnected?.();
      unsubHostTransferred?.();
    };
  }, [
    currentUser,
    cleanupCallResources,
    refreshSpaces,
    showToast,
    startTimer,
    startHeartbeat,
    selectedAudioInput,
    selectedAudioOutput,
  ]);

  // ==========================================
  // 1-ON-1 CALL ACTIONS
  // ==========================================

  const startCall = useCallback(
    async (targetUser) => {
      const targetId = targetUser?._id || targetUser?.id;
      if (!targetUser || !targetId) {
        showToast("Invalid user profile for calling", "error");
        return;
      }

      const myId = (currentUser?._id || currentUser?.id)?.toString();
      if (targetId.toString() === myId) {
        showToast("You cannot call yourself", "info");
        return;
      }

      const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const callerInfo = {
        _id: myId,
        name: currentUser?.name || 'Classmate',
        username: currentUser?.username || 'user',
        avatarUrl: currentUser?.avatarUrl,
      };

      sounds.unlock();
      if (remoteAudioElemRef.current) {
        remoteAudioElemRef.current.play().catch(() => {});
      }

      try {
        let stream = localStreamRef.current;
        const hasLiveTracks = stream && stream.getAudioTracks().some((t) => t.readyState === "live");
        if (!hasLiveTracks) {
          stream = await getLocalAudioStream(selectedAudioInput || null);
          localStreamRef.current = stream;
          setLocalAudioStream(stream);
        }
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
      } catch (err) {
        console.warn("Microphone access error:", err);
        showToast("Microphone access required: please allow microphone permission in your browser", "error");
        return;
      }

      setActiveCall({
        callId,
        otherUser: targetUser,
        isOutgoing: true,
        callType: "audio",
        status: "calling",
      });
      setCallState("calling");
      sounds.startOutgoingRing();

      socketService.initiateCall({
        callId,
        targetUserId: targetId,
        callerInfo,
        callType: "audio",
      });
    },
    [currentUser, selectedAudioInput, showToast],
  );

  const acceptCall = useCallback(async () => {
    if (!activeCall) return;
    sounds.stopRingtone();
    sounds.unlock();
    sounds.playConnectedTone();

    if (remoteAudioElemRef.current) {
      remoteAudioElemRef.current.play().catch(() => {});
    }

    try {
      let stream = localStreamRef.current;
      const hasLiveTracks = stream && stream.getAudioTracks().some((t) => t.readyState === "live");
      if (!hasLiveTracks) {
        stream = await getLocalAudioStream(selectedAudioInput || null);
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      }
      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    } catch (err) {
      console.warn("Microphone access error on accept:", err);
      showToast("Cannot access microphone to answer call: please check permissions", "error");
      return;
    }

    setCallState("connected");
    setActiveCall((prev) => (prev ? { ...prev, status: "connected" } : prev));
    startTimer();
    startHeartbeat(activeCall.callId);

    const targetId = activeCall.otherUser?._id || activeCall.otherUser?.id;
    if (targetId) {
      socketService.acceptCall({
        callId: activeCall.callId,
        targetUserId: targetId,
      });
    }
  }, [activeCall, selectedAudioInput, startTimer, startHeartbeat, showToast]);

  const rejectCall = useCallback(() => {
    if (!activeCall) return;
    sounds.playEndTone();
    const targetId = activeCall.otherUser?._id || activeCall.otherUser?.id;
    if (targetId) {
      socketService.rejectCall({
        callId: activeCall.callId,
        targetUserId: targetId,
        reason: "declined",
      });
    }
    cleanupCallResources();
  }, [activeCall, cleanupCallResources]);

  const endCall = useCallback(() => {
    if (!activeCall) return;
    sounds.playEndTone();
    const targetId = activeCall.otherUser?._id || activeCall.otherUser?.id;
    if (targetId) {
      if (callState === "calling") {
        socketService.cancelCall({
          callId: activeCall.callId,
          targetUserId: targetId,
          reason: "cancelled",
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

      let stream = null;
      try {
        stream = await getLocalAudioStream(selectedAudioInput || null);
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
      } catch (err) {
        showToast("Microphone unavailable: joining Group Call in listen-only mode", "info");
      }

      const iceConfig = await fetchIceServers(api).catch(() => null);
      groupMeshRef.current.connect({
        roomId,
        userId: currentUser?._id || currentUser?.id,
        socketService,
        iceServers: iceConfig,
        localStream: stream,
        selectedAudioOutput,
        callbacks: {
          onAutoplayBlocked: () => setAutoplayBlocked(true),
        },
      });

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
    [currentUser, selectedAudioInput, selectedAudioOutput, startGroupTimer, showToast],
  );

  const acceptGroupCall = useCallback(async () => {
    if (!incomingGroupCall) return;
    sounds.stopRingtone();
    sounds.playConnectedTone();

    let stream = null;
    try {
      stream = await getLocalAudioStream(selectedAudioInput || null);
      localStreamRef.current = stream;
      setLocalAudioStream(stream);
    } catch {
      showToast("Microphone unavailable: joining Group Call in listen-only mode", "info");
    }

    const iceConfig = await fetchIceServers(api).catch(() => null);
    groupMeshRef.current.connect({
      roomId: incomingGroupCall.roomId,
      userId: currentUser?._id || currentUser?.id,
      socketService,
      iceServers: iceConfig,
      localStream: stream,
      selectedAudioOutput,
      callbacks: {
        onAutoplayBlocked: () => setAutoplayBlocked(true),
      },
    });

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
  }, [incomingGroupCall, currentUser, selectedAudioInput, selectedAudioOutput, startGroupTimer, showToast]);

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
        setAutoplayBlocked(false);
        if (spacesAdapterRef.current) {
          spacesAdapterRef.current.disconnect();
          spacesAdapterRef.current = null;
        }

        const stream = await getLocalAudioStream(selectedAudioInput || null).catch(() => null);
        if (stream) {
          localStreamRef.current = stream;
          setLocalAudioStream(stream);
        } else {
          showToast("Microphone unavailable: launched Space muted.", "info");
        }

        const res = await api.post("/spaces", { title, topic });
        const space = res.data.space;
        const spaceId = space?.id || space?.roomId || space?._id;
        setActiveSpace(space);
        setIsSpacesModalOpen(true);
        setIsSpaceMuted(!stream);

        if (spaceId) {
          socketService.joinSpace({
            spaceId,
            user: currentUser,
          });
        }

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
    [currentUser, selectedAudioInput, showToast, refreshSpaces],
  );

  const joinSpace = useCallback(
    (space) => {
      if (!space) return;
      const spaceId = space.id || space.roomId || space._id;
      if (!spaceId) return;

      setAutoplayBlocked(false);
      if (spacesAdapterRef.current && spacesAdapterRef.current.spaceId !== spaceId) {
        spacesAdapterRef.current.disconnect();
        spacesAdapterRef.current = null;
      }

      setActiveSpace(space);
      setIsSpacesModalOpen(true);
      setIsSpaceMuted(true);

      socketService.joinSpace({
        spaceId,
        user: currentUser,
      });
    },
    [currentUser],
  );

  const leaveSpace = useCallback(() => {
    if (!activeSpace) return;
    socketService.leaveSpace({ spaceId: activeSpace.id });
    spacesAdapterRef.current?.disconnect?.();
    spacesAdapterRef.current = null;
    if (localStreamRef.current && callStateRef.current === "idle" && groupCallStateRef.current === "idle") {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalAudioStream(null);
    }
    setActiveSpace(null);
    setIsSpacesModalOpen(false);
    setIsHandRaised(false);
    setIsSpaceMuted(false);
    setAutoplayBlocked(false);
    showToast("Left Audio Space", "info");
  }, [activeSpace, showToast]);

  const toggleSpaceMute = useCallback(async () => {
    if (!activeSpace) return;
    const nextState = !isSpaceMuted;

    if (!nextState && !localStreamRef.current) {
      try {
        const stream = await getLocalAudioStream(selectedAudioInput || null);
        localStreamRef.current = stream;
        setLocalAudioStream(stream);
        spacesAdapterRef.current?.setLocalStream?.(stream);
      } catch {
        showToast("Microphone access required to speak", "error");
        return;
      }
    }

    setIsSpaceMuted(nextState);
    if (spacesAdapterRef.current) {
      await spacesAdapterRef.current.setMicrophoneMuted(nextState);
    } else {
      socketService.toggleSpaceMute({
        spaceId: activeSpace.id,
        isMuted: nextState,
      });
    }
  }, [activeSpace, isSpaceMuted, selectedAudioInput, showToast]);

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

  const approveSpeak = useCallback(
    (targetUserId) => {
      if (!activeSpace) return;
      socketService.emit("spaces:approve_speak", {
        spaceId: activeSpace.id,
        targetUserId,
      });
      showToast("Speaker approved", "success");
    },
    [activeSpace, showToast],
  );

  const rejectSpeak = useCallback(
    (targetUserId) => {
      if (!activeSpace) return;
      socketService.emit("spaces:reject_speak", {
        spaceId: activeSpace.id,
        targetUserId,
      });
      showToast("Speaker request declined", "info");
    },
    [activeSpace, showToast],
  );

  const forceMuteSpeaker = useCallback(
    (targetUserId) => {
      if (!activeSpace) return;
      socketService.emit("spaces:force_mute", {
        spaceId: activeSpace.id,
        targetUserId,
      });
      showToast("Force-muted participant", "info");
    },
    [activeSpace, showToast],
  );

  const demoteToListener = useCallback(
    (targetUserId) => {
      if (!activeSpace) return;
      socketService.emit("spaces:demote_to_listener", {
        spaceId: activeSpace.id,
        targetUserId,
      });
      showToast("Demoted participant to listener", "info");
    },
    [activeSpace, showToast],
  );

  const promoteCoHost = useCallback(
    (targetUserId) => {
      if (!activeSpace) return;
      socketService.emit("spaces:promote_cohost", {
        spaceId: activeSpace.id,
        targetUserId,
      });
      showToast("Promoted participant to Co-Host", "success");
    },
    [activeSpace, showToast],
  );

  const transferHost = useCallback(
    (newHostId) => {
      if (!activeSpace) return;
      socketService.emit("spaces:transfer_host", {
        spaceId: activeSpace.id,
        newHostId,
      });
      showToast("Transferred room ownership", "info");
    },
    [activeSpace, showToast],
  );

  const kickParticipant = useCallback(
    (targetUserId) => {
      if (!activeSpace) return;
      socketService.emit("spaces:kick_participant", {
        spaceId: activeSpace.id,
        targetUserId,
      });
      showToast("Removed participant from space", "info");
    },
    [activeSpace, showToast],
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

  const isHost =
    activeSpace?.host?._id === currentUser?._id ||
    activeSpace?.hostId === currentUser?._id;

  const isCoHost = Boolean(
    activeSpace?.speakers?.some(
      (s) =>
        s.user?._id === currentUser?._id &&
        (s.role === "CO_HOST" || s.role === "co-host"),
    ),
  );

  const isModerator =
    isHost ||
    isCoHost ||
    Boolean(
      activeSpace?.speakers?.some(
        (s) =>
          s.user?._id === currentUser?._id &&
          (s.role === "MODERATOR" || s.role === "moderator"),
      ),
    );

  const isSpeaker =
    isHost ||
    isCoHost ||
    isModerator ||
    Boolean(
      activeSpace?.speakers &&
        activeSpace.speakers.some((s) => s.user?._id === currentUser?._id),
    );

  return (
    <CallContext.Provider
      value={{
        // 1-on-1 Call
        callState,
        activeCall,
        callConnectionState,
        iceCandidateType,
        autoplayBlocked,
        unlockRemoteAudio,
        isMuted,
        callDuration,
        formatDuration,
        isMinimized,
        localAudioStream,
        audioInputDevices,
        audioOutputDevices,
        selectedAudioInput,
        selectedAudioOutput,
        changeAudioInput,
        changeAudioOutput,
        refreshAudioDevices,
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
        isCoHost,
        isModerator,
        isSpeaker,
        refreshSpaces,
        createSpace,
        joinSpace,
        leaveSpace,
        toggleSpaceMute,
        raiseHand,
        setParticipantRole,
        approveSpeak,
        rejectSpeak,
        forceMuteSpeaker,
        demoteToListener,
        promoteCoHost,
        transferHost,
        kickParticipant,
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
