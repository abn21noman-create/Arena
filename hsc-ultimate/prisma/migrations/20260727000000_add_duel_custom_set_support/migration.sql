-- Duel + CustomQuestionSet সংযোগ — subjectId ঐচ্ছিক করা হচ্ছে, customSetId
-- যোগ হচ্ছে (Quiz Battle এর established প্যাটার্ন অনুসরণ করে)
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- DropForeignKey (subjectId এর existing CASCADE constraint, ঐচ্ছিক করার জন্য SetNull এ পরিবর্তন)
ALTER TABLE "quiz_duels" DROP CONSTRAINT "quiz_duels_subjectId_fkey";

-- AlterTable
ALTER TABLE "quiz_duels" ALTER COLUMN "subjectId" DROP NOT NULL;
ALTER TABLE "quiz_duels" ADD COLUMN "customSetId" TEXT;

-- AddForeignKey (SetNull — Subject ডিলিট হলে Duel টা customSetId-based
-- ছিল কিনা তা অক্ষত রেখে subjectId শুধু null হয়ে যাবে)
ALTER TABLE "quiz_duels" ADD CONSTRAINT "quiz_duels_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
