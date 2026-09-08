// ===================================================================
// Daily Streak Tracking Logic (Duolingo-স্টাইল) + Streak Freeze
// -------------------------------------------------------------------
// ইউজার যেদিন প্রথমবার কোনো একটিভিটি করে (learning/practice/flashcard/
// task/pomodoro) সেদিন এই ফাংশন কল করে স্ট্রিক আপডেট করা হয়:
// - গতকাল একটিভ ছিল → স্ট্রিক +1 (ধারাবাহিকতা বজায় আছে)
// - আজই প্রথম একটিভিটি এবং আগে কখনো একটিভ হয়নি → স্ট্রিক 1 থেকে শুরু
// - ঠিক ১ দিন ফাঁক পড়েছে ও Streak Freeze মজুদ আছে → ফ্রিজ ব্যবহার করে
//   স্ট্রিক বাঁচানো হয় (Duolingo-স্টাইল loss-aversion mechanic)
// - ১ দিনের বেশি ফাঁক পড়েছে বা ফ্রিজ নেই → স্ট্রিক রিসেট হয়ে 1 হবে
// - আজ ইতিমধ্যে একবার আপডেট হয়ে থাকলে → কিছু পরিবর্তন হবে না (দিনে একবারই গণনা)
//
// Streak Freeze Refill: প্রতি সপ্তাহে (৭ দিন পরপর) সর্বোচ্চ ২টা ফ্রিজ পর্যন্ত
// auto-refill হয় (একবারে সবগুলো ভেঙে ফেললেও পরের সপ্তাহে আবার পাওয়া যায়)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const MAX_STREAK_FREEZES = 2;
const FREEZE_REFILL_INTERVAL_DAYS = 7;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysBetween(a: Date, b: Date): number {
  const startOfA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const startOfB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((startOfB.getTime() - startOfA.getTime()) / (1000 * 60 * 60 * 24));
}

export interface StreakTransition {
  streakCount: number;
  freezesRemaining: number;
  isNewDay: boolean;
  usedFreeze: boolean;
}

/** Pure streak transition used by both the database flow and unit tests. */
export function calculateStreakTransition(
  lastActiveAt: Date | null,
  currentStreak: number,
  currentFreezes: number,
  now: Date = new Date()
): StreakTransition {
  const freezes = Math.max(0, Math.min(MAX_STREAK_FREEZES, currentFreezes));
  if (lastActiveAt && isSameDay(lastActiveAt, now)) {
    return {
      streakCount: Math.max(0, currentStreak),
      freezesRemaining: freezes,
      isNewDay: false,
      usedFreeze: false,
    };
  }

  const gapDays = lastActiveAt ? daysBetween(lastActiveAt, now) : null;
  if (gapDays === 1) {
    return {
      streakCount: Math.max(0, currentStreak) + 1,
      freezesRemaining: freezes,
      isNewDay: true,
      usedFreeze: false,
    };
  }
  if (gapDays === 2 && freezes > 0) {
    return {
      streakCount: Math.max(0, currentStreak) + 1,
      freezesRemaining: freezes - 1,
      isNewDay: true,
      usedFreeze: true,
    };
  }
  return {
    streakCount: 1,
    freezesRemaining: freezes,
    isNewDay: true,
    usedFreeze: false,
  };
}

/**
 * সপ্তাহ পার হয়ে থাকলে Streak Freeze auto-refill করে (max ২টা পর্যন্ত)।
 * এটা মিউটেট করা user object রিটার্ন করে (caller এ fresh ডেটা দরকার হলে)।
 */
async function refillFreezeIfDue(userId: string, lastFreezeRefillAt: Date, currentFreezes: number) {
  const now = new Date();
  const daysSinceRefill = daysBetween(lastFreezeRefillAt, now);
  if (daysSinceRefill < FREEZE_REFILL_INTERVAL_DAYS) return currentFreezes;

  const newCount = Math.min(MAX_STREAK_FREEZES, currentFreezes + 1);
  await prisma.user.update({
    where: { id: userId },
    data: { streakFreezes: newCount, lastFreezeRefillAt: now },
  });
  return newCount;
}

/**
 * ইউজারের streak আপডেট করে (দিনে একবার effective হয়)। Streak Freeze
 * থাকলে ১ দিনের ফাঁক স্বয়ংক্রিয়ভাবে বাঁচিয়ে দেয়।
 * @returns আপডেটেড streakCount, আজ প্রথমবার আপডেট হয়েছে কিনা, এবং freeze
 * ব্যবহৃত হয়েছে কিনা
 */
export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const now = new Date();

  if (user.lastActiveAt && isSameDay(user.lastActiveAt, now)) {
    return { streakCount: user.streakCount, isNewDay: false, usedFreeze: false };
  }

  const currentFreezes = await refillFreezeIfDue(
    userId,
    user.lastFreezeRefillAt,
    user.streakFreezes
  );
  const transition = calculateStreakTransition(
    user.lastActiveAt,
    user.streakCount,
    currentFreezes,
    now
  );
  const newStreak = transition.streakCount;
  const newFreezeCount = transition.freezesRemaining;
  const usedFreeze = transition.usedFreeze;
  const newLongest = Math.max(newStreak, user.longestStreak);

  await prisma.user.update({
    where: { id: userId },
    data: {
      streakCount: newStreak,
      longestStreak: newLongest,
      lastActiveAt: now,
      streakFreezes: newFreezeCount,
    },
  });

  if (usedFreeze) {
    await createNotification({
      userId,
      title: "🧊 Streak Freeze ব্যবহৃত হয়েছে",
      body: `গতকাল পড়াশোনা মিস হয়েছিল, কিন্তু Streak Freeze তোমার ${newStreak} দিনের স্ট্রিক বাঁচিয়ে দিয়েছে!`,
      link: "/dashboard",
    });
  }

  return { streakCount: newStreak, isNewDay: true, usedFreeze };
}
