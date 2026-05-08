# Development

Quick reference for running, modifying, and deploying OneBreath locally.

## Tech Stack

- **Expo** (SDK 54) + **React Native** + **TypeScript**
- **expo-router** — file-based navigation
- **react-native-reanimated** — 60fps native animations
- **expo-linear-gradient** + **react-native-svg**
- **react-native-gifted-charts** — animated stats chart
- **AsyncStorage** — local session persistence (falls back to `localStorage` on web)
- **expo-haptics** + **expo-keep-awake**

## Requirements

- Node.js 20+ ([install via winget](https://nodejs.org): `winget install OpenJS.NodeJS.LTS`)
- For mobile dev: Expo Go app ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Run locally

```bash
git clone https://github.com/william051200/OneBreath.git
cd OneBreath
npm install
npm start
```

Then **scan the QR code** with Expo Go on your phone, or:

```bash
npm run web       # quickest preview, runs in browser
npm run android   # requires Android Studio + emulator
```

## Deploy your own PWA

OneBreath is a static-export Progressive Web App. Any static host works; Vercel is one click:

```bash
npm install -g vercel
vercel --prod
```

This runs `npx expo export -p web`, publishes the `dist/` folder, and returns your URL. `vercel.json` at the repo root pre-configures the build command, output directory, and cache headers.

For other hosts (Netlify, Cloudflare Pages, GitHub Pages):

```bash
npx expo export -p web
# upload the contents of ./dist
```

## Regenerating icons

The PWA + favicon icons are generated from `scripts/source/OneBreath-icon.png`:

```bash
pip install Pillow
python scripts/generate_icons.py
```

Outputs land in `assets/` (Expo dev fallback icon, favicon) and `public/icons/` (PWA + apple-touch-icon).

## Type checking

```bash
npx tsc --noEmit
```

There's no test suite yet. PRs that add one are welcome.

## Project structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for the module map and data flow.
