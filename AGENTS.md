# AI Agent Instructions for OpenTone

This file provides orientation for AI coding agents working on the OpenTone project.

## Project Structure

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (in `src/`)
- **Backend**: Rust + Tauri v2 (in `src-tauri/`)
- **Database**: SQLite via `rusqlite` (bundled)
- **Metadata**: Extracted via the `lofty` crate
- **Local audio playback**: `readFile` from `@tauri-apps/plugin-fs` reads file bytes
  over IPC, the frontend wraps them in a `Blob` with the correct MIME type,
  and creates an object URL via `URL.createObjectURL()` for the `<audio>` element.
  Do NOT use `convertFileSrc()` — the Tauri asset protocol scope does not
  reliably serve arbitrary user files to the webview's audio element.
- **Docs**: Architecture docs live in `docs/`

## Development Workflow

1. **Branch from `main`**: Create feature branches from `main` using `feat/`, `fix/`, or `refactor/` prefix.
2. **Pull Requests**: All changes go through PRs into `main`. Squash merge.
3. **Quality gates**: Before committing or pushing, run:
   - `npm run typecheck` (TypeScript check)
   - `npm run lint` (ESLint — fix warnings)
   - `npm run build` (frontend build)
   - `cargo check` (Rust compilation check)
   - `cargo clippy` (Rust linting)
4. **Conventional commits**: Use `feat:`, `fix:`, `docs:`, `chore:` prefixes (imperative mood, ≤72 chars).
5. **Versioning**: Follow semantic versioning (`vMAJOR.MINOR.PATCH`).
6. **Releases**: Tagged releases (`v*`) trigger the Release workflow. The release is created as a draft; publish manually after verifying CI.
7. **Testing the desktop app**: Run `npm run tauri dev` for a live development window with hot reload.

## Code Conventions

- React functional components with TypeScript interfaces
- **ARIA attributes must be JSX props, never rendered text.** Every `aria-label`, `aria-describedby`, and `aria-current` must be an attribute on a JSX element, never a standalone text node.
- **All `<button>` elements must include `type="button"`** unless inside a `<form>` and intended as submit. Prevents accidental form behavior.
- **Use semantic HTML**: prefer `<button>` over `<div role="button">`, `<nav>` over `<div role="navigation">`. Interactive cards should use `<button>`.
- **Keyboard shortcuts**: Space/Enter handlers must check `event.target` and skip button/link/select elements to avoid unexpected playback toggling.
- Rust backend uses Tauri commands with JSON serializable structs
- SQLite schema changes must include migrations (use `db::initialize_db()`)
- Keep the API surface minimal — prefer backend-side logic over frontend complexity
- Playback: use `readFile(path)` → `Blob([data], {type: mime})` → `URL.createObjectURL(blob)`.
  Always clean up object URLs with `URL.revokeObjectURL()` on track change or unmount.
- Error handling: attach an `onerror` listener to the `<audio>` element and surface
  `MediaError` messages to the user. Never silently swallow playback failures.
- Queue state: use refs (`useRef`) for values needed in event listener callbacks
  to avoid stale closures; sync refs to state with a `useEffect`.

## Important Constraints

- **No cloud dependencies**: OpenTone is offline-first. No accounts, no telemetry, no cloud sync.
- **No streaming**: OpenTone does not provide music. Users bring their own files.
- **Desktop-only**: OpenTone is a Tauri desktop app, not a web service.
- **Privacy**: Zero data collection. Everything stays on the user's machine.
- **No `convertFileSrc`**: The built-in asset protocol (`https://asset.localhost/...`)
  does not reliably serve arbitrary user files. Use `readFile` + Blob URLs instead.

## Documentation

- `README.md` — Project overview, status, and getting started
- `CHANGELOG.md` — Version history (Keep a Changelog format)
- `ROADMAP.md` — Planned development
- `docs/architecture.md` — Technical architecture
- `docs/release-builds.md` — Release artifact documentation
- `docs/product-spec.md` — Product specifications
- `docs/legal-positioning.md` — Legal positioning and compliance
- `AGENTS.md` — This file: AI agent conventions and project knowledge
