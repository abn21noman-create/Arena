// ===================================================================
// একটা Deck থেকে "due" (আজ রিভিউ করার মতো) ফ্ল্যাশকার্ড আনার API
// GET /api/flashcard-decks/[deckId]/due
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { deckId } = await params;
  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "ডেক পাওয়া যায়নি" }, { status: 404 });
  }

  const dueCards = await prisma.flashcard.findMany({
    where: {
      deckId,
      dueDate: { lte: new Date() },
    },
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      front: true,
      back: true,
      cardType: true,
      imageUrl: true,
      occlusionBoxes: true,
      dueDate: true,
      repetitions: true,
    },
  });

  return NextResponse.json({ deckName: deck.name, cards: dueCards });
}
