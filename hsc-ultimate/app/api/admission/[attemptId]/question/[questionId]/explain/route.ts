// ===================================================================
// AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake) — Admission Prep MCQ
// POST /api/admission/[attemptId]/question/[questionId]/explain
// -------------------------------------------------------------------
// Admission Result পেজে প্রশ্নভিত্তিক রিভিউ সেকশনে ভুল উত্তরের জন্য
// "AI দিয়ে ব্যাখ্যা বুঝি" বাটনে ক্লিক করলে কল হয়। AdmissionMockAttempt
// এ (Mock Exam এর মতোই) প্রতিটা প্রশ্নের জন্য আলাদা answer row নেই —
// `userAnswers` JSON ম্যাপে সব উত্তর একসাথে থাকে, তাই attemptId+
// questionId দিয়ে route params।
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

  const attempt = await prisma.admissionMockAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "পরীক্ষা পাওয়া যায়নি" }, { status: 404 });
  }

  if (attempt.status !== "COMPLETED") {
    return NextResponse.json({ error: "পরীক্ষাটি এখনো সম্পন্ন হয়নি" }, { status: 400 });
  }

  const questionIds = attempt.questionIds as string[];
  if (!questionIds.includes(questionId)) {
    return NextResponse.json({ error: "প্রশ্ন এই পরীক্ষার অংশ না" }, { status: 404 });
  }

  const question = await prisma.admissionQuestion.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
  }

  const userAnswers = (attempt.userAnswers ?? {}) as Record<string, string>;
  const userAnswer = userAnswers[questionId];

  if (!userAnswer) {
    return NextResponse.json(
      { error: "এই প্রশ্নটা বাদ দেওয়া হয়েছিল — ব্যাখ্যার প্রয়োজন নেই" },
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
    console.error("Mistake Explainer Error (Admission):", err);
    return NextResponse.json(
      { error: "AI ব্যাখ্যা তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 502 }
    );
  }
}
