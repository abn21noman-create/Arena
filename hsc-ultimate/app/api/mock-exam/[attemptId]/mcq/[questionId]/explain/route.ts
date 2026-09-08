// ===================================================================
// AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake) — Mock Exam MCQ
// POST /api/mock-exam/[attemptId]/mcq/[questionId]/explain
// -------------------------------------------------------------------
// Mock Exam Result পেজে MCQ রিভিউ সেকশনে একটা ভুল উত্তরের জন্য "AI দিয়ে
// ব্যাখ্যা বুঝি" বাটনে ক্লিক করলে কল হয়। Practice Result এর
// `/api/practice/answers/[answerId]/explain` এর সাথে ভিন্নতা: Mock
// Exam এ প্রতিটা MCQ উত্তরের জন্য আলাদা `QuizAttemptAnswer` row নেই —
// পুরো MCQ ফেজের উত্তর `MockExamAttempt.mcqUserAnswers` (JSON ম্যাপ)
// এ সংরক্ষিত থাকে। তাই এখানে attemptId (ownership যাচাইয়ের জন্য) +
// questionId (কোন প্রশ্ন) দুটো দিয়েই route params বানানো হয়েছে, এবং
// `mcqUserAnswers` JSON থেকে userAnswer বের করা হয়।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { explainMistake } from "@/lib/mistake-explainer";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string; questionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { attemptId, questionId } = await params;

  const attempt = await prisma.mockExamAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  }

  if (attempt.status !== "COMPLETED") {
    return NextResponse.json({ error: "পরীক্ষা এখনো সম্পন্ন হয়নি" }, { status: 400 });
  }

  const mcqIds = attempt.mcqQuestionIds as string[];
  if (!mcqIds.includes(questionId)) {
    return NextResponse.json({ error: "প্রশ্ন এই পরীক্ষার অংশ না" }, { status: 404 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  const mcqUserAnswers = (attempt.mcqUserAnswers ?? {}) as Record<string, string>;
  const userAnswer = mcqUserAnswers[questionId];

  if (!userAnswer) {
    return NextResponse.json(
      { error: "এই প্রশ্নে কোনো উত্তর দেওয়া হয়নি — ব্যাখ্যার প্রয়োজন নেই" },
      { status: 400 }
    );
  }

  if (userAnswer === question.correctAnswer) {
    return NextResponse.json(
      { error: "এই উত্তরটা সঠিক ছিল — ভুল-ব্যাখ্যার প্রয়োজন নেই" },
      { status: 400 }
    );
  }

  try {
    const result = await explainMistake({
      questionText: question.text,
      options: Array.isArray(question.options) ? (question.options as string[]) : null,
      correctAnswer: question.correctAnswer,
      userAnswer,
      existingExplanation: question.explanation,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Mistake Explainer Error (Mock Exam):", err);
    return NextResponse.json(
      { error: "AI ব্যাখ্যা তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 502 }
    );
  }
}
