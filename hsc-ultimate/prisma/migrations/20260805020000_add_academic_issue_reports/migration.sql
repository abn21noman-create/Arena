-- Student-to-expert academic correction loop.
CREATE TYPE "AcademicReportReason" AS ENUM (
  'WRONG_ANSWER',
  'FACTUAL_ERROR',
  'EXPLANATION_ERROR',
  'TYPO_FORMATTING',
  'OUTDATED_SOURCE',
  'DUPLICATE',
  'NOTE_FORMULA_ERROR',
  'OTHER'
);

CREATE TABLE "academic_content_reports" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" "ContentReviewTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "contentHash" VARCHAR(64) NOT NULL,
  "reason" "AcademicReportReason" NOT NULL,
  "details" TEXT,
  "status" "ContentReportStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "resolutionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "academic_content_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academic_report_exact_issue_key"
ON "academic_content_reports"(
  "userId", "targetType", "targetId", "contentHash", "reason"
);

CREATE INDEX "academic_content_reports_status_createdAt_idx"
ON "academic_content_reports"("status", "createdAt");

CREATE INDEX "academic_content_reports_targetType_targetId_status_idx"
ON "academic_content_reports"("targetType", "targetId", "status");

CREATE INDEX "academic_content_reports_userId_createdAt_idx"
ON "academic_content_reports"("userId", "createdAt");

CREATE INDEX "academic_content_reports_reviewedById_reviewedAt_idx"
ON "academic_content_reports"("reviewedById", "reviewedAt");

ALTER TABLE "academic_content_reports"
ADD CONSTRAINT "academic_content_reports_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academic_content_reports"
ADD CONSTRAINT "academic_content_reports_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
