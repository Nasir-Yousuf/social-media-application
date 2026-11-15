pub mod mesh;
pub mod storage;
pub mod tray;

use std::sync::Arc;
use tauri::{AppHandle, Manager, State};
use tokio::sync::Mutex;

use mesh::{
    generate_keypair, MeshPeerInfo, MeshRouter,
};
use storage::{
    secure_delete_token, secure_get_mesh_key, secure_get_token, secure_store_mesh_key,
    secure_store_token, CachedPost, DesktopDatabase, LearnLessonRecord, LearnProgressRecord,
};

pub struct AppState {
    pub db: Arc<Mutex<Option<DesktopDatabase>>>,
    pub router: Arc<Mutex<Option<MeshRouter>>>,
}

// --- IPC: DESKTOP INFO & SYSTEM ---
#[tauri::command]
fn get_desktop_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "appName": "Clearfeed Desktop",
        "version": "2.0.0",
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "meshTransportStatus": "READY_OFFLINE",
        "systemTrayEnabled": true,
        "sqlitePersistence": "ACTIVE",
        "credentialManager": "ACTIVE"
    }))
}

// --- IPC: WINDOWS CREDENTIAL MANAGER ---
#[tauri::command]
fn cmd_secure_store_token(token: String) -> Result<(), String> {
    secure_store_token(&token)
}

#[tauri::command]
fn cmd_secure_get_token() -> Result<Option<String>, String> {
    secure_get_token()
}

#[tauri::command]
fn cmd_secure_delete_token() -> Result<(), String> {
    secure_delete_token()
}

#[tauri::command]
fn cmd_secure_store_mesh_key(secret_hex: String, public_hex: String) -> Result<(), String> {
    secure_store_mesh_key(&secret_hex, &public_hex)
}

#[tauri::command]
fn cmd_secure_get_mesh_key() -> Result<Option<(String, String)>, String> {
    secure_get_mesh_key()
}

// --- IPC: SQLITE OFFLINE PERSISTENCE ---
#[tauri::command]
async fn cmd_db_cache_posts(
    posts: Vec<CachedPost>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db_lock = state.db.lock().await;
    if let Some(db) = db_lock.as_ref() {
        db.cache_posts(&posts)
    } else {
        Err("Database not initialized".to_string())
    }
}

#[tauri::command]
async fn cmd_db_get_posts(
    limit: i64,
    state: State<'_, AppState>,
) -> Result<Vec<CachedPost>, String> {
    let db_lock = state.db.lock().await;
    if let Some(db) = db_lock.as_ref() {
        db.get_cached_posts(limit)
    } else {
        Err("Database not initialized".to_string())
    }
}

#[tauri::command]
async fn cmd_db_cache_lessons(
    lessons: Vec<LearnLessonRecord>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db_lock = state.db.lock().await;
    if let Some(db) = db_lock.as_ref() {
        db.cache_lessons(&lessons)
    } else {
        Err("Database not initialized".to_string())
    }
}

#[tauri::command]
async fn cmd_db_get_lesson(
    lesson_id: String,
    state: State<'_, AppState>,
) -> Result<Option<LearnLessonRecord>, String> {
    let db_lock = state.db.lock().await;
    if let Some(db) = db_lock.as_ref() {
        db.get_lesson(&lesson_id)
    } else {
        Err("Database not initialized".to_string())
    }
}

#[tauri::command]
async fn cmd_db_save_learn_progress(
    progress: LearnProgressRecord,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db_lock = state.db.lock().await;
    if let Some(db) = db_lock.as_ref() {
        db.save_learn_progress(&progress)
    } else {
        Err("Database not initialized".to_string())
    }
}

// --- IPC: NATIVE CLEARFEED MESH NETWORKING ---
#[tauri::command]
async fn mesh_start(
    nickname: String,
    state: State<'_, AppState>,
    _app: AppHandle,
) -> Result<(), String> {
    let mut router_lock = state.router.lock().await;
    if router_lock.is_none() {
        let (signing_key, verifying_key) = generate_keypair();
        let pub_bytes = verifying_key.to_bytes();
        let sec_bytes = signing_key.to_bytes();

        let router = MeshRouter::new(pub_bytes, sec_bytes, nickname);
        *router_lock = Some(router);
    }
    Ok(())
}

#[tauri::command]
async fn mesh_stop(state: State<'_, AppState>) -> Result<(), String> {
    let mut router_lock = state.router.lock().await;
    *router_lock = None;
    Ok(())
}

#[tauri::command]
async fn mesh_get_peers(state: State<'_, AppState>) -> Result<Vec<MeshPeerInfo>, String> {
    let router_lock = state.router.lock().await;
    if let Some(router) = router_lock.as_ref() {
        Ok(router.get_peers_list())
    } else {
        Ok(Vec::new())
    }
}

#[tauri::command]
async fn mesh_get_diagnostics(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let router_lock = state.router.lock().await;
    if let Some(router) = router_lock.as_ref() {
        Ok(router.get_diagnostics())
    } else {
        Ok(serde_json::json!({
            "status": "STOPPED",
            "peersCount": 0
        }))
    }
}

#[tauri::command]
async fn mesh_set_battery_saver(
    enabled: bool,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut router_lock = state.router.lock().await;
    if let Some(router) = router_lock.as_mut() {
        router.battery_saver_mode = enabled;
        Ok(())
    } else {
        Err("Mesh router not active".to_string())
    }
}

#[tauri::command]
async fn mesh_set_relay_enabled(
    enabled: bool,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut router_lock = state.router.lock().await;
    if let Some(router) = router_lock.as_mut() {
        router.relay_enabled = enabled;
        Ok(())
    } else {
        Err("Mesh router not active".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            db: Arc::new(Mutex::new(None)),
            router: Arc::new(Mutex::new(None)),
        })
        .setup(|app| {
            // 1. Initialize System Tray
            if let Err(e) = tray::create_system_tray(app.handle()) {
                eprintln!("[Desktop Tray Warning] Failed to initialize system tray: {}", e);
            }

            // 2. Initialize SQLite database in AppData
            if let Ok(app_data_dir) = app.path().app_data_dir() {
                if let Ok(db) = DesktopDatabase::new(app_data_dir) {
                    let state = app.state::<AppState>();
                    let db_arc = state.db.clone();
                    tauri::async_runtime::spawn(async move {
                        let mut lock = db_arc.lock().await;
                        *lock = Some(db);
                    });
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_desktop_info,
            cmd_secure_store_token,
            cmd_secure_get_token,
            cmd_secure_delete_token,
            cmd_secure_store_mesh_key,
            cmd_secure_get_mesh_key,
            cmd_db_cache_posts,
            cmd_db_get_posts,
            cmd_db_cache_lessons,
            cmd_db_get_lesson,
            cmd_db_save_learn_progress,
            mesh_start,
            mesh_stop,
            mesh_get_peers,
            mesh_get_diagnostics,
            mesh_set_battery_saver,
            mesh_set_relay_enabled
        ])
        .run(tauri::generate_context!())
        .expect("error while running Clearfeed Desktop application");
}
