import React, { useState } from 'react';
import { 
  Database, Play, CheckCircle2, Circle, Clock, ChevronDown, 
  ChevronUp, Terminal, Sparkles, BookOpen, Layers, Award,
  ArrowRight, ShieldCheck, Check, Server
} from 'lucide-react';
import { MYSQL_MODULES } from '../../data/mysqlCurriculum';

export const MySqlCourseOverview = ({
  allLessons = [],
  completedLessonIds = [],
  onSelectLesson,
  onOpenLab
}) => {
  const [expandedModules, setExpandedModules] = useState({
    'mysql-mod-1': true,
    'mysql-mod-2': true
  });

  const totalLessons = allLessons.length || 60;
  const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  // Find the first uncompleted lesson or default to lesson 1
  const nextLesson = allLessons.find(l => !completedLessonIds.includes(l.id)) || allLessons[0];

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Hero Course Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold tracking-wide">
              <Database className="w-3.5 h-3.5" />
              Relational Database Track
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              MySQL 8.0 Standard
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">
              60 Lessons • 10 Modules
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              MySQL Mastery: <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">Beginner to Advanced</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              Learn databases, write SQL queries, build relationships, and master database design through practical exercises.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">Total Curriculum</span>
              <span className="text-xl font-bold text-white font-mono">60 Lessons</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">Course Progress</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">Sample Databases</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">3 Live DBs</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
              <span className="text-[11px] text-slate-400 block mb-1">Practice Sandbox</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">Safe In-Browser</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {completedCount} of {totalLessons} lessons completed
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {progressPercent}% Complete
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onSelectLesson(nextLesson?.id || 'mysql-lesson-1')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{completedCount > 0 ? 'Continue Learning' : 'Start Learning'}</span>
            </button>

            {onOpenLab && (
              <button
                onClick={onOpenLab}
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-sm rounded-2xl flex items-center gap-2 transition-colors shadow-sm"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Interactive SQL Practice Lab</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Highlights & Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Realistic Sample Databases</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Practice queries on real-world schemas including University Enrollment, Corporate HR, and full E-Commerce transactions.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Safe Execution Sandbox</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test arbitrary SQL safely in your browser with zero server risk. Immediate tabular results, execution metrics, and instant database reset.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Production Best Practices</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Learn professional engineering: B-Tree indexing, EXPLAIN plans, ACID transactions, parameterized queries, and SQL injection defense.
          </p>
        </div>
      </div>

      {/* 10-Module Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Complete 10-Module Curriculum
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              60 structured lessons guiding you from database fundamentals to enterprise production skills.
            </p>
          </div>

          <button
            onClick={() => {
              const allOpen = Object.keys(expandedModules).length === MYSQL_MODULES.length;
              if (allOpen) {
                setExpandedModules({});
              } else {
                const openAll = {};
                MYSQL_MODULES.forEach(m => { openAll[m.id] = true; });
                setExpandedModules(openAll);
              }
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            {Object.keys(expandedModules).length === MYSQL_MODULES.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="space-y-4">
          {MYSQL_MODULES.map((module) => {
            const isExpanded = !!expandedModules[module.id];
            const moduleLessons = allLessons.filter(l => l.moduleId === module.id);
            const modCompleted = moduleLessons.filter(l => completedLessonIds.includes(l.id)).length;
            const isAllCompleted = modCompleted === moduleLessons.length && moduleLessons.length > 0;

            return (
              <div 
                key={module.id} 
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors hover:border-slate-700"
              >
                {/* Module Header Bar */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-850/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isAllCompleted 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {isAllCompleted ? <Check className="w-4 h-4" /> : module.moduleNumber}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {module.title}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                          {modCompleted}/{moduleLessons.length} Done
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:block w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(modCompleted / (moduleLessons.length || 1)) * 100}%` }}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Lesson List */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 bg-slate-950/70 border-t border-slate-800 divide-y divide-slate-850">
                    {moduleLessons.map((lesson) => {
                      const isDone = completedLessonIds.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className="py-3 px-3 sm:px-4 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors group cursor-pointer"
                          onClick={() => onSelectLesson(lesson.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-500">#{lesson.lessonNumber}</span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                                {lesson.subtitle}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono hidden sm:flex">
                              <Clock className="w-3 h-3" />
                              {lesson.estimatedMinutes || 20}m
                            </span>
                            <span className="text-xs font-medium text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <span>Learn</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
