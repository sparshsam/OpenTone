# OpenTone Architecture

## Overview

OpenTone is a **Tauri v2** desktop application. Tauri provides a lightweight Rust backend driving a web-based frontend rendered in the operating system's native webview. This architecture gives us native performance and system access (filesystem, audio) with a productive UI development experience.

```
┌────────────────────────────────────────────────────┐
│                 Tauri v2 Shell                      │
│                                                    │
│  ┌───────────────────┐  ┌──────────────────────┐  │
│  │   Rust Backend    │  │  Frontend (WebView)  │  │
│  │   (Tauri Core)    │  │                      │  │
│  │                   │  │  React + TypeScript   │  │
│  │  • Filesystem     │◄─┤  Vite + Tailwind CSS  │  │
│  │  • Metadata       │  │                      │  │
│  │  • SQLite DB      │  │  UI Components       │  │
│  │  • Artwork cache  │  │  State Management    │  │
│  │  • Audio playback │──┤  IPC Client          │  │
│  └───────────────────┘  └──────────────────────┘  │
│                                                    │
│            IPC Bridge (invoke / events)             │
└────────────────────────────────────────────────────┘
```

## Rust Backend (Tauri Core)

The Rust side is the backbone of the application, handling all system-level operations. The source is organized into four modules:

| Module   | File              | Responsibility                                |
|----------|-------------------|----------------------------------------------|
| `main`   | `main.rs`         | Tauri app entry point, plugin registration   |
| `lib`    | `lib.rs`          | Tauri commands, application state, scanning  |
| `db`     | `db.rs`           | SQLite schema, queries, upserts, settings    |
| `metadata` | `metadata.rs`   | Audio metadata extraction via `lofty`        |
| `artwork` | `artwork.rs`     | Album artwork extraction, caching, encoding  |

### Filesystem Scanning

- Walks user-configured directories recursively using `walkdir`
- Filters supported file extensions (`.mp3`, `.flac`, `.wav`, `.aac`, `.m4a`, `.ogg`, `.opus`, `.wv`, `.aiff`)
- Ignores hidden files and system directories
- For each file found, calls `metadata::extract_metadata()` then `db::upsert_track()`
- Records indexed paths in the `indexed_paths` table
- On rescan, re-indexes all stored paths and prunes stale entries whose files no longer exist

### Metadata Extraction

The `metadata::extract_metadata()` function uses the **`lofty`** crate for real tag parsing.

**Supported tag formats:**

| Container  | Tag Format                |
|------------|---------------------------|
| `.mp3`     | ID3v2 / ID3v1             |
| `.flac`    | Vorbis Comments (FLAC)    |
| `.ogg`     | Vorbis Comments           |
| `.m4a`/`.aac` | MP4 (iTunes-style)    |
| `.opus`    | Opus Tags                  |
| `.wv`      | APE / ID3                 |
| `.aiff`    | AIFF / ID3 (if present)   |

**Fields extracted (from tags):**

- `title` — primary tag, fallback to all tags, fallback to filename
- `artist` — primary tag, fallback to all tags, fallback to "Unknown Artist"
- `album` — primary tag, fallback to all tags, fallback to "Unknown Album"
- `album_artist` — tag value, falls back to artist if unset
- `track_number` — tag value, defaults to 0
- `disc_number` — tag value, defaults to 1
- `year` — tag value, defaults to 0
- `has_artwork` — boolean, `true` if any picture tag exists

**Fields from audio properties (via `lofty`):**

- `duration` — seconds (f64)
- `bitrate` — audio bitrate in kbps (i32)
- `sample_rate` — sample rate in Hz (i32)

**File-system fields:**

- `file_size` — bytes (u64)
- `modified_at` — RFC 3339 timestamp of last file modification

### Database Architecture

SQLite database stored at `<app_data_dir>/library.db` with WAL journal mode and foreign keys enabled.

**8 database tables:**

| Table              | Purpose                                                    |
|--------------------|------------------------------------------------------------|
| `tracks`           | Core library: path, metadata fields, favorite, artwork flag, last_indexed_at |
| `albums`           | Album aggregation reference (id, title, artist, year)      |
| `artists`          | Artist reference table (id, name — unique)                |
| `playlists`        | User-created playlists (Phase 2 scaffold)                  |
| `playlist_tracks`  | Join table with position ordering (Phase 2 scaffold)       |
| `indexed_paths`    | Tracks which directories have been scanned (path, file_count, last_indexed_at) |
| `playback_history` | Log of played tracks with timestamps                       |
| `settings`         | Key-value store for user preferences                       |

**Schema design notes:**

- `tracks` uses `path` as a `UNIQUE` constraint for upsert-on-conflict deduplication
- `tracks.is_favorite` and `tracks.has_artwork` are stored as `INTEGER` (0/1) booleans
- `indexed_paths` enables the rescan feature — only previously indexed directories are rescanned
- `playlist_tracks` is prepared for Phase 2 playlist support
- `settings` is a simple key-value table using `ON CONFLICT(key) DO UPDATE`

**Migration approach:**

The project uses a schema-first approach. `db::initialize_db()` is called on app startup and runs `CREATE TABLE IF NOT EXISTS` for all tables. Schema changes are additive — new tables or columns are added in new `IF NOT EXISTS` / `ALTER TABLE` blocks. No destructive migrations are needed in Phase 1.

### Album Artwork

The `artwork` module handles extraction, caching, and delivery of embedded album art.

**Extraction pipeline:**

1. `artwork::extract_and_cache_artwork(track_path, track_id, cache_dir)` is called
2. Reads the audio file with `lofty::read_from_path`
3. Searches `primary_tag().pictures()`, then falls back to iterating all tags
4. Decodes the first embedded picture using the `image` crate
5. If dimensions exceed 256×256, resizes with Lanczos3 filter
6. Saves as PNG to `<cache_dir>/<track_id>.png`
7. If the file is already cached, returns immediately (no re-extraction)

**Delivery:**

- `cached_artwork_as_data_uri(cached_path)` reads the PNG bytes and encodes as a `data:image/png;base64,...` string
- The frontend sets this directly as an `<img>` source — no separate asset serving required

**Cache invalidation:**

- No explicit invalidation yet; artwork never changes for a given track ID
- Album metadata updates during rescan will trigger a new track ID only if the path changes

### Audio Playback

- Based on Rust audio libraries
- Decodes and plays local files directly
- Supports gapless playback (Phase 2)
- Manages: playback state, queue, volume, seek position
- Exposes controls: play, pause, stop, skip, seek, set_volume
- Integrates with system media controls via Tauri `global-shortcut` and `media-controls` plugins

### IPC Commands

Tauri `#[tauri::command]` functions exposed to the frontend:

| Command               | Description                                          |
|-----------------------|------------------------------------------------------|
| `scan_folder`         | Recursively scan a directory for music files         |
| `get_library`         | Query all tracks (ordered by artist, album, disc, track) |
| `get_albums`          | Query all albums with aggregated track count/duration |
| `get_artists`         | Query all artists with album/track counts             |
| `get_album_artwork`   | Extract, cache, and return artwork as base64 data URI |
| `toggle_favorite`     | Toggle the favorite status of a track; returns new state |
| `search_tracks`       | Search tracks by title, artist, or album (LIKE query) |
| `rescan_library`      | Re-index all previously scanned paths; remove stale entries |
| `get_settings`        | Get all settings as a key-value HashMap               |
| `set_setting`         | Set a single setting value                            |
| `get_supported_formats` | Return the list of supported audio file extensions  |

## Frontend (React + TypeScript + Vite + Tailwind CSS)

The frontend is a single-page application (SPA) rendered in a native webview.

### Key Libraries

- **React 19** with functional components and hooks
- **TypeScript** (strict mode)
- **Vite** as the build tool and dev server
- **Tailwind CSS** for styling
- **Zustand** for state management (lightweight)
- **@tauri-apps/api** for invoking backend IPC commands

### State Management

- **Playback state**: current track, play/pause, position, volume, queue
- **Library state**: cached tracks, albums, artists from DB queries
- **UI state**: active view, search query, sorting, sidebar visibility

### UI Views

- **Track List** — Sortable columns for all track metadata fields; column headers toggle ascending/descending
- **Album Grid** — Visual grid of album covers (or placeholder) with album title and artist; click to view tracks
- **Artist View** — Expandable artist list with album count and track count; expand to show albums and tracks
- **Search** — Real-time search bar filters the library via the `search_tracks` IPC command
- **Playback Bar** — Persistent bottom bar with artwork thumbnail, track info, play controls, and seek bar

### Data Flow

```
User Action (click play)
        │
        ▼
React Component (PlayButton)
        │
        ▼
State Action (zustand store: playTrack(trackId))
        │
        ▼
IPC invoke (Tauri command: play_track)
        │
        ▼
Rust Backend
  ├─ Loads file from filesystem
  ├─ Decodes audio
  ├─ Sends playback to audio device
  └─ Emits event: playback-started
        │
        ▼
Frontend listens to event
  ├─ Updates playback state
  └─ UI reacts (highlighted track, progress bar starts)
```

### Import Flow

```
User clicks "Import Folder" or "Scan Library"
        │
        ▼
Tauri dialog plugin opens native folder picker
        │
        ▼
Frontend invokes scan_folder(path)
        │
        ▼
Rust:
  ├─ walkdir walks directory recursively
  ├─ For each supported file:
  │   ├─ metadata::extract_metadata() → TrackInfo
  │   │   ├─ lofty reads tags & properties
  │   │   ├─ filename-based fallbacks
  │   │   └─ uuid generated for track ID
  │   └─ db::upsert_track() → SQLite INSERT ON CONFLICT
  ├─ db::upsert_indexed_path() → record the scanned folder
  └─ Returns Vec<TrackInfo> sorted by path
        │
        ▼
Frontend:
  ├─ Updates library store with tracks
  ├─ Refreshes album/artist aggregations
  └─ UI renders track list, album grid, and artist view
```

### Re-scan Flow

```
User clicks "Rescan Library" or scheduled re-scan
        │
        ▼
Frontend invokes rescan_library()
        │
        ▼
Rust:
  ├─ Queries indexed_paths table for all previously scanned directories
  ├─ For each directory:
  │   └─ Calls index_folder() (same as initial scan)
  ├─ Collects all valid file paths from fresh scan
  └─ db::remove_missing_tracks_by_paths() — deletes tracks
     whose files no longer exist on disk
        │
        ▼
Frontend:
  ├─ Refreshes all library views
  └─ Clears stale cached data
```

### Artwork Loading Flow

```
User views track list or album grid
        │
        ▼
Frontend sees track/album with has_artwork == true
        │
        ▼
Invokes get_album_artwork(track_id) for each visible item
        │
        ▼
Rust:
  ├─ Looks up track path from database
  ├─ Checks artwork cache: <cache_dir>/<track_id>.png
  │   ├─ Found? → read and return as base64 data URI
  │   └─ Not found? →
  │       ├─ lofty extracts embedded picture from file
  │       ├─ image crate decodes and resizes (max 256×256)
  │       ├─ Saves as PNG to cache directory
  │       └─ Returns base64 data URI
  └─ Updates has_artwork flag in DB if it was previously false
        │
        ▼
Frontend sets img.src = returned data URI
```

## Directory Structure

```
OpenTone/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Tauri app entry point
│   │   ├── lib.rs       # IPC commands, app state, scanning
│   │   ├── db.rs        # SQLite schema, queries, settings
│   │   ├── metadata.rs  # Metadata extraction (lofty)
│   │   └── artwork.rs   # Artwork extraction, caching, data URIs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/      # UI components
│   │   ├── Sidebar/
│   │   ├── Library/
│   │   ├── Player/
│   │   └── Settings/
│   ├── stores/          # Zustand stores
│   ├── hooks/           # Custom React hooks
│   ├── ipc/             # Tauri command wrappers
│   └── types/           # TypeScript types
├── public/
├── docs/                # Documentation
├── scripts/             # Build/dev scripts
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Key Design Decisions

1. **Tauri over Electron**: Significantly smaller binary, lower memory usage, native performance for audio processing and filesystem scanning.
2. **SQLite over flat files**: Structured queries for filtering, sorting, and searching. Supports future features like playlists and smart playlists.
3. **Lofty over custom parsers**: Battle-tested metadata library supporting all major tag formats (ID3, Vorbis, MP4) with a unified API.
4. **Bundled SQLite (rusqlite bundled feature)**: No system SQLite dependency required; consistent behavior across platforms.
5. **Rust audio vs browser Audio API**: Native audio decoding in Rust gives us broader format support and lower latency. The browser's Audio API is limited in format support and reliability.
6. **Artwork cached as PNG files**: Avoids re-extracting from audio files on every view. The 256×256 max size keeps cache small and UI rendering fast.
7. **Filesystem scanning on demand**: No background watchers. The user initiates scans, which keeps resource usage predictable and respects user control.
8. **State in frontend, data in backend**: The Rust backend owns the database and filesystem. The frontend caches query results and manages UI state. This keeps IPC payloads small and the backend stateless between queries.
