// ===================================================================
// Duel এর প্রশ্নপত্র লোড করা (correctAnswer/explanation বাদ দিয়ে —
// ক্লায়েন্টে সঠিক উত্তর leak হওয়া ঠেকাতে)
// GET /api/duel/[duelId]/questions
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDuelDetail } from "@/lib/quiz-duel";
import { shuffleOptions } from "@/lib/mock-exam";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ duelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { duelId } = await params;

  let duel;
  try {
    duel = await getDuelDetail(duelId, session.user.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "অ্যাক্সেস নেই";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  if (!duel) {
    return NextResponse.json({ error: "Duel পাওয়া যায়নি" }, { status: 404 });
  }
  if (duel.status !== "ACTIVE" && duel.status !== "COMPLETED") {
    return NextResponse.json({ error: "এই Duel এখনো সক্রিয় হয়নি" }, { status: 400 });
  }

  const questionIds = duel.questionIds as string[];

  // 🔧 সম্প্রসারণ: customSetId থাকলে CustomQuestion টেবিল থেকে (নিজের
  // ছবি থেকে AI-জেনারেটেড MCQ), না হলে established Subject question
  // bank (Question টেবিল) থেকে প্রশ্ন লোড হয় (Quiz Battle এর
  // questions route এর একই dual-source প্যাটার্ন)।
  let questions: { id: string; text: string | null; options: unknown; difficulty?: string }[];
  if (duel.customSetId) {
    questions = await prisma.customQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, text: true, options: true },
    });
  } else {
    questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, text: true, options: true, difficulty: true },
    });
  }

  // মূল ক্রম বজায় রাখার জন্য questionIds অনুযায়ী সাজানো হচ্ছে, options
  // প্রতিটা ইউজারের জন্য স্বতন্ত্রভাবে শাফল করা হয় (answer-position
  // মুখস্থ হওয়া ঠেকাতে)
  const orderedQuestions = questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => q !== undefined)
    .map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? shuffleOptions(q.options as unknown[]) : q.options,
    }));

  return NextResponse.json({ questions: orderedQuestions });
}
