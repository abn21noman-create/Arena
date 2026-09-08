// ===================================================================
// Pretest শুরু করার API — একটা চ্যাপ্টারের প্রতিটা টপিক থেকে অল্প কিছু
// ডায়াগনস্টিক প্রশ্ন পাঠায় (সঠিক উত্তর/ব্যাখ্যা ছাড়া)
// POST /api/pretest/start
// Body: { chapterId: string }
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shuffleOptions } from "@/lib/mock-exam";
import { selectPretestQuestions } from "@/lib/pretest";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { chapterId } = await req.json().catch(() => ({}));
  if (!chapterId) {
    return NextResponse.json({ error: "chapterId দিন" }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      subject: true,
      topics: {
        orderBy: { order: "asc" },
        include: { questions: true },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ error: "চ্যাপ্টার পাওয়া যায়নি" }, { status: 404 });
  }

  const topicsWithQuestions = chapter.topics.filter((t) => t.questions.length > 0);

  if (topicsWithQuestions.length === 0) {
    return NextResponse.json(
      { error: "এই চ্যাপ্টারে এখনো কোনো প্রশ্ন নেই, প্রি-টেস্ট দেওয়া যাবে না" },
      { status: 404 }
    );
  }

  const selected = selectPretestQuestions(topicsWithQuestions);

  // ক্লায়েন্টে সঠিক উত্তর/ব্যাখ্যা পাঠানো হচ্ছে না (cheating আটকাতে) —
  // options প্রতিবার শাফল করা হয় (বাকি সব MCQ-সার্ভিং রুটের মতো)
  const questionsForClient = selected.map((q) => ({
    id: q.id,
    text: q.text,
    options: Array.isArray(q.options) ? shuffleOptions(q.options as string[]) : q.options,
    difficulty: q.difficulty,
    topicId: q.topicId,
    topicName: q.topicName,
  }));

  return NextResponse.json({
    chapterId: chapter.id,
    chapterName: chapter.name,
    subjectId: chapter.subject.id,
    subjectName: chapter.subject.name,
    totalTopics: chapter.topics.length,
    topicsWithQuestions: topicsWithQuestions.length,
    questions: questionsForClient,
  });
}
