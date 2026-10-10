import React, { useState } from 'react';
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
  Trophy,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { TRACKS, LESSONS } from '../data/learningCurriculum';
import LanguageToggle from './LanguageToggle';
import TrackExamModal from './TrackExamModal';
import CertificateModal from './CertificateModal';
import LessonQuizModal from './LessonQuizModal';
import { useAuth } from '../../../context/AuthContext';

export const TrackView = ({
  trackId,
  progress = {},
  lang = 'both',
  onLangChange,
  onProgressUpdate,
}) => {
  const { user } = useAuth();
  const track = TRACKS.find((t) => t.id === trackId) || TRACKS[0];
  const trackLessons = LESSONS.filter((l) => l.track === track.id);
  const completedSet = new Set(progress.completedLessons || []);
  const passedQuizzesSet = new Set(progress.passedQuizzes || []);

  const completedCount = trackLessons.filter((l) => completedSet.has(l.id)).length;
  const percent = Math.round((completedCount / Math.max(1, trackLessons.length)) * 100);
  const allCompleted = trackLessons.length > 0 && completedCount === trackLessons.length;

  // Check if user already holds a certificate for this track
  const userCertificate = (progress.certificates || []).find((c) => c.trackId === track.id);

  // Modal States
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(userCertificate || null);
  const [quizLessonId, setQuizLessonId] = useState(null);

  const handleExamPassed = (resultData) => {
    if (resultData.certificate) {
      setActiveCertificate(resultData.certificate);
      setIsCertModalOpen(true);
    }
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  };

  const handleQuizPassed = (lessonId, score, xpEarned) => {
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  };

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
            <div className="text-xs text-neutral-400 font-mono">
              {completedCount} of {trackLessons.length} lessons passed
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
                : track.id === 'ai'
                ? 'bg-emerald-500'
                : 'bg-amber-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Roadmap Lessons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Step-by-Step Curriculum / পাঠ্যক্রম ({trackLessons.length} Lessons)
          </h2>
          <span className="text-xs font-mono text-neutral-500">
            Complete each lesson & pass quiz to advance
          </span>
        </div>

        <div className="space-y-3">
          {trackLessons.map((lesson, idx) => {
            const isCompleted = completedSet.has(lesson.id);
            const isQuizPassed = passedQuizzesSet.has(lesson.id);

            return (
              <div
                key={lesson.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-white dark:bg-[#121519] border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500'
                    : 'bg-white dark:bg-[#121519] border-neutral-200 dark:border-neutral-800 hover:border-sky-500/50'
                }`}
              >
                <NavLink
                  to={`/learn/${track.id}/${lesson.id}`}
                  className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1"
                >
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
                      {isQuizPassed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-mono">
                          Quiz Passed ✅
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-lg">
                      {lang === 'bn' ? lesson.subtitle.bn : lesson.subtitle.en}
                    </p>
                  </div>
                </NavLink>

                {/* Lesson Actions: Take Quiz & Go to Lesson */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setQuizLessonId(lesson.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isQuizPassed
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-300'
                        : 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{isQuizPassed ? 'Review Test' : 'Take Test'}</span>
                  </button>

                  <NavLink
                    to={`/learn/${track.id}/${lesson.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white text-xs font-bold transition-all"
                  >
                    <span>{isCompleted ? 'Review' : 'Start'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Milestone: Final Certification Exam & Certificate Card */}
        <div className="pt-4">
          {userCertificate ? (
            /* 1. Already Certified: Download Certificate */
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 border-2 border-amber-500/50 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                    <Award className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                        Official Credential Earned
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        VERIFIED PASS
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                      {track.title} Certified Specialist
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                      Credential ID: {userCertificate.certificateId} · Score: {userCertificate.score}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCertificate(userCertificate);
                      setIsCertModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/25 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>View & Download Certificate (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExamModalOpen(true)}
                    className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Retake exam for a higher distinction score"
                  >
                    Retake Exam
                  </button>
                </div>
              </div>
            </div>
          ) : allCompleted ? (
            /* 2. All 12 Lessons Completed: Exam Ready! */
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 shrink-0">
                    <Trophy className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase mb-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Final Milestone Unlocked</span>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                      Take the {track.title} Final Certification Exam
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                      You finished all {trackLessons.length} lessons! Score 80%+ on this 15-question comprehensive test to earn your official verifiable certificate (+150 XP).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 cursor-pointer shrink-0"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Start Final Exam 🚀</span>
                </button>
              </div>
            </div>
          ) : (
            /* 3. Locked: Finish All Lessons */
            <div className="p-5 rounded-3xl bg-neutral-100/80 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-neutral-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 opacity-60" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Final Certification Exam & Downloadable Certificate
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Complete all {trackLessons.length} lessons ({completedCount}/{trackLessons.length} passed) to unlock the final comprehensive test and free PDF certificate.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 shrink-0">
                <span>{trackLessons.length - completedCount} lessons remaining</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Exam Modal */}
      <TrackExamModal
        trackId={track.id}
        trackTitle={track.title}
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        onExamPassed={handleExamPassed}
        studentName={user?.name || user?.username || 'Learner'}
      />

      {/* Certificate Modal */}
      <CertificateModal
        certificate={activeCertificate}
        studentName={user?.name || user?.username || 'Learner'}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
      />

      {/* Lesson Quiz Modal (if launched from roadmap) */}
      {quizLessonId && (
        <LessonQuizModal
          lessonId={quizLessonId}
          trackId={track.id}
          isOpen={!!quizLessonId}
          onClose={() => setQuizLessonId(null)}
          onQuizPassed={handleQuizPassed}
          lang={lang}
        />
      )}
    </div>
  );
};

export default TrackView;
