/**
 * Native SQLite Offline Storage Bridge for Clearfeed Desktop (Tauri 2 + rusqlite)
 * 
 * Manages cached feed posts, 446 Learn lessons, learn progress, and offline mesh messages.
 * Automatically uses rusqlite when running natively on Windows, and falls back to browser storage.
 */

import { isTauri } from './secureStorage';

export interface CachedPostRecord {
  id: string;
  title: string;
  content: string;
  author: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: number;
}

export interface LearnLessonRecord {
  lesson_id: string;
  track_id: string;
  title: string;
  content_en: string;
  content_bn: string;
  exercises_json: string;
  order_index: number;
}

export interface LearnProgressRecord {
  lesson_id: string;
  completed: boolean;
  score: number;
  last_accessed_at: number;
}

async function getTauriInvoke() {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke;
  } catch {
    return null;
  }
}

export const desktopDb = {
  /**
   * Cache recent feed posts to native SQLite
   */
  async cachePosts(posts: CachedPostRecord[]): Promise<void> {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        await invoke('cmd_db_cache_posts', { posts });
        return;
      }
    } catch (err) {
      console.warn('[DesktopDB] Cache posts notice:', err);
    }

    try {
      localStorage.setItem('clearfeed_cached_posts', JSON.stringify(posts.slice(0, 50)));
    } catch {}
  },

  /**
   * Retrieve cached feed posts from native SQLite or localStorage
   */
  async getCachedPosts(limit: number = 30): Promise<CachedPostRecord[]> {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        return (await invoke('cmd_db_get_posts', { limit })) as CachedPostRecord[];
      }
    } catch (err) {
      console.warn('[DesktopDB] Get cached posts notice:', err);
    }

    try {
      const raw = localStorage.getItem('clearfeed_cached_posts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Cache curriculum lessons to native SQLite
   */
  async cacheLessons(lessons: LearnLessonRecord[]): Promise<void> {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        await invoke('cmd_db_cache_lessons', { lessons });
        return;
      }
    } catch (err) {
      console.warn('[DesktopDB] Cache lessons notice:', err);
    }
  },

  /**
   * Retrieve a specific lesson by ID
   */
  async getLesson(lessonId: string): Promise<LearnLessonRecord | null> {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        return (await invoke('cmd_db_get_lesson', { lessonId })) as LearnLessonRecord | null;
      }
    } catch (err) {
      console.warn('[DesktopDB] Get lesson notice:', err);
    }
    return null;
  },

  /**
   * Save user lesson progress
   */
  async saveLearnProgress(progress: LearnProgressRecord): Promise<void> {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        await invoke('cmd_db_save_learn_progress', { progress });
        return;
      }
    } catch (err) {
      console.warn('[DesktopDB] Save learn progress notice:', err);
    }

    try {
      const mapRaw = localStorage.getItem('clearfeed_learn_progress') || '{}';
      const map = JSON.parse(mapRaw);
      map[progress.lesson_id] = progress;
      localStorage.setItem('clearfeed_learn_progress', JSON.stringify(map));
    } catch {}
  },
};

export default desktopDb;
