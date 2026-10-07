import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Code2,
  Palette,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Flame,
  MessageSquare,
  CheckCircle2,
  Play,
  HelpCircle,
  Layout,
} from 'lucide-react';
import { TRACKS, LESSONS } from '../data/learningCurriculum';
import LanguageToggle from './LanguageToggle';

export const LearningDashboard = ({
  progress = {},
  lang = 'both',
  onLangChange,
}) => {
  const completedSet = new Set(progress.completedLessons || []);
  const totalCompleted = completedSet.size;
  const totalLessons = LESSONS.length;
  const percentOverall = Math.round((totalCompleted / Math.max(1, totalLessons)) * 100);

  // Determine current/continue lesson
  const currentLessonId = progress.currentLessonId || 'html-intro';
  const currentLesson = LESSONS.find((l) => l.id === currentLessonId) || LESSONS[0];

  const getTrackProgress = (trackId) => {
    const trackLessons = LESSONS.filter((l) => l.track === trackId);
    const completedCount = trackLessons.filter((l) => completedSet.has(l.id)).length;
    const percent = Math.round((completedCount / Math.max(1, trackLessons.length)) * 100);
    return { completedCount, total: trackLessons.length, percent };
  };

  const getTrackIcon = (trackId) => {
    switch (trackId) {
      case 'html':
        return <Layout className="w-5 h-5 text-orange-500" />;
      case 'css':
        return <Palette className="w-5 h-5 text-sky-500" />;
      case 'bootstrap':
        return <Code2 className="w-5 h-5 text-purple-500" />;
      case 'javascript':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      default:
        return <Code2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner with Intro & Language Toggle */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-[#111827] to-[#0f172a] text-white border border-neutral-800 shadow-lg">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Beginner Web Development Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Learn & Practice
            </h1>

            <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
              {lang === 'bn'
                ? 'একেবারে শূন্য থেকে ওয়েব ডেভেলপমেন্ট শিখুন। সহজ ব্যাখ্যা পড়ুন, নিজের হাতে কোড লিখুন, লাইভ রান করুন এবং আটকে গেলে কমিউনিটিতে প্রশ্ন করুন।'
                : lang === 'both'
                ? 'Learn web development from zero. Read simple explanations, write code, run it in the browser, and ask the community when you get stuck. (সহজ ব্যাখ্যা, লাইভ কোডিং এবং কমিউনিটি সাহায্য)'
                : 'Learn web development from zero. Read simple explanations, write code, run it in the browser, and ask the community when you get stuck.'}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <LanguageToggle lang={lang} onChange={onLangChange} />

            {/* Overall XP & Streak badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{progress.xp || 0} XP</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-orange-300">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{progress.streak || 1} Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Continue Learning" Smart Card */}
      {currentLesson && (
        <div className="rounded-2xl border border-sky-200/80 dark:border-sky-500/20 bg-gradient-to-r from-sky-50/50 via-white to-sky-50/30 dark:from-[#0d1522] dark:via-[#0e131d] dark:to-[#0c1017] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-xs shadow-sky-500/25 shrink-0">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Continue Learning / চালিয়ে যান
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {lang === 'bn'
                  ? currentLesson.title?.bn
                  : lang === 'both'
                  ? `${currentLesson.title?.en} (${currentLesson.title?.bn})`
                  : currentLesson.title?.en}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Track: {currentLesson.track.toUpperCase()} · Lesson {currentLesson.order} of 8
              </p>
            </div>
          </div>

          <NavLink
            to={`/learn/${currentLesson.track}/${currentLesson.id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-xs shadow-sky-500/20 shrink-0 cursor-pointer"
          >
            <span>Continue →</span>
          </NavLink>
        </div>
      )}

      {/* 3 Core Tracks (HTML, CSS, JavaScript) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {lang === 'bn' ? 'লার্নিং ট্র্যাকসমূহ' : 'Learning Tracks'}
          </h2>
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {totalCompleted} / {totalLessons} Lessons Completed ({percentOverall}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRACKS.map((track) => {
            const { completedCount, total, percent } = getTrackProgress(track.id);
            const firstTrackLesson = LESSONS.find((l) => l.track === track.id);

            return (
              <div
                key={track.id}
                className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80">
                      {getTrackIcon(track.id)}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {track.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                    {track.title}
                  </h3>

                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {lang === 'bn'
                      ? track.subtitle.bn
                      : lang === 'both'
                      ? `${track.subtitle.en} (${track.subtitle.bn})`
                      : track.subtitle.en}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1.5">
                      <span>Progress</span>
                      <span>
                        {completedCount}/{total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
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

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <NavLink
                      to={`/learn/${track.id}`}
                      className="flex-1 text-center py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      View Roadmap
                    </NavLink>

                    <NavLink
                      to={`/learn/${track.id}/${firstTrackLesson?.id || 'html-intro'}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors shadow-xs"
                    >
                      <span>{percent > 0 ? 'Resume' : 'Start'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Q&A Teaser Bar */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121519] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {lang === 'bn'
                ? 'কোডিংয়ে আটকে গেছেন? প্রশ্ন করুন!'
                : 'Stuck on an exercise? Ask the Community!'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {lang === 'bn'
                ? 'কমিউনিটি ডেভেলপারদের কাছ থেকে দ্রুত সাহায্য নিন এবং অন্যকে উত্তর দিয়ে ব্যাজ অর্জন করুন।'
                : 'Browse questions from other learners or post your own code snippet to get help.'}
            </p>
          </div>
        </div>

        <NavLink
          to="/learn/questions"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
          <span>Browse Questions</span>
        </NavLink>
      </div>
    </div>
  );
};

export default LearningDashboard;
