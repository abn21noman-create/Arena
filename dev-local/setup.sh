#!/usr/bin/env bash
# ===================================================================
# HSC Ultimate — one-command sandbox setup (idempotent)
# -------------------------------------------------------------------
# This sandbox has no outbound access except npmjs + github, so the
# normal path (Supabase + `prisma migrate deploy` + `prisma generate`
# native engine) is unavailable. This script rebuilds a working local
# stack from scratch:
#
#   1. restore .env files from the committed workspace zip (if missing)
#   2. npm ci                              (installs deps; Prisma client is
#                                           generated via WASM — see
#                                           scripts/generate-prisma.mjs)
#   3. real PostgreSQL 17 from npm         (@embedded-postgres/linux-x64
#                                           ships the actual binaries)
#   4. apply migrations + repair known drift
#   5. seed the 13 subjects / 689 MCQ / 64 CQ catalog
#
# Safe to re-run at any time: every step checks before acting, and it
# never overwrites an existing .env.local (your keys stay put).
#
# Usage:  bash dev-local/setup.sh [--skip-seed]
# ===================================================================
set -u

ARENA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$ARENA_ROOT/hsc-ultimate"
DEV_LOCAL="$ARENA_ROOT/dev-local"
PGROOT="/home/user/localpg"
PGBIN="$PGROOT/node_modules/@embedded-postgres/linux-x64/native/bin"
PGDATA="$PGROOT/data"
PGLOG="$PGROOT/postgres.log"
LOCAL_URL="postgresql://postgres:postgres@127.0.0.1:5432/hsc_ultimate"

export ARENA_REPO="$REPO"
SKIP_SEED=0
[ "${1:-}" = "--skip-seed" ] && SKIP_SEED=1

step() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
ok()   { printf '  ✅ %s\n' "$1"; }
info() { printf '  •  %s\n' "$1"; }

# ------------------------------------------------------------------
step "1/6  env ফাইল"
# ------------------------------------------------------------------
missing_env=0
for f in .env .env.local .env.example .env.local.example; do
  [ -f "$REPO/$f" ] || missing_env=1
done

if [ "$missing_env" -eq 1 ]; then
  ZIP=$(ls "$ARENA_ROOT"/workspace-*.zip 2>/dev/null | head -1)
  if [ -z "$ZIP" ]; then
    echo "  ❌ workspace zip পাওয়া যায়নি — .env ফাইল restore করা যাবে না"
    exit 1
  fi
  # -j: no directory, -n: never overwrite existing files
  unzip -o -j -n "$ZIP" \
    'hsc-ultimate/.env' 'hsc-ultimate/.env.local' \
    'hsc-ultimate/.env.example' 'hsc-ultimate/.env.local.example' \
    -d "$REPO/" >/dev/null 2>&1
  ok "zip থেকে env ফাইল restore করা হয়েছে"
else
  ok "env ফাইল আগে থেকেই আছে (হাত দেওয়া হলো না)"
fi

# Dev-only DB override — keeps the real Supabase credentials untouched.
cat > "$REPO/.env.development.local" <<EOF
# স্যান্ডবক্স-লোকাল ওভাররাইড (Next.js dev মোডে .env.local এর চেয়ে অগ্রগণ্য)
# মুছে ফেললেই Supabase-এ ফিরে যাবে।
DATABASE_URL="$LOCAL_URL"
DIRECT_URL="$LOCAL_URL"
EOF
ok ".env.development.local → লোকাল PostgreSQL"

# ------------------------------------------------------------------
step "2/6  npm dependencies"
# ------------------------------------------------------------------
if [ -d "$REPO/node_modules" ] && [ -f "$REPO/node_modules/.prisma/client/wasm.js" ]; then
  ok "node_modules আগে থেকেই আছে"
else
  ( cd "$REPO" && npm ci --no-audit --fund=false >/dev/null 2>&1 )
  [ -f "$REPO/node_modules/.prisma/client/wasm.js" ] \
    && ok "ইনস্টল সম্পন্ন + Prisma WASM client জেনারেট হয়েছে" \
    || { echo "  ❌ npm ci ব্যর্থ"; exit 1; }
fi

# ------------------------------------------------------------------
step "3/6  PostgreSQL 17"
# ------------------------------------------------------------------
if [ ! -x "$PGBIN/postgres" ]; then
  mkdir -p "$PGROOT"
  ( cd "$PGROOT" && npm init -y >/dev/null 2>&1 \
    && npm install embedded-postgres@17.10.0-beta.17 --no-audit --fund=false >/dev/null 2>&1 )
  [ -x "$PGBIN/postgres" ] && ok "PostgreSQL বাইনারি ইনস্টল হয়েছে" || { echo "  ❌ ইনস্টল ব্যর্থ"; exit 1; }
else
  ok "PostgreSQL বাইনারি আগে থেকেই আছে"
fi

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  "$PGBIN/initdb" -D "$PGDATA" -U postgres --auth=trust \
    --encoding=UTF8 --locale=C >/dev/null 2>&1 \
    && ok "ডেটা ক্লাস্টার তৈরি (UTF-8)" || { echo "  ❌ initdb ব্যর্থ"; exit 1; }
else
  ok "ডেটা ক্লাস্টার আগে থেকেই আছে"
fi

if "$PGBIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
  ok "PostgreSQL চলছে"
else
  "$PGBIN/pg_ctl" -D "$PGDATA" -l "$PGLOG" \
    -o "-p 5432 -k /tmp -c listen_addresses=127.0.0.1 -c max_connections=200" \
    -w start >/dev/null 2>&1 \
    && ok "PostgreSQL চালু হয়েছে (127.0.0.1:5432)" || { echo "  ❌ start ব্যর্থ"; tail -20 "$PGLOG"; exit 1; }
fi

# ------------------------------------------------------------------
step "4/6  ডেটাবেস + migration"
# ------------------------------------------------------------------
node -e "
const pg = require('$REPO/node_modules/pg');
(async () => {
  const c = new pg.Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres', ssl: false });
  await c.connect();
  const { rows } = await c.query(\"SELECT 1 FROM pg_database WHERE datname='hsc_ultimate'\");
  if (!rows.length) await c.query(\"CREATE DATABASE hsc_ultimate ENCODING 'UTF8'\");
  await c.end();
})();
" && ok "ডেটাবেস 'hsc_ultimate' প্রস্তুত" || { echo "  ❌ ডেটাবেস তৈরি ব্যর্থ"; exit 1; }

( cd "$DEV_LOCAL" && node migrate.mjs ) || { echo "  ❌ migration ব্যর্থ"; exit 1; }

node -e "
const fs = require('fs');
const pg = require('$REPO/node_modules/pg');
(async () => {
  const c = new pg.Client({ connectionString: '$LOCAL_URL', ssl: false });
  await c.connect();
  await c.query(fs.readFileSync('$DEV_LOCAL/drift-repair.sql', 'utf8'));
  await c.end();
})();
" && ok "drift repair প্রয়োগ হয়েছে" || { echo "  ❌ drift repair ব্যর্থ"; exit 1; }

if ( cd "$DEV_LOCAL" && node check-drift.mjs ) >/dev/null 2>&1; then
  ok "schema drift: 0"
else
  info "⚠️  drift এখনো আছে — dev-local/check-drift.mjs চালিয়ে দেখুন"
fi

# ------------------------------------------------------------------
step "5/6  Seed"
# ------------------------------------------------------------------
if [ "$SKIP_SEED" -eq 1 ]; then
  info "--skip-seed দেওয়া, বাদ"
else
  bash "$DEV_LOCAL/seed-all.sh" || info "⚠️  কিছু seed ব্যর্থ"
fi

node -e "
const pg = require('$REPO/node_modules/pg');
(async () => {
  const c = new pg.Client({ connectionString: '$LOCAL_URL', ssl: false });
  await c.connect();
  const q = async (t) => (await c.query('SELECT count(*)::int n FROM \"' + t + '\"')).rows[0].n;
  // একই client-এ সমান্তরাল query deprecated — ক্রমিকভাবে চালানো হচ্ছে
  const counts = [];
  for (const t of ['subjects','chapters','topics','questions','admission_questions','cq_questions','badges']) {
    counts.push(await q(t));
  }
  const [s, ch, tp, q1, aq, cq, b] = counts;
  console.log('  •  subject=' + s + ' chapter=' + ch + ' topic=' + tp);
  console.log('  •  coreMCQ=' + q1 + ' admissionMCQ=' + aq + ' CQ=' + cq + ' badge=' + b);
  await c.end();
})();
"

# ------------------------------------------------------------------
step "6/6  প্রস্তুত"
# ------------------------------------------------------------------
cat <<'EOF'
  এখন ডেভ সার্ভার চালু করুন:   npm run dev      (hsc-ultimate/ থেকে)
  স্বাস্থ্য পরীক্ষা:            curl localhost:3000/api/health

  যা এই sandbox-এ কাজ করবে না (নেটওয়ার্ক ব্লকড, কোডের সমস্যা নয়):
    AI Tutor / Doubt Solver · PDF Chat · Email · Native push · Google Fonts
EOF
