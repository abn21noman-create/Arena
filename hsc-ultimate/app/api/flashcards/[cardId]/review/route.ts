// ===================================================================
// Flashcard Review জমা দেওয়ার API — SM-2 অ্যালগরিদম দিয়ে পরের due date
// হিসাব করে আপডেট করে।
// POST /api/flashcards/[cardId]/review
// Body: { rating: "again" | "hard" | "good" | "easy" }
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (Race Condition, Class Routine Slot এর একই "বিদ্যমান
// রো read করে next-state calculate করে write" জটিলতা, লাইভ টেস্টে
// প্রমাণিত): আগে existence+ownership check (`findUnique`, card এর
// বর্তমান SRS state read করে next review calculate করতে ব্যবহৃত)
// এর পরে আলাদা `update()` কল করা হতো। concurrent `DELETE /api/
// flashcards/[cardId]` যদি এই read ও write এর মাঝে কার্ড ডিলিট করে
// দেয়, `update()` P2025 throw করে ৫০০ crash করতো। লাইভ টেস্টে ১৫
// iteration এ ১৪টা সরাসরি crash প্রমাণিত হয়েছে (delete fix করার
// পরেও review endpoint নিজেই আলাদাভাবে ভুগছিল, কারণ এখানে read-
// then-calculate-then-write প্যাটার্ন)।
//
// ফিক্স: Class Routine Slot এর established সমাধান ৩খ অনুসরণ করে
// `$transaction` এর ভেতরে `SELECT ... FOR UPDATE` দিয়ে কার্ড row লক
// করে read+calculate+write পুরো সিকোয়েন্স atomic করা হয়েছে। XP/
// streak/badge award transaction এর বাইরে রাখা হয়েছে (Reading Room
// Join fix এর মতো — awardXp()/updateStreak()/checkAndAwardBadges()
// transaction-aware না, ভেতরে কল করলে self-deadlock ঝুঁকি)।
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview, type ReviewRating } from "@/lib/spaced-repetition";
import { calculateNextFsrsReview } from "@/lib/fsrs";
import { updateStreak } from "@/lib/streak";
import { checkAndAwardBadges } from "@/lib/gamification";
import { awardXp } from "@/lib/league";
import { markUserActive } from "@/lib/live-activity";
import type { Flashcard } from "@prisma/client";

const VALID_RATINGS: ReviewRating[] = ["again", "hard", "good", "easy"];
const XP_PER_REVIEW = 2;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { cardId } = await params;
  const body = await req.json().catch(() => ({}));
  const rating = body.rating as ReviewRating;

  if (!VALID_RATINGS.includes(rating)) {
    return NextResponse.json({ error: "সঠিক রেটিং দিন" }, { status: 400 });
  }

  let updated: Flashcard;
  try {
    updated = await prisma.$transaction(async (tx) => {
      // কার্ড row লক করা ও ownership যাচাই — একই query তে
      const lockedCards = await tx.$queryRaw<
        Array<{
          id: string;
          deckUserId: string;
          srsAlgorithm: string;
          fsrsStability: number;
          fsrsDifficulty: number;
          fsrsScheduledDays: number;
          fsrsReps: number;
          fsrsLapses: number;
          fsrsState: string;
          lastReviewed: Date | null;
          easeFactor: number;
          intervalDays: number;
          repetitions: number;
        }>
      >`
        SELECT f.id, d."userId" as "deckUserId", f."srsAlgorithm",
               f."fsrsStability", f."fsrsDifficulty", f."fsrsScheduledDays",
               f."fsrsReps", f."fsrsLapses", f."fsrsState", f."lastReviewed",
               f."easeFactor", f."intervalDays", f."repetitions"
        FROM "flashcards" f
        JOIN "flashcard_decks" d ON d.id = f."deckId"
        WHERE f.id = ${cardId}
        FOR UPDATE OF f
      `;
      if (lockedCards.length === 0 || lockedCards[0].deckUserId !== session.user.id) {
        throw new Error("CARD_NOT_FOUND");
      }
      const card = lockedCards[0];

      // কার্ডের srsAlgorithm অনুযায়ী সঠিক অ্যালগরিদম বেছে নেওয়া হয় —
      // পুরনো (migration এর আগের) কার্ড SM-2 তেই থাকে, নতুন কার্ড FSRS
      // ব্যবহার করে
      if (card.srsAlgorithm === "FSRS") {
        const nextReview = calculateNextFsrsReview(
          {
            stability: card.fsrsStability,
            difficulty: card.fsrsDifficulty,
            fsrsScheduledDays: card.fsrsScheduledDays,
            fsrsReps: card.fsrsReps,
            fsrsLapses: card.fsrsLapses,
            fsrsState: card.fsrsState as "NEW" | "LEARNING" | "REVIEW" | "RELEARNING",
            lastReviewed: card.lastReviewed,
          },
          rating
        );
        return tx.flashcard.update({
          where: { id: cardId },
          data: {
            fsrsStability: nextReview.stability,
            fsrsDifficulty: nextReview.difficulty,
            fsrsScheduledDays: nextReview.scheduledDays,
            fsrsReps: nextReview.reps,
            fsrsLapses: nextReview.lapses,
            fsrsState: nextReview.state,
            dueDate: nextReview.dueDate,
            lastReviewed: new Date(),
          },
        });
      }

      const nextReview = calculateNextReview(
        {
          easeFactor: card.easeFactor,
          intervalDays: card.intervalDays,
          repetitions: card.repetitions,
        },
        rating
      );
      return tx.flashcard.update({
        where: { id: cardId },
        data: {
          easeFactor: nextReview.easeFactor,
          intervalDays: nextReview.intervalDays,
          repetitions: nextReview.repetitions,
          dueDate: nextReview.dueDate,
          lastReviewed: new Date(),
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "CARD_NOT_FOUND") {
      return NextResponse.json({ error: "কার্ড পাওয়া যায়নি" }, { status: 404 });
    }
    throw err;
  }

  // প্রতিটা রিভিউতে ছোট XP reward (rating যাই হোক না কেন — নিয়মিত রিভিউ করাটাই গুরুত্বপূর্ণ)
  await awardXp(session.user.id, XP_PER_REVIEW);

  await updateStreak(session.user.id);
  const newBadges = await checkAndAwardBadges(session.user.id);
  await markUserActive(session.user.id, "FLASHCARD").catch(() => {});

  return NextResponse.json({
    flashcard: updated,
    xpEarned: XP_PER_REVIEW,
    newBadges: newBadges.map((b) => ({ code: b.code, name: b.name, iconEmoji: b.iconEmoji })),
  });
}
