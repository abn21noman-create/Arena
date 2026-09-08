-- Study Plan Item XP Farming বাগ ফিক্স — xpAwarded ফ্ল্যাগ যোগ (Task
-- এর একই প্যাটার্ন)
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও (এই সেশনে ষষ্ঠবার) ভুলবশত
-- `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট এসেছিল
-- (documented Prisma bug, GitHub issue prisma/prisma#28414)। সেই
-- স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "study_plan_items" ADD COLUMN     "xpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব আইটেম ইতিমধ্যে isCompleted=true (আগের লজিক
-- অনুযায়ী তারা একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের
-- xpAwarded=true করে দেওয়া হচ্ছে।
UPDATE "study_plan_items" SET "xpAwarded" = true WHERE "isCompleted" = true;
