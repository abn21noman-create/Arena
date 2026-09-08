// ===================================================================
// Community Shared Deck — Import/Clone API
// POST /api/flashcard-decks/[deckId]/import
// -------------------------------------------------------------------
// একটা পাবলিক ডেকের সব কার্ড কপি করে ইউজারের নিজের একাউন্টে নতুন একটা
// (private) ডেক তৈরি করে — মূল ডেক থেকে সম্পূর্ণ স্বতন্ত্র (পরে মূল ডেক
// ডিলিট/পরিবর্তন হলেও ক্লোন করা ডেক অক্ষত থাকে, "snapshot copy" প্যাটার্ন,
// live-reference না)। নতুন কার্ডগুলো FSRS ডিফল্ট SRS state এ শুরু হয়
// (আগের কারো review history/interval কপি হয় না — প্রতিটা ইউজারের শেখার
// গতি ভিন্ন)।
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, একই "existence check থাকা সত্ত্বেও
// read-then-write" ক্লাস, লাইভ টেস্টে প্রমাণিত): আগে array-based
// `$transaction([create, update])` এ দ্বিতীয় query
// `prisma.flashcardDeck.update({ where: { id: deckId }, data: {
// importCount: { increment: 1 } } })` ছিল। যদি source deck owner
// concurrent-ভাবে সেই ডেক ডিলিট করে দেয় (existence check এর পরে,
// transaction চলার সময়), এই `update()` P2025 throw করতো — এবং
// array-based transaction এ একটা query fail করলে **পুরো transaction
// rollback হয়ে যায়**, অর্থাৎ importer এর নতুন ক্লোন করা ডেকও তৈরি
// হতো না (৫০০ crash সহ), যদিও read করার সময় source deck+cards
// বৈধভাবে বিদ্যমান ছিল এবং importer এর দৃষ্টিকোণ থেকে import সফল
// হওয়া উচিত ছিল। লাইভ টেস্টে concurrent import+delete পাঠিয়ে crash
// সরাসরি প্রমাণিত হয়েছে।
//
// ফিক্স: `update()` এর বদলে `updateMany({ where: { id: deckId } })`
// ব্যবহার করা হয়েছে — এটা কখনো throw করে না (matched count 0 হলেও
// নীরবে সফল রিটার্ন করে), তাই transaction এর মূল কাজ (নতুন ডেক
// ক্লোন করা) কখনো ব্যর্থ হবে না শুধু importCount stat বাড়ানো ব্যর্থ
// হওয়ার কারণে। importCount শুধু একটা পরিসংখ্যান (কতবার import হয়েছে
// দেখানোর জন্য), এটা miss হলেও ইউজার-facing কোনো critical সমস্যা না।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultSRSState } from "@/lib/spaced-repetition";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { deckId } = await params;

  const sourceDeck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: { flashcards: true },
  });

  if (!sourceDeck || !sourceDeck.isPublic) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  if (sourceDeck.flashcards.length === 0) {
    return NextResponse.json({ error: "এই ডেকে কোনো কার্ড নেই" }, { status: 400 });
  }

  const srs = defaultSRSState();

  // Transaction — নতুন ডেক তৈরি + importCount বাড়ানো একসাথে চেষ্টা করা
  // হয়, কিন্তু importCount আপডেট ব্যর্থ হলে (source deck concurrent
  // delete হয়ে গেলে) পুরো transaction rollback না হয়ে শুধু সেই অংশটা
  // silently skip হবে (updateMany() কখনো throw করে না)
  const [newDeck] = await prisma.$transaction([
    prisma.flashcardDeck.create({
      data: {
        userId: session.user.id,
        name: `${sourceDeck.name} (কপি)`,
        subjectCode: sourceDeck.subjectCode,
        isPublic: false, // ক্লোন করা ডেক ডিফল্টে private থাকে
        flashcards: {
          create: sourceDeck.flashcards.map((c) => ({
            front: c.front,
            back: c.back,
            cardType: c.cardType,
            imageUrl: c.imageUrl,
            occlusionBoxes: c.occlusionBoxes ?? undefined,
            easeFactor: srs.easeFactor,
            intervalDays: srs.intervalDays,
            repetitions: srs.repetitions,
            dueDate: new Date(),
          })),
        },
      },
      include: { flashcards: true },
    }),
    prisma.flashcardDeck.updateMany({
      where: { id: deckId },
      data: { importCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ deck: newDeck }, { status: 201 });
}

