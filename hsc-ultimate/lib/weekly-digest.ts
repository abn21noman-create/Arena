// ===================================================================
// Notification Digest — Weekly Email Summary (FEATURE_RESEARCH_V3.md
// Tier ২, আইটেম ৯)
// -------------------------------------------------------------------
// প্রতিটা ইউজারের গত ৭ দিনের পড়াশোনার সারসংক্ষেপ বানায় (কতগুলো প্রশ্ন
// প্র্যাকটিস করেছে, accuracy, স্টাডি টাইম, XP, streak, দুর্বল টপিক)
// — এই ডেটা lib/email.ts এর sendWeeklyDigestEmail() এ পাঠানো হয়।
// -------------------------------------------------------------------
// ডিজাইন সিদ্ধান্ত: প্ল্যাটফর্মে কোনো cron/scheduled job ইনফ্রা নেই
// (Vercel Cron ব্যবহার করা যেত কিন্তু deploy এখনো স্থগিত — ব্যবহারকারী
// "deploy বাদ দাও পরে করব" বলেছেন)। তাই আপাতত admin-only manual trigger
// endpoint (/api/admin/digest/send) দিয়ে সব eligible ইউজারকে একসাথে
// পাঠানো যায়। lastDigestSentAt দিয়ে ৭ দিনের কম গ্যাপে দ্বিতীয়বার
// পাঠানো আটকানো হয় (ভুলবশত বহুবার ক্লিক করলেও)। Deploy করার সময় এই
// একই endpoint কে Vercel Cron (weekly schedule) দিয়ে কল করা যাবে।
// ===================================================================
import { prisma } from "@/lib/prisma";

export interface WeeklyDigestData {
  userId: string;
  name: string;
  email: string;
  weekQuestionsAnswered: number;
  weekCorrectAnswers: number;
  weekAccuracyPct: number;
  weekStudyMinutes: number;
  weekXpEarned: number;
  currentStreak: number;
  topWeakTopic: { name: string; accuracyPct: number } | null;
  hasAnyActivity: boolean; // পুরোপুরি নিষ্ক্রিয় থাকলে ভিন্ন (encouraging) মেসেজ দেখানো হয়
}

const DAYS_IN_WINDOW = 7;

/** নির্দিষ্ট ইউজারের গত ৭ দিনের প্রগ্রেস সামারি বানায় */
export async function getWeeklyDigestData(userId: string): Promise<WeeklyDigestData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const since = new Date();
  since.setDate(since.getDate() - DAYS_IN_WINDOW);

  const [attempts, sessions] = await Promise.all([
    // QuizAttemptAnswer এ নিজস্ব createdAt নেই, তাই parent QuizAttempt এর
    // createdAt দিয়ে গত ৭ দিনের রেঞ্জ ফিল্টার করা হচ্ছে
    prisma.quizAttemptAnswer.findMany({
      where: { quizAttempt: { userId, createdAt: { gte: since } } },
      select: {
        isCorrect: true,
        question: {
          select: {
            topic: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.studySession.findMany({
      where: { userId, startTime: { gte: since } },
      select: { durationSec: true },
    }),
  ]);

  const weekQuestionsAnswered = attempts.length;
  const weekCorrectAnswers = attempts.filter((a) => a.isCorrect).length;
  const weekAccuracyPct =
    weekQuestionsAnswered > 0
      ? Math.round((weekCorrectAnswers / weekQuestionsAnswered) * 100)
      : 0;
  const weekStudyMinutes = Math.round(
    sessions.reduce((sum, s) => sum + s.durationSec, 0) / 60
  );

  // এই সপ্তাহে সবচেয়ে দুর্বল টপিক (অন্তত ২টা প্রশ্ন উত্তর দেওয়া থাকলে)
  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    const topicName = a.question.topic.name;
    const existing = byTopic.get(topicName) ?? { correct: 0, total: 0 };
    existing.total += 1;
    if (a.isCorrect) existing.correct += 1;
    byTopic.set(topicName, existing);
  }
  let topWeakTopic: { name: string; accuracyPct: number } | null = null;
  let lowestAccuracy = 101;
  for (const [name, v] of byTopic.entries()) {
    if (v.total < 2) continue;
    const pct = Math.round((v.correct / v.total) * 100);
    if (pct < lowestAccuracy) {
      lowestAccuracy = pct;
      topWeakTopic = { name, accuracyPct: pct };
    }
  }

  // এই সপ্তাহে অর্জিত XP আনুমানিক হিসাব করা কঠিন (কেন্দ্রীভূত XP-লগ টেবিল
  // নেই — awardXp() শুধু user.xp ফিল্ড সরাসরি বাড়ায়, ইতিহাস রাখে না), তাই
  // এই সপ্তাহের সঠিক উত্তরের সংখ্যা থেকে আনুমানিক XP দেখানো হচ্ছে
  // (app/api/practice/submit/route.ts এর XP_PER_CORRECT_ANSWER=5 অনুসরণ
  // করে, এটা সবচেয়ে বেশি ব্যবহৃত practice mode)
  const XP_PER_CORRECT_ANSWER_ESTIMATE = 5;
  const weekXpEarned = weekCorrectAnswers * XP_PER_CORRECT_ANSWER_ESTIMATE;

  const hasAnyActivity = weekQuestionsAnswered > 0 || weekStudyMinutes > 0;

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    weekQuestionsAnswered,
    weekCorrectAnswers,
    weekAccuracyPct,
    weekStudyMinutes,
    weekXpEarned,
    currentStreak: user.streakCount,
    topWeakTopic,
    hasAnyActivity,
  };
}

/**
 * ডাইজেস্ট পাঠানোর জন্য "eligible" ইউজার — যাদের emailDigestEnabled=true
 * এবং হয় কখনো ডাইজেস্ট পাঠানো হয়নি অথবা শেষবার পাঠানোর পর ৭+ দিন
 * পেরিয়ে গেছে (একই সপ্তাহে বারবার admin trigger চাপলেও ডুপ্লিকেট
 * ইমেইল আটকাতে)।
 */
export async function getEligibleDigestUserIds(): Promise<string[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_IN_WINDOW);

  const users = await prisma.user.findMany({
    where: {
      emailDigestEnabled: true,
      OR: [{ lastDigestSentAt: null }, { lastDigestSentAt: { lt: cutoff } }],
    },
    select: { id: true },
  });

  return users.map((u) => u.id);
}
