# Roadmap

## Pages (current app surface)
Short reference of what each tab does, so future work has a shared vocabulary.

- **Hold** (`app/(tabs)/index.tsx`) — primary breath-hold timer. Runs the guided breathe-up, then the hold state machine (`idle → breatheUp → ready → holding → finished`). Saves the result to history when released.
- **Box** (`app/(tabs)/box.tsx`) — guided **box breathing** preset: equal-length inhale → hold → exhale → hold cycles (classic 4-4-4-4) used for calming and focus. Pure practice mode; nothing is saved to history.
- **History** (`app/(tabs)/history.tsx`) — chronological list of past breath-hold sessions from local storage. Supports per-session notes and deletion.
- **Stats** (`app/(tabs)/stats.tsx`) — animated chart of hold durations over time, with personal-best and trend indicators.
- **Settings** (`app/(tabs)/settings.tsx`) — preferences. Currently hosts the **Motion** override (On / System / Off); future v1.3 toggles (haptics, sounds, theme) land here.

## Known issues
- _None currently tracked._ The previous Android-PWA static-orb issue is resolved by the v1.3 **Motion** override (default **On**) which stops trusting `prefers-reduced-motion: reduce` on web by default.

## v1.0 — Foundation
- [x] Project scaffold + docs
- [x] Breath-hold timer with state machine
- [x] Guided breathe-up
- [x] Session history with AsyncStorage / localStorage
- [x] Stats screen with animated chart
- [x] Calm/zen UI with breathing orb (Reanimated)
- [x] Reduce Motion fallback
- [x] PWA install (icon, manifest, Add to Home Screen)
- [x] Vercel deploy config

## v1.1 — Polish
- [x] Onboarding (3 screens)
- [x] Configurable breathe-up rounds (UI control)
- [x] Box breathing preset
- [x] Per-session notes

## v1.2 — Sync & Export
- [x] CSV export
- [x] Import / restore from CSV
- [x] Offline-first service worker for full PWA caching

## v1.3 — Help & UX polish
- [x] Show app version in the UI (e.g., footer of an About / Settings screen, sourced from `app.json` via `expo-constants`)
- [ ] In-app page explanations — short "what is this?" blurbs on each tab, with a slightly longer one for **Box** (what box breathing is, when to use it, the 4-4-4-4 cycle)
- [ ] **About / Settings screen** consolidating app version, links to Privacy + Roadmap, and the toggles below
- [ ] **Wipe all data** button (with confirmation) on the Settings screen
- [ ] Settings toggles: **haptics on/off**, **sounds on/off**, ~~**Reduce Motion override**~~ ✅ (shipped as **Motion: On / System / Off** on the Settings tab; default **On** so the orb keeps animating on Android even when the OS asks for reduced motion)
- [ ] **Light theme + auto (system) theme** — currently dark only
- [ ] **Accessibility audit** — screen-reader labels on every interactive element, color-contrast check, focus order on web

## v1.4 — Platform integration
- [ ] **PWA app-icon shortcuts** — long-press the installed icon to jump straight into "Start hold," "Box breathing," or "View stats" via the manifest `shortcuts` field
- [ ] **Web Share Target** — let other apps share files (e.g., a CSV backup) directly into OneBreath; depends on v1.2 import
- [ ] **PWA Widgets** — small home-screen / dashboard widget showing today's longest hold or current streak (experimental Web API, currently Edge/Windows only)
- [ ] **Web Push reminders** (opt-in) — daily / custom-cadence "time to breathe" notifications via the Notifications + Push APIs
- [ ] **Lighthouse PWA score check in CI** so PWA regressions are caught at PR time

## v1.5 — Practice modes
New guided breathing presets and per-phase feedback options. Each preset reuses the existing animation primitives from the Box screen.
- [ ] **4-7-8 preset** (calming / sleep — inhale 4s, hold 7s, exhale 8s)
- [ ] **Wim Hof rounds** preset (configurable rounds + retention timer that saves to history)
- [ ] **Resonant breathing** (~5.5 breaths-per-minute) preset
- [ ] **Optional audio cues** (soft chime / tones) for inhale / hold / exhale, with a voice-free toggle
- [ ] **Custom haptic patterns** per phase (already on `expo-haptics`)

## v1.6 — Insights
Make the existing Stats and History screens substantially more useful without changing the data model in breaking ways.
- [ ] **Time-range toggle** on Stats (7d / 30d / 90d / all-time) plus a rolling-average overlay
- [ ] **Practice heatmap calendar** (GitHub-style) of days practiced
- [ ] **Daily streak counter** on the Hold tab
- [ ] **Personal-best celebrations** — subtle animation + haptic when a record is beaten
- [ ] **Goals** — set a target hold time or weekly practice count; progress shown on Stats
- [ ] **History search / filter** by date range and note text
- [ ] **Pre/post mood + energy tags** (1–5) on each session, with mood-vs-hold correlation on Stats

## v1.7 — Quality & trust
Engineering investments that reduce regressions as the feature surface grows.
- [ ] **Test suite** (Jest + React Native Testing Library) covering the timer state machine, storage layer, and CSV import/export edge cases
- [ ] `tsc --noEmit` enforced in CI on every PR
- [ ] **ESLint + Prettier** with `--check` in CI
- [ ] **Bundle-size budget check** in CI (warn if the web bundle grows past a threshold)

## v2.0 — Accounts & Sync (opt-in)
Adds the first networked features. Strictly opt-in; the app must remain fully usable without an account.
- [ ] Account system (email/passkey login) for cross-device sync of sessions and settings
- [ ] End-to-end-encrypted session sync
- [ ] Account deletion + data export on demand (GDPR-friendly)
- [ ] **Self-hostable sync server reference implementation** so privacy-conscious users can run their own
- [ ] **Passkey-only login option** (no password fallback) for highest-security users

## v2.1 — Health integrations (opt-in)
Bridge OneBreath sessions into platform health stores so they count toward existing wellness goals.
- [ ] Export sessions to **Apple Health** (Mindful Minutes) when running as an installed PWA on iOS where supported
- [ ] Export to **Google Fit / Health Connect** on Android
- [ ] **iCloud Drive / Google Drive backup** of the local JSON store as an alternative to CSV

## v2.2 — Community (opt-in)
- [ ] Social features (friends list, optional leaderboards, shareable session cards)
- [ ] Privacy controls: per-feature opt-in, hide from leaderboards, anonymous handles
- [ ] **Shareable session-card image** (canvas-rendered) for social sharing without exposing underlying data
- [ ] **Friend challenges** (e.g., "beat my 1:42 hold this week"), opt-in only

## v3.0 — Reach & Sustainability
Items that broaden the audience or help fund hosting. All privacy-respecting and opt-in where applicable.
- [ ] Localization (Spanish, French, Japanese, Chinese)
- [ ] **RTL layout support** (Arabic, Hebrew) once localization is in
- [ ] **Community-translated locales** via a simple JSON-based string catalog
- [ ] Privacy-respecting, opt-in product analytics (self-hosted or cookie-less, e.g. Plausible/Umami) — never third-party trackers
- [ ] Optional, non-tracking sponsorship / ads (e.g. a single static "Supported by …" tile, or unobtrusive banner that can be turned off; never personalized ad networks)

## Non-goals
- Native iOS / Android app store releases (PWA covers all major platforms for free)
- Third-party tracking analytics (Google Analytics, Meta Pixel, etc.)
- Personalized / behaviorally-targeted ad networks
- Heart-rate sensor integration (out of scope for a PWA without native hardware bridges)
