use base64::Engine;
use lofty::read_from_path;
use std::fs;
use std::path::{Path, PathBuf};

/// Extract embedded album artwork from an audio file, resize it to a
/// maximum of 256×256, cache it as a PNG in the app data directory,
/// and return the cache file path.
///
/// Returns `None` if the file has no embedded artwork.
pub fn extract_and_cache_artwork(
    track_path: &str,
    track_id: &str,
    cache_dir: &Path,
) -> Result<Option<PathBuf>, String> {
    // Ensure the cache directory exists
    fs::create_dir_all(cache_dir)
        .map_err(|e| format!("Failed to create artwork cache directory: {}", e))?;

    let cached_path = cache_dir.join(format!("{}.png", track_id));

    // If already cached, return path immediately
    if cached_path.exists() {
        return Ok(Some(cached_path));
    }

    // Read the audio file to extract embedded pictures
    let tagged_file = read_from_path(Path::new(track_path))
        .map_err(|e| format!("Failed to read audio file for artwork: {}", e))?;

    // Look for the first picture in any tag
    let mut picture_data: Option<Vec<u8>> = None;

    if let Some(tag) = tagged_file.primary_tag() {
        let pictures = tag.pictures();
        if let Some(pic) = pictures.first() {
            picture_data = Some(pic.data().to_vec());
        }
    }

    if picture_data.is_none() {
        for tag in tagged_file.tags() {
            let pictures = tag.pictures();
            if let Some(pic) = pictures.first() {
                picture_data = Some(pic.data().to_vec());
                break;
            }
        }
    }

    let data = match picture_data {
        Some(d) => d,
        None => return Ok(None),
    };

    // Decode the image data and resize
    let img = image::load_from_memory(&data)
        .map_err(|e| format!("Failed to decode artwork image: {}", e))?;

    let resized = if img.width() > 256 || img.height() > 256 {
        img.resize(256, 256, image::imageops::FilterType::Lanczos3)
    } else {
        img
    };

    // Save as PNG to the cache directory
    resized
        .save_with_format(&cached_path, image::ImageFormat::Png)
        .map_err(|e| format!("Failed to cache artwork: {}", e))?;

    Ok(Some(cached_path))
}

/// Read a cached artwork PNG from disk and return it as a base64 data URI string.
pub fn cached_artwork_as_data_uri(cached_path: &Path) -> Result<String, String> {
    let png_bytes = fs::read(cached_path)
        .map_err(|e| format!("Failed to read cached artwork: {}", e))?;

    let b64 = base64::engine::general_purpose::STANDARD.encode(&png_bytes);
    Ok(format!("data:image/png;base64,{}", b64))
}
