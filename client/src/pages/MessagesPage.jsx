import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  PenSquare,
  Send,
  Code2,
  Smile,
  X,
  ArrowLeft,
  Check,
  CheckCheck,
  User,
  Copy,
  ExternalLink,
  Sparkles,
  Trash2,
  Eraser,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import api from '../api/client';

const QUICK_EMOJIS = ['😀', '😂', '🔥', '🚀', '💻', '💡', '⚡', '❤️', '🎯', '🎉', '✨', '☕', '🧠', '🐛', '👍', '🙌', '🤝', '💯', '🔒', '🛠️'];

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React / JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML5' },
  { value: 'css', label: 'CSS3' },
  { value: 'sql', label: 'SQL' },
  { value: 'cpp', label: 'C++' },
];

export const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const userParam = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Composer state
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLang, setSnippetLang] = useState('javascript');

  // Search & New Conversation Modal
  const [conversationSearch, setConversationSearch] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [directoryMembers, setDirectoryMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);

  const messagesEndRef = useRef(null);
  const activeConvIdRef = useRef(null);
  activeConvIdRef.current = activeConversation?._id;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Format message time
  const formatMessageTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isToday(d)) {
        return format(d, 'h:mm a');
      }
      if (isYesterday(d)) {
        return `Yesterday · ${format(d, 'h:mm a')}`;
      }
      return format(d, 'MMM d · h:mm a');
    } catch {
      return '';
    }
  };

  // Format conversation list timestamp
  const formatConvDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return format(d, 'h:mm a');
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'MMM d');
    } catch {
      return '';
    }
  };

  // Fetch all conversations
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.conversations || []);
    } catch {
      // silently handle
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (convId, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/conversations/${convId}`);
      setMessages(res.data.messages || []);
      if (!silent) {
        setTimeout(() => scrollToBottom(false), 50);
      }
    } catch {
      showToast('Could not load messages', 'error');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle URL ?user=username deep link
  useEffect(() => {
    if (!userParam) return;

    const startFromParam = async () => {
      try {
        const res = await api.post('/messages/conversations', {
          recipientUsername: userParam,
        });
        const conv = res.data.conversation;
        if (conv) {
          setActiveConversation(conv);
          fetchMessages(conv._id);
          fetchConversations(true);
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Could not start conversation', 'error');
      }
    };

    startFromParam();
  }, [userParam, fetchMessages, fetchConversations, showToast]);

  // Polling for active conversation (auto-refresh messages every 3.5s)
  useEffect(() => {
    if (!activeConversation?._id) return;

    const pollInterval = setInterval(() => {
      // Pause polling if user switched away from tab to save Atlas operations
      if (document.hidden) return;
      if (activeConvIdRef.current) {
        fetchMessages(activeConvIdRef.current, true);
        fetchConversations(true);
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [activeConversation?._id, fetchMessages, fetchConversations]);

  // Select a conversation from list
  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setShowEmojiPicker(false);
    setShowCodeEditor(false);
    fetchMessages(conv._id);
    // Mark as read in local list
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Open New Chat Modal & Load directory members
  const handleOpenNewChat = async () => {
    setIsNewChatModalOpen(true);
    if (directoryMembers.length === 0) {
      setLoadingMembers(true);
      try {
        const res = await api.get('/users/directory');
        setDirectoryMembers(
          (res.data.members || []).filter((m) => m._id !== currentUser?._id)
        );
      } catch {
        showToast('Could not load member directory', 'error');
      } finally {
        setLoadingMembers(false);
      }
    }
  };

  // Start chat with member from modal
  const handleStartChatWithMember = async (targetUser) => {
    setIsNewChatModalOpen(false);
    try {
      const res = await api.post('/messages/conversations', {
        recipientId: targetUser._id,
      });
      const conv = res.data.conversation;
      setActiveConversation(conv);
      fetchMessages(conv._id);
      fetchConversations(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start chat', 'error');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmedText = inputText.trim();
    const hasCode = snippetCode.trim().length > 0;

    if ((!trimmedText && !hasCode) || sending || !activeConversation) return;

    setSending(true);

    const payload = {
      conversationId: activeConversation._id,
      text: trimmedText,
      codeSnippet: hasCode
        ? {
            language: snippetLang,
            code: snippetCode.trim(),
          }
        : undefined,
    };

    // Optimistic message update
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      conversation: activeConversation._id,
      sender: currentUser?._id,
      recipient: activeConversation.otherUser?._id,
      text: trimmedText,
      codeSnippet: payload.codeSnippet,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');
    setSnippetCode('');
    setShowCodeEditor(false);
    setShowEmojiPicker(false);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await api.post('/messages/send', payload);
      const savedMessage = res.data.data;

      // Replace optimistic message with actual DB record
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMessage._id ? savedMessage : m))
      );

      // Refresh conversations list to update last message
      fetchConversations(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
      // Rollback optimistic message
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    } finally {
      setSending(false);
    }
  };

  // Copy code snippet to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard', 'success');
  };

  // Delete individual message
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      fetchConversations(true);
      showToast('Message deleted', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete message', 'error');
    }
  };

  // Delete entire conversation and its messages
  const handleDeleteConversation = async (convId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this entire conversation? All messages will be permanently removed from MongoDB storage.')) return;
    try {
      await api.delete(`/messages/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (activeConversation?._id === convId) {
        setActiveConversation(null);
        setMessages([]);
      }
      showToast('Conversation deleted', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete conversation', 'error');
    }
  };

  // Clear all messages in current conversation without deleting conversation
  const handleClearConversation = async (convId) => {
    if (!convId) return;
    if (!window.confirm('Clear all messages in this conversation? All message records will be permanently removed from MongoDB storage.')) return;
    try {
      await api.delete(`/messages/conversations/${convId}/messages`);
      setMessages([]);
      fetchConversations(true);
      showToast('All messages cleared', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clear messages', 'error');
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!conversationSearch.trim()) return true;
    const q = conversationSearch.toLowerCase();
    const nameMatch = c.otherUser?.name?.toLowerCase().includes(q);
    const userMatch = c.otherUser?.username?.toLowerCase().includes(q);
    const msgMatch = c.lastMessage?.text?.toLowerCase().includes(q);
    return nameMatch || userMatch || msgMatch;
  });

  // Filter members in new chat modal
  const filteredMembers = directoryMembers.filter((m) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen w-full bg-white dark:bg-black font-sans overflow-hidden">
      {/* LEFT PANE: Conversations List (Hidden on mobile if chat is active) */}
      <div
        className={`${
          activeConversation ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-[320px] lg:w-[350px] border-r border-neutral-200/80 dark:border-neutral-800/80 shrink-0 h-full overflow-hidden select-none bg-white dark:bg-black`}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-black text-xl tracking-tight text-neutral-900 dark:text-white">
              Messages
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
              1-on-1
            </span>
          </div>

          <button
            onClick={handleOpenNewChat}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-sky-500 transition-colors cursor-pointer"
            title="New Message"
          >
            <PenSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Search Conversations */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-900">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={conversationSearch}
              onChange={(e) => setConversationSearch(e.target.value)}
              placeholder="Search Direct Messages..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-neutral-100 dark:bg-[#16181c] text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-sky-500 border border-transparent transition-all"
            />
          </div>
        </div>

        {/* Conversation List Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100/60 dark:divide-neutral-900/60">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 space-y-3">
              <MessageSquare className="w-8 h-8 text-neutral-400 mx-auto opacity-60" />
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                {conversationSearch ? 'No matching conversations' : 'No messages yet'}
              </p>
              <p className="max-w-xs mx-auto">
                Start a direct conversation with classmates to discuss code and assignments privately.
              </p>
              <button
                onClick={handleOpenNewChat}
                className="px-4 py-1.5 rounded-full bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 transition-colors shadow-xs cursor-pointer"
              >
                Write a message
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?._id === conv._id;
              const hasUnread = conv.unreadCount > 0;

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`group relative flex items-start gap-3 p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100/90 dark:bg-neutral-900/90 border-l-3 border-l-sky-500'
                      : ''
                  }`}
                >
                  <Avatar
                    src={conv.otherUser?.avatarUrl}
                    name={conv.otherUser?.name}
                    size="md"
                    showRoleBadge={false}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate">
                          {conv.otherUser?.name || 'Classmate'}
                        </span>
                        <span className="text-[11px] text-neutral-500 truncate">
                          @{conv.otherUser?.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-neutral-400">
                          {formatConvDate(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(conv._id, e)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete conversation & all messages"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p
                        className={`text-xs truncate ${
                          hasUnread
                            ? 'font-bold text-neutral-900 dark:text-neutral-100'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {conv.lastMessage?.hasCode ? (
                          <span className="text-sky-500 font-mono text-[11px] flex items-center gap-1">
                            <Code2 className="w-3 h-3" />
                            Code snippet
                          </span>
                        ) : (
                          conv.lastMessage?.text || 'Started a conversation'
                        )}
                      </p>

                      {hasUnread && (
                        <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat Conversation */}
      <div
        className={`${
          activeConversation ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 h-full overflow-hidden bg-neutral-50/40 dark:bg-black`}
      >
        {activeConversation ? (
          <>
            {/* Active Chat Header */}
            <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <NavLink
                  to={`/profile/${activeConversation.otherUser?.username}`}
                  className="shrink-0"
                >
                  <Avatar
                    src={activeConversation.otherUser?.avatarUrl}
                    name={activeConversation.otherUser?.name}
                    size="md"
                    showRoleBadge={false}
                  />
                </NavLink>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <NavLink
                      to={`/profile/${activeConversation.otherUser?.username}`}
                      className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:underline truncate"
                    >
                      {activeConversation.otherUser?.name}
                    </NavLink>
                    <span className="text-xs text-neutral-500 truncate">
                      @{activeConversation.otherUser?.username}
                    </span>
                  </div>
                  {activeConversation.otherUser?.status && (
                    <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium truncate">
                      {activeConversation.otherUser?.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleClearConversation(activeConversation._id)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-amber-500 transition-colors cursor-pointer"
                  title="Clear all messages (frees storage)"
                >
                  <Eraser className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteConversation(activeConversation._id, e)}
                  className="p-2 rounded-full hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete conversation & all messages"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <NavLink
                  to={`/profile/${activeConversation.otherUser?.username}`}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-sky-500 transition-colors"
                  title="View Profile"
                >
                  <User className="w-4 h-4" />
                </NavLink>
              </div>
            </div>

            {/* Message Thread Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
                  <Sparkles className="w-6 h-6 text-sky-500 mx-auto" />
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    This is the start of your message history with @{activeConversation.otherUser?.username}
                  </p>
                  <p>Send a message, an emoji, or a code snippet below.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === currentUser?._id;
                  const hasSnippet = msg.codeSnippet && msg.codeSnippet.code;
                  const isTemp = typeof msg._id === 'string' && msg._id.startsWith('temp-');

                  return (
                    <div
                      key={msg._id || idx}
                      className={`group/msg flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      <div className={`relative flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-full`}>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? 'bg-sky-500 text-white rounded-br-xs'
                              : 'bg-white dark:bg-[#181a20] text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-800/80 rounded-bl-xs'
                          }`}
                        >
                          {/* Text Content */}
                          {msg.text && (
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          )}

                          {/* Code Snippet Box */}
                          {hasSnippet && (
                            <div
                              className={`mt-2 rounded-xl overflow-hidden text-xs font-mono border ${
                                isMe
                                  ? 'bg-black/40 border-white/20 text-white'
                                  : 'bg-[#121418] border-neutral-800 text-neutral-200'
                              }`}
                            >
                              <div className="flex items-center justify-between px-3 py-1.5 bg-black/30 border-b border-white/10 text-[10px]">
                                <span className="font-bold uppercase text-sky-400">
                                  {msg.codeSnippet.language || 'code'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(msg.codeSnippet.code)}
                                  className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                  title="Copy code"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="p-3 overflow-x-auto text-xs leading-relaxed max-h-64 font-mono">
                                <code>{msg.codeSnippet.code}</code>
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Delete single message button */}
                        {!isTemp && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg._id)}
                            className="opacity-0 group-hover/msg:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 cursor-pointer shrink-0"
                            title="Delete this message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Timestamp & Delivered status */}
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1 px-1">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMe && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck className="w-3 h-3 text-sky-500" />
                            ) : (
                              <Check className="w-3 h-3 text-neutral-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Rich Composer Bar */}
            <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-black shrink-0">
              {/* Emoji Drawer */}
              {showEmojiPicker && (
                <div className="p-2 mb-2 bg-neutral-100 dark:bg-[#16181c] border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-wrap gap-1 shadow-inner animate-fade-in">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setInputText((prev) => prev + emoji)}
                      className="text-lg p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700/60 active:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Code Snippet Drawer */}
              {showCodeEditor && (
                <div className="p-3 mb-2 bg-[#14161a] border border-[#262930] rounded-2xl space-y-2 text-xs font-mono shadow-inner animate-fade-in">
                  <div className="flex items-center justify-between text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      <span className="font-bold text-white">Attach Code Snippet</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={snippetLang}
                        onChange={(e) => setSnippetLang(e.target.value)}
                        className="bg-[#20232a] text-white px-2 py-1 rounded border border-[#30343e] text-xs outline-none cursor-pointer"
                      >
                        {CODE_LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCodeEditor(false);
                          setSnippetCode('');
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={snippetCode}
                    onChange={(e) => setSnippetCode(e.target.value)}
                    placeholder={`// Paste your ${snippetLang} code here...`}
                    rows={4}
                    className="w-full bg-[#1b1e24] p-2.5 rounded-xl text-xs font-mono text-neutral-200 placeholder:text-neutral-500 focus:outline-none resize-y border border-[#2a2e38]"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Text Input Row */}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                {/* Emoji toggle button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowCodeEditor(false);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showEmojiPicker
                      ? 'text-sky-500 bg-sky-50 dark:bg-sky-500/15'
                      : 'text-neutral-400 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Code snippet toggle button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeEditor(!showCodeEditor);
                    setShowEmojiPicker(false);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showCodeEditor || snippetCode.trim()
                      ? 'text-sky-500 bg-sky-50 dark:bg-sky-500/15'
                      : 'text-neutral-400 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Attach code snippet"
                >
                  <Code2 className="w-5 h-5" />
                </button>

                {/* Textarea */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Start a new message... (Enter to send)"
                    rows={1}
                    className="w-full py-2 px-3.5 rounded-2xl bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-sky-500 border border-transparent resize-none max-h-32 min-h-[38px] leading-relaxed"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={
                    (!inputText.trim() && !snippetCode.trim()) || sending
                  }
                  className="p-2.5 rounded-full bg-sky-500 text-white disabled:opacity-40 hover:bg-sky-400 active:bg-sky-600 transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State: No Conversation Selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="font-sans font-black text-2xl tracking-tight text-neutral-900 dark:text-white">
              Select a message
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-6 leading-relaxed">
              Choose from your existing conversations, or start a new one to talk code and concepts directly.
            </p>
            <button
              onClick={handleOpenNewChat}
              className="px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              New message
            </button>
          </div>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="New Direct Message"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder="Search people by name or @username..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none border border-neutral-200 dark:border-neutral-800 focus:border-sky-500"
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {loadingMembers ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Loading course members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No members found matching "{memberSearchQuery}".
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member._id}
                  onClick={() => handleStartChatWithMember(member)}
                  className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={member.avatarUrl}
                      name={member.name}
                      size="sm"
                      showRoleBadge={false}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        @{member.username}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-sky-500 hover:underline">
                    Message
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessagesPage;
