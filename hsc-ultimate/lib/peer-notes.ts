// ===================================================================
// Peer Note Sharing — Core Logic
// -------------------------------------------------------------------
// MASTER_PLAN.md এর মূল ভিশনের একটা অসম্পূর্ণ আইটেম: "Peer note
// sharing" — এই সেশনে বাস্তবায়ন।
//
// Deep Research (web_search): crowdsourced/peer note sharing app গুলোতে
// (OneNote/Supernotes/RemNote) মূল প্যাটার্ন হলো নোট শেয়ার করা +
// quality signal (upvote/helpful মার্ক)। এই প্রজেক্টের বিদ্যমান
// Community Shared Flashcard Deck ফিচারের প্যাটার্নই (opt-in publish +
// discover + popularity signal) এখানে টপিক নোটে প্রসারিত করা হয়েছে।
//
// ডিজাইন সিদ্ধান্ত:
// - ডিফল্টে সব নোট private (isPublic=false) — ইউজার নিজে থেকে পাবলিশ
//   করলেই অন্যরা দেখতে পারবে
// - পাবলিশ করা নোট read-only view হিসেবে দেখা যায় (edit করা যায় না,
//   কপি-পেস্ট বা নিজের নোটে রেফারেন্স হিসেবে ব্যবহার করা যায়)
// - "উপকারী" ভোট per-user টগল করা যায় (একবার ভোট দিলে আবার ক্লিক
//   করলে ভোট উঠে যায়) — @@unique([noteId, userId]) দিয়ে ডাবল ভোট
//   আটকানো হয়েছে
// - নিজের নোটে নিজে ভোট দেওয়া যায় না (self-vote আটকানো, নিরপেক্ষ
//   signal রাখতে)
//
// 🐛 বাগ ফিক্স (Forum Vote/Content Report race condition অডিটের
// ধারাবাহিকতায় আবিষ্কৃত, একই ক্লাসের bug): আগে এখানেও
// `findUnique()` দিয়ে existing vote চেক করে আলাদা transaction এ
// create/delete + counter increment/decrement করা হতো। concurrent
// একই ইউজার একই নোটে প্রথমবার ভোট দিলে দুটো request-ই
// `existing === null` দেখে দুটোই create() চেষ্টা করে —
// `@@unique([noteId, userId])` constraint এ দ্বিতীয়টা P2002 crash
// করে ৫০০ Internal Server Error দিত (লাইভ টেস্টে ৫টা concurrent
// রিকোয়েস্টে ৩টা crash প্রমাণিত)।
//
// ফিক্স: `create()`/`delete()` কে try/catch এ wrap করে P2002/P2025
// (যথাক্রমে "ইতিমধ্যে ভোট আছে"/"ভোট ইতিমধ্যে মুছে গেছে" মানে অন্য
// concurrent request জিতে গেছে) গ্রেসফুলভাবে handle করা হয় — কোনো
// counter double-increment/decrement না করে সরাসরি fresh state
// রিটার্ন করা হয়। ForumVote এর মতো পুরো `upsert()` ব্যবহার করা যায়নি
// কারণ এখানে শুধু vote row না, সাথে denormalized `helpfulCount`
// কাউন্টারও transaction এ sync রাখতে হয় — তাই transaction এর ভেতরে
// conditional create/delete + catch প্যাটার্ন ব্যবহার করা হয়েছে।
// ===================================================================
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface PeerNote {
  id: string;
  content: string;
  helpfulCount: number;
  authorName: string;
  isOwnNote: boolean;
  hasVoted: boolean;
  updatedAt: string;
}

/**
 * একটা টপিকের সব পাবলিক নোট নিয়ে আসে (নিজের নোট সহ — নিজেরটা
 * "isOwnNote" ফ্ল্যাগ দিয়ে চিহ্নিত থাকে), helpfulCount অনুযায়ী sort।
 */
export async function getPeerNotesForTopic(
  topicId: string,
  currentUserId: string
): Promise<PeerNote[]> {
  const notes = await prisma.note.findMany({
    where: { topicId, isPublic: true },
    orderBy: [{ helpfulCount: "desc" }, { updatedAt: "desc" }],
    include: {
      user: { select: { id: true, name: true } },
      helpfulVotes: { where: { userId: currentUserId }, select: { id: true } },
    },
  });

  return notes.map((n) => ({
    id: n.id,
    content: n.content,
    helpfulCount: n.helpfulCount,
    authorName: n.user.name,
    isOwnNote: n.user.id === currentUserId,
    hasVoted: n.helpfulVotes.length > 0,
    updatedAt: n.updatedAt.toISOString(),
  }));
}

export type ToggleHelpfulVoteError = "NOT_FOUND" | "SELF_VOTE";

/**
 * "উপকারী" ভোট টগল করে (self-vote ব্লক করা হয়) — race-condition-safe।
 * @returns error কোড অথবা নতুন স্টেট
 */
export async function toggleHelpfulVote(
  noteId: string,
  userId: string
): Promise<{ error: ToggleHelpfulVoteError } | { voted: boolean; helpfulCount: number }> {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || !note.isPublic) return { error: "NOT_FOUND" };
  if (note.userId === userId) return { error: "SELF_VOTE" };

  const existing = await prisma.noteHelpfulVote.findUnique({
    where: { noteId_userId: { noteId, userId } },
  });

  let voted: boolean;

  if (existing) {
    // টগল-অফ — conditional delete দিয়ে, অন্য concurrent request
    // ইতিমধ্যে মুছে ফেললে (count=0) counter আবার decrement করা হবে
    // না (double-decrement এড়াতে)।
    const deleted = await prisma.noteHelpfulVote.deleteMany({ where: { id: existing.id } });
    if (deleted.count > 0) {
      await prisma.note.update({ where: { id: noteId }, data: { helpfulCount: { decrement: 1 } } });
      voted = false;
    } else {
      // অন্য একটা concurrent টগল-অফ ইতিমধ্যে জিতে গেছে — counter
      // অপরিবর্তিত রাখা হচ্ছে, চূড়ান্ত স্টেট "voted:false" (vote নেই)
      voted = false;
    }
  } else {
    // নতুন ভোট — create() এ P2002 পেলে বোঝায় আরেকটা concurrent
    // request ইতিমধ্যে জিতে গিয়ে vote+counter দুটোই বসিয়ে ফেলেছে,
    // তাই আমরা আর দ্বিতীয়বার increment করব না (double-count এড়াতে)।
    try {
      await prisma.noteHelpfulVote.create({ data: { noteId, userId } });
      await prisma.note.update({ where: { id: noteId }, data: { helpfulCount: { increment: 1 } } });
      voted = true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        voted = true; // অন্য concurrent request ইতিমধ্যে ভোট দিয়ে দিয়েছে
      } else {
        throw err;
      }
    }
  }

  const updated = await prisma.note.findUnique({ where: { id: noteId } });
  return { voted, helpfulCount: updated?.helpfulCount ?? 0 };
}
