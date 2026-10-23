import React, { useState, useEffect } from 'react';
import {
  Play,
  Zap,
  Trophy,
  Users,
  Gift,
  Flame,
  Star,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Share2,
  Gamepad2,
  Clock,
  Heart,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Check,
  ArrowRight,
  Award,
} from 'lucide-react';
import {
  CAR_CATALOG,
  getRacingProfile,
  getPlayerGarage,
  savePlayerGarage,
  getRacingMissions,
  claimMissionReward,
} from '../../../utils/racingStorage';
import { getResilientLeaderboard } from '../../../utils/typingStorage';
import racingAudio from '../../../utils/racingAudio';
import api from '../../../api/client';
import RaceInviteModal from './RaceInviteModal';

/**
 * Racing Dashboard Hub matching Reference Image 2:
 * - Hero banner ("TYPE. RACE. WIN." + PLAY NOW + Season Card)
 * - Mode selection cards (Racing, Arcade, Classic, Mood)
 * - Live Race Preview widget (Interactive highway simulation)
 * - My Garage card with stats (Speed, Handling, Acceleration, Nitro)
 * - Leaderboard (Global, Friends, Weekly)
 * - My Profile (Level, XP, Win Rate, Best WPM, Badges)
 * - Share Your Progress post generator
 * - Mood / Arcade Lab games (Typing Cricket, Word Rush, Snake, 2048)
 * - Daily & Weekly Missions with claim buttons
 * - Community Events Tournament Banner
 */
export const RacingDashboard = ({
  onStartRace = () => {},
  onSelectMode = () => {},
  onOpenArcadeGame = () => {},
  onOpenClassic = () => {},
  onSharePost = () => {},
  currentUser = null,
}) => {
  const [profile, setProfile] = useState(() => getRacingProfile(currentUser));
  const [garage, setGarage] = useState(() => getPlayerGarage(currentUser));
  const [missions, setMissions] = useState(() => getRacingMissions());
  const [modeFilter, setModeFilter] = useState('all');
  const [leaderboardTab, setLeaderboardTab] = useState('global');
  const [garageSubTab, setGarageSubTab] = useState('cars');
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [hasShared, setHasShared] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Live dynamic leaderboard state
  const [racingLeaderboard, setRacingLeaderboard] = useState(() => {
    const res = getResilientLeaderboard('all', 'words', currentUser);
    return res.leaderboard || [];
  });
  const [racingUserRank, setRacingUserRank] = useState(() => {
    const res = getResilientLeaderboard('all', 'words', currentUser);
    return res.userRank || 1;
  });

  // Sync profile & leaderboard when storage updates or tab changes
  useEffect(() => {
    const handleStatsUpdated = (e) => {
      if (e.detail) setProfile(e.detail);
    };
    const handleGarageUpdated = (e) => {
      if (e.detail) setGarage(e.detail);
    };
    const syncLb = async () => {
      let remote = null;
      try {
        const periodParam = leaderboardTab === 'weekly' ? 'weekly' : 'all';
        const res = await api.get('/typing/leaderboard', {
          params: { period: periodParam, duration: 'all', mode: 'all' },
        });
        if (res.data?.leaderboard) remote = res.data.leaderboard;
      } catch (_) {}
      const res = getResilientLeaderboard('all', 'words', currentUser, remote);
      setRacingLeaderboard(res.leaderboard || []);
      setRacingUserRank(res.userRank || 1);
    };

    syncLb();
    window.addEventListener('clearfeed:racingStatsUpdated', handleStatsUpdated);
    window.addEventListener('clearfeed:racingGarageUpdated', handleGarageUpdated);
    window.addEventListener('clearfeed:typingScoreSaved', syncLb);
    window.addEventListener('clearfeed:racingHistoryUpdated', syncLb);
    return () => {
      window.removeEventListener('clearfeed:racingStatsUpdated', handleStatsUpdated);
      window.removeEventListener('clearfeed:racingGarageUpdated', handleGarageUpdated);
      window.removeEventListener('clearfeed:typingScoreSaved', syncLb);
      window.removeEventListener('clearfeed:racingHistoryUpdated', syncLb);
    };
  }, [currentUser, leaderboardTab]);

  const selectedCar = CAR_CATALOG[selectedCarIndex] || CAR_CATALOG[0];

  const handleSelectCarInGarage = (car, index) => {
    setSelectedCarIndex(index);
    savePlayerGarage({ selectedCarId: car.id, paintColor: car.color });
    racingAudio.playKey(true);
  };

  const handleClaim = (missionId) => {
    const res = claimMissionReward(missionId);
    if (res.success) {
      setMissions(getRacingMissions());
      setProfile(res.profile);
      racingAudio.playVictory();
    }
  };

  const handleShareToSocialFeed = () => {
    onSharePost({
      text: `🏎️ New personal best! ${profile.bestWpm || 142} WPM in Typing Arena Racing Mode ⚡ #TypeRace #Speedster`,
      wpm: profile.bestWpm || 142,
      accuracy: 98.4,
      carName: selectedCar.name,
      carColor: selectedCar.color,
      position: 1,
    });
    setHasShared(true);
    racingAudio.playVictory();
    setTimeout(() => setHasShared(false), 3000);
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-100 select-none">
      {/* ========================================================
          1. HERO HEADER BANNER (Image 2 Top)
      ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-6 sm:p-8 lg:p-10 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                TYPE. RACE. WIN.
              </h1>
              <p className="mt-1 text-base sm:text-lg text-slate-300 font-medium tracking-wide">
                The world's most exciting real-time typing game
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-semibold text-cyan-300">
                <Zap size={14} className="text-cyan-400" />
                <span>Real-time Racing (Type to move)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-semibold text-purple-300">
                <Trophy size={14} className="text-purple-400" />
                <span>Global Leaderboard (Compete & climb)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-xs font-semibold text-amber-300">
                <Gift size={14} className="text-amber-400" />
                <span>Earn Rewards (Unlock cars & more)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => {
                  racingAudio.playNitro();
                  onStartRace();
                }}
                className="px-7 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(236,72,153,0.5)] active:scale-95 transition-all flex items-center gap-2.5"
              >
                <Play size={18} className="fill-white" />
                <span>PLAY NOW</span>
              </button>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-400/40 text-cyan-300 font-bold text-sm tracking-wide transition flex items-center gap-2 shadow-lg active:scale-95"
              >
                <Users size={18} />
                <span>INVITE RACERS</span>
              </button>

              <button
                onClick={onStartRace}
                className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 font-bold text-sm tracking-wide transition flex items-center gap-2"
              >
                <span>▶ PREVIEW</span>
              </button>
            </div>
          </div>

          {/* Right Hero Event Card (Neon City Season) */}
          <div className="w-full sm:w-72 p-4 rounded-2xl bg-slate-900/85 border border-purple-500/40 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-black text-[10px] uppercase border border-purple-500/30">
                NEW!
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Limited time</span>
            </div>

            <div className="my-3">
              <h3 className="text-base font-extrabold text-white">Neon City Season</h3>
              <p className="text-xs text-slate-400 mt-0.5">Climb ranks & claim the Shadow V12 skin</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-purple-300">Season Tier</span>
                <span className="text-white font-mono">3 / 10</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[30%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SELECT MODE & LIVE RACE PREVIEW (Image 2 Mid Section)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mode Selection Grid (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">Select Mode</h2>
              <p className="text-xs text-slate-400">Choose how you want to play</p>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              {['all', 'racing', 'arcade', 'classic'].map((f) => (
                <button
                  key={f}
                  onClick={() => setModeFilter(f)}
                  className={`px-3 py-1 rounded-lg capitalize font-bold transition ${
                    modeFilter === f ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Cards Grid (Image 2: Racing, Arcade, Classic, Mood) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* RACING */}
            <div
              onClick={() => {
                racingAudio.playNitro();
                onStartRace();
              }}
              className="group relative cursor-pointer rounded-2xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 p-4 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between shadow-lg shadow-cyan-950/20"
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <div className="my-4 flex justify-center">
                <img
                  src="/racing/shadow_v12.png"
                  alt="Racing"
                  className="w-20 h-11 object-cover rounded-lg shadow-md group-hover:scale-105 transition border border-purple-500/30"
                />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">RACING</h3>
                <p className="text-[11px] text-slate-400">Real-time multiplayer</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      racingAudio.playNitro();
                      onStartRace();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold text-xs transition"
                  >
                    PLAY
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsInviteModalOpen(true);
                    }}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
                    title="Invite to Race"
                  >
                    <Users size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* ARCADE */}
            <div
              onClick={() => onSelectMode('arcade')}
              className="group relative cursor-pointer rounded-2xl bg-slate-900/90 border border-fuchsia-500/40 hover:border-fuchsia-400 p-4 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 font-bold text-[10px] flex items-center gap-1">
                  <Flame size={10} />
                  Hot
                </span>
              </div>
              <div className="my-5 flex justify-center">
                <Gamepad2 size={32} className="text-fuchsia-400 group-hover:scale-110 transition" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">ARCADE</h3>
                <p className="text-[11px] text-slate-400">Fast & crazy rounds</p>
                <button className="mt-2 w-full py-1.5 rounded-lg bg-fuchsia-500/20 hover:bg-fuchsia-500 hover:text-white text-fuchsia-300 font-bold text-xs transition">
                  PLAY
                </button>
              </div>
            </div>

            {/* CLASSIC */}
            <div
              onClick={onOpenClassic}
              className="group relative cursor-pointer rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 p-4 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">Practice</span>
              </div>
              <div className="my-5 flex justify-center">
                <div className="w-12 h-8 border-2 border-slate-600 rounded-lg flex items-center justify-center font-mono text-xs text-slate-400">
                  ABC
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">CLASSIC</h3>
                <p className="text-[11px] text-slate-400">Focus & improve</p>
                <button className="mt-2 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition">
                  PLAY
                </button>
              </div>
            </div>

            {/* MOOD */}
            <div
              onClick={() => onSelectMode('mood')}
              className="group relative cursor-pointer rounded-2xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 p-4 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center gap-1">
                  <Sparkles size={10} />
                  New
                </span>
              </div>
              <div className="my-5 flex justify-center">
                <span className="text-2xl">🏏</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">MOOD</h3>
                <p className="text-[11px] text-slate-400">Relax & have fun</p>
                <button className="mt-2 w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-xs transition">
                  PLAY
                </button>
              </div>
            </div>
          </div>

          {/* Special Events Challenge Strip (Image 2) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Type 200 Letters Challenge</h3>
                <p className="text-xs text-slate-300">Win exclusive car skins & rewards!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-purple-300">
                Ends in 02d 14h 32m
              </span>
              <button
                onClick={onStartRace}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition"
              >
                JOIN
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Race Preview Simulation Widget (5 Columns) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-950 border border-cyan-500/40 p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
            <div>
              <span className="text-xs font-black text-white font-mono">RACE #4582</span>
              <span className="text-[11px] text-slate-400 ml-2">Neon City • Classic</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span className="text-cyan-400">4 / 6</span>
              <span>Racers</span>
            </div>
          </div>

          {/* Mini Highway Simulation Screen */}
          <div className="relative h-44 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-end p-3">
            <img
              src="/racing/track_neon_coast.jpg"
              alt="Track"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/40" />

            {/* Distant cars in perspective */}
            <div className="absolute top-8 left-1/4 flex items-center gap-1 z-10">
              <img src="/racing/street_phantom.jpg" alt="Alex" className="w-9 h-5 object-cover rounded shadow" />
              <span className="text-[9px] text-amber-300 font-bold drop-shadow">Alex</span>
            </div>
            <div className="absolute top-12 right-1/3 flex items-center gap-1 z-10">
              <img src="/racing/neon_gt.jpg" alt="Sophia" className="w-9 h-5 object-cover rounded shadow" />
              <span className="text-[9px] text-emerald-300 font-bold drop-shadow">Sophia</span>
            </div>

            {/* Foreground Player Car with NASIR plate */}
            <div className="relative mx-auto flex flex-col items-center z-10">
              <img
                src={selectedCar.image || '/racing/shadow_v12.jpg'}
                alt="NASIR"
                className="w-28 h-16 object-cover rounded-lg border border-purple-400/60 shadow-[0_0_20px_#a855f7]"
              />
            </div>

            {/* Mini HUD Speedometer Overlay */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/40 z-20">
              <span className="text-sm font-black text-white font-mono">178</span>
              <span className="text-[9px] text-cyan-400 font-bold">KM/H</span>
              <span className="text-[9px] text-purple-300 font-black">G5</span>
            </div>
          </div>

          {/* Interactive Typing Prompt Bar */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <div className="text-slate-300 truncate">
              <span className="text-emerald-400 font-bold">the quick brown fox</span> jumps over the lazy dog
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              <span>Progress</span>
              <span className="text-cyan-400 font-bold">84 / 200</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MY GARAGE + LEADERBOARD + MY PROFILE (Image 2 Mid-Bottom)
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Left: My Garage (4 Columns) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-black text-white">My Garage</h3>
                <p className="text-xs text-slate-400">Collect. Upgrade. Show off.</p>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                {['cars', 'skins', 'trails'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setGarageSubTab(tab)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      garageSubTab === tab ? 'text-cyan-400 bg-slate-800' : 'hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Car Preview Platform */}
            <div className="relative h-44 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/60 flex items-center justify-center overflow-hidden my-3">
              <div
                className="absolute w-48 h-48 rounded-full blur-2xl opacity-40"
                style={{ backgroundColor: selectedCar.color }}
              />
              <div className="relative flex flex-col items-center">
                <img
                  src={selectedCar.image || '/racing/shadow_v12.jpg'}
                  alt={selectedCar.name}
                  className="w-48 h-28 object-cover rounded-xl border border-white/20 shadow-2xl"
                />
                <div className="w-52 h-3 rounded-full bg-slate-800 border border-cyan-500/30 -mt-1.5 -z-10 shadow-lg" />
              </div>
            </div>

            {/* Car Name & Stats (Speed, Handling, Acceleration, Nitro) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white">{selectedCar.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  {selectedCar.tier}
                </span>
              </div>

              {/* Stat bars */}
              {[
                { label: 'Speed', val: selectedCar.stats.speed, color: 'from-cyan-500 to-sky-400' },
                { label: 'Handling', val: selectedCar.stats.handling, color: 'from-emerald-500 to-green-400' },
                { label: 'Acceleration', val: selectedCar.stats.acceleration, color: 'from-fuchsia-500 to-pink-400' },
                { label: 'Nitro', val: selectedCar.stats.nitro, color: 'from-amber-500 to-yellow-400' },
              ].map((st) => (
                <div key={st.label} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>{st.label}</span>
                    <span className="text-white font-mono">{st.val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${st.color} rounded-full transition-all`}
                      style={{ width: `${st.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Car Thumbnails Selector */}
          <div className="pt-4 mt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CAR_CATALOG.map((car, idx) => {
                const isCurrent = selectedCarIndex === idx;
                return (
                  <button
                    key={car.id}
                    onClick={() => handleSelectCarInGarage(car, idx)}
                    className={`flex-shrink-0 p-1 rounded-xl border flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'border-cyan-400 bg-slate-800 scale-105 shadow-[0_0_10px_#06b6d4]'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={car.image || '/racing/shadow_v12.jpg'}
                      alt={car.name}
                      className="w-12 h-7 object-cover rounded-md"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Leaderboard (4 Columns) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-white">Leaderboard</h3>

              {/* Tabs: Global, Friends, Weekly */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold">
                {['global', 'friends', 'weekly'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setLeaderboardTab(t)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      leaderboardTab === t ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Table List */}
            <div className="space-y-2 mt-4">
              {racingLeaderboard.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                  <Trophy className="w-6 h-6 mx-auto text-slate-600 mb-1 opacity-50" />
                  <p className="font-bold text-slate-400">No Racers Ranked Yet</p>
                  <p className="text-[11px] text-slate-500">Hit &quot;Start Highway Race&quot; above to set the record!</p>
                </div>
              ) : (
                racingLeaderboard.slice(0, 5).map((entry, idx) => {
                  const rank = idx + 1;
                  const isUser = entry.isCurrentUser;
                  return (
                    <div
                      key={entry._id || entry.id || rank}
                      className={`flex items-center justify-between p-2 rounded-xl border transition ${
                        isUser
                          ? 'bg-purple-950/60 border-purple-500/50 shadow-md'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`text-xs font-black w-4 text-center ${
                            rank === 1
                              ? 'text-amber-400'
                              : rank === 2
                              ? 'text-purple-300'
                              : rank === 3
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {rank}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {entry.user?.name || entry.name || (isUser ? 'You' : 'Racer')}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                        <span className="text-cyan-400 font-black">{entry.wpm} WPM</span>
                        <span className="text-slate-400">{entry.accuracy || 100}%</span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Current User Row (if outside top 5 and has played) */}
              {racingUserRank > 5 && (profile.bestWpm > 0 || profile.totalRaces > 0) && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/50 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-purple-300 w-4 text-center">
                      {racingUserRank}
                    </span>
                    <span className="text-xs font-extrabold text-white">You</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-cyan-300 font-black">{profile.bestWpm || 100} WPM</span>
                    <span className="text-purple-300">{profile.winRate || 50}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <button
              onClick={onStartRace}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
            >
              Race to climb ranks →
            </button>
          </div>
        </div>

        {/* Right: My Profile & Share Progress (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* My Profile Card (Image 2) */}
          <div className="rounded-3xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">My Profile</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs border border-cyan-500/30">
                Lv. {profile.level}
              </span>
            </div>

            {/* Profile Avatar & XP Progress */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-lg text-white shadow-lg">
                {(currentUser?.name || currentUser?.username || 'N')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-white font-extrabold">
                    {currentUser?.name || currentUser?.username || 'Nasir'}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {profile.xp} / {profile.nextLevelXp} XP
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full"
                    style={{ width: `${Math.min(100, (profile.xp / profile.nextLevelXp) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block">Total Races</span>
                <span className="text-sm font-black text-white font-mono">{profile.totalRaces}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block">Win Rate</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{profile.winRate}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block">Best WPM</span>
                <span className="text-sm font-black text-cyan-400 font-mono">{profile.bestWpm}</span>
              </div>
            </div>

            {/* Recent Achievements badges */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2">Recent Achievements</span>
              <div className="flex items-center gap-2">
                {profile.recentAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex-1 p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center"
                    title={ach.title}
                  >
                    <span className="text-lg">{ach.icon}</span>
                    <span className="text-[9px] font-bold text-slate-300 truncate w-full mt-1">
                      {ach.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share Your Progress Card (Connects to Clearfeed Feed!) */}
          <div className="rounded-3xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">Share Your Progress</h3>
              <span className="text-xs text-cyan-400 font-bold">Social Feed</span>
            </div>

            {/* Preview Post */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">
                  {currentUser?.name || 'Nasir'}
                </span>
                <span className="text-[10px] text-slate-500">Just now</span>
              </div>
              <p className="text-slate-300">
                New personal best! 🏎️ <strong className="text-cyan-400">{profile.bestWpm} WPM</strong> in Racing Mode ⚡
              </p>
              <div className="h-16 rounded-xl bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/30 flex items-center justify-between px-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedCar.image || '/racing/shadow_v12.jpg'}
                    alt={selectedCar.name}
                    className="w-12 h-7 object-cover rounded-md border border-white/20 shadow-md"
                  />
                  <span className="font-bold text-white text-xs">{selectedCar.name}</span>
                </div>
                <span className="text-xs font-black text-amber-400 font-mono">1st Place 🏆</span>
              </div>
            </div>

            <button
              onClick={handleShareToSocialFeed}
              disabled={hasShared}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                hasShared
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/40'
              }`}
            >
              {hasShared ? (
                <>
                  <Check size={14} />
                  <span>Shared to Clearfeed Feed!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share to Clearfeed Feed</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MOOD / ARCADE LAB + MISSIONS + COMMUNITY (Image 2 Bottom)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mood / Arcade Mini Games (5 Columns) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Mood / Arcade Lab</h3>
              <p className="text-xs text-slate-400">Take a break. Play something fun.</p>
            </div>
            <span className="text-xs text-amber-400 font-bold">5 Games</span>
          </div>

          {/* Mini Games Carousel / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'cricket', name: 'Typing Cricket', icon: '🏏', desc: 'Type to score boundaries', color: 'from-emerald-950 to-slate-900' },
              { id: 'word_rush', name: 'Word Rush', icon: '🔤', desc: 'Falling rapid words', color: 'from-blue-950 to-slate-900' },
              { id: 'snake', name: 'Snake Typing', icon: '🐍', desc: 'Guide the cyber snake', color: 'from-green-950 to-slate-900' },
              { id: '2048', name: '2048 Typing', icon: '🔢', desc: 'Merge number tiles', color: 'from-amber-950 to-slate-900' },
              { id: 'fruit', name: 'Fruit Slicer', icon: '🍉', desc: 'Slice typed fruits', color: 'from-rose-950 to-slate-900' },
            ].map((game) => (
              <div
                key={game.id}
                onClick={() => onOpenArcadeGame(game.id)}
                className={`cursor-pointer p-3 rounded-2xl bg-gradient-to-b ${game.color} border border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-105 flex flex-col justify-between`}
              >
                <span className="text-2xl">{game.icon}</span>
                <div className="mt-2">
                  <h4 className="text-xs font-extrabold text-white">{game.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{game.desc}</p>
                </div>
                <button className="mt-2 w-full py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold text-[10px] transition">
                  Play Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Missions (4 Columns) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-950/90 border border-slate-800/80 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Missions</h3>
              <p className="text-xs text-slate-400">Complete tasks. Earn rewards.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
              Daily
            </span>
          </div>

          {/* Daily Missions List */}
          <div className="space-y-2">
            {missions.daily.map((m) => {
              const isReady = m.progress >= m.target;
              return (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <span className="font-bold text-white block">{m.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.progress}/{m.target}
                      </span>
                    </div>
                  </div>

                  {m.claimed ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(m.id)}
                      disabled={!isReady}
                      className={`px-3 py-1 rounded-lg font-bold text-[10px] transition ${
                        isReady
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black animate-bounce'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      +{m.rewardCoins} 🪙
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Events Tournament Banner (3 Columns) */}
        <div className="lg:col-span-3 rounded-3xl bg-gradient-to-b from-indigo-950/80 to-slate-950 border border-indigo-500/40 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                Community Events
              </span>
              <span className="text-[10px] text-slate-400 font-bold">View All</span>
            </div>

            <h4 className="text-base font-black text-white">Typing Tournament</h4>
            <p className="text-xs text-slate-300 mt-1">
              Top 100 get exclusive skins! <br />
              <strong className="text-amber-300 font-mono">Ends in 2d 14h 32m</strong>
            </p>

            {/* Top Racers This Week */}
            <div className="mt-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Top This Week</span>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-amber-300">1. Alex</span>
                <span className="font-mono text-slate-300">2,341 pts</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-slate-300">2. Sophia</span>
                <span className="font-mono text-slate-300">2,198 pts</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-slate-400">3. Rohan</span>
                <span className="font-mono text-slate-300">1,987 pts</span>
              </div>
            </div>
          </div>

          <button
            onClick={onStartRace}
            className="w-full mt-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-lg shadow-indigo-950/40"
          >
            ENTER TOURNAMENT
          </button>
        </div>
      </div>

      {/* Race Invite Modal */}
      <RaceInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onStartDuelWithRacer={(racer) => {
          setIsInviteModalOpen(false);
          onStartRace(racer);
        }}
        selectedCar={selectedCar}
      />
    </div>
  );
};

export default RacingDashboard;
