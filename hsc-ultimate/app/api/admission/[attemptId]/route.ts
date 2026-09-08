// ===================================================================
// Admission Mock Test এর বিস্তারিত ফলাফল (প্রতিটা প্রশ্নের সঠিক/ভুল উত্তর
// + ব্যাখ্যাসহ) — শুধু COMPLETED attempt এর জন্য প্রযোজ্য
// GET /api/admission/[attemptId]
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ADMISSION_EXAM_CONFIGS, calculateAdmissionScore } from "@/lib/admission";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { attemptId } = await params;
  const attempt = await prisma.admissionMockAttempt.findUnique({ where: { id: attemptId } });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  }

  if (attempt.status !== "COMPLETED") {
    return NextResponse.json({ error: "পরীক্ষাটি এখনো সম্পন্ন হয়নি" }, { status: 400 });
  }

  const questionIds = attempt.questionIds as string[];
  const questions = await prisma.admissionQuestion.findMany({
    where: { id: { in: questionIds } },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const userAnswers = (attempt.userAnswers ?? {}) as Record<string, string>;

  const config = ADMISSION_EXAM_CONFIGS[attempt.examType];
  const result = calculateAdmissionScore(
    attempt.totalCount,
    attempt.correctCount,
    attempt.wrongCount,
    config
  );

  const questionsWithAnswers = questionIds.map((id) => {
    const q = questionMap.get(id);
    if (!q) return null;
    const userAnswer = userAnswers[id] ?? null;
    return {
      id: q.id,
      subject: q.subject,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      userAnswer,
      isCorrect: userAnswer === q.correctAnswer,
      isSkipped: userAnswer === null,
    };
  }).filter(Boolean);

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      examType: attempt.examType,
      examLabel: config.label,
      timeTakenSec: attempt.timeTakenSec,
      completedAt: attempt.completedAt,
      ...result,
    },
    questions: questionsWithAnswers,
  });
}
