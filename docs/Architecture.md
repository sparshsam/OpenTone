# Architecture

This document provides a brief architectural summary of OpenTone. The full technical architecture is documented in [docs/architecture.md](architecture.md).

## Summary

OpenTone is a **Tauri v2 desktop application** with a React + TypeScript frontend and a Rust backend.

### Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Local database | SQLite via `rusqlite` (bundled) |
| Metadata | [Lofty](https://crates.io/crates/lofty) |
| Artwork processing | [`image`](https://crates.io/crates/image) crate |
| File scanning | `walkdir` crate |

### Design Principles

- **Calm** — Minimal, warm, restrained interface. No flashing UI, no algorithmic feeds.
- **Offline-first** — No account required. No data leaves your machine.
- **Ownership-first** — You own your music files. OpenTone just helps you organize and play them.
- **Transparent** — No recommendations, no social features, no tracking.
- **Privacy-respecting** — Zero telemetry, zero data collection, zero cloud dependencies.

For the full architecture documentation (data flow, database schema, keyboard shortcuts, and detailed component breakdown), see the main [architecture.md](architecture.md) file.
