# Releasing OneBreath to iOS

This is the end-to-end runbook for shipping OneBreath to **TestFlight** and the **App Store** using **EAS Build** + **EAS Submit** from a Windows machine. No Mac required — Expo's cloud builds the iOS app for you.

---

## 0. Prerequisites (one-time)

1. **Apple Developer Program membership** — $99/year, https://developer.apple.com/programs/. You'll need an Apple ID enrolled in the program before you can build, distribute, or submit anything.
2. **App Store Connect record** — go to https://appstoreconnect.apple.com → My Apps → "+" → New App.
   - Platform: iOS
   - Name: `OneBreath`
   - Primary Language: English (U.S.)
   - Bundle ID: `com.williamng.onebreath` (must match `app.json`)
   - SKU: anything unique, e.g. `onebreath-ios-001`
   - Note the **App Store Connect App ID** (a numeric ID shown in the app's URL after creation) — you'll paste it into `eas.json`.
3. **Local tooling** (already installed if you've followed README):
   ```bash
   node --version          # 20+
   npm install -g eas-cli
   eas --version
   ```
4. **Log in to Expo**:
   ```bash
   eas login
   eas whoami
   ```

---

## 1. Fill in `eas.json` placeholders

Open `eas.json` and replace the three placeholders under `submit.production.ios`:

| Placeholder | Where to find it |
|---|---|
| `REPLACE_WITH_APPLE_ID_EMAIL` | The email you use to log in to https://developer.apple.com |
| `REPLACE_WITH_APP_STORE_CONNECT_APP_ID` | App Store Connect → your app → App Information → "Apple ID" (numeric) |
| `REPLACE_WITH_APPLE_TEAM_ID` | https://developer.apple.com/account → Membership → Team ID |

> Tip: don't commit your real Apple ID email if the repo is public. You can instead set `EXPO_APPLE_ID` env var and remove the field from `eas.json`.

---

## 2. Register iOS credentials with EAS (one-time per project)

```bash
eas credentials
```

Choose: `iOS` → `production` → `Set up a new Distribution Certificate` (let EAS generate it). EAS stores certificates and provisioning profiles in the cloud so future builds are zero-config.

---

## 3. Build for TestFlight

Bump the marketing version in `app.json` if needed (`expo.version`). The build number auto-increments because `production.autoIncrement` is `true` in `eas.json`.

```bash
eas build --platform ios --profile production
```

This:
- Uploads your project to EAS
- Builds an `.ipa` in the cloud (~15–30 min for a first build)
- Prints a downloadable URL when finished

---

## 4. Submit to App Store Connect

```bash
eas submit --platform ios --latest
```

This pushes the most recent successful build to App Store Connect. Within a few minutes it appears under TestFlight → Builds.

---

## 5. TestFlight (recommended before public release)

1. App Store Connect → your app → **TestFlight** → Internal Testing
2. Add yourself / a small group as internal testers
3. Each tester installs the **TestFlight** app on their iPhone, accepts the email invite, and installs OneBreath
4. Use the build for at least a day on real hardware. Verify:
   - Splash screen renders at the correct size
   - Haptics fire on hold start/stop
   - `expo-keep-awake` keeps the screen on during a hold
   - AsyncStorage history survives app kill / reinstall (via iCloud Backup if enabled)
   - Reanimated animations are smooth on lower-end devices

---

## 6. Public App Store submission

When TestFlight looks good:

1. App Store Connect → your app → **App Store** tab → fill out the version page:
   - **Description** — copy from `README.md` and adapt to App Store style
   - **Keywords** — `breath hold, freediving, apnea, breathing, lung capacity, meditation` (100-char limit, comma-separated)
   - **Support URL** — your GitHub repo URL is acceptable
   - **Marketing URL** — optional
   - **Privacy Policy URL** — see step 7 below
   - **Category** — Primary: Health & Fitness
   - **Age Rating** — answer the questionnaire (OneBreath should rate 4+)
   - **Screenshots** — required for 6.7" iPhone (and 6.5" if you support older devices). Use the iOS Simulator or a real device:
     ```bash
     # in another terminal
     npm run ios
     # then Cmd+S in the simulator to grab screenshots, or use Xcode's Devices window
     ```
2. Choose the build you tested in TestFlight
3. **App Privacy** section → declare "Data Not Collected" (matches `docs/PRIVACY.md`)
4. **App Review Information** → optional notes; OneBreath needs none
5. Click **Add for Review** → **Submit**

Apple typically reviews within 24–48 hours.

---

## 7. Hosting the privacy policy URL

Apple requires the **Privacy Policy URL** field on the App Store form to be a publicly reachable HTTPS URL. Two options:

**Option A — Raw GitHub link (fastest)**
Use: `https://github.com/william051200/OneBreath/blob/main/docs/PRIVACY.md`

This is generally accepted by App Review.

**Option B — GitHub Pages (cleaner, recommended)**
1. GitHub repo → **Settings** → **Pages**
2. Source: `Deploy from a branch`, branch: `main`, folder: `/docs`
3. Save → wait ~1 minute → Pages publishes at `https://william051200.github.io/OneBreath/PRIVACY`
4. Use that URL on the App Store form

---

## 8. Versioning convention

| Field | Where | When to bump |
|---|---|---|
| `expo.version` | `app.json` | User-visible release (e.g. `1.0.0` → `1.1.0`). Follow [semver](https://semver.org). |
| iOS `buildNumber` | Auto-incremented by EAS | Every successful build. Don't edit by hand. |

A typical release is: edit code → bump `expo.version` → commit → `eas build` → `eas submit` → release in App Store Connect.

---

## Quick reference

```bash
# everyday release loop
eas build --platform ios --profile production
eas submit --platform ios --latest

# preview build (TestFlight only, no autoincrement)
eas build --platform ios --profile preview

# local dev build with the dev client
eas build --platform ios --profile development
```

## Troubleshooting

- **"Invalid bundle ID"** → must exactly match the App Store Connect record and `app.json`'s `ios.bundleIdentifier`.
- **"Missing export compliance"** → already handled by `ITSAppUsesNonExemptEncryption: false` in `app.json`. If Apple still asks, answer "No" in App Store Connect.
- **Build fails on Reanimated** → ensure `babel.config.js` has `react-native-worklets/plugin` listed last.
- **Submit step asks for App-Specific Password** → generate one at https://appleid.apple.com → Sign-In and Security → App-Specific Passwords.
