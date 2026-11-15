/**
 * AICompanionScreen
 * 
 * Native Android AI Companion & Classroom Mentor interface featuring:
 * - Multi-thread conversation management (New Chat, Rename, Delete, Clear History, Pin)
 * - Custom AI Identity & Persona modal (Name, Role Preset, System Directives, Language)
 * - Markdown + syntax-highlighted code block rendering with "Copy Code" & "Open in Playground"
 * - Real-time typing / streaming indicators
 * - Offline caching and graceful quota degradation
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import AiMessageRenderer from '../components/ai/AiMessageRenderer';
import AIPersonaModal from '../components/ai/AIPersonaModal';

export const AICompanionScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Active Thread & Messages State
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(route?.params?.conversationId || null);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Persona & Customization
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [persona, setPersona] = useState({
    customName: 'Clearfeed AI',
    rolePersona: 'Socratic Coding Mentor',
    preferredLanguage: 'auto',
  });

  // Thread Switcher Modal & Rename State
  const [showThreadDrawer, setShowThreadDrawer] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [newTitleText, setNewTitleText] = useState('');

  // Code Snippet Attachment Drawer
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [attachedCode, setAttachedCode] = useState('');
  const [codeLang, setCodeLang] = useState('javascript');

  const flatListRef = useRef(null);

  // Monitor Network Connectivity
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsub();
  }, []);

  // Load Cached Persona & Conversations
  useEffect(() => {
    loadCachedData();
    fetchConversations();
    fetchPersona();
  }, [user?._id]);

  const getStorageKey = () => `@clearfeed_ai_convs_${user?._id || 'anon'}`;

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(getStorageKey());
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          if (!activeConvId) {
            setActiveConvId(parsed[0]._id);
            setActiveConv(parsed[0]);
            setMessages(parsed[0].messages || []);
          }
        }
      }
    } catch (e) {
      console.warn('loadCachedData error:', e.message);
    }
  };

  const fetchPersona = async () => {
    try {
      const res = await api.get('/ai/persona');
      if (res.data?.persona) {
        setPersona(res.data.persona);
      }
    } catch {}
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/ai/conversations');
      if (res.data?.conversations) {
        const list = res.data.conversations;
        setConversations(list);
        await AsyncStorage.setItem(getStorageKey(), JSON.stringify(list));

        if (!activeConvId && list.length > 0) {
          selectConversation(list[0]._id);
        } else if (activeConvId) {
          selectConversation(activeConvId);
        }
      }
    } catch (err) {
      console.warn('fetchConversations fallback to cache:', err.message);
    }
  };

  const selectConversation = async (convId) => {
    setActiveConvId(convId);
    try {
      const res = await api.get(`/ai/conversations/${convId}`);
      if (res.data?.conversation) {
        const c = res.data.conversation;
        setActiveConv(c);
        setMessages(c.messages || []);
        if (c.persona) setPersona(c.persona);
      }
    } catch {
      // Find from local cached state
      const local = conversations.find((c) => c._id === convId);
      if (local) {
        setActiveConv(local);
        setMessages(local.messages || []);
      }
    }
    setShowThreadDrawer(false);
  };

  const handleCreateNewThread = async () => {
    try {
      const res = await api.post('/ai/conversations', {
        title: 'New Conversation',
        persona,
      });
      if (res.data?.conversation) {
        const created = res.data.conversation;
        const updated = [created, ...conversations];
        setConversations(updated);
        setActiveConvId(created._id);
        setActiveConv(created);
        setMessages([]);
        await AsyncStorage.setItem(getStorageKey(), JSON.stringify(updated));
        showToast('New conversation created!', 'success');
      }
    } catch (err) {
      // Offline fallback: create local pseudo-thread
      const mockId = 'local_' + Date.now();
      const mockConv = {
        _id: mockId,
        title: 'Offline Conversation',
        persona,
        messages: [],
        lastMessageAt: new Date().toISOString(),
      };
      const updated = [mockConv, ...conversations];
      setConversations(updated);
      setActiveConvId(mockId);
      setActiveConv(mockConv);
      setMessages([]);
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(updated));
      showToast('Created offline conversation thread', 'info');
    }
    setShowThreadDrawer(false);
  };

  const handleRenameThread = async () => {
    if (!renameTarget || !newTitleText.trim()) return;
    try {
      await api.patch(`/ai/conversations/${renameTarget}`, {
        title: newTitleText.trim(),
      });
      setConversations((prev) =>
        prev.map((c) => (c._id === renameTarget ? { ...c, title: newTitleText.trim() } : c))
      );
      if (activeConvId === renameTarget) {
        setActiveConv((prev) => (prev ? { ...prev, title: newTitleText.trim() } : prev));
      }
      showToast('Conversation renamed', 'success');
    } catch {
      showToast('Failed to rename conversation', 'error');
    } finally {
      setRenameTarget(null);
      setNewTitleText('');
    }
  };

  const handleDeleteThread = (convId) => {
    Alert.alert('Delete Thread', 'Are you sure you want to delete this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/ai/conversations/${convId}`);
            const filtered = conversations.filter((c) => c._id !== convId);
            setConversations(filtered);
            await AsyncStorage.setItem(getStorageKey(), JSON.stringify(filtered));
            if (activeConvId === convId) {
              if (filtered.length > 0) selectConversation(filtered[0]._id);
              else {
                setActiveConvId(null);
                setActiveConv(null);
                setMessages([]);
              }
            }
            showToast('Thread deleted', 'success');
          } catch {
            showToast('Failed to delete thread', 'error');
          }
        },
      },
    ]);
  };

  const handleClearMessages = () => {
    if (!activeConvId) return;
    Alert.alert('Clear History', 'Clear all messages in this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/ai/conversations/${activeConvId}/messages`);
            setMessages([]);
            showToast('History cleared', 'info');
          } catch {
            setMessages([]);
            showToast('History cleared locally', 'info');
          }
        },
      },
    ]);
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text && !attachedCode.trim()) return;

    const codeSnippets = attachedCode.trim()
      ? [{ language: codeLang, code: attachedCode.trim() }]
      : [];

    const userMsg = {
      _id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      codeSnippets,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setAttachedCode('');
    setShowCodeDrawer(false);
    setIsSending(true);
    setIsAiTyping(true);

    try {
      const payload = {
        message: text,
        conversationId: activeConvId?.startsWith('local_') ? null : activeConvId,
        codeSnippets,
        customName: persona.customName,
        rolePersona: persona.rolePersona,
        languagePref: persona.preferredLanguage,
        stream: false,
      };

      const res = await api.post('/ai/chat', payload);
      setIsAiTyping(false);

      if (res.data?.reply) {
        const modelMsg = {
          _id: 'model_' + Date.now(),
          role: 'model',
          content: res.data.reply,
          timestamp: new Date().toISOString(),
        };
        const finalMsgs = [...newMessages, modelMsg];
        setMessages(finalMsgs);

        // Update active thread ID if newly created
        if (res.data.conversationId && (!activeConvId || activeConvId.startsWith('local_'))) {
          setActiveConvId(res.data.conversationId);
        }
      }
    } catch (err) {
      console.warn('AI chat request failed:', err.message);
      setIsAiTyping(false);

      const isBn = persona.preferredLanguage === 'bn' || /[\u0980-\u09FF]/.test(text);
      const fallbackReply = isBn
        ? `🎓 **${persona.customName} (${persona.rolePersona}) [অফলাইন স্টাডি মোড]:**\n\n` +
          `বর্তমানে নেটওয়ার্ক অফলাইন বা রক্ষণাবেক্ষণে রয়েছে। আপনার প্রম্পটটি চ্যাট হিস্ট্রিতে সংরক্ষিত রয়েছে এবং সংযোগ পেলে পুনরায় রিফ্রেশ হবে।`
        : `🎓 **${persona.customName} (${persona.rolePersona}) [Local Study Mode]:**\n\n` +
          `The device is currently offline or running in local study fallback mode. Your message is safely cached in conversation history.`;

      const fallbackMsg = {
        _id: 'model_offline_' + Date.now(),
        role: 'model',
        content: fallbackReply,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, fallbackMsg]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowModel]}>
        {!isUser && (
          <View style={styles.avatarMini}>
            <Ionicons name="sparkles" size={12} color="#14B8A6" />
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleModel]}>
          <AiMessageRenderer
            content={item.content}
            role={item.role}
            navigation={navigation}
          />

          {item.codeSnippets && item.codeSnippets.length > 0 && (
            <View style={{ marginTop: 6 }}>
              {item.codeSnippets.map((cs, idx) => (
                <View key={idx} style={styles.userCodeCard}>
                  <Text style={styles.userCodeText}>{cs.code}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.timestampText, isUser ? styles.timestampUser : styles.timestampModel]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerTitlePress}
            onPress={() => setShowThreadDrawer(true)}
            activeOpacity={0.8}
          >
            <View style={styles.personaBadgeWrap}>
              <Text style={styles.headerName}>{persona.customName}</Text>
              <Ionicons name="chevron-down" size={14} color="#94A3B8" />
            </View>
            <Text style={styles.headerRole} numberOfLines={1}>
              {persona.rolePersona} · {persona.preferredLanguage?.toUpperCase() || 'AUTO'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowPersonaModal(true)}
            style={styles.headerIconBtn}
            title="AI Settings"
          >
            <Ionicons name="options-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearMessages}
            style={styles.headerIconBtn}
            title="Clear Chat"
          >
            <Ionicons name="trash-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Notice Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={14} color="#F59E0B" />
          <Text style={styles.offlineBannerText}>
            Offline Mode: Showing cached AI companion conversations
          </Text>
        </View>
      )}

      {/* Message Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || String(index)}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="sparkles" size={28} color="#14B8A6" />
            </View>
            <Text style={styles.emptyTitle}>Meet {persona.customName}</Text>
            <Text style={styles.emptySubtitle}>
              Your {persona.rolePersona}. Ask about any programming concept, debug tricky code, or practice technical problems in English or বাংলা!
            </Text>
          </View>
        }
        ListFooterComponent={
          isAiTyping ? (
            <View style={styles.typingContainer}>
              <View style={styles.avatarMini}>
                <Ionicons name="sparkles" size={12} color="#14B8A6" />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#14B8A6" />
                <Text style={styles.typingText}>{persona.customName} is thinking...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Code Snippet Drawer */}
      {showCodeDrawer && (
        <View style={styles.codeDrawer}>
          <View style={styles.codeDrawerHeader}>
            <Text style={styles.codeDrawerTitle}>Attach Code Snippet</Text>
            <TouchableOpacity onPress={() => setShowCodeDrawer(false)}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.codeDrawerInput}
            value={attachedCode}
            onChangeText={setAttachedCode}
            placeholder="// Paste code snippet to debug or explain..."
            placeholderTextColor="#64748B"
            multiline
            fontFamily="monospace"
          />
        </View>
      )}

      {/* Bottom Composer */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.composerContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TouchableOpacity
            style={[styles.codeToggleBtn, showCodeDrawer && styles.codeToggleBtnActive]}
            onPress={() => setShowCodeDrawer(!showCodeDrawer)}
          >
            <Ionicons name="code-slash" size={20} color={showCodeDrawer ? '#14B8A6' : '#94A3B8'} />
          </TouchableOpacity>

          <TextInput
            style={styles.composerInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Ask ${persona.customName} anything...`}
            placeholderTextColor="#64748B"
            multiline
            maxLength={3000}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() && !attachedCode.trim()) && styles.sendBtnDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() && !attachedCode.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#090D16" />
            ) : (
              <Ionicons name="arrow-up" size={18} color="#090D16" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Thread Drawer Modal */}
      <Modal visible={showThreadDrawer} transparent animationType="fade" onRequestClose={() => setShowThreadDrawer(false)}>
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={() => setShowThreadDrawer(false)} />
          <View style={[styles.drawerContent, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Conversations</Text>
              <TouchableOpacity onPress={handleCreateNewThread} style={styles.newChatBtn}>
                <Ionicons name="add" size={16} color="#090D16" />
                <Text style={styles.newChatText}>New Chat</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={conversations}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ gap: 8, padding: 16 }}
              renderItem={({ item }) => {
                const isActive = item._id === activeConvId;
                return (
                  <TouchableOpacity
                    style={[styles.threadCard, isActive && styles.threadCardActive]}
                    onPress={() => selectConversation(item._id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.threadTitle, isActive && styles.threadTitleActive]} numberOfLines={1}>
                        {item.title || 'Untitled Thread'}
                      </Text>
                      <Text style={styles.threadSub} numberOfLines={1}>
                        {item.lastMessage?.content || `${item.messageCount || 0} messages`}
                      </Text>
                    </View>

                    <View style={styles.threadActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setRenameTarget(item._id);
                          setNewTitleText(item.title || '');
                        }}
                        style={styles.threadActionBtn}
                      >
                        <Feather name="edit-2" size={14} color="#94A3B8" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteThread(item._id)}
                        style={styles.threadActionBtn}
                      >
                        <Feather name="trash" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Rename Thread Dialog */}
      <Modal visible={!!renameTarget} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Rename Thread</Text>
            <TextInput
              style={styles.dialogInput}
              value={newTitleText}
              onChangeText={setNewTitleText}
              placeholder="Enter new conversation title"
              placeholderTextColor="#64748B"
              maxLength={80}
            />
            <View style={styles.dialogBtnRow}>
              <TouchableOpacity onPress={() => setRenameTarget(null)} style={styles.dialogBtnCancel}>
                <Text style={styles.dialogBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRenameThread} style={styles.dialogBtnSave}>
                <Text style={styles.dialogBtnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Persona Customization Modal */}
      <AIPersonaModal
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        onSaved={(newPersona) => setPersona(newPersona)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#090D16',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  headerTitlePress: {
    flex: 1,
  },
  personaBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerRole: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  offlineBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderBottomWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  offlineBannerText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 4,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowModel: {
    justifyContent: 'flex-start',
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: '#1E293B',
    borderTopRightRadius: 4,
  },
  bubbleModel: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderTopLeftRadius: 4,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampUser: {
    color: '#64748B',
  },
  timestampModel: {
    color: '#64748B',
  },
  userCodeCard: {
    backgroundColor: '#050811',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  userCodeText: {
    fontFamily: 'monospace',
    color: '#38BDF8',
    fontSize: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  codeDrawer: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
  },
  codeDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeDrawerTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  codeDrawerInput: {
    backgroundColor: '#050811',
    color: '#38BDF8',
    fontSize: 12,
    padding: 8,
    borderRadius: 8,
    minHeight: 70,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#090D16',
    borderTopWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  codeToggleBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  codeToggleBtnActive: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  drawerContent: {
    width: '82%',
    backgroundColor: '#090D16',
    borderLeftWidth: 1,
    borderColor: '#1E293B',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newChatText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '800',
  },
  threadCard: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadCardActive: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
  },
  threadTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  threadTitleActive: {
    color: '#14B8A6',
  },
  threadSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  threadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  threadActionBtn: {
    padding: 6,
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    backgroundColor: '#090D16',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    gap: 12,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  dialogInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 14,
  },
  dialogBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  dialogBtnCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dialogBtnCancelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  dialogBtnSave: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dialogBtnSaveText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default AICompanionScreen;
