# Changelog

All notable changes to OpenTone will be documented in this file.

## [v0.3.3] — 2026-06-23

### Fixed
- **ARIA attributes rendered as visible text** — `aria-label="Sidebar navigation"` and `aria-label="Main navigation"` in `Sidebar.tsx` were placed as standalone text nodes after their JSX tags instead of being proper JSX attributes. Moved them onto the `<aside>` and `<nav>` elements. All other `aria-label` usages were already correct JSX props.
- **Space key toggles playback on buttons** — The global keyboard shortcut handler toggled playback when Space was pressed while a button or any interactive element was focused. Added `isButton` detection (checks for `button`, `[role="button"]`, `a`, `select`) so pressing Space on focused controls does not trigger playback unexpectedly.
- **Album card accessibility** — Changed `<div role="button" tabIndex={0}>` to actual `<button type="button">` in AlbumView's AlbumCard. Semantically correct, keyboard accessible by default, no unexpected focus behavior.
- **Missing type="button" on buttons** — Added `type="button"` to every `<button>` element across all components to prevent accidental form submission behavior (none exist currently, but this is a standard safety practice).
- **Lint warnings** — Fixed 2 pre-existing eslint warnings by updating dependency arrays in App.tsx and AlbumView.tsx.

### Changed
- Version bumped to 0.3.3 across package.json, Cargo.toml, tauri.conf.json
- AGENTS.md updated with ARIA rendering conventions

### Notes
- Album artwork loads in parallel (from v0.3.2) — already fixed
- Metadata extraction via `lofty` (title, artist, album, track number, year, duration, bitrate, sample rate, embedded artwork) — all confirmed working
- Android platform scaffolded via `npx tauri android init` — `src-tauri/gen/android/` generated
- Android build requires NDK 27+ and Rust targets (`aarch64-linux-android`, `armv7-linux-androideabi`, `i686-linux-android`, `x86_64-linux-android`)

## [v0.3.2] — 2025-06-22

### Fixed
- **Local audio playback** — Restored reliable playback of scanned music files. The webview `<audio>` element could not load raw filesystem paths. Fixed by reading file bytes via `readFile()` from `@tauri-apps/plugin-fs`, wrapping them in a `Blob` with the correct MIME type, and using `URL.createObjectURL()` to create a playable source URL. (Replaced earlier `convertFileSrc()` approach which was unreliable due to Tauri asset protocol scope limitations.)
- **End-of-track advancement** — The `onEnded` event handler captured a stale empty `queue` reference at setup time, preventing automatic advance to the next track. Fixed by using refs (`queueRef`, `queueIndexRef`) that stay current without re-registering the event listener.
- **User-visible playback errors** — Added `onError` event listener on the audio element with descriptive messages (decode failure, unsupported format, missing file). Playback failures now surface as a red banner above the playback bar instead of failing silently.
- **Playback control fixes** — `handlePrevious` now resets `currentTime` to 0 when restarting from >3s. `handleNext`/`handlePrevious` use refs for reliable queue access. `handlePlayPause` clears errors on action.
- **Tab-switching hang** — Album artwork loaded sequentially for every album via individual `invoke()` calls, each doing I/O-heavy image decode, resize, cache, and base64 encode. Fixed by parallelizing with `Promise.all()` and batching state updates into a single `setArtworkCache` call. Same fix applied to TrackList artwork loading.

### Changed
- Version bumped to 0.3.2 across package.json, Cargo.toml, tauri.conf.json
- Playback architecture: `readFile()` + `Blob` + `URL.createObjectURL()` instead of `convertFileSrc()`
- Android platform support — `npx tauri android init` scaffolds Android project in `src-tauri/gen/android/`
- Capabilities updated with `platforms: ["windows", "linux", "macOS", "android"]` and Android `$HOME`-equivalent paths `/storage/emulated/0/Music/**` and `/storage/emulated/0/Download/**`
- AGENTS.md updated with playback conventions, Android setup instructions, expanded quality gates

## [v0.3.1] — 2025-06-22

### Added
- **Store readiness documentation** — New `PRIVACY.md`, `TERMS.md`, `SUPPORT.md` for app-store compliance
- **Store readiness checklist** — `docs/store-readiness-checklist.md` with full audit of all 15 store-readiness categories
- **Age rating notes** — `docs/age-rating-notes.md` with prepared store questionnaire answers
- **Privacy section** — README now documents data stored locally, data deletion workflow, and permissions
- **Accessibility section** — README documents accessibility review results
- **Versioning & Updates section** — README documents versioning strategy and manual update process
- **Support section** — README links to support channels
- **Icons** — Regenerated all app icons from canonical 1024×1024 source PNG

### Changed
- Version bumped to 0.3.1 across all configuration files
- README expanded with comprehensive store-readiness, privacy, accessibility, and support documentation

### Security
- Zero-data-collection policy explicitly documented
- Permission rationale documented with minimal permission set verified


## [v0.3.0-alpha] — 2025-06-07

### Added
- **Playlist management** — Full playlist CRUD: create, rename, delete playlists; add/remove tracks
- **Playlist UI** — Playlist list view, playlist detail view (tracks with remove), "Add to playlist" action
- **Keyboard shortcuts** — Space (play/pause), J/← (prev), K/→ (next), / (focus search), Esc (clear search/blur)
- **Favorites filter** — "★ Favorites" toggle in Library view header to show only starred tracks
- **Queue position indicator** — Shows "N / M" in playback bar when queue has multiple tracks
- **Disabled playback states** — Buttons and seek bar visually dim when no track is selected

### Improved
- **PlaybackBar** — Queue length/position display, disabled states for all controls, capped seek progress
- **TrackListHeader** — Children slot for toolbar buttons (favorites filter)
- **Loading/error states** — Import errors shown as dismissable banners, playlist detail loading/error states
- **Sidebar** — Playlists navigation item with count badge

### Changed
- **LibraryView** — Favorites filter button, import error display, empty state messaging for favorites-only mode
- **View enum** — Added "playlists" and "playlist-detail" views

### Fixed
- **Queue end behavior** — onEnded now advances to next track correctly instead of keeping the old index

## [v0.2.0-alpha] — 2025-06-07

### Added
- **Real metadata extraction** — Replaced stubs with the `lofty` crate for genuine ID3 (MP3), Vorbis Comments (FLAC, Ogg), and MP4 (M4A, AAC) metadata parsing. Extracts title, artist, album, album_artist, track number, disc number, year, duration, bitrate, sample rate with filename-based fallbacks for missing fields.
- **SQLite persistence layer** — Full database module (`db.rs`) with 8 tables: tracks, albums, artists, playlists, playlist_tracks, indexed_paths, playback_history, settings. WAL journal mode for read concurrency.
- **Album artwork extraction** — Embedded pictures extracted via Lofty, resized to 256×256 (Lanczos3), cached as PNG in app data directory, served as base64 data URIs.
- **Album grid view** — Visual album browser with artwork thumbnails, track count, duration.
- **Artist expandable view** — Artist list with collapsible album and track lists.
- **Sortable track columns** — Click column headers to sort by any field; sort direction indicator.
- **Search** — Real-time search across title, artist, album fields via LIKE queries.
- **Favorites** — Toggle favorite status per track; backend-persisted.
- **Playback bar** — Play/pause, next/previous, seek bar, time display, album artwork, favorite indicator.
- **Settings view** — Library path, statistics, supported formats, version info.
- **Rescan support** — Re-index all indexed paths; stale (deleted) tracks auto-removed.
- **Build dependency script** — `scripts/install-build-deps.sh` and `scripts/install-build-deps.py` for automated Tauri system dependency installation.

### Changed
- Replaced stub file reader with genuine Lofty metadata extraction across 9 supported formats.
- Replaced in-memory track storage with SQLite-backed persistence.
- Added Rust dependencies: `lofty`, `rusqlite` (bundled), `base64`, `image`, `walkdir`, `uuid`, `chrono`.

## [v0.1.0-alpha] — 2025-05-31

### Added
- Initial project scaffold with Tauri v2, React 19, TypeScript, Vite 6, Tailwind CSS 4
- Basic UI shell: sidebar, track table, settings view, playback bar, empty state
- Rust backend skeleton with Tauri commands for file scanning
- All documentation files (README, ROADMAP, CHANGELOG, architecture, legal positioning)
- MIT License
