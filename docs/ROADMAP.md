# Roadmap

## Pages (current app surface)
Short reference of what each tab does, so future work has a shared vocabulary.

- **Hold** (`app/(tabs)/index.tsx`) — primary breath-hold timer. Runs the guided breathe-up, then the hold state machine (`idle → breatheUp → ready → holding → finished`). Saves the result to history when released.
- **Box** (`app/(tabs)/box.tsx`) — guided **box breathing** preset: equal-length inhale → hold → exhale → hold cycles (classic 4-4-4-4) used for calming and focus. Pure practice mode; nothing is saved to history.
- **History** (`app/(tabs)/history.tsx`) — chronological list of past breath-hold sessions from local storage. Supports per-session notes and deletion.
- **Stats** (`app/(tabs)/stats.tsx`) — animated chart of hold durations over time, with personal-best and trend indicators.

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
- [ ] CSV export
- [ ] Import / restore from CSV
- [x] Offline-first service worker for full PWA caching
- [ ] Show app version in the UI (e.g., footer of an About / Settings screen, sourced from `app.json` via `expo-constants`)
- [ ] In-app page explanations — short "what is this?" blurbs on each tab, with a slightly longer one for **Box** (what box breathing is, when to use it, the 4-4-4-4 cycle)

## v1.3 — Beyond
- [ ] Localization (Spanish, French, Japanese, Chinese)
- [ ] Optional widgets / shortcuts via web share targets

## v2.0 — Accounts & Sync (opt-in)
Adds the first networked features. Strictly opt-in; the app must remain fully usable without an account.
- [ ] Account system (email/passkey login) for cross-device sync of sessions and settings
- [ ] End-to-end-encrypted session sync
- [ ] Account deletion + data export on demand (GDPR-friendly)

## v2.1 — Community (opt-in)
- [ ] Social features (friends list, optional leaderboards, shareable session cards)
- [ ] Privacy controls: per-feature opt-in, hide from leaderboards, anonymous handles

## Non-goals
- Ads or third-party analytics
- Native iOS / Android app store releases (PWA covers all major platforms for free)
