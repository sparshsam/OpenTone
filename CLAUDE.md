# OpenTone — Claude Code Instructions

## Project Overview

OpenTone is an offline-first personal music library and desktop player for music files you own. Built with Tauri v2 + React 19 + Vite + TypeScript. Runs as a native desktop application.

## Tech Stack

- **Desktop framework:** Tauri v2 (Rust backend, web frontend)
- **Frontend:** React 19, TypeScript (strict mode)
- **Build tool:** Vite 6
- **Styling:** Tailwind CSS v4 (via Vite plugin)
- **Testing:** None yet (planned)
- **Runtime:** Node.js >= 18, Rust toolchain for Tauri builds

## Commands

```bash
npm run dev        # Vite dev server (browser-only)
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview production build
npm run tauri      # Tauri CLI (native desktop build)
npm run lint       # ESLint check
npm run typecheck  # TypeScript type checking (no emit)
npm run clean      # Remove dist/ and Tauri build artifacts
```

## Architecture Constraints

1. **Offline-first.** OpenTone works with local music files. No cloud sync, no streaming.
2. **Local files only.** Music is accessed through Tauri fs plugin. No external music APIs.
3. **Tauri IPC boundary.** Business logic in Rust (Tauri commands) or frontend. Keep IPC surface minimal.
4. **No DRM.** OpenTone plays files the user already owns.

## Branch Naming

- `feat/*` — New features
- `fix/*` — Bug fixes
- `docs/*` — Documentation changes
- `refactor/*` — Code restructuring
- `chore/*` — Maintenance tasks

## Workflow

1. Work on feature/fix branches off `main`.
2. Run `npm run lint && npm run typecheck && npm run build` before every PR.
3. Open a pull request for every merge into `main`.
4. No direct pushes to `main`.

## Environment

- Currently on `feature/initial-opentone-scaffold` branch.
- No production deployment configured yet.
- No environment variables required for development.
