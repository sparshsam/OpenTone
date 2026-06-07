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
│  │  • Audio playback │  │  State Management    │  │
│  │  • IPC commands   │──┤  IPC Client          │  │
│  └───────────────────┘  └──────────────────────┘  │
│                                                    │
│            IPC Bridge (invoke / events)             │
└────────────────────────────────────────────────────┘
```

## Rust Backend (Tauri Core)

The Rust side is the backbone of the application, handling all system-level operations.

### Filesystem Scanning (`scanner` crate)
- Walks user-configured directories recursively
- Filters supported file extensions (`.mp3`, `.flac`, `.wav`, `.aac`, `.m4a`, `.ogg`)
- Ignores hidden files and system directories
- Reports progress via Tauri events (for UI progress bar)
- Detects new, modified, and removed files on re-scan

### Metadata Extraction (`metadata` crate)
- Reads ID3 tags (MP3), Vorbis comments (FLAC, Ogg), and MP4 metadata (M4A, AAC)
- Extracts: title, artist, album, track number, disc number, genre, year, album art
- Falls back to filename parsing when tags are missing or corrupt
- Caches extracted metadata in the database

### Database (`database` crate)
- SQLite database stored at the application data directory
- Tables:
  - `tracks` — file path, metadata, duration, added date, last played
  - `albums` — album name, artist, art path, track count
  - `artists` — artist name, album count, track count
  - `playlists` — name, description, created/modified dates (Phase 2)
  - `playlist_tracks` — join table with ordering (Phase 2)
- Uses rusqlite with connection pooling for concurrent access

### Audio Playback (`player` crate)
- Based on **symphonia** or **rodio** Rust audio library
- Decodes and plays local files directly
- Supports gapless playback (Phase 2)
- Manages: playback state, queue, volume, seek position
- Exposes controls: play, pause, stop, skip, seek, set_volume
- Integrates with system media controls via Tauri `global-shortcut` and `media-controls` plugins

### IPC Commands
Tauri `#[tauri::command]` functions exposed to the frontend:

| Command            | Description                            |
|--------------------|----------------------------------------|
| `scan_library`     | Scan a directory for music files       |
| `get_tracks`       | Query all tracks with optional filters |
| `get_albums`       | Query all albums                       |
| `get_artists`      | Query all artists                      |
| `play_track`       | Start playing a specific track         |
| `toggle_playback`  | Play/pause                             |
| `seek`             | Seek to position in seconds            |
| `set_volume`       | Set volume (0.0 – 1.0)                |
| `get_playback_state` | Current state + position             |
| `get_album_art`    | Retrieve album art for a track/album   |

## Frontend (React + TypeScript + Vite + Tailwind CSS)

The frontend is a single-page application (SPA) rendered in a native webview.

### Key Libraries
- **React 18** with functional components and hooks
- **TypeScript** (strict mode)
- **Vite** as the build tool and dev server
- **Tailwind CSS** for styling
- **Zustand** or **Jotai** for state management (lightweight)
- **React Router** for view routing (if needed at this scale)

### State Management
- **Playback state**: current track, play/pause, position, volume, queue
- **Library state**: cached tracks, albums, artists from DB queries
- **UI state**: active view, search query, sorting, sidebar visibility

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

### Re-scan Flow

```
User clicks "Scan Library" or scheduled re-scan
        │
        ▼
Frontend invokes scan_library(path)
        │
        ▼
Rust:
  ├─ Walks filesystem recursively
  ├─ Emits scan-progress events (files_found, files_scanned)
  ├─ Extracts metadata for each file
  ├─ Inserts/updates SQLite database
  └─ Returns scan summary (added, updated, removed)
        │
        ▼
Frontend:
  ├─ Shows progress during scan
  ├─ On completion, refreshes library views
  └─ Clears stale cached data
```

## Directory Structure

```
OpenTone/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Tauri app entry point
│   │   ├── commands/    # IPC command handlers
│   │   ├── scanner/     # Filesystem scanning
│   │   ├── metadata/    # Metadata extraction
│   │   ├── database/    # SQLite operations
│   │   ├── player/      # Audio playback engine
│   │   └── state/       # App state management
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
3. **Rust audio vs browser Audio API**: Native audio decoding in Rust gives us broader format support and lower latency. The browser's Audio API is limited in format support and reliability.
4. **Filesystem scanning on demand**: No background watchers. The user initiates scans, which keeps resource usage predictable and respects user control.
5. **State in frontend, data in backend**: The Rust backend owns the database and filesystem. The frontend caches query results and manages UI state. This keeps IPC payloads small and the backend stateless between queries.
