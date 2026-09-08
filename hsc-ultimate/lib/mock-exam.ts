// ===================================================================
// Mock Exam Core Logic — প্রশ্ন বাছাই, স্কোরিং হিসাব
// -------------------------------------------------------------------
// বাস্তব HSC ফরম্যাট (verified): MCQ ২৫টি (২৫ নম্বর) + CQ ৮টি থেকে ৫টি
// উত্তর (৫০ নম্বর) = থিওরি মোট ৭৫ নম্বর। Practical ২৫ নম্বর আলাদা
// (কলেজে হয়, GPA calculator এ ম্যানুয়ালি ইনপুট দেওয়া যায়)।
// ===================================================================

export const MOCK_EXAM_CONFIG = {
  FULL: {
    mcqCount: 25,
    cqCount: 5,
    mcqTimeMinutes: 25,
    cqTimeMinutes: 150, // আড়াই ঘণ্টা
    label: "পূর্ণ বোর্ড ফরম্যাট (MCQ ২৫ মিনিট + CQ আড়াই ঘণ্টা)",
  },
  QUICK: {
    mcqCount: 10,
    cqCount: 2,
    mcqTimeMinutes: 10,
    cqTimeMinutes: 30,
    label: "সংক্ষিপ্ত প্র্যাকটিস মোড (কম সময়ে দ্রুত অনুশীলন)",
  },
} as const;

export type MockExamModeKey = keyof typeof MOCK_EXAM_CONFIG;

/** একটা array থেকে এলোমেলোভাবে n টা আইটেম বাছাই করে (Fisher-Yates shuffle ভিত্তিক) */
export function pickRandom<T>(items: T[], n: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

/** মোট মার্কস থেকে percentage হিসাব করে */
export function calculatePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

/**
 * প্রশ্নের options শাফল করে দেয় (Fisher-Yates) — একই প্রশ্ন বারবার এলে
 * answer এর position মুখস্থ হয়ে যাওয়া ঠেকাতে (Deep Research এ চিহ্নিত
 * গ্যাপ, FEATURE_RESEARCH_V3.md অংশ ২.৪)। correctAnswer এর ভ্যালু
 * অপরিবর্তিত থাকে (এটা string content, index না), শুধু options array
 * এর ক্রম পরিবর্তন হয়। এই ফাংশনটা Practice/Adaptive Practice/Drill/
 * Mock Exam/Quiz Battle/Duel/Admission Prep — সব MCQ-সার্ভিং route এ
 * ব্যবহৃত হয় (single source of truth)।
 */
export function shuffleOptions<T>(options: T[]): T[] {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
