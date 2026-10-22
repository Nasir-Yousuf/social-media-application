import React from "react";
import { NavLink } from "react-router-dom";
import {
  CheckCircle2,
  Award,
  Layers,
  ArrowRight,
  Clock,
  Cpu,
} from "lucide-react";
import { COMPUTER_BASICS_LESSONS } from "../../data/computerBasicsCurriculum";

export const CourseOverview = ({ progress = {}, lang = "both" }) => {
  const completedSet = new Set(progress.completedLessons || []);
  const completedCount = COMPUTER_BASICS_LESSONS.filter((l) =>
    completedSet.has(l.id),
  ).length;
  const totalLessons = COMPUTER_BASICS_LESSONS.length;
  const percent = Math.round((completedCount / totalLessons) * 100);

  // Find next uncompleted lesson, or default to first
  const nextLesson =
    COMPUTER_BASICS_LESSONS.find((l) => !completedSet.has(l.id)) ||
    COMPUTER_BASICS_LESSONS[0];

  return (
    <div className="space-y-8 font-sans">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-[#101b2b] to-[#0c1420] text-white border border-neutral-800 shadow-lg">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>Web-101: Computer & Web Fundamentals · Lecture 01</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Computer Hardware & Software Fundamentals
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {lang === "bn"
                ? "কম্পিউটার কীভাবে কাজ করে, ৫টি কার্যকরী ইউনিট, সিপিইউ, এএলইউ, মেমোরি হায়ারার্কি, অপারেটিং সিস্টেম এবং ইলেকট্রিক্যাল বনাম ইলেকট্রনিক ডিভাইসের সম্পূর্ণ মৌলিক কোর্স।"
                : lang === "both"
                  ? "Master the fundamentals of computer systems, the five functional units, CPU architecture, memory hierarchy, operating systems, and electrical vs electronic devices. (ইন্টারেক্টিভ সিমুলেশন ও অনুশীলনসহ সম্পূর্ণ ফান্ডামেন্টাল কোর্স)"
                  : "Master the fundamentals of computer systems, the five functional units, CPU architecture, memory hierarchy, operating systems, and electrical vs electronic devices."}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />8
                Structured Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" />
                Interactive Block Diagram
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                200 Total Course XP
              </span>
            </div>
          </div>

          {/* Progress Card & Action */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0 w-full sm:w-72 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Course Progress</span>
              <span className="text-emerald-400 font-mono">
                {completedCount} / {totalLessons} ({percent}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            <NavLink
              to={`/learn/computer-basics/${nextLesson.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-xs shadow-emerald-500/20"
            >
              <span>
                {percent > 0 ? "Continue Learning" : "Start Lesson 1"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* 8 Course Lesson Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
              {lang === "bn"
                ? "কোর্সের পাঠক্রম (৮টি লেসন)"
                : "Course Curriculum (8 Lessons)"}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Click any lesson to begin reading, experimenting with diagrams,
              and taking quizzes.
            </p>
          </div>

          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
            {completedCount} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPUTER_BASICS_LESSONS.map((lesson) => {
            const isCompleted = completedSet.has(lesson.id);
            const isSignatureLesson = lesson.id === "cb-how-a-computer-works";

            return (
              <NavLink
                key={lesson.id}
                to={`/learn/computer-basics/${lesson.id}`}
                className={`group relative rounded-2xl border p-5 transition-all flex flex-col justify-between hover:shadow-md ${
                  isCompleted
                    ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : isSignatureLesson
                      ? "border-sky-300 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/10 ring-1 ring-sky-400/30"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      Lesson {lesson.order}
                    </span>

                    <div className="flex items-center gap-2">
                      {isSignatureLesson && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500 text-white shadow-xs">
                          Interactive Diagram ★
                        </span>
                      )}

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.estimatedMinutes}m</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 group-hover:text-sky-500 transition-colors">
                    {lang === "bn"
                      ? lesson.title.bn
                      : lang === "both"
                        ? `${lesson.title.en} (${lesson.title.bn})`
                        : lesson.title.en}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    {lang === "bn"
                      ? lesson.subtitle.bn
                      : lang === "both"
                        ? `${lesson.subtitle.en}`
                        : lesson.subtitle.en}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  <span>Level: {lesson.difficulty}</span>
                  <span className="inline-flex items-center gap-1 text-sky-500 group-hover:translate-x-0.5 transition-transform">
                    <span>{isCompleted ? "Review Lesson" : "Open Lesson"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
