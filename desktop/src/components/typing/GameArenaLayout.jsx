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
  Trash2,
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
  userRank = null,
  userBestScore = null,
  currentUser,
  onChallengeGhost,
  ghostData,
  isActive,
  // 1v1 Challenges / Duels
  challenges = { incoming: [], outgoing: [], history: [] },
  activeChallenge = null,
  onAcceptChallenge,
  onDeclineChallenge,
  onExitDuel,
  onOpenChallengeModal,
  onAdminRemoveEntry,
}) => {
  const [sidebarTab, setSidebarTab] = React.useState('leaderboard'); // 'leaderboard' | 'duels'
  // Speed tier calculation for Tier Card
  const currentTier = getSpeedTier(wpm || 0);
  const wpmToNext = Math.max(0, (currentTier.nextMin || 40) - Math.round(wpm || 0));
  const tierProgress = Math.min(
    100,
    Math.max(5, Math.round(((wpm || 0) / (currentTier.nextMin || 40)) * 100))
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

  // Real leaderboard entries from backend (strictly real users, no dummy mock data)
  const displayLeaderboard = Array.isArray(leaderboard) ? leaderboard.slice(0, 8) : [];

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
                  onClick={(e) => {
                    setDuration(dur);
                    e.currentTarget.blur();
                  }}
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
          {/* Active 1v1 Duel Header Alert */}
          {activeChallenge && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-black border border-amber-500/50 flex items-center justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-amber-500 text-black font-black shadow-md">
                  <Swords className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-amber-400 tracking-wider uppercase text-xs">
                      1v1 Typing Duel In Progress
                    </span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-white font-bold font-mono">
                      Target to beat: {activeChallenge.challengerWpm} WPM
                    </span>
                  </div>
                  <p className="text-neutral-300 text-xs truncate mt-0.5">
                    Opponent: @{activeChallenge.challenger?.username || 'Rival'} {activeChallenge.customMessage ? `· "${activeChallenge.customMessage}"` : ''}
                  </p>
                </div>
              </div>
              {onExitDuel && (
                <button
                  type="button"
                  onClick={onExitDuel}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer shrink-0 transition-colors"
                >
                  Exit Duel
                </button>
              )}
            </div>
          )}

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

          {/* Bottom Card: Leaderboard Status Bar */}
          <div className="p-4 rounded-2xl bg-[#090d16] border border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2 text-neutral-400">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Leaderboard Standing</span>
              </span>
              <span>·</span>
              <span className="text-neutral-300">
                {duration}s {mode.replace('_', ' ')}
              </span>
              <span>·</span>
              <span className="text-sky-400 font-bold">
                {userRank ? `You are Ranked #${userRank}` : 'Complete test to claim rank'}
              </span>
              {userBestScore?.wpm && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">Personal Best: {userBestScore.wpm} WPM</span>
                </>
              )}
            </div>

            {/* Sprint Progress Bar */}
            <div className="w-32 h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_8px_rgba(56,189,248,0.6)] transition-all duration-300"
                style={{ width: `${userRank ? Math.max(15, 100 - userRank * 5) : 35}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Live Leaderboard + Tier Card) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Live Leaderboard & 1v1 Duels */}
          <div className="rounded-3xl bg-[#090d16] border border-neutral-800/90 p-5 shadow-xl space-y-4 font-sans">
            {/* Sidebar Tab Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-neutral-800/80">
              <button
                type="button"
                onClick={() => setSidebarTab('leaderboard')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'leaderboard'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('duels')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
                  sidebarTab === 'duels'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>1v1 Duels</span>
                {challenges?.incoming?.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 right-2" />
                )}
              </button>
            </div>

            {sidebarTab === 'leaderboard' ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Global Leaderboard</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                      {duration}s Sprint
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>

            {/* Leaderboard entries */}
            <div className="space-y-1.5">
              {displayLeaderboard.length === 0 ? (
                <div className="py-6 px-3 text-center rounded-2xl bg-black/30 border border-neutral-800/60 font-sans space-y-1.5">
                  <Trophy className="w-7 h-7 text-neutral-600 mx-auto opacity-40 mb-1" />
                  <p className="text-xs font-bold text-neutral-300">No typists ranked yet</p>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Type a {duration}s test above to record your score and claim #1 on the leaderboard!
                  </p>
                </div>
              ) : (
                displayLeaderboard.map((item, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const rankDisplay = medals[idx] || `${idx + 1}`;

                  return (
                    <div
                      key={item._id || item.id || idx}
                      onClick={() => onChallengeGhost && onChallengeGhost(item)}
                      title="Click to race ghost"
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/30 hover:bg-neutral-800/50 border border-neutral-800/50 hover:border-sky-500/30 transition-all duration-150 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-center text-sm font-mono font-bold text-neutral-400">
                          {rankDisplay}
                        </span>
                        <Avatar
                          src={item.user?.avatarUrl}
                          name={item.user?.name || item.user?.username}
                          size="xs"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-neutral-200 truncate group-hover:text-sky-300 transition-colors block">
                            {item.user?.name || item.user?.username || `Player ${idx + 1}`}
                          </span>
                          {item.user?.username && (
                            <span className="text-[10px] text-neutral-500 truncate block">
                              @{item.user?.username}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-300">
                        <span>{item.wpm}</span>
                        <span className="text-[10px] text-neutral-500">WPM</span>
                        {currentUser?.role === 'admin' && onAdminRemoveEntry && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAdminRemoveEntry(item);
                            }}
                            title="Admin: Remove from leaderboard"
                            className="ml-1 p-1 rounded hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Pinned User Row */}
              {currentUser ? (
                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-sky-500/15 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {userRank ? `#${userRank}` : '—'}
                      </span>
                      <Avatar
                        src={currentUser?.avatarUrl}
                        name={currentUser?.name || currentUser?.username}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {currentUser?.name || currentUser?.username || 'You'}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          {userRank ? `Rank #${userRank}` : 'Unranked'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs font-black text-sky-300">
                      <span>{isActive ? (wpm || 0) : (userBestScore?.wpm || (displayLeaderboard.find(l => l.user?._id === currentUser?._id)?.wpm) || (wpm || 0))}</span>
                      <span className="text-[10px] text-sky-400/80">WPM</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-neutral-800/80">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                    <span className="text-[11px] leading-tight font-medium">Guest mode · Sign in to appear on leaderboard</span>
                    <a
                      href="/login"
                      className="px-2 py-1 rounded-lg bg-amber-500 text-black font-bold text-[10px] shrink-0 hover:bg-amber-400 transition-colors"
                    >
                      Login
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
          ) : (
            /* Duels Sidebar Content */
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800/60">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  Pending Duels ({challenges?.incoming?.length || 0})
                </span>
                {onOpenChallengeModal && (
                  <button
                    type="button"
                    onClick={onOpenChallengeModal}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black cursor-pointer transition-colors shadow-xs"
                  >
                    + Challenge
                  </button>
                )}
              </div>

              {challenges?.incoming?.length === 0 ? (
                <div className="py-6 px-3 text-center rounded-2xl bg-black/30 border border-neutral-800/60 space-y-1.5">
                  <Swords className="w-6 h-6 text-neutral-600 mx-auto opacity-50 mb-1" />
                  <p className="text-xs font-bold text-neutral-300">No incoming duels</p>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Challenge someone from their profile or click "+ Challenge" to test their speed!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {challenges.incoming.map((ch) => (
                    <div
                      key={ch._id}
                      className="p-3 rounded-2xl bg-black/40 border border-amber-500/30 hover:border-amber-500/50 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            src={ch.challenger?.avatarUrl}
                            name={ch.challenger?.name}
                            size="xs"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {ch.challenger?.name}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              @{ch.challenger?.username}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                          {ch.challengerWpm} WPM ({ch.duration}s)
                        </span>
                      </div>

                      {ch.customMessage && (
                        <p className="text-[11px] text-neutral-300 italic line-clamp-1 bg-neutral-900/60 px-2 py-1 rounded-md">
                          "{ch.customMessage}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onAcceptChallenge && onAcceptChallenge(ch)}
                          className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Race Rival</span>
                        </button>
                        {onDeclineChallenge && (
                          <button
                            type="button"
                            onClick={() => onDeclineChallenge(ch._id)}
                            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Completed Duels */}
              {challenges?.history?.length > 0 && (
                <div className="pt-2 border-t border-neutral-800/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Recent Duels
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {challenges.history.slice(0, 5).map((h) => {
                      const isWinner = h.winner && currentUser && h.winner._id === currentUser._id;
                      return (
                        <div
                          key={h._id}
                          className="p-2 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{isWinner ? '🏆' : '⚔️'}</span>
                            <span className="text-neutral-300 text-[11px]">
                              vs @{h.challenger?._id === currentUser?._id ? h.challenged?.username : h.challenger?.username}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold font-mono ${isWinner ? 'text-amber-400' : 'text-neutral-400'}`}>
                            {isWinner ? 'VICTORY' : 'COMPLETED'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
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
