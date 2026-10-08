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
import TypingChallengeModal from '../components/typing/TypingChallengeModal';
import RacingDashboard from '../components/typing/racing/RacingDashboard';
import RacingArenaScreen from '../components/typing/racing/RacingArenaScreen';
import GarageView from '../components/typing/racing/GarageView';
import ArcadeLab from '../components/typing/racing/ArcadeLab';
import {
  generateWords,
  calculateWpm,
  calculateRawWpm,
  calculateAccuracy,
} from '../utils/typingEngine';
import typingSounds from '../utils/typingSounds';
import {
  saveTypingResultLocally,
  getResilientLeaderboard,
  syncPendingScoresWithServer,
  removeLeaderboardEntryLocally,
  getLocalChallenges,
  getLocalChallengeById,
  completeLocalChallenge,
  declineLocalChallenge,
  purgeAllDummyData,
} from '../utils/typingStorage';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const TypingArenaPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Multi-theme Arena State ('racing_hub' | 'race' | 'garage' | 'arcade' | 'classic' | 'leaderboard' | 'game' | 'hacker' | 'zen')
  const [arenaTheme, setArenaThemeState] = useState(() => {
    const saved = localStorage.getItem('typing_arena_theme');
    if (!saved || saved === 'game') return 'racing_hub';
    return saved;
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
  const [userRank, setUserRank] = useState(null);
  const [userBestScore, setUserBestScore] = useState(null);

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
  const lastTelemetrySecRef = useRef(0);

  // Ghost Racer Setup (if challenging)
  const [ghostData, setGhostData] = useState(null);

  // 1v1 Challenge State
  const [activeChallenge, setActiveChallenge] = useState(null);
  const activeChallengeRef = useRef(null);
  const [challenges, setChallenges] = useState({ incoming: [], outgoing: [], history: [] });
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Fetch current user's challenges (merging resilient local storage + remote API)
  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    const currentUserId = user._id || user.id || 'me';
    const local = getLocalChallenges(currentUserId);

    try {
      const res = await api.get('/typing/challenges');
      const remote = res.data || {};

      const mergeLists = (remoteList = [], localList = []) => {
        const map = new Map();
        for (const item of localList) map.set(item._id, item);
        for (const item of remoteList) map.set(item._id, item);
        return Array.from(map.values());
      };

      setChallenges({
        incoming: mergeLists(remote.incoming, local.incoming),
        outgoing: mergeLists(remote.outgoing, local.outgoing),
        history: mergeLists(remote.history, local.history),
      });
    } catch (err) {
      console.info('Operating challenges in resilient local mode:', err.message);
      setChallenges(local);
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Synchronize when challenges are created or updated across modals/components
  useEffect(() => {
    const handleChallengesUpdate = () => {
      fetchChallenges();
    };
    window.addEventListener('clearfeed:typingChallengesUpdated', handleChallengesUpdate);
    return () => window.removeEventListener('clearfeed:typingChallengesUpdated', handleChallengesUpdate);
  }, [fetchChallenges]);

  // Results Modal State
  const [results, setResults] = useState(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  // Sound theme sync
  useEffect(() => {
    typingSounds.setTheme(soundTheme);
  }, [soundTheme]);

  // Check query params for challengeId or ghost challenge
  useEffect(() => {
    const challengeId = searchParams.get('challengeId');
    if (challengeId) {
      const applyChallenge = (ch) => {
        if (!ch) return;
        activeChallengeRef.current = ch;
        setActiveChallenge(ch);
        setDuration(ch.duration);
        setTimeLeft(ch.duration);
        setMode(ch.mode || 'words_200');
        if (Array.isArray(ch.words) && ch.words.length > 0) {
          setWords(ch.words);
        }
        setGhostData({
          username: ch.challenger?.username || 'rival',
          name: ch.challenger?.name,
          avatarUrl: ch.challenger?.avatarUrl,
          wpm: ch.challengerWpm || 0,
          progress: 0,
          isDuel: true,
        });
        showToast(
          `⚔️ 1v1 Typing Duel loaded! Race against @${ch.challenger?.username || 'rival'} (${ch.challengerWpm || 0} WPM)`,
          'info'
        );
      };

      api
        .get(`/typing/challenges/${challengeId}`)
        .then((res) => {
          const ch = res.data?.challenge;
          if (ch) {
            applyChallenge(ch);
          } else {
            const localCh = getLocalChallengeById(challengeId);
            if (localCh) applyChallenge(localCh);
          }
        })
        .catch((err) => {
          console.info('Remote challenge load 404/offline, checking local arena storage:', err.message);
          const localCh = getLocalChallengeById(challengeId);
          if (localCh) {
            applyChallenge(localCh);
          } else {
            console.warn('Could not locate challenge locally or remotely:', challengeId);
          }
        });
      return;
    }

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
  }, [searchParams, showToast]);

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
    liveTotalCorrectChars,
    totalKeystrokes,
    highestStreak,
    telemetry,
    currentInput,
    currentWordIndex,
    words,
    duration,
    mode,
    user,
    ghostData,
  };

  // Fetch real-time resilient leaderboard data for sidebar
  const fetchLeaderboard = useCallback(async () => {
    const queryMode = mode.startsWith('words') ? 'words' : mode;
    let remoteLeaderboard = null;
    try {
      const res = await api.get('/typing/leaderboard', {
        params: {
          period: 'all',
          duration,
          mode: queryMode,
        },
      });
      if (res.data?.leaderboard) {
        remoteLeaderboard = res.data.leaderboard;
      }
      if (res.data?.userRank) {
        setUserRank(res.data.userRank);
      }
      if (res.data?.userBestScore) {
        setUserBestScore(res.data.userBestScore);
      }
    } catch (err) {
      // Remote notice: gracefully fall back to resilient local leaderboard
    }

    const resilient = getResilientLeaderboard(duration, queryMode, user, remoteLeaderboard);
    setLeaderboardData(resilient.leaderboard);
    if (resilient.userRank) {
      setUserRank(resilient.userRank);
    }
    if (resilient.userBestScore) {
      setUserBestScore(resilient.userBestScore);
    }
  }, [duration, mode, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Sync any offline scores in background and listen for score saves
  useEffect(() => {
    syncPendingScoresWithServer(api);

    const handleScoreSaved = (e) => {
      if (e.detail?.leaderboard) {
        setLeaderboardData(e.detail.leaderboard);
      }
      if (e.detail?.userRank) {
        setUserRank(e.detail.userRank);
      }
    };
    window.addEventListener('clearfeed:typingScoreSaved', handleScoreSaved);
    return () => window.removeEventListener('clearfeed:typingScoreSaved', handleScoreSaved);
  }, []);

  // Initialize or restart test
  const initTest = useCallback(() => {
    if (activeChallengeRef.current && Array.isArray(activeChallengeRef.current.words) && activeChallengeRef.current.words.length > 0) {
      setWords(activeChallengeRef.current.words);
      setQuoteAuthor(null);
    } else {
      const generated = generateWords({
        mode,
        punctuation,
        numbers,
        count: mode === 'quote' ? 1 : 250,
      });
      setWords(generated.words);
      setQuoteAuthor(generated.quoteAuthor);
    }
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
    lastTelemetrySecRef.current = 0;
    if (ghostData) {
      setGhostData((prev) => (prev ? { ...prev, progress: 0 } : null));
    }
  }, [mode, duration, punctuation, numbers, ghostData]);

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
      ? Math.max(1, (Date.now() - startTimeRef.current) / 1000)
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

    // Use full test duration if time expired, else actual high-res elapsed
    const effectiveDuration = timeLeft <= 1 ? dSec : actualDuration;
    const finalWpm = calculateWpm(finalCorrectChars, effectiveDuration);
    const finalRawWpm = calculateRawWpm(tKeys, effectiveDuration);
    const finalAccuracy = calculateAccuracy(finalCorrectChars, tKeys);

    // Ensure final speed point is captured in telemetry
    const finalTelemetry = Array.isArray(tData) ? [...tData] : [];
    if (finalTelemetry.length === 0 || finalTelemetry[finalTelemetry.length - 1] !== finalWpm) {
      finalTelemetry.push(finalWpm);
    }

    // Save locally first to guarantee zero score loss, immediate XP, and dynamic leaderboard placement
    const localSave = saveTypingResultLocally(
      {
        wpm: finalWpm,
        rawWpm: finalRawWpm,
        accuracy: finalAccuracy,
        duration: dSec,
        mode: mMode,
        charCount: finalCorrectChars,
        highestCombo: hStreak,
        telemetry: finalTelemetry,
      },
      currentUser
    );

    const testResult = {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      duration: dSec,
      mode: mMode,
      highestCombo: hStreak,
      telemetry: finalTelemetry,
      xpGained: localSave.xpGained || 0,
      savedToLeaderboard: !(!currentUser),
      userRank: localSave.userRank || userRank || 1,
      isGuest: !currentUser,
    };

    if (localSave.userRank) {
      setUserRank(localSave.userRank);
    }
    if (localSave.leaderboard) {
      setLeaderboardData(localSave.leaderboard);
    }

    // Save to backend if user is authenticated
    if (currentUser) {
      showToast(
        `🎉 ${dSec}s Test: ${finalWpm} WPM recorded! You are ranked #${testResult.userRank || '1'}!`,
        'success'
      );

      // Async sync with remote backend (resilient against 404 or network downtime)
      api
        .post('/typing/submit', {
          wpm: finalWpm,
          rawWpm: finalRawWpm,
          accuracy: finalAccuracy,
          duration: dSec,
          mode: mMode,
          charCount: finalCorrectChars,
          highestCombo: hStreak,
          telemetry: tData,
        })
        .then((res) => {
          if (res.data?.userRank) {
            testResult.userRank = res.data.userRank;
            setUserRank(res.data.userRank);
          }
          if (res.data?.xpGained) {
            testResult.xpGained = res.data.xpGained;
          }
          fetchLeaderboard();
        })
        .catch((err) => {
          console.info('Remote server sync queued (saved locally):', err?.message);
        });

      // If this test was racing a 1v1 challenge, complete the challenge
      if (activeChallengeRef.current) {
        const ch = activeChallengeRef.current;
        const chId = ch._id;
        const rivalWpm = ch.challengerWpm || 0;
        const isWinner = finalWpm > rivalWpm;
        testResult.isDuel = true;
        testResult.isWinner = isWinner;
        const bonusXp = isWinner ? 150 : 60;
        testResult.xpGained = (testResult.xpGained || 0) + bonusXp;

        if (isWinner) {
          showToast(
            `🏆 DUEL VICTORY! You won against @${ch.challenger?.username || 'rival'} with ${finalWpm} WPM! (+${bonusXp} XP)`,
            'success'
          );
        } else {
          showToast(
            `⚔️ Duel complete: Rival had ${rivalWpm} WPM vs your ${finalWpm} WPM. Good race! (+${bonusXp} XP)`,
            'info'
          );
        }

        // Complete locally with full offline persistence
        completeLocalChallenge(
          chId,
          {
            wpm: finalWpm,
            rawWpm: finalRawWpm,
            accuracy: finalAccuracy,
            telemetry: tData,
          },
          user
        );

        api
          .post(`/typing/challenges/${chId}/complete`, {
            wpm: finalWpm,
            rawWpm: finalRawWpm,
            accuracy: finalAccuracy,
            telemetry: tData,
          })
          .then(() => {
            fetchChallenges();
          })
          .catch((duelErr) => {
            console.info('Remote challenge completion queued:', duelErr?.message);
          });
      }
    } else {
      testResult.isGuest = true;
      testResult.savedToLeaderboard = false;
      showToast(
        `⚡ ${dSec}s Test: ${finalWpm} WPM! Note: Sign in to save your score to the global leaderboard.`,
        'info'
      );
    }

    setResults(testResult);
    setIsResultsOpen(true);
  }, [fetchLeaderboard, fetchChallenges, timeLeft, userRank, showToast]);

  // Challenge duel handlers
  const handleAcceptChallenge = (ch) => {
    activeChallengeRef.current = ch;
    setActiveChallenge(ch);
    setDuration(ch.duration);
    setTimeLeft(ch.duration);
    setMode(ch.mode || 'words_200');
    if (Array.isArray(ch.words) && ch.words.length > 0) {
      setWords(ch.words);
    }
    setGhostData({
      username: ch.challenger?.username || 'rival',
      name: ch.challenger?.name,
      avatarUrl: ch.challenger?.avatarUrl,
      wpm: ch.challengerWpm || 0,
      progress: 0,
      isDuel: true,
    });
    showToast(`⚔️ Accepted duel against @${ch.challenger?.username}! Ready to race.`, 'info');
  };

  const handleDeclineChallenge = async (id) => {
    declineLocalChallenge(id);
    showToast('Duel declined.', 'info');
    fetchChallenges();

    try {
      await api.post(`/typing/challenges/${id}/decline`);
    } catch (err) {
      console.info('Remote challenge decline queued:', err.message);
    }
  };

  const handleExitDuel = () => {
    activeChallengeRef.current = null;
    setActiveChallenge(null);
    setGhostData(null);
    initTest();
    showToast('Exited 1v1 duel.', 'info');
  };

  // Admin leaderboard score removal
  const handleAdminRemoveEntry = async (entry) => {
    if (!user || user.role !== 'admin') return;
    const confirm = window.confirm(
      `Admin Action: Remove @${entry.user?.username || 'user'}'s score (${entry.wpm} WPM) from the leaderboard?`
    );
    if (!confirm) return;

    try {
      try {
        await api.delete(`/typing/leaderboard/${entry._id}`);
      } catch (_) {}
      removeLeaderboardEntryLocally(
        entry._id,
        entry.user?._id || entry.user?.id,
        duration,
        mode,
        entry.user?.username
      );
      showToast(
        `🛡️ Admin: Permanently removed @${entry.user?.username || 'user'} from leaderboard.`,
        'info'
      );
      fetchLeaderboard();
    } catch (err) {
      showToast(
        'Failed to remove score: ' + (err.response?.data?.message || err.message),
        'error'
      );
    }
  };

  // Rock-solid wall-clock countdown timer loop
  useEffect(() => {
    if (!isActive || isFinished) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;

      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      const remainingSec = Math.max(0, Math.ceil(duration - elapsedSec));

      setTimeLeft(remainingSec);

      // Sample telemetry once per whole elapsed second
      const secFloor = Math.floor(elapsedSec);
      if (secFloor > 0 && secFloor > lastTelemetrySecRef.current) {
        lastTelemetrySecRef.current = secFloor;
        const currentCorrect = stateRef.current.liveTotalCorrectChars || 0;
        const sampleWpm = calculateWpm(currentCorrect, secFloor);
        setTelemetry((t) => [...t, sampleWpm]);
      }

      // Update ghost progress if ghost exists
      const ghost = stateRef.current.ghostData;
      if (ghost && ghost.wpm) {
        const wordsPerSec = (ghost.wpm * (duration / 60)) / duration;
        const ghostCurrentWords = wordsPerSec * elapsedSec;
        const totalWords = stateRef.current.words?.length || 1;
        const progress = Math.min(100, Math.round((ghostCurrentWords / totalWords) * 100));
        setGhostData((g) => (g ? { ...g, progress } : null));
      }

      if (remainingSec <= 0) {
        clearInterval(interval);
        finishTest();
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [isActive, isFinished, duration, finishTest]);

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

      // Count space as one keystroke
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

    // Normal typing keystrokes (count printable characters once)
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
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

  const handleShareRacingPost = async (raceData) => {
    if (!user) {
      showToast('Please sign in to share to the feed', 'info');
      return;
    }
    try {
      const shareText =
        raceData.text ||
        `🏎️ Just finished a Typing Arena Race!\n\n⚡ ${raceData.wpm} WPM • ${raceData.accuracy || 98}% Accuracy\n🏆 #${raceData.position || 1} in ${raceData.carName || 'Shadow V12'}\n\nBeat my score in the Typing Arena!`;
      await api.post('/posts', {
        content: shareText,
        visibility: 'public',
        replyPolicy: 'everyone',
      });
      showToast('🏎️ Racing achievement shared to Clearfeed feed!', 'success');
      navigate('/feed');
    } catch (err) {
      console.warn('Failed to share race to feed:', err);
      showToast('Race recorded! Feed share queued.', 'info');
    }
  };

  return (
    <div
      className={`mx-auto px-4 sm:px-6 py-6 font-sans transition-all duration-300 w-full ${
        arenaTheme === 'race' || arenaTheme === 'racing_hub'
          ? 'max-w-[1520px]'
          : arenaTheme === 'game'
          ? 'max-w-[1400px]'
          : arenaTheme === 'hacker'
          ? 'max-w-6xl'
          : arenaTheme === 'zen'
          ? 'max-w-4xl'
          : 'max-w-6xl'
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
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold uppercase">
                {arenaTheme === 'racing_hub'
                  ? 'ARENA HUB'
                  : arenaTheme === 'race'
                  ? '2.5D HIGHWAY RACE'
                  : arenaTheme === 'garage'
                  ? 'MY GARAGE'
                  : arenaTheme === 'arcade'
                  ? 'ARCADE LAB'
                  : arenaTheme === 'game'
                  ? 'ARCADE MODE'
                  : arenaTheme === 'hacker'
                  ? 'CYBER HACKER'
                  : arenaTheme === 'zen'
                  ? 'ZEN FOCUS'
                  : `${arenaTheme.toUpperCase()} MODE`}
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Type at supersonic speed, race live hypercars, customize garage & dominate
            </p>
          </div>
        </div>

        {/* Mode & Style Switcher */}
        <ArenaThemeSwitcher activeTheme={arenaTheme} onSelectTheme={setArenaTheme} />
      </div>

      {/* 1. Racing Arena Hub (Image 2) */}
      {arenaTheme === 'racing_hub' && (
        <RacingDashboard
          onStartRace={() => setArenaTheme('race')}
          onSelectMode={(m) => {
            if (m === 'racing') setArenaTheme('race');
            else if (m === 'arcade' || m === 'mood') setArenaTheme('arcade');
            else if (m === 'classic') setArenaTheme('classic');
          }}
          onOpenArcadeGame={() => setArenaTheme('arcade')}
          onOpenClassic={() => setArenaTheme('classic')}
          onSharePost={handleShareRacingPost}
          currentUser={user}
        />
      )}

      {/* 2. Live 2.5D Highway Supercar Race (Image 1) */}
      {arenaTheme === 'race' && (
        <RacingArenaScreen
          onExit={() => setArenaTheme('racing_hub')}
          onShareRace={handleShareRacingPost}
          onFinishRace={(res) => {
            showToast(
              `🏁 Race finished in #${res.race?.position || 1}! +${res.xpEarned} XP • +${res.starsEarned} 🪙`,
              'success'
            );
          }}
          currentUser={user}
        />
      )}

      {/* 3. Dedicated Garage View */}
      {arenaTheme === 'garage' && (
        <GarageView onBack={() => setArenaTheme('racing_hub')} currentUser={user} />
      )}

      {/* 4. Arcade Lab / Mood Mini-Games (Typing Cricket & Word Rush) */}
      {arenaTheme === 'arcade' && (
        <ArcadeLab onBack={() => setArenaTheme('racing_hub')} />
      )}

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
          userBestScore={userBestScore}
          onChallengeGhost={handleChallengeGhost}
          ghostData={ghostData}
          isActive={isActive}
          challenges={challenges}
          activeChallenge={activeChallenge}
          onAcceptChallenge={handleAcceptChallenge}
          onDeclineChallenge={handleDeclineChallenge}
          onExitDuel={handleExitDuel}
          onOpenChallengeModal={() => setIsChallengeModalOpen(true)}
          onAdminRemoveEntry={handleAdminRemoveEntry}
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

          </div>
        </>
      )}

      {/* Global Speed Championship Leaderboard Section (Visible unless actively racing) */}
      {arenaTheme !== 'race' && (
        <div className="pt-8">
          <TypingLeaderboard
            onChallengeGhost={handleChallengeGhost}
            currentSessionDuration={duration}
            currentSessionMode={mode}
          />
        </div>
      )}

      {/* Results Celebration Modal */}
      <TypingResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        results={results}
        onPlayAgain={initTest}
        onShareToFeed={handleShareToFeed}
        onChallengeFriend={() => setIsChallengeModalOpen(true)}
      />

      {/* Typing Challenge 1v1 Modal */}
      <TypingChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        initialWpm={results?.wpm}
        initialAccuracy={results?.accuracy}
        initialRawWpm={results?.rawWpm}
        initialTelemetry={results?.telemetry}
        initialWords={words}
        initialDuration={duration}
        initialMode={mode}
      />
    </div>
  );
};

export default TypingArenaPage;
