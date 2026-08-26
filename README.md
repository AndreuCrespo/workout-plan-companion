# Workout Plan Companion

A personal mobile app for organising a monthly gym plan, guiding each workout, and tracking progress. It is built with Expo, React Native, and TypeScript.

> This app does not provide medical diagnoses or replace healthcare professionals. If you experience acute pain, an injury, or a clinical condition, stop exercising and seek professional advice.

## Current status · v0.1.0

- Expo Router navigation: **Today**, **My plan**, **Progress**, and **Profile**.
- A local four-week monthly plan, exercise details with material and step-by-step guidance.
- A reviewed local exercise catalogue based on MIT-covered metadata and instruction text. Third-party media is not included.
- Local workout drafts and immutable completed logs for sets, load, repetitions, RPE, notes, and per-exercise feedback; the session flow includes a rest timer and a completion summary.
- Local progress based on completed logs: adherence, volume, a 12-week activity heatmap, exercise history, personal bests, and transparent Epley 1RM estimates where applicable.
- A persistent local plan conversation that produces a reviewable four-week proposal; publication is explicit, creates an immutable new version, and preserves prior plans and logs.
- Optional Magic Link access through Supabase Auth, with the session kept in device secure storage; profile, plans, logs, and progress remain local until a consented migration is built.
- A reviewed design for Supabase persistence and a secure remote assistant; remote data sync and AI are not implemented yet.
- Two persistent themes: Graphite Orange is the default; Active Green is the alternative.
- Sample data and local repositories, ready to be replaced by remote persistence later.
- No remote profile, plan, workout-log, progress, AI-provider, or external media service. The app only uses Supabase Auth when a person explicitly requests an email link.

The repository documentation is in English. The current in-app interface is Spanish; bilingual localisation is planned separately.

## Run in development

Requires Node.js 24 and npm.

```bash
cd mobile
npm install
npm start
```

For a physical Android device, use a locally built debug APK or an Expo Go version compatible with the installed Expo SDK. The debug APK requires Metro while it is running; see the USB instructions below.

## Checks

```bash
cd mobile
npm run lint
npm run typecheck
```

GitHub Actions runs both checks for every push and pull request targeting `main`.

## Structure

- `mobile/app/`: Expo Router routes and screens.
- `mobile/components/`: reusable UI components.
- `mobile/theme/`: theme tokens and provider.
- `mobile/domain/`: TypeScript models.
- `mobile/data/`: isolated sample data.
- `mobile/repositories/`: contracts and local implementations for data and preferences.
- `supabase/`: versioned SQL migrations; it contains no credentials.
- `docs/`: approved product brief, visual system, third-party licence notices, the [future Supabase/assistant architecture](docs/supabase-assistant-architecture.md), and the [initial migration guide](docs/apply-supabase-foundation.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [GitHub workflow](docs/github-workflow.md) for branches, pull requests, releases, and repository hygiene.

## Test a debug APK over USB from WSL

Windows must share the phone with WSL through `usbipd-win`. USB debugging must be authorised on the phone and `adb` must be available in WSL.

1. In an elevated Windows PowerShell, identify and attach the device:

   ```powershell
   usbipd list
   usbipd bind --busid <BUSID> # only needed the first time
   usbipd attach --wsl --busid <BUSID>
   ```

2. In WSL, confirm that the phone state is `device`, build and install the debug APK:

   ```bash
   adb devices -l
   cd mobile/android
   ./gradlew assembleDebug
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

3. A debug APK does not embed the JavaScript bundle. Keep Metro running and create the USB port bridge before opening the app:

   ```bash
   cd mobile
   npm start -- --localhost --port 8081

   # In a second WSL terminal
   adb reverse tcp:8081 tcp:8081
   adb shell monkey -p com.anonymous.gimnasio 1
   ```

If Metro is unavailable or the phone is detached from WSL when the debug APK starts, it can remain on the splash screen because it cannot load the JavaScript bundle. A release APK embeds the bundle, but creating a distribution build requires explicit approval.

You may need to attach the phone again after unplugging it. Never share RSA authorisations or tokens.

## Licence

Pending a decision before explicitly allowing third parties to reuse the code.
