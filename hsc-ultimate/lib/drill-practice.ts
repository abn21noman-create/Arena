// ===================================================================
// Timed Drill Mode — Duolingo-স্টাইল Speed Practice
// -------------------------------------------------------------------
// Deep Research এ (`docs/FEATURE_RESEARCH.md`) চিহ্নিত গ্যাপ: "Timed drill
// mode (speed practice)"। একটা সাবজেক্টের সব চ্যাপ্টার/টপিক থেকে এলোমেলো
// প্রশ্ন নিয়ে একটা টাইমার (৩০/৬০/৯০ সেকেন্ড) এর মধ্যে যত বেশি সম্ভব সঠিক
// উত্তর দেওয়ার চেষ্টা — normal chapter-wise Practice এর থেকে ভিন্ন,
// এখানে দ্রুতগতি ও পুরো সাবজেক্ট জুড়ে randomized প্রশ্ন মূল আকর্ষণ।
//
// বিদ্যমান QuizAttempt মডেল পুনর্ব্যবহার করা হয়েছে (quizType="drill",
// chapterId=null — যেহেতু একাধিক চ্যাপ্টার থেকে প্রশ্ন আসে, subjectId
// সেট থাকে) — Smart/Adaptive Practice এর মতোই প্যাটার্ন, কোনো নতুন
// DB মডেল/migration লাগেনি।
// ===================================================================
import { prisma } from "@/lib/prisma";
import { pickRandom, shuffleOptions } from "@/lib/mock-exam";

export const DRILL_DURATIONS = [30, 60, 90] as const;
export type DrillDuration = (typeof DRILL_DURATIONS)[number];
export const DEFAULT_DRILL_DURATION: DrillDuration = 60;

// একবারে সর্বোচ্চ এতগুলো প্রশ্ন pool হিসেবে পাঠানো হয় (৯০ সেকেন্ডেও যথেষ্ট
// থাকে যাতে দ্রুতগতির ইউজার প্রশ্ন ফুরিয়ে না ফেলে)
export const DRILL_POOL_SIZE = 50;

// XP economy: সাধারণ Practice এর মতোই প্রতি সঠিক উত্তরে +5, এবং ভালো
// accuracy (≥70%) তে একটা "স্পিড বোনাস" +10 (Quiz Battle এর winner bonus
// প্যাটার্নের মতোই একটা সম্পূর্ণতা/পারফরম্যান্স বোনাস)
export const XP_PER_CORRECT_ANSWER = 5;
export const SPEED_BONUS_XP = 10;
export const SPEED_BONUS_ACCURACY_THRESHOLD = 70;

export function isValidDrillDuration(value: unknown): value is DrillDuration {
  return typeof value === "number" && (DRILL_DURATIONS as readonly number[]).includes(value);
}

export interface DrillQuestion {
  id: string;
  text: string;
  options: unknown;
  difficulty: string;
}

/**
 * একটা সাবজেক্টের সব চ্যাপ্টার/টপিক থেকে এলোমেলোভাবে DRILL_POOL_SIZE টা
 * প্রশ্ন বেছে নেয় (topic → chapter → subject সম্পর্ক দিয়ে ফিল্টার)।
 */
export async function getDrillQuestionPool(subjectId: string): Promise<DrillQuestion[]> {
  const allQuestions = await prisma.question.findMany({
    where: { topic: { chapter: { subjectId } } },
    select: { id: true, text: true, options: true, difficulty: true },
  });

  const picked = pickRandom(allQuestions, DRILL_POOL_SIZE);
  // options প্রতিবার শাফল করা হয় (answer-position মুখস্থ হওয়া ঠেকাতে)
  return picked.map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? shuffleOptions(q.options as unknown[]) : q.options,
  }));
}
