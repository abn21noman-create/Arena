// ===================================================================
// AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake)
// POST /api/practice/answers/[answerId]/explain
// -------------------------------------------------------------------
// Practice Result পেজে একটা নির্দিষ্ট ভুল MCQ উত্তরের জন্য "AI দিয়ে
// ব্যাখ্যা বুঝি" বাটনে ক্লিক করলে কল হয় — on-demand (স্বয়ংক্রিয় না,
// AI cost বাঁচাতে), ownership যাচাই করে (নিজের attempt এর answer
// ছাড়া অন্য কারো explain করা যাবে না)।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { explainMistake } from "@/lib/mistake-explainer";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ answerId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { answerId } = await params;

  const answer = await prisma.quizAttemptAnswer.findUnique({
    where: { id: answerId },
    include: {
      quizAttempt: { select: { userId: true } },
      question: {
        select: { text: true, options: true, correctAnswer: true, explanation: true },
      },
    },
  });

  if (!answer || answer.quizAttempt.userId !== session.user.id) {
    return NextResponse.json({ error: "উত্তর পাওয়া যায়নি" }, { status: 404 });
  }

  if (answer.isCorrect) {
    return NextResponse.json(
      { error: "এই উত্তরটা সঠিক ছিল — ভুল-ব্যাখ্যার প্রয়োজন নেই" },
      { status: 400 }
    );
  }

  try {
    const result = await explainMistake({
      questionText: answer.question.text,
      options: Array.isArray(answer.question.options)
        ? (answer.question.options as string[])
        : null,
      correctAnswer: answer.question.correctAnswer,
      userAnswer: answer.userAnswer,
      existingExplanation: answer.question.explanation,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Mistake Explainer Error:", err);
    return NextResponse.json(
      { error: "AI ব্যাখ্যা তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 502 }
    );
  }
}
