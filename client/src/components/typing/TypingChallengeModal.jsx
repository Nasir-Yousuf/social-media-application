import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Zap, Clock, Send, Target, Search, Check, Sparkles, User } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { saveLocalChallenge } from '../../utils/typingStorage';

export default function TypingChallengeModal({
  isOpen,
  onClose,
  targetUser: initialTargetUser = null,
  initialWpm = null,
  initialAccuracy = null,
  initialRawWpm = null,
  initialTelemetry = [],
  initialWords = [],
  initialDuration = 15,
  initialMode = 'words_200',
}) {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState(initialTargetUser);
  const [directoryMembers, setDirectoryMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [duration, setDuration] = useState(initialDuration || 15);
  const [mode, setMode] = useState(initialMode || 'words_200');
  const [customMessage, setCustomMessage] = useState('Think you can beat my typing speed? Let\'s see what you\'ve got! ⚡');
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [challengerOption, setChallengerOption] = useState(initialWpm != null ? 'result' : 'my_best');
  const [myProfileStats, setMyProfileStats] = useState(null);

  // Sync initialTargetUser if props change
  useEffect(() => {
    if (initialTargetUser) {
      setSelectedUser(initialTargetUser);
    }
  }, [initialTargetUser]);

  // Fetch current user's typing stats and directory members if no targetUser
  useEffect(() => {
    if (!isOpen) return;

    if (!initialTargetUser && directoryMembers.length === 0) {
      setFetchingMembers(true);
      api.get('/users/directory')
        .then((res) => {
          const list = (res.data.members || []).filter(
            (m) => m._id !== currentUser?._id && m.username !== currentUser?.username
          );
          setDirectoryMembers(list);
        })
        .catch((err) => console.warn('Could not load member directory:', err))
        .finally(() => setFetchingMembers(false));
    }

    if (currentUser?.username) {
      api.get(`/typing/profile/${currentUser.username}`)
        .then((res) => {
          setMyProfileStats(res.data.profile);
        })
        .catch(() => {});
    }
  }, [isOpen, initialTargetUser, currentUser, directoryMembers.length]);

  const filteredMembers = directoryMembers.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.username?.toLowerCase().includes(term)
    );
  });

  const handleSendChallenge = async () => {
    if (!selectedUser) {
      showToast('Please select a member to challenge.', 'warning');
      return;
    }

    setLoading(true);
    try {
      let challengerWpm = 0;
      let challengerAccuracy = 100;
      let challengerRawWpm = 0;
      let challengerTelemetry = [];

      if (initialWpm != null) {
        challengerWpm = initialWpm;
        challengerAccuracy = initialAccuracy || 100;
        challengerRawWpm = initialRawWpm || initialWpm;
        challengerTelemetry = initialTelemetry || [];
      } else if (challengerOption === 'my_best' && myProfileStats?.bestWpm) {
        challengerWpm = myProfileStats.bestWpm;
        challengerAccuracy = myProfileStats.bestAccuracy || 100;
        challengerRawWpm = myProfileStats.bestWpm;
      }

      const payload = {
        challengedUserId: selectedUser._id,
        challengedUsername: selectedUser.username,
        targetUserId: selectedUser._id,
        targetUsername: selectedUser.username,
        targetName: selectedUser.name,
        targetAvatarUrl: selectedUser.avatarUrl,
        challengerWpm,
        challengerAccuracy,
        challengerRawWpm,
        challengerTelemetry,
        duration: Number(duration),
        mode: mode === 'words_200' ? 'race_highway' : mode,
        isRace: true,
        carId: 'street_phantom',
        carName: 'Street Phantom',
        words: initialWords && initialWords.length > 0 ? initialWords : undefined,
        customMessage: customMessage.trim() || undefined,
      };

      // 1. Immediately create local challenge (offline-first & resilient)
      const localChallenge = saveLocalChallenge(payload, currentUser);
      let createdChallenge = localChallenge;

      // 2. Attempt remote sync with server
      try {
        const res = await api.post('/typing/challenges', payload);
        if (res.data?.challenge) {
          createdChallenge = res.data.challenge;
          saveLocalChallenge(createdChallenge, currentUser);
        }
      } catch (remoteErr) {
        console.warn('Remote challenge sync note:', remoteErr?.response?.data?.message || remoteErr?.message);
        const serverMsg = remoteErr?.response?.data?.message;
        if (serverMsg) {
          showToast(`⚠️ Server note: ${serverMsg}`, 'warning');
        }
      }

      // 3. Broadcast across tabs/windows
      window.dispatchEvent(
        new CustomEvent('clearfeed:typingChallengesUpdated', { detail: createdChallenge })
      );
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('clearfeed_challenges_channel');
          bc.postMessage({
            type: 'CHALLENGE_CREATED',
            challenge: createdChallenge,
            targetUserId: selectedUser._id,
            targetUsername: selectedUser.username,
          });
          setTimeout(() => bc.close(), 1000);
        }
      } catch {}

      showToast(`🏎️⚡ Highway Race Challenge sent to @${selectedUser.username}! Duel is live and ready.`, 'success');
      onClose();

      // If user chose to race right now to set benchmark
      if (challengerOption === 'race_now' || (initialWpm == null && challengerWpm === 0)) {
        navigate(`/typing?theme=race&duelWith=${selectedUser.username}&car=street_phantom&challengeId=${createdChallenge._id}`);
      }

    } catch (err) {
      console.error('Challenge error:', err);
      showToast('Failed to issue typing challenge. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚔️ Issue a 1v1 Typing Duel"
      size="md"
    >
      <div className="space-y-5 text-neutral-800 dark:text-neutral-200">
        {/* Opponent Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            Challenging Rival
          </label>

          {selectedUser ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedUser.avatarUrl}
                  name={selectedUser.name}
                  size="md"
                />
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {selectedUser.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                      RIVAL
                    </span>
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    @{selectedUser.username}
                  </p>
                </div>
              </div>
              {!initialTargetUser && (
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search classmate or friend..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                {fetchingMembers ? (
                  <div className="p-4 text-center text-xs text-neutral-400">Loading members...</div>
                ) : filteredMembers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-400">No members found</div>
                ) : (
                  filteredMembers.slice(0, 10).map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => setSelectedUser(m)}
                      className="w-full p-2.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar src={m.avatarUrl} name={m.name} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white">{m.name}</p>
                          <p className="text-[10px] text-neutral-500">@{m.username}</p>
                        </div>
                      </div>
                      <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                        Select
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Challenge Benchmark Score / Options */}
        {initialWpm != null ? (
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Your Benchmark Target</p>
                <p className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">
                  {initialWpm} <span className="text-xs font-bold text-amber-500">WPM</span>
                  <span className="text-xs text-neutral-500 font-normal ml-2">({initialAccuracy || 100}% ACC)</span>
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-500">
              {duration}s Mode
            </span>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Challenger Benchmark
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChallengerOption('my_best')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  challengerOption === 'my_best'
                    ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Use Personal Best</span>
                  {challengerOption === 'my_best' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-base font-black text-amber-500">
                  {myProfileStats?.bestWpm || 0} <span className="text-[10px] text-neutral-400">WPM</span>
                </p>
              </button>

              <button
                type="button"
                onClick={() => setChallengerOption('race_now')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  challengerOption === 'race_now'
                    ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Race Arena Live</span>
                  {challengerOption === 'race_now' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-xs text-neutral-500">
                  Type fresh run right now
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Duration & Mode */}
        {initialWpm == null && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[15, 30, 60].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      duration === dur
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Vocabulary
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full py-2 px-2.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white cursor-pointer"
              >
                <option value="words_200">English Top 200</option>
                <option value="words_1000">English Top 1000</option>
                <option value="code">Code & Syntax</option>
              </select>
            </div>
          </div>
        )}

        {/* Custom Trash Talk / Friendly Message */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            Duel Note / Taunt
          </label>
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="e.g. Try to keep up with my fingers!"
            maxLength={140}
            className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
          />
        </div>

        {/* Duel Rewards Info */}
        <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 text-sky-500" />
          <span>
            <strong>Fair Duel:</strong> Both racers type the exact same generated word set. Winner claims <strong>+150 XP</strong> and duel victory badge.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSendChallenge}
            isLoading={loading}
            disabled={!selectedUser || loading}
            className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold flex items-center gap-1.5 px-4"
          >
            <Swords className="w-4 h-4" />
            <span>
              {challengerOption === 'race_now' ? 'Start Live Race' : 'Send Duel Challenge'}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
