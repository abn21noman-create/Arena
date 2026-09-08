// ===================================================================
// Study Plan UI Constants — শেয়ার্ড লেবেল/স্টাইল
// -------------------------------------------------------------------
// components/planner/study-plan-card.tsx ও components/dashboard/
// today-focus-card.tsx দুটোতেই একই সাবজেক্ট নাম/প্রায়োরিটি স্টাইল
// দরকার — DRY রাখতে একই জায়গায় বের করে আনা হলো।
// ===================================================================

export const SUBJECT_NAMES: Record<string, string> = {
  BANGLA: "বাংলা",
  ENGLISH: "English",
  ICT: "ICT",
  PHYSICS: "পদার্থবিজ্ঞান",
  CHEMISTRY: "রসায়ন",
  BIOLOGY: "জীববিজ্ঞান",
  HIGHER_MATH: "উচ্চতর গণিত",
};

export const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "border-red-500 text-red-600 dark:text-red-400",
  MEDIUM: "border-amber-600 text-amber-600 dark:text-amber-400",
  LOW: "border-slate-500 text-slate-500",
};

export const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "জরুরি",
  MEDIUM: "মাঝারি",
  LOW: "কম",
};

// ইউজার যে duration বেছে নিতে পারবে (lib/study-plan-generator.ts এর
// DURATION_PRESETS এর সাথে সামঞ্জস্যপূর্ণ, কিন্তু client component এ
// server-only ফাইল import না করতে আলাদা করে রাখা হলো)
export const DURATION_OPTIONS = [
  { days: 1, label: "১ দিন", desc: "শুধু আজকের প্ল্যান" },
  { days: 7, label: "৭ দিন", desc: "সাপ্তাহিক" },
  { days: 30, label: "৩০ দিন", desc: "মাসিক" },
  { days: 365, label: "৩৬৫ দিন", desc: "পূর্ণ বছরের রুটিন" },
] as const;
