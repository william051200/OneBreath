# Architecture

## Overview
OneBreath is a single-target SwiftUI iOS app following an **MVVM** pattern with the modern `@Observable` macro. Persistence is handled by **SwiftData**. There is no networking layer.

## Module Map
```
App/                  Root composition: app entry, root view, theme injection
Features/
  Timer/              Breath-hold timer screen + view model + state machine
  BreatheUp/          Guided pre-hold breathing intervals
  History/            Past sessions list + detail
  Stats/              Aggregations and Swift Charts
Core/
  Models/             SwiftData @Model types
  Theme/              Color, gradient, animation, typography tokens
  Components/         Reusable animated views (BreathingOrb, etc.)
Resources/            Localizable strings, sounds (if any)
```

## Data Flow

```
┌──────────────┐   actions    ┌──────────────────┐   commands   ┌──────────────┐
│  SwiftUI View│ ───────────▶ │  @Observable VM  │ ───────────▶ │  SwiftData   │
│              │ ◀─────────── │  (state machine) │ ◀─────────── │  ModelContext│
└──────────────┘    state     └──────────────────┘    queries   └──────────────┘
```

- Views are stateless renderers bound to `@Bindable` view models.
- View models own session state and a `Timer`/`Date` based clock.
- The `ModelContext` is injected at the app root via `.modelContainer(...)`.

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

Events: `start`, `nextRound`, `beginHold`, `releaseHold`, `save`, `discard`, `reset`.

### Timer accuracy
- `holding` stores `startedAt: Date` and computes elapsed via `Date().timeIntervalSince(startedAt)` on every tick (60 Hz UI updates via `TimelineView(.animation)`).
- This makes the timer **resilient to backgrounding**: if iOS suspends the app and resumes, the elapsed value is still correct.
- `UIApplication.shared.isIdleTimerDisabled = true` while holding to prevent screen sleep.

## Persistence: SwiftData

```swift
@Model
final class SessionRecord {
    var id: UUID
    var date: Date
    var holdDuration: TimeInterval
    var breatheUpRounds: Int
    var notes: String?
}
```

The `ModelContainer` is created in `OneBreathApp.swift` and injected via `.modelContainer(...)`. Queries use `@Query` in views or `FetchDescriptor` in view models.

## Navigation
- Root: `TabView` with three tabs — **Hold**, **History**, **Stats**.
- Within tabs: `NavigationStack` for detail navigation.

## Accessibility
- All animated components honor `@Environment(\.accessibilityReduceMotion)`.
- Timer announces milestone seconds via `.accessibilityValue` updates.
- Dynamic Type supported throughout; no hard-coded font sizes outside the timer digits.

## Testing
- `OneBreathTests` covers the session state machine and time formatting helpers.
- UI is verified via SwiftUI Previews; no UI test target in v1.
