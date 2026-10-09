import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, Feather, Octicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Button from '../components/Button';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LESSONS } from '../data/learningCurriculum';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';

export const LessonDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { trackId, lessonId, lang: initialLang = 'both', onCompleted } = route.params;
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [lang, setLang] = useState(initialLang); // 'en' | 'bn' | 'both'
  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'playground' | 'quiz'
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Playground code state
  const [playgroundCode, setPlaygroundCode] = useState('');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // Find lesson from curriculum data
  const lesson = LESSONS.find((l) => l.id === lessonId) || LESSONS[0];
  const quiz = LESSON_QUIZZES[lessonId] || null;

  useEffect(() => {
    if (lesson?.starterCode?.html || lesson?.exampleCode?.html) {
      setPlaygroundCode(lesson.starterCode?.html || lesson.exampleCode?.html || '');
    }
  }, [lesson]);

  const handleCopyCode = async (code) => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    showToast('Code copied to clipboard!', 'success');
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      if (user) {
        await api.post('/learning/progress/complete', {
          lessonId: lesson.id,
          track: trackId || lesson.track,
        });
      }
      setIsCompleted(true);
      showToast('🎉 Lesson completed! +25 XP awarded', 'success');
      if (onCompleted) onCompleted();
    } catch (err) {
      // Local fallback
      setIsCompleted(true);
      showToast('Lesson marked as completed! (+25 XP)', 'success');
    } finally {
      setCompleting(false);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = LESSONS.findIndex((l) => l.id === lessonId);
    if (currentIndex >= 0 && currentIndex < LESSONS.length - 1) {
      const next = LESSONS[currentIndex + 1];
      navigation.replace('LessonDetail', {
        trackId: next.track,
        lessonId: next.id,
        lessonTitle: next.title,
        lang,
        onCompleted,
      });
    } else {
      showToast('You completed all curriculum lessons in this track!', 'success');
      navigation.goBack();
    }
  };

  const titleText =
    lang === 'bn'
      ? lesson?.title?.bn || lesson?.title?.en || lesson?.title
      : lesson?.title?.en || lesson?.title;

  const subtitleText =
    lang === 'bn'
      ? lesson?.subtitle?.bn || lesson?.subtitle?.en || lesson?.subtitle
      : lesson?.subtitle?.en || lesson?.subtitle;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTrackText}>
            {(trackId || lesson?.track || 'LEARN').toUpperCase()} · {lesson?.difficulty || 'Beginner'}
          </Text>
          <Text style={styles.headerLessonTitle} numberOfLines={1}>
            {titleText}
          </Text>
        </View>

        {/* Bilingual switch pills */}
        <View style={styles.langPillWrapper}>
          <TouchableOpacity
            style={[styles.langPill, lang === 'en' && styles.langPillActive]}
            onPress={() => setLang('en')}
          >
            <Text style={[styles.langPillText, lang === 'en' && styles.langPillTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langPill, lang === 'bn' && styles.langPillActive]}
            onPress={() => setLang('bn')}
          >
            <Text style={[styles.langPillText, lang === 'bn' && styles.langPillTextActive]}>বাং</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langPill, lang === 'both' && styles.langPillActive]}
            onPress={() => setLang('both')}
          >
            <Text style={[styles.langPillText, lang === 'both' && styles.langPillTextActive]}>ALL</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segment Tabs: Theory | Code Playground | Quiz */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'theory' && styles.tabItemActive]}
          onPress={() => setActiveTab('theory')}
        >
          <Ionicons
            name="book-outline"
            size={16}
            color={activeTab === 'theory' ? colors.accent : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabItemText, activeTab === 'theory' && styles.tabItemTextActive]}>
            Theory & Concept
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'playground' && styles.tabItemActive]}
          onPress={() => setActiveTab('playground')}
        >
          <Ionicons
            name="code-slash"
            size={16}
            color={activeTab === 'playground' ? colors.accent : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabItemText, activeTab === 'playground' && styles.tabItemTextActive]}>
            Playground
          </Text>
        </TouchableOpacity>

        {quiz && (
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'quiz' && styles.tabItemActive]}
            onPress={() => setActiveTab('quiz')}
          >
            <Ionicons
              name="help-circle-outline"
              size={16}
              color={activeTab === 'quiz' ? colors.accent : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabItemText, activeTab === 'quiz' && styles.tabItemTextActive]}>
              Quiz ({quiz.questions?.length || 0})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'theory' && (
          <View style={styles.theoryContainer}>
            {/* Title & Subtitle Banner */}
            <View style={styles.titleCard}>
              <Text style={styles.lessonBigTitle}>{titleText}</Text>
              {lang === 'both' && lesson?.title?.bn && (
                <Text style={styles.lessonBnSubtitle}>{lesson.title.bn}</Text>
              )}
              {subtitleText ? (
                <Text style={styles.lessonLeadSubtitle}>{subtitleText}</Text>
              ) : null}
            </View>

            {/* What is it card */}
            {lesson?.explanation?.whatIsIt && (
              <View style={styles.conceptCard}>
                <View style={styles.conceptCardHeader}>
                  <Ionicons name="information-circle" size={18} color={colors.accent} style={{ marginRight: 6 }} />
                  <Text style={styles.conceptCardTitle}>What is it? / এটি কী?</Text>
                </View>

                {(lang === 'en' || lang === 'both') && lesson.explanation.whatIsIt.en && (
                  <Text style={styles.conceptBodyText}>{lesson.explanation.whatIsIt.en}</Text>
                )}

                {(lang === 'bn' || lang === 'both') && lesson.explanation.whatIsIt.bn && (
                  <Text style={[styles.conceptBodyTextBn, lang === 'both' && { marginTop: 8 }]}>
                    {lesson.explanation.whatIsIt.bn}
                  </Text>
                )}
              </View>
            )}

            {/* Why need it card */}
            {lesson?.explanation?.whyNeedIt && (
              <View style={styles.conceptCard}>
                <View style={styles.conceptCardHeader}>
                  <Ionicons name="bulb-outline" size={18} color="#ffc107" style={{ marginRight: 6 }} />
                  <Text style={styles.conceptCardTitle}>Why do we need it? / কেন প্রয়োজন?</Text>
                </View>

                {(lang === 'en' || lang === 'both') && lesson.explanation.whyNeedIt.en && (
                  <Text style={styles.conceptBodyText}>{lesson.explanation.whyNeedIt.en}</Text>
                )}

                {(lang === 'bn' || lang === 'both') && lesson.explanation.whyNeedIt.bn && (
                  <Text style={[styles.conceptBodyTextBn, lang === 'both' && { marginTop: 8 }]}>
                    {lesson.explanation.whyNeedIt.bn}
                  </Text>
                )}
              </View>
            )}

            {/* Real World Analogy Card */}
            {lesson?.explanation?.analogy && (
              <View style={[styles.conceptCard, styles.analogyCard]}>
                <View style={styles.conceptCardHeader}>
                  <Ionicons name="sparkles" size={18} color="#00ba7c" style={{ marginRight: 6 }} />
                  <Text style={[styles.conceptCardTitle, { color: '#00ba7c' }]}>
                    Real-World Analogy / বাস্তব উদাহরণ
                  </Text>
                </View>

                {(lang === 'en' || lang === 'both') && lesson.explanation.analogy.en && (
                  <Text style={styles.conceptBodyText}>{lesson.explanation.analogy.en}</Text>
                )}

                {(lang === 'bn' || lang === 'both') && lesson.explanation.analogy.bn && (
                  <Text style={[styles.conceptBodyTextBn, lang === 'both' && { marginTop: 8 }]}>
                    {lesson.explanation.analogy.bn}
                  </Text>
                )}
              </View>
            )}

            {/* Example Code Snippet Box */}
            {lesson?.exampleCode && (lesson.exampleCode.html || lesson.exampleCode.css || lesson.exampleCode.javascript) && (
              <View style={styles.codeSnippetCard}>
                <View style={styles.codeSnippetHeader}>
                  <Text style={styles.codeSnippetTitle}>Code Syntax Example</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() =>
                      handleCopyCode(
                        lesson.exampleCode.html || lesson.exampleCode.css || lesson.exampleCode.javascript
                      )
                    }
                  >
                    <Feather name="copy" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.copyBtnText}>Copy</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.codeSnippetText}>
                  {lesson.exampleCode.html || lesson.exampleCode.css || lesson.exampleCode.javascript}
                </Text>

                {lesson.exampleExplanation && (
                  <View style={styles.codeExplBox}>
                    {(lang === 'en' || lang === 'both') && lesson.exampleExplanation.en && (
                      <Text style={styles.codeExplText}>{lesson.exampleExplanation.en}</Text>
                    )}
                    {(lang === 'bn' || lang === 'both') && lesson.exampleExplanation.bn && (
                      <Text style={[styles.codeExplTextBn, lang === 'both' && { marginTop: 4 }]}>
                        {lesson.exampleExplanation.bn}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Playground Tab */}
        {activeTab === 'playground' && (
          <View style={styles.playgroundContainer}>
            <View style={styles.playgroundHeaderRow}>
              <Text style={styles.playgroundLabel}>Interactive Code Editor</Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() =>
                  setPlaygroundCode(lesson?.starterCode?.html || lesson?.exampleCode?.html || '')
                }
              >
                <Ionicons name="refresh" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.playgroundInput}
              value={playgroundCode}
              onChangeText={setPlaygroundCode}
              multiline={true}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="<!-- Write code here -->"
              placeholderTextColor={colors.textSecondary}
            />

            {lesson?.exercise && (
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseCardHeader}>
                  <Ionicons name="trophy-outline" size={18} color="#ffc107" style={{ marginRight: 6 }} />
                  <Text style={styles.exerciseCardTitle}>Challenge Objective</Text>
                </View>

                <Text style={styles.exerciseText}>
                  {lang === 'bn'
                    ? lesson.exercise.instructions?.bn || lesson.exercise.instructions?.en
                    : lesson.exercise.instructions?.en}
                </Text>

                {lesson.exercise.hint && (
                  <View style={styles.hintBox}>
                    <Text style={styles.hintLabel}>💡 Hint:</Text>
                    <Text style={styles.hintText}>
                      {lang === 'bn'
                        ? lesson.exercise.hint.bn || lesson.exercise.hint.en
                        : lesson.exercise.hint.en}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && quiz && (
          <View style={styles.quizContainer}>
            <View style={styles.quizHeaderCard}>
              <Text style={styles.quizTitle}>{quiz.title}</Text>
              <Text style={styles.quizSub}>
                Answer all {quiz.questions?.length} questions to test your comprehension.
              </Text>
            </View>

            {(quiz.questions || []).map((q, qIndex) => {
              const selectedOpt = quizAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <View key={q.id} style={styles.questionCard}>
                  <Text style={styles.questionPrompt}>
                    {qIndex + 1}. {lang === 'bn' ? q.promptBn || q.prompt : q.prompt}
                  </Text>
                  {lang === 'both' && q.promptBn && (
                    <Text style={styles.questionPromptBn}>{q.promptBn}</Text>
                  )}

                  {/* Options */}
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedOpt === optIndex;
                    let optStyle = styles.quizOption;
                    if (submittedQuiz) {
                      if (optIndex === q.correctIndex) {
                        optStyle = styles.quizOptionCorrect;
                      } else if (isSelected) {
                        optStyle = styles.quizOptionWrong;
                      }
                    } else if (isSelected) {
                      optStyle = styles.quizOptionSelected;
                    }

                    return (
                      <TouchableOpacity
                        key={optIndex}
                        style={optStyle}
                        onPress={() => {
                          if (!submittedQuiz) {
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                          }
                        }}
                      >
                        <Text style={styles.quizOptionText}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Explanation after submission */}
                  {submittedQuiz && (
                    <View style={styles.quizExplBox}>
                      <Text style={styles.quizExplText}>
                        {lang === 'bn' ? q.explanationBn || q.explanation : q.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {!submittedQuiz ? (
              <Button
                variant="primary"
                size="md"
                onPress={() => {
                  setSubmittedQuiz(true);
                  showToast('Quiz submitted! Check your score.', 'success');
                }}
                style={{ marginTop: 12 }}
              >
                Submit Answers
              </Button>
            ) : (
              <Button
                variant="outline"
                size="md"
                onPress={() => {
                  setSubmittedQuiz(false);
                  setQuizAnswers({});
                }}
                style={{ marginTop: 12 }}
              >
                Retry Quiz
              </Button>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          variant={isCompleted ? 'outline' : 'primary'}
          size="md"
          onPress={handleCompleteLesson}
          isLoading={completing}
          style={{ flex: 1, marginRight: 8 }}
        >
          {isCompleted ? 'Completed ✓ (+25 XP)' : 'Mark Complete (+25 XP)'}
        </Button>

        <TouchableOpacity
          style={styles.nextLessonBtn}
          onPress={handleNextLesson}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    paddingRight: 12,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTrackText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  headerLessonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 1,
  },
  langPillWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langPillActive: {
    backgroundColor: colors.accent,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langPillTextActive: {
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.accent,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabItemTextActive: {
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  theoryContainer: {},
  titleCard: {
    marginBottom: 16,
  },
  lessonBigTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 26,
  },
  lessonBnSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  lessonLeadSubtitle: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 6,
    fontWeight: '600',
  },
  conceptCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analogyCard: {
    borderColor: '#113524',
    backgroundColor: '#07150e',
  },
  conceptCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conceptCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  conceptBodyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  conceptBodyTextBn: {
    fontSize: 14,
    color: '#c4c8cc',
    lineHeight: 21,
  },
  codeSnippetCard: {
    backgroundColor: '#0a0d14',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e2638',
  },
  codeSnippetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2638',
  },
  codeSnippetTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f293d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  codeSnippetText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#00e5ff',
    lineHeight: 18,
  },
  codeExplBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e2638',
  },
  codeExplText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  codeExplTextBn: {
    fontSize: 12,
    color: '#a0a6b0',
    lineHeight: 18,
  },
  playgroundContainer: {},
  playgroundHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playgroundLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playgroundInput: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#58a6ff',
    minHeight: 180,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  exerciseText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  hintBox: {
    backgroundColor: '#1f1b0a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#423714',
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffc107',
    marginBottom: 2,
  },
  hintText: {
    fontSize: 12,
    color: '#d6cfb8',
    lineHeight: 16,
  },
  quizContainer: {},
  quizHeaderCard: {
    marginBottom: 14,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  quizSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionPrompt: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 21,
  },
  questionPromptBn: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  quizOption: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: '#0e2336',
  },
  quizOptionCorrect: {
    borderColor: '#00ba7c',
    backgroundColor: '#0a2e1d',
  },
  quizOptionWrong: {
    borderColor: '#ff4d4f',
    backgroundColor: '#331215',
  },
  quizOptionText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  quizExplBox: {
    marginTop: 6,
    padding: 10,
    backgroundColor: '#0b1622',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizExplText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextLessonBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#242e42',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LessonDetailScreen;
