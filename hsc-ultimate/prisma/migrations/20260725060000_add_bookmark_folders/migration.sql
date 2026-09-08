-- Bookmark Collections/Folders — নতুন BookmarkFolder মডেল + Bookmark.folderId
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- CreateTable
CREATE TABLE "bookmark_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#6366f1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmark_folders_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN "folderId" TEXT;

-- CreateIndex
CREATE INDEX "bookmark_folders_userId_idx" ON "bookmark_folders"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_folderId_idx" ON "bookmarks"("userId", "folderId");

-- AddForeignKey
ALTER TABLE "bookmark_folders" ADD CONSTRAINT "bookmark_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "bookmark_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
