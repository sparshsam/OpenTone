# OpenTone — Legal Positioning

## Core Statement

**OpenTone does not provide, host, distribute, or stream copyrighted music.** It is a local media player — a tool for playing audio files that the user already possesses on their own device. OpenTone has no servers, no content delivery network, and no cloud storage under the project's control.

## User Responsibility

Users of OpenTone are solely responsible for ensuring that any music files they play with the software are legally obtained and owned or licensed for personal use. OpenTone:

- Does **not** include any bundled music, samples, or audio content
- Does **not** provide download links, streaming URLs, or any means to acquire music
- Does **not** scrape, index, or aggregate music from third-party sources
- Does **not** host user libraries on any server

## DMCA / Safe Harbor

Because OpenTone does not host or transmit user content through any server under the project's control, DMCA safe harbor provisions are not directly applicable. There is no central service on which users store or share content. The application operates entirely locally on the user's machine.

If future phases introduce optional BYO (Bring Your Own) cloud storage (e.g., user-provided S3 buckets or WebDAV servers), that storage is owned, operated, and controlled entirely by the user. OpenTone merely provides the client software to interface with it.

## Comparison to Existing Software

| Software         | Model                          | Music Source              |
|------------------|--------------------------------|---------------------------|
| **OpenTone**     | Offline-first local player     | User's own files          |
| **VLC**          | Local media player             | User's own files          |
| **foobar2000**   | Local media player             | User's own files          |
| **MusicBee**     | Local media player             | User's own files          |
| **Spotify**      | Streaming service              | Platform-provided library |
| **Apple Music**  | Streaming + local               | Mix of both               |
| **YouTube Music**| Streaming service              | Platform-provided library |

OpenTone sits firmly in the **VLC/foobar2000 category** — a local player, not a streaming service.

## Format Support

OpenTone supports commonly used audio formats: `.mp3`, `.flac`, `.wav`, `.aac`, `.m4a`, `.ogg`. These are standard, widely-used formats. OpenTone does **not** circumvent any DRM or copy protection. It only plays unencrypted audio files.

## Future Phase Safeguards

All future phases of OpenTone must maintain this legal positioning:

1. **Phase 2 (Playlists & Metadata Sync)**: Scrobbling to services like Last.fm is optional and user-initiated. Metadata editing changes local files only.
2. **Phase 3 (Mobile Companion & BYO Cloud)**: Cloud storage is strictly user-provided (S3, WebDAV, Nextcloud, etc.). OpenTone will never operate its own cloud service for user content. The mobile companion syncs over the user's local network only.
3. **Plugin System**: Plugins will be sandboxed. No plugin may introduce content delivery or streaming functionality. Plugin review guidelines will explicitly prohibit this.

## FAQ

**Q: Is OpenTone a piracy tool?**
A: No. OpenTone is a local media player, like VLC or foobar2000. It plays files the user already has. Users are responsible for the legality of their own files.

**Q: Does OpenTone have a server?**
A: No. The application runs entirely locally. There are no OpenTone-operated servers.

**Q: Can OpenTone play streaming audio?**
A: No. OpenTone only plays files from the local filesystem or user-provided storage.

**Q: What about the BYO cloud feature?**
A: That feature (Phase 3) connects to storage **you** provide and control — your own S3 bucket, your own Nextcloud instance, etc. OpenTone does not operate or manage that storage.
