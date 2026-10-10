import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  X,
  Award,
  BookOpen,
} from 'lucide-react';
import { LESSON_QUIZZES } from '../data/lessonQuizzes';
import { LESSONS } from '../data/learningCurriculum';
import api from '../../../api/client';
import { useNotifications } from '../../../context/NotificationContext';
import typingSounds from '../../../utils/typingSounds';

export const LessonQuizModal = ({
  lessonId,
  lessonTitle,
  trackId,
  lesson,
  isOpen,
  onClose,
  onQuizPassed,
  lang = 'both',
}) => {
  const { showToast } = useNotifications();

  const activeLesson = lesson || LESSONS.find((l) => l.id === lessonId);
  const activeTitle = (typeof lessonTitle === 'string' && lessonTitle.trim().length > 0)
    ? lessonTitle
    : (activeLesson ? (typeof activeLesson.title === 'string' ? activeLesson.title : activeLesson.title?.en) : lessonId);

  let quiz = LESSON_QUIZZES[lessonId];

  // If lesson has embedded quiz object (e.g. AI Academy lessons)
  if (!quiz && activeLesson?.quiz) {
    const qObj = activeLesson.quiz;
    quiz = {
      title: `${activeTitle} Quiz`,
      passingScore: 1,
      xpReward: 25,
      questions: [
        {
          id: `${lessonId}-q1`,
          prompt: qObj.question || qObj.prompt || `Knowledge Check for ${activeTitle}`,
          options: qObj.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: typeof qObj.correctAnswer === 'number' ? qObj.correctAnswer : (qObj.correctIndex || 0),
          explanation: qObj.explanation || 'Review the lesson takeaways and core concepts.',
        },
      ],
    };
  }

  // Fallback: If no predefined quiz, dynamically construct topic-specific quiz from lesson content
  if (!quiz && activeLesson) {
    const rawSummary = Array.isArray(activeLesson.summary) && activeLesson.summary.length > 0
      ? activeLesson.summary
      : ['Understand the key principles of this topic.', 'Apply concept models in real-world scenarios.'];
    const summaryPoints = rawSummary.map(s => typeof s === 'string' ? s : (s.en || s.text || String(s)));

    quiz = {
      title: `Lesson Knowledge Check: ${activeTitle}`,
      passingScore: 1,
      xpReward: 25,
      questions: [
        {
          id: `${lessonId}-dynamic-1`,
          prompt: `What is a core takeaway from "${activeTitle}"?`,
          promptBn: `"${activeTitle}" পাঠের মূল বিষয়বস্তু কী?`,
          options: [
            summaryPoints[0] || 'Master fundamental concepts and principles of the topic.',
            'Disregard core principles and guess blindly.',
            'Skip key examples and practice activities.',
            'Memorize terms without understanding how they function.',
          ],
          correctIndex: 0,
          explanation: summaryPoints[0] || 'Grasping fundamental principles is essential for topic mastery.',
          explanationBn: 'মূল বিষয়বস্তু উপলব্ধি করা যেকোনো টপিক শেখার মূল চাবিকাঠি।',
        },
      ],
    };
  }

  if (!quiz) {
    quiz = LESSON_QUIZZES['html-intro'];
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> selectedIndex
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // questionId -> boolean (was option submitted)
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !quiz) return null;

  const currentQ = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const hasSelected = selectedAnswers[currentQ.id] !== undefined;
  const isAnswerRevealed = submittedAnswers[currentQ.id];

  const handleSelectOption = (idx) => {
    if (isAnswerRevealed) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
    setSubmittedAnswers((prev) => ({ ...prev, [currentQ.id]: true }));

    // Sound effect based on right/wrong
    if (idx === currentQ.correctIndex) {
      typingSounds.playKey(' ');
    } else {
      typingSounds.playError();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      calculateAndFinish();
    }
  };

  const calculateAndFinish = async () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const passed = score >= quiz.passingScore;
    setIsFinished(true);

    if (passed) {
      typingSounds.playFinish();
    }

    try {
      setSubmitting(true);
      let xpEarned = 25;
      try {
        const res = await api.post('/learning/quiz/submit', {
          lessonId,
          track: trackId,
          score,
          passed,
        });
        if (res.data?.xpEarned) {
          xpEarned = res.data.xpEarned;
        }
      } catch (err) {
        console.warn('Failed to save quiz progress to backend API:', err.message);
      }

      if (passed && onQuizPassed) {
        onQuizPassed(lessonId, score, xpEarned);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setIsFinished(false);
  };

  // Calculate final score
  let finalCorrect = 0;
  quiz.questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctIndex) finalCorrect++;
  });
  const passed = finalCorrect >= quiz.passingScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#111622] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-gradient-to-r from-sky-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500 text-white shadow-xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold">
                Interactive Knowledge Check
              </span>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                {quiz.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!isFinished ? (
            <>
              {/* Question Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span>
                    Passing: {quiz.passingScore}/{totalQuestions}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Prompt */}
              <div className="py-2">
                <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                  {lang === 'bn' && currentQ.promptBn ? currentQ.promptBn : currentQ.prompt}
                </h4>
                {lang === 'both' && currentQ.promptBn && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                    {currentQ.promptBn}
                  </p>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;
                  const showResult = isAnswerRevealed;

                  let borderClass = 'border-neutral-200 dark:border-neutral-800 hover:border-sky-400 dark:hover:border-sky-500/50';
                  let bgClass = 'bg-neutral-50/50 dark:bg-black/20 hover:bg-sky-50/50 dark:hover:bg-sky-950/20';
                  let textClass = 'text-neutral-800 dark:text-neutral-200';

                  if (showResult) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15';
                      textClass = 'text-emerald-700 dark:text-emerald-300 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/15';
                      textClass = 'text-rose-700 dark:text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${borderClass} ${bgClass}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 text-neutral-600 dark:text-neutral-300 font-mono">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className={`text-sm leading-normal flex-1 font-mono ${textClass}`}>
                        {opt}
                      </span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Feedback Box */}
              {isAnswerRevealed && (
                <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1 animate-fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                    <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                    <span>Learning Takeaway / ব্যাখ্যা:</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                    {lang === 'bn' && currentQ.explanationBn ? currentQ.explanationBn : currentQ.explanation}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Quiz Completed Results Card */
            <div className="py-6 text-center space-y-4">
              <div
                className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
                  passed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/20'
                }`}
              >
                {passed ? <Award className="w-8 h-8 animate-bounce" /> : <RotateCcw className="w-8 h-8" />}
              </div>

              <div>
                <h4 className="text-xl font-black text-neutral-900 dark:text-neutral-100">
                  {passed ? 'Concept Mastered! 🎉' : 'Needs A Little More Practice'}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs mx-auto">
                  {passed
                    ? 'Great job! You demonstrated a solid grasp of this lesson\'s concepts.'
                    : `You scored ${finalCorrect} of ${totalQuestions}. Review the notes and try again to unlock the next chapter!`}
                </p>
              </div>

              {/* Score pill */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 font-mono text-sm">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">
                  Score: {finalCorrect} / {totalQuestions}
                </span>
                {passed && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    +25 XP Earned! ⚡
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0c1018] flex items-center justify-between gap-3">
          {!isFinished ? (
            <>
              <span className="text-xs text-neutral-500 font-mono">
                {isAnswerRevealed ? 'Tap Next to continue' : 'Select an answer'}
              </span>

              <button
                type="button"
                disabled={!isAnswerRevealed}
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs shadow-sky-500/25 cursor-pointer"
              >
                <span>{currentIndex + 1 === totalQuestions ? 'Finish Quiz' : 'Next Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              {!passed && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className={`ml-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer ${
                  passed ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-neutral-800 hover:bg-neutral-700'
                }`}
              >
                {passed ? 'Continue Lesson' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonQuizModal;
