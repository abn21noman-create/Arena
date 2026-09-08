// ===================================================================
// Adaptive Practice শুরু করা — দুর্বল টপিক-ভিত্তিক প্রশ্ন সেট তৈরি করে
// POST /api/adaptive-practice/start
// Body: { count? } (ঐচ্ছিক, ডিফল্ট ১৫)
// -------------------------------------------------------------------
// correctAnswer ক্লায়েন্টে পাঠানো হয় না (cheating আটকাতে), বাকি
// endpoint গুলোর মতোই সার্ভার-সাইড scoring প্যাটার্ন অনুসরণ করে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildAdaptivePracticeSet } from "@/lib/adaptive-practice";
import { shuffleOptions } from "@/lib/mock-exam";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { count } = body as { count?: number };
  const questionCount = Math.min(Math.max(count ?? 15, 5), 25);

  const questions = await buildAdaptivePracticeSet(session.user.id, questionCount);

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "প্র্যাকটিসের জন্য যথেষ্ট প্রশ্ন পাওয়া যায়নি" },
      { status: 404 }
    );
  }

  // correctAnswer বাদ দিয়ে ক্লায়েন্টে পাঠানো হচ্ছে, options শাফল করে
  // (answer-position মুখস্থ হওয়া ঠেকাতে)
  const questionsForClient = questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: Array.isArray(q.options) ? shuffleOptions(q.options as unknown[]) : q.options,
    difficulty: q.difficulty,
    topicId: q.topicId,
    topicName: q.topicName,
    subjectId: q.subjectId,
    subjectName: q.subjectName,
    reason: q.reason,
    empiricalDifficulty: q.empiricalDifficulty,
  }));

  return NextResponse.json({ questions: questionsForClient });
}
