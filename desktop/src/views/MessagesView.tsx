import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  Code2,
  Smile,
  Trash2,
  RefreshCw,
  Check,
  CheckCheck,
  WifiOff,
  X,
  User as UserIcon,
  PenSquare,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';
import api from '../api/client';
import { Conversation, ChatMessage, User } from '../types';
import AiSettingsModal from '../components/chat/AiSettingsModal';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '💻', '💡', '🎉', '🧠', '✨', '🎯', '💯'];
const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML/CSS' },
  { value: 'sql', label: 'SQL' },
];

export const MessagesView: React.FC = () => {
  const { user: currentUser, backendConnected } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const userParam = searchParams.get('user');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConvs, setLoadingConvs] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [directoryMembers, setDirectoryMembers] = useState<User[]>([]);
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  // Composer state
  const [inputText, setInputText] = useState<string>('');
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false);
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [codeLang, setCodeLang] = useState<string>('javascript');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConversation?._id || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConvs(true);
    try {
      const res = await api.get('/messages/conversations');
      if (res.data?.conversations) {
        setConversations(res.data.conversations);
        if (!activeConversation && res.data.conversations.length > 0 && !userParam) {
          selectConversation(res.data.conversations[0]);
        }
      }
    } catch {
      // Handled gracefully
    } finally {
      if (!silent) setLoadingConvs(false);
    }
  }, [activeConversation, userParam]);

  // 2. Fetch Messages for active conversation
  const selectConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    setLoadingMessages(true);
    socketService.emit('chat:join', { conversationId: conv._id });
    try {
      const res = await api.get(`/messages/conversations/${conv._id}`);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
      // Zero local unread count
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
      );
    } catch {
      // Handled gracefully
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  // 3. Fetch directory members for New Chat modal
  const fetchDirectoryMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await api.get('/users/directory');
      const list = res.data?.users || res.data?.members || [];
      // Filter out self
      const others = list.filter((u: any) => u._id !== currentUser?._id && u.username !== currentUser?.username);
      setDirectoryMembers(others);
    } catch {
      // Handled gracefully
    } finally {
      setLoadingMembers(false);
    }
  };

  // 4. Start chat with a specific user
  const handleStartDirectChat = async (user: User) => {
    try {
      const res = await api.post('/messages/conversations', {
        recipientId: user._id,
        recipientUsername: user.username,
      });
      const conv = res.data?.conversation;
      if (conv) {
        setShowNewChatModal(false);
        setActiveConversation(conv);
        selectConversation(conv);
        fetchConversations(true);
      }
    } catch (err: any) {
      alert(`Could not start conversation: ${err.response?.data?.message || err.message}`);
    }
  };

  // 5. Initial load & Deep link ?user=username handling
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!userParam) return;
    const startFromParam = async () => {
      try {
        const res = await api.post('/messages/conversations', {
          recipientUsername: userParam,
        });
        const conv = res.data?.conversation;
        if (conv) {
          setActiveConversation(conv);
          selectConversation(conv);
          fetchConversations(true);
        }
      } catch (err: any) {
        console.warn('Could not auto-start chat with userParam:', err.message);
      }
    };
    startFromParam();
  }, [userParam]);

  // 6. Polling active conversation every 3.5s for real-time sync
  useEffect(() => {
    if (!activeConversation?._id) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      if (activeConvIdRef.current) {
        api.get(`/messages/conversations/${activeConvIdRef.current}`)
          .then((res) => {
            if (res.data?.messages) {
              setMessages(res.data.messages);
            }
          })
          .catch(() => {});
        fetchConversations(true);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeConversation?._id, fetchConversations]);

  // 7. Socket real-time message stream listener
  useEffect(() => {
    const unsubMessage = socketService.on('chat:message', (data: any) => {
      const newMsg = data?.message || data;
      if (!newMsg) return;

      const targetConvId = (data.conversationId || newMsg.conversation?._id || newMsg.conversation)?.toString();
      if (targetConvId === activeConvIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id || (newMsg.tempId && m.tempId === newMsg.tempId))) {
            return prev.map((m) => (m.tempId === newMsg.tempId ? newMsg : m));
          }
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      }
      fetchConversations(true);
    });

    const unsubReaction = socketService.on('chat:reaction', (data: any) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, reactions: data.reactions } : m))
      );
    });

    const unsubDelete = socketService.on('chat:delete', (data: any) => {
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    });

    const unsubTyping = socketService.on('chat:typing', (data: any) => {
      if (data?.conversationId === activeConvIdRef.current) {
        setIsPartnerTyping(Boolean(data.isTyping));
        if (data.isTyping) {
          setTimeout(scrollToBottom, 50);
        }
      }
    });

    return () => {
      unsubMessage();
      unsubReaction();
      unsubDelete();
      unsubTyping();
    };
  }, [fetchConversations]);

  // 8. Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || (!inputText.trim() && !codeSnippet.trim()) || sending) return;

    const trimmedText = inputText.trim();
    const tempId = `temp-${Date.now()}`;
    const payload: any = {
      conversationId: activeConversation._id,
      recipientId: activeConversation.otherUser?._id,
      text: trimmedText,
      content: trimmedText,
      tempId,
    };

    if (showCodeEditor && codeSnippet.trim()) {
      payload.codeSnippet = {
        code: codeSnippet.trim(),
        language: codeLang,
      };
    }

    const optimisticMsg: ChatMessage = {
      _id: tempId,
      tempId,
      conversation: activeConversation._id,
      sender: {
        _id: currentUser?._id || 'self',
        name: currentUser?.name || 'Me',
        username: currentUser?.username || 'me',
        avatarUrl: currentUser?.avatarUrl,
      },
      text: trimmedText,
      content: trimmedText,
      codeSnippet: payload.codeSnippet,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setCodeSnippet('');
    setShowCodeEditor(false);
    setShowEmojiPicker(false);
    setTimeout(scrollToBottom, 30);

    setSending(true);
    try {
      const res = await api.post('/messages/send', payload);
      const returnedMsg = res.data?.message || res.data?.data;
      if (returnedMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.tempId === tempId ? { ...returnedMsg, status: 'sent' } : m))
        );
        fetchConversations(true);
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.tempId === tempId ? { ...m, status: 'failed' } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await api.post(`/messages/${messageId}/react`, { emoji });
    } catch {}
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch {}
  };

  const filteredConversations = conversations.filter((c) => {
    const nameMatch =
      c.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterUnreadOnly) {
      return nameMatch && (c.unreadCount || 0) > 0;
    }
    return nameMatch;
  });

  const filteredMembers = directoryMembers.filter(
    (m) =>
      m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.username?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar: Conversations List */}
      <div className="w-80 border-r border-neutral-800/80 bg-neutral-900/40 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              Online Messages
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  fetchDirectoryMembers();
                  setShowNewChatModal(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Start new conversation with course member"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => fetchConversations()}
                className="p-1 text-neutral-400 hover:text-sky-400 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                title="Refresh conversations"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-neutral-950/80 border border-neutral-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Unread toggle filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUnreadOnly(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                !filterUnreadOnly
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-800/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUnreadOnly(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterUnreadOnly
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-800/50'
              }`}
            >
              Unread Only
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
          {loadingConvs ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 space-y-3">
              <p>No active conversations found.</p>
              <button
                onClick={() => {
                  fetchDirectoryMembers();
                  setShowNewChatModal(true);
                }}
                className="px-3.5 py-1.5 bg-sky-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Start Chat with a Member
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = activeConversation?._id === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition select-none ${
                    isActive ? 'bg-sky-500/10 border-l-2 border-sky-400' : 'hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-sm text-neutral-200">
                      {conv.otherUser?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold text-neutral-200 truncate flex items-center gap-1.5">
                        <span>{conv.otherUser?.name || 'Classmate'}</span>
                        {(conv.otherUser?.username === 'ai' || conv.otherUser?.isAi) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                            <span>AI</span>
                          </span>
                        )}
                      </p>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">
                      {conv.lastMessage?.text || conv.lastMessage?.content || 'Started a conversation'}
                    </p>
                  </div>
                  {(conv.unreadCount || 0) > 0 && (
                    <span className="px-1.5 py-0.5 bg-sky-500 text-white text-[10px] font-bold rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Stream */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col h-full bg-neutral-950/40 min-w-0">
          {/* Header */}
          <div className="h-14 px-6 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                {activeConversation.otherUser?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                  {activeConversation.otherUser?.name || 'Classmate'}
                  {(activeConversation.otherUser?.username === 'ai' || activeConversation.otherUser?.isAi) ? (
                    <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                      <span>{activeConversation.customAiSettings?.relationship || 'AI Companion'}</span>
                    </span>
                  ) : activeConversation.otherUser?.role === 'admin' ? (
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono">
                      Staff
                    </span>
                  ) : null}
                </h3>
                <p className="text-[10px] text-neutral-500 font-mono">
                  @{activeConversation.otherUser?.username}
                  {(activeConversation.otherUser?.username === 'ai' || activeConversation.otherUser?.isAi) && (
                    <span className="ml-1.5 text-sky-400">· Always here for you</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(activeConversation.otherUser?.username === 'ai' || activeConversation.otherUser?.isAi) && (
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Customize Name, Personality & Language"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Customize AI</span>
                </button>
              )}
              <button
                onClick={() => selectConversation(activeConversation)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                title="Refresh messages"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingMessages ? (
              <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                Loading discussion history...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-neutral-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-neutral-700" />
                <p className="font-semibold text-neutral-300">Start of conversation</p>
                <p className="text-[11px] max-w-xs">
                  Send a message or code snippet to start collaborating with {activeConversation.otherUser?.name}.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe =
                  msg.sender?._id === currentUser?._id ||
                  (typeof msg.sender === 'string' && msg.sender === currentUser?._id) ||
                  msg.status === 'sending';
                return (
                  <div
                    key={msg._id || msg.tempId}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isMe
                          ? 'bg-sky-600 text-white rounded-br-xs'
                          : 'bg-neutral-800 text-neutral-100 rounded-bl-xs'
                      }`}
                    >
                      {(msg.text || msg.content) && <p className="whitespace-pre-wrap">{msg.text || msg.content}</p>}

                      {/* Attached Code Snippet */}
                      {msg.codeSnippet && msg.codeSnippet.code && (
                        <div className="mt-2 rounded-xl bg-neutral-950 border border-neutral-700/80 overflow-hidden text-xs font-mono">
                          <div className="px-3 py-1 bg-neutral-900 border-b border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                            <span>{msg.codeSnippet.language || 'code'}</span>
                          </div>
                          <pre className="p-3 text-neutral-200 overflow-x-auto max-h-48 text-xs">
                            <code>{msg.codeSnippet.code}</code>
                          </pre>
                        </div>
                      )}

                      {/* Message Meta */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                          isMe ? 'text-sky-200' : 'text-neutral-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          <span>
                            {msg.status === 'sending' ? (
                              '•••'
                            ) : msg.status === 'failed' ? (
                              '⚠️ Failed'
                            ) : (
                              <CheckCheck className="w-3 h-3 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reactions & Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition px-1">
                      {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(msg._id, emoji)}
                          className="text-xs hover:scale-125 transition cursor-pointer p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                      {isMe && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="text-neutral-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {isPartnerTyping && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 pl-2 py-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{activeConversation.otherUser?.name || 'AI'} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Box */}
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 shrink-0 space-y-2">
            {/* Code Snippet Editor Drawer */}
            {showCodeEditor && (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-sky-400" />
                    Attach Code Snippet
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={codeLang}
                      onChange={(e) => setCodeLang(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 rounded-lg px-2 py-1"
                    >
                      {CODE_LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCodeEditor(false)}
                      className="text-neutral-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Paste or write code snippet here..."
                  rows={4}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 font-mono text-xs text-neutral-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-1 flex-wrap">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-sm p-1.5 hover:bg-neutral-800 rounded-lg cursor-pointer transition hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCodeEditor((prev) => !prev)}
                className={`p-2.5 rounded-xl border border-neutral-800 hover:border-sky-500/40 transition cursor-pointer ${
                  showCodeEditor ? 'bg-sky-500/20 text-sky-400' : 'text-neutral-400 hover:text-sky-400'
                }`}
                title="Attach Code Snippet"
              >
                <Code2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={`p-2.5 rounded-xl border border-neutral-800 hover:border-sky-500/40 transition cursor-pointer ${
                  showEmojiPicker ? 'bg-sky-500/20 text-sky-400' : 'text-neutral-400 hover:text-sky-400'
                }`}
                title="Quick Emojis"
              >
                <Smile className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message... (Press Enter to send)"
                className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />

              <button
                type="submit"
                disabled={(!inputText.trim() && !codeSnippet.trim()) || sending}
                className="p-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-3">
          <MessageSquare className="w-12 h-12 text-neutral-800" />
          <h3 className="text-sm font-semibold text-neutral-300">Select or Start a Conversation</h3>
          <p className="text-xs max-w-sm text-neutral-400">
            Pick a conversation from the left sidebar or click below to message any enrolled course member.
          </p>
          <button
            onClick={() => {
              fetchDirectoryMembers();
              setShowNewChatModal(true);
            }}
            className="mt-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Start Chat with a Member</span>
          </button>
        </div>
      )}

      {/* New Chat Modal: Search real members from database */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Start Chat with Course Member
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-neutral-800 bg-neutral-900/30">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search students & instructors..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40 p-2">
              {/* Featured AI card at top */}
              {!memberSearch && (
                <div
                  onClick={() => {
                    const aiUser = directoryMembers.find((m) => m.username === 'ai') || {
                      _id: 'ai',
                      username: 'ai',
                      name: 'Clearfeed AI',
                      role: 'ai',
                    };
                    handleStartDirectChat(aiUser as any);
                  }}
                  className="p-3 mb-2 rounded-xl bg-gradient-to-r from-sky-500/10 via-emerald-500/5 to-transparent border border-sky-500/20 hover:border-sky-500/40 flex items-center justify-between cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Clearfeed AI Companion
                        <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1 rounded">24/7 Friend</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400">Chat about life, personal thoughts, or coding issues</p>
                    </div>
                  </div>
                  <span className="text-xs text-sky-400 font-bold px-2.5 py-1 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors">Chat ✨</span>
                </div>
              )}
              {loadingMembers ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  Loading course roster from database...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No members matched your search.
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member._id}
                    onClick={() => handleStartDirectChat(member)}
                    className="p-3 flex items-center justify-between hover:bg-neutral-900/80 rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                        {member.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {member.name}
                          {member.role === 'admin' && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono">
                              Staff
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-neutral-400">@{member.username}</p>
                      </div>
                    </div>
                    <span className="text-xs text-sky-400 font-semibold px-2.5 py-1 bg-sky-500/10 rounded-lg hover:bg-sky-500/20">
                      Message
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Persona Customization Modal */}
      {activeConversation && (
        <AiSettingsModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          conversationId={activeConversation._id}
          currentSettings={activeConversation.customAiSettings}
          onSaved={(newSettings) => {
            setActiveConversation((prev: any) => ({
              ...prev,
              customAiSettings: newSettings,
              otherUser: {
                ...prev.otherUser,
                name: newSettings.customName || prev.otherUser?.name,
              },
            }));
            setConversations((prev) =>
              prev.map((c) =>
                c._id === activeConversation._id
                  ? {
                      ...c,
                      customAiSettings: newSettings,
                      otherUser: c.otherUser
                        ? {
                            ...c.otherUser,
                            name: newSettings.customName || c.otherUser.name,
                          }
                        : undefined,
                    }
                  : c
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default MessagesView;
