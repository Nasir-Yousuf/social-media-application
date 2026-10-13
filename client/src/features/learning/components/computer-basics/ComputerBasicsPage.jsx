import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
} from 'lucide-react';
import { COMPUTER_BASICS_LESSONS } from '../../data/computerBasicsCurriculum';
import CourseOverview from './CourseOverview';
import LessonContent from './LessonContent';
import LessonNavigation from './LessonNavigation';
import LanguageToggle from '../LanguageToggle';

export const ComputerBasicsPage = ({
  lessonId,
  progress = {},
  lang = 'both',
  onLangChange,
  onLessonCompleted,
  onOpenAskQuestion,
  _onProgressUpdate,
}) => {
  const currentLesson = lessonId
    ? COMPUTER_BASICS_LESSONS.find((l) => l.id === lessonId) || COMPUTER_BASICS_LESSONS[0]
    : null;

  const completedSet = new Set(progress.completedLessons || []);
  const isLessonCompleted = currentLesson ? completedSet.has(currentLesson.id) : false;

  const handleMarkCompleted = (id) => {
    if (onLessonCompleted) {
      onLessonCompleted(id, 'computer-basics');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Top Breadcrumb Navigation & Language Toggle */}
      <div className="flex items-center justify-between gap-4">
        <NavLink
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Learning Tracks</span>
        </NavLink>

        <div className="flex items-center gap-3">
          <LanguageToggle lang={lang} onChange={onLangChange} />

          {/* XP Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>{progress.xp || 0} XP</span>
          </div>
        </div>
      </div>

      {/* Main View: Course Overview vs Lesson View */}
      {currentLesson ? (
        <div className="space-y-6">
          <LessonNavigation
            currentLessonId={currentLesson.id}
            isCompleted={isLessonCompleted}
            onMarkCompleted={handleMarkCompleted}
            onOpenAskQuestion={onOpenAskQuestion}
          />

          <LessonContent
            lesson={currentLesson}
            lang={lang}
            onLessonCompleted={handleMarkCompleted}
          />

          <LessonNavigation
            currentLessonId={currentLesson.id}
            isCompleted={isLessonCompleted}
            onMarkCompleted={handleMarkCompleted}
            onOpenAskQuestion={onOpenAskQuestion}
          />
        </div>
      ) : (
        <CourseOverview
          progress={progress}
          lang={lang}
        />
      )}
    </div>
  );
};

export default ComputerBasicsPage;
