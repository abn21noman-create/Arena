-- Review integrity: bind decisions to exact content and preserve immutable history.
-- contentHash remains nullable on the current row for backward compatibility;
-- all new application writes require it, and null is treated as stale.
ALTER TABLE "content_reviews"
    ADD COLUMN "contentHash" VARCHAR(64);

CREATE TABLE "content_review_revisions" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "status" "ContentReviewStatus" NOT NULL,
    "contentHash" VARCHAR(64) NOT NULL,
    "reviewNote" TEXT,
    "sourceUrl" VARCHAR(2048),
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_review_revisions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_review_revisions_reviewId_createdAt_idx"
    ON "content_review_revisions"("reviewId", "createdAt");
CREATE INDEX "content_review_revisions_reviewerId_createdAt_idx"
    ON "content_review_revisions"("reviewerId", "createdAt");

ALTER TABLE "content_review_revisions"
    ADD CONSTRAINT "content_review_revisions_reviewId_fkey"
    FOREIGN KEY ("reviewId") REFERENCES "content_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_review_revisions"
    ADD CONSTRAINT "content_review_revisions_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
