# OneBreath 🌬️

> Hold your breath. Track your limit. Beat it.

**OneBreath** is a beautifully simple breath-hold timer built with React Native (Expo). Whether you're a freediver training static apnea, a swimmer building lung capacity, a meditator exploring breathwork, or just curious about your limits — OneBreath gives you a calm, animated, distraction-free way to time and track every hold.

## ✨ Features

- ⏱ **One-tap breath-hold timer** with background-safe accuracy
- 🌬 **Guided breathe-up** intervals before each hold
- 🏆 **Personal best** tracking and full session history
- 📈 **Animated trend chart** of your progress
- 🎨 **Calm zen UI** — soft shifting gradients, breathing orb, slow pulses (Reanimated)
- 📱 **Cross-platform** — iOS, Android, and web from one codebase
- 🔒 **Privacy-first** — no accounts, no analytics, no network calls

## 🛠 Tech Stack

- **Expo** (SDK 54) + **React Native** + **TypeScript**
- **expo-router** — file-based navigation
- **react-native-reanimated** — 60fps native animations
- **expo-linear-gradient** + **react-native-svg**
- **react-native-gifted-charts** — animated stats chart
- **AsyncStorage** — local session persistence
- **expo-haptics** + **expo-keep-awake**

## 🚀 Getting Started

### Requirements
- Node.js 20+ ([install via winget](https://nodejs.org): `winget install OpenJS.NodeJS.LTS`)
- Expo Go app on your phone ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Run on your phone (Windows-friendly!)
```bash
git clone https://github.com/william051200/OneBreath.git
cd OneBreath
npm install
npm start
```
Then **scan the QR code** with the Expo Go app. Edit and save — the app reloads instantly.

### Run on emulator
```bash
npm run android   # requires Android Studio + emulator
npm run web       # quickest preview, runs in browser
```

### Building for the App Store / Play Store
Use **EAS Build** (free for hobby projects, runs on Expo's cloud — no Mac required):
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```
See [docs/RELEASING.md](docs/RELEASING.md) for the full iOS runbook.

### 📲 Install on iPhone / Android (no App Store, free)
OneBreath is also a **Progressive Web App** — no Apple Developer account, no install fees.

1. Deploy once to Vercel (or any static host):
   ```bash
   npm install -g vercel
   vercel --prod
   ```
   This runs `npx expo export -p web`, publishes the `dist/` folder, and gives you a URL like `onebreath.vercel.app`.
2. **On iPhone**: open the URL in **Safari** → tap the **Share** button → **Add to Home Screen**.
3. **On Android**: open in **Chrome** → tap the menu → **Install app** (or **Add to Home Screen**).

The app launches full-screen, works offline (data is local-only), and looks/feels like a native app. Web caveat: haptics are unavailable on iOS Safari.

## 📁 Project Structure
```
OneBreath/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # Root stack
│   └── (tabs)/
│       ├── _layout.tsx           # Bottom tabs
│       ├── index.tsx             # Hold timer screen
│       ├── history.tsx           # Past sessions
│       └── stats.tsx             # Charts
├── src/
│   ├── components/               # BreathingOrb, PulseRing, etc.
│   ├── theme/                    # colors, animation tokens
│   ├── timer/                    # state machine + formatting
│   └── storage/                  # AsyncStorage session repo
├── assets/                       # icons, splash
├── app.json                      # Expo config
├── babel.config.js               # Reanimated plugin
└── package.json
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — modules, state machine, data flow
- [Design](docs/DESIGN.md) — visual language, animations, color palette
- [Roadmap](docs/ROADMAP.md) — what's next
- [Releasing](docs/RELEASING.md) — iOS build & App Store runbook
- [Privacy](docs/PRIVACY.md) — privacy policy (no data leaves the device)
- [Contributing](docs/CONTRIBUTING.md) — how to help

## 📄 License

[MIT](LICENSE) © 2026 William Ng
