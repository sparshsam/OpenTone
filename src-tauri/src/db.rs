use rusqlite::{Connection, params};
use std::collections::HashMap;

use crate::{AlbumInfo, ArtistInfo, PlaylistInfo, TrackInfo};

/// Initialize the database schema, creating all tables if they don't exist.
pub fn initialize_db(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS tracks (
            id TEXT PRIMARY KEY,
            path TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            artist TEXT NOT NULL DEFAULT 'Unknown Artist',
            album TEXT NOT NULL DEFAULT 'Unknown Album',
            album_artist TEXT NOT NULL DEFAULT 'Unknown Artist',
            track_number INTEGER DEFAULT 0,
            disc_number INTEGER DEFAULT 1,
            year INTEGER DEFAULT 0,
            duration REAL DEFAULT 0.0,
            format TEXT NOT NULL,
            bitrate INTEGER DEFAULT 0,
            sample_rate INTEGER DEFAULT 0,
            file_size INTEGER DEFAULT 0,
            modified_at TEXT,
            is_favorite INTEGER DEFAULT 0,
            has_artwork INTEGER DEFAULT 0,
            last_indexed_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS albums (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            year INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS artists (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS playlists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS playlist_tracks (
            playlist_id TEXT NOT NULL,
            track_id TEXT NOT NULL,
            position INTEGER NOT NULL,
            FOREIGN KEY (playlist_id) REFERENCES playlists(id),
            FOREIGN KEY (track_id) REFERENCES tracks(id)
        );

        CREATE TABLE IF NOT EXISTS indexed_paths (
            id TEXT PRIMARY KEY,
            path TEXT UNIQUE NOT NULL,
            last_indexed_at TEXT NOT NULL,
            file_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS playback_history (
            id TEXT PRIMARY KEY,
            track_id TEXT NOT NULL,
            played_at TEXT NOT NULL,
            FOREIGN KEY (track_id) REFERENCES tracks(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        ",
    )
    .map_err(|e| format!("Failed to initialize database schema: {}", e))?;

    Ok(())
}

/// Insert or update a track in the database.
pub fn upsert_track(conn: &Connection, track: &TrackInfo) -> Result<(), String> {
    conn.execute(
        "INSERT INTO tracks (id, path, title, artist, album, album_artist, track_number,
                              disc_number, year, duration, format, bitrate, sample_rate,
                              file_size, modified_at, is_favorite, has_artwork, last_indexed_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)
         ON CONFLICT(path) DO UPDATE SET
            id = excluded.id,
            title = excluded.title,
            artist = excluded.artist,
            album = excluded.album,
            album_artist = excluded.album_artist,
            track_number = excluded.track_number,
            disc_number = excluded.disc_number,
            year = excluded.year,
            duration = excluded.duration,
            format = excluded.format,
            bitrate = excluded.bitrate,
            sample_rate = excluded.sample_rate,
            file_size = excluded.file_size,
            modified_at = excluded.modified_at,
            has_artwork = excluded.has_artwork,
            last_indexed_at = excluded.last_indexed_at",
        params![
            track.id,
            track.path,
            track.title,
            track.artist,
            track.album,
            track.album_artist,
            track.track_number,
            track.disc_number,
            track.year,
            track.duration,
            track.format,
            track.bitrate,
            track.sample_rate,
            track.file_size,
            track.modified_at,
            track.is_favorite as i32,
            track.has_artwork as i32,
            chrono::Utc::now().to_rfc3339(),
        ],
    )
    .map_err(|e| format!("Failed to upsert track: {}", e))?;

    Ok(())
}

/// Update the has_artwork flag for a specific track.
pub fn set_track_has_artwork(conn: &Connection, track_id: &str, has_artwork: bool) -> Result<(), String> {
    conn.execute(
        "UPDATE tracks SET has_artwork = ?1 WHERE id = ?2",
        params![has_artwork as i32, track_id],
    )
    .map_err(|e| format!("Failed to set artwork flag: {}", e))?;
    Ok(())
}

/// Retrieve all tracks from the database, ordered by path.
pub fn get_all_tracks(conn: &Connection) -> Result<Vec<TrackInfo>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, path, title, artist, album, album_artist, track_number, disc_number,
                    year, duration, format, bitrate, sample_rate, file_size, modified_at,
                    is_favorite, has_artwork
             FROM tracks
             ORDER BY artist, album, disc_number, track_number",
        )
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            let is_fav: i32 = row.get(15)?;
            let has_art: i32 = row.get(16)?;
            Ok(TrackInfo {
                id: row.get(0)?,
                path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                track_number: row.get(6)?,
                disc_number: row.get(7)?,
                year: row.get(8)?,
                duration: row.get(9)?,
                format: row.get(10)?,
                bitrate: row.get(11)?,
                sample_rate: row.get(12)?,
                file_size: row.get::<_, i64>(13)? as u64,
                modified_at: row.get(14)?,
                is_favorite: is_fav != 0,
                has_artwork: has_art != 0,
            })
        })
        .map_err(|e| format!("Failed to query tracks: {}", e))?;

    let mut tracks = Vec::new();
    for row in rows {
        tracks.push(row.map_err(|e| format!("Failed to read track row: {}", e))?);
    }
    Ok(tracks)
}

/// Search tracks by title, artist, or album (LIKE query).
pub fn search_tracks(conn: &Connection, query: &str) -> Result<Vec<TrackInfo>, String> {
    let pattern = format!("%{}%", query);
    let mut stmt = conn
        .prepare(
            "SELECT id, path, title, artist, album, album_artist, track_number, disc_number,
                    year, duration, format, bitrate, sample_rate, file_size, modified_at,
                    is_favorite, has_artwork
             FROM tracks
             WHERE title LIKE ?1 OR artist LIKE ?1 OR album LIKE ?1 OR album_artist LIKE ?1
             ORDER BY artist, album, disc_number, track_number",
        )
        .map_err(|e| format!("Failed to prepare search query: {}", e))?;

    let rows = stmt
        .query_map(params![pattern], |row| {
            let is_fav: i32 = row.get(15)?;
            let has_art: i32 = row.get(16)?;
            Ok(TrackInfo {
                id: row.get(0)?,
                path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                track_number: row.get(6)?,
                disc_number: row.get(7)?,
                year: row.get(8)?,
                duration: row.get(9)?,
                format: row.get(10)?,
                bitrate: row.get(11)?,
                sample_rate: row.get(12)?,
                file_size: row.get::<_, i64>(13)? as u64,
                modified_at: row.get(14)?,
                is_favorite: is_fav != 0,
                has_artwork: has_art != 0,
            })
        })
        .map_err(|e| format!("Failed to execute search: {}", e))?;

    let mut tracks = Vec::new();
    for row in rows {
        tracks.push(row.map_err(|e| format!("Failed to read search row: {}", e))?);
    }
    Ok(tracks)
}

/// Toggle the favorite status of a track. Returns the new state.
pub fn toggle_track_favorite(conn: &Connection, track_id: &str) -> Result<bool, String> {
    let current: i32 = conn
        .query_row(
            "SELECT is_favorite FROM tracks WHERE id = ?1",
            params![track_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Track not found: {}", e))?;

    let new_value = if current == 0 { 1 } else { 0 };
    conn.execute(
        "UPDATE tracks SET is_favorite = ?1 WHERE id = ?2",
        params![new_value, track_id],
    )
    .map_err(|e| format!("Failed to update favorite: {}", e))?;

    Ok(new_value != 0)
}

/// Get a single track by ID.
pub fn get_track_by_id(conn: &Connection, track_id: &str) -> Result<TrackInfo, String> {
    conn.query_row(
        "SELECT id, path, title, artist, album, album_artist, track_number, disc_number,
                year, duration, format, bitrate, sample_rate, file_size, modified_at,
                is_favorite, has_artwork
         FROM tracks WHERE id = ?1",
        params![track_id],
        |row| {
            let is_fav: i32 = row.get(15)?;
            let has_art: i32 = row.get(16)?;
            Ok(TrackInfo {
                id: row.get(0)?,
                path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                track_number: row.get(6)?,
                disc_number: row.get(7)?,
                year: row.get(8)?,
                duration: row.get(9)?,
                format: row.get(10)?,
                bitrate: row.get(11)?,
                sample_rate: row.get(12)?,
                file_size: row.get::<_, i64>(13)? as u64,
                modified_at: row.get(14)?,
                is_favorite: is_fav != 0,
                has_artwork: has_art != 0,
            })
        },
    )
    .map_err(|e| format!("Failed to get track by id: {}", e))
}

/// Get aggregated album list.
pub fn get_albums(conn: &Connection) -> Result<Vec<AlbumInfo>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT
                lower(hex(randomblob(16))) as id,
                album,
                COALESCE(NULLIF(album_artist, ''), artist) as artist,
                MAX(year) as year,
                COUNT(*) as track_count,
                SUM(duration) as duration,
                MAX(has_artwork) as has_artwork
             FROM tracks
             GROUP BY album, COALESCE(NULLIF(album_artist, ''), artist)
             ORDER BY artist, album",
        )
        .map_err(|e| format!("Failed to prepare album query: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            let has_art: i32 = row.get(6)?;
            Ok(AlbumInfo {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                year: row.get(3)?,
                track_count: row.get(4)?,
                duration: row.get(5)?,
                has_artwork: has_art != 0,
            })
        })
        .map_err(|e| format!("Failed to query albums: {}", e))?;

    let mut albums = Vec::new();
    for row in rows {
        albums.push(row.map_err(|e| format!("Failed to read album row: {}", e))?);
    }
    Ok(albums)
}

/// Get aggregated artist list.
pub fn get_artists(conn: &Connection) -> Result<Vec<ArtistInfo>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT
                lower(hex(randomblob(16))) as id,
                COALESCE(NULLIF(album_artist, ''), artist) as name,
                COUNT(DISTINCT album) as album_count,
                COUNT(*) as track_count
             FROM tracks
             GROUP BY name
             ORDER BY name",
        )
        .map_err(|e| format!("Failed to prepare artist query: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ArtistInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                album_count: row.get(2)?,
                track_count: row.get(3)?,
            })
        })
        .map_err(|e| format!("Failed to query artists: {}", e))?;

    let mut artists = Vec::new();
    for row in rows {
        artists.push(row.map_err(|e| format!("Failed to read artist row: {}", e))?);
    }
    Ok(artists)
}

/// Track an indexed path (insert or update).
pub fn upsert_indexed_path(
    conn: &Connection,
    path: &str,
    file_count: i32,
) -> Result<(), String> {
    conn.execute(
        "INSERT INTO indexed_paths (id, path, last_indexed_at, file_count)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(path) DO UPDATE SET
            last_indexed_at = excluded.last_indexed_at,
            file_count = excluded.file_count",
        params![
            uuid::Uuid::new_v4().to_string(),
            path,
            chrono::Utc::now().to_rfc3339(),
            file_count,
        ],
    )
    .map_err(|e| format!("Failed to upsert indexed path: {}", e))?;
    Ok(())
}

/// Get all previously indexed paths.
pub fn get_indexed_paths(conn: &Connection) -> Result<Vec<String>, String> {
    let mut stmt = conn
        .prepare("SELECT path FROM indexed_paths")
        .map_err(|e| format!("Failed to prepare query: {}", e))?;

    let rows = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| format!("Failed to query indexed paths: {}", e))?;

    let mut paths = Vec::new();
    for row in rows {
        paths.push(row.map_err(|e| format!("Failed to read path row: {}", e))?);
    }
    Ok(paths)
}

/// Remove tracks that no longer exist on disk (during rescan).
pub fn remove_missing_tracks_by_paths(
    conn: &Connection,
    valid_paths: &[String],
) -> Result<usize, String> {
    if valid_paths.is_empty() {
        return Ok(0);
    }

    let placeholders: Vec<String> = valid_paths.iter().enumerate().map(|(i, _)| format!("?{}", i + 1)).collect();
    let sql = format!(
        "DELETE FROM tracks WHERE path NOT IN ({})",
        placeholders.join(", ")
    );

    let params: Vec<&dyn rusqlite::types::ToSql> = valid_paths.iter().map(|p| p as &dyn rusqlite::types::ToSql).collect();
    let deleted = conn
        .execute(&sql, params.as_slice())
        .map_err(|e| format!("Failed to remove missing tracks: {}", e))?;

    Ok(deleted)
}

// ---------------------------------------------------------------------------
// Playlist CRUD
// ---------------------------------------------------------------------------

/// Get all playlists with track counts.
pub fn get_playlists(conn: &Connection) -> Result<Vec<PlaylistInfo>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.name, p.created_at, p.updated_at,
                    COALESCE(cnt.track_count, 0) as track_count
             FROM playlists p
             LEFT JOIN (
                SELECT playlist_id, COUNT(*) as track_count
                FROM playlist_tracks
                GROUP BY playlist_id
             ) cnt ON p.id = cnt.playlist_id
             ORDER BY p.updated_at DESC",
        )
        .map_err(|e| format!("Failed to prepare playlists query: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(PlaylistInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
                track_count: row.get(4)?,
            })
        })
        .map_err(|e| format!("Failed to query playlists: {}", e))?;

    let mut playlists = Vec::new();
    for row in rows {
        playlists.push(row.map_err(|e| format!("Failed to read playlist row: {}", e))?);
    }
    Ok(playlists)
}

/// Create a new playlist. Returns the new playlist ID.
pub fn create_playlist(conn: &Connection, name: &str) -> Result<String, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO playlists (id, name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        params![id, name, now, now],
    )
    .map_err(|e| format!("Failed to create playlist: {}", e))?;
    Ok(id)
}

/// Rename an existing playlist.
pub fn rename_playlist(conn: &Connection, playlist_id: &str, name: &str) -> Result<(), String> {
    let now = chrono::Utc::now().to_rfc3339();
    let updated = conn
        .execute(
            "UPDATE playlists SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![name, now, playlist_id],
        )
        .map_err(|e| format!("Failed to rename playlist: {}", e))?;
    if updated == 0 {
        return Err(format!("Playlist '{}' not found", playlist_id));
    }
    Ok(())
}

/// Delete a playlist and all its track associations.
pub fn delete_playlist(conn: &Connection, playlist_id: &str) -> Result<(), String> {
    conn.execute(
        "DELETE FROM playlist_tracks WHERE playlist_id = ?1",
        params![playlist_id],
    )
    .map_err(|e| format!("Failed to remove playlist tracks: {}", e))?;

    let deleted = conn
        .execute(
            "DELETE FROM playlists WHERE id = ?1",
            params![playlist_id],
        )
        .map_err(|e| format!("Failed to delete playlist: {}", e))?;

    if deleted == 0 {
        return Err(format!("Playlist '{}' not found", playlist_id));
    }
    Ok(())
}

/// Add a track to a playlist at the next available position.
pub fn add_to_playlist(conn: &Connection, playlist_id: &str, track_id: &str) -> Result<(), String> {
    let next_pos: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(position), -1) + 1 FROM playlist_tracks WHERE playlist_id = ?1",
            params![playlist_id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Failed to get next position: {}", e))?;

    conn.execute(
        "INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (?1, ?2, ?3)",
        params![playlist_id, track_id, next_pos],
    )
    .map_err(|e| format!("Failed to add track to playlist: {}", e))?;

    let now = chrono::Utc::now().to_rfc3339();
    let _ = conn.execute(
        "UPDATE playlists SET updated_at = ?1 WHERE id = ?2",
        params![now, playlist_id],
    );

    Ok(())
}

/// Remove a track from a playlist.
pub fn remove_from_playlist(conn: &Connection, playlist_id: &str, track_id: &str) -> Result<(), String> {
    let deleted = conn
        .execute(
            "DELETE FROM playlist_tracks WHERE playlist_id = ?1 AND track_id = ?2",
            params![playlist_id, track_id],
        )
        .map_err(|e| format!("Failed to remove track from playlist: {}", e))?;

    if deleted == 0 {
        return Err(format!("Track '{}' not found in playlist '{}'", track_id, playlist_id));
    }

    let now = chrono::Utc::now().to_rfc3339();
    let _ = conn.execute(
        "UPDATE playlists SET updated_at = ?1 WHERE id = ?2",
        params![now, playlist_id],
    );

    Ok(())
}

/// Get tracks in a playlist ordered by position.
pub fn get_playlist_tracks(conn: &Connection, playlist_id: &str) -> Result<Vec<TrackInfo>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.path, t.title, t.artist, t.album, t.album_artist,
                    t.track_number, t.disc_number, t.year, t.duration,
                    t.format, t.bitrate, t.sample_rate, t.file_size, t.modified_at,
                    t.is_favorite, t.has_artwork
             FROM tracks t
             INNER JOIN playlist_tracks pt ON t.id = pt.track_id
             WHERE pt.playlist_id = ?1
             ORDER BY pt.position",
        )
        .map_err(|e| format!("Failed to prepare playlist tracks query: {}", e))?;

    let rows = stmt
        .query_map(params![playlist_id], |row| {
            let is_fav: i32 = row.get(15)?;
            let has_art: i32 = row.get(16)?;
            Ok(TrackInfo {
                id: row.get(0)?,
                path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                track_number: row.get(6)?,
                disc_number: row.get(7)?,
                year: row.get(8)?,
                duration: row.get(9)?,
                format: row.get(10)?,
                bitrate: row.get(11)?,
                sample_rate: row.get(12)?,
                file_size: row.get::<_, i64>(13)? as u64,
                modified_at: row.get(14)?,
                is_favorite: is_fav != 0,
                has_artwork: has_art != 0,
            })
        })
        .map_err(|e| format!("Failed to query playlist tracks: {}", e))?;

    let mut tracks = Vec::new();
    for row in rows {
        tracks.push(row.map_err(|e| format!("Failed to read playlist track row: {}", e))?);
    }
    Ok(tracks)
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/// Get a setting value.
#[allow(dead_code)]
pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>, String> {
    let mut stmt = conn
        .prepare("SELECT value FROM settings WHERE key = ?1")
        .map_err(|e| format!("Failed to prepare setting query: {}", e))?;

    let result = stmt
        .query_row(params![key], |row| row.get::<_, String>(0))
        .ok();

    Ok(result)
}

/// Get all settings as a HashMap.
pub fn get_all_settings(conn: &Connection) -> Result<HashMap<String, String>, String> {
    let mut stmt = conn
        .prepare("SELECT key, value FROM settings")
        .map_err(|e| format!("Failed to prepare settings query: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| format!("Failed to query settings: {}", e))?;

    let mut settings = HashMap::new();
    for row in rows {
        let (key, value) = row.map_err(|e| format!("Failed to read setting: {}", e))?;
        settings.insert(key, value);
    }
    Ok(settings)
}

/// Set a setting value (insert or update).
pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<(), String> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )
    .map_err(|e| format!("Failed to set setting: {}", e))?;
    Ok(())
}
