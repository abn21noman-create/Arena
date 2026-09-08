// ===================================================================
// HSC Exam Countdown হিসাব করার Utility
// -------------------------------------------------------------------
// ইউজার নিজের exam date সেট না করলে, hscBatch (পরীক্ষার বছর) থেকে একটা
// সাধারণ estimate করা হয়। HSC পরীক্ষা সাধারণত জুন-জুলাই মাসে শুরু হয়
// (যেমন HSC 2026 শুরু হয়েছিল ২ জুলাই ২০২৬)। এটা শুধু একটা প্রাথমিক
// অনুমান — ইউজার চাইলে Planner থেকে নিজের বোর্ডের আসল রুটিন অনুযায়ী
// তারিখ বসিয়ে দিতে পারবে।
// ===================================================================

/** hscBatch (যেমন 2028) থেকে একটা estimated exam start date রিটার্ন করে */
export function estimateExamDate(hscBatch: number): Date {
  // ধরে নেওয়া হচ্ছে পরীক্ষা শুরু হবে সেই বছরের ১ জুলাই
  return new Date(`${hscBatch}-07-01T00:00:00`);
}

export interface CountdownInfo {
  daysLeft: number;
  isPast: boolean;
  examDate: Date;
}

/** ইউজারের examDate (থাকলে) বা hscBatch থেকে countdown হিসাব করে */
export function getCountdown(
  examDate: Date | null,
  hscBatch: number
): CountdownInfo {
  const target = examDate ?? estimateExamDate(hscBatch);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    daysLeft: Math.abs(daysLeft),
    isPast: diffMs < 0,
    examDate: target,
  };
}
