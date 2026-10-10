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
import AiSimulationRenderer from './aiSimulations/AiSimulationRenderer';
import { useNotifications } from '../../../context/NotificationContext';
import { useConfirm } from '../../../context/ConfirmContext';

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
  const { confirm } = useConfirm();

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
  const [feynmanUserAnswer, setFeynmanUserAnswer] = useState('');
  const [showFeynmanSample, setShowFeynmanSample] = useState(false);

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

  // Reset editor, Feynman input & scroll to top when lessonId changes
  useEffect(() => {
    setUserCode({
      html: lesson.starterCode?.html || '',
      css: lesson.starterCode?.css || '',
      javascript: lesson.starterCode?.javascript || '',
    });
    setActiveEditorTab(
      lesson.track === 'css' ? 'css' : lesson.track === 'javascript' ? 'javascript' : 'html'
    );
    setFeynmanUserAnswer('');
    setShowFeynmanSample(false);
    setRunTrigger((prev) => prev + 1);

    // Scroll window and root elements to top for seamless navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [lesson.id, lesson.starterCode, lesson.track]);

  const handleRunCode = () => {
    setRunTrigger((prev) => prev + 1);
    showToast('Code executed in preview sandbox', 'info');
  };

  const handleResetCode = async () => {
    const ok = await confirm({
      title: 'Reset code to starter code?',
      description: 'Your current editor changes will be reverted back to the starter code template for this lesson.',
      confirmText: 'Reset Code',
      cancelText: 'Keep Editing',
      variant: 'reset',
      icon: 'refresh',
    });
    if (!ok) return;

    setUserCode({
      html: lesson.starterCode?.html || '',
      css: lesson.starterCode?.css || '',
      javascript: lesson.starterCode?.javascript || '',
    });
    setRunTrigger((prev) => prev + 1);
    showToast('Code reset to starter template', 'info');
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

      {/* Render AI Interactive Simulation Canvas if available */}
      {lesson.track === 'ai' && <AiSimulationRenderer lesson={lesson} />}

      {/* Main Split: Left Column (Lesson Explanation) & Right Column (Code Editor & Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Explanations (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Concept Card: What & Why & Analogy */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-xs space-y-5">
            {/* 1. Simple Explanation / What is it? */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Simple Explanation / সহজ ভাষায় পরিচিতি</span>
              </div>
              {(lang === 'en' || lang === 'both') && (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  {lesson.explanation?.simple?.en || lesson.explanation?.whatIsIt?.en}
                </p>
              )}
              {(lang === 'bn' || lang === 'both') && (
                <p
                  className={`text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed ${
                    lang === 'both' ? 'mt-1.5 border-l-2 border-sky-400 pl-2.5 text-xs text-neutral-600 dark:text-neutral-400' : ''
                  }`}
                >
                  {lesson.explanation?.simple?.bn || lesson.explanation?.whatIsIt?.bn}
                </p>
              )}
            </div>

            {/* 2. Real-Life Analogy */}
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

            {/* 3. Technical Explanation / Why do we need it? */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {lesson.explanation?.technical
                    ? 'Behind The Scenes (Technical) / প্রযুক্তিগত মেকানিজম'
                    : 'Why do we need it? / কেন প্রয়োজন?'}
                </span>
              </div>
              {(lang === 'en' || lang === 'both') && (
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  {lesson.explanation?.technical?.en || lesson.explanation?.whyNeedIt?.en}
                </p>
              )}
              {(lang === 'bn' || lang === 'both') && (
                <p
                  className={`text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed ${
                    lang === 'both' ? 'mt-1.5 border-l-2 border-emerald-400 pl-2.5 text-xs text-neutral-600 dark:text-neutral-400' : ''
                  }`}
                >
                  {lesson.explanation?.technical?.bn || lesson.explanation?.whyNeedIt?.bn}
                </p>
              )}
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

          {/* Exercise Challenge Box (Web Tracks Only) */}
          {lesson.track !== 'ai' && (
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
          )}

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

        {/* Right Column: Web Code Editor OR AI Learning Workspace Cards */}
        <div className="lg:col-span-7 space-y-4">
          {lesson.track !== 'ai' ? (
            <>
              {/* Web Development Interactive Code Editor */}
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
            </>
          ) : (
            <div className="space-y-4">
              {/* Feynman Technique Self-Explanation Card */}
              {lesson.feynmanChallenge && (
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-xl text-white space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    <span>Feynman Technique: Explain in Your Own Words</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {lesson.feynmanChallenge.question}
                  </p>
                  <textarea
                    value={feynmanUserAnswer}
                    onChange={(e) => setFeynmanUserAnswer(e.target.value)}
                    placeholder="Write your explanation here in plain English or Bangla..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowFeynmanSample(!showFeynmanSample)}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      {showFeynmanSample ? 'Hide Model Explanation ↑' : 'Compare with Model Explanation ↓'}
                    </button>
                    {feynmanUserAnswer.trim().length > 10 && (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Thought recorded!
                      </span>
                    )}
                  </div>
                  {showFeynmanSample && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 leading-relaxed animate-fade-in">
                      <strong>Sample Model Explanation:</strong> {lesson.feynmanChallenge.modelAnswer || lesson.feynmanChallenge.sampleAnswer}
                    </div>
                  )}
                </div>
              )}

              {/* Misconceptions Card */}
              {lesson.misconceptions && lesson.misconceptions.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-white space-y-3">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Common Misconceptions & Pitfalls</span>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-300">
                    {lesson.misconceptions.map((item, idx) => {
                      if (!item) return null;
                      if (typeof item === 'string') {
                        return (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold shrink-0">•</span>
                            <span>{item}</span>
                          </div>
                        );
                      }
                      const mythText = item.misconception || item.myth || item.en || item.text;
                      const truthText = item.correction || item.truth || item.explanation;
                      return (
                        <div key={idx} className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-amber-500/20">
                          {mythText && (
                            <div className="flex items-start gap-2 text-rose-300">
                              <span className="font-bold shrink-0 text-rose-400">❌ Myth:</span>
                              <span>{mythText}</span>
                            </div>
                          )}
                          {truthText && (
                            <div className="flex items-start gap-2 text-emerald-300">
                              <span className="font-bold shrink-0 text-emerald-400">✓ Truth:</span>
                              <span>{truthText}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Takeaways Summary Card */}
              {lesson.summary && lesson.summary.length > 0 && (
                <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-white space-y-3">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    📌 Key Takeaways & Summary
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {lesson.summary.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold shrink-0">✓</span>
                        <span>{typeof item === 'string' ? item : item.en || item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

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
                <span>Next: {typeof nextLesson.title === 'string' ? nextLesson.title.split('.')[0] : nextLesson.title.en.split('.')[0]}</span>
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
        lesson={lesson}
        lessonId={lesson.id}
        lessonTitle={typeof lesson.title === 'string' ? lesson.title : lesson.title?.en}
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
