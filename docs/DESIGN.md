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

The background uses an animated `LinearGradient` that slowly cycles its three stops on a **12-second** loop.

## Typography
- **Display (timer):** SF Pro Rounded, monospaced digits, 80–120pt
- **Headings:** SF Pro Display, semibold, dynamic type ≥ Title2
- **Body:** SF Pro Text, regular, dynamic type Body
- **Captions:** SF Pro Text, regular, dynamic type Caption

## Animation Tokens

| Token | Duration | Curve | Notes |
|---|---|---|---|
| `breath` | 4.0s | `.easeInOut` | Orb scale 0.7→1.0, repeating |
| `bgShift` | 12.0s | `.easeInOut` | Background gradient cycle |
| `pulse` | 2.0s | `.easeOut` | Halo ring expand + fade |
| `digitRoll` | 0.25s | `.spring(response: 0.3, dampingFraction: 0.8)` | Counter tick |
| `tap` | 0.15s | `.spring(response: 0.25, dampingFraction: 0.6)` | Buttons |
| `screen` | 0.5s | `.easeInOut` | Cross-fade between states |

All animations are **disabled or reduced to fades** when `accessibilityReduceMotion` is true.

## Key Components

### BreathingOrb
A circular gradient view that scales between two values on a continuous breath cycle. Brightness pulses with scale (larger = brighter). Used as the focal point on Timer and BreatheUp screens.

### PulseRing
A stroked circle that expands from the orb's radius to ~2.5x while fading to 0 alpha. Emits every 2s when the user is actively holding. Visual heartbeat.

### GradientBackground
Full-screen `LinearGradient` whose stops shift on a 12s loop. Subtle enough to feel ambient, alive enough to never feel static.

### AnimatedCounter
Per-digit roll animation when the displayed number changes. Used for the live hold timer and the personal-best display on the History screen.

## Haptics
- **Soft impact** when starting a hold
- **Medium impact** when releasing a hold
- **Success notification** when a new personal best is set

All haptics respect the system's haptic settings.

## Sound (optional, off by default)
A single soft chime (`Resources/Sounds/chime.caf`) marks PB events. No background music — silence is the design.

## Iconography
SF Symbols only. No custom glyphs in v1.
- Timer tab: `lungs.fill`
- History tab: `clock.arrow.circlepath`
- Stats tab: `chart.xyaxis.line`
