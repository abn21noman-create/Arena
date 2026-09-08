// ===================================================================
// Exam-Day Retention Forecast — "পরীক্ষার দিনে কত % মনে থাকবে?"
// -------------------------------------------------------------------
// ২০২৬ এডটেক ট্রেন্ড গবেষণায় পাওয়া নতুন আইডিয়া (Retain.cards এর মতো
// premium flashcard app এর স্ট্যান্ডআউট ফিচার — "predicted knowledge
// level on the day of the exam") থেকে অনুপ্রাণিত। docs/FEATURE_RESEARCH_V4.md
// এ বিস্তারিত গবেষণা+সিদ্ধান্ত লেখা আছে।
//
// মূল আইডিয়া: FSRS ইতিমধ্যে প্রতিটা flashcard এ `stability` রাখে (কত
// দিনে retrievability ৯০%→ কমবে তার measure)। `ts-fsrs` লাইব্রেরির
// অফিসিয়াল `get_retrievability(card, futureDate)` মেথড ব্যবহার করে
// (কোনো কাস্টম ফর্মুলা re-implement না করে, established library reuse
// করে) যেকোনো ভবিষ্যৎ তারিখে (যেমন exam date) প্রতিটা কার্ডের predicted
// retrievability % হিসাব করা সম্ভব — pure math, কোনো AI call/migration
// লাগে না।
//
// দুই স্তরে ফোরকাস্ট দেখানো হয়:
// ১. Flashcard-level (FSRS ডেটা থেকে, নির্ভুল — শুধু review হওয়া কার্ড)
// ২. Topic-level approximation (TopicProgress এর completedPct থেকে —
//    flashcard review না থাকা টপিকের জন্য একটা সরল ইঙ্গিত, নির্ভুল
//    FSRS হিসাব না, শুধু দিকনির্দেশনা)
// ===================================================================
import { fsrs, generatorParameters, State, type Card as FsrsLibCard } from "ts-fsrs";
import { prisma } from "@/lib/prisma";
import { getCountdown } from "@/lib/exam-countdown";
import type { DbFsrsState } from "@/lib/fsrs";
import { SUBJECT_NAMES } from "@/lib/study-plan-ui-constants";

// lib/fsrs.ts এর সাথে অভিন্ন প্যারামিটার ব্যবহার করা হচ্ছে (request_retention
// ইত্যাদি স্কোরিং এর সাথে সামঞ্জস্যপূর্ণ রাখতে — একই scheduler instance না
// বানিয়ে আলাদা রাখা হয়েছে যাতে lib/fsrs.ts এর review-flow থেকে সম্পূর্ণ
// স্বাধীন/side-effect-free থাকে, শুধু read-only retrievability query)
const FORECAST_PARAMS = generatorParameters({
  request_retention: 0.9,
  maximum_interval: 36500,
});
const forecastScheduler = fsrs(FORECAST_PARAMS);

const STATE_TO_LIB: Record<DbFsrsState, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
};

// সর্বোচ্চ কতগুলো sample date এ retrievability হিসাব করা হবে (chart এ
// দেখানোর জন্য) — বেশি দিন হলেও (৩৬৫+ দিন) chart smooth রাখতে cap করা
const MAX_SAMPLE_POINTS = 24;
const MIN_SAMPLE_POINTS = 2;

export interface RetentionSamplePoint {
  date: string; // ISO date string
  daysFromNow: number;
  avgRetentionPct: number | null; // null হলে সেই দিনে কোনো reviewed card নেই
}

export interface SubjectRetentionSummary {
  subjectCode: string;
  subjectName: string;
  cardCount: number; // FSRS state আছে এমন (অন্তত একবার reviewed) কার্ড সংখ্যা
  currentRetentionPct: number; // আজকের গড় retrievability
  examDayRetentionPct: number; // পরীক্ষার দিনে গড় retrievability (review না করলে)
}

export interface RetentionForecastResult {
  hasData: boolean; // অন্তত ১টা reviewed flashcard আছে কিনা
  examDate: string | null;
  daysUntilExam: number;
  isPastExam: boolean;
  overallCurrentRetentionPct: number | null;
  overallExamDayRetentionPct: number | null;
  timeline: RetentionSamplePoint[];
  subjects: SubjectRetentionSummary[];
  totalReviewedCards: number;
  totalCards: number;
}

// আজ থেকে target তারিখ পর্যন্ত সমান দূরত্বে sample date বানায় (chart এর
// জন্য) — Python এ design-verify করা লজিক (দেখুন docs/FEATURE_RESEARCH_V4.md)
function buildSampleDates(start: Date, end: Date, maxPoints = MAX_SAMPLE_POINTS): Date[] {
  const totalMs = end.getTime() - start.getTime();
  if (totalMs <= 0) return [start];

  const totalDays = totalMs / (1000 * 60 * 60 * 24);
  const points = Math.min(maxPoints, Math.max(MIN_SAMPLE_POINTS, Math.round(totalDays) + 1));

  const dates: Date[] = [];
  for (let i = 0; i < points; i++) {
    const t = new Date(start.getTime() + (totalMs * i) / (points - 1));
    dates.push(t);
  }
  return dates;
}

interface ReviewedCardRow {
  subjectCode: string | null;
  stability: number;
  difficulty: number;
  fsrsState: DbFsrsState;
  lastReviewed: Date;
}

/**
 * একটা reviewed card এর নির্দিষ্ট তারিখে predicted retrievability (0-1)
 * হিসাব করে — ts-fsrs এর অফিসিয়াল get_retrievability() ব্যবহার করে।
 */
function retrievabilityAt(card: ReviewedCardRow, atDate: Date): number {
  const fsrsCard: FsrsLibCard = {
    due: card.lastReviewed,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    state: STATE_TO_LIB[card.fsrsState],
    last_review: card.lastReviewed,
  };
  return forecastScheduler.get_retrievability(fsrsCard, atDate, false);
}

/**
 * ইউজারের সব FSRS flashcard (অন্তত একবার reviewed, stability সেট আছে)
 * থেকে exam date পর্যন্ত retention forecast হিসাব করে।
 */
export async function getRetentionForecast(userId: string): Promise<RetentionForecastResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("ইউজার পাওয়া যায়নি");

  const countdown = getCountdown(user.examDate, user.hscBatch);

  const allCards = await prisma.flashcard.findMany({
    where: { deck: { userId }, srsAlgorithm: "FSRS" },
    select: {
      fsrsStability: true,
      fsrsDifficulty: true,
      fsrsState: true,
      lastReviewed: true,
      deck: { select: { subjectCode: true } },
    },
  });

  const totalCards = allCards.length;

  // শুধু অন্তত একবার review হওয়া কার্ড (stability/lastReviewed সেট আছে)
  const reviewedCards: ReviewedCardRow[] = allCards
    .filter(
      (c): c is typeof c & { fsrsStability: number; fsrsDifficulty: number; lastReviewed: Date } =>
        c.fsrsStability !== null && c.fsrsDifficulty !== null && c.lastReviewed !== null
    )
    .map((c) => ({
      subjectCode: c.deck.subjectCode,
      stability: c.fsrsStability,
      difficulty: c.fsrsDifficulty,
      fsrsState: c.fsrsState,
      lastReviewed: c.lastReviewed,
    }));

  const totalReviewedCards = reviewedCards.length;

  if (totalReviewedCards === 0) {
    return {
      hasData: false,
      examDate: countdown.examDate.toISOString(),
      daysUntilExam: countdown.isPast ? 0 : countdown.daysLeft,
      isPastExam: countdown.isPast,
      overallCurrentRetentionPct: null,
      overallExamDayRetentionPct: null,
      timeline: [],
      subjects: [],
      totalReviewedCards: 0,
      totalCards,
    };
  }

  const now = new Date();
  const examDate = countdown.examDate;
  const sampleDates = buildSampleDates(now, countdown.isPast ? now : examDate);

  const timeline: RetentionSamplePoint[] = sampleDates.map((date) => {
    const retrievabilities = reviewedCards.map((c) => retrievabilityAt(c, date));
    const avg =
      retrievabilities.length > 0
        ? retrievabilities.reduce((sum, r) => sum + r, 0) / retrievabilities.length
        : null;
    return {
      date: date.toISOString(),
      daysFromNow: Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      avgRetentionPct: avg !== null ? Math.round(avg * 1000) / 10 : null,
    };
  });

  const overallCurrentRetentionPct =
    Math.round(
      (reviewedCards.reduce((sum, c) => sum + retrievabilityAt(c, now), 0) / totalReviewedCards) * 1000
    ) / 10;

  const overallExamDayRetentionPct = countdown.isPast
    ? overallCurrentRetentionPct
    : Math.round(
        (reviewedCards.reduce((sum, c) => sum + retrievabilityAt(c, examDate), 0) / totalReviewedCards) *
          1000
      ) / 10;

  // সাবজেক্ট-ভিত্তিক ব্রেকডাউন (FlashcardDeck.subjectCode অনুযায়ী গ্রুপ)
  const bySubject = new Map<string, ReviewedCardRow[]>();
  for (const card of reviewedCards) {
    const key = card.subjectCode ?? "OTHER";
    const list = bySubject.get(key) ?? [];
    list.push(card);
    bySubject.set(key, list);
  }

  const subjects: SubjectRetentionSummary[] = Array.from(bySubject.entries())
    .map(([subjectCode, cards]) => {
      const currentPct =
        cards.reduce((sum, c) => sum + retrievabilityAt(c, now), 0) / cards.length;
      const examPct = countdown.isPast
        ? currentPct
        : cards.reduce((sum, c) => sum + retrievabilityAt(c, examDate), 0) / cards.length;
      return {
        subjectCode,
        subjectName: SUBJECT_NAMES[subjectCode] ?? "অন্যান্য",
        cardCount: cards.length,
        currentRetentionPct: Math.round(currentPct * 1000) / 10,
        examDayRetentionPct: Math.round(examPct * 1000) / 10,
      };
    })
    .sort((a, b) => a.examDayRetentionPct - b.examDayRetentionPct); // দুর্বল বিষয় আগে

  return {
    hasData: true,
    examDate: examDate.toISOString(),
    daysUntilExam: countdown.isPast ? 0 : countdown.daysLeft,
    isPastExam: countdown.isPast,
    overallCurrentRetentionPct,
    overallExamDayRetentionPct,
    timeline,
    subjects,
    totalReviewedCards,
    totalCards,
  };
}
