# Roadmap

## Phase 1 — MVP Desktop Player (Current)
- [x] Project scaffold (Tauri v2, React, TypeScript, Vite, Tailwind CSS)
- [x] Local file system scanning and indexing
- [x] Real metadata extraction via Lofty (ID3, Vorbis, MP4)
- [x] SQLite database for persistent library state (8 tables, WAL mode)
- [x] Album artwork extraction, caching (256×256 PNG), and display
- [x] Audio playback engine (Rust-based)
- [x] Library views: track list, album grid, artist expandable
- [x] Sortable track columns with search and favorites
- [x] Playlist management (CRUD + add/remove tracks)
- [x] Keyboard shortcuts (play/pause, prev/next, search, escape)
- [x] Favorites filtering, queue display, disabled states

## Phase 2 — Desktop Player Refinement
- [ ] Native playback via Tauri asset protocol (`tauri://localhost`)
- [ ] Playlist reordering (drag-and-drop or move up/down)
- [ ] Keyboard shortcuts for volume control
- [ ] Track metadata editing
- [ ] Smart playlists (recently added, most played, favorites)
- [ ] Multi-window support (mini-player)
- [ ] System media controls (media keys, notification)
- [ ] _Packaged desktop installer_ (`npm run tauri build`)

## Phase 3 — Library Management
- [ ] Duplicate detection and merging
- [ ] Batch metadata editing
- [ ] Album art management (replace, remove)
- [ ] Folder watch / auto-import
- [ ] Import progress with file-by-file status
- [ ] File renaming / organization tools

## Phase 4 — Advanced Features
- [ ] Playlist export/import (M3U, PLS)
- [ ] ReplayGain / volume normalization
- [ ] Crossfade and gapless playback
- [ ] EQ and audio effects
- [ ] Last.fm scrobbling
- [ ] Export library statistics
- [ ] Backup / restore

## Non-Goals (Will Never Add)
- Streaming service integrations (Spotify, Apple Music, etc.)
- Cloud sync or accounts
- AI recommendations or discovery features
- Social features or sharing
- Crypto/web3 integration
- Vercel deployment (the app is a desktop application, not a web service)
