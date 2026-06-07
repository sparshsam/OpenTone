# Changelog

All notable changes to OpenTone will be documented in this file.

## [v0.2.0-alpha] — 2025-06-07

### Added
- **Real metadata extraction** — Replaced stubs with the `lofty` crate for genuine ID3 (MP3), Vorbis Comments (FLAC, Ogg), and MP4 (M4A, AAC) metadata parsing. Extracts title, artist, album, album_artist, track number, disc number, year, duration, bitrate, sample rate with filename-based fallbacks for missing fields.
- **SQLite persistence layer** — Full database module (`db.rs`) with 8 tables: `tracks`, `albums`, `artists`, `playlists`, `playlist_tracks`, `indexed_paths`, `playback_history`, `settings`. Uses `rusqlite` with bundled SQLite, WAL journal mode, and upsert semantics.
- **Album artwork extraction & display** — New `artwork.rs` module extracts embedded pictures via Lofty, resizes to max 256×256 using the `image` crate (Lanczos3 filter), caches as PNG to the app data directory, and serves as base64 data URIs to the frontend.
- **Sortable track columns** — Clickable column headers in the track list for sorting by title, artist, album, duration, year, format, etc. (ascending/descending).
- **Album grid view** — Visual grid layout for browsing albums with artwork thumbnails.
- **Artist expandable view** — Artists listed with album count and track count; collapsible to reveal their albums and tracks.
- **Favorite toggle** — Heart/star button on each track persisted via `toggle_favorite` IPC command.
- **Rescan support** — `rescan_library` command re-indexes all previously scanned paths; tracks whose files no longer exist on disk are automatically removed.
- **Settings persistence** — `get_settings` / `set_setting` commands backed by the `settings` table for persisting user preferences.
- **Search improvements** — `search_tracks` command with LIKE-based search across title, artist, album, and album_artist.
- **Supported formats query** — New `get_supported_formats` command returns the list of supported audio extensions.
- **New Rust dependencies** — Added `lofty` (0.22), `rusqlite` (0.32 bundled), `base64` (0.22), `image` (0.25 with png+jpeg features).
- **Frontend Tauri IPC integration** — All library views now use real `@tauri-apps/api` invocations instead of mock data.

### Changed
- Frontend bumped to React 19
- TrackInfo struct now includes `album_artist`, `bitrate`, `sample_rate`, `file_size`, `is_favorite`, `has_artwork` fields
- Supported formats expanded: added `opus`, `wv` (WavPack), `aiff`
- Database schema now tracks `last_indexed_at` per track and per indexed path

### Fixed
- N/A (first feature release)

## [v0.1.0-alpha] — 2025-06-07

### Added
- Project scaffold: Tauri v2 application with Rust backend and React/TypeScript frontend
- Frontend toolchain: Vite, React 18, TypeScript, Tailwind CSS
- Initial UI shell with sidebar and main area layout
- Local file indexing stub (Rust crate for filesystem scanning)
- SQLite database integration for library state
- Audio playback foundation (Rust bindings)
- Build scripts and development tooling
- MIT License
- Contributing, security, and product documentation
