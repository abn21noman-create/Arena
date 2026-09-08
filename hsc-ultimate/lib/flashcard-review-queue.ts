// ===================================================================
// Daily Review Queue — MASTER_PLAN.md এর মূল ভিশনের একটা অসম্পূর্ণ
// আইটেম ("Daily review queue + reminder") — এই সেশনে schema-free
// ভাবে বাস্তবায়ন।
// -------------------------------------------------------------------
// ইউজারের সব ডেক মিলিয়ে মোট কতগুলো ফ্ল্যাশকার্ড আজ "due" (রিভিউ করার
// সময় হয়ে গেছে, dueDate <= now) তা হিসাব করে — Dashboard এ একটা
// reminder card হিসেবে দেখানো হয় (in-app reminder, push notification
// না — সেটা আলাদা বড় ফিচার যার জন্য VAPID key/subscription storage
// লাগবে, ভবিষ্যতে বিবেচনা করা যায়)।
// ===================================================================
import { prisma } from "@/lib/prisma";

export interface ReviewQueueSummary {
  totalDueCards: number;
  deckCount: number; // কতগুলো ডেকে অন্তত ১টা due card আছে
  /** সবচেয়ে বেশি due card থাকা ডেক (সরাসরি সেখানে রিভিউ শুরু করার শর্টকাটের জন্য) */
  topDeck: { id: string; name: string; dueCount: number } | null;
}

/** ইউজারের সব ডেক জুড়ে আজকের রিভিউ queue এর সারসংক্ষেপ বের করে */
export async function getReviewQueueSummary(userId: string): Promise<ReviewQueueSummary> {
  const now = new Date();

  const decks = await prisma.flashcardDeck.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      flashcards: {
        where: { dueDate: { lte: now } },
        select: { id: true },
      },
    },
  });

  let totalDueCards = 0;
  let deckCount = 0;
  let topDeck: ReviewQueueSummary["topDeck"] = null;

  for (const deck of decks) {
    const dueCount = deck.flashcards.length;
    if (dueCount === 0) continue;

    totalDueCards += dueCount;
    deckCount += 1;

    if (!topDeck || dueCount > topDeck.dueCount) {
      topDeck = { id: deck.id, name: deck.name, dueCount };
    }
  }

  return { totalDueCards, deckCount, topDeck };
}
