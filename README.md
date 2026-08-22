# Workout Plan Companion

A personal mobile app for organising a monthly gym plan, guiding each workout, and tracking progress. It is built with Expo, React Native, and TypeScript.

> This app does not provide medical diagnoses or replace healthcare professionals. If you experience acute pain, an injury, or a clinical condition, stop exercising and seek professional advice.

## Current status · v0.1.0

- Expo Router navigation: **Today**, **My plan**, **Progress**, and **Profile**.
- A local four-week monthly plan, exercise details with material and step-by-step guidance, and a structural workout-session flow.
- Two persistent themes: Active Green and Graphite Orange.
- Sample data and local repositories, ready to be replaced by remote persistence later.
- No accounts, Supabase, credentials, or external data services.

The repository documentation is in English. The current in-app interface is Spanish; bilingual localisation is planned separately.

## Run in development

Requires Node.js 24 and npm.

```bash
cd mobile
npm install
npm start
```

To test it on a phone, install Expo Go and scan the QR code while connected to the same Wi-Fi network.

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
- `docs/`: approved product brief and visual system.

## Test Android over USB from WSL

To use Expo Go without Wi-Fi, Windows must share the phone with WSL through `usbipd-win`. USB debugging must be authorised on the phone and `adb` must be installed in WSL.

1. In an elevated Windows PowerShell, identify and attach the device:

   ```powershell
   usbipd list
   usbipd bind --busid <BUSID>
   usbipd attach --wsl --busid <BUSID>
   ```

2. In WSL, confirm that the phone state is `device`, create the port bridge, and start Expo:

   ```bash
   adb devices -l
   adb reverse tcp:8081 tcp:8081
   cd mobile
   npm start -- --localhost --port 8081
   ```

3. Scan the QR code from Expo Go. Fast Refresh updates the app on the phone after each saved change.

You may need to attach the phone again after unplugging it. Never share RSA authorisations or tokens.

## Licence

Pending a decision before explicitly allowing third parties to reuse the code.
