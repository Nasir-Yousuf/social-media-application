import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../theme/colors';
import Button from '../components/Button';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getLessonsByLanguage } from '../data/codeLessons';
import {
  generateWords,
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
  getSpeedTier,
  getComboInfo,
} from '../utils/typingEngine';

const PRACTICE_MODES = [
  { id: 'classic', label: 'Platform Classic', icon: 'speedometer-outline' },
  { id: 'arcade', label: 'Arcade Mode', icon: 'flame-outline' },
  { id: 'hacker', label: 'Cyber Hacker', icon: 'terminal-outline' },
  { id: 'zen', label: 'Zen Focus', icon: 'leaf-outline' },
];

const CODE_LANGUAGES = [
  { id: 'html', label: 'HTML5', color: '#e34f26' },
  { id: 'css', label: 'CSS3', color: '#264de4' },
  { id: 'javascript', label: 'JavaScript', color: '#f7df1e' },
];

// Touch-friendly helper symbols for mobile programming keyboards
const CODE_TOUCH_SYMBOLS = ['{', '}', '(', ')', '[', ']', ';', '=', '<', '>', '/', '"', "'", '$', '=>'];

export const PracticeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Primary Segment: 'typing' (Arena modes) | 'code' (Code snippet typing)
  const [activeSegment, setActiveSegment] = useState('typing');

  // Typing Arena state
  const [arenaMode, setArenaMode] = useState('classic'); // 'classic' | 'arcade' | 'hacker' | 'zen'
  const [duration, setDuration] = useState(30); // 15 | 30 | 60
  const [wordsList, setWordsList] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);

  // Code Practice state
  const [selectedCodeLang, setSelectedCodeLang] = useState('javascript');
  const [codeLessons, setCodeLessons] = useState([]);
  const [currentCodeLesson, setCurrentCodeLesson] = useState(null);
  const [codeTypedIndex, setCodeTypedIndex] = useState(0);
  const [codeErrorsCount, setCodeErrorsCount] = useState(0);
  const [codeStartTime, setCodeStartTime] = useState(null);
  const [codeIsFinished, setCodeIsFinished] = useState(false);
  const [codeResults, setCodeResults] = useState(null);

  // Result modal state
  const [arenaResults, setArenaResults] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Initialize Arena words
  const initArenaSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const { words } = generateWords('words_200', 80);
    setWordsList(words);
    setCurrentWordIdx(0);
    setTypedInput('');
    setIsTypingActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setStreak(0);
    setHighestStreak(0);
    setTotalKeystrokes(0);
    setCorrectChars(0);
    startTimeRef.current = null;
  }, [duration]);

  useEffect(() => {
    initArenaSession();
  }, [initArenaSession, arenaMode]);

  // Load code lessons when language changes
  useEffect(() => {
    const lessons = getLessonsByLanguage(selectedCodeLang);
    setCodeLessons(lessons);
    if (lessons.length > 0) {
      setCurrentCodeLesson(lessons[0]);
      setCodeTypedIndex(0);
      setCodeErrorsCount(0);
      setCodeStartTime(null);
      setCodeIsFinished(false);
      setCodeResults(null);
    }
  }, [selectedCodeLang]);

  // Arena countdown timer
  useEffect(() => {
    if (isTypingActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishArenaTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTypingActive, timeLeft]);

  // Finish arena session and compute final metrics
  const finishArenaTest = () => {
    setIsTypingActive(false);
    setIsFinished(true);

    const elapsed = duration - timeLeft || duration;
    const finalWpm = calculateWpm(correctChars, elapsed);
    const finalRaw = calculateRawWpm(totalKeystrokes, elapsed);
    const finalAcc = calculateAccuracy(correctChars, totalKeystrokes);
    const tier = getSpeedTier(finalWpm);

    const results = {
      wpm: finalWpm,
      rawWpm: finalRaw,
      accuracy: finalAcc,
      streak: highestStreak,
      tier,
      mode: arenaMode,
      duration,
    };

    setArenaResults(results);

    // Sync score to server if authenticated
    if (user && finalWpm > 0) {
      api.post('/typing/submit', {
        wpm: finalWpm,
        rawWpm: finalRaw,
        accuracy: finalAcc,
        mode: `words_${arenaMode}`,
        duration,
        highestStreak,
      }).catch(() => {});
    }
  };

  // Handle Arena character input
  const handleArenaInputChange = (text) => {
    if (isFinished) return;

    if (!isTypingActive) {
      setIsTypingActive(true);
      startTimeRef.current = Date.now();
    }

    // Space advances to next word
    if (text.endsWith(' ')) {
      const currentWord = wordsList[currentWordIdx] || '';
      const entered = text.trim();

      if (entered === currentWord) {
        setCorrectChars((prev) => prev + currentWord.length + 1);
        setStreak((prev) => {
          const next = prev + 1;
          if (next > highestStreak) setHighestStreak(next);
          return next;
        });
      } else {
        setStreak(0);
      }

      setTotalKeystrokes((prev) => prev + text.length);
      setCurrentWordIdx((prev) => prev + 1);
      setTypedInput('');
      return;
    }

    setTypedInput(text);
  };

  // Handle Code Practice typing keystroke
  const handleCodeTyping = (text) => {
    if (codeIsFinished || !currentCodeLesson) return;

    if (!codeStartTime) {
      setCodeStartTime(Date.now());
    }

    const targetCode = currentCodeLesson.snippet || '';
    const targetChar = targetCode[codeTypedIndex];
    const typedChar = text.slice(-1);

    if (typedChar === targetChar) {
      const nextIdx = codeTypedIndex + 1;
      setCodeTypedIndex(nextIdx);

      if (nextIdx >= targetCode.length) {
        // Code snippet finished!
        const elapsedSec = Math.max(1, Math.round((Date.now() - codeStartTime) / 1000));
        const wpm = calculateWpm(targetCode.length, elapsedSec);
        const acc = Math.max(0, Math.round(((targetCode.length - codeErrorsCount) / targetCode.length) * 100));

        setCodeIsFinished(true);
        setCodeResults({
          wpm,
          accuracy: acc,
          time: elapsedSec,
          errors: codeErrorsCount,
          language: selectedCodeLang,
        });

        showToast(`Snippet completed! ${wpm} WPM · ${acc}% Accuracy`, 'success');
      }
    } else {
      setCodeErrorsCount((prev) => prev + 1);
    }
  };

  // Append touch symbol to code input
  const handleTouchSymbol = (symbol) => {
    handleCodeTyping(symbol);
  };

  // Live Arena metrics
  const elapsedSec = isTypingActive && startTimeRef.current ? Math.max(1, (Date.now() - startTimeRef.current) / 1000) : 1;
  const liveWpm = isTypingActive ? calculateWpm(correctChars + (typedInput.length > 0 ? typedInput.length : 0), elapsedSec) : 0;
  const liveAccuracy = totalKeystrokes > 0 ? calculateAccuracy(correctChars, totalKeystrokes + typedInput.length) : 100;
  const combo = getComboInfo(streak);

  // Hacker mode colors
  const isHacker = arenaMode === 'hacker';
  const isZen = arenaMode === 'zen';
  const isArcade = arenaMode === 'arcade';

  return (
    <View style={[styles.container, isHacker && styles.hackerContainer, { paddingTop: insets.top }]}>
      {/* Top Main Segment: Typing Arena vs Code Practice */}
      <View style={[styles.header, isHacker && styles.hackerHeader]}>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'typing' && styles.segmentBtnActive]}
            onPress={() => setActiveSegment('typing')}
          >
            <Ionicons
              name="keyboard-outline"
              size={16}
              color={activeSegment === 'typing' ? '#ffffff' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentBtnText, activeSegment === 'typing' && styles.segmentBtnTextActive]}>
              Typing Arena
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'code' && styles.segmentBtnActive]}
            onPress={() => setActiveSegment('code')}
          >
            <Ionicons
              name="code-slash"
              size={16}
              color={activeSegment === 'code' ? '#ffffff' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentBtnText, activeSegment === 'code' && styles.segmentBtnTextActive]}>
              Code Practice
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always">
        {/* ============================================================== */}
        {/* SEGMENT 1: TYPING ARENA (Classic, Arcade, Cyber Hacker, Zen Focus) */}
        {/* ============================================================== */}
        {activeSegment === 'typing' && (
          <View>
            {/* Arena Mode Switcher */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modesScroll}>
              {PRACTICE_MODES.map((m) => {
                const isSelected = arenaMode === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.modePill,
                      isSelected && styles.modePillActive,
                      isHacker && isSelected && styles.hackerModePillActive,
                    ]}
                    onPress={() => setArenaMode(m.id)}
                  >
                    <Ionicons
                      name={m.icon}
                      size={15}
                      color={isSelected ? '#ffffff' : colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.modePillText,
                        isSelected && styles.modePillTextActive,
                        isHacker && isSelected && { color: '#00ff66' },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Duration Selector (15s, 30s, 60s) */}
            <View style={styles.durationRow}>
              {[15, 30, 60].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.durBtn, duration === sec && styles.durBtnActive]}
                  onPress={() => setDuration(sec)}
                >
                  <Text style={[styles.durBtnText, duration === sec && styles.durBtnTextActive]}>
                    {sec}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live Metrics Header */}
            {!isZen && (
              <View style={[styles.metricsCard, isHacker && styles.hackerMetricsCard]}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, isHacker && styles.hackerTextDim]}>WPM</Text>
                  <Text style={[styles.metricValue, isHacker && styles.hackerText]}>
                    {liveWpm}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, isHacker && styles.hackerTextDim]}>ACCURACY</Text>
                  <Text style={[styles.metricValue, isHacker && styles.hackerText]}>
                    {liveAccuracy}%
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, isHacker && styles.hackerTextDim]}>TIME</Text>
                  <Text style={[styles.metricValue, isHacker && styles.hackerText]}>
                    {timeLeft}s
                  </Text>
                </View>
              </View>
            )}

            {/* Arcade Combo Banner */}
            {isArcade && streak > 0 && (
              <View style={styles.arcadeComboBanner}>
                <Ionicons name="flame" size={20} color="#ff9800" style={{ marginRight: 6 }} />
                <Text style={styles.arcadeComboText}>
                  {combo.multiplier}x {combo.label} ({streak} STREAK)
                </Text>
              </View>
            )}

            {/* Hacker Terminal Prompt Header */}
            {isHacker && (
              <View style={styles.hackerTerminalHeader}>
                <Text style={styles.hackerTerminalPrompt}>
                  root@clearfeed:~$ run arena_{arenaMode}.sh --time={duration}s
                </Text>
              </View>
            )}

            {/* Words Stream Box */}
            <TouchableOpacity
              style={[
                styles.wordsBox,
                isHacker && styles.hackerWordsBox,
                isZen && styles.zenWordsBox,
              ]}
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
            >
              <View style={styles.wordsWrap}>
                {wordsList.slice(Math.max(0, currentWordIdx - 2), currentWordIdx + 12).map((w, idx) => {
                  const actualIdx = Math.max(0, currentWordIdx - 2) + idx;
                  const isCurrent = actualIdx === currentWordIdx;
                  const isPast = actualIdx < currentWordIdx;

                  return (
                    <View
                      key={`word-${actualIdx}`}
                      style={[
                        styles.wordPill,
                        isCurrent && styles.wordPillCurrent,
                        isHacker && isCurrent && styles.hackerWordPillCurrent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.wordText,
                          isPast && styles.wordTextPast,
                          isCurrent && styles.wordTextCurrent,
                          isHacker && styles.hackerWordText,
                          isHacker && isCurrent && styles.hackerWordTextCurrent,
                        ]}
                      >
                        {w}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Typing Input Box */}
              <View style={styles.inputRow}>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.typingInput,
                    isHacker && styles.hackerInput,
                  ]}
                  placeholder={isTypingActive ? '' : 'Tap here to start typing...'}
                  placeholderTextColor={isHacker ? '#007722' : colors.textSecondary}
                  value={typedInput}
                  onChangeText={handleArenaInputChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                />
                <TouchableOpacity
                  style={[styles.restartBtn, isHacker && styles.hackerRestartBtn]}
                  onPress={initArenaSession}
                >
                  <Ionicons name="refresh" size={18} color={isHacker ? '#00ff66' : colors.text} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ============================================================== */}
        {/* SEGMENT 2: CODE PRACTICE (HTML, CSS, JavaScript)              */}
        {/* ============================================================== */}
        {activeSegment === 'code' && (
          <View>
            {/* Language Switcher */}
            <View style={styles.codeLangRow}>
              {CODE_LANGUAGES.map((lang) => {
                const isSelected = selectedCodeLang === lang.id;
                return (
                  <TouchableOpacity
                    key={lang.id}
                    style={[
                      styles.codeLangBtn,
                      isSelected && { backgroundColor: lang.color, borderColor: lang.color },
                    ]}
                    onPress={() => setSelectedCodeLang(lang.id)}
                  >
                    <Text
                      style={[
                        styles.codeLangBtnText,
                        isSelected && { color: lang.id === 'javascript' ? '#000000' : '#ffffff' },
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Lesson Title & Snippet Selector */}
            {currentCodeLesson && (
              <View style={styles.codeLessonHeader}>
                <View>
                  <Text style={styles.codeLessonTitle}>{currentCodeLesson.title}</Text>
                  <Text style={styles.codeLessonSub}>{currentCodeLesson.description}</Text>
                </View>

                <View style={styles.codeProgressBadge}>
                  <Text style={styles.codeProgressBadgeText}>
                    {codeTypedIndex} / {(currentCodeLesson.snippet || '').length} chars
                  </Text>
                </View>
              </View>
            )}

            {/* Target Code Display with active character highlight */}
            {currentCodeLesson && (
              <View style={styles.codeDisplayCard}>
                <Text style={styles.codeTextContent}>
                  <Text style={styles.codeTextDone}>
                    {(currentCodeLesson.snippet || '').slice(0, codeTypedIndex)}
                  </Text>
                  <Text style={styles.codeTextCurrent}>
                    {(currentCodeLesson.snippet || '').charAt(codeTypedIndex)}
                  </Text>
                  <Text style={styles.codeTextRemaining}>
                    {(currentCodeLesson.snippet || '').slice(codeTypedIndex + 1)}
                  </Text>
                </Text>
              </View>
            )}

            {/* Touch-Friendly Symbol Helper Keys */}
            <View style={styles.symbolsPanel}>
              <Text style={styles.symbolsLabel}>QUICK PROGRAMMING SYMBOLS:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symbolsScroll}>
                {CODE_TOUCH_SYMBOLS.map((sym) => (
                  <TouchableOpacity
                    key={sym}
                    style={styles.symbolKey}
                    onPress={() => handleTouchSymbol(sym)}
                  >
                    <Text style={styles.symbolKeyText}>{sym}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Hidden/Active Input for soft keyboard */}
            <TextInput
              style={styles.codeHiddenInput}
              placeholder="Type matching characters..."
              placeholderTextColor={colors.textSecondary}
              onChangeText={(t) => handleCodeTyping(t)}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
            />

            {/* Results modal / card if completed */}
            {codeResults && (
              <View style={styles.codeResultsCard}>
                <Ionicons name="checkmark-circle" size={32} color="#00ba7c" style={{ marginBottom: 6 }} />
                <Text style={styles.codeResultsTitle}>Snippet Completed!</Text>
                <View style={styles.codeResultsStatsRow}>
                  <View style={styles.codeResultStatItem}>
                    <Text style={styles.codeResultStatVal}>{codeResults.wpm}</Text>
                    <Text style={styles.codeResultStatLbl}>WPM</Text>
                  </View>
                  <View style={styles.codeResultStatItem}>
                    <Text style={styles.codeResultStatVal}>{codeResults.accuracy}%</Text>
                    <Text style={styles.codeResultStatLbl}>ACCURACY</Text>
                  </View>
                  <View style={styles.codeResultStatItem}>
                    <Text style={styles.codeResultStatVal}>{codeResults.time}s</Text>
                    <Text style={styles.codeResultStatLbl}>TIME</Text>
                  </View>
                </View>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    setCodeTypedIndex(0);
                    setCodeErrorsCount(0);
                    setCodeStartTime(null);
                    setCodeIsFinished(false);
                    setCodeResults(null);
                  }}
                  style={{ marginTop: 12 }}
                >
                  Practice Again
                </Button>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Arena Results Modal */}
      <Modal
        visible={!!arenaResults}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setArenaResults(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalBadge}>{arenaResults?.tier?.badge || '⚡'}</Text>
            <Text style={styles.modalTitle}>{arenaResults?.tier?.name || 'Speed Result'}</Text>
            <Text style={styles.modalModeName}>
              {arenaResults?.mode?.toUpperCase()} MODE · {arenaResults?.duration}s
            </Text>

            <View style={styles.modalStatsGrid}>
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNumber}>{arenaResults?.wpm}</Text>
                <Text style={styles.modalStatText}>WPM</Text>
              </View>
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNumber}>{arenaResults?.accuracy}%</Text>
                <Text style={styles.modalStatText}>ACCURACY</Text>
              </View>
              <View style={styles.modalStatCol}>
                <Text style={styles.modalStatNumber}>{arenaResults?.streak}</Text>
                <Text style={styles.modalStatText}>MAX STREAK</Text>
              </View>
            </View>

            <Button
              variant="primary"
              size="md"
              onPress={() => {
                setArenaResults(null);
                initArenaSession();
              }}
              style={{ width: '100%', marginTop: 16 }}
            >
              Try Again
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hackerContainer: {
    backgroundColor: '#020904',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  hackerHeader: {
    backgroundColor: '#041508',
    borderBottomColor: '#0c3817',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: colors.accent,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  modesScroll: {
    marginBottom: 12,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modePillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  hackerModePillActive: {
    backgroundColor: '#073312',
    borderColor: '#00ff66',
  },
  modePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modePillTextActive: {
    color: '#ffffff',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
  },
  durBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  durBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  durBtnTextActive: {
    color: '#ffffff',
  },
  metricsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hackerMetricsCard: {
    backgroundColor: '#051f0b',
    borderColor: '#0b4719',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  hackerText: {
    color: '#00ff66',
  },
  hackerTextDim: {
    color: '#00aa44',
  },
  arcadeComboBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e1903',
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#7a4205',
  },
  arcadeComboText: {
    color: '#ffc107',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  hackerTerminalHeader: {
    backgroundColor: '#07240f',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#0f5221',
  },
  hackerTerminalPrompt: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#00ff66',
    fontSize: 11,
  },
  wordsBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hackerWordsBox: {
    backgroundColor: '#04180a',
    borderColor: '#0f5221',
  },
  zenWordsBox: {
    backgroundColor: '#0d1117',
    borderColor: '#1e2430',
  },
  wordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 120,
    marginBottom: 12,
  },
  wordPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 6,
  },
  wordPillCurrent: {
    backgroundColor: 'rgba(29,155,240,0.15)',
    borderRadius: 6,
  },
  hackerWordPillCurrent: {
    backgroundColor: '#0d471b',
  },
  wordText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  wordTextPast: {
    color: 'rgba(255,255,255,0.25)',
  },
  wordTextCurrent: {
    color: colors.accent,
    fontWeight: '700',
  },
  hackerWordText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#00aa44',
  },
  hackerWordTextCurrent: {
    color: '#00ff66',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  typingInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: colors.text,
  },
  hackerInput: {
    backgroundColor: '#020d05',
    borderColor: '#0f5221',
    color: '#00ff66',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  restartBtn: {
    padding: 10,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  hackerRestartBtn: {
    backgroundColor: '#07240f',
  },
  codeLangRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  codeLangBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLangBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  codeLessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLessonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  codeLessonSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  codeProgressBadge: {
    backgroundColor: '#1b2330',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeProgressBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  codeDisplayCard: {
    backgroundColor: '#0a0d14',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e2638',
    marginBottom: 12,
  },
  codeTextContent: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    lineHeight: 22,
  },
  codeTextDone: {
    color: '#00ba7c',
  },
  codeTextCurrent: {
    color: '#ffffff',
    backgroundColor: colors.accent,
  },
  codeTextRemaining: {
    color: '#495a75',
  },
  symbolsPanel: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  symbolsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  symbolsScroll: {
    flexDirection: 'row',
  },
  symbolKey: {
    backgroundColor: '#1e2638',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
  },
  symbolKeyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00e5ff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeHiddenInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: colors.text,
  },
  codeResultsCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeResultsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
  },
  codeResultsStatsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  codeResultStatItem: {
    alignItems: 'center',
  },
  codeResultStatVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.accent,
  },
  codeResultStatLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBadge: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  modalModeName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 16,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalStatCol: {
    alignItems: 'center',
  },
  modalStatNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  modalStatText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default PracticeScreen;
