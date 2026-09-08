// ===================================================================
// একটা Reply কে "সেরা উত্তর" হিসেবে মার্ক করা (শুধু পোস্টের মালিক পারবে)
// PATCH /api/forum/replies/[replyId]/best-answer
// ===================================================================
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { awardXp } from "@/lib/league";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "লগইন করা নেই" }, { status: 401 });
  }

  const { replyId } = await params;
  const reply = await prisma.forumReply.findUnique({
    where: { id: replyId },
    include: { post: true },
  });

  if (!reply) {
    return NextResponse.json({ error: "রিপ্লাই পাওয়া যায়নি" }, { status: 404 });
  }
  if (reply.post.userId !== session.user.id) {
    return NextResponse.json(
      { error: "শুধু পোস্টের মালিক সেরা উত্তর নির্বাচন করতে পারবে" },
      { status: 403 }
    );
  }

  // 🐛 বাগ ফিক্স (XP-Double-Award প্যাটার্ন অডিটে আবিষ্কৃত, লাইভ টেস্টে
  // নিশ্চিত): আগে এই এন্ডপয়েন্ট কোনো idempotency check ছাড়াই প্রতিবার
  // awardXp() কল করত। প্রথমে শুধু `isBestAnswer=false` চেক দিয়ে ফিক্স
  // করার চেষ্টা করা হয়েছিল, কিন্তু সেটা যথেষ্ট ছিল না — কারণ
  // **toggle-cycling** এখনো সম্ভব: Reply A -> mark (isBestAnswer=true,
  // +10 XP), Reply B -> mark (A এর isBestAnswer স্বাভাবিকভাবেই false
  // হয়ে যায়, এটা বৈধ আচরণ), আবার Reply A -> mark করলে সেটা
  // "isBestAnswer=false থেকে নতুন selection" হিসেবে সম্পূর্ণ বৈধ দেখায়
  // এবং আবার XP দিয়ে দেয় — লাইভ টেস্টে এই cycling প্যাটার্নে ৪ বার
  // মার্ক করিয়ে ৪৫ XP পাওয়া গেছে (প্রত্যাশিত ১৫)। তাই `isBestAnswer`
  // (যেটা normal reselection এ legitimately toggle হয়) থেকে সম্পূর্ণ
  // স্বাধীন একটা স্থায়ী `bestAnswerXpAwarded` ফ্ল্যাগ যোগ করা হয়েছে
  // (migration `20260719000000_add_forum_best_answer_xp_awarded`,
  // Task/StudyPlanItem/TopicProgress এর একই established প্যাটার্ন) —
  // এই reply এর জন্য owner **কখনো** best-answer XP নিয়ে থাকলে, ভবিষ্যতে
  // যতবারই isBestAnswer টগল হোক না কেন, আর কখনো XP দেওয়া হবে না।
  //
  // Race condition এড়াতে atomic `UPDATE ... WHERE id=? AND
  // bestAnswerXpAwarded=false` ব্যবহার করা হয়েছে (single statement এ
  // check+set, Postgres row-level lock guarantee দেয়) — আলাদা
  // read-then-write করলে TOCTOU race condition থেকে যেত (Study Group
  // Weekly Bonus Race Condition বাগের একই ঝুঁকি)।
  const xpAwardResult = await prisma.forumReply.updateMany({
    where: { id: replyId, bestAnswerXpAwarded: false },
    data: { bestAnswerXpAwarded: true },
  });
  const shouldAwardXp = xpAwardResult.count > 0;

  // isBestAnswer ফ্ল্যাগ toggle করা (normal reselection এ প্রতিবারই
  // আপডেট হওয়া উচিত — এটা শুধু "বর্তমানে কোনটা সেরা উত্তর" দেখানোর জন্য,
  // XP-এর সাথে সরাসরি সম্পর্কিত না)
  await prisma.$transaction([
    prisma.forumReply.updateMany({
      where: { postId: reply.postId },
      data: { isBestAnswer: false },
    }),
    prisma.forumReply.update({
      where: { id: replyId },
      data: { isBestAnswer: true },
    }),
  ]);

  // শুধু প্রথমবার (এই reply এর জীবনচক্রে) XP দেওয়া হয়
  if (shouldAwardXp) {
    await awardXp(reply.userId, 10);
  }
  await prisma.forumPost.update({
    where: { id: reply.postId },
    data: { isResolved: true },
  });

  // যিনি সেরা উত্তর পেলেন তাকে নোটিফাই করা হচ্ছে — XP আগেই নিয়ে থাকলে
  // (shouldAwardXp=false, re-selection) মেসেজে XP উল্লেখ না করে শুধু
  // সেরা উত্তর নির্বাচনের কথা জানানো হয় (misleading এড়াতে)
  await createNotification({
    userId: reply.userId,
    title: "🎉 তোমার উত্তর সেরা উত্তর নির্বাচিত হয়েছে!",
    body: shouldAwardXp
      ? "+10 XP বোনাস পেয়েছো। তোমার সাহায্যের জন্য ধন্যবাদ!"
      : "তোমার সাহায্যের জন্য ধন্যবাদ!",
    link: `/forum/${reply.postId}`,
  });

  return NextResponse.json({ success: true });
}
