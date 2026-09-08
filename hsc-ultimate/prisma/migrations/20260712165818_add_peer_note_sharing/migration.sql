-- Peer Note Sharing ফিচার — Note এ isPublic/helpfulCount যোগ + নতুন
-- note_helpful_votes টেবিল
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (এই সেশনে বহুবার দেখা documented Prisma bug, GitHub issue
-- prisma/prisma#28414)। সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া
-- হয়েছে — HNSW ইনডেক্স অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "helpfulCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "note_helpful_votes" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_helpful_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "note_helpful_votes_noteId_userId_key" ON "note_helpful_votes"("noteId", "userId");

-- CreateIndex
CREATE INDEX "notes_topicId_isPublic_idx" ON "notes"("topicId", "isPublic");

-- AddForeignKey
ALTER TABLE "note_helpful_votes" ADD CONSTRAINT "note_helpful_votes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_helpful_votes" ADD CONSTRAINT "note_helpful_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
