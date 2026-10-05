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
  RotateCcw,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import TwitterSpinner from '../components/common/TwitterSpinner';
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

  // Composer state
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLang, setSnippetLang] = useState('javascript');
  const [deletingMsgId, setDeletingMsgId] = useState(null);
  const [deletingConvId, setDeletingConvId] = useState(null);

  // Search & New Conversation Modal
  const [conversationSearch, setConversationSearch] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [directoryMembers, setDirectoryMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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

  // Fetch messages for a specific conversation without wiping pending optimistic messages
  const fetchMessages = useCallback(async (convId, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/conversations/${convId}`);
      const serverMessages = res.data.messages || [];

      setMessages((prev) => {
        // Collect in-flight optimistic or failed messages
        const pendingOptimistic = prev.filter(
          (m) =>
            (typeof m._id === 'string' && m._id.startsWith('temp-')) ||
            m.status === 'sending' ||
            m.status === 'failed'
        );

        if (pendingOptimistic.length === 0) {
          return serverMessages;
        }

        const serverIds = new Set(serverMessages.map((m) => m._id));

        // Keep optimistic messages that haven't yet been confirmed in server messages
        const stillPending = pendingOptimistic.filter((opt) => {
          if (serverIds.has(opt._id)) return false;

          // Check if a server message matches sender, text, and is within 15 seconds
          const alreadyOnServer = serverMessages.some((sm) => {
            const smSenderId = typeof sm.sender === 'object' && sm.sender?._id ? sm.sender._id : sm.sender;
            const optSenderId = typeof opt.sender === 'object' && opt.sender?._id ? opt.sender._id : opt.sender;
            const sameSender = String(smSenderId) === String(optSenderId);
            const sameText = (sm.text || '') === (opt.text || '');
            const timeDiff = Math.abs(new Date(sm.createdAt).getTime() - new Date(opt.createdAt).getTime());
            return sameSender && sameText && timeDiff < 15000;
          });

          return !alreadyOnServer;
        });

        return [...serverMessages, ...stillPending];
      });

      if (!silent) {
        setTimeout(() => scrollToBottom(false), 20);
      }
    } catch {
      if (!silent) showToast('Could not load messages', 'error');
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

  // Back to conversations list on mobile
  const handleBackToConversations = () => {
    setActiveConversation(null);
    if (searchParams.get('user')) {
      setSearchParams({});
    }
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

  // Send message with instant 0ms optimistic UI update
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmedText = inputText.trim();
    const hasCode = snippetCode.trim().length > 0;

    if ((!trimmedText && !hasCode) || !activeConversation) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();

    const codeSnippetPayload = hasCode
      ? {
          language: snippetLang,
          code: snippetCode.trim(),
        }
      : undefined;

    const payload = {
      conversationId: activeConversation._id,
      text: trimmedText,
      codeSnippet: codeSnippetPayload,
    };

    // 1. Instant optimistic message bubble (0ms perceived latency)
    const optimisticMessage = {
      _id: tempId,
      conversation: activeConversation._id,
      sender: {
        _id: currentUser?._id,
        name: currentUser?.name,
        username: currentUser?.username,
        avatarUrl: currentUser?.avatarUrl,
      },
      recipient: activeConversation.otherUser?._id,
      text: trimmedText,
      codeSnippet: codeSnippetPayload,
      isRead: false,
      status: 'sending',
      createdAt: nowIso,
    };

    // 2. Append optimistic bubble to active thread immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    // 3. Clear text/code composer immediately so user can keep typing
    setInputText('');
    setSnippetCode('');
    setShowCodeEditor(false);
    setShowEmojiPicker(false);

    // Reset textarea height and keep focus
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }

    // 4. Instant scroll to bottom
    scrollToBottom(false);

    // 5. Optimistically update conversations list in the sidebar with 0ms delay
    setConversations((prev) => {
      const activeIdx = prev.findIndex((c) => c._id === activeConversation._id);
      if (activeIdx === -1) return prev;
      const targetConv = {
        ...prev[activeIdx],
        lastMessage: {
          text: trimmedText || (hasCode ? 'Shared a code snippet' : 'New message'),
          hasCode: Boolean(hasCode),
          sender: {
            _id: currentUser?._id,
            name: currentUser?.name,
            username: currentUser?.username,
          },
          createdAt: nowIso,
        },
        updatedAt: nowIso,
      };
      const rest = prev.filter((_, idx) => idx !== activeIdx);
      return [targetConv, ...rest];
    });

    // 6. Deliver to MongoDB in background without locking UI
    try {
      const res = await api.post('/messages/send', payload);
      const savedMessage = res.data.data;

      // Reconcile temporary message with saved record
      setMessages((prev) => {
        const hasTemp = prev.some((m) => m._id === tempId);
        if (hasTemp) {
          return prev.map((m) =>
            m._id === tempId ? { ...savedMessage, status: 'sent' } : m
          );
        }
        if (!prev.some((m) => m._id === savedMessage._id)) {
          return [...prev, { ...savedMessage, status: 'sent' }];
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
      // Mark bubble as failed instead of dropping it silently
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  // Retry sending a failed message
  const handleRetryMessage = async (failedMsg) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === failedMsg._id ? { ...m, status: 'sending' } : m))
    );

    const payload = {
      conversationId: failedMsg.conversation,
      text: failedMsg.text,
      codeSnippet: failedMsg.codeSnippet,
    };

    try {
      const res = await api.post('/messages/send', payload);
      const savedMessage = res.data.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === failedMsg._id ? { ...savedMessage, status: 'sent' } : m))
      );
      fetchConversations(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resend message', 'error');
      setMessages((prev) =>
        prev.map((m) => (m._id === failedMsg._id ? { ...m, status: 'failed' } : m))
      );
    }
  };

  // Dismiss a failed message bubble
  const handleDismissFailedMessage = (msgId) => {
    setMessages((prev) => prev.filter((m) => m._id !== msgId));
  };

  // Copy code snippet to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard', 'success');
  };

  // Delete individual message
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    setDeletingMsgId(msgId);
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      fetchConversations(true);
      showToast('Message deleted', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete message', 'error');
    } finally {
      setDeletingMsgId(null);
    }
  };

  // Delete entire conversation and its messages
  const handleDeleteConversation = async (convId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this entire conversation? All messages will be permanently removed from MongoDB storage.')) return;
    setDeletingConvId(convId);
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
    } finally {
      setDeletingConvId(null);
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
    <div className="flex h-[calc(100dvh-3.25rem-3.5rem)] md:h-screen w-full bg-white dark:bg-black font-sans overflow-hidden">
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
        <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-neutral-100/60 dark:divide-neutral-900/60">
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
                        {deletingConvId === conv._id ? (
                          <span className="p-1 flex items-center justify-center">
                            <TwitterSpinner size="xs" className="text-rose-500" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteConversation(conv._id, e)}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                            title="Delete conversation & all messages"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
          activeConversation
            ? 'fixed inset-0 z-50 md:relative md:inset-auto md:z-auto flex'
            : 'hidden md:flex'
        } flex-col flex-1 h-[100dvh] md:h-screen overflow-hidden bg-white dark:bg-black transition-all`}
      >
        {activeConversation ? (
          <>
            {/* Active Chat Header */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={handleBackToConversations}
                  className="md:hidden p-2 -ml-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 active:scale-95 transition-transform cursor-pointer shrink-0"
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
                  disabled={deletingConvId === activeConversation._id}
                  onClick={(e) => handleDeleteConversation(activeConversation._id, e)}
                  className="p-2 rounded-full hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete conversation & all messages"
                >
                  {deletingConvId === activeConversation._id ? (
                    <TwitterSpinner size="xs" className="text-rose-500" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
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
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3">
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
                  const senderId = typeof msg.sender === 'object' && msg.sender !== null ? msg.sender._id : msg.sender;
                  const isMe = String(senderId) === String(currentUser?._id);
                  const hasSnippet = msg.codeSnippet && msg.codeSnippet.code;
                  const isTemp = typeof msg._id === 'string' && msg._id.startsWith('temp-');
                  const isSending = msg.status === 'sending' || isTemp;
                  const isFailed = msg.status === 'failed';

                  return (
                    <div
                      key={msg._id || idx}
                      className={`group/msg flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
                    >
                      <div className={`relative flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-full`}>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 text-sm leading-relaxed shadow-xs transition-all ${
                            isFailed
                              ? 'border-2 border-rose-500/80 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                              : isMe
                              ? isSending
                                ? 'bg-sky-500/90 text-white rounded-br-xs'
                                : 'bg-sky-500 text-white rounded-br-xs'
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

                        {/* Action buttons beside bubble */}
                        {isFailed ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRetryMessage(msg)}
                              className="p-1.5 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                              title="Retry sending message"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDismissFailedMessage(msg._id)}
                              className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                              title="Dismiss failed message"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : !isSending ? (
                          deletingMsgId === msg._id ? (
                            <span className="p-1.5 flex items-center justify-center shrink-0">
                              <TwitterSpinner size="xs" className="text-rose-500" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="opacity-0 group-hover/msg:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 cursor-pointer shrink-0"
                              title="Delete this message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : null}
                      </div>

                      {/* Timestamp & Delivered status */}
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1 px-1">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMe && (
                          <span className="inline-flex items-center">
                            {isFailed ? (
                              <span className="text-rose-500 font-semibold ml-1">Failed to send</span>
                            ) : isSending ? (
                              <span className="inline-flex items-center ml-1 text-sky-400" title="Sending...">
                                <span className="w-2.5 h-2.5 border-1.5 border-sky-400 border-t-transparent rounded-full animate-spin inline-block" />
                              </span>
                            ) : msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-sky-500 ml-0.5" title="Read" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-neutral-400 ml-0.5" title="Delivered" />
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
            <div className="p-2.5 sm:p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-black shrink-0 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
              {/* Emoji Drawer */}
              {showEmojiPicker && (
                <div className="p-2 mb-2 max-h-36 sm:max-h-48 overflow-y-auto bg-neutral-100 dark:bg-[#16181c] border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-wrap gap-1 shadow-inner animate-fade-in">
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
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                    }}
                    onKeyDown={(e) => {
                      const isMobile =
                        typeof window !== 'undefined' &&
                        (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
                      if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Start a new message... (Enter to send)"
                    rows={1}
                    className="w-full py-2 px-3 sm:px-3.5 rounded-2xl bg-neutral-100 dark:bg-[#16181c] text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-sky-500 border border-transparent resize-none max-h-32 min-h-[38px] leading-relaxed transition-all"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() && !snippetCode.trim()}
                  className="p-2 sm:p-2.5 rounded-full bg-sky-500 text-white disabled:opacity-40 hover:bg-sky-400 active:bg-sky-600 transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center"
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
