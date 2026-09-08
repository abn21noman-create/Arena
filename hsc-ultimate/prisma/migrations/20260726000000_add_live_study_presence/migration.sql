-- Live Study Presence — "এখন কে কে পড়ছে" (Live Study Leaderboard) ফিচার
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- CreateEnum
CREATE TYPE "LiveActivityType" AS ENUM ('PRACTICE', 'CQ', 'FLASHCARD', 'POMODORO', 'READING_ROOM', 'MOCK_EXAM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "currentActivityAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "currentActivityType" "LiveActivityType";

-- Live Study Leaderboard এ "এখন কে পড়ছে" query করার সময় বারবার
-- WHERE currentActivityAt >= X ফিল্টার হবে (Leaderboard পেজ hit হলেই)
CREATE INDEX "users_currentActivityAt_idx" ON "users"("currentActivityAt");
