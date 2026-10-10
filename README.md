# FitTrack

Expo (SDK 54) + React Native + TypeScript fitness app. Türkçe / English. All data is stored on the device (AsyncStorage).

## Run
```
npm install
npx expo start      # scan QR with Expo Go, or press a / i
npm run typecheck
```

## Features
- Today: weekly goal, calories, water, latest weight, last workout
- Workout: live session logging (sets/kg/reps), 4 ready programs, 38-exercise library, history
- Nutrition: calories/macros, water, meals, quick-add from a Turkish food list
- Progress: weight line chart, workouts-per-week chart, body measurements
- Settings: language, goals, weekly workout reminder notifications, data reset

## Structure
App.tsx (tabs) · src/store.tsx (state + persistence) · src/i18n.ts · src/notifications.ts · src/screens/* · src/components/ui.tsx · src/data/*

Note: weekly reminders need a development build or Expo Go on a device; notifications are not supported on web.

## Setup after cloning
1. `npm install`
2. Copy `src/config.example.ts` to `src/config.ts` (this file is git-ignored). Leave it empty to disable photo calories, or fill it in after deploying the worker (see `worker/README.md`).
3. `npx expo start` (add `--tunnel` if your phone cannot reach your computer; this needs a free Expo account: `npx expo login`).

Never commit `src/config.ts` or any API key.
