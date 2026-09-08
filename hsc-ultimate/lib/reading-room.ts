// ===================================================================
// Reading Room (Virtual Study Room / Body Doubling) Core Logic
// -------------------------------------------------------------------
// docs/RESEARCH_UI_UX_READING_ROOM.md এ বিস্তারিত research আছে। ডিজাইন
// সংক্ষেপে: camera/video/audio call ছাড়া টেক্সট+প্রেজেন্স-ভিত্তিক
// "body doubling" রুম — readingroombd.com এর "বর্তমানে কে কী করছেন"
// থেকে অনুপ্রাণিত, কিন্তু privacy-aware (শুধু লগইন করা ইউজাররাই দেখতে
// পারবে, পুরো প্ল্যাটফর্ম-ব্যাপী পাবলিক লিস্ট না — নিজে দেখতে ও অংশ
// নিতে লগইন লাগবে)।
//
// Presence মডেল: polling-based heartbeat (Quiz Battle/Duel এ প্রমাণিত
// প্যাটার্ন)। ক্লায়েন্ট প্রতি HEARTBEAT_INTERVAL_SEC সেকেন্ডে
// heartbeat পাঠায়, সার্ভার lastHeartbeatAt আপডেট করে এবং সেই gap এর
// জন্য totalFocusSec এ credit যোগ করে (কিন্তু সর্বোচ্চ
// MAX_CREDIT_PER_HEARTBEAT_SEC পর্যন্ত — ট্যাব খুলে রেখে চলে গেলে
// gaming ঠেকানোর জন্য, readingroombd.com এর "অতিরিক্ত সময় বাদ দিন"
// ফিচার থেকে শেখা শিক্ষা)। STALE_AFTER_SEC এর বেশি সময় heartbeat না
// এলে সেই সেশন প্রেজেন্স লিস্ট থেকে বাদ পড়ে (client গণনায়) এবং পরের
// heartbeat/join এ auto-end হয়ে যায়।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { awardXp } from "@/lib/league";
import { updateStreak } from "@/lib/streak";
import { LIVE_PRESENCE_STALE_SEC, getLiveStatusMap, markUserActive } from "@/lib/live-activity";
import type { ReadingRoomActivity, ReadingRoomTheme, LiveActivityType } from "@prisma/client";

export const HEARTBEAT_INTERVAL_SEC = 25; // ক্লায়েন্ট এই ইন্টারভালে heartbeat পাঠাবে
export const MAX_CREDIT_PER_HEARTBEAT_SEC = 45; // heartbeat gap এর বেশি হলে এর বেশি credit না (২০ সেকেন্ড grace)
export const STALE_AFTER_SEC = 90; // এর বেশি সময় heartbeat না এলে "অফলাইন" গণ্য (৩.৬x heartbeat interval)
export const MAX_SESSION_DURATION_SEC = 4 * 60 * 60; // ৪ ঘণ্টা পার হলে সার্ভার নিজে থেকেই সেশন auto-end করে
export const XP_PER_FOCUS_SEC = 1 / 100; // প্রতি ১০০ সেকেন্ড ফোকাসে ১ XP (বিদ্যমান Pomodoro XP rate এর সাথে সামঞ্জস্যপূর্ণ)
export const GOAL_MAX_LENGTH = 100;

export interface RoomThemeInfo {
  id: ReadingRoomTheme;
  name: string;
  emoji: string;
  description: string;
  ambientSound: "rain" | "cafe" | "fireplace" | "wind" | null;
  gradient: string; // Tailwind gradient class (dashboard কার্ডের প্যাটার্ন অনুসরণ করে)
}

// প্রি-সেট থিমড রুম — readingroombd.com এর multi-theme ধারণা +
// StudyClock/Prodpod এর ambient room কনসেপ্ট থেকে অনুপ্রাণিত
export const READING_ROOM_THEMES: RoomThemeInfo[] = [
  {
    id: "LOFI_CAFE",
    name: "Lo-fi ক্যাফে",
    emoji: "🎧",
    description: "হালকা লো-ফাই মিউজিকের মতো নিরিবিলি পরিবেশ, ক্যাফের নিচু গুঞ্জন",
    ambientSound: "cafe",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "DARK_ACADEMIA",
    name: "ডার্ক একাডেমিয়া লাইব্রেরি",
    emoji: "🕯️",
    description: "পুরনো বইয়ের গন্ধমাখা রহস্যময় লাইব্রেরি, ফায়ারপ্লেসের মৃদু শব্দ",
    ambientSound: "fireplace",
    gradient: "from-stone-600 to-neutral-800",
  },
  {
    id: "COZY_LIBRARY",
    name: "কোজি লাইব্রেরি কর্নার",
    emoji: "📚",
    description: "আরামদায়ক পাঠকক্ষ, সম্পূর্ণ নীরব ও প্রশান্ত",
    ambientSound: null,
    gradient: "from-violet-500 to-fuchsia-600",
  },
  {
    id: "RAINY_WINDOW",
    name: "বৃষ্টিভেজা জানালা",
    emoji: "🌧️",
    description: "জানালার বাইরে টুপটাপ বৃষ্টি, মনোযোগের জন্য চমৎকার",
    ambientSound: "rain",
    gradient: "from-fuchsia-500 to-violet-700",
  },
  {
    id: "SILENT_HALL",
    name: "সাইলেন্ট স্টাডি হল",
    emoji: "🤫",
    description: "কোনো শব্দ নেই — সম্পূর্ণ নীরবতায় ফোকাস করার জন্য",
    ambientSound: null,
    gradient: "from-slate-500 to-gray-700",
  },
];

export const ACTIVITY_LABELS: Record<ReadingRoomActivity, { label: string; emoji: string }> = {
  SELF_STUDY: { label: "একা পড়ছে", emoji: "📖" },
  CLASS: { label: "ক্লাস করছে", emoji: "🎓" },
  BREAK: { label: "বিরতিতে আছে", emoji: "☕" },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** ইউজারের বর্তমান active (endedAt: null) সেশন থাকলে সেটা নিয়ে আসে */
export async function getActiveSession(userId: string) {
  return prisma.readingRoomSession.findFirst({
    where: { userId, endedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * একটা active সেশন যদি stale (heartbeat miss) বা max duration পার হয়ে
 * গিয়ে থাকে, সেটা auto-end করে দেয়। এটা প্রতিটা join/heartbeat কলের
 * শুরুতে চালানো হয় যাতে পুরনো "ভুতুড়ে" সেশন জমে না থাকে।
 */
async function autoEndIfStale(sessionRow: { id: string; startedAt: Date; lastHeartbeatAt: Date; totalFocusSec: number }) {
  const now = new Date();
  const staleSec = (now.getTime() - sessionRow.lastHeartbeatAt.getTime()) / 1000;
  const durationSec = (now.getTime() - sessionRow.startedAt.getTime()) / 1000;

  if (staleSec > STALE_AFTER_SEC || durationSec > MAX_SESSION_DURATION_SEC) {
    await endSessionInternal(sessionRow.id, sessionRow.totalFocusSec);
    return true;
  }
  return false;
}

async function endSessionInternal(sessionId: string, totalFocusSec: number) {
  // 🐛 বাগ ফিক্স (Task/StudyPlanItem/TopicProgress/QuizBattle/QuizDuel
  // XP Race Condition অডিটের ধারাবাহিকতায় আবিষ্কৃত, একই ক্লাসের
  // সমস্যা): আগে `where: { id: sessionId }` দিয়ে unconditional
  // update হতো (কোনো `endedAt: null` guard ছাড়াই) — ইউজার "leave"
  // বাটনে দ্রুত কয়েকবার ক্লিক করলে বা heartbeat/leave একসাথে race
  // করলে একই সেশন একাধিকবার "শেষ" করে XP দ্বিগুণ/বহুগুণ হতে পারতো।
  // ফিক্স: single atomic `UPDATE ... WHERE id=? AND endedAt IS NULL`
  // দিয়ে claim করা হয় — শুধু matched (count>0) হলেই XP/streak দেওয়া
  // হয়, নাহলে ইতিমধ্যে অন্য একটা concurrent কল সেশন শেষ করে দিয়েছে
  // ধরে নিয়ে বর্তমান (already-ended) state idempotent ভাবে রিটার্ন
  // করা হয়।
  const claimResult = await prisma.readingRoomSession.updateMany({
    where: { id: sessionId, endedAt: null },
    data: { endedAt: new Date() },
  });

  const ended = await prisma.readingRoomSession.findUniqueOrThrow({ where: { id: sessionId } });

  if (claimResult.count === 0) {
    // অন্য একটা concurrent কল ইতিমধ্যে এই সেশন শেষ করে দিয়েছে —
    // আবার XP/streak না দিয়ে বর্তমান state রিটার্ন
    return { session: ended, xpEarned: 0 };
  }

  // ন্যূনতম ৫ মিনিট ফোকাস করলে তবেই XP/streak পুরস্কার দেওয়া হয়
  // (readingroombd.com এর outlier-filter দর্শনের সাথে সামঞ্জস্যপূর্ণ —
  // কয়েক সেকেন্ডের জন্য join করে চলে যাওয়া গেমিং ঠেকানো)
  let xpEarned = 0;
  if (totalFocusSec >= 300) {
    xpEarned = Math.floor(totalFocusSec * XP_PER_FOCUS_SEC);
    if (xpEarned > 0) {
      await awardXp(ended.userId, xpEarned);
      await updateStreak(ended.userId);
    }
  }

  return { session: ended, xpEarned };
}

interface JoinRoomInput {
  userId: string;
  room: ReadingRoomTheme;
  activity: ReadingRoomActivity;
  goal?: string;
}

/**
 * রুমে join করা — আগে থেকে active সেশন থাকলে সেটা শেষ করে (রুম বদলানো/
 * রিফ্রেশ হিসেবে গণ্য), তারপর নতুন সেশন তৈরি করে।
 *
 * 🐛 বাগ ফিক্স (Race Condition, Custom Question Set এর একই capacity-
 * bypass ক্লাস, লাইভ টেস্টে প্রমাণিত): আগে এই ফাংশন read-then-write
 * প্যাটার্নে ছিল — `getActiveSession()` (read) দিয়ে পুরনো সেশন খুঁজে
 * নেওয়া, সেটা `endSessionInternal()` দিয়ে শেষ করা (atomic হলেও
 * idempotent, দ্বিতীয়বার চাইলে নীরবে skip করে), তারপর আলাদা
 * `create()` দিয়ে নতুন সেশন বানানো। এই তিন ধাপের মাঝে যদি একই
 * ইউজার থেকে একাধিক concurrent `POST /api/reading-room/join` কল আসে
 * (যেমন ডাবল-ক্লিক, একাধিক ট্যাব খোলা, বা নেটওয়ার্ক রিট্রাই), প্রতিটা
 * কল আলাদাভাবে read করে পুরনো সেশন (থাকলে) শেষ করার চেষ্টা করে, কিন্তু
 * **প্রতিটাই নতুন `create()` কল করে** — ফলে একই ইউজারের একাধিক
 * সেমাল্টেনিয়াস active (endedAt: null) সেশন তৈরি হয়ে যায়, যা schema
 * এর কমেন্টে লেখা "একই সময়ে একজন ইউজারের একাধিক active সেশন থাকা
 * উচিত না" ইনভ্যারিয়েন্ট ভাঙে। লাইভ টেস্টে (৫-থ্রেড concurrent join,
 * ১০ iteration) প্রতি iteration এ ৪টা করে অতিরিক্ত active session
 * accumulate হয়ে ১০ iteration শেষে মোট ৪১টা active session তৈরি
 * হয়েছে — কোনো crash হয় না (createMany/create সবসময় সফল হয়), কিন্তু
 * এটা silent data-integrity bug যা দুইটা user-facing ফিচারে প্রভাব
 * ফেলে: (১) `getRoomPresence()` একই ইউজারকে presence লিস্টে বারবার
 * দেখাতো (duplicate entries, একই নাম কয়েকবার), (২)
 * `getAllRoomOccupancy()` room এ কতজন আছে সেই সংখ্যা কৃত্রিমভাবে
 * বাড়িয়ে দেখাতো (session-row count করে, distinct-user count না)।
 *
 * ফিক্স: পুরো read-modify-write সিকোয়েন্স `$transaction` এর ভেতরে
 * `SELECT ... FOR UPDATE` দিয়ে সেই ইউজারের row লক করে atomic করা
 * হয়েছে (Custom Question Set এর established `SELECT ... FOR UPDATE`
 * on users row প্যাটার্ন অনুসরণ করে) — এতে concurrent join কল গুলো
 * সিরিয়ালাইজড হয়ে যায় (একটা শেষ না হওয়া পর্যন্ত পরেরটা lock এর জন্য
 * অপেক্ষা করে), তাই "পুরনো সেশন end + নতুন সেশন create" সবসময় একটা
 * atomic unit হিসেবে ঘটে — একাধিক active session তৈরি হওয়া সম্পূর্ণ
 * অসম্ভব হয়ে যায়।
 */
export async function joinReadingRoom(input: JoinRoomInput) {
  const trimmedGoal = input.goal?.trim().slice(0, GOAL_MAX_LENGTH) || null;

  // ধাপ ১ (atomic transaction): ইউজারের row লক করে পুরনো সব active
  // সেশন একই transaction এ শেষ করে নতুন সেশন তৈরি করা হয় — এতে
  // "read old session -> end -> create new" পুরো সিকোয়েন্স atomic
  // হয়ে যায়, কোনো concurrent join মাঝখানে ঢুকে দ্বিতীয় active
  // session তৈরি করতে পারে না। XP/streak award transaction এর
  // *বাইরে* রাখা হয়েছে ইচ্ছাকৃতভাবে — awardXp()/updateStreak() নিজে
  // আলাদা connection দিয়ে `users` টেবিলে write করে, যদি সেগুলো এই
  // একই transaction এর ভেতরে কল করা হতো (যেটা ইতিমধ্যে `users` row
  // এ FOR UPDATE লক ধরে আছে) তাহলে self-deadlock হওয়ার ঝুঁকি থাকতো।
  const { session, endedSessions } = await prisma.$transaction(async (tx) => {
    // ইউজারের row লক করা হচ্ছে — এই লক ধরে রাখা অবস্থায় অন্য কোনো
    // concurrent joinReadingRoom() কল একই ইউজারের জন্য এগোতে পারবে
    // না, transaction কমিট হওয়া পর্যন্ত অপেক্ষা করবে
    await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${input.userId} FOR UPDATE`;

    const existingSessions = await tx.readingRoomSession.findMany({
      where: { userId: input.userId, endedAt: null },
    });

    const nowTs = new Date();
    const ended: { userId: string; totalFocusSec: number }[] = [];

    for (const existing of existingSessions) {
      await tx.readingRoomSession.update({
        where: { id: existing.id },
        data: { endedAt: nowTs },
      });
      ended.push({ userId: existing.userId, totalFocusSec: existing.totalFocusSec });
    }

    const newSession = await tx.readingRoomSession.create({
      data: {
        userId: input.userId,
        room: input.room,
        activity: input.activity,
        goal: trimmedGoal,
      },
    });

    return { session: newSession, endedSessions: ended };
  });

  // ধাপ ২ (transaction এর বাইরে): প্রতিটা শেষ হওয়া পুরনো সেশনের জন্য
  // XP/streak প্রদান — established endSessionInternal() এর একই ৫
  // মিনিট (৩০০ সেকেন্ড) থ্রেশহোল্ড অনুসরণ করে (গেমিং প্রতিরোধ)।
  // স্বাভাবিক single-active-session ক্ষেত্রে এই লুপ ০ বা ১ বার চলে;
  // যদি ফিক্সের আগে তৈরি হওয়া কোনো leftover multi-session অবস্থা
  // থেকে যায় (এই ডিপ্লয়মেন্টের আগে তৈরি হওয়া), সবগুলোই এখানে সঠিকভাবে
  // XP পেয়ে ক্লিনআপ হয়ে যাবে
  for (const ended of endedSessions) {
    if (ended.totalFocusSec >= 300) {
      const xpEarned = Math.floor(ended.totalFocusSec * XP_PER_FOCUS_SEC);
      if (xpEarned > 0) {
        await awardXp(ended.userId, xpEarned);
      }
      await updateStreak(ended.userId);
    }
  }

  // 🆕 Live Study Leaderboard এর জন্য heartbeat — Reading Room এ join
  // করাটাও একটা "এখন পড়ছে" ইভেন্ট, unified live-presence সিস্টেমে sync
  // করা হচ্ছে (non-critical side-effect, ব্যর্থ হলেও মূল join flow
  // আটকাবে না)
  await markUserActive(input.userId, "READING_ROOM").catch(() => {});

  return session;
}

interface HeartbeatResult {
  session: Awaited<ReturnType<typeof prisma.readingRoomSession.update>> | null;
  ended: boolean;
  xpEarned: number;
}

/**
 * Heartbeat — presence বজায় রাখার পাশাপাশি gaming-প্রতিরোধ ক্যাপ সহ
 * totalFocusSec বাড়ায়। ইউজারের কোনো active সেশন না থাকলে (আগে থেকেই
 * stale হয়ে auto-end হয়ে গেছে, বা কখনো join-ই করেনি) null রিটার্ন করে
 * — ফ্রন্টএন্ড সেটা দেখে "আবার join করো" prompt দেখাবে।
 *
 * 🐛 বাগ ফিক্স (Race Condition, Join এর সাথে একই ক্লাস, লাইভ টেস্টে
 * প্রমাণিত): আগে `findUnique()` (read, `endedAt` চেক করে) এর পরে
 * আলাদা `update({ where: { id: sessionId } })` কল করা হতো — কিন্তু
 * এই `update()` এর `where` ক্লজে `endedAt: null` guard ছিল না। ফলে
 * concurrent `leaveReadingRoom()` (যেটা সেশন `endedAt` সেট করে শেষ
 * করে দেয়) এই heartbeat এর read ও write এর মাঝের ছোট window এ ঘটে
 * গেলে, heartbeat তবুও সেই (ইতিমধ্যে শেষ হয়ে যাওয়া) সেশনের
 * `lastHeartbeatAt`/`totalFocusSec` সফলভাবে আপডেট করে দিতো — একটা
 * "revived" ended session তৈরি হতো (endedAt সেট থাকা সত্ত্বেও
 * lastHeartbeatAt পরিবর্তিত)। লাইভ টেস্টে (leave+heartbeat concurrent,
 * heartbeat কে সামান্য delay দিয়ে leave এর write এর মাঝে পড়ার
 * সম্ভাবনা বাড়িয়ে) ১৫/১৫ iteration এ এই ইনকনসিস্টেন্সি সরাসরি
 * reproduce হয়েছে।
 *
 * ফিক্স: `update()` এর বদলে `updateMany({ where: { id, endedAt: null
 * } })` — atomic claim, matched count 0 হলে (মানে ইতিমধ্যে অন্য কোনো
 * concurrent কল সেশন শেষ করে দিয়েছে) heartbeat নিজেই `ended: true`
 * রিটার্ন করে, কখনো ইতিমধ্যে-শেষ-হওয়া সেশনে write করার চেষ্টা করে না।
 */
export async function sendHeartbeat(
  userId: string,
  sessionId: string,
  updates?: { activity?: ReadingRoomActivity; goal?: string }
): Promise<HeartbeatResult> {
  const sessionRow = await prisma.readingRoomSession.findUnique({ where: { id: sessionId } });
  if (!sessionRow || sessionRow.userId !== userId || sessionRow.endedAt) {
    return { session: null, ended: true, xpEarned: 0 };
  }

  const stale = await autoEndIfStale(sessionRow);
  if (stale) {
    const refreshed = await prisma.readingRoomSession.findUnique({ where: { id: sessionId } });
    return { session: refreshed, ended: true, xpEarned: 0 };
  }

  const now = new Date();
  const gapSec = (now.getTime() - sessionRow.lastHeartbeatAt.getTime()) / 1000;
  const creditSec = clamp(gapSec, 0, MAX_CREDIT_PER_HEARTBEAT_SEC);

  // atomic claim — endedAt: null guard সহ updateMany() ব্যবহার করা
  // হয়েছে যাতে concurrent leave()/join() ইতিমধ্যে সেশন শেষ করে দিলে
  // heartbeat সেটা silently detect করে "ended" রিটার্ন করে
  const claimResult = await prisma.readingRoomSession.updateMany({
    where: { id: sessionId, endedAt: null },
    data: {
      lastHeartbeatAt: now,
      totalFocusSec: { increment: Math.round(creditSec) },
      ...(updates?.activity ? { activity: updates.activity } : {}),
      ...(updates?.goal !== undefined ? { goal: updates.goal.trim().slice(0, GOAL_MAX_LENGTH) || null } : {}),
    },
  });

  if (claimResult.count === 0) {
    // অন্য একটা concurrent কল (leave/join) ইতিমধ্যে এই সেশন শেষ করে
    // দিয়েছে — heartbeat নিজে কিছু আপডেট না করে "ended" রিটার্ন করে
    const ended = await prisma.readingRoomSession.findUnique({ where: { id: sessionId } });
    return { session: ended, ended: true, xpEarned: 0 };
  }

  // 🆕 Live Study Leaderboard heartbeat sync (non-critical)
  await markUserActive(userId, "READING_ROOM").catch(() => {});

  const updated = await prisma.readingRoomSession.findUniqueOrThrow({ where: { id: sessionId } });

  return { session: updated, ended: false, xpEarned: 0 };
}

/** ইউজার নিজে থেকে রুম ছেড়ে দিলে কল হয় — XP award সহ সেশন শেষ করে */
export async function leaveReadingRoom(userId: string, sessionId: string) {
  const sessionRow = await prisma.readingRoomSession.findUnique({ where: { id: sessionId } });
  if (!sessionRow || sessionRow.userId !== userId) {
    throw new Error("সেশন পাওয়া যায়নি");
  }
  if (sessionRow.endedAt) {
    return { session: sessionRow, xpEarned: 0 };
  }
  return endSessionInternal(sessionRow.id, sessionRow.totalFocusSec);
}

/**
 * একটা নির্দিষ্ট রুমে বর্তমানে active (stale না হওয়া) সবার প্রেজেন্স
 * লিস্ট — নাম, activity, goal, কতক্ষণ ধরে আছে। readingroombd.com এর
 * Public Dashboard থেকে অনুপ্রাণিত, কিন্তু privacy-aware (লগইন লাগবে)।
 */
export async function getRoomPresence(room: ReadingRoomTheme, currentUserId: string) {
  const staleThreshold = new Date(Date.now() - STALE_AFTER_SEC * 1000);

  const sessions = await prisma.readingRoomSession.findMany({
    where: {
      room,
      endedAt: null,
      lastHeartbeatAt: { gte: staleThreshold },
    },
    include: {
      user: { select: { id: true, name: true, level: true } },
    },
    orderBy: { startedAt: "asc" },
  });

  return sessions.map((s) => ({
    sessionId: s.id,
    userId: s.userId,
    name: s.user.name,
    level: s.user.level,
    activity: s.activity,
    goal: s.goal,
    startedAt: s.startedAt,
    isMe: s.userId === currentUserId,
  }));
}

/** প্রতিটা রুমের বর্তমান occupancy count (রুম বেছে নেওয়ার পেজে দেখানোর জন্য) */
export async function getAllRoomOccupancy(): Promise<Record<ReadingRoomTheme, number>> {
  const staleThreshold = new Date(Date.now() - STALE_AFTER_SEC * 1000);

  const grouped = await prisma.readingRoomSession.groupBy({
    by: ["room"],
    where: { endedAt: null, lastHeartbeatAt: { gte: staleThreshold } },
    _count: { _all: true },
  });

  const result = {} as Record<ReadingRoomTheme, number>;
  for (const theme of READING_ROOM_THEMES) {
    result[theme.id] = 0;
  }
  for (const g of grouped) {
    result[g.room] = g._count._all;
  }
  return result;
}

/** ইউজারের নিজের আজকের মোট Reading Room ফোকাস সময় (সেকেন্ডে) — নিজের প্রোফাইল কার্ডে দেখানোর জন্য */
export async function getTodayFocusSummary(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const sessions = await prisma.readingRoomSession.findMany({
    where: { userId, createdAt: { gte: startOfDay } },
    select: { totalFocusSec: true },
  });

  const totalSec = sessions.reduce((sum, s) => sum + s.totalFocusSec, 0);
  return { totalSec, sessionCount: sessions.length };
}

// -------------------------------------------------------------------
// Study Time Leaderboard (readingroombd.com এর Daily/Weekly/Monthly
// Study Leaderboard কনসেপ্ট থেকে অনুপ্রাণিত — docs/RESEARCH_UI_UX_
// READING_ROOM.md এর ৮ নং সেকশনে "Leaderboard integration" হিসেবে
// চিহ্নিত করা, Reading Room ফিচারের সাথে না বানিয়ে পরে যোগ করা হলো)।
// এটা বিদ্যমান XP Leaderboard (lib/league.ts) এর পাশাপাশি, প্রতিস্থাপন
// না — "কে কত সময় পড়ল" এর সরাসরি হিসাব দেখায়, XP এর মতো bonus/penalty
// mixed না। সপ্তাহ-শুরুর হিসাব lib/league.ts এর getCurrentWeekStart()
// এর সাথে সামঞ্জস্যপূর্ণ রাখা হয়েছে (UTC-based, রবিবার থেকে শুরু) যাতে
// দুই জায়গায় ভিন্ন সপ্তাহ-সীমানা দেখানোর অসঙ্গতি না হয়।
//
// 🆕 Live Study Leaderboard আপগ্রেড (ব্যবহারকারীর অনুরোধ: "Ahon ke ke
// porte ase ke kotokhon porce daily wekly lederboard thakbe") — আগে এই
// leaderboard শুধু established Reading Room সেশনের totalFocusSec যোগ
// করত (readingRoomSession টেবিল একাই)। এখন established StudySession
// (Pomodoro/Practice/CQ/Flashcard এর durationSec) ও merge করা হয়েছে,
// যাতে শুধু Reading Room ব্যবহার না করা ইউজারও leaderboard এ আসে।
// এছাড়া lib/live-activity.ts এর getLiveStatusMap() দিয়ে প্রতিটা
// এন্ট্রিতে "এখন লাইভ পড়ছে কিনা" ফ্ল্যাগ যোগ করা হয়েছে — লাইভ ইউজাররা
// সবসময় leaderboard এর প্রথমে দেখানো হয় (established sort এর উপরে
// override করে), তারপর বাকিরা মোট সময় অনুযায়ী।
// -------------------------------------------------------------------

export type LeaderboardPeriod = "daily" | "weekly" | "monthly";

function getPeriodStartUtc(period: LeaderboardPeriod, now: Date = new Date()): Date {
  if (period === "daily") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  if (period === "monthly") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  // weekly — lib/league.ts এর getCurrentWeekStart() এর সাথে অভিন্ন লজিক
  // (রবিবার UTC মধ্যরাত থেকে সপ্তাহ শুরু)
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  level: number;
  totalFocusSec: number;
  sessionCount: number;
  rank: number;
  isMe: boolean;
  // 🆕 Live presence তথ্য (lib/live-activity.ts থেকে)
  isLive: boolean;
  currentActivityType: LiveActivityType | null;
  liveSinceSec: number | null;
}

const LEADERBOARD_LIMIT = 50;

/**
 * নির্দিষ্ট সময়সীমার (দৈনিক/সাপ্তাহিক/মাসিক) Study Time Leaderboard —
 * established StudySession (Pomodoro/Practice/CQ/Flashcard) ও
 * ReadingRoomSession উভয় সোর্স থেকে সব ইউজারের createdAt >= periodStart
 * এমন সেশনগুলোর সময় যোগ করে merge করা হয়, তারপর "এখন লাইভ পড়ছে" এমন
 * ইউজারদের সবার উপরে রেখে (independent of মোট সময়), বাকিদের মোট সময়
 * অনুযায়ী descending র‍্যাংক করা হয়।
 *
 * থ্রেশহোল্ড নীতি: লাইভ ইউজারদের কোনো ন্যূনতম সময়ের থ্রেশহোল্ড ছাড়াই
 * দেখানো হয় (এইমাত্র শুরু করা ইউজারকেও "এখন পড়ছে" হিসেবে দেখা উচিত)।
 * নন-লাইভ ইউজারদের জন্য established ন্যূনতম ৫ মিনিট (৩০০ সেকেন্ড, XP
 * award এর একই থ্রেশহোল্ড) থ্রেশহোল্ড বজায় রাখা হয়েছে (readingroombd.com
 * এর "অতিরিক্ত সময় বাদ দিন" outlier-filter দর্শন থেকে অনুপ্রাণিত)।
 */
export async function getStudyTimeLeaderboard(
  period: LeaderboardPeriod,
  currentUserId: string
): Promise<{ entries: LeaderboardEntry[]; myEntry: LeaderboardEntry | null; liveCount: number }> {
  const periodStart = getPeriodStartUtc(period);

  const [studySessionGrouped, readingRoomGrouped] = await Promise.all([
    prisma.studySession.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: periodStart } },
      _sum: { durationSec: true },
      _count: { _all: true },
    }),
    prisma.readingRoomSession.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: periodStart } },
      _sum: { totalFocusSec: true },
      _count: { _all: true },
    }),
  ]);

  // দুটো সোর্স merge করা — একই userId দুই টেবিলেই থাকলে সময় ও সেশন
  // সংখ্যা যোগ হয়ে যায়
  const mergedMap = new Map<string, { totalFocusSec: number; sessionCount: number }>();
  for (const g of studySessionGrouped) {
    mergedMap.set(g.userId, {
      totalFocusSec: g._sum.durationSec ?? 0,
      sessionCount: g._count._all,
    });
  }
  for (const g of readingRoomGrouped) {
    const existing = mergedMap.get(g.userId);
    mergedMap.set(g.userId, {
      totalFocusSec: (existing?.totalFocusSec ?? 0) + (g._sum.totalFocusSec ?? 0),
      sessionCount: (existing?.sessionCount ?? 0) + g._count._all,
    });
  }

  // এই সময়সীমায় কারা লাইভ পড়ছে (independent of merged study-time —
  // periodStart এর বাইরে থাকলেও "এখন লাইভ" হলে দেখানো উচিত, যেমন daily
  // ট্যাবে থাকা অবস্থায় রাত ১২টার ঠিক আগে সেশন শুরু করলে)
  const staleThreshold = new Date(Date.now() - LIVE_PRESENCE_STALE_SEC * 1000);
  const liveUsersRaw = await prisma.user.findMany({
    where: { currentActivityAt: { gte: staleThreshold } },
    select: { id: true, name: true, level: true, currentActivityAt: true, currentActivityType: true },
  });
  const liveUserIds = new Set(liveUsersRaw.map((u) => u.id));
  const liveInfoMap = await getLiveStatusMap([...liveUserIds]);

  const MIN_FOCUS_SEC = 300;
  const filtered = [...mergedMap.entries()]
    .map(([userId, v]) => ({ userId, totalFocusSec: v.totalFocusSec, sessionCount: v.sessionCount }))
    .filter((g) => g.totalFocusSec >= MIN_FOCUS_SEC || liveUserIds.has(g.userId));

  // এখন লাইভ কিন্তু এই period এ এখনো কোনো সেশন record হয়নি (এইমাত্র
  // শুরু করেছে) এমন ইউজারদেরও তালিকায় যোগ করা হচ্ছে (০ সেকেন্ড দিয়ে)
  for (const liveId of liveUserIds) {
    if (!filtered.some((g) => g.userId === liveId)) {
      filtered.push({ userId: liveId, totalFocusSec: 0, sessionCount: 0 });
    }
  }

  // Sort: লাইভ ইউজার সবসময় প্রথমে (সাম্প্রতিক activity আগে), তারপর
  // বাকিরা মোট সময় অনুযায়ী descending
  filtered.sort((a, b) => {
    const aLive = liveUserIds.has(a.userId);
    const bLive = liveUserIds.has(b.userId);
    if (aLive !== bLive) return aLive ? -1 : 1;
    if (aLive && bLive) {
      const aSince = liveInfoMap.get(a.userId)?.liveSinceSec ?? Infinity;
      const bSince = liveInfoMap.get(b.userId)?.liveSinceSec ?? Infinity;
      return aSince - bSince; // যে বেশিক্ষণ ধরে একটানা পড়ছে সে আগে
    }
    return b.totalFocusSec - a.totalFocusSec;
  });

  const top = filtered.slice(0, LEADERBOARD_LIMIT);
  const myRankIndex = filtered.findIndex((g) => g.userId === currentUserId);

  // টপ ৫০ এ না থাকলেও নিজের এন্ট্রি আলাদাভাবে আনা হয় (leaderboard UI তে
  // "তুমি #১২৩ নম্বরে আছো" দেখানোর জন্য, যেভাবে বিদ্যমান XP leaderboard এ হয়)
  const needsSeparateMeFetch = myRankIndex === -1 || myRankIndex >= LEADERBOARD_LIMIT;
  const userIds = top.map((g) => g.userId);
  if (needsSeparateMeFetch && myRankIndex !== -1) {
    userIds.push(currentUserId);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, level: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));
  // লাইভ ইউজারদের name/level ইতিমধ্যে liveUsersRaw থেকেও পাওয়া যায়
  // (userMap এ না থাকলে fallback হিসেবে ব্যবহার করার জন্য)
  const liveUserRawMap = new Map(liveUsersRaw.map((u) => [u.id, u]));

  function buildEntry(g: { userId: string; totalFocusSec: number; sessionCount: number }, rank: number): LeaderboardEntry {
    const liveInfo = liveInfoMap.get(g.userId);
    const userInfo = userMap.get(g.userId) ?? liveUserRawMap.get(g.userId);
    return {
      userId: g.userId,
      name: userInfo?.name ?? "অজানা",
      level: userInfo?.level ?? 1,
      totalFocusSec: g.totalFocusSec,
      sessionCount: g.sessionCount,
      rank,
      isMe: g.userId === currentUserId,
      isLive: liveInfo?.isLive ?? false,
      currentActivityType: liveInfo?.currentActivityType ?? null,
      liveSinceSec: liveInfo?.liveSinceSec ?? null,
    };
  }

  const entries: LeaderboardEntry[] = top.map((g, idx) => buildEntry(g, idx + 1));

  let myEntry: LeaderboardEntry | null = null;
  if (myRankIndex !== -1) {
    myEntry = buildEntry(filtered[myRankIndex], myRankIndex + 1);
  }

  return { entries, myEntry, liveCount: liveUserIds.size };
}

// -------------------------------------------------------------------
// Study Group Integration ("live session" upgrade — docs/RESEARCH_UI_
// UX_READING_ROOM.md এর ৮ নং সেকশনে চিহ্নিত করা "Study Group কে live
// session মোডে upgrade" আইটেম, বিদ্যমান Study Group এর মধ্যেই presence
// দেখানো হচ্ছে, নতুন আলাদা ফিচার না বানিয়ে)
// -------------------------------------------------------------------
// ডিজাইন সিদ্ধান্ত: schema-free — কোনো নতুন কলাম/মডেল লাগেনি, বিদ্যমান
// StudyGroupMember (গ্রুপ সদস্যতা) ও ReadingRoomSession (active presence)
// দুটো টেবিল জয়েন করে রিয়েল-টাইম "কে কোথায় পড়ছে" তথ্য বের করা হয়।
// -------------------------------------------------------------------

export interface GroupMemberReadingStatus {
  userId: string;
  name: string;
  isInReadingRoom: boolean;
  room: ReadingRoomTheme | null;
  activity: ReadingRoomActivity | null;
  goal: string | null;
}

/**
 * নিজের Study Group এর সব সদস্যের বর্তমান Reading Room অবস্থা —
 * "গ্রুপের কে কে এখন Reading Room এ পড়ছে" দেখানোর জন্য। Study Group
 * Dashboard এ ব্যবহৃত হয়। কোনো গ্রুপ না থাকলে/গ্রুপে একা থাকলে খালি
 * array রিটার্ন করে।
 */
export async function getGroupMembersReadingRoomStatus(
  userId: string
): Promise<GroupMemberReadingStatus[]> {
  const membership = await prisma.studyGroupMember.findUnique({
    where: { userId },
    select: { groupId: true },
  });
  if (!membership) return [];

  const groupMembers = await prisma.studyGroupMember.findMany({
    where: { groupId: membership.groupId },
    select: { userId: true, user: { select: { id: true, name: true } } },
  });
  if (groupMembers.length === 0) return [];

  const staleThreshold = new Date(Date.now() - STALE_AFTER_SEC * 1000);
  const memberIds = groupMembers.map((m) => m.userId);

  const activeSessions = await prisma.readingRoomSession.findMany({
    where: {
      userId: { in: memberIds },
      endedAt: null,
      lastHeartbeatAt: { gte: staleThreshold },
    },
    select: { userId: true, room: true, activity: true, goal: true },
  });
  const sessionMap = new Map(activeSessions.map((s) => [s.userId, s]));

  return groupMembers.map((m) => {
    const session = sessionMap.get(m.userId);
    return {
      userId: m.userId,
      name: m.user.name,
      isInReadingRoom: !!session,
      room: session?.room ?? null,
      activity: session?.activity ?? null,
      goal: session?.goal ?? null,
    };
  });
}

// -------------------------------------------------------------------
// Synced (Shared) Pomodoro — readingroombd.com/StudyClock এর "সবাই একই
// সময়ে ব্রেক নেয়" ধারণা থেকে অনুপ্রাণিত। schema-free ও broadcast-free
// ডিজাইন: কোনো DB write বা polling ছাড়াই, শুধু wall-clock (সার্ভার
// সময়) থেকে deterministically হিসাব করে সবাইকে একই মুহূর্তে একই
// focus/break state দেখানো হয় (Unix epoch থেকে mod নিয়ে) — Node.js এ
// pre-verify করা হয়েছে যে দুইজন ইউজার একই মুহূর্তে কল করলে হুবহু একই
// state (mode + secondsLeft) পাবে।
// -------------------------------------------------------------------

export const SYNCED_FOCUS_SEC = 25 * 60; // ২৫ মিনিট ফোকাস
export const SYNCED_BREAK_SEC = 5 * 60; // ৫ মিনিট ব্রেক
export const SYNCED_CYCLE_SEC = SYNCED_FOCUS_SEC + SYNCED_BREAK_SEC; // মোট ৩০ মিনিট চক্র

export interface SyncedPomodoroState {
  mode: "focus" | "break";
  secondsLeft: number;
  cycleSec: number;
}

/**
 * বর্তমান মুহূর্তে (বা নির্দিষ্ট একটা timestamp এ) global synced
 * Pomodoro চক্রের অবস্থা বের করে — এটা pure function (কোনো DB/randomness
 * নেই), তাই client ও server উভয় জায়গায় independently কল করেও সবসময়
 * একই ফলাফল আসবে (যতক্ষণ ঘড়ি সিঙ্ক থাকে)।
 */
export function getSyncedPomodoroState(now: Date = new Date()): SyncedPomodoroState {
  const epochSec = Math.floor(now.getTime() / 1000);
  const position = epochSec % SYNCED_CYCLE_SEC;

  if (position < SYNCED_FOCUS_SEC) {
    return { mode: "focus", secondsLeft: SYNCED_FOCUS_SEC - position, cycleSec: SYNCED_CYCLE_SEC };
  }
  return { mode: "break", secondsLeft: SYNCED_CYCLE_SEC - position, cycleSec: SYNCED_CYCLE_SEC };
}

