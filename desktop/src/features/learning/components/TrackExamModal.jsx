import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  FileCheck,
} from 'lucide-react';
import { TRACK_FINAL_EXAMS } from '../data/lessonQuizzes';
import api from '../../../api/client';
import { useNotifications } from '../../../context/NotificationContext';
import typingSounds from '../../../utils/typingSounds';

export const TrackExamModal = ({
  trackId = 'html',
  trackTitle = 'HTML5 Web Architecture',
  isOpen,
  onClose,
  onExamPassed,
  studentName = 'Learner',
}) => {
  const { showToast } = useNotifications();
  const exam = TRACK_FINAL_EXAMS[trackId] || TRACK_FINAL_EXAMS['html'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> selectedIndex
  const [isFinished, setIsFinished] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !exam) return null;

  const currentQ = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = (idx) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
    typingSounds.playKey(' ');
  };

  const handleSubmitExam = async () => {
    let correct = 0;
    exam.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const percent = Math.round((correct / totalQuestions) * 100);
    const passed = percent >= exam.passingPercentage;

    setSubmitting(true);
    try {
      const res = await api.post('/learning/exam/submit', {
        trackId,
        trackTitle: exam.trackTitle || trackTitle,
        score: percent,
        studentName,
      });

      const resultData = {
        score: percent,
        correctCount: correct,
        totalCount: totalQuestions,
        passed,
        certificate: res.data.certificate,
        xpEarned: res.data.xpEarned || 0,
      };

      setExamResult(resultData);
      setIsFinished(true);

      if (passed) {
        typingSounds.playFinish();
        if (onExamPassed) {
          onExamPassed(resultData);
        }
      } else {
        typingSounds.playError();
      }
    } catch (err) {
      console.warn('Failed to submit exam:', err);
      showToast('Error recording exam results.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsFinished(false);
    setExamResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0f1420] border-2 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Clearfeed Official Certification
              </span>
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100">
                {exam.trackTitle} — Final Exam
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!isFinished ? (
            <>
              {/* Question Navigation Palette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span>
                    Answered: {answeredCount}/{totalQuestions}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800">
                  {exam.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                            : isAnswered
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Prompt */}
              <div className="pt-2">
                <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider">
                  Q{currentIndex + 1}. Comprehensive Knowledge Evaluation
                </span>
                <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1 leading-snug">
                  {currentQ.prompt}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelect(optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-amber-400/50 bg-neutral-50/50 dark:bg-black/20 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-sm font-mono leading-normal flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Exam Results Summary Card */
            <div className="py-6 text-center space-y-4">
              <div
                className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-xl ${
                  examResult?.passed
                    ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 shadow-amber-500/20'
                    : 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/50 shadow-rose-500/20'
                }`}
              >
                {examResult?.passed ? (
                  <Trophy className="w-10 h-10 animate-bounce" />
                ) : (
                  <RotateCcw className="w-10 h-10" />
                )}
              </div>

              <div>
                <h4 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
                  {examResult?.passed
                    ? 'Certification Exam Passed! 🎓'
                    : 'Exam Incomplete — Practice Again'}
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                  {examResult?.passed
                    ? `Outstanding! You achieved ${examResult.score}%, passing the official benchmark. Your Certificate of Completion has been generated!`
                    : `You scored ${examResult?.score}% (${examResult?.correctCount} / ${examResult?.totalCount}). You need 80% to earn your Certificate of Completion.`}
                </p>
              </div>

              {/* Score pill */}
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 font-mono text-base">
                <span className="font-black text-neutral-900 dark:text-neutral-100">
                  Final Score: {examResult?.score}%
                </span>
                {examResult?.passed && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black uppercase">
                    +150 XP Awarded ⚡
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0d16] flex items-center justify-between gap-3">
          {!isFinished ? (
            <>
              <div className="flex items-center gap-2">
                {currentIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentIndex + 1 < totalQuestions ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-800 dark:bg-neutral-700 text-white hover:bg-neutral-900 transition-colors shadow-xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmitExam}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{submitting ? 'Evaluating...' : 'Submit Certification Exam'}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              {!examResult?.passed ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-take Exam</span>
                </button>
              ) : (
                <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Credential Recorded</span>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-neutral-800 text-white hover:bg-neutral-700 transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackExamModal;
