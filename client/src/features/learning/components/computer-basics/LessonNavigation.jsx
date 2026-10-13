import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { COMPUTER_BASICS_LESSONS } from '../../data/computerBasicsCurriculum';

export const LessonNavigation = ({
  currentLessonId,
  isCompleted,
  onMarkCompleted,
  onOpenAskQuestion,
}) => {
  const navigate = useNavigate();
  const currentIndex = COMPUTER_BASICS_LESSONS.findIndex((l) => l.id === currentLessonId);
  const currentLesson = COMPUTER_BASICS_LESSONS[currentIndex] || COMPUTER_BASICS_LESSONS[0];

  const prevLesson = currentIndex > 0 ? COMPUTER_BASICS_LESSONS[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < COMPUTER_BASICS_LESSONS.length - 1
      ? COMPUTER_BASICS_LESSONS[currentIndex + 1]
      : null;

  return (
    <div className="space-y-4">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <NavLink
          to="/learn/computer-basics"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Course Roadmap (All 8 Lessons)</span>
        </NavLink>

        <div className="flex items-center gap-2">
          {/* Dropdown Jumper */}
          <select
            value={currentLesson.id}
            onChange={(e) => navigate(`/learn/computer-basics/${e.target.value}`)}
            className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-bold cursor-pointer"
          >
            {COMPUTER_BASICS_LESSONS.map((l) => (
              <option key={l.id} value={l.id}>
                Lesson {l.order}: {l.title.en}
              </option>
            ))}
          </select>

          {onOpenAskQuestion && (
            <button
              type="button"
              onClick={() => onOpenAskQuestion(currentLesson)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition-colors cursor-pointer"
              title="Ask community a question about this lesson"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Ask Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Previous Button */}
        {prevLesson ? (
          <NavLink
            to={`/learn/computer-basics/${prevLesson.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Prev: {prevLesson.title.en}</span>
          </NavLink>
        ) : (
          <div />
        )}

        {/* Center: Mark as Completed Status */}
        <div className="flex items-center justify-center">
          {isCompleted ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Lesson Completed (+25 XP Earned)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onMarkCompleted(currentLesson.id)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-600/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Lesson Complete (+25 XP)</span>
            </button>
          )}
        </div>

        {/* Next Button */}
        {nextLesson ? (
          <NavLink
            to={`/learn/computer-basics/${nextLesson.id}`}
            className="inline-flex items-center justify-end gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/20"
          >
            <span>Next: {nextLesson.title.en}</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        ) : (
          <NavLink
            to="/learn/computer-basics"
            className="inline-flex items-center justify-end gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-xs shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Complete Course Review</span>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default LessonNavigation;
