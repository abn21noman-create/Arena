// ===================================================================
// Admin Dashboard এর জন্য সামগ্রিক পরিসংখ্যান
// GET /api/admin/stats
// ===================================================================
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const [
    totalUsers,
    totalSubjects,
    totalChapters,
    totalTopics,
    totalQuestions,
    totalQuizAttempts,
    totalFlashcards,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subject.count(),
    prisma.chapter.count(),
    prisma.topic.count(),
    prisma.question.count(),
    prisma.quizAttempt.count(),
    prisma.flashcard.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, xp: true, role: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalSubjects,
    totalChapters,
    totalTopics,
    totalQuestions,
    totalQuizAttempts,
    totalFlashcards,
    recentUsers,
  });
}
