// ===================================================================
// Quiz Battle এর প্রশ্নপত্র লোড করা (correctAnswer বাদ দিয়ে)
// GET /api/quiz-battle/[battleId]/questions
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shuffleOptions } from "@/lib/mock-exam";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ battleId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { battleId } = await params;
  const battle = await prisma.quizBattle.findUnique({
    where: { id: battleId },
    include: { participants: { select: { userId: true } } },
  });

  if (!battle) {
    return NextResponse.json({ error: "Battle পাওয়া যায়নি" }, { status: 404 });
  }
  const isParticipant = battle.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) {
    return NextResponse.json({ error: "তুমি এই Battle এর অংশগ্রহণকারী না" }, { status: 403 });
  }
  if (battle.status === "WAITING") {
    return NextResponse.json({ error: "Battle এখনো শুরু হয়নি" }, { status: 400 });
  }

  const questionIds = battle.questionIds as string[];

  let orderedQuestions;
  if (battle.customSetId) {
    const questions = await prisma.customQuestion.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, text: true, options: true },
    });
    const map = new Map(questions.map((q) => [q.id, q]));
    orderedQuestions = questionIds.map((id) => map.get(id)).filter((q): q is NonNullable<typeof q> => q !== undefined);
  } else {
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, text: true, options: true, difficulty: true },
    });
    const map = new Map(questions.map((q) => [q.id, q]));
    orderedQuestions = questionIds.map((id) => map.get(id)).filter((q): q is NonNullable<typeof q> => q !== undefined);
  }

  // options প্রতিটা participant এর জন্য স্বতন্ত্রভাবে শাফল করা হয় (প্রতি
  // রিকোয়েস্টে নতুন র‍্যান্ডম অর্ডার) — একবার fetch হয়ে client এ ক্যাশ
  // থাকে (questionsLoadedRef গার্ড), তাই একই ইউজারের কাছে সেশন জুড়ে
  // consistent থাকে, কিন্তু ভিন্ন ইউজার ভিন্ন অর্ডার দেখতে পারে (কোনো
  // সমস্যা না, উত্তর content ভিত্তিক match হয়, position ভিত্তিক না)
  const questionsShuffled = orderedQuestions.map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? shuffleOptions(q.options as unknown[]) : q.options,
  }));

  return NextResponse.json({ questions: questionsShuffled });
}
