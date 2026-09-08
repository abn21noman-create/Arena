// ===================================================================
// Pretest জমা দেওয়ার API — সার্ভার সাইডে সঠিক উত্তরের সাথে মিলিয়ে
// প্রতি-টপিক accuracy% বের করে ("জানা" টপিক চিহ্নিত করে)
// POST /api/pretest/grade
// Body: { answers: [{ questionId, userAnswer }] }
// -------------------------------------------------------------------
// ⚠️ ইচ্ছাকৃতভাবে কোনো QuizAttempt তৈরি হয় না — Pretest একটা বিশুদ্ধ
// ডায়াগনস্টিক টুল, XP/streak/Predicted GPA/leaderboard কোনোকিছুতেই
// প্রভাব ফেলে না (lib/pretest.ts এ বিস্তারিত ডিজাইন নোট আছে)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradePretest } from "@/lib/pretest";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { answers } = body as { answers?: { questionId: string; userAnswer: string }[] };

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "কোনো উত্তর পাওয়া যায়নি" }, { status: 400 });
  }

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { topic: { select: { id: true, name: true } } },
  });

  if (questions.length === 0) {
    return NextResponse.json({ error: "প্রশ্নগুলো পাওয়া যায়নি" }, { status: 404 });
  }

  const questionsForGrading = questions.map((q) => ({
    id: q.id,
    correctAnswer: q.correctAnswer,
    topicId: q.topic.id,
    topicName: q.topic.name,
  }));

  const result = gradePretest(answers, questionsForGrading);

  return NextResponse.json(result);
}
