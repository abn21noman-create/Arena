// ===================================================================
// Forum Vote (Upvote/Downvote) — race-condition-safe atomic apply
// -------------------------------------------------------------------
// 🐛 বাগ ফিক্স (XP/Capacity race condition অডিট সিরিজের ধারাবাহিকতায়
// আবিষ্কৃত): আগে `app/api/forum/posts/[postId]/vote` ও
// `app/api/forum/replies/[replyId]/vote` উভয় endpoint এ একই
// read-then-write প্যাটার্ন ছিল —
//   const existing = await prisma.forumVote.findUnique(...)
//   if (existing) update/delete; else create();
// দুইজন (বা একজনের ডাবল-ট্যাপ/মাল্টি-ট্যাব) concurrent একই পোস্টে প্রথমবার
// ভোট দিলে দুটো request-ই `existing === null` দেখে, দুটোই `create()` কল
// করে — `ForumVote` এর `@@unique([userId, postId])` constraint এর কারণে
// দ্বিতীয়টা Prisma P2002 (Unique constraint failed) throw করে, যা কোথাও
// catch হয়নি — ফলে unhandled ৫০০ Internal Server Error।
//
// লাইভ টেস্টে ৫টা concurrent প্রথম-ভোট রিকোয়েস্টে ৪টা crash করে ৫০০
// রিটার্ন করেছে (প্রমাণ হিসেবে) — এটা বিশেষভাবে বিপজ্জনক কারণ মোবাইলে
// দ্রুত ডাবল-ট্যাপ বা slow network এ browser এর automatic retry দিয়ে
// সহজেই ট্রিগার হতে পারতো, এবং ইউজার একটা crash/error toast দেখতো
// একটা সাধারণ ভোট বাটনে ক্লিক করে।
//
// প্রথম ফিক্স চেষ্টা (retry-on-P2002-conflict লুপ, সর্বোচ্চ ৩ বার) লাইভ
// টেস্টে যথেষ্ট প্রমাণিত হয়নি — ৫টা concurrent request এ worst-case
// thundering-herd এ ৩ বারের বেশি retry দরকার হচ্ছিল। তাই চূড়ান্ত ফিক্সে
// Prisma `upsert()` ব্যবহার করা হয়েছে, যা Postgres এ single
// `INSERT ... ON CONFLICT (userId, postId) DO UPDATE` স্টেটমেন্টে
// কম্পাইল হয় — সম্পূর্ণ DB-level atomic, কোনো retry loop/race window
// লাগে না create-vs-create conflict এ। Toggle-off (একই ভোট আবার দিলে
// মুছে ফেলা) এর জন্য conditional `deleteMany({ where: { id, value } })`
// ব্যবহার করা হয়েছে (id+value দুটোই ম্যাচ করলেই মুছবে — অন্য একটা
// concurrent request ইতিমধ্যে মুছে ফেললে বা value বদলে ফেললে ০ row
// affected হবে, কোনো error/crash ছাড়াই)।
// ===================================================================
import { prisma } from "@/lib/prisma";

interface VoteTarget {
  userId: string;
  postId?: string;
  replyId?: string;
  value: 1 | -1;
}

/**
 * নির্দিষ্ট পোস্ট/রিপ্লাইতে ভোট প্রয়োগ করে (একই ভোট আবার দিলে toggle
 * করে মুছে ফেলে, ভিন্ন ভোট দিলে আপডেট করে, নতুন হলে তৈরি করে) —
 * সম্পূর্ণ race-condition-safe (DB-level atomic upsert), কোনো
 * অবস্থাতেই unique-constraint crash/৫০০ error দেয় না।
 */
export async function applyForumVote({ userId, postId, replyId, value }: VoteTarget): Promise<void> {
  const whereUnique = postId
    ? { userId_postId: { userId, postId } }
    : { userId_replyId: { userId, replyId: replyId! } };

  const existing = await prisma.forumVote.findUnique({ where: whereUnique });

  if (existing && existing.value === value) {
    // একই ভোট আবার দিলে টগল করে মুছে ফেলা হচ্ছে — conditional delete
    // (id+value দুটোই ম্যাচ করলেই মুছবে, race হলে নিরাপদ no-op)
    await prisma.forumVote.deleteMany({ where: { id: existing.id, value } });
    return;
  }

  // নতুন ভোট বা ভিন্ন ভোটে পরিবর্তন — উভয় ক্ষেত্রেই একটাই atomic upsert
  // যথেষ্ট (DB-level ON CONFLICT DO UPDATE, কোনো race window নেই)
  await prisma.forumVote.upsert({
    where: whereUnique,
    create: { userId, postId, replyId, value },
    update: { value },
  });
}

/** নির্দিষ্ট পোস্টের বর্তমান মোট voteScore হিসাব করে */
export async function getPostVoteScore(postId: string): Promise<number> {
  const votes = await prisma.forumVote.findMany({ where: { postId }, select: { value: true } });
  return votes.reduce((sum, v) => sum + v.value, 0);
}

/** নির্দিষ্ট রিপ্লাইয়ের বর্তমান মোট voteScore হিসাব করে */
export async function getReplyVoteScore(replyId: string): Promise<number> {
  const votes = await prisma.forumVote.findMany({ where: { replyId }, select: { value: true } });
  return votes.reduce((sum, v) => sum + v.value, 0);
}
