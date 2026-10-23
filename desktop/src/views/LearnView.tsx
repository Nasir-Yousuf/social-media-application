import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Code2,
  Terminal,
  RefreshCw,
  Search,
  HelpCircle,
  Trophy,
  Zap,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Cpu,
  Palette,
  Shield,
  Database,
  Flame,
} from 'lucide-react';
import { TRACKS, LESSONS } from '../data/learningCurriculum';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

interface ProgressState {
  completedLessons: string[];
  passedQuizzes: string[];
  xp: number;
  streak: number;
  certificates?: { trackId: string; date: string }[];
}

const LOCAL_STORAGE_KEY = 'clearfeed_desktop_learning_progress';

const TRACK_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'computer-basics': Cpu,
  html: Layers,
  css: Palette,
  bootstrap: Code2,
  javascript: Sparkles,
  react: Sparkles,
  typescript: Shield,
  tailwind: Palette,
  nextjs: Layers,
  python: Terminal,
  pycharm: Cpu,
  'python-ai': Terminal,
  ai: Sparkles,
  english: BookOpen,
  mysql: Database,
};

export const LearnView: React.FC = () => {
  const { user, backendConnected } = useAuth();

  // Navigation states
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'theory' | 'playground' | 'exercise'>('theory');
  const [lang, setLang] = useState<'en' | 'bn' | 'both'>('both');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Quiz & Certificate Modals
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isCertOpen, setIsCertOpen] = useState<boolean>(false);

  // Playground state
  const [playgroundCode, setPlaygroundCode] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Progress state
  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      completedLessons: [],
      passedQuizzes: [],
      xp: 0,
      streak: 1,
      certificates: [],
    };
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Sync with backend if online
  useEffect(() => {
    if (!backendConnected || !user) return;
    api
      .get('/learning/progress')
      .then((res) => {
        if (res.data?.progress) {
          setProgress((prev) => ({
            ...prev,
            ...res.data.progress,
            completedLessons: Array.from(
              new Set([...prev.completedLessons, ...(res.data.progress.completedLessons || [])])
            ),
          }));
        }
      })
      .catch(() => {});
  }, [backendConnected, user]);

  // Current track & lesson objects
  const currentTrack = useMemo(() => {
    if (!selectedTrackId) return null;
    return TRACKS.find((t: any) => t.id === selectedTrackId) || null;
  }, [selectedTrackId]);

  const trackLessons = useMemo(() => {
    if (!selectedTrackId) return [];
    return LESSONS.filter((l: any) => l.track === selectedTrackId);
  }, [selectedTrackId]);

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    return LESSONS.find((l: any) => l.id === activeLessonId) || null;
  }, [activeLessonId]);

  // Load starterCode into playground when lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    const starter =
      activeLesson.starterCode?.javascript ||
      activeLesson.starterCode?.python ||
      activeLesson.starterCode?.html ||
      activeLesson.starterCode?.sql ||
      (typeof activeLesson.starterCode === 'string' ? activeLesson.starterCode : '') ||
      '// Write your code here\nconsole.log("Hello Clearfeed!");';
    setPlaygroundCode(starter);
    setConsoleOutput('Console ready. Press "Run Code" to execute.');
    setActiveTab('theory');
    setIsQuizOpen(false);
    setQuizSubmitted(false);
    setSelectedQuizAnswers({});
  }, [activeLesson]);

  // Category filtering
  const categories = ['All', 'Foundations', 'Frontend & Web', 'Python & AI', 'Databases & SQL'];

  const filteredTracks = useMemo(() => {
    return TRACKS.filter((t: any) => {
      const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
      const matchQuery =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subtitle?.en && t.subtitle.en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.subtitle?.bn && t.subtitle.bn.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Mark lesson completed
  const handleMarkCompleted = (lessonId: string) => {
    if (progress.completedLessons.includes(lessonId)) return;
    const updated = {
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
      xp: progress.xp + 25,
    };
    setProgress(updated);

    if (backendConnected && user) {
      api.post('/learning/progress/complete', { lessonId, trackId: selectedTrackId }).catch(() => {});
    }
  };

  // Run Playground Code Simulation
  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput('Running simulation...');

    setTimeout(() => {
      try {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };

        // Safe evaluation of JS code
        const isJs = !activeLesson?.starterCode?.python && !activeLesson?.starterCode?.sql;
        if (isJs) {
          const runFn = new Function(playgroundCode);
          runFn();
          console.log = originalLog;
          setConsoleOutput(logs.length > 0 ? logs.join('\n') : 'Code executed successfully with zero errors.');
        } else {
          // Python / SQL runner simulation
          console.log = originalLog;
          setConsoleOutput(
            `[Simulated Output - ${activeLesson?.track?.toUpperCase()} Sandbox]\n${playgroundCode
              .split('\n')
              .filter((line) => line.includes('print(') || line.includes('SELECT '))
              .map((l) => '>>> ' + l.trim())
              .join('\n') || '>>> Execution completed with code 0 (success)'}`
          );
        }
      } catch (err: any) {
        setConsoleOutput(`Error: ${err.message || String(err)}`);
      } finally {
        setIsRunningCode(false);
      }
    }, 400);
  };

  // Reset Playground
  const handleResetCode = () => {
    if (!activeLesson) return;
    const starter =
      activeLesson.starterCode?.javascript ||
      activeLesson.starterCode?.python ||
      activeLesson.starterCode?.html ||
      activeLesson.starterCode?.sql ||
      '';
    setPlaygroundCode(starter);
    setConsoleOutput('Reset to original lesson starter template.');
  };

  // Copy code snippet
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Check Quiz Submission
  const handleQuizSubmit = (quiz: any) => {
    setQuizSubmitted(true);
    let correctCount = 0;
    quiz.questions.forEach((q: any) => {
      if (selectedQuizAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const isPassed = correctCount >= (quiz.passingScore || Math.ceil(quiz.questions.length * 0.6));
    if (isPassed && activeLessonId && !progress.passedQuizzes.includes(activeLessonId)) {
      setProgress((prev) => ({
        ...prev,
        passedQuizzes: [...prev.passedQuizzes, activeLessonId],
        xp: prev.xp + (quiz.xpReward || 50),
      }));
      handleMarkCompleted(activeLessonId);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: LESSON DETAIL VIEW
  // -------------------------------------------------------------
  if (activeLesson && currentTrack) {
    const currentIndex = trackLessons.findIndex((l: any) => l.id === activeLesson.id);
    const prevLesson = currentIndex > 0 ? trackLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < trackLessons.length - 1 ? trackLessons[currentIndex + 1] : null;
    const isDone = progress.completedLessons.includes(activeLesson.id);
    const quiz = LESSON_QUIZZES[activeLesson.id];

    return (
      <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
        {/* Lesson Top Bar */}
        <div className="h-14 px-6 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveLessonId(null)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to {currentTrack.title}</span>
            </button>
            <span className="text-neutral-700">|</span>
            <span className="text-xs font-semibold text-neutral-300">
              Lesson {currentIndex + 1} of {trackLessons.length}
            </span>
          </div>

          {/* Lang Selector & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-950 rounded-xl p-0.5 border border-neutral-800 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  lang === 'en' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  lang === 'bn' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('both')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  lang === 'both' ? 'bg-sky-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Both
              </button>
            </div>

            <button
              onClick={() => handleMarkCompleted(activeLesson.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDone
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isDone ? 'Completed' : 'Mark Complete (+25 XP)'}</span>
            </button>
          </div>
        </div>

        {/* Lesson Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <span className="uppercase tracking-wider font-mono">{currentTrack.title}</span>
                <span>•</span>
                <span>{activeLesson.chapter || 'Curriculum Core'}</span>
                <span>•</span>
                <span className="text-amber-400">{activeLesson.difficulty || 'Beginner'}</span>
              </div>
              <h1 className="text-xl font-bold text-neutral-100">
                {lang === 'bn' ? activeLesson.title?.bn || activeLesson.title?.en : activeLesson.title?.en}
              </h1>
              {lang === 'both' && activeLesson.title?.bn && (
                <p className="text-sm font-semibold text-sky-400/90">{activeLesson.title?.bn}</p>
              )}
              <p className="text-xs text-neutral-400">
                {lang === 'bn' ? activeLesson.subtitle?.bn || activeLesson.subtitle?.en : activeLesson.subtitle?.en}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <button
                onClick={() => setActiveTab('theory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'theory'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Theory & Concepts
              </button>
              <button
                onClick={() => setActiveTab('playground')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'playground'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Code2 className="w-4 h-4" />
                Interactive Playground
              </button>
              <button
                onClick={() => setActiveTab('exercise')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'exercise'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                Hands-on Exercise
              </button>

              {quiz && (
                <button
                  onClick={() => setIsQuizOpen(true)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  Take Lesson Quiz
                </button>
              )}
            </div>

            {/* TAB 1: THEORY */}
            {activeTab === 'theory' && (
              <div className="space-y-6">
                {/* What is it card */}
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    What It Is / মূল ধারণা
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {lang === 'bn'
                      ? activeLesson.explanation?.whatIsIt?.bn || activeLesson.explanation?.simple?.bn
                      : activeLesson.explanation?.whatIsIt?.en || activeLesson.explanation?.simple?.en}
                  </p>
                  {lang === 'both' &&
                    (activeLesson.explanation?.whatIsIt?.bn || activeLesson.explanation?.simple?.bn) && (
                      <p className="text-xs text-neutral-400 italic mt-1 leading-relaxed border-t border-neutral-800/80 pt-2">
                        {activeLesson.explanation?.whatIsIt?.bn || activeLesson.explanation?.simple?.bn}
                      </p>
                    )}
                </div>

                {/* Real-World Analogy */}
                {(activeLesson.explanation?.analogy?.en || activeLesson.explanation?.whyNeedIt?.en) && (
                  <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      Real-World Analogy / বাস্তব জীবনের সাথে তুলনা
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {lang === 'bn'
                        ? activeLesson.explanation?.analogy?.bn || activeLesson.explanation?.whyNeedIt?.bn
                        : activeLesson.explanation?.analogy?.en || activeLesson.explanation?.whyNeedIt?.en}
                    </p>
                  </div>
                )}

                {/* Technical Deep Dive */}
                {activeLesson.explanation?.technical?.en && (
                  <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Technical Mechanism & Architecture
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                      {activeLesson.explanation?.technical?.en}
                    </p>
                  </div>
                )}

                {/* Example Code Block */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden space-y-0">
                  <div className="px-4 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-neutral-400">Example Code Preview</span>
                    <button
                      onClick={() => handleCopyCode(playgroundCode)}
                      className="flex items-center gap-1 text-neutral-400 hover:text-white transition cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed bg-[#0d1117]">
                    {playgroundCode}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: PLAYGROUND */}
            {activeTab === 'playground' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">
                    Live Code Editor • Test & verify your code
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                    <button
                      onClick={handleRunCode}
                      disabled={isRunningCode}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {isRunningCode ? 'Running...' : 'Run Code'}
                    </button>
                  </div>
                </div>

                {/* Editor Box */}
                <div className="rounded-2xl border border-neutral-800 bg-[#0d1117] overflow-hidden focus-within:border-sky-500/80 transition">
                  <textarea
                    value={playgroundCode}
                    onChange={(e) => setPlaygroundCode(e.target.value)}
                    rows={12}
                    className="w-full p-4 font-mono text-xs bg-transparent text-neutral-200 outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Console Output */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                  <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Output Terminal</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto min-h-20 bg-neutral-950 leading-relaxed whitespace-pre-wrap">
                    {consoleOutput}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: EXERCISE */}
            {activeTab === 'exercise' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Challenge Instructions
                  </h3>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {lang === 'bn'
                      ? activeLesson.exercise?.instructions?.bn || activeLesson.exercise?.instructions?.en
                      : activeLesson.exercise?.instructions?.en}
                  </p>
                  {activeLesson.exercise?.hint && (
                    <div className="mt-2 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300">
                      <span className="font-bold">Hint: </span>
                      {activeLesson.exercise.hint.en || activeLesson.exercise.hint}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">Solution Code</span>
                  <button
                    onClick={() => {
                      const sol =
                        activeLesson.exercise?.solution?.javascript ||
                        activeLesson.exercise?.solution?.python ||
                        activeLesson.exercise?.solution?.html ||
                        activeLesson.exercise?.solution ||
                        '// Solution verified!';
                      setPlaygroundCode(sol);
                      handleMarkCompleted(activeLesson.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-bold transition cursor-pointer"
                  >
                    Reveal & Load Solution
                  </button>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-[#0d1117] overflow-hidden">
                  <textarea
                    value={playgroundCode}
                    onChange={(e) => setPlaygroundCode(e.target.value)}
                    rows={8}
                    className="w-full p-4 font-mono text-xs bg-transparent text-neutral-200 outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* Next / Prev Navigation Row */}
            <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-between">
              {prevLesson ? (
                <button
                  onClick={() => setActiveLessonId(prevLesson.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Lesson</span>
                </button>
              ) : <div />}

              {nextLesson ? (
                <button
                  onClick={() => {
                    handleMarkCompleted(activeLesson.id);
                    setActiveLessonId(nextLesson.id);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleMarkCompleted(activeLesson.id);
                    setIsCertOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Finish Track & Get Certificate</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QUIZ MODAL */}
        {isQuizOpen && quiz && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">{quiz.title || 'Lesson Quiz'}</h3>
                </div>
                <button
                  onClick={() => setIsQuizOpen(false)}
                  className="text-neutral-500 hover:text-neutral-300 text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4">
                {quiz.questions.map((q: any, qIdx: number) => {
                  const selected = selectedQuizAnswers[q.id];
                  const isCorrect = selected === q.correctIndex;
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <p className="text-xs font-semibold text-neutral-200">
                        {qIdx + 1}. {lang === 'bn' ? q.promptBn || q.prompt : q.prompt}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt: string, optIdx: number) => (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition cursor-pointer border ${
                              quizSubmitted
                                ? optIdx === q.correctIndex
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                                  : selected === optIdx
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-neutral-900 border-neutral-800/80 text-neutral-400'
                                : selected === optIdx
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                                : 'bg-neutral-900 border-neutral-800/60 text-neutral-300 hover:bg-neutral-800'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                              : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                          }`}
                        >
                          <span className="font-bold">{isCorrect ? 'Correct! ' : 'Incorrect: '}</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                {!quizSubmitted ? (
                  <button
                    onClick={() => handleQuizSubmit(quiz)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    onClick={() => setIsQuizOpen(false)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Done (+{quiz.xpReward || 50} XP)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CERTIFICATE MODAL */}
        {isCertOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl relative">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Certificate of Completion
              </h2>
              <p className="text-xs text-neutral-400">
                This is officially certified to award
              </p>
              <p className="text-lg font-bold text-sky-400">{user?.name || 'Clearfeed Scholar'}</p>
              <p className="text-xs text-neutral-300">
                For successfully mastering and completing all modules in{' '}
                <span className="font-bold text-amber-400">{currentTrack.title}</span>.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsCertOpen(false)}
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  Print / Save Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: TRACK LESSON LIST DRILLDOWN
  // -------------------------------------------------------------
  if (currentTrack) {
    const completedInTrack = trackLessons.filter((l: any) => progress.completedLessons.includes(l.id)).length;
    const percent = Math.round((completedInTrack / Math.max(1, trackLessons.length)) * 100);

    return (
      <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto font-sans">
        {/* Track Header */}
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTrackId(null)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All 15 Tracks</span>
          </button>

          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                  {currentTrack.badge || `${currentTrack.totalLessons} Lessons`}
                </span>
                <span className="text-xs text-neutral-500">{currentTrack.category}</span>
              </div>
              <h1 className="text-xl font-bold text-white">{currentTrack.title}</h1>
              <p className="text-xs text-neutral-400 max-w-xl">
                {currentTrack.description?.en || currentTrack.subtitle?.en}
              </p>
            </div>

            {/* Progress Card */}
            <div className="w-full md:w-48 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Progress</span>
                <span className="font-bold text-emerald-400">{percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>{completedInTrack} done</span>
                <span>{trackLessons.length} total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-neutral-300">Curriculum Lessons ({trackLessons.length})</h2>

          <div className="space-y-2">
            {trackLessons.map((les: any, idx: number) => {
              const isDone = progress.completedLessons.includes(les.id);
              return (
                <div
                  key={les.id}
                  onClick={() => setActiveLessonId(les.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer group ${
                    isDone
                      ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-emerald-500/40'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-sky-500/50 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-neutral-800 text-neutral-400 group-hover:bg-sky-500/20 group-hover:text-sky-400'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 text-emerald-400" /> : idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-neutral-200 group-hover:text-white transition truncate">
                          {les.title?.en || les.title}
                        </h3>
                        {les.difficulty && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-500 bg-neutral-800">
                            {les.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {les.subtitle?.en || les.subtitle || 'Master key principles and interactive exercises.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-bold text-sky-400">+25 XP</span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: TRACK CATALOG OVERVIEW (ALL 15 TRACKS)
  // -------------------------------------------------------------
  const totalCompleted = progress.completedLessons.length;
  const overallPercent = Math.round((totalCompleted / Math.max(1, LESSONS.length)) * 100);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <GraduationCap className="w-4 h-4" />
            <span>Clearfeed Academy • 15 Complete Tracks</span>
          </div>
          <h1 className="text-xl font-bold text-white">Full-Stack & AI Learning Roadmap</h1>
          <p className="text-xs text-neutral-400 max-w-xl">
            From computer hardware and foundational HTML/CSS to React, TypeScript, Tailwind, Next.js, Python,
            AI Academy, and MySQL databases. Learn 100% offline or synced online.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 shrink-0">
          <div className="text-center">
            <p className="text-xs font-semibold text-neutral-400">XP Earned</p>
            <p className="text-lg font-bold text-amber-400">{progress.xp}</p>
          </div>
          <span className="h-8 w-px bg-neutral-800" />
          <div className="text-center">
            <p className="text-xs font-semibold text-neutral-400">Lessons</p>
            <p className="text-lg font-bold text-emerald-400">
              {totalCompleted} / {LESSONS.length}
            </p>
          </div>
          <span className="h-8 w-px bg-neutral-800" />
          <div className="text-center">
            <p className="text-xs font-semibold text-neutral-400">Mastery</p>
            <p className="text-lg font-bold text-sky-400">{overallPercent}%</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks or topics..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 outline-none focus:border-sky-500/80 transition"
          />
        </div>
      </div>

      {/* Tracks Grid (All 15 Tracks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTracks.map((track: any) => {
          const IconComponent = TRACK_ICONS[track.id] || Code2;
          const lessonsInTrack = LESSONS.filter((l: any) => l.track === track.id);
          const completedCount = lessonsInTrack.filter((l: any) =>
            progress.completedLessons.includes(l.id)
          ).length;
          const trackPercent = Math.round((completedCount / Math.max(1, lessonsInTrack.length)) * 100);

          return (
            <div
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className="p-5 rounded-3xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 transition flex flex-col justify-between space-y-4 cursor-pointer group hover:scale-[1.01] duration-150"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm"
                    style={{ backgroundColor: track.accentColor || '#0284c7' }}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                    {track.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-100 group-hover:text-white transition">
                    {track.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {track.subtitle?.en || track.description?.en}
                  </p>
                </div>
              </div>

              {/* Bottom Progress Bar */}
              <div className="space-y-1.5 pt-3 border-t border-neutral-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">{lessonsInTrack.length} Lessons</span>
                  <span className="font-bold text-neutral-300">{trackPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${trackPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearnView;
