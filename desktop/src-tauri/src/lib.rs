#[tauri::command]
fn get_desktop_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "appName": "Clearfeed Desktop",
        "version": "2.0.0",
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "meshTransportStatus": "READY_OFFLINE"
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_desktop_info])
        .run(tauri::generate_context!())
        .expect("error while running Clearfeed Desktop application");
}
