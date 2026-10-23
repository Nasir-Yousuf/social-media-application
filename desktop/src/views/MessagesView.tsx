import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';
import api from '../api/client';
import { Conversation, ChatMessage } from '../types';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '💻', '💡', '🎉', '🧠'];
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

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConvs, setLoadingConvs] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConversation?._id || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Conversations
  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const res = await api.get('/messages/conversations');
      if (res.data?.conversations) {
        setConversations(res.data.conversations);
        if (!activeConversation && res.data.conversations.length > 0) {
          selectConversation(res.data.conversations[0]);
        }
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoadingConvs(false);
    }
  };

  // 2. Fetch Messages for active conversation
  const selectConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    setLoadingMessages(true);
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

  useEffect(() => {
    fetchConversations();
  }, []);

  // 3. Socket real-time event listeners
  useEffect(() => {
    const unsubMessage = socketService.on('chat:message', (data: any) => {
      const newMsg = data?.message || data;
      if (!newMsg) return;

      const targetConvId = newMsg.conversation?.toString();
      if (targetConvId === activeConvIdRef.current) {
        setMessages((prev) => {
          // Avoid duplicate by tempId or _id
          if (prev.some((m) => m._id === newMsg._id || (newMsg.tempId && m.tempId === newMsg.tempId))) {
            return prev.map((m) => (m.tempId === newMsg.tempId ? newMsg : m));
          }
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      }

      // Update conversation last message in sidebar
      setConversations((prev) => {
        return prev.map((c) => {
          if (c._id === targetConvId) {
            return {
              ...c,
              lastMessage: {
                content: newMsg.content,
                sender: newMsg.sender,
                createdAt: newMsg.createdAt,
              },
              unreadCount: targetConvId === activeConvIdRef.current ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        });
      });
    });

    const unsubReaction = socketService.on('chat:reaction', (data: any) => {
      if (!data?.messageId) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === data.messageId ? { ...m, reactions: data.reactions } : m))
      );
    });

    const unsubDelete = socketService.on('chat:delete', (data: any) => {
      if (!data?.messageId) return;
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    });

    return () => {
      unsubMessage();
      unsubReaction();
      unsubDelete();
    };
  }, []);

  // 4. Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || (!inputText.trim() && !codeSnippet.trim()) || sending) return;

    const tempId = `temp-${Date.now()}`;
    const payload: any = {
      recipientId: activeConversation.otherUser?._id,
      content: inputText.trim(),
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
      content: inputText.trim(),
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
      if (res.data?.message) {
        setMessages((prev) =>
          prev.map((m) => (m.tempId === tempId ? { ...res.data.message, status: 'sent' } : m))
        );
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? {
                  ...c,
                  lastMessage: {
                    content: res.data.message.content || 'Sent a code snippet',
                    sender: res.data.message.sender,
                    createdAt: res.data.message.createdAt,
                  },
                }
              : c
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.tempId === tempId ? { ...m, status: 'failed' } : m))
      );
    } finally {
      setSending(false);
    }
  };

  // 5. React to message
  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await api.post(`/messages/${messageId}/react`, { emoji });
    } catch {}
  };

  // 6. Delete message
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
            <button
              onClick={fetchConversations}
              className="text-neutral-400 hover:text-sky-400 transition cursor-pointer"
              title="Refresh conversations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
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
            <div className="p-8 text-center text-xs text-neutral-500">
              No conversations found.
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
                      <p className="text-xs font-semibold text-neutral-200 truncate">
                        {conv.otherUser?.name || 'Classmate'}
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
                      {conv.lastMessage?.content || 'Started a conversation'}
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

      {/* Main Chat Thread Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col h-full bg-neutral-950/40 min-w-0">
          {/* Chat Header */}
          <div className="h-14 px-6 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                {activeConversation.otherUser?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-100">
                  {activeConversation.otherUser?.name || 'Conversation'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  @{activeConversation.otherUser?.username || 'user'} • Course Member
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!backendConnected && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline
                </div>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingMessages ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-neutral-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-neutral-700" />
                <p>No messages yet. Send a message to start the thread!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === currentUser?._id || msg.sender?.username === currentUser?.username;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                        isMe
                          ? 'bg-sky-500 text-white rounded-br-xs'
                          : 'bg-neutral-800 text-neutral-100 rounded-bl-xs'
                      }`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                      {/* Code Snippet Box */}
                      {msg.codeSnippet && (
                        <div className="mt-2 p-3 bg-neutral-950/80 rounded-xl font-mono text-xs overflow-x-auto border border-neutral-700/60 text-emerald-400">
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 font-sans">
                            {msg.codeSnippet.language}
                          </div>
                          <code>{msg.codeSnippet.code}</code>
                        </div>
                      )}

                      {/* Footer: timestamp & read receipt */}
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
                            ) : msg.isRead ? (
                              <CheckCheck className="w-3 h-3 text-sky-200" />
                            ) : (
                              <Check className="w-3 h-3 text-sky-200" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reactions display & Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition px-1">
                      {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(msg._id, emoji)}
                          className="text-xs hover:scale-125 transition p-1 cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                      {isMe && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer transition"
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
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Input Area */}
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 space-y-3 shrink-0">
            {/* Code Snippet Drawer */}
            {showCodeEditor && (
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    Attach Code Snippet
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={codeLang}
                      onChange={(e) => setCodeLang(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCodeEditor(false)}
                      className="text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste or write your code here..."
                  rows={4}
                  className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg p-2.5 font-mono text-xs text-neutral-200 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
            )}

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
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
                disabled={(!inputText.trim() && !codeSnippet.trim()) || sending || !backendConnected}
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
          <h3 className="text-sm font-semibold text-neutral-300">No conversation selected</h3>
          <p className="text-xs max-w-sm">
            Choose a conversation from the left sidebar or reach out to a classmate in Members.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessagesView;
