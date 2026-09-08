// ===================================================================
// Custom Question Set — একক সেট: বিস্তারিত (স্ট্যাটাস পোলিং) + ডিলিট
// GET    /api/custom-question-sets/[setId]  -> সেট + প্রশ্ন লিস্ট
// DELETE /api/custom-question-sets/[setId]  -> সেট ও প্রশ্ন ডিলিট
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ DELETE endpoint cascade অডিটে আবিষ্কৃত):
// `QuizBattle.customSetId`, `LiveExamSession.customSetId` ও (এই
// সেশনে যোগ হওয়া) `QuizDuel.customSetId` — কোনোটাই Prisma `@relation`
// (foreign key) দিয়ে `CustomQuestionSet` এর সাথে যুক্ত না (শুধু raw
// string ID, কারণ প্রশ্নের উৎস দুই রকম হতে পারে — Subject question bank
// অথবা CustomQuestionSet, একটামাত্র nullable FK দিয়ে generalize করা
// কঠিন ছিল বলে ইচ্ছাকৃতভাবে raw ID রাখা হয়েছিল)। এর ফলে কোনো DB-level
// cascade/restrict constraint কাজ করে না — একজন ইউজার নিজের
// CustomQuestionSet দিয়ে একটা Quiz Battle/Live Exam/Duel
// **চলাকালীন অবস্থায়** (ACTIVE/IN_PROGRESS/WAITING) সেই সেট ডিলিট করলে
// participant রা `GET .../questions` কল করলে `questions: []` (খালি,
// কোনো error message ছাড়াই) পেতো — battle/exam/duel "চলছে" কিন্তু কোনো
// প্রশ্ন নেই, ইউজার আটকে যেতো। লাইভ টেস্টে সরাসরি reproduce করে
// নিশ্চিত হওয়া গেছে। ফিক্স: DELETE করার আগে চেক করা হচ্ছে এই সেট কোনো
// non-COMPLETED Quiz Battle, IN_PROGRESS Live Exam, বা
// non-COMPLETED/non-EXPIRED Duel এ ব্যবহৃত হচ্ছে কিনা — থাকলে স্পষ্ট
// বাংলা এরর মেসেজ সহ ৪০০ রিটার্ন করা হয় (ডিলিট ব্লক করা)। COMPLETED/
// EXPIRED battle/exam/duel এ ব্যবহৃত সেট ডিলিট করা নিরাপদ (questions আর
// দেখানো হবে না, শুধু ফলাফল/review পেজ প্রশ্নের বদলে ফাঁকা দেখাবে যা
// COMPLETED অবস্থায় গ্রহণযোগ্য — নতুন কোনো active session আর তৈরি হবে না)।
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স #২ (Race Condition, Flashcard/Study Group এর একই
// established "existence check থাকা সত্ত্বেও read-then-write" ক্লাস,
// লাইভ টেস্টে প্রমাণিত): DELETE হ্যান্ডলারে আগে ownership+active-
// battle/exam চেক (`getOwnedSet()`) করার পরে আলাদা raw
// `prisma.customQuestionSet.delete({ where: { id: setId } })` কল করা
// হতো। concurrent double-delete (দ্রুত দুইবার click, বা একই সেট দুইটা
// ট্যাবে খুলে দুই জায়গা থেকে delete চেষ্টা) করলে যেটা প্রথমে delete
// কলে পৌঁছায় সে সফল হয়, দ্বিতীয়টা Prisma `delete()` এ P2025 ("No
// record was found for a delete") throw করে ৫০০ crash করতো। লাইভ
// concurrency টেস্টে (একই setId তে ২টা concurrent DELETE) ৮/৮ (১০০%)
// iteration এ crash প্রমাণিত হয়েছে (একটা ২০০, অন্যটা ৫০০)। ফিক্স:
// `delete()` এর বদলে atomic `deleteMany({ where: { id, userId } })`
// ব্যবহার করা হয়েছে (কখনো throw করে না) — matched count 0 হলে "সেট
// পাওয়া যায়নি" সহ গ্রেসফুল ৪০৪ রিটার্ন করা হয়।
// ===================================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedSet(setId: string, userId: string) {
  return prisma.customQuestionSet.findFirst({ where: { id: setId, userId } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { setId } = await params;
  const set = await prisma.customQuestionSet.findFirst({
    where: { id: setId, userId: session.user.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!set) {
    return NextResponse.json({ error: "সেট পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ set });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { setId } = await params;
  const set = await getOwnedSet(setId, session.user.id);
  if (!set) {
    return NextResponse.json({ error: "সেট পাওয়া যায়নি" }, { status: 404 });
  }

  const [activeBattle, activeLiveExam, activeDuel] = await Promise.all([
    prisma.quizBattle.findFirst({
      where: { customSetId: setId, status: { in: ["WAITING", "ACTIVE"] } },
      select: { id: true },
    }),
    prisma.liveExamSession.findFirst({
      where: { customSetId: setId, status: "IN_PROGRESS" },
      select: { id: true },
    }),
    // 🔧 সম্প্রসারণ (এই সেশনে, Duel + CustomQuestionSet সংযোগ যোগ হওয়ার
    // পরে): WAITING/ACTIVE Duel এও এই একই cascade-audit bug class প্রযোজ্য
    prisma.quizDuel.findFirst({
      where: { customSetId: setId, status: { in: ["WAITING", "ACTIVE"] } },
      select: { id: true },
    }),
  ]);

  if (activeBattle) {
    return NextResponse.json(
      { error: "এই সেট দিয়ে একটা Quiz Battle এখনো চলছে — সেটা শেষ হওয়ার পরে ডিলিট করো" },
      { status: 400 }
    );
  }
  if (activeLiveExam) {
    return NextResponse.json(
      { error: "এই সেট দিয়ে একটা Live Exam এখনো চলছে — সেটা শেষ করার পরে ডিলিট করো" },
      { status: 400 }
    );
  }
  if (activeDuel) {
    return NextResponse.json(
      { error: "এই সেট দিয়ে একটা Duel এখনো চলছে — সেটা শেষ হওয়ার পরে ডিলিট করো" },
      { status: 400 }
    );
  }

  // atomic claim — delete() এর বদলে deleteMany() ব্যবহার করে P2025
  // এড়ানো হয়েছে (উপরের কমেন্টে বিস্তারিত), userId ও where ক্লজে রেখে
  // ownership double-check করা হয়েছে (defense-in-depth)
  const claimResult = await prisma.customQuestionSet.deleteMany({
    where: { id: setId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "সেট পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

