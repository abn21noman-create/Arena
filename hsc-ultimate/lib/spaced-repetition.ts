// ===================================================================
// SM-2 Spaced Repetition Algorithm (Anki-স্টাইল)
// -------------------------------------------------------------------
// এই অ্যালগরিদম ব্যবহার করা হবে Flashcard মডিউলে (Phase 4)। এটা SuperMemo-2
// অ্যালগরিদমের উপর ভিত্তি করে বানানো, যেটা Anki সহ বেশিরভাগ জনপ্রিয়
// flashcard app ব্যবহার করে।
//
// মূল ধারণা: একজন ইউজার একটা কার্ড কতটা ভালো মনে রাখতে পারলো তার উপর
// ভিত্তি করে পরবর্তী রিভিউ কবে হবে সেটা ঠিক করা হয় — সহজ কার্ড অনেক পরে,
// কঠিন কার্ড তাড়াতাড়ি আবার দেখানো হয়।
// ===================================================================

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface FlashcardSRSState {
  easeFactor: number; // সাধারণত ১.৩ - ২.৫+ এর মধ্যে থাকে
  intervalDays: number; // পরের রিভিউ কত দিন পর হবে
  repetitions: number; // কতবার সঠিকভাবে রিভিউ করা হয়েছে (টানা)
}

export interface FlashcardSRSResult extends FlashcardSRSState {
  dueDate: Date;
}

// রেটিং কে SM-2 এর 0-5 স্কেলে ম্যাপ করা হচ্ছে (Anki স্টাইলে ৪টা বাটন)
/**
 * সর্বোচ্চ interval (দিন) — Anki এর ডিফল্ট max interval নীতির অনুরূপ।
 * এটা না থাকলে চক্রবৃদ্ধি interval JS Date সীমা ছাড়িয়ে Invalid Date
 * তৈরি করে (নিচে `calculateNextReview` এর কমেন্ট দেখুন)।
 */
export const MAX_INTERVAL_DAYS = 18250; // ~৫০ বছর

const RATING_TO_QUALITY: Record<ReviewRating, number> = {
  again: 1, // সম্পূর্ণ ভুলে গেছে
  hard: 3, // মনে করতে কষ্ট হয়েছে
  good: 4, // ঠিকভাবে মনে করেছে
  easy: 5, // খুব সহজে মনে করেছে
};

/**
 * SM-2 অ্যালগরিদম অনুযায়ী পরবর্তী রিভিউ শিডিউল হিসাব করে।
 *
 * @param current - কার্ডের বর্তমান SRS state
 * @param rating - ইউজার এই রিভিউতে কেমন রেটিং দিলো (again/hard/good/easy)
 * @returns নতুন SRS state এবং পরবর্তী due date
 */
export function calculateNextReview(
  current: FlashcardSRSState,
  rating: ReviewRating
): FlashcardSRSResult {
  const quality = RATING_TO_QUALITY[rating];
  let { easeFactor, intervalDays, repetitions } = current;

  if (quality < 3) {
    // "Again" রেটিং দিলে — ভুলে গেছে ধরে নিয়ে repetition রিসেট করে আবার প্রথম থেকে শুরু
    repetitions = 0;
    intervalDays = 1; // পরের দিনই আবার দেখাবে
  } else {
    // সঠিকভাবে মনে করতে পেরেছে
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  // 🐛 বাগ ফিক্স (logic harness দিয়ে ধরা পড়েছে): SM-2 এর interval
  // চক্রবৃদ্ধি হারে বাড়ে (প্রতিবার × easeFactor)। টানা "easy"/"good"
  // রেটিং দিতে থাকলে ১৬তম রিভিউয়ে intervalDays ≈ ১২ কোটি হয়ে যায়,
  // আর `dueDate.setDate(now + 120864680)` JavaScript এর Date সীমা
  // (±১০ কোটি দিন, ECMA-262) ছাড়িয়ে **Invalid Date** তৈরি করে। সেটা
  // Prisma এর non-null DateTime কলামে লিখতে গেলে রিভিউ request ব্যর্থ
  // হতো — ইউজার কার্ড রিভিউ করতেই পারত না (progress আটকে যেত)।
  //
  // Anki একই কারণে ডিফল্ট maximum interval ৩৬৫০০ দিন (~১০০ বছর) রাখে।
  // এখানে ৫০ বছর ক্যাপ করা হলো — HSC প্রস্তুতির প্রেক্ষাপটে এর চেয়ে
  // দূরের শিডিউলের কোনো ব্যবহারিক অর্থ নেই, আর Date সীমা থেকে বহু
  // নিরাপদ দূরত্বে থাকে।
  intervalDays = Math.min(intervalDays, MAX_INTERVAL_DAYS);

  // Ease Factor আপডেট (SM-2 এর অফিসিয়াল ফর্মুলা)
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3; // ন্যূনতম সীমা

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    repetitions,
    dueDate,
  };
}

/** নতুন ফ্ল্যাশকার্ডের জন্য ডিফল্ট SRS state */
export function defaultSRSState(): FlashcardSRSState {
  return {
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
  };
}
