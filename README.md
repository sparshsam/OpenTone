<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/branding/opentone.svg">
    <img src="assets/branding/128x128@2x.png" width="96" height="96" alt="OpenTone">
  </picture>
  <h1>OpenTone</h1>
  <p><strong>Offline-first personal music library and desktop player.</strong><br />Bring your own music. No accounts. No tracking. No cloud.</p>
</div>

<div align="center">

[![Release](https://img.shields.io/github/v/release/sparshsam/OpenTone?sort=semver&style=for-the-badge)](https://github.com/sparshsam/OpenTone/releases)
[![License: MIT](https://img.shields.io/github/license/sparshsam/OpenTone?style=for-the-badge)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-FFC131?style=for-the-badge&logo=tauri)](https://v2.tauri.app)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-6f7d61?style=for-the-badge)](https://github.com/sparshsam/OpenTone/releases)
[![Source Code](https://img.shields.io/badge/Source%20Code-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/sparshsam/OpenTone)

</div>

---

## Screenshots

Screenshots coming soon. OpenTone is actively being prepared for store submission — gallery images will be added once the visual design is finalized.

---

## Download

Desktop installers for Windows, Linux, and macOS are available from **[GitHub Releases](https://github.com/sparshsam/OpenTone/releases)**.

| Platform | File | Notes |
|----------|------|-------|
| **Windows** | `.exe` or `.msi` | Windows 10+ (64-bit) |
| **Linux** | `.AppImage` or `.deb` | AppImage works on most distros; .deb for Debian/Ubuntu |
| **macOS (Intel)** | `.dmg` (x64) | macOS 12+ (Monterey or later) |
| **macOS (Apple Silicon)** | `.dmg` (aarch64) | M1/M2/M3/M4 Macs |

> OpenTone is a desktop application, not a hosted web service. There is no Vercel, Netlify, or cloud deployment. All installers run locally on your machine.

---

## Why OpenTone

Most music management software is tied to streaming services — accounts, recommendations, telemetry, and cloud dependencies. OpenTone is for people who *own* their music files and want a calm, private, offline-first player that stays out of the way.

**No accounts. No recommendations. No telemetry. Just your library.**

---

## Features

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">

| | |
|---|---|
| ✅ Local music import with folder scanning | ✅ Metadata extraction (ID3, Vorbis, MP4) |
| ✅ SQLite persistence — library, playlists, settings | ✅ Album artwork extraction, caching, display |
| ✅ Sortable columns (title, artist, album, duration) | ✅ Album grid view with artwork thumbnails |
| ✅ Artist expandable view | ✅ Playlist management (create, rename, delete) |
| ✅ Real-time search across title, artist, album | ✅ Favorites — toggle and filter |
| ✅ Local playback with keyboard shortcuts | ✅ Zero data collection — everything stays local |
| ✅ Rescan — re-index paths, auto-remove stale tracks | ✅ Dark theme, high-contrast palette |

</div>

### Supported Audio Formats

`mp3` · `flac` · `wav` · `aac` · `m4a` · `ogg` · `opus` · `wv` (WavPack) · `aiff`

---

## Designed For

People who own music files and want a calm, private player.

## Design Philosophy

> **Calm, offline-first, ownership-first.**

- **Calm** — Minimal, warm, restrained interface. No flashing UI, no algorithmic feeds.
- **Offline-first** — No account required. No data leaves your machine.
- **Ownership-first** — You own your music files. OpenTone just helps you organize and play them.
- **Transparent** — No recommendations, no social features, no tracking.
- **Privacy-respecting** — Zero telemetry, zero data collection, zero cloud dependencies.

---

## Built With

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Local database | SQLite via `rusqlite` (bundled) |
| Metadata | [Lofty](https://crates.io/crates/lofty) |
| Artwork | [`image`](https://crates.io/crates/image) crate |
| Audio | Rust + Web Audio API |

---

## Version Journey

| Version | Date | Highlights |
|---------|------|------------|
| **v0.3.1** | 2026-06 | Store readiness — privacy policy, terms, icons, permissions |
| **v0.3.0** | 2026-05 | Features — playlist management, artist view, favorites, search |
| **v0.2.0** | 2026-04 | Album grid view, artwork caching, sortable columns, resize |
| **v0.1.0** | 2026-03 | MVP — folder scanning, metadata extraction, basic playback |

---

## License

OpenTone is released under the [MIT License](LICENSE).

---

## Open Collection

OpenTone is part of the Open Collection — a family of open-source, privacy-first tools for personal computing.

| Project | Description |
|---------|-------------|
| [OpenPalette](https://github.com/sparshsam/OpenPalette) | Color tooling for designers and developers |
| [OpenSend](https://github.com/sparshsam/OpenSend) | Simple, private local file sharing |
| [OpenSprout](https://github.com/sparshsam/OpenSprout) | Personal knowledge gardening tool |
| **OpenTone** | Offline-first personal music library and desktop player |
