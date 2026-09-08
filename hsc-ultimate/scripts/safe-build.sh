#!/bin/sh
# Memory-aware production build with progress heartbeat and temporary swap cleanup.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

if [ ! -x node_modules/.bin/next ]; then
  echo "Dependencies নেই — setup চালানো হচ্ছে…"
  sh scripts/bootstrap.sh
fi

major=$(node -p "Number(process.versions.node.split('.')[0])")
if [ "$major" -lt 22 ]; then
  echo "❌ Node.js 22+ দরকার; বর্তমান: $(node --version)" >&2
  exit 1
fi

MEM_KB=$(awk '/MemTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
SWAP_KB=$(awk '/SwapTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
SWAP_FILE="/swapfile-hsc-build"
SWAP_CREATED=0

cleanup_swap() {
  if [ "$SWAP_CREATED" -eq 1 ]; then
    echo "[build] Temporary swap cleanup…"
    if [ "$(id -u)" -eq 0 ]; then
      swapoff "$SWAP_FILE" 2>/dev/null || true
      rm -f "$SWAP_FILE"
    elif command -v sudo >/dev/null 2>&1; then
      sudo -n swapoff "$SWAP_FILE" 2>/dev/null || true
      sudo -n rm -f "$SWAP_FILE" 2>/dev/null || true
    fi
  fi
}
trap cleanup_swap EXIT INT TERM

create_swap_direct() {
  fallocate -l 2G "$SWAP_FILE" &&
  chmod 600 "$SWAP_FILE" &&
  mkswap "$SWAP_FILE" >/dev/null &&
  swapon "$SWAP_FILE"
}
create_swap_sudo() {
  sudo -n fallocate -l 2G "$SWAP_FILE" &&
  sudo -n chmod 600 "$SWAP_FILE" &&
  sudo -n mkswap "$SWAP_FILE" >/dev/null &&
  sudo -n swapon "$SWAP_FILE"
}

if [ "$MEM_KB" -gt 0 ] && [ "$MEM_KB" -lt 3145728 ] && [ "$SWAP_KB" -lt 1048576 ]; then
  echo "[build] Low-memory machine detected; temporary 2 GB swap চেষ্টা করছি…"
  if [ "$(id -u)" -eq 0 ] && create_swap_direct; then
    SWAP_CREATED=1
  elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null && create_swap_sudo; then
    SWAP_CREATED=1
  else
    rm -f "$SWAP_FILE" 2>/dev/null || true
    echo "⚠️ Swap তৈরি যায়নি। 4 GB+ RAM machine/CI-তে build চালানো ভালো।"
  fi
fi

HEAP_MB=${HSC_BUILD_HEAP_MB:-1400}
LOG=${TMPDIR:-/tmp}/hsc-ultimate-build-$$.log
: > "$LOG"
start=$(date +%s)
last=0

NODE_OPTIONS="--max-old-space-size=$HEAP_MB ${NODE_OPTIONS:-}" \
NEXT_TELEMETRY_DISABLED=1 \
./node_modules/.bin/next build --webpack >"$LOG" 2>&1 &
pid=$!

on_signal() {
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
  exit 130
}
trap 'on_signal' INT TERM

echo "[build] Webpack production build started (heap ${HEAP_MB} MB)…"
while kill -0 "$pid" 2>/dev/null; do
  lines=$(wc -l < "$LOG" | tr -d ' ')
  if [ "$lines" -gt "$last" ]; then
    sed -n "$((last + 1)),${lines}p" "$LOG"
    last=$lines
  fi
  elapsed=$(( $(date +%s) - start ))
  echo "[build] working… $((elapsed / 60))m $((elapsed % 60))s"
  sleep 10
done

set +e
wait "$pid"
status=$?
set -e
lines=$(wc -l < "$LOG" | tr -d ' ')
if [ "$lines" -gt "$last" ]; then
  sed -n "$((last + 1)),${lines}p" "$LOG"
fi
rm -f "$LOG"

if [ "$status" -ne 0 ]; then
  echo "❌ Production build failed (exit $status)."
  exit "$status"
fi
echo "✅ Production build complete."
