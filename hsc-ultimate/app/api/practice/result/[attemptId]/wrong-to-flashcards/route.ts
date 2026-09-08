// ===================================================================
// Wrong-Answer → Flashcard কনভার্টার (MASTER_PLAN.md এর মূল ভিশনের
// একটা অসম্পূর্ণ আইটেম: "প্রতিটি ভুল উত্তরকে flashcard এ কনভার্ট করার
// সাজেশন" — এই সেশনে বাস্তবায়ন)
// POST /api/practice/result/[attemptId]/wrong-to-flashcards
// Body: { deckId?: string }
// -------------------------------------------------------------------
// Result পেজে দেখানো সব ভুল উত্তরকে এক-ক্লিকে ফ্ল্যাশকার্ডে (front:
// প্রশ্ন, back: সঠিক উত্তর + ব্যাখ্যা) কনভার্ট করে — কোনো AI কল লাগে
// না (Note-to-Flashcard এর মতো), কারণ প্রশ্ন/সঠিক উত্তর/ব্যাখ্যা
// ইতিমধ্যেই DB তে বিদ্যমান। এই ডিজাইনে instant (কোনো AI latency/cost
// নেই) এবং সবসময় নির্ভুল (AI hallucination এর ঝুঁকি নেই)।
// -------------------------------------------------------------------
// deckId না দিলে "ভুল উত্তর — [চ্যাপ্টার নাম]" নামে নতুন ডেক অটো-তৈরি
// হয় (Note-to-Flashcard এর deckId-optional প্যাটার্ন অনুসরণ করে)।
// এই endpoint শুধু QuizAttempt (practice/adaptive/drill সব quizType)
// এর জন্য কাজ করে — Mock Exam/Live Exam/Admission এ আলাদা attempt
// মডেল ব্যবহৃত হয়, ভবিষ্যতে চাইলে একই প্যাটার্নে আলাদা endpoint
// বানানো যাবে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultSRSState } from "@/lib/spaced-repetition";

// 🐛 বাগ ফিক্স (Note-to-Flashcard/Flashcard-generate-ai fix এর একই
// "existence check-then-write with nested create" ক্লাস — এখানে AI
// কল না থাকলেও existence check ও nested-create write এর মাঝে একটা
// ছোট race window থাকে, concurrent deck delete এ P2025 crash হতে
// পারতো, কোনো try/catch wrapper ছিল না বলে uncaught exception হয়ে
// সরাসরি ৫০০ crash করতো): P2025 catch করে গ্রেসফুল ৪০৪ রিটার্ন
// করা হয়েছে।
function isRecordNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2025"
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { attemptId } = await params;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        where: { isCorrect: false },
        include: { question: true },
      },
    },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "অ্যাটেম্পট পাওয়া যায়নি" }, { status: 404 });
  }

  if (attempt.answers.length === 0) {
    return NextResponse.json(
      { error: "এই অ্যাটেম্পটে কোনো ভুল উত্তর নেই — কনভার্ট করার কিছু নেই" },
      { status: 400 }
    );
  }

  // QuizAttempt.chapterId একটা plain String ফিল্ড (Prisma relation না,
  // কারণ drill/adaptive mode এ একাধিক চ্যাপ্টার মিশ্রিত থাকতে পারে),
  // তাই আলাদাভাবে chapter/subject নাম লুকআপ করা হচ্ছে (থাকলে)
  const chapter = attempt.chapterId
    ? await prisma.chapter.findUnique({
        where: { id: attempt.chapterId },
        select: { name: true, subject: { select: { code: true } } },
      })
    : null;

  const body = await req.json().catch(() => ({}));
  const { deckId } = body as { deckId?: string };

  let targetDeckId: string;
  if (deckId) {
    const existingDeck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!existingDeck || existingDeck.userId !== session.user.id) {
      return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
    }
    targetDeckId = existingDeck.id;
  } else {
    const deckName = chapter ? `ভুল উত্তর — ${chapter.name}` : "ভুল উত্তর — প্র্যাকটিস";
    const newDeck = await prisma.flashcardDeck.create({
      data: {
        userId: session.user.id,
        name: deckName,
        subjectCode: chapter?.subject.code ?? null,
      },
    });
    targetDeckId = newDeck.id;
  }


  // front: প্রশ্ন + নিজের ভুল উত্তর (কোথায় ভুল হয়েছে মনে করিয়ে দিতে),
  // back: সঠিক উত্তর + ব্যাখ্যা (থাকলে) — কোনো ডুপ্লিকেট-প্রতিরোধ চেক
  // করা হয়নি ইচ্ছাকৃতভাবে (একই প্রশ্ন একাধিকবার ভুল হলে repetition
  // reinforcement হিসেবে একাধিক কার্ড থাকা ক্ষতিকর না, বরং SRS এ
  // বেশি exposure পাবে)
  const cardsData = attempt.answers.map((ans) => {
    const backParts = [`✅ সঠিক উত্তর: ${ans.question.correctAnswer}`];
    if (ans.question.explanation) {
      backParts.push(`💡 ${ans.question.explanation}`);
    }
    return {
      front: `${ans.question.text}\n\n(তোমার ভুল উত্তর ছিল: ${ans.userAnswer || "উত্তর দাওনি"})`,
      back: backParts.join("\n\n"),
    };
  });

  const srs = defaultSRSState();
  try {
    const updatedDeck = await prisma.flashcardDeck.update({
      where: { id: targetDeckId },
      data: {
        flashcards: {
          create: cardsData.map((c) => ({
            front: c.front,
            back: c.back,
            easeFactor: srs.easeFactor,
            intervalDays: srs.intervalDays,
            repetitions: srs.repetitions,
            dueDate: new Date(),
          })),
        },
      },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      count: cardsData.length,
      deck: updatedDeck,
    });
  } catch (err) {
    if (isRecordNotFound(err)) {
      return NextResponse.json({ error: "এই ডেকটা ইতিমধ্যে ডিলিট হয়ে গেছে" }, { status: 404 });
    }
    throw err;
  }
}
