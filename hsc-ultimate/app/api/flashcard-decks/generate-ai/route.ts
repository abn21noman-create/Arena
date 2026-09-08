// ===================================================================
// AI দিয়ে নোট থেকে অটো-ফ্ল্যাশকার্ড জেনারেশন
// POST /api/flashcard-decks/generate-ai
// Body: { deckId: string, notes: string }
// -------------------------------------------------------------------
// ইউজার কোনো নোট/টেক্সট পেস্ট করলে AI সেখান থেকে ৫-৮টা flashcard
// (front/back জোড়া) বানিয়ে দেয়, যেগুলো সরাসরি ডেকে যোগ হয়ে যায়।
// জেনারেশন লজিক `lib/flashcard-gen.ts` এ কেন্দ্রীভূত (Note-to-Flashcard
// ফিচারের সাথে শেয়ার্ড, DRY রাখতে)।
//
// 🐛 বাগ ফিক্স (PDF Chat Mind Map/Summary fix এর একই "সমাধান ৪" ক্লাস
// — দীর্ঘ AI কলের পরে write): existence check এর পরে
// `generateFlashcardsFromText()` (LLM কল, কয়েক সেকেন্ড) হয়, তারপর
// nested `flashcards: { create: [...] }` সহ `update()`। এই সময়ে
// concurrent `DELETE /api/flashcard-decks/[deckId]` ডেক মুছে ফেললে
// `update()` P2025 throw করতো। এখানে nested create থাকায়
// `updateMany()` ব্যবহার করা যায় না (updateMany nested relation
// write সাপোর্ট করে না), তাই সরাসরি P2025 catch করে গ্রেসফুল ৪০৪
// রিটার্ন করা হয়েছে।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultSRSState } from "@/lib/spaced-repetition";
import { generateFlashcardsFromText } from "@/lib/flashcard-gen";

function isRecordNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2025"
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { deckId, notes } = body;

  if (!deckId || !notes?.trim()) {
    return NextResponse.json(
      { error: "ডেক ও নোট টেক্সট দুটোই দিতে হবে" },
      { status: 400 }
    );
  }

  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  try {
    const { cards: validCards, provider } = await generateFlashcardsFromText(notes);

    const srs = defaultSRSState();
    const created = await prisma.flashcardDeck.update({
      where: { id: deckId },
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
      include: { flashcards: true },
    });

    return NextResponse.json({
      count: validCards.length,
      provider,
      deck: created,
    });
  } catch (err) {
    if (isRecordNotFound(err)) {
      // AI কল চলাকালীন সময়ে ডেকটা concurrent DELETE এ মুছে গেছে
      return NextResponse.json({ error: "এই ডেকটা ইতিমধ্যে ডিলিট হয়ে গেছে" }, { status: 404 });
    }
    console.error("AI Flashcard Generation Error:", err);
    const isGenerationIssue =
      err instanceof Error &&
      (err.message.includes("ফরম্যাটে") || err.message.includes("ভ্যালিড"));
    const message = isGenerationIssue
      ? (err as Error).message
      : "ফ্ল্যাশকার্ড তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করো";
    return NextResponse.json({ error: message }, { status: isGenerationIssue ? 502 : 500 });
  }
}

