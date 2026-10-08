// Robust Offline-First Client Storage & Resilience for Typing Arena Scores, Profiles, and Leaderboards
import { getSpeedTier } from './typingEngine';

const STORAGE_RESULTS_KEY = 'clearfeed_typing_results';
const STORAGE_PROFILE_KEY = 'clearfeed_typing_profile';
const STORAGE_LB_KEY_PREFIX = 'clearfeed_typing_lb_';

// Seed community typists for when remote API is unreachable (404/offline)
export const DEFAULT_CHAMPIONS = [
  {
    _id: 'seed_champ_1',
    user: {
      _id: 'seed_user_1',
      name: 'Amina Al-Mansoor',
      username: 'amina_dev',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    wpm: 104,
    rawWpm: 112,
    accuracy: 99,
    highestCombo: 84,
    duration: 60,
    mode: 'words',
  },
  {
    _id: 'seed_champ_2',
    user: {
      _id: 'seed_user_2',
      name: 'Tariq Vance',
      username: 'tariq_codes',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    wpm: 92,
    rawWpm: 98,
    accuracy: 98,
    highestCombo: 65,
    duration: 60,
    mode: 'words',
  },
  {
    _id: 'seed_champ_3',
    user: {
      _id: 'seed_user_3',
      name: 'Elena Rostova',
      username: 'elena_r',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
    wpm: 84,
    rawWpm: 89,
    accuracy: 97,
    highestCombo: 48,
    duration: 60,
    mode: 'words',
  },
  {
    _id: 'seed_champ_4',
    user: {
      _id: 'seed_user_4',
      name: 'David Chen',
      username: 'dchen_fullstack',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    wpm: 72,
    rawWpm: 78,
    accuracy: 96,
    highestCombo: 34,
    duration: 60,
    mode: 'words',
  },
  {
    _id: 'seed_champ_5',
    user: {
      _id: 'seed_user_5',
      name: 'Sofia Reyes',
      username: 'sofia_ux',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    },
    wpm: 65,
    rawWpm: 70,
    accuracy: 95,
    highestCombo: 28,
    duration: 60,
    mode: 'words',
  },
];

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
  } = scoreData;

  const nMode = normalizeMode(mode);
  const tier = getSpeedTier(wpm);

  // Calculate XP gained
  const effectiveDuration = Number(duration) || 60;
  const baseXp = Math.max(10, Math.round(wpm * (effectiveDuration / 60) * (accuracy / 100)));
  const comboBonus = Math.floor(highestCombo / 10) * 5;
  const xpGained = Math.max(15, baseXp + comboBonus);

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
    createdAt: new Date().toISOString(),
    synced: false,
    user: currentUser
      ? {
          _id: currentUser._id || currentUser.id || 'me',
          name: currentUser.name || 'Anonymous Typist',
          username: currentUser.username || 'user',
          avatarUrl: currentUser.avatarUrl || null,
        }
      : null,
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

  const updatedBests = {
    ...(profile.personalBests || {}),
    ...(isNewBestForDur
      ? {
          [durKey]: {
            wpm,
            rawWpm,
            accuracy,
            highestCombo,
            mode: nMode,
            date: new Date().toISOString(),
          },
        }
      : {}),
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

  // 4. Update and persist leaderboard for (duration, mode)
  const { leaderboard, userRank, userBestScore } = getResilientLeaderboard(
    effectiveDuration,
    nMode,
    currentUser,
    null,
    resultEntry
  );

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
 * and seed champions so the user is ALWAYS visibly ranked.
 */
export const getResilientLeaderboard = (
  duration = 60,
  mode = 'words',
  currentUser = null,
  remoteLeaderboard = null,
  latestResult = null
) => {
  const dNum = duration === 'all' ? 'all' : Number(duration) || 60;
  const nMode = normalizeMode(mode);
  const cacheKey = `${STORAGE_LB_KEY_PREFIX}${dNum}_${nMode}`;

  let baseList = [];

  // If remote returned entries, use them as truth
  if (Array.isArray(remoteLeaderboard) && remoteLeaderboard.length > 0) {
    baseList = [...remoteLeaderboard];
  } else {
    // Check cached leaderboard for this filter
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        baseList = JSON.parse(cached);
      }
    } catch (_) {}

    // Fall back to pre-seeded champions if cache is empty
    if (!baseList || baseList.length === 0) {
      baseList = DEFAULT_CHAMPIONS.map((champ, idx) => ({
        ...champ,
        _id: `seed_${dNum}_${champ.user.username}_${idx}`,
        duration: dNum === 'all' ? 60 : dNum,
        mode: nMode,
      }));
    }
  }

  // Find user's best score (from latestResult, local profile, or local results)
  let userBestEntry = null;
  const profile = getLocalTypingProfile();
  const durKey = String(dNum);
  const personalBest = profile.personalBests?.[durKey] || (dNum === 'all' ? { wpm: profile.bestWpm, accuracy: profile.bestAccuracy } : null);

  if (currentUser) {
    const currentUserId = String(currentUser._id || currentUser.id || 'me');
    const currentUsername = String(currentUser.username || '').toLowerCase();

    // Check if user has a score in latestResult
    const candidateWpm = latestResult?.wpm || (personalBest?.wpm || 0);
    const candidateAcc = latestResult?.accuracy || (personalBest?.accuracy || 100);
    const candidateCombo = latestResult?.highestCombo || (personalBest?.highestCombo || 0);

    if (candidateWpm > 0) {
      userBestEntry = {
        _id: latestResult?._id || `user_best_${currentUserId}_${dNum}`,
        user: {
          _id: currentUserId,
          name: currentUser.name || 'You',
          username: currentUser.username || 'user',
          avatarUrl: currentUser.avatarUrl || null,
        },
        wpm: candidateWpm,
        rawWpm: latestResult?.rawWpm || candidateWpm,
        accuracy: candidateAcc,
        highestCombo: candidateCombo,
        duration: dNum === 'all' ? 60 : dNum,
        mode: nMode,
        isCurrentUser: true,
      };
    }
  }

  // Merge or update current user in list
  let mergedMap = new Map();

  for (const item of baseList) {
    const uId = String(item.user?._id || item.user?.username || item._id);
    mergedMap.set(uId, item);
  }

  if (userBestEntry && currentUser) {
    const currentUserId = String(currentUser._id || currentUser.id || 'me');
    const existing = mergedMap.get(currentUserId) || [...mergedMap.values()].find(
      (entry) => String(entry.user?.username || '').toLowerCase() === String(currentUser.username || '').toLowerCase()
    );

    if (existing) {
      // Keep whichever score is higher
      if (userBestEntry.wpm > (existing.wpm || 0)) {
        mergedMap.set(currentUserId, {
          ...existing,
          ...userBestEntry,
          wpm: Math.max(existing.wpm || 0, userBestEntry.wpm),
          accuracy: Math.max(existing.accuracy || 0, userBestEntry.accuracy),
          highestCombo: Math.max(existing.highestCombo || 0, userBestEntry.highestCombo),
        });
      }
    } else {
      mergedMap.set(currentUserId, userBestEntry);
    }
  }

  // Sort descending by WPM, then accuracy, then combo
  const sortedLeaderboard = Array.from(mergedMap.values()).sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return (b.highestCombo || 0) - (a.highestCombo || 0);
  });

  // Calculate 1-indexed rank for current user
  let userRank = null;
  let userBestScore = null;

  if (currentUser) {
    const currentUserId = String(currentUser._id || currentUser.id || 'me');
    const currentUsername = String(currentUser.username || '').toLowerCase();
    const rankIdx = sortedLeaderboard.findIndex((entry) => {
      const eId = String(entry.user?._id || entry.user?.id || '');
      const eUser = String(entry.user?.username || '').toLowerCase();
      return eId === currentUserId || (currentUsername && eUser === currentUsername);
    });

    if (rankIdx !== -1) {
      userRank = rankIdx + 1;
      userBestScore = sortedLeaderboard[rankIdx].wpm;
    }
  }

  // Cache merged leaderboard
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
 * Admin utility: Remove a score or user from the local leaderboard cache and results.
 */
export const removeLeaderboardEntryLocally = (entryId, targetUserId, duration, mode) => {
  const dNum = duration === 'all' ? 'all' : Number(duration) || 60;
  const nMode = normalizeMode(mode);

  // 1. Clear or purge from specific and all cache keys
  const keysToPurge = [
    `${STORAGE_LB_KEY_PREFIX}${dNum}_${nMode}`,
    `${STORAGE_LB_KEY_PREFIX}15_words`,
    `${STORAGE_LB_KEY_PREFIX}30_words`,
    `${STORAGE_LB_KEY_PREFIX}60_words`,
    `${STORAGE_LB_KEY_PREFIX}120_words`,
    `${STORAGE_LB_KEY_PREFIX}all_words`,
  ];

  for (const cacheKey of keysToPurge) {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter((item) => {
          const matchEntry = item._id === entryId;
          const matchUser = targetUserId && String(item.user?._id || item.user?.id) === String(targetUserId);
          return !matchEntry && !matchUser;
        });
        localStorage.setItem(cacheKey, JSON.stringify(filtered));
      }
    } catch (_) {}
  }

  // 2. Remove from local stored results list
  try {
    const rawResults = localStorage.getItem(STORAGE_RESULTS_KEY);
    if (rawResults) {
      const resultsList = JSON.parse(rawResults);
      const filteredResults = resultsList.filter((item) => {
        const matchEntry = item._id === entryId;
        const matchUser = targetUserId && String(item.user?._id || item.user?.id) === String(targetUserId);
        return !matchEntry && !matchUser;
      });
      localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(filteredResults));
    }
  } catch (_) {}

  // 3. If target user was current user, clear their personal best for that duration
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

  // 4. Broadcast event so all components re-render immediately
  try {
    window.dispatchEvent(
      new CustomEvent('clearfeed:typingScoreSaved', {
        detail: { removedId: entryId, removedUserId: targetUserId },
      })
    );
  } catch (_) {}
};
