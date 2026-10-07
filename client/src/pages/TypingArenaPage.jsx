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
import GameArenaLayout from '../components/typing/GameArenaLayout';
import HackerArenaLayout from '../components/typing/HackerArenaLayout';
import ZenArenaLayout from '../components/typing/ZenArenaLayout';
import ArenaThemeSwitcher from '../components/typing/ArenaThemeSwitcher';
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

  // Multi-theme Arena State ('game' | 'classic' | 'hacker' | 'zen')
  const [arenaTheme, setArenaThemeState] = useState(() => {
    return localStorage.getItem('typing_arena_theme') || 'game';
  });

  const setArenaTheme = (theme) => {
    setArenaThemeState(theme);
    localStorage.setItem('typing_arena_theme', theme);
  };

  // Settings
  const [mode, setMode] = useState(searchParams.get('mode') || 'words_200');
  const [duration, setDuration] = useState(
    Number(searchParams.get('duration')) || 60
  );
  const [soundTheme, setSoundTheme] = useState('mechanical');
  const [viewMode, setViewMode] = useState('caret');
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(12);

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
  const [completedCorrectChars, setCompletedCorrectChars] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [telemetry, setTelemetry] = useState([]);
  const startTimeRef = useRef(null);
  const stateRef = useRef({});

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

  // Compute live correct characters for current incomplete word
  const currentWordTarget = words[currentWordIndex] || '';
  let currentWordCorrectChars = 0;
  for (let i = 0; i < currentInput.length && i < currentWordTarget.length; i++) {
    if (currentInput[i] === currentWordTarget[i]) {
      currentWordCorrectChars++;
    } else {
      break;
    }
  }
  const liveTotalCorrectChars = completedCorrectChars + currentWordCorrectChars;

  // Compute live elapsed seconds from actual high-res clock
  const elapsedSeconds = startTimeRef.current
    ? Math.max(1, (Date.now() - startTimeRef.current) / 1000)
    : 1;
  const liveWpm = isActive ? calculateWpm(liveTotalCorrectChars, elapsedSeconds) : 0;
  const liveRawWpm = isActive ? calculateRawWpm(totalKeystrokes, elapsedSeconds) : 0;
  const liveAccuracy = calculateAccuracy(liveTotalCorrectChars, totalKeystrokes);
  const userProgress = Math.min(100, Math.round((currentWordIndex / Math.max(1, words.length)) * 100));

  // Synchronize stateRef for callbacks
  stateRef.current = {
    completedCorrectChars,
    totalKeystrokes,
    highestStreak,
    telemetry,
    currentInput,
    currentWordIndex,
    words,
    duration,
    mode,
    user,
  };

  // Fetch real-time leaderboard data for sidebar
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.get('/typing/leaderboard', {
        params: {
          period: 'weekly',
          duration,
          mode: mode.startsWith('words') ? 'words_200' : mode,
        },
      });
      if (res.data?.leaderboard) {
        setLeaderboardData(res.data.leaderboard);
      }
      if (res.data?.userRank) {
        setUserRank(res.data.userRank);
      }
    } catch (err) {
      console.warn('Leaderboard fetch in page:', err);
    }
  }, [duration, mode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Initialize or restart test
  const initTest = useCallback(() => {
    const generated = generateWords({
      mode,
      punctuation,
      numbers,
      count: mode === 'quote' ? 1 : 250,
    });
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
    setCompletedCorrectChars(0);
    setTotalKeystrokes(0);
    setTelemetry([]);
    setIsResultsOpen(false);
    startTimeRef.current = null;
    if (ghostData) {
      setGhostData((prev) => (prev ? { ...prev, progress: 0 } : null));
    }
  }, [mode, duration, punctuation, numbers]);

  useEffect(() => {
    initTest();
  }, [initTest]);

  // Finish test
  const finishTest = useCallback(async () => {
    setIsFinished(true);
    setIsActive(false);
    typingSounds.playFinish();

    const {
      completedCorrectChars: cChars,
      totalKeystrokes: tKeys,
      highestStreak: hStreak,
      telemetry: tData,
      currentInput: cInput,
      currentWordIndex: cWordIdx,
      words: wList,
      duration: dSec,
      mode: mMode,
      user: currentUser,
    } = stateRef.current;

    const actualDuration = startTimeRef.current
      ? Math.min(dSec, Math.max(1, (Date.now() - startTimeRef.current) / 1000))
      : dSec;

    // In-progress word correct matching prefix
    const currentWordTarget = wList[cWordIdx] || '';
    let inProgressCorrect = 0;
    for (let i = 0; i < cInput.length && i < currentWordTarget.length; i++) {
      if (cInput[i] === currentWordTarget[i]) {
        inProgressCorrect++;
      } else {
        break;
      }
    }
    const finalCorrectChars = cChars + inProgressCorrect;

    const finalWpm = calculateWpm(finalCorrectChars, actualDuration);
    const finalRawWpm = calculateRawWpm(tKeys, actualDuration);
    const finalAccuracy = calculateAccuracy(finalCorrectChars, tKeys);

    const testResult = {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      duration: dSec,
      mode: mMode,
      highestCombo: hStreak,
      telemetry: tData,
      xpGained: 0,
    };

    // Save to backend if user is authenticated
    if (currentUser) {
      try {
        const res = await api.post('/typing/submit', {
          wpm: finalWpm,
          rawWpm: finalRawWpm,
          accuracy: finalAccuracy,
          duration: dSec,
          mode: mMode,
          charCount: finalCorrectChars,
          highestCombo: hStreak,
          telemetry: tData,
        });
        testResult.xpGained = res.data.xpGained || 0;
      } catch (err) {
        console.warn('Failed to submit score:', err);
      }
    }

    setResults(testResult);
    setIsResultsOpen(true);
  }, []);

  // Timer loop
  useEffect(() => {
    let interval = null;
    if (isActive && !isFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });

        const currentElapsed = startTimeRef.current
          ? Math.max(1, (Date.now() - startTimeRef.current) / 1000)
          : Math.max(1, duration - timeLeft);

        // Sample authentic live WPM for telemetry graph
        const currentWpm = calculateWpm(liveTotalCorrectChars, currentElapsed);
        setTelemetry((t) => [...t, currentWpm]);

        // Update ghost progress if ghost exists
        if (ghostData && ghostData.wpm) {
          const expectedTotalWords = ghostData.wpm * (duration / 60);
          const wordsPerSec = expectedTotalWords / duration;
          const ghostCurrentWords = wordsPerSec * currentElapsed;
          const progress = Math.min(100, Math.round((ghostCurrentWords / Math.max(1, words.length)) * 100));
          setGhostData((g) => (g ? { ...g, progress } : null));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isFinished, timeLeft, duration, liveTotalCorrectChars, ghostData, words.length]);

  // When timer hits 0 while active, trigger finish
  useEffect(() => {
    if (isActive && !isFinished && timeLeft <= 0) {
      finishTest();
    }
  }, [timeLeft, isActive, isFinished, finishTest]);

  // Handle keystrokes
  const handleKeyDown = (e) => {
    if (isFinished) return;

    // Start timer on first non-modifier keystroke
    if (!isActive && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      setIsActive(true);
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
    }

    // Play keystroke sound
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
      typingSounds.playKey(e.key);
    }

    // Quick restart shortcut: Tab
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
        // Correct word: reward target length + 1 (for space)
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setHighestStreak((prev) => Math.max(prev, nextStreak));
        setCompletedCorrectChars((prev) => prev + targetWord.length + 1);

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
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      setTotalKeystrokes((prev) => prev + 1);
    } else if (e.key === 'Backspace') {
      setTotalKeystrokes((prev) => prev + 1);
    }
  };

  const handleInputChange = (e) => {
    if (isFinished) return;
    if (!isActive && e.target.value.length > 0) {
      setIsActive(true);
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
    }
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
    <div
      className={`mx-auto px-4 py-6 font-sans transition-all duration-300 ${
        arenaTheme === 'game'
          ? 'max-w-7xl'
          : arenaTheme === 'hacker'
          ? 'max-w-5xl'
          : arenaTheme === 'zen'
          ? 'max-w-3xl'
          : 'max-w-4xl'
      }`}
    >
      {/* Top Header with Multi-mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-neutral-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Keyboard className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Typing Arena</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono font-bold uppercase">
                {arenaTheme.toUpperCase()} MODE
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Sharpen your speed, climb tiers, and race ghost typists
            </p>
          </div>
        </div>

        {/* Mode & Style Switcher (Arcade, Classic, Hacker, Zen) */}
        <ArenaThemeSwitcher activeTheme={arenaTheme} onSelectTheme={setArenaTheme} />
      </div>

      {/* Render Selected Theme View */}
      {arenaTheme === 'game' && (
        <GameArenaLayout
          mode={mode}
          setMode={setMode}
          duration={duration}
          setDuration={setDuration}
          punctuation={punctuation}
          setPunctuation={setPunctuation}
          numbers={numbers}
          setNumbers={setNumbers}
          soundTheme={soundTheme}
          setSoundTheme={setSoundTheme}
          timeLeft={timeLeft}
          streak={streak}
          highestStreak={highestStreak}
          wpm={liveWpm}
          accuracy={liveAccuracy}
          typingStageSlot={
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
              theme="game"
            />
          }
          leaderboard={leaderboardData}
          userRank={userRank}
          currentUser={user}
          onChallengeGhost={handleChallengeGhost}
          ghostData={ghostData}
          isActive={isActive}
        />
      )}

      {arenaTheme === 'hacker' && (
        <HackerArenaLayout
          mode={mode}
          setMode={setMode}
          duration={duration}
          setDuration={setDuration}
          punctuation={punctuation}
          setPunctuation={setPunctuation}
          numbers={numbers}
          setNumbers={setNumbers}
          soundTheme={soundTheme}
          setSoundTheme={setSoundTheme}
          timeLeft={timeLeft}
          streak={streak}
          wpm={liveWpm}
          accuracy={liveAccuracy}
          typingStageSlot={
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
              theme="hacker"
            />
          }
          leaderboard={leaderboardData}
          onChallengeGhost={handleChallengeGhost}
        />
      )}

      {arenaTheme === 'zen' && (
        <ZenArenaLayout
          timeLeft={timeLeft}
          wpm={liveWpm}
          accuracy={liveAccuracy}
          duration={duration}
          setDuration={setDuration}
          mode={mode}
          setMode={setMode}
          typingStageSlot={
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
              theme="zen"
            />
          }
        />
      )}

      {arenaTheme === 'classic' && (
        <>
          <TypingContestBanner />
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Classic Mode</span>
              </div>
              <ComboMeter streak={streak} highestStreak={highestStreak} />
            </div>

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

            <LiveSpeedometer
              wpm={liveWpm}
              accuracy={liveAccuracy}
              timeLeft={timeLeft}
              totalTime={duration}
              isActive={isActive}
            />

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
              theme="classic"
            />

            {mode === 'quote' && quoteAuthor && (
              <div className="text-right text-xs text-neutral-400 italic font-mono pr-2">
                — {quoteAuthor}
              </div>
            )}

            <div className="pt-6">
              <TypingLeaderboard
                onChallengeGhost={handleChallengeGhost}
                currentSessionDuration={duration}
                currentSessionMode={mode}
              />
            </div>
          </div>
        </>
      )}

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
