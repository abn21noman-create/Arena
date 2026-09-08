// ===================================================================
// Simplified Item-Difficulty Calibration (FEATURE_RESEARCH_V3.md অংশ
// ২.৩ এ বিস্তারিত আলোচিত, Tier ২ আইটেম ৬) — পূর্ণ IRT/Rasch model ছাড়া,
// প্রতিটা প্রশ্নের প্রকৃত response-data ভিত্তিক difficulty score বের করা।
// -------------------------------------------------------------------
// বর্তমানে `Question.difficulty` (EASY/MEDIUM/HARD) admin ম্যানুয়ালি সেট
// করে — ইউজারদের প্রকৃত response data থেকে calibrate হয় না। এই মডিউল
// সেই গ্যাপ পূরণ করে: প্রতিটা প্রশ্নে এ পর্যন্ত কতজন ভুল করেছে তার শতাংশ
// (wrongPct) হিসাব করে একটা empirical difficulty bucket বের করে —
// "সবার জন্য একই ট্যাগ" এর চেয়ে অনেক বেশি বাস্তবসম্মত।
//
// এই স্কোর ব্যবহার হয়:
// ১. Adaptive Practice এ — দুর্বল টপিকের প্রশ্ন বাছাইয়ের সময় ইউজারের
//    বর্তমান accuracy অনুযায়ী উপযুক্ত difficulty এর প্রশ্ন অগ্রাধিকার
//    পায় (খুব দুর্বল ইউজারকে সহজ প্রশ্ন দিয়ে আত্মবিশ্বাস বাড়ানো, মাঝারি
//    দুর্বল ইউজারকে medium difficulty দিয়ে challenge করা)।
// ২. Admin Question Manager এ — admin এর ম্যানুয়াল ট্যাগ ও প্রকৃত
//    empirical difficulty এর মধ্যে ফারাক দেখানো (transparency)।
//
// কোনো নতুন DB কলাম/টেবিল লাগে না — প্রতিবার সরাসরি QuizAttemptAnswer
// থেকে on-the-fly aggregate করা হয় (ছোট ডেটাসেটে যথেষ্ট দ্রুত, ভবিষ্যতে
// প্রয়োজনে cached column যোগ করা যায়)।
// ===================================================================
import { prisma } from "@/lib/prisma";

// অন্তত এতগুলো response না থাকলে difficulty bucket নির্ভরযোগ্য না —
// পরিসংখ্যানগতভাবে অর্থবহ সিদ্ধান্তের জন্য ন্যূনতম sample size
export const MIN_RESPONSES_FOR_CALIBRATION = 5;

// wrongPct থ্রেশহোল্ড — এর ভিত্তিতে bucket ঠিক হয় (Rasch-style সরলীকৃত:
// বেশি ভুল = বেশি কঠিন)
const EASY_MAX_WRONG_PCT = 30; // ৩০% এর কম ভুল হলে সহজ
const HARD_MIN_WRONG_PCT = 60; // ৬০% এর বেশি ভুল হলে কঠিন

export type EmpiricalDifficultyBucket = "EASY" | "MEDIUM" | "HARD";

export interface EmpiricalDifficulty {
  questionId: string;
  totalResponses: number;
  wrongCount: number;
  wrongPct: number; // 0-100, কত শতাংশ উত্তরদাতা ভুল করেছে
  bucket: EmpiricalDifficultyBucket | null; // null মানে যথেষ্ট ডেটা নেই
}

/** wrongPct থেকে bucket ক্যালকুলেট করে */
export function classifyDifficultyBucket(wrongPct: number): EmpiricalDifficultyBucket {
  if (wrongPct < EASY_MAX_WRONG_PCT) return "EASY";
  if (wrongPct >= HARD_MIN_WRONG_PCT) return "HARD";
  return "MEDIUM";
}

/**
 * দেওয়া questionId গুলোর জন্য empirical difficulty হিসাব করে — একটাই
 * groupBy query তে সবগুলোর জন্য (N+1 এড়াতে)।
 */
export async function getEmpiricalDifficultyMap(
  questionIds: string[]
): Promise<Map<string, EmpiricalDifficulty>> {
  if (questionIds.length === 0) return new Map();

  const grouped = await prisma.quizAttemptAnswer.groupBy({
    by: ["questionId", "isCorrect"],
    where: { questionId: { in: questionIds } },
    _count: { _all: true },
  });

  const byQuestion = new Map<string, { correct: number; wrong: number }>();
  for (const row of grouped) {
    const existing = byQuestion.get(row.questionId) ?? { correct: 0, wrong: 0 };
    if (row.isCorrect) {
      existing.correct += row._count._all;
    } else {
      existing.wrong += row._count._all;
    }
    byQuestion.set(row.questionId, existing);
  }

  const result = new Map<string, EmpiricalDifficulty>();
  for (const [questionId, stats] of byQuestion) {
    const totalResponses = stats.correct + stats.wrong;
    const wrongPct = totalResponses > 0 ? Math.round((stats.wrong / totalResponses) * 100) : 0;
    result.set(questionId, {
      questionId,
      totalResponses,
      wrongCount: stats.wrong,
      wrongPct,
      bucket: totalResponses >= MIN_RESPONSES_FOR_CALIBRATION ? classifyDifficultyBucket(wrongPct) : null,
    });
  }

  return result;
}

/**
 * ইউজারের বর্তমান accuracy% থেকে তার জন্য উপযুক্ত empirical difficulty
 * bucket বের করে (Simplified Rasch-style ability matching):
 * - accuracy < 40% (খুব দুর্বল) -> EASY প্রশ্ন দিয়ে আত্মবিশ্বাস বাড়ানো
 * - accuracy 40-70% (মাঝারি দুর্বল) -> MEDIUM প্রশ্ন দিয়ে challenge করা
 * - accuracy >= 70% (তুলনামূলক ভালো, তবুও weak topic এ আছে) -> HARD প্রশ্ন
 */
export function getTargetDifficultyForAccuracy(accuracyPct: number): EmpiricalDifficultyBucket {
  if (accuracyPct < 40) return "EASY";
  if (accuracyPct < 70) return "MEDIUM";
  return "HARD";
}

/**
 * প্রশ্নগুলোকে target difficulty এর কাছাকাছি থাকা প্রশ্ন আগে আসার মতো
 * সাজায় (stable sort, প্রতিটা bucket এর ভেতরে মূল ক্রম বজায় থাকে)।
 * Empirical difficulty না থাকা প্রশ্ন (নতুন/কম উত্তর দেওয়া) মাঝামাঝি
 * অগ্রাধিকারে থাকে (neither প্রাধান্য না অপ্রাধান্য)।
 */
export function sortByTargetDifficulty<T extends { id: string }>(
  questions: T[],
  difficultyMap: Map<string, EmpiricalDifficulty>,
  targetBucket: EmpiricalDifficultyBucket
): T[] {
  const bucketDistance: Record<EmpiricalDifficultyBucket, number> = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
  };
  const targetPos = bucketDistance[targetBucket];

  return [...questions].sort((a, b) => {
    const diffA = difficultyMap.get(a.id)?.bucket;
    const diffB = difficultyMap.get(b.id)?.bucket;
    // ক্যালিব্রেটেড না হওয়া প্রশ্নের distance ১ (মাঝামাঝি) ধরা হয়
    const distA = diffA ? Math.abs(bucketDistance[diffA] - targetPos) : 1;
    const distB = diffB ? Math.abs(bucketDistance[diffB] - targetPos) : 1;
    return distA - distB;
  });
}
