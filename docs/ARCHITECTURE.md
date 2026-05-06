# Architecture

## Overview
OneBreath is a single-target React Native (Expo SDK 54) app written in TypeScript. It uses **expo-router** for file-based navigation and **react-native-reanimated** for all animations. There is no networking layer; persistence is local via `AsyncStorage`.

## Module Map
```
app/                  expo-router routes (file-based navigation)
  _layout.tsx         Root <Stack>
  (tabs)/             Bottom tab group
    _layout.tsx       <Tabs>
    index.tsx         Hold timer screen
    history.tsx       Past sessions
    stats.tsx         Charts
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
};
```

The `useSessions()` hook wraps load / save / delete and re-fetches on screen focus.

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
