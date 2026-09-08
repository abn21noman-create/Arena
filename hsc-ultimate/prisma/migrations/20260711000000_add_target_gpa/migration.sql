-- AlterTable
-- Personal Goal Setting (GPA Target) — MASTER_PLAN.md এর মূল ভিশনের
-- "Goal Setting (weekly/monthly targets, GPA target)" আইটেম
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "targetGpa" DOUBLE PRECISION;
