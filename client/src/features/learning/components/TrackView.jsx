import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { TRACKS, LESSONS } from '../data/learningCurriculum';
import LanguageToggle from './LanguageToggle';

export const TrackView = ({
  trackId,
  progress = {},
  lang = 'both',
  onLangChange,
}) => {
  const track = TRACKS.find((t) => t.id === trackId) || TRACKS[0];
  const trackLessons = LESSONS.filter((l) => l.track === track.id);
  const completedSet = new Set(progress.completedLessons || []);

  const completedCount = trackLessons.filter((l) => completedSet.has(l.id)).length;
  const percent = Math.round((completedCount / Math.max(1, trackLessons.length)) * 100);

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Navigation and Language Toggle */}
      <div className="flex items-center justify-between gap-4">
        <NavLink
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Tracks</span>
        </NavLink>

        <LanguageToggle lang={lang} onChange={onLangChange} />
      </div>

      {/* Track Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#121519] border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 mb-2">
              <span>{track.badge} Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100">
              {track.title}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
              {lang === 'bn'
                ? track.description.bn
                : lang === 'both'
                ? `${track.description.en} (${track.description.bn})`
                : track.description.en}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1">
              Track Completion
            </div>
            <div className="text-2xl font-black text-sky-500">{percent}%</div>
            <div className="text-xs text-neutral-400">
              {completedCount} of {trackLessons.length} lessons
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 mt-5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              track.id === 'html'
                ? 'bg-orange-500'
                : track.id === 'css'
                ? 'bg-sky-500'
                : 'bg-amber-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Roadmap Lessons List */}
      <div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-3.5">
          Step-by-Step Curriculum / পাঠ্যক্রম
        </h2>

        <div className="space-y-3">
          {trackLessons.map((lesson, idx) => {
            const isCompleted = completedSet.has(lesson.id);

            return (
              <NavLink
                key={lesson.id}
                to={`/learn/${track.id}/${lesson.id}`}
                className={`group flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-white dark:bg-[#121519] border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500'
                    : 'bg-white dark:bg-[#121519] border-neutral-200 dark:border-neutral-800 hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* Step Number Circle */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/25'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 group-hover:bg-sky-500 group-hover:text-white'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-sky-500 transition-colors">
                        {lang === 'bn'
                          ? lesson.title.bn
                          : lang === 'both'
                          ? `${lesson.title.en} · ${lesson.title.bn}`
                          : lesson.title.en}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        {lesson.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-lg">
                      {lang === 'bn' ? lesson.subtitle.bn : lesson.subtitle.en}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-xs font-bold text-neutral-400 group-hover:text-sky-500 transition-colors">
                    {isCompleted ? 'Review' : 'Start'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackView;
