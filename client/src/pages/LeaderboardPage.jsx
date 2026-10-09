import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Trophy,
  Zap,
  Flame,
  Crown,
  Car,
  Keyboard,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import TypingLeaderboard from '../components/typing/TypingLeaderboard';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getLocalTypingProfile } from '../utils/typingStorage';

export const LeaderboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    topWpm: 0,
    topUser: null,
    totalRacers: 0,
    contestWeek: '',
  });

  const localProfile = getLocalTypingProfile();

  useEffect(() => {
    document.title = 'Global Speed Championship Leaderboard — Clearfeed';

    const loadStats = async () => {
      try {
        const res = await api.get('/typing/leaderboard', {
          params: { period: 'all', duration: 'all', mode: 'all' },
        });
        if (res.data?.leaderboard && res.data.leaderboard.length > 0) {
          const leader = res.data.leaderboard[0];
          setStats({
            topWpm: leader.wpm || 0,
            topUser: leader.user || null,
            totalRacers: res.data.totalEntries || res.data.leaderboard.length,
            contestWeek: res.data.contestWeek || '',
          });
        }
      } catch (_) {}
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero Banner matching Clearfeed aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-[#0e1116] to-black border border-neutral-800/80 p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              <Crown className="w-3.5 h-3.5" />
              <span>OFFICIAL MONGODB SPEED LADDER</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Global Speed <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">Championship</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Every keystroke counts. Push your typing speed to the limit in Typing Arena, Code Practice, or Highway Racing. Higher speeds push you straight up the ladder to the championship crown!
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <NavLink
                to="/typing"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Enter Typing Arena</span>
              </NavLink>

              <NavLink
                to="/typing?theme=race"
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <Car className="w-4 h-4 text-cyan-400" />
                <span>Multiplayer Race</span>
              </NavLink>

              <NavLink
                to="/code-practice"
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <Keyboard className="w-4 h-4 text-purple-400" />
                <span>Code Practice</span>
              </NavLink>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:w-80 shrink-0">
            <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 backdrop-blur-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Top Speed</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.topWpm || 100}
                </span>
                <span className="text-xs text-neutral-400 ml-1">WPM</span>
              </div>
              <span className="text-[10px] text-neutral-500 truncate mt-1">
                {stats.topUser ? `@${stats.topUser.username}` : 'World Record'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 backdrop-blur-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Your Best</span>
                <Zap className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                  {localProfile.bestWpm || 0}
                </span>
                <span className="text-xs text-neutral-400 ml-1">WPM</span>
              </div>
              <span className="text-[10px] text-neutral-500 truncate mt-1">
                {localProfile.testsCompleted || 0} tests finished
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 backdrop-blur-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Competitors</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {stats.totalRacers || '10+'}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 truncate mt-1">
                Ranked in MongoDB
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-neutral-800 backdrop-blur-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Status</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-purple-300">
                  Active Season
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 truncate mt-1">
                {stats.contestWeek || 'Live 2026'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Interactive Table */}
      <div className="relative">
        <TypingLeaderboard
          title="Live Championship Rankings"
          showFullControls={true}
          currentSessionDuration="all"
          currentSessionMode="all"
        />
      </div>
    </div>
  );
};

export default LeaderboardPage;
