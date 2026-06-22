# Store Readiness Checklist — OpenTone v0.3.1

> Status reference: ✅ Complete | ❌ Not applicable | 🔲 Planned | 🔧 Needs manual store-console work

## 1. App Icons

| Item | Status | Evidence |
|------|--------|----------|
| Icons at all required sizes | ✅ Complete | `src-tauri/icons/` contains 32×32, 128×128, 128×128@2× (256×256) PNGs and a multi-resolution `.ico`. Generated from the canonical 1024×1024 source. |
| macOS `.icns` | 🔲 Planned | Requires macOS-native tooling to generate. Can produce from the 1024×1024 source PNG when needed. |
| Windows Store tile icons | 🔲 Planned | Square logo sizes (30×30, 44×44, 71×71, 89×89, 107×107, 142×142, 150×150, 284×284, 310×310, StoreLogo) would need generation before Windows Store submission. |

## 2. Splash Screens / Launch Visuals

| Item | Status | Evidence |
|------|--------|----------|
| Splash screen | ❌ Not applicable | OpenTone is a desktop app without a splash screen. Tauri v2 does not require one. The app loads quickly and shows a loading spinner. |

## 3. Privacy Policy

| Item | Status | Evidence |
|------|--------|----------|
| Privacy policy exists | ✅ Complete | `PRIVACY.md` documents that no data is collected, telemetry is absent, and all data stays local. |
| Privacy policy covers data collection | ✅ Complete | Clearly states zero data collection. |
| Privacy policy covers data deletion | ✅ Complete | Documents how to delete local app data. |
| Privacy policy covers third-party services | ✅ Complete | States no third-party analytics, ads, or tracking SDKs are used. |

## 4. Terms of Service

| Item | Status | Evidence |
|------|--------|----------|
| Terms of service exist | ✅ Complete | `TERMS.md` covers acceptance, description, user responsibility, warranty disclaimer, liability limitation, and license. |

## 5. Support

| Item | Status | Evidence |
|------|--------|----------|
| Support document exists | ✅ Complete | `SUPPORT.md` lists GitHub Issues, Discussions, and email contact. |
| Support email provided | ✅ Complete | opensphere@sparshsam.com |

## 6. Accessibility

| Item | Status | Evidence |
|------|--------|----------|
| Basic accessibility review | ✅ Complete | Reviewed all UI components. See README "Accessibility" section. |
| Button labels and tooltips | ✅ Complete | All interactive elements have visible labels or `title` attributes. |
| aria-labels | 🔲 Partial | Core interactive elements use semantic HTML. Full ARIA audit planned for future release. |
| Keyboard navigation | ✅ Complete | Full keyboard shortcut support: Space (play/pause), J/K (prev/next), / (search), Esc (clear). Tab-navigable UI. |
| Focus-visible states | ✅ Complete | Tailwind outline-none with focus:border-accent on inputs provides visible focus indicators. |
| Color contrast | ✅ Complete | Dark theme uses high-contrast color palette (surface #1c1917, text #e7e5e4). Muted text (#a8a29e) on surface (#292524) passes WCAG AA. |
| Reduced motion | ✅ Complete | Only minimal animations (spinner on loading states). No decorative animations that would cause vestibular issues. |

## 7. Screenshots

| Item | Status | Evidence |
|------|--------|----------|
| Desktop screenshots | 🔧 Needs manual work | No screenshots are committed to the repository. Screenshots should be captured manually after a stable build and added to `README.md`. |
| Mobile screenshots | ❌ Not applicable | OpenTone is desktop-only. No mobile build exists. |

## 8. App Description and Keywords

| Item | Status | Evidence |
|------|--------|----------|
| App description | ✅ Complete | README describes OpenTone as "Offline-first personal music library and desktop player for music you own." |
| Keywords | ✅ Complete | Music player, local music, offline music, desktop music player, audio player, music library, FLAC player, MP3 player |

## 9. Crash Reporting

| Item | Status | Evidence |
|------|--------|----------|
| Crash reporting implemented | ✅ Documented as intentionally disabled | OpenTone does not collect crash reports. Crash reporting is intentionally absent to maintain zero-telemetry policy. |
| Future crash reporting plan | 🔲 Planned | If a store requires crash reporting, it will be implemented as explicitly opt-in, privacy-preserving, and clearly documented. No Sentry, PostHog, or similar SDK will be added without user consent. |

## 10. Analytics

| Item | Status | Evidence |
|------|--------|----------|
| Analytics implemented | ✅ Documented as intentionally disabled | OpenTone has zero analytics. No analytics SDKs are included in dependencies. |
| Future analytics plan | 🔲 Planned | No analytics will ever be added by default. Usage data collection would always require explicit opt-in and clear disclosure. |

## 11. Versioning Strategy

| Item | Status | Evidence |
|------|--------|----------|
| Semantic versioning | ✅ Complete | Follows SemVer (`vMAJOR.MINOR.PATCH`). Current version: 0.3.1. |
| Version consistency | ✅ Complete | Version is consistent across `tauri.conf.json`, `Cargo.toml`, `package.json`, and CHANGELOG. |
| Release tags | ✅ Complete | Git tags follow `v*` pattern (e.g., `v0.3.0`). |

## 12. Update Mechanism

| Item | Status | Evidence |
|------|--------|----------|
| Auto-update | 🔲 Planned | Tauri updater is not configured. Users must download new versions manually from GitHub Releases. |
| Update documentation | ✅ Complete | README and `docs/release-builds.md` explain that updates are done via GitHub Releases. |

## 13. Store-Compliant Permissions

| Item | Status | Evidence |
|------|--------|----------|
| Permissions documented | ✅ Complete | See README "Permissions" section and `src-tauri/capabilities/default.json`. |
| Unused permissions removed | ✅ Complete | Permissions are minimal: `core:default`, `dialog:default`, `dialog:allow-open`, `fs:default`, `fs:allow-read`, `fs:allow-exists`, `fs:allow-stat`, `fs:scope` (`$HOME/**`). No unnecessary permissions. |

## 14. Data Deletion Workflow

| Item | Status | Evidence |
|------|--------|----------|
| Data deletion documented | ✅ Complete | `PRIVACY.md` and README document how to delete local data (library database, artwork cache, settings). |
| In-app deletion mechanism | 🔲 Planned | Future release may add a "Clear library" button in Settings. For v0.3.1, users delete the app data directory manually. |

## 15. Age Rating Questionnaire Readiness

| Item | Status | Evidence |
|------|--------|----------|
| Age rating notes exist | ✅ Complete | See `docs/age-rating-notes.md`. OpenTone has no mature content. |
| Store questionnaire answers prepared | ✅ Complete | Documented in age-rating notes. |

---

## Summary

| Category | Status |
|----------|--------|
| **Complete** | 18 items |
| **Not applicable** | 3 items |
| **Planned** | 6 items |
| **Needs manual store-console work** | 1 item |
