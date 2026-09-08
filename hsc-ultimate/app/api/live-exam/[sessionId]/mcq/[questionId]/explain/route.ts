// ===================================================================
// AI দিয়ে ব্যক্তিগত ভুল-ব্যাখ্যা (Explain My Mistake) — Live Exam MCQ
// POST /api/live-exam/[sessionId]/mcq/[questionId]/explain
// -------------------------------------------------------------------
// Live Exam Result পেজে একটা ভুল MCQ উত্তরের জন্য "AI দিয়ে ব্যাখ্যা
// বুঝি" বাটনে ক্লিক করলে কল হয় — established Mock Exam MCQ Explain
// (`/api/mock-exam/[attemptId]/mcq/[questionId]/explain`) এর একই
// প্যাটার্ন অনুসরণ করে বানানো হয়েছে, কিন্তু এখানে একটা গুরুত্বপূর্ণ
// পার্থক্য: LiveExamSession এর প্রশ্ন দুই উৎসের হতে পারে (Subject
// question bank এর established `Question`, অথবা ছবি থেকে
// AI-generated `CustomQuestion`) — dual-source লজিক (established
// `lib/live-exam.ts` এর `submitLiveExam()`/`getLiveExamQuestions()`
// এর একই `sourceType` চেক প্যাটার্ন) দিয়ে সঠিক টেবিল থেকে প্রশ্ন এনে
// AI ব্যাখ্যা জেনারেট করা হয়।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { explainMistake } from "@/lib/mistake-explainer";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string; questionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { sessionId, questionId } = await params;

  const liveExam = await prisma.liveExamSession.findUnique({
    where: { id: sessionId },
  });

  if (!liveExam || liveExam.userId !== session.user.id) {
    return NextResponse.json({ error: "সেশন পাওয়া যায়নি" }, { status: 404 });
  }

  if (liveExam.status !== "COMPLETED") {
    return NextResponse.json({ error: "পরীক্ষা এখনো সম্পন্ন হয়নি" }, { status: 400 });
  }

  // 🔧 সম্প্রসারণ (এই সেশনে, Live Exam CQ সাপোর্ট যোগ হওয়ার পরে): এই
  // endpoint শুধু MCQ প্রশ্নের জন্য প্রযোজ্য (established Mistake
  // Explainer শুধু single-correct-answer MCQ এর জন্য ডিজাইন করা, CQ এর
  // AI ফিডব্যাক established `evaluateCQAnswer()` দিয়ে আলাদাভাবে
  // জেনারেট হয় ও ফলাফলেই দেখানো হয়) — CQ সেশনে ভুলবশত এই endpoint কল
  // হলে স্পষ্ট এরর দেওয়া হয়, dual-source লুকআপ এ গিয়ে অস্পষ্ট "প্রশ্ন
  // পাওয়া যায়নি" এরর দেওয়ার বদলে।
  if (liveExam.questionType !== "MCQ") {
    return NextResponse.json({ error: "এই সেশন CQ — এই endpoint শুধু MCQ এর জন্য" }, { status: 400 });
  }

  const questionIds = liveExam.questionIds as string[];
  if (!questionIds.includes(questionId)) {
    return NextResponse.json({ error: "প্রশ্ন এই পরীক্ষার অংশ না" }, { status: 404 });
  }

  // dual-source: customSetId থাকলে CustomQuestion, না হলে established
  // Subject question bank (Question) থেকে প্রশ্নের বিস্তারিত আনা হয়
  let questionText: string;
  let options: string[] | null;
  let correctAnswer: string;
  let existingExplanation: string | null;

  if (liveExam.sourceType === "custom") {
    const question = await prisma.customQuestion.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
    }
    questionText = question.text ?? "";
    options = Array.isArray(question.options) ? (question.options as string[]) : null;
    correctAnswer = question.correctAnswer ?? "";
    existingExplanation = null; // CustomQuestion এ established explanation ফিল্ড নেই
  } else {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: "প্রশ্ন পাওয়া যায়নি" }, { status: 404 });
    }
    questionText = question.text;
    options = Array.isArray(question.options) ? (question.options as string[]) : null;
    correctAnswer = question.correctAnswer;
    existingExplanation = question.explanation;
  }

  const userAnswers = (liveExam.userAnswers ?? {}) as Record<string, string>;
  const userAnswer = userAnswers[questionId];

  if (!userAnswer) {
    return NextResponse.json(
      { error: "এই প্রশ্নে কোনো উত্তর দেওয়া হয়নি — ব্যাখ্যার প্রয়োজন নেই" },
      { status: 400 }
    );
  }

  if (userAnswer === correctAnswer) {
    return NextResponse.json(
      { error: "এই উত্তরটা সঠিক ছিল — ভুল-ব্যাখ্যার প্রয়োজন নেই" },
      { status: 400 }
    );
  }

  try {
    const result = await explainMistake({
      questionText,
      options,
      correctAnswer,
      userAnswer,
      existingExplanation,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Mistake Explainer Error (Live Exam):", err);
    return NextResponse.json(
      { error: "AI ব্যাখ্যা তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করো" },
      { status: 502 }
    );
  }
}
