-- Critical read-path indexes: engagement windows, recent activity and ordered feeds.
-- Additive only; no existing indexes or rows are removed.
CREATE INDEX "users_lastActiveAt_idx" ON "users"("lastActiveAt");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "notifications_userId_read_createdAt_idx"
    ON "notifications"("userId", "read", "createdAt");
CREATE INDEX "quiz_attempts_userId_createdAt_idx"
    ON "quiz_attempts"("userId", "createdAt");
CREATE INDEX "cq_attempts_userId_createdAt_idx"
    ON "cq_attempts"("userId", "createdAt");
CREATE INDEX "study_sessions_userId_createdAt_idx"
    ON "study_sessions"("userId", "createdAt");
