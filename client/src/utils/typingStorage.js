// Robust Offline-First Client Storage & Resilience for Typing Arena Scores, Profiles, and Leaderboards
import { getSpeedTier } from './typingEngine.js';

const STORAGE_RESULTS_KEY = 'clearfeed_typing_results';
const STORAGE_PROFILE_KEY = 'clearfeed_typing_profile';
const STORAGE_LB_KEY_PREFIX = 'clearfeed_typing_lb_';
const STORAGE_CHALLENGES_KEY = 'clearfeed_typing_challenges';

const STORAGE_DELETED_ENTRIES_KEY = 'clearfeed_typing_deleted_ids';

// Known dummy/seed usernames to permanently purge from leaderboards
export const DUMMY_USERNAMES = new Set([
  'amina_dev',
  'tariq_codes',
  'elena_r',
  'dchen_fullstack',
  'sofia_ux',
  'seed_user_1',
  'seed_user_2',
  'seed_user_3',
  'seed_user_4',
  'seed_user_5',
  'seed_champ_1',
  'seed_champ_2',
  'seed_champ_3',
  'seed_champ_4',
  'seed_champ_5',
  'seed_challenge_1',
  'seed_challenge_2',
]);

// Empty seed lists - real users only!
export const DEFAULT_CHALLENGES = [];
export const DEFAULT_CHAMPIONS = [];

/**
 * Get permanent tombstone set of deleted entries and users
 */
export const getDeletedEntryIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_ENTRIES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr.map((id) => String(id).toLowerCase()));
  } catch (_) {
    return new Set();
  }
};

/**
 * Permanently mark an entry ID, user ID, or username as deleted so it can NEVER return
 */
export const markEntryAsDeleted = (entryId, targetUserId, targetUsername) => {
  try {
    const set = getDeletedEntryIds();
    if (entryId) set.add(String(entryId).toLowerCase());
    if (targetUserId) set.add(String(targetUserId).toLowerCase());
    if (targetUsername) set.add(String(targetUsername).toLowerCase());
    localStorage.setItem(STORAGE_DELETED_ENTRIES_KEY, JSON.stringify(Array.from(set)));
  } catch (_) {}
};

/**
 * Verify if an entry is genuine (not a dummy/seed user and not deleted by admin)
 */
export const isEntryGenuine = (item, deletedSet = null) => {
  if (!item) return false;
  const set = deletedSet || getDeletedEntryIds();
  const eId = String(item._id || '').toLowerCase();
  const uId = String(item.user?._id || item.user?.id || '').toLowerCase();
  const uName = String(item.user?.username || '').toLowerCase();

  // Filter out any mock/seed records
  if (
    eId.startsWith('seed_') ||
    uId.startsWith('seed_') ||
    DUMMY_USERNAMES.has(uName) ||
    DUMMY_USERNAMES.has(uId) ||
    DUMMY_USERNAMES.has(eId)
  ) {
    return false;
  }

  // Filter out admin-deleted entries or disqualified users
  if (set.has(eId) || set.has(uId) || (uName && set.has(uName))) {
    return false;
  }

  return true;
};

/**
 * Purge all legacy dummy data and seed users from all localStorage caches permanently
 */
export const purgeAllDummyData = () => {
  try {
    // 1. Permanently register all dummy usernames and IDs in deleted tombstone
    const deletedSet = getDeletedEntryIds();
    for (const d of DUMMY_USERNAMES) {
      deletedSet.add(d.toLowerCase());
    }
    localStorage.setItem(STORAGE_DELETED_ENTRIES_KEY, JSON.stringify(Array.from(deletedSet)));

    // 2. Scrub all leaderboard cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_LB_KEY_PREFIX)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const cleaned = list.filter((item) => isEntryGenuine(item, deletedSet));
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch (_) {}
      }
    }

    // 3. Scrub challenges
    try {
      const rawCh = localStorage.getItem(STORAGE_CHALLENGES_KEY);
      if (rawCh) {
        const chList = JSON.parse(rawCh);
        if (Array.isArray(chList)) {
          const cleanedCh = chList.filter((ch) => {
            const chId = String(ch._id || '').toLowerCase();
            const cUser = String(ch.challenger?.username || ch.challenger?._id || '').toLowerCase();
            return (
              !chId.startsWith('seed_') &&
              !DUMMY_USERNAMES.has(cUser) &&
              !deletedSet.has(chId) &&
              !deletedSet.has(cUser)
            );
          });
          localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(cleanedCh));
        }
      }
    } catch (_) {}

    // 4. Scrub local results
    try {
      const rawRes = localStorage.getItem(STORAGE_RESULTS_KEY);
      if (rawRes) {
        const resList = JSON.parse(rawRes);
        if (Array.isArray(resList)) {
          const cleanedRes = resList.filter((res) => isEntryGenuine(res, deletedSet));
          localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(cleanedRes));
        }
      }
    } catch (_) {}
  } catch (err) {
    console.warn('Error purging dummy data:', err);
  }
};

// Immediately execute purge on bundle execution to scrub any lingering dummy typists
purgeAllDummyData();

/**
 * Normalize mode string (e.g. 'words_200' -> 'words')
 */
export const normalizeMode = (mode) => {
  if (!mode) return 'words';
  return mode.startsWith('words') ? 'words' : mode;
};

/**
 * Get all locally saved typing results
 */
export const getLocalResults = () => {
  try {
    const raw = localStorage.getItem(STORAGE_RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to read local typing results:', err);
    return [];
  }
};

/**
 * Get the locally stored typing profile
 */
export const getLocalTypingProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read local typing profile:', err);
  }
  return {
    bestWpm: 0,
    bestAccuracy: 100,
    testsCompleted: 0,
    totalChars: 0,
    xp: 0,
    duelsWon: 0,
    duelsPlayed: 0,
    currentRank: 'Arena Novice',
    personalBests: {},
  };
};

/**
 * Save a test result locally with full offline persistence, profile stat aggregation,
 * and immediate dynamic placement onto the leaderboard.
 */
export const saveTypingResultLocally = (scoreData, currentUser) => {
  const {
    wpm = 0,
    rawWpm = 0,
    accuracy = 100,
    duration = 60,
    mode = 'words',
    charCount = 0,
    highestCombo = 0,
    telemetry = [],
    isRace = false,
  } = scoreData;

  const nMode = normalizeMode(mode);
  const tier = getSpeedTier(wpm);

  // Calculate XP gained
  const effectiveDuration = Number(duration) || 60;
  const baseXp = Math.max(10, Math.round(wpm * (effectiveDuration / 60) * (accuracy / 100)));
  const comboBonus = Math.floor(highestCombo / 10) * 5;
  const xpGained = Math.max(15, baseXp + comboBonus);

  // Fallback to resilient user object so guest / unauth users are never excluded from ranking
  const effectiveUser = currentUser
    ? {
        _id: String(currentUser._id || currentUser.id || 'me'),
        name: currentUser.name || 'Anonymous Typist',
        username: currentUser.username || 'user',
        avatarUrl: currentUser.avatarUrl || null,
      }
    : {
        _id: 'me',
        name: 'You',
        username: 'you',
        avatarUrl: null,
      };

  // 1. Construct immutable local result object
  const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const resultEntry = {
    _id: localId,
    wpm,
    rawWpm,
    accuracy,
    duration: effectiveDuration,
    mode: nMode,
    charCount,
    highestCombo,
    telemetry,
    xpGained,
    isRace,
    createdAt: new Date().toISOString(),
    synced: false,
    user: effectiveUser,
  };

  // 2. Persist in results history
  try {
    const currentResults = getLocalResults();
    const updatedResults = [resultEntry, ...currentResults].slice(0, 100);
    localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(updatedResults));
  } catch (err) {
    console.warn('Error saving local results list:', err);
  }

  // 3. Aggregate user typing profile stats
  let profile = getLocalTypingProfile();
  const durKey = String(effectiveDuration);
  const currentBestForDur = profile.personalBests?.[durKey]?.wpm || 0;
  const isNewBestForDur = wpm > currentBestForDur;

  // Standard duration bucket for cross-filter visibility
  let standardBucket = '60';
  if (effectiveDuration <= 20) standardBucket = '15';
  else if (effectiveDuration <= 45) standardBucket = '30';
  else if (effectiveDuration <= 90) standardBucket = '60';
  else standardBucket = '120';

  const entryPayload = {
    wpm,
    rawWpm,
    accuracy,
    highestCombo,
    mode: nMode,
    date: new Date().toISOString(),
  };

  const updatedBests = {
    ...(profile.personalBests || {}),
    ...(isNewBestForDur ? { [durKey]: entryPayload } : {}),
    ...((wpm > (profile.personalBests?.[standardBucket]?.wpm || 0)) ? { [standardBucket]: entryPayload } : {}),
  };

  profile = {
    ...profile,
    testsCompleted: (profile.testsCompleted || 0) + 1,
    totalChars: (profile.totalChars || 0) + charCount,
    xp: (profile.xp || 0) + xpGained,
    bestWpm: Math.max(profile.bestWpm || 0, wpm),
    bestAccuracy: Math.max(profile.bestAccuracy || 0, accuracy),
    currentRank: `${tier.name} (${tier.badge})`,
    personalBests: updatedBests,
  };

  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Error updating local typing profile:', err);
  }

  // 4. Update and persist leaderboards across all relevant duration keys
  const { leaderboard, userRank, userBestScore } = getResilientLeaderboard(
    effectiveDuration,
    nMode,
    effectiveUser,
    null,
    resultEntry
  );
  getResilientLeaderboard('all', nMode, effectiveUser, null, resultEntry);
  if (standardBucket !== durKey) {
    getResilientLeaderboard(standardBucket, nMode, effectiveUser, null, resultEntry);
  }

  // 5. Broadcast real-time events for other components and tabs
  try {
    window.dispatchEvent(
      new CustomEvent('clearfeed:typingScoreSaved', {
        detail: {
          result: resultEntry,
          userRank,
          xpGained,
          leaderboard,
        },
      })
    );

    window.dispatchEvent(
      new CustomEvent('clearfeed:typingStatsUpdated', {
        detail: {
          typingStats: profile,
        },
      })
    );
  } catch (_) {}

  return {
    result: resultEntry,
    userRank,
    xpGained,
    userBestScore: userBestScore || wpm,
    leaderboard,
  };
};

/**
 * Build a merged, resilient leaderboard combining remote scores, local personal bests,
 * race history, and all client results so the user is ALWAYS visibly ranked.
 */
export const getResilientLeaderboard = (
  duration = 'all',
  mode = 'words',
  currentUser = null,
  remoteLeaderboard = null,
  latestResult = null
) => {
  const dNum = duration === 'all' ? 'all' : Number(duration) || 60;
  const nMode = normalizeMode(mode);
  const cacheKey = `${STORAGE_LB_KEY_PREFIX}${dNum}_${nMode}`;
  const deletedSet = getDeletedEntryIds();

  const effectiveUser = currentUser
    ? {
        _id: String(currentUser._id || currentUser.id || 'me'),
        name: currentUser.name || 'Anonymous Typist',
        username: currentUser.username || 'user',
        avatarUrl: currentUser.avatarUrl || null,
      }
    : {
        _id: 'me',
        name: 'You',
        username: 'you',
        avatarUrl: null,
      };

  const currentUserId = String(effectiveUser._id || 'me').toLowerCase();
  const currentUsername = String(effectiveUser.username || 'you').toLowerCase();

  const mergedMap = new Map();

  // Helper to add or keep highest entry for a participant
  const addParticipantScore = (entry, isUser = false) => {
    if (!entry || !entry.wpm || Number(entry.wpm) <= 0) return;
    if (!isEntryGenuine(entry, deletedSet)) return;

    const uId = String(entry.user?._id || entry.user?.id || (isUser ? currentUserId : entry._id)).toLowerCase();
    const uName = String(entry.user?.username || (isUser ? currentUsername : '')).toLowerCase();

    // Reject admin-deleted or disqualified users
    if (deletedSet.has(uId) || (uName && deletedSet.has(uName))) return;

    // Filter by duration if specific (not 'all')
    if (dNum !== 'all') {
      const entryDur = Number(entry.duration) || 60;
      const matchesDuration =
        entryDur === Number(dNum) ||
        (Number(dNum) === 15 && entryDur <= 20) ||
        (Number(dNum) === 30 && entryDur > 20 && entryDur <= 45) ||
        (Number(dNum) === 60 && entryDur > 45 && entryDur <= 90) ||
        (Number(dNum) === 120 && entryDur > 90);

      // If duration doesn't match and not user, skip
      if (!matchesDuration && !isUser) return;
    }

    const key = uId || uName;
    const existing = mergedMap.get(key);

    const isThisMe =
      isUser ||
      uId === currentUserId ||
      (currentUsername && uName === currentUsername) ||
      Boolean(entry.isCurrentUser);

    if (!existing || Number(entry.wpm) > (Number(existing.wpm) || 0)) {
      mergedMap.set(key, {
        ...entry,
        user: entry.user || effectiveUser,
        wpm: Number(entry.wpm),
        accuracy: Number(entry.accuracy) || 100,
        isCurrentUser: isThisMe,
      });
    }
  };

  // 1. Ingest remote scores if available
  if (Array.isArray(remoteLeaderboard) && remoteLeaderboard.length > 0) {
    for (const item of remoteLeaderboard) {
      addParticipantScore(item);
    }
  }

  // 2. Ingest cached leaderboard entries for this filter
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          addParticipantScore(item);
        }
      }
    }
  } catch (_) {}

  // 3. Ingest local results history (all completed tests & races on this browser)
  try {
    const localResults = getLocalResults();
    if (Array.isArray(localResults)) {
      for (const res of localResults) {
        addParticipantScore(res);
      }
    }
  } catch (_) {}

  // 4. Ingest race history from Multiplayer Racing Arena
  try {
    const rawRaces = localStorage.getItem('clearfeed_racing_history');
    if (rawRaces) {
      const races = JSON.parse(rawRaces);
      if (Array.isArray(races)) {
        for (const race of races) {
          if (race.wpm > 0) {
            addParticipantScore(
              {
                _id: race.id || `race_${Date.now()}`,
                wpm: Number(race.wpm),
                rawWpm: Number(race.wpm),
                accuracy: Number(race.accuracy) || 100,
                duration: Number(race.durationSec) || 30,
                mode: 'words',
                highestCombo: 0,
                user: effectiveUser,
                isRace: true,
              },
              true
            );
          }
        }
      }
    }
  } catch (_) {}

  // 5. Ingest user's personal bests and racing profile
  const profile = getLocalTypingProfile();
  let candidateBestWpm = Number(latestResult?.wpm) || 0;
  let candidateAccuracy = Number(latestResult?.accuracy) || 100;
  let candidateCombo = Number(latestResult?.highestCombo) || 0;

  // Check personal best for this specific duration
  const durKey = String(dNum);
  if (profile.personalBests?.[durKey]?.wpm) {
    const pbWpm = Number(profile.personalBests[durKey].wpm);
    if (pbWpm > candidateBestWpm) {
      candidateBestWpm = pbWpm;
      candidateAccuracy = Number(profile.personalBests[durKey].accuracy) || candidateAccuracy;
      candidateCombo = Number(profile.personalBests[durKey].highestCombo) || candidateCombo;
    }
  }

  // Check overall best WPM if dNum === 'all' or if candidate is still 0
  if (dNum === 'all' || candidateBestWpm === 0) {
    const ovBest = Number(profile.bestWpm) || 0;
    if (ovBest > candidateBestWpm) {
      candidateBestWpm = ovBest;
      candidateAccuracy = Number(profile.bestAccuracy) || candidateAccuracy;
    }

    try {
      const rawRacing = localStorage.getItem('clearfeed_racing_profile');
      if (rawRacing) {
        const rp = JSON.parse(rawRacing);
        const rBest = Number(rp.bestWpm) || 0;
        if (rBest > candidateBestWpm) {
          candidateBestWpm = rBest;
        }
      }
    } catch (_) {}
  }

  // If user has recorded any score, guarantee they are in mergedMap
  if (candidateBestWpm > 0 && !deletedSet.has(currentUserId) && !deletedSet.has(currentUsername)) {
    addParticipantScore(
      {
        _id: latestResult?._id || `user_best_${currentUserId}_${dNum}`,
        user: effectiveUser,
        wpm: candidateBestWpm,
        rawWpm: Number(latestResult?.rawWpm) || candidateBestWpm,
        accuracy: candidateAccuracy,
        highestCombo: candidateCombo,
        duration: dNum === 'all' ? 60 : dNum,
        mode: nMode,
        isCurrentUser: true,
      },
      true
    );
  }

  // 6. Sort descending by WPM, then accuracy, then combo
  const sortedLeaderboard = Array.from(mergedMap.values())
    .filter((item) => isEntryGenuine(item, deletedSet))
    .sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return (b.highestCombo || 0) - (a.highestCombo || 0);
    });

  // 7. Calculate 1-indexed rank for current user
  let userRank = null;
  let userBestScore = null;

  const rankIdx = sortedLeaderboard.findIndex((entry) => {
    const eId = String(entry.user?._id || entry.user?.id || '').toLowerCase();
    const eUser = String(entry.user?.username || '').toLowerCase();
    return eId === currentUserId || (currentUsername && eUser === currentUsername) || entry.isCurrentUser;
  });

  if (rankIdx !== -1) {
    userRank = rankIdx + 1;
    userBestScore = sortedLeaderboard[rankIdx].wpm;
    sortedLeaderboard[rankIdx].isCurrentUser = true;
  }

  // Cache clean merged leaderboard
  try {
    localStorage.setItem(cacheKey, JSON.stringify(sortedLeaderboard));
  } catch (_) {}

  return {
    leaderboard: sortedLeaderboard,
    userRank,
    userBestScore,
  };
};

/**
 * Background sync helper to silently sync unsynced scores with the backend
 * when it is online and available.
 */
export const syncPendingScoresWithServer = async (apiClient) => {
  if (!apiClient) return;
  const results = getLocalResults();
  const unsynced = results.filter((r) => !r.synced);
  if (unsynced.length === 0) return;

  for (const item of unsynced) {
    try {
      const res = await apiClient.post('/typing/submit', {
        wpm: item.wpm,
        rawWpm: item.rawWpm,
        accuracy: item.accuracy,
        duration: item.duration,
        mode: item.mode,
        charCount: item.charCount,
        highestCombo: item.highestCombo,
        telemetry: item.telemetry,
      });

      if (res.status === 200 || res.status === 201) {
        item.synced = true;
      }
    } catch (err) {
      // Stop attempting if route is still 404 or backend unavailable
      if (err.response?.status === 404) {
        break;
      }
    }
  }

  try {
    localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(results));
  } catch (_) {}
};

/**
 * Admin utility: Permanently remove a score or user from the local leaderboard cache and results.
 */
export const removeLeaderboardEntryLocally = (entryId, targetUserId, duration, mode, targetUsername) => {
  const dNum = duration === 'all' ? 'all' : Number(duration) || 60;
  const nMode = normalizeMode(mode);

  // 1. Permanently record deletion in tombstone so it can NEVER return
  markEntryAsDeleted(entryId, targetUserId, targetUsername);
  const deletedSet = getDeletedEntryIds();

  // 2. Clear or purge from ALL leaderboard cache keys in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_LB_KEY_PREFIX)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const filtered = list.filter((item) => {
                const matchEntry = item._id === entryId || deletedSet.has(String(item._id).toLowerCase());
                const matchUser =
                  (targetUserId && String(item.user?._id || item.user?.id) === String(targetUserId)) ||
                  (targetUsername && String(item.user?.username || '').toLowerCase() === String(targetUsername).toLowerCase()) ||
                  deletedSet.has(String(item.user?._id || item.user?.id).toLowerCase()) ||
                  deletedSet.has(String(item.user?.username || '').toLowerCase());
                return !matchEntry && !matchUser;
              });
              localStorage.setItem(key, JSON.stringify(filtered));
            }
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  // 3. Remove from local stored results list
  try {
    const rawResults = localStorage.getItem(STORAGE_RESULTS_KEY);
    if (rawResults) {
      const resultsList = JSON.parse(rawResults);
      if (Array.isArray(resultsList)) {
        const filteredResults = resultsList.filter((item) => {
          const matchEntry = item._id === entryId || deletedSet.has(String(item._id).toLowerCase());
          const matchUser =
            (targetUserId && String(item.user?._id || item.user?.id) === String(targetUserId)) ||
            (targetUsername && String(item.user?.username || '').toLowerCase() === String(targetUsername).toLowerCase()) ||
            deletedSet.has(String(item.user?._id || item.user?.id).toLowerCase()) ||
            deletedSet.has(String(item.user?.username || '').toLowerCase());
          return !matchEntry && !matchUser;
        });
        localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(filteredResults));
      }
    }
  } catch (_) {}

  // 4. Remove from challenges
  try {
    const rawChallenges = localStorage.getItem(STORAGE_CHALLENGES_KEY);
    if (rawChallenges) {
      const chList = JSON.parse(rawChallenges);
      if (Array.isArray(chList)) {
        const filteredCh = chList.filter((ch) => {
          const cUser = String(ch.challenger?.username || ch.challenger?._id || '').toLowerCase();
          const tUser = String(ch.challenged?.username || ch.challenged?._id || '').toLowerCase();
          return !deletedSet.has(cUser) && !deletedSet.has(tUser) && !deletedSet.has(String(ch._id).toLowerCase());
        });
        localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(filteredCh));
      }
    }
  } catch (_) {}

  // 5. If target user was current user, clear their personal best for that duration
  try {
    const profile = getLocalTypingProfile();
    const durKey = String(dNum);
    if (targetUserId && profile.personalBests?.[durKey]) {
      const updatedBests = { ...profile.personalBests };
      delete updatedBests[durKey];
      profile.personalBests = updatedBests;
      profile.bestWpm = Math.max(0, ...Object.values(updatedBests).map((b) => b.wpm || 0));
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    }
  } catch (_) {}

  // 6. Broadcast event so all components re-render immediately
  try {
    window.dispatchEvent(
      new CustomEvent('clearfeed:typingScoreSaved', {
        detail: { removedId: entryId, removedUserId: targetUserId, removedUsername: targetUsername },
      })
    );
    window.dispatchEvent(
      new CustomEvent('clearfeed:typingChallengesUpdated', {
        detail: { removedId: entryId },
      })
    );
  } catch (_) {}
};

/**
 * Save a 1v1 duel challenge locally with full offline persistence
 */
export const saveLocalChallenge = (challengeData, currentUser) => {
  const localId = `ch_local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cUser = currentUser
    ? {
        _id: String(currentUser._id || currentUser.id || 'me'),
        name: currentUser.name || 'You',
        username: currentUser.username || 'user',
        avatarUrl: currentUser.avatarUrl || null,
      }
    : {
        _id: 'me',
        name: 'You',
        username: 'user',
        avatarUrl: null,
      };

  const newChallenge = {
    _id: localId,
    challenger: cUser,
    challenged: {
      _id: String(challengeData.targetUserId || 'opponent'),
      name: challengeData.targetName || challengeData.targetUsername || 'Rival',
      username: challengeData.targetUsername || 'rival',
      avatarUrl: challengeData.targetAvatarUrl || null,
    },
    duration: Number(challengeData.duration) || 60,
    mode: normalizeMode(challengeData.mode || 'words'),
    words: challengeData.words || [],
    challengerWpm: challengeData.challengerWpm || 0,
    challengerAccuracy: challengeData.challengerAccuracy || 100,
    challengerRawWpm: challengeData.challengerRawWpm || challengeData.challengerWpm || 0,
    challengerTelemetry: challengeData.challengerTelemetry || [],
    customMessage:
      challengeData.customMessage || 'I challenge you to beat my typing speed in Clearfeed Arena!',
    status: 'pending',
    createdAt: new Date().toISOString(),
    synced: false,
  };

  try {
    const raw = localStorage.getItem(STORAGE_CHALLENGES_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const updated = [newChallenge, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving local challenge:', err);
  }

  try {
    window.dispatchEvent(
      new CustomEvent('clearfeed:typingChallengesUpdated', {
        detail: { challenge: newChallenge },
      })
    );
  } catch (_) {}

  return newChallenge;
};

/**
 * Retrieve local challenges filtered by user ID (incoming, outgoing, history)
 */
export const getLocalChallenges = (userId) => {
  const currentUserId = String(userId || 'me').toLowerCase();
  const deletedSet = getDeletedEntryIds();
  let list = [];
  try {
    const raw = localStorage.getItem(STORAGE_CHALLENGES_KEY);
    if (raw) {
      list = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading local challenges:', err);
  }

  // Strictly filter out any dummy or deleted challenges
  list = list.filter((ch) => {
    const chId = String(ch._id || '').toLowerCase();
    const cUser = String(ch.challenger?.username || ch.challenger?._id || '').toLowerCase();
    const tUser = String(ch.challenged?.username || ch.challenged?._id || '').toLowerCase();
    return (
      !chId.startsWith('seed_') &&
      !DUMMY_USERNAMES.has(cUser) &&
      !DUMMY_USERNAMES.has(tUser) &&
      !deletedSet.has(chId) &&
      !deletedSet.has(cUser)
    );
  });

  const incoming = list.filter((ch) => {
    const chTargetId = String(ch.challenged?._id || ch.challenged?.id || '').toLowerCase();
    const chTargetName = String(ch.challenged?.username || '').toLowerCase();
    return (
      (chTargetId === currentUserId || chTargetName === currentUserId || !ch.challenged?._id) &&
      String(ch.challenger?._id || '').toLowerCase() !== currentUserId &&
      ch.status === 'pending'
    );
  });

  const outgoing = list.filter((ch) => {
    const chSourceId = String(ch.challenger?._id || ch.challenger?.id || '').toLowerCase();
    return chSourceId === currentUserId && ch.status === 'pending';
  });

  const history = list.filter((ch) => {
    const chSourceId = String(ch.challenger?._id || ch.challenger?.id || '').toLowerCase();
    const chTargetId = String(ch.challenged?._id || ch.challenged?.id || '').toLowerCase();
    return (
      (chSourceId === currentUserId || chTargetId === currentUserId) &&
      (ch.status === 'completed' || ch.status === 'declined')
    );
  });

  return { incoming, outgoing, history };
};

/**
 * Get a specific challenge by ID from local cache
 */
export const getLocalChallengeById = (challengeId) => {
  if (!challengeId) return null;
  const deletedSet = getDeletedEntryIds();
  try {
    const raw = localStorage.getItem(STORAGE_CHALLENGES_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const found = list.find((ch) => {
        const chId = String(ch._id || '').toLowerCase();
        return chId === String(challengeId).toLowerCase() && !deletedSet.has(chId);
      });
      if (found) return found;
    }
  } catch (_) {}

  return null;
};

/**
 * Complete a local challenge, determine winner, award duel XP, and persist stats
 */
export const completeLocalChallenge = (challengeId, resultData, currentUser) => {
  if (!challengeId) return null;
  const currentUserId = String(currentUser?._id || currentUser?.id || 'me');
  let updatedChallenge = null;

  try {
    const raw = localStorage.getItem(STORAGE_CHALLENGES_KEY);
    let list = raw ? JSON.parse(raw) : [...DEFAULT_CHALLENGES];

    const idx = list.findIndex((ch) => ch._id === challengeId);
    if (idx !== -1) {
      const ch = list[idx];
      const challengerWpm = ch.challengerWpm || 0;
      const userWpm = resultData.wpm || 0;

      let winner = null;
      if (userWpm > challengerWpm) {
        winner = currentUser
          ? { _id: currentUserId, name: currentUser.name, username: currentUser.username }
          : { _id: currentUserId, name: 'You', username: 'user' };
      } else if (challengerWpm > userWpm) {
        winner = ch.challenger;
      }

      const isChallenger = String(ch.challenger?._id || '') === currentUserId;

      updatedChallenge = {
        ...ch,
        status: 'completed',
        winner,
        ...(isChallenger
          ? {
              challengerWpm: userWpm,
              challengerAccuracy: resultData.accuracy,
              challengerRawWpm: resultData.rawWpm || userWpm,
              challengerTelemetry: resultData.telemetry || [],
            }
          : {
              challengedWpm: userWpm,
              challengedAccuracy: resultData.accuracy,
              challengedRawWpm: resultData.rawWpm || userWpm,
              challengedTelemetry: resultData.telemetry || [],
            }),
        updatedAt: new Date().toISOString(),
      };

      list[idx] = updatedChallenge;
      localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(list));

      // Update user typing profile duel stats & bonus XP
      let profile = getLocalTypingProfile();
      const didWin = winner && String(winner._id) === currentUserId;
      profile = {
        ...profile,
        duelsPlayed: (profile.duelsPlayed || 0) + 1,
        duelsWon: (profile.duelsWon || 0) + (didWin ? 1 : 0),
        xp: (profile.xp || 0) + (didWin ? 50 : 20),
      };
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));

      try {
        window.dispatchEvent(
          new CustomEvent('clearfeed:typingChallengesUpdated', {
            detail: { challenge: updatedChallenge },
          })
        );
        window.dispatchEvent(
          new CustomEvent('clearfeed:typingStatsUpdated', {
            detail: { typingStats: profile },
          })
        );
      } catch (_) {}
    }
  } catch (err) {
    console.warn('Error completing local challenge:', err);
  }

  return updatedChallenge;
};

/**
 * Decline a local challenge
 */
export const declineLocalChallenge = (challengeId) => {
  if (!challengeId) return;
  try {
    const raw = localStorage.getItem(STORAGE_CHALLENGES_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const idx = list.findIndex((ch) => ch._id === challengeId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          status: 'declined',
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(list));
        window.dispatchEvent(
          new CustomEvent('clearfeed:typingChallengesUpdated', {
            detail: { challengeId, status: 'declined' },
          })
        );
      }
    }
  } catch (err) {
    console.warn('Error declining local challenge:', err);
  }
};

