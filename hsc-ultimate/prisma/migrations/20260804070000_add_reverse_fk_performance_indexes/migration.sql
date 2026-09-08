-- Reverse foreign-key indexes for scalable parent deletes/cascades and joins.
-- Additive only; no table rows are changed.
CREATE INDEX "bookmarks_topicId_idx" ON "bookmarks"("topicId");
CREATE INDEX "bookmarks_folderId_idx" ON "bookmarks"("folderId");
CREATE INDEX "cq_attempts_cqQuestionId_idx" ON "cq_attempts"("cqQuestionId");
CREATE INDEX "forum_posts_userId_idx" ON "forum_posts"("userId");
CREATE INDEX "forum_replies_userId_idx" ON "forum_replies"("userId");
CREATE INDEX "note_helpful_votes_userId_idx" ON "note_helpful_votes"("userId");
CREATE INDEX "quiz_battle_participants_userId_idx" ON "quiz_battle_participants"("userId");
CREATE INDEX "quiz_battles_subjectId_idx" ON "quiz_battles"("subjectId");
CREATE INDEX "quiz_duels_subjectId_idx" ON "quiz_duels"("subjectId");
CREATE INDEX "topic_progress_topicId_idx" ON "topic_progress"("topicId");
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");
