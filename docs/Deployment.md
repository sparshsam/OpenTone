# Deployment

OpenTone is a **desktop application** — it is not a web service and is not deployed to Vercel, Netlify, or any cloud platform.

## Desktop Builds

Production installers are built using Tauri v2's bundling system.

```bash
npm run tauri build
```

This command generates platform-specific installers in `src-tauri/target/release/bundle/`.

## Platform Installers

### Windows

| Format | Notes |
|--------|-------|
| `.exe` (NSIS) | Standard Windows installer |
| `.msi` (WiX) | Windows Installer package |

Requires: Windows 10+ (64-bit)

### Linux

| Format | Notes |
|--------|-------|
| `.AppImage` | Portable — works on most distributions |
| `.deb` | Debian/Ubuntu package manager |

### macOS

| Format | Notes |
|--------|-------|
| `.dmg` (x64) | Intel Macs — macOS 12+ (Monterey or later) |
| `.dmg` (aarch64) | Apple Silicon (M1/M2/M3/M4) — macOS 12+ |

## Distribution

All installers are distributed via [GitHub Releases](https://github.com/sparshsam/OpenTone/releases). There is no auto-update mechanism currently configured; users download new versions manually.

Future plans include:
- Signed auto-updater
- Microsoft Store submission (Windows)
- Mac App Store submission (macOS)
- Linux package manager distribution (Flathub, Snapcraft)

## CI/CD

The repository includes GitHub Actions workflows for CI and release:

- `.github/workflows/ci.yml` — Run lint, typecheck, and tests on every push/PR.
- `.github/workflows/release.yml` — Build platform installers and publish a GitHub Release on tag push.

See [release-builds.md](release-builds.md) for detailed build instructions.
