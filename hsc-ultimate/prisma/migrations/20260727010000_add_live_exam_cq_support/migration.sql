-- Live Exam এ CQ (সৃজনশীল প্রশ্ন) সাপোর্ট যোগ — established শুধু MCQ
-- সীমাবদ্ধতা তুলে নেওয়া হচ্ছে, AI-evaluate ভিত্তিক scoring
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- AlterTable
ALTER TABLE "live_exam_sessions" ADD COLUMN "questionType" "QuestionType" NOT NULL DEFAULT 'MCQ';
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqAnswers" JSONB;
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqEvaluations" JSONB;
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqTotalMarks" INTEGER NOT NULL DEFAULT 0;
