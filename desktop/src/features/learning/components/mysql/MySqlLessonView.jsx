import React, { useState } from 'react';
import { 
  CheckCircle2, ChevronLeft, ChevronRight, Play, RotateCcw, 
  Lightbulb, AlertTriangle, BookOpen, Target, HelpCircle, 
  Copy, Check, Code2, Database, ArrowRight, Sparkles, Terminal
} from 'lucide-react';
import { executeMultipleQueries } from './sqlEngine';

export const MySqlLessonView = ({ 
  lesson, 
  allLessons = [], 
  onNavigateLesson, 
  onCompleteLesson, 
  isCompleted = false,
  onOpenLab
}) => {
  const [activeCode, setActiveCode] = useState(
    lesson?.content?.practiceExercise?.defaultCode || lesson?.content?.sqlSyntax || ''
  );
  const [exerciseResult, setExerciseResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [languageMode, setLanguageMode] = useState('en'); // 'en', 'bn', 'both'

  // Reset exercise and quiz when lesson changes
  React.useEffect(() => {
    setActiveCode(lesson?.content?.practiceExercise?.defaultCode || lesson?.content?.sqlSyntax || '');
    setExerciseResult(null);
    setShowHint(false);
    setShowSolution(false);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson?.id]);

  if (!lesson) {
    return <div className="p-8 text-center text-slate-400">Lesson not found.</div>;
  }

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleRunExercise = () => {
    if (!activeCode.trim()) return;
    const res = executeMultipleQueries(activeCode);
    setExerciseResult(res);
  };

  const handleCopySyntax = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOption === null) return;
    setQuizSubmitted(true);
  };

  const quiz = lesson.content?.quiz;
  const isQuizCorrect = quizSubmitted && selectedQuizOption === quiz?.correctIndex;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {lesson.moduleTitle || 'MySQL Mastery'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">
              Lesson {lesson.lessonNumber} of 60
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              lesson.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              lesson.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            }`}>
              {lesson.difficulty}
            </span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setLanguageMode('en')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                languageMode === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguageMode('bn')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                languageMode === 'bn' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguageMode('both')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                languageMode === 'both' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Both
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          {languageMode === 'bn' && lesson.titleBn ? lesson.titleBn : lesson.title}
          {languageMode === 'both' && lesson.titleBn && (
            <span className="block text-lg sm:text-xl font-normal text-cyan-300 mt-1 font-bengali">
              {lesson.titleBn}
            </span>
          )}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
          {languageMode === 'bn' && lesson.subtitleBn ? lesson.subtitleBn : lesson.subtitle}
          {languageMode === 'both' && lesson.subtitleBn && (
            <span className="block text-xs sm:text-sm text-slate-400 mt-1 font-bengali">
              {lesson.subtitleBn}
            </span>
          )}
        </p>

        {/* Quick action bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>⏱️ ~{lesson.estimatedMinutes || 20} minutes</span>
            {lesson.prerequisites?.length > 0 && (
              <span>📚 Prereq: {lesson.prerequisites[0]}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onOpenLab && (
              <button
                onClick={onOpenLab}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Open Full SQL Lab</span>
              </button>
            )}

            <button
              onClick={() => onCompleteLesson(lesson.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      {lesson.objectives?.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-blue-400" />
            Learning Objectives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {lesson.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Introduction */}
      {lesson.content?.introduction && (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 leading-relaxed text-slate-300 text-sm sm:text-base space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Introduction
          </h3>
          <p className="text-slate-300">{lesson.content.introduction}</p>
          {(languageMode === 'bn' || languageMode === 'both') && (
            <p className="text-blue-300/90 text-sm bg-blue-950/30 p-3 rounded-xl border border-blue-900/40 font-bengali">
              💡 {lesson.content?.introductionBn || `${lesson.title} সম্পর্কে বিস্তারিত ধারণা: এই লেসনে আমরা প্র্যাকটিক্যাল উদাহরণ এবং এক্সারসাইজের মাধ্যমে বাস্তব ডেটাবেস ডিজাইন ও কুয়েরি তৈরি শিখব।`}
            </p>
          )}
        </div>
      )}

      {/* Core Concepts */}
      {lesson.content?.coreConcepts?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Core Concepts Explained
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {lesson.content.coreConcepts.map((concept, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-colors">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  {concept.title}
                </h4>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-7">
                  {concept.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SQL Code Example with Syntax Highlighting */}
      {lesson.content?.sqlSyntax && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>SQL Syntax & Practical Query</span>
            </div>
            <button
              onClick={() => handleCopySyntax(lesson.content.sqlSyntax)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950 overflow-x-auto font-mono text-xs sm:text-sm text-emerald-400 leading-relaxed">
            <pre><code>{lesson.content.sqlSyntax}</code></pre>
          </div>

          {/* Query line-by-line breakdown */}
          {lesson.content.explanation?.length > 0 && (
            <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                How this query works line-by-line:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {lesson.content.explanation.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-mono">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Before / After Table Demonstration */}
      {lesson.content?.sampleBeforeAfter && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Before vs After Query Transformation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Before */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Input / Initial State
              </span>
              <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(lesson.content.sampleBeforeAfter.before, null, 2)}
              </pre>
            </div>
            {/* After */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                Result / Resulting State
              </span>
              <pre className="text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(lesson.content.sampleBeforeAfter.after, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Common Mistakes and Pitfalls */}
      {lesson.content?.commonMistakes?.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Common Pitfalls & Debugging Tips
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-amber-200/80">
            {lesson.content.commonMistakes.map((mistake, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Practice Exercise Sandbox */}
      {lesson.content?.practiceExercise && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Interactive Practice Exercise
            </h3>
            <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
              Live Safe Sandbox
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {lesson.content.practiceExercise.instructions}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Write your SQL solution:</span>
              <div className="flex items-center gap-2">
                {lesson.content.practiceExercise.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                  </button>
                )}
                {lesson.content.practiceExercise.solution && (
                  <button
                    onClick={() => {
                      if (!showSolution) {
                        setActiveCode(lesson.content.practiceExercise.solution);
                      }
                      setShowSolution(!showSolution);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    {showSolution ? 'Hide Solution' : 'Show Solution'}
                  </button>
                )}
              </div>
            </div>

            {showHint && lesson.content.practiceExercise.hint && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{lesson.content.practiceExercise.hint}</span>
              </div>
            )}

            <textarea
              value={activeCode}
              onChange={(e) => setActiveCode(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-emerald-400 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setActiveCode(lesson.content.practiceExercise.defaultCode || '');
                  setExerciseResult(null);
                }}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Exercise</span>
              </button>

              <button
                onClick={handleRunExercise}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute SQL</span>
              </button>
            </div>
          </div>

          {/* Exercise Output */}
          {exerciseResult && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Execution Output:
              </span>
              {!exerciseResult.success ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono">
                  {exerciseResult.error}
                </div>
              ) : (
                <div className="space-y-2">
                  {exerciseResult.message && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-mono">
                      {exerciseResult.message}
                    </div>
                  )}
                  {exerciseResult.columns?.length > 0 && (
                    <div className="border border-slate-800 rounded-lg overflow-x-auto max-h-48 custom-scrollbar">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800">
                            {exerciseResult.columns.map((col, idx) => (
                              <th key={idx} className="px-3 py-1.5 text-slate-400 uppercase text-[10px]">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/80">
                          {exerciseResult.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/50">
                              {exerciseResult.columns.map((col, cIdx) => (
                                <td key={cIdx} className="px-3 py-1 text-slate-300 whitespace-nowrap">
                                  {row[col] === null ? (
                                    <span className="text-amber-400 italic">NULL</span>
                                  ) : (
                                    String(row[col])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Knowledge-Check Quiz */}
      {quiz && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            Knowledge-Check Quiz
          </h3>
          <p className="text-sm text-slate-200 font-medium">
            {quiz.question}
          </p>

          <div className="space-y-2">
            {quiz.options.map((option, idx) => {
              const isSelected = selectedQuizOption === idx;
              let btnClass = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700';

              if (quizSubmitted) {
                if (idx === quiz.correctIndex) {
                  btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                } else if (isSelected) {
                  btnClass = 'border-rose-500 bg-rose-500/10 text-rose-300';
                }
              } else if (isSelected) {
                btnClass = 'border-blue-500 bg-blue-500/10 text-blue-300';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !quizSubmitted && setSelectedQuizOption(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span>{option}</span>
                  {quizSubmitted && idx === quiz.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={selectedQuizOption === null}
                className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <div className="w-full space-y-2">
                <div className={`p-3 rounded-xl text-xs sm:text-sm ${
                  isQuizCorrect 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                }`}>
                  <span className="font-semibold">{isQuizCorrect ? '🎉 Correct!' : '❌ Not quite right.'}</span>{' '}
                  {quiz.explanation}
                </div>
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setSelectedQuizOption(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
        {prevLesson ? (
          <button
            onClick={() => onNavigateLesson(prevLesson.id)}
            className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <div className="text-left">
              <span className="text-[10px] text-slate-500 block">Previous Lesson</span>
              <span className="truncate max-w-[150px] sm:max-w-xs block">{prevLesson.title}</span>
            </div>
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            onClick={() => {
              if (!isCompleted) onCompleteLesson(lesson.id);
              onNavigateLesson(nextLesson.id);
            }}
            className="flex items-center gap-2 text-xs sm:text-sm text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all"
          >
            <div className="text-right">
              <span className="text-[10px] text-blue-200 block">Next Lesson</span>
              <span className="truncate max-w-[150px] sm:max-w-xs block font-semibold">{nextLesson.title}</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onCompleteLesson(lesson.id)}
            className="flex items-center gap-2 text-xs sm:text-sm text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg transition-all"
          >
            <span>Finish Course</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
