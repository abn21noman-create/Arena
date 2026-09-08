// ===================================================================
// Admin Analytics API — ইউজার এনগেজমেন্ট ও কন্টেন্ট পপুলারিটি বিশ্লেষণ
// GET /api/admin/analytics
// ===================================================================
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    dau,
    wau,
    mau,
    totalUsers,
    quizBySubject,
    cqAttempts,
    mockExamAttempts,
    forumPosts,
  ] = await Promise.all([
    prisma.user.count({ where: { lastActiveAt: { gte: oneDayAgo } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count(),
    // Aggregate in PostgreSQL instead of transferring every historical attempt
    // to the server process (unbounded memory/network growth at scale).
    prisma.quizAttempt.groupBy({
      by: ["subjectId"],
      where: { subjectId: { not: null } },
      _count: { _all: true },
      _sum: { score: true, totalMarks: true },
    }),
    prisma.cQAttempt.count(),
    prisma.mockExamAttempt.count({ where: { status: "COMPLETED" } }),
    prisma.forumPost.count(),
  ]);

  // Subject-wise popularity (কতবার প্র্যাকটিস হয়েছে + গড় accuracy)
  const bySubject = new Map(
    quizBySubject.flatMap((row) => row.subjectId ? [[
      row.subjectId,
      {
        count: row._count._all,
        totalScore: row._sum.score ?? 0,
        totalMarks: row._sum.totalMarks ?? 0,
      },
    ] as const] : [])
  );
  const totalQuizAttempts = quizBySubject.reduce(
    (total, row) => total + row._count._all,
    0
  );

  const subjects = await prisma.subject.findMany({
    where: { id: { in: Array.from(bySubject.keys()) } },
  });

  const subjectPopularity = subjects
    .map((s) => {
      const entry = bySubject.get(s.id)!;
      return {
        subjectId: s.id,
        subjectName: s.name,
        attemptCount: entry.count,
        avgAccuracyPct:
          entry.totalMarks > 0
            ? Math.round((entry.totalScore / entry.totalMarks) * 100)
            : 0,
      };
    })
    .sort((a, b) => b.attemptCount - a.attemptCount);

  // সবচেয়ে বেশি প্র্যাকটিস হওয়া টপিক (weak/popular topic দুটোই বোঝার জন্য)
  const topicAnswerCounts = await prisma.quizAttemptAnswer.groupBy({
    by: ["questionId"],
    _count: { questionId: true },
  });

  const questionIds = topicAnswerCounts.map((t) => t.questionId);
  const questionsWithTopic = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, topic: { select: { id: true, name: true } } },
  });
  const questionTopicMap = new Map(
    questionsWithTopic.map((q) => [q.id, q.topic])
  );

  const byTopic = new Map<string, { topicName: string; count: number }>();
  for (const t of topicAnswerCounts) {
    const topic = questionTopicMap.get(t.questionId);
    if (!topic) continue;
    const entry = byTopic.get(topic.id) ?? { topicName: topic.name, count: 0 };
    entry.count += t._count.questionId;
    byTopic.set(topic.id, entry);
  }

  const mostPracticedTopics = Array.from(byTopic.entries())
    .map(([topicId, v]) => ({ topicId, topicName: v.topicName, answerCount: v.count }))
    .sort((a, b) => b.answerCount - a.answerCount)
    .slice(0, 8);

  // গত ৭ দিনের নতুন রেজিস্ট্রেশন ট্রেন্ড
  const recentSignups = await prisma.user.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  const signupsByDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    signupsByDay.set(key, 0);
  }
  for (const u of recentSignups) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (signupsByDay.has(key)) {
      signupsByDay.set(key, (signupsByDay.get(key) ?? 0) + 1);
    }
  }
  const signupTrend = Array.from(signupsByDay.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json({
    engagement: { dau, wau, mau, totalUsers },
    activityCounts: {
      quizAttempts: totalQuizAttempts,
      cqAttempts,
      mockExamAttempts,
      forumPosts,
    },
    subjectPopularity,
    mostPracticedTopics,
    signupTrend,
  });
}
