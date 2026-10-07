import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Info,
  Layers,
} from 'lucide-react';
import { TRACKS, LESSONS } from '../data/learningCurriculum';
import LanguageToggle from './LanguageToggle';
import CodeEditor from './CodeEditor';
import CodePreview from './CodePreview';
import ExerciseChallenge from './ExerciseChallenge';
import LessonQuizModal from './LessonQuizModal';
import { useNotifications } from '../../../context/NotificationContext';

export const LessonView = ({
  lessonId,
  progress = {},
  lang = 'both',
  onLangChange,
  onLessonCompleted,
  onOpenAskQuestion,
  onProgressUpdate,
}) => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const lesson = LESSONS.find((l) => l.id === lessonId) || LESSONS[0];
  const track = TRACKS.find((t) => t.id === lesson.track) || TRACKS[0];
  const trackLessons = LESSONS.filter((l) => l.track === lesson.track);
  const currentIndex = trackLessons.findIndex((l) => l.id === lesson.id);

  const prevLesson = currentIndex > 0 ? trackLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < trackLessons.length - 1 ? trackLessons[currentIndex + 1] : null;

  const completedSet = new Set(progress.completedLessons || []);
  const passedQuizzesSet = new Set(progress.passedQuizzes || []);
  const isCompleted = completedSet.has(lesson.id);
  const isQuizPassed = passedQuizzesSet.has(lesson.id);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Initialize editor code
  const initialCode = {
    html: lesson.starterCode?.html || '',
    css: lesson.starterCode?.css || '',
    javascript: lesson.starterCode?.javascript || '',
  };

  const [userCode, setUserCode] = useState(initialCode);
  const [activeEditorTab, setActiveEditorTab] = useState(
    lesson.track === 'css' ? 'css' : lesson.track === 'javascript' ? 'javascript' : 'html'
  );
  const [runTrigger, setRunTrigger] = useState(0);

  // Reset editor when lessonId changes
  useEffect(() => {
    setUserCode({
      html: lesson.starterCode?.html || '',
      css: lesson.starterCode?.css || '',
      javascript: lesson.starterCode?.javascript || '',
    });
    setActiveEditorTab(
      lesson.track === 'css' ? 'css' : lesson.track === 'javascript' ? 'javascript' : 'html'
    );
    setRunTrigger((prev) => prev + 1);
  }, [lesson.id, lesson.starterCode, lesson.track]);

  const handleRunCode = () => {
    setRunTrigger((prev) => prev + 1);
    showToast('Code executed in preview sandbox', 'info');
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to original starter code?')) {
      setUserCode({
        html: lesson.starterCode?.html || '',
        css: lesson.starterCode?.css || '',
        javascript: lesson.starterCode?.javascript || '',
      });
      setRunTrigger((prev) => prev + 1);
    }
  };

  const handleApplySolution = (solutionObj) => {
    setUserCode((prev) => ({
      ...prev,
      ...solutionObj,
    }));
    setRunTrigger((prev) => prev + 1);
    showToast('Solution loaded into editor', 'info');
  };

  // Client-side lightweight code validation
  const handleCheckCode = () => {
    handleRunCode();
    const val = lesson.exercise?.validation;
    if (!val) {
      onLessonCompleted(lesson.id, lesson.track);
      return { success: true, message: 'All checks passed!' };
    }

    const { type, requiredTags, property, keyword, minTextLength } = val;
    const htmlCode = (userCode.html || '').toLowerCase();
    const cssCode = (userCode.css || '').toLowerCase();
    const jsCode = (userCode.javascript || '').toLowerCase();

    if (type === 'html_tags') {
      const missing = (requiredTags || []).filter((t) => !htmlCode.includes(`<${t}`));
      if (missing.length > 0) {
        return {
          success: false,
          message: `Missing tag: <${missing[0]}>. Please make sure you write the <${missing[0]}> tag.`,
        };
      }
      if (minTextLength && htmlCode.replace(/<[^>]*>/g, '').trim().length < minTextLength) {
        return {
          success: false,
          message: 'Please add some meaningful text inside your HTML tags.',
        };
      }
    } else if (type === 'html_contains_attr') {
      const { tag, attr } = val;
      if (!htmlCode.includes(`<${tag}`) || !htmlCode.includes(`${attr}=`)) {
        return {
          success: false,
          message: `Make sure you have a <${tag}> tag with the ${attr}="..." attribute.`,
        };
      }
    } else if (type === 'css_property') {
      if (!cssCode.includes(property)) {
        return {
          success: false,
          message: `CSS property "${property}" is missing. Please add it inside your CSS rules.`,
        };
      }
    } else if (type === 'css_contains') {
      if (!cssCode.includes(keyword)) {
        return {
          success: false,
          message: `Make sure your CSS includes "${keyword}".`,
        };
      }
    } else if (type === 'js_contains') {
      if (!jsCode.includes(keyword)) {
        return {
          success: false,
          message: `JavaScript code is missing "${keyword}". Please check the instructions.`,
        };
      }
    } else if (type === 'js_contains_any') {
      const hasAny = (val.keywords || []).some((k) => jsCode.includes(k));
      if (!hasAny) {
        return {
          success: false,
          message: `Make sure to declare variables using let or const.`,
        };
      }
    }

    // Success! Mark completed
    onLessonCompleted(lesson.id, lesson.track);
    return {
      success: true,
      message: 'Excellent work! Your code satisfies all the requirements.',
    };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/85 dark:bg-black/85 border-b border-neutral-200/80 dark:border-neutral-800/80 -mx-4 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <NavLink
            to={`/learn/${lesson.track}`}
            className="p-1.5 -ml-1 text-neutral-600 dark:text-neutral-300 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer shrink-0"
            title="Back to Roadmap"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                {track.title} · Lesson {lesson.order} of {trackLessons.length}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Done</span>
                </span>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {lang === 'bn' ? lesson.title.bn : lesson.title.en}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle lang={lang} onChange={onLangChange} />

          {onOpenAskQuestion && (
            <button
              type="button"
              onClick={() => onOpenAskQuestion(lesson)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Left Column (Lesson Explanation) & Right Column (Code Editor & Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Explanations (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Concept Card: What & Why & Analogy */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-xs space-y-5">
            {/* 1. What is it? */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>What is it? / কী এটা?</span>
              </div>
              {(lang === 'en' || lang === 'both') && (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  {lesson.explanation?.whatIsIt?.en}
                </p>
              )}
              {(lang === 'bn' || lang === 'both') && (
                <p
                  className={`text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed ${
                    lang === 'both' ? 'mt-1.5 border-l-2 border-sky-400 pl-2.5 text-xs text-neutral-600 dark:text-neutral-400' : ''
                  }`}
                >
                  {lesson.explanation?.whatIsIt?.bn}
                </p>
              )}
            </div>

            {/* 2. Why do we need it? */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Why do we need it? / কেন প্রয়োজন?</span>
              </div>
              {(lang === 'en' || lang === 'both') && (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  {lesson.explanation?.whyNeedIt?.en}
                </p>
              )}
              {(lang === 'bn' || lang === 'both') && (
                <p
                  className={`text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed ${
                    lang === 'both' ? 'mt-1.5 border-l-2 border-emerald-400 pl-2.5 text-xs text-neutral-600 dark:text-neutral-400' : ''
                  }`}
                >
                  {lesson.explanation?.whyNeedIt?.bn}
                </p>
              )}
            </div>

            {/* 3. Real-life Analogy */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Real-Life Analogy / বাস্তব জীবনের উদাহরণ</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {(lang === 'en' || lang === 'both') && (
                  <p className="font-medium">{lesson.explanation?.analogy?.en}</p>
                )}
                {(lang === 'bn' || lang === 'both') && (
                  <p className={lang === 'both' ? 'mt-1 text-neutral-600 dark:text-neutral-300' : ''}>
                    {lesson.explanation?.analogy?.bn}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Code Example */}
            {lesson.exampleCode && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-500">Example Code:</span>
                  <button
                    type="button"
                    onClick={() => handleApplySolution(lesson.exampleCode)}
                    className="text-[11px] font-bold text-sky-500 hover:underline cursor-pointer"
                  >
                    Try this example →
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed">
                  {lesson.exampleCode.html || lesson.exampleCode.css || lesson.exampleCode.javascript}
                </pre>
              </div>
            )}
          </div>

          {/* Exercise Challenge Box */}
          <ExerciseChallenge
            lesson={lesson}
            userCode={userCode}
            lang={lang}
            onRunCode={handleRunCode}
            onCheckCode={handleCheckCode}
            onNextLesson={() => nextLesson && navigate(`/learn/${nextLesson.track}/${nextLesson.id}`)}
            hasNextLesson={Boolean(nextLesson)}
            isCompleted={isCompleted}
            onApplySolution={handleApplySolution}
          />

          {/* Lesson Concept Knowledge Check Test Card */}
          <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl ${
                  isQuizPassed ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-amber-500 text-white shadow-amber-500/30'
                } shadow-md shrink-0`}
              >
                {isQuizPassed ? <CheckCircle2 className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Lesson Concept Knowledge Check
                  </h4>
                  {isQuizPassed && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-mono">
                      PASSED (+25 XP)
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {isQuizPassed
                    ? 'You demonstrated solid understanding of this lesson. You can retake anytime.'
                    : 'Answer 3 interactive questions to test yourself and verify you mastered this concept!'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsQuizModalOpen(true)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs ${
                isQuizPassed
                  ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
              }`}
            >
              {isQuizPassed ? 'Review Test ↺' : 'Take Knowledge Test 🎯'}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Editor & Live Sandboxed Preview (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Interactive Code Editor */}
          <CodeEditor
            code={userCode}
            onChange={setUserCode}
            onReset={handleResetCode}
            activeTab={activeEditorTab}
            setActiveTab={setActiveEditorTab}
          />

          {/* Sandboxed Live Preview & Console Output */}
          <CodePreview
            html={userCode.html}
            css={userCode.css}
            javascript={userCode.javascript}
            runTrigger={runTrigger}
          />

          {/* Stepper Navigation (Previous Lesson / Next Lesson) */}
          <div className="flex items-center justify-between pt-2">
            {prevLesson ? (
              <NavLink
                to={`/learn/${prevLesson.track}/${prevLesson.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Lesson</span>
              </NavLink>
            ) : <div />}

            {nextLesson ? (
              <NavLink
                to={`/learn/${nextLesson.track}/${nextLesson.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/20"
              >
                <span>Next: {nextLesson.title.en.split('.')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            ) : (
              <NavLink
                to={`/learn/${lesson.track}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span>Complete Track 🎉</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Quiz Modal */}
      <LessonQuizModal
        lessonId={lesson.id}
        lessonTitle={lesson.title.en}
        trackId={lesson.track}
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onQuizPassed={(lId, score, xp) => {
          onLessonCompleted(lId, lesson.track);
          if (onProgressUpdate) onProgressUpdate();
          showToast(`Lesson mastered! +${xp} XP gained! 🎉`, 'success');
        }}
        lang={lang}
      />
    </div>
  );
};

export default LessonView;
