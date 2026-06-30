# Development

This guide covers setting up and running OpenTone locally for development.

## Prerequisites

- **Rust** (latest stable) — install via [rustup](https://rustup.rs/)
- **Node.js 20+** — required for the frontend build toolchain
- **System dependencies** for Tauri v2 on Linux/WSL:

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

## Setup

```bash
# Clone the repository
git clone https://github.com/sparshsam/OpenTone.git
cd OpenTone

# Install frontend dependencies
npm install
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run tauri dev` | Start Tauri development server (opens app window) |
| `npm run lint` | Lint all source files |
| `npm run typecheck` | TypeScript type checking |
| `npm run build` | Production frontend build |
| `cargo check` | Rust compilation check |
| `cargo test` | Run Rust tests |
| `npm run tauri build` | Production desktop build (generates installer) |

## Project Structure

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
├── assets/                   # Branding and gallery assets
├── docs/                     # Documentation
├── public/                   # Static assets
├── scripts/                  # Utility scripts
└── package.json
```

## Architecture

See [Architecture.md](Architecture.md) for the full technical architecture.

## Code Standards

- **TypeScript**: Strict mode, Prettier formatting, ESLint with TypeScript rules
- **Rust**: `rustfmt` defaults, `clippy` pedantic recommendations
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
