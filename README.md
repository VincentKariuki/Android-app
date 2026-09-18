# Blank Spaces — Minimalist Android Launcher

> A clean, text-only Android home-screen launcher inspired by a mindset seeking fewer digital distractions, visual clarity, and intentional phone usage.

---

## Overview

Modern smartphones inundate attention with bright saturated icons, red notification badges, and algorithmically engineered visual triggers. **Blank Spaces Launcher** replaces the traditional icon-heavy home screen with a typographic, monochrome, and intentional interface.

This repository includes:
1. **Interactive Web Simulator & Companion Workbench**: Test, configure, and visualize the launcher behavior, gesture flows, mindful friction delays, and spaces in real-time.
2. **Production Android Project (Kotlin & Jetpack Compose)**: Complete native Android launcher implementation ready to build and install in Android Studio or via Gradle.
3. **One-Click Android Project ZIP Export**: Export the entire ready-to-compile Gradle project directly from the simulator interface.

---

## Key Features

### 🔤 Radical Typography & Zero Icons
- **Text-Only Interface**: No icon packs, no graphic clutter, no color badges.
- **Friendly Human App Names**: Technical identifiers (e.g., `com.google.android.keep`) are hidden by default in favor of clean labels like `notes`, `browser`, `camera`, and `phone`.
- **Custom Renaming**: Rename any app to reflect its function (e.g. rename *Audible* to *listen*, *Kindle* to *read*, *Todoist* to *tasks*).
- **Flexible Typography**: Select font family (*System Sans*, *Monospace*, *Serif*), font size (*Compact*, *Normal*, *Large*, *Huge*), and alignment (*Left*, *Center*, *Right*).

### 🌌 Spaces (Contextual Home Screens)
- Switch between customized app environments according to your mindset:
  - **Focus Space**: Minimal set of communication and capture essentials.
  - **Work Space**: Productivity, calendar, and collaboration tools.
  - **Personal Space**: Audio, maps, camera, and utilities.

### 🧘 Mindful Friction (Intentional Delay)
- Combat impulsive reflex tapping on addicting apps (social media, video feeds).
- Configurable countdown timer (2s, 3s, or 5s breathing pause) before launching selected apps, providing a conscious moment to reconsider.

### 🔍 Searchable App Drawer
- Instant filter-as-you-type search for all installed applications.
- Long-press any app to rename it, toggle mindful friction, or pin it to your active space.
- Hide rarely used or system utilities from the app drawer completely.

### ⚡ Fast Gestures & Status Widgets
- **Swipe Left / Right**: Quick launch assigned actions (e.g., Phone dialer, Camera).
- **Double Tap**: Immediate screen lock simulation.
- **Home Widgets**: Configurable clock, calendar date, battery percentage, and Android status bar visibility.
- **Color Themes**: True OLED Black (`#000000`), Slate Dark, and Clean Light.

### 🛡️ Privacy & Zero Bloat
- **No Internet Permission Required**: Completely offline.
- **Zero Telemetry or Ad Trackers**: Respects privacy with zero network calls.
- **Local Persistence**: State is stored strictly in Android Jetpack DataStore (and browser `localStorage` in the simulator).

---

## Native Android Architecture

The native Android codebase is built using modern Android architecture standards:

- **Language**: Kotlin 2.0+
- **UI Toolkit**: Jetpack Compose with Material 3
- **Architecture**: Single-Activity architecture with MVVM pattern (`LauncherViewModel`)
- **App Discovery**: Android `PackageManager` querying `Intent.ACTION_MAIN` + `Intent.CATEGORY_LAUNCHER`
- **Persistence**: Jetpack DataStore Preferences for zero-bloat asynchronous key-value storage
- **Concurrency**: Kotlin Coroutines & `StateFlow`
- **Target SDK**: Android 15 (API 35), Minimum SDK: Android 8.0 Oreo (API 26)

### Android Project Structure

```text
BlankSpacesLauncher/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/blankspaces/launcher/
│           ├── MainActivity.kt
│           ├── data/
│           │   ├── model/
│           │   │   ├── AppInfo.kt
│           │   │   └── LauncherSettings.kt
│           │   └── repository/
│           │       ├── AppsRepository.kt
│           │       └── PreferencesRepository.kt
│           ├── ui/
│           │   ├── screens/
│           │   │   ├── HomeScreen.kt
│           │   │   ├── AppDrawerScreen.kt
│           │   │   ├── SettingsDialog.kt
│           │   │   ├── RenameDialog.kt
│           │   │   └── MindfulFrictionDialog.kt
│           │   ├── theme/
│           │   │   ├── Color.kt
│           │   │   └── Theme.kt
│           │   └── viewmodel/
│           │       └── LauncherViewModel.kt
├── gradle/libs.versions.toml
├── build.gradle.kts
└── settings.gradle.kts
```

---

## Getting Started

### 1. Web Simulator (Preview & Experiment)

Run the interactive preview environment locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to interact with the phone mockup, customize themes and spaces, view Kotlin source files, or download the full Android project ZIP.

### 2. Building the Native Android App

#### Prerequisites
- [Android Studio Ladybug (2024.2+)](https://developer.android.com/studio) or newer
- JDK 17+
- Android SDK 35 (installed via Android Studio SDK Manager)

#### Building & Running
1. Export the Android project ZIP via the **Code & Export** tab in the web simulator, or clone this repository.
2. Open Android Studio and choose **Open an Existing Project**, selecting the root project folder.
3. Allow Gradle sync to download Jetpack Compose dependencies.
4. Connect an Android device (with USB debugging enabled) or start an Android Virtual Device (AVD).
5. Click **Run 'app'** (`Shift + F10`) to deploy.

#### Setting as Default Launcher
Once installed on your device:
1. Press the device **Home** button or go to **Settings > Apps > Default Apps > Home App**.
2. Select **Blank Spaces** and choose **Always**.

---

## Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the interactive Vite development server on port 3000 |
| `npm run build` | Compiles the production web simulator bundle |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking without emitting files |

---

## License

This project is open source and available under the [MIT License](LICENSE).
