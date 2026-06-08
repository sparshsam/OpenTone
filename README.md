# OpenTone

**Offline-first personal music library and desktop player for music you own.**

**Maturity:** Alpha. Core playback and library management are scaffolded. Breaking changes expected.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
![Tauri](https://img.shields.io/badge/Tauri_v2-FFC131?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

---

## Quick Links

- [Architecture](docs/architecture.md)
- [Product Spec](docs/product-spec.md)
- [Legal Positioning](docs/legal-positioning.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)

## Overview

OpenTone is a desktop music player for people who own their music files. It runs natively via Tauri — no electron overhead, no cloud dependency, no subscription. Point it at your local music folder and your library is ready.

The app prioritizes:

- **Offline-first.** Your music stays on your machine. No streaming, no sync, no vendor lock-in.
- **Local ownership.** Play MP3, FLAC, and other formats from your own file system.
- **Native performance.** Tauri delivers a lightweight, fast desktop experience.
- **Privacy.** No accounts, no telemetry, no data collection.

## Features

| Feature | Status |
|---------|--------|
| Local music library import | Planned |
| Playback (MP3, FLAC) | Planned |
| Playlist management | Planned |
| Search and filter | Planned |
| Folder-based browsing | Planned |
| Metadata editing | Planned |
| Keyboard shortcuts | Planned |
| Dark mode | Planned |
| Mini-player mode | Future |

## Screenshots

> Screenshots will be added after the first functional release.

```
assets/screenshots/
├── library.png      # Music library view
├── player.png       # Now-playing interface
└── settings.png     # Settings and preferences
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Desktop framework | [Tauri v2](https://v2.tauri.app) (Rust backend) |
| Frontend | [React 19](https://react.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) (strict mode) |
| Build tool | [Vite 6](https://vitejs.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Plugin | Tauri Dialog, Tauri FS |

## Getting Started

```bash
# Prerequisites: Node.js >= 18, Rust toolchain

# Navigate to the repo
cd ~/repos/sparshsam/OpenTone

# Install dependencies
npm install

# Development server (browser)
npm run dev

# Full Tauri desktop build
npm run tauri dev

# Production build
npm run build

# Validation
npm run lint
npm run typecheck
```

## Repository Structure

```
OpenTone/
├── .github/workflows/
│   └── ci.yml              # Lint, typecheck, build
├── assets/
│   ├── screenshots/         # Product screenshots (TBD)
│   └── diagrams/            # Architecture diagrams (TBD)
├── docs/
│   ├── architecture.md      # System architecture
│   ├── legal-positioning.md # Legal and compliance context
│   ├── product-spec.md      # Detailed product specification
│   └── README.md            # Documentation index
├── public/                  # Static assets
├── scripts/                 # Build and utility scripts
├── src/                     # React frontend source
├── src-tauri/               # Tauri Rust backend
├── AGENTS.md                # AI agent instructions
├── CHANGELOG.md             # Keep a Changelog format
├── CLAUDE.md                # Claude Code instructions
├── CODE_OF_CONDUCT.md       # Professional conduct standards
├── CONTRIBUTING.md          # Contributor guide
├── LICENSE                  # MIT
├── README.md                # This file
├── ROADMAP.md               # Product roadmap
├── SECURITY.md              # Security policy
└── SUPPORT.md               # Support channels
```

## Limitations

- **Alpha software.** Playback and library features are not yet functional.
- **Local files only.** No streaming service integration.
- **No remote access.** Music cannot be streamed to other devices.
- **No DRM.** Only plays unencrypted audio files the user owns.
- **No mobile version.** Desktop-only (macOS, Windows, Linux).

## Workflow

1. Branch from `main`: `feat/description`, `fix/description`, `docs/description`
2. Run validation before every PR: `npm run lint && npm run typecheck && npm run build`
3. Open a pull request for every merge into `main`
4. No direct pushes to `main`

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full product roadmap.

## License

MIT — see [LICENSE](LICENSE).

---

*Last updated: June 2026*
