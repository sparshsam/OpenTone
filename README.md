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


## Store Readiness

OpenTone v0.3.1 includes a baseline store-readiness pass to prepare for potential distribution via app stores (Microsoft Store, Mac App Store, Linux package managers). The full checklist is in [docs/store-readiness-checklist.md](./docs/store-readiness-checklist.md).

Key results:

- **Privacy policy**: ✅ Complete (`PRIVACY.md`)
- **Terms of service**: ✅ Complete (`TERMS.md`)
- **Support document**: ✅ Complete (`SUPPORT.md`)
- **App icons**: ✅ Generated from canonical 1024×1024 source
- **Permissions**: ✅ Minimal and documented
- **Crash reporting**: ❌ Intentionally disabled (zero-telemetry policy)
- **Analytics**: ❌ Intentionally disabled (zero-telemetry policy)
- **Auto-update**: 🔲 Planned (manual via GitHub Releases for now)
- **Code signing**: 🔲 Planned (not yet configured)
- **macOS .icns**: 🔲 Planned (requires macOS tooling)
- **Screenshots**: 🔧 Manual capture needed after stable build

## Privacy

OpenTone respects your privacy by design. See the full [Privacy Policy](./PRIVACY.md) for details.

- **No data collection**: OpenTone does not collect any telemetry, analytics, crash reports, or personal information.
- **No accounts**: No account creation, login, or registration required.
- **No cloud**: All data stays on your local machine. No cloud sync, no external servers.
- **No third-party SDKs**: No advertising, tracking, or analytics SDKs are bundled or used.
- **No network access**: The application does not connect to any external service.

## Data Stored Locally

OpenTone stores the following data on your local machine:

| Data | Location | Purpose |
|------|----------|---------|
| Music library database | App data directory (`library.db`) | Track metadata, playlists, favorites, settings |
| Album artwork cache | App data directory (`artwork/`) | Cached album cover images |
| Application settings | SQLite `settings` table | User preferences |

**App data directories by platform:**

| Platform | Path |
|----------|------|
| Windows | `%APPDATA%\com.opentone.app\` |
| macOS | `~/Library/Application Support/com.opentone.app/` |
| Linux | `~/.local/share/com.opentone.app/` |

## Data Deletion

Since all data is local, deletion is straightforward:

1. **Uninstall** OpenTone via your operating system's standard uninstall process.
2. **Delete the app data directory** to remove all library data, playlists, artwork cache, and settings (see paths above).
3. **Your music files are never modified or deleted** by OpenTone — only the library index is removed.

A future release may add an in-app "Clear library and data" option.

## Permissions

OpenTone requests only the permissions it genuinely needs:

| Permission | Purpose |
|------------|---------|
| `dialog:allow-open` | File/folder picker for importing music |
| `fs:allow-read` | Read audio files and album artwork |
| `fs:allow-exists` | Check if files still exist on disk |
| `fs:allow-stat` | Get file metadata (size, modified date) |
| `fs:scope` (`$HOME/**`) | Access user's home directory for music files |

No permissions for networking, camera, microphone, location, or any hardware are requested.

## Accessibility

OpenTone has been reviewed for basic accessibility:

- **Keyboard navigation**: Full keyboard shortcut support — Space (play/pause), J/K (prev/next), / (focus search), Esc (clear). All UI elements are tab-navigable.
- **Button labels**: All interactive elements have visible labels or `title` attributes.
- **Focus indicators**: Focus-visible states are styled (`focus:border-accent` on inputs).
- **Color contrast**: Dark theme uses high-contrast color palette. Text and background combinations pass WCAG AA.
- **Reduced motion**: No decorative animations. Only essential loading spinners are animated.
- **Screen reader**: Semantic HTML structure with proper headings, lists, and table markup.

A full ARIA audit is planned for a future release.

## Versioning & Updates

OpenTone follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

- **Current version**: 0.3.1
- **Release tags**: Git tags follow the `v*` pattern (e.g., `v0.3.1`).
- **Update mechanism**: There is no auto-update currently configured. Users download new versions from [GitHub Releases](https://github.com/sparshsam/OpenTone/releases). A signed auto-updater is planned for a future store-ready release.

## Support

- **GitHub Issues**: [Bug reports and feature requests](https://github.com/sparshsam/OpenTone/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sparshsam/OpenTone/discussions)
- **Email**: opensphere@sparshsam.com

See [SUPPORT.md](./SUPPORT.md) for detailed guidance.

## Age Rating Notes

OpenTone is suitable for all ages:

- No violent, sexual, or mature content
- No gambling or simulated gambling
- No in-app purchases
- No advertisements
- No social features or user-generated content sharing
- No location tracking
- Plays user-provided local audio files only

See [docs/age-rating-notes.md](./docs/age-rating-notes.md) for the full age-rating questionnaire.

## License

OpenTone is released under the [MIT License](./LICENSE).

See [docs/legal-positioning.md](./docs/legal-positioning.md) for the full legal positioning.
