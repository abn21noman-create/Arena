-- Focus analytics dimensions and privacy consent
ALTER TABLE "focus_contracts"
    ADD COLUMN "shareAnalyticsWithAdmin" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "focus_sessions"
    ADD COLUMN "subjectCode" "SubjectCode",
    ADD COLUMN "focusLabel" VARCHAR(120);

CREATE INDEX "focus_sessions_userId_startedAt_idx"
    ON "focus_sessions"("userId", "startedAt");
CREATE INDEX "focus_sessions_status_startedAt_idx"
    ON "focus_sessions"("status", "startedAt");
CREATE INDEX "focus_sessions_subjectCode_startedAt_idx"
    ON "focus_sessions"("subjectCode", "startedAt");
