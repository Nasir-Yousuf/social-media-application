import React from 'react';
import { Sun, Moon, CloudMoon, Terminal, Sunset, Check, Sparkles, X, Binary, Code2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Modal from './Modal';
import Avatar from './Avatar';

const ICONS = {
  light: Sun,
  dark: Moon,
  dim: CloudMoon,
  emerald: Code2,
  sunset: Sunset,
  hacker: Terminal,
};

export const ThemeModal = () => {
  const { theme, themes, setTheme, isThemeModalOpen, closeThemeModal } = useTheme();

  return (
    <Modal
      isOpen={isThemeModalOpen}
      onClose={closeThemeModal}
      title="Display & Themes"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5 font-sans select-none">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Personalize your Clearfeed view. Changes are saved automatically on this device.
        </p>

        {/* Live Preview Post Box */}
        <div className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 transition-colors">
          <div className="flex items-start gap-3">
            <Avatar name="Clearfeed" size="sm" showRoleBadge={false} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                  Clearfeed
                </span>
                <span className="text-[11px] text-neutral-400">@clearfeed · now</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed">
                At the heart of Clearfeed is a focused, chronological network for text and code. Choose the aesthetic that fits your mindset.
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-500 font-mono">
                <span>#cleanarchitecture</span>
                <span>#cs518</span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
            Background Flavor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              const Icon = ICONS[t.id] || Sparkles;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  style={{
                    backgroundColor: t.bg,
                    borderColor: isSelected ? t.accentColor : t.border,
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-150 cursor-pointer flex items-center justify-between group relative shadow-xs ${
                    isSelected ? 'ring-2 ring-offset-2 ring-sky-500/30' : 'hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: t.cardBg,
                        borderColor: t.border,
                        color: t.accentColor,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold text-xs sm:text-sm truncate"
                          style={{ color: t.previewText }}
                        >
                          {t.name}
                        </span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border uppercase"
                          style={{
                            borderColor: t.border,
                            color: t.accentColor,
                            backgroundColor: t.cardBg,
                          }}
                        >
                          {t.badge}
                        </span>
                      </div>
                      <p className="text-[11px] truncate opacity-70" style={{ color: t.previewText }}>
                        {t.subtitle}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-transparent text-white'
                        : 'border-neutral-400/40 bg-transparent'
                    }`}
                    style={isSelected ? { backgroundColor: t.accentColor } : {}}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Done button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={closeThemeModal}
            className="px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs tracking-tight shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ThemeModal;
