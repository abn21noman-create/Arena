#!/usr/bin/env bash
# ===================================================================
# HSC Ultimate — এক কমান্ডে পুরো অ্যাপ লাইভ
# -------------------------------------------------------------------
#   bash dev-local/start.sh
#
# কী করে:
#   1. dev-local/setup.sh চালায় (env ফাইল, npm ci, PostgreSQL,
#      migration, drift repair — ডেটা থাকলে seed বাদ দেয়)
#   2. তারপর Next.js dev সার্ভার 0.0.0.0:3000 এ চালু করে
#
# এই sandbox-এ node_modules/.next/.env* আর /home/user/localpg
# snapshot-এ থাকে না, তাই নতুন সেশনে সবসময় এটাই চালাতে হবে।
# ===================================================================
set -u

ARENA_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$ARENA_ROOT/hsc-ultimate"
LOCAL_URL="postgresql://postgres:postgres@127.0.0.1:5432/hsc_ultimate"

# আগের বার সিড হয়ে থাকলে আবার ৪৪টা seed চালানোর দরকার নেই
SEED_ARGS=""
if [ -d "$REPO/node_modules/pg" ] && node -e "
const pg = require('$REPO/node_modules/pg');
(async () => {
  const c = new pg.Client({ connectionString: '$LOCAL_URL' });
  await c.connect();
  const { rows } = await c.query('SELECT count(*)::int AS n FROM \"subjects\"');
  await c.end();
  process.exit(rows[0].n > 0 ? 0 : 1);
})().catch(() => process.exit(1));
" >/dev/null 2>&1; then
  SEED_ARGS="--skip-seed"
  echo "▸ ডেটা আগেই আছে — seed বাদ দেওয়া হলো"
fi

bash "$ARENA_ROOT/dev-local/setup.sh" $SEED_ARGS || exit 1

cd "$REPO" || exit 1
exec npm run dev
