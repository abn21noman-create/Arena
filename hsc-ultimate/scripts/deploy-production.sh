#!/usr/bin/env bash
# ===================================================================
# HSC ULTIMATE — Automated Production & Cloud Database Deployment
# ===================================================================
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 HSC ULTIMATE — PRODUCTION DEPLOYMENT & DATABASE SYNC"
echo "═══════════════════════════════════════════════════════════════"

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL is not set."
  echo "👉 Please set your PostgreSQL connection string in .env or environment:"
  echo "   export DATABASE_URL='postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require'"
  exit 1
fi

echo "🔹 [1/5] Generating Prisma Client..."
node scripts/generate-prisma.mjs

echo "🔹 [2/5] Pushing Prisma Schema to Cloud Database..."
npx prisma db push --skip-generate

echo "🔹 [3/5] Seeding Master Subjects, Chapters, and Topics..."
npx tsx prisma/seed.ts || true

echo "🔹 [4/5] Seeding High-Yield CQ & Admission Data..."
npx tsx prisma/seed-cq-physics1.ts || true
npx tsx prisma/seed-cq-physics2.ts || true
npx tsx prisma/seed-cq-chemistry.ts || true
npx tsx prisma/seed-cq-hmath1.ts || true
npx tsx prisma/seed-cq-hmath2.ts || true
npx tsx prisma/seed-cq-biology2.ts || true
npx tsx prisma/seed-cq-ict.ts || true

echo "🔹 [5/5] Verifying 20,000 MCQ Vault Integrity..."
npx tsx scripts/verify-20000-vault-integrity.ts

echo ""
echo "🎉 PRODUCTION DATABASE & 20,000 MCQ VAULT ARE 100% READY & LIVE!"
echo "═══════════════════════════════════════════════════════════════"
