# OpenTone

**OpenTone** — offline-first personal music library and desktop player for music you own.

OpenTone is bring-your-own-music software. It does not host, distribute, sell, scrape, stream, or provide copyrighted music. Users are responsible for sourcing their own music legally.

> **Your music. Your library. Your control.**

---

## Concept

OpenTone is a calm, modern, offline-first personal music library and desktop player. It is **not** a Spotify clone and does not provide music. Users bring their own legally obtained music files, import them locally, manage their library, and play music offline.

### Current Features

Desktop application with:

- **Local music import** — Import a folder, recursively scan for supported audio formats
- **Real metadata extraction** — Reads ID3, Vorbis Comments, and MP4 tags via the `lofty` crate (title, artist, album, track number, disc number, year, duration, bitrate, sample rate)
- **SQLite persistence** — Library state, settings, and playback history stored in a local SQLite database (8 tables, WAL mode)
- **Album artwork** — Embedded artwork extracted, resized (max 256×256), cached to disk as PNG, and served as base64 data URIs
- **Sortable UI** — Track columns (title, artist, album, duration, etc.) are clickable to sort ascending/descending
- **Album grid view** — Browse albums as a visual grid with artwork thumbnails
- **Artist expandable view** — Browse artists with collapsible album/track lists
- **Search** — Real-time search across track titles, artists, and albums
- **Favorites** — Toggle favorite status per track
- **Local playback** — Play/pause, next/previous, seek bar, queue
- **Rescan support** — Re-index all previously added paths; stale tracks removed automatically
- **Settings persistence** — User preferences stored in the database
- **Zero data collection** — Everything stays on your machine

### Supported Audio Formats

mp3, flac, wav, aac, m4a, ogg, opus, wv (WavPack), aiff

### Future Phases

See [ROADMAP.md](./ROADMAP.md) for the full product roadmap.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Local DB | SQLite (via `rusqlite` with bundled) |
| Metadata | [Lofty](https://crates.io/crates/lofty) (ID3, Vorbis, MP4) |
| Artwork processing | [`image`](https://crates.io/crates/image) crate (PNG/JPEG) |
| Audio | Rust + web audio |

---

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
chmod +x scripts/install-deps.sh
./scripts/install-deps.sh
```

### Development

```bash
# Install frontend dependencies
npm install

# Start the dev server
npm run dev

# In another terminal, start the Tauri app
npm run tauri dev
```

### Other Commands

```bash
npm run lint       # Lint all source files
npm run typecheck  # TypeScript type checking
npm run build      # Production frontend build
npm run tauri build  # Production desktop build
```

---

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
│   │   ├── metadata.rs       # Real metadata extraction (lofty)
│   │   ├── artwork.rs        # Album artwork extraction + caching
│   │   └── main.rs           # Entry point
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/                     # Documentation
├── public/                   # Static assets
├── scripts/                  # Utility scripts
└── package.json
```

---

## Design Principles

- **Calm** — Minimal, warm, restrained interface. No flashing UI, no algorithmic feeds.
- **Offline-first** — No account required. No data leaves your machine.
- **Ownership-first** — You own your music files. OpenTone just helps you organize and play them.
- **Transparent** — No recommendations, no social features, no tracking.
- **Privacy-respecting** — Zero telemetry, zero data collection, zero cloud dependencies.

---

## Legal

OpenTone does not provide music. It does not host, distribute, sell, scrape, stream, or provide access to copyrighted music. Users are responsible for sourcing their own music legally.

OpenTone is released under the [MIT License](./LICENSE).

See [docs/legal-positioning.md](./docs/legal-positioning.md) for the full legal positioning document.
