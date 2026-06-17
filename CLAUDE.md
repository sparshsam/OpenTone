# CLAUDE.md — Agent Instructions for OpenTone

This file provides orientation for AI coding agents (Claude, Codex, etc.) working on the OpenTone project.

## Project Structure

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (in `src/`)
- **Backend**: Rust + Tauri v2 (in `src-tauri/`)
- **Database**: SQLite via `rusqlite` (bundled, no system dependency)
- **Metadata**: Extracted via the `lofty` crate (ID3, Vorbis, MP4)
- **Artwork**: Processed via the `image` crate (PNG/JPEG decode, Lanczos3 resize)
- **File scanning**: `walkdir` crate
- **Audio**: Browser `Audio()` API (frontend playback)
- **Docs**: Architecture docs in `docs/`

## Development Workflow

### Branching

- Branch from `main` using `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `security/` prefixes.
- All changes go through PRs into `main`. Squash merge.

### Quality Gates (run before committing)

```bash
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run build        # Frontend production build
cargo check          # Rust compilation check (requires Tauri system deps)
cargo clippy         # Rust linting
```

### Commit Convention

Use conventional commits in imperative mood (≤72 chars):

```
feat(player): add seek bar with waveform preview
fix(scan): handle unicode file paths on Windows
docs(readme): update installation instructions
refactor(db): migrate from rusqlite to sqlx
```

### Project Principles

1. **Offline-first** — No account required. No data leaves the user's machine.
2. **Calm UI** — Minimal, warm, restrained interface. No algorithmic feeds.
3. **Transparent** — No recommendations, no social features, no tracking.
4. **Privacy-respecting** — Zero telemetry, zero data collection, zero cloud dependencies.
5. **Ownership-first** — Users own their music. OpenTone organizes and plays it.

## Code Conventions

- React functional components with TypeScript interfaces
- Rust backend: Tauri commands with JSON serializable structs
- SQLite schema changes must include migrations via `db::initialize_db()`
- Keep the API surface minimal — prefer backend-side logic over frontend complexity
- Tailwind CSS for styling; no separate CSS files for component styles
