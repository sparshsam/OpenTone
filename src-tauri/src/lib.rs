use serde::Serialize;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize)]
pub struct TrackInfo {
    pub id: String,
    pub path: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub album_artist: String,
    pub track_number: i32,
    pub disc_number: i32,
    pub year: i32,
    pub duration: f64,
    pub format: String,
    pub bitrate: i32,
    pub sample_rate: i32,
    pub file_size: u64,
    pub modified_at: String,
    pub is_favorite: bool,
}

const SUPPORTED_FORMATS: &[&str] = &["mp3", "flac", "wav", "aac", "m4a", "ogg"];

fn is_supported(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .is_some_and(|ext| SUPPORTED_FORMATS.contains(&ext.as_str()))
}

#[tauri::command]
fn scan_music_folder(path: String) -> Result<Vec<TrackInfo>, String> {
    let mut tracks = Vec::new();

    for entry in WalkDir::new(&path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if !entry.file_type().is_file() {
            continue;
        }

        let file_path = entry.path();
        if !is_supported(file_path) {
            continue;
        }

        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let file_name = file_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Unknown")
            .to_string();

        let format = file_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        let modified = metadata
            .modified()
            .map(|t| {
                let secs = t
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();
                chrono::DateTime::from_timestamp(secs as i64, 0)
                    .map(|dt| dt.to_rfc3339())
                    .unwrap_or_default()
            })
            .unwrap_or_default();

        tracks.push(TrackInfo {
            id: uuid::Uuid::new_v4().to_string(),
            path: file_path.to_string_lossy().to_string(),
            title: file_name,
            artist: "Unknown Artist".to_string(),
            album: "Unknown Album".to_string(),
            album_artist: "Unknown Artist".to_string(),
            track_number: 0,
            disc_number: 1,
            year: 0,
            duration: 0.0, // Would use a metadata parser in production
            format,
            bitrate: 0,
            sample_rate: 0,
            file_size: metadata.len(),
            modified_at: modified,
            is_favorite: false,
        });
    }

    // Sort by path for deterministic ordering
    tracks.sort_by(|a, b| a.path.cmp(&b.path));

    Ok(tracks)
}

#[tauri::command]
fn get_supported_formats() -> Vec<String> {
    SUPPORTED_FORMATS.iter().map(|s| s.to_string()).collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            scan_music_folder,
            get_supported_formats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
