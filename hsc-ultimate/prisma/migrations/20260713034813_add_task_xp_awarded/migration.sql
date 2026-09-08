-- Task XP Farming বাগ ফিক্স — Task এ xpAwarded ফ্ল্যাগ যোগ
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও (এই সেশনে পঞ্চমবার) ভুলবশত
-- `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট এসেছিল
-- (documented Prisma bug, GitHub issue prisma/prisma#28414)। সেই
-- স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "xpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব Task ইতিমধ্যে DONE (আগের লজিক অনুযায়ী তারা
-- একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের xpAwarded=true করে দেওয়া
-- হচ্ছে, যাতে migration এর পরে সেই টাস্কগুলো আবার toggle করলে দ্বিতীয়
-- বার XP না পায়। এই মুহূর্তে DB তে কোনো Task নেই (0 rows), কিন্তু
-- ভবিষ্যতে অন্য environment এ এই migration apply হলে নিরাপদ থাকার জন্য
-- এই defensive backfill রাখা হয়েছে।
UPDATE "tasks" SET "xpAwarded" = true WHERE "status" = 'DONE';
