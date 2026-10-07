import React from 'react';
import {
  AlignLeft,
  Quote,
  Code2,
  Calendar,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Target,
  Swords,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { getSpeedTier } from '../../utils/typingEngine';

export const GameArenaLayout = ({
  // Modes & filters
  mode,
  setMode,
  duration,
  setDuration,
  wordLength,
  setWordLength,
  punctuation,
  setPunctuation,
  numbers,
  setNumbers,
  soundTheme,
  setSoundTheme,
  // Live session metrics
  timeLeft,
  streak,
  highestStreak,
  wpm,
  accuracy,
  // Typing canvas slot
  typingStageSlot,
  // Contest & Leaderboard data
  leaderboard = [],
  userRank = 12,
  currentUser,
  onChallengeGhost,
  ghostData,
  isActive,
}) => {
  // Speed tier calculation for Tier Card
  const currentTier = getSpeedTier(wpm || 84);
  const wpmToNext = Math.max(0, (currentTier.nextMin || 100) - Math.round(wpm || 84));
  const tierProgress = Math.min(
    100,
    Math.max(10, Math.round(((wpm || 84) / (currentTier.nextMin || 100)) * 100))
  );

  // Sound theme cycler
  const soundThemesList = ['mechanical', 'thock', 'bubble', 'beep', 'mute'];
  const cycleSoundTheme = () => {
    const nextIdx = (soundThemesList.indexOf(soundTheme) + 1) % soundThemesList.length;
    setSoundTheme(soundThemesList[nextIdx]);
  };

  // Top primary tabs
  const PRIMARY_TABS = [
    { id: 'words', label: 'Words', icon: AlignLeft },
    { id: 'quote', label: 'Quotes', icon: Quote },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly Contest 🏆', icon: Trophy, isLive: true },
  ];

  // Mock top leaderboard entries if empty from backend
  const displayLeaderboard = leaderboard.length > 0 ? leaderboard.slice(0, 6) : [
    { id: 1, rank: 1, user: { username: 'Roni', name: 'Roni' }, wpm: 94 },
    { id: 2, rank: 2, user: { username: 'Adam', name: 'Adam' }, wpm: 92 },
    { id: 3, rank: 3, user: { username: 'Darry', name: 'Darry' }, wpm: 90 },
    { id: 4, rank: 4, user: { username: 'Aabu', name: 'Aabu' }, wpm: 88 },
    { id: 5, rank: 5, user: { username: 'Shaman', name: 'Shaman' }, wpm: 84 },
    { id: 6, rank: 6, user: { username: 'rahim', name: 'rahim' }, wpm: 83 },
  ];

  // Circular gauge circumference
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clampedWpm = Math.min(160, Math.max(0, wpm || 0));
  const strokeOffset = circumference - (clampedWpm / 160) * circumference;

  return (
    <div className="w-full space-y-4 font-sans select-none">
      {/* 1. TOP BAR: PRIMARY TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#090d16] border border-neutral-800/80 shadow-lg backdrop-blur-md">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isTabActive =
              (tab.id === 'words' && ['words_200', 'words_1000', 'words_5000'].includes(mode)) ||
              mode === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'words') setMode('words_200');
                  else setMode(tab.id);
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isTabActive
                    ? 'text-white bg-sky-500/20 border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isTabActive ? 'text-sky-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.isLive && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>LIVE</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUB-FILTERS ROW: Word Length, Timers, Punctuation, Numbers, Sound */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400 px-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Word Length Pills */}
          {['words_200', 'words_1000', 'words_5000'].includes(mode) && (
            <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-neutral-800/80">
              {[
                { id: 'words_200', label: 'Top 200' },
                { id: 'words_1000', label: 'Top 1000' },
                { id: 'words_5000', label: 'Top 5000' },
              ].map((wl) => (
                <button
                  key={wl.id}
                  type="button"
                  onClick={() => setMode(wl.id)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    mode === wl.id
                      ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {wl.label}
                </button>
              ))}
            </div>
          )}

          {/* Duration Pills */}
          {mode !== 'quote' && (
            <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-neutral-800/80">
              {[15, 30, 60, 120].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    duration === dur
                      ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {dur}s{duration === dur ? ' (active)' : ''}
                </button>
              ))}
            </div>
          )}

          {/* Punctuation Switch */}
          <button
            type="button"
            onClick={() => setPunctuation(!punctuation)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d16] border border-neutral-800/80 text-neutral-300 hover:text-white cursor-pointer transition-colors"
          >
            <span>punctuation</span>
            <span
              className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                punctuation ? 'bg-sky-500 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </span>
          </button>

          {/* Numbers Switch */}
          <button
            type="button"
            onClick={() => setNumbers(!numbers)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d16] border border-neutral-800/80 text-neutral-300 hover:text-white cursor-pointer transition-colors"
          >
            <span>numbers</span>
            <span
              className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                numbers ? 'bg-sky-500 justify-end' : 'bg-neutral-700 justify-start'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </span>
          </button>
        </div>

        {/* Sound Theme Button */}
        <button
          type="button"
          onClick={cycleSoundTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090d16] border border-neutral-800/80 text-neutral-300 hover:text-sky-300 cursor-pointer transition-colors"
        >
          {soundTheme === 'mute' ? (
            <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          )}
          <span className="capitalize">{soundTheme}</span>
        </button>
      </div>

      {/* 3. MAIN DASHBOARD: 2-COLUMN GRID (ARENA CARD + SIDEBAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Main Gaming Card (approx 72%) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Glowing Cyber Card */}
          <div className="relative rounded-3xl bg-[#090e18] border-2 border-sky-500/40 p-6 sm:p-8 shadow-[0_0_35px_rgba(2,132,199,0.18)] overflow-hidden transition-all duration-300">
            {/* Top Internal Stats: Big Timer, Center Combo, Circular Gauge */}
            <div className="grid grid-cols-3 items-center mb-6 pb-2 border-b border-neutral-800/60">
              {/* Massive Left Countdown */}
              <div className="flex flex-col items-start">
                <span className="text-5xl sm:text-6xl font-black text-sky-400 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                  {timeLeft}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  Seconds
                </span>
              </div>

              {/* Center Glowing Combo Meter */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-base sm:text-lg font-black text-amber-400 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                  <span>x{streak}</span>
                  <span>COMBO</span>
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
                </div>
                {/* Glowing Flame Progress Bar */}
                <div className="w-36 sm:w-44 h-1.5 rounded-full bg-neutral-800 mt-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(249,115,22,0.9)] transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.max(15, streak * 4))}%` }}
                  />
                </div>
              </div>

              {/* Top-Right Circular Speedometer Ring */}
              <div className="flex flex-col items-end">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90">
                    {/* Background track circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-neutral-800/80"
                      fill="none"
                    />
                    {/* Glowing progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      className="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all duration-300"
                      fill="none"
                    />
                  </svg>
                  {/* Inner text values */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                      {wpm}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-tighter">
                      WPM
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-neutral-400 mt-1">
                  {accuracy}% acc
                </span>
              </div>
            </div>

            {/* Embedded Typing Stage */}
            <div className="relative">{typingStageSlot}</div>
          </div>

          {/* Bottom Card: Weekly Sprint Status Bar */}
          <div className="p-4 rounded-2xl bg-[#090d16] border border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2 text-neutral-400">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Weekly Sprint</span>
              </span>
              <span>·</span>
              <span className="text-neutral-500">ends in 2d 04h 13m</span>
              <span>·</span>
              <span className="text-sky-400 font-bold">You are #{userRank}</span>
              <span>·</span>
              <span className="text-neutral-300">3 WPM behind #11</span>
            </div>

            {/* Sprint Progress Bar */}
            <div className="w-32 h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                style={{ width: '68%' }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Live Leaderboard + Tier Card) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Live Leaderboard */}
          <div className="rounded-3xl bg-[#090d16] border border-neutral-800/90 p-5 shadow-xl space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Live Leaderboard</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>

            {/* Leaderboard entries */}
            <div className="space-y-1.5">
              {displayLeaderboard.map((item, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                const rankDisplay = medals[idx] || `${idx + 1}`;
                const isLeader = idx === 0;

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => onChallengeGhost && onChallengeGhost(item)}
                    title="Click to race ghost"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 hover:bg-neutral-800/50 border border-neutral-800/50 hover:border-sky-500/30 transition-all duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center text-sm font-mono font-bold text-neutral-400">
                        {rankDisplay}
                      </span>
                      <Avatar user={item.user} size="xs" />
                      <span className="text-xs font-semibold text-neutral-200 truncate group-hover:text-sky-300 transition-colors">
                        {item.user?.username || item.user?.name || `Player ${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-300">
                      <span>{item.wpm}</span>
                      <span className="text-[10px] text-neutral-500">WPM</span>
                    </div>
                  </div>
                );
              })}

              {/* Pinned User Row */}
              <div className="pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-sky-500/15 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-sky-400">#{userRank}</span>
                    <Avatar user={currentUser} size="xs" />
                    <span className="text-xs font-bold text-white">You</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-black text-sky-300">
                    <span>{wpm || 84}</span>
                    <span className="text-[10px] text-sky-400/80">WPM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Tier Card */}
          <div className="rounded-3xl bg-[#090d16] border border-neutral-800/90 p-5 shadow-xl text-center space-y-3 font-sans">
            <div className="text-left">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                Tier
              </span>
            </div>

            {/* Glowing 3D Diamond / Tier Gem */}
            <div className="relative py-2 flex flex-col items-center justify-center">
              <div className="relative text-5xl select-none filter drop-shadow-[0_0_20px_rgba(56,189,248,0.7)] animate-pulse">
                {currentTier.badge || '💎'}
              </div>
              <h4 className="mt-2 text-xl font-black text-white font-mono tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                {currentTier.gameName || 'PLATINUM'}
              </h4>
            </div>

            {/* Progress to Next Tier */}
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-300"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                to {currentTier.nextTier || 'Diamond'}: {wpmToNext} WPM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameArenaLayout;
