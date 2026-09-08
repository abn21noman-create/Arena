// ===================================================================
// Confidence-Based Answering — শেয়ার্ড হেল্পার (FEATURE_RESEARCH_V3.md
// Tier ২, আইটেম ৭, Brainscape থেকে অনুপ্রাণিত)
// -------------------------------------------------------------------
// MCQ উত্তর দেওয়ার সময় ইউজার ঐচ্ছিকভাবে "কতটা নিশ্চিত?" বেছে নিতে পারবে।
// এই ভ্যালু QuizAttemptAnswer.confidence কলামে (plain string, enum না)
// সংরক্ষিত হয় — DB তে আগে থেকেই এই কলাম TEXT হিসেবে ছিল।
// ===================================================================
export const CONFIDENCE_LEVELS = ["SURE", "NOT_SURE"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  SURE: "নিশ্চিত",
  NOT_SURE: "নিশ্চিত না (অনুমান)",
};

/** ইউজার থেকে আসা confidence ভ্যালু বৈধ কিনা যাচাই করে, না হলে null রিটার্ন করে */
export function normalizeConfidence(value: unknown): ConfidenceLevel | null {
  if (typeof value !== "string") return null;
  return (CONFIDENCE_LEVELS as readonly string[]).includes(value)
    ? (value as ConfidenceLevel)
    : null;
}

/**
 * একটা answer লিস্টে (questionId -> confidence ম্যাপ) থেকে নির্দিষ্ট
 * questionId এর জন্য বৈধ confidence বের করে — submit route গুলোতে
 * পুনর্ব্যবহারযোগ্য।
 */
export function extractConfidenceMap(
  answers: { questionId: string; confidence?: unknown }[]
): Map<string, ConfidenceLevel> {
  const map = new Map<string, ConfidenceLevel>();
  for (const a of answers) {
    const normalized = normalizeConfidence(a.confidence);
    if (normalized) map.set(a.questionId, normalized);
  }
  return map;
}
