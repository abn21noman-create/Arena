-- Performance অডিটে আবিষ্কৃত: Postgres FK কলামে automatic index তৈরি হয়
-- না (MySQL এর বিপরীতে), তাই এই hot-path FK কলামগুলো ম্যানুয়ালি indexed
-- করা হলো।

-- StudyGroupMember.groupId — member list/capacity count/weekly bonus
-- query সবই groupId দিয়ে ফিল্টার করে
CREATE INDEX IF NOT EXISTS "study_group_members_groupId_idx" ON "study_group_members"("groupId");

-- QuizDuel.challengerId ও opponentId — /api/duel ও getMyDuelHistory()
-- উভয়ই "status + OR(challengerId, opponentId)" প্যাটার্নে query করে
CREATE INDEX IF NOT EXISTS "quiz_duels_challengerId_idx" ON "quiz_duels"("challengerId");
CREATE INDEX IF NOT EXISTS "quiz_duels_opponentId_idx" ON "quiz_duels"("opponentId");
