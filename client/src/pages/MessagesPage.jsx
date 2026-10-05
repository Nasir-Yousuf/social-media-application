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
import {
  WhatsAppReactionPicker,
  WhatsAppReactionsBadge,
  WhatsAppReactionsModal,
} from '../components/chat/WhatsAppReactions';

const QUICK_EMOJIS = ['😀', '😂', '🔥', '🚀', '💻', '💡', '⚡', '❤️', '🎯', '🎉', '✨', '☕', '🧠', '🐛', '👍', '🙌', '🤝', '💯', '🔒', '🛠️'];

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React / JSX' },
  { value: 'html', label: 'HTML5' },
  { value: 'css', label: 'CSS3' },
  { value: 'sql', label: 'SQL' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash / Shell' },
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
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState(null);
  const [reactionModalData, setReactionModalData] = useState({
    isOpen: false,
    reactions: [],
    messageId: null,
  });

  // Search & Filters
  const [conversationSearch, setConversationSearch] = useState('');
  const [convFilter, setConvFilter] = useState('all'); // 'all' | 'unread'
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

  // Format message time (clean time since date separators group the days)
  const formatMessageTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return format(d, 'h:mm a');
    } catch {
      return '';
    }
  };

  // Format date header for message stream grouping
  const getMessageDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isToday(d)) return 'Today';
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'EEEE, MMMM d, yyyy');
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

  // Copy message text to clipboard
  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast('Message copied to clipboard', 'success');
  };

  // WhatsApp Message Reactions: Add, switch, or remove
  const handleReactToMessage = async (msgId, emoji) => {
    if (!msgId || !emoji) return;

    const targetMsg = messages.find((m) => m._id === msgId);
    if (!targetMsg) return;

    const currentReactions = Array.isArray(targetMsg.reactions) ? targetMsg.reactions : [];
    const myExistingReaction = currentReactions.find((r) => {
      const uId = r.user?._id || r.user;
      return String(uId) === String(currentUser?._id);
    });

    let optimisticReactions;
    if (myExistingReaction && myExistingReaction.emoji === emoji) {
      // Toggle off / remove
      optimisticReactions = currentReactions.filter((r) => {
        const uId = r.user?._id || r.user;
        return String(uId) !== String(currentUser?._id);
      });
    } else if (myExistingReaction) {
      // Replace with new emoji
      optimisticReactions = currentReactions.map((r) => {
        const uId = r.user?._id || r.user;
        if (String(uId) === String(currentUser?._id)) {
          return {
            ...r,
            emoji,
            createdAt: new Date(),
          };
        }
        return r;
      });
    } else {
      // Add new reaction
      optimisticReactions = [
        ...currentReactions,
        {
          _id: `temp-${Date.now()}`,
          user: {
            _id: currentUser?._id,
            name: currentUser?.name,
            username: currentUser?.username,
            avatarUrl: currentUser?.avatarUrl,
          },
          emoji,
          createdAt: new Date(),
        },
      ];
    }

    // Immediate optimistic update for instantaneous feedback
    setMessages((prev) =>
      prev.map((m) => (m._id === msgId ? { ...m, reactions: optimisticReactions } : m))
    );

    try {
      const res = await api.post(`/messages/${msgId}/react`, { emoji });
      if (res.data?.reactions) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, reactions: res.data.reactions } : m))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update reaction', 'error');
      if (activeConversation?._id) {
        fetchMessages(activeConversation._id, true);
      }
    }
  };

  // Remove reaction explicitly from reaction modal
  const handleRemoveReaction = async (msgId) => {
    if (!msgId) return;

    setMessages((prev) =>
      prev.map((m) => {
        if (m._id === msgId && Array.isArray(m.reactions)) {
          return {
            ...m,
            reactions: m.reactions.filter((r) => {
              const uId = r.user?._id || r.user;
              return String(uId) !== String(currentUser?._id);
            }),
          };
        }
        return m;
      })
    );

    try {
      const res = await api.post(`/messages/${msgId}/react`, { remove: true });
      if (res.data?.reactions) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, reactions: res.data.reactions } : m))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove reaction', 'error');
    }
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

  // Unread conversations count
  const unreadTotal = conversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0);

  // Filter conversations by search and filter tab
  const filteredConversations = conversations.filter((c) => {
    if (convFilter === 'unread' && !(c.unreadCount > 0)) {
      return false;
    }
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
        } flex-col w-full md:w-[320px] lg:w-[360px] xl:w-[390px] border-r border-neutral-200/80 dark:border-neutral-800/80 shrink-0 h-full overflow-hidden select-none bg-white dark:bg-black transition-all`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-black text-xl tracking-tight text-neutral-900 dark:text-white">
              Messages
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              Direct
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenNewChat}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-sky-500 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title="Start new conversation"
          >
            <PenSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Tabs */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-900/80 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={conversationSearch}
              onChange={(e) => setConversationSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9.5 pr-8 py-2 rounded-full bg-neutral-100 dark:bg-[#16181c] text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-[#0c0d10] focus:ring-2 focus:ring-sky-500/15 transition-all"
            />
            {conversationSearch && (
              <button
                type="button"
                onClick={() => setConversationSearch('')}
                className="absolute right-2.5 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 px-0.5">
            <button
              type="button"
              onClick={() => setConvFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                convFilter === 'all'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60'
              }`}
            >
              All {conversations.length > 0 && <span className="opacity-80 text-[11px] ml-0.5">({conversations.length})</span>}
            </button>
            <button
              type="button"
              onClick={() => setConvFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                convFilter === 'unread'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60'
              }`}
            >
              <span>Unread</span>
              {unreadTotal > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black leading-none ${
                    convFilter === 'unread'
                      ? 'bg-white text-sky-600'
                      : 'bg-sky-500 text-white'
                  }`}
                >
                  {unreadTotal}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation List Stream */}
        <div className="flex-1 overflow-y-auto overscroll-contain sidebar-scroll py-1.5">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-800/60 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center mx-auto text-neutral-400">
                <MessageSquare className="w-6 h-6 opacity-75" />
              </div>
              <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                {conversationSearch
                  ? 'No matching conversations'
                  : convFilter === 'unread'
                  ? 'No unread messages'
                  : 'No messages yet'}
              </p>
              <p className="max-w-xs mx-auto leading-relaxed text-neutral-500 dark:text-neutral-400">
                {conversationSearch
                  ? 'Try searching with a different name or username.'
                  : convFilter === 'unread'
                  ? 'You are all caught up on your conversations!'
                  : 'Start a direct conversation with classmates to discuss code and assignments privately.'}
              </p>
              {convFilter === 'unread' ? (
                <button
                  type="button"
                  onClick={() => setConvFilter('all')}
                  className="px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  View all conversations
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenNewChat}
                  className="px-4 py-1.5 rounded-full bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  Write a message
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?._id === conv._id;
              const hasUnread = conv.unreadCount > 0;

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`group relative flex items-start gap-3 mx-2 my-1 p-3 rounded-2xl transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/10 dark:bg-sky-500/15 border border-sky-400/40 dark:border-sky-500/30 shadow-xs'
                      : 'border border-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full bg-sky-500" />
                  )}

                  <div className="shrink-0 relative">
                    <Avatar
                      src={conv.otherUser?.avatarUrl}
                      name={conv.otherUser?.name}
                      size="md"
                      showRoleBadge={false}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-xs sm:text-sm truncate ${isSelected ? 'font-black text-sky-950 dark:text-sky-100' : 'font-bold text-neutral-900 dark:text-neutral-100'}`}>
                          {conv.otherUser?.name || 'Classmate'}
                        </span>
                        <span className="text-[11px] text-neutral-500 truncate hidden sm:inline">
                          @{conv.otherUser?.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-neutral-400 font-medium">
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
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                            title="Delete conversation"
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
                          <span className="text-sky-500 font-mono text-[11px] inline-flex items-center gap-1">
                            <Code2 className="w-3.5 h-3.5" />
                            Code snippet
                          </span>
                        ) : (
                          conv.lastMessage?.text || 'Started a conversation'
                        )}
                      </p>

                      {hasUnread && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-sky-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs animate-pulse">
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
        } flex-col flex-1 min-w-0 h-[100dvh] md:h-screen overflow-hidden bg-white dark:bg-black transition-all`}
      >
        {activeConversation ? (
          <>
            {/* Active Chat Header */}
            <div className="h-16 px-4 sm:px-6 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-between shrink-0 z-10 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={handleBackToConversations}
                  className="md:hidden p-2 -ml-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 active:scale-95 transition-transform cursor-pointer shrink-0"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <NavLink
                  to={`/profile/${activeConversation.otherUser?.username}`}
                  className="shrink-0 relative group"
                >
                  <Avatar
                    src={activeConversation.otherUser?.avatarUrl}
                    name={activeConversation.otherUser?.name}
                    size="md"
                    showRoleBadge={false}
                  />
                </NavLink>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <NavLink
                      to={`/profile/${activeConversation.otherUser?.username}`}
                      className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hover:text-sky-500 transition-colors truncate"
                    >
                      {activeConversation.otherUser?.name}
                    </NavLink>
                    <span className="text-xs text-neutral-500 truncate hidden sm:inline">
                      @{activeConversation.otherUser?.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Direct chat
                    </span>
                    {activeConversation.otherUser?.status && (
                      <span className="text-neutral-400 truncate hidden md:inline">
                        · {activeConversation.otherUser?.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1">
                <NavLink
                  to={`/profile/${activeConversation.otherUser?.username}`}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-sky-500 transition-colors"
                  title="View Profile"
                >
                  <User className="w-4 h-4" />
                </NavLink>
                <button
                  type="button"
                  onClick={() => handleClearConversation(activeConversation._id)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-amber-500 transition-colors cursor-pointer"
                  title="Clear all messages in chat"
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
              </div>
            </div>

            {/* Message Thread Scroll Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3 bg-neutral-50/40 dark:bg-[#0b0d11] sidebar-scroll">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-400 space-y-3 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto shadow-2xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                    Start of your conversation
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Direct messages with @{activeConversation.otherUser?.username} are private. Send a greeting, share questions, or collaborate with code snippets!
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const senderId = typeof msg.sender === 'object' && msg.sender !== null ? msg.sender._id : msg.sender;
                  const isMe = String(senderId) === String(currentUser?._id);
                  const hasSnippet = msg.codeSnippet && msg.codeSnippet.code;
                  const isTemp = typeof msg._id === 'string' && msg._id.startsWith('temp-');
                  const isSending = msg.status === 'sending' || isTemp;
                  const isFailed = msg.status === 'failed';
                  const hasReactions = Array.isArray(msg.reactions) && msg.reactions.length > 0;
                  const currentUserReaction = msg.reactions?.find((r) => {
                    const uId = r.user?._id || r.user;
                    return String(uId) === String(currentUser?._id);
                  })?.emoji;

                  const currentDateLabel = getMessageDateLabel(msg.createdAt);
                  const prevDateLabel = idx > 0 ? getMessageDateLabel(messages[idx - 1].createdAt) : null;
                  const showDateSeparator = currentDateLabel && currentDateLabel !== prevDateLabel;

                  return (
                    <React.Fragment key={msg._id || idx}>
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4 select-none">
                          <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-neutral-200/70 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 shadow-2xs border border-neutral-300/40 dark:border-neutral-700/50">
                            {currentDateLabel}
                          </span>
                        </div>
                      )}

                      <div
                        className={`group/msg flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full my-0.5`}
                      >
                        <div className={`relative flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-full`}>
                          {/* WhatsApp Floating Reaction Bar Capsule */}
                          {reactionPickerMsgId === msg._id && (
                            <WhatsAppReactionPicker
                              messageId={msg._id}
                              isMe={isMe}
                              currentUserReaction={currentUserReaction}
                              onReact={handleReactToMessage}
                              onClose={() => setReactionPickerMsgId(null)}
                            />
                          )}

                          <div
                            onClick={() => {
                              if (window.getSelection()?.toString()) return;
                              if (window.innerWidth < 768 && !isFailed && !isSending) {
                                setReactionPickerMsgId((prev) => (prev === msg._id ? null : msg._id));
                              }
                            }}
                            className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] rounded-2xl p-3 sm:p-3.5 text-sm leading-relaxed shadow-xs transition-all relative ${
                              hasReactions ? 'mb-3.5' : ''
                            } ${
                              isFailed
                                ? 'border-2 border-rose-500/80 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                                : isMe
                                ? isSending
                                  ? 'bg-gradient-to-br from-sky-500/90 to-sky-600/90 text-white rounded-br-xs'
                                  : 'bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-br-xs'
                                : 'bg-white dark:bg-[#181b22] text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-800/80 rounded-bl-xs'
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
                                    ? 'bg-neutral-950/90 border-white/20 text-white'
                                    : 'bg-[#121418] border-neutral-800 text-neutral-200'
                                }`}
                              >
                                <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/10 text-[10px]">
                                  <span className="font-bold uppercase tracking-wider text-sky-400">
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
                                <pre className="p-3 overflow-x-auto text-xs leading-relaxed max-h-64 font-mono sidebar-scroll">
                                  <code>{msg.codeSnippet.code}</code>
                                </pre>
                              </div>
                            )}

                            {/* WhatsApp Reactions Overlapping Badge */}
                            {hasReactions && (
                              <WhatsAppReactionsBadge
                                reactions={msg.reactions}
                                currentUserId={currentUser?._id}
                                isMe={isMe}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReactionModalData({
                                    isOpen: true,
                                    reactions: msg.reactions,
                                    messageId: msg._id,
                                  });
                                }}
                              />
                            )}
                          </div>

                          {/* Desktop/Touch Action Toolbar */}
                          <div
                            className={`flex items-center gap-0.5 transition-opacity shrink-0 ${
                              isMe ? 'flex-row-reverse' : 'flex-row'
                            } ${
                              reactionPickerMsgId === msg._id
                                ? 'opacity-100'
                                : 'opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100'
                            }`}
                          >
                            {/* WhatsApp Reaction Trigger Button */}
                            {!isFailed && !isSending && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReactionPickerMsgId((prev) => (prev === msg._id ? null : msg._id));
                                }}
                                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                  reactionPickerMsgId === msg._id
                                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 opacity-100'
                                    : 'hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                                }`}
                                title="Add reaction"
                              >
                                <Smile className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {msg.text && (
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.text)}
                                className="p-1.5 rounded-full hover:bg-neutral-200/80 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                                title="Copy message text"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isFailed ? (
                              <div className="flex items-center gap-0.5">
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
                            ) : isMe && !isSending ? (
                              deletingMsgId === msg._id ? (
                                <span className="p-1.5 flex items-center justify-center">
                                  <TwitterSpinner size="xs" className="text-rose-500" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  className="p-1.5 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            ) : null}
                          </div>
                        </div>

                        {/* Timestamp & Status Indicator */}
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1 px-1 select-none">
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
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Rich Composer Bar */}
            <div className="p-3 sm:p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-md shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {/* Emoji Drawer */}
              {showEmojiPicker && (
                <div className="p-2.5 mb-2 max-h-40 sm:max-h-48 overflow-y-auto bg-neutral-100 dark:bg-[#16181c] border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-wrap gap-1.5 shadow-inner sidebar-scroll animate-fade-in">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setInputText((prev) => prev + emoji)}
                      className="text-xl p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700/60 active:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Code Snippet Drawer */}
              {showCodeEditor && (
                <div className="p-3 mb-2.5 bg-[#14161a] border border-[#262930] rounded-2xl space-y-2 text-xs font-mono shadow-inner animate-fade-in">
                  <div className="flex items-center justify-between text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      <span className="font-bold text-white">Attach Code Snippet</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={snippetLang}
                        onChange={(e) => setSnippetLang(e.target.value)}
                        className="bg-[#20232a] text-white px-2 py-1 rounded-lg border border-[#30343e] text-xs outline-none cursor-pointer"
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
                        title="Cancel snippet"
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
                    className="w-full bg-[#1b1e24] p-2.5 rounded-xl text-xs font-mono text-neutral-200 placeholder:text-neutral-500 focus:outline-none resize-y border border-[#2a2e38] sidebar-scroll"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Text Input Row */}
              <form onSubmit={handleSendMessage} className="space-y-1.5">
                <div className="flex items-end gap-2 bg-neutral-100 dark:bg-[#16181c] border border-neutral-200/80 dark:border-neutral-800/80 focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/15 focus-within:bg-white dark:focus-within:bg-[#0c0d10] rounded-2xl p-1.5 sm:p-2 transition-all">
                  {/* Emoji toggle button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowCodeEditor(false);
                    }}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      showEmojiPicker
                        ? 'text-sky-500 bg-sky-50 dark:bg-sky-500/15'
                        : 'text-neutral-400 hover:text-sky-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
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
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      showCodeEditor || snippetCode.trim()
                        ? 'text-sky-500 bg-sky-50 dark:bg-sky-500/15'
                        : 'text-neutral-400 hover:text-sky-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
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
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
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
                      className="w-full py-1.5 px-2 bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none resize-none max-h-36 min-h-[36px] leading-relaxed"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() && !snippetCode.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white disabled:opacity-40 hover:from-sky-400 hover:to-sky-500 active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Desktop keyboard hint */}
                <div className="hidden sm:flex items-center justify-between px-2 text-[11px] text-neutral-400 dark:text-neutral-500 select-none">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-300">Enter</kbd> to send</span>
                  <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-300">Shift + Enter</kbd> for new line</span>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* Empty State: No Conversation Selected (Desktop) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-neutral-50/20 dark:bg-[#0b0d11]/40">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-sky-500/10 to-indigo-500/20 text-sky-500 flex items-center justify-center shadow-inner border border-sky-500/20">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <h2 className="font-sans font-black text-2xl tracking-tight text-neutral-900 dark:text-white">
              Select a conversation
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mt-2 mb-6 leading-relaxed">
              Choose an existing conversation from the list or start a new direct message with any classmate or instructor.
            </p>
            <button
              onClick={handleOpenNewChat}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <PenSquare className="w-4 h-4" />
              <span>New message</span>
            </button>
            <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Tip: You can share live code snippets directly in your chats</span>
            </div>
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
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder="Search classmates by name or @username..."
              className="w-full pl-9.5 pr-8 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#16181c] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none border border-neutral-200 dark:border-neutral-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              autoFocus
            />
            {memberSearchQuery && (
              <button
                type="button"
                onClick={() => setMemberSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80 sidebar-scroll pr-1">
            {loadingMembers ? (
              <div className="py-8 text-center text-xs text-neutral-400 space-y-2">
                <TwitterSpinner size="sm" className="mx-auto text-sky-500" />
                <p>Loading member directory...</p>
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

                  <span className="text-xs font-semibold text-sky-500 bg-sky-50 dark:bg-sky-500/10 px-3 py-1 rounded-full hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                    Chat
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* WhatsApp Message Reactions Detail Modal */}
      <WhatsAppReactionsModal
        isOpen={reactionModalData.isOpen}
        onClose={() => setReactionModalData({ isOpen: false, reactions: [], messageId: null })}
        reactions={reactionModalData.reactions}
        currentUserId={currentUser?._id}
        onRemoveReaction={() => {
          if (reactionModalData.messageId) {
            handleRemoveReaction(reactionModalData.messageId);
          }
        }}
      />
    </div>
  );
};

export default MessagesPage;
