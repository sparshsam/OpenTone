# Release Builds

OpenTone is distributed as native desktop installers via **GitHub Releases**.

> **OpenTone is a desktop app, not a hosted web service.** It is not deployed to Vercel, Netlify, or any cloud platform. All installers are downloaded from GitHub and run locally on your machine.

---

## Where to Download

1. Go to the [OpenTone releases page](https://github.com/sparshsam/OpenTone/releases)
2. Find the latest release (highest version number)
3. Download the installer for your operating system

---

## Platform Installers

| Platform | File | Notes |
|----------|------|-------|
| **Windows** | `OpenTone_<version>_x64-setup.exe` or `.msi` | Windows 10+ (64-bit) |
| **Linux** | `OpenTone_<version>_amd64.AppImage` or `.deb` | AppImage works on most distros; .deb for Debian/Ubuntu |
| **macOS (Intel)** | `OpenTone_<version>_x64.dmg` | macOS 12+ (Monterey or later) |
| **macOS (Apple Silicon)** | `OpenTone_<version>_aarch64.dmg` | M1/M2/M3/M4 Macs |

Each release also includes:
- `.tar.gz` / `.zip` archives for manual extraction
- Checksum files for integrity verification

---

## How Builds Work

Builds are automated via [GitHub Actions](https://github.com/sparshsam/OpenTone/actions/workflows/release.yml).

**Trigger:** Pushing a tag matching `v*` (e.g., `v0.3.0`) to the repository.

**Pipeline per platform:**
1. Check out source code
2. Install Node.js and Rust toolchains
3. Install platform-specific build dependencies
4. Run `npm ci` (clean install)
5. Run `npm run typecheck` and `npm run build`
6. Run `npm run tauri build` (produces installer)
7. Upload artifacts to the GitHub Release draft

---

## Development vs Production

| Mode | Command | Purpose |
|------|---------|---------|
| **Development** | `npm run tauri dev` | Hot-reload dev server with app window |
| **Production build** | `npm run tauri build` | Generates installers in `src-tauri/target/release/bundle/` |
| **GitHub Release** | Tag push (`v*`) | Triggers CI to build and publish installers |

---

## Verifying a Build

After downloading an installer:

**Windows:**
```powershell
# Verify file size matches the release asset
Get-Item .\OpenTone_*.exe | Select-Object Length
```

**Linux:**
```bash
chmod +x OpenTone_*.AppImage
./OpenTone_*.AppImage --version
```

**macOS:**
```bash
# Gatekeeper may block unsigned builds
xattr -dr com.apple.quarantine OpenTone_*.dmg
```

---

## Limitations

- **Code signing:** Not yet configured. Windows SmartScreen and macOS Gatekeeper may show warnings on first run. These are safe to bypass for now.
- **Auto-update:** Not yet implemented. Users must download new versions manually.
- **Linux AppImage:** Requires FUSE to run on some distributions. The `.deb` package is recommended on Debian/Ubuntu.
