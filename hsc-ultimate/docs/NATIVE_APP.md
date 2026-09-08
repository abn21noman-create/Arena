# HSC Ultimate — Native App Build Guide

This guide covers building **HSC Ultimate** as a native **Android APK** and **Windows .exe/.msi** using Capacitor. The web app is reused as-is — Capacitor wraps the Next.js app in a native WebView with full access to device features.

> **কেন Capacitor?**
> - 90% code reuse — same Next.js app, same DB, same auth
> - Push notification, offline mode, haptics — native features
> - Direct install (APK/MSIX) without Play Store fees
> - Update web app = instant app update (no app store review)

---

## 📋 Prerequisites

### For Android APK:
| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Java JDK | 17+ | `apt install openjdk-17-jdk` (Linux) / `brew install openjdk@17` (Mac) |
| Android Studio | Latest | https://developer.android.com/studio |
| Android SDK | API 35 | Auto-installed with Android Studio |

### For Windows .msi:
| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| .NET SDK | 6.0+ | https://dotnet.microsoft.com/download |
| Visual Studio 2022 | Community | https://visualstudio.microsoft.com (with "Universal Windows Platform" workload) |

### Already installed in this project:
- ✅ All Capacitor plugins (`@capacitor/core`, `android`, `push-notifications`, etc.)
- ✅ Custom app icons (all sizes)
- ✅ Adaptive icon (Android 8+)
- ✅ Splash screens (all sizes)
- ✅ FCM service stub
- ✅ Build scripts (`scripts/build-android.sh`, `scripts/build-windows.ps1`)

---

## 🚀 Quick Build (Android APK)

### Step 1: Build the web app
```bash
cd /home/user/hsc-ultimate

# For live URL mode (recommended — app loads from your deployed site):
# Edit capacitor.config.ts → server.url = "https://hsc-ultimate.app"
# Then skip the build (Capacitor fetches live URL)

# For offline / static mode:
NEXT_PUBLIC_APP_MODE=capacitor npm run build
# → produces ./out directory

# Sync with Capacitor:
npx cap sync android
```

### Step 2: Build APK
```bash
# Debug APK (no signing needed — for testing on your device)
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

# Release APK (needs signing — see below)
./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk

# Android App Bundle (for Play Store)
./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab

# Or use the helper script:
cd ..
./scripts/build-android.sh release
```

### Step 3: Install on device
```bash
# USB connected + USB debugging enabled:
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or copy the .apk to phone and tap to install
# (Enable "Install from unknown sources" first)
```

---

## 🔐 Signing the Release APK

Debug builds use Android's automatically generated debug keystore. Release builds are **never debug-signed**. `android/app/build.gradle` enables release signing only when the following environment variables are available.

### Create a release keystore
```bash
keytool -genkeypair -v \
  -keystore "$HOME/hsc-ultimate-release.keystore" \
  -alias hsc-ultimate \
  -keyalg RSA -keysize 2048 -validity 10000
```

### Configure signing for the current shell or CI secret store
```bash
export HSC_KEYSTORE_PATH="$HOME/hsc-ultimate-release.keystore"
export HSC_KEYSTORE_PASSWORD="YOUR_STORE_PASSWORD"
export HSC_KEY_ALIAS="hsc-ultimate"
export HSC_KEY_PASSWORD="YOUR_KEY_PASSWORD"
```

Do not write these passwords to `gradle.properties`, and never place the keystore inside the repository. In CI, store all four values as encrypted secrets.

### Rebuild:
```bash
cd /home/user/hsc-ultimate/android
./gradlew clean
./gradlew assembleRelease
# → signed APK at app/build/outputs/apk/release/app-release.apk
```

---

## 📱 Push Notifications (FCM)

The app already has FCM service stub. To enable real push:

### Step 1: Create Firebase project
1. Go to https://console.firebase.google.com
2. Click "Add project" → "HSC Ultimate"
3. Disable Google Analytics (optional) → Create
4. Click "Add app" → Android icon
5. Package name: `com.hscultimate.app` (must match!)
6. App nickname: "HSC Ultimate"
7. Download `google-services.json`
8. Place it at: `android/app/google-services.json`

### Step 2: Add Firebase to build.gradle
The `android/build.gradle` already has classpath:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```
And `app/build.gradle` auto-applies the plugin if `google-services.json` exists.

### Step 3: Configure Firebase Admin service account
Firebase Console → Project Settings → Service Accounts থেকে server-side service account credentials নিন। Legacy FCM server key ব্যবহার করা হয় না। Deployment secret manager/`.env.local`-এ:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@your-project.iam.gserviceaccount.com"
# Multiline PEM-কে এক লাইনে রাখলে newline হিসেবে \\n ব্যবহার করুন
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```

Private key ও `google-services.json` commit করবেন না।

### Step 4: Existing delivery pipeline

`lib/native-push.ts` এবং `HSCFirebaseMessagingService.java` ইতিমধ্যে consent-gated START/STOP data command, replay/expiry guard, invalid-token soft-disable, delivery audit ও native receipt sync implement করে। Admin diagnostics `/admin/focus`-এ দেখা যায়। বিস্তারিত: [`NATIVE_PUSH_DELIVERY_READINESS.md`](./NATIVE_PUSH_DELIVERY_READINESS.md)।

### Step 5: Register device token (web)
Already integrated in `lib/capacitor.ts` — `pushNotifications.register()` authenticated token-টি `/api/native-devices`-এ পাঠায়।

---

## 🪟 Windows Build

### Step 1: Install prerequisites
- Install .NET 6 SDK or later
- Install Visual Studio 2022 with "Universal Windows Platform" workload

### Step 2: Add Windows platform
```powershell
cd C:\path\to\hsc-ultimate
npm install --save @capacitor/windows
npx cap add windows
npx cap sync windows
```

### Step 3: Build
```powershell
# Open the solution in Visual Studio:
start windows\HSC Ultimate.sln

# Or from command line:
cd windows
dotnet build -c Release
# → windows\bin\Release\net6.0-windows10.0.19041.0\win-x64\HSC Ultimate.exe
```

### Step 4: Create MSIX installer
In Visual Studio:
1. Right-click project → "Publish" → "Create App Packages"
2. Choose "Sideloading" (no Microsoft Store)
3. Set version, architecture (x64)
4. Click "Create"
5. → `windows\AppPackages\HSC Ultimate_1.0.0.0_Debug_Test\HSC Ultimate_1.0.0.0_x64.msix`

### Step 5: Install on Windows
```powershell
# Double-click the .msix file
# Or via command line:
Add-AppxPackage ".\HSC Ultimate_1.0.0.0_x64.msix"
```

> **Note:** Windows users need to enable "Developer mode" in Settings → Privacy & Security → For developers.

---

## 🎨 Customizing App Icons

The project ships with **branded gradient + HSC + ULTIMATE text** icons. To replace with custom logo:

1. Create your 1024×1024 icon as PNG
2. Save to `resources/icon-only.png`
3. Run: `bash scripts/generate-icons-final.sh`
4. Copy to Android: `cp resources/android/* android/app/src/main/res/mipmap-*/`
5. Sync: `npx cap sync android`
6. Rebuild: `cd android && ./gradlew clean && ./gradlew assembleRelease`

---

## 🔧 App Configuration

### `capacitor.config.ts` — main config
- **appId**: `com.hscultimate.app` (unique identifier, don't change after publishing)
- **appName**: Display name "HSC Ultimate"
- **server.url**: Production URL the app loads
- **webDir**: `out` — static Next.js export (only used if no server.url)

### `next.config.ts` — web app
- Already has security headers, image optimization, compression
- No changes needed for Capacitor

### `package.json` — scripts
- `cap:sync` — sync web assets to native
- `android:build:debug` — debug APK
- `android:build:release` — release APK
- `android:build:bundle` — AAB for Play Store

---

## 🌐 Live URL Mode (Recommended)

For a full app with auth, DB, and API routes, use **live URL mode**:

```typescript
// capacitor.config.ts
server: {
  url: "https://hsc-ultimate.app",  // ← deployed web app
  cleartext: false,
}
```

**Why this is best:**
- ✅ No code duplication — same Next.js deployment serves web + native
- ✅ Instant updates — change code, all users get the new version (no app store review)
- ✅ Single auth, single DB, single codebase
- ✅ Smaller APK (no bundled web assets)

**Setup:**
1. Deploy Next.js to Vercel/Railway/Docker → get URL like `https://hsc-ultimate.app`
2. Update `capacitor.config.ts` `server.url`
3. `npx cap sync android && cd android && ./gradlew assembleRelease`
4. APK loads from your live URL on launch

---

## 📦 APK Distribution

### Option 1: Direct download
1. Host the APK on your own site
2. Users download → enable "Install from unknown sources" → install
3. Update the file when you push new versions

### Option 2: Play Store (one-time $25 fee)
1. Create Google Play Console account
2. Upload AAB: `android/app/build/outputs/bundle/release/app-release.aab`
3. Fill in: title, description, screenshots, privacy policy
4. Submit for review (1-3 days)
5. Auto-updates via Play Store

### Option 3: Third-party stores
- Amazon App Store, Samsung Galaxy Store, F-Droid (open-source)
- All accept unsigned/signed APKs

---

## 🧪 Testing Checklist

Before distribution, verify:

- [ ] App launches and shows login page
- [ ] Login works (using your Supabase auth)
- [ ] All major routes load (dashboard, practice, etc.)
- [ ] Push notification permission prompt appears
- [ ] Push notification arrives and opens the app
- [ ] App icon appears correctly in launcher
- [ ] Splash screen shows on launch
- [ ] Back button works (returns to previous page, exits on home)
- [ ] Haptic feedback works on button press
- [ ] Offline mode shows cached content
- [ ] Status bar matches app theme (dark blue)

---

## 🐛 Troubleshooting

### "SDK location not found"
```bash
# Create android/local.properties with your SDK path:
echo "sdk.dir=/Users/yourname/Library/Android/sdk" > android/local.properties
# (Windows: C:\\Users\\yourname\\AppData\\Local\\Android\\Sdk)
```

### "Build failed: java.lang.UnsupportedClassVersionError"
- Install Java 21+ (not Java 8 or 11)
- Set `JAVA_HOME` to JDK 21 path

### "Push notifications not received"
- Verify `google-services.json` is in `android/app/`
- Check all three Firebase Admin environment variables with `npm run check:secrets`
- `/api/health` ও `/admin/focus` Native Delivery Diagnostics দেখুন
- Firebase Console থেকে device token-এ test notification পাঠিয়ে Android logcat/receipt যাচাই করুন

### "App shows white screen"
- Check `capacitor.config.ts` `server.url` is correct
- Open in browser first to verify the URL works
- Check Android logcat: `adb logcat | grep -i capacitor`

### "APK too large"
- Enable ProGuard/R8: `minifyEnabled true` (already done)
- Use AAB for Play Store (auto-splits per device)
- Remove unused assets from `resources/`

---

## 📊 Bundle Size

Current (debug, no optimizations):
- **APK**: ~25-30 MB (Capacitor runtime + WebView + assets)
- **AAB** (Play Store): ~15-20 MB (auto-split, optimized)
- **Windows MSIX**: ~80-100 MB (includes .NET runtime)

For a Next.js app, this is normal. If size is critical, consider:
- `npm uninstall` unused dependencies
- Remove unused Capacitor plugins (e.g., `@capacitor/share` if not used)
- Use `capacitor.config.ts` → `webContentsDebuggingEnabled: false` (already off in release)

---

## 📁 Project Structure

```
hsc-ultimate/
├── android/                          # Android native project
│   ├── app/
│   │   ├── build.gradle              # App-level build config
│   │   ├── google-services.json      # Firebase config (gitignored)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml   # App metadata + permissions
│   │       ├── java/com/hscultimate/app/
│   │       │   ├── MainActivity.java
│   │       │   └── HSCFirebaseMessagingService.java
│   │       └── res/                  # Icons, splash, themes
│   ├── build.gradle                  # Top-level build config
│   ├── gradle.properties             # SDK paths, signing
│   └── variables.gradle              # SDK versions
├── capacitor.config.ts               # Main Capacitor config
├── capacitor.android.ts              # Android-specific overrides
├── windows/                          # Windows native project (after `cap add windows`)
├── resources/                        # Source icons (replace these)
│   ├── icon.svg                      # Master SVG
│   ├── icon-only.png                 # 1024×1024 master
│   ├── splash.png                    # Master splash
│   ├── android/                      # Android icon set
│   ├── pwa/                          # PWA icon set
│   └── *.png                         # Splash screens (per device)
├── scripts/
│   ├── generate-icons-final.sh       # Regenerate all icons from master
│   ├── build-android.sh              # Full Android build
│   └── build-windows.ps1             # Full Windows build
├── lib/
│   └── capacitor.ts                  # Native bridge (push, haptics, etc.)
└── hooks/
    └── use-capacitor.ts              # React hooks for native features
```

---

## 🔄 Update Workflow

When you change the web app:

**If using live URL mode:**
1. Deploy web app (`git push` → Vercel auto-deploys)
2. All users get the new version instantly on next app launch
3. No APK rebuild needed!

**If using static export mode:**
1. `npm run build` (regenerates `out/`)
2. `npx cap sync android`
3. `cd android && ./gradlew assembleRelease`
4. Distribute new APK

For app metadata changes (icon, name, permissions):
1. Edit `capacitor.config.ts` or `AndroidManifest.xml`
2. `npx cap sync android`
3. Rebuild APK
4. Upload to Play Store / distribute

---

## 🆘 Getting Help

- **Capacitor docs**: https://capacitorjs.com/docs
- **Android docs**: https://developer.android.com
- **Firebase setup**: https://firebase.google.com/docs/android/setup
- **MSIX packaging**: https://docs.microsoft.com/en-us/windows/msix

---

**Happy building! 🚀**
