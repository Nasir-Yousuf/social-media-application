import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Clock,
  Award,
  Layers,
} from 'lucide-react';
import ComputerArchitectureDiagram from './ComputerArchitectureDiagram';
import HardwareSoftwareChart from './HardwareSoftwareChart';
import MemoryHierarchyVisualizer from './MemoryHierarchyVisualizer';
import ElectricalVsElectronicComparator from './ElectricalVsElectronicComparator';
import ComputerBasicsQuiz from './ComputerBasicsQuiz';

export const LessonContent = ({
  lesson,
  lang = 'both',
  onLessonCompleted,
}) => {
  if (!lesson) return null;

  return (
    <div className="space-y-8 font-sans">
      {/* Lesson Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-neutral-900 via-[#101827] to-[#0d1624] text-white border border-neutral-800 shadow-md relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Web-101 Lecture 01 · Lesson {lesson.order} of 8
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-neutral-300">
              {lesson.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.estimatedMinutes} mins read & practice</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === 'bn'
              ? lesson.title?.bn
              : lang === 'both'
              ? `${lesson.title?.en} (${lesson.title?.bn})`
              : lesson.title?.en}
          </h1>

          <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
            {lang === 'bn'
              ? lesson.subtitle?.bn
              : lang === 'both'
              ? `${lesson.subtitle?.en} — ${lesson.subtitle?.bn}`
              : lesson.subtitle?.en}
          </p>
        </div>
      </div>

      {/* Key Takeaways Card */}
      {lesson.keyTakeaways && (
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Essential Key Takeaways / মূল শিক্ষণীয় বিষয়সমূহ</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-700 dark:text-neutral-300">
            {lesson.keyTakeaways.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dedicated Interactive Lesson Component (If Present) */}
      {lesson.interactiveType === 'architecture-diagram-simulation' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-500" />
              <span>Interactive Functional Block Diagram & Simulation</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
              Signature Feature
            </span>
          </div>
          <ComputerArchitectureDiagram
            lang={lang}
            onSimulationComplete={() => {
              if (onLessonCompleted) onLessonCompleted(lesson.id);
            }}
          />
        </div>
      )}

      {lesson.interactiveType === 'hardware-software-chart' && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Organizational Taxonomy of Computer Systems</span>
          </h2>
          <HardwareSoftwareChart lang={lang} />
        </div>
      )}

      {lesson.interactiveType === 'memory-hierarchy-pyramid' && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <span>Memory Hierarchy Pyramid & Storage Media</span>
          </h2>
          <MemoryHierarchyVisualizer lang={lang} />
        </div>
      )}

      {lesson.interactiveType === 'electrical-electronic-comparator' && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <span>Electrical vs Electronic Demonstrator & Classifier</span>
          </h2>
          <ElectricalVsElectronicComparator lang={lang} />
        </div>
      )}

      {lesson.interactiveType === 'comprehensive-quiz-and-drills' && (
        <div className="space-y-3">
          <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Exam Revision Center & Practice Assessment</span>
          </h2>
          <ComputerBasicsQuiz
            lang={lang}
            onComplete={() => {
              if (onLessonCompleted) onLessonCompleted(lesson.id);
            }}
          />
        </div>
      )}

      {/* Main Educational Reading Sections */}
      <div className="space-y-6">
        {lesson.contentSections?.map((section, sIdx) => (
          <div
            key={sIdx}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-6 shadow-xs space-y-3"
          >
            <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              {section.heading}
            </h3>

            {/* English Explanations */}
            {(lang === 'en' || lang === 'both') && (
              <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line space-y-2">
                {section.bodyEn}
              </div>
            )}

            {/* Bengali Explanations */}
            {(lang === 'bn' || lang === 'both') && (
              <div
                className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line p-3.5 rounded-xl ${
                  lang === 'both'
                    ? 'bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 italic'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {section.bodyBn}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonContent;
