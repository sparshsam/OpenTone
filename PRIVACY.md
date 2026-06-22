# Privacy Policy

**Last updated:** 2025-06-22

OpenTone is an offline-first, desktop-only music player. It is designed to respect your privacy by design.

## What data OpenTone collects

**OpenTone collects no data whatsoever.**

- No telemetry
- No analytics
- No crash reports
- No usage statistics
- No personal information
- No account information
- No email addresses
- No IP addresses
- No location data
- No device identifiers

## What data OpenTone stores locally

All data OpenTone creates stays on your local machine. This includes:

| Data | Location | Purpose |
|------|----------|---------|
| Music library database | App data directory (`library.db`) | Stores track metadata, playlists, favorites, settings |
| Album artwork cache | App data directory (`artwork/`) | Cached album cover images for faster loading |
| Application settings | SQLite `settings` table | User preferences (e.g., last imported path) |

OpenTone uses SQLite (via `rusqlite`) for local persistence. The database file and artwork cache reside in the operating system's standard application data directory for your user account.

## Network access

OpenTone does not connect to any external servers. It runs entirely on your local machine.

- No cloud sync
- No streaming services
- No content delivery networks
- No third-party API calls
- No update pinging (updates are checked manually via GitHub Releases)

## Third-party services

OpenTone uses no third-party analytics, advertising, tracking, or crash-reporting SDKs. The only external dependency is the Tauri framework itself, which provides the desktop application shell — it does not transmit data.

## Data deletion

Since all data is local, deleting it is straightforward:

1. **In-app data**: Open the OpenTone app data directory (varies by OS) and delete the `library.db` file and `artwork/` folder.
2. **Settings**: Delete the settings file within the app data directory.
3. **Full uninstall**: Uninstalling OpenTone removes the application binary. You may also manually delete the app data directory to remove all library data, playlists, artwork, and preferences.

The app data directory locations per platform:

| Platform | App Data Directory |
|----------|-------------------|
| Windows  | `%APPDATA%\com.opentone.app\` |
| macOS    | `~/Library/Application Support/com.opentone.app/` |
| Linux    | `~/.local/share/com.opentone.app/` |

## Changes to this policy

If this privacy policy changes, the updated version will be posted here with a new date. OpenTone will never add data collection without clearly updating this document.

## Contact

For privacy questions, open an issue at https://github.com/sparshsam/OpenTone/issues or email the maintainer at the address listed in `SUPPORT.md`.
