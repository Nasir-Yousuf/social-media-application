use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

pub fn create_system_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let open_item = MenuItem::with_id(app, "open", "Open Clearfeed", true, None::<&str>)?;
    let mute_item = MenuItem::with_id(app, "toggle_mute", "Mute / Unmute Call", true, None::<&str>)?;
    let relay_item = MenuItem::with_id(app, "toggle_relay", "Toggle Mesh Relay", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit Clearfeed", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&open_item, &mute_item, &relay_item, &quit_item])?;

    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Clearfeed - Connected Offline Mesh & Live Calling")
        .icon(app.default_window_icon().unwrap().clone())
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
            "toggle_mute" => {
                let _ = app.emit("desktop://toggle-mute", ());
            }
            "toggle_relay" => {
                let _ = app.emit("desktop://toggle-relay", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}
