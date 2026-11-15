use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedPost {
    pub id: String,
    pub title: String,
    pub content: String,
    pub author: String,
    pub likes_count: i64,
    pub comments_count: i64,
    pub created_at: String,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearnLessonRecord {
    pub lesson_id: String,
    pub track_id: String,
    pub title: String,
    pub content_en: String,
    pub content_bn: String,
    pub exercises_json: String,
    pub order_index: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearnProgressRecord {
    pub lesson_id: String,
    pub completed: bool,
    pub score: i64,
    pub last_accessed_at: i64,
}

pub struct DesktopDatabase {
    pub conn_path: PathBuf,
}

impl DesktopDatabase {
    pub fn new(app_data_dir: PathBuf) -> Result<Self, String> {
        let db_dir = app_data_dir.join("Clearfeed");
        std::fs::create_dir_all(&db_dir).map_err(|e| e.to_string())?;
        let conn_path = db_dir.join("clearfeed_desktop.db");

        let db = Self { conn_path };
        db.init_schema()?;
        let _ = db.vacuum_and_prune();
        Ok(db)
    }

    fn get_connection(&self) -> Result<Connection, String> {
        Connection::open(&self.conn_path).map_err(|e| e.to_string())
    }

    pub fn init_schema(&self) -> Result<(), String> {
        let conn = self.get_connection()?;

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS cached_posts (
                id TEXT PRIMARY KEY,
                title TEXT,
                content TEXT,
                author TEXT,
                likes_count INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS learn_lessons (
                lesson_id TEXT PRIMARY KEY,
                track_id TEXT,
                title TEXT,
                content_en TEXT,
                content_bn TEXT,
                exercises_json TEXT,
                order_index INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_lessons_track ON learn_lessons(track_id, order_index);

            CREATE TABLE IF NOT EXISTS learn_progress (
                lesson_id TEXT PRIMARY KEY,
                completed INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                last_accessed_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS mesh_messages (
                id TEXT PRIMARY KEY,
                conv_id TEXT,
                sender_pubkey TEXT,
                recipient_pubkey TEXT,
                text TEXT,
                timestamp INTEGER,
                is_outgoing INTEGER,
                delivery_state TEXT,
                hop_count INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_mesh_conv ON mesh_messages(conv_id, timestamp ASC);

            CREATE TABLE IF NOT EXISTS store_and_forward_packets (
                packet_id TEXT PRIMARY KEY,
                sender_pubkey TEXT,
                recipient_pubkey TEXT,
                packet_type INTEGER,
                priority INTEGER,
                raw_hex TEXT,
                size_bytes INTEGER,
                created_at INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_sf_created ON store_and_forward_packets(created_at ASC);
            ",
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn cache_posts(&self, posts: &[CachedPost]) -> Result<(), String> {
        let mut conn = self.get_connection()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        for p in posts {
            tx.execute(
                "INSERT OR REPLACE INTO cached_posts (id, title, content, author, likes_count, comments_count, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![p.id, p.title, p.content, p.author, p.likes_count, p.comments_count, p.created_at, p.updated_at],
            ).map_err(|e| e.to_string())?;
        }

        tx.commit().map_err(|e| e.to_string())
    }

    pub fn get_cached_posts(&self, limit: i64) -> Result<Vec<CachedPost>, String> {
        let conn = self.get_connection()?;
        let mut stmt = conn
            .prepare("SELECT id, title, content, author, likes_count, comments_count, created_at, updated_at FROM cached_posts ORDER BY updated_at DESC LIMIT ?1")
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![limit], |row| {
                Ok(CachedPost {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    author: row.get(3)?,
                    likes_count: row.get(4)?,
                    comments_count: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut results = Vec::new();
        for r in rows {
            if let Ok(post) = r {
                results.push(post);
            }
        }
        Ok(results)
    }

    pub fn cache_lessons(&self, lessons: &[LearnLessonRecord]) -> Result<(), String> {
        let mut conn = self.get_connection()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        for l in lessons {
            tx.execute(
                "INSERT OR REPLACE INTO learn_lessons (lesson_id, track_id, title, content_en, content_bn, exercises_json, order_index)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![l.lesson_id, l.track_id, l.title, l.content_en, l.content_bn, l.exercises_json, l.order_index],
            ).map_err(|e| e.to_string())?;
        }

        tx.commit().map_err(|e| e.to_string())
    }

    pub fn get_lesson(&self, lesson_id: &str) -> Result<Option<LearnLessonRecord>, String> {
        let conn = self.get_connection()?;
        let mut stmt = conn
            .prepare("SELECT lesson_id, track_id, title, content_en, content_bn, exercises_json, order_index FROM learn_lessons WHERE lesson_id = ?1")
            .map_err(|e| e.to_string())?;

        let mut rows = stmt
            .query_map(params![lesson_id], |row| {
                Ok(LearnLessonRecord {
                    lesson_id: row.get(0)?,
                    track_id: row.get(1)?,
                    title: row.get(2)?,
                    content_en: row.get(3)?,
                    content_bn: row.get(4)?,
                    exercises_json: row.get(5)?,
                    order_index: row.get(6)?,
                })
            })
            .map_err(|e| e.to_string())?;

        if let Some(res) = rows.next() {
            res.map(Some).map_err(|e| e.to_string())
        } else {
            Ok(None)
        }
    }

    pub fn save_learn_progress(&self, progress: &LearnProgressRecord) -> Result<(), String> {
        let conn = self.get_connection()?;
        conn.execute(
            "INSERT OR REPLACE INTO learn_progress (lesson_id, completed, score, last_accessed_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![
                progress.lesson_id,
                if progress.completed { 1 } else { 0 },
                progress.score,
                progress.last_accessed_at
            ],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn vacuum_and_prune(&self) -> Result<(usize, usize), String> {
        let conn = self.get_connection()?;
        let now_ms = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as i64;
        let ttl_cutoff = now_ms - (48 * 3600 * 1000); // 48 hours

        // 1. Purge expired store-and-forward packets (>48 hours)
        let pruned_packets = conn
            .execute(
                "DELETE FROM store_and_forward_packets WHERE created_at < ?1",
                params![ttl_cutoff],
            )
            .unwrap_or(0);

        // 2. Trim cached posts beyond the most recent 500 posts
        let pruned_posts = conn
            .execute(
                "DELETE FROM cached_posts WHERE id NOT IN (
                    SELECT id FROM cached_posts ORDER BY updated_at DESC LIMIT 500
                )",
                [],
            )
            .unwrap_or(0);

        // 3. Compact database pages
        let _ = conn.execute_batch("PRAGMA incremental_vacuum(50);");

        Ok((pruned_packets, pruned_posts))
    }
}
