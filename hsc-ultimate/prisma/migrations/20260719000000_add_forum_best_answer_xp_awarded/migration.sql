-- Forum Best Answer XP Farming বাগ ফিক্স — ForumReply এ
-- bestAnswerXpAwarded ফ্ল্যাগ যোগ (Task/StudyPlanItem/TopicProgress এর
-- একই প্যাটার্ন)
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "forum_replies" ADD COLUMN     "bestAnswerXpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব reply ইতিমধ্যে isBestAnswer=true (আগের লজিক
-- অনুযায়ী তারা একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের
-- bestAnswerXpAwarded=true করে দেওয়া হচ্ছে, যাতে migration এর পরে সেই
-- reply আবার toggle করলে দ্বিতীয়বার XP না পায়।
UPDATE "forum_replies" SET "bestAnswerXpAwarded" = true WHERE "isBestAnswer" = true;
