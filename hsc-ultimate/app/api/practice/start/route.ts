// ===================================================================
// Practice Quiz শুরু করার API
// POST /api/practice/start
// Body: { chapterId: string, onlyBoardQuestions?: boolean }
// Response: প্রশ্ন লিস্ট (সঠিক উত্তর ও ব্যাখ্যা ছাড়া — cheating আটকাতে)
// -------------------------------------------------------------------
// onlyBoardQuestions=true দিলে শুধু boardYear/boardName ট্যাগ করা (আসল
// বোর্ড পরীক্ষার) প্রশ্ন ফিল্টার করে দেওয়া হয় (Previous-Year Board
// Question ফিচার)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shuffleOptions } from "@/lib/mock-exam";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { chapterId, onlyBoardQuestions } = await req.json().catch(() => ({}));
  if (!chapterId) {
    return NextResponse.json({ error: "chapterId দিন" }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      subject: true,
      topics: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ error: "চ্যাপ্টার পাওয়া যায়নি" }, { status: 404 });
  }

  let allQuestions = chapter.topics.flatMap((t) => t.questions);

  if (onlyBoardQuestions) {
    allQuestions = allQuestions.filter((q) => q.boardYear !== null || q.boardName !== null);
  }

  if (allQuestions.length === 0) {
    return NextResponse.json(
      {
        error: onlyBoardQuestions
          ? "এই চ্যাপ্টারে এখনো কোনো বোর্ড পরীক্ষার প্রশ্ন নেই"
          : "এই চ্যাপ্টারে এখনো কোনো প্রশ্ন নেই",
      },
      { status: 404 }
    );
  }

  // সঠিক উত্তর ও ব্যাখ্যা বাদ দিয়ে পাঠানো হচ্ছে (ক্লায়েন্ট সাইডে cheating আটকাতে)
  // boardYear/boardName পাঠানো নিরাপদ (এগুলো সঠিক উত্তর leak করে না, শুধু
  // transparency এর জন্য কোন বোর্ডের প্রশ্ন তা দেখানো হয়)। options
  // প্রতিবার শাফল করা হয় (Deep Research এ চিহ্নিত answer-position
  // মুখস্থ হওয়া ঠেকাতে) — correctAnswer এর ভ্যালু (string content)
  // অপরিবর্তিত থাকে, শুধু options array এর ক্রম পরিবর্তন হয়।
  const questionsForClient = allQuestions.map((q) => ({
    id: q.id,
    text: q.text,
    options: Array.isArray(q.options) ? shuffleOptions(q.options as string[]) : q.options,
    difficulty: q.difficulty,
    boardYear: q.boardYear,
    boardName: q.boardName,
  }));

  return NextResponse.json({
    chapterId: chapter.id,
    chapterName: chapter.name,
    subjectId: chapter.subject.id,
    subjectName: chapter.subject.name,
    questions: questionsForClient,
  });
}
