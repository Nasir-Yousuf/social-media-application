import { LESSONS, TRACKS } from '../data/learningCurriculum.js';
import { LESSON_QUIZZES } from '../data/lessonQuizzes.js';

async function getApiClient() {
  try {
    const mod = await import('../api/client.js');
    return mod.default || mod;
  } catch {
    return null;
  }
}

const memStore = new Map();
const AsyncStorage = {
  getItem: async (key) => {
    try {
      const mod = await import('@react-native-async-storage/async-storage').catch(() => null);
      const storage = mod?.default || mod;
      if (storage?.getItem) return await storage.getItem(key);
    } catch {}
    return memStore.get(key) || null;
  },
  setItem: async (key, val) => {
    try {
      const mod = await import('@react-native-async-storage/async-storage').catch(() => null);
      const storage = mod?.default || mod;
      if (storage?.setItem) return await storage.setItem(key, val);
    } catch {}
    memStore.set(key, val);
  },
  removeItem: async (key) => {
    try {
      const mod = await import('@react-native-async-storage/async-storage').catch(() => null);
      const storage = mod?.default || mod;
      if (storage?.removeItem) return await storage.removeItem(key);
    } catch {}
    memStore.delete(key);
  },
};

const NetInfo = {
  fetch: async () => {
    try {
      const mod = await import('@react-native-community/netinfo').catch(() => null);
      const net = mod?.default || mod;
      if (net?.fetch) return await net.fetch();
    } catch {}
    return { isConnected: true, isInternetReachable: true };
  },
};

const OUTBOX_KEY = 'clearfeed_learn_outbox';
const PROGRESS_KEY = 'clearfeed_learning_progress';
const DOWNLOADED_TRACKS_KEY = 'clearfeed_downloaded_tracks';
const OFFLINE_TRACK_PREFIX = 'clearfeed_offline_track_';

let isSyncing = false;

/**
 * Record a completed lesson / quiz offline, update local progress optimistically,
 * and attempt to flush outbox if network is available.
 */
export async function recordOfflineCompletion(lessonId, trackId, quizScore = null) {
  if (!lessonId) return null;

  try {
    // 1. Update local progress optimistically
    const rawProgress = await AsyncStorage.getItem(PROGRESS_KEY).catch(() => null);
    let progress = {};
    try {
      progress = rawProgress ? JSON.parse(rawProgress) : {};
    } catch {}

    const completed = Array.isArray(progress.completedLessons) ? [...progress.completedLessons] : [];
    const isNew = !completed.includes(lessonId);

    if (isNew) {
      completed.push(lessonId);
    }

    const currentXP = progress.xp || 0;
    const nextXP = isNew ? currentXP + 25 : currentXP;

    const lastByTrack = { ...(progress.lastLessonByTrack || {}) };
    if (trackId) {
      lastByTrack[trackId] = lessonId;
    }

    const updatedProgress = {
      ...progress,
      completedLessons: completed,
      xp: nextXP,
      currentTrack: trackId || progress.currentTrack,
      currentLessonId: lessonId,
      lastLessonByTrack: lastByTrack,
      lastActiveAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedProgress));

    // 2. Queue into outbox for deterministic sync
    const rawOutbox = await AsyncStorage.getItem(OUTBOX_KEY).catch(() => null);
    let outbox = [];
    try {
      outbox = rawOutbox ? JSON.parse(rawOutbox) : [];
      if (!Array.isArray(outbox)) outbox = [];
    } catch {
      outbox = [];
    }

    // Avoid duplicate queueing of the same lesson
    const alreadyQueued = outbox.some((item) => item.lessonId === lessonId);
    if (!alreadyQueued) {
      outbox.push({
        lessonId,
        trackId,
        quizScore,
        completedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
    }

    // 3. Trigger immediate sync in background if online
    syncOutbox().catch(() => {});

    return { updatedProgress, isNew, nextXP };
  } catch (err) {
    console.warn('[LearnSync] recordOfflineCompletion error:', err);
    return null;
  }
}

/**
 * Flush all queued offline completions to the server via POST /api/learning/sync-progress
 */
export async function syncOutbox() {
  if (isSyncing) return { synced: 0, pending: 0 };

  try {
    const net = await NetInfo.fetch();
    if (!net.isConnected || !net.isInternetReachable) {
      return { synced: 0, pending: await getPendingCount() };
    }

    const rawOutbox = await AsyncStorage.getItem(OUTBOX_KEY).catch(() => null);
    if (!rawOutbox) return { synced: 0, pending: 0 };

    let outbox = [];
    try {
      outbox = JSON.parse(rawOutbox);
      if (!Array.isArray(outbox) || outbox.length === 0) return { synced: 0, pending: 0 };
    } catch {
      return { synced: 0, pending: 0 };
    }

    isSyncing = true;

    const api = await getApiClient();
    if (!api) {
      isSyncing = false;
      return { synced: 0, pending: outbox.length };
    }

    // Send batch sync request (idempotent set-union on server)
    const res = await api.post(
      '/learning/sync-progress',
      {
        progress: outbox,
      },
      { silent: true }
    );

    if (res?.data?.success || res?.status === 200) {
      // Clear outbox upon verified server confirmation
      await AsyncStorage.removeItem(OUTBOX_KEY);

      // Merge server progress with local state
      if (res?.data?.progress) {
        const serverProg = res.data.progress;
        const rawLocal = await AsyncStorage.getItem(PROGRESS_KEY).catch(() => null);
        let localProg = {};
        try {
          localProg = rawLocal ? JSON.parse(rawLocal) : {};
        } catch {}

        const merged = {
          ...localProg,
          ...serverProg,
          completedLessons: Array.from(
            new Set([
              ...(localProg.completedLessons || []),
              ...(serverProg.completedLessons || []),
            ])
          ),
          xp: Math.max(localProg.xp || 0, serverProg.xp || 0),
        };

        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
      }

      return {
        synced: outbox.length,
        pending: 0,
        xpAwarded: res?.data?.xpAwarded || 0,
      };
    }

    return { synced: 0, pending: outbox.length };
  } catch (err) {
    // Keep outbox intact for next retry
    return { synced: 0, pending: await getPendingCount() };
  } finally {
    isSyncing = false;
  }
}

/**
 * Get count of pending offline completions in outbox
 */
export async function getPendingCount() {
  try {
    const raw = await AsyncStorage.getItem(OUTBOX_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Download a learning track with all its lessons and quizzes for offline study
 */
export async function downloadTrack(trackId) {
  if (!trackId) return false;

  try {
    const track = TRACKS.find((t) => t.id === trackId);
    if (!track) return false;

    const trackLessons = LESSONS.filter((l) => l.track === trackId);
    const quizzes = {};
    for (const l of trackLessons) {
      if (LESSON_QUIZZES[l.id]) {
        quizzes[l.id] = LESSON_QUIZZES[l.id];
      }
    }

    const bundle = {
      track,
      lessons: trackLessons,
      quizzes,
      downloadedAt: new Date().toISOString(),
    };

    // Store track bundle locally
    await AsyncStorage.setItem(`${OFFLINE_TRACK_PREFIX}${trackId}`, JSON.stringify(bundle));

    // Update downloaded list
    const downloaded = await getDownloadedTracks();
    if (!downloaded.includes(trackId)) {
      downloaded.push(trackId);
      await AsyncStorage.setItem(DOWNLOADED_TRACKS_KEY, JSON.stringify(downloaded));
    }

    return true;
  } catch (err) {
    console.warn('[LearnSync] downloadTrack error:', err);
    return false;
  }
}

/**
 * Get list of track IDs downloaded for offline study
 */
export async function getDownloadedTracks() {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADED_TRACKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Remove an offline track bundle from local storage
 */
export async function deleteDownloadedTrack(trackId) {
  try {
    await AsyncStorage.removeItem(`${OFFLINE_TRACK_PREFIX}${trackId}`);
    const downloaded = await getDownloadedTracks();
    const updated = downloaded.filter((id) => id !== trackId);
    await AsyncStorage.setItem(DOWNLOADED_TRACKS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export default {
  recordOfflineCompletion,
  syncOutbox,
  getPendingCount,
  downloadTrack,
  getDownloadedTracks,
  deleteDownloadedTrack,
};
