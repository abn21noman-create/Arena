#!/bin/sh
# Fast by default; --full adds content/security checks. Never runs a production build.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"
FULL=0
ANDROID=0
for arg in "$@"; do
  case "$arg" in
    --full) FULL=1 ;;
    --android) ANDROID=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

# On very small machines a cold/invalidation TypeScript pass can exceed RAM,
# even without a running dev server (a warm pass usually does not). Add temporary
# swap whenever RAM is below 3 GiB and useful swap is absent; clean it on exit.
VERIFY_SWAP="/swapfile-hsc-verify"
VERIFY_SWAP_CREATED=0
cleanup_verify_swap() {
  if [ "$VERIFY_SWAP_CREATED" -eq 1 ]; then
    sudo -n swapoff "$VERIFY_SWAP" 2>/dev/null || true
    sudo -n rm -f "$VERIFY_SWAP" 2>/dev/null || true
  fi
}
trap cleanup_verify_swap EXIT
trap 'cleanup_verify_swap; exit 130' INT TERM
MEM_KB=$(awk '/MemTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
SWAP_KB=$(awk '/SwapTotal:/{print $2}' /proc/meminfo 2>/dev/null || echo 0)
if [ "$MEM_KB" -gt 0 ] && [ "$MEM_KB" -lt 3145728 ] && [ "$SWAP_KB" -lt 524288 ]; then
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    echo "Low RAM detected — temporary verify swap তৈরি হচ্ছে…"
    if sudo -n fallocate -l 1G "$VERIFY_SWAP" && sudo -n chmod 600 "$VERIFY_SWAP" && \
       sudo -n mkswap "$VERIFY_SWAP" >/dev/null && sudo -n swapon "$VERIFY_SWAP"; then
      VERIFY_SWAP_CREATED=1
    else
      sudo -n rm -f "$VERIFY_SWAP" 2>/dev/null || true
      echo "⚠️ Swap তৈরি যায়নি; অন্য memory-heavy process বন্ধ করে verify আবার চালান।"
    fi
  fi
fi

if [ ! -x node_modules/.bin/next ]; then
  echo "Dependencies নেই — smart setup চালানো হচ্ছে…"
  sh scripts/bootstrap.sh
fi

run_step() {
  label=$1
  shift
  start=$(date +%s)
  echo "\n▶ $label"
  "$@"
  elapsed=$(( $(date +%s) - start ))
  echo "✓ $label (${elapsed}s)"
}

run_step "Fast incremental TypeScript" npm run type-check
run_step "Cached ESLint" npm run lint
run_step "Unit tests" npm run test:run

if [ "$FULL" -eq 1 ]; then
  run_step "Pure logic assertions" npm run test:logic
  run_step "Seed integrity" npm run test:seed
  run_step "Prisma schema" ./node_modules/.bin/prisma validate
  run_step "Privacy compliance audit" npm run audit:privacy:strict -- --out reports/privacy-compliance-current.json
  run_step "Runtime truth/integrity audit" npm run audit:integrity:strict -- --out reports/runtime-integrity-current.json
  run_step "UI/UX integrity audit" npm run audit:ux:strict -- --out reports/ux-integrity-current.json
  run_step "Production dependency audit" npm audit --omit=dev --audit-level=low
  run_step "Secret shape check" npm run check:secrets
fi

if [ "$ANDROID" -eq 1 ]; then
  run_step "Android compile + lint" sh scripts/android-check.sh
fi

echo "\n✅ Verification complete. Full release build দরকার হলে: npm run build"
