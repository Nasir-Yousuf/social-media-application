import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Clock,
  Award,
  Layers,
  BookOpen,
} from 'lucide-react';
import ComputerArchitectureDiagram from './ComputerArchitectureDiagram';
import HardwareSoftwareChart from './HardwareSoftwareChart';
import MemoryHierarchyVisualizer from './MemoryHierarchyVisualizer';
import ElectricalVsElectronicComparator from './ElectricalVsElectronicComparator';
import ComputerBasicsQuiz from './ComputerBasicsQuiz';
import IPOMachineSimulator from './IPOMachineSimulator';
import SpeedRaceSimulator from './SpeedRaceSimulator';
import FiveUnitsHubVisualizer from './FiveUnitsHubVisualizer';
import DeskVsBookshelfSimulator from './DeskVsBookshelfSimulator';
import GuiVsCliInteractiveConsole from './GuiVsCliInteractiveConsole';
import SystemFeedbackLoopSimulator from './SystemFeedbackLoopSimulator';
import EducationalContentRenderer from './EducationalContentRenderer';

// Brand New Interactive Simulators for Modules 2, 3, 4, 5, 6
import CpuBusSystemSimulator from './CpuBusSystemSimulator';
import RiscVsCiscComparator from './RiscVsCiscComparator';
import MemoryUnitsLadderSimulator from './MemoryUnitsLadderSimulator';
import CpuMemoryCycleSimulator from './CpuMemoryCycleSimulator';
import KeyboardInterruptSimulator from './KeyboardInterruptSimulator';
import PrintSpoolerSimulator from './PrintSpoolerSimulator';
import DisplayTechComparator from './DisplayTechComparator';
import OsSchedulerAndDefragSimulator from './OsSchedulerAndDefragSimulator';

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
              Web-101 · Lesson {lesson.order} of 32
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-neutral-300">
              {lesson.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.estimatedMinutes} mins read & interact</span>
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
              ? `${lesson.subtitle?.en} · ${lesson.subtitle?.bn}`
              : lesson.subtitle?.en}
          </p>
        </div>
      </div>

      {/* Key Takeaways Card */}
      {((lesson.keyTakeaways && lesson.keyTakeaways.length > 0) ||
        (lesson.keyTakeawaysBn && lesson.keyTakeawaysBn.length > 0)) && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Key Takeaways / মূল শিক্ষণীয় বিষয়সমূহ</span>
          </div>

          {lang === 'both' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* English List */}
              <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                <li className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 border-b border-sky-500/20 pb-1">
                  🇺🇸 English Summary
                </li>
                {lesson.keyTakeaways?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Bangla List */}
              <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                <li className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-emerald-500/20 pb-1">
                  🇧🇩 সারসংক্ষেপ (বাংলা)
                </li>
                {(lesson.keyTakeawaysBn || lesson.keyTakeaways)?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
              {(lang === 'bn' && lesson.keyTakeawaysBn
                ? lesson.keyTakeawaysBn
                : lesson.keyTakeaways
              ).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ========================================================
          INTERACTIVE ANIMATIONS & SUITES (1 to 2 PER LESSON)
         ======================================================== */}
      {/* LESSON 1, 23, 26 SUITE: IPO Conveyor + Speed Race */}
      {lesson.interactiveType === 'lesson1-suite' && (
        <div className="space-y-6">
          <IPOMachineSimulator />
          <SpeedRaceSimulator />
        </div>
      )}

      {/* LESSON 2, 9, 20 SUITE: 5 Functional Units Communication Hub */}
      {lesson.interactiveType === 'lesson2-suite' && (
        <div className="space-y-6">
          <FiveUnitsHubVisualizer lang={lang} />
        </div>
      )}

      {/* LESSON 3 SUITE: Signature Functional Block Diagram Simulation */}
      {lesson.interactiveType === 'architecture-diagram-simulation' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-500" />
              <span>Interactive Functional Block Diagram & Guided Simulation</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
              Signature Simulation
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

      {/* LESSON 4 SUITE: Feedback Loop + Taxonomy Tree */}
      {lesson.interactiveType === 'lesson4-suite' && (
        <div className="space-y-6">
          <SystemFeedbackLoopSimulator />
          <HardwareSoftwareChart />
        </div>
      )}

      {/* LESSON 5, 15, 16, 17 SUITE: Desk vs Bookshelf (RAM vs SSD) + Hierarchy Pyramid */}
      {lesson.interactiveType === 'lesson5-suite' && (
        <div className="space-y-6">
          <DeskVsBookshelfSimulator />
          <MemoryHierarchyVisualizer />
        </div>
      )}

      {/* LESSON 6, 27, 29, 30 SUITE: GUI vs CLI Interactive Console */}
      {lesson.interactiveType === 'lesson6-suite' && (
        <div className="space-y-6">
          <GuiVsCliInteractiveConsole />
        </div>
      )}

      {/* LESSON 7 SUITE: Electrical vs Electronic Demonstrator & Transistor Switch */}
      {lesson.interactiveType === 'lesson7-suite' && (
        <div className="space-y-6">
          <ElectricalVsElectronicComparator />
        </div>
      )}

      {/* LESSON 10, 13 SUITE: RISC vs CISC Architecture Race */}
      {lesson.interactiveType === 'lesson10-suite' && (
        <div className="space-y-6">
          <RiscVsCiscComparator lang={lang} />
        </div>
      )}

      {/* LESSON 11, 12 SUITE: Computer Bus 3-Lane Highway Simulator */}
      {lesson.interactiveType === 'lesson11-suite' && (
        <div className="space-y-6">
          <CpuBusSystemSimulator lang={lang} />
        </div>
      )}

      {/* LESSON 14 SUITE: Digital Memory Units Ladder & Scale */}
      {lesson.interactiveType === 'lesson14-suite' && (
        <div className="space-y-6">
          <MemoryUnitsLadderSimulator lang={lang} />
        </div>
      )}

      {/* LESSON 18 SUITE: CPU Memory Read & Write Cycle Micro-Stepper */}
      {lesson.interactiveType === 'lesson18-suite' && (
        <div className="space-y-6">
          <CpuMemoryCycleSimulator lang={lang} />
        </div>
      )}

      {/* LESSON 19, 21, 22 SUITE: Keyboard Mechanics, Buffers & IRQ 1 Interrupt */}
      {lesson.interactiveType === 'lesson19-suite' && (
        <div className="space-y-6">
          <KeyboardInterruptSimulator lang={lang} />
        </div>
      )}

      {/* LESSON 24 SUITE: Printers & Print Spooling (SPOOL) */}
      {lesson.interactiveType === 'lesson24-suite' && (
        <div className="space-y-6">
          <PrintSpoolerSimulator lang={lang} />
        </div>
      )}

      {/* LESSON 25 SUITE: Display Technologies (CRT vs LCD) */}
      {lesson.interactiveType === 'lesson25-suite' && (
        <div className="space-y-6">
          <DisplayTechComparator lang={lang} />
        </div>
      )}

      {/* LESSON 28, 31 SUITE: OS Scheduler & Disk Defragmenter */}
      {(lesson.interactiveType === 'lesson28-suite' || lesson.interactiveType === 'lesson31-suite') && (
        <div className="space-y-6">
          <OsSchedulerAndDefragSimulator lang={lang} />
        </div>
      )}

      {/* LESSON 8, 32 SUITE: Revision Assessment & Sorting Drills */}
      {lesson.interactiveType === 'comprehensive-quiz-and-drills' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Exam Revision Center & Practice Assessment</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Interactive Quiz
            </span>
          </div>
          <ComputerBasicsQuiz
            onComplete={() => {
              if (onLessonCompleted) onLessonCompleted(lesson.id);
            }}
          />
        </div>
      )}

      {/* ========================================================
          CLEAN, BITE-SIZED EDUCATIONAL EXPLANATIONS
         ======================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60 dark:border-neutral-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <span>Study Guide & Clear Explanations / সহজ ভাষায় বিস্তারিত ব্যাখ্যা</span>
          </h3>
          <span className="text-[11px] font-bold text-neutral-400">
            {lang === 'bn' ? 'বাংলা সংস্করণ' : lang === 'both' ? 'দ্বিভাষিক সংস্করণ (Bilingual)' : 'English Edition'}
          </span>
        </div>

        {lesson.contentSections?.map((section, sIdx) => (
          <div
            key={sIdx}
            className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#12161f] p-5 sm:p-7 shadow-xs space-y-4"
          >
            {/* Section Header */}
            <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
              <h4 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                {lang === 'bn'
                  ? section.headingBn || section.heading
                  : lang === 'both'
                  ? `${section.heading} ${section.headingBn ? `· ${section.headingBn}` : ''}`
                  : section.heading}
              </h4>
            </div>

            {/* 1. English-Only Mode */}
            {lang === 'en' && (
              <EducationalContentRenderer content={section.bodyEn} />
            )}

            {/* 2. Bangla-Only Mode */}
            {lang === 'bn' && (
              <EducationalContentRenderer content={section.bodyBn || section.bodyEn} />
            )}

            {/* 3. Both (Bilingual Mode): Structured Side-by-Side or Stacked Bilingual Cards */}
            {lang === 'both' && (
              <div className="space-y-5">
                {/* English Content Box */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      🇺🇸 English Explanation
                    </span>
                  </div>
                  <EducationalContentRenderer content={section.bodyEn} />
                </div>

                {/* Bangla Content Box */}
                {section.bodyBn && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/90 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/80 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        🇧🇩 সহজ বাংলায় সম্পূর্ণ ব্যাখ্যা (Bangla Guide)
                      </span>
                    </div>
                    <EducationalContentRenderer content={section.bodyBn} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonContent;
