# Roadmap

## Phase 1 — MVP Desktop Player (Current)
- [x] Project scaffold (Tauri v2, React, TypeScript, Vite, Tailwind CSS)
- [x] Local file system scanning and indexing
- [x] Real metadata extraction via Lofty (ID3, Vorbis, MP4)
- [x] SQLite database for persistent library state (8 tables, WAL mode)
- [x] Album artwork extraction, caching (256×256 PNG), and display
- [x] Audio playback engine (Rust-based)
- [x] Library views: track list, album grid, artist expandable
- [x] Sortable track columns
- [x] Search across title, artist, album
- [x] Favorite toggle per track
- [x] Rescan support (re-index + stale track pruning)
- [x] Settings persistence
- [x] Basic playback controls (play, pause, skip, seek, volume)
- [x] Minimal, calm UI

## Phase 2 — Playlists & Metadata Management
- [ ] Playlist creation, editing, and management
- [ ] Drag-and-drop track reordering in queue and playlists
- [ ] Metadata editing (tag wrangling — edit title, artist, album in-app)
- [ ] Last.fm / ListenBrainz scrobbling integration
- [ ] Queue management with drag-to-reorder
- [ ] Gapless playback
- [ ] Multi-artist/file-level artwork selection
- [ ] Import from iTunes/CSV playlists
- [ ] Keyboard shortcuts for all major actions

## Phase 3 — Mobile Companion & Extended Platform
- [ ] Companion mobile app (local network sync)
- [ ] Optional BYO cloud storage integration (user-provided S3, WebDAV, etc.)
- [ ] Offline playback sync between desktop and mobile
- [ ] Remote control from mobile app
- [ ] Cross-device play state synchronization
- [ ] Plugin system for extensibility
- [ ] Dark/light theme toggle
- [ ] Equalizer / audio effects

## Non-Goals (explicitly out of scope)
- Music streaming or content delivery
- Social features or public sharing
- DRM or proprietary format support
- Cloud-hosted user accounts
- Algorithmic recommendations or auto-generated playlists
