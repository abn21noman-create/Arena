// ===================================================================
// FSRS (Free Spaced Repetition Scheduler) Algorithm — SM-2 এর আধুনিক
// উত্তরসূরি। Anki-এর ডিফল্ট (v23.10+ থেকে), SM-2 এর তুলনায় ~২০-৩০% কম
// review এ একই retention rate দেয় (500M+ real review benchmark)।
// -------------------------------------------------------------------
// `ts-fsrs` (open-spaced-repetition org, MIT license) লাইব্রেরি ব্যবহার
// করা হয়েছে। DSR মডেল: Difficulty (কতটা কঠিন), Stability (কতদিন মনে
// থাকবে), Retrievability (এই মুহূর্তে মনে থাকার সম্ভাব্যতা)।
//
// এই ফাইলটা `lib/spaced-repetition.ts` (পুরনো SM-2) এর পাশাপাশি থাকবে —
// দুটোই কোডে অক্ষত রাখা হয়েছে backward compatibility এর জন্য। নতুন
// ফ্ল্যাশকার্ড FSRS ব্যবহার করবে, পুরনো (migration এর আগে তৈরি) কার্ড
// SM-2 তেই থাকবে।
// ===================================================================
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card as FsrsLibCard,
  type Grade,
} from "ts-fsrs";
import type { ReviewRating } from "./spaced-repetition";

// ডিফল্ট প্যারামিটার — request_retention 0.9 মানে ৯০% সম্ভাবনা মনে থাকার
// টার্গেট রাখা হচ্ছে (industry-standard default, Anki-ও এটাই ব্যবহার করে)।
// ভবিষ্যতে ইউজার-কাস্টমাইজযোগ্য করা যেতে পারে, আপাতত hardcoded।
const FSRS_PARAMS = generatorParameters({
  request_retention: 0.9,
  maximum_interval: 36500, // সর্বোচ্চ ১০০ বছর (কার্যত unlimited)
});

const scheduler = fsrs(FSRS_PARAMS);

// আমাদের প্রজেক্টের রেটিং নাম (again/hard/good/easy) — বিদ্যমান SM-2 UI এর
// সাথে সামঞ্জস্যপূর্ণ রাখতে একই নাম ব্যবহার করা হয়েছে — কে ts-fsrs এর
// Rating enum এ ম্যাপ করা
const RATING_MAP: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

// আমাদের DB এর FsrsCardState enum স্ট্রিং ↔ ts-fsrs State enum ম্যাপিং
export type DbFsrsState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

const STATE_TO_LIB: Record<DbFsrsState, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
};

const STATE_TO_DB: Record<State, DbFsrsState> = {
  [State.New]: "NEW",
  [State.Learning]: "LEARNING",
  [State.Review]: "REVIEW",
  [State.Relearning]: "RELEARNING",
};

// DB তে সংরক্ষিত FSRS state (Prisma model থেকে সরাসরি নেওয়া যায়)
export interface FsrsDbState {
  stability: number | null;
  difficulty: number | null;
  fsrsScheduledDays: number | null;
  fsrsReps: number | null;
  fsrsLapses: number | null;
  fsrsState: DbFsrsState;
  lastReviewed: Date | null;
}

export interface FsrsReviewResult {
  dueDate: Date;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: DbFsrsState;
}

/**
 * FSRS অ্যালগরিদম দিয়ে পরবর্তী রিভিউ শিডিউল হিসাব করে।
 *
 * @param current - কার্ডের বর্তমান FSRS state (DB থেকে সরাসরি)
 * @param rating - ইউজার এই রিভিউতে কেমন রেটিং দিলো
 * @returns নতুন FSRS state এবং পরবর্তী due date
 */
export function calculateNextFsrsReview(
  current: {
    stability: number | null;
    difficulty: number | null;
    fsrsScheduledDays: number | null;
    fsrsReps: number | null;
    fsrsLapses: number | null;
    fsrsState: DbFsrsState;
    lastReviewed: Date | null;
  },
  rating: ReviewRating
): FsrsReviewResult {
  const now = new Date();

  // প্রথমবার review হলে (stability এখনো null) — নতুন empty card বানানো হয়
  const card: FsrsLibCard =
    current.stability === null || current.difficulty === null
      ? createEmptyCard(current.lastReviewed ?? now)
      : {
          due: now, // ts-fsrs.next() এ due ব্যবহার হয় না input হিসেবে, placeholder
          stability: current.stability,
          difficulty: current.difficulty,
          elapsed_days: current.lastReviewed
            ? Math.max(
                0,
                Math.round(
                  (now.getTime() - current.lastReviewed.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : 0,
          scheduled_days: current.fsrsScheduledDays ?? 0,
          learning_steps: 0,
          reps: current.fsrsReps ?? 0,
          lapses: current.fsrsLapses ?? 0,
          state: STATE_TO_LIB[current.fsrsState],
          last_review: current.lastReviewed ?? undefined,
        };

  const grade = RATING_MAP[rating];
  const result = scheduler.next(card, now, grade);
  const newCard = result.card;

  return {
    dueDate: newCard.due,
    stability: newCard.stability,
    difficulty: newCard.difficulty,
    scheduledDays: newCard.scheduled_days,
    reps: newCard.reps,
    lapses: newCard.lapses,
    state: STATE_TO_DB[newCard.state],
  };
}
