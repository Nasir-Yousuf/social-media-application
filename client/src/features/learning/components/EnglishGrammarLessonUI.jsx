import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  Award,
  Layers,
  FileText,
  ChevronRight,
  Filter,
  Check,
  X,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

export const EnglishGrammarLessonUI = ({ lesson, onCompleteLesson }) => {
  const { showToast } = useNotifications();

  // Active Tab: 'rules' | 'flashcards' | 'quiz' | 'breakdown'
  const [activeTab, setActiveTab] = useState('rules');

  // Flashcards State
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardCategoryFilter, setCardCategoryFilter] = useState('All');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [score, setScore] = useState(0);

  const rules = lesson.rules || [];
  const flashcards = lesson.flashcards || [];
  const quizzes = lesson.quizzes || [];

  const filteredFlashcards =
    cardCategoryFilter === 'All'
      ? flashcards
      : flashcards.filter((f) => f.category === cardCategoryFilter);

  const currentFlashcard = filteredFlashcards[flashcardIdx] || filteredFlashcards[0];

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) => (prev + 1) % Math.max(1, filteredFlashcards.length));
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) =>
      prev === 0 ? Math.max(0, filteredFlashcards.length - 1) : prev - 1
    );
  };

  const handleOptionSelect = (qId, optionVal) => {
    if (submittedQuiz) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [qId]: optionVal,
    }));
  };

  const handleGapTextChange = (qId, textVal) => {
    if (submittedQuiz) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [qId]: textVal,
    }));
  };

  const handleSubmitQuiz = () => {
    if (quizzes.length === 0) return;
    let correctCount = 0;

    quizzes.forEach((q) => {
      const userAns = (quizAnswers[q.id] || '').trim().toLowerCase();
      const expected = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map((a) => a.trim().toLowerCase())
        : [q.correctAnswer.trim().toLowerCase()];

      if (expected.includes(userAns)) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setSubmittedQuiz(true);

    const isPassed = correctCount >= Math.ceil(quizzes.length * 0.5);
    if (isPassed) {
      showToast(`🎉 Passed Quiz with ${correctCount}/${quizzes.length}! +35 XP`, 'success');
      if (onCompleteLesson) onCompleteLesson(lesson.id, lesson.track);
    } else {
      showToast(`Keep practicing! You scored ${correctCount}/${quizzes.length}`, 'info');
    }
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setSubmittedQuiz(false);
    setScore(0);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Top Banner & Module Badge */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>{lesson.badge || 'Bangladeshi Curriculum Guide'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {lesson.title?.en || lesson.title?.bn}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              {lesson.explanation?.simple?.bn || lesson.explanation?.simple?.en}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-emerald-200">
              {rules.length} Golden Rules
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300">
              {flashcards.length} Flashcards
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-neutral-200 dark:border-neutral-800">
        {[
          { id: 'rules', label: '1. Golden Rules & Mnemonics', icon: BookOpen, count: rules.length },
          { id: 'flashcards', label: '2. Interactive Flashcards', icon: RotateCw, count: flashcards.length },
          { id: 'quiz', label: '3. Board Exam Practice Quiz', icon: Award, count: quizzes.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GOLDEN RULES & MNEMONIC FORMULAS */}
      {activeTab === 'rules' && (
        <div className="space-y-4 animate-fade-in">
          {rules.length === 0 ? (
            <p className="text-xs text-neutral-500">No rule items found for this module.</p>
          ) : (
            rules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-xs space-y-4 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/20">
                      R{idx + 1}
                    </span>
                    <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                      {rule.ruleTitle}
                    </h3>
                  </div>
                </div>

                {/* Golden Rule Formula Box */}
                {rule.ruleFormula && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold leading-relaxed flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Formula: {rule.ruleFormula}</span>
                  </div>
                )}

                {/* Bengali Explanation */}
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                  {rule.explanationBn}
                </p>

                {/* Mnemonic Device Callout */}
                {rule.mnemonicDevice && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold text-amber-600 dark:text-amber-400 block mb-0.5">
                        Mnemonic / শর্টকাট ছড়া:
                      </strong>
                      <span>{rule.mnemonicDevice}</span>
                    </div>
                  </div>
                )}

                {/* Sentence Examples Table */}
                {rule.examples && rule.examples.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Examples & Sentence Analysis:
                    </h4>
                    <div className="space-y-2">
                      {rule.examples.map((ex, eIdx) => (
                        <div
                          key={eIdx}
                          className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181c23] border border-neutral-200/80 dark:border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="font-mono text-neutral-800 dark:text-neutral-200 font-semibold">
                            "{ex.sentence}"
                          </div>
                          <div className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                            Target: {ex.targetWord} · {ex.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SPACED-REPETITION INTERACTIVE FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar justify-center">
            {['All', 'Rule', 'Shortcut', 'Appropriate Preposition', 'Vocabulary'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCardCategoryFilter(cat);
                  setFlashcardIdx(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  cardCategoryFilter === cat
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredFlashcards.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No flashcards in category "{cardCategoryFilter}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Card Counter */}
              <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                <span>
                  Card {flashcardIdx + 1} of {filteredFlashcards.length}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                  {currentFlashcard.category}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative min-h-[220px] p-8 rounded-3xl border-2 border-dashed border-emerald-500/30 bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-[#121519] dark:via-[#151d26] dark:to-[#121519] shadow-lg flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="w-full flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  <span>{isFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)'}</span>
                  <span>Click to Flip 🔄</span>
                </div>

                <div className="my-auto py-4">
                  {!isFlipped ? (
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-relaxed">
                      {currentFlashcard.front}
                    </h3>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 leading-relaxed">
                        {currentFlashcard.back}
                      </h3>
                      {currentFlashcard.bengaliHint && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                          {currentFlashcard.bengaliHint}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-emerald-500">
                  {!isFlipped ? 'Tap card to reveal answer' : 'Tap card to flip back'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrevFlashcard}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  ← Previous Card
                </button>
                <button
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  Flip Card 🔄
                </button>
                <button
                  onClick={handleNextFlashcard}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer shadow-xs"
                >
                  Next Card →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONTEXTUAL BOARD EXAM PRACTICE QUIZ */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Contextual Board Quiz ({quizzes.length} Questions)
              </h3>
              <p className="text-xs text-neutral-500">
                Designed for Bangladeshi JSC, SSC, and HSC board exam formats.
              </p>
            </div>

            {submittedQuiz && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-emerald-500">
                  Score: {score} / {quizzes.length}
                </span>
                <button
                  onClick={handleRetryQuiz}
                  className="px-3 py-1 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-xs font-bold cursor-pointer"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {quizzes.map((q, qIdx) => {
              const userAns = quizAnswers[q.id] || '';
              const isSubmitted = submittedQuiz;
              const isCorrect =
                isSubmitted &&
                userAns.trim().toLowerCase() ===
                  (Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer).trim().toLowerCase();

              return (
                <div
                  key={q.id || qIdx}
                  className={`rounded-2xl border p-5 transition-all space-y-3 ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-rose-500/50 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                        Q{qIdx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                        {q.prompt}
                      </h4>
                    </div>

                    {q.examContext && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {q.examContext} Exam
                      </span>
                    )}
                  </div>

                  {/* MCQ Options */}
                  {q.type === 'mcq' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAns === opt;
                        const isThisCorrect = opt === q.correctAnswer;

                        return (
                          <button
                            key={oIdx}
                            disabled={isSubmitted}
                            onClick={() => handleOptionSelect(q.id, opt)}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                              isSubmitted
                                ? isThisCorrect
                                  ? 'bg-emerald-500 text-white border-emerald-600'
                                  : isSelected
                                  ? 'bg-rose-500 text-white border-rose-600'
                                  : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 text-neutral-500'
                                : isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                : 'bg-white dark:bg-[#181c23] border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && isThisCorrect && <Check className="w-4 h-4" />}
                            {isSubmitted && isSelected && !isThisCorrect && <X className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Gap Fill / Rewrite Input */}
                  {(q.type === 'gap-fill' || q.type === 'sentence-correction' || q.type === 'passage-rewrite') && (
                    <div className="pt-1 space-y-2">
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={userAns}
                        onChange={(e) => handleGapTextChange(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}

                  {/* Explanation after Submission */}
                  {isSubmitted && (
                    <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#181c23] border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">
                        Board Rule Explanation:
                      </strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submittedQuiz && (
            <button
              onClick={handleSubmitQuiz}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              Submit Quiz Answers & Claim XP →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnglishGrammarLessonUI;
