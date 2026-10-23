import React from 'react';
import {
  Flame,
  Gauge,
  Warehouse,
  Gamepad2,
  LayoutDashboard,
  Terminal,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const THEMES = [
  {
    id: 'racing_hub',
    label: 'Arena Hub',
    icon: Flame,
    badge: 'NEW',
    desc: 'Main Racing Arena Dashboard (Image 2)',
  },
  {
    id: 'race',
    label: '2.5D Race',
    icon: Gauge,
    badge: 'LIVE',
    desc: 'Real-time Supercar Typing Race (Image 1)',
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    badge: 'TOP',
    desc: 'Real-time MongoDB Speed Championship Leaderboard',
  },
  {
    id: 'garage',
    label: 'My Garage',
    icon: Warehouse,
    badge: null,
    desc: 'Customize cars, paint, underglow & license plate',
  },
  {
    id: 'arcade',
    label: 'Mood Cricket',
    icon: Gamepad2,
    badge: '🏏',
    desc: 'Typing Cricket & Mini-Games',
  },
  {
    id: 'game',
    label: 'Arcade Mode',
    icon: Gamepad2,
    badge: 'Esports',
    desc: 'Gamified UI matching esports layout',
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

export const ArenaThemeSwitcher = ({ activeTheme, onSelectTheme, compact = false }) => {
  return (
    <div className={`flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl backdrop-blur-md ${compact ? 'py-0.5 px-1' : ''}`}>
      {!compact && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 hidden sm:inline-block">
          Mode Style:
        </span>
      )}
      {THEMES.map((t) => {
        const Icon = t.icon;
        const isActive = activeTheme === t.id;

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTheme(t.id)}
            title={t.desc}
            className={`relative flex items-center gap-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
              compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
            } ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Icon className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span>{t.label}</span>
            {t.badge && !compact && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 font-mono font-black border border-fuchsia-500/30">
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
