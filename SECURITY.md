# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x-dev | :white_check_mark: |

## Reporting a Vulnerability

OpenTone is an offline-first, local-only music player. Because it does not connect to external servers or store user data in the cloud, the attack surface is minimal. However, we take security seriously.

If you discover a security vulnerability, please **do not open a public issue**. Report it privately via:

- **GitHub**: Open a [security advisory](https://github.com/sparshsam/OpenTone/security/advisories)

We will acknowledge receipt within 48 hours and provide an estimated timeline for a fix.

## Architecture & Security Posture

- **Local-only design**: OpenTone runs entirely on the user's machine. No data is transmitted to external servers by default.
- **No user accounts**: There is no authentication system, no session tokens, and no cloud storage managed by the project.
- **File access**: OpenTone only reads files explicitly pointed to by the user (via library import or drag-and-drop). It does not scan outside configured directories.
- **Audio playback**: Uses the operating system's audio subsystem — no network-based audio streaming.
- **BYO cloud (Phase 3)**: If cloud storage integration is added, it will only connect to user-provided endpoints (S3, WebDAV, etc.) using user-supplied credentials stored locally.

## Dependency Security

- Dependencies are audited regularly via `cargo audit` (Rust) and `pnpm audit` (Node.js).
- Automated Dependabot alerts are enabled on the repository.
- Critical security updates are backported to supported versions.

## What We Do NOT Do

- OpenTone does **not** host, serve, or distribute any copyrighted content.
- OpenTone does **not** connect to any central server for functionality.
- OpenTone does **not** collect telemetry, usage data, or personally identifiable information.
