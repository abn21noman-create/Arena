// ===================================================================
// Admission Prep — Core Configuration & Scoring Logic
// -------------------------------------------------------------------
// Deep Research এ ভেরিফাইড বাস্তব তথ্য (২০২৫-২৬ সেশনের সরকারি সার্কুলার
// ভিত্তিক) অনুযায়ী প্রতিটা পরীক্ষার marking scheme/subject distribution:
//
// ১. MEDICAL (MBBS/BDS ভর্তি পরীক্ষা, DGME/BMDC পরিচালিত):
//    ১০০টা MCQ, প্রতিটা ১ নম্বর = মোট ১০০ নম্বর, ৭৫ মিনিট সময়।
//    সাবজেক্ট বণ্টন: Biology 30, Chemistry 25, Physics 20, English 15,
//    General Knowledge 10। ভুল উত্তরে -0.25, পাস মার্ক ৪০।
//
// ২. DU_A_UNIT (ঢাকা বিশ্ববিদ্যালয় বিজ্ঞান/'ক' ইউনিট):
//    আসল পরীক্ষায় MCQ(৬০)+Written(৪০) মিশ্র থাকে, কিন্তু HSC Ultimate এ
//    শুধু MCQ অংশ practice করানো হয় (written অংশ সৃজনশীল/CQ Practice এ
//    ইতিমধ্যে কভার হচ্ছে)। MCQ অংশ: Physics+Chemistry বাধ্যতামূলক,
//    Math+Biology থেকে বেছে নেওয়া (simplification: সবগুলো subject থেকেই
//    প্রশ্ন দেওয়া হয়, ৪টা সমান ভাগে ১৫ নম্বর করে = ৬০)। ভুল উত্তরে -0.25।
//
// ৩. BUET: ⚠️ ২০২৫-২৬ সেশন থেকে BUET এর মূল ভর্তি পরীক্ষা সম্পূর্ণ
//    লিখিত/সাংখ্যিক (MCQ প্রিলিমিনারি বাতিল হয়ে গেছে) — তাই এটা আসল BUET
//    exam format না, বরং "BUET-level concept practice" MCQ মোড হিসেবে
//    রাখা হয়েছে (Higher Math/Physics/Chemistry এর কঠিন conceptual MCQ
//    দিয়ে অনুশীলন) — UI তে স্পষ্ট ডিসক্লেইমার দেখানো বাধ্যতামূলক যাতে
//    ছাত্র বিভ্রান্ত না হয় যে BUET আসলে MCQ পরীক্ষা।
// ===================================================================
import type { AdmissionExamType, AdmissionSubject } from "@prisma/client";

export interface AdmissionSubjectConfig {
  subject: AdmissionSubject;
  label: string; // বাংলা লেবেল
  questionCount: number; // মক টেস্টে এই সাবজেক্ট থেকে কতগুলো প্রশ্ন থাকবে
}

export interface AdmissionExamConfig {
  examType: AdmissionExamType;
  label: string;
  shortLabel: string;
  subjects: AdmissionSubjectConfig[];
  negativeMarkPerWrong: number; // 0 হলে নেগেটিভ মার্কিং নেই
  timeMinutes: number;
  passMark: number | null; // null হলে নির্দিষ্ট পাস মার্ক নেই (শুধু merit-based)
  disclaimer: string | null; // UI তে দেখানোর জন্য (বিশেষত BUET এর জন্য জরুরি)
}

export const ADMISSION_EXAM_CONFIGS: Record<AdmissionExamType, AdmissionExamConfig> = {
  MEDICAL: {
    examType: "MEDICAL",
    label: "মেডিকেল ভর্তি পরীক্ষা (MBBS/BDS)",
    shortLabel: "মেডিকেল",
    subjects: [
      { subject: "BIOLOGY", label: "জীববিজ্ঞান", questionCount: 30 },
      { subject: "CHEMISTRY", label: "রসায়ন", questionCount: 25 },
      { subject: "PHYSICS", label: "পদার্থবিজ্ঞান", questionCount: 15 },
      { subject: "ENGLISH", label: "ইংরেজি", questionCount: 15 },
      // ২০২৫-২৬ সেশনে "মানবিক গুণাবলী ও প্রবণতা" যুক্ত হয়ে এই অংশ
      // ১০ থেকে ১৫ নম্বরে উন্নীত হয়েছে (সেই কারণেই পরীক্ষার সময়ও
      // ৬০ → ৭৫ মিনিট করা হয়েছে)
      { subject: "GENERAL_KNOWLEDGE", label: "সাধারণ জ্ঞান ও মানবিক গুণাবলী", questionCount: 15 },
    ],
    negativeMarkPerWrong: 0.25,
    timeMinutes: 75,
    passMark: 40,
    disclaimer: null,
  },
  DU_A_UNIT: {
    examType: "DU_A_UNIT",
    label: "ঢাকা বিশ্ববিদ্যালয় বিজ্ঞান ('ক') ইউনিট — MCQ অংশ",
    shortLabel: "DU 'ক' ইউনিট",
    subjects: [
      { subject: "PHYSICS", label: "পদার্থবিজ্ঞান", questionCount: 15 },
      { subject: "CHEMISTRY", label: "রসায়ন", questionCount: 15 },
      { subject: "MATH", label: "উচ্চতর গণিত", questionCount: 15 },
      { subject: "BIOLOGY", label: "জীববিজ্ঞান", questionCount: 15 },
    ],
    negativeMarkPerWrong: 0.25,
    timeMinutes: 45,
    // DU 'ক' ইউনিটে MCQ অংশের নিজস্ব পাস মার্ক ২৪ (৬০ এর মধ্যে) —
    // এই ২৪ না পেলে লিখিত উত্তরপত্র মূল্যায়নই করা হয় না। আমরা শুধু
    // MCQ অংশ সিমুলেট করি, তাই MCQ পাস মার্কই প্রযোজ্য।
    passMark: 24,
    disclaimer:
      "আসল DU 'ক' ইউনিট পরীক্ষায় MCQ (৬০ নম্বর) এর সাথে Written অংশ (৪০ নম্বর) ও থাকে। এখানে শুধু MCQ অংশের অনুশীলন করানো হচ্ছে — Written/সৃজনশীল অংশের জন্য CQ Practice ব্যবহার করো।",
  },
  BUET: {
    examType: "BUET",
    label: "বুয়েট-স্তরের কনসেপ্ট প্র্যাকটিস",
    shortLabel: "বুয়েট প্র্যাকটিস",
    subjects: [
      { subject: "MATH", label: "উচ্চতর গণিত", questionCount: 20 },
      { subject: "PHYSICS", label: "পদার্থবিজ্ঞান", questionCount: 20 },
      { subject: "CHEMISTRY", label: "রসায়ন", questionCount: 20 },
    ],
    negativeMarkPerWrong: 0,
    timeMinutes: 60,
    passMark: null,
    disclaimer:
      "⚠️ গুরুত্বপূর্ণ তথ্য: ২০২৫-২৬ শিক্ষাবর্ষ থেকে বুয়েটের মূল ভর্তি পরীক্ষা সম্পূর্ণ লিখিত ও সাংখ্যিক (MCQ প্রিলিমিনারি বাতিল হয়ে গেছে)। এই মোডটা আসল বুয়েট পরীক্ষার ফরম্যাট না — এটা শুধু উচ্চতর গণিত/পদার্থবিজ্ঞান/রসায়নের কঠিন কনসেপ্ট ঝালাই করার MCQ অনুশীলন।",
  },
};

export const ADMISSION_EXAM_ORDER: AdmissionExamType[] = ["MEDICAL", "BUET", "DU_A_UNIT"];

/** সব সাবজেক্টের মোট প্রশ্ন সংখ্যা (= maxScore, প্রতি প্রশ্ন ১ নম্বর) */
export function getTotalQuestionCount(config: AdmissionExamConfig): number {
  return config.subjects.reduce((sum, s) => sum + s.questionCount, 0);
}

// shuffleOptions() এখন lib/mock-exam.ts এ কেন্দ্রীভূত করা হয়েছে (single
// source of truth, সব MCQ-সার্ভিং route এ পুনর্ব্যবহার করার জন্য) —
// backward-compat re-export রাখা হলো যাতে আগে থেকে import করা কোড না ভাঙে
export { shuffleOptions } from "@/lib/mock-exam";

export interface AdmissionScoringResult {
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  rawScore: number; // নেগেটিভ মার্কিং প্রয়োগের পরের চূড়ান্ত স্কোর (ঋণাত্মকও হতে পারে)
  maxScore: number;
  percentage: number; // 0-100, ঋণাত্মক স্কোর হলে 0 এ ক্ল্যাম্প করা
  isPass: boolean | null; // passMark না থাকলে null
}

/**
 * ভর্তি পরীক্ষার নেগেটিভ মার্কিং সহ স্কোর হিসাব করে।
 * @param totalQuestions - মোট প্রশ্ন সংখ্যা
 * @param correctCount - সঠিক উত্তরের সংখ্যা
 * @param wrongCount - ভুল উত্তরের সংখ্যা (skip করা প্রশ্নে কোনো penalty নেই)
 * @param config - পরীক্ষার marking scheme কনফিগ
 */
export function calculateAdmissionScore(
  totalQuestions: number,
  correctCount: number,
  wrongCount: number,
  config: AdmissionExamConfig
): AdmissionScoringResult {
  const skippedCount = totalQuestions - correctCount - wrongCount;
  const rawScore = correctCount * 1 - wrongCount * config.negativeMarkPerWrong;
  const maxScore = totalQuestions;
  // শতাংশ হিসাবের সময় ঋণাত্মক স্কোর 0 এ ক্ল্যাম্প করা হয় (UI তে "0%" দেখানোর জন্য,
  // কিন্তু rawScore নিজে ঋণাত্মকই থাকে যাতে বাস্তব পরীক্ষার মতো সতর্কতা বোঝা যায়)
  const percentage = maxScore > 0 ? Math.max(0, Math.round((rawScore / maxScore) * 100)) : 0;
  const isPass = config.passMark !== null ? rawScore >= config.passMark : null;

  return {
    correctCount,
    wrongCount,
    skippedCount,
    rawScore: Number(rawScore.toFixed(2)),
    maxScore,
    percentage,
    isPass,
  };
}
