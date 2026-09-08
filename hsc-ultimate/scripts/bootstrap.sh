#!/bin/sh
# Idempotent one-command setup. Reinstalls only when package-lock changes.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

ANDROID=0
CHECK_DB=0
MIGRATE=0
E2E=0
for arg in "$@"; do
  case "$arg" in
    --android) ANDROID=1 ;;
    --check-db) CHECK_DB=1 ;;
    --migrate) MIGRATE=1 ;;
    --e2e) E2E=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

major=$(node -p "Number(process.versions.node.split('.')[0])")
if [ "$major" -lt 22 ]; then
  echo "❌ Node.js 22+ দরকার; বর্তমান: $(node --version)" >&2
  echo "   https://nodejs.org থেকে Node 22 LTS install করুন।" >&2
  exit 1
fi

lock_hash() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum package-lock.json | awk '{print $1}'
  else
    shasum -a 256 package-lock.json | awk '{print $1}'
  fi
}

HASH=$(lock_hash)
STAMP="node_modules/.hsc-package-lock.sha256"
CURRENT=""
[ -f "$STAMP" ] && CURRENT=$(cat "$STAMP")

SETUP_SWAP="/swapfile-hsc-setup"
SETUP_SWAP_CREATED=0
cleanup_setup_swap() {
  if [ "$SETUP_SWAP_CREATED" -eq 1 ]; then
    sudo -n swapoff "$SETUP_SWAP" 2>/dev/null || true
    sudo -n rm -f "$SETUP_SWAP" 2>/dev/null || true
  fi
}
trap cleanup_setup_swap EXIT
trap 'cleanup_setup_swap; exit 130' INT TERM

if [ ! -x node_modules/.bin/next ] || [ "$CURRENT" != "$HASH" ]; then
  MEM_KB=$(awk '/MemTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
  SWAP_KB=$(awk '/SwapTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
  if [ "$MEM_KB" -gt 0 ] && [ "$MEM_KB" -lt 3145728 ] && [ "$SWAP_KB" -lt 524288 ] && \
     command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    echo "[setup] Low RAM detected — temporary 1 GB install swap তৈরি হচ্ছে…"
    if sudo -n fallocate -l 1G "$SETUP_SWAP" && sudo -n chmod 600 "$SETUP_SWAP" && \
       sudo -n mkswap "$SETUP_SWAP" >/dev/null && sudo -n swapon "$SETUP_SWAP"; then
      SETUP_SWAP_CREATED=1
    else
      sudo -n rm -f "$SETUP_SWAP" 2>/dev/null || true
    fi
  fi
  echo "[setup 1/3] Dependencies install হচ্ছে (lockfile changed/missing)…"
  npm_config_jobs=1 npm_config_maxsockets=8 npm ci --no-audit --no-fund
  printf '%s' "$HASH" > "$STAMP"
else
  echo "[setup 1/3] Dependencies unchanged — install skip ✅"
fi

echo "[setup 2/3] Prisma Client generate…"
node scripts/generate-prisma.mjs

echo "[setup 3/3] Environment doctor…"
node scripts/doctor.mjs

if [ "$CHECK_DB" -eq 1 ]; then
  echo "[optional] Database migration status…"
  ./node_modules/.bin/prisma migrate status
fi
if [ "$MIGRATE" -eq 1 ]; then
  echo "[optional] Applying production-safe migrations…"
  ./node_modules/.bin/prisma migrate deploy
fi
if [ "$E2E" -eq 1 ]; then
  echo "[optional] Python E2E dependencies…"
  python3 -m pip install --user --quiet requests python-dotenv psycopg2-binary
fi
if [ "$ANDROID" -eq 1 ]; then
  echo "[optional] Capacitor Android sync…"
  mkdir -p out
  printf '%s\n' '<!doctype html><meta charset="utf-8"><title>HSC Ultimate</title>' > out/index.html
  ./node_modules/.bin/cap sync android
fi

echo "✅ Setup complete. Start: npm run dev"
