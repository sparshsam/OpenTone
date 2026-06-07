use lofty::read_from_path;
use std::path::Path;
use std::time::UNIX_EPOCH;

use crate::TrackInfo;

/// Extract real audio metadata using the `lofty` library.
/// Returns a fully populated `TrackInfo` struct with file-based fallbacks.
pub fn extract_metadata(file_path: &Path) -> Result<TrackInfo, String> {
    let path_str = file_path.to_string_lossy().to_string();

    // Determine format from extension
    let format = file_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    // Get file system metadata
    let file_meta = std::fs::metadata(file_path)
        .map_err(|e| format!("Cannot read file metadata for '{}': {}", path_str, e))?;

    let file_size = file_meta.len();
    let modified_at = file_meta
        .modified()
        .ok()
        .and_then(|t| {
            t.duration_since(UNIX_EPOCH)
                .ok()
                .and_then(|d| chrono::DateTime::from_timestamp(d.as_secs() as i64, 0))
                .map(|dt| dt.to_rfc3339())
        })
        .unwrap_or_default();

    // Extract audio metadata with lofty
    let tagged_file = read_from_path(file_path)
        .map_err(|e| format!("Failed to read audio metadata from '{}': {}", path_str, e))?;

    let properties = tagged_file.properties();

    let duration = properties.duration().as_secs_f64();
    let bitrate = properties.audio_bitrate().unwrap_or(0) as i32;
    let sample_rate = properties.sample_rate().unwrap_or(0) as i32;

    // Extract tag information from the primary tag (or any available tag)
    let mut title = String::new();
    let mut artist = String::new();
    let mut album = String::new();
    let mut album_artist = String::new();
    let mut track_number: i32 = 0;
    let mut disc_number: i32 = 1;
    let mut year: i32 = 0;
    let mut has_artwork: bool = false;

    // Try primary tag first
    if let Some(tag) = tagged_file.primary_tag() {
        title = tag.title().unwrap_or("").to_string();
        artist = tag.artist().unwrap_or("").to_string();
        album = tag.album().unwrap_or("").to_string();
        album_artist = tag
            .album_artist()
            .unwrap_or("")
            .to_string();
        track_number = tag.track().unwrap_or(0) as i32;
        disc_number = tag.disk().unwrap_or(1) as i32;
        year = tag.year().unwrap_or(0) as i32;
        has_artwork = !tag.pictures().is_empty();
    }

    // If primary tag had nothing, try all tags
    if title.is_empty() {
        for tag in tagged_file.tags() {
            if let Some(t) = tag.title() {
                if !t.is_empty() {
                    title = t.to_string();
                    break;
                }
            }
        }
    }
    if artist.is_empty() {
        for tag in tagged_file.tags() {
            if let Some(a) = tag.artist() {
                if !a.is_empty() {
                    artist = a.to_string();
                    break;
                }
            }
        }
    }
    if album.is_empty() {
        for tag in tagged_file.tags() {
            if let Some(a) = tag.album() {
                if !a.is_empty() {
                    album = a.to_string();
                    break;
                }
            }
        }
    }

    // Fall back to filename-based title
    if title.is_empty() {
        title = file_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Unknown Track")
            .to_string();
    }

    // Fall back to "Unknown" for missing fields
    if artist.is_empty() {
        artist = "Unknown Artist".to_string();
    }
    if album.is_empty() {
        album = "Unknown Album".to_string();
    }
    if album_artist.is_empty() {
        // Default to artist if album_artist is not set
        album_artist = artist.clone();
    }

    Ok(TrackInfo {
        id: uuid::Uuid::new_v4().to_string(),
        path: path_str,
        title,
        artist,
        album,
        album_artist,
        track_number,
        disc_number,
        year,
        duration,
        format,
        bitrate,
        sample_rate,
        file_size,
        modified_at,
        is_favorite: false,
        has_artwork,
    })
}
