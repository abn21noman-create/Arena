// ===================================================================
// একটা নির্দিষ্ট Deck এর বিস্তারিত (সব কার্ড সহ) + আপডেট + ডিলিট
// GET    /api/flashcard-decks/[deckId]
// PATCH  /api/flashcard-decks/[deckId] — Body: { isPublic?, description? }
//        (Community Shared Deck ফিচার — নিজের ডেক পাবলিক/প্রাইভেট টগল)
// DELETE /api/flashcard-decks/[deckId]
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, Forum Post/Notification/Habit এর একই
// "existence check থাকা সত্ত্বেও read-then-write" ক্লাস, লাইভ টেস্টে
// প্রমাণিত): আগে PATCH ও DELETE উভয়েই existence+ownership check
// (`findUnique`) করার পরে আলাদা ধাপে `update()`/`delete()` কল করা
// হতো। concurrent `PATCH`+`DELETE` একই ডেকে পাঠালে check ও write এর
// মাঝের ছোট window এ delete সম্পন্ন হয়ে গেলে PATCH এর `update()`
// P2025 throw করে ৫০০ crash করতো (৪০৪ হওয়া উচিত ছিল)। লাইভ টেস্টে
// ২০ iteration এ ১৩টা সরাসরি ৫০০ crash প্রমাণিত হয়েছে।
//
// ফিক্স: `update()`/`delete()` এর বদলে atomic `updateMany()`/
// `deleteMany({ where: { id, userId } })` claim — existence ও
// ownership চেক একসাথে একই where ক্লজে atomic ভাবে হয়ে যায়, matched
// count 0 হলে ৪০৪, কোনো crash সম্ভব না।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidOptionalBoolean } from "@/lib/boolean-validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { deckId } = await params;

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: {
      flashcards: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ deck });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { deckId } = await params;
  const body = await req.json().catch(() => ({}));
  const { isPublic, description } = body as { isPublic?: boolean; description?: string };

  // 🐛 বাগ ফিক্স (Boolean Field Validation ক্লাস, লাইভ টেস্টে প্রমাণিত):
  // আগে `isPublic` এর কোনো টাইপ চেক ছাড়াই সরাসরি Prisma তে পাস করা
  // হতো। `isPublic: []`/non-boolean পাঠালে Prisma
  // `PrismaClientValidationError` throw করে ৫০০ crash করত।
  if (!isValidOptionalBoolean(isPublic)) {
    return NextResponse.json({ error: "isPublic true/false হতে হবে" }, { status: 400 });
  }

  if (description !== undefined && description !== null && description.length > 500) {
    return NextResponse.json(
      { error: "বিবরণ সর্বোচ্চ ৫০০ অক্ষরের হতে পারবে" },
      { status: 400 }
    );
  }

  const claimResult = await prisma.flashcardDeck.updateMany({
    where: { id: deckId, userId: session.user.id },
    data: {
      ...(isPublic !== undefined && { isPublic }),
      ...(description !== undefined && { description: description?.trim() || null }),
    },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  const updated = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!updated) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ deck: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { deckId } = await params;

  const claimResult = await prisma.flashcardDeck.deleteMany({
    where: { id: deckId, userId: session.user.id },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
