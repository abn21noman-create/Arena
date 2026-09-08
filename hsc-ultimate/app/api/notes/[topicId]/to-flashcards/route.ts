// ===================================================================
// Note → Flashcard কনভার্টার (RemNote-অনুপ্রাণিত "Highlight note →
// auto flashcard" গ্যাপ পূরণ, FEATURE_RESEARCH.md এ চিহ্নিত)
// POST /api/notes/[topicId]/to-flashcards
// Body: { deckId?: string } — দিলে সেই বিদ্যমান ডেকে কার্ড যোগ হবে
//        (ডেকটা অবশ্যই ইউজারের নিজের হতে হবে), না দিলে টপিকের নামে
//        একটা নতুন ডেক অটো-তৈরি হয়ে সেখানে কার্ড যোগ হবে।
// -------------------------------------------------------------------
// ইউজারের নিজের লেখা Topic Note (components/learn/topic-note-editor.tsx
// দিয়ে সেভ করা) থেকে সরাসরি এক-ক্লিকে AI দিয়ে ফ্ল্যাশকার্ড বানানো —
// আগে থেকে বিদ্যমান "AI দিয়ে বানাও" ফিচার (generate-ai endpoint) টেক্সট
// পেস্ট করা লাগত, এটাতে নিজের ইতিমধ্যে-লেখা নোট সরাসরি ব্যবহার হয়
// (২-ক্লিক ফ্লো, দ্বিতীয়বার টাইপ/পেস্ট করার দরকার নেই)।
// জেনারেশন লজিক `lib/flashcard-gen.ts` এ কেন্দ্রীভূত (generate-ai
// endpoint এর সাথে শেয়ার্ড, DRY)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultSRSState } from "@/lib/spaced-repetition";
import {
  generateFlashcardsFromText,
  MIN_TEXT_LENGTH_FOR_GENERATION,
} from "@/lib/flashcard-gen";

// 🐛 বাগ ফিক্স (PDF Chat Mind Map/Summary/Flashcard generate-ai fix
// এর একই "সমাধান ৪" ক্লাস — দীর্ঘ AI কলের পরে nested-create সহ write):
// existence check এর পরে `generateFlashcardsFromText()` (LLM কল)
// হয়, তারপর nested `flashcards: { create: [...] }` সহ `update()`।
// concurrent deck delete এ P2025 crash হতে পারতো — এখানে নীচে catch
// করে গ্রেসফুল ৪০৪ রিটার্ন করা হয়েছে।
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
  { params }: { params: Promise<{ topicId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { topicId } = await params;

  const [note, topic] = await Promise.all([
    prisma.note.findUnique({
      where: { userId_topicId: { userId: session.user.id, topicId } },
    }),
    prisma.topic.findUnique({
      where: { id: topicId },
      select: { name: true, chapter: { select: { subject: { select: { code: true } } } } },
    }),
  ]);

  if (!topic) {
    return NextResponse.json({ error: "টপিক পাওয়া যায়নি" }, { status: 404 });
  }

  if (!note || !note.content.trim()) {
    return NextResponse.json(
      { error: "এই টপিকে তোমার কোনো নোট নেই — আগে নোট লিখে সেভ করো" },
      { status: 400 }
    );
  }

  if (note.content.trim().length < MIN_TEXT_LENGTH_FOR_GENERATION) {
    return NextResponse.json(
      {
        error: `নোটটা অন্তত ${MIN_TEXT_LENGTH_FOR_GENERATION} অক্ষরের হতে হবে, যাতে AI ভালো ফ্ল্যাশকার্ড বানাতে পারে`,
      },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { deckId } = body as { deckId?: string };

  // টার্গেট ডেক নির্ধারণ — বিদ্যমান ডেক দেওয়া থাকলে ownership যাচাই,
  // না থাকলে টপিকের নামে একটা নতুন ডেক অটো-তৈরি
  let targetDeckId: string;
  if (deckId) {
    const existingDeck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
    if (!existingDeck || existingDeck.userId !== session.user.id) {
      return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
    }
    targetDeckId = existingDeck.id;
  } else {
    const newDeck = await prisma.flashcardDeck.create({
      data: {
        userId: session.user.id,
        name: topic.name,
        subjectCode: topic.chapter.subject.code,
      },
    });
    targetDeckId = newDeck.id;
  }

  try {
    const { cards: validCards, provider } = await generateFlashcardsFromText(note.content);

    const srs = defaultSRSState();
    const updatedDeck = await prisma.flashcardDeck.update({
      where: { id: targetDeckId },
      data: {
        flashcards: {
          create: validCards.map((c) => ({
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
      count: validCards.length,
      provider,
      deck: updatedDeck,
    });
  } catch (err) {
    if (isRecordNotFound(err)) {
      // AI কল চলাকালীন সময়ে ডেকটা concurrent DELETE এ মুছে গেছে
      // (deckId দেওয়া থাকলে সেটা ইউজারের বিদ্যমান ডেক ছিল, তাই এখানে
      // কোনো orphan-cleanup দরকার নেই — নতুন ডেক বানানো হয়ে থাকলে
      // সেটার উপরেই এই update() চলছিল, মানে সেটাও ইতিমধ্যে delete
      // হয়ে গেছে, আলাদা cleanup লাগবে না)
      return NextResponse.json({ error: "এই ডেকটা ইতিমধ্যে ডিলিট হয়ে গেছে" }, { status: 404 });
    }

    // ব্যর্থ হলে এবং আমরাই নতুন (এখনো খালি) ডেক বানিয়ে থাকলে, সেই
    // অকেজো খালি ডেকটা পরিষ্কার করে ফেলা হচ্ছে (orphan deck না রাখতে)
    if (!deckId) {
      await prisma.flashcardDeck
        .delete({ where: { id: targetDeckId } })
        .catch(() => {
          /* silent — cleanup best-effort, মূল error-ই ইউজারকে দেখানো হবে */
        });
    }

    console.error("Note-to-Flashcard Generation Error:", err);
    const isGenerationIssue =
      err instanceof Error &&
      (err.message.includes("ফরম্যাটে") || err.message.includes("ভ্যালিড"));
    const message = isGenerationIssue
      ? (err as Error).message
      : "ফ্ল্যাশকার্ড তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করো";
    return NextResponse.json({ error: message }, { status: isGenerationIssue ? 502 : 500 });
  }
}
