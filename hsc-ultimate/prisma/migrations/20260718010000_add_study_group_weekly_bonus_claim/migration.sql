-- Study Group Weekly Bonus XP race condition ফিক্স — atomic claim
-- mechanism এর জন্য StudyGroup এ weeklyBonusWeekStart ফিল্ড যোগ
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "study_groups" ADD COLUMN     "weeklyBonusWeekStart" TIMESTAMP(3);
