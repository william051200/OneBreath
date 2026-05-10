# Architecture

## Overview
OneBreath is a single-target React Native (Expo SDK 54) app written in TypeScript. It uses **expo-router** for file-based navigation and **react-native-reanimated** for all animations. There is no networking layer; persistence is local via `AsyncStorage`.

## Module Map
```
app/                  expo-router routes (file-based navigation)
  _layout.tsx         Root <Stack>
  +html.tsx           Custom <html> for the static web build (PWA meta + SW registration)
  (tabs)/             Bottom tab group
    _layout.tsx       <Tabs>
    index.tsx         Hold timer screen
    history.tsx       Past sessions
    stats.tsx         Charts
public/               Static files copied verbatim into dist/ on web export
  manifest.webmanifest
  service-worker.js           Offline-first PWA service worker
  service-worker-register.js  Registers the service worker on window.load
  icons/                      PWA + apple-touch icons
src/
  components/         BreathingOrb, PulseRing, AnimatedCounter, ActionButton, etc.
  theme/              Color, animation, layout tokens
  timer/              State machine, elapsed-time hook, formatters
  storage/            AsyncStorage repository + useSessions() hook
```

## Data Flow

```
┌──────────────────┐  callbacks   ┌──────────────────┐  AsyncStorage  ┌─────────────┐
│  React component │ ───────────▶ │  Custom hooks    │ ─────────────▶ │  Local JSON │
│  (screen / view) │ ◀─────────── │  (useTimer*, …)  │ ◀───────────── │   (device)  │
└──────────────────┘    state     └──────────────────┘     query      └─────────────┘
```

- Screens are stateless; they read state from hooks (`useTimerMachine`, `useSessions`, `useElapsed`).
- Animation state lives in Reanimated `useSharedValue`s inside each animated component — never in React state.

## Hold Session State Machine

```
   ┌──────┐  start  ┌───────────┐  done  ┌────────┐  tap   ┌─────────┐
   │ idle │────────▶│ breatheUp │───────▶│ ready  │───────▶│ holding │
   └──────┘         └───────────┘        └────────┘        └────┬────┘
       ▲                                                        │ release
       │                              ┌──────────┐  save        ▼
       └──────────────────────────────│ finished │◀────────  (computed)
                          discard     └──────────┘
```

Implemented in `src/timer/useTimerMachine.ts` as a discriminated union (`TimerPhase`).

### Timer accuracy
- `holding` stores `startedAt: number` (epoch ms).
- `useElapsed(startedAt)` polls `Date.now()` every 50 ms and returns `(now - startedAt) / 1000`.
- This is **resilient to backgrounding** — when the app is suspended and resumed, the elapsed value is recomputed from the current wall clock, not from accumulated ticks.
- `expo-keep-awake` prevents screen sleep while holding.

## Persistence: AsyncStorage

Sessions are stored as a single JSON-encoded array under the key `onebreath:sessions:v1`.

```ts
type SessionRecord = {
  id: string;
  date: number;          // epoch ms
  holdDuration: number;  // seconds
  breatheUpRounds: number;
  notes?: string;        // optional, free-form
};
```

The `useSessions()` hook wraps load / save / delete / `reload` and re-fetches on screen focus.

### Storage & CSV (export, import, merge)

OneBreath persists everything locally — there is no server. To make backup, restore, and migration possible, the History tab can export the local store to a CSV file and import one back in.

- **`src/storage/csv.ts`** — single source of truth for the on-disk CSV format. It exports both directions:
  - `sessionsToCsv(sessions)` serializer (RFC-4180: CRLF lines, doubled `""` for embedded quotes, fields wrapped in quotes when they contain `,`, `"`, `\r`, or `\n`).
  - `csvToSessions(text)` parser. Strips a leading BOM, validates the header against `CSV_HEADER` (`id,date,holdDuration,breatheUpRounds,notes`), and skips bad rows while reporting them with line numbers (`{ sessions, errors: [{ line, message }] }`).
- **`src/storage/exportSessions.ts`** — platform-aware writer. On web it triggers a download via a temporary `<a download>`; on native it falls back to `Sharing.shareAsync` (writing to a temp file under the document directory).
- **`src/storage/importSessions.ts`** — platform-aware reader. On web it opens a hidden `<input type="file">` picker; on native it currently returns `{ kind: 'unsupported' }` (we deliberately avoid an `expo-document-picker` dependency for now — the History UI shows a friendly alert instead).
- **`src/storage/sessions.ts → mergeSessions(incoming)`** — dedupe-by-id reconciliation: if an imported session shares an `id` with an existing one, the **existing** record wins (no overwrite). Returns `{ sessions, added }` so the UI can report what changed.

Because `csv.ts` owns both serializer and parser, an exported CSV always round-trips losslessly back through the importer.

## Navigation
- Root `<Stack>` (no header) → `(tabs)` group with three bottom tabs: **Hold**, **History**, **Stats**.

## Animations
- All animations use Reanimated 3 shared values + `withTiming` / `withRepeat` / `withSequence`.
- Background gradient cycles via a 12s shared-value loop.
- Breathing orb scales 0.85 → 1.05 on a 4s/6s inhale-exhale cycle when idle; switches curves per `OrbState`.
- Pulse ring expands 1× → 2.4× while fading from 0.7 → 0 alpha; loops while holding.

## Accessibility
- Buttons declare `accessibilityRole` and `accessibilityLabel`.
- Animations respect Reduce Motion (planned: gate via `AccessibilityInfo.isReduceMotionEnabled`).
- Counter uses `tabular-nums` to prevent layout jitter.

## Testing
- TypeScript provides static safety (`tsc --noEmit`).
- No runtime test runner in v1; consider Jest + React Native Testing Library when behavior grows.

## Offline-first PWA caching

OneBreath ships a service worker so the installed PWA boots and runs with zero network on repeat visits.

### Files
- `public/service-worker.js` — the service worker itself. Statically copied into `dist/` by `expo export -p web`.
- `public/service-worker-register.js` — small bootstrap that calls `navigator.serviceWorker.register('/service-worker.js')` after `window.load`. Loaded via `<script src="/service-worker-register.js" defer />` injected from `app/+html.tsx`.
- `vercel.json` — serves both files with `Cache-Control: max-age=0, must-revalidate` so updates are never stuck behind the CDN, and adds `Service-Worker-Allowed: /` to `service-worker.js`.

### Caching strategy
| Request type | Strategy | Rationale |
|---|---|---|
| `request.mode === 'navigate'` | **Network-first**, fall back to cached `/` | Always show the latest HTML when online; still boot when offline. |
| `/_expo/static/*` (hashed bundles) | **Cache-first** | Filenames are content-hashed, so cached responses are safe to serve forever. |
| Other same-origin GETs | **Stale-while-revalidate** | Instant response from cache, refresh in the background. |
| Cross-origin / non-GET | Pass through | Don't intercept third-party traffic or mutations. |

The app shell (`/`, `/manifest.webmanifest`, favicon, `/icons/*`) is **precached on install** so the very first offline launch has the assets it needs.

### Cache versioning & invalidation
- All caches are namespaced with `CACHE_VERSION` (`onebreath-precache-v1`, `onebreath-runtime-v1`).
- **Bump `CACHE_VERSION` in `service-worker.js` whenever** the precache list, caching strategy, or anything else in the SW logic changes. The `activate` handler deletes any cache whose name doesn't match the current version.
- The SW listens for a `'SKIP_WAITING'` postMessage so a future "Update available — reload" UI can activate a new SW on demand.

### Requirements for future PWA changes
- Anything that should be available offline on first launch must be added to `APP_SHELL_URLS` in `service-worker.js`.
- New static asset directories that are content-hashed and immutable should be added to `isImmutableAsset()` so they get the cache-first treatment.
- The SW path **must remain at the site root** (`/service-worker.js`) so its scope covers the whole app — do not move it into a subfolder.
- Renaming the SW file invalidates the registration for already-installed clients. If you must rename it, also unregister the old path in `service-worker-register.js` for at least one release.
- Keep `service-worker.js` framework-free vanilla JS. It runs outside the React/Expo bundle and must not import from `src/` or `node_modules/`.
