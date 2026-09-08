#!/bin/bash
# ===================================================================
# HSC Ultimate — Android APK Build Script
# ===================================================================
# Usage:
#   ./scripts/build-android.sh debug      # Debug APK (no signing)
#   ./scripts/build-android.sh release    # Release APK (needs signing)
#   ./scripts/build-android.sh bundle     # AAB for Play Store
#   ./scripts/build-android.sh all        # Both APK + AAB
# ===================================================================

set -e  # Exit on error
set -u  # Error on unset vars

cd "$(dirname "$0")/.."  # Project root

MODE="${1:-debug}"
APP_NAME="HSC Ultimate"
BUNDLE_ID="com.hscultimate.app"
VERSION=$(node -p "require('./package.json').version")
VERSION_CODE=$(date +%s)  # Unix timestamp as version code

echo "============================================"
echo "  $APP_NAME - Android Build"
echo "============================================"
echo "Mode:      $MODE"
echo "Bundle ID: $BUNDLE_ID"
echo "Version:   $VERSION (code: $VERSION_CODE)"
echo "============================================"
echo ""

# 1. Check prerequisites
echo "[1/6] Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not installed"; exit 1
fi
if ! command -v java &> /dev/null; then
  echo "⚠️  Java not installed (need JDK 17+ for Android)"
  echo "   Install: sudo apt install openjdk-17-jdk (Linux) or brew install openjdk@17 (Mac)"
  exit 1
fi
if [ ! -d "android" ]; then
  echo "⚠️  Android platform not added yet. Running: npx cap add android"
  npx cap add android
fi
echo "✅ Prerequisites OK"
echo ""

# 2. Build Next.js (for static export — only used if not using server.url mode)
echo "[2/6] Building Next.js app..."
if [ -z "${CAPACITOR_SERVER_URL:-}" ]; then
  echo "   Building static export → ./out"
  NEXT_PUBLIC_APP_MODE=capacitor npx next build
else
  echo "   Using server URL: $CAPACITOR_SERVER_URL (skipping static build)"
fi
echo "✅ Build done"
echo ""

# 3. Sync Capacitor
echo "[3/6] Syncing Capacitor (web assets → native project)..."
npx cap sync android
echo "✅ Sync done"
echo ""

# 4. Update version in AndroidManifest
echo "[4/6] Updating version in build.gradle..."
GRADLE_FILE="android/app/build.gradle"
if [ -f "$GRADLE_FILE" ]; then
  sed -i.bak "s/versionCode [0-9]*/versionCode $VERSION_CODE/" $GRADLE_FILE
  sed -i.bak "s/versionName \"[^\"]*\"/versionName \"$VERSION\"/" $GRADLE_FILE
  rm -f $GRADLE_FILE.bak
  echo "✅ Version: $VERSION (code: $VERSION_CODE)"
fi
echo ""

# 5. Generate icons (if not already done)
echo "[5/6] Generating app icons..."
if [ -d "resources" ]; then
  npx cap assets generate --android 2>/dev/null || echo "   (icons already present, skipping)"
else
  echo "   ⚠️  No /resources directory — using default Capacitor icons"
  echo "   To customize: see docs/NATIVE_APP.md#app-icons"
fi
echo ""

# 6. Build
echo "[6/6] Building $MODE..."
cd android

case "$MODE" in
  debug)
    ./gradlew assembleDebug --no-daemon
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    ;;
  release)
    ./gradlew assembleRelease --no-daemon
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    ;;
  bundle|aab)
    ./gradlew bundleRelease --no-daemon
    APK_PATH="app/build/outputs/bundle/release/app-release.aab"
    ;;
  all)
    ./gradlew assembleRelease bundleRelease --no-daemon
    APK_PATH="app/build/outputs/apk/release/app-release.apk + AAB"
    ;;
  *)
    echo "❌ Unknown mode: $MODE"
    echo "   Usage: $0 {debug|release|bundle|all}"
    exit 1
    ;;
esac

cd ..

echo ""
echo "============================================"
echo "  ✅ BUILD SUCCESSFUL"
echo "============================================"
echo "Output: android/$APK_PATH"
echo ""
ls -lh "android/$APK_PATH" 2>/dev/null || true
echo ""
echo "Install on connected device:"
echo "  adb install android/$APK_PATH"
echo ""
