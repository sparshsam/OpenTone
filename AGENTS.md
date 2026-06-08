# AI Agent Instructions for OpenTone

This file provides orientation for AI coding agents working on the OpenTone project.

## Project Structure

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (in `src/`)
- **Backend**: Rust + Tauri v2 (in `src-tauri/`)
- **Database**: SQLite via `rusqlite` (bundled)
- **Metadata**: Extracted via the `lofty` crate
- **Docs**: Architecture docs live in `docs/`

## Development Workflow

1. **Branch from `main`**: Create feature branches from `main`.
2. **Pull Requests**: All changes go through PRs into `main`. Squash merge.
3. **Quality gates**: Before committing, run:
   - `npm run typecheck` (TypeScript check)
   - `npm run build` (frontend build)
   - `cargo check` (Rust compilation check)
4. **Conventional commits**: Use `feat:`, `fix:`, `docs:`, `chore:` prefixes.
5. **Versioning**: Follow semantic versioning (`vMAJOR.MINOR.PATCH`).
6. **Releases**: Tagged releases (`v*`) trigger automated GitHub Actions builds.

## Code Conventions

- React functional components with TypeScript interfaces
- Rust backend uses Tauri commands with JSON serializable structs
- SQLite schema changes must include migrations (use `db::initialize_db()`)
- Keep the API surface minimal — prefer backend-side logic over frontend complexity

## Important Constraints

- **No cloud dependencies**: OpenTone is offline-first. No accounts, no telemetry, no cloud sync.
- **No streaming**: OpenTone does not provide music. Users bring their own files.
- **Desktop-only**: OpenTone is a Tauri desktop app, not a web service. No Vercel/Netlify deployment.
- **Privacy**: Zero data collection. Everything stays on the user's machine.

## Documentation

- `README.md` — Project overview and getting started
- `CHANGELOG.md` — Version history
- `ROADMAP.md` — Future plans
- `docs/architecture.md` — Technical architecture
- `docs/release-builds.md` — Release artifact documentation
- `docs/product-spec.md` — Product specifications
- `docs/legal-positioning.md` — Legal positioning and compliance
