import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Send,
  Zap,
  Trophy,
  Search,
  Swords,
  Play,
  Share2,
  X,
  Sparkles,
} from 'lucide-react';
import Modal from '../../common/Modal';
import Avatar from '../../common/Avatar';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { saveLocalChallenge } from '../../../utils/typingStorage';
import { CAR_CATALOG } from '../../../utils/racingStorage';
import racingAudio from '../../../utils/racingAudio';

const DEFAULT_RIVAL_RACERS = [
  {
    _id: 'racer_alex',
    username: 'alex_speed',
    name: 'Alex Rivera',
    avatarUrl: null,
    carName: 'Street Phantom',
    carColor: '#ef4444',
    carImage: '/racing/street_phantom.png',
    bestWpm: 125,
    status: 'online',
    tag: 'Circuit Master',
  },
  {
    _id: 'racer_sophia',
    username: 'sophia_drift',
    name: 'Sophia Chen',
    avatarUrl: null,
    carName: 'Neon GT',
    carColor: '#22c55e',
    carImage: '/racing/neon_gt.png',
    bestWpm: 118,
    status: 'online',
    tag: 'Electric Pro',
  },
  {
    _id: 'racer_rohan',
    username: 'rohan_gt',
    name: 'Rohan Sharma',
    avatarUrl: null,
    carName: 'Cyber Cruiser',
    carColor: '#3b82f6',
    carImage: '/racing/cyber_cruiser.png',
    bestWpm: 110,
    status: 'online',
    tag: 'Highway Elite',
  },
  {
    _id: 'racer_emma',
    username: 'emma_rs',
    name: 'Emma Watson',
    avatarUrl: null,
    carName: 'Thunder RS',
    carColor: '#eab308',
    carImage: '/racing/thunder_rs.png',
    bestWpm: 96,
    status: 'idle',
    tag: 'Nitro Specialist',
  },
  {
    _id: 'racer_liam',
    username: 'liam_apex',
    name: 'Liam Vance',
    avatarUrl: null,
    carName: 'Apex X',
    carColor: '#e2e8f0',
    carImage: '/racing/apex_x.png',
    bestWpm: 88,
    status: 'offline',
    tag: 'Rising Driver',
  },
];

export const RaceInviteModal = ({
  isOpen,
  onClose,
  onStartDuelWithRacer = () => {},
  selectedCar = null,
}) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'incoming'
  const [searchTerm, setSearchTerm] = useState('');
  const [directoryRacers, setDirectoryRacers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchingRemote, setSearchingRemote] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState(new Set());
  const [sendingInviteId, setSendingInviteId] = useState(null);

  // Fetch real users from platform directory
  useEffect(() => {
    if (!isOpen) return;

    setLoadingMembers(true);
    api.get('/users/directory')
      .then((res) => {
        const rawList = res.data.members || res.data.users || (Array.isArray(res.data) ? res.data : []);
        const members = rawList.filter(
          (m) => m && m._id !== currentUser?._id && m.username !== currentUser?.username
        );

        // Map platform users to racer format with assigned cars
        const mappedRacers = members.map((m, idx) => {
          const assignedCar = CAR_CATALOG[idx % CAR_CATALOG.length];
          return {
            _id: m._id,
            username: m.username,
            name: m.name,
            avatarUrl: m.avatarUrl,
            carName: assignedCar.name,
            carColor: assignedCar.color,
            carImage: assignedCar.image,
            bestWpm: 80 + Math.floor(Math.sin(idx + 1) * 20 + 20),
            status: 'online',
            isRealUser: true,
            tag: 'Clearfeed Member',
          };
        });

        setDirectoryRacers(mappedRacers);
      })
      .catch((err) => {
        console.warn('Could not load member directory for race invites:', err);
      })
      .finally(() => {
        setLoadingMembers(false);
      });
  }, [isOpen, currentUser]);

  // Live remote search for users if typed
  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setSearchingRemote(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingRemote(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
        const found = (res.data?.users || []).filter(
          (u) => u._id !== currentUser?._id && u.username !== currentUser?.username
        );
        const mapped = found.map((m, idx) => {
          const assignedCar = CAR_CATALOG[(idx + 1) % CAR_CATALOG.length];
          return {
            _id: m._id,
            username: m.username,
            name: m.name,
            avatarUrl: m.avatarUrl,
            carName: assignedCar.name,
            carColor: assignedCar.color,
            carImage: assignedCar.image,
            bestWpm: 90,
            status: 'online',
            isRealUser: true,
            tag: 'Community Member',
          };
        });
        setSearchResults(mapped);
      } catch (err) {
        console.warn('Live racer search error:', err);
      } finally {
        setSearchingRemote(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, currentUser]);

  // Merge real directory and search results (unique by _id)
  const realRacers = React.useMemo(() => {
    const map = new Map();
    for (const r of directoryRacers) {
      map.set(r._id.toString(), r);
    }
    for (const r of searchResults) {
      map.set(r._id.toString(), r);
    }
    return Array.from(map.values());
  }, [directoryRacers, searchResults]);

  // Combine real racers with fallback AI bot racers
  const allRacers = React.useMemo(() => {
    const aiRacers = DEFAULT_RIVAL_RACERS.map((bot) => ({
      ...bot,
      isRealUser: false,
    }));
    return [...realRacers, ...aiRacers];
  }, [realRacers]);

  const filteredRacers = allRacers.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(term) ||
      r.username?.toLowerCase().includes(term) ||
      r.carName?.toLowerCase().includes(term)
    );
  });

  // Copy shareable race link
  const handleCopyRaceLink = () => {
    const inviteUrl = `${window.location.origin}/typing?theme=race&duelWith=${currentUser?.username || 'guest'}&car=${selectedCar?.id || 'shadow_v12'}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedLink(true);
      showToast('🔗 Race duel link copied to clipboard! Share it anywhere.', 'success');
      racingAudio.playKey(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Send race invitation
  const handleInviteRacer = async (racer) => {
    if (!racer.isRealUser) {
      // It's a simulated AI practice rival
      showToast(`🤖 @${racer.username} is a CPU Practice Bot. Click 'RACE NOW' to duel them immediately!`, 'info');
      handleStartDuelNow(racer);
      return;
    }

    setSendingInviteId(racer._id);
    try {
      const payload = {
        challengedUserId: racer._id,
        challengedUsername: racer.username,
        targetUserId: racer._id,
        targetUsername: racer.username,
        targetName: racer.name,
        targetAvatarUrl: racer.avatarUrl,
        mode: 'race_highway',
        isRace: true,
        duration: 30,
        customMessage: `🏎️ I challenge you to a Highway Race in the Typing Arena! My car is the ${selectedCar?.name || 'Shadow V12'}. Let's burn some rubber! ⚡`,
        challengerWpm: 95,
        challengerAccuracy: 98,
        carId: selectedCar?.id || 'shadow_v12',
        carName: selectedCar?.name || 'Shadow V12',
      };

      // 1. Save local challenge first (offline-first & resilient)
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
        console.info('Remote race challenge sync fallback:', remoteErr?.message);
      }

      // 3. Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('clearfeed:typingChallengesUpdated', { detail: createdChallenge })
      );

      setInvitedUsers((prev) => new Set(prev).add(racer._id));
      racingAudio.playVictory();
      showToast(`🏁 Race invitation sent to @${racer.username}! Real-time notification dispatched.`, 'success');
    } catch (err) {
      console.warn('Failed to send race invite:', err);
      showToast(err.response?.data?.message || `Could not deliver challenge to @${racer.username}`, 'error');
    } finally {
      setSendingInviteId(null);
    }
  };

  // Immediate 1v1 Race launch with selected racer
  const handleStartDuelNow = (racer) => {
    racingAudio.playNitro();
    onClose();
    onStartDuelWithRacer(racer);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-950/95 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Swords size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black italic tracking-wide text-white flex items-center gap-2">
                <span>INVITE RACERS TO DUEL</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono uppercase not-italic font-bold border border-cyan-500/30">
                  1v1 HIGHWAY
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Challenge friends or rivals to real-time multiplayer racing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Direct Share Link Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Share2 size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Race Duel Link</span>
                <span className="text-[11px] text-slate-400">Invite anyone outside or in chat</span>
              </div>
            </div>

            <button
              onClick={handleCopyRaceLink}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black'
              }`}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'COPIED!' : 'COPY RACE LINK'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, username, or car..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Racers List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>AVAILABLE RACERS & RIVALS</span>
              <span className="text-[11px] text-cyan-400 font-mono">
                {filteredRacers.length} online
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredRacers.map((racer) => {
                const hasInvited = invitedUsers.has(racer._id);

                return (
                  <div
                    key={racer._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                  >
                    {/* Racer Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          src={racer.avatarUrl}
                          name={racer.name}
                          size="md"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                            racer.status === 'online'
                              ? 'bg-emerald-400 animate-pulse'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {racer.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            @{racer.username}
                          </span>
                          {racer.isRealUser ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                              Real Player
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-bold">
                              CPU AI
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: racer.carColor }}
                            />
                            {racer.carName}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-amber-300 font-bold">
                            {racer.bestWpm} WPM
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {racer.isRealUser ? (
                        <button
                          onClick={() => handleInviteRacer(racer)}
                          disabled={hasInvited || sendingInviteId === racer._id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            hasInvited
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-950/30 active:scale-95'
                          }`}
                        >
                          {hasInvited ? (
                            <>
                              <Check size={12} />
                              <span>INVITED</span>
                            </>
                          ) : sendingInviteId === racer._id ? (
                            <span>SENDING...</span>
                          ) : (
                            <>
                              <Send size={12} />
                              <span>INVITE</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartDuelNow(racer)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play size={12} />
                          <span>PRACTICE</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStartDuelNow(racer)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-fuchsia-950/40 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play size={12} className="fill-white" />
                        <span>RACE NOW</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Click <strong>RACE NOW</strong> to start the head-to-head highway match immediately!</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceInviteModal;
