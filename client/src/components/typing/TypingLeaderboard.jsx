import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Flame, Target, Swords, Crown, User, ShieldAlert } from 'lucide-react';
import Avatar from '../common/Avatar';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getSpeedTier } from '../../utils/typingEngine';

export const TypingLeaderboard = ({ onChallengeGhost, currentSessionDuration, currentSessionMode }) => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekly'); // 'weekly' | 'daily' | 'all'
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/typing/leaderboard', {
        params: {
          period,
          duration: currentSessionDuration || 60,
          mode: currentSessionMode || 'words_200',
        },
      });
      setLeaderboard(res.data.leaderboard || []);
      setUserRank(res.data.userRank || null);
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period, currentSessionDuration, currentSessionMode]);

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="rounded-3xl bg-[#0e1116] border border-neutral-800 p-5 sm:p-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Speed Championship Leaderboard</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time scoreboard of the fastest typists on Clearfeed
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-neutral-800 text-xs">
          {[
            { id: 'weekly', label: '🏆 Weekly Contest' },
            { id: 'daily', label: '⚡ Daily Sprint' },
            { id: 'all', label: '👑 All-Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                period === tab.id
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
          <div className="w-8 h-8 mx-auto border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
          <p>Loading fastest typists...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-500">
          <Trophy className="w-8 h-8 mx-auto text-neutral-600 mb-2 opacity-50" />
          <p>No recorded scores yet for this period. Be the first to set the record!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 Podium (when available) */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {top3.map((entry, idx) => {
                const crowns = ['text-amber-400', 'text-slate-300', 'text-amber-700'];
                const crownBg = ['bg-amber-400/10 border-amber-400/30', 'bg-slate-300/10 border-slate-300/30', 'bg-amber-700/10 border-amber-700/30'];
                const rankLabels = ['1st Place', '2nd Place', '3rd Place'];
                const tier = getSpeedTier(entry.wpm);

                return (
                  <div
                    key={entry._id || idx}
                    className={`relative p-4 rounded-2xl border ${crownBg[idx]} text-center transition-all hover:scale-[1.02]`}
                  >
                    <div className="absolute top-3 left-3 text-xs font-mono font-bold text-neutral-500">
                      #{idx + 1}
                    </div>

                    <div className="relative inline-block mx-auto mb-2">
                      <Avatar
                        src={entry.user?.avatarUrl}
                        name={entry.user?.name}
                        size="md"
                      />
                      <Crown className={`w-4 h-4 absolute -top-2.5 -right-1 ${crowns[idx]}`} />
                    </div>

                    <NavLink
                      to={`/profile/${entry.user?.username}`}
                      className="block font-bold text-sm text-neutral-100 hover:underline truncate"
                    >
                      {entry.user?.name}
                    </NavLink>
                    <div className="text-[11px] text-neutral-400 mb-2 truncate">
                      @{entry.user?.username}
                    </div>

                    <div className="flex items-baseline justify-center gap-1 font-mono">
                      <span className="text-2xl font-extrabold text-white">{entry.wpm}</span>
                      <span className="text-xs text-neutral-500 font-sans">WPM</span>
                    </div>

                    <div className="text-[10px] text-neutral-400 font-mono mt-1">
                      {entry.accuracy}% acc · {entry.highestCombo}x streak
                    </div>

                    {onChallengeGhost && entry.user?._id !== user?._id && (
                      <button
                        type="button"
                        onClick={() => onChallengeGhost(entry)}
                        className="mt-3 w-full py-1.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Race Ghost</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Remaining Ranks List */}
          {remaining.length > 0 && (
            <div className="divide-y divide-neutral-800/60 rounded-2xl bg-black/40 border border-neutral-800/80 overflow-hidden text-xs">
              {remaining.map((entry, idx) => {
                const rankNum = idx + 4;
                const isMe = user && entry.user?._id === user._id;

                return (
                  <div
                    key={entry._id || rankNum}
                    className={`flex items-center justify-between p-3 transition-colors ${
                      isMe ? 'bg-sky-500/10' : 'hover:bg-neutral-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center font-mono font-bold text-neutral-500">
                        #{rankNum}
                      </span>
                      <Avatar
                        src={entry.user?.avatarUrl}
                        name={entry.user?.name}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <NavLink
                          to={`/profile/${entry.user?.username}`}
                          className="font-bold text-neutral-200 hover:underline truncate block"
                        >
                          {entry.user?.name}
                        </NavLink>
                        <span className="text-[11px] text-neutral-500 truncate block">
                          @{entry.user?.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <div className="text-right">
                        <span className="font-extrabold text-white text-sm">{entry.wpm}</span>
                        <span className="text-[10px] text-neutral-500 ml-1 font-sans">WPM</span>
                        <div className="text-[10px] text-neutral-400 font-sans">
                          {entry.accuracy}% acc
                        </div>
                      </div>

                      {onChallengeGhost && entry.user?._id !== user?._id && (
                        <button
                          type="button"
                          onClick={() => onChallengeGhost(entry)}
                          title={`Race against ${entry.user?.name}'s ghost`}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sky-400 transition-colors cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Current User Rank Bar */}
          {user && (
            <div className="mt-4 p-3 rounded-2xl bg-neutral-900 border border-sky-500/30 flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-2">
                <Avatar src={user.avatarUrl} name={user.name} size="xs" />
                <span className="font-semibold text-neutral-200">
                  Your Standing:{' '}
                  {userRank ? (
                    <span className="text-sky-400 font-mono font-bold">#{userRank}</span>
                  ) : (
                    <span className="text-neutral-500">Unranked this round</span>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Complete a test to improve your rank
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TypingLeaderboard;
