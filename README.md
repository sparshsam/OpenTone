# OpenTone

**Offline-first personal music library and desktop player for music you own.**

OpenTone is bring-your-own-music software. It does not host, distribute, sell, scrape, stream, or provide copyrighted music. Users are responsible for sourcing their own music legally.

[![Release](https://img.shields.io/github/v/release/sparshsam/OpenTone?sort=semver&style=for-the-badge)](https://github.com/sparshsam/OpenTone/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/sparshsam/OpenTone/ci.yml?branch=main&style=for-the-badge&label=ci)](https://github.com/sparshsam/OpenTone/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/sparshsam/OpenTone?style=for-the-badge)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-FFC131?style=for-the-badge&logo=tauri)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-1.84-F74C00?style=for-the-badge&logo=rust)](https://www.rust-lang.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-6f7d61?style=for-the-badge)](https://github.com/sparshsam/OpenTone/releases)

---

## Status

**Prototype.** Core workflows are functional but breaking changes are expected. See [ROADMAP.md](./ROADMAP.md) for planned development.

## Download

Desktop installers for Windows, Linux, and macOS are available from [GitHub Releases](https://github.com/sparshsam/OpenTone/releases).

| Platform | File | Notes |
|----------|------|-------|
| **Windows** | `.exe` or `.msi` | Windows 10+ (64-bit) |
| **Linux** | `.AppImage` or `.deb` | AppImage works on most distros; .deb for Debian/Ubuntu |
| **macOS (Intel)** | `.dmg` (x64) | macOS 12+ (Monterey or later) |
| **macOS (Apple Silicon)** | `.dmg` (aarch64) | M1/M2/M3/M4 Macs |

See [docs/release-builds.md](./docs/release-builds.md) for details.

> OpenTone is a desktop application, not a hosted web service. There is no Vercel, Netlify, or cloud deployment. All installers run locally on your machine.

## Features

| Feature | Status |
|---------|--------|
| Local music import with recursive folder scanning | Shipped |
| Metadata extraction — ID3, Vorbis Comments, MP4 tags | Shipped |
| SQLite persistence — library, playlists, settings, history | Shipped |
| Album artwork extraction, caching, and display | Shipped |
| Sortable track columns (title, artist, album, duration) | Shipped |
| Album grid view with artwork thumbnails | Shipped |
| Artist expandable view with collapsible album/track lists | Shipped |
| Playlist management — create, rename, delete, add/remove tracks | Shipped |
| Search — real-time across title, artist, album | Shipped |
| Favorites — toggle and filter | Shipped |
| Local playback — play/pause, next/previous, seek, queue | Shipped |
| Keyboard shortcuts — Space, J/K, /, Esc | Shipped |
| Rescan — re-index paths, auto-remove stale tracks | Shipped |
| Zero data collection — everything stays on your machine | Shipped |

### Supported Audio Formats

`mp3`, `flac`, `wav`, `aac`, `m4a`, `ogg`, `opus`, `wv` (WavPack), `aiff`

## Ecosystem Role

OpenTone is the **music library and desktop player** within the broader ecosystem of personal, offline-first tools. It is designed to complement other local-first applications by providing a calm, private way to organize and enjoy personally owned audio files. OpenTone does not connect to any cloud service, collect telemetry, or require accounts — it is a self-contained desktop application that respects the user's ownership of their media.

## Architecture

OpenTone is a Tauri v2 desktop application with a React + TypeScript frontend and a Rust backend.

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Local database | SQLite via `rusqlite` (bundled) |
| Metadata | [Lofty](https://crates.io/crates/lofty) |
| Artwork processing | [`image`](https://crates.io/crates/image) crate |
| Audio | Rust + web audio |

See [docs/architecture.md](./docs/architecture.md) for the full technical architecture.

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (install via `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- Node.js 20+
- System dependencies for Tauri (Ubuntu/WSL):

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev
```

Or run the included script:

```bash
chmod +x scripts/install-build-deps.sh
./scripts/install-build-deps.sh
```

### Development

```bash
# Install frontend dependencies
npm install

# Start Tauri dev (opens app window)
npm run tauri dev
```

### Quality Checks

```bash
npm run lint       # Lint all source files
npm run typecheck  # TypeScript type checking
npm run build      # Production frontend build
cargo check        # Rust compilation check
npm run tauri build  # Production desktop build (generates installer)
```

## Repository Structure

```
OpenTone/
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── types/                # TypeScript types
│   ├── App.tsx               # Root application component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles (Tailwind)
├── src-tauri/                # Rust backend (Tauri)
│   ├── src/
│   │   ├── lib.rs            # Tauri commands and library
│   │   ├── db.rs             # SQLite database operations
│   │   ├── metadata.rs       # Metadata extraction (lofty)
│   │   ├── artwork.rs        # Album artwork extraction + caching
│   │   └── main.rs           # Entry point
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                     # Documentation
│   ├── architecture.md
│   ├── release-builds.md
│   ├── legal-positioning.md
│   └── product-spec.md
├── public/                   # Static assets
├── scripts/                  # Utility scripts
└── package.json
```

## Design Principles

- **Calm** — Minimal, warm, restrained interface. No flashing UI, no algorithmic feeds.
- **Offline-first** — No account required. No data leaves your machine.
- **Ownership-first** — You own your music files. OpenTone just helps you organize and play them.
- **Transparent** — No recommendations, no social features, no tracking.
- **Privacy-respecting** — Zero telemetry, zero data collection, zero cloud dependencies.

## Limitations

- OpenTone does **not** provide, host, or stream music. You must bring your own legally obtained audio files.
- OpenTone is **not** a web service. It is a desktop application. There is no hosted version, cloud deployment, or browser-based access.
- OpenTone does **not** connect to any external server, collect telemetry, or require an account.
- OpenTone does **not** include AI recommendations, social features, or streaming service integrations.
- Metadata editing, playlist reordering, and auto-import are planned but not yet available (see [ROADMAP.md](./ROADMAP.md)).

## License

OpenTone is released under the [MIT License](./LICENSE).

See [docs/legal-positioning.md](./docs/legal-positioning.md) for the full legal positioning.
