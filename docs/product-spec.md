# OpenTone Product Specification

## Concept

OpenTone is a **calm, offline-first, personal music library and desktop player**. It is designed for people who own their music files and want a beautiful, respectful interface to listen to them.

**Core philosophy**: You bring your own music. OpenTone does not provide, stream, or recommend music. It is a tool for *your* collection — nothing more, nothing less.

The design language is **calm, minimal, warm, and restrained**. OpenTone stays out of your way. No ads, no recommendations, no algorithmic playlists, no social features. Just your music, organized clearly.

## Phase 1 — MVP Desktop Player

### Features

#### Local File Import
- Import music files from user-selected directories
- Recursive directory scanning
- Supported formats: `.mp3`, `.flac`, `.wav`, `.aac`, `.m4a`, `.ogg`
- Automatic metadata extraction (title, artist, album, track number, genre, year, album art)
- Handles incomplete or missing metadata gracefully

#### Playback
- Play, pause, skip (next/previous), seek, volume control
- Repeat modes: off, repeat all, repeat one
- Shuffle mode
- Now-playing display (cover art, track info, progress bar)
- System media controls integration (media keys, taskbar)

#### Library Management
- **Library view**: browse all imported tracks in a sortable list
- **Albums view**: grid of album covers, click to view tracks
- **Artists view**: alphabetical list of artists, expand to see albums/tracks
- **Search**: search across track titles, artists, albums
- **Sorting**: sort by title, artist, album, duration, date added

### User Interface Layout

```
┌──────────────────────────────────────────────────────┐
│ Header (app name, search bar)                        │
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ Sidebar  │  Main Content Area                        │
│          │                                           │
│ Library  │  (Tracks / Albums / Artists / Settings)   │
│ Tracks   │                                           │
│ Albums   │                                           │
│ Artists  │                                           │
│ Settings │                                           │
│          │                                           │
│          │                                           │
├──────────┴───────────────────────────────────────────┤
│ Playback Bar (cover art, track info, controls,       │
│ progress, volume, queue)                             │
└──────────────────────────────────────────────────────┘
```

#### Sidebar
- Navigation: Library, Tracks, Albums, Artists, Settings
- Active view highlighted
- Collapsible (optional)

#### Main Content Area
- Context-dependent view based on sidebar selection
- Tracks: sortable table/list view
- Albums: card grid with cover art
- Artists: list with expandable sections

#### Playback Bar
- Fixed at bottom of window
- Album art thumbnail + track title + artist name
- Play/pause, previous, next, shuffle, repeat buttons
- Seek bar with current time / total duration
- Volume slider
- Queue access button

### Design Language

| Attribute   | Direction                                        |
|-------------|--------------------------------------------------|
| **Tone**    | Calm, warm, respectful, restrained               |
| **Colors**  | Muted earth tones, deep charcoal backgrounds,    |
|             | warm accent colors (amber, rust, sage)           |
| **Typography** | Clean sans-serif for UI, serif for album/artist names (optional) |
| **Spacing** | Generous whitespace, no visual clutter           |
| **Animation** | Subtle, purposeful transitions (no bounce/spin effects) |
| **Dark mode** | First-class citizen, default                   |
| **Light mode** | Supported as preference                       |

### Technical Stack
- **Backend**: Rust (Tauri v2)
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: SQLite (via rusqlite)
- **Audio**: Rodio or symphonia (Rust)

## Phase 2 — Playlists & Metadata Sync

### Features (planned)
- Rich playlist creation and management
- Drag-and-drop reordering in playlists
- In-app metadata editing (tag wrangling)
- Last.fm / ListenBrainz scrobbling integration
- Album art caching and offline fallback
- Smart playlists (rule-based filtering)
- Queue management with drag-and-drop

## Phase 3 — Mobile Companion & BYO Cloud

### Features (planned)
- Companion mobile app for iOS/Android
- Local network discovery and sync
- Optional user-provided cloud storage (S3, WebDAV, Nextcloud)
- Cross-device offline playback sync
- Remote control from mobile
- Plugin/extension system

## Legal Positioning

**OpenTone does not provide music.** It is a local player for files the user already legally owns. For a full legal positioning statement, see `docs/legal-positioning.md`.
