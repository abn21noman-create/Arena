// ===================================================================
// Analytics Aggregation Logic
// -------------------------------------------------------------------
// ইউজারের পারফরম্যান্স ডেটা বিভিন্নভাবে বিশ্লেষণ করে (subject-wise score,
// progress trend, time distribution, দুর্বল টপিক identify করা) —
// Analytics Dashboard এ দেখানোর জন্য।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { getLevelProgress } from "@/lib/gamification";

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  subjectNameEn: string;
  colorHex: string;
  avgScorePct: number;
  attemptCount: number;
}

export interface ProgressPoint {
  date: string; // "৪ জুলাই" স্টাইল লেবেল
  avgScorePct: number;
  attemptCount: number;
}

export interface TimeDistributionItem {
  subjectCode: string;
  label: string;
  totalMinutes: number;
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracyPct: number;
  totalAnswered: number;
}

// Wrong-Answer Misconception Pattern (FEATURE_RESEARCH_V3.md Tier ১,
// আইটেম ৪) — Admin ট্যাগ করা misconceptionTag অনুযায়ী ইউজারের ভুল উত্তর
// গ্রুপ করে দেখায় "তুমি বারবার এই ধরনের ভুল করছো"
export interface MisconceptionPattern {
  tag: string;
  wrongCount: number; // এই ট্যাগযুক্ত প্রশ্নে/CQ তে মোট কতবার ভুল/দুর্বল উত্তর হয়েছে
  totalAttempted: number; // এই ট্যাগযুক্ত প্রশ্ন/CQ মোট কতবার উত্তর দেওয়া হয়েছে
  wrongRatePct: number; // wrongCount/totalAttempted, কত শতাংশ ভুল হয়
  // Misconception Tagging CQ-তে সম্প্রসারণ — একই ট্যাগ MCQ Question ও
  // CQQuestion দুটোতেই ব্যবহার হতে পারে (admin একই নাম দিয়ে ট্যাগ করলে),
  // তাই কোন সোর্স থেকে কতটুকু এসেছে তা UI তে transparency এর জন্য আলাদা
  // রাখা হয়েছে (মোট wrongCount/totalAttempted এ দুটোই merge করা থাকে)
  mcqWrongCount: number;
  cqWeakCount: number;
}

// Confidence-Based Answering স্ট্যাটস (FEATURE_RESEARCH_V3.md Tier ২,
// আইটেম ৭) — "SURE" (নিশ্চিত) বলেও ভুল হওয়া উত্তরগুলো সবচেয়ে গুরুত্বপূর্ণ
// (সত্যিকারের misconception, guess/স্লিপ না), তাই আলাদাভাবে হাইলাইট করা হয়
export interface ConfidenceStats {
  totalAnswered: number; // মোট কতগুলো উত্তরে confidence দেওয়া হয়েছে (দেওয়া না থাকলে বাদ)
  sureCount: number;
  sureCorrectCount: number;
  sureWrongCount: number; // "নিশ্চিত" ছিল কিন্তু ভুল হয়েছে — সবচেয়ে গুরুত্বপূর্ণ সিগন্যাল
  notSureCount: number;
  notSureCorrectCount: number; // "নিশ্চিত না" ছিল কিন্তু ঠিক হয়েছে — ভাগ্য/lucky guess হতে পারে
  sureAccuracyPct: number; // sureCorrectCount/sureCount
  notSureAccuracyPct: number; // notSureCorrectCount/notSureCount
}

export interface OverallStats {
  totalXp: number;
  level: number;
  levelProgressPct: number;
  masteredTopicsCount: number;
  totalTopicsCount: number;
  masteryPct: number;
  quizAccuracyPct: number;
  totalQuizAttempts: number;
  totalStudyHours: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ActivityHeatmapDay {
  date: string; // "YYYY-MM-DD" ফরম্যাটে
  count: number; // সেদিন কতগুলো activity (quiz+CQ attempt+study session) হয়েছে
}

const SUBJECT_CODE_LABELS: Record<string, string> = {
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  HIGHER_MATH: "উচ্চতর গণিত",
  BANGLA: "বাংলা",
  ENGLISH: "English",
  ICT: "ICT",
};

/** প্রতিটা Subject এ average quiz score % (bar chart এর জন্য) */
export async function getSubjectPerformance(userId: string): Promise<SubjectPerformance[]> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, subjectId: { not: null } },
    select: { subjectId: true, score: true, totalMarks: true },
  });

  const bySubject = new Map<string, { totalScore: number; totalMarks: number; count: number }>();
  for (const a of attempts) {
    if (!a.subjectId) continue;
    const existing = bySubject.get(a.subjectId) ?? { totalScore: 0, totalMarks: 0, count: 0 };
    existing.totalScore += a.score;
    existing.totalMarks += a.totalMarks;
    existing.count += 1;
    bySubject.set(a.subjectId, existing);
  }

  if (bySubject.size === 0) return [];

  const subjects = await prisma.subject.findMany({
    where: { id: { in: Array.from(bySubject.keys()) } },
  });

  return subjects
    .map((s) => {
      const stats = bySubject.get(s.id)!;
      return {
        subjectId: s.id,
        subjectName: s.name,
        subjectNameEn: s.nameEn,
        colorHex: s.colorHex,
        avgScorePct: stats.totalMarks > 0 ? Math.round((stats.totalScore / stats.totalMarks) * 100) : 0,
        attemptCount: stats.count,
      };
    })
    .sort((a, b) => b.attemptCount - a.attemptCount);
}

/** গত ১৪ দিনের quiz score trend (line chart এর জন্য) */
export async function getProgressOverTime(userId: string): Promise<ProgressPoint[]> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, createdAt: { gte: fourteenDaysAgo } },
    select: { createdAt: true, score: true, totalMarks: true },
    orderBy: { createdAt: "asc" },
  });

  // প্রতিটা দিনের জন্য bucket বানানো হচ্ছে
  const dayBuckets = new Map<string, { totalScore: number; totalMarks: number; count: number }>();
  const dateLabels: string[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dateLabels.push(key);
    dayBuckets.set(key, { totalScore: 0, totalMarks: 0, count: 0 });
  }

  for (const a of attempts) {
    const key = a.createdAt.toISOString().slice(0, 10);
    const bucket = dayBuckets.get(key);
    if (bucket) {
      bucket.totalScore += a.score;
      bucket.totalMarks += a.totalMarks;
      bucket.count += 1;
    }
  }

  return dateLabels.map((key) => {
    const bucket = dayBuckets.get(key)!;
    const d = new Date(key);
    return {
      date: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      avgScorePct: bucket.totalMarks > 0 ? Math.round((bucket.totalScore / bucket.totalMarks) * 100) : 0,
      attemptCount: bucket.count,
    };
  });
}

/** কোন সাবজেক্টে কত সময় পড়াশোনা হয়েছে (pie chart এর জন্য, StudySession থেকে) */
export async function getTimeDistribution(userId: string): Promise<TimeDistributionItem[]> {
  const sessions = await prisma.studySession.findMany({
    where: { userId },
    select: { subjectCode: true, durationSec: true },
  });

  const bySubject = new Map<string, number>();
  for (const s of sessions) {
    const code = s.subjectCode ?? "OTHER";
    bySubject.set(code, (bySubject.get(code) ?? 0) + s.durationSec);
  }

  return Array.from(bySubject.entries())
    .map(([code, seconds]) => ({
      subjectCode: code,
      label: SUBJECT_CODE_LABELS[code] ?? "অন্যান্য",
      totalMinutes: Math.round(seconds / 60),
    }))
    .filter((item) => item.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}

/** সবচেয়ে দুর্বল টপিকগুলো (কম accuracy) — Question -> Topic join করে বের করা হয় */
export async function getWeakTopics(userId: string, limit = 5): Promise<WeakTopic[]> {
  const answers = await prisma.quizAttemptAnswer.findMany({
    where: { quizAttempt: { userId } },
    select: {
      isCorrect: true,
      question: {
        select: {
          topic: { select: { id: true, name: true, chapter: { select: { subject: { select: { name: true } } } } } },
        },
      },
    },
  });

  const byTopic = new Map<
    string,
    { topicName: string; subjectName: string; correct: number; total: number }
  >();

  for (const ans of answers) {
    const topic = ans.question.topic;
    const existing = byTopic.get(topic.id) ?? {
      topicName: topic.name,
      subjectName: topic.chapter.subject.name,
      correct: 0,
      total: 0,
    };
    existing.total += 1;
    if (ans.isCorrect) existing.correct += 1;
    byTopic.set(topic.id, existing);
  }

  const results: WeakTopic[] = Array.from(byTopic.entries())
    .filter(([, v]) => v.total >= 2) // অন্তত ২টা প্রশ্ন উত্তর দেওয়া থাকতে হবে যাতে সিদ্ধান্ত অর্থবহ হয়
    .map(([topicId, v]) => ({
      topicId,
      topicName: v.topicName,
      subjectName: v.subjectName,
      accuracyPct: Math.round((v.correct / v.total) * 100),
      totalAnswered: v.total,
    }))
    .sort((a, b) => a.accuracyPct - b.accuracyPct);

  return results.slice(0, limit);
}

/** সামগ্রিক পরিসংখ্যান (স্ট্যাট কার্ডের জন্য) */
export async function getOverallStats(userId: string): Promise<OverallStats> {
  const [user, masteredCount, totalTopicsCount, allAttempts, allSessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.topicProgress.count({ where: { userId, status: "MASTERED" } }),
    prisma.topic.count(),
    prisma.quizAttempt.findMany({ where: { userId }, select: { score: true, totalMarks: true } }),
    prisma.studySession.findMany({ where: { userId }, select: { durationSec: true } }),
  ]);

  if (!user) {
    throw new Error("ইউজার পাওয়া যায়নি");
  }

  const totalScore = allAttempts.reduce((sum, a) => sum + a.score, 0);
  const totalMarks = allAttempts.reduce((sum, a) => sum + a.totalMarks, 0);
  const totalSeconds = allSessions.reduce((sum, s) => sum + s.durationSec, 0);
  const levelProgress = getLevelProgress(user.xp);

  return {
    totalXp: user.xp,
    level: levelProgress.level,
    levelProgressPct: levelProgress.progressPct,
    masteredTopicsCount: masteredCount,
    totalTopicsCount,
    masteryPct: totalTopicsCount > 0 ? Math.round((masteredCount / totalTopicsCount) * 100) : 0,
    quizAccuracyPct: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
    totalQuizAttempts: allAttempts.length,
    totalStudyHours: Math.round((totalSeconds / 3600) * 10) / 10,
    currentStreak: user.streakCount,
    longestStreak: user.longestStreak,
  };
}

const HEATMAP_DAYS = 182; // প্রায় ৬ মাস (GitHub contribution graph এর মতো)

// Misconception Tagging CQ-তে সম্প্রসারণ — CQ এর evaluation subjective/
// AI-graded (0-10 নম্বরের স্কেল) হওয়ায় MCQ এর মতো "সঠিক/ভুল" বাইনারি না।
// তাই একটা CQAttempt কে "দুর্বল" (weak) ধরা হয় totalScore এই থ্রেশহোল্ডের
// কম বা সমান হলে (১০ এর মধ্যে ৪, অর্থাৎ ৪০% এর কম — HSC বোর্ডের পাস মার্ক
// ৪০% এর সাথে সঙ্গতিপূর্ণ, marksToGrade() এ "C" গ্রেডের নিচের সীমা,
// lib/gpa.ts দ্রষ্টব্য)। এই থ্রেশহোল্ডের নিচে/সমান স্কোর মানে ছাত্র
// concept টা ঠিকভাবে বোঝেনি এমন ধরে নেওয়া হয়।
export const CQ_WEAK_ATTEMPT_MAX_SCORE = 4; // ১০ এর মধ্যে ৪ = ৪০% (HSC পাস মার্কের সমান)

/**
 * গত ৬ মাসের প্রতিদিনের activity count (GitHub contribution graph-স্টাইল
 * heatmap এর জন্য) — QuizAttempt + CQAttempt + StudySession তিনটাই মিলিয়ে
 * গণনা করা হয় (যেকোনো ধরনের পড়াশোনার কাজ "activity" হিসেবে ধরা হয়)।
 */
export async function getActivityHeatmap(userId: string): Promise<ActivityHeatmapDay[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (HEATMAP_DAYS - 1));
  startDate.setHours(0, 0, 0, 0);

  const [quizAttempts, cqAttempts, studySessions] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.cQAttempt.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.studySession.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
  ]);

  const countByDate = new Map<string, number>();
  const bump = (d: Date) => {
    const key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  };
  quizAttempts.forEach((a) => bump(a.createdAt));
  cqAttempts.forEach((a) => bump(a.createdAt));
  studySessions.forEach((s) => bump(s.createdAt));

  // সব দিন (activity না থাকলেও 0 সহ) পূর্ণ তালিকা তৈরি করা হয়, যাতে
  // ফ্রন্টএন্ডে সহজে গ্রিড আঁকা যায় (gap ছাড়া ধারাবাহিক দিন)
  const result: ActivityHeatmapDay[] = [];
  const cursor = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({ date: key, count: countByDate.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

// ===================================================================
// Performance: Analytics Dashboard এর জন্য সম্মিলিত ফাংশন
// -------------------------------------------------------------------
// উপরের getSubjectPerformance/getProgressOverTime/getOverallStats প্রতিটাই
// আলাদাভাবে prisma.quizAttempt.findMany() কল করে (মোট ৩ বার), এবং
// getTimeDistribution/getOverallStats আলাদাভাবে prisma.studySession.findMany()
// কল করে (মোট ২ বার) — /api/analytics endpoint এ যখন সবগুলো একসাথে কল হয়
// (Analytics Dashboard পেজ লোডে, প্রতিবার ভিজিটে), তখন একই টেবিল থেকে
// প্রায় একই ডেটা বার বার আলাদা raw round-trip এ আনা হয়।
//
// এই ফাংশনটা quizAttempt ও studySession শুধু **একবার** করে fetch করে
// (অন্য প্রয়োজনীয় ডেটার সাথে Promise.all এ parallel), তারপর সবগুলো
// analytics মেমরিতে সেই একই ডেটাসেট থেকে হিসাব করে — DB round-trip
// ৮টা থেকে কমে ৬টা হয় (quizAttempt+studySession ৫→২, বাকি ৪টা অপরিবর্তিত)।
//
// আলাদা exported ফাংশনগুলো (getSubjectPerformance ইত্যাদি) ইচ্ছাকৃতভাবে
// অপরিবর্তিত রাখা হয়েছে কারণ report-card.ts ও study-plan-generator.ts
// এককভাবে এগুলো পুনর্ব্যবহার করে (ভিন্ন combination এ) — শুধু Analytics
// Dashboard endpoint টাকেই এই নতুন সম্মিলিত ফাংশন ব্যবহার করতে বলা হয়েছে।
// ===================================================================
export interface AnalyticsDashboardData {
  subjectPerformance: SubjectPerformance[];
  progressOverTime: ProgressPoint[];
  timeDistribution: TimeDistributionItem[];
  weakTopics: WeakTopic[];
  overallStats: OverallStats;
  activityHeatmap: ActivityHeatmapDay[];
  misconceptionPatterns: MisconceptionPattern[];
  confidenceStats: ConfidenceStats;
}

export async function getAnalyticsDashboardData(userId: string): Promise<AnalyticsDashboardData> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const heatmapStart = new Date();
  heatmapStart.setDate(heatmapStart.getDate() - (HEATMAP_DAYS - 1));
  heatmapStart.setHours(0, 0, 0, 0);

  const [
    user,
    masteredCount,
    totalTopicsCount,
    allAttempts,
    allSessions,
    weakTopicAnswers,
    subjectsAll,
    heatmapCqAttempts,
    taggedCqAttempts,
  ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.topicProgress.count({ where: { userId, status: "MASTERED" } }),
      prisma.topic.count(),
      // subjectId/createdAt/score/totalMarks — subject performance, progress
      // over time, overall stats, ও activity heatmap চারটাতেই এই একই attempt
      // লিস্ট থেকে হিসাব হয় (createdAt heatmap এর জন্যও ব্যবহৃত হয়)
      prisma.quizAttempt.findMany({
        where: { userId },
        select: { subjectId: true, score: true, totalMarks: true, createdAt: true },
      }),
      // durationSec+subjectCode time-distribution/overall-stats এর জন্য,
      // createdAt activity heatmap এর জন্য (একই fetch পুনর্ব্যবহার)
      prisma.studySession.findMany({
        where: { userId },
        select: { subjectCode: true, durationSec: true, createdAt: true },
      }),
      prisma.quizAttemptAnswer.findMany({
        where: { quizAttempt: { userId } },
        select: {
          isCorrect: true,
          confidence: true,
          question: {
            select: {
              misconceptionTag: true,
              topic: {
                select: { id: true, name: true, chapter: { select: { subject: { select: { name: true } } } } },
              },
            },
          },
        },
      }),
      prisma.subject.findMany(),
      // CQAttempt আলাদাভাবে আনা হচ্ছে (heatmap এ যোগ করার জন্য, অন্য কোনো
      // মেট্রিকে ব্যবহার হয় না তাই আলাদা রাখা হলো, শুধু createdAt দরকার)
      prisma.cQAttempt.findMany({
        where: { userId, createdAt: { gte: heatmapStart } },
        select: { createdAt: true },
      }),
      // Misconception Tagging CQ-তে সম্প্রসারণ — weakTopicAnswers এর মতোই
      // all-time (heatmap এর ১৮২ দিনের সীমা ছাড়া) ডেটাসেট, শুধু
      // misconceptionTag ট্যাগযুক্ত CQQuestion এর attempt গুলোর totalScore
      // লাগবে (নিচে byTag merge এ ব্যবহৃত)
      prisma.cQAttempt.findMany({
        where: { userId, cqQuestion: { misconceptionTag: { not: null } } },
        select: { totalScore: true, cqQuestion: { select: { misconceptionTag: true } } },
      }),
    ]);

  if (!user) {
    throw new Error("ইউজার পাওয়া যায়নি");
  }

  const subjectsById = new Map(subjectsAll.map((s) => [s.id, s]));

  // ---- Subject Performance ----
  const bySubject = new Map<string, { totalScore: number; totalMarks: number; count: number }>();
  for (const a of allAttempts) {
    if (!a.subjectId) continue;
    const existing = bySubject.get(a.subjectId) ?? { totalScore: 0, totalMarks: 0, count: 0 };
    existing.totalScore += a.score;
    existing.totalMarks += a.totalMarks;
    existing.count += 1;
    bySubject.set(a.subjectId, existing);
  }
  const subjectPerformance: SubjectPerformance[] = Array.from(bySubject.entries())
    .map(([subjectId, stats]) => {
      const s = subjectsById.get(subjectId);
      if (!s) return null;
      return {
        subjectId,
        subjectName: s.name,
        subjectNameEn: s.nameEn,
        colorHex: s.colorHex,
        avgScorePct: stats.totalMarks > 0 ? Math.round((stats.totalScore / stats.totalMarks) * 100) : 0,
        attemptCount: stats.count,
      };
    })
    .filter((v): v is SubjectPerformance => v !== null)
    .sort((a, b) => b.attemptCount - a.attemptCount);

  // ---- Progress Over Time (গত ১৪ দিন) ----
  const dayBuckets = new Map<string, { totalScore: number; totalMarks: number; count: number }>();
  const dateLabels: string[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dateLabels.push(key);
    dayBuckets.set(key, { totalScore: 0, totalMarks: 0, count: 0 });
  }
  for (const a of allAttempts) {
    if (a.createdAt < fourteenDaysAgo) continue;
    const key = a.createdAt.toISOString().slice(0, 10);
    const bucket = dayBuckets.get(key);
    if (bucket) {
      bucket.totalScore += a.score;
      bucket.totalMarks += a.totalMarks;
      bucket.count += 1;
    }
  }
  const progressOverTime: ProgressPoint[] = dateLabels.map((key) => {
    const bucket = dayBuckets.get(key)!;
    const d = new Date(key);
    return {
      date: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      avgScorePct: bucket.totalMarks > 0 ? Math.round((bucket.totalScore / bucket.totalMarks) * 100) : 0,
      attemptCount: bucket.count,
    };
  });

  // ---- Time Distribution ----
  const bySubjectCode = new Map<string, number>();
  for (const s of allSessions) {
    const code = s.subjectCode ?? "OTHER";
    bySubjectCode.set(code, (bySubjectCode.get(code) ?? 0) + s.durationSec);
  }
  const timeDistribution: TimeDistributionItem[] = Array.from(bySubjectCode.entries())
    .map(([code, seconds]) => ({
      subjectCode: code,
      label: SUBJECT_CODE_LABELS[code] ?? "অন্যান্য",
      totalMinutes: Math.round(seconds / 60),
    }))
    .filter((item) => item.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  // ---- Weak Topics ----
  const byTopic = new Map<string, { topicName: string; subjectName: string; correct: number; total: number }>();
  for (const ans of weakTopicAnswers) {
    const topic = ans.question.topic;
    const existing = byTopic.get(topic.id) ?? {
      topicName: topic.name,
      subjectName: topic.chapter.subject.name,
      correct: 0,
      total: 0,
    };
    existing.total += 1;
    if (ans.isCorrect) existing.correct += 1;
    byTopic.set(topic.id, existing);
  }
  const weakTopics: WeakTopic[] = Array.from(byTopic.entries())
    .filter(([, v]) => v.total >= 2)
    .map(([topicId, v]) => ({
      topicId,
      topicName: v.topicName,
      subjectName: v.subjectName,
      accuracyPct: Math.round((v.correct / v.total) * 100),
      totalAnswered: v.total,
    }))
    .sort((a, b) => a.accuracyPct - b.accuracyPct)
    .slice(0, 5);

  // ---- Misconception Patterns (MCQ + CQ merge) ----
  // Admin ট্যাগ করা misconceptionTag অনুযায়ী গ্রুপ করে দেখা হয় কোন
  // misconception এ ইউজার সবচেয়ে বেশি ভুল করছে (একই weakTopicAnswers
  // ডেটাসেট পুনর্ব্যবহার করা হয়েছে MCQ অংশের জন্য, নতুন কোনো query লাগেনি)
  const byTag = new Map<
    string,
    { wrongCount: number; totalAttempted: number; mcqWrongCount: number; cqWeakCount: number }
  >();
  for (const ans of weakTopicAnswers) {
    const tag = ans.question.misconceptionTag;
    if (!tag) continue; // ট্যাগ না থাকা প্রশ্ন এই বিশ্লেষণে অন্তর্ভুক্ত না
    const existing = byTag.get(tag) ?? { wrongCount: 0, totalAttempted: 0, mcqWrongCount: 0, cqWeakCount: 0 };
    existing.totalAttempted += 1;
    if (!ans.isCorrect) {
      existing.wrongCount += 1;
      existing.mcqWrongCount += 1;
    }
    byTag.set(tag, existing);
  }

  // Misconception Tagging CQ-তে সম্প্রসারণ — CQ এর "ভুল" ধারণা binary না
  // (0-10 স্কেলে AI-graded), তাই totalScore <= CQ_WEAK_ATTEMPT_MAX_SCORE
  // হলে সেই attempt কে "দুর্বল" (weak) ধরে একই byTag ম্যাপে merge করা হয়
  // (MCQ Question ও CQQuestion যদি admin একই ট্যাগ নাম ব্যবহার করে থাকে,
  // যেমন "সূত্র প্রয়োগে ভুল", তাহলে দুটো সোর্সের ডেটা একসাথে দেখা যায়)
  for (const ca of taggedCqAttempts) {
    const tag = ca.cqQuestion.misconceptionTag;
    if (!tag) continue;
    const existing = byTag.get(tag) ?? { wrongCount: 0, totalAttempted: 0, mcqWrongCount: 0, cqWeakCount: 0 };
    existing.totalAttempted += 1;
    if (ca.totalScore <= CQ_WEAK_ATTEMPT_MAX_SCORE) {
      existing.wrongCount += 1;
      existing.cqWeakCount += 1;
    }
    byTag.set(tag, existing);
  }

  const misconceptionPatterns: MisconceptionPattern[] = Array.from(byTag.entries())
    .filter(([, v]) => v.wrongCount >= 2) // অন্তত ২ বার ভুল/দুর্বল হলেই একটা "প্যাটার্ন" ধরা হয়, একবারকে না
    .map(([tag, v]) => ({
      tag,
      wrongCount: v.wrongCount,
      totalAttempted: v.totalAttempted,
      wrongRatePct: Math.round((v.wrongCount / v.totalAttempted) * 100),
      mcqWrongCount: v.mcqWrongCount,
      cqWeakCount: v.cqWeakCount,
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 5);

  // ---- Confidence-Based Answering Stats ----
  // ইউজার যে উত্তরগুলোতে confidence দিয়েছে (দেয়নি এমন উত্তর বাদ, কারণ
  // এটা সম্পূর্ণ ঐচ্ছিক ফিচার) সেগুলো থেকে SURE/NOT_SURE ভিত্তিক accuracy
  // হিসাব করা হয় — একই weakTopicAnswers ডেটাসেট পুনর্ব্যবহার করা হয়েছে।
  let sureCount = 0;
  let sureCorrectCount = 0;
  let notSureCount = 0;
  let notSureCorrectCount = 0;
  for (const ans of weakTopicAnswers) {
    if (ans.confidence === "SURE") {
      sureCount += 1;
      if (ans.isCorrect) sureCorrectCount += 1;
    } else if (ans.confidence === "NOT_SURE") {
      notSureCount += 1;
      if (ans.isCorrect) notSureCorrectCount += 1;
    }
  }
  const confidenceStats: ConfidenceStats = {
    totalAnswered: sureCount + notSureCount,
    sureCount,
    sureCorrectCount,
    sureWrongCount: sureCount - sureCorrectCount,
    notSureCount,
    notSureCorrectCount,
    sureAccuracyPct: sureCount > 0 ? Math.round((sureCorrectCount / sureCount) * 100) : 0,
    notSureAccuracyPct: notSureCount > 0 ? Math.round((notSureCorrectCount / notSureCount) * 100) : 0,
  };

  // ---- Overall Stats ----
  const totalScore = allAttempts.reduce((sum, a) => sum + a.score, 0);
  const totalMarks = allAttempts.reduce((sum, a) => sum + a.totalMarks, 0);
  const totalSeconds = allSessions.reduce((sum, s) => sum + s.durationSec, 0);
  const levelProgress = getLevelProgress(user.xp);
  const overallStats: OverallStats = {
    totalXp: user.xp,
    level: levelProgress.level,
    levelProgressPct: levelProgress.progressPct,
    masteredTopicsCount: masteredCount,
    totalTopicsCount,
    masteryPct: totalTopicsCount > 0 ? Math.round((masteredCount / totalTopicsCount) * 100) : 0,
    quizAccuracyPct: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
    totalQuizAttempts: allAttempts.length,
    totalStudyHours: Math.round((totalSeconds / 3600) * 10) / 10,
    currentStreak: user.streakCount,
    longestStreak: user.longestStreak,
  };

  // ---- Activity Heatmap (গত ৬ মাস, GitHub contribution graph-স্টাইল) ----
  const heatmapCountByDate = new Map<string, number>();
  const bumpHeatmap = (d: Date) => {
    if (d < heatmapStart) return;
    const key = d.toISOString().slice(0, 10);
    heatmapCountByDate.set(key, (heatmapCountByDate.get(key) ?? 0) + 1);
  };
  allAttempts.forEach((a) => bumpHeatmap(a.createdAt));
  allSessions.forEach((s) => bumpHeatmap(s.createdAt));
  heatmapCqAttempts.forEach((a) => bumpHeatmap(a.createdAt));

  const activityHeatmap: ActivityHeatmapDay[] = [];
  const heatmapCursor = new Date(heatmapStart);
  const heatmapToday = new Date();
  heatmapToday.setHours(0, 0, 0, 0);
  while (heatmapCursor <= heatmapToday) {
    const key = heatmapCursor.toISOString().slice(0, 10);
    activityHeatmap.push({ date: key, count: heatmapCountByDate.get(key) ?? 0 });
    heatmapCursor.setDate(heatmapCursor.getDate() + 1);
  }

  return {
    subjectPerformance,
    progressOverTime,
    timeDistribution,
    weakTopics,
    overallStats,
    activityHeatmap,
    misconceptionPatterns,
    confidenceStats,
  };
}
