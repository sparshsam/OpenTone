# Roadmap

## Phase 1 — MVP Desktop Player (Current)
- [x] Project scaffold (Tauri v2, React, TypeScript, Vite, Tailwind CSS)
- [ ] Local file system scanning and indexing
- [ ] Metadata extraction (ID3, Vorbis, etc.)
- [ ] Audio playback engine (Rust-based)
- [ ] Library view (tracks, albums, artists)
- [ ] Basic playback controls (play, pause, skip, seek, volume)
- [ ] SQLite database for persistent library state
- [ ] Minimal, calm UI

## Phase 2 — Playlists & Metadata Sync
- [ ] Playlist creation, editing, and management
- [ ] Drag-and-drop track reordering
- [ ] Metadata editing (tag wrangling)
- [ ] Last.fm / ListenBrainz scrobbling
- [ ] Album art fetching and caching
- [ ] Search and filter across library
- [ ] Queue management

## Phase 3 — Mobile Companion & BYO Cloud Storage
- [ ] Companion mobile app (local network sync)
- [ ] Optional BYO cloud storage integration (user-provided S3, WebDAV, etc.)
- [ ] Offline playback sync between desktop and mobile
- [ ] Remote control from mobile app
- [ ] Cross-device play state synchronization
- [ ] Plugin system for extensibility

## Non-Goals (explicitly out of scope)
- Music streaming or content delivery
- Social features or public sharing
- DRM or proprietary format support
- Cloud-hosted user accounts
