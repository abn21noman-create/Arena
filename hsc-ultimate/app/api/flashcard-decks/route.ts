// ===================================================================
// Flashcard Deck List + Create API
// GET  /api/flashcard-decks         -> ইউজারের সব ডেক (due count সহ)
// POST /api/flashcard-decks         -> নতুন ডেক তৈরি
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEnumValue, VALID_SUBJECT_CODES } from "@/lib/enum-validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const decks = await prisma.flashcardDeck.findMany({
    where: { userId: session.user.id },
    include: {
      flashcards: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const result = decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    subjectCode: deck.subjectCode,
    totalCards: deck.flashcards.length,
    dueCards: deck.flashcards.filter((c) => c.dueDate <= now).length,
    createdAt: deck.createdAt,
  }));

  return NextResponse.json({ decks: result });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, subjectCode } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "ডেকের নাম দিন" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // Habit/Study Group এর একই max-length প্যাটার্ন): আগে কোনো ব্যাকএন্ড
  // length limit ছিল না — লাইভ টেস্টে ~৩১৭ KB নাম সরাসরি DB তে সেভ
  // হয়ে গেছে। ফিক্স: ১০০ অক্ষর সীমা যোগ করা হয়েছে (Habit এর মতোই)।
  if (name.trim().length > 100) {
    return NextResponse.json({ error: "নাম খুব বড় (সর্বোচ্চ ১০০ অক্ষর)" }, { status: 400 });
  }
  // 🐛 বাগ ফিক্স (প্রোঅ্যাক্টিভ non-race-condition bug hunt এ আবিষ্কৃত,
  // lib/enum-validation.ts এ বিস্তারিত): অজানা subjectCode দিলে
  // Prisma create() এ `PrismaClientValidationError` throw করে ৫০০
  // crash করতো।
  if (!isValidEnumValue(subjectCode, VALID_SUBJECT_CODES)) {
    return NextResponse.json({ error: "সঠিক subjectCode দিন" }, { status: 400 });
  }

  const deck = await prisma.flashcardDeck.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      subjectCode: subjectCode || null,
    },
  });

  return NextResponse.json({ deck }, { status: 201 });
}
