# OneBreath 🌬️

> Hold your breath. Track your limit. Beat it.

**OneBreath** is a beautifully simple iOS app for measuring how long you can hold a single breath. Whether you're a freediver training static apnea, a swimmer building lung capacity, a meditator exploring breathwork, or just curious about your limits — OneBreath gives you a calm, distraction-free way to time and track every hold.

---

## ✨ Features

- ⏱ **One-tap breath-hold timer** with background-safe accuracy
- 🌬 **Guided breathe-up** intervals before each hold
- 🏆 **Personal best** tracking and full session history
- 📈 **Progress charts** powered by Swift Charts (PB, trend, average)
- 🎨 **Calm zen UI** — soft shifting gradients, breathing orb, slow pulses
- ♿ **Accessibility-first** — VoiceOver, Dynamic Type, Reduce Motion support
- 🔒 **Privacy-first** — no accounts, no analytics, no network calls

## 🛠 Tech Stack

- **Swift 5.9+** / **SwiftUI** (iOS 17+)
- **SwiftData** for local persistence
- **Swift Charts** for stats
- **XcodeGen** for project generation

## 🚀 Getting Started

### Requirements
- macOS 14+
- Xcode 15+
- iOS 17+ device or simulator
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`)

### Setup
```bash
git clone https://github.com/william051200/OneBreath.git
cd OneBreath
xcodegen generate
open OneBreath.xcodeproj
```
Then press **⌘R** in Xcode to build and run.

## 📁 Project Structure
```
OneBreath/
├── OneBreath/
│   ├── OneBreathApp.swift      # App entry
│   ├── App/                    # Root view, navigation
│   ├── Features/
│   │   ├── Timer/              # Breath-hold timer
│   │   ├── BreatheUp/          # Guided breathing
│   │   ├── History/            # Past sessions
│   │   └── Stats/              # Charts & analytics
│   ├── Core/
│   │   ├── Models/             # SwiftData models
│   │   ├── Theme/              # Colors, gradients, animations
│   │   └── Components/         # BreathingOrb, PulseRing, etc.
│   ├── Resources/
│   └── Assets.xcassets/
├── OneBreathTests/
├── docs/                       # Architecture, design, roadmap
├── project.yml                 # XcodeGen config
└── README.md
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — modules, state machine, data flow
- [Design](docs/DESIGN.md) — visual language, animations, color palette
- [Roadmap](docs/ROADMAP.md) — what's next
- [Contributing](docs/CONTRIBUTING.md) — how to help

## 📄 License

[MIT](LICENSE) © 2026 William Ng
