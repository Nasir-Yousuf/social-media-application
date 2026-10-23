import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Lock, Sparkles, X, ChevronRight } from 'lucide-react';
import Modal from '../common/Modal';

export const CodeLessonSelectorModal = ({
  isOpen = false,
  onClose,
  lessons = [],
  currentLessonId = '',
  completedLessonIds = [],
  onSelectLesson,
  languageName = 'JavaScript',
}) => {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all');

  if (!isOpen) return null;

  // Group lessons by level
  const levelsSet = Array.from(new Set(lessons.map((l) => l.level)));

  const filteredLessons = lessons.filter((lesson) => {
    if (selectedLevelFilter === 'all') return true;
    return lesson.level === Number(selectedLevelFilter);
  });

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'intermediate':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'advanced':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'expert':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${languageName} Lesson Curriculum`}>
      <div className="space-y-4 font-sans max-h-[75vh] overflow-y-auto pr-1">
        {/* Level Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 select-none border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={() => setSelectedLevelFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedLevelFilter === 'all'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            All Levels ({lessons.length})
          </button>
          {levelsSet.map((lvl) => {
            const firstLessonInLvl = lessons.find((l) => l.level === lvl);
            const isSelected = selectedLevelFilter === String(lvl);
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevelFilter(String(lvl))}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                Lvl {lvl}: {firstLessonInLvl?.levelName || `Level ${lvl}`}
              </button>
            );
          })}
        </div>

        {/* Lessons List Grid */}
        <div className="space-y-2.5">
          {filteredLessons.map((lesson) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isCurrent = currentLessonId === lesson.id;

            return (
              <div
                key={lesson.id}
                onClick={() => {
                  onSelectLesson(lesson);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group hover:scale-[0.99] ${
                  isCurrent
                    ? 'bg-sky-500/10 border-sky-500 text-sky-500 font-bold shadow-sm ring-1 ring-sky-500/30'
                    : isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50 text-neutral-800 dark:text-neutral-200'
                    : 'bg-white dark:bg-[#121519] border-neutral-200 dark:border-neutral-800 hover:border-sky-500/40 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-sky-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      lesson.lessonNumber < 10 ? `0${lesson.lessonNumber}` : lesson.lessonNumber
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold truncate text-neutral-900 dark:text-white">
                        {lesson.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadge(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500 text-white">
                      CURRENT
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-sky-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default CodeLessonSelectorModal;
