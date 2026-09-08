// ===================================================================
// Live Study Presence — "এখন কে কে পড়ছে" (Live Study Leaderboard)
// -------------------------------------------------------------------
// ব্যবহারকারীর অনুরোধ: "Keda kotokkon porbe leaderboard thakbe. Ahon ke
// ke porte ase ke kotokhon porce daily wekly lederboard thakbe. Dakhaibe
// je ahon ke ke porte ase ar di na pore taile dakhaibe ke kotokhon
// porce ajke।"
//
// ডিজাইন সিদ্ধান্ত: কোনো ভারী নতুন session-tracking মডেল না বানিয়ে
// established `User.currentActivityAt`/`currentActivityType` (একটা
// lightweight heartbeat timestamp, day-level `lastActiveAt` streak
// থেকে আলাদা) ব্যবহার করা হয়েছে। যেকোনো পড়াশোনা activity (Practice/
// CQ/Flashcard Review/Pomodoro/Reading Room/Mock Exam) submit/শুরু
// হওয়ার সময় markUserActive() কল হয়, এবং LIVE_PRESENCE_STALE_SEC
// (২ মিনিট) এর মধ্যে আপডেট থাকলে "এখন পড়ছে" (লাইভ) গণ্য হয় — কোনো
// cron/cleanup job ছাড়াই read-time এ query তে স্বয়ংক্রিয়ভাবে stale
// বাদ পড়ে (established Reading Room এর staleAfter দর্শনের সাথে সামঞ্জস্যপূর্ণ)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import type { LiveActivityType } from "@prisma/client";

// এই সময়ের মধ্যে heartbeat আপডেট হলে "এখন পড়ছে" (লাইভ) গণ্য —
// established Reading Room এর STALE_AFTER_SEC (৯০s) এর কাছাকাছি কিন্তু
// একটু বেশি grace period (Practice/CQ/Flashcard এ established ঘন ঘন
// heartbeat mechanism নেই, প্রতিটা প্রশ্নের answer submit এ
// markUserActive() কল হয়, যা কয়েক সেকেন্ড ব্যবধানে হতে পারে)।
export const LIVE_PRESENCE_STALE_SEC = 120;

export const LIVE_ACTIVITY_LABELS: Record<LiveActivityType, string> = {
  PRACTICE: "Practice",
  CQ: "CQ Practice",
  FLASHCARD: "Flashcards",
  POMODORO: "Pomodoro",
  READING_ROOM: "Reading Room",
  MOCK_EXAM: "Mock Exam",
};

/**
 * ইউজারের "এখন পড়ছে" স্ট্যাটাস আপডেট করে (heartbeat)। কোনো নতুন রো
 * তৈরি হয় না — শুধু established `User` রো এর ২টা কলাম আপডেট হয়
 * (lightweight, প্রতিটা quiz submit/pomodoro tick এ কল করা নিরাপদ)।
 * সাইলেন্টলি fail হলেও (যেমন race condition এ ইউজার ডিলিট হয়ে গেলে)
 * মূল request flow ব্যাহত না হয় তার জন্য caller `.catch()` দিয়ে ধরবে
 * বলে আশা করা হয় (নন-critical side-effect, awardXp/updateStreak এর
 * established fire-and-forget প্যাটার্নের মতোই)।
 */
export async function markUserActive(
  userId: string,
  activityType: LiveActivityType
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentActivityAt: new Date(),
      currentActivityType: activityType,
    },
  });
}

export interface LiveStatusInfo {
  isLive: boolean;
  currentActivityType: LiveActivityType | null;
  liveSinceSec: number | null;
}

/**
 * একাধিক ইউজারের জন্য একবারে লাইভ স্ট্যাটাস বের করে (N+1 query এড়াতে) —
 * leaderboard এর মতো bulk-listing এ ব্যবহারের জন্য।
 */
export async function getLiveStatusMap(
  userIds: string[]
): Promise<Map<string, LiveStatusInfo>> {
  if (userIds.length === 0) return new Map();

  const now = new Date();
  const staleThreshold = new Date(now.getTime() - LIVE_PRESENCE_STALE_SEC * 1000);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, currentActivityAt: { gte: staleThreshold } },
    select: { id: true, currentActivityAt: true, currentActivityType: true },
  });

  const map = new Map<string, LiveStatusInfo>();
  for (const u of users) {
    map.set(u.id, {
      isLive: true,
      currentActivityType: u.currentActivityType,
      liveSinceSec: u.currentActivityAt
        ? Math.max(0, Math.round((now.getTime() - u.currentActivityAt.getTime()) / 1000))
        : null,
    });
  }
  return map;
}

/** বর্তমানে প্ল্যাটফর্ম-ব্যাপী মোট কতজন লাইভ পড়ছে (Leaderboard হেডার ব্যাজে দেখানোর জন্য) */
export async function getLiveStudyingCount(): Promise<number> {
  const staleThreshold = new Date(Date.now() - LIVE_PRESENCE_STALE_SEC * 1000);
  return prisma.user.count({ where: { currentActivityAt: { gte: staleThreshold } } });
}
