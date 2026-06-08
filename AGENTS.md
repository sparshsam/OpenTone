# OpenTone — AI Agent Instructions

## Product Identity

OpenTone is an offline-first personal music library and desktop player for music files you own. It is a native desktop application built with Tauri v2 + React 19.

## Product Boundaries (Mandatory)

1. **Offline-first.** Do not add cloud sync, streaming integration, or network-dependent features.
2. **Local files only.** Music is accessed from the local filesystem via Tauri FS. No music APIs or external catalogs.
3. **No DRM.** Only unencrypted audio formats (MP3, FLAC, etc.).
4. **Privacy by design.** No telemetry, no accounts, no analytics.
5. **Desktop-only.** Tauri targets macOS, Windows, Linux. No mobile or web.

## Architecture Rules

- **Tauri IPC boundary** — Rust commands handle filesystem access; React handles UI. Keep IPC commands focused.
- **No cloud infrastructure** — No backend, no database, no API keys needed.
- **TypeScript strict** — All frontend code must pass strict TypeScript checks.

## Context

This project is on the `feature/initial-opentone-scaffold` branch. The `main` branch exists remotely. Once the scaffold is mature, merge into `main`.

## Ecosystem Standards

All ecosystem repos follow: https://github.com/sparshsam/ecosystem-standards
