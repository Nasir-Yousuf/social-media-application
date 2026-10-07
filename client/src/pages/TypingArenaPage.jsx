import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Keyboard,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  Swords,
  ChevronRight,
  Info,
} from 'lucide-react';
import TypingControlsBar from '../components/typing/TypingControlsBar';
import TypingStage from '../components/typing/TypingStage';
import LiveSpeedometer from '../components/typing/LiveSpeedometer';
import ComboMeter from '../components/typing/ComboMeter';
import TypingResultsModal from '../components/typing/TypingResultsModal';
import TypingLeaderboard from '../components/typing/TypingLeaderboard';
import TypingContestBanner from '../components/typing/TypingContestBanner';
import {
  generateWords,
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
} from '../utils/typingEngine';
import typingSounds from '../utils/typingSounds';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const TypingArenaPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Settings
  const [mode, setMode] = useState(searchParams.get('mode') || 'words_200');
  const [duration, setDuration] = useState(
    Number(searchParams.get('duration')) || 60
  );
  const [soundTheme, setSoundTheme] = useState('mechanical');
  const [viewMode, setViewMode] = useState('caret');

  // Word Stream & Input State
  const [words, setWords] = useState([]);
  const [quoteAuthor, setQuoteAuthor] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [wordHistory, setWordHistory] = useState({});

  // Game Telemetry & Progress
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [telemetry, setTelemetry] = useState([]);

  // Ghost Racer Setup (if challenging)
  const [ghostData, setGhostData] = useState(null);

  // Results Modal State
  const [results, setResults] = useState(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  // Sound theme sync
  useEffect(() => {
    typingSounds.setTheme(soundTheme);
  }, [soundTheme]);

  // Check query params for ghost challenge
  useEffect(() => {
    const rival = searchParams.get('rival');
    const rivalWpm = Number(searchParams.get('wpm'));
    if (rival && rivalWpm) {
      setGhostData({
        username: rival,
        wpm: rivalWpm,
        progress: 0,
      });
      showToast(`Ghost challenge active: beat @${rival}'s ${rivalWpm} WPM!`, 'info');
    }
  }, [searchParams]);

  // Initialize or restart test
  const initTest = useCallback(() => {
    const generated = generateWords(mode, mode === 'quote' ? 1 : 120);
    setWords(generated.words);
    setQuoteAuthor(generated.quoteAuthor);
    setCurrentWordIndex(0);
    setCurrentInput('');
    setWordHistory({});
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setStreak(0);
    setHighestStreak(0);
    setCorrectKeystrokes(0);
    setTotalKeystrokes(0);
    setTotalTypedChars(0);
    setTelemetry([]);
    setIsResultsOpen(false);
    if (ghostData) {
      setGhostData((prev) => (prev ? { ...prev, progress: 0 } : null));
    }
  }, [mode, duration]);

  useEffect(() => {
    initTest();
  }, [initTest]);

  // Timer loop
  useEffect(() => {
    let interval = null;
    if (isActive && !isFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          const elapsed = duration - next;

          // Sample current WPM for telemetry graph
          const currentWpm = calculateWpm(correctKeystrokes, elapsed);
          setTelemetry((t) => [...t, currentWpm]);

          // Update ghost progress if ghost exists
          if (ghostData && ghostData.wpm) {
            const expectedTotalWords = (ghostData.wpm * (duration / 60));
            const wordsPerSec = expectedTotalWords / duration;
            const ghostCurrentWords = wordsPerSec * elapsed;
            const progress = Math.min(100, Math.round((ghostCurrentWords / Math.max(1, words.length)) * 100));
            setGhostData((g) => (g ? { ...g, progress } : null));
          }

          if (next <= 0) {
            finishTest();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isFinished, timeLeft, duration, correctKeystrokes, ghostData, words.length]);

  // Calculate live stats
  const elapsedSeconds = Math.max(1, duration - timeLeft);
  const liveWpm = calculateWpm(correctKeystrokes, elapsedSeconds);
  const liveRawWpm = calculateRawWpm(totalTypedChars, elapsedSeconds);
  const liveAccuracy = calculateAccuracy(correctKeystrokes, totalKeystrokes);
  const userProgress = Math.min(100, Math.round((currentWordIndex / Math.max(1, words.length)) * 100));

  // Finish test
  const finishTest = useCallback(async () => {
    setIsFinished(true);
    setIsActive(false);
    typingSounds.playFinish();

    const finalWpm = calculateWpm(correctKeystrokes, duration);
    const finalRawWpm = calculateRawWpm(totalTypedChars, duration);
    const finalAccuracy = calculateAccuracy(correctKeystrokes, totalKeystrokes);

    const testResult = {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      duration,
      mode,
      highestCombo: highestStreak,
      telemetry,
      xpGained: 0,
    };

    // Save to backend if user is authenticated
    if (user) {
      try {
        const res = await api.post('/typing/submit', {
          wpm: finalWpm,
          rawWpm: finalRawWpm,
          accuracy: finalAccuracy,
          duration,
          mode,
          charCount: totalTypedChars,
          highestCombo: highestStreak,
          telemetry,
        });
        testResult.xpGained = res.data.xpGained || 0;
      } catch (err) {
        console.warn('Failed to submit score:', err);
      }
    }

    setResults(testResult);
    setIsResultsOpen(true);
  }, [
    correctKeystrokes,
    totalTypedChars,
    totalKeystrokes,
    duration,
    mode,
    highestStreak,
    telemetry,
    user,
  ]);

  // Handle keystrokes
  const handleKeyDown = (e) => {
    if (isFinished) return;

    // Start timer on first non-modifier keystroke
    if (!isActive && e.key.length === 1) {
      setIsActive(true);
    }

    // Play keystroke sound
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
      typingSounds.playKey(e.key);
    }

    // Quick restart shortcut: Tab + Enter
    if (e.key === 'Tab') {
      e.preventDefault();
      initTest();
      return;
    }

    // Space commits current word
    if (e.key === ' ') {
      e.preventDefault();
      if (!currentInput.trim()) return;

      const targetWord = words[currentWordIndex] || '';
      const isWordCorrect = currentInput.trim() === targetWord;

      setTotalKeystrokes((prev) => prev + 1);

      if (isWordCorrect) {
        // Correct word
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setHighestStreak((prev) => Math.max(prev, nextStreak));
        setCorrectKeystrokes((prev) => prev + targetWord.length + 1); // +1 for space
        setTotalTypedChars((prev) => prev + targetWord.length + 1);

        if ([10, 25, 50, 100].includes(nextStreak)) {
          typingSounds.playCombo(Math.min(4, Math.floor(nextStreak / 25) + 1));
        }

        setWordHistory((prev) => ({
          ...prev,
          [currentWordIndex]: { status: 'correct', typed: currentInput.trim() },
        }));
      } else {
        // Mistake made
        setStreak(0);
        typingSounds.playError();
        setTotalTypedChars((prev) => prev + currentInput.length + 1);

        setWordHistory((prev) => ({
          ...prev,
          [currentWordIndex]: { status: 'incorrect', typed: currentInput.trim() },
        }));
      }

      // Advance to next word
      if (currentWordIndex + 1 >= words.length) {
        finishTest();
      } else {
        setCurrentWordIndex((prev) => prev + 1);
        setCurrentInput('');
      }
      return;
    }

    // Normal typing keystrokes
    if (e.key.length === 1) {
      setTotalKeystrokes((prev) => prev + 1);
      const targetWord = words[currentWordIndex] || '';
      const nextCharIndex = currentInput.length;

      // Check if letter matches
      if (nextCharIndex < targetWord.length && e.key === targetWord[nextCharIndex]) {
        setCorrectKeystrokes((prev) => prev + 1);
      }
    }
  };

  const handleInputChange = (e) => {
    if (isFinished) return;
    const val = e.target.value;
    if (val.includes(' ')) return; // Handled in onKeyDown
    setCurrentInput(val);
  };

  // Launch Ghost race from leaderboard
  const handleChallengeGhost = (entry) => {
    setGhostData({
      username: entry.user?.username || 'rival',
      wpm: entry.wpm,
      progress: 0,
    });
    setMode(entry.mode || 'words_200');
    setDuration(entry.duration || 60);
    initTest();
    showToast(`Ghost Challenger loaded: @${entry.user?.username} (${entry.wpm} WPM)`, 'info');
  };

  // Share score to feed
  const handleShareToFeed = async () => {
    if (!user) {
      showToast('Please sign in to share your score to the feed', 'info');
      return;
    }
    if (!results) return;

    try {
      const shareContent = `⌨️ Just scored ${results.wpm} WPM (${results.rawWpm} Raw) with ${results.accuracy}% accuracy and a ${results.highestCombo}x streak on Clearfeed Typing Arena!\n\nCan you beat my speed? ⚔️ Challenge my ghost in the arena!`;

      await api.post('/posts', {
        content: shareContent,
        visibility: 'public',
        replyPolicy: 'everyone',
      });

      showToast('Score shared to Clearfeed feed!', 'success');
      setIsResultsOpen(false);
      navigate('/feed');
    } catch (err) {
      showToast('Failed to share score to feed', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      {/* Weekly Ongoing Contest Banner */}
      <TypingContestBanner />

      {/* Main Arena Container */}
      <div className="space-y-5">
        {/* Arena Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Typing Arena</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono font-bold uppercase">
                  10FastFingers · Monkeytype
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                Sharpen your speed, unlock tiers, and race live ghost runners
              </p>
            </div>
          </div>

          {/* Active Combo Streak Badge */}
          <ComboMeter streak={streak} highestStreak={highestStreak} />
        </div>

        {/* Controls Bar (Mode, Duration, Sound, Caret/Box) */}
        <TypingControlsBar
          mode={mode}
          setMode={setMode}
          duration={duration}
          setDuration={setDuration}
          soundTheme={soundTheme}
          setSoundTheme={setSoundTheme}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onRestart={initTest}
          disabled={isActive}
        />

        {/* Speedometer & Countdown Timer */}
        <LiveSpeedometer
          wpm={liveWpm}
          accuracy={liveAccuracy}
          timeLeft={timeLeft}
          totalTime={duration}
          isActive={isActive}
        />

        {/* Interactive Typing Stage Canvas */}
        <TypingStage
          words={words}
          currentWordIndex={currentWordIndex}
          currentInput={currentInput}
          wordHistory={wordHistory}
          viewMode={viewMode}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          isActive={isActive}
          isFinished={isFinished}
          ghostData={ghostData}
          userProgress={userProgress}
        />

        {/* Quote Author attribution (if in quotes mode) */}
        {mode === 'quote' && quoteAuthor && (
          <div className="text-right text-xs text-neutral-400 italic font-mono pr-2">
            — {quoteAuthor}
          </div>
        )}

        {/* Real-time Global & Weekly Championship Leaderboard */}
        <div className="pt-6">
          <TypingLeaderboard
            onChallengeGhost={handleChallengeGhost}
            currentSessionDuration={duration}
            currentSessionMode={mode}
          />
        </div>
      </div>

      {/* Results Celebration Modal */}
      <TypingResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        results={results}
        onPlayAgain={initTest}
        onShareToFeed={handleShareToFeed}
      />
    </div>
  );
};

export default TypingArenaPage;
