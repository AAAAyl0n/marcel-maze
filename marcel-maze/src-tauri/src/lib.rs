mod flasher;

use flasher::{FlashRequest, get_available_ports, get_available_firmware, flash_firmware};

#[tauri::command]
async fn list_serial_ports() -> Result<Vec<flasher::SerialPortInfo>, String> {
    get_available_ports().map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_firmware(app: tauri::AppHandle) -> Result<Vec<flasher::FirmwareInfo>, String> {
    get_available_firmware(app).map_err(|e| e.to_string())
}

#[tauri::command]
async fn flash_esp32(app: tauri::AppHandle, request: FlashRequest) -> Result<(), String> {
    flash_firmware(app, request).await.map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_serial_ports,
            list_firmware,
            flash_esp32
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
