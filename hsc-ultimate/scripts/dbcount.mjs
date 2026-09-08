import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const counts = {};
const models = ['User','Subject','Chapter','Topic','Question','AdmissionQuestion','CQQuestion','Badge','UserBadge','Notification','ForumPost','Flashcard','MockExamAttempt','AdmissionMockAttempt','QuizBattle','QuizDuel','Habit','Task','Bookmark','Note','ChatMessage','StudyGroup','StudyPet','ReadingRoomSession','PdfDocument','LiveExamSession','CustomQuestionSet','BroadcastCampaign','AuditLog'];
for (const m of models) {
  try { counts[m] = await p[m.charAt(0).toLowerCase()+m.slice(1)].count(); } catch { counts[m] = '?'; }
}
console.log(JSON.stringify(counts, null, 2));
await p.$disconnect();
