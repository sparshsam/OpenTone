mod artwork;
mod db;
mod metadata;

use serde::Serialize;
use std::collections::HashMap;
use std::path::Path;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use walkdir::WalkDir;

// ---------------------------------------------------------------------------
// Data structures returned to the frontend
// ---------------------------------------------------------------------------

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
    pub has_artwork: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct AlbumInfo {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub year: i32,
    pub track_count: i32,
    pub duration: f64,
    pub has_artwork: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct ArtistInfo {
    pub id: String,
    pub name: String,
    pub album_count: i32,
    pub track_count: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct PlaylistInfo {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
    pub track_count: i32,
}

// ---------------------------------------------------------------------------
// Application state
// ---------------------------------------------------------------------------

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
}

// ---------------------------------------------------------------------------
// Supported audio formats
// ---------------------------------------------------------------------------

const SUPPORTED_FORMATS: &[&str] = &["mp3", "flac", "wav", "aac", "m4a", "ogg", "opus", "wv", "aiff"];

fn is_supported(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .is_some_and(|ext| SUPPORTED_FORMATS.contains(&ext.as_str()))
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Get the canonical artwork cache directory inside the Tauri app data dir.
fn artwork_cache_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    Ok(app_dir.join("artwork"))
}

/// Walk a directory, parse metadata for every supported audio file,
/// persist to SQLite, and return the list of `TrackInfo`.
fn index_folder(
    conn: &rusqlite::Connection,
    path: &str,
) -> Result<Vec<TrackInfo>, String> {
    let mut tracks: Vec<TrackInfo> = Vec::new();
    let mut errors: Vec<String> = Vec::new();

    for entry in WalkDir::new(path)
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

        match metadata::extract_metadata(file_path) {
            Ok(track) => {
                if let Err(e) = db::upsert_track(conn, &track) {
                    errors.push(format!("DB insert failed for '{}': {}", track.path, e));
                } else {
                    tracks.push(track);
                }
            }
            Err(e) => {
                errors.push(e);
            }
        }
    }

    // Record this path as indexed
    if let Err(e) = db::upsert_indexed_path(conn, path, tracks.len() as i32) {
        errors.push(format!("Failed to record indexed path: {}", e));
    }

    // If there were any errors, surface them as a single string (non-fatal)
    if !errors.is_empty() {
        eprintln!("Indexing warnings for '{}':\n  {}", path, errors.join("\n  "));
    }

    tracks.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(tracks)
}

// ---------------------------------------------------------------------------
// Tauri commands - Library
// ---------------------------------------------------------------------------

/// Recursively scan a folder, extract real metadata with `lofty`, store in
/// SQLite, and return the list of tracks.
#[tauri::command]
fn scan_folder(path: String, state: State<AppState>) -> Result<Vec<TrackInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    index_folder(&conn, &path)
}

/// Return all tracks from the SQLite library.
#[tauri::command]
fn get_library(state: State<AppState>) -> Result<Vec<TrackInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::get_all_tracks(&conn)
}

/// Return albums aggregated from the database.
#[tauri::command]
fn get_albums(state: State<AppState>) -> Result<Vec<AlbumInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::get_albums(&conn)
}

/// Return artists aggregated from the database.
#[tauri::command]
fn get_artists(state: State<AppState>) -> Result<Vec<ArtistInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::get_artists(&conn)
}

/// Extract embedded album artwork for a track, resize, cache, and return as
/// a base64 data URI string.
#[tauri::command]
fn get_album_artwork(
    track_id: String,
    state: State<AppState>,
    app: AppHandle,
) -> Result<Option<String>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

    let track = db::get_track_by_id(&conn, &track_id)?;
    let cache_dir = artwork_cache_dir(&app)?;

    // Drop lock before I/O-heavy artwork extraction
    drop(conn);

    let cached = artwork::extract_and_cache_artwork(&track.path, &track_id, &cache_dir)?;

    match cached {
        Some(path) => {
            let uri = artwork::cached_artwork_as_data_uri(&path)?;

            // Update the has_artwork flag if it wasn't set
            if !track.has_artwork {
                if let Ok(conn) = state.db.lock() {
                    let _ = db::set_track_has_artwork(&conn, &track_id, true);
                }
            }

            Ok(Some(uri))
        }
        None => Ok(None),
    }
}

/// Toggle the favourite status of a track. Returns the new state.
#[tauri::command]
fn toggle_favorite(track_id: String, state: State<AppState>) -> Result<bool, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::toggle_track_favorite(&conn, &track_id)
}

/// Search tracks by title, artist, or album.
#[tauri::command]
fn search_tracks(query: String, state: State<AppState>) -> Result<Vec<TrackInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::search_tracks(&conn, &query)
}

/// Re-scan all previously indexed paths and update the database.
/// Tracks that no longer exist on disk are removed.
#[tauri::command]
fn rescan_library(state: State<AppState>) -> Result<Vec<TrackInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;

    let indexed_paths = db::get_indexed_paths(&conn)?;

    if indexed_paths.is_empty() {
        return Ok(Vec::new());
    }

    let mut all_valid_paths: Vec<String> = Vec::new();
    let mut all_tracks: Vec<TrackInfo> = Vec::new();

    for dir_path in &indexed_paths {
        match index_folder(&conn, dir_path) {
            Ok(tracks) => {
                for t in &tracks {
                    all_valid_paths.push(t.path.clone());
                }
                all_tracks.extend(tracks);
            }
            Err(e) => {
                eprintln!("Warning: failed to rescan '{}': {}", dir_path, e);
            }
        }
    }

    let deleted = db::remove_missing_tracks_by_paths(&conn, &all_valid_paths)?;
    if deleted > 0 {
        eprintln!("Removed {} stale track(s) from the library.", deleted);
    }

    all_tracks.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(all_tracks)
}

/// Get all settings as a HashMap.
#[tauri::command]
fn get_settings(state: State<AppState>) -> Result<HashMap<String, String>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::get_all_settings(&conn)
}

/// Set a single setting value.
#[tauri::command]
fn set_setting(
    key: String,
    value: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::set_setting(&conn, &key, &value)
}

/// Return the list of supported audio formats.
#[tauri::command]
fn get_supported_formats() -> Vec<String> {
    SUPPORTED_FORMATS.iter().map(|s| s.to_string()).collect()
}

// ---------------------------------------------------------------------------
// Tauri commands - Playlists
// ---------------------------------------------------------------------------

/// Get all playlists.
#[tauri::command]
fn get_playlists(state: State<AppState>) -> Result<Vec<PlaylistInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::get_playlists(&conn)
}

/// Create a new playlist.
#[tauri::command]
fn create_playlist(name: String, state: State<AppState>) -> Result<String, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::create_playlist(&conn, &name)
}

/// Rename a playlist.
#[tauri::command]
fn rename_playlist(
    playlist_id: String,
    name: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::rename_playlist(&conn, &playlist_id, &name)
}

/// Delete a playlist.
#[tauri::command]
fn delete_playlist(playlist_id: String, state: State<AppState>) -> Result<(), String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::delete_playlist(&conn, &playlist_id)
}

/// Add a track to a playlist.
#[tauri::command]
fn add_to_playlist(
    playlist_id: String,
    track_id: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::add_to_playlist(&conn, &playlist_id, &track_id)
}

/// Remove a track from a playlist.
#[tauri::command]
fn remove_from_playlist(
    playlist_id: String,
    track_id: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::remove_from_playlist(&conn, &playlist_id, &track_id)
}

/// Get all tracks in a playlist.
#[tauri::command]
fn get_playlist_tracks(
    playlist_id: String,
    state: State<AppState>,
) -> Result<Vec<TrackInfo>, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to acquire database lock: {}", e))?;
    db::get_playlist_tracks(&conn, &playlist_id)
}

// ---------------------------------------------------------------------------
// Application entrypoint
// ---------------------------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
            std::fs::create_dir_all(&app_dir)
                .map_err(|e| format!("Failed to create app data dir: {}", e))?;

            let db_path = app_dir.join("library.db");
            let conn = rusqlite::Connection::open(&db_path)
                .map_err(|e| format!("Failed to open SQLite database: {}", e))?;

            conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
                .map_err(|e| format!("Failed to set pragmas: {}", e))?;

            db::initialize_db(&conn)?;

            app.manage(AppState {
                db: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_folder,
            get_library,
            get_albums,
            get_artists,
            get_album_artwork,
            toggle_favorite,
            search_tracks,
            rescan_library,
            get_settings,
            set_setting,
            get_supported_formats,
            get_playlists,
            create_playlist,
            rename_playlist,
            delete_playlist,
            add_to_playlist,
            remove_from_playlist,
            get_playlist_tracks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
