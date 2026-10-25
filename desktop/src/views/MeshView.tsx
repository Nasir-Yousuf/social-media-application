import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  ShieldCheck,
  Key,
  Users,
  Send,
  MessageSquare,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Lock,
  Layers,
  BookOpen,
  HelpCircle,
  Info,
  QrCode,
  Sparkles,
  Wifi,
  Zap,
  X,
  Megaphone,
} from 'lucide-react';
import { useMesh } from '../mesh/context/MeshContext';
import meshStorage, { MeshPeer, MeshConversation, MeshMessage } from '../mesh/storage/meshStorage';
import meshRouter, { BROADCAST_PUBKEY } from '../mesh/routing/meshRouter';
import { MeshGuideModal } from '../components/mesh/MeshGuideModal';
import { MeshPairingModal } from '../components/mesh/MeshPairingModal';

export const MeshView: React.FC = () => {
  const {
    identity,
    transportState,
    transportExplanation,
    peers,
    conversations,
    settings,
    updateNickname,
    resetIdentity,
    updateSettings,
    sendMessage,
    loadMessages,
    addPeer,
    broadcastBeacon,
    clearAllData,
    refreshMeshState,
  } = useMesh();

  const [activePeer, setActivePeer] = useState<MeshPeer | null>(null);
  const [activeConv, setActiveConv] = useState<MeshConversation | null>(null);
  const [messages, setMessages] = useState<MeshMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isEditingNick, setIsEditingNick] = useState<boolean>(false);
  const [newNick, setNewNick] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chats' | 'peers' | 'identity'>('chats');

  const [showPairingModal, setShowPairingModal] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    senderPubkey: string;
    senderNickname: string;
    text: string;
  } | null>(null);

  const currentTargetPubkey = (activeConv?.peerPubkey || activePeer?.publicKeyHex || '').toLowerCase();
  const isBroadcast = currentTargetPubkey === BROADCAST_PUBKEY.toLowerCase();

  const activeTargetRef = useRef<string>('');
  activeTargetRef.current = currentTargetPubkey;

  // Subscribe to real-time incoming mesh packets
  useEffect(() => {
    const unsub = meshRouter.onMessageReceived(async (msg) => {
      // 1. If currently viewing this conversation, dynamically append to messages list
      const activePubkey = activeTargetRef.current;
      const isViewingBroadcast = activePubkey === BROADCAST_PUBKEY.toLowerCase();
      const isMsgBroadcast = msg.recipientPubkey.toLowerCase() === BROADCAST_PUBKEY.toLowerCase();

      if (
        (isViewingBroadcast && isMsgBroadcast) ||
        (!isMsgBroadcast && activePubkey && msg.senderPubkey.toLowerCase() === activePubkey)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // 2. If it is an incoming message, trigger notification banner with 1-click jump to chat
      if (!msg.isOutgoing) {
        setNotification({
          senderPubkey: isMsgBroadcast ? BROADCAST_PUBKEY : msg.senderPubkey,
          senderNickname: isMsgBroadcast
            ? `📢 ${msg.senderNickname || 'Someone nearby'}`
            : (msg.senderNickname || `Peer_${msg.senderPubkey.substring(0, 6)}`),
          text: msg.text,
        });
      }
    });

    return () => unsub();
  }, []);

  // Immediate presence broadcast when opening Mesh (run exactly once on initial mount)
  const hasBroadcastedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!hasBroadcastedRef.current) {
      hasBroadcastedRef.current = true;
      broadcastBeacon();
    }
  }, []);

  const openChatWith = async (pubkey: string, nickname: string) => {
    setActiveTab('chats');
    const convs = await meshStorage.loadConversations();
    const existing = convs.find((c) => c.peerPubkey.toLowerCase() === pubkey.toLowerCase());
    if (existing) {
      await selectConversation(existing);
    } else {
      await selectPeer({
        publicKeyHex: pubkey,
        nickname,
        status: 'discovered',
        lastSeen: Date.now(),
        hopDistance: 0,
      });
    }
    setNotification(null);
  };

  const handlePairConnect = async (peer: MeshPeer) => {
    await addPeer(peer);
    selectPeer(peer);
    setActiveTab('chats');
  };

  const handleManualPing = async () => {
    setIsPinging(true);
    await broadcastBeacon();
    setTimeout(() => setIsPinging(false), 1200);
  };

  const selectConversation = async (conv: MeshConversation) => {
    setActiveConv(conv);
    setActivePeer(null);
    const msgs = await loadMessages(conv.peerPubkey);
    setMessages(msgs);
  };

  const selectPeer = async (peer: MeshPeer) => {
    setActivePeer(peer);
    setActiveConv(null);
    const msgs = await loadMessages(peer.publicKeyHex);
    setMessages(msgs);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const targetPubkey = activeConv?.peerPubkey || activePeer?.publicKeyHex;
    const targetNick = activeConv?.nickname || activePeer?.nickname || 'Nearby Peer';
    if (!targetPubkey) return;

    setSending(true);
    try {
      const msg = await sendMessage({
        recipientPubkey: targetPubkey,
        recipientNickname: targetNick,
        text: inputText.trim(),
      });
      setMessages((prev) => [...prev, msg]);
      setInputText('');
    } catch (err: any) {
      alert(`Mesh send error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const copyPublicKey = () => {
    if (!identity) return;
    navigator.clipboard.writeText(identity.publicKeyHex);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveNickname = async () => {
    if (newNick.trim()) {
      await updateNickname(newNick.trim());
      setIsEditingNick(false);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-neutral-800/80 bg-neutral-900/40 flex flex-col shrink-0">
        {/* Header with Tagline */}
        <div className="p-4 border-b border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Radio className="w-4 h-4 animate-pulse" />
              Clearfeed Mesh
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowGuide(true)}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Offline Mesh User Guide (English & বাংলা)"
              >
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>Guide</span>
              </button>
              <button
                onClick={() => refreshMeshState()}
                className="p-1 text-neutral-400 hover:text-emerald-400 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                title="Refresh local mesh state"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Connect & Scan Action Banner */}
          <button
            onClick={() => setShowPairingModal(true)}
            className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-[0.99]"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan & Connect Nearby | কুইক পেয়ার</span>
          </button>

          <div className="flex flex-col">
            <p className="text-[11px] font-semibold text-emerald-300">
              Connect nearby. Communicate offline.
            </p>
            <p className="text-[10px] text-neutral-400">
              কাছাকাছি সংযুক্ত হোন। ইন্টারনেট ছাড়াই যোগাযোগ করুন।
            </p>
          </div>

          {/* Subsystem Status Badge */}
          <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 font-medium">Transport Radio</span>
              <span className="font-mono text-emerald-400 font-bold">{transportState}</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight">
              {transportExplanation}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-neutral-950/80 p-1 border border-neutral-800">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'chats'
                  ? 'bg-emerald-500 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Chats ({conversations.length})
            </button>
            <button
              onClick={() => setActiveTab('peers')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'peers'
                  ? 'bg-emerald-500 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Peers ({peers.length})
            </button>
            <button
              onClick={() => setActiveTab('identity')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'identity'
                  ? 'bg-emerald-500 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Identity
            </button>
          </div>
        </div>

        {/* Tab 1: Chats */}
        {activeTab === 'chats' && (
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
            {/* PINNED RANGE-WIDE PUBLIC BROADCAST CHANNEL */}
            <div
              onClick={() => openChatWith(BROADCAST_PUBKEY, '📢 Public Broadcast (Everyone Nearby)')}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition select-none ${
                isBroadcast
                  ? 'bg-amber-500/15 border-l-2 border-amber-400'
                  : 'hover:bg-neutral-800/60 bg-amber-500/5'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold text-amber-300 truncate">
                    Nearby Public Broadcast
                  </p>
                  <span className="text-[9px] bg-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded font-black tracking-wide">
                    EVERYONE
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate">
                  Broadcast to all devices in range • সবাইকে বার্তা
                </p>
              </div>
            </div>

            {/* DIRECT 1-ON-1 CHATS */}
            {conversations.filter(c => c.peerPubkey.toLowerCase() !== BROADCAST_PUBKEY.toLowerCase()).length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-neutral-700" />
                <p>No direct 1-on-1 offline chats yet.</p>
                <p className="text-[10px] text-neutral-400">
                  Select a peer in the Peers tab or use the Public Broadcast above.
                </p>
              </div>
            ) : (
              conversations
                .filter(c => c.peerPubkey.toLowerCase() !== BROADCAST_PUBKEY.toLowerCase())
                .map((conv) => {
                  const isActive = activeConv?.peerPubkey === conv.peerPubkey;
                  return (
                    <div
                      key={conv.peerPubkey}
                      onClick={() => selectConversation(conv)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition select-none ${
                        isActive
                          ? 'bg-emerald-500/10 border-l-2 border-emerald-400'
                          : 'hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {conv.nickname?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold text-neutral-200 truncate">
                            {conv.nickname}
                          </p>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {new Date(conv.lastTimestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate">
                          {conv.lastMessageSnippet}
                        </p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Tab 2: Peers */}
        {activeTab === 'peers' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Auto-Discovery Radar Banner */}
            <div className="p-3 bg-neutral-950/80 border border-emerald-500/30 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 items-center justify-center">
                      <Radio className="w-2 h-2 text-white" />
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                      Nearby Peer Radar
                    </h4>
                    <p className="text-[10px] text-neutral-400">
                      Auto-beaconing Wi-Fi & local radio
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleManualPing}
                  disabled={isPinging}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border border-neutral-700 disabled:opacity-60"
                  title="Broadcast beacon ping to wake up nearby devices"
                >
                  <Zap className={`w-3 h-3 text-amber-400 ${isPinging ? 'animate-bounce' : ''}`} />
                  <span>{isPinging ? 'Pinging...' : 'Ping Nearby'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
                <button
                  onClick={() => setShowPairingModal(true)}
                  className="flex-1 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan / Pair QR</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Discovered Peers ({peers.length})
              </span>
              <button
                onClick={() => setShowPairingModal(true)}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                + Pair Key
              </button>
            </div>

            {peers.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 space-y-3 bg-neutral-950/40 border border-neutral-800/60 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Wifi className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-neutral-300">Searching for nearby devices...</p>
                  <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                    Keep Clearfeed Mesh open on both devices. Alternatively, tap below to scan with camera or show your QR code.
                  </p>
                </div>
                <button
                  onClick={() => setShowPairingModal(true)}
                  className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Instant QR Pairing</span>
                </button>
              </div>
            ) : (
              peers.map((peer) => {
                const fingerprint = peer.publicKeyHex.slice(0, 8).toUpperCase();
                return (
                  <div
                    key={peer.publicKeyHex}
                    onClick={() => {
                      selectPeer(peer);
                      setActiveTab('chats');
                    }}
                    className="p-3.5 bg-neutral-950/70 border border-neutral-800/90 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition space-y-2 group shadow-sm hover:shadow-emerald-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                            {peer.nickname?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-neutral-950 rounded-full" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-neutral-100 group-hover:text-emerald-300 transition">
                            {peer.nickname}
                          </span>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            ID: {fingerprint}... • {peer.hopDistance ? `${peer.hopDistance} hops` : 'Direct Link'}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-500/30">
                        Online
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[130px]">
                        {peer.publicKeyHex.slice(0, 16)}...
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectPeer(peer);
                          setActiveTab('chats');
                        }}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm shadow-emerald-500/20 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Local Identity */}
        {activeTab === 'identity' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-300">Mesh Nickname</span>
              {isEditingNick ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNick}
                    onChange={(e) => setNewNick(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-xs font-bold text-neutral-200">
                    {identity?.nickname || 'Peer'}
                  </span>
                  <button
                    onClick={() => {
                      setNewNick(identity?.nickname || '');
                      setIsEditingNick(true);
                    }}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Public Key Card */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Ed25519 Public Key (32 bytes)
              </span>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 font-mono text-[10px] text-neutral-400 break-all">
                <p>{identity?.publicKeyHex || 'Generating identity...'}</p>
                <button
                  onClick={copyPublicKey}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 rounded-lg font-sans text-xs font-medium transition cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey ? 'Copied Public Key' : 'Copy Key'}
                </button>
              </div>
            </div>

            {/* Mesh Controls */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="flex items-center justify-between text-xs text-neutral-300">
                <span>Multi-hop Relay Node</span>
                <input
                  type="checkbox"
                  checked={settings.relayEnabled}
                  onChange={(e) => updateSettings({ relayEnabled: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-neutral-300">
                <span>Power & Battery Saver</span>
                <input
                  type="checkbox"
                  checked={settings.batterySaving}
                  onChange={(e) => updateSettings({ batterySaving: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
              </label>

              <button
                onClick={resetIdentity}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Generate New Identity Keypair
              </button>

              <button
                onClick={clearAllData}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge All Offline Mesh Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Area (Notification Banner + Chat / Welcome View) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {notification && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2.5 flex items-center justify-between shadow-lg z-20 shrink-0">
            <div
              onClick={() => openChatWith(notification.senderPubkey, notification.senderNickname)}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-300">
                  {notification.senderNickname} sent you a message
                </p>
                <p className="text-[11px] text-emerald-200/80 truncate max-w-lg">
                  {notification.text}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openChatWith(notification.senderPubkey, notification.senderNickname)}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <span>Open Chat</span>
                <span>→</span>
              </button>
              <button
                onClick={() => setNotification(null)}
                className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-lg transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Conversation Panel */}
        {activeConv || activePeer ? (
          <div className="flex-1 flex flex-col h-full bg-neutral-950/40 min-w-0">
          {/* Header */}
          <div className="h-14 px-6 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full ${
                  isBroadcast
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400'
                } flex items-center justify-center font-bold text-xs`}
              >
                {isBroadcast ? (
                  <Megaphone className="w-4 h-4" />
                ) : (
                  (activeConv?.nickname || activePeer?.nickname)?.[0]?.toUpperCase() || 'P'
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                  {isBroadcast ? (
                    <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                      Nearby Public Broadcast (Everyone)
                    </span>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-emerald-400" />
                      {activeConv?.nickname || activePeer?.nickname}
                    </>
                  )}
                </h3>
                <p className="text-[10px] text-neutral-400 font-mono truncate max-w-sm">
                  {isBroadcast
                    ? '📢 Range-wide Channel • Reaches all devices in local range'
                    : (activeConv?.peerPubkey || activePeer?.publicKeyHex)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Safety Fingerprint or Broadcast Badge */}
              {isBroadcast ? (
                <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-lg flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Public Range Channel</span>
                </span>
              ) : (
                <button
                  onClick={() => setShowPairingModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-medium rounded-lg transition cursor-pointer"
                  title="Verify Ed25519 Safety Fingerprint"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {((activeConv?.peerPubkey || activePeer?.publicKeyHex) || '')
                      .slice(0, 8)
                      .toUpperCase()}{' '}
                    • Verified
                  </span>
                </button>
              )}

              {!isBroadcast && (
                <button
                  onClick={() => setShowPairingModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium rounded-lg transition cursor-pointer"
                  title="Open QR Pairing & Code"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QR Connect</span>
                </button>
              )}

              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium rounded-lg transition cursor-pointer"
                title="Open Offline Mesh Guide"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guide</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-neutral-500 space-y-2">
                {isBroadcast ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-neutral-200 text-sm">Nearby Public Broadcast Channel</p>
                    <p className="text-[11px] max-w-sm text-neutral-400">
                      Messages posted here are sent unencrypted so every nearby phone, tablet, and laptop within range can instantly see them without prior pairing.
                    </p>
                  </>
                ) : (
                  <>
                    <Lock className="w-8 h-8 text-neutral-700" />
                    <p className="font-semibold text-neutral-300">Direct Offline Conversation</p>
                    <p className="text-[11px] max-w-xs text-neutral-400">
                      Messages sent here are encrypted using ChaCha20-Poly1305 with keys derived through X25519 Diffie-Hellman and relayed offline.
                    </p>
                  </>
                )}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isOutgoing ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.isOutgoing
                        ? isBroadcast
                          ? 'bg-amber-600 text-white rounded-br-xs'
                          : 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-neutral-800 text-neutral-100 rounded-bl-xs'
                    }`}
                  >
                    {!msg.isOutgoing && isBroadcast && (
                      <p className="text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                        <span>📢</span>
                        <span>{msg.senderNickname || 'Nearby User'}</span>
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        msg.isOutgoing ? 'text-white/80' : 'text-neutral-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.isOutgoing && (
                        <span>
                          {msg.deliveryState === 'delivered' ? '✓ Delivered' : '••• Queued'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isBroadcast
                  ? '📢 Broadcast a message to everyone in range • সবাইকে বার্তা পাঠান...'
                  : 'Send offline encrypted message...'
              }
              className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className={`p-2.5 ${
                isBroadcast
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              } disabled:opacity-50 rounded-xl transition cursor-pointer`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-xl mx-auto overflow-y-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">Clearfeed Mesh Workspace</h3>
            <p className="text-xs sm:text-sm font-semibold text-emerald-400">
              Connect nearby. Communicate offline.
            </p>
            <p className="text-xs text-neutral-300">
              কাছাকাছি সংযুক্ত হোন। ইন্টারনেট ছাড়াই যোগাযোগ করুন।
            </p>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>How to Use Offline Messaging / নির্দেশিকা (EN & বাংলা)</span>
          </button>

          {/* 3 Quick Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left w-full pt-1">
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">১. পরিচয় (Identity)</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Set a nickname in Identity tab. Your 32-byte Ed25519 keypair is kept on your device.
              </p>
            </div>
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">২. সঙ্গী খুঁজুন (Peers)</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Discover nearby peers over local wireless or click + Add Peer Key to paste public key.
              </p>
            </div>
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-400 block">৩. এনক্রিপ্ট চ্যাট (Chat)</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Send ChaCha20-Poly1305 multi-hop packets with 100% zero internet connection.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* 100% Offline QR Code Pairing & Camera Scanner Modal */}
      <MeshPairingModal
        isOpen={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        onConnect={handlePairConnect}
        identity={identity}
      />

      {/* Offline Mesh User Guide Modal (Bilingual EN & BN) */}
      <MeshGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};

export default MeshView;
