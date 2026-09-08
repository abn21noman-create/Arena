// ===================================================================
// একটা নির্দিষ্ট Flashcard ডিলিট করার API
// DELETE /api/flashcards/[cardId]
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, একই "existence check থাকা সত্ত্বেও
// read-then-write" ক্লাস, প্রতিরোধমূলকভাবে ফিক্স করা হয়েছে): আগে
// existence+ownership check (`findUnique` + `deck.userId` relation
// verify) করার পরে আলাদা `delete()` কল করা হতো। concurrent double-
// delete (একই কার্ড দ্রুত দুইবার delete চেষ্টা করলে, বা deck নিজেই
// একইসাথে delete হয়ে গেলে cascade এর সাথে race করলে) P2025 crash
// করতে পারতো। ফিক্স: `delete()` এর বদলে `deleteMany({ where: { id,
// deck: { userId } } })` — Prisma nested relation filter দিয়ে
// ownership check ও existence check একসাথে একই where ক্লজে, এবং
// `deleteMany()` কখনো throw করে না।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { cardId } = await params;

  const claimResult = await prisma.flashcard.deleteMany({
    where: { id: cardId, deck: { userId: session.user.id } },
  });

  if (claimResult.count === 0) {
    return NextResponse.json({ error: "কার্ড পাওয়া যায়নি" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
