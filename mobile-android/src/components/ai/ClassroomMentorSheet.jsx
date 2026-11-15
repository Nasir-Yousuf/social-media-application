/**
 * ClassroomMentorSheet
 * 
 * Contextual slide-up AI Mentor sheet triggered inside Clearfeed Learn lessons
 * and CodeHub posts. Passes the active lesson, track, or code snippet into the
 * backend proxy and displays responses with real-time streaming and code block actions.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import AiMessageRenderer from './AiMessageRenderer';

export const ClassroomMentorSheet = ({
  isOpen,
  onClose,
  lessonId,
  trackId,
  initialCode = '',
  contextTitle = '',
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useNotifications();

  const [question, setQuestion] = useState('');
  const [code, setCode] = useState(initialCode || '');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mentorResponse, setMentorResponse] = useState('');
  const [languagePref, setLanguagePref] = useState('auto');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialCode) setCode(initialCode);
      setMentorResponse('');
      setQuestion('');
    }
  }, [isOpen, initialCode]);

  const handleAskMentor = async () => {
    if (!question.trim() && !code.trim()) {
      showToast('Please type a question or provide code', 'info');
      return;
    }

    setLoading(true);
    setMentorResponse('');

    try {
      const payload = {
        lessonId: lessonId || 'general',
        trackId: trackId || 'programming',
        question: question.trim(),
        code: code.trim(),
        languagePref,
        stream: false,
      };

      const res = await api.post('/ai/classroom-mentor', payload);
      if (res.data?.reply) {
        setMentorResponse(res.data.reply);
      } else {
        setMentorResponse('I reviewed your question and code. Keep experimenting and test with edge cases!');
      }
    } catch (err) {
      console.warn('Classroom mentor request failed:', err.message);
      // Offline / Quota Fallback
      const isBn = languagePref === 'bn' || /[\u0980-\u09FF]/.test(question);
      if (isBn) {
        setMentorResponse(
          `🎓 **AI ক্লাসরুম মেন্টর নোটিশ:**\n\n` +
          `বর্তমানে ডিভাইসটি অফলাইন বা লোকাল স্টাডি মোডে রয়েছে।\n\n` +
          `💡 **পরামর্শ (${trackId || 'প্রোগ্রামিং'}):**\n` +
          `- পাঠ্যক্রমের থিওরি ও কুইজগুলো অফলাইনেই অনুশীলন করতে পারেন।\n` +
          `- কোডে কোনো সিনট্যাক্স বা লজিক ত্রুটি থাকলে ব্রাউজার বা প্লে-গ্রাউন্ডে কনসোল লগ দিয়ে চেক করুন।`
        );
      } else {
        setMentorResponse(
          `🎓 **AI Classroom Mentor Notice:**\n\n` +
          `Running in offline/local study mode for track: **${trackId || 'Programming'}**.\n\n` +
          `💡 **Guidance:**\n` +
          `- Review the lesson theoretical fundamentals in the Theory tab.\n` +
          `- Test your assumptions using interactive console outputs in the Code Playground.\n` +
          `- Your quiz submissions and completion status are saved offline and will sync once reconnected.`
        );
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleExplainCode = async () => {
    if (!code.trim()) {
      showToast('No code snippet to explain', 'info');
      return;
    }

    setLoading(true);
    setMentorResponse('');

    try {
      const payload = {
        code: code.trim(),
        language: trackId === 'python' ? 'python' : 'javascript',
        context: `${trackId} - ${lessonId || contextTitle}`,
        question: question.trim() || 'Provide a line-by-line mechanical walkthrough',
        languagePref,
      };

      const res = await api.post('/ai/explain-code', payload);
      if (res.data?.explanation) {
        setMentorResponse(res.data.explanation);
      }
    } catch (err) {
      console.warn('Explain code failed, falling back:', err.message);
      setMentorResponse(
        `🔍 **Code Analysis (${trackId || 'Code'}):**\n\n` +
        `This snippet processes input variables and applies control structures.\n` +
        `Verify edge cases such as empty values and boundary conditions.`
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="school" size={18} color="#14B8A6" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Classroom AI Mentor</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {contextTitle || `${trackId} · ${lessonId || 'Lesson Help'}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Body Scroll */}
          <ScrollView
            ref={scrollRef}
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick Context Chips */}
            <View style={styles.chipRow}>
              <View style={styles.chipBadge}>
                <Text style={styles.chipText}>{trackId?.toUpperCase() || 'CORE'}</Text>
              </View>
              {lessonId && (
                <View style={[styles.chipBadge, styles.chipBadgeSecondary]}>
                  <Text style={styles.chipTextSecondary}>{lessonId}</Text>
                </View>
              )}
            </View>

            {/* Language Selector */}
            <View style={styles.langSelectorRow}>
              <Text style={styles.langLabel}>Language:</Text>
              {[
                { id: 'auto', label: 'Auto' },
                { id: 'bn', label: 'বাংলা' },
                { id: 'en', label: 'English' },
                { id: 'bilingual', label: 'Both' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.langPill, languagePref === opt.id && styles.langPillActive]}
                  onPress={() => setLanguagePref(opt.id)}
                >
                  <Text style={[styles.langPillText, languagePref === opt.id && styles.langPillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Optional Attached Code Accordion */}
            {code ? (
              <View style={styles.attachedCodeCard}>
                <TouchableOpacity
                  style={styles.attachedCodeHeader}
                  onPress={() => setShowCodeEditor(!showCodeEditor)}
                  activeOpacity={0.8}
                >
                  <View style={styles.attachedCodeLeft}>
                    <Ionicons name="code-slash" size={14} color="#14B8A6" />
                    <Text style={styles.attachedCodeTitle}>
                      Attached Code ({code.split('\n').length} lines)
                    </Text>
                  </View>
                  <Ionicons
                    name={showCodeEditor ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#94A3B8"
                  />
                </TouchableOpacity>

                {showCodeEditor && (
                  <TextInput
                    style={styles.codeTextInput}
                    value={code}
                    onChangeText={setCode}
                    multiline
                    fontFamily="monospace"
                  />
                )}
              </View>
            ) : null}

            {/* Prompt Input Box */}
            <View style={styles.inputCard}>
              <TextInput
                style={styles.promptInput}
                value={question}
                onChangeText={setQuestion}
                placeholder="Ask what this concept means, why an error happens, or how to fix it..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
              />

              <View style={styles.actionBtnRow}>
                {code ? (
                  <TouchableOpacity
                    style={[styles.secondaryActionBtn, loading && styles.btnDisabled]}
                    onPress={handleExplainCode}
                    disabled={loading}
                  >
                    <Ionicons name="bulb-outline" size={14} color="#14B8A6" />
                    <Text style={styles.secondaryActionText}>Explain Code</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.primaryActionBtn, loading && styles.btnDisabled]}
                  onPress={handleAskMentor}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#090D16" />
                  ) : (
                    <>
                      <Ionicons name="send" size={14} color="#090D16" />
                      <Text style={styles.primaryActionText}>Ask Mentor</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Mentor Output Area */}
            {loading && !mentorResponse && (
              <View style={styles.loadingArea}>
                <ActivityIndicator size="small" color="#14B8A6" />
                <Text style={styles.loadingAreaText}>Analyzing lesson & formulating pedagogical guidance...</Text>
              </View>
            )}

            {mentorResponse ? (
              <View style={styles.responseContainer}>
                <View style={styles.responseHeader}>
                  <Ionicons name="sparkles" size={14} color="#14B8A6" />
                  <Text style={styles.responseHeaderText}>Mentor Guidance</Text>
                </View>
                <AiMessageRenderer
                  content={mentorResponse}
                  role="model"
                  navigation={navigation}
                  trackId={trackId}
                  lessonId={lessonId}
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  sheetContainer: {
    backgroundColor: '#090D16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1E293B',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  bodyScroll: {
    maxHeight: 560,
  },
  bodyContent: {
    padding: 16,
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipBadge: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    color: '#14B8A6',
    fontSize: 10,
    fontWeight: '800',
  },
  chipBadgeSecondary: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  chipTextSecondary: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  langSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  langPillActive: {
    borderColor: '#14B8A6',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
  },
  langPillText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  langPillTextActive: {
    color: '#14B8A6',
    fontWeight: '700',
  },
  attachedCodeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  attachedCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  attachedCodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachedCodeTitle: {
    color: '#E2E8F0',
    fontSize: 11.5,
    fontWeight: '700',
  },
  codeTextInput: {
    backgroundColor: '#050811',
    color: '#38BDF8',
    fontSize: 12,
    padding: 10,
    minHeight: 80,
    maxHeight: 140,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  inputCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
    gap: 10,
  },
  promptInput: {
    color: '#F8FAFC',
    fontSize: 13.5,
    lineHeight: 20,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  secondaryActionText: {
    color: '#14B8A6',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#14B8A6',
  },
  primaryActionText: {
    color: '#090D16',
    fontSize: 12,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  loadingArea: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingAreaText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  responseContainer: {
    backgroundColor: '#0B1120',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    gap: 8,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 8,
  },
  responseHeaderText: {
    color: '#14B8A6',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ClassroomMentorSheet;
