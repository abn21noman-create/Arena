// ===================================================================
// সাপ্তাহিক রিক্যাপ (Weekly Study Recap) — Spotify Wrapped/ChatGPT
// "Your Year" স্টাইল থেকে অনুপ্রাণিত, HSC Ultimate এর জন্য সাপ্তাহিক
// সংস্করণ (FEATURE_RESEARCH_V5.md এ বিস্তারিত গবেষণা)
// -------------------------------------------------------------------
// সম্পূর্ণ schema-free — বিদ্যমান User/StudySession/QuizAttempt/
// CQAttempt/TopicProgress টেবিল থেকে ডেটা aggregate করে একটা
// celebratory, শেয়ারযোগ্য "রিক্যাপ কার্ড" বানায়। কোনো নতুন migration,
// AI call, বা cron infrastructure লাগে না (pure deterministic query +
// heuristic)।
//
// সপ্তাহের সংজ্ঞা: lib/league.ts এর getCurrentWeekStart() এর সাথে সামঞ্জস্য
// রেখে রবিবার ০০:০০ (UTC ভিত্তিতে সরলতার জন্য, বাকি প্ল্যাটফর্মের মতোই)।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart } from "@/lib/league";

const SUBJECT_CODE_LABELS: Record<string, string> = {
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  HIGHER_MATH: "উচ্চতর গণিত",
  BANGLA: "বাংলা",
  ENGLISH: "English",
  ICT: "ICT",
};

export interface WeeklyRecapData {
  weekStartDate: string; // ISO date
  weekEndDate: string; // ISO date (আজকের তারিখ, সপ্তাহ এখনো চলমান থাকলে)
  weeklyXp: number;
  studyMinutes: number;
  quizAttemptsCount: number;
  cqAttemptsCount: number;
  topicsMasteredThisWeek: number;
  currentStreak: number;
  topSubject: { code: string; label: string; minutes: number } | null;
  archetype: { emoji: string; title: string; description: string };
  hasAnyActivity: boolean;
}

/** সময়ের উপর ভিত্তি করে একটা মজার "স্টাডি পার্সোনালিটি" আর্কিটাইপ বের করে। */
function deriveArchetype(params: {
  nightSessionCount: number;
  morningSessionCount: number;
  weekendSessionCount: number;
  totalSessionCount: number;
  quizAttemptsCount: number;
  cqAttemptsCount: number;
  studyMinutes: number;
  topicsMasteredThisWeek: number;
}): { emoji: string; title: string; description: string } {
  const {
    nightSessionCount,
    morningSessionCount,
    weekendSessionCount,
    totalSessionCount,
    quizAttemptsCount,
    cqAttemptsCount,
    studyMinutes,
    topicsMasteredThisWeek,
  } = params;

  if (totalSessionCount === 0 && quizAttemptsCount === 0 && cqAttemptsCount === 0) {
    return {
      emoji: "🌱",
      title: "নতুন শুরু",
      description: "এই সপ্তাহে এখনো কোনো একটিভিটি নেই — আজই শুরু করো!",
    };
  }

  // অন্তত অর্ধেক সেশন রাত ১০টা - ভোর ৪টার মধ্যে হলে "নাইট আওল"
  // (Study Pet এর পেঁচা থিমের সাথে সুন্দরভাবে মিলে যায়)
  if (totalSessionCount > 0 && nightSessionCount / totalSessionCount >= 0.5) {
    return {
      emoji: "🦉",
      title: "নাইট আওল",
      description: "তুমি রাত জেগে পড়াশোনা করতে পছন্দ করো — Study Pet এর পেঁচার মতোই!",
    };
  }

  if (totalSessionCount > 0 && morningSessionCount / totalSessionCount >= 0.5) {
    return {
      emoji: "🌅",
      title: "ভোরের পাখি",
      description: "সকাল সকাল পড়াশোনা শুরু করো — দিনের সেরা সময়ে ফোকাস তোমার!",
    };
  }

  if (totalSessionCount > 0 && weekendSessionCount / totalSessionCount >= 0.5) {
    return {
      emoji: "🎯",
      title: "উইকেন্ড ওয়ারিয়র",
      description: "শুক্র-শনিবারে সবচেয়ে বেশি পড়াশোনা করো তুমি!",
    };
  }

  if (topicsMasteredThisWeek >= 3) {
    return {
      emoji: "🏆",
      title: "মাস্টার মাইন্ড",
      description: `এই সপ্তাহে ${topicsMasteredThisWeek}টা টপিক আয়ত্ত করেছো — দুর্দান্ত অগ্রগতি!`,
    };
  }

  if (quizAttemptsCount >= 15) {
    return {
      emoji: "⚡",
      title: "কুইজ মেশিন",
      description: `এই সপ্তাহে ${quizAttemptsCount}টা কুইজ দিয়েছো — প্র্যাকটিসে কেউ তোমাকে হারাতে পারবে না!`,
    };
  }

  if (cqAttemptsCount >= 5) {
    return {
      emoji: "✍️",
      title: "সৃজনশীল যোদ্ধা",
      description: `এই সপ্তাহে ${cqAttemptsCount}টা CQ প্র্যাকটিস করেছো — লিখিত পরীক্ষার জন্য দারুণ প্রস্তুতি!`,
    };
  }

  if (studyMinutes >= 300) {
    return {
      emoji: "📚",
      title: "মনোযোগী শিক্ষার্থী",
      description: `এই সপ্তাহে ${Math.round(studyMinutes / 60)} ঘণ্টার বেশি পড়েছো — ধারাবাহিকতাই সাফল্যের চাবিকাঠি!`,
    };
  }

  return {
    emoji: "🌟",
    title: "স্টেডি লার্নার",
    description: "প্রতিটা ছোট পদক্ষেপই তোমাকে লক্ষ্যের কাছে নিয়ে যাচ্ছে!",
  };
}

/**
 * নির্দিষ্ট ইউজারের চলতি সপ্তাহের (রবিবার থেকে আজ পর্যন্ত) রিক্যাপ ডেটা
 * তৈরি করে। কোনো নতুন AI call/migration ছাড়া, বিদ্যমান টেবিল থেকে
 * সরাসরি aggregate করা হয়।
 */
export async function getWeeklyRecap(userId: string): Promise<WeeklyRecapData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const weekStart = getCurrentWeekStart();
  const now = new Date();

  const [sessions, quizAttempts, cqAttempts, topicsMasteredThisWeek] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, startTime: { gte: weekStart } },
      select: { subjectCode: true, durationSec: true, startTime: true },
    }),
    prisma.quizAttempt.count({ where: { userId, createdAt: { gte: weekStart } } }),
    prisma.cQAttempt.count({ where: { userId, createdAt: { gte: weekStart } } }),
    prisma.topicProgress.count({
      where: { userId, status: "MASTERED", updatedAt: { gte: weekStart } },
    }),
  ]);

  // ---- সাবজেক্ট-ভিত্তিক সময় (সবচেয়ে বেশি পড়া সাবজেক্ট খুঁজতে) ----
  const bySubject = new Map<string, number>();
  for (const s of sessions) {
    if (!s.subjectCode) continue;
    bySubject.set(s.subjectCode, (bySubject.get(s.subjectCode) ?? 0) + s.durationSec);
  }
  let topSubject: WeeklyRecapData["topSubject"] = null;
  let maxSeconds = 0;
  for (const [code, seconds] of bySubject.entries()) {
    if (seconds > maxSeconds) {
      maxSeconds = seconds;
      topSubject = { code, label: SUBJECT_CODE_LABELS[code] ?? code, minutes: Math.round(seconds / 60) };
    }
  }

  // ---- আর্কিটাইপ heuristic এর জন্য সময়ের প্যাটার্ন হিসাব ----
  let nightSessionCount = 0; // রাত ১০টা - ভোর ৪টা
  let morningSessionCount = 0; // সকাল ৫টা - সকাল ৯টা
  let weekendSessionCount = 0; // শুক্র/শনিবার (BD সাপ্তাহিক ছুটি)
  for (const s of sessions) {
    const hour = s.startTime.getHours();
    const day = s.startTime.getDay(); // 0=রবি, 5=শুক্র, 6=শনি
    if (hour >= 22 || hour < 4) nightSessionCount += 1;
    if (hour >= 5 && hour < 9) morningSessionCount += 1;
    if (day === 5 || day === 6) weekendSessionCount += 1;
  }

  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSec, 0);
  const studyMinutes = Math.round(totalSeconds / 60);

  const archetype = deriveArchetype({
    nightSessionCount,
    morningSessionCount,
    weekendSessionCount,
    totalSessionCount: sessions.length,
    quizAttemptsCount: quizAttempts,
    cqAttemptsCount: cqAttempts,
    studyMinutes,
    topicsMasteredThisWeek,
  });

  const hasAnyActivity =
    sessions.length > 0 || quizAttempts > 0 || cqAttempts > 0 || topicsMasteredThisWeek > 0;

  return {
    weekStartDate: weekStart.toISOString().slice(0, 10),
    weekEndDate: now.toISOString().slice(0, 10),
    weeklyXp: user.weeklyXp,
    studyMinutes,
    quizAttemptsCount: quizAttempts,
    cqAttemptsCount: cqAttempts,
    topicsMasteredThisWeek,
    currentStreak: user.streakCount,
    topSubject,
    archetype,
    hasAnyActivity,
  };
}
