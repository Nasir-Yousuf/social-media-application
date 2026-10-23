import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

export const ExerciseChallenge = ({
  lesson,
  userCode,
  lang = 'both',
  onRunCode,
  onCheckCode,
  onNextLesson,
  hasNextLesson = false,
  isCompleted = false,
  onApplySolution,
  className = '',
}) => {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // { success: boolean, message: string }
  const [checking, setChecking] = useState(false);

  const { exercise } = lesson;
  if (!exercise) return null;

  const handleValidate = () => {
    setChecking(true);
    setTimeout(() => {
      const result = onCheckCode();
      setValidationResult(result);
      setChecking(false);
    }, 200);
  };

  return (
    <div
      className={`rounded-2xl border border-sky-200/80 dark:border-sky-500/20 bg-gradient-to-b from-sky-50/40 to-white dark:from-[#0d121c] dark:to-[#0a0d13] p-4 sm:p-5 shadow-xs font-sans ${className}`}
    >
      {/* Challenge Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-sky-500 text-white shadow-xs shadow-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              {lang === 'bn' ? 'আপনার জন্য চ্যালেঞ্জ' : 'Your Turn & Challenge'}
            </h3>
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              {lesson.difficulty}
            </span>
          </div>
        </div>

        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        )}
      </div>

      {/* Instructions depending on Language */}
      <div className="space-y-2 mb-4 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
        {(lang === 'en' || lang === 'both') && (
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {exercise.instructions?.en}
          </p>
        )}
        {(lang === 'bn' || lang === 'both') && (
          <p
            className={`font-medium text-neutral-700 dark:text-neutral-300 ${
              lang === 'both' ? 'border-l-2 border-sky-400 pl-2.5 py-0.5 text-xs text-neutral-600 dark:text-neutral-400' : ''
            }`}
          >
            {exercise.instructions?.bn}
          </p>
        )}
      </div>

      {/* Action Buttons: Run Code & Check Answer */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        <button
          type="button"
          onClick={onRunCode}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-600/20 cursor-pointer active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{lang === 'bn' ? 'কোড রান করুন' : 'Run Code'}</span>
        </button>

        <button
          type="button"
          onClick={handleValidate}
          disabled={checking}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/25 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{checking ? 'Checking...' : lang === 'bn' ? 'উত্তর যাচাই করুন' : 'Check Your Code'}</span>
        </button>

        {/* Hint Toggle */}
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
        </button>

        {/* Show Solution */}
        <button
          type="button"
          onClick={() => setShowSolution(!showSolution)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showSolution ? 'Hide Solution' : 'Solution'}</span>
        </button>
      </div>

      {/* Progressive Hint Drawer */}
      {showHint && (
        <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 animate-fade-in">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Hint / ইঙ্গিত:</p>
              {(lang === 'en' || lang === 'both') && <p>{exercise.hint?.en}</p>}
              {(lang === 'bn' || lang === 'both') && <p className="mt-1">{exercise.hint?.bn}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Solution Drawer */}
      {showSolution && exercise.solution && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-neutral-900 dark:text-neutral-100">
              Solution Code:
            </span>
            {onApplySolution && (
              <button
                type="button"
                onClick={() => onApplySolution(exercise.solution)}
                className="text-[11px] font-bold text-sky-500 hover:underline cursor-pointer"
              >
                Apply Solution to Editor
              </button>
            )}
          </div>
          <pre className="p-2.5 rounded-lg bg-white dark:bg-black font-mono text-[11px] overflow-x-auto text-neutral-800 dark:text-neutral-200">
            {exercise.solution[lesson.track] || exercise.solution.html || exercise.solution.javascript || ''}
          </pre>
        </div>
      )}

      {/* Validation Result Banner */}
      {validationResult && (
        <div
          className={`mt-4 p-3.5 rounded-xl border flex items-start gap-3 animate-fade-in ${
            validationResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
          }`}
        >
          {validationResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-sm">
              {validationResult.success
                ? lang === 'bn'
                  ? 'অসাধারণ! আপনি সফল হয়েছেন! 🎉'
                  : 'Awesome Job! You nailed it! 🎉 (+25 XP)'
                : lang === 'bn'
                ? 'আরেকটু চেষ্টা করুন!'
                : 'Keep going! Check this:'}
            </p>
            <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">
              {validationResult.message}
            </p>

            {validationResult.success && hasNextLesson && onNextLesson && (
              <button
                type="button"
                onClick={onNextLesson}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                <span>{lang === 'bn' ? 'পরবর্তী পাঠ →' : 'Continue to Next Lesson →'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseChallenge;
