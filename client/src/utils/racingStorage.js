// High-performance, offline-resilient storage and state for Multiplayer Typing Racing Arena
export const CAR_CATALOG = [
  {
    id: 'shadow_v12',
    name: 'Shadow V12',
    tier: 'Legendary',
    color: '#a855f7', // Cyber Purple
    accentColor: '#c084fc',
    tailFlame: '#e879f9',
    image: '/racing/shadow_v12.jpg',
    stats: { speed: 95, acceleration: 92, handling: 88, nitro: 94 },
    description: 'Hyper-tuned twin-turbo powerhouse forged for night circuit dominance.',
    unlockedByDefault: true,
  },
  {
    id: 'neon_gt',
    name: 'Neon GT',
    tier: 'Epic',
    color: '#22c55e', // Cyber Green
    accentColor: '#4ade80',
    tailFlame: '#10b981',
    image: '/racing/neon_gt.jpg',
    stats: { speed: 91, acceleration: 93, handling: 94, nitro: 89 },
    description: 'Lightweight electric track weapon with razor-sharp cornering agility.',
    unlockedByDefault: true,
  },
  {
    id: 'street_phantom',
    name: 'Street Phantom',
    tier: 'Rare',
    color: '#ef4444', // Crimson Red
    accentColor: '#f87171',
    tailFlame: '#f97316',
    image: '/racing/street_phantom.jpg',
    stats: { speed: 88, acceleration: 94, handling: 90, nitro: 86 },
    description: 'Raw muscle supercar that explodes off the starting line.',
    unlockedByDefault: true,
  },
  {
    id: 'apex_x',
    name: 'Apex X',
    tier: 'Legendary',
    color: '#e2e8f0', // Hyper Titanium Silver
    accentColor: '#38bdf8',
    tailFlame: '#06b6d4',
    image: '/racing/apex_x.jpg',
    stats: { speed: 96, acceleration: 90, handling: 95, nitro: 92 },
    description: 'Aerodynamic concept hypercar sculpted in virtual supersonic wind tunnels.',
    unlockedByDefault: true,
  },
  {
    id: 'thunder_rs',
    name: 'Thunder RS',
    tier: 'Epic',
    color: '#eab308', // Solar Amber Gold
    accentColor: '#fde047',
    tailFlame: '#f59e0b',
    image: '/racing/thunder_rs.jpg',
    stats: { speed: 93, acceleration: 95, handling: 87, nitro: 91 },
    description: 'Pure adrenaline with instant torque and high-revving nitro injectors.',
    unlockedByDefault: true,
  },
  {
    id: 'cyber_cruiser',
    name: 'Cyber Cruiser',
    tier: 'Rare',
    color: '#3b82f6', // Cobalt Electric Blue
    accentColor: '#60a5fa',
    tailFlame: '#38bdf8',
    image: '/racing/cyber_cruiser.jpg',
    stats: { speed: 86, acceleration: 89, handling: 92, nitro: 88 },
    description: 'Balanced street machine with responsive traction control and sleek lines.',
    unlockedByDefault: true,
  },
];

export const TRACK_CIRCUITS = [
  { id: 'neon_coast', name: 'Neon Coast', round: '1/3', laps: 2, scenery: 'coastline', bgHue: '#0b1329', bgImage: '/racing/track_neon_coast.jpg' },
  { id: 'cyber_district', name: 'Cyber District', round: '2/3', laps: 2, scenery: 'downtown', bgHue: '#120b29', bgImage: '/racing/track_neon_coast.jpg' },
  { id: 'mountain_pass', name: 'Sunset Pass', round: '3/3', laps: 1, scenery: 'mountains', bgHue: '#1a0f1d', bgImage: '/racing/track_neon_coast.jpg' },
];

const STORAGE_RACING_PROFILE = 'clearfeed_racing_profile';
const STORAGE_RACING_GARAGE = 'clearfeed_racing_garage';
const STORAGE_RACING_MISSIONS = 'clearfeed_racing_missions';
const STORAGE_RACING_HISTORY = 'clearfeed_racing_history';

/**
 * Get the current player's racing profile
 */
export const getRacingProfile = (currentUser) => {
  const defaultProfile = {
    level: 12,
    xp: 720,
    nextLevelXp: 1000,
    stars: 3420,
    totalRaces: 248,
    wins: 154,
    winRate: 62,
    bestWpm: 142,
    avgWpm: 114,
    streak: 7,
    rankTitle: 'Speedster',
    recentAchievements: [
      { id: 'speedster', title: 'Speedster', icon: '⚡', color: 'text-sky-400' },
      { id: 'top_10', title: 'Top 10', icon: '🏆', color: 'text-amber-400' },
      { id: 'streak_3', title: '3 Day Streak', icon: '🔥', color: 'text-orange-400' },
      { id: 'collector', title: 'Car Collector', icon: '🏎️', color: 'text-purple-400' },
    ],
  };

  try {
    const raw = localStorage.getItem(STORAGE_RACING_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultProfile, ...parsed };
    }
  } catch (_) {}

  // If initial load, save default
  try {
    localStorage.setItem(STORAGE_RACING_PROFILE, JSON.stringify(defaultProfile));
  } catch (_) {}

  return defaultProfile;
};

/**
 * Get player garage customization
 */
export const getPlayerGarage = (currentUser) => {
  const username = currentUser?.username ? currentUser.username.toUpperCase() : 'NASIR';
  const defaultGarage = {
    selectedCarId: 'shadow_v12',
    ownedCarIds: ['shadow_v12', 'neon_gt', 'street_phantom', 'apex_x', 'thunder_rs', 'cyber_cruiser'],
    licensePlate: username,
    neonUnderglow: '#c084fc',
    paintColor: '#a855f7',
    wheelType: 'carbon_aero',
    trailEffect: 'laser_streak',
  };

  try {
    const raw = localStorage.getItem(STORAGE_RACING_GARAGE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultGarage, ...parsed };
    }
  } catch (_) {}

  try {
    localStorage.setItem(STORAGE_RACING_GARAGE, JSON.stringify(defaultGarage));
  } catch (_) {}

  return defaultGarage;
};

/**
 * Save garage changes
 */
export const savePlayerGarage = (updates) => {
  try {
    const current = getPlayerGarage();
    const merged = { ...current, ...updates };
    localStorage.setItem(STORAGE_RACING_GARAGE, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('clearfeed:racingGarageUpdated', { detail: merged }));
    return merged;
  } catch (err) {
    console.warn('Failed to save garage settings:', err);
    return null;
  }
};

/**
 * Get daily & weekly racing missions
 */
export const getRacingMissions = () => {
  const defaultMissions = {
    daily: [
      { id: 'm_letters_5000', title: 'Type 5,000 letters', progress: 2341, target: 5000, rewardCoins: 200, rewardXp: 150, claimed: false },
      { id: 'm_win_3', title: 'Win 3 races', progress: 1, target: 3, rewardCoins: 300, rewardXp: 200, claimed: false },
      { id: 'm_nitro_5', title: 'Use Nitro 5 times', progress: 2, target: 5, rewardCoins: 250, rewardXp: 180, claimed: false },
      { id: 'm_arcade_2', title: 'Play 2 Arcade games', progress: 0, target: 2, rewardCoins: 160, rewardXp: 120, claimed: false },
    ],
    weekly: [
      { id: 'w_win_10', title: 'Win 10 races this week', progress: 4, target: 10, rewardCoins: 800, rewardXp: 600, claimed: false },
      { id: 'w_speed_120', title: 'Break 120 WPM in any race', progress: 1, target: 1, rewardCoins: 500, rewardXp: 400, claimed: false },
      { id: 'w_arcade_master', title: 'Score 50+ in Typing Cricket', progress: 32, target: 50, rewardCoins: 600, rewardXp: 450, claimed: false },
    ],
  };

  try {
    const raw = localStorage.getItem(STORAGE_RACING_MISSIONS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  try {
    localStorage.setItem(STORAGE_RACING_MISSIONS, JSON.stringify(defaultMissions));
  } catch (_) {}

  return defaultMissions;
};

/**
 * Record a completed race, update stats, award XP & stars, and dispatch events
 */
export const recordRaceCompletion = ({
  wpm,
  accuracy,
  characters,
  durationSec,
  position,
  totalRacers,
  carId,
  trackId,
  nitroUsed,
  currentUser,
}) => {
  const isWinner = position === 1;
  const xpEarned = Math.round((wpm * 1.5) + (accuracy * 0.8) + (isWinner ? 250 : 120));
  const starsEarned = isWinner ? 120 : position === 2 ? 80 : 50;

  let profile = getRacingProfile(currentUser);
  const newXp = (profile.xp || 0) + xpEarned;
  let newLevel = profile.level || 1;
  let nextXp = profile.nextLevelXp || 1000;

  if (newXp >= nextXp) {
    newLevel += 1;
    nextXp = Math.round(nextXp * 1.35);
  }

  const updatedProfile = {
    ...profile,
    level: newLevel,
    xp: newXp,
    nextLevelXp: nextXp,
    stars: (profile.stars || 0) + starsEarned,
    totalRaces: (profile.totalRaces || 0) + 1,
    wins: (profile.wins || 0) + (isWinner ? 1 : 0),
    winRate: Math.round((((profile.wins || 0) + (isWinner ? 1 : 0)) / ((profile.totalRaces || 0) + 1)) * 100),
    bestWpm: Math.max(profile.bestWpm || 0, wpm),
    avgWpm: Math.round(((profile.avgWpm || 100) * 0.85) + (wpm * 0.15)),
  };

  try {
    localStorage.setItem(STORAGE_RACING_PROFILE, JSON.stringify(updatedProfile));
  } catch (_) {}

  // Update missions progress
  try {
    const missions = getRacingMissions();
    missions.daily = missions.daily.map((m) => {
      if (m.id === 'm_letters_5000') m.progress = Math.min(m.target, m.progress + characters);
      if (m.id === 'm_win_3' && isWinner) m.progress = Math.min(m.target, m.progress + 1);
      if (m.id === 'm_nitro_5' && nitroUsed) m.progress = Math.min(m.target, m.progress + nitroUsed);
      return m;
    });
    localStorage.setItem(STORAGE_RACING_MISSIONS, JSON.stringify(missions));
  } catch (_) {}

  // Save to race history
  const raceEntry = {
    id: `race_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: new Date().toISOString(),
    wpm,
    accuracy,
    characters,
    durationSec,
    position,
    totalRacers,
    carId,
    trackId,
    xpEarned,
    starsEarned,
  };

  try {
    const rawHist = localStorage.getItem(STORAGE_RACING_HISTORY);
    const hist = rawHist ? JSON.parse(rawHist) : [];
    const updatedHist = [raceEntry, ...hist].slice(0, 50);
    localStorage.setItem(STORAGE_RACING_HISTORY, JSON.stringify(updatedHist));
  } catch (_) {}

  // Dispatch events
  try {
    window.dispatchEvent(new CustomEvent('clearfeed:racingStatsUpdated', { detail: updatedProfile }));
    window.dispatchEvent(new CustomEvent('clearfeed:racingHistoryUpdated', { detail: raceEntry }));
  } catch (_) {}

  return {
    race: raceEntry,
    updatedProfile,
    xpEarned,
    starsEarned,
    isWinner,
  };
};

/**
 * Claim mission reward
 */
export const claimMissionReward = (missionId) => {
  try {
    const missions = getRacingMissions();
    let claimedItem = null;

    const checkList = (list) => {
      return list.map((m) => {
        if (m.id === missionId && m.progress >= m.target && !m.claimed) {
          m.claimed = true;
          claimedItem = m;
        }
        return m;
      });
    };

    missions.daily = checkList(missions.daily);
    missions.weekly = checkList(missions.weekly);

    if (claimedItem) {
      localStorage.setItem(STORAGE_RACING_MISSIONS, JSON.stringify(missions));
      const profile = getRacingProfile();
      profile.stars = (profile.stars || 0) + (claimedItem.rewardCoins || 0);
      profile.xp = (profile.xp || 0) + (claimedItem.rewardXp || 0);
      localStorage.setItem(STORAGE_RACING_PROFILE, JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('clearfeed:racingStatsUpdated', { detail: profile }));
      return { success: true, claimedItem, profile };
    }
  } catch (err) {
    console.warn('Error claiming mission:', err);
  }
  return { success: false };
};
