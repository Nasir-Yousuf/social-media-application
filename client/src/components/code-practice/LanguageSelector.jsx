import React from 'react';
import { Code, Layout, Terminal, CheckCircle2 } from 'lucide-react';

const LANGUAGES = [
  {
    id: 'html',
    name: 'HTML',
    subtitle: 'Structure',
    desc: 'Tags, attributes, forms, accessibility & semantic elements',
    icon: Layout,
    color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-500 dark:text-orange-400',
    activeBadge: 'bg-orange-500 text-white',
    iconBg: 'bg-orange-500/10 text-orange-500',
    lessonCount: 25,
  },
  {
    id: 'css',
    name: 'CSS',
    subtitle: 'Styling',
    desc: 'Selectors, flexbox, grid, media queries & responsive design',
    icon: Code,
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-500 dark:text-blue-400',
    activeBadge: 'bg-blue-500 text-white',
    iconBg: 'bg-blue-500/10 text-blue-500',
    lessonCount: 34,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    subtitle: 'Logic',
    desc: 'Variables, arrow functions, DOM manipulation & async/await',
    icon: Terminal,
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400',
    activeBadge: 'bg-amber-400 text-black font-extrabold',
    iconBg: 'bg-amber-500/10 text-amber-500',
    lessonCount: 63,
  },
];

export const LanguageSelector = ({ selectedLanguage = 'html', onSelectLanguage, progress = {} }) => {
  return (
    <div className="w-full space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Select Programming Language
        </h2>
        <span className="text-xs text-neutral-400">3 Core Technologies</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LANGUAGES.map((lang) => {
          const Icon = lang.icon;
          const isSelected = selectedLanguage === lang.id;
          const completedCount = (progress.completedLessons?.[lang.id] || []).length;
          const bestWpm = progress.bestWpm?.[lang.id] || 0;
          const percent = Math.min(100, Math.round((completedCount / lang.lessonCount) * 100));

          return (
            <button
              key={lang.id}
              onClick={() => onSelectLanguage(lang.id)}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer group active:scale-[0.98] ${
                isSelected
                  ? `bg-gradient-to-br ${lang.color} shadow-lg ring-2 ring-sky-500/40 border-sky-500/50`
                  : 'bg-white dark:bg-[#121519] border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm'
              }`}
            >
              {/* Header inside Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${lang.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-neutral-900 dark:text-white leading-tight">
                        {lang.name}
                      </h3>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {lang.subtitle}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${lang.activeBadge}`}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                  {lang.desc}
                </p>
              </div>

              {/* Card Footer Metrics */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{completedCount}/{lang.lessonCount} Lessons</span>
                </div>
                <div className="font-mono text-neutral-700 dark:text-neutral-300">
                  Best: <strong className="text-sky-500 font-extrabold">{bestWpm} WPM</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSelector;
