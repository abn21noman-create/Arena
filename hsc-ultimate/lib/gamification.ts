// ===================================================================
// Gamification Core Logic — Level হিসাব ও Badge Award System
// -------------------------------------------------------------------
// XP থেকে Level ক্যালকুলেট করা (Duolingo-স্টাইল ক্রমবর্ধমান difficulty)
// এবং বিভিন্ন মাইলস্টোনে badge award করার লজিক এখানে কেন্দ্রীভূত রাখা হয়েছে।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

/**
 * XP থেকে Level হিসাব করে। প্রতিটা পরবর্তী লেভেলে আগেরটার চেয়ে বেশি XP লাগে
 * (level² × 50 ফর্মুলা — লেভেল যত বাড়বে, পরের লেভেলে যেতে তত বেশি XP লাগবে)
 */
export function calculateLevel(xp: number): number {
  // 🛡️ ডিফেন্সিভ গার্ড (pure-logic harness এ আবিষ্কৃত): নিচের `while`
  // লুপের শর্ত `xpRequiredForLevel(level+1) <= xp` — xp যদি `Infinity`
  // বা `NaN` হয় তাহলে এটা কখনো false হয় না (Infinity এ চিরকাল true,
  // NaN এ তুলনা সবসময় false হলেও `NaN <= NaN` false হওয়ায় লুপ থামে,
  // কিন্তু Infinity এ **অসীম লুপ** — পুরো Node.js প্রসেস হ্যাং করে)।
  //
  // বাস্তবে এটা বর্তমানে পৌঁছানো যায় না: সব কল সাইট `user.xp` পাঠায়
  // যা Prisma/Postgres এ `Int` (সর্বোচ্চ ২,১৪৭,৪৮৩,৬৪৭) — Infinity/NaN
  // সংরক্ষণ করাই অসম্ভব, আর Int সর্বোচ্চ মানেও লুপ ১ms এ শেষ হয়
  // (৬,৫৫৪ iteration)। তবু গার্ডটা রাখা হলো কারণ একটা অসীম লুপের
  // ক্ষতি (সার্ভার হ্যাং) এর তুলনায় একটা `isFinite` চেকের খরচ শূন্য,
  // এবং ভবিষ্যতে কোনো কল সাইট গণনা-করা মান পাঠালে (যেমন গড়/ভাগফল,
  // যেখানে 0/0 = NaN সহজেই হতে পারে) এটাই একমাত্র রক্ষাকবচ।
  if (!Number.isFinite(xp) || xp <= 0) return 1;

  let level = 1;
  while (xpRequiredForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

/** একটা নির্দিষ্ট লেভেলে পৌঁছাতে মোট কত XP লাগে */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * (level - 1) * 50;
}

/** বর্তমান লেভেল থেকে পরের লেভেলে যেতে আর কত XP লাগবে তার তথ্য */
export function getLevelProgress(xp: number) {
  const level = calculateLevel(xp);
  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const progressInLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

  // 🛡️ progressPct সরাসরি UI তে progress-bar এর width হিসেবে যায়
  // (Dashboard, Public Profile, Analytics)। উপরের ভাগফল অস্বাভাবিক
  // ইনপুটে NaN/Infinity/ঋণাত্মক হতে পারত — যেমন xp ঋণাত্মক হলে
  // `-10%`, যা CSS এ ভাঙা bar রেন্ডার করত। ০-১০০ এ ক্ল্যাম্প করে
  // এবং non-finite হলে ০ ধরে UI সবসময় বৈধ রাখা হচ্ছে।
  const rawPct = Math.round((progressInLevel / xpNeededForNextLevel) * 100);
  const progressPct = Number.isFinite(rawPct)
    ? Math.min(100, Math.max(0, rawPct))
    : 0;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressInLevel,
    xpNeededForNextLevel,
    progressPct,
  };
}

/**
 * ইউজারের বিভিন্ন স্ট্যাটস চেক করে যোগ্য badge গুলো award করে।
 * এটা idempotent — আগে থেকে পাওয়া badge আবার দেওয়া হবে না (DB constraint এ handled)।
 * @returns নতুন করে যেসব badge পাওয়া গেছে তাদের লিস্ট
 */
export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const [
    masteredTopicsCount,
    quizAttemptsCount,
    allAttempts,
    flashcardReviewCount,
    completedTasksCount,
    completedPomodoroCount,
    existingUserBadges,
  ] = await Promise.all([
    prisma.topicProgress.count({ where: { userId, status: "MASTERED" } }),
    prisma.quizAttempt.count({ where: { userId } }),
    // Prisma তে column-to-column compare (score === totalMarks) সরাসরি সমর্থন করে না,
    // তাই সব attempt এনে জাভাস্ক্রিপ্টে ফিল্টার করা হচ্ছে
    prisma.quizAttempt.findMany({
      where: { userId },
      select: { score: true, totalMarks: true },
    }),
    prisma.flashcard.count({
      where: { deck: { userId }, lastReviewed: { not: null } },
    }),
    prisma.task.count({ where: { userId, status: "DONE" } }),
    prisma.studySession.count({
      where: { userId, type: "POMODORO", durationSec: { gte: 1500 } },
    }),
    prisma.userBadge.findMany({ where: { userId }, select: { badge: { select: { code: true } } } }),
  ]);

  const actualPerfectScoreCount = allAttempts.filter(
    (a) => a.totalMarks > 0 && a.score === a.totalMarks
  ).length;

  const earnedCodes = new Set(existingUserBadges.map((ub) => ub.badge.code));
  const level = calculateLevel(user.xp);

  const eligibleCodes: string[] = [];

  if (!earnedCodes.has("FIRST_STEP")) eligibleCodes.push("FIRST_STEP");
  if (user.streakCount >= 3 && !earnedCodes.has("STREAK_3")) eligibleCodes.push("STREAK_3");
  if (user.streakCount >= 7 && !earnedCodes.has("STREAK_7")) eligibleCodes.push("STREAK_7");
  if (user.streakCount >= 30 && !earnedCodes.has("STREAK_30")) eligibleCodes.push("STREAK_30");
  if (masteredTopicsCount >= 1 && !earnedCodes.has("FIRST_TOPIC_MASTERED"))
    eligibleCodes.push("FIRST_TOPIC_MASTERED");
  if (masteredTopicsCount >= 10 && !earnedCodes.has("TOPICS_MASTERED_10"))
    eligibleCodes.push("TOPICS_MASTERED_10");
  if (quizAttemptsCount >= 1 && !earnedCodes.has("FIRST_QUIZ")) eligibleCodes.push("FIRST_QUIZ");
  if (actualPerfectScoreCount >= 1 && !earnedCodes.has("PERFECT_SCORE"))
    eligibleCodes.push("PERFECT_SCORE");
  if (quizAttemptsCount >= 10 && !earnedCodes.has("QUIZ_MASTER_10"))
    eligibleCodes.push("QUIZ_MASTER_10");
  if (flashcardReviewCount >= 50 && !earnedCodes.has("FLASHCARD_50"))
    eligibleCodes.push("FLASHCARD_50");
  if (completedTasksCount >= 10 && !earnedCodes.has("TASK_MASTER_10"))
    eligibleCodes.push("TASK_MASTER_10");
  if (completedPomodoroCount >= 10 && !earnedCodes.has("POMODORO_10"))
    eligibleCodes.push("POMODORO_10");
  if (level >= 5 && !earnedCodes.has("LEVEL_5")) eligibleCodes.push("LEVEL_5");
  if (level >= 10 && !earnedCodes.has("LEVEL_10")) eligibleCodes.push("LEVEL_10");

  if (eligibleCodes.length === 0) return [];

  const badgesToAward = await prisma.badge.findMany({
    where: { code: { in: eligibleCodes } },
  });

  const newlyAwarded = [];
  for (const badge of badgesToAward) {
    try {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      newlyAwarded.push(badge);
      // toast তো frontend এ সাথে সাথে দেখানো হয়, কিন্তু persistent notification ও
      // রেখে দেওয়া হচ্ছে যাতে পরে Notification Bell এ গিয়েও দেখতে পারে
      await createNotification({
        userId,
        title: `${badge.iconEmoji} নতুন ব্যাজ অর্জিত: ${badge.name}!`,
        body: badge.description,
        link: "/badges",
      });
    } catch {
      // ইতিমধ্যে award করা থাকলে unique constraint error আসবে, সেটা ignore করা হচ্ছে
    }
  }

  return newlyAwarded;
}

/** ইউজারের level ফিল্ড DB তে সিঙ্ক করে রাখে (XP আপডেট হওয়ার পর কল করা উচিত) */
export async function syncUserLevel(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newLevel = calculateLevel(user.xp);
  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }
}

/**
 * 🛡️ সিংগুলারিটি সুরক্ষিত XP সিস্টেম (God-Mode Upgrade):
 * এটি নিশ্চিত করে যে একজন ইউজার একসাথে একাধিক রিকোয়েস্ট পাঠিয়ে ভুলভাবে XP নিতে পারবে না।
 * Atomic $transaction এবং Row-level locking ব্যবহার করা হয়েছে।
 */
export async function awardXp(userId: string, amount: number, reason: string = "ACTIVITY") {
  return await prisma.$transaction(async (tx) => {
    // ১. Row-level lock: ইউজার রেকর্ড লক করো যাতে সমান্তরাল অন্য কোনো রিকোয়েস্ট ডেটা ওভাররাইট করতে না পারে
    const user = await tx.$queryRaw<{ id: string, xp: number }[]>`
      SELECT id, xp FROM "users" WHERE id = ${userId} FOR UPDATE
    `;

    if (user.length === 0) throw new Error("ইউজার পাওয়া যায়নি");

    // ২. XP এবং সাপ্তাহিক XP একসাথে আপডেট
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { 
        xp: { increment: amount },
        weeklyXp: { increment: amount }
      }
    });

    // ৩. অডিট লগে এন্ট্রি (নিরাপত্তার জন্য)
    await tx.auditLog.create({
      data: {
        actorId: "SYSTEM",
        action: "XP_AWARDED",
        targetId: userId,
        metadata: { 
          amount, 
          reason, 
          previousXp: user[0].xp,
          newXp: updatedUser.xp 
        }
      }
    });

    return updatedUser;
  });
}
