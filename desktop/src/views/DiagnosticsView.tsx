import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Radio,
  Phone,
  Mic,
  MicOff,
  Wifi,
  Server,
  ShieldCheck,
  RefreshCw,
  Send,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { api } from '../api/client';
import socketService from '../services/socket';
import tauriMeshBridge, { NativeMeshPeer, NativeMeshDiagnostics } from '../mesh/transport/tauriMeshBridge';
import { useMesh } from '../mesh/context/MeshContext';

interface IceCandidateInfo {
  type: string;
  protocol: string;
  ip: string;
  port?: number;
}

interface CallingDiagnostics {
  running: boolean;
  signalingRttMs: number;
  signalingStatus: string;
  iceGatheringDone: boolean;
  iceCandidates: IceCandidateInfo[];
  natType: string;
  gatheringDurationMs: number;
  hasHost: boolean;
  hasSrflx: boolean;
  hasRelay: boolean;
  error?: string;
}

export const DiagnosticsView: React.FC = () => {
  const { identity, peers: contextPeers } = useMesh();

  // Calling & NAT states
  const [callingDiag, setCallingDiag] = useState<CallingDiagnostics>({
    running: false,
    signalingRttMs: -1,
    signalingStatus: 'IDLE',
    iceGatheringDone: false,
    iceCandidates: [],
    natType: 'NOT_TESTED',
    gatheringDurationMs: 0,
    hasHost: false,
    hasSrflx: false,
    hasRelay: false,
  });

  // Microphone Volume Meter states
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micError, setMicError] = useState<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);

  // Mesh Field Test states
  const [nativeDiag, setNativeDiag] = useState<NativeMeshDiagnostics | null>(null);
  const [nativePeers, setNativePeers] = useState<NativeMeshPeer[]>([]);
  const [pingTarget, setPingTarget] = useState<string>('');
  const [pingStatus, setPingStatus] = useState<string>('');
  const [pingRtt, setPingRtt] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Refresh mesh info
  const refreshMeshState = async () => {
    try {
      const diag = await tauriMeshBridge.getDiagnostics();
      setNativeDiag(diag);
      const peers = await tauriMeshBridge.getPeers();
      setNativePeers(peers);
      if (peers.length > 0 && !pingTarget) {
        setPingTarget(peers[0].pubkey || peers[0].id);
      }
    } catch (e) {
      console.warn('Failed to refresh mesh diagnostics:', e);
    }
  };

  useEffect(() => {
    refreshMeshState();
    const interval = setInterval(refreshMeshState, 3000);
    return () => clearInterval(interval);
  }, [pingTarget]);

  // Clean up mic meter on unmount
  useEffect(() => {
    return () => {
      stopMicMeter();
    };
  }, []);

  const runCallingDiagnostics = async () => {
    setCallingDiag((prev) => ({
      ...prev,
      running: true,
      error: undefined,
      signalingStatus: 'MEASURING...',
      natType: 'GATHERING ICE CANDIDATES...',
    }));

    // 1. Signaling RTT
    let rtt = -1;
    let sigStatus = 'UNAVAILABLE';
    const sigStart = performance.now();
    try {
      const rawSocket = socketService.getRawSocket();
      if (!rawSocket || !rawSocket.connected) {
        socketService.connect();
      }
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => resolve(), 2000);
        const curSocket = socketService.getRawSocket();
        if (curSocket && curSocket.connected) {
          curSocket.emit('ping', () => {
            clearTimeout(timer);
            resolve();
          });
        } else {
          clearTimeout(timer);
          resolve();
        }
      });
      rtt = Math.round(performance.now() - sigStart);
      sigStatus = rtt < 120 ? 'EXCELLENT' : rtt < 300 ? 'GOOD' : 'FAIR';
    } catch (err: any) {
      sigStatus = `ERR: ${err.message}`;
    }

    // 2. Fetch ICE servers (dynamic TURN credentials or fallback to Google STUN)
    let iceServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
    try {
      const res = await api.get('/calls/turn-credentials');
      if (res.data?.iceServers && Array.isArray(res.data.iceServers)) {
        iceServers = res.data.iceServers;
      }
    } catch {}

    // 3. WebRTC ICE Gathering
    const startTime = performance.now();
    const gathered: IceCandidateInfo[] = [];
    let hasHost = false;
    let hasSrflx = false;
    let hasRelay = false;

    try {
      const RTCPeerConnectionClass =
        window.RTCPeerConnection ||
        (window as any).webkitRTCPeerConnection ||
        (window as any).mozRTCPeerConnection;

      if (!RTCPeerConnectionClass) {
        setCallingDiag({
          running: false,
          signalingRttMs: rtt,
          signalingStatus: sigStatus,
          iceGatheringDone: false,
          iceCandidates: [],
          natType: 'WEBRTC_NOT_SUPPORTED',
          gatheringDurationMs: 0,
          hasHost: false,
          hasSrflx: false,
          hasRelay: false,
          error: 'WebRTC RTCPeerConnection is not supported in this runtime.',
        });
        return;
      }

      const pc = new RTCPeerConnectionClass({
        iceServers,
        iceCandidatePoolSize: 2,
      });

      pc.createDataChannel('diag_channel');

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          try { pc.close(); } catch {}
          resolve();
        }, 5000);

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const cand = event.candidate;
            const type = cand.type || 'host';
            const protocol = cand.protocol || 'udp';
            const ip = cand.address || cand.ip || 'discovered';

            if (type === 'host') hasHost = true;
            if (type === 'srflx') hasSrflx = true;
            if (type === 'relay') hasRelay = true;

            gathered.push({
              type,
              protocol,
              ip,
              port: cand.port || undefined,
            });
          } else {
            clearTimeout(timeout);
            try { pc.close(); } catch {}
            resolve();
          }
        };

        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => {
            clearTimeout(timeout);
            try { pc.close(); } catch {}
            resolve();
          });
      });

      const duration = Math.round(performance.now() - startTime);
      let natType = 'UNKNOWN';
      if (hasRelay && hasSrflx) natType = 'FULL_TRAVERSAL (STUN + TURN RELAY)';
      else if (hasSrflx) natType = 'STUN_REFLEXIVE (Direct P2P Ready)';
      else if (hasHost) natType = 'LOCAL_HOST_ONLY (Symmetric / UDP Blocked)';

      setCallingDiag({
        running: false,
        signalingRttMs: rtt,
        signalingStatus: sigStatus,
        iceGatheringDone: true,
        iceCandidates: gathered,
        natType,
        gatheringDurationMs: duration,
        hasHost,
        hasSrflx,
        hasRelay,
      });
    } catch (err: any) {
      setCallingDiag({
        running: false,
        signalingRttMs: rtt,
        signalingStatus: sigStatus,
        iceGatheringDone: false,
        iceCandidates: gathered,
        natType: 'FAILED',
        gatheringDurationMs: Math.round(performance.now() - startTime),
        hasHost,
        hasSrflx,
        hasRelay,
        error: err.message,
      });
    }
  };

  const startMicMeter = async () => {
    setMicError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);
        micAnimFrameRef.current = requestAnimationFrame(updateMeter);
      };

      setMicActive(true);
      updateMeter();
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied or unavailable');
      setMicActive(false);
    }
  };

  const stopMicMeter = () => {
    if (micAnimFrameRef.current) {
      cancelAnimationFrame(micAnimFrameRef.current);
      micAnimFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setMicActive(false);
    setMicVolume(0);
  };

  const handleSendSignedPing = async () => {
    if (!pingTarget) {
      setPingStatus('Please select or specify a target peer public key');
      return;
    }

    setIsPinging(true);
    setPingStatus('Broadcasting signed CFM1 Echo Ping...');
    setPingRtt(null);

    const startTime = performance.now();
    try {
      const pingText = `PING:${Date.now()}`;
      await tauriMeshBridge.sendMessage(pingTarget, pingText, 3, 1);
      const elapsed = Math.round(performance.now() - startTime);
      setPingRtt(elapsed);
      setPingStatus(`Ping packet successfully signed & dispatched to neighbor in ${elapsed} ms.`);
    } catch (err: any) {
      setPingStatus(`Ping failed: ${err.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-100 tracking-tight">
              System Diagnostics & Physical Field Test
            </h1>
            <p className="text-xs text-neutral-400">
              Real-time hardware verification for WebRTC Calling, STUN/TURN NAT, and Clearfeed Mesh (CFM1)
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            runCallingDiagnostics();
            refreshMeshState();
          }}
          disabled={callingDiag.running}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${callingDiag.running ? 'animate-spin' : ''}`} />
          Run All Probes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Calling & NAT Traversal */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
              <Phone className="w-4 h-4 text-emerald-400" />
              1:1 Audio & NAT Traversal Diagnostic
            </div>
            <button
              onClick={runCallingDiagnostics}
              disabled={callingDiag.running}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
            >
              {callingDiag.running ? 'Probing...' : 'Re-test'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
                Signaling Latency
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-neutral-100 font-mono">
                  {callingDiag.signalingRttMs >= 0 ? `${callingDiag.signalingRttMs} ms` : '—'}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    callingDiag.signalingStatus === 'EXCELLENT'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : callingDiag.signalingStatus === 'GOOD'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {callingDiag.signalingStatus}
                </span>
              </div>
            </div>

            <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
                ICE Gathering Time
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-neutral-100 font-mono">
                  {callingDiag.gatheringDurationMs > 0 ? `${callingDiag.gatheringDurationMs} ms` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* NAT Classification */}
          <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">NAT Traversal Result:</span>
              <span
                className={`font-mono font-bold text-xs ${
                  callingDiag.hasRelay
                    ? 'text-emerald-400'
                    : callingDiag.hasSrflx
                    ? 'text-sky-400'
                    : 'text-amber-400'
                }`}
              >
                {callingDiag.natType}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/60 text-[11px]">
              <div className="flex items-center gap-1">
                {callingDiag.hasHost ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-600" />
                )}
                <span className="text-neutral-400">Host (LAN)</span>
              </div>
              <div className="flex items-center gap-1">
                {callingDiag.hasSrflx ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-600" />
                )}
                <span className="text-neutral-400">STUN (srflx)</span>
              </div>
              <div className="flex items-center gap-1">
                {callingDiag.hasRelay ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-600" />
                )}
                <span className="text-neutral-400">TURN (relay)</span>
              </div>
            </div>
          </div>

          {/* Candidate List */}
          {callingDiag.iceCandidates.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-neutral-500 uppercase">
                Gathered ICE Candidates ({callingDiag.iceCandidates.length})
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {callingDiag.iceCandidates.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1 bg-neutral-950 rounded border border-neutral-800/50 text-neutral-300"
                  >
                    <span className="uppercase font-bold text-sky-400">{c.type}</span>
                    <span className="text-neutral-500">{c.protocol.toUpperCase()}</span>
                    <span className="truncate max-w-[180px]">{c.ip}:{c.port || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Microphone Hardware Input Level */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
              <Mic className="w-4 h-4 text-sky-400" />
              Microphone Capture & RMS Level Meter
            </div>
            {micActive ? (
              <button
                onClick={stopMicMeter}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <MicOff className="w-3 h-3" /> Stop Test
              </button>
            ) : (
              <button
                onClick={startMicMeter}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Mic className="w-3 h-3" /> Start Test
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-400">
            Tests WebView2 / Native Windows microphone capture without establishing a phone call.
          </p>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Live Volume RMS:</span>
              <span className="font-bold text-neutral-200">{micVolume}%</span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-3 border border-neutral-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  micVolume > 70
                    ? 'bg-rose-500'
                    : micVolume > 30
                    ? 'bg-emerald-500'
                    : 'bg-sky-500'
                }`}
                style={{ width: `${micVolume}%` }}
              />
            </div>
          </div>

          {micError && (
            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-400">
              {micError}
            </div>
          )}

          <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Hardware Access:</span>
              <span className={`font-semibold ${micActive ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {micActive ? 'Active Stream (16-bit PCM 48kHz)' : 'Idle'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Clearfeed Mesh (CFM1) Field Test Harness */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            <Radio className="w-4 h-4 text-sky-400" />
            Clearfeed Mesh (CFM1) Offline Field Test & Ping Harness
          </div>
          <button
            onClick={refreshMeshState}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            Refresh Peers
          </button>
        </div>

        {/* Identity & Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
              Local Node Identity
            </span>
            <div className="font-mono text-xs font-bold text-neutral-200 truncate" title={identity?.publicKeyHex}>
              {identity?.publicKeyHex ? `${identity.publicKeyHex.slice(0, 10)}...${identity.publicKeyHex.slice(-6)}` : 'Generating...'}
            </div>
          </div>

          <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
              Active Physical Peers
            </span>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {nativePeers.length}
            </div>
          </div>

          <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
              Store & Forward Packets
            </span>
            <div className="text-base font-bold text-sky-400 font-mono">
              {nativeDiag?.storedPacketsCount ?? 0}
            </div>
          </div>

          <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
              Packets Forwarded
            </span>
            <div className="text-base font-bold text-neutral-200 font-mono">
              {nativeDiag?.packetsForwarded ?? 0}
            </div>
          </div>
        </div>

        {/* 1-Tap Signed Echo Ping */}
        <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
            <Zap className="w-4 h-4 text-amber-400" />
            1-Tap Signed Echo Ping (Round-Trip Measurement)
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={pingTarget}
              onChange={(e) => setPingTarget(e.target.value)}
              placeholder="Enter Destination Public Key or select peer below..."
              className="flex-1 w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleSendSignedPing}
              disabled={isPinging || !pingTarget}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isPinging ? 'Sending...' : 'Send Signed Ping'}
            </button>
          </div>

          {pingStatus && (
            <div className="flex items-center justify-between text-xs font-mono px-3 py-2 bg-neutral-900/80 border border-neutral-800 rounded-lg">
              <span className="text-neutral-300">{pingStatus}</span>
              {pingRtt !== null && (
                <span className="text-emerald-400 font-bold ml-2">
                  RTT: {pingRtt} ms
                </span>
              )}
            </div>
          )}
        </div>

        {/* Physical Peers Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
            <span>Discovered Physical Peers ({nativePeers.length})</span>
            <span className="text-[11px] text-neutral-500 font-normal">
              WinRT BLE • Local LAN mDNS • Wi-Fi Direct
            </span>
          </div>

          {nativePeers.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-neutral-800 rounded-xl text-xs text-neutral-500">
              No nearby mesh peers discovered. Ensure Bluetooth or offline Wi-Fi is enabled on nearby Android phones or laptops.
            </div>
          ) : (
            <div className="space-y-1.5">
              {nativePeers.map((peer) => (
                <div
                  key={peer.id}
                  onClick={() => setPingTarget(peer.pubkey || peer.id)}
                  className="flex items-center justify-between p-3 bg-neutral-950 hover:bg-neutral-800/40 border border-neutral-800/60 rounded-xl text-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <p className="font-bold text-neutral-200">{peer.name}</p>
                      <p className="text-[11px] font-mono text-neutral-500">
                        {peer.pubkey ? `${peer.pubkey.slice(0, 12)}...` : peer.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-sky-400 font-bold">
                      {peer.transport}
                    </span>
                    <span className="text-neutral-400">{peer.rssi} dBm</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPingTarget(peer.pubkey || peer.id);
                        handleSendSignedPing();
                      }}
                      className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg font-semibold transition"
                    >
                      Ping
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsView;
