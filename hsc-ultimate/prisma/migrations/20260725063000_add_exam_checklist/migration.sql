-- Exam Day Checklist Mode — নতুন ExamChecklistItem মডেল + ExamChecklistCategory enum
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- CreateEnum
CREATE TYPE "ExamChecklistCategory" AS ENUM ('NIGHT_BEFORE', 'EXAM_DAY');

-- CreateTable
CREATE TABLE "exam_checklist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "ExamChecklistCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_checklist_items_userId_category_idx" ON "exam_checklist_items"("userId", "category");

-- AddForeignKey
ALTER TABLE "exam_checklist_items" ADD CONSTRAINT "exam_checklist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
