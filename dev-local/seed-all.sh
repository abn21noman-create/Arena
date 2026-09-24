#!/usr/bin/env bash
# ===================================================================
# Batch seed runner for the sandbox (local PostgreSQL).
# Runs every content seed script in dependency order and reports.
# Idempotent: seed scripts upsert, so re-running is safe.
# ===================================================================
set -u

REPO="${ARENA_REPO:-/home/user/Arena/hsc-ultimate}"
DEV_LOCAL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$REPO" || exit 1

export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/hsc_ultimate"
export DIRECT_URL="$DATABASE_URL"
export ALLOW_DESTRUCTIVE_SEED=I_UNDERSTAND_THIS_DELETES_DATA
export ARENA_REPO="$REPO"
export NODE_OPTIONS="--require $DEV_LOCAL/prisma-require-hook.cjs"

SCRIPTS=(
  "prisma/seed.ts"
  "prisma/seed-questions.ts"
  "prisma/seed-questions-2.ts"
  "prisma/seed-questions-physics-gaps.ts"
  "prisma/seed-questions-hmath-gaps.ts"
  "prisma/seed-questions-biology-gaps.ts"
  "prisma/seed-questions-chem-ict-gaps.ts"
  "prisma/seed-questions-topic-gaps.ts"
  "prisma/seed-questions-topic-gaps-2.ts"
  "prisma/seed-questions-physics-topic-gaps.ts"
  "prisma/seed-questions-empty-chapters.ts"
  "prisma/seed-board-questions.ts"
  "prisma/seed-admission-questions.ts"
  "prisma/seed-admission-questions-2.ts"
  "prisma/seed-cq.ts"
  "prisma/seed-cq-2.ts"
  "prisma/seed-cq-physics1.ts"
  "prisma/seed-cq-physics2.ts"
  "prisma/seed-cq-chemistry.ts"
  "prisma/seed-cq-biology2.ts"
  "prisma/seed-cq-hmath1.ts"
  "prisma/seed-cq-hmath2.ts"
  "prisma/seed-cq-ict.ts"
  "prisma/seed-physics1-notes.ts"
  "prisma/seed-physics2-notes.ts"
  "prisma/seed-chemistry-notes.ts"
  "prisma/seed-biology1-notes.ts"
  "prisma/seed-biology2-notes.ts"
  "prisma/seed-hmath1-notes.ts"
  "prisma/seed-hmath2-notes.ts"
  "prisma/seed-ict-notes.ts"
  "prisma/seed-bangla-notes.ts"
  "prisma/seed-english-notes.ts"
  "prisma/seed-physics1-notes-gaps.ts"
  "prisma/seed-physics2-notes-gaps.ts"
  "prisma/seed-chemistry-notes-gaps.ts"
  "prisma/seed-biology-notes-gaps.ts"
  "prisma/seed-hmath-notes-gaps.ts"
  "prisma/seed-ict-bangla-english-notes-gaps.ts"
  "prisma/seed-bangla-english-ict.ts"
  "prisma/seed-physics1-mega-vault.ts"
  "prisma/seed-badges.ts"
  "prisma/fix-topic-name-aparichita.ts"
  "prisma/fix-short-explanations.ts"
)

PASS=0
FAIL=0
FAILED_NAMES=()

for script in "${SCRIPTS[@]}"; do
  [ -f "$script" ] || { echo "  skip   $script (ফাইল নেই)"; continue; }
  name="${script#prisma/}"
  if timeout 600 npx tsx "$script" >/dev/null 2>&1; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
    FAILED_NAMES+=("$name")
    echo "  FAIL   $name"
  fi
done

echo "  seeds: ✅ $PASS পাস, ❌ $FAIL ব্যর্থ"
if [ ${#FAILED_NAMES[@]} -gt 0 ]; then
  for n in "${FAILED_NAMES[@]}"; do echo "         - $n"; done
fi
[ "$FAIL" -eq 0 ]
