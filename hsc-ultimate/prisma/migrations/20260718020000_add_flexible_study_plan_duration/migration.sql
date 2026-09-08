-- "আজকের পড়া" (Today's Focus) ফিচার — নমনীয় Duration সহ Study Plan
-- (১/৭/৩০/৩৬৫ দিন) + ব্যাকগ্রাউন্ড chunked generation ট্র্যাকিং
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- CreateEnum
CREATE TYPE "StudyPlanGenerationStatus" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "study_plans" ADD COLUMN     "daysGenerated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "durationDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "generationError" TEXT,
ADD COLUMN     "generationStatus" "StudyPlanGenerationStatus" NOT NULL DEFAULT 'READY';

-- Backfill: বিদ্যমান সব প্ল্যান আগের ফিক্সড ৭-দিনের সিস্টেমে বানানো
-- হয়েছিল, তাই durationDays=7 (ডিফল্ট) ও generationStatus=READY
-- (ডিফল্ট) স্বাভাবিকভাবেই সঠিক থাকবে — কোনো ম্যানুয়াল UPDATE লাগবে না।
