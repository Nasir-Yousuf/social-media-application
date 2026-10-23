import React, { useState, useEffect } from 'react';
import { Database, Terminal, BookOpen, ArrowLeft, Layers, CheckCircle2 } from 'lucide-react';
import { MYSQL_LESSONS } from '../../data/mysqlCurriculum';
import { MySqlCourseOverview } from './MySqlCourseOverview';
import { MySqlLessonView } from './MySqlLessonView';
import { SqlPracticeLab } from './SqlPracticeLab';

export const MySqlPage = ({
  initialLessonId = null,
  completedLessonIds = [],
  onCompleteLesson,
  onBackToTracks
}) => {
  const [viewMode, setViewMode] = useState(initialLessonId ? 'lesson' : 'overview'); // 'overview' | 'lesson' | 'lab'
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId || 'mysql-lesson-1');
  const [labStarterQuery, setLabStarterQuery] = useState('');

  useEffect(() => {
    if (initialLessonId) {
      setCurrentLessonId(initialLessonId);
      setViewMode('lesson');
    }
  }, [initialLessonId]);

  const currentLesson = MYSQL_LESSONS.find(l => l.id === currentLessonId) || MYSQL_LESSONS[0];

  const handleSelectLesson = (lessonId) => {
    setCurrentLessonId(lessonId);
    setViewMode('lesson');
  };

  const handleOpenLab = (starterSql = '') => {
    if (typeof starterSql === 'string' && starterSql) {
      setLabStarterQuery(starterSql);
    } else {
      setLabStarterQuery('SELECT * FROM products LIMIT 5;');
    }
    setViewMode('lab');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          {onBackToTracks && (
            <>
              <button
                onClick={onBackToTracks}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Courses</span>
              </button>
              <span>/</span>
            </>
          )}

          <button
            onClick={() => setViewMode('overview')}
            className={`font-medium transition-colors ${
              viewMode === 'overview' ? 'text-cyan-400' : 'hover:text-white'
            }`}
          >
            MySQL Mastery
          </button>

          {viewMode === 'lesson' && (
            <>
              <span>/</span>
              <span className="text-slate-200 font-mono">
                Lesson {currentLesson.lessonNumber}
              </span>
            </>
          )}

          {viewMode === 'lab' && (
            <>
              <span>/</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                SQL Practice Lab
              </span>
            </>
          )}
        </div>

        {/* Action Toggle Bar */}
        <div className="flex items-center gap-2">
          {viewMode !== 'overview' && (
            <button
              onClick={() => setViewMode('overview')}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Course Roadmap</span>
            </button>
          )}

          {viewMode !== 'lab' && (
            <button
              onClick={() => handleOpenLab()}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Open SQL Lab</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View Switcher */}
      {viewMode === 'overview' && (
        <MySqlCourseOverview
          allLessons={MYSQL_LESSONS}
          completedLessonIds={completedLessonIds}
          onSelectLesson={handleSelectLesson}
          onOpenLab={() => handleOpenLab()}
        />
      )}

      {viewMode === 'lesson' && (
        <MySqlLessonView
          lesson={currentLesson}
          allLessons={MYSQL_LESSONS}
          onNavigateLesson={handleSelectLesson}
          onCompleteLesson={onCompleteLesson}
          isCompleted={completedLessonIds.includes(currentLesson.id)}
          onOpenLab={() => handleOpenLab(currentLesson.content?.practiceExercise?.defaultCode || currentLesson.content?.sqlSyntax)}
        />
      )}

      {viewMode === 'lab' && (
        <div className="max-w-6xl mx-auto">
          <SqlPracticeLab
            initialQuery={labStarterQuery}
            onBack={() => setViewMode('lesson')}
          />
        </div>
      )}
    </div>
  );
};
