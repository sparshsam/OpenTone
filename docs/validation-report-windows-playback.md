# Windows Playback Validation Report

**PR:** #6 — feat/windows-playback-asset-protocol
**Build:** https://github.com/sparshsam/OpenTone/actions/runs/27585817325
**Date:** 2026-06-15

---

## 1. Build Status

| Platform | Status | Artifact |
|---|---|---|
| Windows (x64) | ⏳ Building | OpenTone.exe + OpenTone.msi |
| Linux (x64) | ⏳ Building | AppImage / .deb / .rpm |
| macOS Intel | ⏳ Building | .dmg |
| macOS ARM | ⏳ Building | .dmg |

---

## 2. Validation Checklist

### Playback (test each format)

- [ ] **MP3** — does audio play?
- [ ] **FLAC** — does audio play?
- [ ] **WAV** — does audio play?
- [ ] **AAC/M4A** — does audio play?
- [ ] **OGG** — does audio play?

### Path Edge Cases

- [ ] **Spaces** — e.g. `My Music/track name.mp3`
- [ ] **Unicode** — e.g. `Música/canción.flac`
- [ ] **Nested folders** — e.g. `Music/Genre/Artist/Album/track.flac`
- [ ] **Long paths** — > 200 character path

### Library Locations

- [ ] `%USERPROFILE%\Music` — default Music folder
- [ ] `C:\Users\<user>\custom-music` — custom folder under home
- [ ] OneDrive Music folder (if available)
- [ ] Secondary drive (e.g. `D:\Music`)

### Playback Controls

- [ ] Import succeeds
- [ ] Metadata loads correctly
- [ ] Artwork loads (when embedded)
- [ ] Play / Pause works
- [ ] Next / Previous works
- [ ] Seek bar works
- [ ] Queue advances to next track
- [ ] Playback position counter updates
- [ ] Volume-related behavior (no regression)

### Error Handling

- [ ] **Deleted file** — import, delete file externally, try to play → error shows in UI
- [ ] **Inaccessible file** — permissions changed → error shows
- [ ] **Unsupported format** — try to play `.wma` or `.aiff` → error shows
- [ ] **Error dismiss** — × button clears the error message

### Asset Protocol Scope

Test `assetProtocol.scope = ["$HOME/**"]` coverage:

- [ ] `C:\Users\<user>\Music` — covered by `$HOME/**`
- [ ] `C:\Users\<user>\OneDrive\Music` — covered by `$HOME/**`
- [ ] `D:\Music` — **not covered** by `$HOME/**`

> **Note:** Paths outside `$HOME` will need scope expansion.

---

## 3. Issues Found

| # | Severity | Description | Workaround |
|---|---|---|---|
| | | *(to be filled)* | |

---

## 4. Conclusion

- [ ] **Playback works** → safe to merge PR #6, prepare v0.3.1
- [ ] **Playback fails** → capture errors, do NOT merge

### If passing, recommended next actions:

1. Merge PR #6 to main
2. Cut v0.3.1 release with tag
3. Update changelog
4. Distribute Windows build for broader testing

### If failing, capture:

- Console errors from F12 DevTools
- Exact asset:// URLs being generated
- Windows Event Viewer logs (if any)
- Screenshot of the error state

---

*This document is temporary and is not part of the OpenTone documentation.*
