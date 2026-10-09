import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Keyboard,
  Zap,
  Flame,
  Trophy,
  Sparkles,
  BookOpen,
  Target,
  Play,
  RotateCcw,
  Share2,
  Layers,
  Swords,
  Car,
  Terminal,
  Eye,
} from 'lucide-react';
import LanguageSelector from '../components/code-practice/LanguageSelector';
import CodeStatsHeader from '../components/code-practice/CodeStatsHeader';
import CodeTypingArena from '../components/code-practice/CodeTypingArena';
import CodeKeyboard from '../components/code-practice/CodeKeyboard';
import CodeResultsModal from '../components/code-practice/CodeResultsModal';
import CodeLessonSelectorModal from '../components/code-practice/CodeLessonSelectorModal';
import WeakKeysPanel from '../components/code-practice/WeakKeysPanel';
import DailyCodeChallenge from '../components/code-practice/DailyCodeChallenge';
import CodeProgressDashboard from '../components/code-practice/CodeProgressDashboard';
import ShareAchievementModal from '../components/code-practice/ShareAchievementModal';
import ChallengeFriendModal from '../components/code-practice/ChallengeFriendModal';
import CarRaceArena from '../components/code-practice/CarRaceArena';

import {
  getLessonsByLanguage,
  getLessonById,
  generateWeakKeysSnippet,
} from '../data/codeLessons';

import {
  loadProgressFromStorage,
  recordSessionProgress,
  analyzeSessionPerformance,
  getWeakestKeysList,
} from '../utils/codeTypingAnalyzer';

import { useNotifications } from '../context/NotificationContext';

export const CodePracticePage = () => {
  const { showToast } = useNotifications();

  // Active Practice Tab: 'lesson' | 'carrace' | 'free' | 'weak' | 'daily' | 'progress'
  const [activeTab, setActiveTab] = useState('lesson');

  // Active Typing Sub-Mode: 'classic' | 'arcade' | 'cyber' | 'focus'
  const [typingMode, setTypingMode] = useState('classic');

  // Selected Language: 'html' | 'css' | 'javascript'
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  // Lessons list for selected language
  const [currentLessons, setCurrentLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);

  // Live Stats state during typing
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [liveErrors, setLiveErrors] = useState(0);
  const [liveTypedLength, setLiveTypedLength] = useState(0);
  const [nextCharToType, setNextCharToType] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(true);

  // Modals state
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [lastResults, setLastResults] = useState(null);
  const [shareText, setShareText] = useState('');

  // User Progress local state
  const [progress, setProgress] = useState(loadProgressFromStorage);

  // Load lessons whenever selected language changes
  useEffect(() => {
    const lessons = getLessonsByLanguage(selectedLanguage);
    setCurrentLessons(lessons);

    const completed = progress.completedLessons?.[selectedLanguage] || [];
    const firstIncomplete = lessons.find((l) => !completed.includes(l.id)) || lessons[0];
    setCurrentLesson(firstIncomplete);
  }, [selectedLanguage]);

  // Handle language switch
  const handleSelectLanguage = (langId) => {
    setSelectedLanguage(langId);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setLiveErrors(0);
    setLiveTypedLength(0);
    setNextCharToType('');
  };

  // Handle real-time keystroke from CodeTypingArena
  const handleKeystroke = useCallback((data) => {
    const { nextChar, typedLength, totalLength, errors, totalKeystrokes } = data;
    setNextCharToType(nextChar);
    setLiveTypedLength(typedLength);
    setLiveErrors(errors);

    const acc = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;
    setLiveAccuracy(Math.min(100, Math.max(0, acc)));
  }, []);

  // Handle lesson / race completion
  const handleCompleteSnippet = useCallback(
    (data) => {
      const {
        wpm,
        accuracy,
        errors,
        timeSeconds,
        typedLength,
        mistakesMap,
        wpmHistory = [],
        modeName = null,
        raceRank = null,
      } = data;

      // Analyze errors & record progress
      const analysis = analyzeSessionPerformance(mistakesMap, currentLesson?.snippet || '');
      
      const sessionWeakMap = {};
      if (mistakesMap) {
        Object.keys(mistakesMap).forEach((idx) => {
          const char = currentLesson?.snippet?.[idx];
          if (char) {
            sessionWeakMap[char] = { errors: 1, total: 1 };
          }
        });
      }

      const sessionResult = recordSessionProgress({
        language: selectedLanguage,
        lessonId: currentLesson?.id,
        wpm,
        accuracy,
        errorsCount: errors,
        timeSeconds,
        typedLength,
        sessionWeakMap,
      });

      setProgress(sessionResult.updatedProgress);

      const labelMode =
        modeName ||
        (typingMode === 'arcade'
          ? 'Arcade Combo ⚡'
          : typingMode === 'cyber'
          ? 'Cyber Hacker 💻'
          : typingMode === 'focus'
          ? 'Focus Zen 🧘'
          : 'Classic Curriculum');

      const resultsPayload = {
        wpm,
        accuracy,
        errors,
        timeSeconds,
        typedLength,
        isPersonalBest: sessionResult.isPersonalBestWpm,
        wpmDiff: sessionResult.wpmDiff,
        goodCategories: analysis.goodCategories,
        needsPracticeChars: analysis.needsPracticeChars,
        xpGained: sessionResult.xpGained,
        lessonTitle: currentLesson?.title || 'Code Snippet',
        wpmHistory,
        modeName: labelMode,
        raceRank,
      };

      setLastResults(resultsPayload);
      setIsResultsModalOpen(true);

      if (sessionResult.isPersonalBestWpm) {
        showToast(`🎉 New Personal Best: ${wpm} WPM in ${selectedLanguage.toUpperCase()}!`, 'success');
      }
    },
    [currentLesson, selectedLanguage, showToast, typingMode]
  );

  // Navigate to Next / Prev Lesson
  const currentLessonIdx = currentLessons.findIndex((l) => l.id === currentLesson?.id);
  const hasNextLesson = currentLessonIdx >= 0 && currentLessonIdx < currentLessons.length - 1;
  const hasPrevLesson = currentLessonIdx > 0;

  const handleNextLesson = () => {
    if (hasNextLesson) {
      const nextL = currentLessons[currentLessonIdx + 1];
      setCurrentLesson(nextL);
      setIsResultsModalOpen(false);
    }
  };

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      const prevL = currentLessons[currentLessonIdx - 1];
      setCurrentLesson(prevL);
      setIsResultsModalOpen(false);
    }
  };

  const handleResetCurrentLesson = () => {
    setLiveWpm(0);
    setLiveAccuracy(100);
    setLiveErrors(0);
    setLiveTypedLength(0);
    setNextCharToType('');
    setCurrentLesson((prev) => ({ ...prev }));
  };

  const handleStartWeakKeysDrill = () => {
    const weakList = getWeakestKeysList(progress.weakKeysMap).map((w) => w.char);
    const weakSnippetObj = generateWeakKeysSnippet(selectedLanguage, weakList);
    setCurrentLesson(weakSnippetObj);
    setActiveTab('weak');
    showToast('Targeted Weak Keys drill loaded!', 'info');
  };

  const handleStartDailyChallenge = (dailyObj) => {
    setSelectedLanguage(dailyObj.lang);
    setCurrentLesson({
      id: dailyObj.id,
      title: dailyObj.title,
      difficulty: dailyObj.difficulty,
      description: 'Daily Code Sprint Challenge (+100 XP)',
      snippet: dailyObj.snippet,
    });
    setActiveTab('daily');
    showToast('Daily Challenge loaded! Focus on speed and accuracy.', 'info');
  };

  // Open Share Modal
  const handleOpenShare = () => {
    const langLabel = selectedLanguage === 'html' ? 'HTML' : selectedLanguage === 'css' ? 'CSS' : 'JavaScript';
    const text = `🚀 I reached ${lastResults?.wpm || liveWpm} WPM with ${lastResults?.accuracy || liveAccuracy}% accuracy on Clearfeed Code Practice! ⌨️🔥`;
    setShareText(text);
    setIsResultsModalOpen(false);
    setIsShareModalOpen(true);
  };

  // Open Challenge Modal
  const handleOpenChallenge = () => {
    setIsResultsModalOpen(false);
    setIsChallengeModalOpen(true);
  };

  const progressPercent = currentLesson?.snippet
    ? Math.round((liveTypedLength / currentLesson.snippet.length) * 100)
    : 0;

  const completedLessonIds = progress.completedLessons?.[selectedLanguage] || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Page Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                Code Practice Arena
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Master programming speed with classic lessons, typing car races, arcade combos, and cyber hacker themes.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Progress Summary Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>{progress.streak || 1} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-500 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Level {progress.level || 1} ({progress.xp || 0} XP)</span>
          </div>
        </div>
      </div>

      {/* 2. Practice Mode Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
        {[
          { id: 'lesson', label: 'Curriculum Lessons', icon: BookOpen },
          { id: 'carrace', label: 'Car Typing Race 🏎️', icon: Car },
          { id: 'free', label: 'Free Practice', icon: Layers },
          { id: 'weak', label: 'Weak Keys Drill', icon: Target },
          { id: 'daily', label: 'Daily Challenge', icon: Flame },
          { id: 'progress', label: 'My Progress', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* 10FastFingers / Monkeytype Arena Link */}
        <NavLink
          to="/typing"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-purple-500/20 border border-sky-500/40 text-sky-400 hover:border-sky-400 hover:scale-[1.02] shadow-sm active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Typing Arena & Contest</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase">
            10FastFingers
          </span>
        </NavLink>
      </div>

      {/* 3. My Progress Dashboard Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6 animate-fade-in">
          <CodeProgressDashboard progress={progress} />
          <WeakKeysPanel
            weakKeysMap={progress.weakKeysMap}
            onPracticeWeakKeys={handleStartWeakKeysDrill}
            currentLanguage={selectedLanguage}
          />
        </div>
      )}

      {/* 4. Car Race Mode Tab */}
      {activeTab === 'carrace' && (
        <div className="space-y-5 animate-fade-in">
          <CarRaceArena
            key={currentLesson?.id || 'race'}
            snippet={currentLesson?.snippet || 'const boostNitro = () => { console.log("Turbo Nitro Engaged! 🚀"); };'}
            language={selectedLanguage}
            onComplete={handleCompleteSnippet}
          />
        </div>
      )}

      {/* 5. Main Practice Arena Views (Lesson / Free / Weak / Daily) */}
      {activeTab !== 'progress' && activeTab !== 'carrace' && (
        <div className="space-y-6 animate-fade-in">
          {/* Language Choices Cards/Tabs */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleSelectLanguage}
            progress={progress}
          />

          {/* Typing Sub-Mode Selector Pills (Classic, Arcade, Cyber Hacker, Focus) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200/80 dark:border-neutral-800 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
              <Zap className="w-4 h-4 text-sky-500" />
              <span>Arena Theme Mode:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'classic', label: 'Classic', icon: BookOpen },
                { id: 'arcade', label: 'Arcade Combo ⚡', icon: Zap },
                { id: 'cyber', label: 'Cyber Hacker 💻', icon: Terminal },
                { id: 'focus', label: 'Focus Zen 🧘', icon: Eye },
              ].map((m) => {
                const isSel = typingMode === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setTypingMode(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSel
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-white dark:bg-[#181c23] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Challenge Banner if Daily Tab */}
          {activeTab === 'daily' && (
            <DailyCodeChallenge onStartDaily={handleStartDailyChallenge} progress={progress} />
          )}

          {/* Curriculum Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                Lesson: {currentLesson?.title || 'Basic Code Snippet'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500">
                {currentLessons.findIndex((l) => l.id === currentLesson?.id) + 1} of {currentLessons.length}
              </span>
            </div>

            <button
              onClick={() => setIsCurriculumModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:border-sky-500 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-500" />
              <span>Browse All {selectedLanguage.toUpperCase()} Lessons</span>
            </button>
          </div>

          {/* Live Statistics Information Bar */}
          <CodeStatsHeader
            language={selectedLanguage}
            lessonNumber={currentLessons.findIndex((l) => l.id === currentLesson?.id) + 1 || 1}
            lessonTitle={currentLesson?.title || ''}
            difficulty={currentLesson?.difficulty || 'Beginner'}
            wpm={liveWpm}
            accuracy={liveAccuracy}
            errors={liveErrors}
            typedLength={liveTypedLength}
            totalLength={currentLesson?.snippet?.length || 100}
            progressPercent={progressPercent}
            onReset={handleResetCurrentLesson}
            onPrevLesson={handlePrevLesson}
            onNextLesson={handleNextLesson}
            hasPrev={hasPrevLesson}
            hasNext={hasNextLesson}
            showKeyboard={showKeyboard}
            onToggleKeyboard={() => setShowKeyboard((prev) => !prev)}
          />

          {/* Code Editor Typing Arena */}
          <CodeTypingArena
            key={`${currentLesson?.id}-${typingMode}`}
            snippet={currentLesson?.snippet || ''}
            language={selectedLanguage}
            mode={typingMode}
            onKeystroke={handleKeystroke}
            onComplete={handleCompleteSnippet}
            onReset={handleResetCurrentLesson}
          />

          {/* On-Screen Virtual Programming Keyboard */}
          <CodeKeyboard
            nextChar={nextCharToType}
            isVisible={showKeyboard}
            onToggleVisible={() => setShowKeyboard(false)}
          />

          {/* Programming Weakness Analyzer */}
          <WeakKeysPanel
            weakKeysMap={progress.weakKeysMap}
            onPracticeWeakKeys={handleStartWeakKeysDrill}
            currentLanguage={selectedLanguage}
          />
        </div>
      )}

      {/* Curriculum Selector Modal */}
      <CodeLessonSelectorModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        lessons={currentLessons}
        currentLessonId={currentLesson?.id}
        completedLessonIds={completedLessonIds}
        onSelectLesson={(lesson) => setCurrentLesson(lesson)}
        languageName={selectedLanguage === 'html' ? 'HTML' : selectedLanguage === 'css' ? 'CSS' : 'JavaScript'}
      />

      {/* Wide Horizontal Results Modal */}
      <CodeResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        results={lastResults}
        onNextLesson={hasNextLesson ? handleNextLesson : null}
        onRetry={handleResetCurrentLesson}
        onShare={handleOpenShare}
        onChallenge={handleOpenChallenge}
      />

      {/* Share Achievement Modal */}
      <ShareAchievementModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        results={lastResults}
        initialContent={shareText}
        initialLanguage={selectedLanguage}
      />

      {/* Challenge Friend Modal */}
      <ChallengeFriendModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        results={lastResults}
        language={selectedLanguage}
        snippetTitle={currentLesson?.title || 'Code Battle'}
      />
    </div>
  );
};

export default CodePracticePage;
