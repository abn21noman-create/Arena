-- Topic Progress XP Farming বাগ ফিক্স — TopicProgress এ xpAwarded
-- ফ্ল্যাগ যোগ (Task/StudyPlanItem এর একই প্যাটার্ন)
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "topic_progress" ADD COLUMN     "xpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব রেকর্ড ইতিমধ্যে MASTERED (আগের লজিক অনুযায়ী
-- তারা একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের xpAwarded=true করে
-- দেওয়া হচ্ছে, যাতে migration এর পরে সেই টপিকগুলো আবার toggle করলে
-- দ্বিতীয়বার XP না পায়। এই মুহূর্তে DB তে কোনো topic_progress রেকর্ড
-- নেই (0 rows, যাচাই করা হয়েছে), কিন্তু ভবিষ্যতে অন্য environment এ
-- এই migration apply হলে নিরাপদ থাকার জন্য এই defensive backfill রাখা
-- হয়েছে (Task/StudyPlanItem migration এর একই প্যাটার্ন)।
UPDATE "topic_progress" SET "xpAwarded" = true WHERE "status" = 'MASTERED';
