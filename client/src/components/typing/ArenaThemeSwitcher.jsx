import React from 'react';
import { Gamepad2, LayoutDashboard, Terminal, Sparkles } from 'lucide-react';

export const THEMES = [
  {
    id: 'game',
    label: 'Arcade Mode',
    icon: Gamepad2,
    badge: 'Popular',
    desc: 'Gamified UI matching esports & screenshot layout',
  },
  {
    id: 'classic',
    label: 'Platform Classic',
    icon: LayoutDashboard,
    badge: null,
    desc: 'Consistent with site feed and social theme',
  },
  {
    id: 'hacker',
    label: 'Cyber Hacker',
    icon: Terminal,
    badge: 'Matrix',
    desc: 'Retro green phosphor CRT terminal theme',
  },
  {
    id: 'zen',
    label: 'Zen Focus',
    icon: Sparkles,
    badge: null,
    desc: 'Distraction-free pure focus mode',
  },
];

export const ArenaThemeSwitcher = ({ activeTheme, onSelectTheme }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#080c14] border border-neutral-800 shadow-xl backdrop-blur-md">
      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2.5 hidden sm:inline-block">
        Mode Style:
      </span>
      {THEMES.map((t) => {
        const Icon = t.icon;
        const isActive = activeTheme === t.id;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTheme(t.id)}
            title={t.desc}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-neutral-400'}`} />
            <span>{t.label}</span>
            {t.badge && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-400/20 text-sky-300 font-mono font-bold">
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ArenaThemeSwitcher;
