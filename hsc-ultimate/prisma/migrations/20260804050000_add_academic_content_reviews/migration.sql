-- Human-controlled academic review workflow.
-- Absence of a row means unreviewed; no content is auto-approved or modified.
CREATE TYPE "ContentReviewTargetType" AS ENUM (
    'CORE_MCQ',
    'ADMISSION_MCQ',
    'CQ',
    'TOPIC_NOTE'
);

CREATE TYPE "ContentReviewStatus" AS ENUM (
    'APPROVED',
    'NEEDS_CORRECTION',
    'REJECTED'
);

CREATE TABLE "content_reviews" (
    "id" TEXT NOT NULL,
    "targetType" "ContentReviewTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" "ContentReviewStatus" NOT NULL,
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "sourceUrl" VARCHAR(2048),
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_reviews_targetType_targetId_key"
    ON "content_reviews"("targetType", "targetId");
CREATE INDEX "content_reviews_status_updatedAt_idx"
    ON "content_reviews"("status", "updatedAt");
CREATE INDEX "content_reviews_reviewerId_updatedAt_idx"
    ON "content_reviews"("reviewerId", "updatedAt");

ALTER TABLE "content_reviews"
    ADD CONSTRAINT "content_reviews_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
