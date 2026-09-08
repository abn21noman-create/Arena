// ===================================================================
// Habit Tracker — Core Logic
// -------------------------------------------------------------------
// MASTER_PLAN.md এর মূল ভিশনের একটা অসম্পূর্ণ আইটেম: "Habit Tracker
// (ডেইলি স্টাডি habit যেমন 'আজ ২ ঘন্টা পড়া')" — এই সেশনে বাস্তবায়ন।
//
// Deep Research (Streaks/Loop Habit Tracker/Habitica থেকে verify করা
// core pattern): কাস্টম habit ডিফাইন → প্রতিদিন এক-ক্লিকে টগল → streak
// গণনা → সাম্প্রতিক দিনগুলোর ভিজুয়াল history।
//
// ⚠️ lib/streak.ts (Daily Streak) থেকে ইচ্ছাকৃতভাবে সম্পূর্ণ আলাদা:
// - Daily Streak: platform-wide, "আজ কোনো একটা একটিভিটি করেছি কিনা",
//   Streak Freeze mechanic আছে, badge/XP এর সাথে যুক্ত
// - Habit Tracker: ইউজারের নিজের ডিফাইন করা কাস্টম habit (একাধিক হতে
//   পারে), প্রতিটার নিজস্ব আলাদা streak, কোনো freeze mechanic নেই
//   (সহজ রাখা হয়েছে), XP/badge এর সাথে যুক্ত না (নিরপেক্ষ ট্র্যাকিং টুল)
// ===================================================================
import { prisma } from "@/lib/prisma";

export const MAX_HABITS_PER_USER = 10; // অতিরিক্ত habit যোগ করলে UI জটিল হয়ে যায়
export const RECENT_HISTORY_DAYS = 7; // সাম্প্রতিক কত দিনের history দেখানো হবে
// established POST /api/habits এ ছিল (হার্ডকোডেড ১০০), কিন্তু PATCH
// /api/habits/[habitId] এ (rename করার সময়) এই লিমিট মিস হয়ে
// গিয়েছিল — broad-grep bug hunt এ আবিষ্কৃত, লাইভ টেস্টে ৫০০০ অক্ষরের
// নাম সরাসরি সেভ হয়ে যাওয়া প্রমাণিত। এখন দুই জায়গাতেই এই একটা
// শেয়ার্ড কনস্ট্যান্ট ব্যবহার করা হচ্ছে (single source of truth)।
export const MAX_HABIT_NAME_LENGTH = 100;

/** তারিখকে মধ্যরাতে normalize করে (সময় বাদ) — একই দিনে দুইবার লগ আটকাতে */
export function normalizeToDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysBetween(a: Date, b: Date): number {
  const startOfA = normalizeToDateOnly(a);
  const startOfB = normalizeToDateOnly(b);
  return Math.round((startOfB.getTime() - startOfA.getTime()) / (1000 * 60 * 60 * 24));
}

export interface HabitWithHistory {
  id: string;
  name: string;
  emoji: string;
  currentStreak: number;
  longestStreak: number;
  isArchived: boolean;
  loggedToday: boolean;
  // শেষ RECENT_HISTORY_DAYS দিনের লগ স্ট্যাটাস (আজ থেকে পুরনো দিকে)
  recentHistory: { date: string; logged: boolean }[];
}

/** ইউজারের সব (আর্কাইভ না করা) habit + সাম্প্রতিক history নিয়ে আসে */
export async function getUserHabits(userId: string): Promise<HabitWithHistory[]> {
  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    orderBy: { order: "asc" },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: RECENT_HISTORY_DAYS,
      },
    },
  });

  const today = normalizeToDateOnly(new Date());

  return habits.map((h) => {
    const loggedDates = new Set(h.logs.map((l) => normalizeToDateOnly(l.date).toISOString()));

    const recentHistory: { date: string; logged: boolean }[] = [];
    for (let i = RECENT_HISTORY_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      recentHistory.push({
        date: d.toISOString().slice(0, 10),
        logged: loggedDates.has(d.toISOString()),
      });
    }

    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      currentStreak: h.currentStreak,
      longestStreak: h.longestStreak,
      isArchived: h.isArchived,
      loggedToday: loggedDates.has(today.toISOString()),
      recentHistory,
    };
  });
}

/**
 * আজকের জন্য habit টগল করে (log না থাকলে যোগ করে + streak বাড়ায়,
 * থাকলে মুছে দেয় + streak কমায়/রিক্যালকুলেট করে)।
 * @returns আপডেটেড habit স্টেট (loggedToday, currentStreak, longestStreak)
 *
 * 🐛 বাগ ফিক্স (Forum Vote/Content Report/Peer Note Helpful Vote race
 * condition অডিট সিরিজের ধারাবাহিকতায় আবিষ্কৃত, একই ক্লাসের bug):
 * আগে এই ফাংশন `findUnique()` দিয়ে existing log চেক করে আলাদা
 * create/delete + `Habit.currentStreak` read-then-write আপডেট করত।
 * concurrent একই habit এ প্রথমবার টগল করলে দুটো request-ই
 * `existingLog === null` দেখে দুটোই `habitLog.create()` কল করে —
 * `HabitLog` এর `@@unique([habitId, date])` constraint এ দ্বিতীয়টা
 * Prisma P2002 crash করে ৫০০ Internal Server Error দিত (লাইভ টেস্টে
 * ৫টা concurrent রিকোয়েস্টে ৪টা crash প্রমাণিত, ForumVote/ContentReport/
 * NoteHelpfulVote বাগের সাথে হুবহু একই স্বাক্ষর)। এছাড়া
 * `Habit.currentStreak` ফিল্ডে stale-read থেকে independent write করায়
 * (Study Group capacity bug এর মতোই) একাধিক concurrent non-conflicting
 * toggle (ভিন্ন ভিন্ন habit) কোনো সমস্যা না করলেও, স্ট্রিক গণনা
 * নিজেই read-then-write race এর ঝুঁকিতে ছিল।
 *
 * ফিক্স: Study Group capacity fix এর established প্যাটার্ন অনুসরণ করে
 * Postgres `SELECT ... FOR UPDATE` দিয়ে `habit` row-কে transaction এর
 * ভেতরে lock করা হয় — একই habit এ concurrent toggle request গুলো
 * serialize হয়ে যায় (একটার পরে আরেকটা প্রসেস হয়, একসাথে না), তাই
 * `existingLog` চেক ও `HabitLog` create/delete + `Habit.currentStreak`
 * আপডেট সবকিছু atomic ভাবে ঘটে — কোনো P2002 crash বা streak
 * miscalculation সম্ভব না।
 */
export async function toggleHabitToday(habitId: string, userId: string) {
  const habitCheck = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habitCheck || habitCheck.userId !== userId) {
    return null;
  }

  const today = normalizeToDateOnly(new Date());

  return prisma.$transaction(
    async (tx) => {
      // habit row lock করা হচ্ছে — এই transaction শেষ না হওয়া পর্যন্ত
      // অন্য কোনো concurrent toggle এই একই habit এর জন্য এগোতে পারবে না
      const locked = await tx.$queryRaw<
        { id: string; userId: string; currentStreak: number; longestStreak: number; lastLoggedAt: Date | null }[]
      >`
      SELECT id, "userId", "currentStreak", "longestStreak", "lastLoggedAt"
      FROM "habits"
      WHERE id = ${habitId}
      FOR UPDATE
    `;
      const habit = locked[0];
      if (!habit || habit.userId !== userId) return null;

      const existingLog = await tx.habitLog.findUnique({
        where: { habitId_date: { habitId, date: today } },
      });

      if (existingLog) {
        // আনডু — আজকের লগ মুছে দেওয়া হচ্ছে (ভুল করে ক্লিক করলে ফিরিয়ে নেওয়া যায়)
        await tx.habitLog.delete({ where: { id: existingLog.id } });

        // Streak রিক্যালকুলেট: yesterday এর log থাকলে সেই পর্যন্ত streak
        // বজায় থাকবে, নাহলে 0 তে নেমে যাবে (simple approach — recompute
        // from scratch avoided for performance, শুধু gap check যথেষ্ট)
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yesterdayLog = await tx.habitLog.findUnique({
          where: { habitId_date: { habitId, date: yesterday } },
        });

        // যদি আজকেই streak শুরু হয়েছিল (gap ছিল না, currentStreak এই লগের
        // কারণেই বেড়েছিল), তাহলে ১ কমিয়ে দেওয়া — নাহলে অপরিবর্তিত রাখা
        // (এটা conservative approach, edge case এ সামান্য imprecise হতে
        // পারে কিন্তু সাধারণ ব্যবহারে সঠিক আচরণ করে)
        const newStreak = yesterdayLog ? Math.max(0, habit.currentStreak - 1) : 0;

        const updated = await tx.habit.update({
          where: { id: habitId },
          data: {
            currentStreak: newStreak,
            lastLoggedAt: yesterdayLog ? yesterday : null,
          },
        });

        return { loggedToday: false, currentStreak: updated.currentStreak, longestStreak: updated.longestStreak };
      }

      // নতুন লগ যোগ করা হচ্ছে
      await tx.habitLog.create({ data: { habitId, date: today } });

      const gapDays = habit.lastLoggedAt ? daysBetween(habit.lastLoggedAt, today) : null;
      let newStreak: number;
      if (gapDays === 1) {
        // ঠিক গতকাল লগ ছিল — ধারাবাহিকতা বজায় আছে
        newStreak = habit.currentStreak + 1;
      } else if (gapDays === 0) {
        // একই দিনে (theoretically unreachable কারণ existingLog check হয়ে গেছে,
        // কিন্তু defensive fallback)
        newStreak = habit.currentStreak;
      } else {
        // ফাঁক আছে বা প্রথমবার — নতুন করে শুরু
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, habit.longestStreak);

      const updated = await tx.habit.update({
        where: { id: habitId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastLoggedAt: today,
        },
      });

      return { loggedToday: true, currentStreak: updated.currentStreak, longestStreak: updated.longestStreak };
    },
    // ডিফল্ট maxWait/timeout (৫ সেকেন্ড) dev sandbox এর ছোট connection
    // pool এ (established সীমাবদ্ধতা, মাত্র ৩টা connection) একাধিক
    // concurrent transaction serialize হওয়ার সময় যথেষ্ট না হতে পারে —
    // Study Group/Quiz Battle capacity fix এর মতোই row-lock serialize
    // হওয়া transaction এর জন্য বাড়ানো হলো (production এ larger pool এ
    // এই মান আরও বেশি conservative/নিরাপদ)
    { maxWait: 10000, timeout: 10000 }
  );
}


