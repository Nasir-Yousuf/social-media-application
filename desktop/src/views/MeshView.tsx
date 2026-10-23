import React, { useState } from 'react';
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
} from 'lucide-react';
import { useMesh } from '../mesh/context/MeshContext';
import { MeshPeer, MeshConversation, MeshMessage } from '../mesh/storage/meshStorage';

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

  // Manual peer addition for local peer test / loopback
  const [manualPeerPubkey, setManualPeerPubkey] = useState<string>('');
  const [manualPeerNick, setManualPeerNick] = useState<string>('');
  const [showAddPeerModal, setShowAddPeerModal] = useState<boolean>(false);

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
        <div className="p-4 border-b border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Radio className="w-4 h-4 animate-pulse" />
              Clearfeed Mesh
            </div>
            <button
              onClick={() => refreshMeshState()}
              className="text-neutral-500 hover:text-emerald-400 transition cursor-pointer"
              title="Refresh local mesh state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] font-semibold text-emerald-200">
            Connect nearby. Communicate offline.
          </p>

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
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-neutral-700" />
                <p>No offline conversations stored yet.</p>
                <p className="text-[10px] text-neutral-400">
                  Select a peer in the Peers tab or add a peer public key.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
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
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Discovered Nearby Peers
              </span>
              <button
                onClick={() => setShowAddPeerModal(true)}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                + Add Peer Key
              </button>
            </div>

            {peers.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 space-y-2 bg-neutral-950/40 border border-neutral-800/60 rounded-xl">
                <Users className="w-7 h-7 mx-auto text-neutral-700" />
                <p>No nearby Mesh peers found.</p>
                <p className="text-[10px] text-neutral-400">
                  Keep Mesh enabled or add another compatible device with its 64-character public key.
                </p>
              </div>
            ) : (
              peers.map((peer) => (
                <div
                  key={peer.publicKeyHex}
                  onClick={() => selectPeer(peer)}
                  className="p-3 bg-neutral-950/60 border border-neutral-800/80 hover:border-emerald-500/40 rounded-xl cursor-pointer transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-200">{peer.nickname}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded">
                      {peer.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-neutral-500 truncate">
                    {peer.publicKeyHex}
                  </p>
                </div>
              ))
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

      {/* Main Conversation Panel */}
      {activeConv || activePeer ? (
        <div className="flex-1 flex flex-col h-full bg-neutral-950/40 min-w-0">
          {/* Header */}
          <div className="h-14 px-6 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {(activeConv?.nickname || activePeer?.nickname)?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  {activeConv?.nickname || activePeer?.nickname}
                </h3>
                <p className="text-[10px] text-neutral-500 font-mono truncate max-w-sm">
                  {activeConv?.peerPubkey || activePeer?.publicKeyHex}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium rounded-lg">
                <ShieldCheck className="w-3 h-3" />
                End-to-End Encrypted (CFM1)
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-neutral-500 space-y-2">
                <Lock className="w-8 h-8 text-neutral-700" />
                <p className="font-semibold text-neutral-300">Direct Offline Conversation</p>
                <p className="text-[11px] max-w-xs text-neutral-400">
                  Messages sent here are encrypted using ChaCha20-Poly1305 with keys derived through X25519 Diffie-Hellman and relayed offline.
                </p>
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
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-neutral-800 text-neutral-100 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        msg.isOutgoing ? 'text-emerald-200' : 'text-neutral-400'
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
              placeholder="Send offline encrypted message..."
              className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-3">
          <Radio className="w-12 h-12 text-neutral-800" />
          <h3 className="text-sm font-semibold text-neutral-300">Clearfeed Mesh Workspace</h3>
          <p className="text-xs max-w-sm text-neutral-400">
            Select an offline conversation or peer from the left panel to exchange encrypted CFM1 packets.
          </p>
        </div>
      )}

      {/* Manual Add Peer Modal */}
      {showAddPeerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-neutral-100">Add Peer Public Key</h3>
            <p className="text-xs text-neutral-400">
              Input a 64-character Ed25519 hex public key to start communicating with another peer device.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-300">Nickname</label>
                <input
                  type="text"
                  value={manualPeerNick}
                  onChange={(e) => setManualPeerNick(e.target.value)}
                  placeholder="e.g. Study Partner"
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-neutral-300">
                  Public Key (64-char hex)
                </label>
                <input
                  type="text"
                  value={manualPeerPubkey}
                  onChange={(e) => setManualPeerPubkey(e.target.value)}
                  placeholder="e.g. 9f8a..."
                  className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddPeerModal(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (manualPeerPubkey.trim().length === 64) {
                    const peer: MeshPeer = {
                      publicKeyHex: manualPeerPubkey.trim().toLowerCase(),
                      nickname: manualPeerNick.trim() || `Peer_${manualPeerPubkey.substring(0, 6)}`,
                      status: 'discovered',
                      lastSeen: Date.now(),
                    };
                    selectPeer(peer);
                    setShowAddPeerModal(false);
                    setManualPeerPubkey('');
                    setManualPeerNick('');
                  } else {
                    alert('Public key must be exactly 64 hex characters.');
                  }
                }}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add & Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeshView;
