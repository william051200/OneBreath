# Design

OneBreath's visual language is **calm and zen** — built to slow your heart rate, not raise it.

## Principles
1. **Stillness over flash.** Animations are slow, organic, breath-like.
2. **One focal point.** A single breathing orb anchors every screen.
3. **Negative space.** Sparse layouts. Air. Room to breathe.
4. **Soft contrast.** No harsh whites. No alerting reds.

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `bgDeep` | `#0B1A2E` | Background base (deep ocean) |
| `bgMid` | `#143C5E` | Background mid-stop (teal) |
| `bgGlow` | `#3A2E7A` | Background top-stop (soft violet) |
| `orbCore` | `#8BD3E6` | Orb interior glow |
| `orbHalo` | `#B5A8FF` | Orb outer halo |
| `accent` | `#7FE7C4` | Active state, success |
| `text` | `#EDEFF7` | Primary text (off-white) |
| `textDim` | `#9AA3B8` | Secondary text |

The background is a stacked `LinearGradient` (top-left glow → deep base) with subtle opacity oscillation on a **12-second** loop.

## Typography
- **Display (timer):** system font, monospaced digits (`tabular-nums`), 64–72pt
- **Headings:** system, weight 600
- **Body:** system, weight 400
- **Captions:** system, weight 400, dim color

## Animation Tokens

| Token | Duration | Curve | Notes |
|---|---|---|---|
| `breathInhaleMs` | 4000 | `Easing.inOut(ease)` | Orb scale up |
| `breathExhaleMs` | 6000 | `Easing.inOut(ease)` | Orb scale down |
| `bgShiftMs` | 12000 | `Easing.inOut(ease)` | Background opacity oscillation |
| `pulseMs` | 2000 | `Easing.out(ease)` | Pulse ring expand + fade |
| `tapMs` | 150 | spring (damping 14) | Button press |
| `screenMs` | 500 | timing | Cross-fade between phases |

Reduce Motion fallback (planned): replace continuous loops with a single-stop fade.

## Key Components

### BreathingOrb
A circular gradient that scales between 0.85 and 1.05 on a continuous breath cycle. Brightness pulses with scale (larger = brighter). Used as the focal point on the Timer screen.

### PulseRing
A stroked circle that expands from the orb's radius to ~2.4× while fading to 0 alpha. Loops every 2s while the user is holding. Visual heartbeat.

### GradientBackground
Full-screen stacked `LinearGradient`. Subtle opacity oscillation on a 12s loop — alive but never distracting.

### AnimatedCounter
Per-character fade transitions when the displayed string changes. Used for the live hold timer and the final hold duration.

## Haptics (expo-haptics)
- **Soft impact** when starting a hold
- **Medium impact** when releasing a hold
- **Success notification** when a new personal best is saved

All haptics respect the system's haptic settings.

## Iconography
Ionicons (bundled with `@expo/vector-icons`).
- Hold tab: `pulse`
- History tab: `time-outline`
- Stats tab: `stats-chart-outline`
