-- Multi-provider AI academic review evidence and transparent reviewer identity.
ALTER TYPE "ContentReviewStatus" ADD VALUE IF NOT EXISTS 'AI_CONFLICT';
ALTER TYPE "ContentReviewStatus" ADD VALUE IF NOT EXISTS 'SOURCE_REQUIRED';

CREATE TYPE "ContentReviewerKind" AS ENUM ('ADMIN', 'AI');
CREATE TYPE "AIReviewVerdict" AS ENUM (
  'APPROVE', 'NEEDS_CORRECTION', 'SOURCE_REQUIRED', 'CONFLICT', 'ERROR'
);
CREATE TYPE "AIReviewBatchStatus" AS ENUM ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED');

ALTER TABLE "content_reviews"
ADD COLUMN "reviewerKind" "ContentReviewerKind" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN "aiConfidence" DOUBLE PRECISION,
ADD COLUMN "aiEvidence" JSONB,
ADD COLUMN "reviewMethodVersion" VARCHAR(64);

ALTER TABLE "content_review_revisions"
ADD COLUMN "reviewerKind" "ContentReviewerKind" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN "aiConfidence" DOUBLE PRECISION,
ADD COLUMN "aiEvidence" JSONB,
ADD COLUMN "reviewMethodVersion" VARCHAR(64);

CREATE TABLE "ai_review_batches" (
  "id" TEXT NOT NULL,
  "status" "AIReviewBatchStatus" NOT NULL DEFAULT 'RUNNING',
  "targetType" "ContentReviewTargetType",
  "requestedCount" INTEGER NOT NULL,
  "processedCount" INTEGER NOT NULL DEFAULT 0,
  "approvedCount" INTEGER NOT NULL DEFAULT 0,
  "flaggedCount" INTEGER NOT NULL DEFAULT 0,
  "conflictCount" INTEGER NOT NULL DEFAULT 0,
  "errorCount" INTEGER NOT NULL DEFAULT 0,
  "methodVersion" VARCHAR(64) NOT NULL,
  "providers" JSONB NOT NULL,
  "confidenceThreshold" DOUBLE PRECISION NOT NULL,
  "lastErrorCode" VARCHAR(100),
  "initiatedById" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ai_review_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_content_review_runs" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "targetType" "ContentReviewTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "contentHash" VARCHAR(64) NOT NULL,
  "provider" VARCHAR(40) NOT NULL,
  "model" VARCHAR(120) NOT NULL,
  "verdict" "AIReviewVerdict" NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "answerFingerprint" VARCHAR(512),
  "rationale" TEXT NOT NULL,
  "issues" JSONB,
  "sourceRequired" BOOLEAN NOT NULL DEFAULT false,
  "responseHash" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_content_review_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_review_batches_status_createdAt_idx"
ON "ai_review_batches"("status", "createdAt");
CREATE INDEX "ai_review_batches_initiatedById_createdAt_idx"
ON "ai_review_batches"("initiatedById", "createdAt");
CREATE UNIQUE INDEX "ai_review_run_provider_key"
ON "ai_content_review_runs"("batchId", "targetType", "targetId", "provider");
CREATE INDEX "ai_content_review_runs_targetType_targetId_contentHash_idx"
ON "ai_content_review_runs"("targetType", "targetId", "contentHash");
CREATE INDEX "ai_content_review_runs_verdict_createdAt_idx"
ON "ai_content_review_runs"("verdict", "createdAt");

ALTER TABLE "ai_review_batches"
ADD CONSTRAINT "ai_review_batches_initiatedById_fkey"
FOREIGN KEY ("initiatedById") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ai_content_review_runs"
ADD CONSTRAINT "ai_content_review_runs_batchId_fkey"
FOREIGN KEY ("batchId") REFERENCES "ai_review_batches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
