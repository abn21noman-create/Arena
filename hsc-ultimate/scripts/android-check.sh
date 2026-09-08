#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

if [ ! -x node_modules/.bin/cap ]; then
  echo "Dependencies নেই — npm run setup চালান।" >&2
  exit 1
fi

java_version=$(java -version 2>&1 | awk -F '"' '/version/{print $2; exit}')
java_major=$(printf '%s' "$java_version" | awk -F. '{if ($1=="1") print $2; else print $1}')
if [ -z "$java_major" ] || [ "$java_major" -lt 21 ]; then
  echo "❌ Android build-এর জন্য JDK 21+ দরকার; বর্তমান: ${java_version:-not found}" >&2
  exit 1
fi
if [ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]; then
  echo "❌ ANDROID_HOME বা ANDROID_SDK_ROOT সেট করা নেই।" >&2
  exit 1
fi
SDK=${ANDROID_HOME:-$ANDROID_SDK_ROOT}
if [ ! -d "$SDK/platforms/android-36" ]; then
  echo "❌ Android SDK platform 36 নেই: sdkmanager 'platforms;android-36'" >&2
  exit 1
fi

ANDROID_SWAP="/swapfile-hsc-android"
ANDROID_SWAP_CREATED=0
cleanup_android_swap() {
  if [ "$ANDROID_SWAP_CREATED" -eq 1 ]; then
    sudo -n swapoff "$ANDROID_SWAP" 2>/dev/null || true
    sudo -n rm -f "$ANDROID_SWAP" 2>/dev/null || true
  fi
}
trap cleanup_android_swap EXIT
trap 'cleanup_android_swap; exit 130' INT TERM
MEM_KB=$(awk '/MemTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
SWAP_KB=$(awk '/SwapTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
if [ "$MEM_KB" -gt 0 ] && [ "$MEM_KB" -lt 3145728 ] && [ "$SWAP_KB" -lt 1048576 ] && \
   command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  echo "[android] Low RAM detected — temporary 2 GB swap তৈরি হচ্ছে…"
  if sudo -n fallocate -l 2G "$ANDROID_SWAP" && sudo -n chmod 600 "$ANDROID_SWAP" && \
     sudo -n mkswap "$ANDROID_SWAP" >/dev/null && sudo -n swapon "$ANDROID_SWAP"; then
    ANDROID_SWAP_CREATED=1
  else
    sudo -n rm -f "$ANDROID_SWAP" 2>/dev/null || true
    echo "⚠️ Android temporary swap তৈরি যায়নি।" >&2
  fi
fi

./node_modules/.bin/cap doctor
chmod +x android/gradlew
(
  cd android
  ./gradlew testDebugUnitTest --no-daemon --max-workers=1
  ./gradlew assembleDebug --no-daemon --max-workers=1
  ./gradlew lintDebug --no-daemon --max-workers=1
)
echo "✅ Android unit test, compile এবং lint সফল।"
