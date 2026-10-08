import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Target,
  Swords,
  Crown,
  User,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  X,
  ShieldCheck,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getSpeedTier } from '../../utils/typingEngine';
import {
  getResilientLeaderboard,
  removeLeaderboardEntryLocally,
  purgeAllDummyData,
} from '../../utils/typingStorage';

export const TypingLeaderboard = ({
  onChallengeGhost,
  currentSessionDuration,
  currentSessionMode,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [period, setPeriod] = useState('all'); // 'all' | 'weekly' | 'daily'
  const [selectedDuration, setSelectedDuration] = useState(currentSessionDuration || 'all');
  const [leaderboard, setLeaderboard] = useState(() => {
    const init = getResilientLeaderboard(currentSessionDuration || 'all', currentSessionMode || 'words', user);
    return init.leaderboard || [];
  });
  const [userRank, setUserRank] = useState(() => {
    const init = getResilientLeaderboard(currentSessionDuration || 'all', currentSessionMode || 'words', user);
    return init.userRank || null;
  });
  const [loading, setLoading] = useState(false);

  // Admin Moderation Modal State
  const [adminTargetEntry, setAdminTargetEntry] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (currentSessionDuration) {
      setSelectedDuration(currentSessionDuration);
    }
  }, [currentSessionDuration]);

  const fetchLeaderboard = async () => {
    const queryMode =
      currentSessionMode && currentSessionMode.startsWith('words')
        ? 'words'
        : currentSessionMode || 'words';

    // Instantly hydrate from local resilient storage first
    const localResilient = getResilientLeaderboard(
      selectedDuration,
      queryMode,
      user
    );
    setLeaderboard(localResilient.leaderboard);
    if (localResilient.userRank) {
      setUserRank(localResilient.userRank);
    }

    let remoteLeaderboard = null;
    try {
      const res = await api.get('/typing/leaderboard', {
        params: {
          period,
          duration: selectedDuration,
          mode: queryMode,
        },
      });
      remoteLeaderboard = res.data.leaderboard || [];
      if (res.data.userRank) {
        setUserRank(res.data.userRank);
      }
    } catch (err) {
      // Remote notice: fall back to resilient leaderboard
    }

    const resilient = getResilientLeaderboard(
      selectedDuration,
      queryMode,
      user,
      remoteLeaderboard
    );
    setLeaderboard(resilient.leaderboard);
    if (resilient.userRank) {
      setUserRank(resilient.userRank);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [period, selectedDuration, currentSessionMode, user]);

  // Instantly refresh when any score is saved or removed
  useEffect(() => {
    const handleScoreSaved = () => {
      fetchLeaderboard();
    };
    window.addEventListener('clearfeed:typingScoreSaved', handleScoreSaved);
    return () => window.removeEventListener('clearfeed:typingScoreSaved', handleScoreSaved);
  }, [selectedDuration, currentSessionMode, user]);

  // Admin: Open Moderation Dialog
  const handleOpenAdminModal = (entry, e) => {
    if (e) e.stopPropagation();
    setAdminTargetEntry(entry);
    setIsAdminModalOpen(true);
  };

  // Admin: Confirm Removal
  const handleConfirmRemove = async (purgeAllForUser = false) => {
    if (!adminTargetEntry) return;
    setIsDeleting(true);

    const entryId = adminTargetEntry._id;
    const targetUserId = adminTargetEntry.user?._id || adminTargetEntry.user?.id;
    const targetUsername = adminTargetEntry.user?.username || 'user';

    try {
      if (purgeAllForUser && targetUserId) {
        try {
          await api.delete(`/typing/leaderboard/user/${targetUserId}`);
        } catch (apiErr) {
          console.info('Remote purge notice (local fallback):', apiErr?.message);
        }
        removeLeaderboardEntryLocally(entryId, targetUserId, selectedDuration, currentSessionMode, targetUsername);
        showToast(
          `🛡️ Admin: Disqualified @${targetUsername} and purged all leaderboard scores permanently.`,
          'info'
        );
      } else {
        try {
          await api.delete(`/typing/leaderboard/${entryId}`);
        } catch (apiErr) {
          console.info('Remote delete notice (local fallback):', apiErr?.message);
        }
        removeLeaderboardEntryLocally(entryId, null, selectedDuration, currentSessionMode, targetUsername);
        showToast(
          `🛡️ Admin: Removed @${targetUsername}'s ${adminTargetEntry.wpm} WPM score permanently.`,
          'info'
        );
      }

      setIsAdminModalOpen(false);
      setAdminTargetEntry(null);
      fetchLeaderboard();
    } catch (err) {
      showToast(
        'Failed to remove score: ' + (err.response?.data?.message || err.message),
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="rounded-3xl bg-[#0e1116] border border-neutral-800 p-5 sm:p-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Speed Championship Leaderboard</span>
            </h3>
            {isAdmin && (
              <div className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  ADMIN MODERATION ACTIVE
                </span>
                <button
                  type="button"
                  onClick={() => {
                    purgeAllDummyData();
                    fetchLeaderboard();
                    showToast('🛡️ Admin: Scrubbed all dummy typists. Leaderboard is clean and ready for real racers!', 'success');
                  }}
                  title="Wipe any legacy dummy mock records"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Purge Dummy Data</span>
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time scoreboard of the fastest typists on Clearfeed (Genuine Racers Only)
          </p>
        </div>

        {/* Filter Controls: Durations & Period Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Duration Pills */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
            {[15, 30, 60, 120, 'all'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDuration(d)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedDuration === d
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {d === 'all' ? 'All Times' : `${d}s`}
              </button>
            ))}
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-neutral-800 text-xs">
            {[
              { id: 'all', label: '👑 All-Time' },
              { id: 'weekly', label: '🏆 Weekly' },
              { id: 'daily', label: '⚡ Daily' },
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
                const crownBg = [
                  'bg-amber-400/10 border-amber-400/30',
                  'bg-slate-300/10 border-slate-300/30',
                  'bg-amber-700/10 border-amber-700/30',
                ];
                const tier = getSpeedTier(entry.wpm);

                return (
                  <div
                    key={entry._id || idx}
                    className={`relative p-4 rounded-2xl border ${crownBg[idx]} text-center transition-all hover:scale-[1.02] group`}
                  >
                    <div className="absolute top-3 left-3 text-xs font-mono font-bold text-neutral-500">
                      #{idx + 1}
                    </div>

                    {/* Admin Direct Remove Button for Podium Cards */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenAdminModal(entry, e)}
                        title="Admin: Remove this score from leaderboard"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all cursor-pointer z-10 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

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
                    className={`flex items-center justify-between p-3 transition-colors group ${
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

                    <div className="flex items-center gap-3 font-mono">
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

                      {/* Admin Remove Button for List Rows */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenAdminModal(entry, e)}
                          title="Admin: Remove this score from leaderboard"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Admin Moderation Confirmation Modal */}
      {isAdminModalOpen && adminTargetEntry && (
        <Modal
          isOpen={isAdminModalOpen}
          onClose={() => !isDeleting && setIsAdminModalOpen(false)}
          title="Admin: Remove from Leaderboard"
        >
          <div className="font-sans space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Leaderboard Moderation Power</h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  As an Administrator, you have the authority to remove invalid or cheating
                  records and rebalance championship rankings.
                </p>
              </div>
            </div>

            {/* Target Entry Preview */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-3">
                <Avatar
                  src={adminTargetEntry.user?.avatarUrl}
                  name={adminTargetEntry.user?.name}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm">
                    {adminTargetEntry.user?.name || 'Anonymous User'}
                  </div>
                  <div className="text-xs text-neutral-400 font-mono">
                    @{adminTargetEntry.user?.username || 'user'}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-2xl font-extrabold text-amber-400">
                    {adminTargetEntry.wpm}{' '}
                    <span className="text-xs text-neutral-500 font-sans">WPM</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-sans">
                    {adminTargetEntry.accuracy}% accuracy · {adminTargetEntry.duration}s
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Choose an action below. Removing this score will recalculate rankings for all
              competitors on the leaderboard immediately.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleConfirmRemove(false)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove This Score Only</span>
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleConfirmRemove(true)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-rose-300 border border-neutral-700 hover:border-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Disqualify User (Purge All)</span>
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsAdminModalOpen(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TypingLeaderboard;
