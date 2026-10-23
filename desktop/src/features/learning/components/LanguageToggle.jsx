import React from 'react';
import { Globe } from 'lucide-react';

export const LanguageToggle = ({ lang, onChange, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/90 rounded-full border border-neutral-200/80 dark:border-neutral-700/80 select-none ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <div className="flex items-center gap-1 pl-2 pr-1 text-neutral-400 dark:text-neutral-500">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <button
        type="button"
        onClick={() => onChange('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
          lang === 'en'
            ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 shadow-xs'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => onChange('bn')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
          lang === 'bn'
            ? 'bg-white dark:bg-neutral-900 text-sky-600 dark:text-sky-400 shadow-xs'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        বাংলা
      </button>

      <button
        type="button"
        onClick={() => onChange('both')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
          lang === 'both'
            ? 'bg-sky-500 text-white shadow-xs'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
        title="Show both English and Bangla side-by-side"
      >
        Both / উভয়ই
      </button>
    </div>
  );
};

export default LanguageToggle;
